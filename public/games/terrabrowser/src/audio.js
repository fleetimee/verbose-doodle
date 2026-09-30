// Web Audio: synthesized sound effects + a procedural step-sequencer for music.
let ac = null, master, sfxG, musG, noiseBuf;
const vol = { music: 0.5, sfx: 0.7 };
const mus = { track: null, want: null, next: 0, step: 0, bar: 0, timer: null, fade: 1 };

function ensure() {
  if (ac) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try { ac = new AC(); } catch (e) { return false; }
  master = ac.createGain(); master.connect(ac.destination);
  sfxG = ac.createGain(); sfxG.gain.value = vol.sfx; sfxG.connect(master);
  musG = ac.createGain(); musG.gain.value = vol.music * 0.35; musG.connect(master);
  noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  mus.timer = setInterval(schedule, 50);
  return true;
}

function tone(type, f0, f1, dur, v, dest = sfxG, t0 = ac.currentTime, attack = 0.005) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t0);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function noise(dur, v, freq, type = 'lowpass', f1 = freq, dest = sfxG, t0 = ac.currentTime, q = 1) {
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; s.loop = true;
  f.type = type; f.Q.value = q; f.frequency.setValueAtTime(freq, t0);
  if (f1 !== freq) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur);
  g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.02);
}

const SFX = {
  dig: () => noise(0.09, 0.35, 900, 'lowpass', 300),
  stone: () => { noise(0.08, 0.3, 2500, 'bandpass', 1200, sfxG, ac.currentTime, 2); tone('square', 180, 120, 0.05, 0.05); },
  wood: () => { noise(0.08, 0.3, 1200, 'bandpass', 600, sfxG, ac.currentTime, 3); tone('triangle', 220, 160, 0.06, 0.1); },
  glass: () => { tone('sine', 1800, 1400, 0.15, 0.1); tone('sine', 2600, 2000, 0.12, 0.06); },
  tink: () => tone('square', 1400, 1300, 0.06, 0.06),
  place: () => noise(0.06, 0.3, 600, 'lowpass', 200),
  swing: () => noise(0.14, 0.18, 400, 'bandpass', 1800, sfxG, ac.currentTime, 1.5),
  jump: () => tone('sine', 220, 440, 0.1, 0.08),
  hurt: () => { tone('square', 300, 90, 0.18, 0.12); noise(0.1, 0.15, 800); },
  hit: () => { tone('square', 200, 110, 0.08, 0.1); noise(0.05, 0.12, 1500); },
  bosshit: () => { tone('sawtooth', 120, 70, 0.1, 0.1); noise(0.06, 0.15, 900); },
  kill: () => { noise(0.25, 0.3, 1400, 'lowpass', 150); tone('square', 160, 50, 0.25, 0.08); },
  death: () => { tone('sawtooth', 300, 40, 1.1, 0.15); noise(0.6, 0.2, 600, 'lowpass', 80); },
  pickup: () => { tone('square', 700, 700, 0.04, 0.05); tone('square', 1050, 1050, 0.05, 0.05, sfxG, ac.currentTime + 0.04); },
  coin: () => { tone('square', 1300, 1300, 0.05, 0.05); tone('square', 1950, 1950, 0.12, 0.05, sfxG, ac.currentTime + 0.05); },
  splash: () => noise(0.35, 0.3, 1600, 'bandpass', 300, sfxG, ac.currentTime, 0.8),
  sizzle: () => noise(0.3, 0.15, 4000, 'highpass', 6000),
  roar: () => { tone('sawtooth', 90, 45, 1.2, 0.22, sfxG, ac.currentTime, 0.1); tone('square', 60, 35, 1.2, 0.12, sfxG, ac.currentTime, 0.1); noise(1.0, 0.25, 500, 'lowpass', 120); },
  click: () => tone('square', 900, 900, 0.03, 0.04),
  open: () => { tone('triangle', 300, 500, 0.1, 0.1); },
  door: () => { noise(0.1, 0.25, 700, 'bandpass', 400, sfxG, ac.currentTime, 2); tone('triangle', 140, 110, 0.08, 0.1); },
  drink: () => { for (let k = 0; k < 3; k++) tone('sine', 400 + k * 120, 600 + k * 120, 0.07, 0.07, sfxG, ac.currentTime + k * 0.08); },
  crystal: () => { [523, 659, 784, 1047].forEach((f, k) => tone('triangle', f, f, 0.3, 0.08, sfxG, ac.currentTime + k * 0.07)); },
  magic: () => { tone('sine', 600, 1400, 0.18, 0.08); tone('triangle', 900, 1800, 0.14, 0.04); },
  shoot: () => { noise(0.12, 0.35, 3000, 'lowpass', 400); tone('square', 150, 60, 0.08, 0.12); },
  bow: () => { tone('triangle', 300, 120, 0.1, 0.1); noise(0.05, 0.1, 2000, 'highpass'); },
  hook: () => { tone('square', 600, 900, 0.06, 0.04); noise(0.08, 0.1, 3000, 'highpass'); },
  pot: () => { noise(0.2, 0.35, 2200, 'bandpass', 800, sfxG, ac.currentTime, 2); tone('triangle', 500, 300, 0.1, 0.06); },
  orb: () => { tone('sine', 200, 60, 0.9, 0.2); noise(0.6, 0.25, 1500, 'bandpass', 200); },
  star: () => { [880, 1320, 1760].forEach((f, k) => tone('sine', f, f, 0.25, 0.06, sfxG, ac.currentTime + k * 0.06)); },
  dash: () => noise(0.25, 0.25, 300, 'bandpass', 1400, sfxG, ac.currentTime, 1),
  laser: () => tone('sawtooth', 1400, 300, 0.2, 0.06),
  bell: () => { tone('sine', 330, 328, 1.6, 0.18); tone('sine', 660, 655, 1.2, 0.08); tone('sine', 991, 985, 0.8, 0.05); },
  craft: () => { noise(0.08, 0.2, 1800, 'bandpass', 900, sfxG, ac.currentTime, 2); tone('triangle', 660, 660, 0.08, 0.06, sfxG, ac.currentTime + 0.05); },
};

// ---------------------------------------------------------------- music
const TRACKS = {
  day: { bpm: 104, root: 60, scale: [0, 2, 4, 7, 9], chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], lead: 'triangle', bass: 'triangle', drums: 1, density: 0.55, seed: 3 },
  night: { bpm: 74, root: 57, scale: [0, 3, 5, 7, 10], chords: [[0, 3, 7], [5, 8, 12], [3, 7, 10], [7, 10, 14]], lead: 'sine', bass: 'sine', drums: 0, density: 0.35, seed: 7 },
  under: { bpm: 84, root: 50, scale: [0, 2, 3, 7, 9], chords: [[0, 3, 7], [-2, 2, 5], [0, 3, 7], [3, 7, 10]], lead: 'sine', bass: 'triangle', drums: 0, density: 0.3, seed: 11, bell: true },
  boss: { bpm: 150, root: 52, scale: [0, 1, 3, 5, 7, 8], chords: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 1, 5]], lead: 'square', bass: 'sawtooth', drums: 2, density: 0.75, seed: 19 },
};
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function hashN(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

function schedule() {
  if (!ac || ac.state !== 'running') return;
  if (mus.want !== mus.track) {
    mus.fade -= 0.08;
    musG.gain.setTargetAtTime(Math.max(0, mus.fade) * vol.music * 0.35, ac.currentTime, 0.05);
    if (mus.fade <= 0) { mus.track = mus.want; mus.step = 0; mus.bar = 0; mus.next = ac.currentTime + 0.1; }
    if (mus.track) return;
  } else if (mus.fade < 1) { mus.fade = Math.min(1, mus.fade + 0.05); musG.gain.setTargetAtTime(mus.fade * vol.music * 0.35, ac.currentTime, 0.1); }
  const tr = TRACKS[mus.track];
  if (!tr) return;
  const sd = 60 / tr.bpm / 4;
  while (mus.next < ac.currentTime + 0.2) {
    playStep(tr, mus.step, mus.bar, mus.next, sd);
    mus.next += sd;
    if (++mus.step >= 16) { mus.step = 0; mus.bar++; }
  }
}
function playStep(tr, st, bar, t, sd) {
  const ch = tr.chords[bar % tr.chords.length], root = tr.root;
  const section = Math.floor(bar / 8) % 3;
  if (st === 0) for (const n of ch) tone(tr.lead === 'square' ? 'triangle' : 'sine', mtof(root + n), mtof(root + n), sd * 16, 0.035, musG, t, 0.3);
  if (st % 4 === 0 || (tr.drums === 2 && st % 2 === 0)) tone(tr.bass, mtof(root - 12 + ch[st % 8 === 0 ? 0 : st % 8 === 4 ? 2 : 1]), mtof(root - 12 + ch[0]), sd * (tr.drums === 2 ? 1.8 : 3.5), 0.09, musG, t);
  const r = hashN(bar % 8 + section * 17 + tr.seed * 31, st);
  if (r < tr.density && (st % 2 === 0 || tr.drums === 2)) {
    const deg = Math.floor(hashN(bar * 3 + tr.seed, st * 7 + section) * tr.scale.length);
    const oct = hashN(st, bar + tr.seed) < 0.3 ? 12 : 0;
    const f = mtof(root + 12 + tr.scale[deg] + oct);
    if (tr.bell) { tone('sine', f, f, sd * 6, 0.05, musG, t); tone('sine', f * 2.01, f * 2.01, sd * 3, 0.015, musG, t); }
    else tone(tr.lead, f, f, sd * (tr.drums === 2 ? 1.6 : 2.6), tr.lead === 'square' ? 0.025 : 0.06, musG, t, 0.01);
  }
  if (tr.drums) {
    if (st % 8 === 0 || (tr.drums === 2 && st % 4 === 0)) tone('sine', 140, 40, 0.18, 0.2, musG, t);
    if (st % 8 === 4) noise(0.12, 0.08, 1800, 'bandpass', 1500, musG, t, 1);
    if (st % 2 === 1 || tr.drums === 2) noise(0.04, tr.drums === 2 ? 0.05 : 0.03, 7000, 'highpass', 7000, musG, t);
  }
}

export const audio = {
  init() { if (ensure() && ac.state === 'suspended') ac.resume(); },
  sfx(name) { if (!ac || ac.state !== 'running' || vol.sfx <= 0) return; const f = SFX[name]; if (f) try { f(); } catch (e) { /* ignore scheduling glitches */ } },
  music(track) { mus.want = track; },
  setVolume(m, s) { vol.music = m; vol.sfx = s; if (ac) { sfxG.gain.value = s; musG.gain.value = mus.fade * m * 0.35; } },
};
