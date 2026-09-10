import { advanceTurn, announce, attemptCombination, choosePower8Self, discardDrawn, draw, exchange, power7, power8, power9, takeDiscard } from "./engine";
import { cardPoints } from "./deck";
import { GameState, Memory, Player } from "./types";

export type BotChoice = { source: "deck" | "discard"; replace?: number };
export function chooseSource(player: Player, discardValue: number | null, random = Math.random): BotChoice {
  const known = player.cards.map((c, index) => ({ index, value: player.memory[c.id] })).filter(x => x.value !== undefined);
  const highest = known.sort((a, b) => b.value - a.value)[0];
  if (discardValue !== null && highest && discardValue + random() * 3 < highest.value) return { source: "discard", replace: highest.index };
  return { source: "deck" };
}
export function knownCombination(player: Player): number[] {
  const groups = new Map<number, number[]>();
  player.cards.forEach((card, i) => { const value = player.memory[card.id]; if (value !== undefined) groups.set(value, [...(groups.get(value) ?? []), i]); });
  return [...groups.values()].sort((a, b) => b.length - a.length).find(g => g.length >= 2)?.slice(0, 4) ?? [];
}
export function estimatedScore(player: Player): number {
  const values = player.cards.map(c => player.memory[c.id]);
  return values.reduce<number>((sum, value) => sum + (value ?? 8), 0);
}
/** This decision boundary receives memory, not hidden card values. */
export function chooseReplacement(memory: Memory, cardIds: string[], visibleValue: number, random = Math.random): number | null {
  const candidates = cardIds.map((id, index) => ({ index, value: memory[id] })).filter(x => x.value !== undefined).sort((a,b) => b.value - a.value);
  if (candidates[0] && visibleValue < candidates[0].value) return candidates[0].index;
  if (!candidates.length || random() < .18) return Math.floor(random() * cardIds.length);
  return null;
}
export function playBotTurn(state: GameState, random = Math.random): GameState {
  if (state.players[state.active]?.human || state.phase !== "choose") return state;
  const bot = state.players[state.active], top = state.discard.at(-1);
  const choice = chooseSource(bot, top?.value ?? null, random);
  return choice.source === "discard" ? takeDiscard(state) : draw(state);
}
export function resolveBotCard(state: GameState, random = Math.random): GameState {
  if (state.players[state.active]?.human || !state.drawn || !["drawn", "swap-discard"].includes(state.phase)) return state;
  const bot = state.players[state.active];
  if (state.phase === "swap-discard") {
    const target = chooseReplacement(bot.memory, bot.cards.map(card => card.id), cardPoints(state.drawn), random);
    return exchange(state, target ?? Math.floor(random() * bot.cards.length));
  }
  const drawn = state.drawn;
  const combo = knownCombination(bot);
  if (combo.length >= 2 && random() < .82) return attemptCombination(state, combo);
  if ([3, 7, 8, 9].includes(drawn.value)) return discardDrawn(state);
  const target = chooseReplacement(bot.memory, bot.cards.map(c => c.id), cardPoints(drawn), random);
  return target === null ? discardDrawn(state) : exchange(state, target);
}
export function resolveBotPower(state: GameState, random = Math.random): GameState {
  const bot = state.players[state.active];
  if (state.phase === "power7") {
    const unknown = bot.cards.map((c,i) => bot.memory[c.id] === undefined ? i : -1).filter(i => i >= 0);
    return power7(state, unknown[0] ?? Math.floor(random() * bot.cards.length));
  }
  if (state.phase === "power8-self") return choosePower8Self(state, Math.floor(random() * bot.cards.length));
  if (state.phase === "power8-other") {
    const targets = state.players.filter(p => p.id !== state.active); const target = targets[Math.floor(random() * targets.length)];
    return power8(state, target.id, Math.floor(random() * target.cards.length));
  }
  if (state.phase === "power9") {
    const targets = state.players.filter(p => p.id !== state.active); const target = targets[Math.floor(random() * targets.length)];
    return power9(state, target.id, Math.floor(random() * target.cards.length));
  }
  return state;
}
export function closeBotTurn(state: GameState, random = Math.random): GameState {
  if (state.phase !== "turn-end" || state.players[state.active].human) return state;
  if (state.caller === null && estimatedScore(state.players[state.active]) <= 14 && random() < .7) return announce(state);
  return advanceTurn(state);
}
