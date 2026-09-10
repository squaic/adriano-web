import { createDeck, shuffle } from "./deck";
import { forget, remember } from "./memory";
import { scoreRound } from "./scoring";
import { GameState, Player } from "./types";

const names = ["Vous", "Bot 1", "Bot 2", "Bot 3"];
const note = (s: GameState, text: string): GameState => ({ ...s, log: [text, ...s.log].slice(0, 60) });

export function newRound(round = 1, totals = [0, 0, 0, 0], random = Math.random): GameState {
  const deck = shuffle(createDeck(), random);
  const players: Player[] = names.map((name, id) => {
    const cards = deck.splice(0, 4);
    return { id, name, human: id === 0, cards, total: totals[id], penalties: 0,
      memory: { [cards[2].id]: cards[2].value, [cards[3].id]: cards[3].value } };
  });
  return { players, deck, discard: [], round, active: 0, phase: "memorize", drawn: null, selected: [], powerSelf: null,
    bonusTurns: 0, inBonus: false, recycled: false, caller: null, finalTurns: [], log: [`Manche ${round} : mémorisez vos deux cartes.`], roundScores: null };
}
export const newGame = (random = Math.random) => newRound(1, [0, 0, 0, 0], random);
export const confirmMemory = (s: GameState): GameState => note({ ...s, phase: "choose" }, "La partie commence. À vous de jouer.");

function ensureDeck(s: GameState): GameState {
  if (s.deck.length) return s;
  if (s.recycled || !s.discard.length) return finishRound(s);
  return note({ ...s, deck: shuffle(s.discard), discard: [], recycled: true }, "La fosse est recyclée pour reformer la pioche.");
}
export function draw(s: GameState): GameState {
  s = ensureDeck(s);
  if (s.phase === "round-end" || s.phase === "game-end") return s;
  const deck = [...s.deck], card = deck.pop()!;
  return note({ ...s, deck, drawn: card, phase: "drawn" }, `${s.players[s.active].name} pioche une carte.`);
}
export function takeDiscard(s: GameState): GameState {
  if (!s.discard.length) return s;
  const discard = [...s.discard], drawn = discard.pop()!;
  return note({ ...s, discard, drawn, phase: "swap-discard" }, `${s.players[s.active].name} prend la fosse.`);
}
export function beginExchange(s: GameState): GameState {
  return s.phase === "drawn" && s.drawn ? { ...s, selected: [], phase: "exchange" } : s;
}
export function beginCombination(s: GameState): GameState {
  return s.phase === "drawn" && s.drawn ? { ...s, selected: [], phase: "combination-selection" } : s;
}
export function cancelCombination(s: GameState): GameState {
  return s.phase === "combination-selection" && s.drawn ? { ...s, selected: [], phase: "drawn" } : s;
}
export function exchange(s: GameState, index: number): GameState {
  if (!s.drawn) return s; const players = [...s.players], player = { ...players[s.active] }, cards = [...player.cards];
  const old = cards[index]; cards[index] = s.drawn; player.cards = cards;
  player.memory = remember(forget(player.memory, old.id), s.drawn.id, s.drawn.value); players[s.active] = player;
  return endTurn(note({ ...s, players, discard: [...s.discard, old], drawn: null, phase: "choose" }, `${player.name} échange une carte.`));
}
export function discardDrawn(s: GameState): GameState {
  if (!s.drawn) return s; const value = s.drawn.value, player = s.players[s.active];
  let next = note({ ...s, discard: [...s.discard, s.drawn], drawn: null }, value >= 3 && value <= 9 ? `${player.name} joue un ${value}.` : `${player.name} jette la carte piochée dans la fosse.`);
  if (value === 3) {
    if (!s.inBonus && s.caller === null) next = { ...next, bonusTurns: 2, inBonus: true };
    const remaining = next.inBonus ? next.bonusTurns : 0;
    if (remaining > 0) next = note(next, `${player.name} rejoue encore ${remaining} fois grâce au 3.`);
    return endTurn({ ...next, phase: "choose" });
  }
  if (value === 7) return { ...next, phase: "power7" };
  if (value === 8) return { ...next, phase: "power8-self" };
  if (value === 9) return { ...next, phase: "power9" };
  return endTurn({ ...next, phase: "choose" });
}
export function power7(s: GameState, index: number): GameState {
  const players = [...s.players], p = { ...players[s.active] }, card = p.cards[index]; p.memory = remember(p.memory, card.id, card.value); players[s.active] = p;
  return endTurn(note({ ...s, players, phase: "choose" }, `${p.name} regarde une de ses cartes.`));
}
export const choosePower8Self = (s: GameState, index: number): GameState => ({ ...s, powerSelf: index, phase: "power8-other" });
export function power8(s: GameState, target: number, index: number): GameState {
  if (s.powerSelf === null || target === s.active) return s; const players = [...s.players];
  const a = { ...players[s.active], cards: [...players[s.active].cards] }, b = { ...players[target], cards: [...players[target].cards] };
  const own = a.cards[s.powerSelf], other = b.cards[index]; a.cards[s.powerSelf] = other; b.cards[index] = own;
  a.memory = forget(a.memory, own.id); b.memory = forget(b.memory, other.id); players[s.active] = a; players[target] = b;
  return endTurn(note({ ...s, players, powerSelf: null, phase: "choose" }, `${a.name} échange deux cartes à l'aveugle.`));
}
export function power9(s: GameState, target: number, index: number): GameState {
  if (target === s.active) return s; const players = [...s.players], p = { ...players[s.active] }, card = players[target].cards[index];
  p.memory = remember(p.memory, card.id, card.value); players[s.active] = p;
  return endTurn(note({ ...s, players, phase: "choose" }, `${p.name} regarde une carte adverse.`));
}
export function attemptCombination(s: GameState, indices: number[]): GameState {
  const uniqueIndices = [...new Set(indices)].sort((a, b) => a - b);
  const playerCards = s.players[s.active].cards;
  if (!s.drawn || ![2, 3, 4].includes(uniqueIndices.length) || uniqueIndices.some(index => index < 0 || index >= playerCards.length)) return s;
  const players = [...s.players], p = { ...players[s.active] }, picked = uniqueIndices.map(i => p.cards[i]);
  if (!picked.every(card => card.value === picked[0].value)) {
    p.penalties += 30; p.memory = picked.reduce((m, c) => remember(m, c.id, c.value), p.memory); players[s.active] = p;
    const failedLabel = uniqueIndices.length === 2 ? "Paire" : uniqueIndices.length === 3 ? "Brelan" : "Carré";
    return note({ ...s, players, phase: "drawn", selected: [] }, `${failedLabel} raté${uniqueIndices.length === 2 ? "e" : ""} — ${p.name} reçoit +30 points.`);
  }
  const keep = uniqueIndices[0], cards = p.cards.filter((_, i) => !uniqueIndices.includes(i)); cards.splice(keep, 0, s.drawn);
  p.cards = cards; p.memory = remember(p.memory, s.drawn.id, s.drawn.value); players[s.active] = p;
  if (uniqueIndices.length === 4) players.forEach((x, i) => { if (i !== s.active) players[i] = { ...x, penalties: x.penalties + 40 }; });
  const label = uniqueIndices.length === 2 ? "une paire" : uniqueIndices.length === 3 ? "un brelan" : "un carré";
  return endTurn(note({ ...s, players, discard: [...s.discard, ...picked], drawn: null, selected: [], phase: "choose" }, `${p.name} réalise ${label}.`));
}
export function announce(s: GameState): GameState {
  if (s.caller !== null || s.phase !== "turn-end") return s; const finalTurns = [1,2,3,0].map(x => (s.active + x) % 4).filter(x => x !== s.active);
  return note({ ...s, caller: s.active, finalTurns, active: finalTurns[0], phase: "choose", bonusTurns: 0, inBonus: false }, `${s.players[s.active].name} annonce ADRIANO !`);
}
export function endTurn(s: GameState): GameState {
  if (s.bonusTurns > 0) return { ...s, bonusTurns: s.bonusTurns - 1, phase: "choose" };
  return { ...s, inBonus: false, phase: "turn-end" };
}
export function advanceTurn(s: GameState): GameState {
  if (s.phase !== "turn-end") return s;
  if (s.caller !== null) {
    const left = s.finalTurns.filter(id => id !== s.active);
    if (!left.length) return finishRound(s);
    return { ...s, finalTurns: left, active: left[0], phase: "choose" };
  }
  return { ...s, active: (s.active + 1) % 4, phase: "choose" };
}
export function finishRound(s: GameState): GameState {
  const scores = scoreRound(s.players, s.caller), players = s.players.map((p, i) => ({ ...p, total: p.total + scores[i] }));
  return note({ ...s, players, roundScores: scores, phase: s.round === 7 ? "game-end" : "round-end", drawn: null }, `Manche ${s.round} terminée.`);
}
export const nextRound = (s: GameState, random = Math.random) => s.round < 7 ? newRound(s.round + 1, s.players.map(p => p.total), random) : s;
