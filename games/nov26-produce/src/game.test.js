import { describe, expect, it } from "vitest";
import {
  allDecksOn, buildDeck, CARDS, cleanName, DECKS, MAX_PLAYERS, newPlayer, PEAS, peasLeft,
  playerState, podBanner, replant, shuffle, toggleDeck, togglePea,
} from "./game.js";

describe("decks", () => {
  it("has cards for every deck and a deck for every set of cards", () => {
    expect(Object.keys(CARDS).sort()).toEqual(Object.keys(DECKS).sort());
    for (const cards of Object.values(CARDS)) expect(cards.length).toBeGreaterThan(0);
  });

  it("never repeats a card within a deck", () => {
    for (const cards of Object.values(CARDS)) expect(new Set(cards).size).toBe(cards.length);
  });

  it("builds a basket from only the decks that are on", () => {
    const deck = buildDeck({ ...allDecksOn(), garden: false, wild: false });
    expect(deck).toHaveLength(CARDS.book.length + CARDS.forbidden.length);
    expect(new Set(deck.map(c => c.deck))).toEqual(new Set(["book", "forbidden"]));
  });

  it("keeps the last deck on", () => {
    const one = { book: true, garden: false, forbidden: false, wild: false };
    expect(toggleDeck(one, "book")).toBe(one);
    expect(toggleDeck(one, "wild")).toEqual({ ...one, wild: true });
    expect(toggleDeck(allDecksOn(), "book").book).toBe(false);
  });
});

describe("shuffle", () => {
  it("keeps every card and leaves the original alone", () => {
    const items = [1, 2, 3, 4, 5];
    const out = shuffle(items, () => 0);
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
    expect(items).toEqual([1, 2, 3, 4, 5]);
  });

  it("uses the supplied random source", () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
    expect(shuffle([1, 2, 3], () => 0.99)).toEqual([1, 2, 3]);
  });
});

describe("peas in the pod", () => {
  it("tidies names and turns away blanks", () => {
    expect(cleanName("  Emily   Rose ")).toBe("Emily Rose");
    expect(cleanName("x".repeat(30))).toHaveLength(18);
    expect(newPlayer("   ", [], 1)).toBeNull();
  });

  it("starts everyone with a full pod", () => {
    const p = newPlayer("Robert", [], 1);
    expect(p).toEqual({ id: 1, name: "Robert", peas: Array(PEAS).fill(true) });
    expect(playerState(p)).toBe(`${PEAS} peas left`);
  });

  it("seats at most ten players", () => {
    const table = Array.from({ length: MAX_PLAYERS }, (_, i) => newPlayer(`P${i}`, [], i));
    expect(newPlayer("One more", table, 99)).toBeNull();
  });

  it("eats and regrows peas", () => {
    let p = newPlayer("Laurent", [], 1);
    p = togglePea(p, 0);
    expect(peasLeft(p)).toBe(PEAS - 1);
    expect(togglePea(p, 0).peas.every(Boolean)).toBe(true);
    for (let i = 1; i < PEAS - 1; i++) p = togglePea(p, i);
    expect(playerState(p)).toBe("1 pea left");
    p = togglePea(p, PEAS - 1);
    expect(playerState(p)).toBe("Out of the pod");
    expect(peasLeft(replant(p))).toBe(PEAS);
  });

  it("names the last player standing", () => {
    const out = p => ({ ...p, peas: Array(PEAS).fill(false) });
    const emily = newPlayer("Emily", [], 1);
    const robert = newPlayer("Robert", [], 2);
    expect(podBanner([emily])).toBeNull();
    expect(podBanner([emily, robert])).toBeNull();
    expect(podBanner([emily, out(robert)])).toBe("Last pod standing: Emily.");
    expect(podBanner([out(emily), out(robert)])).toMatch(/Everyone’s out of the pod/);
  });
});
