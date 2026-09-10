import { Player } from "@/game/types";
export function Scoreboard({ players, round }: { players: Player[]; round: number }) {
  return <aside className="scoreboard"><div><span>Manche</span><strong>{round} / 7</strong></div>{players.map(p => <div key={p.id}><span>{p.name}</span><strong>{p.total}</strong></div>)}</aside>;
}
