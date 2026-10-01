import * as THREE from 'three';
import * as B from './blocks.js';
import { TINT_TABLE } from './worldgen.js';

THREE.ColorManagement.enabled = false;

export function createAtlasTexture() {
  const tex = new THREE.DataTexture(B.atlasData, B.ATLAS, B.ATLAS, THREE.RGBAFormat);
  tex.mipmaps = B.buildMipmaps();
  tex.minFilter = THREE.NearestMipmapLinearFilter; tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false; tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.needsUpdate = true;
  return tex;
}

const VERT = `
attribute float aShade; attribute vec2 aLight; attribute vec3 aTint;
varying vec2 vUv; varying float vShade; varying vec2 vLight; varying vec3 vTint; varying float vDist;
uniform float uTime;
void main(){
  vUv = uv; vShade = aShade; vLight = aLight; vTint = aTint;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  #ifdef WATER
    float fy = fract(wp.y);
    if (abs(fy - 0.875) < 0.02) { wp.y += sin(wp.x*1.9 + uTime*1.7)*0.035 + cos(wp.z*1.6 + uTime*1.3)*0.035 - 0.02; }
  #endif
  vec4 vp = viewMatrix * wp;
  vDist = length(vp.xyz);
  gl_Position = projectionMatrix * vp;
}`;
const FRAG = `
uniform sampler2D uMap; uniform vec3 uSkyCol; uniform vec3 uFogColor; uniform float uFogNear; uniform float uFogFar; uniform float uAlpha;
uniform float uTime; uniform float uBright;
varying vec2 vUv; varying float vShade; varying vec2 vLight; varying vec3 vTint; varying float vDist;
void main(){
  vec4 t = texture2D(uMap, vUv);
  if (t.a < 0.5) discard;
  vec3 c = t.rgb;
  if (t.a < 0.995) c *= vTint;
  float sk = pow(clamp(vLight.x,0.0,1.0), 1.55);
  float bk = pow(clamp(vLight.y,0.0,1.0), 1.7);
  vec3 light = max(sk * uSkyCol, bk * vec3(1.0, 0.82, 0.62));
  light = max(light, vec3(0.085, 0.095, 0.135) + uBright);
  c *= light * vShade * 0.94;
  float f = clamp((vDist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
  c = mix(c, uFogColor, f*f*(3.0-2.0*f));
  gl_FragColor = vec4(c, uAlpha);
}`;

export function createMaterials(tex) {
  const shared = {
    uMap: { value: tex }, uSkyCol: { value: new THREE.Vector3(1, 1, 1) }, uFogColor: { value: new THREE.Vector3(0.7, 0.8, 1) },
    uFogNear: { value: 60 }, uFogFar: { value: 110 }, uTime: { value: 0 }, uBright: { value: 0 },
  };
  const opaque = new THREE.ShaderMaterial({ uniforms: Object.assign({ uAlpha: { value: 1 } }, shared), vertexShader: VERT, fragmentShader: FRAG });
  const water = new THREE.ShaderMaterial({ uniforms: Object.assign({ uAlpha: { value: 0.72 } }, shared), vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide, defines: { WATER: 1 } });
  return { opaque, water, shared };
}

// ---------------------------------------------------------------------------- sky
const SKY_V = `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.0); gl_Position = (projectionMatrix*p).xyww; }`;
const SKY_F = `
uniform vec3 uSun; uniform vec3 uZenith; uniform vec3 uHorizon; uniform float uNight; uniform float uSunset; uniform float uAngle; uniform float uTime; uniform float uCloudy;
varying vec3 vDir;
float hash(vec3 p){ p = fract(p*0.3183099+vec3(0.1,0.2,0.3)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  float t = pow(clamp(h,0.0,1.0), 0.5);
  vec3 col = mix(uHorizon, uZenith, t);
  if (h < 0.0) col = mix(uHorizon, uHorizon*0.6, clamp(-h*4.0,0.0,1.0));
  float sd = max(dot(d, uSun), 0.0);
  // sunset glow
  col = mix(col, vec3(1.0,0.52,0.22), uSunset * pow(sd, 3.0) * 0.75 * pow(1.0 - clamp(abs(h), 0.0, 1.0), 3.0));
  col += vec3(1.0,0.75,0.45) * pow(sd, 24.0) * 0.35 * (1.0 - uNight);
  // sun disc (square-ish like the original)
  vec3 sunUp = normalize(cross(uSun, vec3(0.0,0.0,1.0)));
  vec3 sunRt = normalize(cross(uSun, sunUp));
  float sx = dot(d, sunUp), sy = dot(d, sunRt);
  if (dot(d, uSun) > 0.0 && max(abs(sx), abs(sy)) < 0.04) col = mix(col, vec3(1.0,0.97,0.82), 1.0);
  // moon
  vec3 mn = -uSun; float mx = dot(d, sunUp), my = dot(d, cross(mn, sunUp));
  if (dot(d, mn) > 0.0 && max(abs(mx), abs(my)) < 0.03) col = mix(col, vec3(0.86,0.9,1.0), 1.0);
  // stars
  float ca = cos(uAngle), sa = sin(uAngle);
  vec3 sd2 = vec3(d.x*ca - d.y*sa, d.x*sa + d.y*ca, d.z);
  vec3 q = floor(sd2 * 220.0);
  float hs = hash(q);
  if (hs > 0.9965 && h > -0.05) { float tw = 0.7 + 0.3*sin(uTime*2.0 + hs*80.0); col += vec3(0.9,0.95,1.0) * uNight * tw * (hs-0.9965)*250.0; }
  col = mix(col, vec3(dot(col, vec3(0.33))) * vec3(0.85,0.88,0.92), uCloudy*0.7);
  gl_FragColor = vec4(col, 1.0);
}`;
const CLOUD_V = `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`;
const CLOUD_F = `uniform sampler2D uMap; uniform vec3 uColor; uniform float uAlpha; uniform vec3 uCam; uniform vec2 uOff; varying vec2 vUv; varying vec3 vW;
void main(){ vec4 t = texture2D(uMap, vUv * 2.0 + uOff); float d = length(vW.xz - uCam.xz); float fade = 1.0 - smoothstep(250.0, 800.0, d);
  float a = t.a * uAlpha * fade; if (a < 0.02) discard; gl_FragColor = vec4(uColor * t.rgb, a); }`;

export class Sky {
  constructor(scene) {
    this.scene = scene;
    this.uniforms = {
      uSun: { value: new THREE.Vector3(0, 1, 0) }, uZenith: { value: new THREE.Vector3() }, uHorizon: { value: new THREE.Vector3() },
      uNight: { value: 0 }, uSunset: { value: 0 }, uAngle: { value: 0 }, uTime: { value: 0 }, uCloudy: { value: 0 },
    };
    const m = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: SKY_V, fragmentShader: SKY_F, side: THREE.BackSide, depthWrite: false, depthTest: false });
    this.dome = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 24), m); this.dome.renderOrder = -10; this.dome.frustumCulled = false;
    scene.add(this.dome);
    // clouds
    const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S; const cx = cv.getContext('2d'); const im = cx.createImageData(S, S);
    const rnd = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h ^= h >>> 13; return ((h * 1274126177) >>> 0) / 4294967296; };
    const vn = (x, y, f) => { const X = x / f, Y = y / f, xi = Math.floor(X), yi = Math.floor(Y), fx = X - xi, fy = Y - yi;
      const g = (a, b) => rnd(((a % (S / f)) + S / f) % (S / f), ((b % (S / f)) + S / f) % (S / f));
      const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return (g(xi, yi) * (1 - sx) + g(xi + 1, yi) * sx) * (1 - sy) + (g(xi, yi + 1) * (1 - sx) + g(xi + 1, yi + 1) * sx) * sy; };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const n = vn(x, y, 16) * 0.5 + vn(x, y, 8) * 0.32 + vn(x, y, 4) * 0.18;
      const o = (y * S + x) * 4; const sh = 238 + vn(x + 40, y + 17, 8) * 17; im.data[o] = im.data[o + 1] = sh; im.data[o + 2] = Math.min(255, sh + 6); im.data[o + 3] = n > 0.56 ? 255 : 0;
    }
    cx.putImageData(im, 0, 0);
    this.cloudTex = new THREE.CanvasTexture(cv); this.cloudTex.magFilter = THREE.NearestFilter; this.cloudTex.minFilter = THREE.NearestFilter;
    this.cloudTex.wrapS = this.cloudTex.wrapT = THREE.RepeatWrapping;
    this.cloudTex.repeat.set(3072 / (S * 12), 3072 / (S * 12));
    this.cloudU = { uMap: { value: this.cloudTex }, uColor: { value: new THREE.Vector3(1, 1, 1) }, uAlpha: { value: 0.85 }, uCam: { value: new THREE.Vector3() }, uOff: { value: new THREE.Vector2() } };
    const cm = new THREE.ShaderMaterial({ uniforms: this.cloudU, vertexShader: CLOUD_V, fragmentShader: CLOUD_F, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.clouds = new THREE.Mesh(new THREE.PlaneGeometry(3072, 3072).rotateX(-Math.PI / 2), cm); this.clouds.renderOrder = -5; this.clouds.frustumCulled = false;
    scene.add(this.clouds);
    this.cloudScroll = 0;
  }
  update(cam, tod, dt, cloudy, uniformsShared, underwater) {
    const ang = tod * Math.PI * 2;
    const sun = new THREE.Vector3(Math.cos(ang), Math.sin(ang), 0.3).normalize();
    const sh = sun.y;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const day = sm(-0.14, 0.22, sh), sunset = Math.exp(-Math.pow(sh / 0.2, 2)) * sm(-0.3, -0.1, sh + 0.25);
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    let zen = mix([0.008, 0.012, 0.045], [0.26, 0.48, 0.90], day), hor = mix([0.03, 0.04, 0.09], [0.66, 0.80, 0.98], day);
    hor = mix(hor, [1.0, 0.55, 0.30], sunset * 0.8); zen = mix(zen, [0.35, 0.32, 0.62], sunset * 0.25);
    const grey = [0.5, 0.55, 0.6]; zen = mix(zen, mix([0.02, 0.025, 0.05], grey, day), cloudy * 0.8); hor = mix(hor, mix([0.03, 0.035, 0.06], [0.6, 0.63, 0.68], day), cloudy * 0.8);
    this.uniforms.uSun.value.copy(sun); this.uniforms.uZenith.value.set(...zen); this.uniforms.uHorizon.value.set(...hor);
    this.uniforms.uNight.value = 1 - day; this.uniforms.uSunset.value = sunset; this.uniforms.uAngle.value = ang; this.uniforms.uTime.value += dt; this.uniforms.uCloudy.value = cloudy;
    this.dome.position.copy(cam.position);
    // shared light + fog
    const skyCol = mix([0.15, 0.19, 0.36], [1, 1, 1], day);
    const warm = mix(skyCol, [1.0, 0.78, 0.6].map((v, i) => v * skyCol[0]), Math.min(1, sunset * 0.7) * day);
    const dim = 1 - cloudy * 0.28; uniformsShared.uSkyCol.value.set(warm[0] * dim, warm[1] * dim, warm[2] * dim);
    this.fog = hor; this.day = day; this.sun = sun;
    if (underwater) { uniformsShared.uFogColor.value.set(0.08 * (0.3 + day), 0.22 * (0.3 + day), 0.42 * (0.3 + day)); uniformsShared.uFogNear.value = 0.5; uniformsShared.uFogFar.value = 26; }
    else { uniformsShared.uFogColor.value.set(hor[0], hor[1], hor[2]); }
    // clouds
    this.cloudScroll += dt * 1.6;
    this.clouds.position.set(Math.round(cam.position.x / 12) * 12, 124, Math.round(cam.position.z / 12) * 12);
    const px = (cam.position.x - this.clouds.position.x) / 12 / 128 * this.cloudTex.repeat.x * (128 * 12 / 3072);
    this.cloudU.uOff.value.set((this.clouds.position.x - this.cloudScroll) / 1536, -this.clouds.position.z / 1536);
    const cc = mix([0.14, 0.16, 0.26], [1, 1, 1], day); let cw = mix(cc, [1.0, 0.7, 0.55], sunset * 0.5); cw = mix(cw, mix([0.1, 0.11, 0.15], [0.52, 0.54, 0.6], day), cloudy * 0.85);
    this.cloudU.uColor.value.set(cw[0], cw[1], cw[2]); this.cloudU.uCam.value.copy(cam.position);
    this.cloudU.uAlpha.value = 0.88 + cloudy * 0.12;
  }
}

// ---------------------------------------------------------------------------- particles
export class Particles {
  constructor(scene, max = 500) {
    this.max = max; this.n = 0;
    const g = new THREE.BoxGeometry(1, 1, 1);
    this.mesh = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: 0xffffff }), max);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.mesh.frustumCulled = false; this.mesh.count = 0;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
    scene.add(this.mesh);
    this.p = []; this.m = new THREE.Matrix4(); this.q = new THREE.Quaternion(); this.s = new THREE.Vector3(); this.v = new THREE.Vector3(); this.c = new THREE.Color();
  }
  spawn(x, y, z, vx, vy, vz, col, size, life, grav = 22) {
    if (this.p.length >= this.max) this.p.shift();
    this.p.push({ x, y, z, vx, vy, vz, r: col[0], g: col[1], b: col[2], size, life, t: life, grav });
  }
  burst(x, y, z, col, n = 10, spread = 3) {
    for (let i = 0; i < n; i++) {
      const k = 0.75 + Math.random() * 0.5;
      this.spawn(x + (Math.random() - 0.5) * 0.9, y + (Math.random() - 0.5) * 0.9, z + (Math.random() - 0.5) * 0.9,
        (Math.random() - 0.5) * spread, Math.random() * spread * 0.9, (Math.random() - 0.5) * spread, [col[0] * k, col[1] * k, col[2] * k], 0.07 + Math.random() * 0.07, 0.5 + Math.random() * 0.6);
    }
  }
  update(dt, world, lightFn) {
    let j = 0;
    for (let i = 0; i < this.p.length; i++) {
      const p = this.p[i]; p.t -= dt; if (p.t <= 0) continue;
      p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (world.isSolid(p.x, p.y, p.z)) { p.y -= p.vy * dt; p.vy = -p.vy * 0.2; p.vx *= 0.6; p.vz *= 0.6; p.x -= p.vx * dt; p.z -= p.vz * dt; }
      this.p[j++] = p;
    }
    this.p.length = j;
    this.mesh.count = j;
    for (let i = 0; i < j; i++) {
      const p = this.p[i], sz = p.size * Math.min(1, p.t * 3 / 1 + 0.2);
      this.s.set(sz, sz, sz); this.v.set(p.x, p.y, p.z);
      this.m.compose(this.v, this.q, this.s); this.mesh.setMatrixAt(i, this.m);
      const l = lightFn ? lightFn(p.x, p.y, p.z) : 1;
      this.mesh.instanceColor.setXYZ(i, p.r / 255 * l, p.g / 255 * l, p.b / 255 * l);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.mesh.instanceColor.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------- item meshes
const blockMatCache = new Map(), voxelCache = new Map();
function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; }
export function blockMaterials(id) {
  if (blockMatCache.has(id)) return blockMatCache.get(id);
  const d = B.BLOCKS[id];
  const tint = (k) => k === B.TINT_GRASS ? B.TINTS.grass : k === B.TINT_FOLIAGE ? B.TINTS.foliage : null;
  const side = canvasTex(B.tileCanvas(d.tiles.side, tint(d.tintSide || d.tintAll)));
  const top = canvasTex(B.tileCanvas(d.tiles.top, tint(d.tintTop || d.tintAll)));
  const bottom = canvasTex(B.tileCanvas(d.tiles.bottom, null));
  const mk = (t, k) => new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(k, k, k), alphaTest: 0.5, transparent: false });
  const mats = [mk(side, 0.82), mk(side, 0.82), mk(top, 1), mk(bottom, 0.5), mk(side, 0.68), mk(side, 0.68)];
  blockMatCache.set(id, mats); return mats;
}
function voxelData(id) {
  if (voxelCache.has(id)) return voxelCache.get(id);
  const c = B.itemIcon(id); // 32x32; sample 16x16 grid
  const ctx = c.getContext('2d'); const d = ctx.getImageData(0, 0, 32, 32).data;
  const px = [];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const o = ((y * 2) * 32 + x * 2) * 4; if (d[o + 3] > 40) px.push([x, y, d[o] / 255, d[o + 1] / 255, d[o + 2] / 255]);
  }
  voxelCache.set(id, px); return px;
}
// returns a Group at ~1 block scale centred on origin; kind = block cube or extruded item sprite
export function makeItemMesh(id, size = 1) {
  const g = new THREE.Group();
  if (id < 256 && B.BLOCKS[id]) {
    const d = B.BLOCKS[id];
    if (d.shape === 1 || d.shape === 2) return makeVoxelSprite(id, size);
    const mats = blockMaterials(id).map((m) => m.clone());
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mats);
    g.add(mesh); g.userData.mats = mats;
  } else return makeVoxelSprite(id, size);
  return g;
}
function makeVoxelSprite(id, size) {
  const g = new THREE.Group(); const px = voxelData(id);
  const geo = new THREE.BoxGeometry(1 / 16, 1 / 16, 1.6 / 16);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const im = new THREE.InstancedMesh(geo, mat, Math.max(1, px.length));
  im.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, px.length) * 3), 3);
  const m = new THREE.Matrix4();
  px.forEach((p, i) => { m.makeTranslation((p[0] - 7.5) / 16, (7.5 - p[1]) / 16, 0); im.setMatrixAt(i, m); im.instanceColor.setXYZ(i, p[2], p[3], p[4]); });
  im.scale.setScalar(size); im.frustumCulled = false; g.add(im); g.userData.mats = [mat]; g.userData.sprite = true;
  return g;
}
export function setItemLight(g, l) {
  const mats = g.userData.mats; if (!mats) return;
  if (g.userData.sprite) { mats[0].color.setRGB(l, l, l); return; }
  const f = [0.82, 0.82, 1, 0.5, 0.68, 0.68];
  for (let i = 0; i < 6; i++) mats[i].color.setRGB(f[i] * l, f[i] * l, f[i] * l);
}
