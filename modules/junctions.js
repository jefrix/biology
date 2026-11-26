/* Cell junctions: tight junctions as gate and fence, adherens belts and desmosomes under shear, and connexin gap junctions.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osConn: link('https://openstax.org/books/biology-2e/pages/4-6-connections-between-cells-and-cellular-activities', 'OpenStax Biology 2e, 4.6 Connections between Cells and Cellular Activities'),
  osTissue: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/4-1-types-of-tissues', 'OpenStax Anatomy &amp; Physiology 2e, 4.1 Types of Tissues'),
  zihni: link('https://doi.org/10.1038/nrm.2016.80', 'Zihni, Mills, Matter &amp; Balda, tight junctions: from simple barriers to multifunctional molecular gates (Nat Rev Mol Cell Biol, 2016)'),
  anderson: link('https://doi.org/10.1101/cshperspect.a002584', 'Anderson &amp; Van Itallie, physiology and function of the tight junction (Cold Spring Harb Perspect Biol, 2009)'),
  garrod: link('https://doi.org/10.1016/j.bbamem.2007.07.014', 'Garrod &amp; Chidgey, desmosome structure, composition and function (Biochim Biophys Acta, 2008)'),
  pemphigus: link('https://doi.org/10.1038/nrdp.2017.26', 'Kasperkiewicz et al., pemphigus (Nat Rev Dis Primers, 2017)'),
  goodenough: link('https://doi.org/10.1101/cshperspect.a002576', 'Goodenough &amp; Paul, gap junctions (Cold Spring Harb Perspect Biol, 2009)'),
};
const TIGHT = {
  sealed: 'Sealed (gate and fence): rows of claudin and occludin strands stitch neighboring membranes together near the top of the cells. As a gate, they block the gap between cells, so ions, sugars and proteins must go through the cells and their transporters. As a fence, they stop apical proteins, such as SGLT1, from drifting into the basolateral membrane where the Na⁺/K⁺ pump sits.',
  leaky: 'Leaky epithelium (claudin-2): the proximal tubule and small intestine use claudin-2, which forms tiny pores selective for sodium and water. Large amounts of salt and water can then follow the gradients between cells, while proteins are still kept out.',
  lost: 'Junction lost: inflammation, low oxygen or bacterial toxins can open tight junctions. The gate fails, so even large molecules leak between cells, and the fence fails, so apical and basolateral proteins mix and the cell loses its direction of transport.',
};
const ANCHOR = {
  belt: 'Adherens belt: E-cadherin proteins from neighboring cells grip each other in a calcium-dependent handshake. Inside, catenins link them to a ring of actin that can contract, letting a sheet of cells fold, close wounds and stay in contact.',
  weld: 'Desmosome spot welds: desmoglein and desmocollin cadherins meet in the gap, and dense plaques inside each cell anchor them to tough intermediate filaments, keratin in skin and gut lining or desmin in heart muscle, joining the whole tissue into one strong mesh.',
  shear: 'Shear stress: when the tissue is pulled or rubbed, the intermediate filament network spreads the load from desmosome to desmosome, so cells stretch rather than tear apart. Skin and heart muscle, which take the most mechanical stress, are packed with desmosomes.',
  pemphigus: 'Pemphigus: autoantibodies attack desmoglein 3 (and desmoglein 1), so the spot welds let go. Under shear, skin and mouth-lining cells separate from each other (acantholysis), forming fragile blisters and painful erosions.',
};
const GAP = {
  open: 'Open: six connexin proteins form a connexon (hemichannel) in each membrane, and two connexons dock across the narrow gap to make one channel. Ions and small molecules under about 1 kilodalton, such as cAMP, IP₃ and glucose, pass straight from cell to cell, so electrical current spreads and neighbors stay coordinated.',
  closed: 'Closed: acidity, high calcium or phosphorylation make the connexins twist the pore shut. An injured or dying cell is sealed off this way so its damage does not spread. In scarred heart muscle, fewer and misplaced gap junctions slow conduction and can trigger arrhythmias.',
};
whenLesson('junc-tight', v => setCaption('juncTightCaption', TIGHT[v]));
whenLesson('junc-anchor', v => setCaption('juncAnchorCaption', ANCHOR[v]));
whenLesson('junc-gap', v => setCaption('juncGapCaption', GAP[v]));

const CHAPTERS = [
  {
    id: 'junc-tight', short: 'Tight junctions', where: 'Two neighboring epithelial cells',
    title: 'Tight junctions: gate and fence',
    legend: [['membrane', 'Epithelial cells'], ['claudin', 'Claudin and occludin strands'], ['gut', 'Apical protein'], ['pump', 'Basolateral protein'], ['sodium', 'Sodium and water'], ['drug', 'Large molecule']],
    html: () => `
      <p class="lede">An epithelium is only a barrier if the gaps between its cells are closed. <b>Tight junctions</b> do this, and they also split each cell’s membrane into a top (<b>apical</b>) face and a bottom-and-sides (<b>basolateral</b>) face.</p>
      ${lessonSeg('junc-tight', 'Junction', [['sealed', 'Sealed'], ['leaky', 'Leaky (claudin-2)'], ['lost', 'Junction lost']])}
      ${caption('juncTightCaption', TIGHT[LESSON['junc-tight']])}
      <ul class="facts">
        <li>Humans have more than 20 claudins. Which ones a tissue makes sets how tight it is: the bladder and brain capillaries are very tight; the proximal tubule and small intestine are leaky.</li>
        <li>Inside the cell, scaffold proteins such as ZO-1 tie the strands to actin, which is how stains for ZO-1 outline every cell in an epithelium.</li>
        <li>Mutations in claudin-16 or claudin-19 cause the kidney to waste magnesium and calcium, because those ions normally return to the blood between cells in the loop of Henle.</li>
      </ul>
      <p><a href="#epithelia">Polarized epithelia in transport</a> · <a href="#bbb-unit">The tightest junctions: the blood–brain barrier</a> · <a href="#proximal-tubule">A leaky epithelium: the proximal tubule</a> · <a href="#gut-sglt1">The gut lining</a></p>
      ${sources([SRC.zihni, SRC.anderson, SRC.osConn], 'The cells are drawn as two simple blocks with a wide gap; in life the membranes nearly touch at each strand. Particles are enlarged and their paths simplified.')}`,
  },
  {
    id: 'junc-anchor', short: 'Adherens & desmosomes', where: 'Two cells held together under tension',
    title: 'Adherens belts and desmosome spot welds',
    legend: [['membrane', 'Cell membranes'], ['cadherin', 'Cadherins'], ['actin', 'Actin belt'], ['ifil', 'Keratin filaments'], ['electron', 'Desmosome plaque'], ['antibody', 'Pemphigus antibodies']],
    html: () => `
      <p class="lede">Tight junctions seal, but two other junctions hold the tissue together. Both use <b>cadherins</b> to bridge the gap; they differ in which part of the cytoskeleton they grip.</p>
      ${lessonSeg('junc-anchor', 'View', [['belt', 'Adherens belt'], ['weld', 'Desmosomes'], ['shear', 'Shear stress'], ['pemphigus', 'Pemphigus']])}
      ${caption('juncAnchorCaption', ANCHOR[LESSON['junc-anchor']])}
      <ul class="facts">
        <li><b>Adherens junction</b>: a continuous belt just below the tight junction, linked to actin. Loss of E-cadherin helps cancer cells break away and spread.</li>
        <li><b>Desmosome</b>: a button-like spot weld, linked to intermediate filaments. Inherited desmosome defects cause blistering skin diseases and arrhythmogenic cardiomyopathy.</li>
        <li><b>Hemidesmosomes</b> use integrins rather than cadherins to fix the bottom of the cell to the basement membrane; antibodies against them cause bullous pemphigoid.</li>
      </ul>
      <p><a href="#cyto-filaments">Actin and intermediate filaments</a> · <a href="#gut-sglt1">The gut lining these junctions hold together</a> · <a href="#cancer-spread">When cells let go: metastasis</a> · <a href="#junc-gap">Next: gap junctions</a></p>
      ${sources([SRC.garrod, SRC.pemphigus, SRC.osConn], 'Junctions are drawn larger and fewer than in life, and the gap between cells is widened. Shear is shown as a simple sliding motion; real tissue stretches in many directions at once.')}`,
  },
  {
    id: 'junc-gap', short: 'Gap junctions', where: 'Two adjacent membranes, about 2 to 3 nm apart',
    title: 'Gap junctions: channels between cells',
    legend: [['membrane', 'Cell membranes'], ['connexin', 'Connexins'], ['potassium', 'Ions'], ['camp', 'cAMP and IP₃'], ['drug', 'Protein (too large)'], ['sa', 'Electrical activation']],
    html: () => `
      <p class="lede">A <b>gap junction</b> is a direct tunnel from one cell’s cytoplasm to the next. It lets current and small signals spread through a tissue without passing through the outside fluid.</p>
      ${lessonSeg('junc-gap', 'Channel', [['open', 'Open'], ['closed', 'Closed']])}
      ${caption('juncGapCaption', GAP[LESSON['junc-gap']])}
      <ul class="facts">
        <li>In the heart, connexin-43 gap junctions in the intercalated discs let the wave of excitation spread from cell to cell, so the muscle contracts as one unit.</li>
        <li>Smooth muscle in the gut and uterus is coupled the same way; gap junctions multiply in the uterus near the end of pregnancy to coordinate labor contractions.</li>
        <li>Mutations in connexin-26 are among the most common causes of inherited hearing loss, and connexin-32 mutations cause one form of Charcot–Marie–Tooth neuropathy.</li>
      </ul>
      <p><a href="#pacemaker">Gap junctions in the heart’s conduction system</a> · <a href="#muscle-tissues">Cardiac and smooth muscle</a> · <a href="#synapse">Electrical synapses in the brain</a> · <a href="#sig-calcium">The second messengers they share</a></p>
      ${sources([SRC.goodenough, SRC.osConn, SRC.osTissue], 'The scene shows three channels; a real gap junction plaque packs hundreds to thousands of them. Connexins are drawn as rods and the closing motion is simplified.')}`,
  },
];

CellCity.register('junctions', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, setRod, tube, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const lerp = (a, b, u) => a + (b - a) * u;
    function cell(parent, x, w, h, d, opacity = 0.22) {
      const grp = new THREE.Group(); grp.position.x = x; parent.add(grp);
      const geo = new THREE.BoxGeometry(w, h, d);
      grp.add(new THREE.Mesh(geo, ghost(C('membrane'), opacity)));
      grp.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: C('membrane') })));
      return grp;
    }

    /* ================= Tight junctions ================= */
    {
      const id = 'junc-tight', root = new THREE.Group();
      add(id, root, { target: V(0, 0.5, 0), pos: V(9, 7, 24), w: 12 }, { fade: 'Between two epithelial cells' });
      const W = 6, H = 8, D = 6, GAP = 0.5;
      [-1, 1].forEach(s => { const c = cell(root, s * (W / 2 + GAP / 2), W, H, D); k.ball(c, std(C('nucleus'), { emissiveIntensity: 0.2 }), 1.1, V(0, -1, 0)); });
      const clMat = std(C('claudin'), { emissiveIntensity: 0.6, transparent: true, opacity: 1 });
      const strands = [3.0, 3.35, 3.7].map(y => rod(root, clMat, V(0, y, -D / 2), V(0, y, D / 2), 0.13));
      const kisses = [];
      [3.0, 3.35, 3.7].forEach(y => { for (let z = -2.5; z <= 2.5; z += 1) kisses.push(rod(root, clMat, V(-GAP / 2, y, z), V(GAP / 2, y, z), 0.07)); });
      // apical and basolateral membrane proteins: each has a home and a mixed position
      const apMat = std(C('gut'), { emissiveIntensity: 0.55 }), blMat = std(C('pump'), { emissiveIntensity: 0.5 });
      const prots = [];
      [-1, 1].forEach(s => {
        const cx = s * (W / 2 + GAP / 2);
        for (let i = 0; i < 6; i++) prots.push({ m: ball(root, apMat, 0.26), home: V(cx + rr(-2.6, 2.6), H / 2 + 0.05, rr(-2.6, 2.6)), mix: V(cx - s * W / 2 * 1.02, rr(-3.6, 3.6), rr(-2.6, 2.6)) });
        for (let i = 0; i < 6; i++) prots.push({ m: ball(root, blMat, 0.26), home: V(cx - s * W / 2 * 1.02, rr(-3.6, 2.2), rr(-2.6, 2.6)), mix: V(cx + rr(-2.6, 2.6), H / 2 + 0.05, rr(-2.6, 2.6)) });
      });
      const naPath = curve([V(-0.5, 7, 1.2), V(0, 4.2, 1.2), V(0, 2, 1.2), V(0, -2, 1.2), V(0.4, -6, 1.2)]);
      const naStop = curve([V(-0.5, 7, 1.2), V(0, 4.3, 1.2), V(-0.6, 5.2, 1.2), V(-0.5, 7, 1.2)]);
      const bigPath = curve([V(0.6, 7, -1.5), V(0, 4.2, -1.5), V(0, 0, -1.5), V(0, -6, -1.5)]);
      const bigStop = curve([V(0.6, 7, -1.5), V(0, 4.4, -1.5), V(0.8, 5.4, -1.5), V(0.6, 7, -1.5)]);
      const na = stream(root, std(C('sodium'), { emissiveIntensity: 0.7 }), 0.17, naStop, 5, 0.3, C('sodium'));
      const big = stream(root, std(C('drug'), { emissiveIntensity: 0.6 }), 0.38, bigStop, 3, 0.2, C('drug'));
      lbl('Apical (lumen) side', 'gut', root, V(-6, 4.9, -3), id);
      lbl('Basolateral side', 'pump', root, V(-7.6, -3.5, 3), id);
      lbl('Claudin strands', 'claudin', root, V(0, 3.4, 3.6), id);
      lbl('Gap between cells', 'membrane', root, V(0.2, -4.6, 3.4), id);
      let mix = 0;
      function draw(dt) {
        const v = LESSON['junc-tight'] || 'sealed';
        const lost = v === 'lost';
        mix = reduceMotion ? (lost ? 1 : 0) : Math.max(0, Math.min(1, mix + (lost ? dt * 0.25 : -dt * 0.6)));
        prots.forEach(p => p.m.position.lerpVectors(p.home, p.mix, mix * 0.85));
        clMat.opacity = lost ? 0.15 : 1; clMat.color.copy(C(lost ? 'dead' : 'claudin')); clMat.emissive.copy(clMat.color);
        strands.forEach((s, i) => { s.scale.x = s.scale.z = v === 'leaky' && i === 1 ? 0.07 : 0.13; });
        na.curve = v === 'sealed' ? naStop : naPath; big.curve = lost ? bigPath : bigStop;
        na.update(dt); big.update(dt);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Adherens belts and desmosomes ================= */
    {
      const id = 'junc-anchor', root = new THREE.Group();
      add(id, root, { target: V(0.4, 0, 0), pos: V(7, 5, 25), w: 12 }, { fade: 'Junctions under tension' });
      const W = 6, H = 9, D = 6, GAP = 0.9, xl = -(W / 2 + GAP / 2), xr = W / 2 + GAP / 2;
      const left = cell(root, xl, W, H, D), right = cell(root, xr, W, H, D);
      const caMat = std(C('cadherin'), { emissiveIntensity: 0.55 });
      const acMat = std(C('actin'), { emissiveIntensity: 0.5 });
      // adherens belt: an actin ring in each cell and cadherin bridges at y = 2.6
      [left, right].forEach(c => tube(c, acMat, [V(-2.6, 2.6, -2.6), V(2.6, 2.6, -2.6), V(2.6, 2.6, 2.6), V(-2.6, 2.6, 2.6)], 0.12, true, 60));
      const links = [];
      for (let z = -2.4; z <= 2.4; z += 0.8) links.push({ m: rod(root, caMat, V(0, 0, 0), V(1, 0, 0), 0.08), y: 2.6, z, kind: 'adh' });
      // desmosomes: plaques on both membranes, cadherin rods between and keratin loops into each cell
      const plMat = std(C('electron'), { emissiveIntensity: 0.3 }), kMat = std(C('ifil'), { emissiveIntensity: 0.45 });
      const welds = [[-0.6, 1.6], [-2.8, -1.4], [-1.6, 0.2]].map(([y, z]) => {
        const pl = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 1.1), plMat); pl.position.set(W / 2 - 0.1, y, z); left.add(pl);
        const pr = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 1.1), plMat); pr.position.set(-W / 2 + 0.1, y, z); right.add(pr);
        tube(left, kMat, [V(W / 2 - 0.2, y + 0.3, z), V(0.5, y + 2.2, z - 0.6), V(-1.8, y + 0.4, z + 0.4), V(-0.6, y - 1.6, z), V(W / 2 - 0.2, y - 0.3, z)], 0.07, false, 50);
        tube(right, kMat, [V(-W / 2 + 0.2, y + 0.3, z), V(-0.5, y + 2, z + 0.6), V(1.8, y + 0.3, z - 0.4), V(0.6, y - 1.7, z), V(-W / 2 + 0.2, y - 0.3, z)], 0.07, false, 50);
        for (let dy = -0.35; dy <= 0.36; dy += 0.35) for (let dz = -0.35; dz <= 0.36; dz += 0.35) links.push({ m: rod(root, caMat, V(0, 0, 0), V(1, 0, 0), 0.06), y: y + dy, z: z + dz, kind: 'des' });
        return { y, z };
      });
      // keratin also runs between desmosomes inside each cell
      tube(left, kMat, [V(W / 2 - 0.2, -0.6, 1.6), V(1, -1.6, 0.6), V(W / 2 - 0.2, -2.8, -1.4)], 0.06, false, 30);
      tube(right, kMat, [V(-W / 2 + 0.2, -0.6, 1.6), V(-1, -2, 0.4), V(-W / 2 + 0.2, -2.8, -1.4)], 0.06, false, 30);
      const abMat = std(C('antibody'), { emissiveIntensity: 0.7 });
      const abs = welds.flatMap(w => [0, 1, 2].map(i => { const m = ball(root, abMat, 0.16, V(0, w.y + (i - 1) * 0.4, w.z + 0.2)); m.visible = false; return m; }));
      lbl('Adherens belt · E-cadherin', 'cadherin', root, V(0, 3.4, 3.2), id);
      lbl('Actin ring', 'actin', left, V(-2.6, 3.4, 2.6), id);
      lbl('Desmosome', 'electron', root, V(0.2, -0.6, 2.6), id);
      lbl('Keratin filaments', 'ifil', right, V(2, -3.6, 0), id);
      const abL = new THREE.Group(); root.add(abL); lbl('Anti-desmoglein antibodies', 'antibody', abL, V(1.5, -4.6, 2), id);
      let el = 0, sep = 0;
      function draw(dt) {
        const v = LESSON['junc-anchor'] || 'belt';
        el += reduceMotion ? 0 : dt;
        const shear = v === 'shear' || v === 'pemphigus' ? (reduceMotion ? 0.6 : Math.sin(el * 1.6) * 0.9) : 0;
        sep = reduceMotion ? (v === 'pemphigus' ? 1.4 : 0) : lerp(sep, v === 'pemphigus' ? 1.4 : 0, Math.min(1, dt * 1.5));
        right.position.set(xr + sep, shear, 0);
        links.forEach(l => {
          const a = V(xl + W / 2, l.y, l.z), b = V(xr - W / 2 + sep, l.y + shear, l.z);
          const broken = v === 'pemphigus' && l.kind === 'des';
          l.m.visible = !broken; if (!broken) setRod(l.m, a, b, l.kind === 'adh' ? 0.08 : 0.06);
        });
        caMat.emissiveIntensity = v === 'belt' ? 0.9 : 0.4;
        acMat.emissiveIntensity = v === 'belt' ? 0.8 + 0.2 * Math.sin(el * 3) : 0.3;
        kMat.emissiveIntensity = v === 'weld' || v === 'shear' ? 0.85 : 0.3;
        plMat.emissiveIntensity = v === 'weld' ? 0.8 : 0.3;
        abs.forEach((m, i) => { m.visible = v === 'pemphigus'; m.position.x = sep * 0.5 + Math.sin(el * 2 + i) * 0.1; });
        abL.visible = v === 'pemphigus';
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Gap junctions ================= */
    {
      const id = 'junc-gap', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(6, 5, 24), w: 12 }, { fade: 'Down to the connexons' });
      const memMat = ghost(C('membrane'), 0.3);
      [-1, 1].forEach(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 11, 7), memMat); m.position.x = s * 1.5; root.add(m); });
      const cxMat = std(C('connexin'), { emissiveIntensity: 0.45 });
      const chans = [[2.8, 1], [-0.4, -1.2], [-3.4, 0.9]].map(([y, z]) => {
        const grp = new THREE.Group(); grp.position.set(0, y, z); root.add(grp);
        const halves = [-1, 1].map(s => {
          const h = new THREE.Group(); h.position.x = s * 1.25; grp.add(h);
          const rods = [];
          for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; rods.push({ m: rod(h, cxMat, V(-1.25, 0, 0), V(1.25, 0, 0), 0.24), a }); }
          return { h, rods, s };
        });
        return { grp, halves, y, z };
      });
      const ionPath = (c, dz) => curve([V(-6, c.y + 1.5, c.z + dz), V(-2.6, c.y, c.z + dz * 0.2), V(2.6, c.y, c.z + dz * 0.2), V(6, c.y - 1.2, c.z + dz)]);
      const bounce = (c, dz) => curve([V(-6, c.y + 1.5, c.z + dz), V(-3.2, c.y, c.z + dz * 0.2), V(-5, c.y - 1, c.z + dz)]);
      const ions = chans.map(c => ({ c, a: ionPath(c, 0.4), b: bounce(c, 0.4), s: stream(root, std(C('potassium'), { emissiveIntensity: 0.7 }), 0.14, ionPath(c, 0.4), 4, 0.35, C('potassium')) }));
      const msg = [chans[1]].map(c => ({ c, a: ionPath(c, -0.4), b: bounce(c, -0.4), s: stream(root, std(C('camp'), { emissiveIntensity: 0.7 }), 0.18, ionPath(c, -0.4), 3, 0.22, C('camp')) }));
      const prot = stream(root, std(C('drug'), { emissiveIntensity: 0.5 }), 0.5, curve([V(-6.5, 4.6, -2), V(-3.4, 2.8, -1), V(-5.6, 1.2, -2)]), 2, 0.15);
      const glowL = k.glow(C('sa'), 9); glowL.position.set(-6, 0, 0); root.add(glowL);
      const glowR = k.glow(C('sa'), 9); glowR.position.set(6, 0, 0); root.add(glowR);
      lbl('Cell 1 cytoplasm', 'electron', root, V(-6, 5.8, 0), id);
      lbl('Cell 2 cytoplasm', 'electron', root, V(6, 5.8, 0), id);
      lbl('Connexon · 6 connexins', 'connexin', chans[2].grp, V(0, -1.9, 1), id);
      lbl('K⁺ and other ions', 'potassium', root, V(4.6, 3, 2.4), id);
      lbl('cAMP · IP₃', 'camp', root, V(4.8, -2.4, -2), id);
      lbl('Too large to pass', 'drug', root, V(-5.6, 3.8, -2.4), id);
      let el = 0, tw = 0;
      function draw(dt) {
        const open = (LESSON['junc-gap'] || 'open') === 'open';
        el += reduceMotion ? 0 : dt;
        tw = reduceMotion ? (open ? 0 : 1) : lerp(tw, open ? 0 : 1, Math.min(1, dt * 2.5));
        chans.forEach(c => c.halves.forEach(h => h.rods.forEach(r => {
          const rad = 0.62 - 0.3 * tw, ang = r.a + h.s * tw * 0.5;
          const off = V(0, Math.cos(ang) * rad, Math.sin(ang) * rad), twist = V(0, Math.cos(ang + tw * 0.6) * rad, Math.sin(ang + tw * 0.6) * rad);
          setRod(r.m, V(-1.25, 0, 0).add(off), V(1.25, 0, 0).add(twist), 0.24);
        })));
        cxMat.color.copy(C(open ? 'connexin' : 'dead')); cxMat.emissive.copy(C('connexin')); cxMat.emissiveIntensity = open ? 0.45 : 0.1;
        [...ions, ...msg].forEach(x => { x.s.curve = open ? x.a : x.b; x.s.update(dt); });
        prot.update(dt);
        const beat = reduceMotion ? 0.3 : (el % 2.4) / 2.4;
        const pulse = (u) => Math.max(0, 1 - Math.abs(u) * 6);
        glowL.material.opacity = 0.2 + 0.8 * pulse(beat - 0.15);
        glowR.material.opacity = open ? 0.2 + 0.8 * pulse(beat - 0.32) : 0.08;
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
