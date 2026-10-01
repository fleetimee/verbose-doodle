// Inventory model, item effects and the bag screen.
(function (G) {
  'use strict';
  const { hex, shade } = G.gfx;
  const P = G.PAL, F = G.font;
  const KEY = new Set(['TOWN_MAP', 'BICYCLE', 'SURFBOARD', 'POKEDEX', 'OLD_AMBER', 'DOME_FOSSIL', 'HELIX_FOSSIL', 'SECRET_KEY', 'BIKE_VOUCHER', 'CARD_KEY',
    'S_S_TICKET', 'GOLD_TEETH', 'COIN_CASE', 'OAKS_PARCEL', 'ITEMFINDER', 'SILPH_SCOPE', 'POKE_FLUTE', 'LIFT_KEY', 'EXP_ALL', 'OLD_ROD', 'GOOD_ROD', 'SUPER_ROD']);
  const HEAL = { POTION: 20, SUPER_POTION: 50, HYPER_POTION: 200, MAX_POTION: 9999, FULL_RESTORE: 9999, FRESH_WATER: 50, SODA_POP: 60, LEMONADE: 80 };
  const CURE = { ANTIDOTE: ['PSN'], BURN_HEAL: ['BRN'], ICE_HEAL: ['FRZ'], AWAKENING: ['SLP'], PARLYZ_HEAL: ['PAR'], FULL_HEAL: ['PSN', 'BRN', 'FRZ', 'SLP', 'PAR'], FULL_RESTORE: ['PSN', 'BRN', 'FRZ', 'SLP', 'PAR'] };
  const VITAMIN = { HP_UP: 'hp', PROTEIN: 'atk', IRON: 'def', CARBOS: 'spd', CALCIUM: 'spc' };
  const X_ITEM = { X_ATTACK: 'atk', X_DEFEND: 'def', X_SPEED: 'spd', X_SPECIAL: 'spc', X_ACCURACY: 'acc' };
  const DESC = {
    POTION: 'Restores 20 HP to one POKéMON.', SUPER_POTION: 'Restores 50 HP to one POKéMON.', HYPER_POTION: 'Restores 200 HP to one POKéMON.',
    MAX_POTION: 'Fully restores the HP of one POKéMON.', FULL_RESTORE: 'Fully restores HP and cures all status problems.', ANTIDOTE: 'Cures a poisoned POKéMON.',
    BURN_HEAL: 'Heals a burned POKéMON.', ICE_HEAL: 'Thaws a frozen POKéMON.', AWAKENING: 'Wakes up a sleeping POKéMON.', PARLYZ_HEAL: 'Cures paralysis.',
    FULL_HEAL: 'Cures any status problem.', REVIVE: 'Revives a fainted POKéMON with half its HP.', MAX_REVIVE: 'Revives a fainted POKéMON with full HP.',
    POKE_BALL: 'A device for catching wild POKéMON.', GREAT_BALL: 'A good BALL with a higher catch rate.', ULTRA_BALL: 'A very high-performance BALL.',
    MASTER_BALL: 'The ultimate BALL. It never fails.', SAFARI_BALL: 'A special BALL used only in the SAFARI ZONE.', ESCAPE_ROPE: 'Escape instantly from a cave or dungeon.',
    REPEL: 'Keeps weak wild POKéMON away for 100 steps.', SUPER_REPEL: 'Keeps weak wild POKéMON away for 200 steps.', MAX_REPEL: 'Keeps weak wild POKéMON away for 250 steps.',
    RARE_CANDY: 'Raises the level of a POKéMON by one.', ETHER: 'Restores 10 PP to one move.', MAX_ETHER: 'Fully restores the PP of one move.',
    ELIXER: 'Restores 10 PP to all moves.', MAX_ELIXER: 'Fully restores the PP of all moves.', PP_UP: 'Raises the max PP of one move.',
    NUGGET: 'A nugget of pure gold. Sells for a high price.', POKE_DOLL: 'An attractive doll. Lets you escape any wild battle.',
    FRESH_WATER: 'Mineral water. Restores 50 HP.', SODA_POP: 'A fizzy soda. Restores 60 HP.', LEMONADE: 'Very sweet. Restores 80 HP.',
    BICYCLE: 'A folding bike. Ride it for faster travel.', TOWN_MAP: 'A map of the KANTO region.', ITEMFINDER: 'Detects hidden items nearby.',
    OLD_ROD: 'An old fishing rod.', GOOD_ROD: 'A decent fishing rod.', SUPER_ROD: 'An excellent fishing rod.', EXP_ALL: 'Shares EXP. among all POKéMON in the party.',
    POKE_FLUTE: 'Its tune awakens sleeping POKéMON.', COIN_CASE: 'A case for holding GAME CORNER coins.', SILPH_SCOPE: 'Lets you see through ghostly disguises.',
  };
  const bag = {
    items() { return G.state.bag; },
    count(id) { const e = G.state.bag.find(x => x.id === id); return e ? e.n : 0; },
    has(id) { return bag.count(id) > 0; },
    // 20 slots, 99 per stack; anything that won't fit is refused whole rather than lost
    canAdd(id, n) {
      const e = G.state.bag.find(x => x.id === id);
      return e ? KEY.has(id) || e.n + (n || 1) <= 99 : G.state.bag.length < 20;
    },
    add(id, n) {
      n = n || 1;
      if (!bag.canAdd(id, n)) return false;
      const e = G.state.bag.find(x => x.id === id);
      if (e) { if (!KEY.has(id)) e.n += n; return true; }
      G.state.bag.push({ id, n: KEY.has(id) ? 1 : n });
      return true;
    },
    remove(id, n) {
      const i = G.state.bag.findIndex(x => x.id === id); if (i < 0) return false;
      if (KEY.has(id) && id !== 'OAKS_PARCEL' && !n) return false;
      G.state.bag[i].n -= (n || 1);
      if (G.state.bag[i].n <= 0) G.state.bag.splice(i, 1);
      return true;
    },
    isKey: id => KEY.has(id) || /^HM_/.test(id),
    desc: id => {
      if (DESC[id]) return DESC[id];
      const it = G.DATA.items[id];
      if (it && it.move) return 'Teaches the move ' + G.moveName(it.move) + ' to a POKéMON.';
      if (/STONE$/.test(id)) return 'A peculiar stone that makes certain POKéMON evolve.';
      if (VITAMIN[id]) return 'A nutritious drink that raises a base stat.';
      if (X_ITEM[id]) return 'Raises a stat during battle.';
      if (/BADGE/.test(id)) return 'A badge.';
      return 'An item.';
    },
  };
  G.bag = bag;

  // ---------- item effects on a party member (field and battle) ----------
  function* applyToMon(id, m, say, battle) {
    const name = m.name;
    if (HEAL[id] !== undefined || CURE[id]) {
      if (m.hp <= 0) { yield* say("It won't have any effect."); return false; }
      const heals = HEAL[id] !== undefined && m.hp < m.maxhp, cures = CURE[id] && m.status && CURE[id].includes(m.status);
      if (!heals && !cures) { yield* say("It won't have any effect."); return false; }
      const before = m.hp;
      if (heals) m.hp = Math.min(m.maxhp, m.hp + HEAL[id]);
      if (cures) { m.status = null; m.sleep = 0; if (battle && battle.mon(battle.p) === m) { battle.p.v.toxic = 0; if (id === 'FULL_RESTORE' || id === 'FULL_HEAL') battle.p.v.confused = 0; } }
      G.sfx && G.sfx('heal');
      if (heals) yield* say(name + ' recovered by ' + (m.hp - before) + '!');
      else yield* say(name + ' was cured!');
      return true;
    }
    if (id === 'REVIVE' || id === 'MAX_REVIVE') {
      if (m.hp > 0) { yield* say("It won't have any effect."); return false; }
      m.hp = id === 'REVIVE' ? Math.floor(m.maxhp / 2) : m.maxhp; m.status = null;
      G.sfx && G.sfx('heal'); yield* say(name + ' is revitalized!'); return true;
    }
    if (VITAMIN[id]) {
      const k = VITAMIN[id];
      if (m.sexp[k] >= 25600) { yield* say("It won't have any effect."); return false; }
      m.sexp[k] = Math.min(25600, m.sexp[k] + 2560); m.recalc();
      yield* say(name + "'s " + { hp: 'HEALTH', atk: 'ATTACK', def: 'DEFENSE', spd: 'SPEED', spc: 'SPECIAL' }[k] + ' rose.'); return true;
    }
    if (id === 'RARE_CANDY') {
      if (m.level >= 100) { yield* say("It won't have any effect."); return false; }
      const old = { maxhp: m.maxhp, atk: m.atk, def: m.def, spd: m.spd, spc: m.spc };
      m.level++; m.exp = Math.max(m.exp, m.expThis()); m.recalc();
      G.sfx && G.sfx('levelup');
      yield* say(name + ' grew to level ' + m.level + '!');
      for (const mv of m.movesAtLevel(m.level)) yield* G.learnMoveFlow(m, mv, null);
      const evo = m.evoByLevel(); if (evo) yield* G.evolve(m, evo);
      return true;
    }
    if (/STONE$/.test(id)) {
      const evo = m.evoByItem(id);
      if (!evo) { yield* say("It won't have any effect."); return false; }
      yield* G.evolve(m, evo, true); return true;
    }
    if (['ETHER', 'MAX_ETHER', 'PP_UP'].includes(id)) {
      const r = yield* G.choose(m.moves.map(x => G.moveName(x.id) + ' ' + x.pp + '/' + x.max), { x: 150, y: 40 });
      if (r < 0) return false;
      const mv = m.moves[r];
      if (id === 'PP_UP') { if (mv.ups >= 3) { yield* say("It won't have any effect."); return false; } const base = G.DATA.moves[mv.id].pp; mv.ups++; mv.max = base + Math.floor(base / 5) * mv.ups; yield* say(G.moveName(mv.id) + "'s PP increased."); return true; }
      if (mv.pp >= mv.max) { yield* say("It won't have any effect."); return false; }
      mv.pp = id === 'ETHER' ? Math.min(mv.max, mv.pp + 10) : mv.max; yield* say('PP was restored.'); return true;
    }
    if (id === 'ELIXER' || id === 'MAX_ELIXER') {
      if (m.moves.every(x => x.pp >= x.max)) { yield* say("It won't have any effect."); return false; }
      for (const x of m.moves) x.pp = id === 'ELIXER' ? Math.min(x.max, x.pp + 10) : x.max;
      yield* say('PP was restored.'); return true;
    }
    const it = G.DATA.items[id];
    if (it && it.move) {
      const mv = it.move;
      yield* say('Booted up a ' + (it.hm ? 'HM' : 'TM') + '!\fIt contained ' + G.moveName(mv) + '!');
      if (!m.canLearnTM(mv)) { yield* say(name + ' is not compatible with ' + G.moveName(mv) + '.\fIt can\'t learn ' + G.moveName(mv) + '.'); return false; }
      if (m.moves.find(x => x.id === mv)) { yield* say(name + ' already knows ' + G.moveName(mv) + '!'); return false; }
      const learned = yield* G.learnMoveFlow(m, mv, null);
      return learned && !it.hm;
    }
    yield* say("It won't have any effect.");
    return false;
  }
  G.applyItemToMon = applyToMon;
  const needsTarget = id => HEAL[id] !== undefined || CURE[id] || /REVIVE|RARE_CANDY|STONE$|ETHER|ELIXER|PP_UP/.test(id) || VITAMIN[id] || /^(TM|HM)_/.test(id);

  // Battle item use (called by Battle.useItem). Returns 'cancel' | 'used'
  G.useItemInBattle = function* (id, target, b, ui) {
    const say = t => ui.msg(t);
    if (id === 'POKE_DOLL') { if (!b.wild) { yield* say("It won't have any effect."); return 'cancel'; } bag.remove(id); yield* say('Got away safely!'); b.result = 'run'; return 'fled'; }
    if (X_ITEM[id]) {
      bag.remove(id);
      yield* say(G.state.name + ' used ' + G.itemName(id) + '!');
      if (id === 'X_ACCURACY') { b.p.v.xacc = true; yield* say(b.mon(b.p).name + ' became more accurate!'); }
      else yield* b.statChange(b.p, X_ITEM[id], 1, false);
      return 'used';
    }
    if (id === 'GUARD_SPEC') { bag.remove(id); b.p.v.mist = true; yield* say(G.state.name + ' used GUARD SPEC.!'); yield* say(b.mon(b.p).name + ' is shrouded in mist!'); return 'used'; }
    if (id === 'DIRE_HIT') { bag.remove(id); b.p.v.focus = true; yield* say(G.state.name + ' used DIRE HIT!'); yield* say(b.mon(b.p).name + "'s getting pumped!"); return 'used'; }
    if (id === 'POKE_FLUTE') { let any = false; for (const s of [b.p, b.e]) { const m = b.mon(s); if (m.status === 'SLP') { m.status = null; any = true; } } yield* say('Played the POKé FLUTE.'); yield* say(any ? 'All sleeping POKéMON woke up!' : 'Now, that\'s a catchy tune!'); return 'used'; }
    if (target === undefined || target === null) { yield* say("That can't be used now."); return 'cancel'; }
    const m = G.state.party[target];
    const ok = yield* applyToMon(id, m, say, b);
    if (!ok) return 'cancel';
    bag.remove(id);
    if (m === b.mon(b.p)) { yield* ui.syncHp(b.p); }
    return 'used';
  };

  // ---------- bag screen ----------
  class BagScreen {
    constructor(o) { this.o = o || {}; this.opaque = true; this.sel = 0; this.scroll = 0; this.done = false; this.result = null; this.t = 0; this.busy = false; this.msg = null; }
    list() { const l = bag.items().filter(e => !this.o.filter || this.o.filter(e.id)); return l.concat([{ id: 'CANCEL', n: 0 }]); }
    update(f) {
      this.t++; if (!f || this.busy) return;
      const I = G.input, l = this.list(), Pt = G.pointer;
      if (Pt && (Pt.moved || Pt.pressed) && Pt.inside) { // hover/tap a row; the click arrives as A, the wheel scrolls
        let i = -1;
        for (let k = 0; k < 7 && this.scroll + k < l.length; k++) if (Pt.in(114, 9 + k * 15, 200, 15)) i = this.scroll + k;
        if (i >= 0) this.sel = i; else if (Pt.pressed) Pt.consume();
      }
      if (I.repeat('up')) { this.sel = Math.max(0, this.sel - 1); G.sfx && G.sfx('cursor'); }
      if (I.repeat('down')) { this.sel = Math.min(l.length - 1, this.sel + 1); G.sfx && G.sfx('cursor'); }
      if (this.sel < this.scroll) this.scroll = this.sel; if (this.sel > this.scroll + 6) this.scroll = this.sel - 6;
      if (I.pressed.b) { this.done = true; return; }
      if (I.pressed.select && this.o.swap !== false) { // reorder with SELECT
        const i = this.sel; if (i > 0 && i < l.length - 1) { const a = G.state.bag; [a[i - 1], a[i]] = [a[i], a[i - 1]]; this.sel--; }
      }
      if (I.pressed.a) {
        const e = l[this.sel];
        if (e.id === 'CANCEL') { this.done = true; return; }
        G.sfx && G.sfx('select');
        this.busy = true;
        G.spawnScript((function* (self) { try { yield* self.o.onPick(e.id, self); } finally { self.busy = false; } })(this), 'bag');
      }
    }
    *say(t) { this.msg = t; yield; while (!G.input.pressed.a && !G.input.pressed.b) yield; this.msg = null; }
    draw(s) {
      G.menuBg(s, '#e0a860', '#d49850', this.t);
      // bag illustration
      G.ui.frame(s, 4, 4, 104, 118, 'red', hex('#f8e8c8'));
      drawBagArt(s, 56, 64, this.t);
      G.ui.text(s, 'ITEMS', 38, 104);
      G.ui.frame(s, 112, 4, 204, 118);
      const l = this.list();
      for (let i = 0; i < 7 && this.scroll + i < l.length; i++) {
        const e = l[this.scroll + i], y = 12 + i * 15;
        G.ui.text(s, e.id === 'CANCEL' ? 'CANCEL' : G.itemName(e.id), 132, y);
        if (e.id !== 'CANCEL' && !bag.isKey(e.id)) { if (e.n > 99 && G.drawGlitchQty) G.drawGlitchQty(s, e.n, 304, y); else { const n = '×' + e.n; G.ui.text(s, n, 304 - F.measure(n), y); } }
        if (this.scroll + i === this.sel) G.ui.cursor(s, 120, y, this.t);
      }
      if (this.scroll > 0) F.draw(s, '▲', 210, 5, hex('#d04a4a'));
      if (this.scroll + 7 < l.length) F.draw(s, '▼', 210, 114, hex('#d04a4a'));
      G.ui.frame(s, 4, 124, 312, 52, 'gray');
      const e = l[this.sel];
      const txt = this.msg || (e.id === 'CANCEL' ? 'Close the BAG.' : bag.desc(e.id));
      F.wrap(txt, 290).slice(0, 2).forEach((ln, i) => G.ui.text(s, ln, 14, 134 + i * 15));
    }
  }
  function drawBagArt(s, cx, cy, t) {
    const B = [hex('#6a3a1a'), hex('#8a5028'), hex('#b0703a'), hex('#d09050'), hex('#e8b070')];
    const sway = Math.round(Math.sin(t / 30));
    for (let y = -26; y <= 24; y++) for (let x = -24; x <= 24; x++) {
      const w = y < -14 ? 14 + (y + 26) * 0.4 : 24 - Math.max(0, y - 14) * 0.6;
      if (Math.abs(x) > w) continue;
      let c = B[2];
      if (Math.abs(x) > w - 2) c = B[0]; else if (x < -w * 0.5) c = B[3]; else if (x > w * 0.5) c = B[1];
      if (y === -14 || y === -13) c = B[0];
      if (y > -10 && y < 2 && Math.abs(x) < 10) c = y === -9 || y === 1 || Math.abs(x) === 9 ? B[0] : B[4];
      s.pset(cx + x + sway, cy + y, c);
    }
    s.disc(cx + sway, cy - 4, 2.5, hex('#e8c040'));
  }

  // field bag (from start menu)
  G.bagScreen = function* () {
    yield* G.engine.run(new BagScreen({
      onPick: function* (id, scr) {
        const opts = ['USE', 'TOSS', 'CANCEL'];
        const r = yield* G.choose(opts, { x: 250, y: 60 });
        if (r === 0) yield* G.useItemField(id, scr);
        if (r === 1) {
          if (bag.isKey(id)) { yield* scr.say("That's too important to toss!"); return; }
          if (yield* G.ask('Throw away ' + G.itemName(id) + '?')) { bag.remove(id, bag.count(id)); }
        }
      },
    }));
  };
  // battle bag: returns {item, target} or null
  G.bagMenuBattle = function* (bsc) {
    let res = null;
    yield* G.engine.run(new BagScreen({
      onPick: function* (id, scr) {
        if (bag.isKey(id) && id !== 'POKE_FLUTE') { yield* scr.say("That can't be used here."); return; }
        if (/STONE$|RARE_CANDY|^TM_|^HM_|REPEL|ESCAPE_ROPE|VITAMIN/.test(id) || VITAMIN[id]) { yield* scr.say("That can't be used here."); return; }
        if (needsTarget(id)) {
          const t = yield* G.partyScreen({ msg: 'Use on which POKéMON?', pick: function* (m) { return true; } });
          if (t < 0) return;
          res = { item: id, target: t }; scr.done = true; return;
        }
        res = { item: id }; scr.done = true;
      },
    }));
    return res;
  };
  G.useItemField = function* (id, scr) {
    const say = t => scr ? scr.say(t) : G.say(t);
    if (needsTarget(id)) {
      yield* G.partyScreen({ msg: 'Use on which POKéMON?', pick: function* (m, i, ps) {
        const ok = yield* applyToMon(id, m, t => ps.say(t), null);
        if (ok) { const it = G.DATA.items[id]; if (!(it && it.hm)) bag.remove(id); }
        return true;
      } });
      return;
    }
    if (G.fieldItems && G.fieldItems[id]) { const r = yield* G.fieldItems[id](scr); return r; }
    if (/BALL$/.test(id) || X_ITEM[id] || id === 'POKE_DOLL' || id === 'GUARD_SPEC' || id === 'DIRE_HIT') { yield* say("That can't be used now."); return; }
    yield* say('OAK: {PLAYER}! This isn\'t the time to use that!');
  };
})(window.G);
