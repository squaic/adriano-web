import { GameState } from "@/game/types";
type Props = { state: GameState; selectionCount: number; onDraw:()=>void; onDiscard:()=>void; onCombo:(size:number)=>void; onAnnounce:()=>void; onContinue:()=>void; onMemorize:()=>void };
export function ActionPanel(p: Props) {
  const { state:s } = p; const human = s.active === 0;
  return <section className="actions" aria-live="polite">
    {s.phase === "memorize" && <><p>Mémorisez vos deux cartes du bas.</p><button onClick={p.onMemorize}>J&apos;ai mémorisé</button></>}
    {human && s.phase === "choose" && <><p>À vous de jouer.</p><button onClick={p.onDraw}>Piocher</button><span className="hint">ou cliquez la fosse</span></>}
    {human && s.phase === "drawn" && <><p>Carte piochée : échangez-la, défaussez-la ou sélectionnez vos cartes pour une combinaison.</p><button onClick={p.onDiscard}>Défausser</button>{[2,3,4].filter(n=>n<=s.players[0].cards.length).map(n=><button key={n} disabled={p.selectionCount!==n} onClick={()=>p.onCombo(n)}>{n===2?"Paire":n===3?"Brelan":"Carré"}</button>)}</>}
    {human && s.phase === "swap-discard" && <p>Choisissez la carte à remplacer.</p>}
    {human && s.phase === "power7" && <p>Choisissez une de vos cartes à regarder.</p>}
    {human && s.phase === "power8-self" && <p>Choisissez une de vos cartes.</p>}
    {human && s.phase === "power8-other" && <p>Choisissez maintenant une carte adverse.</p>}
    {human && s.phase === "power9" && <p>Choisissez une carte adverse à regarder.</p>}
    {human && s.phase === "turn-end" && <>{s.caller === null && <button className="adriano" onClick={p.onAnnounce}>ADRIANO</button>}<button onClick={p.onContinue}>Terminer le tour</button></>}
    {!human && !["round-end","game-end"].includes(s.phase) && <p>{s.players[s.active].name} réfléchit…</p>}
  </section>;
}
