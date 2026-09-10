import { Memory } from "./types";
export const remember = (memory: Memory, cardId: string, value: number): Memory => ({ ...memory, [cardId]: value });
export const forget = (memory: Memory, cardId: string): Memory => { const next = { ...memory }; delete next[cardId]; return next; };
export const knownValue = (memory: Memory, cardId: string) => memory[cardId];
