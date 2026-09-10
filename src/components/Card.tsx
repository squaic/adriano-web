import { Card as CardType } from "@/game/types";

type Props = { card?: CardType; faceUp?: boolean; selectable?: boolean; selected?: boolean; onClick?: () => void; label?: string };
export function Card({ card, faceUp = false, selectable, selected, onClick, label }: Props) {
  const className = `card ${faceUp ? "face" : "back"} ${card ? `value-${card.value} color-${card.color}` : ""} ${selectable ? "selectable" : ""} ${selected ? "selected" : ""}`;
  const content = faceUp && card
    ? <><span className="card-shape" aria-hidden="true"/><span className={`corner top-left ${card.color}`}>{card.value}</span><span className={`corner top-right ${card.color}`}>{card.value}</span><span className={`value ${card.color}`}>{card.value}</span><span className={`corner bottom-left ${card.color}`}>{card.value}</span><span className={`corner bottom-right ${card.color}`}>{card.value}</span></>
    : <><span className="back-brand">ADRIANO</span><span className="mark"><i/><i/><i/><i/></span></>;
  if (selectable) return <button type="button" className={className} onClick={onClick} aria-label={label ?? (faceUp && card ? `Carte ${card.value} ${card.color}` : "Carte cachée")}>{content}</button>;
  return <div className={className} aria-label={label ?? (faceUp && card ? `Carte ${card.value} ${card.color}` : "Carte cachée")}>{content}</div>;
}
