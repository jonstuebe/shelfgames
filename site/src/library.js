// Turns each game's `shelfgames` metadata (in games/*/package.json) into books on the shelf.

export const DOMAIN = "shelfgames.party";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Subdomains are the three-letter month plus the two-digit year: November 2026 is "nov26".
export function subdomainFor(year, month) {
  return MONTHS[month - 1].slice(0, 3).toLowerCase() + String(year).slice(-2);
}

export function gameUrl(subdomain) {
  return `https://${subdomain}.${DOMAIN}`;
}

// A game can name its own cover image; otherwise Open Library looks it up by ISBN.
// `default=false` makes a missing cover fail to load, so the page can draw a stand-in.
export function coverUrl(book) {
  if (book.cover) return book.cover;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg?default=false`;
  return null;
}

// Problems with one game's metadata, as readable messages. Empty means it's good to shelve.
export function validateGame(meta) {
  if (!meta) return ["is missing its \"shelfgames\" block"];
  const errors = [];
  for (const key of ["subdomain", "month", "book", "author", "game"])
    if (typeof meta[key] !== "string" || !meta[key].trim()) errors.push(`needs a "${key}"`);
  const match = /^(\d{4})-(\d{2})$/.exec(meta.month || "");
  const month = match && Number(match[2]);
  if (!match || month < 1 || month > 12) errors.push(`"month" should look like "2026-11", not "${meta.month}"`);
  else if (meta.subdomain !== subdomainFor(Number(match[1]), month))
    errors.push(`"subdomain" should be "${subdomainFor(Number(match[1]), month)}" for ${meta.month}, not "${meta.subdomain}"`);
  if (meta.isbn != null && !/^(\d{9}[\dX]|\d{13})$/.test(meta.isbn))
    errors.push(`"isbn" should be 10 or 13 digits with no dashes, not "${meta.isbn}"`);
  return errors;
}

// `packages` maps each game's package.json path to its contents.
export function booksFromPackages(packages) {
  const books = Object.entries(packages).map(([path, pkg]) => {
    const meta = pkg.shelfgames;
    const errors = validateGame(meta);
    if (errors.length) throw new Error(`${path} ${errors.join("; ")}`);
    const [year, month] = meta.month.split("-").map(Number);
    return {
      subdomain: meta.subdomain,
      year,
      month,
      title: meta.book,
      author: meta.author,
      game: meta.game,
      isbn: meta.isbn ?? null,
      cover: meta.cover ?? null,
      url: gameUrl(meta.subdomain),
    };
  });
  // Oldest first, so each shelf reads left to right through the year.
  return books.sort((a, b) => a.year - b.year || a.month - b.month);
}

export function filterBooks(books, { year = null, month = null } = {}) {
  return books.filter(b => (year == null || b.year === year) && (month == null || b.month === month));
}

// One shelf per year, newest year on top.
export function shelvesByYear(books) {
  const years = [...new Set(books.map(b => b.year))].sort((a, b) => b - a);
  return years.map(year => ({ year, books: books.filter(b => b.year === year) }));
}

export function yearsOf(books) {
  return [...new Set(books.map(b => b.year))].sort((a, b) => b - a);
}

export function monthsOf(books) {
  return [...new Set(books.map(b => b.month))].sort((a, b) => a - b);
}

// Reads ?year=2026&month=11, ignoring anything that isn't a real year or month.
export function parseFilters(search) {
  const params = new URLSearchParams(search);
  const year = Number(params.get("year"));
  const month = Number(params.get("month"));
  return {
    year: Number.isInteger(year) && year >= 2000 ? year : null,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : null,
  };
}

export function filtersToSearch({ year, month }) {
  const params = new URLSearchParams();
  if (year != null) params.set("year", year);
  if (month != null) params.set("month", month);
  const s = params.toString();
  return s ? `?${s}` : "";
}

// A cloth color for books without a cover, stable for each title.
export const CLOTH = ["#7A2E2E", "#2F4B6E", "#355E3B", "#8A6A1F", "#4A3A64", "#2E6461", "#6B3F2A"];
export function clothFor(title) {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return CLOTH[h % CLOTH.length];
}
