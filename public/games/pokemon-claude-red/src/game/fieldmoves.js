// Field moves (Cut, Fly, Surf, Strength, Flash, Dig, Teleport, Softboiled), bike, fishing,
// spinner tiles, dark caves, elevators and other overworld mechanics.
(function (G) {
  'use strict';
  const { hex, rgb, mix } = G.gfx;
  const S = G.S, P = G.PAL;
  const BADGE_FOR = { CUT: 'CASCADEBADGE', FLY: 'THUNDERBADGE', SURF: 'SOULBADGE', STRENGTH: 'RAINBOWBADGE', FLASH: 'BOULDERBADGE' };
  const FLY_SPOTS = {
    PalletTown: [5, 6], ViridianCity: [23, 26], PewterCity: [13, 26], CeruleanCity: [19, 18], LavenderTown: [3, 6], VermilionCity: [11, 4],
    CeladonCity: [41, 10], FuchsiaCity: [19, 28], CinnabarIsland: [11, 12], IndigoPlateau: [9, 6], SaffronCity: [9, 30],
  };
  G.FLY_SPOTS = FLY_SPOTS;
  // blackout / ESCAPE ROPE / DIG / TELEPORT destinations: the fly spots plus the two route POKéMON CENTERs
  G.BLACKOUT_SPOTS = Object.assign({ Route4: [11, 6], Route10: [11, 20] }, FLY_SPOTS);
  const DARK_MAPS = new Set(['RockTunnel1F', 'RockTunnelB1F']);
  const hasBadge = b => G.state.badges.includes(b);
  const needBadge = function* (mv) { yield* G.say('No! A new BADGE is required.'); };

  // ---------- helpers ----------
  function front() { const p = G.ow.player, [dx, dy] = G.DIRS[p.dir]; return [p.x + dx, p.y + dy]; }
  function partyWith(mv) { return G.state.party.find(m => m.hp > 0 && m.moves.some(x => x.id === mv)) || G.state.party.find(m => m.moves.some(x => x.id === mv)); }
  G.ow_rerender = function () {
    const ow = G.ow; delete G.mapRender.cache[ow.map.name];
    ow.render = G.mapRender.get(ow.map);
  };
  // override a map cell's label/passability (e.g. cut trees, card-key doors); persists until the map reloads
  S.setCell = function (x, y, label, pass, map) {
    const m = map ? G.maps.getMap(map) : G.ow.map;
    const i = y * m.w + x;
    m.overrides[i] = label; m.passOverride = m.passOverride || {}; m.passOverride[i] = pass;
    if (m === G.ow.map) G.ow_rerender();
  };

  // ---------- field move list for the party menu ----------
  G.fieldMovesFor = function (m) {
    const out = [];
    for (const mv of m.moves) {
      const f = FIELD[mv.id];
      if (f) out.push({ name: G.moveName(mv.id), use: (mon, ps) => f(mon, ps) });
    }
    return out;
  };
  const FIELD = {
    CUT: function* (m, ps) {
      if (!hasBadge('CASCADEBADGE')) { yield* ps.say('No! A new BADGE is required.'); return; }
      const [fx, fy] = front();
      if (G.ow.map.label(fx, fy) !== 'cut_tree') { yield* ps.say("There isn't anything to CUT!"); return; }
      ps.done = true; ps.result = -2;
      yield* doCut(m, fx, fy);
      return 'close';
    },
    SURF: function* (m, ps) {
      if (!hasBadge('SOULBADGE')) { yield* ps.say('No! A new BADGE is required.'); return; }
      const [fx, fy] = front();
      if (!G.ow.map.isWater(fx, fy) || G.ow.surfing) { yield* ps.say('No SURFing on ' + m.name + ' here!'); return; }
      ps.done = true; ps.result = -2;
      yield* doSurf(m);
      return 'close';
    },
    STRENGTH: function* (m, ps) {
      if (!hasBadge('RAINBOWBADGE')) { yield* ps.say('No! A new BADGE is required.'); return; }
      G.ow.strength = true;
      ps.done = true; ps.result = -2;
      yield* G.say(m.name + ' used STRENGTH.'); yield* G.say(m.name + ' can move boulders.');
      return 'close';
    },
    FLASH: function* (m, ps) {
      if (!hasBadge('BOULDERBADGE')) { yield* ps.say('No! A new BADGE is required.'); return; }
      ps.done = true; ps.result = -2;
      G.ow.flashed = true;
      yield* G.say('A blinding FLASH lights the area!');
      return 'close';
    },
    FLY: function* (m, ps) {
      if (!hasBadge('THUNDERBADGE')) { yield* ps.say('No! A new BADGE is required.'); return; }
      if (!G.ow.map.outdoor) { yield* ps.say("Can't use that here."); return; }
      const dest = yield* G.flyMenu();
      if (!dest) return;
      ps.done = true; ps.result = -2;
      yield* doFly(dest);
      return 'close';
    },
    DIG: function* (m, ps) {
      if (G.ow.map.outdoor) { yield* ps.say("Can't use that here."); return; }
      ps.done = true; ps.result = -2; yield* escapeTo(); return 'close';
    },
    TELEPORT: function* (m, ps) {
      if (!G.ow.map.outdoor) { yield* ps.say("Can't use that here."); return; }
      ps.done = true; ps.result = -2; yield* escapeTo(); return 'close';
    },
    SOFTBOILED: function* (m, ps) {
      if (m.hp <= Math.floor(m.maxhp / 5)) { yield* ps.say('Not enough HP!'); return; }
      const t = yield* G.partyScreen({ msg: 'Use on which POKéMON?', pick: function* () { return true; } });
      if (t < 0) return;
      const tgt = G.state.party[t];
      if (tgt === m || tgt.hp >= tgt.maxhp || tgt.hp <= 0) { yield* ps.say("It won't have any effect."); return; }
      const amt = Math.floor(m.maxhp / 5); m.hp -= amt; tgt.hp = Math.min(tgt.maxhp, tgt.hp + amt);
      yield* ps.say(tgt.name + ' recovered by ' + amt + '!');
    },
  };

  function* doCut(m, fx, fy) {
    yield* G.say(m.name + ' hacked away with CUT!');
    G.sfx && G.sfx('cut');
    // leaf burst
    const px = fx * 16 + 8, py = fy * 16 + 8;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2, v = 0.8 + Math.random() * 1.5;
      const pt = { x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 26 + Math.random() * 10, rot: 0 };
      G.ow.fx.push({ draw(s, cx, cy) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.08; pt.life--; s.pset(pt.x - cx, pt.y - cy, P.leaf[5]); s.pset(pt.x - cx + 1, pt.y - cy, P.leaf[3]); return pt.life > 0; } });
    }
    S.setCell(fx, fy, 'grass', true);
    yield* G.engine.wait(20);
  }
  function* doSurf(m) {
    const ow = G.ow, p = ow.player;
    yield* G.say(G.state.name + ' got on ' + m.name + '!');
    ow.surfing = true; ow.biking = false;
    G.music && G.music('surf');
    const [fx, fy] = front();
    p.startMove(p.dir, 1);
    while (p.moving) yield;
  }
  function* doFly(dest) {
    const ow = G.ow, p = ow.player;
    G.sfx && G.sfx('fly');
    for (let i = 0; i < 30; i++) { p.bob = -i * 3; yield; }
    yield* G.fadeOut(12);
    p.bob = 0;
    const [x, y] = FLY_SPOTS[dest];
    ow.surfing = false; ow.biking = false;
    ow.load(dest, x, y, 'down');
    G.music && G.music(G.mapMusic(ow.map));
    yield* G.fadeIn(12);
    ow.showBanner();
  }
  G.flyMenu = function* () {
    const visited = Object.keys(FLY_SPOTS).filter(n => G.state.visited && G.state.visited[n]);
    if (!visited.length) return null;
    if (G.townMapScreen) return yield* G.townMapScreen({ fly: true, options: visited });
    const r = yield* G.choose(visited.map(n => G.mapDisplayName(G.maps.getMap(n))), { x: 150, y: 4, w: 164 });
    return r >= 0 ? visited[r] : null;
  };
  function* escapeTo() {
    const h = G.state.lastHealTown || { map: 'PalletTown', x: 5, y: 6 };
    G.sfx && G.sfx('teleport');
    yield* G.fadeOut(16);
    G.ow.surfing = false; G.ow.biking = false;
    G.ow.load(h.map, h.x, h.y, 'down');
    G.music && G.music(G.mapMusic(G.ow.map));
    yield* G.fadeIn(16);
  }
  G.escapeTo = escapeTo;

  // ---------- interacting with obstacles directly (A button) ----------
  G.fieldMoveInteract = function (fx, fy) {
    const m = G.ow.map, l = m.label(fx, fy);
    if (l === 'cut_tree') return (function* () {
      const mon = partyWith('CUT');
      if (!mon || !hasBadge('CASCADEBADGE')) { yield* G.say(G.TEXT.CutTreeText || 'This tree can be CUT!'); return; }
      if (yield* G.ask(G.TEXT.CutTreeText ? G.TEXT.CutTreeText + '\fWould you like to use CUT?' : 'This tree can be CUT! Would you like to use CUT?')) yield* doCut(mon, fx, fy);
    })();
    if (m.isWater(fx, fy) && !G.ow.surfing) return (function* () {
      const mon = partyWith('SURF');
      if (!mon || !hasBadge('SOULBADGE')) return;
      if (yield* G.ask('The water is calm.\fWould you like to SURF?')) yield* doSurf(mon);
    })();
    return null;
  };

  // IsBikeRidingAllowed: outdoor, forest, cave, underground-path and dock tilesets, plus Route 23 and Indigo Plateau
  const BIKE_TILESETS = new Set(['Overworld', 'Forest', 'Underground', 'ShipPort', 'Cavern']);
  G.bikeAllowed = map => BIKE_TILESETS.has(map.tsName) || map.name === 'Route23' || map.name === 'IndigoPlateau';

  // ---------- items usable in the field ----------
  G.fieldItems = {
    BICYCLE: function* (scr) {
      const ow = G.ow;
      if (ow.surfing) { yield* scr.say('No cycling on water!'); return; }
      if (!ow.biking && !G.bikeAllowed(ow.map)) { yield* scr.say('No cycling allowed here.'); return; }
      ow.biking = !ow.biking;
      scr.done = true; G.closeMenus = true;
      yield* G.say(G.state.name + (ow.biking ? ' got on the BICYCLE.' : ' got off the BICYCLE.'));
      G.music && G.music(ow.biking ? 'bike' : G.mapMusic(ow.map));
    },
    OLD_ROD: function* (scr) { scr.done = true; G.closeMenus = true; yield* fish('old'); },
    GOOD_ROD: function* (scr) { scr.done = true; G.closeMenus = true; yield* fish('good'); },
    SUPER_ROD: function* (scr) { scr.done = true; G.closeMenus = true; yield* fish('super'); },
    ESCAPE_ROPE: function* (scr) {
      if (G.ow.map.outdoor || !/Cave|Moon|Tunnel|Forest|Seafoam|Victory|Mansion|Tower|Hideout|SilphCo|PowerPlant|Diglett|SafariZone/.test(G.ow.map.name)) { yield* scr.say("Can't use that here."); return; }
      G.bag.remove('ESCAPE_ROPE', 1); scr.done = true; G.closeMenus = true; yield* escapeTo();
    },
    REPEL: function* (scr) { G.bag.remove('REPEL', 1); G.state.repel = 100; yield* scr.say('REPEL\'s effect lingers around you.'); },
    SUPER_REPEL: function* (scr) { G.bag.remove('SUPER_REPEL', 1); G.state.repel = 200; yield* scr.say('REPEL\'s effect lingers around you.'); },
    MAX_REPEL: function* (scr) { G.bag.remove('MAX_REPEL', 1); G.state.repel = 250; yield* scr.say('REPEL\'s effect lingers around you.'); },
    TOWN_MAP: function* () { if (G.townMapScreen) yield* G.townMapScreen({}); },
    POKE_FLUTE: function* (scr) {
      scr.done = true; G.closeMenus = true;
      if (G.pokeFluteField) { const r = yield* G.pokeFluteField(); if (r) return; }
      yield* G.say('Played the POKé FLUTE.\fNow, that\'s a catchy tune!');
    },
    ITEMFINDER: function* (scr) {
      const m = G.ow.map, p = G.ow.player;
      const near = m.hidden.filter(h => h.fn === 'HiddenItems' && !G.flag('HIDDEN_' + m.name + '_' + h.x + '_' + h.y) && Math.abs(h.x - p.x) <= 5 && Math.abs(h.y - p.y) <= 4);
      yield* scr.say(near.length ? 'Yes! ITEMFINDER indicates there\'s an item nearby.' : 'Nope! ITEMFINDER isn\'t responding.');
    },
    COIN_CASE: function* (scr) { yield* scr.say('Coins: ' + (G.state.coins || 0)); },
  };

  // ---------- fishing ----------
  function* fish(rod) {
    const ow = G.ow, p = ow.player, [fx, fy] = front();
    if (!ow.map.isWater(fx, fy) || ow.surfing && false) { yield* G.say("Can't use that here."); return; }
    ow.locks++;
    // rod line fx
    const line = { t: 0, draw(s, cx, cy) { this.t++; const [dx, dy] = G.DIRS[p.dir]; const x0 = p.px + 8 - cx + dx * 6, y0 = p.py - cy + 2 + dy * 4; const x1 = p.px + 8 - cx + dx * 20, y1 = p.py - cy + 10 + dy * 18 + (dx ? 6 : 0); s.line(x0, y0, x1, y1, hex('#f0f0f0')); s.disc(x1, y1 + (this.bite ? Math.round(Math.sin(this.t) * 2) : 0), 1.5, hex('#e04848')); return !this.done; } };
    ow.fx.push(line);
    yield* G.say(G.state.name + ' used the ' + { old: 'OLD ROD', good: 'GOOD ROD', super: 'SUPER ROD' }[rod] + '!', { noWait: true });
    yield* G.engine.wait(40 + Math.floor(Math.random() * 60));
    let mon = null;
    if (rod === 'old') mon = Math.random() < 0.8 ? ['MAGIKARP', 5] : null;
    else if (rod === 'good') { if (Math.random() < 0.6) { const g = G.DATA.goodRod[Math.floor(Math.random() * G.DATA.goodRod.length)]; mon = [g[1], g[0]]; } }
    else { const grp = G.DATA.superRod[ow.map.d.cnst]; if (grp && Math.random() < 0.7) { const g = grp[Math.floor(Math.random() * grp.length)]; mon = [g[1], g[0]]; } }
    if (!mon) { line.done = true; ow.locks--; yield* G.say('Not even a nibble!'); return; }
    line.bite = true;
    const a = { emote: '!', emoteT: 0 }; p.emote = '!'; p.emoteT = 0;
    yield* G.engine.wait(30); p.emote = null; line.done = true;
    yield* G.say('Oh! It\'s a bite!');
    ow.locks--;
    yield* G.startWildBattle(mon[0], mon[1]);
  }

  // ---------- overworld hooks: bike/surf sprite, spinners, strength, darkness ----------
  // bicycle & surf rendering underlay
  G.drawRideUnder = function (s, a, x, y) {
    const ow = G.ow;
    if (!a.isPlayer || !ow.surfing) return;
    const bob = Math.round(Math.sin(G.frame / 10));
    const B = [P.outline, hex('#3a78c0'), hex('#8ad0f8'), hex('#c8ecff'), hex('#ffffff')], shell = [P.outline, hex('#7a6a80'), hex('#c0b4c8'), hex('#ece4f4')];
    const cx = x + 8, cy = y + 11 + bob;
    // ripple ring
    s.ellipseBlend(cx, cy + 4, 13, 5, hex('#ffffff'), 0.25);
    // body
    s.ellipse(cx, cy + 1, 11, 6.5, B[0]); s.ellipse(cx, cy, 10, 5.5, B[2]); s.ellipse(cx - 2, cy - 2, 6, 2.5, B[3]);
    // shell bumps
    for (const [dx, dy] of [[-5, 1], [0, 2], [5, 1]]) { s.disc(cx + dx, cy + dy, 2.2, shell[0]); s.disc(cx + dx, cy + dy - 0.5, 1.6, shell[2]); s.pset(cx + dx - 1, cy + dy - 1, shell[3]); }
    // neck + head toward the facing direction
    const d = a.dir, hx = d === 'left' ? cx - 12 : d === 'right' ? cx + 12 : cx, hy = d === 'up' ? cy - 10 : d === 'down' ? cy + 9 : cy - 4;
    if (d !== 'up') {
      s.line(cx + (hx - cx) * 0.4, cy - 1, hx, hy + 2, B[0]);
      for (let k = 0; k < 3; k++) s.line(cx + (hx - cx) * 0.4 + k - 1, cy - 1, hx + k - 1, hy + 2, B[2]);
      s.ellipse(hx, hy, 4.2, 3.4, B[0]); s.ellipse(hx, hy - 0.5, 3.4, 2.6, B[2]); s.pset(hx - 1, hy - 1, B[4]);
      const ex = d === 'left' ? hx - 2 : d === 'right' ? hx + 2 : hx; s.pset(ex, hy, P.outline); if (d === 'down') s.pset(hx + 2, hy, P.outline);
    }
    // wake while moving
    if (a.moving && G.frame % 3 === 0) {
      const wx = a.px + 8, wy = a.py + 14;
      G.ow.fx.push({ t: 0, under: true, draw(s2, ccx, ccy) { this.t++; const r = this.t * 0.6; s2.circle(wx - ccx, wy - ccy, r, mix(hex('#ffffff'), hex('#6ab0f0'), this.t / 16)); return this.t < 14; } });
    }
  };
  // bicycle drawn over the rider's legs
  G.drawRideOver = function (s, a, x, y) {
    if (!a.isPlayer || !G.ow.biking || G.ow.surfing) return;
    const W = P.outline, rim = hex('#8a8aa0'), fr = hex('#d83a3a'), frL = hex('#f07a6a');
    const spin = Math.floor((a.px + a.py) / 3) % 2;
    const wheelV = (cx, cy) => { s.ellipse(cx, cy, 2.2, 3.4, W); s.ellipse(cx, cy, 1.2, 2.4, rim); s.pset(cx, cy - 1 + spin * 2, W); };
    const wheelH = (cx, cy) => { s.circle(cx, cy, 3, W); s.circle(cx, cy, 2, rim); s.pset(cx - 1 + spin * 2, cy, W); s.pset(cx, cy, W); };
    if (a.dir === 'left' || a.dir === 'right') {
      wheelH(x + 2, y + 13); wheelH(x + 14, y + 13);
      s.line(x + 2, y + 13, x + 7, y + 9, fr); s.line(x + 7, y + 9, x + 14, y + 13, fr); s.line(x + 7, y + 9, x + 11, y + 9, frL);
      const hb = a.dir === 'left' ? x + 3 : x + 13; s.line(hb, y + 8, hb, y + 12, W);
    } else {
      wheelV(x + 8, y + 15);
      s.hline(x + 3, x + 12, y + 10, W); s.pset(x + 3, y + 9, W); s.pset(x + 12, y + 9, W);
      s.vline(x + 8, y + 10, y + 12, fr);
    }
  };
  G.rideClip = function (a) { return a.isPlayer && G.ow.surfing ? 1 : 0; };

  // spinner tiles: keep sliding
  G.afterStep = function (ow) {
    const p = ow.player, l = ow.map.label(p.x, p.y);
    if (/^spinner_(up|down|left|right)$/.test(l)) {
      const d = l.split('_')[1];
      // one lock per ride, however many arrows it chains through
      if (ow.canMove(p, d).ok) { p.dir = d; p.startMove(d, 2); p.spinning = true; if (!ow.spinLock) { ow.locks++; ow.spinLock = true; } return true; }
    } else if (p.spinning) {
      if (l !== 'spinner_stop' && ow.canMove(p, p.dir).ok && ow.map.label(p.x, p.y) !== 'spinner_stop') { p.startMove(p.dir, 2); return true; }
    }
    if (p.spinning) { p.spinning = false; if (ow.spinLock) { ow.spinLock = false; ow.locks--; } }
    return false;
  };
  // Strength boulder pushing: returns true if a boulder was pushed
  G.tryPushBoulder = function (ow, dir) {
    if (!ow.strength) return false;
    const p = ow.player, [dx, dy] = G.DIRS[dir];
    const b = ow.actorAt(p.x + dx, p.y + dy, p);
    if (!b || b.sprite !== 'boulder' || b.moving) return false;
    const tx = b.x + dx, ty = b.y + dy;
    const lbl = ow.map.label(tx, ty);
    if (!(ow.map.passable(tx, ty) || lbl === 'hole') || ow.actorAt(tx, ty)) return false;
    b.startMove(dir, 1); G.sfx && G.sfx('boulder');
    G.spawnScript((function* () {
      ow.locks++;
      while (b.moving) { yield; }
      ow.locks--;
      if (G.onBoulderMoved) { const g = G.onBoulderMoved(ow.map, b); if (g && g.next) yield* g; }
    })(), 'boulder');
    return true;
  };
  // darkness overlay for caves needing FLASH
  G.darkMap = m => DARK_MAPS.has(m.name);
  const prevAmbient = G.ambient;
  G.ambientDark = function (s, ow, cx, cy) {
    if (!DARK_MAPS.has(ow.map.name) || ow.flashed) return;
    const p = ow.player, px = p.px + 8 - cx, py = p.py + 4 - cy;
    const d = s.data;
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) {
      const r = Math.hypot(x - px, (y - py) * 1.1);
      if (r < 18) continue;
      const k = Math.min(1, (r - 18) / 14);
      if (G.gfx.bayer(x, y) < k) d[y * 320 + x] = P.black; else d[y * 320 + x] = mix(d[y * 320 + x], P.black, 0.45);
    }
  };

  // ---------- elevators ----------
  // floors: [{label:'1F', map:'CeladonMart1F', warp: n}]; updates this elevator map's exit warps
  S.elevator = function* (floors) {
    const r = yield* G.choose(floors.map(f => f.label).concat(['CANCEL']), { x: 230, y: 4, w: 84 });
    if (r < 0 || r >= floors.length) return;
    const f = floors[r], m = G.ow.map;
    for (const w of m.warps) { w.to = f.map; w.warp = f.warp; }
    G.sfx && G.sfx('elevator');
    for (let i = 0; i < 40; i++) { G.ow.shake = 2; yield; }
    G.ow.shake = 0;
    G.sfx && G.sfx('ding');
  };
})(window.G);
