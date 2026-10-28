import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  booksFromPackages, clothFor, CLOTH, coverUrl, filterBooks, filterOptions, filtersToSearch, gameUrl,
  monthsOf, parseFilters, shelvesByYear, subdomainFor, validateGame, yearsOf,
} from "./library.js";

const meta = (overrides = {}) => ({
  subdomain: "nov26", month: "2026-11", book: "The House in the Cerulean Sea",
  author: "TJ Klune", game: "Which Marsyas Island Resident Are You?", ...overrides,
});

describe("every game in the repo", () => {
  const gamesDir = join(import.meta.dirname, "../../games");
  const dirs = readdirSync(gamesDir).filter(d => existsSync(join(gamesDir, d, "package.json")));

  it.each(dirs)("%s has valid shelf metadata matching its folder name", dir => {
    const pkg = JSON.parse(readFileSync(join(gamesDir, dir, "package.json"), "utf8"));
    expect(validateGame(pkg.shelfgames)).toEqual([]);
    expect(pkg.shelfgames.subdomain).toBe(dir);
  });
});

describe("subdomains and links", () => {
  it("uses the three-letter month and two-digit year", () => {
    expect(subdomainFor(2026, 11)).toBe("nov26");
    expect(subdomainFor(2027, 1)).toBe("jan27");
    expect(subdomainFor(2030, 9)).toBe("sep30");
  });

  it("links to the game's subdomain", () => {
    expect(gameUrl("nov26")).toBe("https://nov26.shelfgames.party");
  });

  it("prefers a game's own cover, then Open Library by ISBN", () => {
    expect(coverUrl({ cover: "/covers/x.jpg", isbn: "9781250217288" })).toBe("/covers/x.jpg");
    expect(coverUrl({ isbn: "9781250217288" })).toBe("https://covers.openlibrary.org/b/isbn/9781250217288-L.jpg?default=false");
    expect(coverUrl({})).toBeNull();
  });
});

describe("validateGame", () => {
  it("accepts good metadata", () => {
    expect(validateGame(meta())).toEqual([]);
    expect(validateGame(meta({ isbn: "9781250217288" }))).toEqual([]);
  });

  it("explains what's wrong", () => {
    expect(validateGame(undefined)).toEqual(['is missing its "shelfgames" block']);
    expect(validateGame(meta({ subdomain: "nov-26" }))).toEqual(['"subdomain" should be "nov26" for 2026-11, not "nov-26"']);
    expect(validateGame(meta({ month: "Nov 2026" }))[0]).toMatch(/"month" should look like "2026-11"/);
    expect(validateGame(meta({ month: "2026-13" }))[0]).toMatch(/"month" should look like/);
    expect(validateGame(meta({ book: "" }))).toEqual(['needs a "book"']);
    expect(validateGame(meta({ isbn: "978-1-250" }))[0]).toMatch(/"isbn" should be 10 or 13 digits/);
  });

  it("names the broken package when loading books", () => {
    expect(() => booksFromPackages({ "games/dec26/package.json": { shelfgames: meta({ subdomain: "dec26" }) } }))
      .toThrow(/games\/dec26\/package.json "subdomain" should be "nov26"/);
  });
});

describe("shelving and filtering", () => {
  const books = booksFromPackages({
    a: { shelfgames: meta() },
    b: { shelfgames: meta({ subdomain: "jan27", month: "2027-01", book: "B" }) },
    c: { shelfgames: meta({ subdomain: "feb27", month: "2027-02", book: "C" }) },
    d: { shelfgames: meta({ subdomain: "nov27", month: "2027-11", book: "D" }) },
  });

  it("reads books oldest first", () => {
    expect(books.map(b => b.subdomain)).toEqual(["nov26", "jan27", "feb27", "nov27"]);
    expect(books[0]).toMatchObject({ year: 2026, month: 11, url: "https://nov26.shelfgames.party" });
  });

  it("puts one year on each shelf, newest year on top", () => {
    expect(shelvesByYear(books).map(s => [s.year, s.books.map(b => b.subdomain)]))
      .toEqual([[2027, ["jan27", "feb27", "nov27"]], [2026, ["nov26"]]]);
  });

  it("filters by year, by month, or both", () => {
    expect(filterBooks(books).length).toBe(4);
    expect(filterBooks(books, { year: 2027 }).map(b => b.subdomain)).toEqual(["jan27", "feb27", "nov27"]);
    expect(filterBooks(books, { month: 11 }).map(b => b.subdomain)).toEqual(["nov26", "nov27"]);
    expect(filterBooks(books, { year: 2026, month: 1 })).toEqual([]);
  });

  it("counts how many books each picker entry would show, given the other filter", () => {
    const { years, months } = filterOptions(books, { year: 2027, month: null });
    expect(years).toEqual([
      { value: null, label: "All years", count: 4 },
      { value: 2027, label: "2027", count: 3 },
      { value: 2026, label: "2026", count: 1 },
    ]);
    expect(months).toEqual([
      { value: null, label: "All months", count: 3 },
      { value: 1, label: "January", count: 1 },
      { value: 2, label: "February", count: 1 },
      { value: 11, label: "November", count: 1 },
    ]);
    expect(filterOptions(books, { year: 2026, month: null }).months.find(m => m.value === 1).count).toBe(0);
  });

  it("lists the years and months that have books", () => {
    expect(yearsOf(books)).toEqual([2027, 2026]);
    expect(monthsOf(books)).toEqual([1, 2, 11]);
  });
});

describe("filters in the URL", () => {
  it("round-trips", () => {
    expect(parseFilters(filtersToSearch({ year: 2026, month: 11 }))).toEqual({ year: 2026, month: 11 });
    expect(filtersToSearch({ year: null, month: null })).toBe("");
  });

  it("ignores junk", () => {
    expect(parseFilters("?year=abc&month=13")).toEqual({ year: null, month: null });
    expect(parseFilters("?month=0")).toEqual({ year: null, month: null });
  });
});

describe("stand-in covers", () => {
  it("picks a steady cloth color per title", () => {
    expect(clothFor("Some Book")).toBe(clothFor("Some Book"));
    expect(CLOTH).toContain(clothFor("Another"));
  });
});
