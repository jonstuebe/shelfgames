import { describe, expect, it } from "vitest";
import { characters, questions, REVEAL_AT, REVEAL_DAY_END, isRevealed, revealStage, scoreAnswers } from "./quiz.js";

describe("quiz data", () => {
  it("has eight questions with four options each", () => {
    expect(questions).toHaveLength(8);
    for (const q of questions) expect(q.a).toHaveLength(4);
  });

  it("only awards points to characters that exist", () => {
    for (const q of questions)
      for (const [, picks] of q.a)
        for (const c of picks) expect(characters).toHaveProperty(c);
  });

  it("gives every character a way to score", () => {
    const reachable = new Set(questions.flatMap(q => q.a.flatMap(([, picks]) => picks)));
    expect([...reachable].sort()).toEqual(Object.keys(characters).sort());
  });
});

describe("scoreAnswers", () => {
  it("picks the character with the most points", () => {
    // Every answer that includes Talia: Q1 opt 0, Q3 opt 0, Q4 opt 1, Q5 opt 0, Q6 opt 1, Q8 opt 0
    const answers = [0, 0, 0, 1, 0, 1, 0, 0];
    expect(scoreAnswers(answers).top).toBe("talia");
  });

  it("returns no second match when nobody else scored", () => {
    // Only Q1 answered: "Playing old records loud" scores Lucy alone
    expect(scoreAnswers([1])).toEqual({ top: "lucy", second: null });
  });

  it("breaks ties using the supplied random source", () => {
    // Q1 opt 0 gives one point each to Talia and Phee; nothing else answered
    for (const random of [() => 0, () => 0.99]) {
      const { top, second } = scoreAnswers([0], random);
      expect([top, second].sort()).toEqual(["phee", "talia"]);
    }
  });
});

describe("reveal time", () => {
  it("is noon Arizona time on Sunday, November 22, 2026", () => {
    const d = new Date(REVEAL_AT);
    expect(d.toISOString()).toBe("2026-11-22T19:00:00.000Z");
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", weekday: "long", hour: "numeric", hourCycle: "h23" })
        .formatToParts(d).map(p => [p.type, p.value]));
    expect(parts).toMatchObject({ weekday: "Sunday", hour: "12" });
  });

  it("stays sealed until the reveal", () => {
    expect(isRevealed(REVEAL_AT - 1)).toBe(false);
    expect(isRevealed(REVEAL_AT)).toBe(true);
  });

  it("keeps the tap-together reveal for the rest of book club day, then opens up", () => {
    expect(revealStage(REVEAL_AT - 1)).toBe("sealed");
    expect(revealStage(REVEAL_AT)).toBe("reveal-day");
    expect(revealStage(REVEAL_DAY_END - 1)).toBe("reveal-day");
    expect(revealStage(REVEAL_DAY_END)).toBe("open");
    expect(revealStage(Date.parse("2027-03-01T12:00:00Z"))).toBe("open");
  });

  it("ends reveal day at midnight Arizona time", () => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: "America/Phoenix", day: "numeric", hour: "numeric", minute: "numeric", hourCycle: "h23" })
        .formatToParts(new Date(REVEAL_DAY_END)).map(p => [p.type, p.value]));
    expect(parts).toMatchObject({ day: "23", hour: "00", minute: "00" });
  });
});
