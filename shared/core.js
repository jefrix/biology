/* Shared engine: navigation, module loading, 3D setup, labels, animation helpers, camera and scale bar.
   Modules live in ../modules and register themselves with CellCity.register(). */
'use strict';
const $ = (s) => document.querySelector(s);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const m = (txt, c) => `<span class="m" style="--c:var(--${c})">${txt}</span>`;

const OUT = {
  NADH: { label: 'NADH', c: 'nadh' }, FADH2: { label: 'FADH₂', c: 'fadh' }, GTP: { label: 'GTP', c: 'atp' },
  CO2: { label: 'CO₂', c: 'co2' }, ATP: { label: 'ATP', c: 'atp' }, H2O: { label: 'H₂O', c: 'electron' },
};

const stageEl = $('#stage');
const canvas = $('#gl');
let renderer;
const V3 = window.THREE ? THREE.Vector3 : function () {};
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(20261125);
const rr = (a, b) => a + (b - a) * rnd();
const ease = {
  inOut: (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2),
  out: (u) => 1 - Math.pow(1 - u, 3),
  lin: (u) => u,
};

let now = 0, dtG = 0;
const css = getComputedStyle(document.documentElement);
const col = (name) => new THREE.Color(css.getPropertyValue('--' + name).trim());

/* shared mutable state that module code reads */
let agents = [];
let stageId = null;

/* ---------- module registry ---------- */
const MANIFEST = [
  /* Cell mechanisms: what happens inside one cell */
  { key: 'energy', name: 'Energy', c: 'atp', eyebrow: 'From your plate to ATP', title: 'Following one glucose molecule',
    blurb: 'Tour the cell, then follow food through glycolysis, the Krebs cycle with real 3D molecules and carbon tracing, and the electron transport chain.',
    ids: ['cell', 'fuel', 'glycolysis', 'link', 'krebs', 'etc', 'tally'], names: ['Cell city', 'Fuel', 'Glycolysis', 'Link', 'Krebs', 'ETC', 'Ledger'] },
  { key: 'protein', name: 'Protein factory', c: 'exon', eyebrow: 'The protein factory', title: 'One protein, from gene to export',
    blurb: 'Follow real human insulin from its gene through splicing, codon-by-codon translation, the ER and Golgi, to its real 3D structure and release.',
    ids: ['gene', 'mrna', 'translate', 'er', 'golgi', 'granule', 'export'], names: ['Gene', 'mRNA', 'Ribosome', 'ER', 'Golgi', 'Granule', 'Export'] },
  { key: 'cleanup', name: 'Recycling & cleanup', c: 'lyso', eyebrow: 'Recycling and cleanup', title: 'The city’s recycling service',
    blurb: 'See how a cell brings things in, digests them in lysosomes, shreds single proteins, salvages worn-out parts, handles tough fats, and what happens when cleanup fails.',
    ids: ['intake', 'lysosome', 'proteasome', 'autophagy', 'peroxisome', 'storage'], names: ['Intake', 'Lysosome', 'Proteasome', 'Autophagy', 'Peroxisome', 'Breakdowns'] },
  { key: 'transport', name: 'Membranes & transport', c: 'pump', eyebrow: 'Membrane transport', title: 'Across the red blood cell membrane',
    blurb: 'Watch oxygen, glucose and sodium cross a membrane by three different routes, see water reshape a red blood cell, and follow the sodium–potassium pump through one ATP-driven cycle.',
    ids: ['permeability', 'osmosis', 'pump'], names: ['Selective passage', 'Red cell osmosis', 'Ion pump'] },
  { key: 'division', name: 'Division & radiation', c: 'sphase', eyebrow: 'Cell division, DNA and radiation', title: 'Copying the city’s archive safely',
    blurb: 'Follow the cell cycle and mitosis, see how radiation damages DNA and how cells repair it, then explore fractionation and dose in radiology.',
    ids: ['cycle', 'mitosis', 'damage', 'repair', 'fate', 'survival', 'dose'], names: ['Cycle', 'Mitosis', 'Damage', 'Repair', 'Fate', 'Survival', 'Dose'] },
  /* Cells in tissues: specialized cells and the body systems they build */
  { key: 'neural', name: 'Neural cells', c: 'dendrite', eyebrow: 'Neurons and glia', title: 'The city’s communications network',
    blurb: 'Meet neurons and glia, run a live action potential simulation, send signals across a synapse, and see how stroke and MS show up on MRI.',
    ids: ['neurons', 'rest', 'spike', 'myelin', 'synapse', 'integrate', 'axon', 'brain'], names: ['Cells', 'Rest', 'Spike', 'Myelin', 'Synapse', 'Sum', 'Transport', 'Imaging'] },
  { key: 'muscle', name: 'Muscle cells', c: 'schwann', eyebrow: 'Muscle cells and fiber types',
    title: 'From nerve signal to force', blurb: 'Watch calcium release and filaments slide, then compare fiber types and muscle tissues.',
    ids: ['muscle-contraction', 'muscle-structure', 'muscle-fibers', 'muscle-tissues'],
    names: ['Signal to force', 'Inside the fiber', 'Fiber types', 'Three muscle tissues'] },
  { key: 'blood', name: 'Blood', c: 'rbc', eyebrow: 'Blood cells', title: 'Couriers and defenders',
    blurb: 'A to-scale line-up of the red cell, every kind of white cell and platelets. Watch each one at work, with radiology links.',
    ids: ['blood'], names: ['Red cell', 'Neutrophil', 'Lymphocytes', 'Monocyte', 'Eosinophil', 'Basophil', 'Platelets'] },
  { key: 'hormones', name: 'Hormones & endocrine', c: 'insulin', eyebrow: 'Endocrine signaling · insulin and glucose', title: 'How hormones coordinate the body',
    blurb: 'Map the glands and their receptor routes, follow insulin from the islet and beta cell to muscle, see what goes wrong in diabetes and why it matters before an FDG-PET scan, then trace the feedback loops behind reproductive hormones.',
    ids: ['endocrine-map', 'endocrine-receptors', 'endocrine-secretion', 'islet', 'beta', 'receptor', 'balance', 'diabetes', 'petprep', 'endocrine-patterns', 'endocrine-feedback'],
    names: ['Gland map', 'Receptor routes', 'Blood or duct', 'Islet', 'Release', 'Muscle response', 'Balance', 'Diabetes', 'PET prep', 'Hormone patterns', 'Feedback loops'] },
  { key: 'nephron', name: 'Nephron cells', c: 'electron', eyebrow: 'The kidney nephron',
    title: 'Follow fluid through the nephron',
    blurb: 'Watch blood filtration, glucose recovery, the loop of Henle, and hormone control in the collecting duct.',
    ids: ['nephron-overview', 'glomerular-filtration', 'proximal-tubule', 'nephron-loop', 'collecting-duct'],
    names: ['Follow the filtrate', 'Filter blood', 'Reclaim glucose', 'Build a gradient', 'Adjust the final mix'] },
  { key: 'reproduction', name: 'Reproductive cells', c: 'chrom-a', eyebrow: 'Reproductive cells and fertilization',
    title: 'From gametes to a blastocyst', blurb: 'Compare sperm and oocytes, track chromosomes through meiosis, and see fertilization and early cleavage in 3D.',
    ids: ['gametes', 'human-meiosis', 'fertilization', 'early-cleavage'], names: ['Sperm and oocyte', 'Meiosis', 'Fertilization', 'Early cleavage'] },
];
const registry = {};
const CellCity = { register(key, def) { registry[key] = def; } };
const moduleFor = (id) => MANIFEST.find(x => x.ids.includes(id));
// Old chapter links that moved when modules were merged, so bookmarks still land somewhere sensible.
const ALIASES = { 'endocrine-targets': 'endocrine-receptors' };

/* ---------- 3D world shared by all modules ---------- */
const GROUPS = {}, UNITS_PER_NM = {}, FOG = {}, DEPTH = {}, FADE_TEXT = {}, POSES = {}, B = {}, ambients = [];
let G3 = null;                                   // set when WebGL is available

function initWorld() {
  const scene = new THREE.Scene();
  const BG = col('bg');
  scene.background = BG;
  scene.fog = new THREE.FogExp2(BG, 0.006);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
  camera.position.set(10, 9, 30);
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 120;
  controls.autoRotateSpeed = 0.35;

  scene.add(new THREE.AmbientLight(0x8fa3c4, 0.55));
  const hemi = new THREE.HemisphereLight(0xbfd8ff, 0x1a1020, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(12, 20, 16); scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fbfff, 0.35); rim.position.set(-18, -6, -14); scene.add(rim);

  const C = {};
  ['glucose', 'pyruvate', 'acetyl', 'nadh', 'fadh', 'atp', 'co2', 'proton', 'electron', 'fat', 'amino', 'fdg', 'mito', 'nucleus', 'golgi', 'lyso', 'membrane'].forEach(k => C[k] = col(k));
  const UP = new V3(0, 1, 0);
  /* ---------- material + sprite helpers ---------- */
  function fresnelMat(color, intensity = 1, power = 2.4) {
    return new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(color) }, uI: { value: intensity }, uP: { value: power } },
      vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uColor; uniform float uI; uniform float uP; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uP); gl_FragColor = vec4(uColor * f * uI, 1.0); }',
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
  }
  const GLOW = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.22, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  function glow(color, size) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.scale.setScalar(size);
    return s;
  }
  const texCache = new Map();
  function textTex(text, color) {
    const k = text + '|' + color.getHexString();
    if (texCache.has(k)) return texCache.get(k);
    const fs = 56, pad = 14;
    const c = document.createElement('canvas'); const ctx = c.getContext('2d');
    const font = `500 ${fs}px "IBM Plex Mono", Consolas, monospace`;
    ctx.font = font;
    c.width = Math.ceil(ctx.measureText(text).width) + pad * 2; c.height = fs + pad * 2;
    ctx.font = font; ctx.textBaseline = 'middle';
    ctx.shadowColor = '#' + color.getHexString(); ctx.shadowBlur = 14;
    ctx.fillStyle = '#' + color.getHexString(); ctx.fillText(text, pad, c.height / 2 + 2);
    const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
    const v = { tex, aspect: c.width / c.height };
    texCache.set(k, v); return v;
  }
  function textSprite(text, color, h = 0.7) {
    const t = textTex(text, color);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t.tex, transparent: true, depthWrite: false }));
    s.scale.set(h * t.aspect, h, 1);
    return s;
  }
  const atomGeo = new THREE.SphereGeometry(1, 18, 14);
  const matCache = new Map();
  function atomMat(color) {
    const k = color.getHexString();
    if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.05 }));
    return matCache.get(k);
  }
  function layout(n, shape, d) {
    const pts = [];
    if (shape === 'chain') {
      for (let i = 0; i < n; i++) pts.push(new V3((i - (n - 1) / 2) * d * 0.86, (i % 2 ? 0.25 : -0.25) * d, 0));
    } else if (n === 1) pts.push(new V3());
    else {
      const R = d / (2 * Math.sin(Math.PI / n));
      for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.PI / 2; pts.push(new V3(Math.cos(a) * R, Math.sin(a) * R, 0)); }
    }
    return pts;
  }
  function molecule(n, color, { shape = 'ring', r = 0.22, glowSize = 2.2, special = null } = {}) {
    const g = new THREE.Group();
    layout(n, shape, r * 2.1).forEach((p, i) => {
      const a = new THREE.Mesh(atomGeo, atomMat(special && i === 0 ? special : color));
      a.scale.setScalar(special && i === 0 ? r * 1.15 : r);
      a.position.copy(p); g.add(a);
    });
    if (glowSize) g.add(glow(color, glowSize));
    return g;
  }
  function disposeObj(o) {
    if (o.parent) o.parent.remove(o);
    o.traverse(c => { if (c.isSprite) c.material.dispose(); });
  }

  /* ---------- agents: small animations that run themselves (the list is shared with module code) ---------- */
  function clearAgents() { agents.forEach(a => a.obj && disposeObj(a.obj)); agents = []; }
  function travel(parent, obj, points, dur, opts = {}) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => p.clone()));
    const e = opts.ease || ease.inOut;
    parent.add(obj);
    obj.position.copy(points[0]);
    const start = now + (opts.delay || 0);
    if (opts.delay) obj.visible = false;
    agents.push({
      obj,
      update(t) {
        if (t < start) return true;
        obj.visible = true;
        const u = Math.min(1, (t - start) / dur);
        obj.position.copy(curve.getPointAt(e(u)));
        if (opts.spin) { obj.rotation.x += opts.spin * dtG; obj.rotation.y += opts.spin * 0.7 * dtG; }
        if (opts.shrinkEnd && u > 0.8) obj.scale.setScalar(Math.max(0.001, (1 - u) / 0.2));
        if (u >= 1) {
          const keep = opts.keep;
          if (!keep) disposeObj(obj);
          if (opts.onDone) opts.onDone(obj);
          return false;
        }
        return true;
      },
    });
  }
  function emit(parent, kind, from, to, dur = 2.2, delay = 0, tint = null, caption = null) {
    const info = OUT[kind];
    const color = tint || C[info.c];
    const g = new THREE.Group();
    const gl = glow(color, 1.5); g.add(gl);
    const lb = textSprite(caption || info.label, color, 0.62); lb.position.y = 0.72; g.add(lb);
    const core = new THREE.Mesh(atomGeo, atomMat(color)); core.scale.setScalar(0.16); g.add(core);
    g.position.copy(from); g.visible = !delay; parent.add(g);
    const start = now + delay;
    agents.push({
      obj: g,
      update(t) {
        if (t < start) return true;
        g.visible = true;
        const u = Math.min(1, (t - start) / dur);
        g.position.lerpVectors(from, to, ease.out(u));
        const op = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
        gl.material.opacity = op; lb.material.opacity = op; core.scale.setScalar(0.16 * Math.max(op, 0.001));
        if (u >= 1) { disposeObj(g); return false; }
        return true;
      },
    });
  }
  function every(fn, obj = null) { agents.push({ obj, update: fn }); }

  const labelsEl = $('#labels');
  const labels = [];
  function addLabel(text, color, parent, anchor, stages, opts = {}) {
    const el = document.createElement(opts.onClick ? 'button' : 'div');
    el.className = 'lbl' + (opts.onClick ? ' click' : '');
    if (opts.onClick) { el.type = 'button'; el.addEventListener('click', opts.onClick); }
    el.style.setProperty('--c', `var(--${color})`);
    el.innerHTML = `<i></i><span>${text}</span>`;
    el.hidden = true;
    labelsEl.appendChild(el);
    const l = { el, parent, anchor: anchor.clone(), stages, node: opts.node, org: opts.org };
    labels.push(l); return l;
  }

  /* ---------- groups, camera poses and tweening ---------- */
  let currentGroup = null;
  function setGroup(g) {
    currentGroup = g;
    Object.entries(GROUPS).forEach(([k, grp]) => { grp.visible = k === g; });
    scene.fog.density = FOG[g];
  }
  function fitPose(pose) {
    const a = camera.aspect;
    const off = pose.pos.clone().sub(pose.target);
    const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const need = pose.w ? pose.w / (tanH * Math.min(a, 1.6)) : 0;
    const len = Math.max(off.length(), need);
    return { pos: pose.target.clone().add(off.setLength(len)), target: pose.target.clone() };
  }
  let tween = null;
  function tweenTo(pose, dur = 1.5) {
    if (reduceMotion || dur <= 0) { camera.position.copy(pose.pos); controls.target.copy(pose.target); tween = null; return; }
    tween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pose.pos.clone(), t1: pose.target.clone(), start: now, dur };
  }
  controls.addEventListener('start', () => { tween = null; controls.autoRotate = false; });

  let fadeTimer = null, started = false;
  const fadeEl = $('#fade');
  function goStage(id, instant) {
    const pose = POSES[id];
    const fp = fitPose(pose);
    clearTimeout(fadeTimer);
    controls.autoRotate = !!pose.auto && !reduceMotion;
    if (pose.group !== currentGroup) {
      if (instant) { fadeEl.classList.remove('on'); setGroup(pose.group); tweenTo(fp, 0); return; }
      const deeper = DEPTH[pose.group] > DEPTH[currentGroup];
      $('#fadeTxt').textContent = FADE_TEXT[pose.group] || (deeper ? 'Zooming in' : 'Zooming out');
      fadeEl.classList.add('on');
      fadeTimer = setTimeout(() => {
        setGroup(pose.group);
        const back = fp.target.clone().add(fp.pos.clone().sub(fp.target).multiplyScalar(deeper ? 1.9 : 0.55));
        camera.position.copy(back); controls.target.copy(fp.target);
        tweenTo(fp, 1.6);
        fadeEl.classList.remove('on');
      }, reduceMotion ? 0 : 340);
    } else { fadeEl.classList.remove('on'); tweenTo(fp, instant ? 0 : 1.5); }
  }
  $('#resetView').addEventListener('click', () => {
    if (!stageId) return;
    const b = B[stageId];
    if (b && b.reset) b.reset(); else goStage(stageId);
  });

  function leaveStage() {
    if (stageId && B[stageId] && B[stageId].exit) B[stageId].exit();
    clearAgents();
    labels.forEach(l => { l.el.classList.remove('on'); l.el.hidden = true; });
    stageId = null;
  }
  function enterStage(id) {
    leaveStage();
    stageId = id;
    goStage(id, !started);
    if (B[id] && B[id].enter) B[id].enter();
    started = true;
  }
  function rest() { leaveStage(); started = false; }

  /* ---------- resize ---------- */
  function resize() {
    const r = stageEl.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stageEl);
  resize();

  /* ---------- frame loop ---------- */
  const scaleTxt = $('#scaleTxt'), scaleBar = $('#scaleBar');
  const clock = new THREE.Clock();
  const tmp = new V3();
  let lastScaleUpdate = 0;
  function isIn(obj, root) { let o = obj; while (o) { if (o === root) return true; o = o.parent; } return false; }
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, clock.getDelta());
    dtG = dt; now += dt;
    if (!stageId || !currentGroup) return;

    if (tween) {
      const u = Math.min(1, (now - tween.start) / tween.dur), e = ease.inOut(u);
      camera.position.lerpVectors(tween.p0, tween.p1, e);
      controls.target.lerpVectors(tween.t0, tween.t1, e);
      if (u >= 1) tween = null;
    }
    controls.update();
    ambients.forEach(fn => fn(dt));

    const b = B[stageId];
    if (b && b.tick) b.tick(now, dt);
    const list = agents; agents = [];
    for (const a of list) if (a.update(now)) agents.push(a);

    renderer.render(scene, camera);

    // labels
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const fading = fadeEl.classList.contains('on');
    for (const l of labels) {
      const show = !fading && l.stages.includes(stageId) && l.parent.visible !== false && isIn(l.parent, GROUPS[currentGroup]);
      if (!show) { if (!l.el.hidden) l.el.hidden = true; continue; }
      tmp.copy(l.anchor).applyMatrix4(l.parent.matrixWorld).project(camera);
      if (tmp.z > 1 || tmp.x < -1.2 || tmp.x > 1.2 || tmp.y < -1.2 || tmp.y > 1.2) { l.el.hidden = true; continue; }
      l.el.hidden = false;
      l.el.style.transform = `translate(${((tmp.x + 1) / 2 * w).toFixed(1)}px, ${((1 - tmp.y) / 2 * h).toFixed(1)}px) translate(-50%, -50%)`;
    }

    // scale bar (hidden for diagram-like stages that have no single true scale)
    if (now - lastScaleUpdate > 0.1) {
      lastScaleUpdate = now;
      const unit = UNITS_PER_NM[currentGroup];
      $('.scale').hidden = !unit;
      if (!unit) return;
      const dist = camera.position.distanceTo(controls.target);
      const pxPerNm = (h / 2) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist) * unit;
      const want = 90 / pxPerNm;
      const pow = Math.pow(10, Math.floor(Math.log10(want)));
      const nice = [1, 2, 5, 10].map(v => v * pow).reduce((bst, v) => Math.abs(v * pxPerNm - 90) < Math.abs(bst * pxPerNm - 90) ? v : bst);
      scaleBar.style.width = (nice * pxPerNm).toFixed(0) + 'px';
      scaleTxt.textContent = nice >= 1000 ? `${+(nice / 1000).toPrecision(3)} µm` : `${+nice.toPrecision(3)} nm`;
    }
  }
  requestAnimationFrame(frame);

  return {
    scene, camera, controls, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, layout, molecule, disposeObj,
    clearAgents, travel, emit, every, addLabel, labels, fitPose, tweenTo, goStage, enterStage, rest,
    get group() { return currentGroup; },
  };
}

/* ---------- loading a module the first time it is opened ---------- */
const loading = {};
const threeAddons='https://cdn.jsdelivr.net/npm/three@0.147.0/examples/jsm/';
const avatarBase='https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/';
const anatomyFiles=new Map();
let anatomyLoader;
function anatomyFile(url) {
  anatomyLoader ||= Promise.all([
    import(threeAddons+'loaders/GLTFLoader.js'),
    import(threeAddons+'libs/meshopt_decoder.module.js'),
  ]).then(([{GLTFLoader},{MeshoptDecoder}])=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder));
  if (!anatomyFiles.has(url)) anatomyFiles.set(url,anatomyLoader.then(instance=>instance.loadAsync(url)).then(file=>{
    file.scene.updateMatrixWorld(true);
    return file.scene;
  }));
  return anatomyFiles.get(url);
}
function loadAnatomyAvatar(sex) {
  return anatomyFile(avatarBase+'anatomy-'+sex+'.glb');
}

function loadModule(key) {
  if (!loading[key]) {
    loading[key] = new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = `modules/${key}.js`;
      el.onload = () => (registry[key] ? resolve(registry[key]) : reject(new Error(key + ' did not register')));
      el.onerror = () => { el.remove(); reject(new Error('could not load ' + key)); };
      document.head.appendChild(el);
    }).then((def) => {
      if (G3 && def.build) {
        const built = def.build(G3);
        Object.assign(GROUPS, built.groups); Object.assign(UNITS_PER_NM, built.unitsPerNm); Object.assign(FOG, built.fog);
        Object.assign(DEPTH, built.depth); Object.assign(FADE_TEXT, built.fadeText || {});
        Object.assign(POSES, built.poses); Object.assign(B, built.behaviors);
        if (built.ambient) ambients.push(built.ambient);
        Object.keys(built.groups).forEach(k => { GROUPS[k].visible = k === G3.group; });
      }
      return def;
    }).catch((err) => { delete loading[key]; throw err; });
  }
  return loading[key];
}

/* ---------- panel and routing ---------- */
let chapters = [], moduleKey = null, chapterIndex = -1, routeToken = 0;

function showHome() {
  routeToken++;
  if (G3) G3.rest();
  // Coming back from a lesson puts that module's slide back on the stage; a first visit loads Energy.
  const back = moduleKey || benchKey || MANIFEST[0].key;
  moduleKey = null; chapterIndex = -1;
  $('#home').hidden = false;
  selectSlide(back, back !== benchKey);
  $('.app').inert = true;
  document.title = 'Cellular Biology';
}

function setHash(id) {
  if (location.hash.slice(1) === id) return;
  try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = id; }
}

function showChapter(i, detail) {
  if (!moduleKey || i < 0 || i >= chapters.length) return;
  chapterIndex = i;
  const ch = chapters[i], info = MANIFEST.find(x => x.key === moduleKey);
  $('.app').classList.toggle('panel-only', Boolean(ch.panelOnly));
  const rail = $('#rail');
  rail.hidden = chapters.length < 2;
  rail.innerHTML = chapters.map((c, k) => `<button type="button" data-i="${k}" class="${k === i ? 'on' : k < i ? 'done' : ''}" aria-label="Chapter ${k + 1}: ${c.short}" title="${c.short}">${k + 1}</button>`).join('');
  $('#brandEyebrow').textContent = info.eyebrow;
  $('#railName').textContent = chapters.length < 2 ? ch.where : `Chapter ${i + 1} of ${chapters.length} · ${ch.where}`;
  $('#chapter').innerHTML = `<h2>${ch.title}</h2>` + ch.html();
  const p = chapters[i - 1], n = chapters[i + 1];
  $('#prevName').textContent = p ? p.short : 'All modules';
  $('#nextName').textContent = n ? n.short : 'All modules';
  $('#legend').innerHTML = ch.legend.map(([c, t]) => `<span style="--c:var(--${c})"><i></i>${t}</span>`).join('');
  const openDetail = ch.details && Object.hasOwn(ch.details, detail) && ch.details[detail];
  setHash(openDetail ? ch.id + '/' + detail : ch.id);
  document.title = `${ch.short} · Cellular Biology`;
  $('#panel').scrollTop = 0;
  if (G3 && !ch.panelOnly) G3.enterStage(ch.id);
  if (openDetail) openDetail();
}

function go(route) {
  let [id, detail] = route.split('/');
  if (Object.hasOwn(ALIASES, id)) id = ALIASES[id];
  const info = moduleFor(id);
  if (!info) { showHome(); return; }
  const token = ++routeToken;
  $('#home').hidden = true;
  $('.app').inert = false;
  if (moduleKey !== info.key) {
    if (G3) G3.rest();
    moduleKey = null; chapters = []; chapterIndex = -1;
    $('#rail').inert = true;
    $('#prevBtn').disabled = $('#nextBtn').disabled = true;
    $('#chapter').innerHTML = '<p class="muted">Loading…</p>';
  }
  loadModule(info.key).then((def) => {
    if (token !== routeToken) return;
    moduleKey = info.key; chapters = def.chapters;
    const i = chapters.findIndex(c => c.id === id);
    $('#rail').inert = false;
    $('#prevBtn').disabled = $('#nextBtn').disabled = false;
    showChapter(i >= 0 ? i : 0, detail);
  }).catch((err) => {
    console.error(err);
    if (token === routeToken) $('#chapter').innerHTML = '<p>This module could not be loaded. Check your connection, then reload the page.</p>';
  });
}
function goHome() { setHash('home'); showHome(); }

/* ---------- microscope bench: glass slide trays and the stage ---------- */
// Specimen motifs drawn on a 100×100 grid: .f is a stained fill, .d a solid dot, everything else a stroke.
const MOTIFS = {
  energy: '<ellipse class="f" cx="50" cy="50" rx="40" ry="21"/><ellipse cx="50" cy="50" rx="33" ry="14"/><path d="M20 50c3-10 6-10 7 0s5 10 7 0 5-10 7 0 5 10 7 0 5-10 7 0 5 10 7 0 5-10 7 0 4 10 6 0"/><circle class="d" cx="30" cy="40" r="1.8"/><circle class="d" cx="66" cy="60" r="1.8"/><circle class="d" cx="74" cy="42" r="1.4"/>',
  protein: '<ellipse class="f" cx="22" cy="64" rx="13" ry="9"/><ellipse class="f" cx="22" cy="54" rx="9" ry="6"/><path d="M34 58c6-22 12 22 18 0s12 22 18 0 10 18 16-2"/><circle class="d" cx="86" cy="56" r="3"/><circle class="d" cx="78" cy="48" r="2.4"/><circle class="d" cx="70" cy="46" r="2"/><path d="M60 28c8-6 16-6 24 2"/><circle class="d" cx="60" cy="28" r="2"/>',
  cleanup: '<circle class="f" cx="46" cy="54" r="25"/><circle class="d" cx="38" cy="46" r="3"/><circle class="d" cx="52" cy="62" r="2.4"/><circle class="d" cx="56" cy="44" r="2"/><circle class="d" cx="40" cy="64" r="1.8"/><circle class="f" cx="82" cy="26" r="8"/><circle class="f" cx="18" cy="22" r="6"/><path d="M75 31l-7 6M23 27l5 6"/>',
  transport: '<path d="M6 36h36M58 36h36M6 64h36M58 64h36"/><path class="f" d="M43 30h14v40H43z"/><path d="M50 12v76M44 80l6 8 6-8"/><g class="dots"><circle class="d" cx="10" cy="40" r="2"/><circle class="d" cx="20" cy="40" r="2"/><circle class="d" cx="30" cy="40" r="2"/><circle class="d" cx="70" cy="40" r="2"/><circle class="d" cx="80" cy="40" r="2"/><circle class="d" cx="90" cy="40" r="2"/><circle class="d" cx="10" cy="60" r="2"/><circle class="d" cx="20" cy="60" r="2"/><circle class="d" cx="30" cy="60" r="2"/><circle class="d" cx="70" cy="60" r="2"/><circle class="d" cx="80" cy="60" r="2"/><circle class="d" cx="90" cy="60" r="2"/></g>',
  division: '<ellipse class="f" cx="50" cy="50" rx="42" ry="27"/><path d="M12 50l24-14M12 50l24 0M12 50l24 14M88 50L64 36M88 50H64M88 50L64 64" opacity=".55"/><path class="thick" d="M34 32l4 6-4 6M34 46l4 6-4 6M38 60l-4 6M66 32l-4 6 4 6M66 46l-4 6 4 6M62 60l4 6"/><circle class="d" cx="12" cy="50" r="2.6"/><circle class="d" cx="88" cy="50" r="2.6"/>',
  neural: '<circle class="f" cx="34" cy="50" r="11"/><circle class="d" cx="34" cy="50" r="4"/><path d="M26 42L12 28M18 34l-8 2M28 60L14 76M20 68l-10-2M32 39L28 18M30 28l-8-6M42 42l6-16"/><path d="M45 52c10 0 14 2 46 4"/><rect class="f" x="52" y="49" width="10" height="7" rx="3.5"/><rect class="f" x="66" y="50" width="10" height="7" rx="3.5"/><rect class="f" x="80" y="51" width="8" height="7" rx="3.5"/>',
  muscle: '<rect class="f" x="8" y="26" width="84" height="48" rx="10"/><path d="M14 26v48M50 26v48M86 26v48" class="thick"/><path d="M20 36h12M20 46h12M20 56h12M20 66h12M68 36h12M68 46h12M68 56h12M68 66h12" opacity=".6"/><path d="M28 41h16M28 51h16M28 61h16M56 41h16M56 51h16M56 61h16" class="thick"/>',
  blood: '<circle class="f" cx="30" cy="34" r="15"/><circle cx="30" cy="34" r="6" opacity=".5"/><circle class="f" cx="66" cy="28" r="14"/><circle cx="66" cy="28" r="5.5" opacity=".5"/><circle class="f" cx="68" cy="70" r="15"/><circle cx="68" cy="70" r="6" opacity=".5"/><circle cx="28" cy="72" r="13" opacity=".8"/><path class="thick" d="M21 72c2-6 7-6 8 0s6 6 7 0" /><circle class="d" cx="48" cy="52" r="2"/><circle class="d" cx="86" cy="48" r="1.6"/><circle class="d" cx="50" cy="86" r="1.6"/>',
  hormones: '<circle class="f" cx="50" cy="50" r="38" opacity=".7"/><circle cx="38" cy="38" r="8"/><circle cx="56" cy="34" r="8"/><circle cx="66" cy="50" r="8"/><circle cx="56" cy="66" r="8"/><circle cx="38" cy="64" r="8"/><circle cx="30" cy="50" r="7"/><circle cx="48" cy="50" r="7"/><circle class="d" cx="38" cy="38" r="2"/><circle class="d" cx="56" cy="34" r="2"/><circle class="d" cx="66" cy="50" r="2"/><circle class="d" cx="48" cy="50" r="2"/><circle class="d" cx="56" cy="66" r="2"/>',
  nephron: '<path d="M44 16a26 26 0 1 0 6 51"/><circle class="f" cx="38" cy="38" r="9"/><circle class="f" cx="30" cy="48" r="8"/><circle class="f" cx="44" cy="50" r="9"/><circle class="f" cx="36" cy="58" r="7"/><path d="M50 67c14 0 10-14 22-14s8 18 16 18M88 71v18M80 89V74"/><path d="M18 30l-8-10M24 22L16 10" opacity=".6"/>',
  reproduction: '<circle cx="44" cy="56" r="32" stroke-dasharray="3 3"/><circle class="f" cx="44" cy="56" r="26"/><circle class="d" cx="38" cy="50" r="5"/><ellipse class="f" cx="83" cy="18" rx="6" ry="4.4" transform="rotate(35 83 18)"/><path d="M78 14c-4-4-4 4-8 0s-4 4-8 0"/>',
};
const SLIDE_PREP = {
  energy: 'Mitochondrial fluorescence', protein: 'Anti-insulin immunostain', cleanup: 'Lysosome fluorescence',
  transport: 'Membrane dye', division: 'DNA stain, anaphase', neural: 'Golgi silver stain', muscle: 'Striated muscle, H&E',
  blood: 'Wright–Giemsa smear', hormones: 'Islet immunostain', nephron: 'PAS, kidney cortex', reproduction: 'Phase contrast',
};
// Blood is one chapter with a card per cell; the cards that have their own routes get deep links.
const SLIDE_LINKS = { blood: { 'Red cell': 'blood/rbc', Platelets: 'blood/plt' } };
const TRAYS = [
  { id: 'mechanisms', name: 'Cell mechanisms', tag: 'CM', note: 'What happens inside one cell', from: 0, to: 5 },
  { id: 'tissues', name: 'Cells in tissues', tag: 'CT', note: 'Specialized cells and the systems they build', from: 5, to: MANIFEST.length },
];
const OBJECTIVES = { 4: 0.66, 10: 1, 40: 1.85 };
let benchKey = null;

const trayOf = (i) => TRAYS.find(t => i >= t.from && i < t.to);
const slideNo = (i) => { const t = trayOf(i); return t.tag + '-' + String(i - t.from + 1).padStart(2, '0'); };
const slideCount = (x) => (x.ids.length > 1 ? x.ids.length + ' ch' : x.names.length + ' cells');
const motif = (key, cls) => `<svg class="motif ${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${MOTIFS[key] || ''}</svg>`;
const setAttr = (el, name, value) => { if (el && el.setAttribute) el.setAttribute(name, value); };

function slideMarkup(x, i, onStage) {
  const inner = `<span class="slide-label"><span class="slide-no">${slideNo(i)}</span><span class="slide-name">${x.name}</span><span class="slide-ch">${slideCount(x)}</span></span>
      <span class="slide-glass"><span class="coverslip">${motif(x.key, 'mini')}</span></span>`;
  if (onStage) return `<div class="slide on-stage" style="--c:var(--${x.c})">${inner}</div>`;
  return `<button type="button" class="slide" data-key="${x.key}" style="--c:var(--${x.c})" aria-pressed="false" title="${x.title}">${inner}</button>`;
}

// The eyepiece field: deterministic debris so each slide looks like its own preparation, plus the specimen.
function fieldMarkup(x, i) {
  const r = mulberry32(9001 + i * 131);
  let debris = '';
  for (let k = 0; k < 26; k++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 92;
    debris += `<circle cx="${(100 + Math.cos(a) * d).toFixed(1)}" cy="${(100 + Math.sin(a) * d).toFixed(1)}" r="${(0.6 + r() * 2.2).toFixed(1)}" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`;
  }
  return `<svg class="field-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><g class="debris">${debris}</g>
    <g class="motif field-motif" transform="translate(30 30) scale(1.4)">${MOTIFS[x.key] || ''}</g></svg>`;
}

function renderBench() {
  $('#slideTrays').innerHTML = TRAYS.map(t => `
    <section class="tray" aria-labelledby="tray-${t.id}">
      <header class="tray-head"><h2 id="tray-${t.id}">${t.name}</h2><span>${t.note} · ${t.to - t.from} slides</span></header>
      <div class="tray-rack" role="group" aria-label="${t.name} slides">
        ${MANIFEST.slice(t.from, t.to).map((x, k) => slideMarkup(x, t.from + k, false)).join('')}${'<span class="slot-empty" aria-hidden="true"></span>'.repeat(Math.max(0, 6 - (t.to - t.from)))}
      </div>
    </section>`).join('');
}

function selectSlide(key, animate = true) {
  const x = MANIFEST.find(m => m.key === key) || MANIFEST[0];
  const i = MANIFEST.indexOf(x), tray = trayOf(i);
  benchKey = x.key;
  $('#bench').style.setProperty('--c', `var(--${x.c})`);
  $('#scopeSpecimen').innerHTML = fieldMarkup(x, i);
  setAttr($('#scopeView'), 'aria-label', `${x.name} specimen under the microscope: ${SLIDE_PREP[x.key]}`);
  $('#stageSlot').innerHTML = slideMarkup(x, i, true);
  $('#scopeEyebrow').textContent = `Slide ${slideNo(i)} on the stage · ${x.eyebrow}`;
  $('#scopeTitle').textContent = x.name;
  $('#scopeSub').textContent = x.title;
  $('#scopeBlurb').textContent = x.blurb;
  $('#scopeCount').textContent = x.ids.length > 1 ? String(x.ids.length) : `1 · ${x.names.length} cells`;
  $('#scopeStain').textContent = SLIDE_PREP[x.key];
  $('#scopeTray').textContent = tray.name;
  const links = SLIDE_LINKS[x.key] || {};
  $('#scopeChapters').innerHTML = x.names.map((n, k) => {
    const route = x.ids.length > 1 ? x.ids[k] : (links[n] || x.ids[0]);
    return `<li><a href="#${route}"><span>${String(k + 1).padStart(2, '0')}</span>${n}</a></li>`;
  }).join('');
  $('#scopeOpen').href = '#' + x.ids[0];
  document.querySelectorAll('.slide[data-key]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.key === x.key)));
  if (animate && !reduceMotion) {
    ['#stageSlot', '#scopeView'].forEach(s => { const el = $(s); el.classList.toggle('loading', false); void el.offsetWidth; el.classList.toggle('loading', true); });
  }
}

function launchSlide(key) {
  const x = MANIFEST.find(m => m.key === key);
  if (x) location.hash = x.ids[0];
}

function setObjective(mag) {
  if (!OBJECTIVES[mag]) return;
  $('#scope').style.setProperty('--zoom', OBJECTIVES[mag]);
  $('#scopeMag').textContent = `${mag}× objective · ${mag * 10}× total`;
  document.querySelectorAll('.obj').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mag === String(mag))));
}

function initBench() {
  renderBench();
  const trays = $('#slideTrays');
  trays.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.slide[data-key]');
    if (!b) return;
    // Enter or Space on the slide that is already loaded opens it; a mouse click only loads it.
    if (e.detail === 0 && b.dataset.key === benchKey) { launchSlide(benchKey); return; }
    selectSlide(b.dataset.key);
    // A slide picked from further down the page: bring the stage back into view to watch it load.
    const bench = $('#bench');
    if (e.detail > 0 && bench.getBoundingClientRect().top < -40) bench.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  trays.addEventListener('dblclick', (e) => {
    const b = e.target.closest && e.target.closest('.slide[data-key]');
    if (b) launchSlide(b.dataset.key);
  });
  trays.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const all = Array.from(document.querySelectorAll('.slide[data-key]'));
    const at = all.indexOf(document.activeElement);
    if (at < 0) return;
    let to = null;
    if (step) to = (at + step + all.length) % all.length;
    if (e.key === 'Home') to = 0;
    if (e.key === 'End') to = all.length - 1;
    if (to === null) return;
    e.preventDefault();
    all[to].focus();
    selectSlide(all[to].dataset.key);
  });
  $('#scope').addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.obj');
    if (b) setObjective(+b.dataset.mag);
  });
  setObjective(10);
}

function startCellCity() {
  initBench();
  $('#rail').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) showChapter(+b.dataset.i); });
  $('#prevBtn').addEventListener('click', () => (chapterIndex > 0 ? showChapter(chapterIndex - 1) : goHome()));
  $('#nextBtn').addEventListener('click', () => (chapterIndex < chapters.length - 1 ? showChapter(chapterIndex + 1) : goHome()));
  $('#backHome').addEventListener('click', (e) => { e.preventDefault(); goHome(); });
  addEventListener('keydown', (e) => {
    if (!moduleKey || (e.target.closest && e.target.closest('input, textarea, select'))) return;
    if (e.key === 'ArrowRight' && !e.altKey) showChapter(chapterIndex + 1);
    if (e.key === 'ArrowLeft' && !e.altKey) showChapter(chapterIndex - 1);
  });
  addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    go(id);
  });
  try {
    if (!window.THREE?.OrbitControls) throw new Error('3D controls unavailable');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    G3 = initWorld();
  } catch (err) {
    console.warn('3D viewer unavailable', err);
    renderer?.dispose();
    const notice = document.createElement('div');
    notice.className = 'nogl';
    notice.textContent = 'The 3D view is unavailable. You can still explore the chapters and activities.';
    stageEl.appendChild(notice);
    $('#resetView').disabled = true;
  }
  go(location.hash.slice(1));
}
startCellCity();
