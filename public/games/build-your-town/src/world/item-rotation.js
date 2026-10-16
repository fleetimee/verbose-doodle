(() => {
  let placementRot = 0;
  let manualPlacement = false;
  let activeTool = "query";
  let selectedTile = null;
  let definitionsRef = null;
  let rotateButton = null;

  const isEn = () => document.documentElement.lang === "en";
  const copy = (en, fr) => (isEn() ? en : fr);
  const COMPASS_EN = ["South-West", "North-West", "North-East", "South-East"];
  const COMPASS_FR = ["Sud-Ouest", "Nord-Ouest", "Nord-Est", "Sud-Est"];
  const COMPASS_SHORT_EN = ["SW", "NW", "NE", "SE"];
  const COMPASS_SHORT_FR = ["SO", "NO", "NE", "SE"];

  function formatOrientation(rot) {
    const step = (rot ?? 0) & 3;
    const deg = `${step * 90}°`;
    const dir = (isEn() ? COMPASS_EN : COMPASS_FR)[step];
    return `${deg} · ${dir}`;
  }

  function formatShortOrientation(rot) {
    const step = (rot ?? 0) & 3;
    const deg = `${step * 90}°`;
    const dir = (isEn() ? COMPASS_SHORT_EN : COMPASS_SHORT_FR)[step];
    return `${deg} (${dir})`;
  }

  function sanitizeRotations(city, values) {
    const result = {};
    if (!values || typeof values !== "object" || Array.isArray(values)) return result;
    for (const [key, value] of Object.entries(values)) {
      const index = Number(key);
      const rot = Number(value) & 3;
      if (Number.isInteger(index) && index >= 0 && index < city.count && rot > 0) {
        result[index] = rot;
      }
    }
    return result;
  }

  function install(City, definitions) {
    definitionsRef = definitions;
    const serialize = City.prototype.toJSON;
    City.prototype.toJSON = function () {
      const data = serialize.call(this);
      const tileRotations = sanitizeRotations(this, this.tileRotations);
      for (const bld of this.buildings.values()) {
        const rot = (bld.rot ?? 0) & 3;
        if (rot > 0) tileRotations[this.idx(bld.x, bld.y)] = rot;
      }
      if (Object.keys(tileRotations).length > 0) {
        data.tileRotations = tileRotations;
      }
      return data;
    };

    const deserialize = City.fromJSON;
    City.fromJSON = function (data) {
      const city = deserialize.call(this, data);
      city.tileRotations = sanitizeRotations(city, data.tileRotations);
      for (const bld of city.buildings.values()) {
        const savedRot = city.tileRotations[city.idx(bld.x, bld.y)];
        if (savedRot) bld.rot = savedRot & 3;
      }
      return city;
    };
  }

  function defaultStructRot(city, struct, renderer) {
    if (!city || !struct) return 0;
    const size = definitionsRef?.[struct.type]?.size ?? 1;
    if (struct.type === "port" && renderer?.portSide) {
      return (4 - renderer.portSide(city, struct.x, struct.y, size)) & 3;
    }
    if (window.__railTransit?.isStation(struct.type) && renderer?.stationAlongY) {
      return renderer.stationAlongY(city, struct.x, struct.y, size) ? 1 : 0;
    }
    return 0;
  }

  function structRotation(city, struct, renderer) {
    if (!struct) return 0;
    if (struct.rot !== undefined) return struct.rot & 3;
    return defaultStructRot(city, struct, renderer);
  }

  function zoneRotation(city, x, y) {
    if (!city || !city.inBounds(x, y)) return 0;
    const index = city.idx(x, y);
    const bld = city.buildingAt?.(index);
    if (bld) {
      return (bld.rot ?? city.tileRotations?.[city.idx(bld.x, bld.y)] ?? 0) & 3;
    }
    return (city.tileRotations?.[index] ?? 0) & 3;
  }

  function getPlacementRotation(city, tool, x, y, renderer = window.__renderer) {
    if (!definitionsRef?.[tool]) return 0;
    if (manualPlacement) return placementRot & 3;
    if (city && Number.isInteger(x) && Number.isInteger(y) && city.inBounds(x, y)) {
      if (tool === "port" || window.__railTransit?.isStation(tool)) {
        return defaultStructRot(city, { type: tool, x, y }, renderer);
      }
    }
    return placementRot & 3;
  }

  function placementForApply(city, plan, renderer = window.__renderer) {
    if (!plan || !definitionsRef?.[plan.tool] || !plan.tiles?.length) return undefined;
    const first = plan.tiles[0];
    const x = first % city.size;
    const y = Math.floor(first / city.size);
    if (!manualPlacement && (plan.tool === "port" || window.__railTransit?.isStation(plan.tool))) {
      return undefined;
    }
    const rot = getPlacementRotation(city, plan.tool, x, y, renderer);
    return rot ? rot : manualPlacement ? 0 : undefined;
  }

  function ensureRotateButton() {
    if (rotateButton && rotateButton.isConnected) return rotateButton;
    const statusLeft = document.querySelector("#statusbar .left");
    if (!statusLeft) return null;
    rotateButton = document.getElementById("tool-rotate");
    if (!rotateButton) {
      rotateButton = document.createElement("button");
      rotateButton.id = "tool-rotate";
      rotateButton.type = "button";
      rotateButton.className = "tool-rotate-btn";
      rotateButton.hidden = true;
      rotateButton.addEventListener("click", (event) => {
        event.stopPropagation();
        rotatePlacement(1);
      });
      statusLeft.append(rotateButton);
    }
    return rotateButton;
  }

  let hoverTile = null;

  function updateRotateButton(tile = hoverTile) {
    if (tile !== undefined) hoverTile = tile;
    const btn = ensureRotateButton();
    if (!btn) return;
    const isStructTool = !!(definitionsRef && activeTool in definitionsRef);
    btn.hidden = !isStructTool;
    if (!isStructTool) return;
    const city = window.__city;
    const rot = getPlacementRotation(city, activeTool, hoverTile?.x, hoverTile?.y);
    const shortLabel = formatShortOrientation(rot);
    btn.textContent = copy(`↻ Rotate · ${shortLabel} [R]`, `↻ Pivoter · ${shortLabel} [R]`);
    btn.title = copy(
      `Rotate placement 90° clockwise (R or ] / [) · Current: ${formatOrientation(rot)}`,
      `Pivoter le placement de 90° (R ou ] / [) · Actuel : ${formatOrientation(rot)}`
    );
    btn.setAttribute("aria-label", btn.title);
  }

  function setTool(tool) {
    const prev = activeTool;
    activeTool = tool;
    if (!definitionsRef?.[tool]) {
      placementRot = 0;
      manualPlacement = false;
    } else if (prev !== tool && (tool === "port" || window.__railTransit?.isStation(tool))) {
      manualPlacement = false;
    }
    updateRotateButton();
  }

  function rotatePlacement(step = 1) {
    if (!definitionsRef?.[activeTool]) return false;
    const base = manualPlacement
      ? placementRot
      : getPlacementRotation(window.__city, activeTool, hoverTile?.x, hoverTile?.y);
    placementRot = (base + step + 4) & 3;
    manualPlacement = true;
    updateRotateButton();
    window.__townView?.redraw();
    return true;
  }

  function canRotateAt(city, x, y) {
    if (!city || !city.inBounds(x, y)) return false;
    const index = city.idx(x, y);
    if (city.structAt(index)) return true;
    const overlay = city.overlay[index];
    return overlay >= 3 && overlay <= 5 && city.level[index] > 0;
  }

  function getRotationAt(city, x, y, renderer = window.__renderer) {
    if (!city || !city.inBounds(x, y)) return 0;
    const index = city.idx(x, y);
    const struct = city.structAt(index);
    if (struct) return structRotation(city, struct, renderer);
    return zoneRotation(city, x, y);
  }

  function rotateAt(city, x, y, step = 1, renderer = window.__renderer) {
    if (!canRotateAt(city, x, y)) return null;
    const index = city.idx(x, y);
    const struct = city.structAt(index);
    let next = 0;
    if (struct) {
      const current = structRotation(city, struct, renderer);
      next = (current + step + 4) & 3;
      struct.rot = next;
    } else {
      const bld = city.buildingAt(index);
      if (bld) {
        const baseIdx = city.idx(bld.x, bld.y);
        const current = (bld.rot ?? city.tileRotations?.[baseIdx] ?? 0) & 3;
        next = (current + step + 4) & 3;
        bld.rot = next;
        city.tileRotations ??= {};
        if (next) city.tileRotations[baseIdx] = next;
        else delete city.tileRotations[baseIdx];
      } else {
        const current = (city.tileRotations?.[index] ?? 0) & 3;
        next = (current + step + 4) & 3;
        city.tileRotations ??= {};
        if (next) city.tileRotations[index] = next;
        else delete city.tileRotations[index];
      }
    }
    window.__refreshCity?.();
    return next;
  }

  function clearTile(city, index) {
    if (city?.tileRotations) delete city.tileRotations[index];
  }

  function query(queryData, city, definitions) {
    definitionsRef = definitions ?? definitionsRef;
    selectedTile = queryData?.tile ?? null;
    if (!queryData || !selectedTile || !canRotateAt(city, selectedTile.x, selectedTile.y)) return;
    const body = document.getElementById("query-body");
    if (!body) return;

    const section = document.createElement("section");
    section.className = "query-rotation";

    const row = document.createElement("div");
    row.className = "query-rotation-row";

    const labelWrap = document.createElement("div");
    labelWrap.className = "query-rotation-info";

    const title = document.createElement("span");
    title.className = "query-rotation-label";
    title.dataset.townHelp = "itemRotation";
    title.textContent = copy("Orientation", "Orientation");

    const value = document.createElement("strong");
    value.className = "query-rotation-value";
    value.textContent = formatOrientation(getRotationAt(city, selectedTile.x, selectedTile.y));

    labelWrap.append(title, value);

    const actions = document.createElement("div");
    actions.className = "query-rotation-actions";

    const ccwBtn = document.createElement("button");
    ccwBtn.type = "button";
    ccwBtn.className = "query-rotate-btn query-rotate-ccw";
    ccwBtn.textContent = "↺";
    ccwBtn.title = copy("Rotate 90° counter-clockwise ([)", "Pivoter de 90° sens antihoraire ([)");
    ccwBtn.setAttribute("aria-label", ccwBtn.title);

    const cwBtn = document.createElement("button");
    cwBtn.type = "button";
    cwBtn.className = "query-rotate-btn";
    cwBtn.textContent = "↻";
    cwBtn.title = copy("Rotate 90° clockwise (R or ])", "Pivoter de 90° sens horaire (R ou ])");
    cwBtn.setAttribute("aria-label", cwBtn.title);

    const applyTurn = (step) => {
      const next = rotateAt(city, selectedTile.x, selectedTile.y, step);
      if (next !== null) {
        value.textContent = formatOrientation(next);
      }
    };

    ccwBtn.addEventListener("click", () => applyTurn(3));
    cwBtn.addEventListener("click", () => applyTurn(1));

    actions.append(ccwBtn, cwBtn);
    row.append(labelWrap, actions);
    section.append(row);

    const facts = body.querySelector(".query-facts");
    const growth = body.querySelector(".query-growth");
    const location = body.querySelector(".query-location");
    if (facts) {
      facts.after(section);
    } else if (growth) {
      growth.after(section);
    } else if (location) {
      location.after(section);
    } else {
      body.prepend(section);
    }
  }

  function onKey(key, event) {
    if (event?.ctrlKey || event?.metaKey || event?.altKey) return false;
    const lower = key.toLowerCase();
    const isBracket = key === "[" || key === "]";
    const isR = lower === "r";
    if (!isBracket && !isR) return false;

    const step = key === "[" ? 3 : 1;
    if (definitionsRef?.[activeTool]) {
      return rotatePlacement(step);
    }

    const queryEl = document.getElementById("query");
    const city = window.__city;
    if (queryEl && !queryEl.hidden && selectedTile && canRotateAt(city, selectedTile.x, selectedTile.y)) {
      if (isBracket || (isR && activeTool === "query")) {
        const next = rotateAt(city, selectedTile.x, selectedTile.y, step);
        const valueEl = queryEl.querySelector(".query-rotation-value");
        if (valueEl && next !== null) valueEl.textContent = formatOrientation(next);
        return true;
      }
    }
    return false;
  }

  function previewSpriteKey(city, tool, x, y, rot, time) {
    if (tool.startsWith("landscape_")) {
      const plant = window.__landscaping?.visual(city, { type: tool, x, y });
      if (plant) {
        const corners = city.corners(x, y);
        const elev = Math.min(4, Math.floor(corners.reduce((sum, h) => sum + h, 0) / 6.4));
        return `plant:${tool}:0:${elev}:${plant.variant}:${+plant.grouped}:0:${rot}`;
      }
    }
    if (tool === "wind") {
      const onWater = +(city.terrain[city.idx(x, y)] === 1);
      return `st:wind:${Math.floor(time / 90) % 6}:${onWater}:0:${rot}`;
    }
    if (tool === "park") {
      return `park:0:0:0:${rot}`;
    }
    if (tool === "bigpark") {
      return `st:bigpark:${Math.floor(time / 260) % 3}:0:0:${rot}`;
    }
    return rot ? `st:${tool}:0:0:0:${rot}` : `st:${tool}`;
  }

  function drawPreview(renderer, city, hover, time = 0) {
    if (!renderer || !city || !hover || !definitionsRef?.[activeTool]) return;
    if (renderer.flat || !city.inBounds(hover.x, hover.y)) return;
    const def = definitionsRef[activeTool];
    const size = def.size ?? 1;
    const viewAngle = ((window.__mapRotation?.getAngle?.() ?? 0) / 90) & 3;
    const worldHover = window.__mapRotation?.toWorldPoint
      ? window.__mapRotation.toWorldPoint(hover, city.size)
      : hover;
    const baseRot = getPlacementRotation(window.__city ?? city, activeTool, worldHover.x, worldHover.y, renderer);
    const rot = (baseRot + viewAngle) & 3;

    // In camera-rotated views, hover is the rotated corner of the origin tile; compute top-left of the size×size block.
    let originX = hover.x;
    let originY = hover.y;
    if (viewAngle && size > 1) {
      const xs = [];
      const ys = [];
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const wx = worldHover.x + dx;
          const wy = worldHover.y + dy;
          const limit = city.size - 1;
          const rx = viewAngle === 1 ? limit - wy : viewAngle === 2 ? limit - wx : viewAngle === 3 ? wy : wx;
          const ry = viewAngle === 1 ? wx : viewAngle === 2 ? limit - wy : viewAngle === 3 ? limit - wx : wy;
          xs.push(rx);
          ys.push(ry);
        }
      }
      originX = Math.min(...xs);
      originY = Math.min(...ys);
    }

    const { ctx, dpr } = renderer;
    const c = renderer.camera.zoom * dpr;
    const l = renderer.worldToScreen(0, 0);
    const d = Math.round(l.x * dpr);
    const f = Math.round(l.y * dpr);
    const p = 32 * c;
    const h = 16 * c;
    const g = Math.round(p);
    const topOffset = Math.round(112 * c);
    const v = 8 * c;
    const spriteKey = previewSpriteKey(city, activeTool, originX, originY, rot, time);

    ctx.save();
    ctx.globalAlpha = 0.76;
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const tx = originX + dx;
        const ty = originY + dy;
        if (!city.inBounds(tx, ty)) continue;
        const base = city.base(tx, ty);
        const u = d + (tx - ty) * p;
        const S = f + (tx + ty) * h - Math.round(base * v);
        const col = renderer.sprites.getColumn(spriteKey, c, size, dx, dy);
        ctx.drawImage(col, u - g, S - topOffset);
      }
    }

    // Draw a subtle orientation indicator arrow on the front edge of the footprint.
    const centerTileX = originX + size / 2;
    const centerTileY = originY + size / 2;
    const baseElev = city.inBounds(originX, originY) ? city.base(originX, originY) : 0;
    const dirs = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0],
    ];
    const [dirX, dirY] = dirs[rot & 3];
    const edgeX = centerTileX + dirX * (size * 0.5 + 0.18);
    const edgeY = centerTileY + dirY * (size * 0.5 + 0.18);
    const tipX = centerTileX + dirX * (size * 0.5 + 0.46);
    const tipY = centerTileY + dirY * (size * 0.5 + 0.46);
    const perpX = -dirY * 0.22;
    const perpY = dirX * 0.22;
    const toScreen = (tx, ty) => [
      d + (tx - ty) * p,
      f + (tx + ty) * h - Math.round(baseElev * v),
    ];
    const [sx1, sy1] = toScreen(edgeX + perpX, edgeY + perpY);
    const [sx2, sy2] = toScreen(edgeX - perpX, edgeY - perpY);
    const [sxt, syt] = toScreen(tipX, tipY);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#f6b73c";
    ctx.strokeStyle = "rgba(15, 20, 34, 0.85)";
    ctx.lineWidth = Math.max(1.2, 1.5 * dpr);
    ctx.beginPath();
    ctx.moveTo(sxt, syt);
    ctx.lineTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  window.__itemRotation = {
    install,
    setTool,
    rotatePlacement,
    getPlacementRotation,
    placementForApply,
    structRotation,
    zoneRotation,
    canRotateAt,
    getRotationAt,
    rotateAt,
    clearTile,
    query,
    onKey,
    drawPreview,
    updateRotateButton,
  };
})();
