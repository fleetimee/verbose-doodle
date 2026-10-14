(() => {
  // Development trials per game day: first buildings arrive quickly, later
  // tiers take longer. Demand, utilities, and density limits still apply.
  const trials = [200, 80, 40, 20, 10];
  let canUpgrade;
  function initialize(city) {
    if (city.growthProgress) return;
    city.growthProgress = new Float32Array(city.count);
    city.growthZone = new Uint8Array(city.count);
    city.growthTier = new Uint8Array(city.count);
  }
  function sync(city, index) {
    initialize(city);
    const zone = city.overlay[index], tier = city.level[index];
    if (city.growthZone[index] !== zone || city.growthTier[index] !== tier) {
      city.growthProgress[index] = 0;
      city.growthZone[index] = zone;
      city.growthTier[index] = tier;
    }
  }
  function advance(city, index, probability) {
    sync(city, index);
    const tier = city.level[index];
    // Stable variation keeps neighboring lots from all upgrading together.
    const hash = Math.imul(city.seed ^ index ^ (tier * 7919), 2654435761) >>> 0;
    const effort = 0.8 + (hash % 401) / 1000;
    city.growthProgress[index] = Math.min(1, city.growthProgress[index] + probability * trials[tier] / 24 / effort);
    return city.growthProgress[index] >= 1;
  }
  function inspect(city, index) {
    const zone = city.overlay[index];
    if (zone < 3 || zone > 5) return null;
    const building = city.buildingAt(index);
    if (building) index = city.idx(building.x, building.y);
    sync(city, index);
    const tier = city.level[index];
    const demand = city.demand[zone === 3 ? "r" : zone === 4 ? "c" : "i"];
    let status = "growing";
    if (tier >= 5) status = "complete";
    else if (city.bankrupt) status = "bankrupt";
    else if (city.fire[index] || city.flood[index]) status = "disaster";
    else if (city.roadDist[index] === 255) status = "road";
    else if (!city.powered[index]) status = "power";
    else if (!city.access[index]) status = zone === 3 ? "jobs" : "workers";
    else if (!(demand > 0)) status = "demand";
    else if (!canUpgrade(city, index, zone, tier + 1)) {
      status = tier >= 2 && !city.watered[index] ? "water"
        : zone === 3 && tier >= 2 && city.pollution[index] > 90 ? "pollution" : "land";
    } else if (city.growthProgress[index] >= 1 && tier >= 3) status = "footprint";
    return { zone, tier, next: Math.min(5, tier + 1), progress: tier === 5 ? 1 : city.growthProgress[index], status };
  }
  function snapshot(city) {
    if (!city.growthProgress) return [];
    const entries = [];
    for (let index = 0; index < city.count; index++) {
      sync(city, index);
      if (city.overlay[index] >= 3 && city.overlay[index] <= 5 && city.growthProgress[index] > 0) {
        entries.push([index, city.overlay[index], city.level[index], city.growthProgress[index]]);
      }
    }
    return entries;
  }
  function install(City, eligible) {
    canUpgrade = eligible;
    const save = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      return { ...save.call(this), zoneGrowth: snapshot(this) };
    };
    const load = City.fromJSON;
    City.fromJSON = function (data) {
      const city = load.call(this, data);
      initialize(city);
      if (Array.isArray(data.zoneGrowth)) {
        for (const entry of data.zoneGrowth.slice(0, city.count)) {
          if (!Array.isArray(entry)) continue;
          const [index, zone, tier, progress] = entry;
          if (!Number.isInteger(index) || index < 0 || index >= city.count ||
              city.overlay[index] !== zone || city.level[index] !== tier ||
              zone < 3 || zone > 5 || !Number.isFinite(progress) || progress < 0 || progress > 1) continue;
          sync(city, index);
          city.growthProgress[index] = progress;
        }
      }
      return city;
    };
    const destroy = City.prototype.destroyTile;
    City.prototype.destroyTile = function (index) {
      initialize(this);
      const building = this.buildingAt(index);
      if (building) {
        for (let y = building.y; y < building.y + building.size; y++) {
          for (let x = building.x; x < building.x + building.size; x++) this.growthProgress[this.idx(x, y)] = 0;
        }
      }
      this.growthProgress[index] = 0;
      return destroy.call(this, index);
    };
  }
  window.__zoneGrowth = { advance, inspect, install };
})();
