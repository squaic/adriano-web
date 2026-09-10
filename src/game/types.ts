export const COLORS = ["red", "blue", "green", "black"] as const;
export type CardColor = (typeof COLORS)[number];
export type Card = { id: string; value: number; color: CardColor };
export type Memory = Record<string, number>;
export type Player = {
  id: number; name: string; human: boolean; cards: Card[]; memory: Memory;
  total: number; penalties: number;
};
export type Phase = "idle" | "memorize" | "choose" | "drawn" | "exchange" | "combination-selection" | "swap-discard" | "power7" | "power8-self" | "power8-other" | "power9" | "turn-end" | "round-end" | "game-end";
export type GameState = {
  players: Player[]; deck: Card[]; discard: Card[]; round: number; active: number;
  phase: Phase; drawn: Card | null; selected: number[]; powerSelf: number | null;
  bonusTurns: number; inBonus: boolean; recycled: boolean; caller: number | null;
  finalTurns: number[]; log: string[]; roundScores: number[] | null;
};
