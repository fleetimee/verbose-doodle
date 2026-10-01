// Fully synthesized audio (no asset files): SFX + generative ambient music.
export class Sound {
  constructor() {
    this.ctx = null; this.volume = 0.7; this.musicOn = true; this.listener = { x: 0, y: 0, z: 0 };
    this.nextMusic = 0; this.nextAmb = 0;
  }
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = this.volume; this.master.connect(this.ctx.destination);
    this.sfx = this.ctx.createGain(); this.sfx.connect(this.master);
    this.music = this.ctx.createGain(); this.music.gain.value = 0.32; this.music.connect(this.master);
    // noise buffer
    const n = this.ctx.sampleRate * 1.5; this.noise = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    // reverb
    const len = this.ctx.sampleRate * 2.6, ir = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    this.verb = this.ctx.createConvolver(); this.verb.buffer = ir; const vg = this.ctx.createGain(); vg.gain.value = 0.5; this.verb.connect(vg); vg.connect(this.music);
  }
  setVolume(v) { this.volume = v; if (this.master) this.master.gain.value = v; }
  gainFor(pos) {
    if (!pos) return 1; const l = this.listener; const d = Math.hypot(pos.x - l.x, pos.y - l.y, pos.z - l.z);
    return Math.max(0, 1 / (1 + d * d * 0.02)) * (d > 40 ? 0 : 1);
  }
  burst(freq, dur, gain, opts = {}) {
    const c = this.ctx; if (!c || gain <= 0.005) return;
    const src = c.createBufferSource(); src.buffer = this.noise; src.playbackRate.value = opts.rate || 1;
    const f = c.createBiquadFilter(); f.type = opts.type || 'lowpass'; f.frequency.value = freq; f.Q.value = opts.q || 0.8;
    if (opts.sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, freq * opts.sweep), c.currentTime + dur);
    const g = c.createGain(); const t = c.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.01, dur * 0.2)); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    src.connect(f); f.connect(g); g.connect(this.sfx); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }
  tone(freq, dur, gain, opts = {}) {
    const c = this.ctx; if (!c || gain <= 0.005) return;
    const o = c.createOscillator(); o.type = opts.type || 'sine'; const t = c.currentTime + (opts.delay || 0);
    o.frequency.setValueAtTime(freq, t); if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
    if (opts.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = opts.vib; lg.gain.value = freq * 0.05; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); }
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + (opts.atk || 0.01)); g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    let last = o; if (opts.filter) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.filter; o.connect(f); last = f; }
    last.connect(g); g.connect(this.sfx); o.start(t); o.stop(t + dur + 0.05);
  }
  mat(sound) {
    return ({ stone: [1400, 'lowpass'], dirt: [700, 'lowpass'], grass: [1100, 'lowpass'], sand: [2600, 'bandpass'], gravel: [1800, 'bandpass'],
      wood: [900, 'bandpass'], glass: [5000, 'highpass'], wool: [500, 'lowpass'], snow: [3000, 'bandpass'], water: [900, 'lowpass'] })[sound] || [1200, 'lowpass'];
  }
  play(name, opts = {}) {
    if (!this.ctx) return; const pos = opts.pos; const v = this.gainFor(pos) * (opts.vol === undefined ? 1 : opts.vol); if (v <= 0.003) return;
    const s = opts.sound || 'stone';
    switch (name) {
      case 'step': { const [f, t] = this.mat(s); this.burst(f, 0.07, 0.16 * v, { type: t, q: 1 }); break; }
      case 'dig': { const [f, t] = this.mat(s); this.burst(f, 0.09, 0.22 * v, { type: t, q: 1.4 }); this.tone(120 + Math.random() * 30, 0.06, 0.05 * v, { type: 'triangle' }); break; }
      case 'break': { const [f, t] = this.mat(s); this.burst(f * 0.8, 0.22, 0.5 * v, { type: t, q: 0.9 }); this.burst(f * 0.4, 0.3, 0.3 * v, { type: 'lowpass' }); if (s === 'glass') for (let i = 0; i < 4; i++) this.tone(2400 + Math.random() * 3000, 0.12, 0.05 * v, { delay: i * 0.02 }); break; }
      case 'place': { const [f, t] = this.mat(s); this.burst(f, 0.1, 0.35 * v, { type: t }); this.tone(90, 0.08, 0.15 * v, { type: 'triangle' }); break; }
      case 'hurt': this.tone(240, 0.22, 0.32 * v, { type: 'sawtooth', to: 90, filter: 1500 }); this.burst(600, 0.1, 0.15 * v); break;
      case 'hit': this.burst(900, 0.08, 0.3 * v, { type: 'bandpass' }); this.tone(160, 0.08, 0.15 * v, { type: 'square', to: 80, filter: 900 }); break;
      case 'pickup': this.tone(560, 0.08, 0.12 * v, { type: 'sine', to: 900 }); break;
      case 'click': this.tone(700, 0.04, 0.08 * v, { type: 'square', filter: 2000 }); break;
      case 'pop': this.tone(300, 0.1, 0.2 * v, { type: 'sine', to: 700 }); break;
      case 'eat': for (let i = 0; i < 3; i++) this.burst(1500, 0.06, 0.18 * v, { type: 'bandpass', q: 2 }); break;
      case 'splash': this.burst(1200, 0.35, 0.3 * v, { type: 'lowpass', sweep: 0.3 }); break;
      case 'pig': this.tone(340, 0.16, 0.14 * v, { type: 'sawtooth', to: 200, filter: 900, vib: 30 }); this.tone(300, 0.14, 0.12 * v, { type: 'sawtooth', to: 180, filter: 900, delay: 0.16 }); break;
      case 'cow': this.tone(120, 0.7, 0.2 * v, { type: 'sawtooth', to: 100, filter: 600, vib: 5, atk: 0.06 }); break;
      case 'sheep': this.tone(340, 0.5, 0.16 * v, { type: 'sawtooth', to: 300, filter: 1100, vib: 24, atk: 0.04 }); break;
      case 'zombie': this.tone(85, 0.7, 0.24 * v, { type: 'sawtooth', to: 62, filter: 420, vib: 6, atk: 0.08 }); this.burst(300, 0.5, 0.1 * v, { type: 'lowpass' }); break;
      case 'skeleton': for (let i = 0; i < 4; i++) this.burst(3200, 0.03, 0.14 * v, { type: 'bandpass', q: 5, rate: 1 + i * 0.1 }); break;
      case 'spider': this.burst(4200, 0.35, 0.16 * v, { type: 'bandpass', q: 3 }); this.tone(1200, 0.2, 0.08 * v, { type: 'sawtooth', to: 800, filter: 2500, vib: 40 }); break;
      case 'creeper': this.burst(4000, 1.4, 0.22 * v, { type: 'highpass', q: 0.5 }); break;
      case 'explode': this.burst(500, 1.1, 0.9 * v, { type: 'lowpass', sweep: 0.15 }); this.tone(70, 0.8, 0.6 * v, { type: 'sine', to: 28 }); this.burst(2000, 0.4, 0.3 * v); break;
      case 'bow': this.tone(400, 0.12, 0.12 * v, { type: 'triangle', to: 150 }); break;
      case 'fuse': this.burst(3500, 1.4, 0.22 * v, { type: 'highpass' }); break;
      case 'death': this.tone(200, 0.5, 0.3 * v, { type: 'sawtooth', to: 40, filter: 700 }); break;
      case 'fizz': this.burst(2500, 0.4, 0.2 * v, { type: 'highpass' }); break;
      case 'craft': this.tone(500, 0.08, 0.1 * v, { type: 'triangle' }); this.tone(750, 0.1, 0.1 * v, { type: 'triangle', delay: 0.07 }); break;
      case 'levelup': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.25, 0.12 * v, { type: 'triangle', delay: i * 0.08 })); break;
    }
  }
  // ambient music: slow pentatonic phrases with reverb
  updateAmbient(t, nearSurface, night, underground) {
    if (!this.ctx) return;
    if (this.musicOn && t > this.nextMusic) {
      this.nextMusic = t + 22 + Math.random() * 40;
      const scale = night ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9]; const root = 196 * (night ? 0.75 : 1);
      const n = 4 + Math.floor(Math.random() * 4); let oct = 1;
      for (let i = 0; i < n; i++) {
        const deg = scale[Math.floor(Math.random() * scale.length)] + (Math.random() < 0.25 ? 12 : 0);
        this.pluck(root * Math.pow(2, deg / 12) * oct, this.ctx.currentTime + i * (0.9 + Math.random() * 0.7));
      }
    }
    if (t > this.nextAmb && underground) {
      this.nextAmb = t + 12 + Math.random() * 25;
      const k = Math.random();
      if (k < 0.5) { this.tone(50 + Math.random() * 20, 3, 0.09, { type: 'sine', to: 42, atk: 1.0 }); this.burst(200, 2, 0.05, { type: 'lowpass' }); }
      else this.burst(900, 0.5, 0.06, { type: 'bandpass', q: 6 });
    }
  }
  pluck(f, when) {
    const c = this.ctx; const o = c.createOscillator(), o2 = c.createOscillator(); o.type = 'sine'; o2.type = 'triangle';
    o.frequency.value = f; o2.frequency.value = f * 2.005; const g = c.createGain(), g2 = c.createGain();
    g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(0.5, when + 0.02); g.gain.exponentialRampToValueAtTime(0.0005, when + 3.5);
    g2.gain.value = 0.12; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.music); g.connect(this.verb);
    o.start(when); o2.start(when); o.stop(when + 3.6); o2.stop(when + 3.6);
  }
}
