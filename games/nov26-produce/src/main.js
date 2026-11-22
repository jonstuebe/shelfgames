import {
  allDecksOn, buildDeck, DECKS, newPlayer, PEAS, playerState, podBanner, replant, toggleDeck, togglePea,
} from "./game.js";

const ICON_MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#FFD65A"/><circle cx="9" cy="9" r="2" fill="#F2BE3A"/><circle cx="15" cy="14" r="1.4" fill="#F2BE3A"/></svg>';
const ICONS = {
  tomato: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="8" fill="#D8372A"/><path d="M12 7 L9 5.5 L9.8 8.2 L7 9 L10 9.8 L12 8.4 L14 9.8 L17 9 L14.2 8.2 L15 5.5 Z" fill="#2E7D32"/></svg>',
  cucumber: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="1.5" width="7.5" height="21" rx="3.75" transform="rotate(24 12 12)" fill="#27793A"/><circle cx="10.5" cy="16" r="0.9" fill="#1B5E2C"/><circle cx="13.8" cy="9" r="0.9" fill="#1B5E2C"/><circle cx="12" cy="12.5" r="0.9" fill="#1B5E2C"/></svg>',
  pumpkin: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="9" ry="7.5" fill="#F08A1F"/><path d="M12 6.5 Q9 14 12 21.5 M12 6.5 Q15 14 12 21.5 M12 6.5 Q5.5 13 8 20 M12 6.5 Q18.5 13 16 20" fill="none" stroke="#C46A0E" stroke-width="1.2"/><rect x="11" y="3" width="2.4" height="4" rx="1" fill="#2E7D32"/></svg>',
  moon: ICON_MOON,
  start: ICON_MOON,
};

const FLIP_MS = 170;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = id => document.getElementById(id);
const cardEl = $("card");

let active = allDecksOn();
let deck = [];
let idx = 0;
let busy = false;

const setStatus = msg => { $("status").textContent = msg; };
const remaining = () => deck.length - idx;

function reshuffle() {
  deck = buildDeck(active);
  idx = 0;
}

/* ---------- The card ---------- */

function paint(card) {
  const d = DECKS[card.deck];
  cardEl.dataset.cat = card.deck;
  $("badgeIcon").innerHTML = ICONS[d.icon];
  $("badgeName").textContent = d.name;
  $("lead").textContent = d.lead;
  $("prompt").textContent = card.text;
  $("hint").textContent = "Tap for the next one";
  cardEl.style.setProperty("--tilt", (Math.random() * 3 - 1.5).toFixed(2) + "deg");
}

function draw() {
  if (busy) return;
  let note = "";
  if (idx >= deck.length) { reshuffle(); note = "Basket emptied, so the deck was reshuffled. "; }
  const card = deck[idx++];
  setStatus(`${note}${remaining()} left in the basket`);
  if (reduceMotion) { paint(card); return; }
  busy = true;
  cardEl.classList.add("turn");
  setTimeout(() => {
    paint(card);
    cardEl.classList.remove("turn");
    setTimeout(() => { busy = false; }, FLIP_MS);
  }, FLIP_MS);
}

/* ---------- Deck chips ---------- */

function renderChips() {
  const box = $("chips");
  box.innerHTML = "";
  for (const key of Object.keys(DECKS)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.cat = key;
    b.setAttribute("aria-pressed", String(active[key]));
    const ico = document.createElement("span");
    ico.className = "ico";
    ico.innerHTML = ICONS[DECKS[key].icon];
    const label = document.createElement("span");
    label.textContent = DECKS[key].name;
    b.append(ico, label);
    b.addEventListener("click", () => {
      const next = toggleDeck(active, key);
      if (next === active) return;
      active = next;
      b.setAttribute("aria-pressed", String(active[key]));
      reshuffle();
      setStatus(`${remaining()} cards in the basket`);
    });
    box.appendChild(b);
  }
}

/* ---------- Peas in the pod ---------- */

let players = [];
let nextId = 1;
const rows = new Map();

function addPlayer() {
  const input = $("nameInput");
  const p = newPlayer(input.value, players, nextId);
  if (p) {
    nextId++;
    players.push(p);
    input.value = "";
    buildRow(p);
    refresh();
  }
  input.focus();
}

function updatePlayer(id, change) {
  players = players.map(p => (p.id === id ? change(p) : p));
  refresh();
}

function buildRow(p) {
  const li = document.createElement("li");
  li.className = "player";

  const top = document.createElement("div");
  top.className = "player-top";
  const nameWrap = document.createElement("div");
  const nm = document.createElement("div");
  nm.className = "player-name";
  nm.textContent = p.name;
  const state = document.createElement("div");
  state.className = "player-state";
  nameWrap.append(nm, state);
  const rm = document.createElement("button");
  rm.type = "button";
  rm.className = "remove";
  rm.setAttribute("aria-label", `Remove ${p.name}`);
  rm.textContent = "×";
  rm.addEventListener("click", () => {
    players = players.filter(x => x.id !== p.id);
    li.remove();
    rows.delete(p.id);
    refresh();
  });
  top.append(nameWrap, rm);

  const peas = document.createElement("div");
  peas.className = "peas";
  const buttons = p.peas.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pea";
    const dot = document.createElement("span");
    dot.className = "dot";
    b.appendChild(dot);
    b.addEventListener("click", () => updatePlayer(p.id, x => togglePea(x, i)));
    peas.appendChild(b);
    return b;
  });

  li.append(top, peas);
  $("players").appendChild(li);
  rows.set(p.id, { li, state, buttons });
}

function refresh() {
  for (const p of players) {
    const r = rows.get(p.id);
    const state = playerState(p);
    r.li.classList.toggle("out", !p.peas.some(Boolean));
    r.state.textContent = state;
    r.buttons.forEach((b, i) => {
      b.setAttribute("aria-pressed", String(p.peas[i]));
      b.setAttribute("aria-label", `${p.name}, pea ${i + 1} of ${PEAS}, ${p.peas[i] ? "in the pod" : "eaten"}`);
    });
  }
  const banner = $("banner");
  const text = podBanner(players);
  banner.textContent = text ?? "";
  banner.hidden = text == null;
  $("tools").hidden = players.length === 0;
}

$("resetPeas").addEventListener("click", () => {
  players = players.map(replant);
  refresh();
});
$("addBtn").addEventListener("click", addPlayer);
$("nameInput").addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); addPlayer(); }
});
cardEl.addEventListener("click", draw);
$("draw").addEventListener("click", draw);

/* ---------- How to play ---------- */

const guide = $("guide");
const openGuide = () => { if (!guide.open) guide.showModal(); };
$("guideOk").addEventListener("click", () => guide.close());
$("howBtn").addEventListener("click", openGuide);
guide.addEventListener("click", e => { if (e.target === guide) guide.close(); });

/* ---------- Start up ---------- */

$("badgeIcon").innerHTML = ICONS.start;
renderChips();
reshuffle();
setStatus(`${deck.length} cards in the basket`);
openGuide();
