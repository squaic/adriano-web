import { cardPoints } from "./deck";
import { Player } from "./types";
export const handScore = (player: Player) => player.cards.reduce((sum, card) => sum + cardPoints(card), 0);
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
