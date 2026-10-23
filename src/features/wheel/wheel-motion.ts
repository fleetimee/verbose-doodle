export function getWheelSpinAngles(rotation: number, count: number) {
  const sector = 360 / Math.max(2, count);
  const nextBoundary = (Math.floor(rotation / sector) + 1) * sector;
  const boundaryOvershoot =
    nextBoundary - rotation + Math.min(0.6, sector * 0.025);
  const overshoot = Math.min(3, sector * 0.15, boundaryOvershoot);
  const settle = Math.min(0.35, sector * 0.01);
  return [0, rotation + overshoot, rotation - settle, rotation];
}
