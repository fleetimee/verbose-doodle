// Non-human overworld sprites: items, boulders, props and small creatures.
(function (G) {
  'use strict';
  const { Surface, hex, shade, fromRows } = G.gfx;
  const P = G.PAL;
  const O = '#1b1a2e';
  const ART = {
    ball: { pal: { O, R: '#e04848', r: '#a82838', L: '#ff9a8a', W: '#f8f8f8', w: '#c8c8d8', K: '#3a3a48' }, rows: [
      '................', '................', '................', '................', '................',
      '.....OOOOOO.....', '....OLRRRRRO....', '...ORLRRRRRrO...', '...ORRRRRRRrO...', '...OOOOWWOOOO...',
      '...OWWOWKOWwO...', '...OWWWOOWWwO...', '....OWWWWWwO....', '.....OOOOOO.....', '................', '................'] },
    boulder: { pal: { O, A: '#e8dccc', B: '#c8b8a4', C: '#a08c78', D: '#786454', E: '#56463c' }, rows: [
      '................', '.....OOOOOO.....', '...OOABBBBCOO...', '..OABBBBBCCCDO..', '.OABBBBBBCCCDDO.', '.OBBBBBBCCCCDDO.',
      'OABBBBBCCCCCDDDO', 'OBBBBBCCCCCDDDEO', 'OBBBBCCCCCDDDDEO', 'OBBCCCCCCDDDDEEO', 'OCCCCCCDDDDDEEEO', '.OCCCDDDDDDEEEO.',
      '.ODDDDDDDEEEEEO.', '..OODDDEEEEEOO..', '....OOOOOOOO....', '................'] },
    pokedex: { pal: { O, R: '#d83a3a', r: '#982a2a', L: '#ff8a7a', G: '#8ad0f8', g: '#4a8ac8', K: '#2a2a3a' }, rows: [
      '................', '................', '................', '................', '................',
      '....OOOOOOOO....', '...OLRRRRRRRO...', '...ORGGGGRRrO...', '...ORGggGRRrO...', '...ORGGGGRKrO...',
      '...ORRRRRRRrO...', '...ORKKRRRRrO...', '...OrrrrrrrrO...', '....OOOOOOOO....', '................', '................'] },
    clipboard: { pal: { O, B: '#9a6a3a', b: '#6a4428', W: '#f8f8f0', w: '#c8c8c0', K: '#8a8a9a' }, rows: [
      '................', '................', '................', '................',
      '......OKKO......', '....OOOKKOOO....', '....OBBBBBBO....', '....OBWWWWBO....', '....OBWwwWBO....', '....OBWWWWBO....',
      '....OBWwwWBO....', '....OBWWWWBO....', '....ObbbbbbO....', '.....OOOOOO.....', '................', '................'] },
    paper: { pal: { O, W: '#f8f8f0', w: '#c8c8c0' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '....OOOOOOOO....', '....OWWWWWWO....', '....OWwwwwWO....', '....OWWWWWWO....', '....OWwwwWWO....', '....OWWWWWWO....',
      '....OOOOOOOO....', '................', '................', '................'] },
    fossil: { pal: { O, A: '#e8d8b8', B: '#c8b088', C: '#8a7050', D: '#5a4430' }, rows: [
      '................', '................', '................', '................',
      '.....OOOOOO.....', '...OOABBBBBOO...', '..OABBCBBCBBDO..', '..OBCBBCBBCBDO..', '..OBBCCCCCBBDO..', '..OBCBBCBBCBDO..',
      '..OBBCBBCBBBDO..', '...ODBBBBBDDO...', '....OODDDDOO....', '......OOOO......', '................', '................'] },
    amber: { pal: { O, A: '#fff0a0', B: '#f0c040', C: '#c88a20', D: '#8a5a18' }, rows: [
      '................', '................', '................', '................', '................',
      '......OOOO......', '.....OABBCO.....', '....OABBBCCO....', '....OBBDBBCO....', '....OBBBBCCO....',
      '....OCBBCCDO....', '.....OCCCDO.....', '......OOOO......', '................', '................', '................'] },
  };
  // Small creatures: two-frame bounce
  const CREATURES = {
    monster: { pal: { O, A: '#f8e8a8', B: '#e8c060', C: '#b88a30', E: '#1b1a2e', W: '#ffffff', R: '#e05050' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '..OO......OO....', '..OBO....OBO....', '..OBBOOOOBBO....', '.OBBBBBBBBBBO...', '.OBBEWBBBEWBO...', '.OABEEBBBEEBO...',
      '.OAABBBRBBBCO...', '..OABBBBBBCO....', '..OABBBBBBCCO...', '.OAABBBBBBCCO...', '.OABBBBBBBBCO...', '..OBBCCCCCCO....',
      '..OBBOOOOCCO....', '...OOO..OOO.....', '................', '................', '................', '................'] },
    bird: { pal: { O, A: '#e8c89a', B: '#b88a5a', C: '#7a5a3a', E: '#1b1a2e', W: '#ffffff', Y: '#f0c040', F: '#f8f0e0' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '................', '.....OOOO.......', '....OBBBBO......', '...OBEWBBBO.....', '..OYYBBBBBO.....', '...OOFFBBBBO....',
      '...OFFFBBCCBO...', '...OFFFBCCCCBO..', '....OFFBBCCCO...', '.....OFFBBBO....', '......OOYOYO....', '........Y.Y.....',
      '................', '................', '................', '................', '................', '................'] },
    fairy: { pal: { O, A: '#ffe0e8', B: '#f8b0c8', C: '#d07898', E: '#1b1a2e', W: '#ffffff', R: '#b83a5a' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '...OO....OO.....', '..OBBO..OBBO....', '..OBCBOOBCBO....', '..OBBBBBBBBO....', '.OBBBBBBBBBBO...', '.OBEWBBBBEWBO...',
      '.OBEEBBBBEEBO...', 'OAOBBBRRBBBOAO..', 'OAABBBBBBBBAAO..', '.OAABBBBBBBAO...', '..OABBBBBBBO....', '..OBBBBBBBBO....',
      '...OOCOOCOO.....', '....OO..OO......', '................', '................', '................', '................'] },
    seel: { pal: { O, A: '#ffffff', B: '#e8eef8', C: '#b8c8e0', E: '#1b1a2e', R: '#e05060' }, rows: [
      '................', '................', '................', '................', '................', '................',
      '................', '......OOOOO.....', '.....OABBBBO....', '....OABEBBBEO...', '....OBBBBRRBO...', '....OBBBBBBBO...',
      '...OOABBBBBBCO..', '..OABOBBBBBCCO..', '.OABBBBBBBBCCCO.', '.OBBBBBBBBBCCCO.', 'OCOBBBBBBBCCCCO.', 'OOOCCCCCCCCCCO..',
      '...OOOOOOOOOO...', '................', '................', '................', '................', '................'] },
    snorlax: { big: true, pal: { O, A: '#6a9ab0', B: '#3a6a88', C: '#2a4a64', D: '#1e3448', F: '#f4e8c8', f: '#d8c8a0', E: '#1b1a2e', W: '#ffffff', N: '#f8f0e0' }, rows: [
      '................................', '................................', '..........OO........OO..........', '.........OBBO......OBBO.........',
      '........OBBBBOOOOOOBBBBO........', '.......OBBBBBBBBBBBBBBBBO.......', '......OBBBFFFFFFFFFFFFBBBO......', '......OBBFFFFFFFFFFFFFFBBO......',
      '.....OBBFFFOOOFFFFOOOFFFBBO.....', '.....OBBFFFFFFFFFFFFFFFFBBO.....', '.....OBBFFFFFFOOOOFFFFFFBBO.....', '....OBBBBFFFFFFNNFFFFFFBBBBO....',
      '...OABBBBBFFFFFFFFFFFFBBBBBCO...', '..OABBBBBBBBFFFFFFFFBBBBBBBCCO..', '.OABBBBBBBFFFFFFFFFFFFBBBBBCCCO.', '.OABBBBBBFFFFFFFFFFFFFFBBBBCCCO.',
      'OABBBBBBFFFFFFFFFFFFFFFFBBBBCCCO', 'OABBBBBFFFFFFFFFFFFFFFFFFBBBCCCO', 'OABBBBBFFFFFFFFFFFFFFFFFFBBBCCCO', 'OABBBBBFFFFFFFFFFFFFFFFFFBBBCCCO',
      'OABBBBBFFFFFFFFFFFFFFFFFFBBCCCDO', '.OABBBBFFFFFFFFFFFFFFFFFfBBCCCO.', '.OABBBBBfFFFFFFFFFFFFFFffBBCCDO.', '..OBBBBBBffFFFFFFFFFFffBBBCCDO..',
      '..OBBBBBBBBfffffffffffBBBBCDDO..', '...OOFFFOBBBBBBBBBBBBBBOFFFOOO..', '..OFFFFFFOOOOOOOOOOOOOOFFFFFFO..', '..OFfFfFFO............OFFfFfFO..',
      '...OOOOOO..............OOOOOO...', '................................', '................................', '................................'] },
  };
  const cache = {};
  function one(s) { return { down: [s, s, s], up: [s, s, s], left: [s, s, s], right: [s, s, s] }; }
  const CREATURE_DEFAULT = { bird: 'PIDGEY', fairy: 'CLEFAIRY', seel: 'SEEL', snorlax: 'SNORLAX', monster: 'NIDORAN_M' };
  function speciesFromLabel(label) {
    if (!label || !G.DATA) return null;
    const up = label.toUpperCase();
    let best = null;
    for (const sp of Object.keys(G.DATA.species)) { const k = sp.replace('_', ''); if (up.includes(k) && (!best || k.length > best.replace('_', '').length)) best = sp; }
    return best;
  }
  // Small overworld Pokémon rendered from the battle sprite definitions
  function monActor(sp, big) {
    const key = 'mon:' + sp + (big ? ':big' : '');
    if (cache[key]) return cache[key];
    const sz = big ? 32 : 22;
    const f = G.pokeSprite(sp, 'front', sz), b = G.pokeSprite(sp, 'back', sz);
    const W = big ? 32 : 16 + 8, Hh = big ? 32 : 24;
    const mk = (src, dy, flip) => { const s = new Surface(W, Hh); s.blit(src, Math.round((W - src.w) / 2), Hh - src.h + dy, { flipX: !!flip }); return s; };
    const L = [mk(f, 0), mk(f, -1), mk(f, 0)], R = [mk(f, 0, 1), mk(f, -1, 1), mk(f, 0, 1)], U = [mk(b, 0), mk(b, -1), mk(b, 0)];
    return (cache[key] = { down: L, left: L, right: R, up: U, big });
  }
  G.objSprites = function (name, obj) {
    const def = G.CAST[name] || {};
    if (def.creature && G.MONDEFS) {
      const sp = (obj && (obj.species || speciesFromLabel(obj.textLabel))) || CREATURE_DEFAULT[def.creature];
      if (sp && G.MONDEFS[sp]) return monActor(sp, def.creature === 'snorlax' || sp === 'SNORLAX');
    }
    if (cache[name]) return cache[name];
    let out;
    if (def.object && ART[def.object]) {
      const a = ART[def.object];
      const s16 = fromRows(a.rows, a.pal);
      const s = new Surface(16, 24); s.blit(s16, 0, 8);
      out = one(s);
    } else if (def.creature && CREATURES[def.creature]) {
      const a = CREATURES[def.creature];
      const base = fromRows(a.rows, a.pal);
      if (a.big) {
        const s = new Surface(32, 32); s.blit(base, 0, 0);
        const f = { h: 32, w: 32 };
        const wrap = new Surface(32, 32); wrap.blit(base, 0, 0);
        const shifted = new Surface(32, 32); shifted.blit(base, 0, 1);
        out = { down: [wrap, shifted, wrap], up: [wrap, shifted, wrap], left: [wrap, shifted, wrap], right: [wrap, shifted, wrap], big: true };
      } else {
        const s = new Surface(16, 24); s.blit(base, 0, 0);
        const s2 = new Surface(16, 24); s2.blit(base, 0, 1);
        const l = [s, s2, s], r = l.map(x => x.flipped());
        out = { down: l, up: l, left: l, right: r };
      }
    } else out = G.chars.makeCharacter(G.CAST.youngster);
    cache[name] = out;
    return out;
  };
})(window.G);
