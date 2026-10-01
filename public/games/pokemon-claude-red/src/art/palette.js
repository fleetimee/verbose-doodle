// Master palette: hue-shifted ramps (dark → light). Shadows lean blue/violet, highlights lean warm.
(function (G) {
  'use strict';
  const h = G.gfx.hex;
  const R = arr => arr.map(h);
  const PAL = {
    outline: h('#1b1a2e'),
    black: h('#0d0c16'),
    white: h('#ffffff'),
    grass: R(['#173d2f', '#1f5634', '#2f7a3a', '#48a043', '#6cbf4c', '#9dd95f', '#cdef82']),
    tallgrass: R(['#11332b', '#1a4f33', '#26703a', '#389040', '#58b04a', '#86cf58', '#bde776']),
    path: R(['#6b4d3a', '#8f6a48', '#b58c5c', '#cfa874', '#e2c28e', '#f1dbae', '#fbf0d2']),
    moss: R(['#2a2a1e', '#3e3a26', '#56502e', '#6c6436', '#827a40', '#9a9050', '#b4aa68']),
    sand: R(['#8a6a4a', '#b89060', '#d8b47a', '#e8cb90', '#f3e0ad', '#fbf1d0']),
    pave: R(['#3e3f58', '#5d6079', '#81849c', '#a3a6bb', '#c2c4d3', '#dfe0ea', '#f3f3f8']),
    water: R(['#122056', '#1b3582', '#2552ad', '#3176d0', '#4d9be6', '#7fc3f3', '#bde6ff', '#ffffff']),
    leaf: R(['#0c2322', '#143a2c', '#1d5433', '#2a723a', '#3c9142', '#5bb04d', '#8bcf5f', '#bfe882']),
    leaf2: R(['#0d2126', '#123536', '#1a4c3f', '#23664a', '#2f8252', '#46a060', '#6fc071', '#a5de8d']),
    trunk: R(['#2a1a1f', '#472a26', '#6a3f2e', '#8e5a3a', '#b07a4c']),
    rock: R(['#2b2127', '#4a3632', '#6c4f40', '#8f6c50', '#b08c64', '#cfae80', '#e8d0a2']),
    mtn: R(['#3a3036', '#5e4f4c', '#84716a', '#a8958a', '#c3b2a2', '#dacbb8', '#efe4d2']),
    stone: R(['#26263a', '#3d3e55', '#5a5c74', '#7b7e95', '#9da0b4', '#c0c2d0', '#e1e2ea']),
    wood: R(['#2e1b18', '#4f2e22', '#744630', '#9a6340', '#bd8554', '#d9a76e', '#efcb94']),
    cream: R(['#6e5c56', '#9c8878', '#c4b09a', '#ded0b8', '#f0e6d2', '#fbf6ea']),
    brick: R(['#4a2226', '#6e3230', '#94463a', '#b35f47', '#cc7d5c', '#e0a07c']),
    glass: R(['#1c2a4a', '#2c4a7a', '#4a78aa', '#7fb0d8', '#bfe0f4', '#ffffff']),
    roofs: {
      red: R(['#3d1320', '#621c26', '#8f2a2c', '#bb4034', '#dc6440', '#f09058', '#fbc07c']),
      blue: R(['#141c3e', '#1e2f66', '#2c4895', '#3c67bf', '#5a8ddf', '#86b6f0', '#bde0fb']),
      green: R(['#102a26', '#18433a', '#23604a', '#2f7f55', '#4ba062', '#79c27a', '#b1e1a0']),
      teal: R(['#0f2633', '#154050', '#1d5d6a', '#277c80', '#3d9d92', '#66bfa7', '#a6dfc4']),
      purple: R(['#24163c', '#3a2160', '#553086', '#7244a6', '#9163c2', '#b58ddb', '#dcc0f0']),
      brown: R(['#2c1a1a', '#4a2a24', '#6c3d2e', '#8f563a', '#b0744c', '#cc9868', '#e6c092']),
      gray: R(['#1f2130', '#33374a', '#4b5066', '#666c83', '#868ca2', '#aab0c2', '#d2d6e2']),
      orange: R(['#3d1a14', '#66281a', '#933b1e', '#c05724', '#e0792c', '#f2a248', '#fbcc7a']),
    },
    flower: {
      red: R(['#6e1830', '#b52a3a', '#e8524a', '#ff8a6e']),
      pink: R(['#7a2a5a', '#c04a8a', '#f07ab8', '#ffb4da']),
      yellow: R(['#7a5a14', '#c89a1e', '#f4d046', '#fff08a']),
      white: R(['#6a6a8a', '#b8bcd8', '#eef0fa', '#ffffff']),
      blue: R(['#1e2a6a', '#3450b8', '#5c84ec', '#9cc0ff']),
    },
    skin: R(['#5a2e2a', '#9a5a44', '#d08a64', '#f0b88a', '#ffdcb4']),
    ui: {
      frame: R(['#1b1a2e', '#3a3f6a', '#5b67a8', '#8aa2dc', '#c4d4f4']),
      paper: h('#fbfaf5'), paper2: h('#eceae0'), ink: h('#383848'), inkShadow: h('#d0d0c8'),
    },
  };
  G.PAL = PAL;

  // Fast tileable noise textures (value-noise fbm), sampled with integer coordinates.
  class NoiseTex {
    constructor(size, period, octaves, seed) {
      this.size = size; this.mask = size - 1;
      const d = this.data = new Float32Array(size * size);
      const hash = G.gfx.hash2;
      for (let o = 0; o < octaves; o++) {
        const p = period << o, amp = Math.pow(0.5, o);
        const step = size / p;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
          const fx = x / step, fy = y / step, xi = Math.floor(fx), yi = Math.floor(fy);
          const tx = fx - xi, ty = fy - yi, u = tx * tx * (3 - 2 * tx), v = ty * ty * (3 - 2 * ty);
          const a = hash(xi % p, yi % p, seed + o), b = hash((xi + 1) % p, yi % p, seed + o);
          const c = hash(xi % p, (yi + 1) % p, seed + o), e = hash((xi + 1) % p, (yi + 1) % p, seed + o);
          d[y * size + x] += (a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v) * amp;
        }
      }
      let mn = Infinity, mx = -Infinity;
      for (let i = 0; i < d.length; i++) { mn = Math.min(mn, d[i]); mx = Math.max(mx, d[i]); }
      for (let i = 0; i < d.length; i++) d[i] = (d[i] - mn) / (mx - mn);
    }
    at(x, y) { return this.data[((y | 0) & this.mask) * this.size + ((x | 0) & this.mask)]; }
  }
  G.NoiseTex = NoiseTex;
  G.noise = {
    big: new NoiseTex(256, 4, 4, 11),    // broad patches
    mid: new NoiseTex(256, 16, 3, 23),   // clumps
    fine: new NoiseTex(128, 32, 2, 37),  // grain
    warpX: new NoiseTex(256, 16, 2, 51),
    warpY: new NoiseTex(256, 16, 2, 67),
    water: new NoiseTex(128, 8, 3, 83),
  };
  G.rand = (x, y, s) => G.gfx.hash2(x, y, s || 0);
})(window.G);
