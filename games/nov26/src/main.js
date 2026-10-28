import { characters, questions, REVEAL_AT, isRevealed, scoreAnswers } from "./quiz.js";

const card = document.getElementById("card");
const STORE_KEY = "cerulean-quiz-result-v1";
let step = -1;
let answers = [];
let result = null;
let timer = null;

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
  const steps = isRevealed()
    ? `<p class="small">The big reveal has happened. Take the quiz to find out who you are.</p>`
    : `<ol class="steps">
        <li>Answer eight quick questions. The rain clears as you go.</li>
        <li>Your match gets sealed. Not even you can peek.</li>
        <li>At book club on <strong>Sunday, November 22, at noon</strong>, everyone opens their phone and reveals together.</li>
      </ol>`;
  render(`
    <p class="eyebrow">Book club · November 2026</p>
    <h1>Which Marsyas Island resident are you?</h1>
    <p class="book">A little game for <cite>The House in the Cerulean Sea</cite> by TJ Klune</p>
    <p class="lede">Linus Baker was sent to the island to judge the children in Arthur Parnassus’s care. Now it’s your turn to be sized up. Find out which resident of the house you’re most like.</p>
    ${steps}
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
  result = scoreAnswers(answers);
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
