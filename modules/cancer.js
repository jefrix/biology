/* Cancer biology: oncogenes and failed checkpoints, angiogenesis and metastasis, and why tumors light up on FDG-PET.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osCancer: link('https://openstax.org/books/biology-2e/pages/10-4-cancer-and-the-cell-cycle', 'OpenStax Biology 2e, 10.4 Cancer and the Cell Cycle'),
  osControl: link('https://openstax.org/books/biology-2e/pages/10-3-control-of-the-cell-cycle', '10.3 Control of the Cell Cycle'),
  hanahan2011: link('https://doi.org/10.1016/j.cell.2011.02.013', 'Hanahan &amp; Weinberg, hallmarks of cancer: the next generation (Cell, 2011)'),
  hanahan2022: link('https://doi.org/10.1158/2159-8290.CD-21-1059', 'Hanahan, hallmarks of cancer: new dimensions (Cancer Discov, 2022)'),
  carmeliet: link('https://doi.org/10.1038/nature10144', 'Carmeliet &amp; Jain, molecular mechanisms and clinical applications of angiogenesis (Nature, 2011)'),
  valastyan: link('https://doi.org/10.1016/j.cell.2011.09.024', 'Valastyan &amp; Weinberg, tumor metastasis (Cell, 2011)'),
  boellaard: link('https://doi.org/10.1007/s00259-014-2961-x', 'Boellaard et al., EANM FDG PET/CT procedure guidelines for tumor imaging, version 2.0 (Eur J Nucl Med Mol Imaging, 2015)'),
};
const GENES = {
  normal: 'Normal: the cell divides only when a growth signal arrives, and p53 and RB hold a damaged cell at the G1/S checkpoint until it is repaired or removed by apoptosis.',
  ras: 'Oncogene on: a mutant RAS (or extra MYC) sends a constant “go” signal, like a stuck gas pedal. Cells race through G1 without waiting, but working p53 still stops damaged cells.',
  p53: 'p53 lost: the brakes fail. Growth still needs a signal, but damaged cells slip through the checkpoints and pass their mutations to daughter cells.',
  both: 'Both: a stuck gas pedal and no brakes. Cells divide fast and damaged cells keep dividing, so mutations pile up with every generation, the path toward cancer.',
};
const SPREAD = [
  ['Hypoxia and VEGF', 'A tumor more than about 1 to 2 mm across outgrows its oxygen supply. Hypoxic cells stabilize HIF-1, which switches on VEGF, a signal that calls in new vessels (the angiogenic switch).'],
  ['Sprouting', 'Endothelial cells in a nearby vessel follow the VEGF gradient. A tip cell leads a new sprout toward the tumor. The new vessels are tortuous and leaky.'],
  ['Invasion', 'Some tumor cells loosen their cell-to-cell junctions (epithelial–mesenchymal transition), secrete proteases such as matrix metalloproteinases, and break through the basement membrane.'],
  ['Intravasation', 'The invading cell squeezes into a leaky vessel and travels in the blood or lymph as a circulating tumor cell. Most die there from shear stress and immune attack.'],
  ['Seeding', 'A rare survivor sticks in a distant capillary, leaves the vessel, and, if the new tissue suits it, grows into a metastasis. Common sites are lymph nodes, lung, liver, bone and brain.'],
];
const SPREAD_T = [0, 4, 8, 11, 14, 18];
const VIEW = {
  pet: 'PET: FDG piles up in the viable rim, where crowded, glycolytic cells overexpress GLUT1 and hexokinase. The dead center takes up almost none, so it looks photopenic (dark).',
  ct: 'CT: shows anatomy and density. The tumor is a mass with a lower-density necrotic center, but CT alone cannot tell how metabolically active the tissue is.',
  fused: 'PET/CT fused: the metabolic map is laid over the anatomy, so a hot rim can be pinned to a specific mass, node or organ.',
};
whenLesson('cancer-genes', v => setCaption('cancerGenesCaption', GENES[v]));
whenLesson('cancer-step', v => setCaption('cancerSpreadCaption', v === 'auto' ? 'Playing all five steps.' : SPREAD[+v][0] + ': ' + SPREAD[+v][1]));
whenLesson('cancer-view', v => setCaption('cancerViewCaption', VIEW[v]));

const CHAPTERS = [
  {
    id: 'cancer-genes', short: 'Oncogenes & checkpoints', where: 'The cell cycle with its checkpoints',
    title: 'Gas pedals, brakes and broken checkpoints',
    legend: [['g1', 'G1'], ['sphase', 'S'], ['g2', 'G2'], ['mphase', 'M'], ['gate', 'Checkpoint'], ['lesion', 'DNA damage'], ['cancer', 'Clone of daughter cells']],
    html: () => `
      <p class="lede">Cancer starts when mutations break the controls on the <a href="#cycle">cell cycle</a>. <b>Oncogenes</b> are mutated accelerators that are stuck on. <b>Tumor suppressors</b> are brakes that have been lost.</p>
      ${lessonSeg('cancer-genes', 'Mutations', [['normal', 'Normal'], ['ras', 'RAS on'], ['p53', 'p53 lost'], ['both', 'Both']])}
      ${caption('cancerGenesCaption', GENES[LESSON['cancer-genes']])}
      <div class="table-wrap"><table class="ledger"><thead><tr><th>Type</th><th>Examples</th><th>Normal job</th><th>In cancer</th></tr></thead><tbody>
        <tr><td>Oncogene</td><td>RAS, MYC, HER2 (ERBB2)</td><td>Relay or boost growth signals</td><td>One mutated or amplified copy is enough to drive growth</td></tr>
        <tr><td>Tumor suppressor</td><td>TP53 (p53), RB1, BRCA1/2</td><td>Halt the cycle, repair DNA or trigger apoptosis</td><td>Usually both copies must be lost</td></tr>
      </tbody></table></div>
      <ul class="facts">
        <li><b>p53</b>, the “guardian of the genome”, senses DNA damage and stops the cycle through p21, or starts <a href="#apoptosis">apoptosis</a> if the damage is too great. TP53 is the most frequently mutated gene in human cancer.</li>
        <li><b>RB</b> holds the transcription factor E2F until cyclin D–CDK4/6 phosphorylates it. CDK4/6 inhibitors used in breast cancer restore this brake.</li>
        <li>No single mutation is enough. Most cancers accumulate several driver mutations over years, which is why risk climbs with age and with exposures such as smoking or <a href="#damage">radiation damage</a>.</li>
      </ul>
      <p><a href="#cancer-spread">How a tumor spreads</a> · <a href="#fate">What a normal cell does with damage</a></p>
      ${sources([SRC.osCancer, SRC.osControl, SRC.hanahan2011], 'The cycle is drawn as a ring with two gates and a handful of cells. Real checkpoint control involves many more proteins, and the spindle checkpoint inside M is not drawn. Speeds and division counts are illustrative.')}`,
  },
  {
    id: 'cancer-spread', short: 'Angiogenesis & metastasis', where: 'A tumor, a nearby vessel and a distant organ',
    title: 'New vessels and the spread of cancer',
    legend: [['cancer', 'Tumor cells'], ['vegf', 'VEGF'], ['rbc', 'Blood vessel'], ['membrane', 'Basement membrane']],
    html: () => `
      <p class="lede">A tumor cannot grow past a few millimeters without its own blood supply, and it becomes deadly mainly by spreading. Follow both steps.</p>
      ${lessonSeg('cancer-step', 'Step', [['auto', 'Play all'], ...SPREAD.map(([name], i) => [String(i), name])])}
      ${caption('cancerSpreadCaption', LESSON['cancer-step'] === 'auto' ? 'Playing all five steps.' : SPREAD[+LESSON['cancer-step']][0] + ': ' + SPREAD[+LESSON['cancer-step']][1])}
      <ol class="lesson-sequence">${SPREAD.map(([name, text]) => `<li><b>${name}.</b> ${text}</li>`).join('')}</ol>
      <ul class="facts">
        <li>Bevacizumab, an antibody against VEGF, and drugs that block VEGF receptors starve tumors of new vessels.</li>
        <li>Leaky tumor vessels are why many tumors <b>enhance</b> after contrast on CT and MRI. The same leakiness raises pressure inside the tumor and makes drug delivery uneven.</li>
        <li>Cancer cells crawl using the same actin machinery as <a href="#cyto-crawl">white blood cells</a>.</li>
      </ul>
      <p><a href="#bone-lesions">What happens when cancer reaches bone</a> · <a href="#cancer-pet">Finding tumors on PET</a></p>
      ${sources([SRC.carmeliet, SRC.valastyan, SRC.hanahan2022], 'The scene compresses months to seconds and shows a single cell making the whole journey. Real metastasis is very inefficient, with only a tiny fraction of circulating cells forming tumors. Not to scale.')}`,
  },
  {
    id: 'cancer-pet', short: 'FDG-avid tumors', where: 'A tumor on PET and CT (schematic)',
    title: 'Why tumors glow on FDG-PET',
    legend: [['fdg', 'FDG uptake'], ['cancer', 'Viable tumor cells'], ['dead', 'Necrotic core'], ['rbc', 'Capillary']],
    html: () => `
      <p class="lede">Fast-growing tumor cells take up glucose greedily and break it down to lactate even with oxygen around, the <a href="#warburg">Warburg effect</a>. FDG, a radioactive glucose look-alike, follows glucose in and gets stuck.</p>
      ${lessonSeg('cancer-view', 'View', [['pet', 'PET'], ['ct', 'CT'], ['fused', 'PET/CT']])}
      ${caption('cancerViewCaption', VIEW[LESSON['cancer-view']])}
      <ul class="facts">
        <li>FDG enters through GLUT transporters and hexokinase phosphorylates it to FDG-6-phosphate, which cannot continue down <a href="#glycolysis">glycolysis</a> and is trapped. Hypoxia adds to this by raising GLUT1 and hexokinase through HIF-1.</li>
        <li>The <b>standardized uptake value (SUV)</b> normalizes uptake for dose and body weight. It depends on timing, blood glucose and scanner, so serial scans should follow the same protocol.</li>
        <li>A <b>necrotic core</b> is cold because dead cells do not take up glucose. A rim of uptake around a cold center is a common pattern in large tumors. Cells dying by <a href="#apoptosis">apoptosis</a> after treatment also lose uptake, one reason PET can show response before a tumor shrinks.</li>
        <li>FDG is not cancer-specific: infection, inflammation, healing and brown fat take it up. Some cancers, such as many prostate cancers and some low-grade or mucinous tumors, take up little.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Good images need patient preparation: fasting and controlled blood glucose, because insulin drives FDG into muscle and fat. See <a href="#petprep">PET preparation</a>. In lymphoma, response is graded against the liver with the Deauville scale, covered in <a href="#liver-cyp">the hepatocyte module</a>.</p></div>
      ${sources([SRC.boellaard, SRC.hanahan2011], 'The tumor is drawn as a sphere of cells with a tidy necrotic center, and uptake is shown as color and glow, not measured counts. The PET and CT views are schematic illustrations, not patient images. For learning, not diagnosis.')}`,
  },
];

CellCity.register('cancer', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const R = mulberry32(909);

    /* ================= Oncogenes and checkpoints ================= */
    {
      const id = 'cancer-genes', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 3, 30), w: 16 }, { fade: 'Around the cell cycle' });
      const RING = 6.5, PH = [['g1', 0, 0.42, 'G1'], ['sphase', 0.42, 0.68, 'S'], ['g2', 0.68, 0.86, 'G2'], ['mphase', 0.86, 1, 'M']];
      const ang = u => Math.PI / 2 - u * Math.PI * 2;
      const at = (u, r = RING) => V(Math.cos(ang(u)) * r, Math.sin(ang(u)) * r, 0);
      PH.forEach(([c, a, b, name]) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(RING, 0.35, 10, 60, (b - a) * Math.PI * 2), std(C(c), { emissiveIntensity: 0.35 }));
        m.rotation.z = ang(b); root.add(m);
        lbl(name, c, root, at((a + b) / 2, RING + 1.6), id);
      });
      const GATES = [0.42, 0.86];
      const gates = GATES.map((u, i) => {
        const gr = new THREE.Group(); gr.position.copy(at(u)); gr.rotation.z = ang(u); root.add(gr);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.2), std(C('gate'), { emissiveIntensity: 0.5 })); gr.add(bar);
        lbl(i ? 'G2/M checkpoint' : 'G1/S checkpoint · RB, p53', 'gate', root, at(u, RING + (i ? 2.6 : 3.2)), id);
        return bar;
      });
      const signal = new THREE.Group(); signal.position.set(-9.5, 6, 0); root.add(signal);
      const sigCore = ball(signal, std(C('vegf'), { emissiveIntensity: 0.5 }), 0.5); const sigGlow = k.glow(C('vegf'), 3); signal.add(sigGlow);
      lbl('Growth signal → RAS', 'vegf', signal, V(0, 1.2, 0), id);
      const clone = new THREE.Group(); root.add(clone);
      const cMat = std(C('cancer'), { emissiveIntensity: 0.35 }), dMat = std(C('lesion'), { emissiveIntensity: 0.5 });
      const cloneCells = Array.from({ length: 60 }, (_, i) => { const r = 0.55 * Math.cbrt(i + 1), a = i * 2.4, y = ((i * 0.618) % 1) * 2 - 1; return ball(clone, cMat, 0.42, V(Math.cos(a) * r * Math.sqrt(1 - y * y), y * r, Math.sin(a) * r * Math.sqrt(1 - y * y))); });
      lbl('Daughter cells', 'cancer', clone, V(0, -3, 0), id);
      const tokMat = std(C('electron'), { emissiveIntensity: 0.3 });
      const toks = Array.from({ length: 6 }, (_, i) => {
        const gr = new THREE.Group(); root.add(gr);
        ball(gr, ghost(C('electron'), 0.35), 0.75); ball(gr, tokMat, 0.32);
        const spot = ball(gr, dMat, 0.22, V(0.45, 0.35, 0.3)); spot.visible = false;
        return { gr, spot, u: i / 6 * 0.4, damaged: false, hold: 0, dying: 0, muts: 0 };
      });
      let born = 4, signalT = 0, el = 0;
      function reset() { born = 4; toks.forEach((t, i) => { t.u = i / 6 * 0.4; t.damaged = i === 2; t.hold = 0; t.dying = 0; t.spot.visible = t.damaged; t.gr.scale.setScalar(1); }); }
      function draw(dt) {
        const mode = LESSON['cancer-genes'] || 'normal';
        const ras = mode === 'ras' || mode === 'both', noP53 = mode === 'p53' || mode === 'both';
        el += dt; signalT += dt;
        const pulse = ras || (signalT % 5) < 1.6;
        sigCore.scale.setScalar(pulse ? 0.6 : 0.35); sigGlow.material.opacity = pulse ? 0.9 : 0.2;
        const speed = (ras ? 0.11 : 0.06) * (reduceMotion ? 0 : 1);
        gates.forEach((gt, i) => { const open = i === 0 ? (pulse || ras) : true; gt.scale.x = open ? 0.35 : 1; gt.material.color.copy(C(open ? 'g1' : 'gate')); gt.material.emissive.copy(gt.material.color); });
        toks.forEach(t => {
          if (t.dying > 0) { t.dying -= dt; t.gr.scale.setScalar(Math.max(0.01, t.dying / 1.2)); if (t.dying <= 0) { t.u = 0; t.damaged = false; t.spot.visible = false; t.gr.scale.setScalar(1); } t.gr.position.copy(at(t.u)); return; }
          const next = t.u + speed * dt;
          const gate = GATES.find(gu => t.u < gu && next >= gu);
          let blocked = false;
          if (gate !== undefined) {
            if (t.damaged && !noP53) { blocked = true; t.hold += dt; if (t.hold > 1.6) { t.dying = 1.2; t.hold = 0; } }
            else if (gate === GATES[0] && !(pulse || ras)) blocked = true;
          }
          if (!blocked) {
            t.u = next;
            if (t.u >= 1) {
              t.u -= 1; born = Math.min(cloneCells.length, born + (ras ? 2 : 1));
              t.damaged = t.damaged || R() < (noP53 ? 0.45 : 0.18); t.spot.visible = t.damaged;
            }
          }
          t.gr.position.copy(at(t.u));
        });
        const cap = mode === 'normal' ? 10 : mode === 'p53' ? 24 : cloneCells.length;
        if (born > cap) born = cap;
        cloneCells.forEach((m, i) => { m.visible = i < born; m.material = noP53 && i % 3 === 0 ? dMat : cMat; });
        clone.rotation.y += reduceMotion ? 0 : dt * 0.3;
      }
      whenLesson('cancer-genes', () => reset());
      behaviors[id] = { enter() { reset(); draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Angiogenesis and metastasis ================= */
    {
      const id = 'cancer-spread', root = new THREE.Group();
      add(id, root, { target: V(0, -0.5, 0), pos: V(2, 6, 32), w: 21 }, { fade: 'A tumor and its blood supply' });
      const tumor = new THREE.Group(); tumor.position.set(-7, 3, 0); root.add(tumor);
      const tMat = std(C('cancer'), { emissiveIntensity: 0.35 }), hMat = std(C('cancer').clone().multiplyScalar(0.45), { emissiveIntensity: 0.15 });
      const tCells = [];
      for (let i = 0; i < 70; i++) { const y = 1 - 2 * (i + 0.5) / 70, r = Math.sqrt(1 - y * y), a = i * 2.39996, d = 2.6 * Math.cbrt(R()); tCells.push(ball(tumor, d < 1.4 ? hMat : tMat, 0.5, V(Math.cos(a) * r * d, y * d, Math.sin(a) * r * d))); }
      const bm = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), ghost(C('membrane'), 0.25)); bm.rotation.x = -Math.PI / 2; bm.position.set(-6, -0.6, 0); root.add(bm);
      const hole = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.9, 24), std(C('cancer'), { side: THREE.DoubleSide, emissiveIntensity: 0.4 })); hole.rotation.x = -Math.PI / 2; hole.position.set(-4, -0.58, 0); root.add(hole);
      const vessel = tube(root, ghost(C('rbc'), 0.28), [V(-17, -4.5, 0), V(0, -4.8, 0), V(17, -4.5, 0)], 1.3);
      const sproutMat = std(C('rbc'), { emissiveIntensity: 0.35, transparent: true, opacity: 0.8 });
      const sA = V(-9, -3.5, 0), sB = V(-8, 0.8, 0.5), sprout = rod(root, sproutMat, sA, sA.clone().add(V(0, 0.01, 0)), 0.45);
      const tip = k.glow(C('rbc'), 2.2); root.add(tip);
      const vegf = stream(root, std(C('vegf'), { emissiveIntensity: 0.6 }), 0.18, curve([V(-7, 1.5, 0.5), V(-8, -1, 1), V(-9, -3.4, 0.5)]), 9, 0.35, C('vegf'));
      const organ = body(root, C('hepato'), [4.2, 3, 3], V(11, 1.5, 0), 0.14);
      const meta = new THREE.Group(); meta.position.set(11, 0, 0); root.add(meta);
      const metaCells = Array.from({ length: 14 }, (_, i) => ball(meta, tMat, 0.42, V(rr(-1, 1), rr(-0.6, 1), rr(-0.8, 0.8))));
      const runner = ball(root, std(C('cancer'), { emissiveIntensity: 0.7 }), 0.55); runner.add(k.glow(C('cancer'), 3));
      const flow = Array.from({ length: 8 }, (_, i) => ball(root, std(C('rbc'), { emissiveIntensity: 0.2 }), 0.35, V(-16 + i * 4.4, -4.6, rr(-0.5, 0.5))));
      lbl('Tumor · hypoxic core', 'cancer', tumor, V(0, 3.4, 0), id);
      lbl('Basement membrane', 'membrane', root, V(-11.5, -0.6, 3.4), id);
      lbl('Blood vessel', 'rbc', vessel, V(-14, -6.4, 0), id);
      lbl('Distant organ', 'hepato', organ, V(0, 1.25, 0), id);
      const vLbl = new THREE.Group(); root.add(vLbl); lbl('VEGF', 'vegf', vLbl, V(-6, -1.6, 1.5), id);
      const path = curve([V(-5, 1.2, 0.5), V(-4, -0.6, 0), V(-4, -3.2, 0), V(0, -4.6, 0), V(8, -4.5, 0), V(10.5, -3.4, 0), V(11, -1.2, 0)]);
      let el = 0, lastPh = -1;
      function draw(dt) {
        const step = LESSON['cancer-step'] || 'auto';
        el += reduceMotion ? 0 : dt;
        let T;
        if (reduceMotion) T = step === 'auto' ? 15 : (SPREAD_T[+step] + SPREAD_T[+step + 1]) / 2;
        else if (step === 'auto') T = el % 19.5;
        else { const s = +step, d = SPREAD_T[s + 1] - SPREAD_T[s]; T = Math.min(SPREAD_T[s] + (el % (d + 1.2)), SPREAD_T[s + 1] - 0.001); }
        T = Math.min(T, 17.999);
        let ph = 0; while (ph < 4 && T >= SPREAD_T[ph + 1]) ph++;
        if (step === 'auto' && ph !== lastPh) { lastPh = ph; setCaption('cancerSpreadCaption', SPREAD[ph][0] + ': ' + SPREAD[ph][1]); }
        vegf.visible = vLbl.visible = T < 8; vegf.update(dt);
        const grow = Math.min(1, Math.max(0, (T - 4) / 4));
        const tipPos = sA.clone().lerp(sB, grow); k.setRod(sprout, sA, tipPos.clone().add(V(0, 0.01, 0)), 0.45); tip.position.copy(tipPos); tip.visible = grow > 0 && grow < 1;
        tCells.forEach((m, i) => { m.material = (grow > 0.9 && m.position.length() < 1.4) ? tMat : m.material; });
        hole.visible = T >= 9;
        // runner: invades, enters the vessel, travels and seeds
        runner.visible = T >= 8 && T < 17;
        if (runner.visible) { const u = T < 11 ? (T - 8) / 3 * 0.3 : T < 14 ? 0.3 + (T - 11) / 3 * 0.45 : 0.75 + (T - 14) / 3 * 0.25; runner.position.copy(path.getPointAt(Math.min(1, u))); }
        const seeded = Math.max(0, (T - 15.5) / 2.5);
        metaCells.forEach((m, i) => { m.visible = i < seeded * metaCells.length; });
        flow.forEach(f => { if (!reduceMotion) { f.position.x += dt * 4; if (f.position.x > 16) f.position.x = -16; } });
        tumor.rotation.y += reduceMotion ? 0 : dt * 0.1;
      }
      whenLesson('cancer-step', () => { el = 0; lastPh = -1; });
      behaviors[id] = { enter() { el = 0; lastPh = -1; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= FDG-avid tumors ================= */
    {
      const id = 'cancer-pet', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(3, 5, 30), w: 16 }, { fade: 'Into the scanner' });
      const tumor = new THREE.Group(); root.add(tumor);
      const grey = (v) => std(new THREE.Color(v, v, v), { emissiveIntensity: 0.1 });
      const M = {
        rimPet: std(C('fdg'), { emissiveIntensity: 0.9 }), corePet: std(C('dead'), { emissiveIntensity: 0.05 }), normPet: std(C('cancer').clone().lerp(C('dead'), 0.5), { emissiveIntensity: 0.15 }),
        rimCt: grey(0.62), coreCt: grey(0.32), normCt: grey(0.55),
      };
      const rim = [], core = [], norm = [];
      for (let i = 0; i < 220; i++) { const y = 1 - 2 * (i + 0.5) / 220, r = Math.sqrt(1 - y * y), a = i * 2.39996, d = 4.6 * Math.cbrt(R()); (d < 2.8 ? core : rim).push(ball(tumor, M.rimPet, d < 2.8 ? 0.45 : 0.52, V(Math.cos(a) * r * d, y * d, Math.sin(a) * r * d))); }
      for (let i = 0; i < 40; i++) norm.push(ball(root, M.normPet, 0.55, V(rr(6.5, 11), rr(-4, 4), rr(-3, 3))));
      const halo = [0, 1, 2].map(i => { const s = k.glow(C('fdg'), 11 + i * 3); s.material.opacity = 0.25 - i * 0.06; tumor.add(s); return s; });
      const cap = tube(root, ghost(C('rbc'), 0.3), [V(-14, -6, 0), V(-6, -5.4, 2), V(0, -5.6, 3.5), V(6, -6, 1), V(14, -6.2, 0)], 0.9);
      const fdgIn = stream(root, std(C('fdg'), { emissiveIntensity: 0.8 }), 0.17, curve([V(-12, -5.8, 0.5), V(-5, -5.4, 2), V(-2.5, -3.6, 2.6), V(-3.4, -1.5, 3)]), 10, 0.25, C('fdg'));
      const fdgIn2 = stream(root, std(C('fdg'), { emissiveIntensity: 0.8 }), 0.17, curve([V(-12, -5.8, -0.5), V(-1, -5.5, 3.2), V(2, -3.8, 2.2), V(3, -1.8, 2.8)]), 8, 0.22, C('fdg'));
      lbl('Viable rim · high FDG', 'fdg', root, V(-4.2, 4.4, 0), id);
      lbl('Necrotic core · photopenic', 'dead', root, V(0, 0, 5.4), id);
      lbl('Normal tissue', 'cancer', root, V(9, 4.8, 0), id);
      lbl('Capillary', 'rbc', cap, V(-12, -7.4, 0), id);
      let el = 0, cur = null, uptake = 0;
      function apply(v) {
        const pet = v === 'pet', ct = v === 'ct';
        rim.forEach(m => { m.material = ct ? M.rimCt : M.rimPet; }); core.forEach(m => { m.material = ct ? M.coreCt : M.corePet; }); norm.forEach(m => { m.material = ct ? M.normCt : M.normPet; });
        if (v === 'fused') { rim.forEach((m, i) => { m.material = i % 2 ? M.rimCt : M.rimPet; }); core.forEach(m => { m.material = M.coreCt; }); norm.forEach(m => { m.material = M.normCt; }); }
        halo.forEach(h => { h.visible = !ct; });
        fdgIn.visible = fdgIn2.visible = !ct;
      }
      function draw(dt) {
        const v = LESSON['cancer-view'] || 'pet';
        if (v !== cur) { cur = v; apply(v); uptake = reduceMotion ? 1 : 0.2; }
        el += dt; uptake = Math.min(1, uptake + dt * 0.25);
        M.rimPet.emissiveIntensity = 0.35 + 0.75 * uptake;
        halo.forEach((h, i) => { h.material.opacity = (0.25 - i * 0.06) * uptake * (cur === 'fused' ? 0.7 : 1); });
        fdgIn.update(dt); fdgIn2.update(dt);
        tumor.rotation.y += reduceMotion ? 0 : dt * 0.12;
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
