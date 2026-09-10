import { Card, COLORS } from "./types";

export const cardPoints = (card: Card) => card.value === 15 && card.color === "red" ? 0 : card.value;

export function createDeck(): Card[] {
  return COLORS.flatMap(color => Array.from({ length: 15 }, (_, i) => ({ id: `${color}-${i + 1}`, color, value: i + 1 })));
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
