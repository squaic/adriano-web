import { Card as CardType } from "@/game/types";

type Props = { card?: CardType; faceUp?: boolean; selectable?: boolean; selected?: boolean; onClick?: () => void; label?: string };
export function Card({ card, faceUp = false, selectable, selected, onClick, label }: Props) {
  const className = `card ${faceUp ? "face" : "back"} ${selectable ? "selectable" : ""} ${selected ? "selected" : ""}`;
  const content = faceUp && card
    ? <><span className={`value ${card.color}`}>{card.value}</span><span className="suit">{card.color === "red" ? "●" : card.color === "blue" ? "◆" : card.color === "green" ? "▲" : "■"}</span></>
    : <><span className="mark"><i/><i/><i/><i/></span><small>ADRIANO</small></>;
  if (selectable) return <button type="button" className={className} onClick={onClick} aria-label={label ?? (faceUp && card ? `Carte ${card.value} ${card.color}` : "Carte cachée")}>{content}</button>;
  return <div className={className} aria-label={label ?? (faceUp && card ? `Carte ${card.value} ${card.color}` : "Carte cachée")}>{content}</div>;
}
