// Pokémon instances with Generation I stat, experience and learnset rules.
(function (G) {
  'use strict';
  const D = () => G.DATA;
  const rnd = n => Math.floor(Math.random() * n);

  function expForLevel(growth, n) {
    if (n <= 1) return 0;
    switch (growth) {
      case 'FAST': return Math.floor(4 * n * n * n / 5);
      case 'SLOW': return Math.floor(5 * n * n * n / 4);
      case 'MEDIUM_SLOW': return Math.max(0, Math.floor(6 * n * n * n / 5) - 15 * n * n + 100 * n - 140);
      default: return n * n * n;
    }
  }
  function calcStat(base, dv, sexp, level, isHp) {
    const e = Math.floor(Math.ceil(Math.sqrt(sexp)) / 4);
    const v = Math.floor(((base + dv) * 2 + e) * level / 100);
    return isHp ? v + level + 10 : v + 5;
  }
  let nextOt = 0;
  class Mon {
    constructor(species, level, opts) {
      opts = opts || {};
      const sp = D().species[species];
      if (!sp) throw new Error('bad species ' + species);
      this.species = species; this.level = level;
      this.nick = opts.nick || null;
      const dv = opts.dvs || { atk: rnd(16), def: rnd(16), spd: rnd(16), spc: rnd(16) };
      dv.hp = ((dv.atk & 1) << 3) | ((dv.def & 1) << 2) | ((dv.spd & 1) << 1) | (dv.spc & 1);
      this.dv = dv;
      this.sexp = { hp: 0, atk: 0, def: 0, spd: 0, spc: 0 };
      this.exp = expForLevel(sp.growth, level);
      this.status = null; this.sleep = 0;
      this.ot = opts.ot || (G.state ? G.state.name : 'RED');
      this.otId = opts.otId !== undefined ? opts.otId : (G.state && G.state.trainerId) || 0;
      this.recalc(true);
      this.hp = this.maxhp;
      this.moves = [];
      if (opts.moves) opts.moves.forEach(m => this.addMove(m));
      else this.defaultMoves();
    }
    get sp() { return D().species[this.species]; }
    get name() { return this.nick || this.sp.name; }
    get types() { return this.sp.types; }
    recalc(init) {
      const sp = this.sp, L = this.level, dv = this.dv, se = this.sexp;
      const oldMax = this.maxhp;
      this.maxhp = calcStat(sp.hp, dv.hp, se.hp, L, true);
      this.atk = calcStat(sp.atk, dv.atk, se.atk, L);
      this.def = calcStat(sp.def, dv.def, se.def, L);
      this.spd = calcStat(sp.spd, dv.spd, se.spd, L);
      this.spc = calcStat(sp.spc, dv.spc, se.spc, L);
      if (!init && oldMax !== undefined && this.hp > 0) this.hp = Math.min(this.maxhp, this.hp + (this.maxhp - oldMax));
    }
    defaultMoves() {
      const sp = this.sp;
      if (sp.fixedMoves) { for (const id of sp.fixedMoves) { const m = D().moves[id]; if (m) this.moves.push({ id, pp: m.pp, max: m.pp, ups: 0 }); } return; }
      const list = sp.moves1.slice();
      for (const [lv, mv] of sp.learn) if (lv <= this.level && !list.includes(mv)) list.push(mv);
      for (const m of list.slice(-4)) this.addMove(m);
    }
    addMove(id) {
      const m = D().moves[id]; if (!m) return false;
      if (this.moves.find(x => x.id === id)) return false;
      if (this.moves.length >= 4) return false;
      this.moves.push({ id, pp: m.pp, max: m.pp, ups: 0 });
      return true;
    }
    replaceMove(slot, id) { const m = D().moves[id]; this.moves[slot] = { id, pp: m.pp, max: m.pp, ups: 0 }; }
    expToNext() { return this.level >= 100 ? 0 : expForLevel(this.sp.growth, this.level + 1); }
    expThis() { return expForLevel(this.sp.growth, this.level); }
    movesAtLevel(lv) { return this.sp.learn.filter(([l]) => l === lv).map(([, m]) => m); }
    // returns species to evolve into (level-based), or null
    evoByLevel() {
      for (const e of this.sp.evos) if (e.type === 'level' && this.level >= e.level) return e.to;
      return null;
    }
    evoByItem(item) { for (const e of this.sp.evos) if (e.type === 'item' && e.item === item) return e.to; return null; }
    evoByTrade() { for (const e of this.sp.evos) if (e.type === 'trade') return e.to; return null; }
    evolveTo(sp) {
      const nicked = !!this.nick;
      this.species = sp;
      this.recalc();
      return nicked;
    }
    healFull() { this.hp = this.maxhp; this.status = null; this.sleep = 0; for (const m of this.moves) m.pp = m.max; }
    get fainted() { return this.hp <= 0; }
    canLearnTM(move) { return this.sp.tmhm.includes(move); }
    toJSON() {
      return { species: this.species, level: this.level, nick: this.nick, dv: this.dv, sexp: this.sexp, exp: this.exp, hp: this.hp, status: this.status, sleep: this.sleep, moves: this.moves, ot: this.ot, otId: this.otId };
    }
    static from(o) {
      const m = Object.create(Mon.prototype);
      Object.assign(m, o);
      m.recalc(true);
      m.hp = Math.min(o.hp, m.maxhp);
      return m;
    }
  }
  function typeMult(atkType, defTypes) {
    let m = 1;
    for (const t of defTypes) for (const [a, d, x] of D().typeChart) if (a === atkType && d === t) m *= x;
    return m;
  }
  G.Mon = Mon; G.expForLevel = expForLevel; G.calcStat = calcStat; G.typeMult = typeMult;
  G.speciesName = s => (D().species[s] || {}).name || s;
  G.moveName = id => (D().moves[id] || {}).name || id;
  G.itemName = id => { const it = D().items[id]; return it ? it.name : id; };
})(window.G);
