import { describe, expect, it } from "vitest";
import { chooseReplacement } from "../bot";
import { cardPoints, createDeck } from "../deck";
import { advanceTurn, attemptCombination, discardDrawn, draw, exchange, finishRound, newGame, newRound, power7, power8, power9 } from "../engine";
import { handScore, scoreRound, winners } from "../scoring";
import { Card, GameState, Player } from "../types";
const card=(value:number,color:Card["color"]="blue",id=`${color}-${value}-${Math.random()}`):Card=>({value,color,id});
const player=(id:number,values:number[],penalties=0):Player=>({id,name:`P${id}`,human:id===0,cards:values.map(v=>card(v)),memory:{},total:0,penalties});
const state=(values=[1,1,4,5],drawn=card(2)):GameState=>({players:[player(0,values),player(1,[5]),player(2,[6]),player(3,[7])],deck:[card(10)],discard:[card(12)],round:1,active:0,phase:"drawn",drawn,selected:[],powerSelf:null,bonusTurns:0,inBonus:false,recycled:false,caller:null,finalTurns:[],log:[],roundScores:null});

describe("paquet et distribution",()=>{
 it("contient 60 cartes et les 15 valeurs dans quatre couleurs",()=>{const d=createDeck();expect(d).toHaveLength(60);for(let v=1;v<=15;v++)expect(d.filter(c=>c.value===v)).toHaveLength(4)});
 it("compte le 15 rouge à zéro",()=>{expect(cardPoints(card(15,"red"))).toBe(0);expect(cardPoints(card(15,"black"))).toBe(15)});
 it("distribue quatre cartes à quatre joueurs",()=>{const s=newRound(1,[0,0,0,0],()=>.5);expect(s.players.every(p=>p.cards.length===4)).toBe(true);expect(s.deck.length+s.discard.length).toBe(44)});
});
describe("actions",()=>{
 it("échange une carte et défausse l'ancienne",()=>{const s=state();const old=s.players[0].cards[2];const n=exchange(s,2);expect(n.players[0].cards[2]).toEqual(s.drawn);expect(n.discard.at(-1)).toEqual(old)});
 for(const [name,size] of [["paire",2],["brelan",3],["carré",4]] as const) it(`réussit un ${name}`,()=>{const s=state(Array(size).fill(6).concat([9]).slice(0,4));const n=attemptCombination(s,Array.from({length:size},(_,i)=>i));expect(n.players[0].cards).toHaveLength(s.players[0].cards.length-size+1);if(size===4)expect(n.players.slice(1).every(p=>p.penalties===40)).toBe(true)});
 it("pénalise une combinaison ratée de +30 et conserve la pioche à résoudre",()=>{const s=state([1,2,3,4]);const n=attemptCombination(s,[0,1]);expect(n.players[0].penalties).toBe(30);expect(n.drawn).toEqual(s.drawn);expect(n.phase).toBe("drawn")});
 it("cumule les pénalités",()=>expect(scoreRound([player(0,[8,10],70),player(1,[30])],null)[0]).toBe(88));
});
describe("ADRIANO",()=>{
 it("réussi donne zéro à l'annonceur et +30 aux autres",()=>expect(scoreRound([player(0,[2]),player(1,[5]),player(2,[6]),player(3,[7])],0)).toEqual([0,35,36,37]));
 it("raté donne cartes +30 à l'annonceur",()=>expect(scoreRound([player(0,[8]),player(1,[5]),player(2,[9]),player(3,[10])],0)).toEqual([38,5,9,10]));
 it("à égalité pénalise seulement les joueurs au-dessus",()=>expect(scoreRound([player(0,[5]),player(1,[5]),player(2,[9]),player(3,[10])],0)).toEqual([5,5,39,40]));
});
describe("pouvoirs",()=>{
 it("le 3 accorde exactement deux tours sans cumul",()=>{let s: GameState=state([1],card(3));s=discardDrawn(s);expect(s.bonusTurns).toBe(1);expect(s.active).toBe(0);s={...s,drawn:card(3),phase:"drawn"};s=discardDrawn(s);expect(s.bonusTurns).toBe(0);expect(s.phase).toBe("choose")});
 it("le 7 mémorise sa carte",()=>{let s: GameState={...state(),drawn:card(7)};s=discardDrawn(s);s=power7(s,0);expect(s.players[0].memory[s.players[0].cards[0].id]).toBe(1)});
 it("le 8 échange deux cartes sans les mémoriser",()=>{let s=state();const a=s.players[0].cards[0],b=s.players[1].cards[0];s={...s,phase:"power8-other",powerSelf:0};const n=power8(s,1,0);expect(n.players[0].cards[0]).toBe(b);expect(n.players[1].cards[0]).toBe(a);expect(n.players[0].memory[b.id]).toBeUndefined()});
 it("le 9 mémorise une carte adverse",()=>{const s={...state(),phase:"power9" as const};const n=power9(s,1,0);const c=s.players[1].cards[0];expect(n.players[0].memory[c.id]).toBe(c.value)});
});
describe("manches et bots",()=>{
 it("recycle toute la fosse une seule fois",()=>{const s={...state(),phase:"choose" as const,deck:[],discard:[card(2),card(3),card(4)],drawn:null};const n=draw(s);expect(n.recycled).toBe(true);expect(n.drawn).not.toBeNull();expect(n.discard).toHaveLength(0);expect(n.deck).toHaveLength(2)});
 it("termine la manche à la seconde panne",()=>{const s={...state(),phase:"choose" as const,deck:[],discard:[card(2)],drawn:null,recycled:true};expect(draw(s).phase).toBe("round-end")});
 it("la partie se termine après exactement sept manches",()=>{const s={...newGame(()=>.2),round:7};expect(finishRound(s).phase).toBe("game-end")});
 it("désigne tous les gagnants ex æquo",()=>{const ps=[player(0,[1]),player(1,[2]),player(2,[3])];ps[0].total=4;ps[1].total=4;ps[2].total=9;expect(winners(ps)).toEqual([0,1])});
 it("une décision de bot ne peut utiliser que la mémoire fournie",()=>{const ids=["secret-a","known-b"];expect(chooseReplacement({"known-b":12},ids,4,()=>.9)).toBe(1);expect(chooseReplacement({},ids,4,()=>.99)).toBeNull()});
 it("un tour final avance puis finit correctement",()=>{let s={...state(),phase:"turn-end" as const,caller:1,active:0,finalTurns:[0]};expect(advanceTurn(s).phase).toBe("round-end")});
 it("calcule la valeur réelle d'une main",()=>expect(handScore(player(0,[2,3,4]))).toBe(9));
});
