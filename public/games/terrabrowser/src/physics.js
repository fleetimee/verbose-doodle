// AABB vs tile collision for all bodies (player, enemies, NPCs, dropped items).
import { T, SOLID } from './tiles.js';

const TS = 16;
function solid(wd, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= wd.w || ty >= wd.h) return true;
  return SOLID[wd.tile[ty * wd.w + tx]] === 1;
}
export function rectSolid(wd, x, y, w, h) {
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.001) / TS);
  const y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.001) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solid(wd, tx, ty)) return true;
  return false;
}
function platformRow(wd, x, w, ty) {
  if (ty < 0 || ty >= wd.h) return false;
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.001) / TS);
  for (let tx = x0; tx <= x1; tx++) if (tx >= 0 && tx < wd.w && wd.tile[ty * wd.w + tx] === T.PLATFORM) return true;
  return false;
}

// body: {x,y,w,h,vx,vy,onGround,drop,stepUp,stepOff}
export function moveBody(wd, b) {
  b.hitX = false; b.hitY = false;
  // horizontal
  if (b.vx) {
    const n = Math.ceil(Math.abs(b.vx) / 7), dx = b.vx / n;
    for (let s = 0; s < n; s++) {
      const nx = b.x + dx;
      if (!rectSolid(wd, nx, b.y, b.w, b.h)) { b.x = nx; continue; }
      // auto-step up one tile ledge
      if (b.stepUp && b.onGround && !rectSolid(wd, nx, b.y - TS, b.w, b.h)) {
        const ny = Math.floor((b.y + b.h - TS) / TS) * TS - b.h + TS - 0.01;
        if (!rectSolid(wd, nx, ny, b.w, b.h)) { b.stepOff = (b.stepOff || 0) + (b.y - ny); b.y = ny; b.x = nx; continue; }
      }
      if (dx > 0) b.x = Math.floor((nx + b.w) / TS) * TS - b.w - 0.01;
      else b.x = (Math.floor(nx / TS) + 1) * TS + 0.01;
      b.vx = 0; b.hitX = true;
      break;
    }
  }
  // vertical
  b.onGround = false;
  if (b.vy) {
    const n = Math.ceil(Math.abs(b.vy) / 7), dy = b.vy / n;
    for (let s = 0; s < n; s++) {
      const ny = b.y + dy;
      if (rectSolid(wd, b.x, ny, b.w, b.h)) {
        if (dy > 0) { b.y = Math.floor((ny + b.h) / TS) * TS - b.h - 0.01; b.onGround = true; }
        else b.y = (Math.floor(ny / TS) + 1) * TS + 0.01;
        b.vy = 0; b.hitY = true;
        break;
      }
      if (dy > 0 && !(b.drop > 0)) {
        const row = Math.floor((ny + b.h) / TS);
        if ((b.y + b.h) <= row * TS + 0.02 && platformRow(wd, b.x, b.w, row)) {
          b.y = row * TS - b.h - 0.01; b.vy = 0; b.onGround = true; b.hitY = true;
          break;
        }
      }
      b.y = ny;
    }
  }
  if (!b.onGround && b.vy === 0) {
    // resting check (vy was zero this tick)
    if (rectSolid(wd, b.x, b.y + 0.05, b.w, b.h) || (!(b.drop > 0) && platformRow(wd, b.x, b.w, Math.floor((b.y + b.h + 0.05) / TS)) && ((b.y + b.h) % TS) > TS - 0.1)) b.onGround = true;
  }
  if (b.drop > 0) b.drop--;
}

// liquid info at a point: returns {amt, lava}
export function liquidAt(wd, px, py) {
  const x = Math.floor(px / TS), y = Math.floor(py / TS);
  if (x < 0 || y < 0 || x >= wd.w || y >= wd.h) return null;
  const i = y * wd.w + x;
  if (wd.liq[i] < 40) return null;
  return { amt: wd.liq[i], lava: wd.ltype[i] === 1 };
}
export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
