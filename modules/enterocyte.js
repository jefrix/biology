/* Enterocyte: brush border and SGLT1 glucose uptake, fat absorption into chylomicrons, and the portal vein with first-pass metabolism.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osIntestine: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/23-5-the-small-and-large-intestines', 'OpenStax Anatomy &amp; Physiology 2e, 23.5 The Small and Large Intestines'),
  osAbsorb: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/23-7-chemical-digestion-and-absorption-a-closer-look', '23.7 Chemical Digestion and Absorption'),
  osLiver: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/23-6-accessory-organs-in-digestion-the-liver-pancreas-and-gallbladder', '23.6 The Liver'),
  wright: link('https://doi.org/10.1152/physrev.00055.2009', 'Wright, Loo &amp; Hirayama, biology of human sodium glucose transporters (Physiol Rev, 2011)'),
  iqbal: link('https://doi.org/10.1152/ajpendo.90899.2008', 'Iqbal &amp; Hussain, intestinal lipid absorption (Am J Physiol Endocrinol Metab, 2009)'),
  hussain: link('https://doi.org/10.1097/MOL.0000000000000084', 'Hussain, intestinal lipid absorption and lipoprotein formation (Curr Opin Lipidol, 2014)'),
  pond: link('https://doi.org/10.2165/00003088-198409010-00001', 'Pond &amp; Tozer, first-pass elimination (Clin Pharmacokinet, 1984)'),
};
const SURF = {
  on: 'Brush border on: thousands of microvilli on each cell multiply its apical surface. With the folds and villi of the intestinal wall, the absorptive area is often estimated at several hundred times that of a smooth tube.',
  off: 'Brush border flattened: with microvilli lost, as in untreated celiac disease, there is far less membrane for SGLT1 and the brush-border enzymes, so fewer sugars are absorbed and the rest draws water into the gut.',
};
const FAT = [
  ['Micelles', 'Pancreatic lipase splits dietary triglyceride into fatty acids and monoglycerides. Bile salts ferry them in tiny micelles to the brush border, where they diffuse or are carried into the cell.'],
  ['Re-esterify', 'On the smooth ER the cell rebuilds triglycerides from the fatty acids and monoglycerides, so they do not leak back out.'],
  ['Chylomicron', 'MTP loads triglyceride, cholesterol and fat-soluble vitamins onto apolipoprotein B-48, making a large lipoprotein particle, the chylomicron, which is packaged through the Golgi.'],
  ['Lacteal', 'Chylomicrons leave the base of the cell by exocytosis. They are too big for the tight blood capillaries and enter a lymphatic lacteal instead, reaching the blood through the thoracic duct and skipping the liver at first.'],
];
const FAT_T = [0, 3.5, 7, 10.5, 14];
const ROUTE = {
  oral: 'Swallowed: the drug is absorbed into the portal vein and passes through the liver before it reaches the rest of the body. In this example 70% is removed on that first pass, so only about 30% reaches the circulation (oral bioavailability about 30%).',
  sublingual: 'Under the tongue: the drug is absorbed into veins of the mouth that drain toward the heart, bypassing the portal vein and the liver’s first pass. That is why nitroglycerin is given sublingually.',
  iv: 'Intravenous: the whole dose enters the systemic circulation directly, so bioavailability is 100% by definition. Oral doses of high-extraction drugs must be larger than IV doses to have the same effect.',
};
whenLesson('gut-surface', v => setCaption('gutSurfaceCaption', SURF[v]));
whenLesson('gut-fat-step', v => setCaption('gutFatCaption', v === 'auto' ? 'Playing all four steps.' : FAT[+v][0] + ': ' + FAT[+v][1]));
whenLesson('gut-route', v => setCaption('gutRouteCaption', ROUTE[v]));

const CHAPTERS = [
  {
    id: 'gut-sglt1', short: 'Brush border & SGLT1', where: 'Absorptive cells lining a villus',
    title: 'The brush border and sodium-driven glucose uptake',
    legend: [['gut', 'Enterocyte'], ['glucose', 'Glucose'], ['sodium', 'Sodium'], ['potassium', 'Potassium'], ['pump', 'GLUT2 and Na⁺/K⁺ pump'], ['bbb', 'Tight junction']],
    html: () => `
      <p class="lede">The enterocyte is where food actually enters the body, the first step of <a href="#fuel">from your plate to ATP</a>. Its apical surface faces the gut, its basolateral surface faces the blood, and tight junctions keep the two apart.</p>
      ${lessonSeg('gut-surface', 'Microvilli', [['on', 'Brush border'], ['off', 'Flattened']])}
      ${caption('gutSurfaceCaption', SURF[LESSON['gut-surface']])}
      <ol class="lesson-sequence">
        <li><b>In through SGLT1.</b> On the apical membrane, SGLT1 carries 2 Na⁺ with each glucose (or galactose), using the sodium gradient to pull glucose in against its own gradient. This is <a href="#cotransport">secondary active transport</a>.</li>
        <li><b>Out through GLUT2.</b> Glucose builds up inside and leaves down its gradient through GLUT2 on the basolateral membrane into the capillaries.</li>
        <li><b>Reset by the pump.</b> The <a href="#pump">Na⁺/K⁺-ATPase</a> on the basolateral side pumps sodium out, keeping cell sodium low so SGLT1 keeps working.</li>
      </ol>
      <ul class="facts">
        <li>Fructose uses a different carrier, GLUT5, which does not need sodium.</li>
        <li>Oral rehydration solution works because glucose and sodium are absorbed together through SGLT1 and water follows. It saves lives in cholera, where the secretory diarrhea leaves SGLT1 working.</li>
        <li>The same apical-to-basolateral layout recovers glucose in the kidney’s <a href="#proximal-tubule">proximal tubule</a>, using SGLT2 and SGLT1.</li>
      </ul>
      <p><a href="#epithelia">Polarized epithelia in general</a> · <a href="#gut-fat">How fats are absorbed</a></p>
      ${sources([SRC.wright, SRC.osAbsorb, SRC.osIntestine], 'Microvilli are drawn far fewer and thicker than real ones, of which there are thousands per cell, each about 1 µm tall. Particles take tidy paths, and the 2:1 sodium to glucose ratio is shown only roughly.')}`,
  },
  {
    id: 'gut-fat', short: 'Fat & chylomicrons', where: 'Inside one enterocyte, above a lacteal',
    title: 'Packaging fat into chylomicrons',
    legend: [['fat', 'Fatty acids and micelles'], ['golgi', 'Smooth ER and Golgi'], ['chylo', 'Chylomicron'], ['lymphatic', 'Lacteal (lymph)'], ['rbc', 'Blood capillary']],
    html: () => `
      <p class="lede">Fats do not dissolve in water, so the enterocyte handles them differently from sugars. It rebuilds them and ships them out in large particles that travel in lymph, not portal blood.</p>
      ${lessonSeg('gut-fat-step', 'Step', [['auto', 'Play all'], ...FAT.map(([name], i) => [String(i), name])])}
      ${caption('gutFatCaption', LESSON['gut-fat-step'] === 'auto' ? 'Playing all four steps.' : FAT[+LESSON['gut-fat-step']][0] + ': ' + FAT[+LESSON['gut-fat-step']][1])}
      <ol class="lesson-sequence">${FAT.map(([name, text]) => `<li><b>${name}.</b> ${text}</li>`).join('')}</ol>
      <ul class="facts">
        <li>Short- and medium-chain fatty acids are small enough to go straight into portal blood. Medium-chain triglyceride oil is used as a nutritional supplement when chylomicron transport fails.</li>
        <li>In abetalipoproteinemia, MTP is missing, so chylomicrons cannot form. Fat stays trapped in enterocytes, and fat-soluble vitamins A, D, E and K are poorly absorbed.</li>
        <li>Lymph full of chylomicrons looks milky and is called chyle. A torn thoracic duct can leak it into the chest (chylothorax).</li>
      </ul>
      <p><a href="#er">The ER</a> and <a href="#golgi">Golgi</a> in the protein factory · <a href="#gut-portal">Where everything else goes</a> · <a href="#lipid-ldl">How the liver takes up cholesterol</a></p>
      ${sources([SRC.iqbal, SRC.hussain, SRC.osAbsorb], 'The ER and Golgi are drawn as simple shapes, and one chylomicron at a time stands for the many each cell releases. Chylomicrons are roughly 75 to 1200 nm across, much smaller than shown relative to the cell.')}`,
  },
  {
    id: 'gut-portal', short: 'Portal vein & first pass', where: 'Gut, liver and circulation (schematic)',
    title: 'The portal vein and first-pass metabolism',
    legend: [['gut', 'Intestine'], ['hepato', 'Liver'], ['drug', 'Drug'], ['glucose', 'Absorbed nutrients'], ['chylo', 'Chylomicrons in lymph'], ['rbc', 'Systemic blood']],
    html: () => `
      <p class="lede">Blood leaving the intestine does not go straight to the heart. It collects in the <b>hepatic portal vein</b> and flows through the liver first, so <a href="#liver-glycogen">hepatocytes</a> get the first look at every absorbed nutrient, toxin and swallowed drug.</p>
      ${lessonSeg('gut-route', 'Route', [['oral', 'Swallowed'], ['sublingual', 'Under the tongue'], ['iv', 'Intravenous']])}
      ${caption('gutRouteCaption', ROUTE[LESSON['gut-route']])}
      <ul class="facts">
        <li>The portal vein supplies about three quarters of the liver’s blood flow; the hepatic artery supplies the rest, with most of the oxygen.</li>
        <li><b>First-pass metabolism</b> by gut wall and liver enzymes, especially <a href="#liver-cyp">CYP450s</a>, can remove most of a dose before it reaches the body. Oral morphine and propranolol, for example, reach the circulation only in part.</li>
        <li>Chylomicrons take the lymph route through the thoracic duct, so dietary fat reaches muscle and fat tissue before the liver.</li>
        <li>In cirrhosis, scarred liver resists portal flow (portal hypertension). Blood detours through collateral veins such as esophageal varices, and drugs escape first-pass metabolism.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Because most liver blood is portal, a contrast-enhanced CT of the abdomen is usually timed for the <b>portal venous phase</b>, about 60 to 70 seconds after injection, when normal liver enhances most. Many tumors fed by the hepatic artery stand out earlier, in the arterial phase.</p></div>
      ${sources([SRC.pond, SRC.osLiver, SRC.osAbsorb], 'The circulation is drawn as a simplified loop, and the drug’s 70% first-pass extraction is an example value. Real extraction varies widely between drugs and patients.')}`,
  },
];

CellCity.register('enterocyte', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;

    /* ================= Brush border and SGLT1 ================= */
    {
      const id = 'gut-sglt1', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(4, 4, 30), w: 15 }, { fade: 'Onto the villus surface' });
      const cellMat = ghost(C('gut'), 0.22);
      [-3.9, 0, 3.9].forEach(x => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(3.7, 8, 4), cellMat); b.position.x = x; root.add(b);
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), new THREE.LineBasicMaterial({ color: C('gut'), transparent: true, opacity: 0.7 })); e.position.x = x; root.add(e);
        ball(root, std(C('nucleus'), { emissiveIntensity: 0.25 }), 0.8, V(x, -1.6, 0)).scale.set(0.7, 1.1, 0.7);
      });
      [-1.95, 1.95].forEach(x => rod(root, std(C('bbb'), { emissiveIntensity: 0.6 }), V(x, 3.6, -2), V(x, 3.6, 2), 0.12));
      const mvGeo = new THREE.CylinderGeometry(0.13, 0.13, 1, 8);
      const mv = new THREE.InstancedMesh(mvGeo, std(C('gut'), { emissiveIntensity: 0.3 }), 3 * 9 * 5);
      const m4 = new THREE.Matrix4(); let n = 0;
      [-3.9, 0, 3.9].forEach(x => { for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { m4.makeTranslation(x - 1.6 + i * 0.4, 4.6, -1.6 + j * 0.8); mv.setMatrixAt(n++, m4); } });
      root.add(mv);
      const sglt = rod(root, std(C('glucose'), { emissiveIntensity: 0.5 }), V(-0.5, 3.6, 0.9), V(-0.5, 4.4, 0.9), 0.4);
      const glut2 = rod(root, std(C('pump'), { emissiveIntensity: 0.5 }), V(-0.8, -4.4, 0.9), V(-0.8, -3.6, 0.9), 0.4);
      const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16), std(C('pump'), { emissiveIntensity: 0.5 })); pump.position.set(1, -4, 0.9); root.add(pump);
      const capillary = tube(root, ghost(C('rbc'), 0.25), [V(-9, -6.6, 0), V(0, -6.8, 0), V(9, -6.6, 0)], 1);
      const glc = stream(root, std(C('glucose'), { emissiveIntensity: 0.6 }), 0.22, curve([V(-1.2, 8, 0.9), V(-0.6, 5.4, 0.9), V(-0.5, 4, 0.9), V(-0.3, 0, 0.9), V(-0.8, -4, 0.9), V(1, -6.7, 0.5), V(8, -6.7, 0)]), 8, 0.12, C('glucose'));
      const na = stream(root, std(C('sodium'), { emissiveIntensity: 0.6 }), 0.17, curve([V(0.2, 8, 0.9), V(-0.3, 5.4, 0.9), V(-0.5, 4, 0.9), V(0.3, 0, 0.9), V(1, -4, 0.9), V(1.4, -5.6, 1)]), 12, 0.12, C('sodium'));
      const k2 = stream(root, std(C('potassium'), { emissiveIntensity: 0.6 }), 0.16, curve([V(2, -5.6, 1), V(1.1, -4, 0.9), V(1.2, -2, 0.9)]), 4, 0.25);
      lbl('Gut lumen', 'gut', root, V(-6.5, 7, 0), id);
      lbl('Brush border', 'gut', root, V(4.5, 5.9, 0), id);
      lbl('Tight junction', 'bbb', root, V(1.95, 3.1, 2.4), id);
      lbl('SGLT1 · 2 Na⁺ + glucose', 'glucose', sglt, V(0, 1.4, 0), id);
      lbl('GLUT2', 'pump', root, V(-2.6, -4.2, 1), id);
      lbl('Na⁺/K⁺ pump', 'pump', root, V(2.8, -4.6, 1), id);
      lbl('Capillary → portal vein', 'rbc', capillary, V(6.5, -8.4, 0), id);
      let s = 1;
      function draw(dt) {
        const on = (LESSON['gut-surface'] || 'on') === 'on';
        s += ((on ? 1 : 0.15) - s) * Math.min(1, dt * (reduceMotion ? 99 : 2));
        n = 0; [-3.9, 0, 3.9].forEach(x => { for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) { m4.makeScale(1, s * 1.4, 1).setPosition(x - 1.6 + i * 0.4, 4 + s * 0.7, -1.6 + j * 0.8); mv.setMatrixAt(n++, m4); } });
        mv.instanceMatrix.needsUpdate = true;
        glc.speed = na.speed = on ? 0.12 : 0.04;
        [glc, na, k2].forEach(st => st.update(dt));
        pump.rotation.y += reduceMotion ? 0 : dt * 2;
      }
      behaviors[id] = { enter() { s = LESSON['gut-surface'] === 'off' ? 0.15 : 1; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Fat and chylomicrons ================= */
    {
      const id = 'gut-fat', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(3, 4, 30), w: 15 }, { fade: 'Inside one enterocyte' });
      const cell = new THREE.Mesh(new THREE.BoxGeometry(9, 11, 5), ghost(C('gut'), 0.16)); root.add(cell);
      root.add(new THREE.LineSegments(new THREE.EdgesGeometry(cell.geometry), new THREE.LineBasicMaterial({ color: C('gut'), transparent: true, opacity: 0.6 })));
      for (let i = 0; i < 14; i++) rod(root, std(C('gut'), { emissiveIntensity: 0.3 }), V(-4 + i * 0.62, 5.5, 0.8), V(-4 + i * 0.62, 6.6, 0.8), 0.14);
      ball(root, std(C('nucleus'), { emissiveIntensity: 0.25 }), 1.2, V(-2.6, -2.6, 0)).scale.set(1.2, 1.5, 1);
      const erMat = std(C('golgi'), { emissiveIntensity: 0.25 });
      tube(root, erMat, [V(-3.5, 3.6, 0), V(-1.5, 2.6, 0.6), V(0.5, 3.6, -0.4), V(2.5, 2.4, 0.5), V(3.6, 3.4, 0)], 0.3);
      tube(root, erMat, [V(-3, 1.6, -0.4), V(-0.8, 0.8, 0.4), V(1.6, 1.8, -0.2), V(3.4, 0.8, 0.3)], 0.3);
      const golgi = new THREE.Group(); golgi.position.set(2, -1.6, 0.6); root.add(golgi);
      for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(1.2 - i * 0.12, 0.12, 6, 30, Math.PI), erMat); t.position.y = -i * 0.35; t.rotation.z = Math.PI; golgi.add(t); }
      const micelles = new THREE.Group(); root.add(micelles);
      const mMat = std(C('fat'), { emissiveIntensity: 0.4 });
      const mic = [V(-2.5, 8.2, 0.8), V(0.5, 8.6, 0.2), V(3, 8, 1)].map(p => { const gr = new THREE.Group(); gr.position.copy(p); micelles.add(gr); for (let i = 0; i < 12; i++) { const y = 1 - 2 * (i + 0.5) / 12, r = Math.sqrt(1 - y * y), a = i * 2.4; ball(gr, mMat, 0.16, V(Math.cos(a) * r * 0.6, y * 0.6, Math.sin(a) * r * 0.6)); } gr.add(k.glow(C('fat'), 2.4)); return gr; });
      const faIn = stream(root, mMat, 0.13, curve([V(0, 8, 0.8), V(-0.5, 5.6, 0.8), V(-1.5, 3.2, 0.6)]), 8, 0.4, C('fat'));
      const tgMat = std(C('chylo'), { emissiveIntensity: 0.4 });
      const tgs = Array.from({ length: 10 }, (_, i) => ball(root, tgMat, 0.22, V(-3 + i * 0.7, 2.6 + Math.sin(i) * 0.9, 0.6)));
      const chylo = new THREE.Group(); root.add(chylo);
      ball(chylo, tgMat, 0.9); const apo = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 8, 30), std(C('lyso'), { emissiveIntensity: 0.5 })); apo.rotation.x = 1.2; chylo.add(apo);
      const lacteal = tube(root, ghost(C('lymphatic'), 0.35), [V(-1, -6.5, 0), V(0, -9, 0), V(1, -12, 0)], 1.3);
      const capil = tube(root, ghost(C('rbc'), 0.3), [V(-7, -6.8, -1), V(-4, -8.6, -1), V(-1, -12, -1.5)], 0.7);
      const cPath = curve([V(1.4, 1.4, 0.6), V(2, -1.6, 0.6), V(1.2, -4.2, 0.4), V(0, -5.6, 0), V(0, -8.6, 0), V(0.8, -11.5, 0)]);
      lbl('Gut lumen · micelles', 'fat', micelles, V(-5, 8.6, 0), id);
      lbl('Smooth ER · triglyceride', 'golgi', root, V(5.2, 3.4, 0), id);
      lbl('Golgi', 'golgi', golgi, V(1.8, 0.5, 0), id);
      lbl('Chylomicron · ApoB-48', 'chylo', chylo, V(0, 1.5, 0), id);
      lbl('Lacteal · lymph', 'lymphatic', lacteal, V(2.8, -9.4, 0), id);
      lbl('Blood capillary', 'rbc', capil, V(-6.5, -8.2, -1), id);
      let el = 0, lastPh = -1;
      function draw(dt) {
        const step = LESSON['gut-fat-step'] || 'auto';
        el += reduceMotion ? 0 : dt;
        let T;
        if (reduceMotion) T = step === 'auto' ? 9 : (FAT_T[+step] + FAT_T[+step + 1]) / 2;
        else if (step === 'auto') T = el % 15;
        else { const s = +step, d = FAT_T[s + 1] - FAT_T[s]; T = Math.min(FAT_T[s] + (el % (d + 1)), FAT_T[s + 1] - 0.001); }
        T = Math.min(T, 13.999);
        let ph = 0; while (ph < 3 && T >= FAT_T[ph + 1]) ph++;
        if (step === 'auto' && ph !== lastPh) { lastPh = ph; setCaption('gutFatCaption', FAT[ph][0] + ': ' + FAT[ph][1]); }
        faIn.visible = ph === 0; faIn.update(dt);
        mic.forEach((m, i) => { m.scale.setScalar(ph === 0 ? 1 : 0.6); m.rotation.y += dt * (0.5 + i * 0.2); });
        const tgOn = Math.min(1, Math.max(0, (T - 3) / 2));
        tgs.forEach((m, i) => { m.visible = i < tgOn * tgs.length && ph < 3; });
        chylo.visible = T > 7;
        if (chylo.visible) { const u = Math.min(1, (T - 7) / 6.5); chylo.position.copy(cPath.getPointAt(u)); chylo.scale.setScalar(Math.min(1, (T - 7) / 1.5)); }
        apo.rotation.z += reduceMotion ? 0 : dt;
      }
      whenLesson('gut-fat-step', () => { el = 0; lastPh = -1; });
      behaviors[id] = { enter() { el = 0; lastPh = -1; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Portal vein and first pass ================= */
    {
      const id = 'gut-portal', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 3, 32), w: 17 }, { fade: 'Out to the whole body' });
      const gutPts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; gutPts.push(V(-10 + u * 12, -7 + Math.sin(u * Math.PI * 5) * 1.2, Math.cos(u * Math.PI * 5) * 1.2)); }
      const gut = tube(root, std(C('gut'), { emissiveIntensity: 0.25, transparent: true, opacity: 0.75 }), gutPts, 0.7, false, 160);
      const liver = body(root, C('hepato'), [4.6, 2.6, 2.6], V(-5, 4, 0), 0.4);
      const heart = body(root, C('rbc'), 1.6, V(6, 4, 0), 0.45);
      const bodyT = body(root, C('rbc'), [3, 2, 2], V(7, -5, 0), 0.15);
      const vMat = ghost(C('rbc'), 0.3), pMat = ghost(C('hepato'), 0.35);
      const portalPts = [V(-1, -6, 0), V(-2, -2, 0), V(-4, 1.6, 0), V(-5, 4, 0)];
      tube(root, pMat, portalPts, 0.45);
      const hepPts = [V(-5, 4, 0), V(-1, 5.6, 0), V(3, 5, 0), V(6, 4, 0)]; tube(root, vMat, hepPts, 0.45);
      const sysPts = [V(6, 4, 0), V(9, 1, 0.5), V(7, -5, 0)]; tube(root, vMat, sysPts, 0.4);
      const lymphPts = [V(0, -7.5, 1), V(2.5, -5, 1.5), V(3.2, 0, 1.5), V(4, 3, 1.5), V(5.6, 4.4, 0.8)]; tube(root, ghost(C('lymphatic'), 0.4), lymphPts, 0.3);
      const mouthPts = [V(2, 9, 0), V(4, 7.6, 0), V(6, 4, 0)]; tube(root, vMat, mouthPts, 0.3);
      const ivPts = [V(12, 7, 0), V(9, 5.6, 0), V(6, 4, 0)]; tube(root, vMat, ivPts, 0.3);
      const drugMat = std(C('drug'), { emissiveIntensity: 0.65 });
      const oralPath = curve([...gutPts.slice(10, 40).filter((_, i) => i % 3 === 0), V(-1, -6, 0), V(-2, -2, 0), V(-4, 1.6, 0), V(-5, 4, 0), V(-1, 5.6, 0), V(3, 5, 0), V(6, 4, 0), V(9, 1, 0.5), V(7, -5, 0)]);
      const LIVER_U = 0.55;
      const oral = stream(root, drugMat, 0.24, oralPath, 20, 0.05, C('drug'));
      oral.at = (m, u, i) => { const removed = i % 10 < 7; if (removed && u > LIVER_U) m.visible = false; else if (removed && u > LIVER_U - 0.06) m.scale.setScalar(0.24 * (LIVER_U - u) / 0.06 + 0.001); else m.scale.setScalar(0.24); };
      const sub = stream(root, drugMat, 0.24, curve([...mouthPts, V(9, 1, 0.5), V(7, -5, 0)]), 10, 0.1, C('drug'));
      const iv = stream(root, drugMat, 0.24, curve([...ivPts, V(9, 1, 0.5), V(7, -5, 0)]), 10, 0.1, C('drug'));
      const nutr = stream(root, std(C('glucose'), { emissiveIntensity: 0.6 }), 0.18, curve([V(-6, -6.5, 0.5), ...portalPts]), 8, 0.12, C('glucose'));
      const chy = stream(root, std(C('chylo'), { emissiveIntensity: 0.5 }), 0.26, curve(lymphPts), 5, 0.1);
      const oralLbl = new THREE.Group(), subLbl = new THREE.Group(), ivLbl = new THREE.Group(); [oralLbl, subLbl, ivLbl].forEach(x => root.add(x));
      lbl('Swallowed dose', 'drug', oralLbl, V(-12, -6.6, 0), id); lbl('70% removed on first pass', 'hepato', oralLbl, V(-5, 7.2, 0), id); lbl('≈30% reaches the body', 'drug', oralLbl, V(10.5, -1.2, 0), id);
      lbl('Mouth veins → heart', 'drug', subLbl, V(2, 10, 0), id); lbl('No first pass · most of dose', 'drug', subLbl, V(10.5, -1.2, 0), id);
      lbl('IV line → heart', 'drug', ivLbl, V(12, 8, 0), id); lbl('100% reaches the body', 'drug', ivLbl, V(10.5, -1.2, 0), id);
      lbl('Small intestine', 'gut', gut, V(-7, -9.4, 0), id);
      lbl('Liver', 'hepato', liver, V(-0.75, -0.2, 0), id);
      lbl('Portal vein', 'hepato', root, V(-3.8, -1.2, 0.6), id);
      lbl('Heart', 'rbc', heart, V(0, 1.4, 0), id);
      lbl('Body tissues', 'rbc', bodyT, V(0, -1.4, 0), id);
      lbl('Thoracic duct · lymph', 'lymphatic', root, V(4.6, -1.8, 1.6), id);
      function draw(dt) {
        const r = LESSON['gut-route'] || 'oral';
        oral.visible = oralLbl.visible = r === 'oral'; sub.visible = subLbl.visible = r === 'sublingual'; iv.visible = ivLbl.visible = r === 'iv';
        [oral, sub, iv, nutr, chy].forEach(s => s.update(dt));
        heart.scale.setScalar(1.6 + (reduceMotion ? 0 : 0.12 * Math.max(0, Math.sin(now * 7))));
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
