const characters = {
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

const questions = [
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

const card = document.getElementById("card");
// Reveal: Sunday, Nov 22, 2026 at 12:00 noon Arizona time (MST, UTC-7, no daylight saving)
const REVEAL_AT = Date.parse("2026-11-22T19:00:00Z");
const STORE_KEY = "cerulean-quiz-result-v1";
let step = -1;
let answers = [];
let result = null;
let timer = null;

function isRevealed() { return Date.now() >= REVEAL_AT; }

function setTide(p) {
  document.documentElement.style.setProperty("--p", p.toFixed(3));
}

function render(html) {
  clearInterval(timer);
  card.classList.remove("enter");
  void card.offsetWidth;
  card.innerHTML = html;
  card.classList.add("enter");
  const focusable = card.querySelector("h1, h2");
  if (focusable) { focusable.setAttribute("tabindex", "-1"); focusable.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Saving the sealed result ---------- */
function saveResult() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(result)); } catch (e) {}
}
function clearResult() {
  result = null;
  try { localStorage.removeItem(STORE_KEY); } catch (e) {}
}
function loadLocal() {
  try {
    const r = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (r && characters[r.top]) return r;
  } catch (e) {}
  return null;
}

function showIntro() {
  step = -1; answers = []; setTide(0);
  const revealLine = isRevealed()
    ? "The big reveal has happened. Take the quiz to find out who you are."
    : "Your answer stays sealed until we’re all together on Sunday, November 22, at noon. Then everyone opens their phone at once.";
  render(`
    <h1>Which Marsyas Island resident are you?</h1>
    <p class="lede">Eight questions stand between you and the sea. Answer honestly, and the rain will clear as you go.</p>
    <p class="small">${revealLine}</p>
    <div class="row"><button class="btn" id="start">Start the quiz</button></div>
  `);
  document.getElementById("start").onclick = () => showQuestion(0);
}

function showQuestion(i) {
  step = i;
  setTide((i / questions.length) * 0.85);
  const item = questions[i];
  const pct = Math.round((i / questions.length) * 100);
  render(`
    <div class="tide">
      <span>Question ${i + 1} of ${questions.length}</span>
      <div class="tide-track" aria-hidden="true"><div class="tide-fill" style="width:${pct}%"></div></div>
    </div>
    <h2>${item.q}</h2>
    <div class="options">
      ${item.a.map((opt, k) => `<button class="option" data-k="${k}">${opt[0]}</button>`).join("")}
    </div>
    ${i > 0 ? `<button class="back" id="back">Back to the previous question</button>` : ""}
  `);
  card.querySelectorAll(".option").forEach(btn => {
    btn.onclick = () => {
      btn.classList.add("picked");
      answers[i] = Number(btn.dataset.k);
      setTimeout(() => (i + 1 < questions.length ? showQuestion(i + 1) : finishQuiz()), 260);
    };
  });
  const back = document.getElementById("back");
  if (back) back.onclick = () => showQuestion(i - 1);
}

function finishQuiz() {
  const scores = Object.fromEntries(Object.keys(characters).map(k => [k, 0]));
  answers.forEach((k, i) => questions[i].a[k][1].forEach(c => scores[c] += 1));
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1] || Math.random() - 0.5);
  result = { top: ranked[0][0], second: ranked[1][1] > 0 ? ranked[1][0] : null };
  saveResult();
  isRevealed() ? showReady() : showCountdown();
}

/* ---------- Countdown ---------- */
function pad(n) { return String(n).padStart(2, "0"); }

function showCountdown() {
  setTide(0.85);
  render(`
    <h2>Your character is sealed</h2>
    <p class="lede">No peeking, not even for you. Bring your phone to book club and we’ll reveal everyone together.</p>
    <div class="countdown" role="timer" aria-label="Time until the reveal">
      <div class="unit"><span class="num" id="cd-d">–</span><span class="lbl">days</span></div>
      <div class="unit"><span class="num" id="cd-h">–</span><span class="lbl">hours</span></div>
      <div class="unit"><span class="num" id="cd-m">–</span><span class="lbl">minutes</span></div>
      <div class="unit"><span class="num" id="cd-s">–</span><span class="lbl">seconds</span></div>
    </div>
    <p class="small">Reveal: Sunday, November 22, 2026, at 12:00 noon Arizona time. Keep this page bookmarked and open it on this same phone.</p>
    <button class="back" id="redo">Retake the quiz (replaces your sealed answer)</button>
  `);
  const tick = () => {
    const ms = REVEAL_AT - Date.now();
    if (ms <= 0) { showReady(); return; }
    const t = Math.floor(ms / 1000);
    document.getElementById("cd-d").textContent = Math.floor(t / 86400);
    document.getElementById("cd-h").textContent = pad(Math.floor(t % 86400 / 3600));
    document.getElementById("cd-m").textContent = pad(Math.floor(t % 3600 / 60));
    document.getElementById("cd-s").textContent = pad(t % 60);
  };
  tick();
  timer = setInterval(tick, 1000);
  document.getElementById("redo").onclick = () => { clearResult(); showIntro(); };
}

function showReady() {
  setTide(0.92);
  render(`
    <h1>It’s time.</h1>
    <p class="lede">Everyone ready? Tap together on three.</p>
    <div class="row"><button class="btn" id="reveal">Reveal my character</button></div>
  `);
  document.getElementById("reveal").onclick = () => { setTide(1); renderResult(); };
}

/* ---------- Results ---------- */
function renderResult() {
  if (!isRevealed()) { showCountdown(); return; }
  setTide(1);
  const top = characters[result.top];
  const second = result.second ? characters[result.second] : null;
  render(`
    <p class="small">The rain has cleared. You are…</p>
    <h1 class="result-name">${top.name}</h1>
    <p class="tagline">${top.tagline}</p>
    <p>${top.desc}</p>
    ${second ? `<p class="also">With a little bit of <button class="name-link" id="peek">${second.name}</button> mixed in. Tap the name to read about them.</p>` : ""}
    <div class="row">
      <button class="btn" id="again">Take it again</button>
    </div>
  `);
  document.getElementById("again").onclick = () => { clearResult(); showIntro(); };
  const peek = document.getElementById("peek");
  if (peek) peek.onclick = showSecond;
}

function showSecond() {
  const c = characters[result.second];
  const top = characters[result.top];
  render(`
    <p class="peek-label">Your bonus match</p>
    <h1 class="result-name">${c.name}</h1>
    <p class="tagline">${c.tagline}</p>
    <p>${c.desc}</p>
    <div class="row">
      <button class="btn" id="return">Back to ${top.name}</button>
    </div>
  `);
  document.getElementById("return").onclick = renderResult;
}

/* ---------- Start up ---------- */
function showSaved() {
  isRevealed() ? showReady() : showCountdown();
}

result = loadLocal();
result ? showSaved() : showIntro();

// Rain
(function makeRain() {
  const rain = document.getElementById("rain");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = window.innerWidth < 600 ? 45 : 80;
  for (let i = 0; i < count; i++) {
    const d = document.createElement("span");
    d.className = "drop";
    d.style.left = Math.random() * 100 + "%";
    d.style.animationDuration = (0.7 + Math.random() * 0.6) + "s";
    d.style.animationDelay = (-Math.random() * 2) + "s";
    d.style.opacity = 0.4 + Math.random() * 0.6;
    rain.appendChild(d);
  }
})();
