import {
  booksFromPackages, clothFor, coverUrl, filterBooks, filtersToSearch,
  MONTHS, monthsOf, parseFilters, shelvesByYear, yearsOf,
} from "./library.js";

// Every game's package.json, read at build time. Adding a game folder adds its book.
const packages = import.meta.glob("../../games/*/package.json", { eager: true, import: "default" });
const books = booksFromPackages(packages);

const library = document.getElementById("library");
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");
const count = document.getElementById("count");
let filters = parseFilters(location.search);

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function options(select, all, values, label, current) {
  select.innerHTML = `<option value="">${all}</option>` +
    values.map(v => `<option value="${v}"${v === current ? " selected" : ""}>${esc(label(v))}</option>`).join("");
}

// A cloth-bound stand-in for books without a cover image.
function clothCover(book) {
  return `<span class="cloth" style="--cloth:${clothFor(book.title)}">
    <span class="cloth-title">${esc(book.title)}</span>
    <span class="cloth-rule"></span>
    <span class="cloth-author">${esc(book.author)}</span>
  </span>`;
}

function bookHtml(book) {
  const when = `${MONTHS[book.month - 1]} ${book.year}`;
  const src = coverUrl(book);
  return `<div class="slot">
    <a class="book" href="${esc(book.url)}" title="${esc(book.game)}"
       aria-label="${esc(`${book.title} by ${book.author}, ${when}. Play: ${book.game}`)}">
      <span class="cover">${src
        ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async" data-title="${esc(book.title)}">`
        : clothCover(book)}</span>
    </a>
    <span class="plate">${MONTHS[book.month - 1].slice(0, 3)} ${book.year}</span>
  </div>`;
}

function render() {
  options(yearSelect, "All years", yearsOf(books), String, filters.year);
  options(monthSelect, "All months", monthsOf(books), m => MONTHS[m - 1], filters.month);

  const shown = filterBooks(books, filters);
  const filtered = filters.year != null || filters.month != null;
  count.textContent = `${shown.length} ${shown.length === 1 ? "book" : "books"}${filtered ? " match" + (shown.length === 1 ? "es" : "") : " on the shelves"}`;

  library.innerHTML = shown.length
    ? shelvesByYear(shown).map(shelf => `
        <section class="shelf" aria-label="${shelf.year}">
          <div class="rail"><h2 class="plaque">${shelf.year}</h2></div>
          <div class="shelf-books">${shelf.books.map(bookHtml).join("")}</div>
        </section>`).join("")
    : `<section class="shelf empty">
        <div class="rail"><h2 class="plaque">Empty</h2></div>
        <div class="shelf-books">
          <div class="note">
            <p>Nothing on this shelf yet.</p>
            <button type="button" class="show-all" id="show-all">Show every book</button>
          </div>
        </div>
      </section>`;

  library.querySelectorAll(".cover img").forEach(img => {
    const swap = () => {
      const book = books.find(b => b.title === img.dataset.title);
      img.replaceWith(document.createRange().createContextualFragment(clothCover(book)));
    };
    // Open Library answers 404 for a missing cover; a tiny image means a placeholder.
    img.addEventListener("error", swap, { once: true });
    img.addEventListener("load", () => { if (img.naturalWidth < 10) swap(); }, { once: true });
  });
  const showAll = document.getElementById("show-all");
  if (showAll) showAll.onclick = () => setFilters({ year: null, month: null });
}

function setFilters(next) {
  filters = next;
  history.replaceState(null, "", location.pathname + filtersToSearch(filters));
  render();
}

const asNumber = v => (v === "" ? null : Number(v));
yearSelect.onchange = () => setFilters({ ...filters, year: asNumber(yearSelect.value) });
monthSelect.onchange = () => setFilters({ ...filters, month: asNumber(monthSelect.value) });

render();
