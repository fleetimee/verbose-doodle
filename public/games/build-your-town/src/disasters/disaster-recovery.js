(() => {
  let definitions;
  let manual = false;
  const tasks = city => city.disasterRecovery ??= {};
  const restored = (city, index, task) => city.overlay[index] === task.overlay &&
    (!task.type || city.structAt(index)?.type === task.type) &&
    (!task.rail || city.rail[index]) && (!task.wire || city.wire[index]);
  function progress(city) {
    const entries = Object.entries(tasks(city));
    const pending = entries.filter(([index, task]) => !restored(city, Number(index), task));
    return { total: entries.length, complete: entries.length - pending.length, pending: pending.length,
      next: pending.length ? Number(pending[0][0]) : -1 };
  }
  function install(City, buildings) {
    definitions = buildings;
    const destroy = City.prototype.destroyTile;
    City.prototype.destroyTile = function (index) {
      if (!manual) return destroy.call(this, index);
      const structure = this.structAt(index);
      const building = this.buildingAt(index);
      const size = structure ? definitions[structure.type].size : building?.size ?? 1;
      const x = structure?.x ?? building?.x ?? index % this.size;
      const y = structure?.y ?? building?.y ?? Math.floor(index / this.size);
      const damaged = [];
      for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) {
        const tile = this.idx(x + dx, y + dy);
        const overlay = this.overlay[tile];
        if (overlay === 8) continue;
        if (overlay >= 2 && overlay <= 7 || this.rail[tile] || this.wire[tile]) damaged.push([tile,
          { overlay, ...(structure ? { type: structure.type } : {}), rail: this.rail[tile], wire: this.wire[tile] }]);
      }
      if (damaged.length && !progress(this).pending) this.disasterRecovery = {};
      for (const [tile, task] of damaged) tasks(this)[tile] ??= task;
      destroy.call(this, index);
      for (const [tile] of damaged) {
        this.overlay[tile] = 8;
        this.level[tile] = 0;
        this.rail[tile] = 0;
        this.wire[tile] = 0;
        this.fire[tile] = 0;
        this.bldId[tile] = 0;
        this.structId[tile] = 0;
        delete this.fireOrders?.[tile];
      }
    };
    const serialize = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = serialize.call(this);
      data.disasterRecovery = tasks(this);
      data.disasterFires = Array.from(this.fire.entries()).filter(([, value]) => value > 0);
      data.fireOrders = Object.keys(this.fireOrders ?? {}).filter(index => this.fire[index] > 0).map(Number);
      data.disasterActors = this.actors.filter(actor => actor.kind === "tornado").map(actor => ({ ...actor }));
      return data;
    };
    const deserialize = City.fromJSON;
    City.fromJSON = function (data) {
      const city = deserialize.call(this, data);
      city.disasterRecovery = {};
      for (const [key, task] of Object.entries(data.disasterRecovery ?? {})) {
        const index = Number(key);
        if (!Number.isInteger(index) || index < 0 || index >= city.count || !task ||
          !Number.isInteger(task.overlay) || task.overlay < 0 || task.overlay > 7 || task.type && !definitions[task.type]) continue;
        city.disasterRecovery[index] = { overlay: task.overlay, ...(task.type ? { type: task.type } : {}), rail: task.rail === 1 ? 1 : 0, wire: task.wire === 1 ? 1 : 0 };
      }
      for (const entry of Array.isArray(data.disasterFires) ? data.disasterFires : []) {
        if (!Array.isArray(entry)) continue;
        const [index, life] = entry;
        if (Number.isInteger(index) && index >= 0 && index < city.count && Number.isInteger(life) && life > 0 && life <= 60) city.fire[index] = life;
      }
      city.fireOrders = {};
      for (const index of Array.isArray(data.fireOrders) ? data.fireOrders : []) if (city.fire[index] > 0) city.fireOrders[index] = true;
      city.burning = city.fire.filter(value => value > 0).length;
      city.actors = (Array.isArray(data.disasterActors) ? data.disasterActors : []).filter(actor => actor?.kind === "tornado" &&
        [actor.x, actor.y, actor.dir, actor.ticks].every(Number.isFinite) && actor.x >= 0 && actor.x < city.size && actor.y >= 0 && actor.y < city.size && actor.ticks > 0 && actor.ticks <= 90).map(actor => ({ ...actor }));
      return city;
    };
  }
  function canFight(city, index) {
    if (!manual) return true;
    return !!city.fireOrders?.[index] && city.cover.fire[index] > 0 && city.funding.fire > 0;
  }
  function dispatch(city) {
    city.fireOrders ??= {};
    let assigned = 0;
    if (city.funding.fire <= 0) return assigned;
    for (let index = 0; index < city.count; index++) if (city.fire[index] && city.cover.fire[index] > 0 && !city.fireOrders[index]) {
      city.fireOrders[index] = true;
      assigned++;
    }
    return assigned;
  }
  window.__disasterRecovery = { install, progress, canFight, dispatch,
    setManual: value => { manual = !!value; window.__fireResponse?.update(); },
    isManual: () => manual };
})();
