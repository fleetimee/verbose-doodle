import { getData, listKeys, lsEncode, lsDecode, insertBackup } from './save.js';
import { migrateChar, migrateSlots } from './items.js';
import { NPC_DEFS } from './npcs.js';
import { TILE, WALL } from './tiles.js';

const MAX_BYTES = 50 * 1024 * 1024;
const TYPES = { Uint8Array, Uint16Array, Int16Array, Uint32Array };
function check(ok) { if (!ok) throw new Error('Invalid Terrabrowser backup.'); }
function object(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function number(v) { return typeof v === 'number' && Number.isFinite(v); }
function pair(v) { return Array.isArray(v) && v.length === 2 && v.every(number); }
function identity(v) {
  check(object(v) && typeof v.id === 'string' && v.id.length > 0 && v.id.length <= 100);
  check(typeof v.name === 'string' && v.name.trim().length > 0 && v.name.length <= 100);
}
function slots(v, length) {
  check(Array.isArray(v) && v.length === length);
  for (const s of v) check(s === null || (object(s) && typeof s.id === 'string' && Number.isInteger(s.n) && s.n > 0));
  migrateSlots(v);
}
function character(c) {
  identity(c);
  check(object(c.look) && number(c.created) && number(c.maxHp) && c.maxHp > 0 && number(c.maxMana) && c.maxMana >= 0);
  for (const [key, length] of [['inv', 50], ['coins', 4], ['armor', 3], ['acc', 3]]) slots(c[key], length);
  check(c.spawns === undefined || (object(c.spawns) && Object.values(c.spawns).every(pair)));
  migrateChar(c);
}
function world(entry) {
  check(object(entry));
  const { meta, data: d } = entry;
  identity(meta); identity(d);
  check(meta.id === d.id && d.v === 1 && number(d.seed) && number(meta.created) && number(meta.played));
  check(Number.isInteger(d.w) && d.w > 0 && d.w <= 1600 && Number.isInteger(d.h) && d.h > 0 && d.h <= 600);
  const cells = d.w * d.h;
  for (const key of ['tile', 'wall', 'meta', 'liq', 'ltype', 'explored']) {
    const runs = d[key];
    check(runs instanceof Uint16Array && runs.length % 2 === 0);
    let total = 0;
    const maxValue = { tile: TILE.length - 1, wall: WALL.length - 1, meta: 255, liq: 255, ltype: 1, explored: 1 }[key];
    for (let i = 1; i < runs.length; i += 2) { check(runs[i] > 0 && runs[i - 1] <= maxValue); total += runs[i]; }
    check(total === cells);
  }
  check(d.surf instanceof Int16Array && d.surf.length === d.w);
  check(Array.isArray(d.lines) && d.lines.length === 3 && d.lines.every(number) && pair(d.spawn));
  check(pair(d.blightX));
  for (const key of ['cryptX', 'cryptY']) check(number(d[key]));
  check(d.cryptDoor === null || pair(d.cryptDoor));
  check(Array.isArray(d.chests) && d.chests.length <= cells);
  for (const chest of d.chests) {
    check(Array.isArray(chest) && chest.length === 2 && typeof chest[0] === 'string' && /^\d+,\d+$/.test(chest[0]));
    const [x, y] = chest[0].split(',').map(Number);
    check(x < d.w && y < d.h);
    check(Array.isArray(chest[1]) && chest[1].length <= 100);
    slots(chest[1], chest[1].length);
  }
  check(Array.isArray(d.npcs) && d.npcs.length <= 100);
  for (const n of d.npcs) check(object(n) && Object.hasOwn(NPC_DEFS, n.key) && number(n.x) && number(n.y) && (n.home === null || pair(n.home)));
  check(object(d.flags) && object(d.flags.bosses) && object(d.time) && number(d.time.t) && number(d.time.day));
  check(['normal', 'hard'].includes(d.difficulty) && meta.difficulty === d.difficulty);
}

export function parseBackup(text) {
  check(typeof text === 'string' && text.length <= MAX_BYTES);
  // Validate typed-array tags before the existing save decoder allocates buffers.
  const raw = JSON.parse(text, (key, value) => {
    check(key !== '__proto__' && key !== 'constructor' && key !== 'prototype');
    if (object(value) && Object.hasOwn(value, '__ta')) {
      check(Object.hasOwn(TYPES, value.__ta) && typeof value.d === 'string');
      check(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.d));
      const bytes = atob(value.d).length;
      check(bytes % TYPES[value.__ta].BYTES_PER_ELEMENT === 0);
    }
    return value;
  });
  check(object(raw) && raw.format === 'terrabrowser-backup' && raw.version === 1);
  const backup = lsDecode(text);
  check(Array.isArray(backup.characters) && backup.characters.length <= 1000 && Array.isArray(backup.worlds) && backup.worlds.length <= 100);
  const ids = new Set();
  for (const c of backup.characters) { character(c); check(!ids.has(c.id)); ids.add(c.id); }
  ids.clear();
  for (const w of backup.worlds) { world(w); check(!ids.has(w.meta.id)); ids.add(w.meta.id); }
  return backup;
}

export function describeBackup(backup) {
  return {
    characters: backup.characters.map(c => ({ id: c.id, name: c.name })),
    worlds: backup.worlds.map(w => ({ id: w.meta.id, name: w.meta.name })),
  };
}

export async function listBackupSaves() {
  const characters = [];
  const worlds = [];
  for (const [prefix, target] of [['char:', characters], ['wmeta:', worlds]]) {
    for (const key of await listKeys(prefix)) {
      const value = await getData(key);
      if (value) { identity(value); target.push({ id: value.id, name: value.name }); }
    }
  }
  return { characters, worlds };
}

function validateSelection(catalog, selection) {
  check(object(selection) && Array.isArray(selection.characters) && Array.isArray(selection.worlds));
  if (selection.characters.length + selection.worlds.length === 0) throw new Error('backupSelectionRequired');
  for (const kind of ['characters', 'worlds']) {
    const available = new Set(catalog[kind].map(s => s.id));
    check(new Set(selection[kind]).size === selection[kind].length && selection[kind].every(id => available.has(id)));
  }
}

export function selectBackup(backup, selection) {
  if (!selection) return backup;
  validateSelection(describeBackup(backup), selection);
  return {
    ...backup,
    characters: backup.characters.filter(c => selection.characters.includes(c.id)),
    worlds: backup.worlds.filter(w => selection.worlds.includes(w.meta.id)),
  };
}

export async function exportBackup(selection) {
  if (selection) validateSelection(await listBackupSaves(), selection);
  const characters = [];
  for (const key of await listKeys('char:')) {
    const value = await getData(key);
    if (value && (!selection || selection.characters.includes(value.id))) characters.push(value);
  }
  const worlds = [];
  for (const key of await listKeys('wmeta:')) {
    const meta = await getData(key);
    if (selection && meta && !selection.worlds.includes(meta.id)) continue;
    const data = meta && await getData('world:' + meta.id);
    if (!meta || !data) throw new Error('A saved world is incomplete.');
    worlds.push({ meta, data });
  }
  const text = lsEncode({ format: 'terrabrowser-backup', version: 1, characters, worlds });
  parseBackup(text);
  return text;
}

export function prepareImport(backup) {
  const entries = [];
  const worlds = new Map(backup.worlds.map(w => [w.meta.id, 'w' + crypto.randomUUID()]));
  for (const w of backup.worlds) {
    const id = worlds.get(w.meta.id);
    entries.push(['world:' + id, { ...w.data, id }], ['wmeta:' + id, { ...w.meta, id }]);
  }
  for (const c of backup.characters) {
    const id = 'c' + crypto.randomUUID();
    const spawns = Object.fromEntries(Object.entries(c.spawns || {}).filter(([key]) => worlds.has(key)).map(([key, value]) => [worlds.get(key), value]));
    entries.push(['char:' + id, { ...c, id, spawns }]);
  }
  return entries;
}

export async function importBackup(text, selection) {
  const backup = selectBackup(parseBackup(text), selection);
  await insertBackup(prepareImport(backup));
  return { characters: backup.characters.length, worlds: backup.worlds.length };
}
