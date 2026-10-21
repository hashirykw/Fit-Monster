/* The Machine — a selectorised lat-pulldown tower, built in Three.js and animated.
   The weight stack lifts on every rep, the pulleys turn, the cable runs and the bar comes down.
   Scroll drives the camera and the pin; the [data-pin] chips set the load by hand. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 760px)').matches;
const PLATES = 14, KG = 5, PH = .066, GAP = .006, BASE_Y = .16;

function plateLabel(n) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
  g.fillStyle = '#1a1917'; g.fillRect(0, 0, 256, 64);
  g.fillStyle = '#f2efe8'; g.font = '700 38px Tomorrow, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(n), 128, 34);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function shadowTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,.75)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}
function stripTex() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#0e0d0c'; g.fillRect(0, 0, 64, 512);
  g.fillStyle = '#f4c21b'; g.fillRect(26, 40, 12, 432);
  g.save(); g.translate(46, 420); g.rotate(-Math.PI / 2); g.fillStyle = '#e9e5dc'; g.font = '700 18px Tomorrow, sans-serif'; g.fillText('THE FIT MONSTER', 0, 0); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function mount(el) {
  const section = el.closest('section') || el;
  const host = el;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { el.classList.add('no-3d'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.6 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = !MOBILE; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.prepend(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true');
  const fb = host.querySelector('.mach__fallback'); if (fb) fb.remove();

  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(MOBILE ? 40 : 30, 1, .05, 60);

  /* light: warm key with soft shadow, gold rim, cool fill */
  const key = new THREE.DirectionalLight(0xfff0d0, 2.6); key.position.set(2.5, 4.5, 3.5);
  key.castShadow = !MOBILE; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = -2; key.shadow.camera.right = 2; key.shadow.camera.top = 3; key.shadow.camera.bottom = -1; key.shadow.bias = -.0004; key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf4c21b, 3.4); rim.position.set(-3, 2.6, -2.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb4ff, .35); fill.position.set(-2, 1, 3); scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, .12));

  /* materials */
  const frameM = new THREE.MeshPhysicalMaterial({ color: 0x1b1a19, roughness: .42, metalness: .55, clearcoat: .6, clearcoatRoughness: .3 });
  const steelM = new THREE.MeshStandardMaterial({ color: 0xe6e3dc, roughness: .16, metalness: 1 });
  const plateM = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: .38, metalness: .85 });
  const topPlateM = new THREE.MeshStandardMaterial({ color: 0x3b3936, roughness: .3, metalness: .9 });
  const goldM = new THREE.MeshPhysicalMaterial({ color: 0xf4c21b, roughness: .32, metalness: .2, clearcoat: .8, clearcoatRoughness: .2 });
  const rubberM = new THREE.MeshStandardMaterial({ color: 0x121110, roughness: .82, metalness: 0 });
  const padM = new THREE.MeshPhysicalMaterial({ color: 0x151413, roughness: .55, metalness: 0, sheen: .6, sheenColor: new THREE.Color(0x443c30), clearcoat: .25 });
  const cableM = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .5, metalness: .4 });
  const shroudM = new THREE.MeshPhysicalMaterial({ map: stripTex(), roughness: .35, metalness: .3, clearcoat: .7 });

  const M = new THREE.Group(); scene.add(M);
  const add = (geo, mat, x, y, z, parent = M) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const tube = (w, h, d) => new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * .28);

  /* floor + contact shadow */
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: 0x0d0c0b, roughness: .95, metalness: 0, transparent: true, opacity: .0 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false, opacity: .9 }));
  sh.rotation.x = -Math.PI / 2; sh.position.set(0, .002, .45); sh.scale.set(1, 1.5, 1); scene.add(sh);
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.ShadowMaterial({ opacity: .35 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = .001; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

  /* base rails */
  add(tube(.11, .06, 1.75), frameM, -.42, .03, .45); add(tube(.11, .06, 1.75), frameM, .42, .03, .45);
  add(tube(.95, .06, .11), frameM, 0, .03, -.25); add(tube(.95, .06, .11), frameM, 0, .03, 1.15);
  [[-.42, -.36], [.42, -.36], [-.42, 1.28], [.42, 1.28]].forEach(([x, z]) => add(new THREE.CylinderGeometry(.04, .045, .02, 20), rubberM, x, .01, z));

  /* rear tower */
  const TOWER = 2.36;
  add(tube(.085, TOWER, .085), frameM, -.34, TOWER / 2 + .06, -.2); add(tube(.085, TOWER, .085), frameM, .34, TOWER / 2 + .06, -.2);
  add(tube(.78, .09, .14), frameM, 0, TOWER + .06, -.2);
  /* shrouds with the yellow strip */
  const shroud = new RoundedBoxGeometry(.024, 1.86, .4, 2, .01);
  add(shroud, shroudM, -.405, 1.12, -.2).rotation.y = Math.PI; add(shroud, shroudM, .405, 1.12, -.2);

  /* guide rods */
  [-.2, .2].forEach(x => add(new THREE.CylinderGeometry(.011, .011, 2.05, 20), steelM, x, 1.12, -.2));

  /* weight stack */
  const plates = [], plateGeo = new RoundedBoxGeometry(.5, PH, .25, 2, .012);
  for (let i = 0; i < PLATES; i++) {
    const y = BASE_Y + (PLATES - 1 - i) * (PH + GAP);   // i = 0 is the top plate
    const g = new THREE.Group(); g.position.set(0, y, -.2); M.add(g);
    const p = add(plateGeo, plateM, 0, 0, 0, g);
    const lab = new THREE.Mesh(new THREE.PlaneGeometry(.12, .03), new THREE.MeshBasicMaterial({ map: plateLabel((i + 1) * KG) }));
    lab.position.set(.13, 0, .1255); g.add(lab);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(.012, 16), new THREE.MeshBasicMaterial({ color: 0x050505 })); hole.position.set(0, 0, .1256); g.add(hole);
    plates.push({ g, y });
  }
  const topY = BASE_Y + PLATES * (PH + GAP) + .02;
  const top = new THREE.Group(); top.position.set(0, topY, -.2); M.add(top);
  add(new RoundedBoxGeometry(.52, .05, .27, 2, .012), topPlateM, 0, 0, 0, top);
  add(new THREE.CylinderGeometry(.016, .016, .14, 16), steelM, 0, .09, 0, top);
  const stem = add(new THREE.CylinderGeometry(.008, .008, 1, 12), steelM, 0, 0, -.02, top);
  /* the pin */
  const pin = new THREE.Group(); M.add(pin);
  const pr = new THREE.Mesh(new THREE.CylinderGeometry(.007, .007, .16, 12), steelM); pr.rotation.x = Math.PI / 2; pr.position.z = -.04; pin.add(pr);
  const pk = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .04, 24), goldM); pk.rotation.x = Math.PI / 2; pk.position.z = .055; pin.add(pk);
  const pkb = new THREE.Mesh(new THREE.SphereGeometry(.026, 20, 12), goldM); pkb.scale.z = .6; pkb.position.z = .075; pin.add(pkb);

  /* top arm, pulleys */
  const ARM_Y = TOWER + .16, ARM_Z1 = -.2, ARM_Z2 = 1.02, PY = ARM_Y - .14;
  add(tube(.1, .1, ARM_Z2 - ARM_Z1 + .26), frameM, 0, ARM_Y, (ARM_Z1 + ARM_Z2) / 2);
  [ARM_Z1 - .075, ARM_Z2].forEach(z => { add(tube(.12, .12, .03), frameM, -.03, PY + .02, z); add(tube(.12, .12, .03), frameM, .03, PY + .02, z); });
  const pulleyGeo = new THREE.CylinderGeometry(.075, .075, .03, 40);
  const pulleys = [];
  [ARM_Z1 - .075, ARM_Z2].forEach(z => {
    const g = new THREE.Group(); g.position.set(0, PY, z); M.add(g);
    const w = add(pulleyGeo, steelM, 0, 0, 0, g); w.rotation.z = Math.PI / 2;
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(.07, .009, 8, 40), goldM); rim2.rotation.y = Math.PI / 2; g.add(rim2);
    g.add(new THREE.Mesh(new THREE.BoxGeometry(.034, .11, .016), frameM));
    pulleys.push(g);
  });
  /* cable segments (scaled each frame) */
  const cyl = new THREE.CylinderGeometry(.006, .006, 1, 8);
  const cabRear = add(cyl, cableM, 0, 0, ARM_Z1);
  const span = ARM_Z2 - (ARM_Z1 - .075);
  const cabTop = add(cyl, cableM, 0, PY + .075, (ARM_Z1 - .075 + ARM_Z2) / 2); cabTop.rotation.x = Math.PI / 2; cabTop.scale.y = span;
  const cabFront = add(cyl, cableM, 0, 0, ARM_Z2 + .075);

  /* lat bar with yellow grips */
  const bar = new THREE.Group(); M.add(bar);
  add(new THREE.CylinderGeometry(.014, .014, .62, 20), steelM, 0, 0, 0, bar).rotation.z = Math.PI / 2;
  [-1, 1].forEach(s => {
    const e = new THREE.Group(); e.position.set(s * .31, 0, 0); e.rotation.z = s * -.42; bar.add(e);
    add(new THREE.CylinderGeometry(.014, .014, .34, 20), steelM, s * .17, 0, 0, e).rotation.z = Math.PI / 2;
    add(new THREE.CylinderGeometry(.02, .02, .2, 24), goldM, s * .2, 0, 0, e).rotation.z = Math.PI / 2;
  });
  add(new THREE.TorusGeometry(.025, .005, 8, 20), steelM, 0, .03, 0, bar);

  /* seat + knee rollers */
  add(tube(.07, .5, .07), frameM, 0, .28, 1.22);
  add(tube(.3, .07, .4), frameM, 0, .52, 1.22);
  add(new RoundedBoxGeometry(.34, .08, .42, 4, .035), padM, 0, .6, 1.22);
  add(tube(.06, .45, .06), frameM, 0, .78, 1.02).rotation.x = .2;
  [-1, 1].forEach(s => { const r = add(new THREE.CylinderGeometry(.055, .055, .26, 28), padM, s * .15, .98, 1.0); r.rotation.z = Math.PI / 2; });
  add(new THREE.CylinderGeometry(.012, .012, .58, 12), steelM, 0, .98, 1.0).rotation.z = Math.PI / 2;
  M.position.y = 0; M.position.z = -.35;

  /* state */
  let pinIdx = 6, manual = false, lift = 0, prevLift = 0, reps = 0, wasUp = false;
  const kgOut = section.querySelector('[data-mach-kg]'), repOut = section.querySelector('[data-mach-reps]'), plOut = section.querySelector('[data-mach-plates]');
  const chips = Array.from(section.querySelectorAll('[data-pin]'));
  const steps = Array.from(section.querySelectorAll('.mach__step'));
  const setPin = i => {
    pinIdx = Math.max(0, Math.min(PLATES - 1, i));
    const p = plates[pinIdx]; pin.position.set(0, p.y, -.2 + .125);
    if (kgOut) kgOut.textContent = ((pinIdx + 1) * KG) + ' kg';
    if (plOut) plOut.textContent = (pinIdx + 1) + ' / ' + PLATES;
    chips.forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.pin === pinIdx)));
  };
  setPin(pinIdx);
  chips.forEach(c => c.addEventListener('click', () => { manual = true; setPin(+c.dataset.pin); }));
  if (document.fonts) document.fonts.load('700 38px Tomorrow').then(() => plates.forEach((p, i) => { const lab = p.g.children[1]; lab.material.map.dispose(); lab.material.map = plateLabel((i + 1) * KG); lab.material.needsUpdate = true; }));

  const size = () => {
    const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    /* wide screens: shift the frame so the machine sits in the right half, clear of the copy */
    if (w > 900) camera.setViewOffset(w * 1.5, h, 0, 0, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  size(); new ResizeObserver(size).observe(host);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = (e.clientX / innerWidth - .5) * 2; mouse.ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });

  let visible = true; new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(section);
  const clock = new THREE.Clock(); let prog = 0, phase = 0;
  const repCurve = x => { const t = x % 1; if (t < .38) return .5 - .5 * Math.cos(Math.PI * t / .38); if (t < .5) return 1; if (t < .92) return .5 + .5 * Math.cos(Math.PI * (t - .5) / .42); return 0; };
  const target = new THREE.Vector3();

  function pose() {
    const travel = .44;
    const dy = lift * travel;
    for (let i = 0; i < PLATES; i++) plates[i].g.position.y = plates[i].y + (i <= pinIdx ? dy : 0);
    pin.position.y = plates[pinIdx].y + dy;
    top.position.y = topY + dy;
    const stemLen = topY - plates[pinIdx].y; stem.scale.y = stemLen; stem.position.y = -stemLen / 2;
    /* rear cable: from the top plate up to the rear pulley */
    const y0 = topY + dy + .16, y1 = PY;
    cabRear.scale.y = Math.max(.01, y1 - y0); cabRear.position.set(0, (y0 + y1) / 2, ARM_Z1);
    /* the bar comes down as the stack goes up */
    const barY = 1.76 - dy * 1.3;
    bar.position.set(0, barY, ARM_Z2 + .075);
    const by1 = barY + .03;
    cabFront.scale.y = Math.max(.01, PY - by1); cabFront.position.set(0, (PY + by1) / 2, ARM_Z2 + .075);
    const d = lift - prevLift; pulleys.forEach((p, i) => p.rotation.x += d * travel / .075 * (i === 0 ? -1 : 1)); prevLift = lift;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05);
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    const r = section.getBoundingClientRect();
    const tgt = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    prog += (tgt - prog) * .08;
    if (!manual) { const want = Math.round(2 + prog * 10); if (want !== pinIdx) setPin(want); }
    steps.forEach((s, i) => s.classList.toggle('on', prog >= i / steps.length - .02 && (i === steps.length - 1 || prog < (i + 1) / steps.length - .02)));
    phase += dt / 2.6;
    lift = RM ? .4 : repCurve(phase);
    const up = lift > .95; if (up && !wasUp) { reps++; if (repOut) repOut.textContent = String(reps).padStart(2, '0'); } wasUp = up;
    pose();
    /* camera orbit: three-quarter front → side → close on the stack */
    const a = .62 - prog * 1.5 + mouse.x * .08;
    const rad = (MOBILE ? 8.8 : 6.4) - prog * .9;
    const ty = (MOBILE ? 1.5 : 1.25) - prog * .15;
    camera.position.set(Math.sin(a) * rad, 1.55 + prog * .35 - mouse.y * .12, Math.cos(a) * rad + .1);
    target.set(0, ty, .05 - prog * .25);
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
  frame();
}
