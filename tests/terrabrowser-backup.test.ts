import { beforeEach, expect, test } from "bun:test";

const gamePath = "../public/games/terrabrowser/src/";
const { exportBackup, importBackup, parseBackup, prepareImport } = await import(
  `${gamePath}backup.js`
);
const { putData, getData, listKeys, packWorld, unpackWorld, lsEncode } =
  await import(`${gamePath}save.js`);
const { createWorld } = await import(`${gamePath}world.js`);
const { newCharacter } = await import(`${gamePath}player.js`);
const { randomLook } = await import(`${gamePath}ui.js`);

beforeEach(() => localStorage.clear());

function fixture() {
  const world = createWorld(4, 3);
  Object.assign(world, {
    id: "world-original",
    name: "Home",
    seed: 42,
    difficulty: "normal",
    surfaceLine: 1,
    rockLine: 2,
    hellLine: 2,
    spawnX: 1,
    spawnY: 1,
    blightX: [0, 1],
    cryptX: 2,
    cryptY: 1,
  });
  world.tile[3] = 1;
  world.chests.set("3,0", [{ id: "copper_sword", n: 2 }]);
  const data = packWorld({
    world,
    npcs: [],
    flags: { bosses: {}, orbs: 0 },
    time: { t: 12, day: 1 },
  });
  const character = newCharacter("Miner", randomLook());
  character.id = "character-original";
  character.spawns = { [world.id]: [1, 1] };
  return {
    format: "terrabrowser-backup",
    version: 1,
    characters: [character],
    worlds: [
      {
        meta: {
          id: world.id,
          name: world.name,
          seed: 42,
          difficulty: "normal",
          created: 1,
          played: 2,
        },
        data,
      },
    ],
  };
}

test("exports and restores inventory, terrain, chests and bed links without overwriting", async () => {
  const backup = fixture();
  await putData("char:character-original", backup.characters[0]);
  await putData("world:world-original", backup.worlds[0].data);
  await putData("wmeta:world-original", backup.worlds[0].meta);
  const text = await exportBackup();
  expect(parseBackup(text).worlds[0].data.tile).toBeInstanceOf(Uint16Array);
  expect(await importBackup(text)).toEqual({ characters: 1, worlds: 1 });
  const charKeys = await listKeys("char:");
  expect(charKeys).toHaveLength(2);
  const imported = await getData(
    charKeys.find((key: string) => key !== "char:character-original")
  );
  expect(imported.inv).toEqual(backup.characters[0].inv);
  const worldId = Object.keys(imported.spawns)[0];
  expect(worldId).not.toBe("world-original");
  expect(imported.spawns[worldId]).toEqual([1, 1]);
  const restored = unpackWorld(await getData(`world:${worldId}`));
  expect(restored.tile[3]).toBe(1);
  expect(restored.chests.get("3,0")).toEqual([{ id: "copper_sword", n: 2 }]);
  expect(await getData("char:character-original")).toEqual(
    backup.characters[0]
  );
});

test("rejects malformed and unsupported backups before writing any saves", async () => {
  for (const text of [
    "{",
    '{"format":"other","version":1}',
    lsEncode({ ...fixture(), version: 2 }),
  ]) {
    await expect(importBackup(text)).rejects.toThrow();
  }
  expect(await listKeys("char:")).toEqual([]);
  expect(await listKeys("world:")).toEqual([]);
});

test("rejects broken world arrays and duplicate IDs", () => {
  const backup = fixture();
  backup.worlds[0].data.tile = new Uint16Array([1, 2]);
  expect(() => parseBackup(lsEncode(backup))).toThrow();
  const duplicate = fixture();
  duplicate.characters.push(duplicate.characters[0]);
  expect(() => parseBackup(lsEncode(duplicate))).toThrow();
});

test("rejects unsafe typed array tags and invalid inventory structure", () => {
  const backup = fixture();
  const text = lsEncode(backup);
  expect(() =>
    parseBackup(text.replace('"__ta":"Uint16Array"', '"__ta":"constructor"'))
  ).toThrow();
  backup.characters[0].inv = [];
  expect(() => parseBackup(lsEncode(backup))).toThrow();
});

test("separate imports always get distinct save IDs", () => {
  const backup = parseBackup(lsEncode(fixture()));
  const first = prepareImport(backup).map(([key]: [string, unknown]) => key);
  const second = prepareImport(backup).map(([key]: [string, unknown]) => key);
  expect(first.some((key: string) => second.includes(key))).toBe(false);
});

test("rolls back a partial import when browser storage fills up", async () => {
  await putData("char:existing", { name: "Keep me" });
  const storage = localStorage;
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage"
  );
  let writes = 0;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: storage.getItem.bind(storage),
      removeItem: storage.removeItem.bind(storage),
      setItem(key: string, value: string) {
        writes += 1;
        if (writes === 2) {
          throw new Error("Storage full");
        }
        storage.setItem(key, value);
      },
    },
  });
  try {
    await expect(importBackup(lsEncode(fixture()))).rejects.toThrow();
  } finally {
    if (descriptor) {
      Object.defineProperty(globalThis, "localStorage", descriptor);
    }
  }
  expect(await listKeys("world:")).toEqual([]);
  expect(await listKeys("wmeta:")).toEqual([]);
  expect(await getData("char:existing")).toEqual({ name: "Keep me" });
});

test("accepts a complete world produced by the actual game generator", async () => {
  const { generateWorld } = await import(`${gamePath}worldgen.js`);
  const world = await generateWorld(42, "Generated", () => {});
  world.id = "generated-world";
  world.difficulty = "hard";
  const backup = fixture();
  backup.worlds = [
    {
      meta: {
        id: world.id,
        name: world.name,
        seed: 42,
        difficulty: "hard",
        created: 1,
        played: 2,
      },
      data: packWorld({
        world,
        npcs: [{ key: "guide", x: 0, y: 0, home: [1, 2] }],
        flags: { bosses: {}, orbs: 0 },
        time: { t: 12, day: 1 },
      }),
    },
  ];
  const decoded = parseBackup(lsEncode(backup));
  const restored = unpackWorld(decoded.worlds[0].data);
  expect(restored.tile).toEqual(world.tile);
  expect(restored.wall).toEqual(world.wall);
  expect(restored.surf).toEqual(world.surf);
  expect(restored.chests).toEqual(world.chests);
});

test("exports only selected characters even if an unrelated world is incomplete", async () => {
  const backup = fixture();
  await putData("char:character-original", backup.characters[0]);
  await putData("wmeta:world-original", backup.worlds[0].meta);
  const decoded = parseBackup(
    await exportBackup({ characters: ["character-original"], worlds: [] })
  );
  expect(decoded.characters).toHaveLength(1);
  expect(decoded.worlds).toEqual([]);
});

test("imports only the selected world from a mixed backup", async () => {
  const selection = { characters: [], worlds: ["world-original"] };
  expect(await importBackup(lsEncode(fixture()), selection)).toEqual({
    characters: 0,
    worlds: 1,
  });
  expect(await listKeys("char:")).toEqual([]);
  expect(await listKeys("world:")).toHaveLength(1);
});

test("imports only a selected character and rejects empty or unknown selections", async () => {
  const text = lsEncode(fixture());
  await expect(
    importBackup(text, { characters: [], worlds: [] })
  ).rejects.toThrow("backupSelectionRequired");
  await expect(
    importBackup(text, { characters: ["missing"], worlds: [] })
  ).rejects.toThrow();
  expect(await listKeys("char:")).toEqual([]);
  expect(
    await importBackup(text, { characters: ["character-original"], worlds: [] })
  ).toEqual({ characters: 1, worlds: 0 });
  expect(await listKeys("world:")).toEqual([]);
  const character = await getData((await listKeys("char:"))[0]);
  expect(character.spawns).toEqual({});
});
