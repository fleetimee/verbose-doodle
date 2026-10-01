// Whole-building pixel art, drawn per connected footprint of building-labelled cells.
(function (G) {
  'use strict';
  const { rgb, hash2, mix } = G.gfx;
  const P = G.PAL;
  const BLD = new Set(['roof_house', 'roof_flat', 'wall', 'window', 'door', 'sign_poke', 'sign_mart', 'sign_gym']);
  const ROOF = new Set(['roof_house', 'roof_flat']);
  const SHADOW = rgb(140, 140, 185);

  let LBL = null;
  function findBuildings(w, h, L) {
    LBL = L;
    const seen = new Uint8Array(w * h), out = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (seen[y * w + x] || !BLD.has(L(x, y))) continue;
      const cells = [], st = [[x, y]]; seen[y * w + x] = 1;
      while (st.length) {
        const [cx, cy] = st.pop(); cells.push([cx, cy]);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || seen[ny * w + nx] || !BLD.has(L(nx, ny))) continue;
          seen[ny * w + nx] = 1; st.push([nx, ny]);
        }
      }
      // a building is painted as its bounding box, so every piece must be a clean block: split rows of
      // buildings stacked on top of each other, then by roofline, then by footing (L-shapes)
      for (const a of splitStacked(cells)) for (const b of splitByRoofline(a)) for (const c of connected(b)) out.push(...splitByBottom(c));
    }
    return out;
  }
  // a roof row below wall rows starts another building (e.g. a house tucked under a gym's corner)
  function splitStacked(cells) {
    const rows = {};
    for (const c of cells) (rows[c[1]] = rows[c[1]] || []).push(c);
    const ys = Object.keys(rows).map(Number).sort((a, b) => a - b), roofy = y => rows[y].filter(([x]) => ROOF.has(LBL(x, y))).length * 2 > rows[y].length;
    for (let i = 1; i < ys.length; i++) if (ys[i] === ys[i - 1] + 1 && roofy(ys[i]) && !roofy(ys[i - 1])) {
      const cut = ys[i];
      return [cells.filter(c => c[1] < cut), ...splitStacked(cells.filter(c => c[1] >= cut))];
    }
    return [cells];
  }
  function connected(cells) {
    const left = new Set(cells.map(c => c[0] + ',' + c[1])), out = [];
    for (const c of cells) {
      const k0 = c[0] + ',' + c[1]; if (!left.has(k0)) continue;
      left.delete(k0); const part = [], st = [c];
      while (st.length) { const [x, y] = st.pop(); part.push([x, y]); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (left.has(k)) { left.delete(k); st.push([x + dx, y + dy]); } } }
      out.push(part);
    }
    return out;
  }
  // columns whose footing (bottom row) differs are separate buildings; one-column slivers join a neighbour
  function splitByBottom(cells) {
    const bot = {};
    for (const [x, y] of cells) bot[x] = Math.max(bot[x] === undefined ? -1e9 : bot[x], y);
    const xs = Object.keys(bot).map(Number).sort((a, b) => a - b), groups = []; let cur = null;
    for (const x of xs) { if (!cur || bot[x] !== cur.bot || x !== cur.last + 1) { cur = { bot: bot[x], xs: new Set(), last: x }; groups.push(cur); } cur.xs.add(x); cur.last = x; }
    if (groups.length <= 1) return [cells];
    for (let i = groups.length - 1; i >= 0; i--) if (groups[i].xs.size < 2 && groups.length > 1) { const j = i > 0 ? i - 1 : i + 1; for (const x of groups[i].xs) groups[j].xs.add(x); groups.splice(i, 1); }
    return groups.map(g => cells.filter(([x]) => g.xs.has(x)));
  }
  // Split a footprint into separate buildings where the topmost row changes between columns
  function splitByRoofline(cells) {
    const top = {};
    for (const [x, y] of cells) top[x] = Math.min(top[x] === undefined ? 1e9 : top[x], y);
    const xs = Object.keys(top).map(Number).sort((a, b) => a - b);
    const groups = []; let cur = null;
    for (const x of xs) {
      if (!cur || top[x] !== cur.top || x !== cur.last + 1) { cur = { top: top[x], xs: new Set(), last: x }; groups.push(cur); }
      cur.xs.add(x); cur.last = x;
    }
    if (groups.length <= 1) return [cells];
    // merge narrow slivers (e.g. sloped roof ends) into their neighbour
    for (let i = groups.length - 1; i >= 0; i--) if (groups[i].xs.size < 2 && groups.length > 1) { const j = i > 0 ? i - 1 : i + 1; for (const x of groups[i].xs) groups[j].xs.add(x); groups.splice(i, 1); }
    return groups.map(g => cells.filter(([x]) => g.xs.has(x)));
  }

  // Split a footprint into stacked sub-buildings when a roof row appears below wall rows
  function describe(cells, L) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of cells) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    const kinds = new Set(cells.map(([x, y]) => L(x, y)));
    let roofRows = 0;
    for (let y = y0; y <= y1; y++) {
      let r = 0, n = 0;
      for (let x = x0; x <= x1; x++) { const l = L(x, y); if (BLD.has(l)) { n++; if (ROOF.has(l)) r++; } }
      if (r > n / 2) roofRows++; else break;
    }
    let type = 'house';
    if (!kinds.has('roof_house') && !kinds.has('roof_flat') && !kinds.has('door')) type = 'terrace';
    if (kinds.has('sign_poke')) type = 'center';
    else if (kinds.has('sign_mart')) type = 'mart';
    else if (kinds.has('sign_gym')) type = 'gym';
    else if (kinds.has('roof_flat')) type = 'big';
    return { x0, y0, x1, y1, roofRows: Math.max(1, roofRows), type, cells };
  }

  const HOUSE_ROOFS = ['red', 'blue', 'green', 'orange', 'teal', 'purple', 'brown'];

  function paintTerrace(s, up, b, L, ox, oy) {
    const ST = P.stone, set = new Set(b.cells.map(([x, y]) => x + ',' + y));
    for (const [cx, cy] of b.cells) {
      const px = ox + cx * 16, py = oy + cy * 16;
      const upIn = set.has(cx + ',' + (cy - 1)), dnIn = set.has(cx + ',' + (cy + 1)), lf = set.has((cx - 1) + ',' + cy), rt = set.has((cx + 1) + ',' + cy);
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        let c;
        const faceStart = upIn ? -1 : 6;
        if (!dnIn && y >= 6) { // front face: stone blocks
          const row = Math.floor((y - 6) / 5), off = (row % 2) * 8, bx = (x + off + cx * 16) % 16, by = (y - 6) % 5;
          c = by === 4 || bx === 0 ? ST[2] : by === 0 ? ST[5] : ST[4];
          if (y === 15) c = P.outline;
        } else { // top surface
          c = ST[5]; if ((x + y + cx * 16) % 9 === 0) c = ST[6];
          if (!upIn && y === 0) c = P.outline; if (!upIn && y === 1) c = ST[6];
        }
        if (!lf && x === 0) c = P.outline; if (!rt && x === 15) c = P.outline;
        s.pset(px + x, py + y, c);
      }
      if (!rt) for (let y = 2; y < 16; y++) { s.pmul(px + 16, py + y, SHADOW); s.pmul(px + 17, py + y, SHADOW); }
      if (!dnIn) for (let x = 0; x < 16; x++) s.pmul(px + x, py + 16, SHADOW);
    }
  }
  function paintBuilding(s, up, b, L, ox, oy, opts) {
    // ox,oy: pixel offset of cell (0,0) in surface s
    opts = opts || {};
    if (b.type === 'terrace') return paintTerrace(s, up, b, L, ox, oy);
    const px0 = ox + b.x0 * 16, py0 = oy + b.y0 * 16;
    const W = (b.x1 - b.x0 + 1) * 16, H = (b.y1 - b.y0 + 1) * 16;
    const wallRows = b.y1 - b.y0 + 1 - b.roofRows;
    const seed = hash2(b.x0 + (opts.wx || 0), b.y0 + (opts.wy || 0), 7);
    let roofName = opts.roof || (b.type === 'center' ? 'red' : b.type === 'mart' ? 'blue' : b.type === 'gym' ? 'teal' : b.type === 'big' ? ['gray', 'brown', 'teal', 'purple'][Math.floor(seed * 4)] : HOUSE_ROOFS[Math.floor(seed * HOUSE_ROOFS.length)]);
    const RF = P.roofs[roofName];
    // roof takes the roof rows plus part of the first wall row
    const roofTop = py0 - 5;
    const roofBottom = py0 + b.roofRows * 16 + (wallRows >= 2 ? 5 : 1);
    const wallTop = roofBottom;
    const wallBottom = py0 + H;

    // ---- cast shadow on the ground (right side and bottom) ----
    for (let y = py0 + 4; y < wallBottom + 3; y++) for (let x = px0 + W; x < px0 + W + 4; x++) if ((x - (px0 + W)) < 4 - Math.max(0, y - wallBottom)) s.pmul(x, y, SHADOW);
    for (let x = px0 + 1; x < px0 + W + 1; x++) { s.pmul(x, wallBottom, SHADOW); s.pmul(x, wallBottom + 1, SHADOW); }

    // ---- walls ----
    const style = opts.wall || (b.type === 'house' ? 'siding' : b.type === 'big' ? 'brick' : b.type === 'gym' ? 'stone' : 'plaster');
    for (let y = wallTop; y < wallBottom; y++) for (let x = px0; x < px0 + W; x++) {
      const lx = x - px0, ly = y - wallTop;
      let c;
      if (style === 'siding') {
        const k = ly % 4;
        c = k === 0 ? P.cream[5] : k === 3 ? P.cream[2] : P.cream[4];
        if (lx < 2 || lx >= W - 2) c = lx === 0 || lx === W - 1 ? P.wood[1] : P.wood[3];
      } else if (style === 'plaster') {
        c = P.cream[5];
        if (ly < 3) c = b.type === 'center' ? P.roofs.red[3] : P.roofs.blue[3];
        if (ly === 3) c = b.type === 'center' ? P.roofs.red[1] : P.roofs.blue[1];
        if (lx === 0 || lx === W - 1) c = P.cream[2];
      } else if (style === 'stone') {
        const row = Math.floor(ly / 5), off = (row % 2) * 6;
        const bx = (lx + off) % 12, by = ly % 5;
        c = P.cream[3];
        if (by === 4 || bx === 0) c = P.cream[1]; else if (by === 0 || bx === 1) c = P.cream[4];
        if (lx < 3 || lx >= W - 3) c = lx === 0 || lx === W - 1 ? P.stone[1] : P.stone[4];
      } else if (style === 'lab') {
        c = P.cream[5];
        if (ly % 8 === 7) c = P.cream[3];
        if (ly >= 2 && ly < 4) c = P.roofs.teal[4];
        if (ly === 4) c = P.roofs.teal[2];
        if ((lx % 16) === 0) c = P.cream[3];
        if (lx === 0 || lx === W - 1) c = P.stone[3];
      } else if (style === 'panel') {
        c = P.stone[5];
        if (lx % 8 === 0) c = P.stone[3]; else if (lx % 8 === 1) c = P.stone[6];
        if (ly % 12 === 11) c = P.stone[3];
        if (lx === 0 || lx === W - 1) c = P.stone[2];
      } else { // brick
        const row = Math.floor(ly / 3), off = (row % 2) * 3;
        const bx = (lx + off) % 6, by = ly % 3;
        c = P.brick[3];
        if (by === 2 || bx === 0) c = P.brick[1]; else if (by === 0) c = P.brick[4];
        if (hash2(Math.floor((lx + off) / 6), row, 3) < 0.2 && by === 1 && bx > 0) c = P.brick[2];
        if (lx === 0 || lx === W - 1) c = P.brick[0];
      }
      s.pset(x, y, c);
    }
    // foundation
    for (let x = px0; x < px0 + W; x++) { s.pset(x, wallBottom - 2, P.stone[3]); s.pset(x, wallBottom - 1, P.stone[1]); }
    // under-eave shadow
    for (let x = px0; x < px0 + W; x++) { s.pmul(x, wallTop, SHADOW); s.pmul(x, wallTop + 1, SHADOW); s.pmul(x, wallTop + 1, rgb(220, 220, 240)); }

    // ---- windows, doors, signs ----
    const wallRowsTop = b.y0 + b.roofRows;
    for (const [cx, cy] of b.cells) {
      const l = L(cx, cy);
      const px = ox + cx * 16, py = oy + cy * 16;
      const visTop = Math.max(py, wallTop + 2);
      const isDoor = l === 'door' || (opts.isDoor && opts.isDoor(cx, cy));
      if (isDoor) paintDoor(s, px, py, b.type, wallBottom);
      else if (l === 'window') paintWindow(s, px, visTop, py + 16, b.type, cy === b.y1);
      else if (l === 'sign_poke') paintCenterSign(s, px, visTop, py + 16);
      else if (l === 'sign_mart') paintMartSign(s, px, visTop, py + 16);
      else if (l === 'sign_gym') paintGymSign(s, px, visTop, py + 16, L(cx - 1, cy) === 'sign_gym');
    }

    // ---- roof ----
    const rx0 = px0 - 2, rx1 = px0 + W + 2, rw = rx1 - rx0;
    const rh = roofBottom - roofTop;
    const flat = b.type === 'big' && !opts.pitched;
    for (let y = roofTop; y < roofBottom; y++) {
      const ly = y - roofTop;
      const tgt = y < py0 ? up : s; // overhang above the building goes on the upper layer
      // hip slant width grows toward the bottom
      const slant = Math.min(rw / 2 - 2, Math.floor((ly + 2) * 0.55) + 2);
      for (let x = rx0; x < rx1; x++) {
        const lx = x - rx0;
        let c;
        if (flat) {
          // flat roof with parapet and panel grid
          if (ly < 2 || lx < 2 || lx >= rw - 2) c = ly === 0 || lx === 0 ? RF[5] : lx === rw - 1 ? RF[1] : RF[4];
          else if (ly >= rh - 4) c = ly === rh - 1 ? P.outline : ly === rh - 2 ? RF[1] : RF[3];
          else {
            const px = (lx - 2) % 12, py = (ly - 2) % 8;
            c = RF[4];
            if (px === 0 || py === 0) c = RF[3]; else if ((px + py) % 7 === 0) c = RF[5];
            if (hash2(Math.floor(lx / 12), Math.floor(ly / 8), 9) < 0.15) c = RF[3];
          }
        } else {
          const sh = Math.floor(ly / 4), k = ly % 4;
          const tileX = Math.floor((lx + (sh % 2) * 3) / 6);
          c = k === 3 ? RF[1] : k === 0 ? RF[5] : RF[hash2(tileX, sh, 4) < 0.25 ? 3 : 4];
          if (k !== 3 && (lx + (sh % 2) * 3) % 6 === 0) c = RF[2];
          // hip ends
          if (lx < slant) c = (lx === slant - 1) ? RF[6] : (k === 3 ? RF[3] : RF[5]);
          if (lx >= rw - slant) c = (lx === rw - slant) ? RF[1] : (k === 3 ? RF[1] : RF[2]);
          if (ly < 2) c = ly === 0 ? RF[1] : RF[6]; // ridge
          if (ly === rh - 1) c = P.outline;
          if (ly === rh - 2) c = RF[1];
        }
        if (lx === 0 || lx === rw - 1) c = P.outline;
        if (ly === 0 && (lx < 1 || lx > rw - 2)) continue;
        tgt.pset(x, y, c);
      }
    }
    // top outline
    for (let x = rx0 + 1; x < rx1 - 1; x++) (roofTop < py0 ? up : s).pset(x, roofTop - 1, P.outline);
    // emblem on center/mart roofs
    if (b.type === 'center') emblemBall(s, up, px0 + W / 2, roofTop + Math.floor(rh / 2), py0);
    if (flat) rooftopDetails(s, up, rx0, roofTop, rw, rh, seed, py0, RF);
    if (opts.dish) {
      const cx = px0 + W - 18, cy = roofTop + 3;
      for (let y = 0; y < 9; y++) for (let x = 0; x < 11; x++) {
        const dx = (x - 5) / 5.5, dy = (y - 3) / 4;
        const t = cy + y < py0 ? up : s;
        if (dx * dx + dy * dy <= 1 && y < 6) t.pset(cx + x, cy + y, dx * dx + dy * dy > 0.7 ? P.outline : (x + y < 7 ? P.white : P.stone[4]));
      }
      for (let y = 5; y < 10; y++) s.pset(cx + 5, cy + y, P.stone[2]);
      for (let x = 2; x < 9; x++) s.pset(cx + x, cy + 10, P.stone[1]);
      s.pset(cx + 5, cy + 2, P.roofs.red[4]);
    }
    // chimney on houses
    if (b.type === 'house' && W >= 48) {
      const cx = px0 + Math.floor(W * (seed < 0.5 ? 0.72 : 0.22)), cy = roofTop - 5;
      for (let y = cy; y < cy + 9; y++) for (let x = cx; x < cx + 6; x++) {
        const t = y < py0 ? up : s;
        let c = (y - cy) % 3 === 2 ? P.brick[1] : x === cx ? P.brick[4] : x === cx + 5 ? P.brick[1] : P.brick[3];
        if (y === cy) c = P.stone[4];
        if (x === cx - 0 && y === cy) c = P.stone[5];
        t.pset(x, y, c);
      }
      for (let x = cx - 1; x < cx + 7; x++) up.pset(x, cy - 1, P.outline);
      for (let y = cy; y < cy + 9; y++) { (y < py0 ? up : s).pset(cx - 1, y, P.outline); (y < py0 ? up : s).pset(cx + 6, y, P.outline); }
    }
    // side outlines of walls
    for (let y = wallTop; y < wallBottom; y++) { s.pset(px0 - 1, y, P.outline); s.pset(px0 + W, y, P.outline); }
    for (let x = px0 - 1; x <= px0 + W; x++) s.pset(x, wallBottom, P.outline);
  }

  function emblemBall(s, up, cx, cy, py0) {
    const t = (y) => (y < py0 ? up : s);
    for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
      const d = x * x + y * y; if (d > 30) continue;
      let c = y < 0 ? P.roofs.red[4] : P.white;
      if (y < -2 && x < -1) c = P.roofs.red[5];
      if (y === 0 || d > 22) c = P.outline;
      if (x * x + y * y <= 3) c = d <= 1 ? P.white : P.outline;
      t(cy + y).pset(cx + x, cy + y, c);
    }
  }

  function rooftopDetails(s, up, x0, y0, w, h, seed, py0, RF) {
    const n = Math.max(1, Math.floor(w / 40));
    for (let i = 0; i < n; i++) {
      const bx = x0 + 8 + Math.floor(hash2(i, 1, seed * 100) * (w - 24)), by = y0 + 4 + Math.floor(hash2(i, 2, seed * 100) * Math.max(1, h - 14));
      for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) {
        const t = by + y < py0 ? up : s;
        t.pset(bx + x, by + y, y === 0 ? P.stone[5] : x === 7 || y === 5 ? P.stone[1] : P.stone[3]);
      }
      for (let x = 1; x < 7; x += 2) s.pset(bx + x, by + 2, P.stone[1]);
      for (let x = 0; x < 9; x++) s.pmul(bx + x + 1, by + 6, SHADOW);
    }
  }

  function paintWindow(s, px, top, bottom, type, lowRow) {
    const h = Math.min(9, bottom - top - 4);
    if (h < 4) return;
    const wy = top + Math.max(1, Math.floor((bottom - top - h) / 2) - 1);
    const x0 = px + 3, w = 10;
    const frame = type === 'house' ? P.wood[2] : P.stone[2];
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      let c;
      if (y === -1 || y === h || x === -1 || x === w) c = P.outline;
      else if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || (x === w >> 1 && type === 'house')) c = frame;
      else {
        const g = (x - y + 20) % 9;
        c = g < 2 ? P.glass[4] : (y < h / 2 ? P.glass[2] : P.glass[1]);
        if (g === 2) c = P.glass[3];
      }
      s.pset(x0 + x, wy + y, c);
    }
    // sill
    for (let x = -2; x <= w + 1; x++) { s.pset(x0 + x, wy + h + 1, x === -2 || x === w + 1 ? P.outline : P.cream[5]); s.pmul(x0 + x, wy + h + 2, SHADOW); }
    // flower box on houses
    if (type === 'house') for (let x = 0; x < w; x += 2) { s.pset(x0 + x, wy + h, P.flower.red[2]); s.pset(x0 + x + 1, wy + h, P.leaf[5]); }
  }

  function paintDoor(s, px, py, type, wallBottom) {
    const bottom = wallBottom - 1;
    if (type === 'center' || type === 'mart' || type === 'big') {
      const h = 14, x0 = px + 1, w = 14, y0 = bottom - h;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let c;
        if (y === 0 || x === 0 || x === w - 1) c = P.outline;
        else if (y === 1 || x === 1 || x === w - 2) c = P.stone[4];
        else if (x === 7 || x === 6) c = x === 6 ? P.stone[2] : P.stone[4];
        else { const g = (x + y) % 7; c = g < 2 ? P.glass[4] : y < 6 ? P.glass[2] : P.glass[1]; }
        s.pset(x0 + x, y0 + y, c);
      }
      // mat
      for (let x = 2; x < 14; x++) { s.pset(px + x, bottom, type === 'mart' ? P.roofs.blue[2] : P.roofs.red[2]); s.pset(px + x, bottom + 1, P.outline); }
    } else {
      const h = 13, x0 = px + 3, w = 10, y0 = bottom - h;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let c;
        if (y === 0 || x === 0 || x === w - 1) c = P.outline;
        else if (x === 1) c = P.wood[4];
        else if (x === w - 2) c = P.wood[1];
        else c = (x % 3 === 0) ? P.wood[2] : P.wood[3];
        if (y > 2 && y < 6 && x > 2 && x < w - 3) c = y === 3 ? P.glass[3] : P.glass[2];
        s.pset(x0 + x, y0 + y, c);
      }
      s.pset(x0 + w - 3, y0 + 8, P.flower.yellow[2]);
      for (let x = 0; x < w; x++) s.pset(x0 + x, y0 + h, P.stone[4]);
    }
  }

  function paintCenterSign(s, px, top, bottom) {
    const y0 = top + 1, h = Math.min(11, bottom - top - 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < 14; x++) {
      let c = P.white;
      if (y === 0 || x === 0 || y === h - 1 || x === 13) c = P.outline;
      s.pset(px + 1 + x, y0 + y, c);
    }
    // small pokeball
    const cx = px + 8, cy = y0 + Math.floor(h / 2);
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const d = x * x + y * y; if (d > 11) continue;
      let c = y < 0 ? P.roofs.red[4] : P.white;
      if (y === 0 || d > 8) c = P.outline;
      if (d <= 1) c = y === 0 && x === 0 ? P.white : P.outline;
      s.pset(cx + x, cy + y, c);
    }
  }
  function paintMartSign(s, px, top, bottom) {
    const y0 = top + 1, h = Math.min(11, bottom - top - 3);
    for (let y = 0; y < h; y++) for (let x = 0; x < 14; x++) {
      let c = P.roofs.blue[3];
      if (y === 0 || x === 0 || y === h - 1 || x === 13) c = P.outline;
      else if (y === 1) c = P.roofs.blue[5];
      s.pset(px + 1 + x, y0 + y, c);
    }
    // bottle glyph
    const cx = px + 8, cy = y0 + Math.floor(h / 2) - 2;
    const g = ['.##.', '.##.', '####', '#..#', '####'];
    g.forEach((r, yy) => { for (let xx = 0; xx < 4; xx++) if (r[xx] === '#') s.pset(cx - 2 + xx, cy + yy, P.white); });
  }
  function paintGymSign(s, px, top, bottom, second) {
    const y0 = top + 1;
    const letters = second ? ['#...#', '##.##', '#.#.#', '#...#', '#...#'] : ['.###..#...#', '#.....#...#', '#.##...#.#.', '#..#....#..', '.###....#..'];
    for (let y = -1; y < 7; y++) for (let x = second ? -1 : 1; x < 16; x++) s.pset(px + x, y0 + y, y === -1 || y === 6 ? P.outline : P.stone[4]);
    letters.forEach((r, yy) => { for (let xx = 0; xx < r.length; xx++) if (r[xx] === '#') s.pset(px + (second ? 1 : 3) + xx, y0 + yy, P.roofs.red[2]); });
  }

  G.buildings = { findBuildings, describe, paintBuilding, BLD };
})(window.G);
