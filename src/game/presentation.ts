import { Card, GameState } from "./types";

/** Prevents secret bot draws from ever being rendered face up for the human. */
export const isDrawnCardVisible = (state: GameState): boolean =>
  state.active === 0 && state.drawn !== null;

/** Returns no card object at all to the human-facing UI during a bot draw. */
export const drawnCardForHuman = (state: GameState): Card | null =>
  isDrawnCardVisible(state) ? state.drawn : null;

/** The discard pile is ordered oldest to newest; its last card is authoritative. */
export const visibleDiscard = (state: GameState): Card | null =>
  state.discard.at(-1) ?? null;
