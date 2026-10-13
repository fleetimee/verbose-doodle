(() => {
  let orientation = 0;
  let enabled = false;
  let renderer;
  let definitions;
  let sourceCity;
  let view;
  let permutation;
  let vertexPermutation;
  const arrays = new Map();
  const structures = new Map();
  const buildings = new Map();
  function turn(x, y, limit, rotation = orientation) {
    switch ((rotation + 4) % 4) {
      case 1: return { x: limit - y, y: x };
      case 2: return { x: limit - x, y: limit - y };
      case 3: return { x: y, y: limit - x };
      default: return { x, y };
    }
  }
  const inverse = (point, limit) => turn(point.x, point.y, limit, (4 - orientation) % 4);
  function remap(name, source, order) {
    let result = arrays.get(name);
    if (!result || result.constructor !== source.constructor || result.length !== source.length) {
      result = new source.constructor(source.length);
      arrays.set(name, result);
    }
    for (let index = 0; index < result.length; index++) result[index] = source[order[index]];
    return result;
  }
  function indexMap(city, vertices = false) {
    const width = city.size + Number(vertices);
    const order = new Int32Array(width * width);
    for (let y = 0; y < width; y++) for (let x = 0; x < width; x++) {
      const point = inverse({ x, y }, width - 1);
      order[y * width + x] = point.y * width + point.x;
    }
    return order;
  }
  function spatialMap(values, city) {
    const result = {};
    for (const [key, value] of Object.entries(values ?? {})) {
      const index = Number(key);
      const point = turn(index % city.size, Math.floor(index / city.size), city.size - 1);
      result[city.idx(point.x, point.y)] = value;
    }
    return result;
  }
  function footprints(source, cache, city, isStructure) {
    const result = new Map();
    for (const [id, record] of source) {
      const size = isStructure ? definitions[record.type].size : record.size;
      const point = turn(record.x, record.y, city.size - size);
      let rotated = cache.get(id);
      if (!rotated) { rotated = {}; cache.set(id, rotated); }
      Object.assign(rotated, record, point);
      result.set(id, rotated);
    }
    for (const id of cache.keys()) if (!source.has(id)) cache.delete(id);
    return result;
  }
  function clampCamera(camera, size) {
    const limit = size - 1;
    const tx = (camera.x / 32 + camera.y / 16) / 2;
    const ty = (camera.y / 16 - camera.x / 32) / 2;
    const clampedX = Math.max(0, Math.min(limit, tx));
    const clampedY = Math.max(0, Math.min(limit, ty));
    camera.x = (clampedX - clampedY) * 32;
    camera.y = (clampedX + clampedY) * 16;
  }
  function cityView(city) {
    if (!orientation) return city;
    if (sourceCity !== city || !view) {
      sourceCity = city;
      view = Object.create(Object.getPrototypeOf(city));
      permutation = indexMap(city);
      vertexPermutation = indexMap(city, true);
      arrays.clear();structures.clear();buildings.clear();
    }
    for (const [key, value] of Object.entries(city)) {
      if (ArrayBuffer.isView(value) && value.length === city.count) view[key] = remap(key, value, permutation);
      else if (key === "elev") view[key] = remap(key, value, vertexPermutation);
      else view[key] = value;
    }
    view.cover = {};
    for (const [key, value] of Object.entries(city.cover)) view.cover[key] = remap(`cover.${key}`, value, permutation);
    view.structs = footprints(city.structs, structures, city, true);
    view.buildings = footprints(city.buildings, buildings, city, false);
    view.medianPlants = spatialMap(city.medianPlants, city);
    view.fireOrders = spatialMap(city.fireOrders, city);
    view.actors = city.actors.map(actor => ({ ...actor, ...turn(actor.x, actor.y, city.size - 1), dir: actor.dir + orientation * Math.PI / 2 }));
    return view;
  }
  function bind(target, buildingDefinitions) {
    definitions = buildingDefinitions;
    if (renderer === target) return;
    renderer = target;
    const select = target.screenToTile.bind(target);
    target.screenToTile = (x, y, city = window.__city) => {
      const tile = select(x, y, cityView(city));
      return inverse(tile, city.size - 1);
    };
    const center = target.centerOnTile.bind(target);
    target.centerOnTile = (x, y) => {
      const city = window.__city ?? target.city;
      const tile = turn(x, y, city.size - 1);
      center(tile.x, tile.y);
      clampCamera(target.camera, city.size);
    };
  }
  function rotate(direction, force = false) {
    if (!enabled && !force) return;
    if (!renderer || !window.__city) return;
    const city = window.__city;
    const camera = renderer.camera;
    const tile = { x: (camera.x / 32 + camera.y / 16) / 2, y: (camera.y / 16 - camera.x / 32) / 2 };
    const original = inverse(tile, city.size - 1);
    orientation = (orientation + direction + 4) % 4;
    const rotated = turn(original.x, original.y, city.size - 1);
    camera.x = (rotated.x - rotated.y) * 32;
    camera.y = (rotated.x + rotated.y) * 16;
    clampCamera(camera, city.size);
    view = null;
    const rotatedCity = cityView(city);
    const point = value => turn(value.x, value.y, city.size - 1, direction);
    const rotateTile = index => {
      const rotatedTile = turn(index % city.size, Math.floor(index / city.size), city.size - 1, direction);
      return city.idx(rotatedTile.x, rotatedTile.y);
    };
    window.__trafficVehicles?.rotate(renderer, rotatedCity, point, rotateTile);
    window.__serviceVehicles?.rotate(renderer, rotatedCity, point, rotateTile);
    for (const walker of renderer.walkers) {
      const current = turn(walker.x, walker.y, city.size - 1, direction);
      const previous = turn(walker.px, walker.py, city.size - 1, direction);
      Object.assign(walker, current, { px: previous.x, py: previous.y });
      walker.hist = walker.hist.map(point);
    }
    renderer.walkersFor = rotatedCity;
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new CustomEvent("town-view-rotation", { detail: orientation * 90 }));
  }
  function draw(target, city, hover, preview, time) {
    if (!orientation) { target.draw(city, hover, preview, time); return; }
    const rotated = cityView(city);
    const tile = hover ? turn(hover.x, hover.y, city.size - 1) : null;
    const area = preview ? { ...preview, tiles: preview.tiles.map(index => {
      const point = turn(index % city.size, Math.floor(index / city.size), city.size - 1);
      return city.idx(point.x, point.y);
    }) } : null;
    target.draw(rotated, tile, area, time);
  }
  function setEnabled(value) {
    enabled = !!value;
    if (!enabled && orientation) rotate(-orientation, true);
  }
  window.__mapRotation = { bind, draw, rotate, setEnabled, cityView,
    toWorldPoint: (point, size) => inverse(point, size - 1), getAngle: () => orientation * 90 };
})();
