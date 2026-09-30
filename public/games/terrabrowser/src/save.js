// Persistence: IndexedDB with localStorage fallback. World arrays are RLE-compressed.
import { createWorld, computeSkyTop } from './world.js';
import { migrateSlots } from './items.js';

const DB = 'terrabrowser', STORE = 'saves', LS = 'tb:';
let dbp = null;
function openDB() {
  if (dbp) return dbp;
  dbp = new Promise(res => {
    try {
      if (!window.indexedDB) return res(null);
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
      r.onblocked = () => res(null);
    } catch (e) { res(null); }
  });
  return dbp;
}
function tx(db, mode, fn) {
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), st = t.objectStore(STORE);
    const r = fn(st);
    t.oncomplete = () => res(r && r.result);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}

// ---- typed array <-> base64 for the localStorage fallback
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
const TA = { Uint8Array, Uint16Array, Int16Array, Uint32Array };
function lsEncode(v) {
  return JSON.stringify(v, (k, x) => {
    if (x && TA[x.constructor && x.constructor.name] && ArrayBuffer.isView(x)) return { __ta: x.constructor.name, d: b64(new Uint8Array(x.buffer, x.byteOffset, x.byteLength)) };
    return x;
  });
}
function lsDecode(s) {
  return JSON.parse(s, (k, x) => {
    if (x && x.__ta) { const u = unb64(x.d); return new TA[x.__ta](u.buffer); }
    return x;
  });
}

export async function putData(key, val) {
  const db = await openDB();
  if (db) { try { await tx(db, 'readwrite', st => st.put(val, key)); return true; } catch (e) { /* fall through to localStorage */ } }
  try { localStorage.setItem(LS + key, lsEncode(val)); return true; } catch (e) { return false; }
}
export async function getData(key) {
  const db = await openDB();
  if (db) { try { const v = await tx(db, 'readonly', st => st.get(key)); if (v !== undefined) return v; } catch (e) { /* try localStorage */ } }
  try { const s = localStorage.getItem(LS + key); return s ? lsDecode(s) : null; } catch (e) { return null; }
}
export async function delData(key) {
  const db = await openDB();
  if (db) { try { await tx(db, 'readwrite', st => st.delete(key)); } catch (e) { /* ignore */ } }
  try { localStorage.removeItem(LS + key); } catch (e) { /* ignore */ }
}
export async function listKeys(prefix) {
  const out = new Set();
  const db = await openDB();
  if (db) { try { const ks = await tx(db, 'readonly', st => st.getAllKeys()); for (const k of ks || []) if (String(k).startsWith(prefix)) out.add(String(k)); } catch (e) { /* ignore */ } }
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(LS + prefix)) out.add(k.slice(LS.length)); } } catch (e) { /* ignore */ }
  return [...out];
}

// ---- RLE: pairs of (value, runLength) packed in a Uint16Array (or Uint32 for large values)
export function rleEncode(arr) {
  const out = [];
  let i = 0;
  while (i < arr.length) {
    const v = arr[i];
    let n = 1;
    while (i + n < arr.length && arr[i + n] === v && n < 65535) n++;
    out.push(v, n);
    i += n;
  }
  return Uint16Array.from(out);
}
export function rleDecode(runs, Ctor, len) {
  const a = new Ctor(len);
  let o = 0;
  for (let i = 0; i < runs.length; i += 2) { a.fill(runs[i], o, o + runs[i + 1]); o += runs[i + 1]; }
  return a;
}

export function packWorld(G) {
  const wd = G.world;
  return {
    v: 1, id: wd.id, name: wd.name, seed: wd.seed, w: wd.w, h: wd.h, difficulty: wd.difficulty || 'normal',
    tile: rleEncode(wd.tile), wall: rleEncode(wd.wall), meta: rleEncode(wd.meta), liq: rleEncode(wd.liq), ltype: rleEncode(wd.ltype), explored: rleEncode(wd.explored),
    surf: Int16Array.from(wd.surf),
    lines: [wd.surfaceLine, wd.rockLine, wd.hellLine], spawn: [wd.spawnX, wd.spawnY],
    blightX: wd.blightX, cryptX: wd.cryptX, cryptY: wd.cryptY, cryptDoor: wd.cryptDoor || null,
    chests: [...wd.chests.entries()],
    npcs: G.npcs.map(n => ({ key: n.key, x: n.x, y: n.y, home: n.home })),
    flags: G.flags, time: { t: G.time.t, day: G.time.day },
  };
}
export function unpackWorld(d) {
  const wd = createWorld(d.w, d.h), n = d.w * d.h;
  wd.id = d.id; wd.name = d.name; wd.seed = d.seed; wd.difficulty = d.difficulty || 'normal';
  wd.tile = rleDecode(d.tile, Uint16Array, n); wd.wall = rleDecode(d.wall, Uint8Array, n); wd.meta = rleDecode(d.meta, Uint8Array, n);
  wd.liq = rleDecode(d.liq, Uint8Array, n); wd.ltype = rleDecode(d.ltype, Uint8Array, n); wd.explored = rleDecode(d.explored, Uint8Array, n);
  wd.surf = Int16Array.from(d.surf);
  [wd.surfaceLine, wd.rockLine, wd.hellLine] = d.lines;
  [wd.spawnX, wd.spawnY] = d.spawn;
  wd.blightX = d.blightX; wd.cryptX = d.cryptX; wd.cryptY = d.cryptY; wd.cryptDoor = d.cryptDoor;
  wd.chests = new Map(d.chests);
  for (const items of wd.chests.values()) migrateSlots(items);
  computeSkyTop(wd);
  return wd;
}
