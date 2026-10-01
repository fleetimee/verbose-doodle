// Battle portraits for trainers and the player. Native 64x64 pixel art comes from src/art/portraitpx.js
// (G.trainerPicPx / G.playerBackPicPx); the Scale3x path below is only a fallback if that file is missing.
(function (G) {
  'use strict';
  const { Surface, shade, hex, rgb } = G.gfx;
  // AdvMAME3x / Scale3x pixel-art upscaler
  function scale3x(src) {
    const w = src.w, h = src.h, d = new Surface(w * 3, h * 3);
    const g = (x, y) => src.data[Math.max(0, Math.min(h - 1, y)) * w + Math.max(0, Math.min(w - 1, x))];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const A = g(x - 1, y - 1), B = g(x, y - 1), C = g(x + 1, y - 1), D = g(x - 1, y), E = g(x, y), F = g(x + 1, y), Gp = g(x - 1, y + 1), H = g(x, y + 1), I = g(x + 1, y + 1);
      let o = [E, E, E, E, E, E, E, E, E];
      if (B !== H && D !== F) {
        o[0] = D === B ? D : E;
        o[1] = (D === B && E !== C) || (B === F && E !== A) ? B : E;
        o[2] = B === F ? F : E;
        o[3] = (D === B && E !== Gp) || (D === H && E !== A) ? D : E;
        o[5] = (B === F && E !== I) || (H === F && E !== C) ? F : E;
        o[6] = D === H ? D : E;
        o[7] = (D === H && E !== I) || (H === F && E !== Gp) ? H : E;
        o[8] = H === F ? F : E;
      }
      for (let k = 0; k < 9; k++) d.data[(y * 3 + ((k / 3) | 0)) * d.w + x * 3 + (k % 3)] = o[k];
    }
    return d;
  }
  // Add soft interior shading (light from top-left) so the enlarged sprite reads as a portrait
  function reshade(s) {
    const out = s.clone(), w = s.w, h = s.h, d = s.data;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, c = d[i]; if ((c >>> 24) === 0) continue;
      const r = d[i + 1], dn = d[i + w], l = d[i - 1], up = d[i - w];
      const edgeR = (r >>> 24) === 0 || (dn >>> 24) === 0, edgeL = (l >>> 24) === 0 || (up >>> 24) === 0;
      if (G.gfx.lum(c) < 0.18) continue;
      if (edgeR && !edgeL) out.data[i] = shade(c, -0.22);
      else if (edgeL && !edgeR) out.data[i] = shade(c, 0.12);
    }
    return out;
  }
  const CLASS_CAST = {
    YOUNGSTER: 'youngster', BUG_CATCHER: 'youngster', LASS: 'girl', SAILOR: 'sailor', JR_TRAINER_M: 'little_boy', JR_TRAINER_F: 'cooltrainer_f',
    POKEMANIAC: 'super_nerd', SUPER_NERD: 'super_nerd', HIKER: 'hiker', BIKER: 'biker', BURGLAR: 'rocker', ENGINEER: 'balding_guy', UNUSED_JUGGLER: 'gambler',
    FISHER: 'fisher', SWIMMER: 'swimmer', CUE_BALL: 'biker', GAMBLER: 'gambler', BEAUTY: 'beauty', PSYCHIC_TR: 'super_nerd', ROCKER: 'rocker',
    JUGGLER: 'gambler', TAMER: 'gentleman', BIRD_KEEPER: 'youngster', BLACKBELT: 'bruno', RIVAL1: 'blue', PROF_OAK: 'oak', CHIEF: 'gramps',
    SCIENTIST: 'scientist', GIOVANNI: 'giovanni', ROCKET: 'rocket', COOLTRAINER_M: 'cooltrainer_m', COOLTRAINER_F: 'cooltrainer_f', BRUNO: 'bruno',
    BROCK: 'brock', MISTY: 'misty', LT_SURGE: 'surge', ERIKA: 'erika', KOGA: 'koga', BLAINE: 'blaine', SABRINA: 'sabrina', GENTLEMAN: 'gentleman',
    RIVAL2: 'blue', RIVAL3: 'blue', LORELEI: 'lorelei', CHANNELER: 'channeler', AGATHA: 'agatha', LANCE: 'lance',
  };
  // Gym leader looks (overworld sprites in Red share generic sprites; the portraits get unique palettes)
  const LEADER_CAST = ({
    brock: { head: 'spiky', hair: '#4a2e22', skin: '#c88a5a', shirt: '#8a6a3a', accent: '#5a8a3a', pants: '#5a4a3a', shoes: '#3a2a2a' },
    misty: { head: 'pony', hair: '#e8783a', shirt: '#f0e04a', accent: '#d84040', pants: '#3a6ad0', shoes: '#d84040' },
    surge: { head: 'spiky', hair: '#e8d060', shirt: '#6a7a3a', accent: '#e8d060', pants: '#4a5a2a', shoes: '#2a2a2a', skin: '#e8b080' },
    erika: { head: 'bun', hair: '#3a2a3a', body: 'dress', shirt: '#e8a040', accent: '#d84040', shoes: '#8a3a3a' },
    blaine: { head: 'bald', hair: '#e8e8e8', beard: '#e8e8e8', glasses: true, shirt: '#e8e8e8', accent: '#d84040', pants: '#3a3a4a', shoes: '#2a2a2a' },
    sabrina: { head: 'long', hair: '#1a1a2a', body: 'dress', shirt: '#b83a4a', accent: '#f0e0e8', shoes: '#3a1a2a' },
  });
  // Portrait-only extras per cast entry (fields understood by G.trainerPicPx; the overworld sprites ignore them).
  // face: 'slit' | 'f' | 'old'; body: 'suit' | 'robe'; beardStyle: 'mustache'; shades; cape; shorts; gloves; pose
  const PORTRAIT_LOOKS = {
    brock: { face: 'slit' },
    misty: { shorts: true, face: 'f' },
    surge: { body: 'suit', shirt: '#6a7a3a', accent: '#e8d060', face: 'old', pose: 'cross' },
    erika: { body: 'robe', face: 'f', hairband: '#d84040' },
    koga: { mask: true, gloves: '#e8e0f0' },
    sabrina: { face: 'f', body: 'robe' },
    blaine: { shades: true, beardStyle: 'mustache', face: 'old' },
    giovanni: { body: 'suit', accent: '#f8f8f8', tie: '#3a2a2a', pose: 'cross' },
    gentleman: { body: 'suit', beardStyle: 'mustache', face: 'old', tie: '#c83a3a' },
    rocket: { gloves: '#e8e8f0', head: 'cap', hat: '#2a2a34', hatK: '#2a2a34', brim: '#18181e' },
    lorelei: { face: 'f', body: 'robe' },
    agatha: { face: 'old', body: 'robe' },
    channeler: { face: 'f', body: 'robe' },
    lance: { cape: '#2a2a3a', capeIn: '#c83a3a' },
    bruno: { pose: 'cross', face: 'slit' },
    youngster: { shorts: true },
    beauty: { face: 'f' },
    girl: { face: 'f' },
    cooltrainer_f: { face: 'f' },
    little_girl: { face: 'f' },
    oak: { face: 'old' },
    mr_fuji: { face: 'old' },
    gramps: { face: 'old' },
    granny: { face: 'old' },
    fishing_guru: { face: 'old' },
    hiker: { pose: 'cross', bigPack: true },
  };
  G.PORTRAIT_LOOKS = PORTRAIT_LOOKS;
  let castReady = false;
  function ensureCast() { if (!castReady) { for (const k in LEADER_CAST) if (!G.CAST[k]) G.CAST[k] = LEADER_CAST[k]; castReady = true; } }
  const cache = {};
  G.castPortrait = function (name) {
    ensureCast();
    const def = G.CAST[name] || G.CAST.youngster;
    if (G.trainerPicPx) return G.trainerPicPx(def);
    return reshade(scale3x(G.chars.makeCharacter(def).down[0]));
  };
  G.trainerPic = function (cls, trainer) {
    const key = cls;
    if (cache[key]) return cache[key];
    const name = CLASS_CAST[cls] || 'youngster';
    return (cache[key] = G.castPortrait(G.CAST[name] || LEADER_CAST[name] ? name : 'youngster'));
  };
  G.trainerBackPic = function () {
    const key = '_player' + JSON.stringify(G.CAST.red);
    if (cache[key]) return cache[key];
    const s = G.playerBackPicPx ? G.playerBackPicPx() : reshade(scale3x(G.chars.makeCharacter(G.CAST.red).up[0]));
    return (cache[key] = s);
  };
  G.scale3x = scale3x;
  G.CLASS_CAST = CLASS_CAST;
})(window.G);
