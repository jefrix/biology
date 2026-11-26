/* Blood–brain barrier: the neurovascular unit, selective entry and P-glycoprotein efflux, and barrier breakdown on contrast MRI.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osCns: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/13-3-circulation-and-the-central-nervous-system', 'OpenStax Anatomy &amp; Physiology 2e, 13.3 Circulation and the Central Nervous System'),
  abbott: link('https://doi.org/10.1016/j.nbd.2009.07.030', 'Abbott et al., structure and function of the blood–brain barrier (Neurobiol Dis, 2010)'),
  daneman: link('https://doi.org/10.1101/cshperspect.a020412', 'Daneman &amp; Prat, the blood–brain barrier (Cold Spring Harb Perspect Biol, 2015)'),
  loscher: link('https://doi.org/10.1038/nrn1728', 'Löscher &amp; Potschka, drug efflux transporters in brain disease (Nat Rev Neurosci, 2005)'),
};
const LAYER = {
  endo: 'Endothelium: brain capillary cells have no pores (non-fenestrated), make very few transport vesicles, and are stitched together by tight junctions of claudin-5 and occludin, so even small ions cannot slip between them.',
  peri: 'Plus pericytes: these cells share the basement membrane with the endothelium, wrap the capillary, and signal to keep the tight junctions sealed and the vesicle traffic low. They also help regulate capillary blood flow.',
  astro: 'Plus astrocyte endfeet: astrocyte processes cover nearly the whole capillary surface. They induce and maintain barrier properties, move water through aquaporin-4 channels, and link neuronal activity to local blood flow.',
};
const PGP = {
  on: 'P-glycoprotein working: oxygen, carbon dioxide and small fat-soluble molecules diffuse straight through. Glucose rides GLUT1. Water-soluble molecules are stopped by the tight junction, and many fat-soluble drugs that slip into the cell are pumped back into the blood by P-glycoprotein.',
  off: 'P-glycoprotein blocked: the same fat-soluble drug now crosses into the brain. Drug interactions and pump variants can change brain exposure this way. Loperamide, an opioid antidiarrheal, normally stays out of the brain because of this pump.',
};
const STATE = {
  intact: 'Intact barrier: gadolinium contrast is a small, water-soluble chelate that cannot cross sealed brain capillaries, so normal brain does not brighten on T1-weighted MRI after contrast. Only vessels, dural sinuses and areas without a barrier, such as the pituitary and choroid plexus, enhance.',
  stroke: 'Stroke: ischemia damages the endothelium and its tight junctions. In the subacute phase, days to weeks after onset, gadolinium leaks into the injured cortex, giving ribbon-like (gyriform) enhancement.',
  tumor: 'Tumor: high-grade gliomas and metastases build leaky new vessels without a proper barrier. Contrast pools in the viable tumor, often as a ring around a dark necrotic center.',
  ms: 'Active MS plaque: inflammatory cells crossing the vessel wall open the barrier. New plaques enhance for a few weeks, often as nodules or incomplete rings, so enhancement marks current disease activity.',
};
whenLesson('bbb-layer', v => setCaption('bbbLayerCaption', LAYER[v]));
whenLesson('bbb-pgp', v => setCaption('bbbPgpCaption', PGP[v]));
whenLesson('bbb-state', v => setCaption('bbbStateCaption', STATE[v]));

const CHAPTERS = [
  {
    id: 'bbb-unit', short: 'Neurovascular unit', where: 'A brain capillary and its neighbors',
    title: 'Building the neurovascular unit',
    legend: [['membrane', 'Endothelial cells'], ['bbb', 'Tight junctions'], ['electron', 'Basement membrane'], ['plt', 'Pericyte'], ['astro', 'Astrocyte and endfeet'], ['dendrite', 'Neuron']],
    html: () => `
      <p class="lede">The <b>blood–brain barrier</b> is not a separate wall. It is a property of brain capillaries, built and maintained by the cells around them, together called the <b>neurovascular unit</b>.</p>
      ${lessonSeg('bbb-layer', 'Build the unit', [['endo', 'Endothelium'], ['peri', '+ Pericytes'], ['astro', '+ Astrocyte endfeet']], 'astro')}
      ${caption('bbbLayerCaption', LAYER[LESSON['bbb-layer'] || 'astro'])}
      <ul class="facts">
        <li>Capillaries elsewhere often have pores or gaps. In the liver they are wide open sinusoids; in the kidney glomerulus they are fenestrated for filtration. Brain capillaries are the tightest in the body.</li>
        <li>Tight junctions are like the seals in a <a href="#epithelia">polarized epithelium</a>, but even tighter. Their electrical resistance is far higher than in leaky epithelia.</li>
        <li>A few small regions lack the barrier on purpose, the circumventricular organs, so the brain can sample blood, for example the area postrema, which triggers vomiting in response to toxins.</li>
      </ul>
      <p><a href="#neurons">Meet astrocytes and other glia</a> · <a href="#bbb-transport">What gets through</a> · <a href="#junc-tight">How tight junctions seal</a></p>
      ${sources([SRC.abbott, SRC.daneman, SRC.osCns], 'The capillary is drawn far wider relative to its cells than in life, where a red cell barely squeezes through. Endfeet are shown as separate patches; in the brain they tile almost the whole surface.')}`,
  },
  {
    id: 'bbb-transport', short: 'Entry & efflux', where: 'Across the capillary wall',
    title: 'What crosses, and what gets pumped back',
    legend: [['oxygen', 'O₂ and CO₂'], ['glucose', 'Glucose via GLUT1'], ['sodium', 'Water-soluble molecule'], ['drug', 'Fat-soluble drug'], ['pgp', 'P-glycoprotein'], ['bbb', 'Tight junction']],
    html: () => `
      <p class="lede">With the gaps sealed, molecules must pass <b>through</b> the endothelial cells. That leaves four routes: dissolve through the membrane, ride a carrier, be pumped back out, or be stopped.</p>
      ${lessonSeg('bbb-pgp', 'P-glycoprotein', [['on', 'Working'], ['off', 'Blocked']])}
      ${caption('bbbPgpCaption', PGP[LESSON['bbb-pgp']])}
      <ul class="facts">
        <li><b>Diffusion</b>: small, fat-soluble molecules, such as oxygen, carbon dioxide, alcohol and many anesthetics, cross easily. Size and charge matter: most drugs above about 400 to 500 daltons, or with many hydrogen bonds, cross poorly.</li>
        <li><b>Carriers</b>: GLUT1 supplies glucose, the brain’s main fuel. In GLUT1 deficiency syndrome, too little glucose crosses and children have seizures, treated with a ketogenic diet because ketones use a different carrier. The large neutral amino acid carrier LAT1 lets levodopa in, which is why Parkinson disease is treated with levodopa rather than dopamine.</li>
        <li><b>Efflux pumps</b>: P-glycoprotein (ABCB1) and other ABC transporters on the blood-facing membrane use ATP to push many drugs back out, a major hurdle for brain drug delivery and a cause of drug resistance.</li>
      </ul>
      <p><a href="#channels">Channels and carriers in general</a> · <a href="#bbb-mri">When the barrier breaks</a></p>
      ${sources([SRC.loscher, SRC.abbott, SRC.daneman], 'The wall is drawn as two blocks with one tight junction. Real capillary endothelium is thinner than a micrometer and has many transporter types on both faces. Particle paths are idealized.')}`,
  },
  {
    id: 'bbb-mri', short: 'Breakdown on MRI', where: 'Capillary and contrast-enhanced MRI (schematic)',
    title: 'Barrier breakdown lights up on MRI',
    legend: [['gad', 'Gadolinium contrast'], ['membrane', 'Endothelium'], ['bbb', 'Tight junctions'], ['astro', 'Brain tissue']],
    html: () => `
      <p class="lede">Gadolinium contrast agents shorten T1 relaxation and make tissue bright on T1-weighted MRI, but only where they reach it. A leak into brain tissue therefore maps where the barrier has failed.</p>
      ${lessonSeg('bbb-state', 'Barrier', [['intact', 'Intact'], ['stroke', 'Stroke'], ['tumor', 'Tumor'], ['ms', 'Active MS']])}
      ${caption('bbbStateCaption', STATE[LESSON['bbb-state']])}
      <ul class="facts">
        <li>Enhancement reflects leakiness, not cell type, so a ring can be tumor, abscess or demyelination. Diffusion, perfusion and spectroscopy sequences help tell them apart.</li>
        <li>Steroids such as dexamethasone tighten leaky tumor vessels, reduce swelling and also reduce enhancement, which can make a tumor look smaller on the next scan.</li>
        <li>Dose and agent choice are weighed in severe kidney disease, and macrocyclic agents are generally preferred.</li>
      </ul>
      <p><a href="#brain">Stroke and MS imaging in the neural module</a> · <a href="#cancer-spread">Why tumor vessels leak</a> · <a href="#bbb-unit">Review the intact barrier</a></p>
      ${sources([SRC.abbott, SRC.daneman, SRC.osCns], 'The MRI panel is a drawn illustration, not a patient image, and enhancement timing varies with the disease and the patient. Contrast molecules are enlarged to be visible. For learning, not diagnosis.')}`,
  },
];

CellCity.register('bbb', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, panel, V } = k;
    const { behaviors } = k.out;
    function capillary(parent, len, r) {        // two endothelial half-shells with tight-junction seams at z = ±r
      const out = { cells: [], seams: [] };
      [0, Math.PI].forEach(t0 => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 40, 1, true, t0, Math.PI), ghost(C('membrane'), 0.35)); m.rotation.z = Math.PI / 2; parent.add(m); out.cells.push(m); });
      [1, -1].forEach(s => out.seams.push(rod(parent, std(C('bbb'), { emissiveIntensity: 0.6 }), V(-len / 2, 0, s * r), V(len / 2, 0, s * r), 0.1)));
      return out;
    }
    function rbcs(parent, n, len, yz) { return Array.from({ length: n }, (_, i) => { const m = ball(parent, std(C('rbc'), { emissiveIntensity: 0.2 }), 0.55, V(-len / 2 + i * len / n, rr(-yz, yz), rr(-yz, yz))); m.scale.set(0.55, 0.55, 0.22); return m; }); }

    /* ================= Neurovascular unit ================= */
    {
      const id = 'bbb-unit', root = new THREE.Group();
      add(id, root, { target: V(0, 2.5, 0), pos: V(6, 8, 28), w: 15 }, { fade: 'Into a brain capillary' });
      const endo = new THREE.Group(), peri = new THREE.Group(), astro = new THREE.Group(); root.add(endo); root.add(peri); root.add(astro);
      capillary(endo, 16, 2);
      const flow = rbcs(endo, 7, 15, 0.9);
      ball(endo, std(C('nucleus'), { emissiveIntensity: 0.25 }), 0.6, V(-3, 2, 0)).scale.set(1, 0.3, 0.6);
      const bm = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.25, 16, 40, 1, true), ghost(C('electron'), 0.14)); bm.rotation.z = Math.PI / 2; peri.add(bm);
      const pc = body(peri, C('plt'), [1.6, 0.5, 1], V(-1, 2.6, 0.4), 0.5);
      const pMat = std(C('plt'), { emissiveIntensity: 0.35 });
      [-2.6, -1, 0.6].forEach(x => { const t = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.13, 8, 40, Math.PI * 1.3), pMat); t.rotation.y = Math.PI / 2; t.rotation.x = -0.3; t.position.x = x; peri.add(t); });
      const aMat = std(C('astro'), { emissiveIntensity: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
      const feet = [];
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
        if ((i + j) % 3 === 2) continue;
        const f = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 2.6, 20, 1, true, j * Math.PI / 2 + 0.1, 1.35), aMat);
        f.rotation.z = Math.PI / 2; f.position.x = -6 + i * 3; astro.add(f); feet.push(f);
      }
      const aBody = body(astro, C('astro'), 1.3, V(2, 8, -1), 0.45);
      const procMat = std(C('astro'), { emissiveIntensity: 0.3 });
      [[-6, 2.4, 0.8], [-3, 2.5, -0.6], [0, 2.6, 0.5], [3, 2.5, -0.8], [6, 2.4, 0.4]].forEach(p => tube(astro, procMat, [V(2, 8, -1), V((2 + p[0]) / 2, 5.6, (p[2] - 1) / 2), V(...p)], 0.16));
      const neuron = new THREE.Group(); root.add(neuron);
      body(neuron, C('dendrite'), 1, V(-7, 7.5, 1.5), 0.45);
      tube(neuron, std(C('dendrite'), { emissiveIntensity: 0.3 }), [V(-7, 7.5, 1.5), V(-4, 8.6, 0), V(0, 9.4, -0.5), V(4, 9.8, -1)], 0.14);
      tube(neuron, std(C('dendrite'), { emissiveIntensity: 0.3 }), [V(-7, 7.5, 1.5), V(-3.6, 6.4, 0.2), V(1.6, 7.6, -0.8)], 0.08);
      lbl('Endothelial cell', 'membrane', endo, V(-6, -2.6, 1), id);
      lbl('Tight junction · claudin-5', 'bbb', endo, V(4, 0, 2.3), id);
      lbl('Red blood cells', 'rbc', endo, V(6.5, -1.2, 0), id);
      lbl('Basement membrane', 'electron', peri, V(-7.5, -2.4, -1), id);
      lbl('Pericyte', 'plt', peri, V(-1, 3.5, 1), id);
      lbl('Astrocyte', 'astro', astro, V(2, 9.6, -1), id);
      lbl('Endfeet', 'astro', astro, V(5.5, -2.9, 0), id);
      lbl('Neuron', 'dendrite', neuron, V(-7, 9, 1.5), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['bbb-layer'] || 'astro';
        peri.visible = v !== 'endo'; astro.visible = neuron.visible = v === 'astro';
        el += reduceMotion ? 0 : dt;
        flow.forEach(f => { if (!reduceMotion) { f.position.x += dt * 2.4; if (f.position.x > 7.5) f.position.x = -7.5; f.rotation.x += dt; } });
        aBody.scale.setScalar(1.3 + 0.06 * Math.sin(el * 1.4));
        void pc;
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Entry and efflux ================= */
    {
      const id = 'bbb-transport', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 6, 28), w: 15 }, { fade: 'Across the capillary wall' });
      const cellMat = ghost(C('membrane'), 0.3);
      [-4.15, 4.15].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.4, 6), cellMat); b.position.x = x; root.add(b); const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: C('membrane') })); e.position.x = x; root.add(e); });
      for (let z = -2.6; z <= 2.6; z += 0.65) rod(root, std(C('bbb'), { emissiveIntensity: 0.6 }), V(0, -1, z), V(0, 1, z), 0.09);
      const glut = std(C('glucose'), { emissiveIntensity: 0.45 }), pgpM = std(C('pgp'), { emissiveIntensity: 0.5 });
      [1.2, -1.2].forEach(y => rod(root, glut, V(-5, y - 0.35, 0), V(-5, y + 0.35, 0), 0.45));
      const pgp = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.9, 16), pgpM); pgp.position.set(4.5, 1.2, 0); root.add(pgp);
      const blood = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), ghost(C('rbc'), 0.08)); blood.rotation.x = -Math.PI / 2; blood.position.y = 4; root.add(blood);
      const brain = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), ghost(C('astro'), 0.08)); brain.rotation.x = -Math.PI / 2; brain.position.y = -4; root.add(brain);
      const o2 = stream(root, std(C('oxygen'), { emissiveIntensity: 0.6 }), 0.17, curve([V(-8, 4, 1.5), V(-7.6, 0, 1.6), V(-7.2, -4, 1.5)]), 5, 0.35, C('oxygen'));
      const o2b = stream(root, std(C('oxygen'), { emissiveIntensity: 0.6 }), 0.17, curve([V(7.5, 4, -1.8), V(7.3, 0, -1.8), V(7, -4, -1.8)]), 5, 0.3, C('oxygen'));
      const glc = stream(root, glut, 0.24, curve([V(-6, 4.4, 0), V(-5, 1.2, 0), V(-4.6, 0, 0), V(-5, -1.2, 0), V(-6, -4.4, 0)]), 5, 0.22, C('glucose'));
      const ion = stream(root, std(C('sodium'), { emissiveIntensity: 0.6 }), 0.2, curve([V(-1.2, 4.4, 1), V(-0.2, 1.4, 1), V(0, 1.15, 1), V(0.3, 1.5, 1), V(1.4, 4.4, 1)]), 4, 0.3, C('sodium'));
      const pumpBack = curve([V(2.5, 4.4, 0.6), V(3.2, 1.3, 0.4), V(3.8, 0.3, 0.2), V(4.5, 0.9, 0), V(4.5, 1.6, 0), V(5.4, 4.4, 0)]);
      const through = curve([V(2.5, 4.4, 0.6), V(3.2, 1.3, 0.4), V(3.8, 0.3, 0.2), V(4, -1.3, 0.2), V(4.5, -4.4, 0.3)]);
      const drug = stream(root, std(C('drug'), { emissiveIntensity: 0.6 }), 0.24, pumpBack, 5, 0.2, C('drug'));
      lbl('Blood', 'rbc', root, V(-8, 4.6, -2.5), id);
      lbl('Brain', 'astro', root, V(-8, -4.4, -2.5), id);
      lbl('Tight junction', 'bbb', root, V(0, -1.9, 3.2), id);
      lbl('GLUT1', 'glucose', root, V(-5, 2.3, 0.8), id);
      lbl('P-glycoprotein', 'pgp', pgp, V(0, 1.1, 0), id);
      lbl('O₂ · CO₂ diffuse', 'oxygen', root, V(-8.6, -1.6, 2), id);
      lbl('Stopped', 'sodium', root, V(-1.6, 2.8, 1.5), id);
      let el = 0;
      function draw(dt) {
        const off = LESSON['bbb-pgp'] === 'off';
        drug.curve = off ? through : pumpBack;
        el += reduceMotion ? 0 : dt;
        [o2, o2b, glc, ion, drug].forEach(s => s.update(dt));
        pgp.rotation.y += off ? 0 : (reduceMotion ? 0 : dt * 3);
        pgpM.emissiveIntensity = off ? 0.08 : 0.5; pgpM.color.copy(off ? C('dead') : C('pgp'));
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Barrier breakdown on MRI ================= */
    {
      const id = 'bbb-mri', root = new THREE.Group();
      add(id, root, { target: V(0.5, 0, 0), pos: V(0.5, 3, 30), w: 15.5 }, { fade: 'Contrast in a brain capillary' });
      const cap = new THREE.Group(); cap.position.set(-6, 0, 0); root.add(cap);
      const vessel = capillary(cap, 11, 1.8);
      const tissue = new THREE.Mesh(new THREE.BoxGeometry(11, 7, 6), ghost(C('astro'), 0.06)); cap.add(tissue);
      const gapMat = std(C('rbc'), { emissiveIntensity: 0.6 });
      const gaps = [-3, 0, 3].map(x => { const m = ball(cap, gapMat, 0.35, V(x, 0, 1.8)); m.visible = false; return m; });
      const gMat = std(C('gad'), { emissiveIntensity: 0.8 });
      const inside = Array.from({ length: 22 }, (_, i) => ({ m: ball(cap, gMat, 0.14), x: -5.5 + i / 22 * 11, a: rr(0, 6.28), r: rr(0, 1.2) }));
      const leaked = Array.from({ length: 50 }, (_, i) => { const a = rr(0, 6.28), r = rr(2.2, 3.6); return { m: ball(cap, gMat, 0.13, V(rr(-5, 5), Math.cos(a) * r, Math.sin(a) * r)), rank: i / 50 }; });
      const glowLeak = k.glow(C('gad'), 8); glowLeak.position.set(0, 0, 2.5); cap.add(glowLeak);
      const mri = panel(root, 10, 10, 420); mri.mesh.position.set(7, 0, 0);
      function drawMri(v) {
        mri.draw((c, w, h) => {
          c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
          const cx = w / 2, cy = h / 2 + 6;
          c.fillStyle = '#d9d9d9'; c.beginPath(); c.ellipse(cx, cy, 150, 180, 0, 0, Math.PI * 2); c.fill();          // scalp fat
          c.fillStyle = '#1a1a1a'; c.beginPath(); c.ellipse(cx, cy, 140, 170, 0, 0, Math.PI * 2); c.fill();          // skull
          c.fillStyle = '#7a7a7a'; c.beginPath(); c.ellipse(cx, cy, 130, 160, 0, 0, Math.PI * 2); c.fill();          // brain
          c.fillStyle = '#8e8e8e'; c.beginPath(); c.ellipse(cx, cy, 100, 128, 0, 0, Math.PI * 2); c.fill();          // white matter
          c.fillStyle = '#2a2a2a'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(cx + s * 22, cy, 12, 46, s * 0.15, 0, Math.PI * 2); c.fill(); });   // ventricles
          c.strokeStyle = '#f2f2f2'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx, cy - 160); c.lineTo(cx, cy - 120); c.stroke();          // sagittal sinus
          c.beginPath(); c.arc(cx, cy + 162, 6, 0, Math.PI * 2); c.fillStyle = '#f2f2f2'; c.fill();
          if (v === 'stroke') { c.strokeStyle = '#ffffff'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 30; i++) { const a = -0.2 + i / 30 * 0.9, r = 122 + 8 * Math.sin(i * 1.3); c.lineTo(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r); } c.stroke(); c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 30; i++) { const a = -0.15 + i / 30 * 0.8, r = 108 + 7 * Math.sin(i * 1.7); c.lineTo(cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r); } c.stroke(); }
          if (v === 'tumor') { c.fillStyle = '#9b9b9b'; c.beginPath(); c.ellipse(cx - 60, cy - 40, 54, 50, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffffff'; c.lineWidth = 9; c.beginPath(); c.ellipse(cx - 60, cy - 40, 30, 27, 0.3, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#3a3a3a'; c.beginPath(); c.ellipse(cx - 60, cy - 40, 24, 21, 0.3, 0, Math.PI * 2); c.fill(); }
          if (v === 'ms') { c.strokeStyle = '#ffffff'; c.fillStyle = '#ffffff'; c.lineWidth = 4; [[cx + 40, cy - 34, 1.1], [cx - 46, cy + 30, 0.8], [cx + 34, cy + 52, 0.7]].forEach(([x, y, s], i) => { c.beginPath(); if (i === 0) c.arc(x, y, 12 * s, 0.6, Math.PI * 1.7); else c.arc(x, y, 7 * s, 0, Math.PI * 2); i === 0 ? c.stroke() : c.fill(); }); }
          c.fillStyle = '#e6edf5'; c.font = '600 18px "IBM Plex Mono", monospace'; c.textAlign = 'center';
          c.fillText('T1 + gadolinium (schematic)', cx, 24);
          c.font = '15px "IBM Plex Mono", monospace'; c.fillText({ intact: 'no parenchymal enhancement', stroke: 'gyriform cortical enhancement', tumor: 'ring enhancement, dark center', ms: 'nodular and open-ring lesions' }[v], cx, h - 12);
        });
      }
      lbl('Capillary', 'membrane', cap, V(-4.5, 2.6, 0), id);
      lbl('Brain tissue', 'astro', cap, V(-4.5, -3.8, 2), id);
      const gLbl = new THREE.Group(); cap.add(gLbl); lbl('Gadolinium leaks out', 'gad', gLbl, V(2, 3.9, 2), id);
      const iLbl = new THREE.Group(); cap.add(iLbl); lbl('Gadolinium stays inside', 'gad', iLbl, V(2, -2.6, 1.5), id);
      let el = 0, cur = null, leak = 0;
      const AMOUNT = { intact: 0, stroke: 0.6, tumor: 1, ms: 0.35 };
      function draw(dt) {
        const v = LESSON['bbb-state'] || 'intact';
        if (v !== cur) { cur = v; drawMri(v); leak = reduceMotion ? AMOUNT[v] : 0; }
        el += reduceMotion ? 0 : dt;
        leak = Math.min(AMOUNT[v], leak + dt * 0.3);
        inside.forEach(p => { if (!reduceMotion) p.x += dt * 2; if (p.x > 5.5) p.x = -5.5; p.m.position.set(p.x, Math.cos(p.a + el) * p.r, Math.sin(p.a + el) * p.r); });
        leaked.forEach(p => { p.m.visible = p.rank < leak; });
        glowLeak.material.opacity = leak * 0.6; glowLeak.visible = leak > 0.02;
        gaps.forEach(m => { m.visible = AMOUNT[v] > 0; m.scale.setScalar(0.25 + 0.15 * Math.sin(el * 4)); });
        vessel.seams.forEach(s => { s.material.color.copy(C(AMOUNT[v] ? 'rbc' : 'bbb')); s.material.emissive.copy(s.material.color); });
        gLbl.visible = AMOUNT[v] > 0; iLbl.visible = !gLbl.visible;
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
