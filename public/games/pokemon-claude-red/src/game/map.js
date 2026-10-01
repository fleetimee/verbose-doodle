// Map model: semantic labels, collision, warps, connections and world placement.
(function (G) {
  'use strict';
  const D = () => G.MAPDATA;
  const cache = {};

  const GROUND = {
    deck: 'water', ship_wall: 'water', pillar: 'pave', statue: 'pave', crate: 'pave', machine: 'pave',
    grass: 'grass', tall_grass: 'grass', flowers: 'grass', cut_tree: 'grass',
    path: 'path', path_t: 'path', path_tufts: 'path', curb: 'path', stairs_wood: 'path',
    sand: 'sand', pavement: 'pave', water: 'water', bridge: 'water', cliff_top: 'rock',
  };

  class GameMap {
    constructor(name) {
      const d = D().maps[name];
      if (!d) throw new Error('Unknown map ' + name);
      this.name = name; this.d = d;
      this.w = d.w; this.h = d.h;
      this.tsName = d.tsc; this.tsFile = d.ts;
      this.ts = D().tilesets[d.tsc];
      this.quads = D().quads[d.ts];
      const labels = (G.LABELS && G.LABELS[d.ts]) || [];
      this.labelOf = q => labels[q] || 'unknown';
      this.labels = d.cells.map(this.labelOf);
      if (d.cnst.startsWith('ROUTE_')) this.labels = this.labels.map(l => l === 'pavement' ? 'path' : l);
      // per-map label fixes for shared tileset quads (see tools/LABEL_NOTES.md)
      if (/Lab|SilphCo|Museum|Lobby|Gate|HallOfFame|LoreleisRoom/.test(name) && d.ts !== 'overworld') this.labels = this.labels.map(l => l === 'floor_stone' ? 'floor_tile' : l);
      if (name === 'FightingDojo') this.labels = this.labels.map(l => l === 'floor_stone' ? 'floor_dojo' : l);
      if (/LancesRoom|ChampionsRoom|HallOfFame/.test(name)) this.labels = this.labels.map(l => l === 'floor_stone' || l === 'floor_tile' ? 'floor_carpet' : l);
      if (name === 'GameCorner') this.labels = this.labels.map(l => l === 'counter' ? 'slots' : l);
      // Koga's gym walls are invisible in Red; here they show as faint glass panes (same maze)
      if (name === 'FuchsiaGym') this.labels = d.cells.map((q, i) => q === 24 ? 'glass' : this.labels[i]);
      // Red's room: a MacBook Pro running Claude where the SNES was, WORLD OF CLAUDECRAFT on the TV
      if (name === 'RedsHouse2F') this.labels = this.labels.map(l => l === 'console' ? 'laptop' : l === 'tv' ? 'tv_woc' : l);
      // GAME FREAK's dev room is the LEVY ST. office: Claude on every screen, the logo on the wall, a surfboard
      if (name === 'CeladonMansion3F') this.labels = this.labels.map((l, i) => l === 'pc' ? 'pc_claude' : l === 'wall_deco' ? 'levy_sign' : i === 2 * d.w + 2 ? 'wall_surf' : l);
      // the plateau tileset draws Route 23's stepped rock terraces with the same tiles as the League building:
      // outside the League's own footprint they are cliffs (tops / faces), with Victory Road's entrances cut in
      if (d.ts === 'plateau') {
        const TOP = new Set([0, 1, 2, 3, 4, 5, 6, 12, 16]), FACE = new Set([7, 8, 17]);
        this.labels = d.cells.map((q, i) => {
          const x = i % d.w, y = Math.floor(i / d.w);
          if (name === 'IndigoPlateau' && x >= 6 && x <= 13 && y <= 5) return this.labels[i];
          return TOP.has(q) ? 'cliff_top' : FACE.has(q) ? 'cliff' : q === 11 ? 'cave_door' : this.labels[i];
        });
      }
      this.borderLabels = d.border.map(this.labelOf);
      if (d.ts === 'overworld' || d.ts === 'plateau') this.borderLabels = this.borderLabels.map(l => (l === 'tall_grass' || l === 'grass' || l === 'path' || l === 'path_tufts' || l === 'tree') ? 'tree2' : l);
      this.outdoor = d.ts === 'overworld' || d.ts === 'plateau';
      this.interior = !['overworld', 'plateau', 'forest', 'ship_port'].includes(d.ts);
      this.world = null; // {x,y} in cells for outdoor maps
      this.conns = d.conns;
      this.warps = d.warps; this.signs = d.signs; this.objs = d.objs; this.hidden = d.hidden;
      for (const o of this.objs) { if (G.OBJ_SPRITE_OVERRIDE && G.OBJ_SPRITE_OVERRIDE[o.id]) o.sprite = G.OBJ_SPRITE_OVERRIDE[o.id]; if (G.OBJ_SPECIES_OVERRIDE && G.OBJ_SPECIES_OVERRIDE[o.id]) o.species = G.OBJ_SPECIES_OVERRIDE[o.id]; }
      // per-cell collision tile (bottom-left 8x8 tile of the 16x16 cell)
      this.coll = d.cells.map(q => this.quads[q][2]);
      this.pass = new Set(this.ts.pass);
      this.extraBlock = new Set(); // cells blocked by script (e.g. removed cut trees toggled)
      this.overrides = {}; // cell index -> label override (e.g. cut tree removed -> grass)
      // indoors, a furniture (or cave ledge) cell you can walk on is just the strip in front of the piece (the GB
      // drew its edge there): draw it as floor so the table / PC / counter / ledge only covers the cells that block you
      if (this.interior) {
        const FURN = new Set(['table', 'counter', 'pc', 'desk', 'bench', 'cave_ledge']), FLOOR = /^(floor|cave_floor|cave_high|ship_floor|mat)/;
        this.labels = this.labels.map((l, i) => {
          if (!FURN.has(l) || !this.pass.has(this.coll[i])) return l;
          const x = i % this.w, y = Math.floor(i / this.w);
          for (let r = 1; r <= 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const k = this.label(x + dx, y + dy); if (k && FLOOR.test(k) && k !== 'mat') return k;
          }
          return 'floor_tile';
        });
      }
    }
    inside(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
    label(x, y) {
      if (this.inside(x, y)) { const i = y * this.w + x; return this.overrides[i] || this.labels[i]; }
      return null;
    }
    tile(x, y) { return this.inside(x, y) ? this.coll[y * this.w + x] : -1; }
    quad(x, y) { return this.inside(x, y) ? this.quads[this.d.cells[y * this.w + x]] : null; }
    passable(x, y) {
      if (!this.inside(x, y)) return false;
      const i = y * this.w + x;
      if (this.passOverride && this.passOverride[i] !== undefined) return this.passOverride[i];
      if (this.overrides[i] === 'grass' || this.overrides[i] === 'path') return true;
      return this.pass.has(this.coll[i]);
    }
    isGrass(x, y) { return this.inside(x, y) && this.ts.grass >= 0 && this.coll[y * this.w + x] === this.ts.grass && !this.overrides[y * this.w + x]; }
    isWater(x, y) { return this.inside(x, y) && this.ts.water && (this.coll[y * this.w + x] === 0x14 || this.coll[y * this.w + x] === 0x32 || this.coll[y * this.w + x] === 0x48); }
    isDoorTile(x, y) { return this.ts.doors.includes(this.tile(x, y)); }
    isWarpTile(x, y) { return this.ts.warps.includes(this.tile(x, y)); }
    // label lookup that extends into connected maps and the border pattern
    labelAt(x, y) {
      if (this.inside(x, y)) return this.label(x, y);
      for (const dir in this.conns) {
        const c = this.conns[dir], m = getMap(c.map);
        const lx = x - c.ox, ly = y - c.oy;
        if (m.inside(lx, ly)) return m.label(lx, ly);
      }
      return this.borderLabel(x, y);
    }
    borderLabel(x, y) { return this.borderLabels[(((y % 2) + 2) % 2) * 2 + (((x % 2) + 2) % 2)]; }
    warpAt(x, y) { return this.warps.findIndex(w => w.x === x && w.y === y); }
    // tile-pair collisions (elevation changes you can't step across, e.g. cave platforms)
    pairBlocked(x, y, nx, ny) {
      const a = this.tile(x, y), b = this.tile(nx, ny);
      if (!this.pairs) { const ts = this.tsName.toUpperCase(); this.pairs = D().pairColl.land.filter(([t]) => t.toUpperCase().replace('_', '') === ts); }
      for (const [, t1, t2] of this.pairs) if ((a === t1 && b === t2) || (a === t2 && b === t1)) return true;
      return false;
    }
  }

  function getMap(name) { return cache[name] || (cache[name] = new GameMap(name)); }

  // Assign world coordinates to all outdoor maps by walking connections from Pallet Town
  function layoutWorld() {
    const seen = {};
    const q = [['PalletTown', 0, 0]];
    while (q.length) {
      const [n, x, y] = q.shift();
      if (seen[n]) continue;
      seen[n] = { x, y };
      const m = getMap(n); m.world = seen[n];
      for (const dir in m.conns) { const c = m.conns[dir]; if (!seen[c.map]) q.push([c.map, x + c.ox, y + c.oy]); }
    }
    return seen;
  }

  G.GROUND = GROUND;
  G.maps = { getMap, layoutWorld, GameMap, cache };
})(window.G);
