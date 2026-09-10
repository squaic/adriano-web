import { GameState } from "@/game/types";

type Props = {
  state: GameState;
  selectionCount: number;
  onDraw: () => void;
  onExchange: () => void;
  onDiscard: () => void;
  onCombo: (size: number) => void;
  onAnnounce: () => void;
  onContinue: () => void;
  onMemorize: () => void;
};

export function ActionPanel(props: Props) {
  const { state, selectionCount } = props;
  const humanTurn = state.active === 0;

  return (
    <section className="actions" aria-live="polite">
      {state.phase === "memorize" && <><p>Mémorisez vos deux cartes du bas.</p><button onClick={props.onMemorize}>J&apos;ai mémorisé</button></>}
      {humanTurn && state.phase === "choose" && <><p>À vous de jouer.</p><button onClick={props.onDraw}>Piocher</button>{state.discard.length > 0 && <span className="hint">ou prenez la fosse</span>}</>}
      {humanTurn && state.phase === "drawn" && <>
        <p>Conservez cette carte, jetez-la dans la fosse ou tentez une combinaison.</p>
        <button onClick={props.onExchange}>Échanger</button>
        <button onClick={props.onDiscard}>Jeter dans la fosse</button>
        {[2, 3, 4].filter(size => size <= state.players[0].cards.length).map(size => (
          <button key={size} disabled={selectionCount !== size} onClick={() => props.onCombo(size)}>{size === 2 ? "Paire" : size === 3 ? "Brelan" : "Carré"}</button>
        ))}
      </>}
      {humanTurn && state.phase === "exchange" && <p>Choisissez la carte face cachée à échanger.</p>}
      {humanTurn && state.phase === "swap-discard" && <p>Choisissez la carte remplacée par celle de la fosse.</p>}
      {humanTurn && state.phase === "power7" && <p>Choisissez une de vos cartes à regarder.</p>}
      {humanTurn && state.phase === "power8-self" && <p>Choisissez une de vos cartes.</p>}
      {humanTurn && state.phase === "power8-other" && <p>Choisissez maintenant une carte adverse.</p>}
      {humanTurn && state.phase === "power9" && <p>Choisissez une carte adverse à regarder.</p>}
      {humanTurn && state.phase === "turn-end" && <>{state.caller === null && <button className="adriano" onClick={props.onAnnounce}>ADRIANO</button>}<button onClick={props.onContinue}>Terminer le tour</button></>}
      {!humanTurn && !["round-end", "game-end"].includes(state.phase) && <p>{state.players[state.active].name} réfléchit…</p>}
    </section>
  );
}
