import { GameState } from "./types";

/** Prevents secret bot draws from ever being rendered face up for the human. */
export const isDrawnCardVisible = (state: GameState): boolean =>
  state.active === 0 && state.drawn !== null;
