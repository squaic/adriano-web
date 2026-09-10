import { GameState } from "@/game/types";

type Props = {
  state: GameState;
  selectionCount: number;
  combinationSize: number | null;
  resolving: boolean;
  onDraw: () => void;
  onExchange: () => void;
  onDiscard: () => void;
  onChooseCombination: (size: number) => void;
  onConfirmCombination: () => void;
  onCancelCombination: () => void;
  onAnnounce: () => void;
  onContinue: () => void;
  onMemorize: () => void;
};

const combinationName = (size: number) => size === 2 ? "paire" : size === 3 ? "brelan" : "carré";

export function ActionPanel(props: Props) {
  const { state, selectionCount } = props;
  const humanTurn = state.active === 0;

  return <section className="actions" aria-live="polite">
    {state.phase === "memorize" && <><p>Mémorisez vos deux cartes du bas.</p><button onClick={props.onMemorize}>J&apos;ai mémorisé</button></>}
    {humanTurn && state.phase === "choose" && <><p>{state.inBonus ? `3 joué — il vous reste ${state.bonusTurns + 1} tour${state.bonusTurns ? "s" : ""} supplémentaire${state.bonusTurns ? "s" : ""}.` : "À vous de jouer."}</p><button onClick={props.onDraw}>Piocher</button>{state.discard.length > 0 && <span className="hint">ou prenez la fosse</span>}</>}
    {humanTurn && state.phase === "drawn" && <><p>Choisissez comment résoudre la carte piochée.</p><button onClick={props.onExchange}>Échanger</button><button onClick={props.onDiscard}>Jeter dans la fosse</button>{[2, 3, 4].filter(size => size <= state.players[0].cards.length).map(size => <button key={size} onClick={() => props.onChooseCombination(size)}>{size === 2 ? "Paire" : size === 3 ? "Brelan" : "Carré"}</button>)}</>}
    {humanTurn && state.phase === "combination-selection" && props.combinationSize && <><p>{props.resolving ? `Révélation du ${combinationName(props.combinationSize)}…` : `Sélectionnez les ${props.combinationSize} cartes que vous pensez identiques. (${selectionCount}/${props.combinationSize})`}</p><button disabled={props.resolving || selectionCount !== props.combinationSize} onClick={props.onConfirmCombination}>Confirmer {props.combinationSize === 2 ? "la paire" : props.combinationSize === 3 ? "le brelan" : "le carré"}</button><button className="secondary" disabled={props.resolving} onClick={props.onCancelCombination}>Annuler</button></>}
    {humanTurn && state.phase === "exchange" && <p>Choisissez la carte face cachée à échanger.</p>}
    {humanTurn && state.phase === "swap-discard" && <p>Choisissez la carte remplacée par celle de la fosse.</p>}
    {humanTurn && state.phase === "power7" && <p>{props.resolving ? "Mémorisez cette carte…" : "Choisissez une de vos cartes à regarder."}</p>}
    {humanTurn && state.phase === "power8-self" && <p>Choisissez une de vos cartes.</p>}
    {humanTurn && state.phase === "power8-other" && <p>Carte sélectionnée — choisissez une carte adverse.</p>}
    {humanTurn && state.phase === "power9" && <p>{props.resolving ? "Mémorisez cette carte adverse…" : "Choisissez une carte adverse à regarder."}</p>}
    {humanTurn && state.phase === "turn-end" && <>{state.caller === null && <button className="adriano" onClick={props.onAnnounce}>ADRIANO</button>}<button onClick={props.onContinue}>Terminer le tour</button></>}
    {!humanTurn && !["round-end", "game-end"].includes(state.phase) && <p>{state.players[state.active].name} réfléchit…</p>}
  </section>;
}
