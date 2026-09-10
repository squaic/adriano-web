"use client";

import { useEffect, useState } from "react";
import { closeBotTurn, playBotTurn, resolveBotCard, resolveBotPower } from "@/game/bot";
import { advanceTurn, announce, attemptCombination, beginExchange, choosePower8Self, confirmMemory, discardDrawn, draw, exchange, newGame, nextRound, power7, power8, power9, takeDiscard } from "@/game/engine";
import { drawnCardForHuman, visibleDiscard } from "@/game/presentation";
import { adrianoOutcome, handScore, winners } from "@/game/scoring";
import { GameState } from "@/game/types";
import { ActionPanel } from "./ActionPanel";
import { AdrianoLogo } from "./AdrianoLogo";
import { Card } from "./Card";
import { GameLog } from "./GameLog";
import { PlayerArea } from "./PlayerArea";
import { Scoreboard } from "./Scoreboard";

export function GameTable() {
  const [game, setGame] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!game || game.active === 0 || ["memorize", "round-end", "game-end"].includes(game.phase)) return;
    const timer = setTimeout(() => setGame(state => {
      if (!state) return state;
      if (state.phase === "choose") return playBotTurn(state);
      if (["drawn", "swap-discard"].includes(state.phase)) return resolveBotCard(state);
      if (["power7", "power8-self", "power8-other", "power9"].includes(state.phase)) return resolveBotPower(state);
      if (state.phase === "turn-end") return closeBotTurn(state);
      return state;
    }), 620);
    return () => clearTimeout(timer);
  }, [game]);

  const roundFinished = game?.phase === "round-end" || game?.phase === "game-end";
  useEffect(() => {
    if (!roundFinished) return;
    const timer = setTimeout(() => setShowResults(true), 1500);
    return () => clearTimeout(timer);
  }, [roundFinished, game?.round]);

  if (!game) return <main className="welcome"><AdrianoLogo/><p className="kicker">Jeu de mémoire & stratégie</p><p>Sept manches. Quatre joueurs. Le score le plus bas gagne.</p><button onClick={() => setGame(newGame())}>Nouvelle partie</button></main>;

  const human = game.players[0];
  const canSelect = (playerId: number) => game.active === 0 && (
    (playerId === 0 && ["drawn", "exchange", "swap-discard", "power7", "power8-self"].includes(game.phase)) ||
    (playerId !== 0 && ["power8-other", "power9"].includes(game.phase))
  );
  const clickCard = (playerId: number, index: number) => {
    if (!canSelect(playerId)) return;
    if (game.phase === "drawn" && playerId === 0) return setSelected(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index].slice(-4));
    if (game.phase === "exchange" || game.phase === "swap-discard") return setGame(exchange(game, index));
    if (game.phase === "power7") { alert(`Votre carte vaut ${human.cards[index].value}.`); return setGame(power7(game, index)); }
    if (game.phase === "power8-self") return setGame(choosePower8Self(game, index));
    if (game.phase === "power8-other") return setGame(power8(game, playerId, index));
    if (game.phase === "power9") { alert(`La carte de ${game.players[playerId].name} vaut ${game.players[playerId].cards[index].value}.`); return setGame(power9(game, playerId, index)); }
  };

  const roundOver = game.phase === "round-end" || game.phase === "game-end";
  const champion = game.phase === "game-end" ? winners(game.players).map(id => game.players[id].name).join(" et ") : "";
  const outcome = roundOver ? adrianoOutcome(game.players, game.caller) : null;
  const outcomeTitle = outcome?.kind === "success" ? "ADRIANO RÉUSSI" : outcome?.kind === "failure" ? "ADRIANO RATÉ" : outcome ? "ADRIANO — ÉGALITÉ" : null;

  return <main className="app-shell">
    <Scoreboard players={game.players} round={game.round}/>
    <div className={`table phase-${game.phase} active-${game.active} ${roundOver ? "round-reveal" : ""}`}>
      {[2, 1, 3, 0].map(id => <PlayerArea key={id} player={game.players[id]} active={game.active === id && !roundOver} phase={game.phase} reveal={roundOver} selected={id === 0 ? selected : []} selectable={() => canSelect(id)} onCard={index => clickCard(id, index)}/>)}
      <section className="center">
        <button type="button" className="pile deck-pile" disabled={game.active !== 0 || game.phase !== "choose"} onClick={() => setGame(draw(game))}><Card/><b>PIOCHE</b><small>{game.deck.length}</small></button>
        <button type="button" className="pile discard-pile" disabled={game.active !== 0 || game.phase !== "choose" || !game.discard.length} onClick={() => setGame(takeDiscard(game))}>
          {visibleDiscard(game) ? <Card key={visibleDiscard(game)!.id} card={visibleDiscard(game)!} faceUp/> : <div className="empty-pile">Fosse<br/>vide</div>}<b>FOSSE</b><small>{game.discard.length}</small>
        </button>
        {game.drawn && <div className={`drawn ${drawnCardForHuman(game) ? "human-draw" : "bot-draw bot-target-${game.active}"}`}>{drawnCardForHuman(game) ? <Card card={drawnCardForHuman(game)!} faceUp/> : <Card/>}<b>{drawnCardForHuman(game) ? "PIOCHÉE" : `${game.players[game.active].name} pioche`}</b></div>}
      </section>
    </div>
    <ActionPanel state={game} selectionCount={selected.length} onMemorize={() => setGame(confirmMemory(game))} onDraw={() => setGame(draw(game))} onExchange={() => { setSelected([]); setGame(beginExchange(game)); }} onDiscard={() => { setSelected([]); setGame(discardDrawn(game)); }} onCombo={() => { setGame(attemptCombination(game, selected)); setSelected([]); }} onAnnounce={() => setGame(announce(game))} onContinue={() => setGame(advanceTurn(game))}/>
    {roundOver && showResults && <div className="modal"><div>
      <p className="kicker">Manche {game.round} terminée</p>
      {outcomeTitle && <section className={`adriano-result ${outcome?.kind}`}><h2>{outcomeTitle}</h2><p><strong>{game.players[outcome!.caller].name}</strong> {outcome!.caller === 0 ? "aviez" : "avait"} annoncé ADRIANO avec {outcome!.callerScore} points.</p>{outcome?.kind === "failure" && <p>{game.players[outcome.lowerPlayer!].name} avait seulement {outcome.lowerScore} points.</p>}</section>}
      <h2>{game.phase === "game-end" ? `${champion} gagne${winners(game.players).length > 1 ? "nt" : ""} !` : "Scores de la manche"}</h2>
      <div className="final-hands">{game.players.map((player, index) => <section key={player.id}><header><span>{player.name} · cartes {handScore(player)} pts</span><strong>+{game.roundScores?.[index]} · total {player.total}</strong></header><div>{player.cards.map(card => <Card key={card.id} card={card} faceUp/>)}</div></section>)}</div>
      {game.phase === "round-end" && <button onClick={() => { setShowResults(false); setGame(nextRound(game)); }}>Manche suivante</button>}<button className="secondary" onClick={() => { setShowResults(false); setGame(newGame()); }}>Nouvelle partie</button>
    </div></div>}
    <GameLog entries={game.log}/>
  </main>;
}
