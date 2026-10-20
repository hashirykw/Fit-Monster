/* Round rubber dumbbell, the kind on the Fit Monster rack — drag to turn it.
   Optional controls in the same section:
     [data-grip="long|short|brach"]  rotates it to the grip that trains that head (from their biceps guide)
     [data-kg="5|10|15|22.5|30"]      changes the plate label and head size */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 700px)').matches;

function labelTex(kg) {
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#121110'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#f4c21b'; g.lineWidth = 14; g.beginPath(); g.arc(256, 256, 226, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.beginPath(); g.arc(256, 256, 200, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#f2efe8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 54px Tomorrow, sans-serif'; g.fillText('THE FIT', 256, 168); g.fillText('MONSTER', 256, 226);
  g.fillStyle = '#f4ecd8'; g.fillRect(150, 280, 212, 92);
  g.fillStyle = '#121110'; g.font = '800 64px Tomorrow, sans-serif'; g.fillText(kg + ' kg', 256, 328);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function mount(el) {
  const stage = el.matches('.lab__stage') ? el : el.querySelector('.lab__stage') || el;
  const section = el.closest('section') || document;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { el.classList.add('no-3d'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  stage.prepend(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100); camera.position.set(0, .3, 7.4); camera.lookAt(0, 0, 0);

  const key = new THREE.DirectionalLight(0xffe2a0, 2.4); key.position.set(4, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xf4c21b, 3.2); rim.position.set(-5, 2, -4); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, .15));

  const rubber = new THREE.MeshStandardMaterial({ color: 0x141312, roughness: .62, metalness: .05 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd9d6cf, roughness: .22, metalness: 1 });
  const knurl = new THREE.MeshStandardMaterial({ color: 0xa8a49b, roughness: .48, metalness: 1 });
  const goldM = new THREE.MeshStandardMaterial({ color: 0xf4c21b, roughness: .35, metalness: .6, emissive: 0x3a2a00, emissiveIntensity: .4 });

  const bell = new THREE.Group(); scene.add(bell);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 1.5, 48, 1), knurl); handle.rotation.z = Math.PI / 2; bell.add(handle);
  /* knurl rings */
  for (let i = -6; i <= 6; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.152, .006, 6, 40), chrome); r.rotation.y = Math.PI / 2; r.position.x = i * .1; bell.add(r); }
  const heads = [], caps = [];
  let capTex = labelTex(22.5);
  const capMat = new THREE.MeshStandardMaterial({ map: capTex, roughness: .55, metalness: .1 });
  const buildHead = side => {
    const g = new THREE.Group();
    /* rounded-edge drum via lathe profile */
    const R = .66, H = .58, b = .08, pts = [];
    pts.push(new THREE.Vector2(0, -H / 2));
    for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(R - b + Math.cos(a) * b, -H / 2 + b + Math.sin(a) * b)); }
    for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(R - b + Math.cos(a) * b, H / 2 - b + Math.sin(a) * b)); }
    pts.push(new THREE.Vector2(0, H / 2));
    const drum = new THREE.Mesh(new THREE.LatheGeometry(pts, 72), rubber); drum.rotation.z = Math.PI / 2; g.add(drum);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(.5, 64), capMat); cap.position.x = side * (H / 2 + .002); cap.rotation.y = side * Math.PI / 2; g.add(cap); caps.push(cap);
    const band = new THREE.Mesh(new THREE.TorusGeometry(.58, .012, 8, 96), goldM); band.rotation.y = Math.PI / 2; band.position.x = side * (H / 2 - .02); g.add(band);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .1, 48), chrome); collar.rotation.z = Math.PI / 2; collar.position.x = -side * (H / 2 + .05); g.add(collar);
    g.position.x = side * (.75 + H / 2 + .02); bell.add(g); heads.push(g); return g;
  };
  buildHead(1); buildHead(-1);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .35 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.25; shadow.scale.set(1.3, .45, 1); scene.add(shadow);

  /* orientation state, eased */
  const rot = { x: .35, y: -.6, z: .12 }, tgt = { x: .35, y: -.6, z: .12 };
  let auto = !RM, vy = 0;
  const GRIPS = { long: { x: .55, y: -.35, z: .05 }, short: { x: -.25, y: .2, z: -.08 }, brach: { x: .2, y: -.4, z: Math.PI / 2 - .12 } };
  const setGrip = k => { const g = GRIPS[k]; if (!g) return; auto = false; tgt.x = g.x; tgt.y = g.y + Math.round((rot.y - g.y) / (Math.PI * 2)) * Math.PI * 2; tgt.z = g.z; };
  const setKg = kg => {
    const s = .78 + (Math.min(30, Math.max(5, kg)) - 5) / 25 * .36;
    heads.forEach((h, i) => { h.scale.set(.9 + s * .1, s, s); h.position.x = (i ? -1 : 1) * (.75 + .29 * (.9 + s * .1) + .02); });
    capTex.dispose(); capTex = labelTex(kg); capMat.map = capTex; capMat.needsUpdate = true;
    const out = section.querySelector('[data-kg-out]'); if (out) out.textContent = kg + ' kg';
  };
  setKg(22.5);
  if (document.fonts) document.fonts.load('800 60px Tomorrow').then(() => setKg(parseFloat((section.querySelector('[data-kg][aria-pressed="true"]') || {}).dataset?.kg || 22.5)));

  section.querySelectorAll('[data-grip]').forEach(b => b.addEventListener('click', () => {
    section.querySelectorAll('[data-grip]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    section.querySelectorAll('.head-card').forEach(c => c.classList.toggle('on', c.dataset.head === b.dataset.grip));
    setGrip(b.dataset.grip);
  }));
  section.querySelectorAll('[data-kg]').forEach(b => b.addEventListener('click', () => {
    section.querySelectorAll('[data-kg]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    setKg(parseFloat(b.dataset.kg));
  }));

  /* drag to turn (horizontal drags only; vertical swipes still scroll on phones) */
  let drag = null;
  stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, rx: tgt.x, ry: tgt.y, axis: null }; auto = false; });
  addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.axis && Math.hypot(dx, dy) > 6) drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    if (drag.axis === 'x' || e.pointerType === 'mouse') { const ny = drag.ry + dx * .01; vy = ny - tgt.y; tgt.y = ny; tgt.x = Math.max(-1, Math.min(1.2, drag.rx + dy * .006 * (e.pointerType === 'mouse' ? 1 : 0))); }
  }, { passive: true });
  addEventListener('pointerup', () => { drag = null; });

  const size = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.position.z = w / h < .9 ? 9.6 : 7.4; camera.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(stage);

  let visible = true; new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);
  const clock = new THREE.Clock();
  const frame = () => {
    requestAnimationFrame(frame); if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    if (auto) tgt.y += dt * .35;
    if (!drag && Math.abs(vy) > .0005) { tgt.y += vy; vy *= .92; }
    rot.x += (tgt.x - rot.x) * .08; rot.y += (tgt.y - rot.y) * .08; rot.z += (tgt.z - rot.z) * .08;
    bell.rotation.set(rot.x, rot.y, rot.z);
    bell.position.y = Math.sin(t * 1.2) * .06;
    shadow.scale.x = 1.3 - Math.sin(t * 1.2) * .05;
    renderer.render(scene, camera);
  };
  if (RM) { bell.rotation.set(rot.x, rot.y, rot.z); renderer.render(scene, camera); section.querySelectorAll('[data-grip],[data-kg]').forEach(b => b.addEventListener('click', () => requestAnimationFrame(() => { Object.assign(rot, tgt); bell.rotation.set(rot.x, rot.y, rot.z); renderer.render(scene, camera); }))); return; }
  frame();
}
