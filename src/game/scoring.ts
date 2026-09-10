import { cardPoints } from "./deck";
import { Player } from "./types";
export const handScore = (player: Player) => player.cards.reduce((sum, card) => sum + cardPoints(card), 0);
export type AdrianoOutcome = {
  kind: "success" | "failure" | "tie";
  caller: number;
  callerScore: number;
  lowerPlayer: number | null;
  lowerScore: number | null;
};
export function adrianoOutcome(players: Player[], caller: number | null): AdrianoOutcome | null {
  if (caller === null) return null;
  const hands = players.map(handScore);
  const lowerPlayer = hands.findIndex((score, index) => index !== caller && score < hands[caller]);
  if (lowerPlayer >= 0) return { kind: "failure", caller, callerScore: hands[caller], lowerPlayer, lowerScore: hands[lowerPlayer] };
  const tied = hands.some((score, index) => index !== caller && score === hands[caller]);
  return { kind: tied ? "tie" : "success", caller, callerScore: hands[caller], lowerPlayer: null, lowerScore: null };
}
export function scoreRound(players: Player[], caller: number | null): number[] {
  const hands = players.map(handScore);
  return players.map((player, i) => {
    let adriano = 0;
    if (caller !== null) {
      const call = hands[caller];
      const minimum = Math.min(...hands);
      if (call > minimum) adriano = i === caller ? 30 : 0;
      else if (call < Math.min(...hands.filter((_, x) => x !== caller))) adriano = i === caller ? -hands[i] : 30;
      else adriano = hands[i] > call ? 30 : 0;
    }
    return hands[i] + adriano + player.penalties;
  });
}
export const winners = (players: Player[]) => { const low = Math.min(...players.map(p => p.total)); return players.filter(p => p.total === low).map(p => p.id); };
