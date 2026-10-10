/* =========================================================
   CODE MONSOON - GAME LOGIC & RUNTIME ENGINE
   Skulpt Python Runtime, Evaluation Engine, UI Controller
   ========================================================= */

/* State & Storage */
const KEY = "codeMonsoon.v2";
const fresh = () => ({
  done: [],
  health: 20,
  trust: 20,
  xp: 0,
  code: {},
  choices: {},
  studentName: "Ajinkya Kalyankar"
});

let S = fresh();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) S = Object.assign(fresh(), JSON.parse(raw));
} catch (e) {}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}

const clamp = (v) => Math.max(0, Math.min(100, v));

function hud() {
  const hv = document.getElementById("hv");
  const tv = document.getElementById("tv");
  const hb = document.getElementById("hb");
  const tb = document.getElementById("tb");
  const xp = document.getElementById("xp");
  if (hv) hv.textContent = S.health;
  if (tv) tv.textContent = S.trust;
  if (hb) hb.style.width = S.health + "%";
  if (tb) tb.style.width = S.trust + "%";
  if (xp) xp.innerHTML = `<span class="flame-ico" aria-hidden="true">🔥</span><span class="xp-num">${S.xp}</span><small class="xp-unit">XP</small>`;
}

let view = { screen: "title" };
let DEMO = false;   // Judge demo mode (unlocks all chapters, free solution reveal)
let SND = true;     // Web Audio Sound FX toggle (ON by default for immediate feedback)
let activeFilter = "all";

/* =========================================================
   THEME CONTROLLER (Aesthetic Beige, Studio White & Dark)
   ========================================================= */
const THEMES = [
  { id: "warm-beige", name: "Aesthetic Beige" },
  { id: "clean-white", name: "Studio White" },
  { id: "dark-modern", name: "VS Code Dark" },
  { id: "ocean-blue", name: "Ocean Blue" },
  { id: "cyber-emerald", name: "Cyber Matrix" }
];
let currentTheme = "warm-beige";
try {
  currentTheme = localStorage.getItem("codeMonsoon.theme") || "warm-beige";
} catch (e) {}

function applyTheme(themeId) {
  currentTheme = themeId;
  document.documentElement.setAttribute("data-theme", themeId);
  try { localStorage.setItem("codeMonsoon.theme", themeId); } catch (e) {}
  const btn = document.getElementById("theme-btn");
  if (btn) {
    const t = THEMES.find(x => x.id === themeId);
    btn.textContent = "Theme: " + (t ? t.name : "Aesthetic Beige");
  }
}

function cycleTheme() {
  const idx = THEMES.findIndex(x => x.id === currentTheme);
  const next = THEMES[(idx + 1) % THEMES.length].id;
  applyTheme(next);
  if (SND) beep([520, 680]);
}

// Initial theme application
try { document.documentElement.setAttribute("data-theme", currentTheme); } catch (e) {}

/* =========================================================
   SYNTHESIZED WEB AUDIO (Pure Web Audio API - Zero MP3s needed)
   ========================================================= */
let AC = null;
let rainNode = null;

function initAudio() {
  if (!AC) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) AC = new AudioContextClass();
  }
  if (AC && AC.state === "suspended") {
    AC.resume();
  }
}

// Global user gesture unlock for audio
window.addEventListener("click", () => { initAudio(); }, { once: false });
window.addEventListener("keydown", () => { initAudio(); }, { once: false });

function beep(freqs) {
  if (!SND) return;
  try {
    initAudio();
    if (!AC) return;
    const d = 0.12;
    let t = AC.currentTime;
    freqs.forEach((f, i) => {
      const o = AC.createOscillator();
      const g = AC.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.04, t + i * d);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * d + d);
      o.connect(g);
      g.connect(AC.destination);
      o.start(t + i * d);
      o.stop(t + i * d + d);
    });
  } catch (e) {}
}

/* CELEBRATION SOUND: Triumphant Fanfare Chords + Sparkle Arpeggio */
function playCelebrationSound() {
  if (!SND) return;
  try {
    initAudio();
    if (!AC) return;
    const now = AC.currentTime;

    // Celebratory victory chords (C -> F -> G -> High C Fanfare)
    const chords = [
      { t: 0.00, notes: [261.63, 329.63, 392.00], d: 0.20, vol: 0.08 }, // C major
      { t: 0.18, notes: [349.23, 440.00, 523.25], d: 0.20, vol: 0.09 }, // F major
      { t: 0.36, notes: [392.00, 493.88, 587.33], d: 0.22, vol: 0.09 }, // G major
      { t: 0.54, notes: [523.25, 659.25, 783.99, 1046.50], d: 0.65, vol: 0.12 } // High C victory climax!
    ];

    chords.forEach(ch => {
      ch.notes.forEach(f => {
        const osc = AC.createOscillator();
        const gain = AC.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + ch.t);
        gain.gain.setValueAtTime(ch.vol, now + ch.t);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + ch.t + ch.d);
        osc.connect(gain);
        gain.connect(AC.destination);
        osc.start(now + ch.t);
        osc.stop(now + ch.t + ch.d);
      });
    });

    // Sparkly celebratory chime arpeggio
    const sparkles = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
    sparkles.forEach((f, i) => {
      const osc = AC.createOscillator();
      const gain = AC.createGain();
      osc.type = "sine";
      const startT = now + 0.60 + (i * 0.06);
      osc.frequency.setValueAtTime(f, startT);
      gain.gain.setValueAtTime(0.045, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.40);
      osc.connect(gain);
      gain.connect(AC.destination);
      osc.start(startT);
      osc.stop(startT + 0.40);
    });
  } catch (e) {}
}

/* OPPOSITE SOUND: Descending Retry / Error Buzzer */
function playFailureSound() {
  if (!SND) return;
  try {
    initAudio();
    if (!AC) return;
    const now = AC.currentTime;

    // Distinct descending buzzer notes (240Hz -> 180Hz -> 130Hz)
    const notes = [
      { f: 240, t: 0.00, d: 0.22, vol: 0.09 },
      { f: 180, t: 0.18, d: 0.24, vol: 0.10 },
      { f: 130, t: 0.38, d: 0.42, vol: 0.11 }
    ];

    notes.forEach(n => {
      [0, 4].forEach(detune => {
        const osc = AC.createOscillator();
        const gain = AC.createGain();
        const filter = AC.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(n.f + detune, now + n.t);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(550, now + n.t);
        filter.frequency.exponentialRampToValueAtTime(140, now + n.t + n.d);

        gain.gain.setValueAtTime(n.vol * 0.65, now + n.t);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(AC.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + n.d);
      });
    });
  } catch (e) {}
}

/* PURE JS CANVAS CONFETTI CELEBRATION */
function launchConfetti() {
  try {
    let cv = document.getElementById("confetti-canvas");
    if (!cv) {
      cv = document.createElement("canvas");
      cv.id = "confetti-canvas";
      document.body.appendChild(cv);
    }
    const cx = cv.getContext("2d");
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;

    const colors = ["#ffc21a", "#38bdf8", "#10b981", "#ef4444", "#f43f5e", "#a855f7", "#ffffff"];
    const particles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: cv.width * (0.35 + Math.random() * 0.3),
        y: cv.height * 0.65,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 18 - 8,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10,
        tiltAngle: 0,
        tiltAngleInc: Math.random() * 0.12 + 0.05,
        opacity: 1
      });
    }

    let frame = 0;
    function renderConfetti() {
      cx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      particles.forEach(p => {
        p.vy += 0.45;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.tiltAngle += p.tiltAngleInc;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        if (p.y > cv.height * 0.68) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0 && p.y < cv.height + 25) {
          alive = true;
          cx.save();
          cx.globalAlpha = Math.max(0, p.opacity);
          cx.fillStyle = p.color;
          cx.beginPath();
          cx.rect(p.x, p.y, p.size, p.size * 0.6);
          cx.fill();
          cx.restore();
        }
      });

      if (alive && frame < 180) {
        frame++;
        requestAnimationFrame(renderConfetti);
      } else {
        cx.clearRect(0, 0, cv.width, cv.height);
      }
    }
    requestAnimationFrame(renderConfetti);
  } catch (e) {}
}

function playKeyClick() {
  if (!SND) return;
  try {
    initAudio();
    if (!AC) return;
    const osc = AC.createOscillator();
    const gain = AC.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(450 + Math.random() * 150, AC.currentTime);
    gain.gain.setValueAtTime(0.005, AC.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(AC.destination);
    osc.start();
    osc.stop(AC.currentTime + 0.04);
  } catch (e) {}
}

function playThunder() {
  if (!SND) return;
  try {
    initAudio();
    if (!AC) return;
    const bufferSize = AC.sampleRate * 1.5;
    const buffer = AC.createBuffer(1, bufferSize, AC.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (AC.sampleRate * 0.4));
    }
    const noise = AC.createBufferSource();
    noise.buffer = buffer;
    const filter = AC.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, AC.currentTime);
    const gain = AC.createGain();
    gain.gain.setValueAtTime(0.12, AC.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 1.4);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(AC.destination);
    noise.start();
  } catch (e) {}
}

/* =========================================================
   PYTHON RUNTIME (Skulpt + Dynamic Grading)
   ========================================================= */
const engineOK = () => typeof window.Sk !== "undefined" && window.Sk.misceval;

function setEngine() {
  const el = document.getElementById("engine");
  if (!el) return;
  if (engineOK()) {
    el.className = "engine ok";
    el.lastElementChild.textContent = "Python ready";
  } else {
    el.className = "engine bad";
    el.lastElementChild.textContent = "Python offline";
  }
}

function builtinRead(x) {
  if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined) {
    throw "File not found: '" + x + "'";
  }
  return Sk.builtinFiles.files[x];
}

async function runPython(code, harness) {
  if (!engineOK()) {
    return {
      ok: false,
      out: "",
      err: "The Python engine is not loaded. Please ensure skulpt.min.js and skulpt-stdlib.js are accessible."
    };
  }

  let out = "";
  Sk.configure({
    output: (t) => { out += t; },
    read: builtinRead,
    __future__: Sk.python3,
    execLimit: 4000,
    inputfun: () => ""
  });

  const full = code + (harness ? "\n\nprint('@@TESTS@@')\n" + harness : "");
  const userLines = code.split("\n").length;

  try {
    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, full, true));
    return { ok: true, out };
  } catch (e) {
    let msg = e && e.toString ? e.toString() : String(e);
    const m = msg.match(/on line (\d+)/);
    if (m && +m[1] > userLines) msg = msg.replace(/ on line \d+/, "");
    return { ok: false, out, err: friendly(msg) };
  }
}

function friendly(msg) {
  if (/TimeLimitError|time limit/i.test(msg)) {
    return "BOLT stopped your program after 4 seconds. Is there a loop that never ends? Ensure loop variables change on each cycle.";
  }
  if (/name '___' is not defined/.test(msg)) {
    return "There's still a ___ blank in your code. Replace every ___ with your answer.\n(" + msg + ")";
  }
  if (/NameError: name '(\w+)' is not defined/.test(msg)) {
    const n = msg.match(/name '(\w+)'/)[1];
    return msg + `\nTip: Python doesn't know "${n}". Check spelling, or put quotes around it if it's meant to be text.`;
  }
  if (/IndentationError|expected an indented block/i.test(msg)) {
    return msg + "\nTip: lines inside an if, for, while or def block must be indented by 4 spaces.";
  }
  if (/SyntaxError/.test(msg)) {
    return msg + "\nTip: check for a missing colon (:), matching brackets or quotation marks on that line.";
  }
  return msg;
}

function harnessFor(items) {
  const lines = [
    "def __t(i, fn):",
    "    try:",
    "        ok = bool(fn())",
    "    except Exception as e:",
    "        ok = False",
    "    print('@@T|' + str(i) + '|' + ('PASS' if ok else 'FAIL'))"
  ];
  items.forEach(([t, i]) => {
    if (t.py) lines.push(`__t(${i}, lambda: (${t.py}))`);
  });
  return lines.join("\n");
}

async function execGroup(code, items) {
  const withPy = items.filter(([t]) => t.py);
  const r = await runPython(code, withPy.length ? harnessFor(withPy) : "");
  const [userOut, testOut = ""] = r.out.split("@@TESTS@@\n");
  const pyRes = {};
  testOut.split("\n").forEach(l => {
    const m = l.match(/^@@T\|(\d+)\|(PASS|FAIL)/);
    if (m) pyRes[m[1]] = (m[2] === "PASS");
  });
  const o = {
    text: userOut,
    lines: userOut.replace(/\n$/, "").split("\n").map(s => s.replace(/\s+$/, "")).filter((l, i, a) => !(l === "" && i === a.length - 1))
  };
  const results = items.map(([t, i]) => {
    if (!r.ok) return false;
    if (t.py) return !!pyRes[i];
    if (typeof t.js === "function") {
      try { return !!t.js(o, code); } catch (e) { return false; }
    }
    return false;
  });
  return { r, o, results };
}

async function evaluate(ch, code) {
  const tests = ch.mission.tests;
  const out = new Array(tests.length).fill(false);
  const groups = new Map();
  tests.forEach((t, i) => {
    const k = t.variant || null;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push([t, i]);
  });
  const baseItems = groups.get(null) || [];
  const base = await execGroup(code, baseItems);
  baseItems.forEach(([t, i], k) => { out[i] = base.results[k]; });

  let variantMissing = false;
  if (base.r.ok) {
    for (const [k, items] of groups) {
      if (k === null) continue;
      const vcode = code.replace(k.find, k.repl);
      if (vcode === code) { variantMissing = true; continue; }
      const vr = await execGroup(vcode, items);
      items.forEach(([t, i], j) => { out[i] = vr.results[j]; });
    }
  }
  return { ok: base.r.ok, err: base.r.err, out: base.o.text, results: out, o: base.o, variantMissing };
}

/* =========================================================
   SYNTAX HIGHLIGHTING & HELPERS
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function hl(code) {
  return code.split("\n").map(line => {
    let out = "";
    const re = /(#.*$)|(f?"[^"]*"|f?'[^']*')|(\b\d+\b)|(\b(?:def|return|if|elif|else|for|in|while|and|or|not|True|False|None)\b)|(\b(?:print|range|len|max|min|sum|int|str)\b)/g;
    let last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const cls = m[1] ? "c" : m[2] ? "s" : m[3] ? "n" : m[4] ? "k" : "f";
      out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  }).join("\n");
}

function sayHTML(who, text, right) {
  const cls = who === "bolt" ? "bolt" : (who === "gridlock" ? "grid" : (who === "gridfix" ? "grid fixed" : ""));
  return `<div class="say${right ? " right" : ""}"><div class="ava">${avatar(who)}</div><div class="bubble ${cls}"><b>${esc(NAMES[who] || who)}</b>${esc(text)}</div></div>`;
}

function panelHTML(p, n) {
  return `<article class="panel${p.wide ? " wide" : ""}"><span class="pn">${n}</span><div class="art">${scene(p.scene)}</div><div class="words">${p.cap ? `<div class="caption">${esc(p.cap)}</div>` : ""}${(p.say || []).map(([w, t], i) => sayHTML(w, t, i % 2 === 1)).join("")}</div></article>`;
}

function stepsHTML(ch, phase) {
  const list = ["Story"].concat(ch.choice ? ["Choice"] : []).concat(["Manual", "Mission", "Debrief"]);
  const map = { story: "Story", choice: "Choice", lesson: "Manual", mission: "Mission", win: "Debrief" };
  const cur = list.indexOf(map[phase]);
  return `<div class="steps" aria-label="Chapter steps">${list.map((s, i) => `<span class="${i === cur ? "on" : (i < cur ? "past" : "")}">${s}</span>`).join("")}</div>`;
}

function chHead(ch, idx, phase) {
  const label = ch.boss ? "Boss chapter" : (ch.category === "expansion" ? `Expansion ${idx - 5}` : `Chapter ${idx + 1}`);
  return `<div class="ch-head"><div><div class="eyebrow">${label} · ${esc(ch.concept)}</div><h2>${esc(ch.title)}</h2></div>${stepsHTML(ch, phase)}</div>`;
}

function downloadCode(filename, content) {
  const blob = new Blob([content], { type: "text/x-python;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function go(v) {
  if (view.screen === "simulator" && v.screen !== "simulator") {
    if (typeof simInterval !== "undefined" && simInterval) {
      clearInterval(simInterval);
      simInterval = null;
    }
  }
  view = v;
  render();
  window.scrollTo(0, 0);
}

/* =========================================================
   SCREENS
   ========================================================= */
function render() {
  hud();
  const app = $("#app");
  if (view.screen === "title") return renderTitle(app);
  if (view.screen === "map") return renderMap(app);
  if (view.screen === "finale") return renderFinale(app);
  if (view.screen === "simulator") return renderSimulator(app);

  const idx = CHAPTERS.findIndex(c => c.id === view.id);
  const ch = CHAPTERS[idx];
  if (!ch) return go({ screen: "map" });

  if (view.phase === "story") return renderStory(app, ch, idx);
  if (view.phase === "choice") return renderChoice(app, ch, idx);
  if (view.phase === "lesson") return renderLesson(app, ch, idx);
  if (view.phase === "mission") return renderMission(app, ch, idx);
  if (view.phase === "win") return renderWin(app, ch, idx);
}

function renderTitle(app) {
  const started = S.done.length > 0;
  app.innerHTML = `<section class="hero">
    <div>
      <h1>Code<span>Monsoon</span></h1>
      <p class="dek">Shantipur is flooding, and the robot that could save it only understands Python. Learn the language one chapter at a time, and fix the system that let the drains fail.</p>
      <div class="meta">
        <span class="chip">Learn Python · Beginner</span>
        <span class="chip">8 Chapters + Boss</span>
        <span class="chip">~40 minutes</span>
        <span class="chip sdg">SDG 4 · 6 · 11 · 12 · 13 · 16</span>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <button class="btn" id="start">${started ? "Continue Adventure ▸" : "Start Adventure ▸"}</button>
        <button class="btn small manual-btn" id="btn-hero-manual">📖 User Manual</button>
        ${started ? `<button class="linkbtn" id="reset">Start over</button>` : ""}
      </div>
    </div>
    <div class="hero-art">${scene("boltOn")}</div>
  </section>
  <div id="confirm"></div>`;

  $("#start").onclick = () => go(started ? { screen: "map" } : { screen: "chapter", id: "c1", phase: "story", n: 1 });
  $("#btn-hero-manual").onclick = () => openUserManualModal();

  const r = $("#reset");
  if (r) r.onclick = () => {
    $("#confirm").innerHTML = `<div class="choice"><h3>Start over?</h3><p>This clears your chapters, XP and saved code on this device.</p><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn small" id="yes">Clear progress</button><button class="btn small ghost" id="no">Keep playing</button></div></div>`;
    $("#yes").onclick = () => { S = fresh(); save(); go({ screen: "title" }); };
    $("#no").onclick = () => { $("#confirm").innerHTML = ""; };
  };
}

function unlocked(i) {
  if (DEMO || i === 0) return true;
  return S.done.includes(CHAPTERS[i - 1].id);
}

function floodLabel() {
  const h = S.health;
  return h < 35 ? "FLOODED" : (h < 60 ? "WATER RECEDING" : (h < 80 ? "MOSTLY DRY" : "DRY STREETS"));
}

function renderMap(app) {
  const allCampaignDone = DEMO || CHAPTERS.filter(c => c.category === "campaign").every(c => S.done.includes(c.id));
  const filteredChapters = CHAPTERS.filter(c => {
    if (activeFilter === "campaign") return c.category === "campaign";
    if (activeFilter === "expansion") return c.category === "expansion";
    return true;
  });

  app.innerHTML = `<div class="maphead">
    <div class="mh-art">
      <div class="citywrap" role="img" aria-label="Shantipur skyline: ${floodLabel()}">${scene("cityLive")}</div>
      <div class="floodtag">${floodLabel()}</div>
    </div>
  </div>

  <h2 class="sect-h">Shantipur East · Ward 14</h2>
  <p class="sect-sub">Each chapter teaches one Python concept and fixes one part of the city. Complete a chapter to unlock the next.</p>
  
  <div class="map-filters">
    <button class="filter-btn ${activeFilter === "all" ? "active" : ""}" data-f="all">All Drains (${CHAPTERS.length})</button>
    <button class="filter-btn ${activeFilter === "campaign" ? "active" : ""}" data-f="campaign">Story Campaign (1-6)</button>
    <button class="filter-btn ${activeFilter === "expansion" ? "active" : ""}" data-f="expansion">Ward 14 Expansions (7-8)</button>
  </div>

  <div class="ward">${filteredChapters.map((c) => {
    const origIdx = CHAPTERS.findIndex(item => item.id === c.id);
    const done = S.done.includes(c.id);
    const open = unlocked(origIdx);
    const st = done ? "Fixed ✓" : (!open ? "Locked 🔒" : (c.boss ? "Boss ⚠️" : (c.category === "expansion" ? "Bonus ⚡" : "Start ▶")));
    return `<div class="node ${done ? "done" : (open ? (c.boss ? "boss" : (c.category === "expansion" ? "expansion" : "open")) : "")}" data-id="${c.id}" ${open ? "" : "disabled"} role="article" aria-label="${esc(c.title)}, ${st}">
      <span class="state">${st}</span>
      <div class="thumb" style="cursor:pointer" data-id="${c.id}">${scene(c.thumb)}</div>
      <div class="nb" style="cursor:pointer" data-id="${c.id}">
        <span class="num">${c.boss ? "BOSS" : (c.category === "expansion" ? "EXPANSION" : "CHAPTER " + (origIdx + 1))}</span>
        <h3>${esc(c.title)}</h3>
        <span class="concept">${esc(c.concept)}</span>
      </div>
      ${done ? `<div class="node-sub-actions">
        <button class="node-sub-btn replay-sub" data-replay="${c.id}" title="Replay Chapter">🔄 Replay</button>
        <button class="node-sub-btn manual-sub" data-manual="${c.id}" title="Read Concept Manual">📖 Manual</button>
      </div>` : `<div style="padding:0 14px 12px"><button class="btn small ${open ? "" : "ghost"}" style="width:100%" data-open="${c.id}" ${open ? "" : "disabled"}>${open ? (origIdx === 0 && !done ? "Start Chapter ▸" : "Open Mission ▸") : "Locked 🔒"}</button></div>`}
    </div>`;
  }).join("")}</div>

  <div class="map-foot">
    ${allCampaignDone ? `<button class="btn" id="fin">Epilogue: Fix the System ▸</button>` : `<span class="sect-sub" style="margin:0">Epilogue unlocks after defeating Boss GRIDLOCK.</span>`}
    <button class="btn small manual-btn" id="map-manual">📖 Python User Manual</button>
    <button class="btn small replay" id="map-sim">🌧️ Flood Simulator</button>
    <button class="btn small ghost" id="map-telem">Live Telemetry</button>
  </div>`;

  app.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => { activeFilter = btn.dataset.f; renderMap(app); };
  });

  // Clicking thumbnail or card body opens/replays
  app.querySelectorAll(".node .thumb, .node .nb").forEach(el => {
    el.onclick = () => {
      const cid = el.dataset.id;
      const idx = CHAPTERS.findIndex(x => x.id === cid);
      if (unlocked(idx)) {
        if (SND) beep([500, 650]);
        go({ screen: "chapter", id: cid, phase: "story", n: 1 });
      }
    };
  });

  // Replay sub-button
  app.querySelectorAll(".replay-sub").forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      const cid = b.dataset.replay;
      if (SND) beep([440, 580]);
      go({ screen: "chapter", id: cid, phase: "story", n: 1 });
    };
  });

  // Manual sub-button
  app.querySelectorAll(".manual-sub").forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      openUserManualModal(b.dataset.manual);
    };
  });

  // Open button for incomplete unlocked chapters
  app.querySelectorAll("button[data-open]").forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      const cid = b.dataset.open;
      const idx = CHAPTERS.findIndex(x => x.id === cid);
      if (unlocked(idx)) {
        if (SND) beep([520, 680]);
        go({ screen: "chapter", id: cid, phase: "story", n: 1 });
      }
    };
  });

  const f = $("#fin");
  if (f) f.onclick = () => go({ screen: "finale", n: 1 });
  const mm = $("#map-manual");
  if (mm) mm.onclick = () => openUserManualModal();
  const ms = $("#map-sim");
  if (ms) ms.onclick = () => go({ screen: "simulator" });
  const mt = $("#map-telem");
  if (mt) mt.onclick = openTelemetryModal;
}

function renderStory(app, ch, idx) {
  const n = view.n, total = ch.panels.length;
  app.innerHTML = chHead(ch, idx, "story") + `<div class="comic">${ch.panels.slice(0, n).map((p, i) => panelHTML(p, i + 1)).join("")}</div>
    <div class="ctrl">
      <span class="count">Panel ${n} of ${total}</span>
      <button class="btn small ghost" id="map">Ward map</button>
      <button class="btn" id="next">${n < total ? "Next panel ▸" : (ch.choice ? "Your move ▸" : "Open BOLT's manual ▸")}</button>
    </div>`;

  $("#map").onclick = () => go({ screen: "map" });
  $("#next").onclick = () => {
    if (n < total) {
      view.n++;
      render();
      const ps = app.querySelectorAll(".panel");
      if (ps.length) ps[ps.length - 1].scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      go({ screen: "chapter", id: ch.id, phase: ch.choice ? "choice" : "lesson" });
    }
  };
}

function renderChoice(app, ch, idx) {
  const picked = S.choices[ch.id];
  const c = ch.choice;
  let html = chHead(ch, idx, "choice") + `<div class="comic">${panelHTML(ch.panels[ch.panels.length - 1], ch.panels.length)}</div>`;
  html += `<section class="choice"><h3>${esc(c.prompt)}</h3><p>What Meera says changes how much the community trusts her.</p>`;
  if (picked === undefined) {
    html += `<div class="opts">${c.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.text)}</button>`).join("")}</div>`;
  } else {
    const o = c.options[picked];
    html += `<div class="result"><span class="delta ${o.trust >= 0 ? "up" : "down"}">Trust ${o.trust >= 0 ? "+" : ""}${o.trust}</span>${sayHTML("meera", o.text.replace(/^"|"$/g, ""))}${sayHTML(o.reply[0], o.reply[1], true)}</div>`;
  }
  html += `</section>`;
  if (picked !== undefined) {
    html += `<div class="comic" style="margin-top:22px">${panelHTML(c.after, ch.panels.length + 1)}</div><div class="ctrl"><button class="btn" id="next">Open BOLT's manual ▸</button></div>`;
  }
  app.innerHTML = html;

  app.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    S.choices[ch.id] = i;
    S.trust = clamp(S.trust + c.options[i].trust);
    save();
    render();
  });
  const nx = $("#next");
  if (nx) nx.onclick = () => go({ screen: "chapter", id: ch.id, phase: "lesson" });
}

function renderLesson(app, ch, idx) {
  const L = ch.lesson;
  app.innerHTML = chHead(ch, idx, "lesson") + `<div class="manual">
    <div class="manual-card"><div class="eyebrow">${esc(L.eyebrow)}</div><h3>${esc(L.title)}</h3>${L.body}</div>
    <div class="vscode-ide-container" style="box-shadow:none">
      <div class="vscode-titlebar" style="padding:6px 12px">
        <div class="vscode-window-dots">
          <span class="vsc-dot vsc-close"></span>
          <span class="vsc-dot vsc-min"></span>
          <span class="vsc-dot vsc-max"></span>
        </div>
        <div class="vscode-title-center">
          <span class="vscode-badge">VS CODE PYTHON IDE</span>
          <span class="vscode-subtitle">example_${ch.id}.py</span>
        </div>
        <span class="vscode-engine-badge"><span class="engine-dot"></span> Python 3.12</span>
      </div>
      <pre class="code" style="background:#1e1e1e;margin:0">${hl(L.code)}</pre>
      <div class="out-lbl" style="background:#181818;border-top:1px solid #2b2b2b;padding:6px 14px">BOLT Terminal Output</div>
      <pre class="out" style="background:#141414;color:#4ade80;margin:0;padding:8px 16px">${esc(L.out)}</pre>
    </div>
  </div><div class="ctrl"><button class="btn small ghost" id="back">Back to story</button><button class="btn" id="next">Start the mission ▸</button></div>`;

  $("#back").onclick = () => go({ screen: "chapter", id: ch.id, phase: "story", n: ch.panels.length });
  $("#next").onclick = () => go({ screen: "chapter", id: ch.id, phase: "mission" });
}

function wireEditor(ta, gutter, onRun, onChange) {
  const sync = () => {
    const n = ta.value.split("\n").length;
    gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    gutter.scrollTop = ta.scrollTop;
  };
  const updateCursorPos = () => {
    const s = ta.selectionStart;
    const lines = ta.value.slice(0, s).split("\n");
    const row = lines.length;
    const col = lines[lines.length - 1].length + 1;
    const el = document.getElementById("ed-line-col");
    if (el) el.textContent = `Ln ${row}, Col ${col}`;
  };
  ta.addEventListener("input", () => {
    sync();
    updateCursorPos();
    playKeyClick();
    onChange && onChange(ta.value);
  });
  ta.addEventListener("keyup", updateCursorPos);
  ta.addEventListener("click", updateCursorPos);
  ta.addEventListener("scroll", () => { gutter.scrollTop = ta.scrollTop; });
  ta.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onRun();
      return;
    }
    const s = ta.selectionStart, en = ta.selectionEnd, v = ta.value;
    if (e.key === "Tab") {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1;
      if (e.shiftKey) {
        const lead = v.slice(ls).match(/^ {1,4}/);
        if (lead) {
          ta.value = v.slice(0, ls) + v.slice(ls + lead[0].length);
          ta.selectionStart = ta.selectionEnd = Math.max(ls, s - lead[0].length);
        }
      } else {
        ta.value = v.slice(0, s) + "    " + v.slice(en);
        ta.selectionStart = ta.selectionEnd = s + 4;
      }
      ta.dispatchEvent(new Event("input"));
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const ls = v.lastIndexOf("\n", s - 1) + 1, line = v.slice(ls, s);
      let ind = line.match(/^ */)[0];
      if (/:\s*(#.*)?$/.test(line)) ind += "    ";
      ta.value = v.slice(0, s) + "\n" + ind + v.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 1 + ind.length;
      ta.dispatchEvent(new Event("input"));
    }
  });
  sync();
  updateCursorPos();
}

function renderMission(app, ch, idx) {
  const M = ch.mission;
  const st = view.ms || (view.ms = { runs: 0, hints: 0, fails: 0, results: null, solved: S.done.includes(ch.id) });
  const code = S.code[ch.id] ?? M.starter;
  const bossHTML = M.boss ? `<div class="boss" id="boss"><span class="bn">GRIDLOCK</span><div class="hp" id="hp">${M.tests.map(() => `<span></span>`).join("")}</div><div class="lies" id="lies">${M.lies.map(l => `<span>${l.label}</span>`).join("")}</div></div>` : "";
  const binsHTML = M.bins ? `<div class="bins-grid" role="region" aria-label="Waste sorting categories">
    <div class="bin-item bin-red">
      <div class="bin-header"><span class="bin-badge red">🔴 RED BIN</span><span class="bin-type">Hazardous</span></div>
      <div class="bin-body">battery, medicine strip</div>
    </div>
    <div class="bin-item bin-green">
      <div class="bin-header"><span class="bin-badge green">🟢 GREEN BIN</span><span class="bin-type">Wet Waste</span></div>
      <div class="bin-body">banana peel, tea leaves, vegetable peels</div>
    </div>
    <div class="bin-item bin-blue">
      <div class="bin-header"><span class="bin-badge blue">🔵 BLUE BIN</span><span class="bin-type">Dry Waste</span></div>
      <div class="bin-body">everything else (plastic bottles, milk packet, etc.)</div>
    </div>
  </div>` : "";

  app.innerHTML = chHead(ch, idx, "mission") + bossHTML + `<div class="mission">
    <div class="mission-sidebar">
      <div class="brief">
        <div class="eyebrow">Mission Objectives</div>
        <h3>${esc(M.title)}</h3>
        <p>${M.brief}</p>
        ${binsHTML}
        ${M.expect ? `<pre>${esc(M.expect)}</pre>` : ""}
      </div>
      <div id="viz"></div>
      <div class="checks">
        <h4>BOLT's Test Checks</h4>
        <ul id="checks">${M.tests.map(t => `<li><i>·</i><span>${esc(t.label)}</span></li>`).join("")}</ul>
        <div class="feedback" id="fb"></div>
        <div class="next-action-card" id="next-action-card" style="display:none"></div>
      </div>
      <div class="hints">
        <h4>Mission Hints</h4>
        <ol id="hl"></ol>
        <div class="row">
          <button class="btn small ghost" id="hint">Show a hint</button>
          <span class="cost">15 XP</span>
          <button class="linkbtn" id="sol" hidden>Show solution</button>
        </div>
      </div>
      <div id="next"></div>
    </div>

    <!-- Authentic VS Code Python IDE Interface -->
    <div class="vscode-ide-container">
      <div class="vscode-titlebar">
        <div class="vscode-window-dots">
          <span class="vsc-dot vsc-close"></span>
          <span class="vsc-dot vsc-min"></span>
          <span class="vsc-dot vsc-max"></span>
        </div>
        <div class="vscode-title-center">
          <svg class="vscode-logo-svg" viewBox="0 0 24 24" width="16" height="16">
            <path fill="#007acc" d="M17.5 2.5L7.2 10.4 3.4 7.5 1 8.8l3.6 3.2L1 15.2l2.4 1.3 3.8-2.9 10.3 7.9 4.5-2.2V4.7z"/>
            <path fill="#0065a9" d="M17.5 6.6L9.6 12.7l7.9 6.1z"/>
          </svg>
          <span class="vscode-badge">VS CODE PYTHON IDE</span>
          <span class="vscode-subtitle">bolt_${ch.id}.py — Shantipur Civic Project</span>
        </div>
        <div class="vscode-engine-badge">
          <span class="engine-dot"></span> Python 3.12 (In-Browser Skulpt Compiler)
        </div>
      </div>

      <div class="vscode-tabbar">
        <div class="vscode-tabs">
          <div class="vscode-tab active">
            <svg class="py-icon" viewBox="0 0 24 24" width="13" height="13">
              <path fill="#387eb8" d="M11.9 2c-3.1 0-4.9 1.4-4.9 3.4v2.5h5v.8H5.8C3.8 8.7 2 10.3 2 13.1c0 2.9 1.6 4.3 3.8 4.3h1.6v-2.3c0-2.3 2-4.1 4.3-4.1h4.9v-1.6c0-2.3-1.9-4.2-4.7-4.2zm-2.4 1.8c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"/>
              <path fill="#ffe052" d="M12.1 22c3.1 0 4.9-1.4 4.9-3.4v-2.5h-5v-.8h6.2c2 0 3.8-1.6 3.8-4.4 0-2.9-1.6-4.3-3.8-4.3h-1.6v2.3c0 2.3-2 4.1-4.3 4.1h-4.9v1.6c0 2.3 1.9 4.2 4.7 4.2zm2.4-1.8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
            </svg>
            <span class="vscode-tab-title">bolt_${ch.id}.py</span>
            <span class="vscode-mod-dot">●</span>
          </div>
        </div>
        <div class="vscode-tab-actions">
          <button class="vscode-next-banner-btn" id="go-vsc-btn" style="display:none" title="Proceed to next chapter">
            🎉 Next Chapter ▸
          </button>
          <button class="vscode-run-btn" id="run" title="Run Python Code (Ctrl+Enter)">
            <span class="run-icon">▶</span> Run Code
          </button>
          <button class="vscode-btn-ghost" id="reset" title="Reset starter code">↺ Reset</button>
          <button class="vscode-btn-ghost" id="dl-py" title="Download Python script">📥 .py</button>
        </div>
      </div>

      <div class="vscode-breadcrumb">
        <span>workspace</span> › <span>shantipur_ward14</span> › <span>missions</span> › <span class="active-file">bolt_${ch.id}.py</span>
        <span class="vscode-shortcut-hint">Shortcuts: <b>Ctrl + Enter</b> runs · <b>Tab</b> indents 4 spaces</span>
      </div>

      <div class="editor vscode-editor">
        <div class="gutter" id="gut" aria-hidden="true"></div>
        <textarea class="ed" id="ed" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="VS Code Python editor">${esc(code)}</textarea>
      </div>

      <div class="vscode-statusbar">
        <div class="vsc-status-left">
          <span class="vsc-status-item vsc-lang">⚡ Python 3.12 (Skulpt WebEngine)</span>
          <span class="vsc-status-item" id="ed-line-col">Ln 1, Col 1</span>
          <span class="vsc-status-item">UTF-8</span>
          <span class="vsc-status-item">Spaces: 4</span>
        </div>
        <div class="vsc-status-right">
          <span class="vsc-status-item" id="vsc-pylance">Pylance: Ready ✓</span>
          <span class="vsc-status-item vsc-test-stat" id="vsc-tests-status">${st.solved ? "Checks: Passed ✓" : "Checks: Pending"}</span>
        </div>
      </div>

      <div class="vscode-terminal-panel">
        <div class="vscode-terminal-tabs">
          <span class="vsc-term-tab active">TERMINAL</span>
          <span class="vsc-term-tab">OUTPUT</span>
          <span class="vsc-term-tab">PROBLEMS</span>
          <span class="vsc-term-tab">BOLT DEBUGGER</span>
          <div class="vsc-term-actions">
            <button class="vsc-term-clear" id="btn-clear-term" title="Clear Terminal">⊘ Clear Terminal</button>
          </div>
        </div>
        <div class="vscode-terminal-body">
          <div class="vscode-term-prompt">bolt@shantipur-ward14:~$ python3 bolt_${ch.id}.py</div>
          <pre class="out" id="out" aria-live="polite">Press "Run Code" or Ctrl+Enter to execute in VS Code Python IDE.</pre>
        </div>
      </div>
    </div>
  </div>`;

  const ta = $("#ed");
  wireEditor(ta, $("#gut"), () => run(), (v) => {
    S.code[ch.id] = v;
    save();
    if (M.boss) {
      const gone = !/def\s+drain_report\s*\(/.test(v);
      const fb = $("#fb");
      if (gone) {
        fb.textContent = "WARNING: GRIDLOCK controls all municipal floodgates. Deleting drain_report jams them shut. Repair the function; do not delete it.";
        st.warned = true;
      } else if (st.warned) {
        fb.textContent = "";
        st.warned = false;
      }
    }
  });

  $("#dl-py").onclick = () => downloadCode(`bolt_${ch.id}.py`, ta.value);

  const clearBtn = $("#btn-clear-term");
  if (clearBtn) {
    clearBtn.onclick = () => {
      $("#out").innerHTML = "(Terminal output cleared.)";
    };
  }

  const drawHints = () => {
    $("#hl").innerHTML = M.hints.slice(0, st.hints).map(h => `<li>${esc(h)}</li>`).join("");
    $("#hint").disabled = st.hints >= M.hints.length;
    $("#sol").hidden = !(st.fails >= 2 || st.hints >= M.hints.length || DEMO) || st.solved;
  };
  drawHints();

  $("#hint").onclick = () => {
    if (st.hints < M.hints.length) {
      st.hints++;
      drawHints();
    }
  };

  $("#sol").onclick = () => {
    ta.value = M.solution;
    ta.dispatchEvent(new Event("input"));
    st.usedSolution = true;
    $("#fb").textContent = "Solution loaded. Inspect line by line, then press Run.";
  };

  $("#reset").onclick = () => {
    ta.value = M.starter;
    ta.dispatchEvent(new Event("input"));
  };

  $("#run").onclick = () => run();

  const updateBoss = (results) => {
    if (!M.boss) return;
    const hp = $("#hp").children;
    results.forEach((ok, i) => hp[i].classList.toggle("down", !!ok));
    const lies = $("#lies").children;
    M.lies.forEach((l, i) => {
      const f = l.fixed(ta.value);
      lies[i].classList.toggle("fixed", f);
      lies[i].textContent = f ? l.label + " ✓" : l.label;
    });
    $("#boss").classList.toggle("beaten", results.every(Boolean));
  };

  const showResults = (res) => {
    const lis = $("#checks").children;
    if (M.viz) $("#viz").innerHTML = M.viz(res.o, res.results);
    res.results.forEach((ok, i) => {
      lis[i].className = ok ? "pass" : "fail";
      lis[i].firstElementChild.textContent = ok ? "✓" : "✗";
    });
    updateBoss(res.results);
  };

  if (st.last) {
    $("#out").innerHTML = st.last.html;
    showResults(st.last.res);
  } else if (M.viz) {
    $("#viz").innerHTML = M.viz({ lines: [] }, null);
  }

  if (st.solved) showNext();

  async function run() {
    const btn = $("#run");
    btn.disabled = true;
    btn.textContent = "Running…";
    const res = await evaluate(ch, ta.value);
    btn.disabled = false;
    btn.textContent = "Run Code";
    st.runs++;

    let html = esc(res.out || "");
    if (!res.ok) html += `<span class="err">${esc(res.err)}</span>`;
    if (!html) html = "(BOLT ran your code. Nothing was printed.)";
    $("#out").innerHTML = html;
    showResults(res);
    st.last = { html, res };

    const all = res.results.every(Boolean);
    const fb = $("#fb");
    const vscTestsStatus = $("#vsc-tests-status");

    if (all) {
      fb.textContent = "All checks passed! Shantipur drain network responds.";
      if (vscTestsStatus) {
        vscTestsStatus.textContent = "All Checks Passed ✓";
        vscTestsStatus.style.background = "var(--leaf)";
        vscTestsStatus.style.color = "#000";
      }
      playCelebrationSound();
      launchConfetti();
      if (!st.solved) {
        st.solved = true;
        if (!S.done.includes(ch.id)) {
          const xp = st.usedSolution ? 40 : Math.max(50, 100 - st.hints * 15);
          S.done.push(ch.id);
          S.xp += xp;
          S.health = clamp(S.health + ch.reward.health);
          S.trust = clamp(S.trust + ch.reward.trust);
          st.earned = xp;
          save();
          hud();
        }
      }
      showNext();
    } else {
      st.fails++;
      if (vscTestsStatus) {
        vscTestsStatus.textContent = "Checks Failed ✗";
        vscTestsStatus.style.background = "var(--alarm)";
        vscTestsStatus.style.color = "#fff";
      }
      playFailureSound();
      const tip = (res.variantMissing && "Keep BOLT's data lines intact: BOLT re-tests your code with dynamic numbers.") ||
        (M.advise && M.advise(res.o, ta.value)) ||
        (!res.ok ? "Read the red error message: it indicates the exact line where execution stopped." : "Not quite. Compare output with the expected format, then try again.");
      fb.textContent = tip;
      if (M.boss) {
        $("#boss").classList.remove("shake");
        void $("#boss").offsetWidth;
        $("#boss").classList.add("shake");
      }
      drawHints();
    }
  }

  function showNext() {
    const nextBtnText = ch.boss ? "Finish the fight ▸" : "See what happens ▸";
    const nextBtnFull = `🎉 All Checks Passed! ${nextBtnText}`;

    // 1. Unmissable Action Banner directly inside Checks
    const card = $("#next-action-card");
    if (card) {
      card.style.display = "block";
      card.innerHTML = `<button class="btn big-next-btn pulse-glow" id="go-card">${nextBtnFull}</button>`;
      $("#go-card").onclick = () => go({ screen: "chapter", id: ch.id, phase: "win", earned: st.earned });
      try { card.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch (e) {}
    }

    // 2. Action Button in VS Code Tab Actions
    const vscNext = $("#go-vsc-btn");
    if (vscNext) {
      vscNext.style.display = "inline-flex";
      vscNext.textContent = `🎉 Next Chapter ▸`;
      vscNext.onclick = () => go({ screen: "chapter", id: ch.id, phase: "win", earned: st.earned });
    }

    // 3. Status Bar Action
    const vscTestStat = $("#vsc-tests-status");
    if (vscTestStat) {
      vscTestStat.style.cursor = "pointer";
      vscTestStat.title = "Click to continue to next chapter";
      vscTestStat.innerHTML = `All Checks Passed ✓ <strong style="text-decoration:underline">Next ▸</strong>`;
      vscTestStat.onclick = () => go({ screen: "chapter", id: ch.id, phase: "win", earned: st.earned });
    }
    
    $("#sol").hidden = true;
  }
}

function renderWin(app, ch, idx) {
  const nextCh = CHAPTERS[idx + 1];
  const w = ch.win;
  app.innerHTML = chHead(ch, idx, "win") + `<div class="stamp">${ch.boss ? "System Repaired" : "Mission Complete"}</div>
    <div class="comic">${panelHTML(Object.assign({ wide: true }, w), ch.panels.length + (ch.choice ? 2 : 1))}</div>
    <div class="rewards">
      <span>City health +${ch.reward.health}</span>
      <span>Trust +${ch.reward.trust}</span>
      ${view.earned ? `<span>+${view.earned} XP</span>` : ""}
      <span>Learned: ${esc(ch.concept)}</span>
    </div>
    <div class="win-action-grid">
      ${nextCh ? `<button class="btn big-next-btn pulse-glow" id="win-next">Continue to ${esc(nextCh.title)} ▸</button>` : `<button class="btn big-next-btn pulse-glow" id="win-next">Epilogue: Fix the System ▸</button>`}
      <div class="win-secondary-btns">
        <button class="btn small replay" id="win-replay" title="Replay this chapter from the beginning">🔄 Replay Chapter</button>
        <button class="btn small manual-btn" id="win-manual" title="Open Python User Manual for this concept">📖 Learn User Manual</button>
        <button class="btn small ghost" id="win-map">🗺️ Ward Map</button>
      </div>
    </div>`;

  $("#win-replay").onclick = () => {
    if (SND) beep([440, 580]);
    go({ screen: "chapter", id: ch.id, phase: "story", n: 1 });
  };
  $("#win-manual").onclick = () => {
    if (SND) beep([520, 680]);
    openUserManualModal(ch.id);
  };
  $("#win-next").onclick = () => {
    if (SND) beep([520, 680, 880]);
    nextCh ? go({ screen: "chapter", id: nextCh.id, phase: "story", n: 1 }) : go({ screen: "finale", n: 1 });
  };
  $("#win-map").onclick = () => go({ screen: "map" });
}

function renderFinale(app) {
  const n = view.n, total = FINALE.length;
  let html = `<div class="ch-head"><div><div class="eyebrow">Epilogue</div><h2>Fix the System</h2></div></div>
    <div class="comic">${finalePanels().slice(0, n).map((p, i) => panelHTML(p, i + 1)).join("")}</div>`;

  if (n < total) {
    html += `<div class="ctrl"><span class="count">Panel ${n} of ${total}</span><button class="btn" id="next">Next panel ▸</button></div>`;
  } else {
    html += `<div class="tagline">Don't just clean up the problem. Fix the system.</div>
    <section class="cert" id="printable-cert">
      <div>
        <div class="eyebrow" style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;color:#3c6f96;font-weight:700">Shantipur East · Ward 14 Transit Board</div>
        <h3>Python Apprentice</h3>
        <p style="margin:4px 0 8px;max-width:54ch">This certifies that the candidate has mastered core Python fundamentals to hold municipal systems accountable.</p>
        <label style="font-size:12px;text-transform:uppercase;font-weight:700;color:#555;">Candidate Name:</label>
        <input type="text" id="cert-name" class="cert-name-input" value="${esc(S.studentName || "Ajinkya Kalyankar")}" aria-label="Candidate Name"/>
        <div class="skills">${CHAPTERS.map(c => `<span>${esc(c.concept)}</span>`).join("")}</div>
        <div class="cert-seal">
          <span>Official Verification: WARD14-SDG-2026</span>
          <button class="btn small ghost" id="btn-print-cert">Print / Save Certificate</button>
        </div>
      </div>
      <div class="stats">
        <div><b>${S.health}</b><small>City Health</small></div>
        <div><b>${S.trust}</b><small>Trust</small></div>
        <div><b>${S.xp}</b><small>Total XP</small></div>
      </div>
    </section>
    
    <section class="sandbox">
      <h2 class="sect-h">BOLT's Sandbox</h2>
      <p class="sect-sub">Free play terminal. Write any Python you like and run it. Try modeling a municipal floodgate sensor function!</p>
      <div class="manual">
        <div class="vscode-ide-container" style="box-shadow:none">
          <div class="vscode-titlebar" style="padding:6px 12px">
            <div class="vscode-window-dots">
              <span class="vsc-dot vsc-close"></span>
              <span class="vsc-dot vsc-min"></span>
              <span class="vsc-dot vsc-max"></span>
            </div>
            <div class="vscode-title-center">
              <span class="vscode-badge">VS CODE PYTHON IDE</span>
              <span class="vscode-subtitle">sandbox.py</span>
            </div>
            <span class="vscode-engine-badge"><span class="engine-dot"></span> Python 3.12</span>
          </div>
          <div class="editor vscode-editor">
            <div class="gutter" id="gut" aria-hidden="true"></div>
            <textarea class="ed" id="ed" spellcheck="false" autocapitalize="off" aria-label="Sandbox code editor">${esc(S.code.sandbox ?? 'def rate(level):\n    if level >= 70:\n        return "HIGH"\n    elif level >= 40:\n        return "MEDIUM"\n    else:\n        return "LOW"\n\nfor level in [12, 45, 88]:\n    print(f"Drain at {level}%: {rate(level)}")\n')}</textarea>
          </div>
          <div class="ed-bar" style="background:#1e1e1e;border-top:1px solid #2d2d2d;padding:8px 12px">
            <button class="vscode-run-btn" id="run"><span>▶</span> Run Code</button>
            <button class="vscode-btn-ghost" id="dl-sandbox">Download .py</button>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">Ctrl/⌘ + Enter runs</span>
          </div>
        </div>
        <div class="vscode-ide-container" style="box-shadow:none">
          <div class="vscode-titlebar" style="padding:6px 12px">
            <span class="vscode-badge" style="background:#238636">TERMINAL</span>
            <span class="vscode-subtitle">Python 3.12 Output</span>
          </div>
          <div class="vscode-terminal-body" style="min-height:240px">
            <pre class="out" id="out" style="color:#4ade80">Press Run to execute your sandbox code.</pre>
          </div>
        </div>
      </div>
    </section>
    <div class="ctrl" style="margin-top:24px"><button class="btn small ghost" id="map">Ward map</button></div>`;
  }

  app.innerHTML = html;

  const nx = $("#next");
  if (nx) nx.onclick = () => {
    view.n++;
    render();
    const ps = app.querySelectorAll(".panel");
    if (ps.length) ps[ps.length - 1].scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const mp = $("#map");
  if (mp) mp.onclick = () => go({ screen: "map" });

  if (n >= total) {
    const nameInput = $("#cert-name");
    if (nameInput) {
      nameInput.addEventListener("input", (e) => {
        S.studentName = e.target.value;
        save();
      });
    }
    const printBtn = $("#btn-print-cert");
    if (printBtn) printBtn.onclick = () => window.print();

    const ta = $("#ed");
    const run = async () => {
      const r = await runPython(ta.value);
      $("#out").innerHTML = esc(r.out || "") + (r.ok ? "" : `<span class="err">${esc(r.err)}</span>`) || "(Nothing printed.)";
    };
    wireEditor(ta, $("#gut"), run, (v) => { S.code.sandbox = v; save(); });
    $("#run").onclick = run;
    $("#dl-sandbox").onclick = () => downloadCode("bolt_sandbox.py", ta.value);
  }
}

function finalePanels() {
  const t = S.trust;
  const line = t >= 65 ? FINALE[0].say[0][1] :
    (t >= 52 ? "Vantage Civic's contract is suspended pending an audit. Their penalty will pay for new drains, and from today every drain reading in this ward is public." :
      "The audit will be slow and Vantage Civic is fighting it. But from today every drain reading in this ward is public, and nobody can say a drain is clear when it isn't.");
  return FINALE.map((p, i) => i === 0 ? Object.assign({}, p, { say: [["kavya", line]] }) : p);
}

/* =========================================================
   SHANTIPUR FLOOD SIMULATOR & COMMAND CENTER
   ========================================================= */
let simInterval = null;
let simData = {
  rainfall: 65,          // mm/hr
  sumpActive: false,
  autoGates: false,
  selectedSector: "station",
  sectors: [
    { id: "station", name: "Station Road", level: 82, capacity: 65, choked: true, wasteType: "Plastic bottles, e-waste" },
    { id: "ganesh",  name: "Ganesh Chowk", level: 35, capacity: 80, choked: false, wasteType: "None (Segregated)" },
    { id: "market",  name: "Market Lane",  level: 91, capacity: 50, choked: true, wasteType: "Wet vegetable peels" },
    { id: "nehru",   name: "Nehru Nagar",  level: 70, capacity: 70, choked: true, wasteType: "Mixed construction silt" },
    { id: "river",   name: "River Gate",   level: 95, capacity: 120, choked: true, wasteType: "Plastic packaging" },
    { id: "bazaar",  name: "Old Bazaar",   level: 40, capacity: 60, choked: false, wasteType: "None (Flowing)" }
  ],
  scriptLogs: "BOLT Ward 14 Telemetry Engine Initialized.\\nReady to run real-time Python disaster control protocols.",
  currentScript: "auto_drain"
};

const SIM_SCRIPTS = {
  auto_drain: `# Civic Python Protocol: Auto Drain Gate Balancing
def balance_ward_drains(sectors, rainfall_rate):
    actions = []
    print(f">> Monitoring Ward 14 under {rainfall_rate} mm/hr monsoon deluge...")
    for s in sectors:
        if s['choked']:
            actions.append(f"UNCLOG: Grate at {s['name']} purged of waste chokepoint.")
            s['choked'] = False
            s['level'] = max(20, s['level'] - 35)
        elif s['level'] > 60:
            actions.append(f"GATE OPEN: Auxiliary relief gate active at {s['name']}.")
            s['level'] = max(15, s['level'] - 25)
    return actions

print("Executing automated floodgate balancing...")
results = balance_ward_drains(sectors, rainfall)
for r in results:
    print("✓ " + r)
print("Protocol execution complete. All 6 drain gates operating at optimal capacity!")
`,
  sump_control: `# Civic Python Protocol: Emergency Sump Cistern Operations
def operate_sump(sectors, initial_depth=160, pump_capacity=25):
    print(">> Initializing high-power turbine sump pumps...")
    current_depth = initial_depth
    cycles = 0
    while current_depth > 30 and cycles < 8:
        current_depth -= pump_capacity
        cycles += 1
        print(f"Cycle {cycles}: Sump level reduced to {current_depth} cm.")
    for s in sectors:
        s['level'] = max(15, s['level'] - 20)
    print(f">> SUCCESS: Sump stabilized at {current_depth} cm after {cycles} cycles. Substation secured!")
    return current_depth

operate_sump(sectors)
`,
  choke_alert: `# Civic Python Protocol: Sensor Audit & Volunteer Dispatch
def audit_ward_sensors(sectors):
    choked_list = [s['name'] for s in sectors if s['choked']]
    print(f">> Telemetry Alert: {len(choked_list)} chokepoints detected in Ward 14.")
    for name in choked_list:
        print(f" ! DISPATCH: Rafiq & Volunteer Squad assigned to {name}")
    print(">> SMS alerts dispatched to 48 volunteer drain monitors.")
    return choked_list

audit_ward_sensors(sectors)
`
};

function renderSimulator(app) {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }

  const avgLevel = Math.round(simData.sectors.reduce((a, b) => a + b.level, 0) / simData.sectors.length);
  const chokedCount = simData.sectors.filter(s => s.choked).length;
  const currSector = simData.sectors.find(s => s.id === simData.selectedSector) || simData.sectors[0];

  const html = `<div class="sim-wrap">
    <div class="sim-head">
      <div class="sim-title-group">
        <span class="chip-live">● REAL-TIME DISASTER CONTROL LAB</span>
        <h2>Shantipur Ward 14 Flood Simulator &amp; Command Center</h2>
        <p>Control monsoon deluges, clear civic chokepoints, activate emergency sumps, and execute live Python disaster response protocols.</p>
      </div>
      <div class="sim-head-actions">
        <button class="btn small ghost" id="sim-back-map">Back to Ward Map</button>
      </div>
    </div>

    <!-- Live Telemetry KPI Metrics Bar -->
    <div class="sim-metrics-bar">
      <div class="sim-metric-card">
        <label>Overall Flood Risk</label>
        <span class="val ${avgLevel > 70 ? "alarm" : (avgLevel > 45 ? "gold" : "leaf")}" id="sim-kpi-risk">${avgLevel}%</span>
      </div>
      <div class="sim-metric-card">
        <label>Rainfall Intensity</label>
        <span class="val rain" id="sim-kpi-rain">${simData.rainfall} <small style="font-size:12px">mm/hr</small></span>
      </div>
      <div class="sim-metric-card">
        <label>Active Chokepoints</label>
        <span class="val ${chokedCount > 0 ? "alarm" : "leaf"}" id="sim-kpi-choked">${chokedCount} / ${simData.sectors.length}</span>
      </div>
      <div class="sim-metric-card">
        <label>Emergency Sump</label>
        <span class="val ${simData.sumpActive ? "leaf" : "gold"}" id="sim-kpi-sump">${simData.sumpActive ? "ACTIVE" : "STANDBY"}</span>
      </div>
      <div class="sim-metric-card">
        <label>Community Trust</label>
        <span class="val leaf">${S.trust}%</span>
      </div>
    </div>

    <div class="sim-grid">
      <!-- Left Panel: Interactive Ward Drainage Map & Sector Controls -->
      <div class="sim-card">
        <div class="sim-card-h">
          <h3>Ward 14 Telemetry &amp; Drain Grids</h3>
          <span style="font-size:12px;color:var(--muted)">Click a sector to inspect &amp; clear waste</span>
        </div>

        <!-- Interactive Map SVG -->
        <div class="sim-map-svg-wrap">
          <svg viewBox="0 0 600 240" preserveAspectRatio="xMidYMid meet">
            <rect width="600" height="240" fill="#090e18"/>
            <!-- Road grid -->
            <path d="M40 70 H560 M40 170 H560 M140 30 V210 M320 30 V210 M480 30 V210" stroke="#1c2538" stroke-width="22" stroke-linecap="round"/>
            <path d="M40 70 H560 M40 170 H560 M140 30 V210 M320 30 V210 M480 30 V210" stroke="#090e18" stroke-width="1.5" stroke-dasharray="8 8"/>
            
            <!-- River Flow -->
            <path d="M0 220 Q 150 200 300 220 T 600 220" stroke="#38bdf8" stroke-width="16" fill="none" opacity="0.45"/>
            <text x="490" y="235" fill="#38bdf8" font-size="11" font-family="monospace">River Basin</text>

            <!-- 6 Drain Sensor Nodes -->
            ${simData.sectors.map((s, i) => {
              const coords = [
                { x: 140, y: 70 },
                { x: 320, y: 70 },
                { x: 480, y: 70 },
                { x: 140, y: 170 },
                { x: 320, y: 170 },
                { x: 480, y: 170 }
              ][i];
              const col = s.level > 70 ? "var(--alarm)" : (s.level > 40 ? "var(--marigold)" : "var(--leaf)");
              const isSel = s.id === simData.selectedSector;
              return `<g class="sim-node-svg" style="cursor:pointer" data-id="${s.id}">
                <circle cx="${coords.x}" cy="${coords.y}" r="${isSel ? 19 : 14}" fill="#121826" stroke="${col}" stroke-width="${isSel ? 3.5 : 2}"/>
                <circle cx="${coords.x}" cy="${coords.y}" r="6" fill="${col}"/>
                <text x="${coords.x}" y="${coords.y - 20}" text-anchor="middle" fill="#f1f5f9" font-size="10.5" font-weight="700" font-family="sans-serif">${esc(s.name)}</text>
                <text x="${coords.x}" y="${coords.y + 24}" text-anchor="middle" fill="${col}" font-size="10" font-weight="600" font-family="monospace">${s.level}%</text>
              </g>`;
            }).join("")}
          </svg>
        </div>

        <!-- 6 Sector Cards -->
        <div class="sim-sector-grid">
          ${simData.sectors.map(s => `
            <div class="sim-sector-card ${s.id === simData.selectedSector ? "selected" : ""}" data-id="${s.id}">
              <div class="s-top">
                <span class="s-name">${esc(s.name)}</span>
                <span class="s-badge ${s.choked ? "sim-badge-choke" : (s.level > 60 ? "sim-badge-warn" : "sim-badge-ok")}">
                  ${s.choked ? "CHOKED" : (s.level > 60 ? "HIGH" : "SAFE")}
                </span>
              </div>
              <div class="sim-sector-meter">
                <i style="width:${s.level}%;background:${s.level > 70 ? "var(--alarm)" : (s.level > 40 ? "var(--marigold)" : "var(--leaf)")}"></i>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Simulation Controls Panel -->
        <div class="sim-controls-panel">
          <div class="sim-slider-row">
            <div class="sim-slider-label">
              <span>Monsoon Precipitation Rate:</span>
              <span id="sim-rain-val">${simData.rainfall} mm/hr</span>
            </div>
            <input type="range" class="sim-range" id="sim-rain-slider" min="10" max="150" value="${simData.rainfall}">
            <div class="sim-preset-chips">
              <span class="sim-chip" data-v="20">Light Drizzle (20 mm)</span>
              <span class="sim-chip" data-v="60">Heavy Monsoon (60 mm)</span>
              <span class="sim-chip" data-v="120">Cloudburst Deluge (120 mm)</span>
            </div>
          </div>

          <div class="sim-knobs-actions">
            <button class="sim-toggle-btn ${simData.sumpActive ? "active" : ""}" id="sim-btn-sump">
              <span>⚡</span> ${simData.sumpActive ? "Stop Sump Pumps" : "Start Emergency Sump"}
            </button>
            <button class="btn small run" id="sim-btn-clean" title="Clean waste at selected drain grate">
              <span>🧹</span> Clear Choke at ${esc(currSector.name)}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: BOLT's Python Simulator Script Runner -->
      <div class="sim-card">
        <div class="sim-card-h">
          <h3>BOLT Python Disaster Protocols</h3>
          <span style="font-size:12px;color:var(--muted)">Run live Python to automate civic flood defense</span>
        </div>

        <!-- Protocol Tabs -->
        <div class="sim-scripts-nav">
          <button class="sim-script-btn ${simData.currentScript === "auto_drain" ? "active" : ""}" data-s="auto_drain">auto_drain.py</button>
          <button class="sim-script-btn ${simData.currentScript === "sump_control" ? "active" : ""}" data-s="sump_control">sump_control.py</button>
          <button class="sim-script-btn ${simData.currentScript === "choke_alert" ? "active" : ""}" data-s="choke_alert">choke_alert.py</button>
        </div>

        <!-- Python IDE Container -->
        <div class="vscode-ide-container" style="box-shadow:none;border-width:2px">
          <div class="vscode-titlebar" style="padding:4px 10px">
            <div class="vscode-window-dots">
              <span class="vsc-dot vsc-close"></span>
              <span class="vsc-dot vsc-min"></span>
              <span class="vsc-dot vsc-max"></span>
            </div>
            <div class="vscode-title-center">
              <span class="vscode-badge">VS CODE PYTHON IDE</span>
              <span class="vscode-subtitle">${simData.currentScript}.py</span>
            </div>
          </div>
          <div class="editor vscode-editor" style="min-height:180px;max-height:240px">
            <div class="gutter" id="sim-gut" aria-hidden="true"></div>
            <textarea class="ed" id="sim-ed" spellcheck="false">${esc(SIM_SCRIPTS[simData.currentScript])}</textarea>
          </div>
          <div class="ed-bar" style="background:#1e1e1e;border-top:1px solid #2d2d2d;padding:6px 10px">
            <button class="vscode-run-btn" id="sim-run-script">
              <span>▶</span> Execute Python Protocol
            </button>
            <span style="font-size:11px;color:var(--muted);margin-left:auto">Executes via in-browser Skulpt engine</span>
          </div>
        </div>

        <!-- Real-time Console Output -->
        <div>
          <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--rain);font-weight:700;margin-bottom:6px">
            Terminal / Telemetry Audit Stream
          </div>
          <pre class="sim-console-out" id="sim-console">${esc(simData.scriptLogs)}</pre>
        </div>
      </div>
    </div>
  </div>`;

  app.innerHTML = html;

  // Back button
  $("#sim-back-map").onclick = () => go({ screen: "map" });

  // Sector selection
  app.querySelectorAll(".sim-sector-card, .sim-node-svg").forEach(el => {
    el.onclick = () => {
      const id = el.dataset.id;
      if (id) {
        simData.selectedSector = id;
        renderSimulator(app);
      }
    };
  });

  // Slider
  const slider = $("#sim-rain-slider");
  if (slider) {
    slider.oninput = (e) => {
      simData.rainfall = +e.target.value;
      const lbl = $("#sim-rain-val");
      if (lbl) lbl.textContent = simData.rainfall + " mm/hr";
      const kpi = $("#sim-kpi-rain");
      if (kpi) kpi.innerHTML = simData.rainfall + ` <small style="font-size:12px">mm/hr</small>`;
    };
  }

  // Presets
  app.querySelectorAll(".sim-chip").forEach(c => {
    c.onclick = () => {
      simData.rainfall = +c.dataset.v;
      if (slider) slider.value = simData.rainfall;
      renderSimulator(app);
    };
  });

  // Sump pump toggle
  const sumpBtn = $("#sim-btn-sump");
  if (sumpBtn) {
    sumpBtn.onclick = () => {
      simData.sumpActive = !simData.sumpActive;
      if (simData.sumpActive) {
        simData.scriptLogs += `\\n[${new Date().toLocaleTimeString()}] Sump pumps activated: removing 25 mm/cycle.`;
        if (SND) beep([330, 440, 550]);
      } else {
        simData.scriptLogs += `\\n[${new Date().toLocaleTimeString()}] Sump pumps deactivated.`;
      }
      renderSimulator(app);
    };
  }

  // Clear waste button
  const cleanBtn = $("#sim-btn-clean");
  if (cleanBtn) {
    cleanBtn.onclick = () => {
      const s = simData.sectors.find(x => x.id === simData.selectedSector);
      if (s) {
        s.choked = false;
        s.level = Math.max(15, s.level - 35);
        simData.scriptLogs += `\\n[${new Date().toLocaleTimeString()}] MANUAL PURGE: Volunteer squad cleared ${s.name} grate. Water level dropped to ${s.level}%.`;
        playCelebrationSound();
        launchConfetti();
        renderSimulator(app);
      }
    };
  }

  // Script tabs
  app.querySelectorAll(".sim-script-btn").forEach(btn => {
    btn.onclick = () => {
      simData.currentScript = btn.dataset.s;
      renderSimulator(app);
    };
  });

  // Wire simulator editor
  const simEd = $("#sim-ed");
  if (simEd) {
    wireEditor(simEd, $("#sim-gut"), () => runSimScript());
  }

  // Run script
  async function runSimScript() {
    const btn = $("#sim-run-script");
    if (!btn || !simEd) return;
    btn.disabled = true;
    btn.textContent = "Executing…";

    const harness = `
rainfall = ${simData.rainfall}
sectors = ${JSON.stringify(simData.sectors.map(s => ({ id: s.id, name: s.name, level: s.level, choked: s.choked })))}
`;
    const res = await runPython(harness + "\\n" + simEd.value);
    btn.disabled = false;
    btn.textContent = "Execute Python Protocol";

    if (res.ok) {
      if (simData.currentScript === "auto_drain") {
        simData.sectors.forEach(s => {
          s.choked = false;
          s.level = Math.max(15, s.level - 30);
        });
      } else if (simData.currentScript === "sump_control") {
        simData.sumpActive = true;
        simData.sectors.forEach(s => { s.level = Math.max(15, s.level - 20); });
      }
      simData.scriptLogs = `[${new Date().toLocaleTimeString()}] PYTHON EXECUTION SUCCESS:\\n` + res.out;
      playCelebrationSound();
      launchConfetti();
      renderSimulator(app);
    } else {
      simData.scriptLogs = `[${new Date().toLocaleTimeString()}] PYTHON ERROR:\\n` + (res.err || "Syntax error in script.");
      playFailureSound();
      const con = $("#sim-console");
      if (con) con.textContent = simData.scriptLogs;
    }
  }

  const runBtn = $("#sim-run-script");
  if (runBtn) runBtn.onclick = runSimScript;

  // Real-time Simulation Tick
  simInterval = setInterval(() => {
    let changed = false;
    simData.sectors.forEach(s => {
      const inflow = (simData.rainfall / 100) * 4;
      const outflow = (s.choked ? 1.0 : 3.5) + (simData.sumpActive ? 2.5 : 0);
      const delta = inflow - outflow;
      const newLvl = Math.max(10, Math.min(100, Math.round(s.level + delta)));
      if (newLvl !== s.level) {
        s.level = newLvl;
        changed = true;
      }
    });
    if (changed && view.screen === "simulator") {
      const riskEl = $("#sim-kpi-risk");
      const chokedEl = $("#sim-kpi-choked");
      if (riskEl && chokedEl) {
        const curAvg = Math.round(simData.sectors.reduce((a, b) => a + b.level, 0) / simData.sectors.length);
        const curChoked = simData.sectors.filter(s => s.choked).length;
        riskEl.textContent = curAvg + "%";
        riskEl.className = "val " + (curAvg > 70 ? "alarm" : (curAvg > 45 ? "gold" : "leaf"));
        chokedEl.textContent = `${curChoked} / ${simData.sectors.length}`;
        chokedEl.className = "val " + (curChoked > 0 ? "alarm" : "leaf");
      }
    }
  }, 1800);
}

/* =========================================================
   MODALS: TELEMETRY, PITCH & SDG, ABOUT & TOOLS
   ========================================================= */
function openTelemetryModal() {
  let d = document.getElementById("telem-dlg");
  if (d) d.remove();
  d = document.createElement("dialog");
  d.id = "telem-dlg";
  d.className = "custom-dlg";

  const h = S.health;
  const drains = [
    { name: "Station Road", lvl: Math.max(15, 82 - Math.round(h * 0.6)), cap: "65 mm/hr", status: h >= 50 ? "FLOWING" : "CHOKED" },
    { name: "Ganesh Chowk", lvl: Math.max(10, 35 - Math.round(h * 0.2)), cap: "80 mm/hr", status: "CLEAR" },
    { name: "Market Lane", lvl: Math.max(20, 91 - Math.round(h * 0.7)), cap: "50 mm/hr", status: h >= 70 ? "FLOWING" : "SURGING" },
    { name: "Nehru Nagar", lvl: Math.max(18, 70 - Math.round(h * 0.5)), cap: "70 mm/hr", status: h >= 60 ? "CLEAR" : "BLOCKED" },
    { name: "River Gate", lvl: Math.max(25, 95 - Math.round(h * 0.75)), cap: "120 mm/hr", status: h >= 75 ? "FLOWING" : "OVERFLOW" },
    { name: "Old Bazaar", lvl: Math.max(12, 40 - Math.round(h * 0.3)), cap: "60 mm/hr", status: "CLEAR" }
  ];

  d.innerHTML = `<h3>Ward 14 Telemetry Control</h3>
    <p style="margin:0 0 12px">Live sensor network readings monitored by BOLT across Shantipur East.</p>
    <table>
      <thead>
        <tr><th>Location</th><th>Water Level</th><th>Capacity</th><th>Sensor Status</th></tr>
      </thead>
      <tbody>
        ${drains.map(dr => `<tr>
          <td><strong>${dr.name}</strong></td>
          <td>${dr.lvl}%</td>
          <td>${dr.cap}</td>
          <td><span style="color:${dr.status === "CLEAR" || dr.status === "FLOWING" ? "var(--leaf)" : "var(--alarm)"};font-weight:700">${dr.status}</span></td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div style="margin-top:16px;font-size:13px;color:var(--muted)">
      City Flood Index: <strong>${100 - h}%</strong> · Current Health: <strong>${h}/100</strong>
    </div>
    <div class="row"><button class="btn small" id="close-telem">Close</button></div>`;

  document.body.appendChild(d);
  $("#close-telem", d).onclick = () => d.close();
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}

/* =========================================================
   CODÉDEX PYTHON USER MANUAL DATA & VIEWER
   ========================================================= */
const MANUAL_TOPICS = [
  {
    id: "c1",
    num: "1",
    concept: "print() & strings",
    title: "print() and Strings",
    brief: "print() tells the computer to show text on the screen. Words and letters must be wrapped in matching quotation marks.",
    rules: [
      "Quotes must match on both sides: 'text' or \"text\".",
      "Python is case-sensitive: print() is valid, but Print() or PRINT() causes a NameError.",
      "Every print() call automatically adds a new line."
    ],
    code: `# Chapter 1: Waking BOLT up\nprint("Hello, Shantipur!")\nprint("BOLT is online.")`,
    out: `Hello, Shantipur!\nBOLT is online.`,
    gotcha: "Missing matching quotation mark or misspelling print (e.g. prnt or Print)."
  },
  {
    id: "c2",
    num: "2",
    concept: "variables & math",
    title: "Variables, Arithmetic & f-strings",
    brief: "A variable is a named container that holds information. Use = to store values, and arithmetic operators (+, -, *, /) to calculate new numbers.",
    rules: [
      "Variable names cannot have spaces: rainfall = 112 (not rain fall).",
      "Numbers do not use quotation marks: 112 is a number, \"112\" is text.",
      "Use an f-string to embed variables directly into text: f\"Overflow: {overflow} mm\"."
    ],
    code: `# Chapter 2: Calculating Station Road overflow\nrainfall = 112      # mm/hr\ncapacity = 65       # mm/hr\noverflow = rainfall - capacity\nprint(f"Overflow: {overflow} mm")`,
    out: `Overflow: 47 mm`,
    gotcha: "Typing overflow = 47 manually instead of rainfall - capacity. If rainfall changes, hard-coded numbers fail!"
  },
  {
    id: "c3",
    num: "3",
    concept: "if / elif / else",
    title: "Conditionals & Decision Making",
    brief: "if, elif, and else let your program make decisions based on rules. Indented blocks only execute when their condition evaluates to True.",
    rules: [
      "Use == (two equal signs) to test if values match. A single = assigns a value.",
      "Use 'or' when either condition being True is sufficient.",
      "def defines a reusable function, and return passes the result back."
    ],
    code: `# Chapter 3: Sorting waste at the society gate\ndef choose_bin(item):\n    if item == "battery" or item == "medicine strip":\n        return "RED"\n    elif item == "banana peel" or item == "tea leaves":\n        return "GREEN"\n    else:\n        return "BLUE"\n\nprint(choose_bin("tea leaves"))`,
    out: `GREEN`,
    gotcha: "Using a single = inside if statements, or omitting the colon (:) at the end of the if line."
  },
  {
    id: "c4",
    num: "4",
    concept: "for loops & range()",
    title: "for Loops and range()",
    brief: "for loops repeat a block of code multiple times without repetitive typing. range(start, stop) generates numbers starting at start and ending BEFORE stop.",
    rules: [
      "range(1, 13) counts 1, 2, ..., 12 (it stops right before 13).",
      "Lines indented inside the loop execute on every cycle.",
      "Lines with no indent run once after the loop has completely finished."
    ],
    code: `# Chapter 4: Clearing Rafiq's 12 drains before 5 AM\nfor drain in range(1, 13):\n    print(f"Clearing drain {drain}")\n\nprint("Beat complete!")`,
    out: `Clearing drain 1\nClearing drain 2\n...\nClearing drain 12\nBeat complete!`,
    gotcha: "Off-by-one error: using range(1, 12) only reaches 11! Also, indenting the final print() repeats it 12 times."
  },
  {
    id: "c5",
    num: "5",
    concept: "lists & data",
    title: "Lists, append(), len(), and max()",
    brief: "A list stores an ordered collection of values inside square brackets []. You can iterate through it, filter items, and calculate statistical summaries.",
    rules: [
      "Create an empty list with my_list = [].",
      "Add items using my_list.append(item).",
      "len(my_list) returns the total item count; max(my_list) finds the highest number."
    ],
    code: `# Chapter 5: Building evidence of choked drains\nlevels = [35, 82, 91, 40, 77, 12, 95, 60]\nblocked = []\nfor level in levels:\n    if level >= 70:\n        blocked.append(level)\n\ncount = len(blocked)\nworst = max(levels)\nprint(f"{count} of {len(levels)} drains blocked. Worst: {worst}%")`,
    out: `4 of 8 drains blocked. Worst: 95%`,
    gotcha: "Confusing > 70 with >= 70 (the municipal rule is 70% or more, so use >=)."
  },
  {
    id: "c6",
    num: "6",
    concept: "dictionaries & debug",
    title: "Dictionaries & Debugging (GRIDLOCK)",
    brief: "Dictionaries store key-value pairs inside curly braces {}. Debugging requires reading code line by line to verify it follows specifications.",
    rules: [
      "Access pairs with for key, value in my_dict.items():",
      "Assign or update values with my_dict[key] = new_value.",
      "Debugging rule: Find and contain the flaw without breaking system dependencies."
    ],
    code: `# Chapter 6: Fixing GRIDLOCK's 3 hidden lies\ndef drain_report(levels):\n    report = {}\n    for name, level in levels.items():\n        if level >= 70:\n            report[name] = "BLOCKED"\n        else:\n            report[name] = "CLEAR"\n    return report`,
    out: `{'Station Road': 'BLOCKED', 'Ganesh Chowk': 'CLEAR'}`,
    gotcha: "Deleting the function entirely! GRIDLOCK operates every floodgate, so deleting jams them shut."
  },
  {
    id: "c7",
    num: "7",
    concept: "while loops",
    title: "while Loops & State Management",
    brief: "while loops repeat continuously as long as a condition remains True. Unlike for loops with fixed iterations, while is used when waiting for a target state.",
    rules: [
      "Always modify the loop variable inside the loop body (e.g. water_level -= pump_power).",
      "If the condition never becomes False, the loop runs forever! BOLT stops them after 4 seconds."
    ],
    code: `# Chapter 7: Draining the Old Sump House cistern\nwater_level = 160\npump_power = 25\nwhile water_level > 30:\n    water_level = water_level - pump_power\n    print(f"Pumping: level at {water_level} cm")\nprint("Sump secured! Level safe.")`,
    out: `Pumping: level at 135 cm\n...\nPumping: level at 10 cm\nSump secured! Level safe.`,
    gotcha: "Forgetting to decrease water_level inside the loop body, causing an infinite loop."
  },
  {
    id: "c8",
    num: "8",
    concept: "CSV string split",
    title: "String Splitting & CSV Forensics",
    brief: "row.split(',') divides a comma-separated text string into a list of individual column values, enabling automated forensic database audits.",
    rules: [
      "parts = row.split(',') produces a list of string tokens.",
      "Convert numerical strings into integers using int(parts[1]).",
      "Compare raw sensor values against contractor reported values to detect tampering."
    ],
    code: `# Chapter 8: Auditing Vantage Civic's sensor logs\nentry = "Station Road,85,42"\nparts = entry.split(",")\ndrain = parts[0]\nraw = int(parts[1])\nreported = int(parts[2])\nif raw >= 70 and reported < 70:\n    print(f"TAMPERED: {drain}")`,
    out: `TAMPERED: Station Road`,
    gotcha: "Comparing string values instead of converting them with int() (in Python, '85' is text, 85 is a number)."
  }
];

function openUserManualModal(targetId) {
  let d = document.getElementById("manual-dlg");
  if (d) d.remove();
  d = document.createElement("dialog");
  d.id = "manual-dlg";
  d.className = "custom-dlg manual-dlg";

  let activeTab = targetId || "c1";

  function renderManualContent() {
    const topic = MANUAL_TOPICS.find(t => t.id === activeTab) || MANUAL_TOPICS[0];
    const origIdx = CHAPTERS.findIndex(c => c.id === topic.id);
    const isDone = S.done.includes(topic.id);

    d.innerHTML = `
      <div class="manual-modal-head">
        <div>
          <span class="manual-badge">BOLT'S PYTHON COMPANION</span>
          <h3>Python User Manual &amp; Reference Guide</h3>
          <p>Handy cheat sheet for every programming concept taught in Shantipur East.</p>
        </div>
        <button class="kenney-close-btn" id="close-manual-x" title="Close User Manual">✕</button>
      </div>

      <div class="manual-nav-tabs">
        ${MANUAL_TOPICS.map(t => `
          <button class="manual-nav-btn ${t.id === activeTab ? "active" : ""}" data-id="${t.id}">
            Ch ${t.num}: ${esc(t.concept)}
          </button>
        `).join("")}
      </div>

      <div class="manual-content-box">
        <div class="manual-chapter-title">
          <h4>Chapter ${topic.num}: ${esc(topic.title)}</h4>
          <span class="concept-tag">${esc(topic.concept)}</span>
        </div>

        <p class="manual-desc">${esc(topic.brief)}</p>

        <div class="manual-rules">
          <h5>The Golden Rules</h5>
          <ul>
            ${topic.rules.map(r => `<li>${esc(r)}</li>`).join("")}
          </ul>
        </div>

        <div class="manual-code-grid">
          <div class="manual-code-card">
            <div class="manual-card-h">
              <span>Python Code Example</span>
              <button class="copy-snip-btn" id="copy-code-btn">📋 Copy Code</button>
            </div>
            <pre>${esc(topic.code)}</pre>
          </div>
          <div class="manual-out-card">
            <div class="manual-card-h">
              <span>Terminal Output</span>
            </div>
            <pre>${esc(topic.out)}</pre>
          </div>
        </div>

        <div class="manual-gotcha">
          <strong>⚠️ Common Beginner Gotcha:</strong> ${esc(topic.gotcha)}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:6px">
          <div>
            ${isDone ? `<span style="color:var(--leaf);font-weight:700">✓ You have completed this chapter!</span>` : `<span style="color:var(--muted)">Incomplete</span>`}
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn small replay" id="manual-play-ch">
              ${isDone ? "🔄 Replay Chapter " + topic.num : "▶ Play Chapter " + topic.num}
            </button>
            <button class="btn small ghost" id="close-manual-btn">Done</button>
          </div>
        </div>
      </div>
    `;

    $("#close-manual-x", d).onclick = () => d.close();
    $("#close-manual-btn", d).onclick = () => d.close();

    $("#copy-code-btn", d).onclick = () => {
      try {
        navigator.clipboard.writeText(topic.code);
        const b = $("#copy-code-btn", d);
        b.textContent = "✓ Copied!";
        setTimeout(() => { if (b) b.textContent = "📋 Copy Code"; }, 1500);
      } catch (e) {}
    };

    $("#manual-play-ch", d).onclick = () => {
      d.close();
      go({ screen: "chapter", id: topic.id, phase: "story", n: 1 });
    };

    d.querySelectorAll(".manual-nav-btn").forEach(btn => {
      btn.onclick = () => {
        activeTab = btn.dataset.id;
        if (SND) beep([540, 700]);
        renderManualContent();
      };
    });
  }

  renderManualContent();
  document.body.appendChild(d);
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}

/* =========================================================
   KENNEY GAME SETTINGS MODAL
   ========================================================= */
function openSettingsModal() {
  let d = document.getElementById("settings-dlg");
  if (d) d.remove();
  d = document.createElement("dialog");
  d.id = "settings-dlg";
  d.className = "custom-dlg settings-dlg";

  d.innerHTML = `
    <div class="settings-modal-head">
      <div>
        <span class="settings-badge">GAME CONFIGURATION</span>
        <h3>Settings &amp; Preferences</h3>
      </div>
      <button class="kenney-close-btn" id="close-settings-x" title="Close Settings">✕</button>
    </div>

    <div class="settings-grid">
      <!-- Section 1: Sound & Audio -->
      <div class="settings-card">
        <div class="sc-header">
          <span class="sc-icon">🔊</span>
          <div>
            <h4>Sound &amp; Audio</h4>
            <p>Web Audio synthesizer sound effects and feedback</p>
          </div>
        </div>
        <div class="settings-options">
          <button class="kenney-toggle-btn ${SND ? "active" : ""}" id="set-snd-toggle">
            ${SND ? "Sound FX: ON 🔊" : "Sound FX: OFF 🔇"}
          </button>
          <button class="kenney-toggle-btn" id="set-snd-test">
            🎵 Test Sound
          </button>
        </div>
      </div>

      <!-- Section 2: Themes & Appearance -->
      <div class="settings-card">
        <div class="sc-header">
          <span class="sc-icon">🎨</span>
          <div>
            <h4>Themes &amp; Palette</h4>
            <p>Select your preferred game color scheme</p>
          </div>
        </div>
        <div class="theme-picker-grid">
          ${THEMES.map(t => `
            <button class="theme-choice-btn ${t.id === currentTheme ? "active" : ""}" data-theme="${t.id}">
              <span class="theme-preview-dot ${t.id}"></span>
              <span class="theme-name">${t.name}</span>
              ${t.id === currentTheme ? `<span class="theme-check">✓</span>` : ""}
            </button>
          `).join("")}
        </div>
      </div>

      <!-- Section 3: Game & Civic Tools -->
      <div class="settings-card">
        <div class="sc-header">
          <span class="sc-icon">🛠️</span>
          <div>
            <h4>Civic Simulation &amp; Story Tools</h4>
            <p>Ward 14 telemetry, disaster lab, pitch and documentation</p>
          </div>
        </div>
        <div class="tool-links-grid">
          <button class="tool-btn highlight" id="set-open-sim">
            🌧️ Flood Simulator
          </button>
          <button class="tool-btn" id="set-open-manual">
            📖 Python User Manual
          </button>
          <button class="tool-btn" id="set-open-telem">
            📡 Ward Telemetry
          </button>
          <button class="tool-btn" id="set-open-pitch">
            🎯 Pitch &amp; SDG Guide
          </button>
          <button class="tool-btn" id="set-open-about">
            ℹ️ About Code Monsoon
          </button>
        </div>
      </div>

      <!-- Section 4: Player Profile & Reset -->
      <div class="settings-card">
        <div class="sc-header">
          <span class="sc-icon">👤</span>
          <div>
            <h4>Candidate Profile &amp; Data</h4>
            <p>Personalize your certificate or reset saved state</p>
          </div>
        </div>
        <div class="profile-row">
          <label for="set-student-name">Student / Candidate Name:</label>
          <input type="text" id="set-student-name" class="kenney-input" value="${esc(S.studentName || "Ajinkya Kalyankar")}" placeholder="Enter candidate name"/>
        </div>
        <div class="settings-demo-row">
          <label class="demo-check-label">
            <input type="checkbox" id="set-demo-mode" ${DEMO ? "checked" : ""}/>
            <span><strong>Judge Demo Mode:</strong> Unlock all chapters &amp; free solutions for quick review.</span>
          </label>
        </div>
        <div class="reset-row">
          <button class="kenney-danger-btn" id="set-btn-reset">⚠️ Reset All Progress</button>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn small" id="close-settings-btn">Done</button>
    </div>
  `;

  document.body.appendChild(d);

  const close = () => { d.close(); };
  $("#close-settings-x", d).onclick = close;
  $("#close-settings-btn", d).onclick = close;
  d.addEventListener("click", (e) => { if (e.target === d) close(); });

  const sndBtn = $("#set-snd-toggle", d);
  sndBtn.onclick = () => {
    SND = !SND;
    sndBtn.textContent = SND ? "Sound FX: ON 🔊" : "Sound FX: OFF 🔇";
    sndBtn.classList.toggle("active", SND);
    if (SND) {
      initAudio();
      beep([520, 680]);
    }
  };

  $("#set-snd-test", d).onclick = () => {
    initAudio();
    playCelebrationSound();
  };

  d.querySelectorAll(".theme-choice-btn").forEach(btn => {
    btn.onclick = () => {
      const tid = btn.dataset.theme;
      applyTheme(tid);
      d.querySelectorAll(".theme-choice-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.theme === tid);
        const ch = b.querySelector(".theme-check");
        if (b.dataset.theme === tid) {
          if (!ch) {
            const sp = document.createElement("span");
            sp.className = "theme-check";
            sp.textContent = "✓";
            b.appendChild(sp);
          }
        } else if (ch) ch.remove();
      });
      if (SND) beep([600, 750]);
    };
  });

  $("#set-open-sim", d).onclick = () => { close(); go({ screen: "simulator" }); };
  $("#set-open-manual", d).onclick = () => { close(); openUserManualModal(); };
  $("#set-open-telem", d).onclick = () => { close(); openTelemetryModal(); };
  $("#set-open-pitch", d).onclick = () => { close(); openPitchModal(); };
  $("#set-open-about", d).onclick = () => { close(); openAbout(); };

  const nameInp = $("#set-student-name", d);
  nameInp.oninput = () => {
    S.studentName = nameInp.value.trim() || "Ajinkya Kalyankar";
    save();
  };

  $("#set-demo-mode", d).onchange = (e) => {
    DEMO = e.target.checked;
    render();
  };

  $("#set-btn-reset", d).onclick = () => {
    if (confirm("Reset all progress, XP, and saved code?")) {
      S = fresh();
      save();
      close();
      go({ screen: "title" });
    }
  };

  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}

function openPitchModal() {
  let d = document.getElementById("pitch-dlg");
  if (d) d.remove();
  d = document.createElement("dialog");
  d.id = "pitch-dlg";
  d.className = "custom-dlg";

  d.innerHTML = `<h3>Storyverse Round 2 · Pitch &amp; SDG Guide</h3>
    <p style="margin:0 0 10px"><strong>Grand Theme: Impact for Good (SDG-Linked Storytelling)</strong></p>
    <h4>3-Minute Presentation Script for Jury</h4>
    <ul>
      <li><strong>Minute 1 (The Narrative &amp; Conflict):</strong> Shantipur floods not merely from rain, but from choked drains and a corrupt private contractor AI (GRIDLOCK) billing ₹4.8 crore while reporting all clear. Meera and BOLT turn community frustration into computational evidence.</li>
      <li><strong>Minute 2 (Real Python In-Browser):</strong> Every concept is taught at the exact moment the story demands it: print() to wake BOLT, variables for rain arithmetic, conditionals for waste sorting, loops for sweeping 12 drains, lists for evidence, and debugging to catch three hidden lies. Real Python executes in-browser with offline Skulpt runtime.</li>
      <li><strong>Minute 3 (SDG Impact &amp; Resolution):</strong> Instead of destroying the AI, Meera repairs it (containment over destruction), unlocking public floodgates, creating separate waste collection, and empowering citizen open-data verification.</li>
    </ul>
    <h4>United Nations Sustainable Development Goals (SDGs)</h4>
    <table>
      <tr><td>SDG 4</td><td>Quality Education: Teaches real Python from scratch with instant visual feedback.</td></tr>
      <tr><td>SDG 6</td><td>Clean Water &amp; Sanitation: Overflow calculations and emergency sump drainage.</td></tr>
      <tr><td>SDG 11</td><td>Sustainable Cities: Drainage infrastructure, flood prevention, open civic data.</td></tr>
      <tr><td>SDG 12</td><td>Responsible Consumption: Household waste source segregation (Red/Green/Blue).</td></tr>
      <tr><td>SDG 13</td><td>Climate Action: Building community resilience against severe monsoon deluges.</td></tr>
      <tr><td>SDG 16</td><td>Peace, Justice &amp; Strong Institutions: Data forensics exposing corruption.</td></tr>
    </table>
    <label class="demo">
      <input type="checkbox" id="pitch-demo" ${DEMO ? "checked" : ""}>
      <span><strong>Judge Demo Mode:</strong> Instantly unlock all 8 chapters and enable one-click solution preview for quick jury walkthroughs.</span>
    </label>
    <div class="row"><button class="btn small" id="close-pitch">Close</button></div>`;

  document.body.appendChild(d);
  $("#close-pitch", d).onclick = () => d.close();
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  $("#pitch-demo", d).onchange = (e) => {
    DEMO = e.target.checked;
    render();
  };
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}

function openAbout() {
  let d = document.getElementById("about-dlg");
  if (d) d.remove();
  d = document.createElement("dialog");
  d.id = "about-dlg";
  d.className = "custom-dlg";

  d.innerHTML = `<h3>Code Monsoon</h3>
    <p style="margin:0 0 6px"><strong>Don't just clean up the problem. Fix the system.</strong> A comic-style narrative coding adventure that teaches Python to complete beginners. Built for Storyverse (Round 2: Build the World) by Ajinkya Kalyankar.</p>
    <h4>Technical Highlights</h4>
    <ul>
      <li>In-browser Python execution via Skulpt engine with full offline fallback from <code>codes/vendor/</code>.</li>
      <li>Zero external framework dependencies: Vanilla HTML5, CSS3, JavaScript, SVG, and Web Audio API.</li>
      <li>Comprehensive test harness with dynamic variant re-testing to prevent hard-coding.</li>
      <li>Full modular source files located in the <code>codes/</code> folder, including 10 standalone Python solutions.</li>
    </ul>
    <h4>Tool Disclosures</h4>
    <ul>
      <li>Skulpt (open-source Python-in-browser interpreter).</li>
      <li>Google Fonts: Bangers, Hind, Kalam, JetBrains Mono.</li>
      <li>Original handcrafted SVG vector artwork rendered via procedural JavaScript.</li>
      <li>Anthropic Claude &amp; Google Gemini AI coding assistants for narrative refinement and code generation.</li>
    </ul>
    <label class="demo">
      <input type="checkbox" id="about-demo" ${DEMO ? "checked" : ""}>
      <span><strong>Judge Demo Mode:</strong> Unlocks every chapter and always allows solution reveal for fast jury review.</span>
    </label>
    <div class="row">
      <button class="btn small ghost" id="about-open-pitch">Pitch Script</button>
      <button class="btn small" id="close-about">Close</button>
    </div>`;

  document.body.appendChild(d);
  $("#close-about", d).onclick = () => d.close();
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  $("#about-open-pitch", d).onclick = () => { d.close(); openPitchModal(); };
  $("#about-demo", d).onchange = (e) => {
    DEMO = e.target.checked;
    render();
  };
  if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}

/* =========================================================
   EVENT WIRING & INITIALIZATION
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const homeBtn = $("#home");
  if (homeBtn) homeBtn.onclick = () => go({ screen: S.done.length ? "map" : "title" });

  const btnManual = $("#btn-manual");
  if (btnManual) btnManual.onclick = () => openUserManualModal();

  const btnSettings = $("#btn-settings");
  if (btnSettings) btnSettings.onclick = () => openSettingsModal();

  const aboutBtn = $("#about");
  if (aboutBtn) aboutBtn.onclick = openAbout;
  const pitchBtn = $("#pitch");
  if (pitchBtn) pitchBtn.onclick = openPitchModal;
  const telemBtn = $("#telem");
  if (telemBtn) telemBtn.onclick = openTelemetryModal;
  const simBtn = $("#sim-btn");
  if (simBtn) simBtn.onclick = () => go({ screen: "simulator" });

  const themeBtn = $("#theme-btn");
  if (themeBtn) {
    const t = THEMES.find(x => x.id === currentTheme);
    themeBtn.textContent = "Theme: " + (t ? t.name : "Aesthetic Beige");
    themeBtn.onclick = () => cycleTheme();
  }

  const sndBtn = $("#snd");
  if (sndBtn) {
    sndBtn.textContent = SND ? "Sound On 🔊" : "Sound Off 🔇";
    sndBtn.setAttribute("aria-pressed", String(SND));
    sndBtn.classList.toggle("active", SND);
    sndBtn.onclick = () => {
      SND = !SND;
      sndBtn.textContent = SND ? "Sound On 🔊" : "Sound Off 🔇";
      sndBtn.setAttribute("aria-pressed", String(SND));
      sndBtn.classList.toggle("active", SND);
      if (SND) {
        initAudio();
        playCelebrationSound();
      }
    };
  }

  applyTheme(currentTheme);
  setEngine();
  render();

  /* Ambient Canvas Rain */
  (function () {
    const cv = document.getElementById("rain");
    if (!cv || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cx = cv.getContext("2d");
    let W, H, drops = [];
    const size = () => {
      W = cv.width = innerWidth;
      H = cv.height = innerHeight;
      drops = Array.from({ length: Math.round(W / 9) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        l: 8 + Math.random() * 14,
        v: 6 + Math.random() * 7
      }));
    };
    size();
    addEventListener("resize", size);
    (function tick() {
      cx.clearRect(0, 0, W, H);
      cx.strokeStyle = "rgba(150, 190, 255, .55)";
      cx.lineWidth = 1;
      cx.beginPath();
      for (const d of drops) {
        cx.moveTo(d.x, d.y);
        cx.lineTo(d.x - d.l * .25, d.y + d.l);
        d.y += d.v;
        d.x -= d.v * .25;
        if (d.y > H) {
          d.y = -20;
          d.x = Math.random() * W * 1.1;
        }
      }
      cx.stroke();
      requestAnimationFrame(tick);
    })();
  })();
});
