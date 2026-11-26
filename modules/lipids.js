/* Lipid and cholesterol trafficking: LDL receptor uptake with statins and PCSK9 inhibitors, atherosclerotic plaque with CT,
   and cholesterol as the precursor of steroid hormones.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osLipid: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/24-3-lipid-metabolism', 'OpenStax Anatomy &amp; Physiology 2e, 24.3 Lipid Metabolism'),
  osAdrenal: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/17-6-the-adrenal-glands', 'OpenStax Anatomy &amp; Physiology 2e, 17.6 The Adrenal Glands'),
  osFlow: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/20-2-blood-flow-blood-pressure-and-resistance', 'OpenStax Anatomy &amp; Physiology 2e, 20.2 Blood Flow, Blood Pressure, and Resistance'),
  goldstein: link('https://doi.org/10.1161/ATVBAHA.108.179564', 'Goldstein &amp; Brown, the LDL receptor (Arterioscler Thromb Vasc Biol, 2009)'),
  grundy: link('https://doi.org/10.1161/CIR.0000000000000625', 'Grundy et al., 2018 AHA/ACC guideline on the management of blood cholesterol (Circulation, 2019)'),
  libby: link('https://doi.org/10.1038/s41572-019-0106-z', 'Libby et al., atherosclerosis (Nat Rev Dis Primers, 2019)'),
  cury: link('https://doi.org/10.1016/j.jcct.2022.07.002', 'Cury et al., CAD-RADS 2.0 reporting system for coronary CT angiography (J Cardiovasc Comput Tomogr, 2022)'),
  miller: link('https://doi.org/10.1210/er.2010-0013', 'Miller &amp; Auchus, the molecular biology, biochemistry and physiology of human steroidogenesis (Endocr Rev, 2011)'),
};
const LDL = {
  normal: 'Normal: apoB-100 on each LDL particle docks onto an LDL receptor in a clathrin-coated pit. The pit pinches off, the acidic endosome releases the receptor to recycle, and the LDL goes on to a lysosome that frees its cholesterol. Rising cell cholesterol keeps SREBP-2 parked in the ER, so the cell makes less HMG-CoA reductase and fewer new receptors. PCSK9 escorts some receptors to the lysosome to be destroyed.',
  statin: 'Statin: the drug blocks HMG-CoA reductase, the rate-limiting enzyme of cholesterol synthesis. With less cholesterol made inside, SREBP-2 moves to the nucleus and switches on the LDL receptor gene, so more receptors pull LDL out of the blood. High-intensity statins lower LDL cholesterol by about half. SREBP-2 also raises PCSK9, which blunts part of the effect, one reason PCSK9 inhibitors add to statins.',
  pcsk9: 'PCSK9 inhibitor: an antibody (evolocumab or alirocumab) or the siRNA inclisiran removes PCSK9 from the picture, so receptors are no longer sent for destruction. They recycle many more times, and blood LDL falls by roughly 50 to 60 percent, more when added to a statin.',
  fh: 'Familial hypercholesterolemia: a faulty LDL receptor gene (or apoB or a gain-of-function PCSK9 gene) leaves too few working receptors. LDL builds up in the blood from birth, about 1 in 250 people are affected, and untreated it brings heart attacks decades early.',
};
const PLAQUE = {
  streak: 'Fatty streak: LDL slips under the endothelium and becomes oxidized there. Endothelial cells call in monocytes, which become macrophages and swallow the oxidized LDL through scavenger receptors until they are swollen with lipid droplets: foam cells. Streaks can appear in adolescence.',
  stable: 'Stable plaque: smooth muscle cells migrate in and lay down a thick collagen fibrous cap over a lipid core. Calcium deposits form. The plaque may narrow the artery and cause angina with exertion, but the thick cap rarely breaks.',
  vulnerable: 'Vulnerable plaque: a large necrotic lipid core, many inflammatory macrophages and a thin cap that their enzymes weaken. If the cap ruptures, the core contacts blood, platelets and fibrin build a clot on it, and the artery can be blocked within minutes: a heart attack or stroke.',
  ct: 'On CT: a non-contrast scan measures coronary artery calcium as an Agatston score, a marker of total plaque burden that helps decide on preventive treatment. CT angiography with contrast shows the lumen and the plaque itself; low-density plaque, positive remodeling and spotty calcium suggest a vulnerable lesion, and CAD-RADS grades the narrowing.',
};
const STEROID = {
  cortisol: 'Adrenal cortex, zona fasciculata: ACTH from the pituitary raises cAMP, which increases StAR. StAR moves cholesterol from the outer to the inner mitochondrial membrane, the rate-limiting step, where CYP11A1 cuts off its side chain to make pregnenolone. Enzymes in the ER and mitochondria, including 21-hydroxylase and 11β-hydroxylase, then build cortisol.',
  aldosterone: 'Adrenal cortex, zona glomerulosa: angiotensin II and high blood potassium drive the same first steps, and aldosterone synthase (CYP11B2), made only in this zone, finishes the pathway to aldosterone, which tells the kidney to keep sodium and lose potassium.',
  sex: 'Gonads: LH drives StAR and CYP11A1 in testis Leydig cells and ovarian theca cells. CYP17A1 steers pregnenolone toward androgens such as testosterone, and in the ovary aromatase (CYP19A1) in granulosa cells converts androgens to estradiol.',
  star: 'StAR deficiency (congenital lipoid adrenal hyperplasia): without StAR, cholesterol cannot reach CYP11A1. Every steroid hormone stays low, and unused cholesterol piles up in lipid droplets until it damages the cells. Infants have life-threatening adrenal failure and need hormone replacement.',
};
whenLesson('lipid-ldl', v => setCaption('lipidLdlCaption', LDL[v]));
whenLesson('lipid-plaque', v => setCaption('lipidPlaqueCaption', PLAQUE[v]));
whenLesson('lipid-steroid', v => setCaption('lipidSteroidCaption', STEROID[v]));

const CHAPTERS = [
  {
    id: 'lipid-ldl', short: 'LDL uptake & statins', where: 'Blood plasma and a liver cell surface',
    title: 'LDL receptors, statins and PCSK9',
    legend: [['ldl', 'LDL particle (apoB-100)'], ['ldlr', 'LDL receptor'], ['cut', 'PCSK9'], ['lyso', 'Lysosome'], ['fat', 'Free cholesterol'], ['er', 'ER · HMG-CoA reductase'], ['drug', 'Statin or PCSK9 antibody']],
    html: () => `
      <p class="lede">Cholesterol travels in the blood packed in <b>LDL</b> particles. The liver removes most of them through the <b>LDL receptor</b>, and how many receptors sit on its surface largely sets your blood LDL level.</p>
      ${lessonSeg('lipid-ldl', 'Condition', [['normal', 'Normal'], ['statin', 'Statin'], ['pcsk9', 'PCSK9 inhibitor'], ['fh', 'Familial hypercholesterolemia']])}
      ${caption('lipidLdlCaption', LDL[LESSON['lipid-ldl']])}
      <ul class="facts">
        <li>Goldstein and Brown worked out this pathway, including receptor recycling and feedback by cholesterol, and shared the 1985 Nobel Prize for it.</li>
        <li>Most of the cholesterol in your body is made by your own cells, largely in the liver; a smaller share comes from food, absorbed by enterocytes and carried in chylomicrons.</li>
        <li>Ezetimibe blocks cholesterol absorption by the gut transporter NPC1L1, which also leads the liver to make more LDL receptors.</li>
        <li>Statin muscle aches are common complaints, but in blinded trials most are not caused by the drug; true muscle injury is rare.</li>
      </ul>
      <p><a href="#intake">Receptor-mediated endocytosis in the cleanup module</a> · <a href="#gut-fat">Dietary fat and chylomicrons</a> · <a href="#lipid-plaque">What excess LDL does to arteries</a></p>
      ${sources([SRC.goldstein, SRC.grundy, SRC.osLipid], 'Particles and receptors are drawn far larger than life, a single cycle takes minutes rather than seconds, and receptor counts are illustrative. Drug effects are typical averages; individual responses vary. For learning, not treatment decisions.')}`,
  },
  {
    id: 'lipid-plaque', short: 'Atherosclerosis', where: 'Inside an artery wall',
    title: 'Foam cells, plaques and coronary CT',
    legend: [['ldl', 'LDL'], ['lesion', 'Oxidized LDL'], ['mono', 'Monocyte and macrophage'], ['foam', 'Foam cell'], ['collagen', 'Fibrous cap'], ['fat', 'Necrotic lipid core'], ['mineral', 'Calcium'], ['plt', 'Platelet clot']],
    html: () => `
      <p class="lede"><b>Atherosclerosis</b> is a slow, inflammatory buildup of cholesterol inside artery walls. It is the main cause of heart attacks and strokes, and the risk tracks with how much LDL the wall is exposed to, over how many years.</p>
      ${lessonSeg('lipid-plaque', 'Stage', [['streak', 'Fatty streak'], ['stable', 'Stable plaque'], ['vulnerable', 'Vulnerable plaque'], ['ct', 'On CT']])}
      ${caption('lipidPlaqueCaption', PLAQUE[LESSON['lipid-plaque']])}
      <ul class="facts">
        <li>Plaques form where flow is disturbed, such as at branch points and the inner curves of arteries, because steady flow keeps the endothelium healthy.</li>
        <li>Many heart attacks come from plaques that narrowed the artery only moderately. A thin cap and an inflamed core matter more than the degree of narrowing alone.</li>
        <li>Smoking, high blood pressure, diabetes and high LDL all damage the endothelium or add to the lipid supply; lowering LDL slows plaque growth and lowers event rates.</li>
        <li>A calcium score of zero means very little calcified plaque and a low near-term risk, but it does not rule out soft plaque, especially in young smokers.</li>
      </ul>
      <p><a href="#immune-complement">Inflammation and immune cells</a> · <a href="#blood/mono">Monocytes</a> · <a href="#clotting">How a ruptured plaque clots</a> · <a href="#lipid-ldl">Lowering LDL</a></p>
      ${sources([SRC.libby, SRC.cury, SRC.osFlow], 'The plaque grows in seconds here; in life it takes decades. The CT panel is a drawn illustration, not a patient image, and cell sizes are exaggerated. Plaque features on CT suggest risk but cannot predict a single event. For learning, not diagnosis.')}`,
  },
  {
    id: 'lipid-steroid', short: 'Steroid precursors', where: 'A steroid-making cell: lipid droplet, mitochondrion and ER',
    title: 'From cholesterol to steroid hormones',
    legend: [['fat', 'Cholesterol'], ['mito', 'Mitochondrion'], ['cadherin', 'StAR'], ['cyp', 'CYP11A1'], ['steroid', 'Pregnenolone'], ['er', 'Smooth ER'], ['insulin', 'Hormone made']],
    html: () => `
      <p class="lede">All steroid hormones, from cortisol to estradiol, are built on the same four-ring backbone, and every one of them starts the same way: by moving cholesterol into a mitochondrion and cutting it down to <b>pregnenolone</b>.</p>
      ${lessonSeg('lipid-steroid', 'Tissue', [['cortisol', 'Adrenal: cortisol'], ['aldosterone', 'Adrenal: aldosterone'], ['sex', 'Gonads: sex steroids'], ['star', 'StAR deficiency']])}
      ${caption('lipidSteroidCaption', STEROID[LESSON['lipid-steroid']])}
      <ul class="facts">
        <li>Steroid-making cells take most of their cholesterol from LDL and HDL in the blood and store it as cholesterol esters in lipid droplets, which is why the adrenal cortex looks yellow.</li>
        <li>Most of the enzymes are cytochrome P450s, cousins of the liver’s drug-metabolizing CYPs. Many are named by the carbon they act on: 21-hydroxylase acts on carbon 21.</li>
        <li>The most common inherited defect, 21-hydroxylase deficiency, blocks cortisol and aldosterone, and precursors spill into androgens instead, a form of congenital adrenal hyperplasia found in newborn screening.</li>
        <li>Steroids are fat-soluble, so they are made on demand rather than stored, cross membranes freely, and mostly act on receptors inside the cell.</li>
      </ul>
      <p><a href="#endocrine-map">Where the glands are</a> · <a href="#endocrine-feedback">Feedback loops that drive ACTH and LH</a> · <a href="#liver-cyp">CYP enzymes in the liver</a> · <a href="#lipid-ldl">Where the cholesterol comes from</a></p>
      ${sources([SRC.miller, SRC.osAdrenal, SRC.osLipid], 'The pathway is collapsed to one branch point; real steroidogenesis has many intermediates and moves back and forth between ER and mitochondria. Organelles are not to scale.')}`,
  },
];

CellCity.register('lipids', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, panel, V } = k;
    const { behaviors } = k.out;
    const lerp = (a, b, u) => a + (b - a) * u;
    function ldlParticle(parent, color = 'ldl') {
      const grp = new THREE.Group(); parent.add(grp);
      grp.add(new THREE.Mesh(k.sphere, std(C(color), { emissiveIntensity: 0.35 }))); grp.children[0].scale.setScalar(0.5);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.07, 6, 24), std(C('ldlr'), { emissiveIntensity: 0.4 })); ring.rotation.x = 1.1; grp.add(ring);
      return grp;
    }

    /* ================= LDL uptake ================= */
    {
      const id = 'lipid-ldl', root = new THREE.Group();
      add(id, root, { target: V(0, -0.5, 0), pos: V(3, 6, 27), w: 14 }, { fade: 'To a liver cell surface' });
      const mem = new THREE.Mesh(new THREE.BoxGeometry(22, 0.9, 7), ghost(C('membrane'), 0.3)); root.add(mem);
      const plasma = Array.from({ length: 16 }, (_, i) => ({ g: ldlParticle(root), p: V(rr(-9, 9), rr(2.2, 6), rr(-2.5, 2.5)), ph: rr(0, 6) }));
      const rMat = std(C('ldlr'), { emissiveIntensity: 0.45 });
      const recs = Array.from({ length: 10 }, (_, i) => { const grp = new THREE.Group(); grp.position.set(-8.5 + i * 1.9, 0, i % 2 ? 1.2 : -1.2); root.add(grp); rod(grp, rMat, V(0, -0.5, 0), V(0, 1, 0), 0.09); ball(grp, rMat, 0.28, V(0, 1.15, 0)); return grp; });
      const lyso = body(root, C('lyso'), 1.5, V(1.5, -6.2, 0), 0.3);
      const endo = body(root, C('electron'), 1, V(-3, -3.6, 0), 0.2);
      const er = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 4), ghost(C('er'), 0.35)); er.position.set(7, -4.5, 0); root.add(er);
      const erGlow = k.glow(C('er'), 6); erGlow.position.copy(er.position); root.add(erGlow);
      const statin = ball(root, std(C('drug'), { emissiveIntensity: 0.7 }), 0.35, V(6.2, -3.4, 1));
      // one uptake cycle: LDL binds a receptor, the coated vesicle descends, LDL goes to the lysosome and the receptor recycles
      const cyc = ldlParticle(root), cycR = ball(root, rMat, 0.28), ves = body(root, C('ldlr'), 0.95, null, 0.12);
      const pcsk = ball(root, std(C('cut'), { emissiveIntensity: 0.6 }), 0.26);
      const anti = ball(root, std(C('drug'), { emissiveIntensity: 0.7 }), 0.3);
      const chol = Array.from({ length: 6 }, () => ball(root, std(C('fat'), { emissiveIntensity: 0.6 }), 0.14));
      const pDown = curve([V(-3, 1.6, 0), V(-3, 0, 0), V(-3, -1.8, 0), V(-3, -3.6, 0)]);
      const pLyso = curve([V(-3, -3.6, 0), V(-1, -5.4, 0), V(1.5, -6.2, 0)]);
      const pBack = curve([V(-3, -3.6, 0), V(-4.5, -2, 0.5), V(-4.4, 0, 0.5), V(-4.4, 1.15, 0.5)]);
      lbl('Blood plasma', 'electron', root, V(-9.5, 6.4, -2), id);
      lbl('LDL · apoB-100', 'ldl', root, V(6, 6.6, 0), id);
      lbl('LDL receptors', 'ldlr', root, V(9.5, 1.9, 1.2), id);
      lbl('Coated pit → endosome', 'electron', endo, V(-2.4, 0, 0), id);
      lbl('Lysosome', 'lyso', lyso, V(0, -1.2, 0), id);
      lbl('ER · SREBP-2 · HMG-CoA reductase', 'er', er, V(0, -1.4, 0), id);
      const sL = new THREE.Group(); root.add(sL); lbl('Statin', 'drug', sL, V(5.2, -2.6, 1), id);
      const pL = new THREE.Group(); root.add(pL); lbl('PCSK9', 'cut', pL, V(-1.2, 2.6, 1.6), id);
      const N = { normal: [5, 9], statin: [8, 6], pcsk9: [9, 4], fh: [1, 16] };
      let el = 0;
      function draw(dt) {
        const v = LESSON['lipid-ldl'] || 'normal';
        el += reduceMotion ? 0 : dt;
        const [nr, np] = N[v];
        recs.forEach((r, i) => { r.visible = i < nr; r.position.x = -8 + (nr > 1 ? i * 16 / (nr - 1) : 8); });
        plasma.forEach((p, i) => { p.g.visible = i < np; p.g.position.set(p.p.x + Math.sin(el * 0.5 + p.ph) * 0.6, p.p.y + Math.cos(el * 0.7 + p.ph) * 0.3, p.p.z); p.g.rotation.y = el * 0.4 + p.ph; });
        statin.visible = sL.visible = v === 'statin';
        erGlow.material.opacity = v === 'statin' ? 0.12 : v === 'fh' ? 0.6 : 0.4;
        const u = reduceMotion ? 0.35 : (el % 7) / 7;
        const working = v !== 'fh' || u < 0.5;
        // 0-0.15 bind, 0.15-0.4 descend, 0.4-0.7 lysosome or recycle, 0.7-1 cholesterol to the ER
        cyc.visible = working && u < 0.72; ves.visible = working && u > 0.12 && u < 0.42; cycR.visible = working && u > 0.12;
        if (u < 0.15) { cyc.position.set(-3, lerp(4.5, 1.75, u / 0.15), 0); cycR.position.set(-3, 1.15, 0); }
        else if (u < 0.42) { const s = (u - 0.15) / 0.27; cyc.position.copy(pDown.getPointAt(s)); cycR.position.copy(cyc.position).add(V(0, -0.6, 0)); ves.position.copy(cyc.position); }
        else { const s = Math.min(1, (u - 0.42) / 0.28); cyc.position.copy(pLyso.getPointAt(s)); }
        const destroy = v !== 'pcsk9';
        if (u >= 0.42) cycR.position.copy(destroy ? pLyso.getPointAt(Math.min(1, (u - 0.42) / 0.28)) : pBack.getPointAt(Math.min(1, (u - 0.42) / 0.3)));
        cycR.visible = cycR.visible && !(destroy && u > 0.72);
        pcsk.visible = pL.visible = v !== 'pcsk9' && working && u < 0.72; if (pcsk.visible) pcsk.position.copy(u < 0.15 ? V(-2.2, 3.2 - u * 8, 0.8) : cycR.position.clone().add(V(0.4, 0.2, 0.3)));
        anti.visible = v === 'pcsk9'; anti.position.set(-1.6 + Math.sin(el) * 0.3, 3.2, 1);
        chol.forEach((c, i) => { c.visible = working && u > 0.7; const s = Math.max(0, Math.min(1, (u - 0.7) / 0.28 - i * 0.05)); c.position.set(lerp(1.5, 6.2 + i * 0.3, s), lerp(-6.2, -4.5, s) + Math.sin(i * 2) * 0.3, Math.cos(i * 2) * 0.4); });
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Atherosclerotic plaque ================= */
    {
      const id = 'lipid-plaque', root = new THREE.Group();
      add(id, root, { target: V(-2, -1.2, 0), pos: V(-1, 4, 27), w: 11.5 }, { fade: 'Into the artery wall' });
      const art = new THREE.Group(); art.position.x = -2; root.add(art);
      const outer = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 16, 40, 1, true), ghost(C('rbc'), 0.12)); outer.rotation.z = Math.PI / 2; art.add(outer);
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 16, 40, 1, true), ghost(C('membrane'), 0.22)); inner.rotation.z = Math.PI / 2; art.add(inner);
      const flow = stream(art, std(C('rbc'), { emissiveIntensity: 0.25 }), 0.4, curve([V(-8, 1.2, 0.5), V(8, 1.2, 0.5)]), 7, 0.08);
      const flow2 = stream(art, std(C('rbc'), { emissiveIntensity: 0.25 }), 0.4, curve([V(-8, -0.2, -1.2), V(8, -0.2, -1.2)]), 6, 0.1);
      const plaque = new THREE.Group(); plaque.position.set(0, -3.6, 0); art.add(plaque);
      const capMat = std(C('collagen'), { emissiveIntensity: 0.3, transparent: true, opacity: 0.55 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), capMat); plaque.add(cap);
      const core = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), std(C('fat'), { emissiveIntensity: 0.25 })); plaque.add(core);
      const foams = Array.from({ length: 7 }, (_, i) => { const f = new THREE.Group(); f.position.set(-2.6 + i * 0.85, 0.5 + (i % 2) * 0.4, rr(-1.2, 1.2)); plaque.add(f); f.add(new THREE.Mesh(k.sphere, ghost(C('foam'), 0.45))); f.children[0].scale.setScalar(0.45); for (let j = 0; j < 5; j++) ball(f, std(C('foam'), { emissiveIntensity: 0.6 }), 0.12, V(rr(-0.25, 0.25), rr(-0.25, 0.25), rr(-0.25, 0.25))); return f; });
      const calc = Array.from({ length: 6 }, (_, i) => ball(plaque, std(C('mineral'), { emissiveIntensity: 0.7 }), 0.22, V(-2.4 + i * 0.95, 0.25, (i % 2 ? 1 : -1) * 1.4)));
      const ldlIn = stream(art, std(C('ldl'), { emissiveIntensity: 0.6 }), 0.2, curve([V(-3, 0.6, 1), V(-1.6, -2.6, 0.8), V(-0.6, -3.1, 0.6)]), 4, 0.25, C('ldl'));
      const ox = stream(art, std(C('lesion'), { emissiveIntensity: 0.7 }), 0.2, curve([V(-0.6, -3.1, 0.6), V(0.6, -3, 0.2), V(1.4, -2.9, -0.6)]), 3, 0.25, C('lesion'));
      const mono = stream(art, std(C('mono'), { emissiveIntensity: 0.4 }), 0.42, curve([V(3, 1.2, -1), V(2.4, -2.2, -0.8), V(1.6, -3, -0.6)]), 2, 0.12);
      const clot = new THREE.Group(); clot.position.set(1.6, -1.6, 0); art.add(clot);
      for (let i = 0; i < 14; i++) ball(clot, std(C('plt'), { emissiveIntensity: 0.5 }), 0.24, V(rr(-1.2, 1.2), rr(-0.6, 0.8), rr(-1, 1)));
      for (let i = 0; i < 6; i++) rod(clot, std(C('fibrin'), { emissiveIntensity: 0.4 }), V(rr(-1.4, 1.4), rr(-0.6, 0.9), rr(-1, 1)), V(rr(-1.4, 1.4), rr(-0.6, 0.9), rr(-1, 1)), 0.04);
      const ct = panel(root, 11, 7.3, 480); ct.mesh.position.set(-2, -0.8, 5.5);
      ct.draw((c, w, h) => {
        c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
        const half = w / 2;
        // left: non-contrast axial heart with calcified coronary dots
        c.fillStyle = '#4d4d4d'; c.beginPath(); c.ellipse(half / 2, h / 2 + 10, 92, 100, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#5c5c5c'; c.beginPath(); c.ellipse(half / 2 + 10, h / 2 + 18, 60, 66, 0.3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#ffffff'; [[half / 2 - 50, h / 2 - 50, 6], [half / 2 - 40, h / 2 - 40, 4], [half / 2 + 54, h / 2 - 30, 5], [half / 2 + 66, h / 2 + 20, 4]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); });
        // right: CT angiography of a coronary segment with a narrowing and soft plaque
        c.strokeStyle = '#e8e8e8'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(half + 30, 60); c.bezierCurveTo(half + 120, 120, half + 60, 200, half + 190, 260); c.stroke();
        c.fillStyle = '#000'; c.beginPath(); c.ellipse(half + 98, 160, 12, 7, 0.9, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#6a6a6a'; c.beginPath(); c.ellipse(half + 108, 152, 14, 9, 0.9, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(half + 120, 146, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#e6edf5'; c.font = '600 17px "IBM Plex Mono", monospace'; c.textAlign = 'center';
        c.fillText('Calcium score CT', half / 2, 26); c.fillText('CT angiography', half + half / 2, 26);
        c.font = '14px "IBM Plex Mono", monospace';
        c.fillText('bright = calcified plaque', half / 2, h - 14); c.fillText('narrowing + soft plaque', half + half / 2, h - 14);
        c.strokeStyle = '#2a3646'; c.lineWidth = 2; c.beginPath(); c.moveTo(half, 40); c.lineTo(half, h - 30); c.stroke();
      });
      lbl('Lumen · blood flow', 'rbc', art, V(-6, 2.8, 0), id);
      lbl('LDL enters wall', 'ldl', art, V(-5.4, -0.4, 1.6), id);
      lbl('Monocyte', 'mono', art, V(5, 1.6, -1), id);
      const foamL = new THREE.Group(); foams[6].add(foamL); lbl('Foam cells', 'foam', foamL, V(2.2, 1.4, 0), id);
      const capL = new THREE.Group(); plaque.add(capL); lbl('Fibrous cap', 'collagen', capL, V(0.2, 2.5, 2.2), id);
      const coreL = new THREE.Group(); plaque.add(coreL); lbl('Necrotic core', 'fat', coreL, V(3, 0.5, 2.2), id);
      const calcL = new THREE.Group(); plaque.add(calcL); lbl('Calcium', 'mineral', calcL, V(-3.6, -0.2, 1.8), id);
      lbl('Rupture → clot', 'plt', clot, V(-0.2, 2.4, 0), id);
      const SHAPE = { streak: [3.2, 0.6, 1.8, 0, 0], stable: [4.2, 2.0, 2.4, 0.45, 1], vulnerable: [4.4, 2.2, 2.6, 0.12, 0.35], ct: [4.2, 2.0, 2.4, 0.45, 1] };
      let cur = null, gr = 1;
      function draw(dt) {
        const v = LESSON['lipid-plaque'] || 'streak';
        if (v !== cur) { cur = v; gr = reduceMotion ? 1 : 0; }
        gr = Math.min(1, gr + dt * 0.8);
        const [len, hgt, wid, capT, calcAmt] = SHAPE[v];
        const e = ease.out(gr);
        cap.scale.set(len * (0.6 + 0.4 * e), hgt * e + 0.01, wid);
        core.scale.set(len * 0.75 * (v === 'vulnerable' ? 0.95 : 0.7), Math.max(0.01, (hgt - capT) * e * (v === 'streak' ? 0.4 : 1)), wid * 0.78);
        core.visible = v !== 'streak'; capL.visible = coreL.visible = v !== 'streak' && v !== 'ct';
        art.visible = foamL.visible = v !== 'ct';
        capMat.opacity = v === 'streak' ? 0.18 : v === 'vulnerable' ? 0.3 : 0.6; capMat.color.copy(C(v === 'streak' ? 'membrane' : 'collagen'));
        foams.forEach((f, i) => { f.visible = v === 'streak' || v === 'vulnerable' || i % 3 === 0; f.position.y = v === 'streak' ? 0.3 : hgt * 0.55 * e; });
        calc.forEach((c, i) => { c.visible = i < calcAmt * 6; });
        calcL.visible = calcAmt > 0 && v !== 'ct';
        clot.visible = v === 'vulnerable' && gr > 0.6;
        ct.mesh.visible = v === 'ct';
        mono.visible = ldlIn.visible = ox.visible = v !== 'ct';
        clot.visible = clot.visible && v !== 'ct';
        [flow, flow2, ldlIn, ox, mono].forEach(s => s.update(dt));
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Steroid precursors ================= */
    {
      const id = 'lipid-steroid', root = new THREE.Group();
      add(id, root, { target: V(0.5, 0.5, 0), pos: V(2, 5, 27), w: 15 }, { fade: 'Inside a steroid-making cell' });
      const drop = body(root, C('fat'), 1.6, V(-8, 1.5, 0), 0.4);
      const esters = Array.from({ length: 14 }, () => ball(drop, std(C('fat'), { emissiveIntensity: 0.6 }), 0.12, V(rr(-0.7, 0.7), rr(-0.7, 0.7), rr(-0.7, 0.7))));
      const mitoG = new THREE.Group(); mitoG.position.set(-2, 0, 0); root.add(mitoG);
      const om = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, 3.6, 8, 24), ghost(C('mito'), 0.22)); om.rotation.z = Math.PI / 2; mitoG.add(om);
      const im = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 3.2, 8, 24), ghost(C('mito'), 0.3)); im.rotation.z = Math.PI / 2; mitoG.add(im);
      for (let i = -1; i <= 1; i++) { const cr = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.8, 1.6), ghost(C('mito'), 0.35)); cr.position.x = i * 1.4; mitoG.add(cr); }
      const starMat = std(C('cadherin'), { emissiveIntensity: 0.6 });
      const star = ball(mitoG, starMat, 0.4, V(-2.2, 1.6, 0.4));
      const cyp = ball(mitoG, std(C('cyp'), { emissiveIntensity: 0.6 }), 0.45, V(0.2, 1.05, 0.6));
      const er = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7, 3), ghost(C('er'), 0.25)); er.position.set(4.5, 0, 0); root.add(er);
      const preg = ball(root, std(C('steroid'), { emissiveIntensity: 0.7 }), 0.4, V(4.5, 0, 1.6)); preg.add(k.glow(C('steroid'), 2.6));
      const OUTS = [['aldosterone', 'Aldosterone', V(9.6, 3.6, 0)], ['cortisol', 'Cortisol', V(10.2, 1.2, 0)], ['testosterone', 'Testosterone', V(10.2, -1.2, 0)], ['estradiol', 'Estradiol', V(9.6, -3.6, 0)]];
      const outs = OUTS.map(([key, name, p]) => {
        const mat = std(C('insulin'), { emissiveIntensity: 0.15 }); const m = ball(root, mat, 0.45, p); const gl = k.glow(C('insulin'), 3); m.add(gl);
        rod(root, std(C('steroid'), { emissiveIntensity: 0.2, transparent: true, opacity: 0.4 }), V(4.5, 0, 1.6), p, 0.05);
        lbl(name, 'insulin', m, V(1.6, 0.2, 0), id); return { key, m, mat, gl };
      });
      const ACTIVE = { cortisol: ['cortisol'], aldosterone: ['aldosterone'], sex: ['testosterone', 'estradiol'], star: [] };
      const flowIn = curve([V(-8, 1.5, 0), V(-5.5, 1.9, 0.4), V(-4.2, 1.6, 0.4), V(-2.6, 1.1, 0.6), V(-1.8, 1.05, 0.6)]);
      const flowStop = curve([V(-8, 1.5, 0), V(-5.5, 1.9, 0.4), V(-4.4, 1.7, 0.4), V(-5.6, 2.4, 0.2), V(-8, 1.5, 0)]);
      const flowOut = curve([V(-1.8, 1.05, 0.6), V(0.4, 1.4, 1.2), V(2.6, 0.6, 1.6), V(4.5, 0, 1.6)]);
      const chol = stream(root, std(C('fat'), { emissiveIntensity: 0.7 }), 0.17, flowIn, 5, 0.3, C('fat'));
      const pre = stream(root, std(C('steroid'), { emissiveIntensity: 0.7 }), 0.17, flowOut, 4, 0.3, C('steroid'));
      const ldlArrow = stream(root, std(C('ldl'), { emissiveIntensity: 0.6 }), 0.3, curve([V(-10.5, 6, 0), V(-9, 3.4, 0), V(-8, 1.5, 0)]), 2, 0.2, C('ldl'));
      lbl('Lipid droplet · cholesterol esters', 'fat', root, V(-8, -1.9, 0), id);
      lbl('LDL from blood', 'ldl', root, V(-10, 6.6, 0), id);
      lbl('StAR', 'cadherin', star, V(-0.6, 0.7, 0), id);
      lbl('CYP11A1 · side-chain cleavage', 'cyp', cyp, V(0.4, -2.7, 0.6), id);
      lbl('Mitochondrion', 'mito', mitoG, V(-0.4, 2.7, 0), id);
      lbl('Pregnenolone', 'steroid', preg, V(0, 1, 0), id);
      lbl('Smooth ER', 'er', er, V(0, -4.2, 0), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['lipid-steroid'] || 'cortisol';
        el += reduceMotion ? 0 : dt;
        const blocked = v === 'star';
        chol.curve = blocked ? flowStop : flowIn;
        pre.visible = !blocked; preg.visible = !blocked;
        [chol, pre, ldlArrow].forEach(s => s.update(dt));
        starMat.color.copy(C(blocked ? 'dead' : 'cadherin')); starMat.emissive.copy(starMat.color);
        drop.scale.setScalar(lerp(drop.scale.x, blocked ? 2.3 : 1.6, reduceMotion ? 1 : Math.min(1, dt * 1.5)));
        outs.forEach(o => { const on = ACTIVE[v].includes(o.key); o.mat.emissiveIntensity = on ? 0.6 + 0.3 * Math.sin(el * 3) : 0.08; o.gl.visible = on; o.mat.color.copy(C(on ? 'insulin' : 'dead')); });
        void esters;
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
