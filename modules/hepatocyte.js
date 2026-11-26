/* Hepatocyte: glycogen and gluconeogenesis, the urea cycle, and CYP450 drug metabolism with liver imaging.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osCarb: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/24-2-carbohydrate-metabolism', 'OpenStax Anatomy &amp; Physiology 2e, 24.2 Carbohydrate Metabolism'),
  osStates: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/24-5-metabolic-states-of-the-body', '24.5 Metabolic States of the Body'),
  osProtein: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/24-4-protein-metabolism', 'OpenStax Anatomy &amp; Physiology 2e, 24.4 Protein Metabolism'),
  osLiver: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder', 'OpenStax Anatomy &amp; Physiology 2e, 23.6 The Liver'),
  zanger: link('https://doi.org/10.1016/j.pharmthera.2012.12.007', 'Zanger &amp; Schwab, cytochrome P450 enzymes in drug metabolism (Pharmacol Ther, 2013)'),
  esterson: link('https://doi.org/10.1016/j.cld.2017.08.005', 'Esterson &amp; Grimaldi, radiologic imaging in NAFLD and NASH (Clin Liver Dis, 2018)'),
  barrington: link('https://doi.org/10.1200/JCO.2013.53.5229', 'Barrington et al., role of imaging in lymphoma staging and response, the Deauville scale (J Clin Oncol, 2014)'),
  alberts: '<i>Alberts et al., Molecular Biology of the Cell</i>, energy metabolism chapters',
};
const STATE = {
  fed: 'Fed: insulin is high. Glucose floods in from portal blood through GLUT2, glucokinase traps it as glucose-6-phosphate, and glycogen synthase adds it to growing glycogen granules.',
  fasted: 'Fasted: glucagon is high and insulin low. Glycogen phosphorylase breaks glycogen down first. As fasting continues, the cell builds new glucose from lactate, alanine and glycerol (gluconeogenesis) and releases it through glucose-6-phosphatase and GLUT2.',
};
const UREA = {
  normal: 'Normal: ammonia from amino-acid breakdown is fixed into carbamoyl phosphate in the mitochondrion, carried around the cycle on ornithine, and leaves as urea, which the blood takes to the kidney.',
  otc: 'OTC deficiency: the second step is blocked, so carbamoyl phosphate and ammonia pile up. Blood ammonia rises (hyperammonemia), which is toxic to the brain, and little urea is made.',
};
const VIEW = {
  drug: 'Drug metabolism: a fat-soluble drug enters, a CYP450 enzyme on the smooth ER adds or exposes a reactive group (Phase I), then a transferase attaches a water-soluble tag such as glucuronic acid (Phase II) so the kidney or bile can excrete it.',
  fat: 'Fatty liver: triglyceride droplets fill the hepatocyte. On unenhanced CT, fat lowers liver attenuation, so a fatty liver looks darker than the spleen instead of slightly brighter.',
  pet: 'FDG-PET: normal liver takes up a moderate, fairly steady amount of FDG, so it serves as a reference. On the Deauville scale for lymphoma, uptake above liver counts as a positive residual lesion.',
};
whenLesson('hep-state', v => setCaption('hepStateCaption', STATE[v]));
whenLesson('urea-otc', v => setCaption('ureaCaption', UREA[v]));
whenLesson('liver-view', v => setCaption('liverViewCaption', VIEW[v]));

const CHAPTERS = [
  {
    id: 'liver-glycogen', short: 'Glycogen & new glucose', where: 'One hepatocyte beside a sinusoid',
    title: 'Storing glycogen and making new glucose',
    legend: [['glucose', 'Glucose'], ['glycogen', 'Glycogen granule'], ['lactate', 'Lactate'], ['amino', 'Alanine'], ['fat', 'Glycerol'], ['mito', 'Mitochondrion']],
    html: () => `
      <p class="lede">The liver keeps blood glucose steady for the whole body. After a meal it stores glucose as <b>glycogen</b>. Between meals it breaks glycogen down and then makes brand-new glucose, called <b>gluconeogenesis</b>.</p>
      ${lessonSeg('hep-state', 'Metabolic state', [['fed', 'Fed · insulin'], ['fasted', 'Fasted · glucagon']])}
      ${caption('hepStateCaption', STATE[LESSON['hep-state']])}
      <ul class="facts">
        <li><b>GLUT2</b> lets glucose move both ways across the hepatocyte membrane, so the liver can take glucose up after a meal and release it later. The liver stores roughly 100 g of glycogen, enough for about 12 to 24 hours of fasting.</li>
        <li>Gluconeogenesis uses carbon from <b>lactate</b> (from <a href="#blood/rbc">red cells</a> and working muscle, the Cori cycle), <b>alanine</b> (from muscle protein, the glucose–alanine cycle) and <b>glycerol</b> (from fat). It is not glycolysis run backward: pyruvate carboxylase in the mitochondrion and glucose-6-phosphatase in the ER lumen bypass its one-way steps.</li>
        <li>Muscle stores glycogen too but lacks glucose-6-phosphatase, so it keeps that glucose for itself. Only liver and, to a lesser degree, kidney can release free glucose into blood.</li>
        <li>In glycogen storage disease type I (von Gierke disease), glucose-6-phosphatase is missing. Children develop low blood sugar after short fasts, a large liver, and high lactate.</li>
      </ul>
      <p><a href="#glycolysis">Compare with glycolysis</a> · <a href="#balance">How insulin and glucagon balance fuel</a> · <a href="#gut-portal">Where the portal glucose comes from</a></p>
      ${sources([SRC.osCarb, SRC.osStates, SRC.alberts], 'The scene is not to scale: a real hepatocyte holds thousands of glycogen granules, each with up to tens of thousands of glucose units, and many more transporters. Pathways are reduced to their entry and exit points.')}`,
  },
  {
    id: 'urea-cycle', short: 'Urea cycle', where: 'Mitochondrion and cytosol of a hepatocyte',
    title: 'Turning ammonia into urea',
    legend: [['ammonia', 'Ammonia (NH₄⁺)'], ['amino', 'Aspartate'], ['urea', 'Urea'], ['fadh', 'Fumarate'], ['mito', 'Mitochondrion']],
    html: () => `
      <p class="lede">Breaking down amino acids releases nitrogen as <b>ammonia</b>, which is toxic to the brain even at low levels. Hepatocytes run the <b>urea cycle</b> across two compartments to package it as harmless, water-soluble urea.</p>
      ${lessonSeg('urea-otc', 'Enzymes', [['normal', 'Normal'], ['otc', 'OTC deficiency']])}
      ${caption('ureaCaption', UREA[LESSON['urea-otc']])}
      <ol class="lesson-sequence">
        <li><b>CPS1</b> (mitochondrion) joins ammonia and bicarbonate into carbamoyl phosphate, using 2 ATP.</li>
        <li><b>OTC</b> (mitochondrion) adds carbamoyl phosphate to ornithine, making citrulline, which leaves for the cytosol.</li>
        <li><b>ASS1</b> (cytosol) joins citrulline and aspartate, which brings the second nitrogen, into argininosuccinate, using 1 ATP split to AMP.</li>
        <li><b>ASL</b> splits off fumarate, which links to the <a href="#krebs">Krebs cycle</a>, leaving arginine.</li>
        <li><b>Arginase</b> cuts urea off arginine, regenerating ornithine, which returns to the mitochondrion.</li>
      </ol>
      <ul class="facts">
        <li>Each urea carries two nitrogens and costs the equivalent of four high-energy phosphate bonds.</li>
        <li>Urea travels in blood to the kidney. Blood urea nitrogen (BUN) rises when the kidneys filter poorly, and falls in severe liver failure.</li>
        <li>OTC deficiency is the most common inherited urea cycle disorder and is X-linked. In advanced liver disease, ammonia that bypasses the liver contributes to hepatic encephalopathy.</li>
      </ul>
      <p><a href="#nephron-overview">Follow urea into the nephron</a> · <a href="#fuel">Where the amino acids come from</a></p>
      ${sources([SRC.osProtein, SRC.alberts], 'The cycle is drawn as a tidy ring with one molecule at a time. Real enzymes work as crowded complexes, and the transporters that move citrulline and ornithine across the inner membrane are shown only as crossing points.')}`,
  },
  {
    id: 'liver-cyp', short: 'CYP450 & imaging', where: 'Smooth ER, then the liver on CT and PET',
    title: 'Cytochrome P450 and the liver on imaging',
    legend: [['drug', 'Drug'], ['cyp', 'CYP450 enzyme'], ['nadh', 'Phase I product'], ['urea', 'Phase II conjugate'], ['fat', 'Fat droplet'], ['fdg', 'FDG uptake']],
    html: () => `
      <p class="lede">The liver’s smooth endoplasmic reticulum is studded with <b>cytochrome P450</b> (CYP) enzymes that make fat-soluble drugs and toxins easier to excrete. The liver also has a distinctive look on CT, MRI and PET.</p>
      ${lessonSeg('liver-view', 'View', [['drug', 'Drug metabolism'], ['fat', 'Fatty liver on CT'], ['pet', 'Liver on FDG-PET']])}
      ${caption('liverViewCaption', VIEW[LESSON['liver-view']])}
      <ul class="facts">
        <li><b>Phase I</b> (mostly CYPs): oxidation adds or uncovers a group such as –OH. <b>Phase II</b>: conjugation with glucuronic acid, sulfate or glutathione makes the molecule water soluble.</li>
        <li>A few CYPs handle most drugs, with CYP3A4 the busiest. Grapefruit juice inhibits gut CYP3A4, rifampin induces CYPs, and common CYP2D6 variants change how much codeine becomes morphine.</li>
        <li>Phase I can make a molecule more dangerous. In acetaminophen overdose, CYPs make the reactive NAPQI faster than glutathione can neutralize it, damaging hepatocytes. N-acetylcysteine restores glutathione.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p><b>Steatosis:</b> on unenhanced CT, a liver darker than the spleen, especially by more than about 10 HU, or below about 40 HU suggests moderate to severe fat. MRI proton density fat fraction (PDFF) measures fat directly, with values above about 5% indicating steatosis. <b>FDG-PET:</b> liver uptake is moderate and fairly stable, so it is the reference for the Deauville 5-point scale in lymphoma: 1 no uptake, 2 at or below mediastinal blood pool, 3 above blood pool but at or below liver, 4 moderately above liver, 5 markedly above liver or new lesions. See <a href="#petprep">PET preparation</a> and <a href="#cancer-pet">FDG-avid tumors</a>.</p></div>
      <p><a href="#er">The ER in the protein factory</a> · <a href="#gut-portal">First-pass metabolism</a></p>
      ${sources([SRC.zanger, SRC.esterson, SRC.barrington, SRC.osLiver], 'The ER, enzymes and drug are drawn far larger than life, with one molecule processed at a time. The CT and PET panels are schematic illustrations, not patient images, and thresholds vary with scanner and protocol. For learning, not diagnosis.')}`,
  },
];

CellCity.register('hepatocyte', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, panel, V } = k;
    const { behaviors } = k.out;

    /* ================= Glycogen and gluconeogenesis ================= */
    {
      const id = 'liver-glycogen', root = new THREE.Group();
      add(id, root, { target: V(0, -1.5, 0), pos: V(2, 5, 32), w: 21 }, { fade: 'Into a hepatocyte' });
      body(root, C('hepato'), [9, 6.2, 5], V(0, 0, 0), 0.1);
      ball(root, std(C('nucleus'), { emissiveIntensity: 0.3 }), 1.7, V(-5, 2.2, 0));
      const sin = tube(root, ghost(C('rbc'), 0.22), [V(-16, -8.6, 0), V(0, -8.8, 0), V(16, -8.6, 0)], 1.5);
      const mito = ball(root, std(C('mito'), { emissiveIntensity: 0.3 }), 1, V(-3.5, -3, 1)); mito.scale.set(2.2, 0.9, 0.9);
      tube(root, std(C('golgi'), { emissiveIntensity: 0.3 }), [V(4, -2, 0), V(5, -3.4, 1), V(6.5, -2.6, -0.5), V(7.5, -3.8, 0.5)], 0.32);
      rod(root, std(C('pump')), V(2, -6.6, 0), V(2, -5.4, 0), 0.45);
      const glyc = new THREE.Group(); glyc.position.set(2, 1.6, 0); root.add(glyc);
      const gMat = std(C('glycogen'), { emissiveIntensity: 0.4 }), tiers = [];
      ball(glyc, std(C('amino')), 0.32);
      for (let t = 1; t <= 5; t++) {
        const tier = new THREE.Group(); glyc.add(tier); tiers.push(tier);
        const n = 7 * t * t;
        for (let i = 0; i < n; i++) {
          const y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), a = i * 2.39996;
          ball(tier, gMat, 0.2, V(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(t * 0.5 + rr(-0.1, 0.1)));
        }
      }
      const fed = new THREE.Group(), fast = new THREE.Group(); root.add(fed); root.add(fast);
      lbl('Glycogen granule', 'glycogen', root, V(2, 4.9, 0), id);
      lbl('GLUT2', 'pump', root, V(2.8, -5.6, 1.5), id);
      lbl('Sinusoid · portal blood', 'rbc', sin, V(-12, -10.6, 0), id);
      lbl('Mitochondrion · pyruvate carboxylase', 'mito', mito, V(0, -1.6, 0), id);
      lbl('ER · glucose-6-phosphatase', 'golgi', root, V(7, -1.2, 0), id);
      lbl('Insulin high', 'insulin', fed, V(-12, -3.6, 0), id);
      lbl('Glucagon high', 'glucagon', fast, V(-12, -3.6, 0), id);
      lbl('Lactate · alanine · glycerol in', 'lactate', fast, V(-7, -5.4, 2), id);
      const gl = std(C('glucose'), { emissiveIntensity: 0.6 });
      const sIn = stream(root, gl, 0.26, curve([V(-15, -8.6, 0.4), V(-3, -8.6, 0.4), V(2, -6.6, 0), V(2, -2.5, 0.5), V(2, 1.2, 0)]), 9, 0.22, C('glucose'));
      const sOut = stream(root, gl, 0.26, curve([V(2, 1.4, 0), V(3, -2.5, 0.5), V(2, -6.6, 0), V(6, -8.6, 0.4), V(15, -8.6, 0.4)]), 7, 0.2, C('glucose'));
      const sNew = stream(root, gl, 0.26, curve([V(-3.5, -3, 1), V(1, -3.6, 0.8), V(5, -3.2, 0.4), V(4.5, -6.6, 0), V(9, -8.6, -0.4), V(15, -8.6, 0)]), 5, 0.18, C('glucose'));
      const sLac = stream(root, std(C('lactate'), { emissiveIntensity: 0.5 }), 0.22, curve([V(-15, -8.6, -0.5), V(-8, -8.6, -0.5), V(-5.5, -6.4, 0.5), V(-3.8, -3.2, 1)]), 5, 0.2);
      const sAla = stream(root, std(C('amino'), { emissiveIntensity: 0.5 }), 0.22, curve([V(-15, -8.4, 0.9), V(-9, -8.4, 0.9), V(-6, -6, 1.4), V(-3.2, -3, 1.2)]), 4, 0.17);
      const sGly = stream(root, std(C('fat'), { emissiveIntensity: 0.4 }), 0.22, curve([V(-15, -8.8, -1), V(-2, -8.8, -1), V(1, -6, -0.5), V(5, -3.2, 0)]), 4, 0.15);
      let fill = 1;
      function draw(dt) {
        const isFed = (LESSON['hep-state'] || 'fed') === 'fed';
        fill += ((isFed ? 1 : 0.28) - fill) * Math.min(1, dt * (reduceMotion ? 99 : 0.5));
        tiers.forEach((t, i) => { const v = Math.min(1, Math.max(0, fill * 5 - i)); t.visible = v > 0.02; t.scale.setScalar(Math.max(0.01, 0.4 + 0.6 * v)); });
        fed.visible = isFed; fast.visible = !isFed;
        sIn.visible = isFed; sOut.visible = !isFed && fill > 0.35; sNew.visible = sLac.visible = sAla.visible = sGly.visible = !isFed;
        [sIn, sOut, sNew, sLac, sAla, sGly].forEach(s => s.update(dt));
        glyc.rotation.y += reduceMotion ? 0 : dt * 0.15;
      }
      behaviors[id] = { enter() { fill = LESSON['hep-state'] === 'fasted' ? 0.28 : 1; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Urea cycle ================= */
    {
      const id = 'urea-cycle', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 4, 32), w: 19 }, { fade: 'Into the mitochondrion' });
      body(root, C('mito'), [8, 5.6, 4], V(-6, 0, 0), 0.1);
      lbl('Mitochondrial matrix', 'mito', root, V(-9, 5.4, 0), id);
      lbl('Cytosol', 'hepato', root, V(9, 5.4, 0), id);
      const ringPts = [V(-5, 3, 0), V(1.8, 3.9, 0), V(5.5, 3, 0), V(8, 0, 0), V(5.5, -3, 0), V(1.8, -3.9, 0), V(-5, -3, 0), V(-7.5, 0, 0)];
      const ring = curve(ringPts, true);
      root.add(new THREE.Mesh(new THREE.TubeGeometry(ring, 120, 0.07, 6, true), ghost(C('electron'), 0.35)));
      const stations = [['OTC', ringPts[0], 'mito'], ['ASS1', ringPts[2], 'amino'], ['ASL', ringPts[3], 'fadh'], ['Arginase', ringPts[4], 'urea']];
      const stMeshes = stations.map(([name, p, c]) => {
        const m = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.2, 10, 24), std(C(c), { emissiveIntensity: 0.3 }));
        m.position.copy(p); root.add(m); lbl(name, c, root, p.clone().add(V(0, p.y > 0 ? 1.4 : -1.4, 0)), id); return m;
      });
      const cps = ball(root, std(C('ammonia'), { emissiveIntensity: 0.35 }), 0.8, V(-10, 2.6, 0));
      lbl('CPS1', 'ammonia', root, V(-10, 4, 0), id);
      lbl('Citrulline out', 'electron', root, V(1.8, 5, 0), id);
      lbl('Ornithine back in', 'electron', root, V(1.8, -5, 0), id);
      const blood = tube(root, ghost(C('rbc'), 0.22), [V(2, -8, 0), V(10, -8, 0), V(18, -8, 0)], 1.2);
      lbl('Blood to kidney', 'rbc', blood, V(14, -9.8, 0), id);
      const segCol = ['electron', 'amino', 'fadh', 'urea'].map(c => std(C(c), { emissiveIntensity: 0.55 }));
      const carrier = stream(root, segCol[0], 0.32, ring, 6, 0.12);
      carrier.at = (m, u) => { m.material = segCol[u < 0.25 ? 0 : u < 0.375 ? 1 : u < 0.5 ? 2 : 3]; };
      const nh = stream(root, std(C('ammonia'), { emissiveIntensity: 0.5 }), 0.22, curve([V(-15, -1, 0), V(-12, 1.6, 0), V(-10, 2.6, 0), V(-7, 3.2, 0), V(-5, 3, 0)]), 6, 0.2, C('ammonia'));
      const asp = stream(root, std(C('amino'), { emissiveIntensity: 0.5 }), 0.22, curve([V(9, 8, 0), V(7, 5.5, 0), V(5.5, 3, 0)]), 3, 0.25);
      const fum = stream(root, std(C('fadh'), { emissiveIntensity: 0.5 }), 0.22, curve([V(8, 0, 0), V(11, 1.5, 0), V(14, 2.5, 0)]), 3, 0.25);
      const urea = stream(root, std(C('urea'), { emissiveIntensity: 0.6 }), 0.26, curve([V(5.5, -3, 0), V(6.5, -6, 0), V(9, -8, 0), V(17, -8, 0)]), 5, 0.2, C('urea'));
      const pile = new THREE.Group(); root.add(pile);
      const pileMat = std(C('ammonia'), { emissiveIntensity: 0.6 });
      const piled = Array.from({ length: 46 }, (_, i) => ball(pile, pileMat, 0.2, V(-10 + rr(-3.5, 3.5), 1 + rr(-3, 3), rr(-2, 2))));
      lbl('Ammonia builds up', 'ammonia', pile, V(-12, -3.5, 0), id);
      let level = 0, el = 0;
      function draw(dt) {
        const bad = LESSON['urea-otc'] === 'otc';
        el += dt;
        level += ((bad ? 1 : 0) - level) * Math.min(1, dt * (reduceMotion ? 99 : 0.6));
        carrier.speed = bad ? 0.012 : 0.12; asp.speed = fum.speed = bad ? 0.02 : 0.25; urea.visible = !bad || level < 0.3;
        [carrier, nh, asp, fum, urea].forEach(s => s.update(dt));
        pile.visible = level > 0.03;
        piled.forEach((m, i) => { m.visible = i < level * piled.length; if (!reduceMotion) m.position.y += Math.sin(el * 2 + i) * dt * 0.15; });
        stMeshes[0].material.emissiveIntensity = bad ? 0.05 : 0.3 + 0.25 * Math.sin(el * 4) ** 2;
        stMeshes.forEach((m, i) => { if (!reduceMotion) m.rotation.y += dt * (bad ? 0.1 : 0.8 + i * 0.1); });
        cps.scale.setScalar(0.8 + 0.08 * Math.sin(el * 3));
      }
      behaviors[id] = { enter() { level = LESSON['urea-otc'] === 'otc' ? 1 : 0; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= CYP450 and liver imaging ================= */
    {
      const id = 'liver-cyp', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 3, 32), w: 18 }, { fade: 'Onto the smooth ER' });
      const drug = new THREE.Group(), fat = new THREE.Group(), pet = new THREE.Group(); root.add(drug); root.add(fat); root.add(pet);
      // drug metabolism on the smooth ER
      const erMat = std(C('golgi'), { emissiveIntensity: 0.2, transparent: true, opacity: 0.85 });
      [-3, 0, 3].forEach((y, i) => tube(drug, erMat, [V(-11, y, -2), V(-5, y + 1.2, -1), V(0, y - 0.8, -2.2), V(5, y + 1, -1), V(11, y, -2)], 0.7));
      const cypMat = std(C('cyp'), { emissiveIntensity: 0.4 }), ugtMat = std(C('nadh'), { emissiveIntensity: 0.35 });
      const cyp = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 24), cypMat); cyp.position.set(-2.5, 0.3, -0.6); cyp.rotation.x = Math.PI / 2; drug.add(cyp);
      const heme = k.glow(C('cyp'), 2.4); heme.position.copy(cyp.position); drug.add(heme);
      const ugt = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.6, 24), ugtMat); ugt.position.set(3.5, -0.4, -0.6); ugt.rotation.x = Math.PI / 2; drug.add(ugt);
      lbl('Smooth ER', 'golgi', drug, V(-9, 4.6, -1), id);
      lbl('CYP450 · Phase I', 'cyp', drug, V(-2.5, 2.2, 0), id);
      lbl('Transferase · Phase II', 'nadh', drug, V(3.5, -2.4, 0), id);
      lbl('Fat-soluble drug in', 'drug', drug, V(-11, -5.4, 0), id);
      lbl('Water-soluble out → bile or urine', 'urea', drug, V(10, 5.4, 0), id);
      const dMats = [std(C('drug'), { emissiveIntensity: 0.5 }), std(C('nadh'), { emissiveIntensity: 0.5 }), std(C('urea'), { emissiveIntensity: 0.6 })];
      const dStream = stream(drug, dMats[0], 0.38, curve([V(-13, -5, 1), V(-6, -2, 1), V(-2.5, 0.3, 0.4), V(0.5, 0, 0.6), V(3.5, -0.4, 0.4), V(7, 2.5, 1), V(13, 5, 1)]), 6, 0.14);
      dStream.at = (m, u) => { const s = u < 0.33 ? 0 : u < 0.55 ? 1 : 2; m.material = dMats[s]; m.scale.setScalar(s === 2 ? 0.52 : 0.38); };
      // fatty liver: droplets crowd the hepatocyte, plus a schematic CT panel
      body(fat, C('hepato'), [6, 5, 4], V(-5, 0, 0), 0.12);
      const nuc = ball(fat, std(C('nucleus')), 1.1, V(-8.6, 2.4, 0)); nuc.scale.set(0.7, 1.1, 1);
      const drops = [ball(fat, std(C('fat'), { emissiveIntensity: 0.3 }), 1, V(-4.6, -0.4, 0))];
      for (let i = 0; i < 14; i++) drops.push(ball(fat, drops[0].material, 1, V(-5 + rr(-4, 4), rr(-3.6, 3.6), rr(-2.4, 2.4))));
      lbl('Hepatocyte', 'hepato', fat, V(-5, 5.8, 0), id);
      lbl('Fat droplets', 'fat', fat, V(-1, -4.4, 1), id);
      lbl('Nucleus pushed aside', 'nucleus', fat, V(-9.5, 4, 0), id);
      const ct = panel(fat, 11, 8.6, 360); ct.mesh.position.set(7, 0, 0);
      ct.draw((c, w, h) => {
        c.fillStyle = '#05080d'; c.fillRect(0, 0, w, h);
        c.font = '600 19px "IBM Plex Mono", monospace'; c.fillStyle = '#c9d4e3'; c.textAlign = 'center';
        c.fillText('Unenhanced CT (schematic)', w / 2, 26);
        const cell = (x, label, liver, spleen) => {
          c.fillStyle = `rgb(${liver},${liver},${liver})`; c.beginPath(); c.ellipse(x - 34, 140, 42, 62, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = `rgb(${spleen},${spleen},${spleen})`; c.beginPath(); c.ellipse(x + 40, 150, 24, 42, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#c9d4e3'; c.font = '600 18px "IBM Plex Mono", monospace'; c.fillText(label, x, 236);
          c.font = '15px "IBM Plex Mono", monospace'; c.fillText('liver   spleen', x, 254);
        };
        cell(w * 0.27, 'Normal', 150, 138); cell(w * 0.75, 'Steatosis', 92, 138);
        c.font = '14px "IBM Plex Mono", monospace'; c.fillStyle = '#8c9bb0'; c.fillText('Fatty liver is darker than spleen', w / 2, 274);
      });
      // FDG-PET reference levels
      const pp = panel(pet, 7.5, 11, 300); pp.mesh.position.set(-5, 0, 0);
      pp.draw((c, w, h) => {
        c.fillStyle = '#f2f4f7'; c.fillRect(0, 0, w, h);
        const blob = (x, y, rx, ry, v) => { c.fillStyle = `rgba(0,0,0,${v})`; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); };
        blob(w / 2, 50, 34, 38, 0.85);                    // brain
        blob(w / 2, 170, 70, 110, 0.06);                  // body background
        blob(w / 2 + 8, 150, 22, 20, 0.35);               // heart (variable)
        blob(w / 2 - 6, 125, 9, 26, 0.16);                // mediastinal blood pool
        blob(w / 2 - 32, 210, 46, 30, 0.3);               // liver
        blob(w / 2 + 40, 112, 9, 9, 0.75);                // lymphoma node
        blob(w / 2, 330, 18, 14, 0.9);                    // bladder
        c.fillStyle = '#111'; c.font = '600 13px "IBM Plex Mono", monospace'; c.textAlign = 'center';
        c.fillText('FDG MIP · black = more uptake', w / 2, h - 14);
      });
      lbl('Liver · reference', 'hepato', pet, V(-6.5, -1.6, 0.2), id);
      lbl('Blood pool', 'electron', pet, V(-5.8, 2.6, 0.2), id);
      lbl('Node above liver', 'fdg', pet, V(-1.6, 3.8, 0.2), id);
      const levels = [['1', 0.02], ['2', 0.16], ['3', 0.3], ['4', 0.55], ['5', 0.9]];
      levels.forEach(([n, v], i) => {
        const m = ball(pet, std(C('fdg'), { emissiveIntensity: 0.15 + v }), 0.5 + v * 0.7, V(2 + i * 2.1, -1, 0));
        const s = k.glow(C('fdg'), 1 + v * 5); s.material.opacity = v; m.add(s);
        lbl('DS ' + n, i === 2 ? 'hepato' : 'fdg', pet, V(2 + i * 2.1, -3.2, 0), id);
      });
      lbl('Deauville score · liver is the cut-off', 'fdg', pet, V(6.2, 2.6, 0), id);
      let t0 = 0;
      function draw(dt) {
        const v = LESSON['liver-view'] || 'drug';
        drug.visible = v === 'drug'; fat.visible = v === 'fat'; pet.visible = v === 'pet';
        t0 += dt;
        if (drug.visible) { dStream.update(dt); cyp.rotation.z += reduceMotion ? 0 : dt; heme.material.opacity = 0.5 + 0.4 * Math.sin(t0 * 3) ** 2; }
        if (fat.visible) drops.forEach((d, i) => d.scale.setScalar(i === 0 ? 2.4 : 0.55 + 0.25 * Math.sin(i * 1.7) + (reduceMotion ? 0 : 0.04 * Math.sin(t0 + i))));
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
