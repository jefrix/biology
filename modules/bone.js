/* Bone cells: the remodeling trio under RANKL/OPG control, trabecular loss and DEXA T-scores, and lytic vs sclerotic lesions.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osStructure: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/6-3-bone-structure', 'OpenStax Anatomy &amp; Physiology 2e, 6.3 Bone Structure'),
  osFormation: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/6-4-bone-formation-and-development', '6.4 Bone Formation and Development'),
  osHormones: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/6-6-exercise-nutrition-hormones-and-bone-tissue', 'OpenStax Anatomy &amp; Physiology 2e, 6.6 Exercise, Nutrition, Hormones, and Bone Tissue'),
  boyle: link('https://doi.org/10.1038/nature01658', 'Boyle, Simonet &amp; Lacey, osteoclast differentiation and activation (Nature, 2003)'),
  teitelbaum: link('https://doi.org/10.1126/science.289.5484.1504', 'Teitelbaum, bone resorption by osteoclasts (Science, 2000)'),
  bonewald: link('https://doi.org/10.1002/jbmr.320', 'Bonewald, the amazing osteocyte (J Bone Miner Res, 2011)'),
  kanis: link('https://doi.org/10.1007/BF01622200', 'Kanis et al., the WHO study group report defining osteoporosis by T-score (Osteoporos Int, 1994)'),
  roodman: link('https://doi.org/10.1056/NEJMra030831', 'Roodman, mechanisms of bone metastasis (N Engl J Med, 2004)'),
  coleman: link('https://doi.org/10.1158/1078-0432.CCR-06-0931', 'Coleman, clinical features of metastatic bone disease (Clin Cancer Res, 2006)'),
};
const BALANCE = {
  balanced: 'Balanced: osteocytes sense load and steer the site. RANKL from osteoblast-lineage cells and osteocytes binds RANK on osteoclast precursors, while OPG acts as a decoy receptor. Resorbed bone is replaced in roughly equal measure.',
  resorb: 'More RANKL, less OPG, as after estrogen loss at menopause: more osteoclasts form and live longer, pits deepen, and formation cannot keep up, so bone is lost.',
  build: 'More OPG, or loading that lowers osteocyte sclerostin: osteoclasts are held back while osteoblasts lay down osteoid that then mineralizes, so bone mass rises. Denosumab, an antibody against RANKL, works like OPG.',
};
const DENSITY = {
  normal: ['Normal', 0, 'T-score about 0: a dense, well-connected trabecular lattice inside a thick cortex. WHO: a T-score of −1.0 or higher is normal.'],
  osteopenia: ['Osteopenia', -1.8, 'T-score about −1.8: trabeculae thin and some connections are lost. WHO: between −1.0 and −2.5 is low bone mass (osteopenia).'],
  osteoporosis: ['Osteoporosis', -3.0, 'T-score about −3.0: many trabeculae are cut through and the cortex thins, so the bone breaks with little force. WHO: −2.5 or lower is osteoporosis.'],
};
const LESION = {
  normal: 'Normal: dense cortical bone shows as bright white lines on an X-ray, with fainter trabecular bone inside.',
  lytic: 'Lytic: tumor cells release factors such as PTHrP that raise RANKL, so osteoclasts dissolve bone. The lesion is darker (lucent) than normal bone. Typical sources are myeloma and cancers of the kidney, thyroid and lung.',
  sclerotic: 'Sclerotic: tumor cells release factors such as endothelin-1 that drive osteoblasts to lay down dense, disorganized new bone. The lesion is brighter (denser) than normal bone. The classic source is prostate cancer, and breast cancer can be lytic, sclerotic or mixed.',
};
whenLesson('bone-balance', v => setCaption('boneBalanceCaption', BALANCE[v]));
whenLesson('bone-density', v => setCaption('boneDensityCaption', DENSITY[v][2]));
whenLesson('bone-lesion', v => setCaption('boneLesionCaption', LESION[v]));

const CHAPTERS = [
  {
    id: 'bone-remodel', short: 'Remodeling trio', where: 'A remodeling site on a trabecula',
    title: 'Osteoclasts dig, osteoblasts rebuild, osteocytes decide',
    legend: [['plt', 'Osteoclast'], ['proton', 'Acid (H⁺)'], ['osteoid', 'Osteoblasts and osteoid'], ['bone', 'Osteocyte in mineralized bone'], ['rankl', 'RANKL'], ['opg', 'OPG decoy']],
    html: () => `
      <p class="lede">Bone is living tissue that is constantly torn down and rebuilt. Three cell types share the work, and a signaling trio, <b>RANK</b>, <b>RANKL</b> and <b>OPG</b>, sets the balance.</p>
      ${lessonSeg('bone-balance', 'Signal balance', [['balanced', 'Balanced'], ['resorb', 'RANKL high'], ['build', 'OPG high']])}
      ${caption('boneBalanceCaption', BALANCE[LESSON['bone-balance']])}
      <div class="table-wrap"><table class="ledger"><thead><tr><th>Cell</th><th>Origin</th><th>Job</th></tr></thead><tbody>
        <tr><td>Osteoclast</td><td>Fused monocyte–macrophage precursors, many nuclei</td><td>Seals onto bone, secretes acid and cathepsin K through a ruffled border</td></tr>
        <tr><td>Osteoblast</td><td>Mesenchymal stem cells</td><td>Secretes osteoid (mostly type I collagen), then helps it mineralize</td></tr>
        <tr><td>Osteocyte</td><td>An osteoblast buried in its own matrix</td><td>Senses strain through canaliculi and signals with RANKL and sclerostin</td></tr>
      </tbody></table></div>
      <ul class="facts">
        <li>Osteoclasts come from the same lineage as the <a href="#blood/mono">monocyte</a>. A proton pump acidifies the sealed space under the ruffled border, like a giant external <a href="#lysosome">lysosome</a>, dissolving hydroxyapatite mineral.</li>
        <li>Osteocytes make up over 90% of bone cells and connect through tiny channels called canaliculi. Loading lowers their output of sclerostin, which otherwise brakes osteoblasts.</li>
        <li>At one site, resorption takes a few weeks and refilling takes a few months.</li>
      </ul>
      <p><a href="#bone-dexa">See what lost bone looks like on DEXA</a> · <a href="#bone-lesions">When tumors hijack this balance</a> · <a href="#stem-niches">The marrow niche inside bone</a></p>
      ${sources([SRC.osStructure, SRC.osFormation, SRC.boyle, SRC.teitelbaum, SRC.bonewald], 'The cells are drawn side by side on one surface to show the sequence. In life they work in a basic multicellular unit, osteoclasts leading and osteoblasts following, with many more osteocytes in the bone beneath. Not to scale.')}`,
  },
  {
    id: 'bone-dexa', short: 'DEXA & density', where: 'Trabecular bone inside a vertebra (schematic)',
    title: 'Bone density and the DEXA T-score',
    legend: [['bone', 'Trabeculae and cortex'], ['glucose', 'Low-energy X-ray'], ['fdg', 'High-energy X-ray']],
    html: () => `
      <p class="lede">Most of a vertebral body is spongy <b>trabecular</b> bone, a lattice of struts inside a thin shell of <b>cortical</b> bone. Trabecular bone turns over fastest, so it is lost first.</p>
      ${lessonSeg('bone-density', 'Bone density', [['normal', 'Normal'], ['osteopenia', 'Osteopenia'], ['osteoporosis', 'Osteoporosis']])}
      ${caption('boneDensityCaption', DENSITY[LESSON['bone-density']][2])}
      <ul class="facts">
        <li><b>DEXA</b> (dual-energy X-ray absorptiometry) passes two X-ray energies through the spine and hip. Bone and soft tissue absorb them differently, so soft tissue can be subtracted to give bone mineral density in g/cm².</li>
        <li>The <b>T-score</b> is how many standard deviations a result sits from the young-adult average of the same sex. The <b>Z-score</b> compares with people of the same age and is preferred for children, premenopausal women and younger men.</li>
        <li>DEXA measures area, not volume. Spinal arthritis or calcified vessels can raise the reading falsely, so the radiologist checks which vertebrae to include.</li>
        <li>A fragility fracture of the hip or spine means osteoporosis clinically, whatever the T-score.</li>
      </ul>
      <p><a href="#bone-remodel">The cells behind bone loss</a> · <a href="#bone-lesions">Focal lesions on X-ray</a></p>
      ${sources([SRC.kanis, SRC.osHormones, SRC.osStructure], 'The lattice is a randomized schematic, not a micro-CT scan, and the T-scores are example values for each category. The beam is drawn as two colored sheets for clarity. For learning, not diagnosis.')}`,
  },
  {
    id: 'bone-lesions', short: 'Lytic vs sclerotic', where: 'A long bone and its X-ray (schematic)',
    title: 'Lytic and sclerotic bone lesions',
    legend: [['bone', 'Cortical bone'], ['plt', 'Osteoclasts'], ['osteoid', 'Osteoblasts'], ['cancer', 'Tumor cells']],
    html: () => `
      <p class="lede">Cancers that spread to bone hijack the remodeling balance. Some drive osteoclasts and eat bone away (<b>lytic</b>); others drive osteoblasts and pile up dense new bone (<b>sclerotic</b>).</p>
      ${lessonSeg('bone-lesion', 'Lesion', [['normal', 'Normal'], ['lytic', 'Lytic'], ['sclerotic', 'Sclerotic']])}
      ${caption('boneLesionCaption', LESION[LESSON['bone-lesion']])}
      <ul class="facts">
        <li>Bone destroyed by tumor releases growth factors stored in the matrix, such as TGF-β, which stimulate the tumor further, a self-reinforcing <b>vicious cycle</b>.</li>
        <li>A large share of the mineral in an area must be lost before a lytic lesion shows on plain X-ray, so CT, MRI or PET often find lesions earlier.</li>
        <li>A <b>bone scan</b> with technetium-99m MDP shows osteoblastic activity. Sclerotic lesions are hot, but purely lytic myeloma lesions can look normal, so myeloma is staged with low-dose whole-body CT, MRI or PET/CT.</li>
        <li>Lytic lesions in weight-bearing bones risk pathologic fracture. Bisphosphonates and denosumab slow osteoclasts and reduce skeletal events.</li>
      </ul>
      <p><a href="#cancer-spread">How tumor cells reach bone</a> · <a href="#cancer-pet">FDG-PET of tumors</a> · <a href="#bone-remodel">The normal balance</a></p>
      ${sources([SRC.roodman, SRC.coleman, SRC.boyle], 'Cells are greatly enlarged against the bone, and the X-ray is a drawn illustration, not a patient image. Real lesions vary in margin, matrix and pattern. For learning, not diagnosis.')}`,
  },
];

CellCity.register('bone', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, panel, V } = k;
    const { behaviors } = k.out;
    const r01 = mulberry32(606);

    /* ================= Remodeling trio ================= */
    {
      const id = 'bone-remodel', root = new THREE.Group();
      add(id, root, { target: V(0, -1.5, 0), pos: V(3, 8, 30), w: 19 }, { fade: 'Onto a bone surface' });
      const slab = new THREE.Mesh(new THREE.BoxGeometry(26, 5, 9), ghost(C('mineral'), 0.28)); slab.position.y = -5; root.add(slab);
      // osteoclast and its pit
      const pit = ball(root, std(new THREE.Color(0x1a1420), { emissiveIntensity: 0 }), 1, V(-6, -2.5, 0)); pit.scale.set(3.6, 0.6, 3);
      const ocl = new THREE.Group(); ocl.position.set(-6, -1.2, 0); root.add(ocl);
      body(ocl, C('plt'), [3.8, 1.9, 3], null, 0.25);
      for (let i = 0; i < 5; i++) ball(ocl, std(C('baso'), { emissiveIntensity: 0.3 }), 0.5, V(-2 + i, 0.6 + (i % 2) * 0.3, (i % 3 - 1) * 0.8));
      const ruffle = tube(ocl, std(C('plt'), { emissiveIntensity: 0.4 }), Array.from({ length: 40 }, (_, i) => { const a = i / 40 * Math.PI * 2; return V(Math.cos(a) * 2.6, -1.4 + 0.2 * Math.sin(a * 8), Math.sin(a) * 2); }), 0.12, true);
      const acid = stream(root, std(C('proton'), { emissiveIntensity: 0.6 }), 0.16, curve([V(-6, -2.4, 0), V(-6.5, -2.9, 0.4), V(-6, -3, -0.3)]), 8, 0.6, C('proton'));
      // osteoblasts laying osteoid
      const osteoid = new THREE.Mesh(new THREE.BoxGeometry(9, 1, 6), std(C('osteoid'), { emissiveIntensity: 0.25, transparent: true, opacity: 0.85 })); osteoid.position.set(6.5, -2.5, 0); root.add(osteoid);
      const blasts = [];
      for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) blasts.push(body(root, C('osteoid'), [0.85, 1.1, 0.85], V(3 + i * 1.8, -1.2, -1.2 + j * 2.4), 0.45));
      // osteocyte with canaliculi
      const ocy = new THREE.Group(); ocy.position.set(0, -5.2, 0); root.add(ocy);
      body(ocy, C('bone'), [1.1, 0.6, 0.8], null, 0.6);
      const canMat = std(C('bone'), { emissiveIntensity: 0.5 });
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; rod(ocy, canMat, V(0, 0, 0), V(Math.cos(a) * 3.5, Math.sin(a) * 1.8 + 0.6, Math.sin(a * 2) * 2), 0.05); }
      // osteoclast precursor and the RANKL / OPG signals
      const pre = body(root, C('mono'), 1.1, V(-13, 0.5, 0), 0.4);
      const rankl = stream(root, std(C('rankl'), { emissiveIntensity: 0.6 }), 0.2, curve([V(3, -1, 0), V(-3, 2.5, 1), V(-9, 2, 0.5), V(-12.2, 0.7, 0)]), 7, 0.22, C('rankl'));
      const opg = stream(root, std(C('opg'), { emissiveIntensity: 0.6 }), 0.2, curve([V(4, -0.5, -1.5), V(-2, 3, -1), V(-6, 3, -0.5)]), 7, 0.25, C('opg'));
      lbl('Osteoclast · ruffled border', 'plt', ocl, V(0, 2.4, 0), id);
      lbl('Resorption pit', 'proton', root, V(-6, -3.8, 3.2), id);
      lbl('Osteoblasts', 'osteoid', root, V(7, 0.6, 0), id);
      lbl('Osteoid', 'osteoid', osteoid, V(4, 0, 3.2), id);
      lbl('Osteocyte in a lacuna', 'bone', ocy, V(1.5, -1.6, 2), id);
      lbl('Precursor · RANK', 'mono', pre, V(0, 1.7, 0), id);
      lbl('RANKL', 'rankl', root, V(-3, 3.6, 1), id);
      lbl('OPG decoy', 'opg', root, V(1, 3.4, -1), id);
      let dig = 0.6, lay = 0.6, el = 0;
      const TARGET = { balanced: [0.6, 0.6, 7, 0.22], resorb: [1.15, 0.25, 7, 0.06], build: [0.25, 1.2, 2, 0.4] };
      function draw(dt) {
        const [d, l, nR, opgSpeed] = TARGET[LESSON['bone-balance'] || 'balanced'];
        const kk = Math.min(1, dt * (reduceMotion ? 99 : 0.8)); el += dt;
        dig += (d - dig) * kk; lay += (l - lay) * kk;
        pit.scale.set(3.2 + dig * 1.2, 0.3 + dig * 0.9, 2.6 + dig * 0.8);
        ocl.scale.setScalar(0.8 + dig * 0.35);
        osteoid.scale.y = 0.2 + lay; osteoid.position.y = -2.5 + (0.2 + lay) * 0.5;
        blasts.forEach(b => { b.position.y = -1.2 + lay; b.visible = lay > 0.3 || b.position.x < 7; });
        rankl.items.forEach((m, i) => { m.userData.on = i < nR; });
        rankl.at = (m) => { m.visible = m.userData.on; };
        opg.speed = opgSpeed; opg.visible = opgSpeed > 0.1;
        [rankl, opg, acid].forEach(s => s.update(dt));
        acid.visible = dig > 0.35;
        ruffle.rotation.y += reduceMotion ? 0 : dt * 0.6;
        pre.scale.setScalar(1.1 + 0.08 * Math.sin(el * 2));
      }
      behaviors[id] = { enter() { draw(99); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= DEXA and trabecular density ================= */
    {
      const id = 'bone-dexa', root = new THREE.Group();
      add(id, root, { target: V(2, 0, 0), pos: V(4, 6, 30), w: 17 }, { fade: 'Inside a vertebral body' });
      const bone = new THREE.Group(); bone.position.x = -4; root.add(bone);
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 10, 40, 1, true), ghost(C('bone'), 0.32)); bone.add(outer);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 10, 40, 1, true), ghost(C('bone'), 0.18)); bone.add(inner);
      const rimTop = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.4, 48), std(C('bone'), { side: THREE.DoubleSide, emissiveIntensity: 0.2 })); rimTop.rotation.x = -Math.PI / 2; rimTop.position.y = 5; bone.add(rimTop);
      const nodes = [];
      for (let x = -3; x <= 3; x += 1.5) for (let y = -4.2; y <= 4.2; y += 1.4) for (let z = -3; z <= 3; z += 1.5) {
        if (x * x + z * z > 12.5) continue;
        nodes.push(V(x + (r01() - 0.5) * 0.7, y + (r01() - 0.5) * 0.6, z + (r01() - 0.5) * 0.7));
      }
      const trabMat = std(C('bone'), { emissiveIntensity: 0.08, roughness: 0.8 }), struts = [];
      nodes.forEach((a, i) => nodes.forEach((b, j) => { if (j > i && a.distanceTo(b) < 2.05) struts.push({ m: rod(bone, trabMat, a, b, 0.1), a, b, rank: r01() }); }));
      // DEXA scanner arm with two beams
      const arm = new THREE.Group(); root.add(arm);
      const beamLo = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 0.6), new THREE.MeshBasicMaterial({ color: C('glucose'), transparent: true, opacity: 0.55, depthWrite: false })); beamLo.position.set(-4, 0, 0.4); arm.add(beamLo);
      const beamHi = beamLo.clone(); beamHi.material = new THREE.MeshBasicMaterial({ color: C('fdg'), transparent: true, opacity: 0.55, depthWrite: false }); beamHi.position.z = -0.4; arm.add(beamHi);
      const tp = panel(root, 10, 7, 420); tp.mesh.position.set(9.5, 0.5, 0);
      function drawT(v) {
        const [name, t] = DENSITY[v];
        tp.draw((c, w, h) => {
          c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(8,13,21,.85)'; c.fillRect(0, 0, w, h);
          c.textAlign = 'center'; c.fillStyle = '#e6edf5'; c.font = '600 20px "IBM Plex Mono", monospace'; c.fillText('DEXA T-score', w / 2, 30);
          const x = (s) => 24 + (1 - s) / 5 * (w - 48);
          [['#3e8f5e', 1, -1], ['#b08a2e', -1, -2.5], ['#b0413e', -2.5, -4]].forEach(([colr, a, b]) => { c.fillStyle = colr; c.fillRect(x(a), 90, x(b) - x(a), 26); });
          c.fillStyle = '#c9d4e3'; c.font = '14px "IBM Plex Mono", monospace';
          [1, 0, -1, -2, -2.5, -3, -4].forEach(s => c.fillText(String(s).replace('-', '−'), x(s), 136));
          c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x(t), 86); c.lineTo(x(t) - 9, 66); c.lineTo(x(t) + 9, 66); c.fill();
          c.font = '600 24px "IBM Plex Mono", monospace'; c.fillText(name + ' · T ' + String(t.toFixed(1)).replace('-', '−'), w / 2, 190);
          c.font = '15px "IBM Plex Mono", monospace'; c.fillStyle = '#8c9bb0'; c.fillText('≥ −1.0 normal · ≤ −2.5 osteoporosis', w / 2, 236);
        });
      }
      whenLesson('bone-density', v => drawT(v));
      lbl('Cortical shell', 'bone', bone, V(4.6, 4.2, 0), id);
      lbl('Trabecular lattice', 'bone', bone, V(0, -5.8, 2), id);
      lbl('Dual-energy beams', 'glucose', arm, V(-10.5, 0.6, 0), id);
      const FRAC = { normal: [1, 0.12, 3.65], osteopenia: [0.7, 0.085, 3.85], osteoporosis: [0.44, 0.055, 4.05] };
      let el = 0, cur = null;
      function draw(dt) {
        const v = LESSON['bone-density'] || 'normal';
        if (v !== cur) {
          cur = v; const [keep, r, ir] = FRAC[v];
          struts.forEach(s => { s.m.visible = s.rank < keep; k.setRod(s.m, s.a, s.b, r); });
          inner.scale.set(ir, 1, ir); rimTop.geometry.dispose(); rimTop.geometry = new THREE.RingGeometry(ir, 4.4, 48);
          drawT(v);
        }
        el += reduceMotion ? 0 : dt;
        arm.position.y = reduceMotion ? 0 : Math.sin(el * 0.7) * 4.6;
        bone.rotation.y += reduceMotion ? 0 : dt * 0.12;
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Lytic vs sclerotic ================= */
    {
      const id = 'bone-lesions', root = new THREE.Group();
      add(id, root, { target: V(0, -0.5, 0), pos: V(0, 6, 30), w: 17 }, { fade: 'A long bone and its X-ray' });
      const shaft = new THREE.Group(); shaft.position.y = 2.5; root.add(shaft);
      const cortex = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 18, 40, 1, true), ghost(C('bone'), 0.4)); cortex.rotation.z = Math.PI / 2; shaft.add(cortex);
      const marrow = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 18, 32), ghost(C('rbc'), 0.12)); marrow.rotation.z = Math.PI / 2; shaft.add(marrow);
      const lytic = new THREE.Group(), scl = new THREE.Group(); shaft.add(lytic); shaft.add(scl);
      const hole = ball(lytic, std(new THREE.Color(0x120c18), { emissiveIntensity: 0 }), 1, V(2, 1, 0.8)); hole.scale.set(2.2, 1.6, 1.8);
      const oclMat = std(C('plt'), { emissiveIntensity: 0.4 }), tumMat = std(C('cancer'), { emissiveIntensity: 0.45 }), oblMat = std(C('osteoid'), { emissiveIntensity: 0.4 });
      const oclList = Array.from({ length: 7 }, (_, i) => { const a = i / 7 * Math.PI * 2; return ball(lytic, oclMat, 0.42, V(2 + Math.cos(a) * 2.3, 1 + Math.sin(a) * 1.6, 1.2)); });
      const tum = [lytic, scl].map(par => Array.from({ length: 10 }, () => ball(par, tumMat, 0.28, V(2 + rr(-1.2, 1.2), rr(-0.8, 0.8), rr(-0.6, 0.6)))));
      const nod = ball(scl, std(C('mineral'), { emissiveIntensity: 0.55 }), 1, V(2, 0, 0)); nod.scale.set(2.4, 2.3, 2.3);
      Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return ball(scl, oblMat, 0.38, V(2 + Math.cos(a) * 2.6, Math.sin(a) * 2.4, 1.3)); });
      lbl('Cortex', 'bone', shaft, V(-7, 2.6, 0), id);
      lbl('Marrow', 'rbc', shaft, V(-5, 0, 2.4), id);
      lbl('Osteoclasts eat bone', 'plt', lytic, V(2, 3.6, 1), id);
      lbl('Osteoblasts add bone', 'osteoid', scl, V(2, 3.4, 1), id);
      lbl('Tumor cells', 'cancer', root, V(5.5, 2.5, 2), id);
      const xr = panel(root, 22, 6.4, 640); xr.mesh.position.set(0, -5.6, -1);
      lbl('X-ray (schematic)', 'electron', xr.mesh, V(-8.5, 3.6, 0), id);
      function drawX(v) {
        xr.draw((c, w, h) => {
          c.fillStyle = '#05070a'; c.fillRect(0, 0, w, h);
          const y0 = h * 0.28, y1 = h * 0.72;
          c.fillStyle = '#5c6470'; c.fillRect(30, y0, w - 60, y1 - y0);                       // medullary bone
          const grd = c.createLinearGradient(0, y0, 0, y1);
          grd.addColorStop(0, '#eef2f6'); grd.addColorStop(0.16, '#9aa3ae'); grd.addColorStop(0.5, '#5c6470'); grd.addColorStop(0.84, '#9aa3ae'); grd.addColorStop(1, '#eef2f6');
          c.fillStyle = grd; c.fillRect(30, y0, w - 60, y1 - y0);
          const cx = w / 2 + w * 2 / 22, cy = h / 2;
          if (v === 'lytic') {
            c.fillStyle = '#15181d'; c.beginPath();
            for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 48 + 6 * Math.sin(a * 3) + 4 * Math.cos(a * 5); c.lineTo(cx + Math.cos(a) * r * 1.3, cy - 12 + Math.sin(a) * r * 0.9); }
            c.fill();
          } else if (v === 'sclerotic') {
            const rg = c.createRadialGradient(cx, cy, 8, cx, cy, 70);
            rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.6, 'rgba(240,244,248,.85)'); rg.addColorStop(1, 'rgba(240,244,248,0)');
            c.fillStyle = rg; c.beginPath(); c.ellipse(cx, cy, 78, 62, 0, 0, Math.PI * 2); c.fill();
          }
          c.fillStyle = '#c9d4e3'; c.font = '600 22px "IBM Plex Mono", monospace'; c.textAlign = 'right';
          c.fillText(v === 'lytic' ? 'lucent: bone destroyed' : v === 'sclerotic' ? 'dense: new bone' : 'normal cortex and medulla', w - 40, h - 16);
        });
      }
      let cur = null, el = 0;
      function draw(dt) {
        const v = LESSON['bone-lesion'] || 'normal';
        if (v !== cur) { cur = v; drawX(v); }
        lytic.visible = v === 'lytic'; scl.visible = v === 'sclerotic';
        el += reduceMotion ? 0 : dt;
        oclList.forEach((m, i) => m.scale.setScalar(0.42 + 0.06 * Math.sin(el * 3 + i)));
        tum.flat().forEach((m, i) => { m.position.x += reduceMotion ? 0 : Math.sin(el * 1.5 + i) * dt * 0.08; });
        nod.material.emissiveIntensity = 0.45 + 0.15 * Math.sin(el * 2);
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
