/* Mitochondrial dynamics: DRP1 fission and mitofusin/OPA1 fusion, reactive oxygen species and the antioxidant relay,
   and PINK1/Parkin mitophagy.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osOx: link('https://openstax.org/books/biology-2e/pages/7-4-oxidative-phosphorylation', 'OpenStax Biology 2e, 7.4 Oxidative Phosphorylation'),
  youle: link('https://doi.org/10.1126/science.1219855', 'Youle &amp; van der Bliek, mitochondrial fission, fusion, and stress (Science, 2012)'),
  murphy: link('https://doi.org/10.1042/BJ20081386', 'Murphy, how mitochondria produce reactive oxygen species (Biochem J, 2009)'),
  sies: link('https://doi.org/10.1038/s41580-020-0230-3', 'Sies &amp; Jones, reactive oxygen species as pleiotropic physiological signaling agents (Nat Rev Mol Cell Biol, 2020)'),
  pickles: link('https://doi.org/10.1016/j.cub.2018.01.004', 'Pickles, Vigié &amp; Youle, mitophagy and quality control mechanisms in mitochondrial maintenance (Curr Biol, 2018)'),
  narendra: link('https://doi.org/10.1371/journal.pbio.1000298', 'Narendra et al., PINK1 is selectively stabilized on impaired mitochondria to activate Parkin (PLoS Biol, 2010)'),
};
const DYN = {
  fusion: 'Fusion: mitofusins MFN1 and MFN2 on neighboring outer membranes reach across and tether them, then pull them together using GTP. OPA1 then fuses the inner membranes. The merged mitochondrion shares its contents, so a partly damaged unit can borrow healthy mtDNA copies and proteins from its partner, and long networks form when cells need to make the most ATP.',
  fission: 'Fission: an ER tubule wraps the mitochondrion and marks the spot. DRP1 is recruited from the cytosol, spirals into a ring and constricts using GTP until the tube splits. Fission makes new mitochondria for dividing cells, lets mitochondria travel down long axons, and separates a damaged piece so it can be removed by mitophagy.',
};
const ROS = {
  balanced: 'Balanced: a small fraction of electrons leak from complexes I and III straight onto oxygen, forming superoxide (O₂•⁻). Superoxide dismutase (SOD2 in the matrix) turns it into hydrogen peroxide, and glutathione peroxidase and catalase turn that into water. Glutathione is then recharged by glutathione reductase using NADPH. At these low levels, H₂O₂ also works as a signal.',
  overload: 'Overwhelmed: when the chain is backed up, as when blood returns to a heart after a blocked artery is opened (reperfusion injury), superoxide is made faster than it can be cleared. Radicals attack membrane lipids, proteins and mtDNA, which lies close to the chain, and severe damage can trigger cell death.',
  nadph: 'Low NADPH: without enough NADPH, glutathione cannot be recharged, so hydrogen peroxide builds up. In G6PD deficiency, red blood cells, which have no other source of NADPH than the pentose phosphate pathway, can burst (hemolysis) after oxidant drugs, infections or fava beans.',
};
const PINK = {
  healthy: 'Healthy: the inner membrane holds a strong voltage, so PINK1 is pulled through the TOM and TIM import channels into the inner membrane, where the protease PARL cuts it. The fragment is degraded, so PINK1 never builds up on the surface.',
  damaged: 'Depolarized: a damaged mitochondrion loses its membrane voltage and can no longer import PINK1. PINK1 piles up on the outer membrane and phosphorylates ubiquitin and Parkin. Activated Parkin coats surface proteins with ubiquitin chains, which recruit adaptor proteins and LC3, so an autophagosome forms around the mitochondrion and delivers it to a lysosome.',
  pd: 'PINK1 or Parkin loss: mutations in PINK1 (PARK6) or Parkin (PRKN) cause early-onset forms of Parkinson disease. Damaged mitochondria are not flagged, so they linger, leak electrons and reactive oxygen species, and dopamine neurons, which have high energy demands, are especially vulnerable.',
};
whenLesson('mito-dyn', v => setCaption('mitoDynCaption', DYN[v]));
whenLesson('mito-ros', v => setCaption('mitoRosCaption', ROS[v]));
whenLesson('mito-pink', v => setCaption('mitoPinkCaption', PINK[v]));

const CHAPTERS = [
  {
    id: 'mito-dynamics', short: 'Fission & fusion', where: 'Mitochondria in the cytoplasm',
    title: 'A network that divides and merges',
    legend: [['mito', 'Mitochondria'], ['drp1', 'DRP1 ring'], ['mfn', 'Mitofusins (MFN1/2)'], ['nadh', 'OPA1 (inner membrane)'], ['er', 'ER tubule'], ['electron', 'mtDNA nucleoids']],
    html: () => `
      <p class="lede">Textbook pictures show mitochondria as separate beans, but in living cells they form a moving network that constantly <b>divides</b> and <b>fuses</b>. The balance between the two shapes the network to suit the cell’s needs.</p>
      ${lessonSeg('mito-dyn', 'Process', [['fusion', 'Fusion'], ['fission', 'Fission']])}
      ${caption('mitoDynCaption', DYN[LESSON['mito-dyn']])}
      <ul class="facts">
        <li>Mitochondria ride microtubules on kinesin and dynein, which is how they reach synapses at the far end of an axon.</li>
        <li>Starved cells shift toward fusion, forming long tubes that are spared from mitophagy; cells about to divide shift toward fission so each daughter gets its share.</li>
        <li>Mutations in MFN2 cause Charcot–Marie–Tooth neuropathy type 2A, and mutations in OPA1 cause dominant optic atrophy: both hit long nerve fibers with high energy needs.</li>
      </ul>
      <p><a href="#etc">The electron transport chain inside</a> · <a href="#cyto-motors">Motor proteins that move mitochondria</a> · <a href="#mito-mitophagy">What happens to the damaged piece</a></p>
      ${sources([SRC.youle, SRC.pickles, SRC.osOx], 'The network is reduced to two mitochondria and each event is sped up; fission and fusion take seconds to minutes. Membranes, cristae and protein rings are drawn schematically.')}`,
  },
  {
    id: 'mito-ros', short: 'ROS & antioxidants', where: 'The inner mitochondrial membrane and matrix',
    title: 'Electron leaks and the antioxidant relay',
    legend: [['electron', 'Electrons'], ['mito', 'Complexes I, III, IV'], ['ros', 'Superoxide'], ['radical', 'Hydrogen peroxide'], ['fix', 'SOD and glutathione peroxidase'], ['nadph', 'NADPH'], ['lesion', 'Oxidative damage']],
    html: () => `
      <p class="lede">The electron transport chain hands electrons to oxygen at complex IV, making water. A small fraction escape earlier and land on oxygen one at a time, making <b>reactive oxygen species</b> (ROS).</p>
      ${lessonSeg('mito-ros', 'Condition', [['balanced', 'Balanced'], ['overload', 'Overwhelmed'], ['nadph', 'Low NADPH']])}
      ${caption('mitoRosCaption', ROS[LESSON['mito-ros']])}
      <ul class="facts">
        <li>Older estimates put the leak at 1 to 2 percent of oxygen used; measurements in intact cells suggest it is usually far lower, rising when the chain is backed up.</li>
        <li>Hydrogen peroxide is not only a hazard: at low levels it reversibly oxidizes signaling proteins, a process called redox signaling.</li>
        <li>Large trials of antioxidant vitamin supplements have not prevented heart disease or cancer, likely because they do not reach the right place or blunt useful signals.</li>
        <li>Radiation therapy kills cells partly by making ROS from water, and well-oxygenated tumors respond better.</li>
      </ul>
      <p><a href="#etc">Where electrons normally go</a> · <a href="#branches">NADPH from the pentose phosphate pathway</a> · <a href="#damage">Radiation and free radicals</a> · <a href="#mito-mitophagy">Removing a leaky mitochondrion</a></p>
      ${sources([SRC.murphy, SRC.sies, SRC.osOx], 'Electrons and molecules are drawn as beads and the leak is greatly exaggerated so it can be seen. Real cells have several more antioxidant enzymes, such as peroxiredoxins, and other sites that make ROS.')}`,
  },
  {
    id: 'mito-mitophagy', short: 'PINK1/Parkin mitophagy', where: 'One mitochondrion and the cytosol around it',
    title: 'PINK1 and Parkin flag a failing mitochondrion',
    legend: [['mito', 'Mitochondrion'], ['proton', 'Membrane voltage'], ['kinase', 'PINK1'], ['cadherin', 'Parkin'], ['ubiq', 'Ubiquitin chains'], ['electron', 'Autophagosome'], ['lyso', 'Lysosome']],
    html: () => `
      <p class="lede">Cells keep their power supply healthy by removing faulty mitochondria in a selective form of autophagy called <b>mitophagy</b>. The best-studied trigger reads one simple signal: has this mitochondrion lost its membrane voltage?</p>
      ${lessonSeg('mito-pink', 'Mitochondrion', [['healthy', 'Healthy'], ['damaged', 'Depolarized'], ['pd', 'PINK1/Parkin loss']])}
      ${caption('mitoPinkCaption', PINK[LESSON['mito-pink']])}
      <ul class="facts">
        <li>PINK1 is a kinase and Parkin is a ubiquitin ligase; together they form a feed-forward loop, since every new phospho-ubiquitin recruits and activates more Parkin.</li>
        <li>Cells also have other mitophagy routes, such as outer-membrane receptors like NIX (BNIP3L) that bind LC3 directly; maturing red blood cells use NIX to clear all their mitochondria.</li>
        <li>If many mitochondria fail at once, cytochrome c release can push the cell into apoptosis instead of selective cleanup.</li>
      </ul>
      <p><a href="#autophagy">Autophagy in the cleanup module</a> · <a href="#apoptosis">When the cell chooses apoptosis</a> · <a href="#mito-dynamics">Fission separates the damaged piece</a> · <a href="#neurons">Neurons at risk</a></p>
      ${sources([SRC.narendra, SRC.pickles, SRC.youle], 'Steps that take tens of minutes to hours are shown in seconds, and protein counts are illustrative. Whether PINK1/Parkin mitophagy runs at the same rate in human neurons in the body is still being studied.')}`,
  },
];

CellCity.register('mitochondria', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const lerp = (a, b, u) => a + (b - a) * u;
    function mito(parent, len, r, color = 'mito') {
      const grp = new THREE.Group(); parent.add(grp);
      const outerMat = ghost(C(color), 0.24), innerMat = ghost(C(color), 0.34);
      const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 24), outerMat); o.rotation.z = Math.PI / 2; grp.add(o);
      const i = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.78, len * 0.96, 8, 24), innerMat); i.rotation.z = Math.PI / 2; grp.add(i);
      const n = Math.max(2, Math.round(len / 1.1));
      for (let j = 0; j < n; j++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, r * 1.3, r * 1.2), innerMat); c.position.x = -len / 2 + (j + 0.5) * len / n; c.rotation.x = j % 2 ? 0.3 : -0.3; grp.add(c); }
      const dna = Array.from({ length: Math.max(1, Math.round(len / 2.4)) }, (_, j) => ball(grp, std(C('electron'), { emissiveIntensity: 0.6 }), 0.16, V(-len / 2 + (j + 0.5) * len / Math.max(1, Math.round(len / 2.4)), r * 0.2, r * 0.45)));
      return { grp, outerMat, innerMat, dna };
    }
    function tint(m, color, op) { m.outerMat.color.copy(C(color)); m.innerMat.color.copy(C(color)); if (op != null) m.innerMat.opacity = op; }

    /* ================= Fission and fusion ================= */
    {
      const id = 'mito-dynamics', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(3, 6, 24), w: 12 }, { fade: 'Among the mitochondria' });
      const A = mito(root, 4, 1.25), Bm = mito(root, 4, 1.25), M = mito(root, 9.5, 1.25);
      const erT = tube(root, std(C('er'), { emissiveIntensity: 0.35, transparent: true, opacity: 0.8 }), [V(-1, 6, -3), V(0, 2, -1.2), V(0, 0, -1.7), V(0.3, -2, -1.2), V(1, -6, -3)], 0.32);
      const drpMat = std(C('drp1'), { emissiveIntensity: 0.7 });
      const drp = [-0.35, 0, 0.35].map(dx => { const t = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 8, 32), drpMat); t.rotation.y = Math.PI / 2 + 0.25; t.position.x = dx; root.add(t); return t; });
      const mfnMat = std(C('mfn'), { emissiveIntensity: 0.8 });
      const tethers = [-0.6, 0, 0.6].map(y => rod(root, mfnMat, V(-0.7, y, 0.4), V(0.7, y, 0.4), 0.09));
      const opa = ball(root, std(C('nadh'), { emissiveIntensity: 0.8 }), 0.3, V(0, 0, 0.9)); opa.add(k.glow(C('nadh'), 2));
      lbl('Mitochondrion', 'mito', A.grp, V(-1, 1.8, 0), id);
      const drpL = new THREE.Group(); root.add(drpL); lbl('DRP1 ring', 'drp1', drpL, V(0.6, 2.2, 0.6), id);
      const erL = new THREE.Group(); root.add(erL); lbl('ER tubule marks the site', 'er', erL, V(-0.6, 4.6, -2.4), id);
      const mfnL = new THREE.Group(); root.add(mfnL); lbl('MFN1/2 tethers', 'mfn', mfnL, V(0, -1.9, 0.6), id);
      const opaL = new THREE.Group(); root.add(opaL); lbl('OPA1 fuses inner membranes', 'nadh', opaL, V(0, 2.3, 1), id);
      const dmgL = new THREE.Group(); Bm.grp.add(dmgL); lbl('Damaged daughter → mitophagy', 'lesion', dmgL, V(1, -1.9, 0), id);
      lbl('mtDNA', 'electron', M.grp, V(-3.6, -1.6, 0.6), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['mito-dyn'] || 'fusion';
        el += reduceMotion ? 0 : dt;
        const u = reduceMotion ? (v === 'fusion' ? 0.5 : 0.45) : (el % 7) / 7;
        let merged, gap;
        if (v === 'fusion') {      // apart → approach → tether → merged
          gap = u < 0.4 ? lerp(5, 0.6, ease.inOut(u / 0.4)) : 0.6;
          merged = u > 0.62;
          tethers.forEach(t => { t.visible = u > 0.3 && u <= 0.62; });
          opa.visible = opaL.visible = u > 0.48 && u <= 0.75;
          mfnL.visible = u > 0.3 && u <= 0.62;
          drp.forEach(t => { t.visible = false; }); drpL.visible = false; erT.visible = erL.visible = false;
          tint(A, 'mito'); tint(Bm, 'mito'); dmgL.visible = false; M.grp.scale.set(1, 1, 1);
        } else {                   // one tube → ER contact → DRP1 constriction → two daughters
          merged = u < 0.5;
          gap = u < 0.5 ? 0.6 : lerp(0.6, 4.2, ease.out((u - 0.5) / 0.5));
          const squeeze = u < 0.12 ? 1 : u < 0.5 ? lerp(1.35, 0.25, (u - 0.12) / 0.38) : 0;
          drp.forEach(t => { t.visible = u > 0.1 && u < 0.55; t.scale.setScalar(Math.max(0.2, squeeze)); });
          drpL.visible = u > 0.1 && u < 0.55;
          erT.visible = erL.visible = u < 0.6;
          tethers.forEach(t => { t.visible = false; }); opa.visible = opaL.visible = mfnL.visible = false;
          tint(A, 'mito'); tint(Bm, u > 0.55 ? 'dead' : 'mito', u > 0.55 ? 0.2 : 0.34); dmgL.visible = u > 0.65;
          M.grp.scale.set(1, u < 0.12 ? 1 : lerp(1, 0.92, (u - 0.12) / 0.38), 1);
        }
        M.grp.visible = merged; A.grp.visible = Bm.grp.visible = !merged;
        Bm.grp.rotation.z = Math.sin(el * 0.5) * 0.05;
        A.grp.position.set(-(gap / 2 + 3.25), Math.sin(el * 0.7) * 0.1, 0); Bm.grp.position.set(gap / 2 + 3.25, Math.cos(el * 0.6) * 0.1, 0);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= ROS and antioxidants ================= */
    {
      const id = 'mito-ros', root = new THREE.Group();
      add(id, root, { target: V(0.5, -1.8, 0), pos: V(3, 5, 27), w: 14 }, { fade: 'To the inner membrane' });
      const mem = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 7), ghost(C('mito'), 0.32)); root.add(mem);
      const cMat = std(C('mito'), { emissiveIntensity: 0.35 });
      const cx = { I: -6.5, III: -1.5, IV: 3, V: 7.5 };
      const c1 = ball(root, cMat, 1, V(cx.I, 0, 0)); c1.scale.set(1.1, 1.4, 1); ball(root, cMat, 0.8, V(cx.I - 1.4, -1.6, 0));
      const c3 = ball(root, cMat, 0.95, V(cx.III, 0, 0)); c3.scale.set(1.2, 1.2, 1);
      const c4 = ball(root, cMat, 0.8, V(cx.IV, 0, 0));
      const atpS = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 14), std(C('atp'), { emissiveIntensity: 0.4 })); atpS.position.set(cx.V, 0, 0); root.add(atpS); ball(root, std(C('atp'), { emissiveIntensity: 0.4 }), 0.9, V(cx.V, -1.6, 0));
      const eStream = stream(root, std(C('electron'), { emissiveIntensity: 0.9 }), 0.14, curve([V(cx.I - 1.4, -1.6, 0.6), V(cx.I, 0, 0.9), V(cx.III, 0.2, 0.9), V(cx.IV, 0, 0.9), V(cx.IV + 0.6, -1.2, 0.9)]), 8, 0.25, C('electron'));
      const sod = ball(root, std(C('fix'), { emissiveIntensity: 0.5 }), 0.6, V(-4.4, -4.4, 0.8));
      const gpx = ball(root, std(C('fix'), { emissiveIntensity: 0.5 }), 0.6, V(0.6, -5.6, 0.8));
      const gr = ball(root, std(C('nadph'), { emissiveIntensity: 0.4 }), 0.55, V(4.6, -6.6, 0.8));
      const dna = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.12, 8, 30), std(C('electron'), { emissiveIntensity: 0.4 })); dna.position.set(-8.5, -5.5, 0); root.add(dna);
      const lipid = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 2), std(C('fat'), { emissiveIntensity: 0.2 })); lipid.position.set(-3.6, -0.6, 2.4); root.add(lipid);
      const mats = { ros: std(C('ros'), { emissiveIntensity: 0.9 }), h2o2: std(C('radical'), { emissiveIntensity: 0.6 }), water: std(C('electron'), { emissiveIntensity: 0.3 }) };
      const relay = curve([V(cx.I, -1.4, 0.6), V(-5.6, -3, 0.8), V(-4.4, -4.4, 0.8), V(-1.8, -5.4, 0.8), V(0.6, -5.6, 0.8), V(2.4, -7.6, 0.8)]);
      const relay3 = curve([V(cx.III, -1.2, 0.6), V(-3.4, -3, 0.8), V(-4.4, -4.4, 0.8), V(-1.8, -5.4, 0.8), V(0.6, -5.6, 0.8), V(2.4, -7.6, 0.8)]);
      const colorBy = (m, u) => { m.material = u < 0.36 ? mats.ros : u < 0.78 ? mats.h2o2 : mats.water; };
      const s1 = stream(root, mats.ros, 0.17, relay, 3, 0.18); s1.at = colorBy;
      const s3 = stream(root, mats.ros, 0.17, relay3, 2, 0.18); s3.at = colorBy;
      const dmg1 = stream(root, mats.ros, 0.17, curve([V(cx.I - 1, -1.2, 0.4), V(-7.6, -3.6, 0.2), V(-8.5, -5.5, 0)]), 4, 0.35, C('ros'));
      const dmg2 = stream(root, mats.ros, 0.17, curve([V(cx.III, 0.8, 0.8), V(-2.6, 0.2, 2), V(-3.6, -0.4, 2.4)]), 3, 0.35, C('ros'));
      const pile = stream(root, mats.h2o2, 0.17, curve([V(0.6, -5.6, 0.8), V(-1.6, -6.8, 1.6), V(-5, -7.2, 0.6), V(-8.5, -5.5, 0)]), 5, 0.25, C('radical'));
      const nadph = stream(root, std(C('nadph'), { emissiveIntensity: 0.7 }), 0.16, curve([V(9.5, -7.8, 0.8), V(6.6, -7.2, 0.8), V(4.6, -6.6, 0.8), V(2.4, -6.4, 0.8), V(0.8, -5.9, 0.8)]), 4, 0.25, C('nadph'));
      const dGlow = k.glow(C('lesion'), 4); dGlow.position.copy(dna.position); root.add(dGlow);
      const lGlow = k.glow(C('lesion'), 4); lGlow.position.copy(lipid.position); root.add(lGlow);
      lbl('Intermembrane space', 'electron', root, V(4.5, 2.2, -2.6), id);
      lbl('Matrix', 'electron', root, V(9.4, -3.4, -2.6), id);
      lbl('Complex I', 'mito', c1, V(0, 1.2, 0), id);
      lbl('Complex III', 'mito', c3, V(0, 1.2, 0), id);
      lbl('IV', 'mito', c4, V(0, 1.3, 0), id);
      lbl('ATP synthase', 'atp', atpS, V(0, 1.5, 0), id);
      lbl('O₂•⁻ → SOD2', 'ros', sod, V(-1.6, -0.6, 0), id);
      lbl('H₂O₂ → glutathione peroxidase', 'radical', gpx, V(-0.4, -1.1, 0), id);
      lbl('NADPH recharges glutathione', 'nadph', gr, V(2.4, -0.9, 0), id);
      lbl('mtDNA', 'electron', dna, V(0, 1.2, 0), id);
      lbl('Membrane lipids', 'fat', lipid, V(1.6, 0.6, 0), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['mito-ros'] || 'balanced';
        el += reduceMotion ? 0 : dt;
        const over = v === 'overload', low = v === 'nadph';
        s1.speed = s3.speed = over ? 0.3 : 0.18;
        dmg1.visible = dmg2.visible = over; pile.visible = low; nadph.visible = !low;
        eStream.speed = over ? 0.1 : 0.25;
        [eStream, s1, s3, dmg1, dmg2, pile, nadph].forEach(s => s.update(dt));
        const hurt = over || low;
        dGlow.visible = hurt; lGlow.visible = over;
        dGlow.material.opacity = lGlow.material.opacity = 0.5 + 0.4 * Math.sin(el * 5);
        dna.material.color.copy(C(hurt ? 'lesion' : 'electron')); dna.material.emissive.copy(dna.material.color);
        lipid.material.color.copy(C(over ? 'lesion' : 'fat')); lipid.material.emissive.copy(lipid.material.color);
        gr.material.emissiveIntensity = low ? 0.05 : 0.5;
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= PINK1/Parkin mitophagy ================= */
    {
      const id = 'mito-mitophagy', root = new THREE.Group();
      add(id, root, { target: V(0.5, 0, 0), pos: V(3, 5, 24), w: 12 }, { fade: 'Watching one mitochondrion' });
      const M = mito(root, 5, 1.7);
      const volt = k.glow(C('proton'), 9); M.grp.add(volt);
      const tom = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 12), std(C('electron'), { emissiveIntensity: 0.4 })); tom.position.set(-1.5, 1.6, 0.5); root.add(tom);
      const pMat = std(C('kinase'), { emissiveIntensity: 0.7 });
      const importS = stream(root, pMat, 0.2, curve([V(-6, 5, 1), V(-3.4, 3.4, 0.8), V(-1.5, 1.9, 0.5), V(-1.3, 0.9, 0.4), V(-0.6, 0.6, 0.6)]), 4, 0.25, C('kinase'));
      importS.at = (m, u) => { m.scale.setScalar(0.2 * (u > 0.8 ? Math.max(0.05, (1 - u) / 0.2) : 1)); };
      const surf = [];
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, x = -2.6 + (i % 5) * 1.3; surf.push(V(x, Math.cos(a) * 1.85, Math.sin(a) * 1.85)); }
      const pinks = surf.map(p => { const m = ball(root, pMat, 0.2, p); m.visible = false; return m; });
      const parkMat = std(C('cadherin'), { emissiveIntensity: 0.7 });
      const parks = surf.map(p => { const m = ball(root, parkMat, 0.24, p.clone().multiplyScalar(1).add(V(0, Math.sign(p.y) * 0.4, Math.sign(p.z) * 0.3))); m.visible = false; return m; });
      const ubMat = std(C('ubiq'), { emissiveIntensity: 0.7 });
      const ubs = surf.map(p => Array.from({ length: 3 }, (_, j) => { const d = p.clone().setLength(p.length() + 0.45 + j * 0.3); d.x = p.x + j * 0.12; const m = ball(root, ubMat, 0.13, d); m.visible = false; return m; }));
      // the autophagosome membrane closes around the mitochondrion: one pre-built cap per step of the wrap
      const caps = Array.from({ length: 21 }, (_, i) => new THREE.SphereGeometry(1, 32, 20, 0, Math.PI * 2, 0, Math.PI * Math.max(0.02, i / 20)));
      const phago = new THREE.Mesh(caps[20], ghost(C('electron'), 0.18)); root.add(phago);
      const phRim = new THREE.Mesh(k.sphere, k.fresnelMat(C('electron'), 1.2, 2.4)); phago.add(phRim);
      const lyso = body(root, C('lyso'), 1.5, V(8, -2, 0), 0.35);
      const rosS = stream(root, std(C('ros'), { emissiveIntensity: 0.9 }), 0.15, curve([V(2, 1, 1.6), V(4, 2.6, 2.6), V(6, 3.6, 3)]), 4, 0.35, C('ros'));
      lbl('TOM import channel', 'electron', tom, V(-1.6, 0.6, 0), id);
      const pinkIn = new THREE.Group(); root.add(pinkIn); lbl('PINK1 imported and cut', 'kinase', pinkIn, V(-5.2, 5.6, 1), id);
      const pinkOn = new THREE.Group(); root.add(pinkOn); lbl('PINK1 builds up', 'kinase', pinkOn, V(-5.4, 0.2, 0.6), id);
      const parkL = new THREE.Group(); root.add(parkL); lbl('Parkin', 'cadherin', parkL, V(1.2, 2.9, 0.6), id);
      const ubL = new THREE.Group(); root.add(ubL); lbl('Phospho-ubiquitin chains', 'ubiq', ubL, V(-0.4, -3.3, 1.2), id);
      const phL = new THREE.Group(); root.add(phL); lbl('Autophagosome', 'electron', phL, V(0, 4.4, 0), id);
      lbl('Lysosome', 'lyso', lyso, V(0, 1.9, 0), id);
      const vL = new THREE.Group(); root.add(vL); lbl('Membrane voltage', 'proton', vL, V(3.2, -2.4, 1), id);
      const rosL = new THREE.Group(); root.add(rosL); lbl('Leaking ROS', 'ros', rosL, V(6.2, 4.2, 3), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['mito-pink'] || 'healthy';
        el += reduceMotion ? 0 : dt;
        const healthy = v === 'healthy';
        volt.visible = vL.visible = healthy; volt.material.opacity = 0.35 + 0.15 * Math.sin(el * 2);
        tint(M, healthy ? 'mito' : 'dead', healthy ? 0.34 : 0.22);
        importS.visible = pinkIn.visible = healthy; importS.update(dt);
        pinkOn.visible = v === 'damaged';
        const u = reduceMotion ? 0.62 : (el % 9) / 9;
        const tagging = v === 'damaged';
        pinks.forEach((m, i) => { m.visible = v !== 'healthy' && (v === 'pd' ? false : u > i * 0.02); });
        parks.forEach((m, i) => { m.visible = tagging && u > 0.15 + i * 0.02; });
        ubs.forEach((arr, i) => arr.forEach((m, j) => { m.visible = tagging && u > 0.3 + i * 0.015 + j * 0.03; }));
        parkL.visible = tagging && u > 0.2; ubL.visible = tagging && u > 0.35;
        const wrap = tagging ? Math.max(0, Math.min(1, (u - 0.5) / 0.2)) : 0;
        phago.visible = phL.visible = wrap > 0;
        phago.scale.set(4.2, 2.6, 2.6);
        phago.geometry = caps[Math.round(wrap * 20)];
        phago.rotation.z = Math.PI / 2;
        phRim.visible = wrap >= 1;
        const fuse = tagging ? Math.max(0, (u - 0.75) / 0.2) : 0;
        lyso.position.set(lerp(8, 4.6, Math.min(1, fuse)), lerp(-2, -0.8, Math.min(1, fuse)), 0);
        lyso.children[0].material.opacity = fuse > 0.9 ? 0.5 : 0.35;
        M.grp.scale.setScalar(tagging && u > 0.92 ? Math.max(0.3, 1 - (u - 0.92) * 8) : 1);
        rosS.visible = rosL.visible = v === 'pd'; rosS.update(dt);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
