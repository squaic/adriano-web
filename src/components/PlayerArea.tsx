import { Player, Phase } from "@/game/types";
import { Card } from "./Card";

type Props = { player: Player; active: boolean; phase: Phase; reveal?: boolean; selected: number[]; onCard: (index: number) => void; selectable: (index: number) => boolean };
export function PlayerArea({ player, active, phase, reveal, selected, onCard, selectable }: Props) {
  return <section className={`player player-${player.id} ${active ? "active" : ""}`} aria-label={player.name}>
    <header><strong>{player.name}</strong><span>{player.total} pts</span></header>
    <div className="cards">{player.cards.map((card, index) => <Card key={card.id} card={card}
      faceUp={Boolean(reveal || (phase === "memorize" && player.human && index >= 2))} selectable={selectable(index)} selected={selected.includes(index)} onClick={() => onCard(index)} />)}</div>
    <small>{player.cards.length} carte{player.cards.length > 1 ? "s" : ""}{player.penalties ? ` · +${player.penalties} pénalité` : ""}</small>
  </section>;
}
