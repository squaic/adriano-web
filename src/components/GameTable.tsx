"use client";
import { useEffect, useState } from "react";
import { closeBotTurn, playBotTurn, resolveBotPower } from "@/game/bot";
import { advanceTurn, announce, attemptCombination, choosePower8Self, confirmMemory, discardDrawn, draw, exchange, newGame, nextRound, power7, power8, power9, takeDiscard } from "@/game/engine";
import { winners } from "@/game/scoring";
import { GameState } from "@/game/types";
import { ActionPanel } from "./ActionPanel"; import { Card } from "./Card"; import { GameLog } from "./GameLog"; import { PlayerArea } from "./PlayerArea"; import { Scoreboard } from "./Scoreboard";

export function GameTable() {
  const [game, setGame] = useState<GameState | null>(null); const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => { if (!game || game.active === 0 || ["memorize","round-end","game-end"].includes(game.phase)) return;
    const timer = setTimeout(() => setGame(s => { if (!s) return s; if (s.phase === "choose") return playBotTurn(s); if (["power7","power8-self","power8-other","power9"].includes(s.phase)) return resolveBotPower(s); if (s.phase === "turn-end") return closeBotTurn(s); return s; }), 520); return () => clearTimeout(timer);
  }, [game]);
  if (!game) return <main className="welcome"><span className="logo-mark">▪▪<br/>▪▪</span><p className="kicker">Jeu de mémoire & stratégie</p><h1>ADRIANO</h1><p>Sept manches. Quatre joueurs. Le score le plus bas gagne.</p><button onClick={()=>setGame(newGame())}>Nouvelle partie</button></main>;
  const human = game.players[0];
  const canSelect = (playerId:number, index:number) => game.active === 0 && ((playerId===0 && ["drawn","swap-discard","power7","power8-self"].includes(game.phase)) || (playerId!==0 && ["power8-other","power9"].includes(game.phase)));
  const clickCard = (playerId:number, index:number) => {
    if (!canSelect(playerId,index)) return;
    if (game.phase === "drawn" && playerId === 0) return setSelected(x => x.includes(index) ? x.filter(i=>i!==index) : [...x,index].slice(-4));
    if (game.phase === "swap-discard") return setGame(exchange(game,index));
    if (game.phase === "power7") { alert(`Votre carte vaut ${human.cards[index].value}.`); return setGame(power7(game,index)); }
    if (game.phase === "power8-self") return setGame(choosePower8Self(game,index));
    if (game.phase === "power8-other") return setGame(power8(game,playerId,index));
    if (game.phase === "power9") { alert(`La carte de ${game.players[playerId].name} vaut ${game.players[playerId].cards[index].value}.`); return setGame(power9(game,playerId,index)); }
  };
  const roundOver = game.phase === "round-end" || game.phase === "game-end"; const champ = game.phase === "game-end" ? winners(game.players).map(id=>game.players[id].name).join(" et ") : "";
  return <main className="app-shell"><Scoreboard players={game.players} round={game.round}/><div className="table">
    {[2,1,3,0].map(id=><PlayerArea key={id} player={game.players[id]} active={game.active===id && !roundOver} phase={game.phase} reveal={roundOver} selected={id===0?selected:[]} selectable={i=>canSelect(id,i)} onCard={i=>clickCard(id,i)}/>)}
    <section className="center"><div className={`pile ${game.active===0&&game.phase==="choose"?"can-click":""}`} role="button" tabIndex={game.active===0&&game.phase==="choose"?0:-1} onClick={()=>game.active===0&&game.phase==="choose"&&setGame(draw(game))}><Card/><b>PIOCHE</b><small>{game.deck.length}</small></div><div className={`pile ${game.active===0&&game.phase==="choose"&&game.discard.length?"can-click":""}`} role="button" tabIndex={game.active===0&&game.phase==="choose"&&game.discard.length?0:-1} onClick={()=>game.active===0&&game.phase==="choose"&&game.discard.length&&setGame(takeDiscard(game))}><Card card={game.discard.at(-1)} faceUp/><b>FOSSE</b><small>{game.discard.length}</small></div>{game.drawn&&<div className="drawn"><Card card={game.drawn} faceUp/><b>PIOCHÉE</b></div>}</section>
  </div><ActionPanel state={game} selectionCount={selected.length} onMemorize={()=>setGame(confirmMemory(game))} onDraw={()=>setGame(draw(game))} onDiscard={()=>{setSelected([]);setGame(discardDrawn(game));}} onCombo={()=>{setGame(attemptCombination(game,selected));setSelected([]);}} onAnnounce={()=>setGame(announce(game))} onContinue={()=>setGame(advanceTurn(game))}/>
  {roundOver&&<div className="modal"><div><p className="kicker">Manche {game.round} terminée</p><h2>{game.phase==="game-end"?`${champ} gagne${winners(game.players).length>1?"nt":""} !`:"Scores de la manche"}</h2>{game.players.map((p,i)=><p key={p.id}><span>{p.name}</span><strong>+{game.roundScores?.[i]} · {p.total} pts</strong></p>)}{game.phase==="round-end"&&<button onClick={()=>setGame(nextRound(game))}>Manche suivante</button>}<button className="secondary" onClick={()=>setGame(newGame())}>Nouvelle partie</button></div></div>}<GameLog entries={game.log}/></main>;
}
