import * as THREE from 'three';
import { BIOME } from './worldgen.js';

// Rain / snow / thunder. Precipitation columns respect roofs via chunk heightmaps.
export class Weather {
  constructor(scene, game) {
    this.game = game; this.scene = scene;
    this.intensity = 0; this.target = 0; this.timer = 120 + Math.random() * 240; this.flash = 0; this.thunderIn = -1;
    this.N = 1400;
    this.off = new Float32Array(this.N * 3); for (let i = 0; i < this.N; i++) { this.off[i * 3] = (Math.random() - 0.5) * 34; this.off[i * 3 + 1] = Math.random() * 30; this.off[i * 3 + 2] = (Math.random() - 0.5) * 34; }
    this.pos = new Float32Array(this.N * 6);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    this.rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xa9c4ff, transparent: true, opacity: 0.5, depthWrite: false })); this.rain.frustumCulled = false; this.rain.visible = false; scene.add(this.rain);
    const g2 = new THREE.BufferGeometry(); this.spos = new Float32Array(this.N * 3); g2.setAttribute('position', new THREE.BufferAttribute(this.spos, 3)); g2.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    this.snow = new THREE.Points(g2, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false })); this.snow.frustumCulled = false; this.snow.visible = false; scene.add(this.snow);
    this.rainNode = null;
  }
  get raining() { return this.intensity > 0.45; }
  update(dt, cam, player, world, sound) {
    const g = this.game;
    // state machine (never rains in the desert)
    const ch = world.getChunk(Math.floor(player.x / 16), Math.floor(player.z / 16));
    const bio = ch ? ch.biome[(Math.floor(player.x) & 15) + ((Math.floor(player.z) & 15) << 4)] : 0;
    const dry = bio === BIOME.DESERT;
    this.timer -= dt;
    if (this.timer <= 0) { this.target = this.target > 0 ? 0 : (Math.random() < 0.85 ? 0.6 + Math.random() * 0.4 : 0); this.timer = this.target > 0 ? 90 + Math.random() * 150 : 150 + Math.random() * 300; }
    const tgt = dry ? 0 : this.target;
    this.intensity += (tgt - this.intensity) * Math.min(1, dt * 0.25);
    if (Math.abs(this.intensity - tgt) < 0.003) this.intensity = tgt;
    const I = this.intensity, snowy = bio === BIOME.SNOWY || (bio === BIOME.MOUNTAIN && player.y > 74);
    this.rain.visible = I > 0.03 && !snowy; this.snow.visible = I > 0.03 && snowy;
    if (I > 0.03) {
      const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z; const shown = Math.floor(this.N * Math.min(1, I * 1.1));
      const fall = snowy ? 3.2 : 26, t = g.time;
      for (let i = 0; i < this.N; i++) {
        let oy = this.off[i * 3 + 1] - fall * dt * (snowy ? 1 : 1) * (0.85 + (i % 7) * 0.05); if (oy < -8) oy += 30; this.off[i * 3 + 1] = oy;
        const ox = this.off[i * 3], oz = this.off[i * 3 + 2];
        let wx = cx + ox, wz = cz + oz, wy = cy + oy;
        let hide = i >= shown;
        if (!hide) {
          const c = world.getChunk(Math.floor(wx / 16), Math.floor(wz / 16));
          if (c) { const top = c.hm[(Math.floor(wx) & 15) + ((Math.floor(wz) & 15) << 4)]; if (wy < top + 1.2) hide = true; }
          if (wy < cy - 9) hide = true;
        }
        if (snowy) { const k = i * 3; this.spos[k] = hide ? 0 : wx + Math.sin(t + i) * 0.3; this.spos[k + 1] = hide ? -1000 : wy; this.spos[k + 2] = hide ? 0 : wz + Math.cos(t * 0.8 + i) * 0.3; }
        else { const k = i * 6; if (hide) { this.pos[k + 1] = this.pos[k + 4] = -1000; } else { this.pos[k] = wx; this.pos[k + 1] = wy; this.pos[k + 2] = wz; this.pos[k + 3] = wx - 0.06; this.pos[k + 4] = wy + 0.75; this.pos[k + 5] = wz - 0.03; } }
      }
      if (snowy) this.snow.geometry.attributes.position.needsUpdate = true; else this.rain.geometry.attributes.position.needsUpdate = true;
      this.rain.material.opacity = 0.25 + I * 0.3;
    }
    // sound
    if (sound.ctx) {
      if (I > 0.05 && !this.rainNode) {
        const c = sound.ctx, src = c.createBufferSource(); src.buffer = sound.noise; src.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.4;
        const gn = c.createGain(); gn.gain.value = 0; src.connect(f); f.connect(gn); gn.connect(sound.sfx); src.start(); this.rainNode = { src, gn };
      }
      if (this.rainNode) { const under = player.headWater ? 0.15 : 1; this.rainNode.gn.gain.value = I * 0.16 * under * (snowy ? 0.2 : 1); }
    }
    // thunder
    if (I > 0.8 && !snowy && this.thunderIn < 0 && Math.random() < dt / 25) { this.flash = 1; this.thunderIn = 0.6 + Math.random() * 2.2; }
    if (this.thunderIn >= 0) { this.thunderIn -= dt; if (this.thunderIn < 0) { sound.play('explode', { vol: 0.5 }); this.thunderIn = -1; g.shake = Math.max(g.shake || 0, 0.06); } }
    this.flash = Math.max(0, this.flash - dt * (this.flash > 0.5 ? 6 : 1.4));
  }
}
