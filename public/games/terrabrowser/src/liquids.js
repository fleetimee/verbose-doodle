// Cellular-automaton water and lava, simulated in a window around the player.
import { CFG } from './config.js';
import { T, SOLID } from './tiles.js';
import { setTile } from './world.js';

function harden(G, x, y) {
  const wd = G.world, i = y * wd.w + x;
  wd.liq[i] = 0;
  setTile(wd, x, y, T.SCORIA);
  G.fx.particles(x * 16 + 8, y * 16 + 8, 8, '#c0c0c8', { spread: 2, grav: -0.05, life: 30 });
  G.sfx('sizzle');
}

export function updateLiquids(G) {
  const wd = G.world, p = G.player, W = wd.w, H = wd.h;
  const liq = wd.liq, lt = wd.ltype, tile = wd.tile;
  const px = Math.floor((p.x + 10) / 16), py = Math.floor((p.y + 20) / 16);
  const x0 = Math.max(1, px - CFG.liquidRX), x1 = Math.min(W - 2, px + CFG.liquidRX);
  const y0 = Math.max(1, py - CFG.liquidRY), y1 = Math.min(H - 2, py + CFG.liquidRY);
  G.liqTick = (G.liqTick || 0) + 1;
  const lavaTurn = G.liqTick % 5 === 0, ltr = (G.liqTick & 1) === 0;
  const open = i => !SOLID[tile[i]];
  for (let y = y1; y >= y0; y--) {
    for (let k = 0; k <= x1 - x0; k++) {
      const x = ltr ? x0 + k : x1 - k, i = y * W + x;
      let a = liq[i];
      if (!a) continue;
      const lava = lt[i];
      if (lava && !lavaTurn) continue;
      if (SOLID[tile[i]]) { liq[i] = 0; continue; }
      // fall
      const j = i + W;
      if (y + 1 < H && open(j)) {
        if (liq[j] && lt[j] !== lava) { harden(G, x, lava ? y : y + 1); if (lava) continue; liq[i] = Math.max(0, a - 64); continue; }
        const room = 255 - liq[j];
        if (room > 0) {
          const mv = Math.min(room, a);
          liq[j] += mv; lt[j] = lava; a -= mv; liq[i] = a;
          if (!a) continue;
        }
      }
      // spread sideways
      const l = i - 1, r = i + 1;
      const lo = open(l) && (!liq[l] || lt[l] === lava), ro = open(r) && (!liq[r] || lt[r] === lava);
      if (open(l) && liq[l] && lt[l] !== lava) { harden(G, lava ? x : x - 1, y); continue; }
      if (open(r) && liq[r] && lt[r] !== lava) { harden(G, lava ? x : x + 1, y); continue; }
      if (!lo && !ro) { if (a < 3) liq[i] = 0; continue; }
      let tot = a, cnt = 1;
      if (lo) { tot += liq[l]; cnt++; }
      if (ro) { tot += liq[r]; cnt++; }
      const avg = Math.floor(tot / cnt);
      if (Math.abs(avg - a) < 2 && (!lo || Math.abs(liq[l] - a) < 2) && (!ro || Math.abs(liq[r] - a) < 2)) { if (a < 3 && SOLID[tile[j]]) liq[i] = 0; continue; }
      let rem = tot - avg * cnt;
      liq[i] = avg + (rem > 0 ? 1 : 0); rem--;
      if (lo) { liq[l] = avg + (rem > 0 ? 1 : 0); lt[l] = lava; rem--; }
      if (ro) { liq[r] = avg + (rem > 0 ? 1 : 0); lt[r] = lava; }
      if (liq[i] < 2) liq[i] = 0;
    }
  }
}
