export const characters = {
  linus: { name: "Linus Baker", tagline: "Rule-follower with a secretly enormous heart.",
    desc: "You like things orderly: a tidy desk, a clear process, a good cardigan. People sometimes underestimate you, and for a while you may have underestimated yourself too. But you notice unfairness, and once you see it, you can’t unsee it. Give you a little sunshine and the right people, and you’ll stand up when it counts." },
  arthur: { name: "Arthur Parnassus", tagline: "The steady warmth everyone gathers around.",
    desc: "You’re the calm in the room. You lead with patience, believe in people before they believe in themselves, and would quietly move mountains for the ones you love. There’s more to your story than you share at first, and that depth is exactly why people trust you." },
  lucy: { name: "Lucy", tagline: "Delightfully spooky, deeply sweet.",
    desc: "You have a dramatic streak and a taste for the macabre, and you enjoy making people squirm just a little. Underneath the theatrics is someone who wants to be loved for exactly who you are. Your music is loud, your imagination is wild, and you’re far more good than anyone expects." },
  talia: { name: "Talia", tagline: "Gardener, grump, fiercely loyal.",
    desc: "You say what you think, sometimes with a threat or two attached. You’re protective of your people and your patch of earth, and your gruffness is mostly a fence around a very soft heart. Anyone who earns your trust keeps it for life." },
  theodore: { name: "Theodore", tagline: "Collector of small treasures.",
    desc: "You find joy in little things and give them away to the people who matter most. You may not say much, but your gifts say everything. You’re loyal, curious, and happiest when everyone you love is close by." },
  phee: { name: "Phee", tagline: "Rooted, watchful, quietly powerful.",
    desc: "You feel most like yourself outdoors, hands in the soil, making things grow. You’re a little guarded and very observant, and you’d rather prove something than talk about it. Your patience is its own kind of magic." },
  sal: { name: "Sal", tagline: "A gentle soul, brave in the ways that count.",
    desc: "You’ve learned to be careful with new people, and it takes time for you to feel safe. But you feel things deeply, write them down beautifully, and when you finally speak up, people listen. You’re much braver than you give yourself credit for." },
  chauncey: { name: "Chauncey", tagline: "Big dreams, bigger enthusiasm.",
    desc: "You know exactly what you want to be, and nobody is going to talk you out of it. You’re eager to help, quick to welcome, and wonderfully unbothered by what anyone thinks you should be. Your optimism makes everyone around you a little lighter." },
  zoe: { name: "Zoe Chapelwhite", tagline: "Guardian of the island.",
    desc: "You’re wise, a bit wild, and protective of the people and places you love. You don’t hand out trust easily, but you’re fierce once you do. You’d rather keep watch from the edges than sit at the center, and everyone is safer because of it." }
};

export const questions = [
  { q: "It’s a free Saturday on the island. How do you spend it?",
    a: [ ["Tending the garden, ideally without interruption", ["talia", "phee"]],
         ["Playing old records loud enough to rattle the windows", ["lucy"]],
         ["Sitting on the beach, watching the tide and thinking", ["linus", "arthur"]],
         ["Hunting for treasures: buttons, shells, anything shiny", ["theodore"]] ] },
  { q: "Pick your dream job.",
    a: [ ["Bellhop at a grand hotel", ["chauncey"]],
         ["Caretaker of a place that needs protecting", ["zoe", "arthur"]],
         ["Anything with clear rules and well-kept files", ["linus"]],
         ["Writer, working in a quiet room", ["sal"]] ] },
  { q: "In your friend group, you’re the one who…",
    a: [ ["Says what everyone’s thinking, bluntly", ["talia"]],
         ["Listens quietly and notices everything", ["sal", "phee"]],
         ["Makes everyone laugh, sometimes a little nervously", ["lucy"]],
         ["Keeps everyone calm when things get messy", ["arthur"]] ] },
  { q: "How do you show someone you care?",
    a: [ ["A small gift I picked out just for them", ["theodore"]],
         ["Fierce, unshakable loyalty", ["talia", "zoe"]],
         ["Showing up every time, even when I’m nervous", ["linus", "sal"]],
         ["Enthusiastically offering to help with anything", ["chauncey"]] ] },
  { q: "A stranger arrives with a briefcase. You…",
    a: [ ["Size them up and decide later", ["zoe", "talia"]],
         ["Find somewhere to hide until it feels safe", ["sal"]],
         ["Rush over and offer to carry their bags", ["chauncey"]],
         ["Welcome them warmly and ask good questions", ["arthur"]] ] },
  { q: "Choose a comfort.",
    a: [ ["A cardigan and a hot cup of tea", ["linus"]],
         ["Dirt under my fingernails", ["phee", "talia"]],
         ["A snack I don’t have to share", ["theodore"]],
         ["A creepy story right before bed", ["lucy"]] ] },
  { q: "What worries you most?",
    a: [ ["Being sent away again", ["sal"]],
         ["Being judged for what I am, not who I am", ["lucy", "theodore"]],
         ["Losing the people I protect", ["arthur", "zoe"]],
         ["Watching life pass me by", ["linus", "chauncey"]] ] },
  { q: "Where on the island would we find you?",
    a: [ ["In the garden, guarding the flower beds", ["talia"]],
         ["Barefoot on the beach", ["linus"]],
         ["In my room, admiring my collection", ["theodore", "chauncey"]],
         ["Deep in the woods where things grow wild", ["zoe", "phee"]] ] }
];

// Reveal: Sunday, Nov 22, 2026 at 12:00 noon Arizona time (MST, UTC-7, no daylight saving)
export const REVEAL_AT = Date.parse("2026-11-22T19:00:00Z");

export function isRevealed(now = Date.now()) { return now >= REVEAL_AT; }

// answers[i] is the index of the option picked for questions[i]. Ties are broken at random.
export function scoreAnswers(answers, random = Math.random) {
  const scores = Object.fromEntries(Object.keys(characters).map(k => [k, 0]));
  answers.forEach((k, i) => questions[i].a[k][1].forEach(c => scores[c] += 1));
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1] || random() - 0.5);
  return { top: ranked[0][0], second: ranked[1][1] > 0 ? ranked[1][0] : null };
}
