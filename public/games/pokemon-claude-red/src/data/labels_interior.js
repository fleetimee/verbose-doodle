// Semantic labels for interior/dungeon tilesets (see tools/LABEL_GUIDE.md, notes in tools/LABEL_NOTES.md).
// index = quad index in G.MAPDATA.quads[<tileset>]; collision comes from tile ids, labels are visual only.
G.LABELS = G.LABELS || {};
G.LABELS.cavern = [
  /*0*/ 'cave_ledge', 'cave_high', 'cave_ledge', 'cave_ledge', 'cave_ledge', 'cave_ledge', 'cave_ledge', 'cave_wall', 'cave_high', 'ladder_up',
  /*10*/ 'cave_ledge', 'cave_wall', 'cave_rock', 'cave_floor', 'cave_wall', 'cave_wall', 'stairs_up', 'cave_wall', 'cave_ledge', 'cave_ledge',
  /*20*/ 'cave_rock', 'water', 'ladder_down', 'cave_wall', 'cave_wall', 'mat', 'sign', 'void', 'cave_rock', 'hole',
  /*30*/ 'teleport', 'cave_floor2',
];
G.LABELS.cemetery = [
  /*0*/ 'wall', 'floor_tower', 'grave', 'statue', 'statue', 'void', 'void', 'wall', 'stairs_up', 'counter',
  /*10*/ 'counter', 'stairs_down', 'floor_tile',
];
G.LABELS.club = [
  /*0*/ 'display', 'display', 'display', 'display', 'wall', 'display', 'display', 'display', 'display', 'counter',
  /*10*/ 'floor_tile', 'counter', 'counter', 'counter', 'counter', 'mat', 'plant', 'void', 'pillar', 'floor_tile',
  /*20*/ 'wall_deco', 'wall_deco', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile',
  /*30*/ 'floor_tile', 'chair', 'floor_tile', 'floor_tile', 'machine', 'machine', 'floor_tile', 'floor_tile', 'floor_tile', 'floor_tile',
  /*40*/ 'floor_tile', 'wall_deco', 'wall_deco', 'floor_tile', 'floor_tile', 'table', 'table', 'floor_tile', 'floor_tile',
];
G.LABELS.facility = [
  /*0*/ 'wall', 'wall', 'wall', 'floor_tile', 'machine', 'machine', 'wall', 'wall', 'statue', 'statue',
  /*10*/ 'wall', 'wall', 'mat', 'mat', 'void', 'wall', 'cave_rock', 'crate', 'table', 'table',
  /*20*/ 'table', 'table', 'bed', 'bed', 'stairs_up', 'mat', 'plant', 'plant', 'stairs_down', 'machine',
  /*30*/ 'railing', 'hole', 'railing', 'railing', 'table', 'table', 'spinner_stop', 'spinner_left', 'spinner_right', 'spinner_up',
  /*40*/ 'spinner_down', 'teleport', 'wall', 'stairs_up', 'door', 'counter', 'counter', 'counter', 'counter', 'flowers',
];
G.LABELS.forest = [
  /*0*/ 'path', 'tree2', 'tree', 'tree', 'tree', 'tree', 'mat', 'mat', 'tall_grass', 'path_tufts',
  /*10*/ 'path_tufts', 'tall_grass', 'tall_grass', 'tall_grass', 'water', 'water', 'water', 'water', 'water', 'water',
  /*20*/ 'mat', 'mat', 'water', 'path_tufts', 'path_tufts', 'water', 'mat', 'mat', 'water', 'water',
  /*30*/ 'statue', 'statue', 'fence', 'roof_house', 'roof_house', 'wall', 'door', 'roof_house', 'window', 'wall',
  /*40*/ 'sign', 'path', 'tree', 'cliff', 'cliff_top', 'cliff', 'cliff_top', 'cliff', 'cliff', 'cliff',
  /*50*/ 'cliff', 'stairs_wood', 'cliff', 'grass', 'grass', 'grass', 'grass', 'cliff', 'cliff', 'mat',
  /*60*/ 'mat', 'void',
];
G.LABELS.gate = [
  /*0*/ 'wall', 'floor_tile', 'wall_deco', 'counter', 'counter', 'bookshelf', 'bookshelf', 'fossil', 'display', 'fossil',
  /*10*/ 'fossil', 'display', 'display', 'fossil', 'display', 'chair', 'trash', 'counter', 'counter', 'counter',
  /*20*/ 'counter', 'stairs_up', 'mat', 'plant', 'plant', 'void', 'display', 'display', 'display', 'display',
  /*30*/ 'display', 'display', 'display', 'display', 'display', 'display', 'stairs_down', 'wall', 'counter', 'mat',
  /*40*/ 'mat', 'window_big', 'window_big', 'window_big', 'window_big', 'window_big', 'window_big', 'machine', 'floor_tile', 'mat',
  /*50*/ 'mat', 'wall', 'statue', 'statue', 'door', 'statue', 'counter', 'counter',
];
G.LABELS.gym = [
  /*0*/ 'wall', 'floor_stone', 'cave_rock', 'gym_statue', 'gym_statue', 'void', 'grass', 'grass', 'tree2', 'grass',
  /*10*/ 'cut_tree', 'mat', 'floor_tile', 'water', 'floor_stone', 'water', 'wall', 'wall', 'wall', 'wall',
  /*20*/ 'wall', 'wall', 'wall_deco', 'wall', 'floor_stone', 'pc', 'pc', 'table', 'table', 'wall',
  /*30*/ 'door', 'wall', 'stairs_up', 'wall', 'wall', 'wall', 'wall', 'table', 'table', 'bookshelf',
  /*40*/ 'bookshelf', 'table', 'table', 'table', 'table', 'barrier', 'barrier', 'trash', 'wall', 'barrier',
  /*50*/ 'barrier', 'spinner_stop', 'spinner_left', 'spinner_right', 'spinner_down', 'spinner_up',
];
G.LABELS.house = [
  /*0*/ 'cabinet', 'cabinet', 'wall', 'wall_deco', 'floor', 'wall_window', 'bookshelf', 'bookshelf', 'chair', 'table',
  /*10*/ 'table', 'table', 'table', 'plant', 'plant', 'mat', 'void', 'board', 'board', 'table',
  /*20*/ 'table', 'wall', 'door', 'floor', 'floor', 'floor', 'floor', 'floor', 'chair', 'floor',
  /*30*/ 'floor', 'floor', 'floor', 'table', 'plant', 'plant',
];
G.LABELS.interior = [
  /*0*/ 'wall', 'wall', 'machine', 'machine', 'wall', 'wall', 'machine', 'machine', 'floor', 'machine',
  /*10*/ 'floor', 'floor', 'floor', 'pc', 'chair', 'pc', 'desk', 'mat', 'void', 'wall',
  /*20*/ 'wall_deco', 'bench', 'bench', 'bench', 'bench', 'bench', 'bench', 'chair', 'table', 'table',
  /*30*/ 'table', 'table', 'table', 'table', 'table', 'table', 'table', 'table', 'floor', 'table',
  /*40*/ 'table', 'table', 'floor', 'wall', 'wall', 'stairs_down', 'door', 'teleport', 'wall', 'wall',
  /*50*/ 'wall', 'wall', 'wall', 'wall', 'wall',
];
G.LABELS.lab = [
  /*0*/ 'void', 'plant', 'wall', 'plant', 'floor_tile', 'wall_deco', 'wall', 'door', 'wall_deco', 'mat',
  /*10*/ 'machine', 'machine', 'machine', 'machine', 'machine', 'machine', 'machine', 'machine', 'machine', 'machine',
  /*20*/ 'floor_tile', 'pc', 'pc', 'chair', 'desk', 'table', 'table', 'table', 'table', 'sink',
  /*30*/ 'bookshelf', 'bookshelf', 'chair', 'table', 'table', 'table', 'table', 'table', 'table', 'table',
  /*40*/ 'table', 'table', 'display', 'display', 'display', 'display', 'cave_rock',
];
G.LABELS.lobby = [
  /*0*/ 'wall', 'chair', 'floor_tile', 'counter', 'counter', 'floor_carpet', 'table', 'table', 'table', 'table',
  /*10*/ 'mat', 'counter', 'counter', 'void', 'wall', 'door', 'wall_deco', 'stairs_up', 'wall_deco', 'vending',
  /*20*/ 'vending', 'counter', 'stairs_down', 'shelf', 'shelf', 'counter', 'shelf', 'shelf', 'wall_deco', 'tv',
  /*30*/ 'console', 'counter', 'counter', 'counter', 'counter', 'counter', 'counter', 'wall_deco', 'void', 'railing',
  /*40*/ 'railing', 'vending', 'wall', 'wall', 'railing', 'counter', 'slots', 'slots', 'slots', 'wall_deco',
  /*50*/ 'wall', 'wall_deco',
];
G.LABELS.mansion = [
  /*0*/ 'wall', 'floor_carpet', 'cabinet', 'display', 'cabinet', 'display', 'table', 'table', 'table', 'table',
  /*10*/ 'table', 'table', 'plant', 'plant', 'mat', 'void', 'stairs_up', 'floor_stone', 'door', 'wall',
  /*20*/ 'wall', 'cabinet', 'wall', 'floor_carpet', 'wall', 'wall_deco', 'wall', 'stairs_down', 'cabinet', 'pc',
  /*30*/ 'pc', 'chair', 'desk', 'bed', 'bed', 'wall', 'wall', 'wall', 'roof_flat', 'roof_flat',
  /*40*/ 'roof_flat', 'wall', 'wall_deco', 'railing', 'railing', 'railing', 'void',
];
G.LABELS.plateau = [
  /*0*/ 'wall', 'roof_flat', 'statue', 'roof_flat', 'roof_flat', 'pillar', 'wall', 'pillar', 'wall', 'path_tufts',
  /*10*/ 'path', 'door', 'wall', 'statue', 'grass', 'pillar', 'wall', 'pillar', 'path_tufts', 'grass',
  /*20*/ 'sign', 'tree2', 'cave_rock', 'tall_grass', 'water', 'water', 'water', 'water', 'water', 'water',
  /*30*/ 'roof_flat', 'roof_flat', 'roof_flat', 'roof_flat', 'roof_flat', 'roof_flat',
];
G.LABELS.pokecenter = [
  /*0*/ 'wall', 'floor_tile', 'plant', 'plant', 'counter', 'bench', 'floor_tile', 'bench', 'floor_tile', 'mat',
  /*10*/ 'void', 'pillar', 'heal_machine', 'heal_machine', 'heal_machine', 'wall_deco', 'heal_machine', 'wall_deco', 'heal_machine', 'door',
  /*20*/ 'pillar', 'counter', 'counter', 'counter', 'pc', 'pc', 'shelf', 'shelf', 'display', 'display',
  /*30*/ 'shelf', 'shelf', 'counter', 'counter', 'shelf', 'shelf', 'counter', 'counter', 'wall', 'wall',
];
G.LABELS.reds_house = [
  /*0*/ 'bookshelf', 'bookshelf', 'wall', 'wall_window', 'floor', 'tv', 'stairs_up', 'chair', 'table', 'table',
  /*10*/ 'table', 'table', 'mat', 'void', 'pc', 'table', 'pc', 'table', 'stairs_down', 'console',
  /*20*/ 'bed', 'bed', 'plant', 'plant',
];
G.LABELS.ship = [
  /*0*/ 'ship_wall', 'floor_tile', 'door', 'chair', 'table', 'table', 'table', 'table', 'mat', 'trash',
  /*10*/ 'void', 'ship_wall', 'ship_floor', 'ship_floor', 'ship_wall', 'ship_wall', 'porthole', 'ship_wall', 'ship_wall', 'ship_wall',
  /*20*/ 'ship_wall', 'stairs_up', 'ship_wall', 'ship_wall', 'ship_wall', 'door', 'ship_wall', 'ship_wall', 'stairs_down', 'bed',
  /*30*/ 'bed', 'table', 'table', 'table', 'table', 'bed', 'water', 'railing', 'deck', 'deck',
  /*40*/ 'deck', 'barrel', 'chair', 'chair', 'bookshelf', 'bookshelf', 'desk', 'desk', 'desk', 'desk',
  /*50*/ 'desk', 'table', 'table', 'table', 'table', 'counter', 'counter', 'counter', 'counter', 'stove',
  /*60*/ 'stove', 'stove', 'stove',
];
G.LABELS.ship_port = [
  /*0*/ 'crate', 'pavement', 'cliff', 'water', 'bridge', 'machine', 'machine', 'cliff', 'cliff', 'water',
  /*10*/ 'deck', 'deck', 'deck', 'deck', 'deck', 'deck', 'deck', 'ship_wall', 'deck', 'ship_wall',
  /*20*/ 'ship_wall', 'deck', 'deck', 'ship_wall', 'ship_wall', 'deck', 'deck', 'deck', 'ship_wall', 'ship_wall',
  /*30*/ 'void',
];
G.LABELS.underground = [
  /*0*/ 'void', 'wall', 'wall', 'floor_tile', 'floor_tile', 'wall', 'stairs_up', 'wall', 'void',
];
