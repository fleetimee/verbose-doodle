(() => {
  const colors = ["#e8e8de", "#d7413d", "#397abe", "#efc744", "#373d47", "#69aa64", "#ea7739", "#985cae"];
  const models = [
    { length: 0.38, width: 0.17, roof: 4.2, style: "wedge" },
    { length: 0.36, width: 0.17, roof: 4.6, style: "sport" },
    { length: 0.33, width: 0.15, roof: 6.2, style: "sedan" },
    { length: 0.27, width: 0.15, roof: 6, style: "hatch" },
    { length: 0.36, width: 0.19, roof: 8, style: "suv" },
    { length: 0.42, width: 0.19, roof: 8.5, style: "van" },
    { length: 0.42, width: 0.19, roof: 6.5, style: "pickup" },
    { length: 0.5, width: 0.2, roof: 9.3, style: "bus" },
    { length: 0.35, width: 0.16, roof: 4.8, style: "convertible" },
  ];
  function sprite(ctx, model, axis, colorIndex, back, project, polygon) {
    const spec = models[model] ?? models[2];
    const color = colors[colorIndex % colors.length];
    const half = spec.length / 2, width = spec.width / 2;
    const point = (along, across, height = 0) => axis === "x"
      ? project(0.5 + (back ? -along : along), 0.5 + across, height)
      : project(0.5 + across, 0.5 + (back ? -along : along), height);
    const profile = spec.style === "wedge"
      ? [[-half, 3.5], [-half * 0.65, spec.roof], [0, spec.roof], [half, 2.5]]
      : spec.style === "sport" || spec.style === "convertible"
        ? [[-half, 3], [-half * 0.75, 3.8], [-half * 0.35, spec.roof], [half * 0.15, spec.roof], [half * 0.6, 3.2], [half, 2.5]]
        : spec.style === "van" || spec.style === "bus"
          ? [[-half, spec.roof], [half * 0.65, spec.roof], [half, 5.2]]
          : spec.style === "pickup"
            ? [[-half, 3.5], [-half * 0.05, 3.5], [-half * 0.05, spec.roof], [half * 0.5, spec.roof], [half * 0.7, 3.7], [half, 3.7]]
            : [[-half, 3.4], [-half * 0.7, spec.roof], [half * 0.25, spec.roof], [half * 0.65, 3.8], [half, 3.4]];
    const box = (front, rear, low, high, face, roof) => {
      polygon(ctx, [point(rear, width, low), point(front, width, low), point(front, width, high), point(rear, width, high)], face, "#263442", 0.35);
      const end = back ? rear : front;
      polygon(ctx, [point(end, -width, low), point(end, width, low), point(end, width, high), point(end, -width, high)], face, "#263442", 0.35);
      polygon(ctx, [point(rear, -width, high), point(front, -width, high), point(front, width, high), point(rear, width, high)], roof, "#263442", 0.35);
    };
    polygon(ctx, [point(-half, -width, 0), point(half, -width, 0), point(half, width, 0), point(-half, width, 0)], "rgba(25,35,30,0.25)");
    box(half, -half, 0.5, 1.7, "#232b32", "#232b32");
    polygon(ctx, [point(-half, width, 1.5), point(half, width, 1.5), ...profile.slice().reverse().map(([x, z]) => point(x, width, z))], color, "#263442", 0.4);
    for (let index = 0; index + 1 < profile.length; index++) {
      const [x, z] = profile[index], [nextX, nextZ] = profile[index + 1];
      const glass = nextZ < z && z >= spec.roof - 0.1 && nextX > 0;
      polygon(ctx, [point(x, -width, z), point(nextX, -width, nextZ), point(nextX, width, nextZ), point(x, width, z)], glass ? "#8bb7c6" : color, "#263442", 0.35);
    }
    const frontHeight = profile.at(-1)[1], rearHeight = profile[0][1];
    const end = back ? -half : half, endHeight = back ? rearHeight : frontHeight;
    polygon(ctx, [point(end, -width, 1.5), point(end, width, 1.5), point(end, width, endHeight), point(end, -width, endHeight)], color, "#263442", 0.4);
    if (spec.style === "bus" || spec.style === "van") {
      for (let x = -half * 0.8; x < half * 0.5; x += 0.09) polygon(ctx,
        [point(x, width + 0.001, 4.2), point(x + 0.065, width + 0.001, 4.2),
          point(x + 0.065, width + 0.001, spec.roof - 0.8), point(x, width + 0.001, spec.roof - 0.8)], "#315769");
    } else {
      const low = spec.style === "wedge" || spec.style === "sport" ? 3 : 4;
      polygon(ctx, [point(-half * 0.45, width + 0.001, low), point(half * 0.2, width + 0.001, low),
        point(half * 0.1, width + 0.001, spec.roof - 0.4), point(-half * 0.4, width + 0.001, spec.roof - 0.4)], "#315769");
    }
    if (spec.style === "wedge") box(-half * 0.7, -half * 0.95, 4.5, 5.2, "#303843", "#303843");
    if (spec.style === "pickup") box(-half * 0.15, -half * 0.9, 3.5, 3.7, "#343c42", "#343c42");
    if (spec.style === "convertible") box(half * 0.1, -half * 0.45, 3.8, 4.3, "#30333c", "#30333c");
    for (const x of [-half * 0.65, half * 0.65]) {
      const [px, py] = point(x, width + 0.01, 1.5);
      ctx.fillStyle = "#222831";
      ctx.beginPath();ctx.ellipse(px, py, 1.05, 1.35, 0, 0, Math.PI * 2);ctx.fill();
      ctx.fillStyle = "#a5adb3";
      ctx.beginPath();ctx.ellipse(px, py, 0.45, 0.65, 0, 0, Math.PI * 2);ctx.fill();
    }
    for (const across of [-width * 0.75, width * 0.5]) polygon(ctx,
      [point(end, across, 2), point(end, across + 0.022, 2), point(end, across + 0.022, 2.7), point(end, across, 2.7)], back ? "#df4b4b" : "#fff0b7");
  }
  window.__vehicleFleet = { sprite };
})();
