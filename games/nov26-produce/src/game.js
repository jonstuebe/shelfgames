// The cards, the decks you can switch on and off, and the "peas in the pod" scorekeeping.
// No DOM here, so Vitest can import it directly.

export const PEAS = 5;
export const MAX_PLAYERS = 10;
export const MAX_NAME = 18;

export const DECKS = {
  book:      { name: "Book club",         icon: "pumpkin",  lead: "Never have I ever…" },
  garden:    { name: "Garden variety",    icon: "cucumber", lead: "Never have I ever…" },
  forbidden: { name: "Forbidden harvest", icon: "tomato",   lead: "Never have I ever…" },
  wild:      { name: "Harvest moon",      icon: "moon",     lead: "The moon is full…" },
};

export const CARDS = {
  book: [
    "read a whole book in one sitting.",
    "hidden a book’s cover so nobody could see what I was reading.",
    "bought a book purely because of its title.",
    "listened to an audiobook out loud and panicked when a scene started.",
    "cried over a book in public.",
    "quit a book because it was “too weird.”",
    "recommended a book and instantly regretted it.",
    "stayed up past 3 a.m. to find out what happens.",
    "skipped ahead to the steamy parts first.",
    "fudged how many books I’ve read this year.",
    "picked a side in a love triangle and defended it online.",
    "had a book hangover that lasted more than a week.",
    "read a romance and told absolutely no one.",
    "rated a book five stars and refused to explain why.",
    "had a fictional crush I’d never admit to.",
    "texted a friend “you have to read this” with zero context.",
    "wondered how an author came up with a premise.",
    "laughed out loud at a book and had to explain myself.",
  ],
  garden: [
    "talked to a vegetable before cooking it.",
    "given a piece of produce a name.",
    "squeezed produce at the store far longer than necessary.",
    "sent a 🍆 or 🍑 on purpose.",
    "blamed a smell in the fridge on someone else.",
    "grown a plant and let it die dramatically.",
    "looked at a cucumber and thought about something other than salad.",
    "used a vegetable as a costume piece or prop.",
    "hidden vegetables on my plate so I could leave the table.",
    "made a produce pun that nobody laughed at.",
    "snacked on grapes in the store without buying them.",
    "cried over an onion and let people assume it was something else.",
    "dropped a tomato and pretended it never happened.",
    "had a farmers’ market crush.",
    "wondered if a vegetable was looking at me.",
    "eaten something off the floor because it was “just a vegetable.”",
    "pretended to love a vegetable to impress someone.",
    "bought an out-of-season tomato and regretted it.",
  ],
  forbidden: [
    "had a crush on someone I wasn’t supposed to.",
    "been caught in a compromising position.",
    "kissed someone in a kitchen.",
    "fantasized about someone completely off-limits.",
    "flirted with two people at the same time.",
    "been stuck under one roof with someone I was trying not to fall for.",
    "taken a new job to escape something in my past.",
    "kept a secret that could change everything.",
    "broken a promise I swore I’d keep.",
    "confessed a feeling and made it awkward.",
    "blushed so hard I had to leave the room.",
    "sent a message and immediately wanted to unsend it.",
    "been in a love triangle, even if only in my head.",
    "had a “just friends” situation that definitely wasn’t.",
    "been drawn to someone in a uniform.",
    "had a dream I could never mention to the person in it.",
    "said “this is a mistake” right before making it anyway.",
    "stood too close to someone on purpose.",
    "snuck out after dark.",
    "gone to confession, or wanted to.",
  ],
  wild: [
    "Everyone wearing red or green eats a pea.",
    "Transformation: swap seats with the person on your left.",
    "Plot twist: the player who drew this card picks someone for a free confession.",
    "Taste test: say a produce pun. Best groan wins a pea back.",
    "Everyone who has ever named a vegetable eats a pea.",
    "Vow of silence: nobody speaks until the next card is drawn. Talkers eat a pea.",
    "Group blush: everyone who has blushed at a book eats a pea.",
    "Harvest time: the player with the most peas left picks who answers the next card first.",
  ],
};

export function allDecksOn() {
  return Object.fromEntries(Object.keys(DECKS).map(k => [k, true]));
}

// Flips one deck on or off. The last deck that's on stays on, so the basket is never empty.
export function toggleDeck(active, key) {
  const on = Object.keys(active).filter(k => active[k]);
  if (active[key] && on.length === 1) return active;
  return { ...active, [key]: !active[key] };
}

export function shuffle(items, random = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Every card from the decks that are on, shuffled together.
export function buildDeck(active, random = Math.random) {
  const cards = Object.keys(CARDS)
    .filter(k => active[k])
    .flatMap(k => CARDS[k].map(text => ({ deck: k, text })));
  return shuffle(cards, random);
}

/* ---------- Peas in the pod ---------- */

export function cleanName(raw) {
  return String(raw).replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
}

// A new player with a full pod, or null when the name is blank or the table is full.
export function newPlayer(raw, players, id) {
  const name = cleanName(raw);
  if (!name || players.length >= MAX_PLAYERS) return null;
  return { id, name, peas: Array(PEAS).fill(true) };
}

export function peasLeft(player) {
  return player.peas.filter(Boolean).length;
}

export function togglePea(player, i) {
  return { ...player, peas: player.peas.map((p, k) => (k === i ? !p : p)) };
}

export function replant(player) {
  return { ...player, peas: Array(PEAS).fill(true) };
}

export function playerState(player) {
  const left = peasLeft(player);
  if (left === 0) return "Out of the pod";
  return left === 1 ? "1 pea left" : `${left} peas left`;
}

// What the banner under the players should say, or null for no banner.
export function podBanner(players) {
  if (players.length < 2) return null;
  const alive = players.filter(p => peasLeft(p) > 0);
  if (alive.length === 1) return `Last pod standing: ${alive[0].name}.`;
  if (alive.length === 0) return "Everyone’s out of the pod. Time to replant.";
  return null;
}
