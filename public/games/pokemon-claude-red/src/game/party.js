// Party screen & Pokémon summary.
(function (G) {
  'use strict';
  const { hex, shade, mix, rgb } = G.gfx;
  const P = G.PAL, F = G.font;
  const INK = hex('#3a3a4c'), INK_SH = hex('#d6d4cc');
  const TYPE_COL = () => G.TYPE_COL;

  function menuBg(s, c1, c2, t) {
    const a = hex(c1 || '#4a78c8'), b = hex(c2 || '#3a5aa8');
    for (let y = 0; y < 180; y++) for (let x = 0; x < 320; x++) {
      const k = ((x + y + Math.floor((t || 0) / 4)) >> 3) % 2;
      s.data[y * 320 + x] = k ? a : b;
    }
  }
  G.menuBg = menuBg;
  function hpBar(s, x, y, w, frac) {
    frac = Math.max(0, Math.min(1, frac));
    s.rect(x - 1, y - 1, w + 2, 5, P.outline); s.rect(x, y, w, 3, hex('#50506a'));
    const c = frac > 0.5 ? hex('#58d080') : frac > 0.2 ? hex('#f8c838') : hex('#f05848');
    s.rect(x, y, Math.round(w * frac), 3, c); s.rect(x, y, Math.round(w * frac), 1, mix(c, P.white, 0.5));
  }
  G.hpBarSmall = hpBar;
  function statusTag(s, x, y, st) {
    const col = { PSN: '#a040a0', BRN: '#e05030', FRZ: '#58b8e8', PAR: '#d8b020', SLP: '#8a8aa0', FNT: '#d04040' }[st];
    s.rect(x, y, 19, 7, P.outline); s.rect(x + 1, y + 1, 17, 5, hex(col)); F.drawSmall(s, st, x + 2, y + 1, P.white);
  }
  G.statusTag = statusTag;

  // ---------------- party screen ----------------
  class PartyScreen {
    constructor(o) {
      this.o = o || {}; this.opaque = true; this.t = 0;
      this.party = G.state.party; this.sel = this.o.sel || 0; this.done = false; this.result = -1;
      this.swapFrom = -1; this.msg = this.o.msg || (this.o.forced ? 'Bring out which POKéMON?' : 'Choose a POKéMON.');
      this.busy = false;
    }
    update(focused) {
      this.t++;
      if (!focused || this.busy) return;
      const I = G.input, n = this.party.length, Pt = G.pointer;
      if (Pt && (Pt.moved || Pt.pressed) && Pt.inside) { // hover/tap a slot or CANCEL; the click arrives as A
        let i = -1;
        for (let k = 0; k < n && i < 0; k++) if (k === 0 ? Pt.in(6, 18, 112, 58) : Pt.in(124, 6 + (k - 1) * 28, 192, 26)) i = k;
        if (i < 0 && Pt.in(238, 148, 78, 22)) i = n;
        if (i >= 0) this.sel = i; else if (Pt.pressed) Pt.consume();
      }
      if (I.repeat('up')) { this.sel = this.sel === n ? n - 1 : (this.sel - 1 + n + 1) % (n + 1); G.sfx && G.sfx('cursor'); }
      if (I.repeat('down')) { this.sel = (this.sel + 1) % (n + 1); G.sfx && G.sfx('cursor'); }
      if (I.pressed.left && this.sel > 0 && this.sel < n) { this.sel = 0; }
      if (I.pressed.right && this.sel === 0 && n > 1) { this.sel = 1; }
      if (I.pressed.b) { if (this.swapFrom >= 0) { this.swapFrom = -1; return; } if (!this.o.forced) { this.result = -1; this.done = true; } return; }
      if (I.pressed.a) {
        G.sfx && G.sfx('select');
        if (this.sel === n) { if (!this.o.forced) { this.result = -1; this.done = true; } return; }
        if (this.swapFrom >= 0) {
          const a = this.swapFrom, b = this.sel;
          [this.party[a], this.party[b]] = [this.party[b], this.party[a]];
          this.swapFrom = -1; return;
        }
        this.busy = true;
        G.spawnScript(this.choose(this.sel), 'party');
      }
    }
    *choose(i) {
      const m = this.party[i];
      try {
        if (this.o.pick) { // item target / move tutor style selection
          const r = yield* this.o.pick(m, i, this);
          if (r !== undefined && r !== false) { this.result = i; this.done = true; }
          return;
        }
        if (this.o.battle) {
          const r = yield* G.choose(['SHIFT', 'SUMMARY', 'CANCEL'], { x: 236, y: 96 });
          if (r === 0) {
            if (m.hp <= 0) { yield* this.say(m.name + ' has no energy left to battle!'); return; }
            if (i === this.o.activeIdx && !this.o.forced) { yield* this.say(m.name + ' is already out!'); return; }
            this.result = i; this.done = true; return;
          }
          if (r === 1) yield* G.summary(i);
          return;
        }
        const opts = ['SUMMARY', 'SWITCH'];
        const fms = G.fieldMovesFor ? G.fieldMovesFor(m) : [];
        const all = fms.map(f => f.name).concat(opts, ['CANCEL']);
        const r = yield* G.choose(all, { x: 320 - 96, y: 180 - 10 - all.length * 15 - 14 });
        if (r < 0 || all[r] === 'CANCEL') return;
        if (r < fms.length) {
          const res = yield* fms[r].use(m, this);
          if (res === 'close') { this.result = -2; this.done = true; }
          return;
        }
        if (all[r] === 'SUMMARY') yield* G.summary(i);
        if (all[r] === 'SWITCH') { this.swapFrom = i; this.msg = 'Move to where?'; }
      } finally { this.busy = false; }
    }
    *say(t) { this.msg = t; yield* G.engine.wait(2); while (!G.input.pressed.a && !G.input.pressed.b) yield; this.msg = 'Choose a POKéMON.'; }
    draw(s) {
      menuBg(s, '#5a8ad8', '#4a78c8', this.t);
      const n = this.party.length;
      // main slot
      for (let i = 0; i < n; i++) this.drawSlot(s, i);
      // cancel
      const cy = 150, sel = this.sel === n;
      G.ui.frame(s, 238, cy - 2, 78, 22, sel ? 'red' : 'gray');
      G.ui.text(s, 'CANCEL', 256, cy + 4);
      // message
      G.ui.frame(s, 4, 150, 230, 26, 'gray');
      G.ui.text(s, this.msg, 14, 159);
    }
    drawSlot(s, i) {
      const m = this.party[i], sel = i === this.sel, swap = i === this.swapFrom;
      let x, y, w, h;
      if (i === 0) { x = 6; y = 18; w = 112; h = 58; } else { x = 124; y = 6 + (i - 1) * 28; w = 192; h = 26; }
      const fainted = m.hp <= 0;
      const base = fainted ? hex('#c86a6a') : swap ? hex('#e8a840') : sel ? hex('#f8b060') : hex('#3a6ab8');
      // plate
      for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) {
        const e = j === 0 || k === 0 || j === h - 1 || k === w - 1;
        const c = e ? P.outline : (j < 3 ? shade(base, 0.25) : j > h - 4 ? shade(base, -0.2) : base);
        if ((j === 0 || j === h - 1) && (k === 0 || k === w - 1)) continue;
        s.pset(x + k, y + j, c);
      }
      const icon = G.pokeSprite(m.species, 'front', 32);
      const bob = sel && !fainted ? (Math.floor(this.t / 8) % 2) * -2 : 0;
      const tc = P.white, sh = shade(base, -0.45);
      if (i === 0) {
        s.blit(icon, x + 2, y + 2 + bob);
        F.draw(s, m.name, x + 38, y + 8, tc, sh);
        F.drawSmall(s, 'Lv' + m.level, x + 38, y + 22, tc, sh);
        if (m.status || fainted) statusTag(s, x + 70, y + 21, fainted ? 'FNT' : m.status);
        hpBar(s, x + 38, y + 36, 66, m.hp / m.maxhp);
        const t = m.hp + '/' + m.maxhp; F.drawSmall(s, t, x + w - 8 - F.measureSmall(t), y + 44, tc, sh);
      } else {
        s.blit(icon, x - 2, y - 5 + bob, { sh: 30 });
        F.draw(s, m.name, x + 32, y + 4, tc, sh);
        F.drawSmall(s, 'Lv' + m.level, x + 32, y + 16, tc, sh);
        if (m.status || fainted) statusTag(s, x + 58, y + 15, fainted ? 'FNT' : m.status);
        hpBar(s, x + 108, y + 8, 60, m.hp / m.maxhp);
        const t = m.hp + '/' + m.maxhp; F.drawSmall(s, t, x + 168 - F.measureSmall(t), y + 15, tc, sh);
      }
    }
  }
  G.partyScreen = function* (o) {
    const ps = new PartyScreen(o);
    const r = yield* G.engine.run(ps);
    return r;
  };

  // ---------------- summary ----------------
  class Summary {
    constructor(idx) { this.idx = idx; this.page = 0; this.done = false; this.opaque = true; this.t = 0; this.msel = 0; }
    get m() { return G.state.party[this.idx]; }
    update(f) {
      this.t++; if (!f) return;
      const I = G.input;
      if (I.pressed.left) this.page = (this.page + 2) % 3;
      if (I.pressed.right) this.page = (this.page + 1) % 3;
      if (I.pressed.up && this.page === 2) this.msel = Math.max(0, this.msel - 1);
      if (I.pressed.down && this.page === 2) this.msel = Math.min(this.m.moves.length - 1, this.msel + 1);
      if (I.pressed.up && this.page !== 2) { this.idx = (this.idx + G.state.party.length - 1) % G.state.party.length; }
      if (I.pressed.down && this.page !== 2) { this.idx = (this.idx + 1) % G.state.party.length; }
      if (I.pressed.b || (I.pressed.a && this.page !== 2)) this.done = true;
    }
    draw(s) {
      const m = this.m, sp = m.sp;
      menuBg(s, '#e8e0c8', '#dcd2b8', this.t);
      // header tabs
      const tabs = ['INFO', 'STATS', 'MOVES'];
      tabs.forEach((tb, i) => { const x = 170 + i * 50; G.ui.frame(s, x, 2, 48, 20, i === this.page ? 'red' : 'gray'); G.ui.text(s, tb, x + 24 - F.measure(tb) / 2, 8); });
      // left panel: sprite
      G.ui.frame(s, 4, 4, 160, 118, 'blue');
      G.ui.text(s, 'No.' + String(sp.dex).padStart(3, '0'), 14, 12);
      G.ui.text(s, m.name, 60, 12);
      F.drawSmall(s, 'Lv' + m.level, 130, 14, INK);
      s.blit(G.pokeSprite(m.species, 'front'), 50, 34 + Math.round(Math.sin(this.t / 20)));
      if (m.status) statusTag(s, 12, 104, m.status);
      const typesX = 60;
      m.types.forEach((t, i) => this.typeTag(s, typesX + i * 46, 104, t));
      const x = 170, y = 26;
      G.ui.frame(s, x, y, 146, 96);
      if (this.page === 0) {
        const rows = [['OT', m.ot], ['ID No.', String(m.otId).padStart(5, '0')], ['SPECIES', sp.name], ['STATUS', m.status || (m.hp > 0 ? 'OK' : 'FAINTED')], ['EXP', String(m.exp)], ['TO NEXT', String(Math.max(0, m.expToNext() - m.exp))]];
        rows.forEach(([a, b], i) => { G.ui.text(s, a, x + 10, y + 8 + i * 14, hex('#7a7a90')); G.ui.text(s, b, x + 136 - F.measure(b), y + 8 + i * 14); });
      } else if (this.page === 1) {
        const rows = [['HP', m.hp + '/' + m.maxhp], ['ATTACK', m.atk], ['DEFENSE', m.def], ['SPEED', m.spd], ['SPECIAL', m.spc]];
        rows.forEach(([a, b], i) => { G.ui.text(s, a, x + 10, y + 8 + i * 15, hex('#7a7a90')); G.ui.text(s, String(b), x + 136 - F.measure(String(b)), y + 8 + i * 15); });
        hpBar(s, x + 60, y + 84, 76, m.hp / m.maxhp);
      } else {
        m.moves.forEach((mv, i) => {
          const md = G.DATA.moves[mv.id];
          const yy = y + 6 + i * 22;
          if (i === this.msel) s.rect(x + 5, yy - 2, 136, 20, hex('#f8e8b0'));
          this.typeTag(s, x + 8, yy + 3, md.type, true);
          G.ui.text(s, G.moveName(mv.id), x + 48, yy);
          F.drawSmall(s, 'PP ' + mv.pp + '/' + mv.max, x + 90, yy + 11, INK);
        });
      }
      // bottom panel
      G.ui.frame(s, 4, 124, 312, 52, 'gray');
      if (this.page === 2 && m.moves[this.msel]) {
        const md = G.DATA.moves[m.moves[this.msel].id];
        G.ui.text(s, 'POWER ' + (md.power > 1 ? md.power : '---') + '   ACCURACY ' + md.acc + '%', 14, 134);
        F.wrap(G.moveEffectText(md), 290).slice(0, 2).forEach((l, i) => G.ui.text(s, l, 14, 150 + i * 13));
      } else {
        const txt = (G.DEX_TEXT && G.DEX_TEXT[m.species]) || '';
        const lines = F.wrap(txt, 290).slice(0, 3);
        lines.forEach((l, i) => G.ui.text(s, l, 14, 131 + i * 13));
      }
    }
    typeTag(s, x, y, t, small) {
      const c = hex(G.TYPE_COL[t] || '#888');
      const w = small ? 36 : 42;
      s.rect(x, y, w, 11, P.outline); s.rect(x + 1, y + 1, w - 2, 9, c);
      const n = G.typeName(t);
      F.drawSmall(s, n.replace(/[^A-Z]/g, ''), x + w / 2 - F.measureSmall(n) / 2, y + 3, P.white);
    }
  }
  G.summary = function* (idx) { yield* G.engine.run(new Summary(idx)); };
  const EFFECT_TEXT = {
    NO_ADDITIONAL: 'A straightforward attack.', TWO_TO_FIVE_ATTACKS: 'Hits 2 to 5 times in a row.', PAY_DAY: 'Scatters coins you can pick up after battle.',
    BURN_SIDE1: 'May burn the target.', BURN_SIDE2: 'High chance to burn the target.', FREEZE_SIDE1: 'May freeze the target.', PARALYZE_SIDE1: 'May paralyze the target.',
    PARALYZE_SIDE2: 'High chance to paralyze the target.', OHKO: 'Knocks out the target in one hit if it lands.', CHARGE: 'Charges up on the first turn, strikes on the second.',
    ATTACK_UP2: 'Sharply raises ATTACK.', SWITCH_AND_TELEPORT: 'Flees from wild battles.', FLY: 'Flies up high, then strikes next turn.', TRAPPING: 'Traps the target for 2-5 turns.',
    FLINCH_SIDE1: 'May make the target flinch.', FLINCH_SIDE2: 'High chance to make the target flinch.', ATTACK_TWICE: 'Hits twice in a row.', JUMP_KICK: 'The user is hurt if it misses.',
    ACCURACY_DOWN1: "Lowers the target's accuracy.", RECOIL: 'The user takes recoil damage.', THRASH_PETAL_DANCE: 'Attacks for 2-3 turns, then the user becomes confused.',
    DEFENSE_DOWN1: "Lowers the target's DEFENSE.", DEFENSE_DOWN2: "Sharply lowers the target's DEFENSE.", POISON_SIDE1: 'May poison the target.', POISON_SIDE2: 'High chance to poison the target.',
    TWINEEDLE: 'Hits twice; may poison.', ATTACK_DOWN1: "Lowers the target's ATTACK.", SLEEP: 'Puts the target to sleep.', CONFUSION: 'Confuses the target.',
    SPECIAL_DAMAGE: 'Deals a fixed amount of damage.', DISABLE: "Disables the target's last move.", DEFENSE_DOWN_SIDE: "May lower the target's DEFENSE.", MIST: 'Protects against stat reduction.',
    CONFUSION_SIDE: 'May confuse the target.', SPEED_DOWN_SIDE: "May lower the target's SPEED.", ATTACK_DOWN_SIDE: "May lower the target's ATTACK.", HYPER_BEAM: 'Powerful, but the user must recharge.',
    DRAIN_HP: 'Restores HP by half the damage dealt.', LEECH_SEED: 'Drains HP from the target every turn.', SPECIAL_UP1: 'Raises SPECIAL.', POISON: 'Poisons the target.',
    PARALYZE: 'Paralyzes the target.', SPEED_DOWN1: "Lowers the target's SPEED.", SPECIAL_DOWN_SIDE: "May lower the target's SPECIAL.", ATTACK_UP1: 'Raises ATTACK.', SPEED_UP2: 'Sharply raises SPEED.',
    RAGE: 'ATTACK rises each time the user is hit.', MIMIC: "Copies one of the target's moves.", EVASION_UP1: 'Raises evasiveness.', HEAL: 'Restores the user\'s HP.', DEFENSE_UP1: 'Raises DEFENSE.',
    DEFENSE_UP2: 'Sharply raises DEFENSE.', LIGHT_SCREEN: 'Halves damage from special attacks.', HAZE: 'Removes all stat changes.', REFLECT: 'Halves damage from physical attacks.',
    FOCUS_ENERGY: 'Raises the critical-hit ratio.', BIDE: 'Endures for 2-3 turns, then strikes back double.', METRONOME: 'Uses a random move.', MIRROR_MOVE: "Copies the target's last move.",
    EXPLODE: 'A huge blast; the user faints.', SWIFT: 'Never misses.', SPECIAL_UP2: 'Sharply raises SPECIAL.', DREAM_EATER: 'Drains HP from a sleeping target.', TRANSFORM: 'Transforms into the target.',
    SPLASH: 'Does nothing at all.', CONVERSION: "Changes the user's type to the target's.", SUPER_FANG: "Cuts the target's HP in half.", SUBSTITUTE: 'Makes a decoy using 1/4 of the user\'s HP.',
  };
  G.moveEffectText = md => EFFECT_TEXT[md.effect] || 'A special technique.';
})(window.G);
