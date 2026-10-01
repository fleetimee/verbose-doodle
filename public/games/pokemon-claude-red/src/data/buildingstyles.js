// Visual styles for specific buildings, keyed by the map their door leads to.
(function (G) {
  'use strict';
  const STYLE = {
    RedsHouse1F: { roof: 'red' },
    BluesHouse: { roof: 'blue' },
    OaksLab: { roof: 'gray', wall: 'lab', dish: true },
    ViridianGym: { roof: 'green', wall: 'stone' },
    PewterGym: { roof: 'brown', wall: 'stone' },
    CeruleanGym: { roof: 'blue', wall: 'stone' },
    VermilionGym: { roof: 'orange', wall: 'stone' },
    CeladonGym: { roof: 'green', wall: 'stone' },
    FuchsiaGym: { roof: 'purple', wall: 'stone' },
    SaffronGym: { roof: 'orange', wall: 'stone' },
    CinnabarGym: { roof: 'red', wall: 'stone' },
    Museum1F: { roof: 'gray', wall: 'stone' },
    PokemonTower1F: { roof: 'purple', wall: 'stone' },
    SilphCo1F: { roof: 'gray', wall: 'panel' },
    CeladonMart1F: { roof: 'teal', wall: 'panel' },
    GameCorner: { roof: 'red', wall: 'panel' },
    CeladonMansion1F: { roof: 'brown', wall: 'brick' },
    PokemonFanClub: { roof: 'orange' },
    BikeShop: { roof: 'teal' },
    BillsHouse: { roof: 'teal', wall: 'siding' },
    SSAnne1F: {},
    PowerPlant: { roof: 'gray', wall: 'panel' },
    CinnabarLab: { roof: 'gray', wall: 'lab' },
    PokemonMansion1F: { roof: 'brown', wall: 'brick' },
    SafariZoneGate: { roof: 'green', wall: 'siding' },
    FightingDojo: { roof: 'brown', wall: 'stone' },
    IndigoPlateauLobby: { roof: 'red', wall: 'stone' },
  };
  G.BUILDING_STYLE = STYLE;
  G.buildingStyles = function (map, b, MX, MY) {
    const inB = new Set(b.cells.map(([x, y]) => (x - MX) + ',' + (y - MY)));
    for (const w of map.warps || []) {
      if (inB.has(w.x + ',' + w.y) || inB.has(w.x + ',' + (w.y - 1))) {
        const st = STYLE[w.to];
        if (st) return st;
      }
    }
    return null;
  };
})(window.G);
