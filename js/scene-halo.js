/* The Halo — the gym's own ceiling (white octagon LED rings + red X lights) rebuilt in Three.js.
   data-scene="halo"          → scroll-driven flythrough (home). Reads its section's scroll progress.
   data-scene="halo-ambient"  → slow drifting rings for inner-page heroes; follows the theme. */
import * as THREE from 'three';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = matchMedia('(max-width: 700px)').matches;

function octagon(r, rot = Math.PI / 8) {
  const pts = [];
  for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4; pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r)); }
  return pts;
}
function ringGeo(r, w) {
  const s = new THREE.Shape(octagon(r)); s.holes.push(new THREE.Path(octagon(r - w).reverse()));
  return new THREE.ShapeGeometry(s, 1);
}
function glowTex(color = '#fff6dc') {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); g.translate(128, 128);
  const draw = (r, lw, a, blur) => { g.save(); g.globalAlpha = a; g.shadowColor = color; g.shadowBlur = blur; g.strokeStyle = color; g.lineWidth = lw; g.beginPath(); octagon(r).forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); g.stroke(); g.restore(); };
  draw(92, 18, .35, 40); draw(92, 8, .6, 18);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function dotTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.3, 'rgba(255,220,150,.45)'); r.addColorStop(1, 'rgba(255,220,150,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t;
}
function paperRGB() {
  const c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d');
  g.fillStyle = getComputedStyle(document.body).backgroundColor; g.fillRect(0, 0, 1, 1);
  const d = g.getImageData(0, 0, 1, 1).data; return new THREE.Color(d[0] / 255, d[1] / 255, d[2] / 255).convertSRGBToLinear();
}

export function mount(el) {
  const ambient = el.dataset.scene === 'halo-ambient';
  const host = el.querySelector('.halo__sticky') || el;
  const section = el.closest('section') || el;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: !MOBILE, alpha: ambient, powerPreference: 'high-performance' }); }
  catch (e) { el.classList.add('no-3d'); return; }
  const DPR = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 1.75);
  renderer.setPixelRatio(DPR);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.prepend(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const fb = host.querySelector('.halo__fallback'); if (fb) fb.remove();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(MOBILE ? 72 : 60, 1, .1, 220);
  const night = new THREE.Color('#0d0c0a');
  if (!ambient) { scene.background = night; scene.fog = new THREE.Fog(night, 18, 85); }

  const SPACING = 8, N = ambient ? 9 : 16;
  const rings = [], glows = [];
  const warm = new THREE.Color('#fff4dc'), gold = new THREE.Color('#f4c21b');
  const glowT = glowTex(), glowGold = glowTex('#f6c63a');
  const ringMat = new THREE.MeshBasicMaterial({ color: warm, side: THREE.DoubleSide, transparent: true, fog: true });
  const goldMat = new THREE.MeshBasicMaterial({ color: gold, side: THREE.DoubleSide, transparent: true, fog: true });
  const geo = ringGeo(4.2, .16);
  for (let i = 0; i < N; i++) {
    const isGold = i % 4 === 3;
    const m = new THREE.Mesh(geo, isGold ? goldMat : ringMat);
    const z = -i * SPACING;
    m.position.set(ambient ? (MOBILE ? (Math.random() - .5) * 5 : 2.5 + Math.random() * 5) : Math.sin(i * .7) * .8, ambient ? (Math.random() - .5) * 3 : Math.cos(i * .5) * .4, z);
    m.rotation.z = (i % 2 ? 1 : -1) * .06 + (ambient ? Math.random() : 0);
    m.scale.setScalar(ambient ? .45 + Math.random() * .5 : 1);
    scene.add(m); rings.push(m);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 11.6), new THREE.MeshBasicMaterial({ map: isGold ? glowGold : glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: true }));
    gl.position.copy(m.position); gl.rotation.copy(m.rotation); gl.scale.copy(m.scale);
    scene.add(gl); glows.push(gl);
  }

  /* ceiling: small flat octagon lights and the red X lights; floor: rubber-tile grid */
  if (!ambient) {
    const small = ringGeo(1.1, .08);
    const ceilMat = new THREE.MeshBasicMaterial({ color: warm, side: THREE.DoubleSide, fog: true });
    const xMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff3b2f'), fog: true });
    for (let i = 0; i < N * 1.4; i++) {
      const z = -i * SPACING * .72 - 3;
      const m = new THREE.Mesh(small, ceilMat); m.rotation.x = Math.PI / 2; m.position.set((i % 2 ? -1 : 1) * (3 + (i % 3)), 5.4, z); scene.add(m);
      if (i % 3 === 1) {
        const g = new THREE.Group();
        [-1, 1].forEach(s => { const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, .05, .05), xMat); b.rotation.y = s * Math.PI / 4; g.add(b); });
        g.position.set((i % 2 ? 1 : -1) * 2.2, 5.3, z - 2); scene.add(g);
      }
    }
    const grid = new THREE.GridHelper(40, 40, 0x2a2620, 0x1b1916); grid.position.set(0, -4.2, -SPACING * N / 2); grid.scale.z = (SPACING * N) / 40 + .5; scene.add(grid);
    /* the end of the tunnel: the FM mark, lit */
    new THREE.TextureLoader().load('media/img/mark.webp', t => {
      t.colorSpace = THREE.SRGBColorSpace;
      const a = t.image.width / t.image.height;
      const mk = new THREE.Mesh(new THREE.PlaneGeometry(6 * a, 6), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false }));
      mk.position.set(0, .2, -SPACING * N - 6); scene.add(mk);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: dotTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .55, fog: false }));
      halo.position.copy(mk.position).add(new THREE.Vector3(0, 0, -.5)); scene.add(halo);
    });
  }

  /* dust in the light */
  const P = ambient ? (MOBILE ? 60 : 120) : (MOBILE ? 200 : 420);
  const pg = new THREE.BufferGeometry(), pos = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) { pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = (Math.random() - .5) * 9; pos[i * 3 + 2] = -Math.random() * SPACING * N; }
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: MOBILE ? .09 : .07, map: dotTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .7, fog: true }));
  scene.add(dust);

  /* ambient follows the theme: glowing on dark, drawn in ink + gold on light */
  const applyTheme = () => {
    if (!ambient) return;
    const light = document.documentElement.dataset.theme === 'light';
    ringMat.color.set(light ? '#1d1a16' : '#fff4dc'); ringMat.opacity = light ? .22 : .55; goldMat.opacity = light ? .7 : .9;
    goldMat.color.set(light ? '#b98a00' : '#f4c21b');
    glows.forEach(g => { g.visible = !light; g.material.opacity = .32; }); dust.visible = !light;
    scene.fog = new THREE.Fog(paperRGB(), 14, 62);
  };
  if (!ambient) { glows.forEach(g => g.material.opacity = .55); ringMat.opacity = .85; }
  applyTheme(); addEventListener('fm:theme', applyTheme);

  /* sizing */
  const size = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); new ResizeObserver(size).observe(host);

  /* zones UI (home) */
  const zones = Array.from(section.querySelectorAll('.zone')), ticks = Array.from(section.querySelectorAll('.halo__rail i')), railN = section.querySelector('.halo__rail b');
  const TH = [.06, .3, .54, .76];
  let zi = -2;
  const setZone = p => {
    let k = -1; TH.forEach((t, i) => { if (p >= t) k = i; });
    if (k === zi) return; zi = k;
    zones.forEach((z, i) => z.classList.toggle('on', i === k));
    ticks.forEach((t, i) => t.classList.toggle('on', i <= k));
    if (railN) railN.textContent = String(Math.max(0, k + 1)).padStart(2, '0');
  };

  /* pointer */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = (e.clientX / innerWidth - .5) * 2; mouse.ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });

  let visible = true, prog = 0, t0 = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(section);
  const clock = new THREE.Clock();
  const total = SPACING * N + 2;

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05), t = (performance.now() - t0) / 1000;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    if (ambient) {
      camera.position.set(mouse.x * .8, -mouse.y * .4, 12);
      camera.lookAt(mouse.x * .3 + (MOBILE ? 0 : 1.2), 0, -20);
      rings.forEach((r, i) => {
        r.position.z += dt * 1.4; if (r.position.z > 3) r.position.z -= SPACING * N;
        r.rotation.z += dt * (i % 2 ? .05 : -.04); glows[i].rotation.z = r.rotation.z; glows[i].position.z = r.position.z;
      });
    } else {
      const r = section.getBoundingClientRect();
      const target = RM ? .5 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
      prog += (target - prog) * .09;
      setZone(prog);
      const z = 6 - prog * total;
      camera.position.set(Math.sin(prog * 6) * .6 + mouse.x * .5, Math.cos(prog * 4) * .25 - mouse.y * .3, z);
      camera.lookAt(Math.sin(prog * 6 + .5) * .3, 0, z - 12);
      camera.rotation.z += Math.sin(prog * 3) * .03;
      rings.forEach((m, i) => { m.rotation.z += dt * (i % 2 ? .04 : -.03); glows[i].rotation.z = m.rotation.z; });
    }
    dust.rotation.z += dt * .01;
    renderer.render(scene, camera);
  }
  if (RM) { if (!ambient) setZone(.5); renderer.render(scene, camera); requestAnimationFrame(() => { camera.position.set(0, 0, ambient ? 8 : -20); camera.lookAt(0, 0, -40); renderer.render(scene, camera); }); return; }
  frame();
}
