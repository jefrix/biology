/* Stem cells and differentiation: the potency ladder and asymmetric division in a niche, how one genome makes
   different cells (signals, master transcription factors, Polycomb and Waddington's landscape), and marrow niches,
   hematopoiesis, iPSC reprogramming and marrow on MRI and FDG-PET.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osDiff: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/3-6-cellular-differentiation', 'OpenStax Anatomy and Physiology 2e, 3.6 Cellular Differentiation'),
  osGene: link('https://openstax.org/books/biology-2e/pages/16-1-regulation-of-gene-expression', 'OpenStax Biology 2e, 16.1 Regulation of Gene Expression'),
  osBlood: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/18-2-production-of-the-formed-elements', 'OpenStax Anatomy and Physiology 2e, 18.2 Production of the Formed Elements'),
  morrison: link('https://doi.org/10.1016/j.cell.2008.01.038', 'Morrison &amp; Spradling, stem cells and niches (Cell, 2008)'),
  knoblich: link('https://doi.org/10.1016/j.cell.2008.02.007', 'Knoblich, mechanisms of asymmetric stem cell division (Cell, 2008)'),
  barker: link('https://doi.org/10.1038/nature06196', 'Barker et al., identification of stem cells in small intestine and colon by marker gene Lgr5 (Nature, 2007)'),
  thomson: link('https://doi.org/10.1126/science.282.5391.1145', 'Thomson et al., embryonic stem cell lines derived from human blastocysts (Science, 1998)'),
  davis: link('https://doi.org/10.1016/0092-8674(87)90585-X', 'Davis, Weintraub &amp; Lassar, a single transfected cDNA converts fibroblasts to myoblasts (Cell, 1987)'),
  margueron: link('https://doi.org/10.1038/nature09784', 'Margueron &amp; Reinberg, the Polycomb complex PRC2 and its mark in life (Nature, 2011)'),
  decade: link('https://doi.org/10.1038/nrm.2016.8', 'Takahashi &amp; Yamanaka, a decade of transcription factor-mediated reprogramming to pluripotency (Nat Rev Mol Cell Biol, 2016)'),
  orkin: link('https://doi.org/10.1016/j.cell.2008.01.025', 'Orkin &amp; Zon, hematopoiesis: an evolving paradigm for stem cell biology (Cell, 2008)'),
  mendelson: link('https://doi.org/10.1038/nm.3647', 'Mendelson &amp; Frenette, hematopoietic stem cell niche maintenance (Nat Med, 2014)'),
  yamanaka: link('https://doi.org/10.1016/j.cell.2006.07.024', 'Takahashi &amp; Yamanaka, induction of pluripotent stem cells from mouse fibroblasts by defined factors (Cell, 2006)'),
  human: link('https://doi.org/10.1016/j.cell.2007.11.019', 'Takahashi et al., induction of pluripotent stem cells from adult human fibroblasts (Cell, 2007)'),
  knoepfler: link('https://doi.org/10.1002/stem.37', 'Knoepfler, deconstructing stem cell tumorigenicity (Stem Cells, 2009)'),
  vandeberg: link('https://doi.org/10.1007/s003300050547', 'Vande Berg et al., magnetic resonance imaging of normal bone marrow (Eur Radiol, 1998)'),
  sugawara: link('https://doi.org/10.1200/JCO.1998.16.1.173', 'Sugawara et al., bone marrow FDG uptake with or without G-CSF (J Clin Oncol, 1998)'),
};
const POT = {
  ladder: 'Potency ladder: the zygote and the earliest blastomeres are totipotent, able to make the whole embryo and the placenta. By the blastocyst stage, the inner cell mass is pluripotent: it can make all three germ layers (ectoderm, mesoderm and endoderm) but not the placenta. Embryonic stem cells (ESCs) are grown from it, and induced pluripotent stem cells (iPSCs) behave like them. Adult tissue stem cells are multipotent: hematopoietic stem cells (HSCs) make every blood cell, LGR5⁺ crypt cells renew the gut lining and neural stem cells make neurons and glia. Their descendants become committed progenitors and, finally, terminally differentiated cells.',
  asym: 'Asymmetric division: the stem cell divides with its spindle pointing away from the niche. The daughter that keeps contact with the niche cells keeps receiving their signals and stays a stem cell. The other daughter inherits fate determinants, leaves the niche and becomes a transit-amplifying progenitor that divides a few more times before it differentiates. One division both renews the stem cell and makes new tissue.',
  sym: 'Symmetric renewal: the spindle lies flat along the niche, so both daughters keep niche contact and both stay stem cells. Tissues use this to enlarge the stem pool during growth or after injury. The opposite, symmetric differentiation, sends both daughters away and shrinks the pool; a healthy tissue balances the two across many stem cells.',
  crypt: 'Crypt niche: at the base of each small intestinal crypt, LGR5⁺ stem cells sit between Paneth cells, which supply Wnt, EGF and Notch ligands. Daughters pushed upward become rapidly dividing transit-amplifying cells, then mature into absorptive enterocytes and secretory cells as they climb the villus, and are shed at its tip within about 3 to 5 days.',
};
const FATE = {
  pluri: 'Pluripotent: OCT4, SOX2 and NANOG bind one another’s genes and keep the pluripotency network switched on. Many developmental genes sit in bivalent chromatin that carries both an activating mark (H3K4me3) and the Polycomb mark H3K27me3, so they are silent but poised. The ball rests at the top of Waddington’s landscape, where every valley is still open.',
  muscle: '→ Muscle: Wnt and Sonic hedgehog (Shh) from the neural tube and notochord switch on MyoD and Myf5 in somite cells. MyoD is a master transcription factor: it opens muscle enhancers and turns on its own gene, which locks the choice in. The cells fuse into long, multinucleated myotubes packed with actin and myosin, while Polycomb compacts the pluripotency, neuron and blood genes.',
  neuron: '→ Neuron: where Notch signaling from neighbors is low (lateral inhibition) and BMP is blocked, the proneural factor ASCL1 rises in a neural progenitor. ASCL1 can bind its targets even in closed chromatin and opens neuronal enhancers, while Polycomb keeps muscle and blood genes compacted. The cell leaves the cell cycle and grows dendrites and an axon.',
  blood: '→ Blood: BMP4 patterns early mesoderm toward blood, and in the marrow erythropoietin (EPO) supports progenitors in which GATA1 wins over PU.1. GATA1 turns on globin and heme genes and represses PU.1, which would push the cell toward myeloid white cells. As a last step, red cells eject their nucleus.',
};
const NICHE = {
  niche: 'Marrow niche: most hematopoietic stem cells sit beside thin-walled sinusoid vessels, wrapped by leptin receptor-positive stromal cells and endothelial cells that release CXCL12 and stem cell factor (SCF). These signals keep HSCs anchored and mostly quiet; they divide rarely, which protects them, while a few daughters at a time move on as progenitors. Nearby megakaryocytes push platelet strands straight into the sinusoids.',
  tree: 'Hematopoiesis tree: an HSC gives rise to multipotent progenitors that split into common myeloid and common lymphoid progenitors. Myeloid branches make red cells and megakaryocytes (platelets) through the MEP, and neutrophils and monocytes through the GMP; lymphoid branches make T, B and NK cells. Transcription factors such as GATA1 and PU.1 tip each branch point. The tidy tree is a simplification: single-cell studies suggest lineage choice is more gradual.',
  ipsc: 'iPSC (Yamanaka): in 2006 Takahashi and Yamanaka showed that four transcription factors, Oct4, Sox2, Klf4 and c-Myc (OSKM), can push mouse fibroblasts back up the landscape to pluripotency; human iPSCs followed in 2007. The factors reawaken the pluripotency network and erase much of the fibroblast’s chromatin pattern, but only a small fraction of cells convert. Risks: c-Myc is an oncogene, vectors that integrate can disrupt genes, and undifferentiated cells left in a graft can form a teratoma, so newer methods use non-integrating vectors and often leave out c-Myc.',
  pet: 'On MRI and PET: on T1-weighted MRI, fatty yellow marrow is bright, while blood-forming red marrow is intermediate but in adults should stay brighter than muscle and the intervertebral discs; marrow darker than disc raises concern for infiltration. After G-CSF, or as marrow recovers from chemotherapy, FDG-PET can show diffuse, even uptake through the spine, pelvis and long bones, often with a hotter spleen, which can mimic diffuse marrow metastases. Timing of treatment, the uniform pattern and MRI help tell them apart.',
};
whenLesson('stem-potency', v => setCaption('stemPotencyCaption', POT[v]));
whenLesson('stem-fate', v => setCaption('stemFateCaption', FATE[v]));
whenLesson('stem-niche', v => setCaption('stemNicheCaption', NICHE[v]));

const CHAPTERS = [
  {
    id: 'stem-potency', short: 'Potency & asymmetric division', where: 'From the zygote to a tissue stem cell niche',
    title: 'Potency and the niche that keeps a stem cell',
    legend: [['stem', 'Stem cells'], ['niche', 'Niche cells'], ['tf', 'Fate determinants'], ['progenitor', 'Transit-amplifying progenitors'], ['diff', 'Differentiated cells'], ['spindle', 'Spindle']],
    html: () => `
      <p class="lede">A <b>stem cell</b> can do two things at once: <b>renew itself</b> and make cells that <b>differentiate</b>. How many kinds of cells it can make, its <b>potency</b>, shrinks step by step from the fertilized egg to an adult tissue.</p>
      ${lessonSeg('stem-potency', 'View', [['ladder', 'Potency ladder'], ['asym', 'Asymmetric division'], ['sym', 'Symmetric renewal'], ['crypt', 'Crypt niche']])}
      ${caption('stemPotencyCaption', POT[LESSON['stem-potency']])}
      <ul class="facts">
        <li>A <b>niche</b> is the local neighborhood that keeps a stem cell a stem cell: neighboring cells, adhesion to them or to basement membrane, and short-range signals such as Wnt and Notch.</li>
        <li>Human embryonic stem cell lines were first grown from donated blastocysts in 1998; induced pluripotent stem cells avoid using embryos but are not identical to ESCs in every detail.</li>
        <li>Fast-renewing tissues such as gut lining, skin and blood rely on stem cells all life long; others, like adult heart muscle, renew very little.</li>
        <li>Chemotherapy and radiation hit rapidly dividing transit-amplifying cells hardest, which is why mouth sores, diarrhea, hair loss and low blood counts are common side effects.</li>
      </ul>
      <p><a href="#early-cleavage">Early cleavage and the blastocyst</a> · <a href="#mitosis">How the spindle divides a cell</a> · <a href="#gut-sglt1">The enterocytes the crypt makes</a> · <a href="#stem-fate">How daughters choose a fate</a></p>
      ${sources([SRC.osDiff, SRC.morrison, SRC.knoblich, SRC.barker, SRC.thomson], 'Cells are drawn as simple spheres and a division takes seconds instead of hours. The ladder is a teaching simplification: potency is a continuum, and how long human blastomeres stay totipotent is not precisely known. The crypt shows a single section with few cells.')}`,
  },
  {
    id: 'stem-fate', short: 'One genome, many cells', where: 'Inside a cell choosing its fate',
    title: 'How one genome makes different cells',
    legend: [['stem', 'Pluripotent cell'], ['cue', 'Signaling cues'], ['tf', 'Master transcription factors'], ['histone', 'Nucleosomes'], ['acetyl-mark', 'Open, acetylated chromatin'], ['methyl-mark', 'Polycomb H3K27me3'], ['schwann', 'Muscle'], ['dendrite', 'Neuron'], ['rbc', 'Red cell']],
    html: () => `
      <p class="lede">A muscle fiber, a neuron and a red blood cell carry the <b>same DNA</b>. What differs is which genes are open. Outside <b>signals</b> switch on a few <b>master transcription factors</b>, which open their own lineage’s enhancers, while <b>Polycomb</b> compacts the chromatin of rival fates.</p>
      ${lessonSeg('stem-fate', 'Fate', [['pluri', 'Pluripotent'], ['muscle', '→ Muscle (MyoD)'], ['neuron', '→ Neuron (ASCL1)'], ['blood', '→ Blood (GATA1)']])}
      ${caption('stemFateCaption', FATE[LESSON['stem-fate']])}
      <ul class="facts">
        <li>In 1957 Conrad Waddington pictured development as a ball rolling down a landscape of branching valleys: once a cell is in a valley, ridges of gene regulation keep it there.</li>
        <li>In 1987 a single transfected gene, MyoD, turned cultured fibroblasts into muscle-like cells, the first proof that one master transcription factor can redirect a cell.</li>
        <li>Morphogens such as Wnt, BMP, Notch ligands and Sonic hedgehog act by concentration: cells read how much they receive, and their position, to choose a fate.</li>
        <li>Exceptions to “same DNA”: mature red cells lose their nucleus entirely, and B and T cells cut and rejoin antibody and receptor genes.</li>
      </ul>
      <p><a href="#chromatin">Open and closed chromatin at the insulin gene</a> · <a href="#sig-mapk">How signals reach the nucleus</a> · <a href="#muscle-structure">Inside a muscle fiber</a> · <a href="#neurons">Neurons and glia</a> · <a href="#blood">The blood cell line-up</a> · <a href="#stem-niches">Pushing a cell back uphill</a></p>
      ${sources([SRC.osGene, SRC.davis, SRC.margueron, SRC.decade], 'Each fate is reduced to one signal and one master factor, and four gene loci stand in for thousands. Real lineage choices pass through several progenitor stages, and the landscape is a metaphor, not a measured energy surface.')}`,
  },
  {
    id: 'stem-niches', short: 'Marrow, blood & iPSCs', where: 'Bone marrow, the blood family tree and the reprogramming lab',
    title: 'Marrow niches, hematopoiesis and reprogramming',
    legend: [['stem', 'HSC or iPSC'], ['niche', 'Stromal niche cells'], ['progenitor', 'Progenitors'], ['rbc', 'Red cells and sinusoid'], ['plt', 'Megakaryocytes and platelets'], ['neut', 'Neutrophils'], ['mono', 'Monocytes'], ['lymph', 'Lymphocytes'], ['fibro', 'Fibroblast'], ['oct4', 'OSKM factors'], ['bone', 'Trabecular bone']],
    html: () => `
      <p class="lede">Adults make roughly two hundred billion red cells a day, almost all in the marrow, from a small population of <b>hematopoietic stem cells</b> held in specialized niches. The same logic of master factors also runs in reverse: four factors can turn a skin cell into a <b>pluripotent</b> one.</p>
      ${lessonSeg('stem-niche', 'View', [['niche', 'Marrow HSC niche'], ['tree', 'Hematopoiesis tree'], ['ipsc', 'iPSC (Yamanaka)'], ['pet', 'G-CSF on PET-MRI']])}
      ${caption('stemNicheCaption', NICHE[LESSON['stem-niche']])}
      <ul class="facts">
        <li>A bone marrow (hematopoietic stem cell) transplant works because a small number of donor HSCs can home to the marrow niche and rebuild the entire blood and immune system.</li>
        <li>G-CSF (filgrastim) boosts neutrophil production after chemotherapy, and it is also used to coax HSCs out of the niche into the blood so they can be collected for transplant.</li>
        <li>At birth almost all marrow is red. It converts to fatty yellow marrow from the hands and feet inward, so adults keep red marrow mainly in the spine, pelvis, ribs, sternum and the upper ends of the femurs and humeri.</li>
        <li>Red marrow is roughly 40 percent fat and yellow marrow about 80 percent, which is why they look so different on T1 MRI.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Diffuse, uniform marrow uptake on FDG-PET soon after G-CSF or chemotherapy is usually a treatment effect, not spread. Always check the treatment history and timing, compare with prior scans and MRI, and see <a href="#petprep">PET preparation</a> and <a href="#cancer-pet">FDG-avid tumors</a>. For learning, not diagnosis.</p></div>
      <p><a href="#blood">The cells the marrow makes</a> · <a href="#clotting">Megakaryocytes and platelets</a> · <a href="#bone-remodel">The bone around the marrow</a> · <a href="#stem-fate">Master factors and fate</a></p>
      ${sources([SRC.osBlood, SRC.orkin, SRC.mendelson, SRC.yamanaka, SRC.human, SRC.knoepfler, SRC.vandeberg, SRC.sugawara], 'The niche shows a handful of cells around one vessel, the tree omits eosinophils, basophils, dendritic cells and intermediate stages, and reprogramming, which takes weeks, is shown in seconds. The MRI and PET panels are schematic drawings, not patient images.')}`,
  },
];

CellCity.register('stem', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const lerp = (a, b, u) => a + (b - a) * u;
    const clamp01 = (u) => Math.max(0, Math.min(1, u));
    const seg = (u, a, b) => clamp01((u - a) / (b - a));
    // a cell with a translucent body and a nucleus; .tint(color) recolors the body
    function cell(parent, color, r, pos, nr = 0.45) {
      const grp = new THREE.Group(); if (pos) grp.position.copy(pos); parent.add(grp);
      const b = body(grp, C(color), r, null, 0.3);
      const nuc = nr ? ball(grp, std(C('nucleus'), { emissiveIntensity: 0.35 }), r * nr) : null;
      grp.userData = { b, nuc };
      grp.tint = (c) => { b.children[0].material.color.copy(c); b.children[1].material.uniforms.uColor.value.copy(c); };
      return grp;
    }
    function rbcDisc(parent, pos, s, rot = 0) {
      const grp = new THREE.Group(); grp.position.copy(pos); grp.rotation.set(rot, rot * 0.6, 0); parent.add(grp);
      const m = std(C('rbc'), { emissiveIntensity: 0.3 });
      const d = new THREE.Mesh(k.sphere, m); d.scale.set(s * 0.8, s * 0.22, s * 0.8); grp.add(d);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(s * 0.8, s * 0.24, 10, 28), m); rim.rotation.x = Math.PI / 2; grp.add(rim);
      return grp;
    }
    function neuronShape(parent, pos, s, color = 'dendrite') {
      const grp = new THREE.Group(); grp.position.copy(pos); parent.add(grp);
      const m = std(C(color), { emissiveIntensity: 0.35 });
      body(grp, C(color), s, null, 0.35); ball(grp, std(C('nucleus'), { emissiveIntensity: 0.35 }), s * 0.45);
      [[-1.6, 1.3], [-0.4, 2], [0.9, 1.6], [-2, -0.2], [-1.2, -1.4]].forEach(([x, y]) => {
        const end = V(x * s, y * s, 0); rod(grp, m, V(0, 0, 0), end, s * 0.09);
        rod(grp, m, end, end.clone().add(V(x * s * 0.3 - 0.2 * s, y * s * 0.25 + 0.3 * s, 0)), s * 0.06);
      });
      rod(grp, m, V(s * 0.8, -s * 0.2, 0), V(s * 3.6, -s * 0.9, 0), s * 0.08);
      return grp;
    }
    function myotube(parent, pos, len, r) {
      const grp = new THREE.Group(); grp.position.copy(pos); parent.add(grp);
      const cap = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), ghost(C('schwann'), 0.35)); cap.rotation.z = Math.PI / 2; grp.add(cap);
      const rim = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 8, 20), k.fresnelMat(C('schwann'), 1.1, 2.4)); rim.rotation.z = Math.PI / 2; grp.add(rim);
      const sm = std(C('schwann'), { emissiveIntensity: 0.5, transparent: true, opacity: 0.6 });
      for (let i = 0; i < 11; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * 0.98, 0.035, 6, 24), sm); t.rotation.y = Math.PI / 2; t.position.x = -len / 2 + i * len / 10; grp.add(t); }
      const nm = std(C('nucleus'), { emissiveIntensity: 0.4 });
      [-1.5, -0.5, 0.5, 1.5].forEach((x, i) => { const n = ball(grp, nm, r * 0.32, V(x * len / 4, (i % 2 ? -1 : 1) * r * 0.62, r * 0.3)); n.scale.set(r * 0.5, r * 0.25, r * 0.25); });
      return grp;
    }
    // labels that belong to one switch state (and optionally one phase of its animation)
    function tagger(root, id) {
      const list = [];
      const tag = (state, text, color, at, cond) => { const gq = new THREE.Group(); root.add(gq); lbl(text, color, gq, at, id); list.push({ gq, state, cond }); return gq; };
      tag.update = (v, u) => list.forEach(t => { t.gq.visible = (t.state === '*' || t.state === v) && (!t.cond || t.cond(u)); });
      return tag;
    }

    /* ================= Potency and asymmetric division ================= */
    {
      const id = 'stem-potency', root = new THREE.Group();
      add(id, root, { target: V(0, 0.5, 0), pos: V(2, 3.5, 25), w: 10.6 }, { fade: 'Into the stem cell niche' });
      const tag = tagger(root, id);
      const subs = { ladder: new THREE.Group(), asym: new THREE.Group(), sym: new THREE.Group(), crypt: new THREE.Group() };
      Object.values(subs).forEach(s => root.add(s));
      const stemC = C('stem'), progC = C('progenitor'), diffC = C('diff');

      // --- the potency ladder: four tiers, potency falling downward
      const L = subs.ladder, X0 = -4.6;
      const zona = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.12, 8, 40), std(C('atp'), { emissiveIntensity: 0.3, transparent: true, opacity: 0.6 }));
      zona.position.set(X0 - 1.8, 6.2, 0); L.add(zona);
      cell(L, 'stem', 1.15, V(X0 - 1.8, 6.2, 0), 0.32);
      const four = new THREE.Group(); four.position.set(X0 + 1.8, 6.2, 0); L.add(four);
      const z2 = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.12, 8, 40), zona.material); four.add(z2);
      [[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.55], [0.55, -0.55]].forEach(([x, y]) => cell(four, 'stem', 0.62, V(x, y, 0), 0.38));
      const blast = new THREE.Group(); blast.position.set(X0 - 1.8, 2.2, 0); L.add(blast);
      body(blast, C('electron'), 1.55, null, 0.08);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ball(blast, std(C('rbc'), { emissiveIntensity: 0.2 }), 0.26, V(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0)); }
      [[-0.55, 0.75], [-0.1, 0.95], [0.35, 0.8], [-0.35, 0.35], [0.15, 0.4]].forEach(([x, y]) => ball(blast, std(stemC, { emissiveIntensity: 0.55 }), 0.3, V(x, y, 0.2)));
      const colony = new THREE.Group(); colony.position.set(X0 + 1.8, 2.2, 0); L.add(colony);
      [[0, 0], [0.62, 0.1], [-0.6, 0.15], [0.3, 0.6], [-0.3, 0.62], [0.3, -0.52], [-0.32, -0.5]].forEach(([x, y]) => ball(colony, std(stemC, { emissiveIntensity: 0.55 }), 0.32, V(x, y, 0)));
      cell(L, 'stem', 0.62, V(X0 - 2.6, -1.8, 0), 0.5);                                  // HSC
      const lgr = cell(L, 'stem', 0.62, V(X0, -1.8, 0), 0.4); lgr.scale.set(0.8, 1.35, 0.8);   // LGR5⁺ crypt cell, columnar
      const nsc = cell(L, 'stem', 0.55, V(X0 + 2.6, -1.8, 0), 0.45);
      rod(nsc, std(stemC, { emissiveIntensity: 0.4 }), V(0, 0.4, 0), V(0.2, 1.3, 0), 0.07); rod(nsc, std(stemC, { emissiveIntensity: 0.4 }), V(0, -0.4, 0), V(-0.1, -1.1, 0), 0.07);
      rbcDisc(L, V(X0 - 3.3, -5.9, 0), 0.7, 0.9);
      neuronShape(L, V(X0 - 1.2, -5.7, 0), 0.38);
      const ent = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.5, 0.75), ghost(C('gut'), 0.45)); ent.position.set(X0 + 1.4, -5.9, 0); L.add(ent);
      ball(L, std(C('nucleus'), { emissiveIntensity: 0.35 }), 0.22, V(X0 + 1.4, -6.2, 0.1));
      myotube(L, V(X0 + 3.6, -5.9, 0), 1.6, 0.36);
      const arrowM = std(C('electron'), { emissiveIntensity: 0.25, transparent: true, opacity: 0.4 });
      [[6.2, 2.2], [2.2, -1.8], [-1.8, -5.9]].forEach(([a, b]) => rod(L, arrowM, V(X0 + 5.6, a - 1, -0.4), V(X0 + 5.6, b + 1, -0.4), 0.05));
      const fall = stream(L, std(stemC, { emissiveIntensity: 0.9 }), 0.13, curve([V(X0 + 5.6, 6.2, -0.4), V(X0 + 5.6, -5.9, -0.4)]), 5, 0.12, stemC);
      fall.at = (m, u) => m.scale.setScalar(0.13 * (1.2 - u * 0.6));
      tag('ladder', 'Totipotent: embryo + placenta', 'stem', V(5.2, 6.2, 0));
      tag('ladder', 'Pluripotent: ICM, ESCs, iPSCs', 'stem', V(5.2, 2.2, 0));
      tag('ladder', 'Multipotent: HSC, LGR5⁺, neural', 'progenitor', V(5.2, -1.8, 0));
      tag('ladder', 'Differentiated cells', 'diff', V(5.2, -5.9, 0));

      // --- a shared niche slab for asymmetric and symmetric division
      function niche(parent) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 5), ghost(C('niche'), 0.35)); slab.position.y = -3.4; parent.add(slab);
        [-5, -2.5, 2.5, 5, 0].forEach((x, i) => { const n = ball(parent, std(C('niche'), { emissiveIntensity: 0.35 }), 0.85, V(x, -3.7, i === 4 ? -1.4 : 0.6)); n.scale.set(1.2, 0.45, 0.9); });
        const sig = stream(parent, std(C('cue'), { emissiveIntensity: 0.9 }), 0.1, curve([V(-4.5, -3.1, 0.8), V(-2.4, -2.9, 0.8), V(-0.6, -2.6, 0.6)]), 4, 0.3, C('cue'));
        const sig2 = stream(parent, std(C('cue'), { emissiveIntensity: 0.9 }), 0.1, curve([V(4.5, -3.1, 0.8), V(2.4, -2.9, 0.8), V(0.6, -2.6, 0.6)]), 4, 0.3, C('cue'));
        return [sig, sig2];
      }
      const sigsA = niche(subs.asym), sigsS = niche(subs.sym);
      const spMat = std(C('spindle'), { emissiveIntensity: 0.6, transparent: true, opacity: 0.8 });
      // asymmetric: anchored daughter, departing daughter, two then four descendants
      const A = subs.asym;
      const aStay = cell(A, 'stem', 1.05, V(0, -2.05, 0)), aGo = cell(A, 'stem', 1.05, V(0, -2.05, 0));
      const aSp = rod(A, spMat, V(0, -3, 0), V(0, -1, 0), 0.05);
      const det = Array.from({ length: 6 }, (_, i) => ball(A, std(C('tf'), { emissiveIntensity: 0.9 }), 0.13, V(0, 0, 0)));
      const ta = [cell(A, 'progenitor', 0.75, V(2.6, 2.4, 0)), cell(A, 'progenitor', 0.75, V(4.2, 1.6, 0))];
      const dd = [V(1.8, 4.8, 0), V(3.4, 5.2, 0), V(5, 4.3, 0), V(6, 2.9, 0)].map(p => cell(A, 'diff', 0.55, p, 0.35));
      tag('asym', 'Niche cells: Wnt, Notch, adhesion', 'niche', V(-4.4, -4.9, 1));
      tag('asym', 'Stem cell stays anchored', 'stem', V(-3.4, -1.2, 0), u => u > 0.4);
      tag('asym', 'Fate determinants', 'tf', V(-2.6, 0.6, 0), u => u > 0.08 && u < 0.4);
      tag('asym', 'Transit-amplifying progenitors', 'progenitor', V(5.4, 0.2, 0), u => u > 0.55 && u < 0.78);
      tag('asym', 'Differentiated cells', 'diff', V(3.4, 6.6, 0), u => u > 0.78);
      // symmetric: two stem daughters along the niche, flanked by neighbors
      const S = subs.sym;
      const sL = cell(S, 'stem', 1.05, V(0, -2.05, 0)), sR = cell(S, 'stem', 1.05, V(0, -2.05, 0));
      cell(S, 'stem', 0.95, V(-5, -2.15, 0)); cell(S, 'stem', 0.95, V(5, -2.15, 0));
      const sSp = rod(S, spMat, V(-1, -2.05, 0), V(1, -2.05, 0), 0.05);
      tag('sym', 'Spindle parallel to the niche', 'spindle', V(0, 0.3, 0), u => u < 0.4);
      tag('sym', 'Two stem daughters: pool grows', 'stem', V(0, 0.6, 0), u => u >= 0.45);
      tag('sym', 'Niche cells', 'niche', V(-4.4, -4.9, 1));
      // crypt: a U of cells with a conveyor up both walls
      const Cr = subs.crypt; Cr.scale.setScalar(0.82); Cr.position.y = 0.3;
      const uPts = (side) => [V(side * 0.9, -5.2, 0), V(side * 2.1, -4.4, 0), V(side * 2.5, -2.4, 0), V(side * 2.6, 1.5, 0), V(side * 2.6, 5.2, 0), V(side * 3.2, 7, 0)];
      const lumen = new THREE.Mesh(new THREE.CapsuleGeometry(1.6, 8.5, 8, 24), ghost(C('electron'), 0.06)); lumen.position.y = 0.9; Cr.add(lumen);
      const baseCells = [];
      [-1, 1].forEach(side => {
        const cv = curve(uPts(side));
        for (let i = 0; i < 4; i++) {
          const p = cv.getPointAt(0.02 + i * 0.075), paneth = i % 2 === 1;
          const cc = cell(Cr, paneth ? 'niche' : 'stem', 0.55, p, paneth ? 0.3 : 0.45);
          if (paneth) for (let j = 0; j < 4; j++) ball(cc, std(C('cue'), { emissiveIntensity: 0.7 }), 0.09, V((j - 1.5) * 0.18, 0.2, 0.35));
          baseCells.push(cc);
        }
      });
      const belt = [-1, 1].map(side => {
        const s = stream(Cr, std(progC, { emissiveIntensity: 0.4 }), 0.5, curve(uPts(side).slice(2)), 6, 0.06);
        const mats = { p: std(progC, { emissiveIntensity: 0.45 }), d: std(diffC, { emissiveIntensity: 0.4 }) };
        s.at = (m, u) => { m.material = u < 0.5 ? mats.p : mats.d; m.scale.set(0.5, u < 0.5 ? 0.5 : 0.62, 0.5); };
        return s;
      });
      const shed = stream(Cr, std(diffC, { emissiveIntensity: 0.3, transparent: true, opacity: 0.6 }), 0.4, curve([V(-3.2, 7, 0), V(-2.2, 8.4, 0.6), V(-0.8, 9.4, 1)]), 2, 0.1);
      tag('crypt', 'LGR5⁺ stem cells', 'stem', V(-3.9, -4, 0));
      tag('crypt', 'Paneth cells: Wnt, EGF, Notch', 'niche', V(4.4, -3.3, 0));
      tag('crypt', 'Transit-amplifying zone', 'progenitor', V(4.8, 0.2, 0));
      tag('crypt', 'Shed toward the villus tip', 'diff', V(-4.2, 6.6, 0));
      tag('crypt', 'Crypt lumen', 'electron', V(0, 2.9, 0));

      let el = 0;
      function draw(dt) {
        const v = LESSON['stem-potency'] || 'ladder';
        el += reduceMotion ? 0 : dt;
        Object.entries(subs).forEach(([key, s]) => { s.visible = key === v; });
        const u = reduceMotion ? 0.6 : (el % 9) / 9;
        if (v === 'ladder') fall.update(dt);
        if (v === 'asym') {
          sigsA.forEach(s => s.update(dt));
          const split = ease.inOut(seg(u, 0.18, 0.4));
          aSp.visible = u > 0.06 && u < 0.36;
          aStay.position.set(0, -2.05, 0);
          const goPos = V(lerp(0, 0, split), lerp(-2.05, 0.15, split), 0);
          const leave = ease.inOut(seg(u, 0.42, 0.58));
          goPos.lerp(V(3.4, 2, 0), leave);
          aGo.position.copy(goPos);
          aGo.tint(stemC.clone().lerp(progC, seg(u, 0.35, 0.55)));
          det.forEach((d, i) => { const a = (i / 5 - 0.5) * 1.6; d.position.copy(aGo.position).add(V(Math.sin(a) * 0.95, Math.cos(a) * 0.95 * (u < 0.18 ? 0.3 : 1) + (u < 0.18 ? 0.6 : 0), 0.3)); d.visible = u > 0.08 && u < 0.6; });
          const tSplit = seg(u, 0.6, 0.68);
          aGo.visible = u < 0.6;
          ta.forEach((t, i) => { t.visible = u >= 0.6 && u < 0.78; t.position.copy(V(3.4, 2, 0).lerp(i ? V(4.4, 1.2, 0) : V(2.4, 2.8, 0), tSplit)); });
          dd.forEach((d, i) => { d.visible = u >= 0.78; d.scale.setScalar(Math.max(0.01, seg(u, 0.78 + i * 0.02, 0.84 + i * 0.02))); });
          const breathe = 1 + (u < 0.18 ? u * 0.6 : 0);
          aStay.scale.setScalar(breathe); aGo.scale.setScalar(u < 0.18 ? breathe : 1);
        }
        if (v === 'sym') {
          sigsS.forEach(s => s.update(dt));
          const split = ease.inOut(seg(u, 0.2, 0.45));
          sSp.visible = u > 0.06 && u < 0.4;
          sL.position.set(-1.25 * split, -2.05, 0); sR.position.set(1.25 * split, -2.05, 0);
          const sc = split > 0 ? lerp(1.1, 0.95, split) : 1 + seg(u, 0, 0.2) * 0.1;
          sL.scale.setScalar(sc); sR.scale.setScalar(sc);
        }
        if (v === 'crypt') { belt.forEach(s => s.update(dt)); shed.update(dt); }
        tag.update(v, u);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= One genome, many cells ================= */
    {
      const id = 'stem-fate', root = new THREE.Group();
      add(id, root, { target: V(0.6, 0.2, 0), pos: V(2, 6, 25), w: 13.2 }, { fade: 'Choosing a fate' });
      const tag = tagger(root, id);
      // Waddington's landscape: a slope that splits into three valleys toward the viewer
      const VX = { muscle: -3.2, neuron: 0, blood: 3.2 };
      const h = (x, z) => { const s = (z + 5) / 10; let y = 3.2 * Math.pow(1 - s, 1.5) + 0.06 * x * x; Object.values(VX).forEach(xv => { y -= 1.5 * Math.pow(s, 1.2) * Math.exp(-((x - xv) ** 2) / 0.98); }); return y; };
      const land = new THREE.Group(); land.position.set(-6.4, -1.8, 0); land.rotation.set(0.35, 0.28, 0); land.scale.setScalar(0.85); root.add(land);
      const geo = new THREE.PlaneGeometry(10, 10, 60, 60); geo.rotateX(-Math.PI / 2);
      const pa = geo.attributes.position;
      for (let i = 0; i < pa.count; i++) pa.setY(i, h(pa.getX(i), pa.getZ(i)));
      geo.computeVertexNormals();
      land.add(new THREE.Mesh(geo, std(C('niche'), { emissiveIntensity: 0.15, transparent: true, opacity: 0.55, side: THREE.DoubleSide })));
      land.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C('niche'), wireframe: true, transparent: true, opacity: 0.18 })));
      const rollBall = ball(land, std(C('stem'), { emissiveIntensity: 0.8 }), 0.38); rollBall.add(k.glow(C('stem'), 3));
      lbl('Pluripotent', 'stem', land, V(0, h(0, -4.8) + 1.1, -4.8), id);
      [['muscle', 'Muscle', 'schwann'], ['neuron', 'Neuron', 'dendrite'], ['blood', 'Blood', 'rbc']].forEach(([key, text, c]) => lbl(text, c, land, V(VX[key], h(VX[key], 5) + 0.5, 5.4), id));
      // the cell itself, morphing between fates
      const morph = new THREE.Group(); morph.position.set(5.6, 2.5, 0); root.add(morph);
      const forms = { pluri: new THREE.Group(), muscle: new THREE.Group(), neuron: new THREE.Group(), blood: new THREE.Group() };
      Object.values(forms).forEach(f => morph.add(f));
      cell(forms.pluri, 'stem', 1.3, null, 0.58);
      myotube(forms.muscle, V(0, 0, 0), 4.2, 0.6);
      neuronShape(forms.neuron, V(-1, 0.1, 0), 0.75);
      [[-1.4, 0.4, 0, 1.1], [0.2, -0.3, 0.7, 0.4], [1.6, 0.5, -0.4, -0.5]].forEach(([x, y, z, r]) => rbcDisc(forms.blood, V(x, y, z), 0.85, r));
      const fscale = { pluri: 1, muscle: 0, neuron: 0, blood: 0 };
      // signals arriving from neighbors
      const cue = stream(root, std(C('cue'), { emissiveIntensity: 0.9 }), 0.14, curve([V(12, 5.6, 0), V(9.8, 4.6, 0.4), V(7.3, 3.2, 0.6)]), 5, 0.3, C('cue'));
      tag('pluri', 'Self-renewal cues', 'cue', V(9.4, 6.4, 0));
      tag('muscle', 'Wnt + Shh', 'cue', V(9.4, 6.4, 0));
      tag('neuron', 'Low Notch, no BMP', 'cue', V(9.4, 6.4, 0));
      tag('blood', 'BMP4, then EPO', 'cue', V(9.4, 6.4, 0));
      tag('pluri', 'OCT4 + SOX2 + NANOG', 'tf', V(5.6, 0.2, 0));
      tag('muscle', 'MyoD on: multinucleated myotube', 'tf', V(5.6, 0.2, 0));
      tag('neuron', 'ASCL1 on: dendrites and axon', 'tf', V(5.6, 0.2, 0));
      tag('blood', 'GATA1 on: red cells, no nucleus', 'tf', V(5.6, 0.2, 0));
      // four gene loci on one strand of DNA: open, poised (bivalent) or Polycomb-silenced
      const LOCI = ['OCT4', 'MYOD1', 'ASCL1', 'GATA1'], LC = ['stem', 'schwann', 'dendrite', 'rbc'];
      const STATE = {
        pluri: ['open', 'poised', 'poised', 'poised'], muscle: ['closed', 'open', 'closed', 'closed'],
        neuron: ['closed', 'closed', 'open', 'closed'], blood: ['closed', 'closed', 'closed', 'open'],
      };
      const Y = -3.6;
      rod(root, std(C('electron'), { emissiveIntensity: 0.2 }), V(-0.2, Y, 0), V(12.2, Y, 0), 0.04);
      const hMat = std(C('histone'), { emissiveIntensity: 0.35 }), acMat = std(C('acetyl-mark'), { emissiveIntensity: 0.8 }), meMat = std(C('methyl-mark'), { emissiveIntensity: 0.8 });
      const loci = LOCI.map((name, j) => {
        const cx = 1.5 + j * 3.1;
        const nucs = Array.from({ length: 5 }, () => ball(root, hMat, 0.3));
        const ac = nucs.map(() => ball(root, acMat, 0.11)), me = nucs.map(() => ball(root, meMat, 0.11));
        const tf = ball(root, std(C(LC[j]), { emissiveIntensity: 0.8 }), 0.26); tf.add(k.glow(C(LC[j]), 1.4));
        lbl(name, LC[j], root, V(cx, Y - 1.2, 0), id);
        return { cx, nucs, ac, me, tf, sp: 0.42, open: 0, shut: 0, poise: 1 };
      });
      let el = 0;
      function draw(dt) {
        const v = LESSON['stem-fate'] || 'pluri';
        el += reduceMotion ? 0 : dt;
        const blend = reduceMotion ? 1 : Math.min(1, dt * 3);
        // the ball rolls from the top into the chosen valley, then loops
        const u = reduceMotion ? 1 : (el % 6) / 6;
        const t = v === 'pluri' ? 0 : ease.inOut(seg(u, 0.05, 0.75));
        const xv = v === 'pluri' ? 0 : VX[v];
        const bx = v === 'pluri' ? Math.sin(el * 1.5) * 0.25 : xv * ease.inOut(seg(t, 0.25, 0.9));
        const bz = v === 'pluri' ? -4.4 : lerp(-4.6, 4.4, t);
        rollBall.position.set(bx, h(bx, bz) + 0.38, bz);
        Object.entries(forms).forEach(([key, f]) => {
          fscale[key] = lerp(fscale[key], key === v ? 1 : 0, blend);
          f.visible = fscale[key] > 0.02; f.scale.setScalar(Math.max(0.001, fscale[key]));
        });
        morph.rotation.y = Math.sin(el * 0.4) * 0.25;
        cue.update(dt);
        loci.forEach((L, j) => {
          const st = STATE[v][j];
          L.open = lerp(L.open, st === 'open' ? 1 : 0, blend); L.shut = lerp(L.shut, st === 'closed' ? 1 : 0, blend); L.poise = lerp(L.poise, st === 'poised' ? 1 : 0, blend);
          const sp = 0.32 + 0.36 * L.open + 0.14 * L.poise;
          L.nucs.forEach((n, i) => {
            const zig = (i % 2 ? 1 : -1) * 0.26 * L.shut;
            n.position.set(L.cx + (i - 2) * sp * 0.75 + (i - 2) * 0.02, Y + zig, L.shut * (i % 2 ? 0.2 : -0.2));
            L.ac[i].position.copy(n.position).add(V(0, 0.38, 0.12)); L.ac[i].scale.setScalar(0.11 * Math.max(0.001, L.open + L.poise * 0.7));
            L.me[i].position.copy(n.position).add(V(0, -0.38, 0.12)); L.me[i].scale.setScalar(0.11 * Math.max(0.001, L.shut + L.poise * 0.7));
          });
          L.tf.position.set(L.cx, Y + 0.9 + Math.sin(el * 2 + j) * 0.06, 0.2); L.tf.scale.setScalar(Math.max(0.001, 0.26 * L.open));
        });
        tag.update(v, u);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Marrow niches, hematopoiesis and iPSCs ================= */
    {
      const id = 'stem-niches', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(1.5, 3.5, 21.5), w: 10 }, { fade: 'Into the bone marrow' });
      const tag = tagger(root, id);
      const subs = { niche: new THREE.Group(), tree: new THREE.Group(), ipsc: new THREE.Group(), pet: new THREE.Group() };
      Object.values(subs).forEach(s => root.add(s));

      // --- marrow niche around a sinusoid
      const N = subs.niche;
      const boneM = std(C('bone').clone().multiplyScalar(0.42), { emissiveIntensity: 0.08, roughness: 0.9 });
      [5.4, -5.2].forEach(y => { const b = new THREE.Mesh(new THREE.BoxGeometry(18, 1.3, 3.5), boneM); b.position.y = y; b.rotation.z = y > 0 ? 0.04 : -0.03; N.add(b); });
      [-6, -3, 0, 3, 6].forEach(x => { const o = ball(N, std(C('osteoid'), { emissiveIntensity: 0.3 }), 0.5, V(x, 4.55, 0.8)); o.scale.set(0.9, 0.3, 0.6); });
      const sinus = curve([V(-10, 1.4, 0), V(-4, 0.9, 0), V(2, 1.3, 0), V(10, 0.8, 0)]);
      tube(N, ghost(C('rbc'), 0.16), sinus.points, 1.05);
      const rbcFlow = stream(N, std(C('rbc'), { emissiveIntensity: 0.4 }), 0.28, sinus, 10, 0.05);
      rbcFlow.at = (m) => m.scale.set(0.34, 0.12, 0.34);
      const hsc = cell(N, 'stem', 0.85, V(-1.6, -1.3, 0.6), 0.55);
      const stroma = [V(-4.4, -2.2, 0.2), V(1.6, -2.9, 0)].map(p => {
        const s = cell(N, 'niche', 0.7, p, 0.4);
        const pm = std(C('niche'), { emissiveIntensity: 0.4 });
        [[1.6, 0.9], [1.2, -1.2], [-1.4, 1.1], [-1.2, -1.3], [0.2, 1.8]].forEach(([x, y]) => rod(s, pm, V(0, 0, 0), V(x, y, 0.2), 0.07));
        return s;
      });
      const mk = cell(N, 'plt', 1.35, V(5.4, -1.8, 0), 0.5);
      const prop = stream(N, std(C('plt'), { emissiveIntensity: 0.6 }), 0.12, curve([V(5.2, -0.6, 0.2), V(5.4, 0.4, 0.3), V(6.4, 0.9, 0.2), V(9.5, 0.8, 0)]), 6, 0.15, C('plt'));
      const cxcl = [stream(N, std(C('cue'), { emissiveIntensity: 0.9 }), 0.1, curve([V(-4, -2, 0.6), V(-3, -1.5, 0.9), V(-2.3, -1.3, 0.9)]), 3, 0.35, C('cue')),
        stream(N, std(C('cue'), { emissiveIntensity: 0.9 }), 0.1, curve([V(1.2, -2.7, 0.5), V(0, -2, 0.9), V(-0.9, -1.5, 0.9)]), 3, 0.35, C('cue'))];
      const exitS = stream(N, std(C('progenitor'), { emissiveIntensity: 0.5 }), 0.26, curve([V(-1.2, -0.7, 0.8), V(-0.6, 0.3, 0.6), V(0.5, 1.1, 0.2), V(4, 1.2, 0)]), 1, 0.08);
      tag('niche', 'Trabecular bone', 'bone', V(-6.6, 6.6, 0));
      tag('niche', 'Osteoblasts', 'osteoid', V(4.4, 3.5, 1));
      tag('niche', 'Sinusoid', 'rbc', V(-7.6, 2.9, 0));
      tag('niche', 'HSC: mostly quiet', 'stem', V(-1.6, -3.9, 1.2));
      tag('niche', 'LepR⁺ stromal cells: CXCL12, SCF', 'niche', V(-5.2, -0.4, 0.4));
      tag('niche', 'Megakaryocyte → platelets', 'plt', V(6, -3.8, 0.4));

      // --- the hematopoiesis tree
      const T = subs.tree;
      const NODES = {
        hsc: [0, 6.6, 'stem', 'HSC'], mpp: [0, 4.2, 'progenitor', 'MPP'], cmp: [-4.6, 1.8, 'progenitor', 'CMP (myeloid)'], clp: [5, 1.8, 'progenitor', 'CLP (lymphoid)'],
        mep: [-7, -0.8, 'progenitor', 'MEP'], gmp: [-2.2, -0.8, 'progenitor', 'GMP'],
        rbc: [-8.4, -4, 'rbc', 'Red cell'], plt: [-5.6, -4, 'plt', 'Platelets'], neut: [-3.2, -4, 'neut', 'Neutrophil'], mono: [-0.6, -4, 'mono', 'Monocyte'],
        t: [2.6, -4, 'lymph', 'T cell'], b: [5.1, -4, 'lymph', 'B cell'], nk: [7.6, -4, 'lymph', 'NK cell'],
      };
      const EDGES = [['hsc', 'mpp'], ['mpp', 'cmp'], ['mpp', 'clp'], ['cmp', 'mep'], ['cmp', 'gmp'], ['mep', 'rbc'], ['mep', 'plt'], ['gmp', 'neut'], ['gmp', 'mono'], ['clp', 't'], ['clp', 'b'], ['clp', 'nk']];
      const P = (key) => V(NODES[key][0], NODES[key][1], 0);
      const edgeM = std(C('electron'), { emissiveIntensity: 0.2, transparent: true, opacity: 0.35 });
      const flows = EDGES.map(([a, b]) => { rod(T, edgeM, P(a), P(b), 0.05); return stream(T, std(C(NODES[b][2]), { emissiveIntensity: 0.9 }), 0.1, curve([P(a), P(b)]), 2, 0.25, C(NODES[b][2])); });
      Object.entries(NODES).forEach(([key, [x, y, c, name]], i) => {
        const p = V(x, y, 0);
        if (key === 'rbc') rbcDisc(T, p, 0.75, 1);
        else if (key === 'plt') [[-0.35, 0.2], [0.3, 0.35], [0.05, -0.3]].forEach(([dx, dy]) => { const d = ball(T, std(C('plt'), { emissiveIntensity: 0.5 }), 0.25, p.clone().add(V(dx, dy, 0))); d.scale.set(0.3, 0.12, 0.3); d.rotation.x = 1.1; });
        else if (key === 'neut') { cell(T, 'neut', 0.65, p, 0); [[-0.25, 0.1], [0, -0.15], [0.25, 0.1]].forEach(([dx, dy]) => ball(T, std(C('nucleus'), { emissiveIntensity: 0.35 }), 0.17, p.clone().add(V(dx, dy, 0.1)))); }
        else if (key === 'mono') { cell(T, 'mono', 0.7, p, 0); const n = ball(T, std(C('nucleus'), { emissiveIntensity: 0.35 }), 0.3, p.clone().add(V(0.05, 0, 0.1))); n.scale.set(0.38, 0.24, 0.26); }
        else if (c === 'lymph') { const l = cell(T, 'lymph', 0.5, p, 0.72); if (key === 'nk') [[0.3, 0.3], [-0.3, 0.25], [0.2, -0.35]].forEach(([dx, dy]) => ball(l, std(C('perforin'), { emissiveIntensity: 0.8 }), 0.06, V(dx, dy, 0.35))); }
        else cell(T, c, key === 'hsc' ? 0.75 : 0.58, p, 0.5);
        const leaf = y < -3;
        const at = leaf ? V(x, y - (i % 2 ? 1.25 : 2.1), 0) : V(x + (key === 'hsc' || key === 'mpp' ? 1.5 : key === 'clp' ? 2.3 : key === 'cmp' ? -2.4 : key === 'mep' ? -1.3 : 1.3), y + 0.1, 0);
        tag('tree', name, c, at);
      });

      // --- iPSC reprogramming: fibroblast + OSKM → pluripotent colony
      const I = subs.ipsc;
      const fib = cell(I, 'fibro', 1, V(-6, 0, 0), 0.32);
      const uphill = tube(I, ghost(C('stem'), 0.12), [V(-6, -1.6, -1), V(-2, -1.2, -1.2), V(1.5, 0.2, -1.2), V(5, 2.2, -1)], 0.14);
      const OSKM = [['oct4', 'Oct4'], ['tf', 'Sox2'], ['signal', 'Klf4'], ['cancer', 'c-Myc']];
      const fac = OSKM.map(([c], i) => { const b = ball(I, std(C(c), { emissiveIntensity: 0.9 }), 0.24); b.add(k.glow(C(c), 1.6)); b.userData.from = V(-7.8 + i * 1.2, 5.4, 0.4); return b; });
      const nucGlow = k.glow(C('oct4'), 2.6); fib.add(nucGlow);
      const col = [[0, 0], [1, 0.2], [-1, 0.15], [0.5, 0.95], [-0.5, 0.95], [0.5, -0.85], [-0.5, -0.85], [1.4, -0.7], [-1.4, -0.6]].map(([x, y]) => ball(I, std(C('stem'), { emissiveIntensity: 0.55 }), 0.42, V(4.6 + x, 1.2 + y, 0)));
      tag('ipsc', 'Oct4 · Sox2 · Klf4 · c-Myc', 'oct4', V(-6, 6.7, 0), u => u < 0.4);
      tag('ipsc', 'Adult skin fibroblast', 'fibro', V(-6, -2.2, 0), u => u < 0.34);
      tag('ipsc', 'Back uphill: weeks, few cells', 'stem', V(-0.2, 3, 0), u => u >= 0.34 && u < 0.66);
      tag('ipsc', 'iPSC colony: pluripotent', 'stem', V(4.6, 3.6, 0), u => u >= 0.66);
      tag('ipsc', 'Risk: teratoma, c-Myc oncogene', 'cancer', V(4.6, -1.6, 0), u => u >= 0.74);

      // --- marrow on MRI and PET: simulated scans, not patient images
      // PET: a coarse 3D uptake volume of one body, shown the way scanners display whole-body PET, as a rotating
      // maximum intensity projection (MIP) in inverted grey. The two PET panels use the same body; only marrow and spleen change.
      const Pq = subs.pet;
      const NX = 52, NY = 120, NZ = 34, NA = 36;                 // volume size (left-right, head-feet, back-front) and cine angles
      const rnd = mulberry32(4242);
      function buildVolume(gcsf) {
        const vol = new Float32Array(NX * NY * NZ);
        const put = (cx, cy, cz, rx, ry, rz, v, mode = 'max') => {            // a soft-edged ellipsoid of uptake v
          const x0 = Math.max(0, Math.floor(cx - rx - 1)), x1 = Math.min(NX - 1, Math.ceil(cx + rx + 1));
          const y0 = Math.max(0, Math.floor(cy - ry - 1)), y1 = Math.min(NY - 1, Math.ceil(cy + ry + 1));
          const z0 = Math.max(0, Math.floor(cz - rz - 1)), z1 = Math.min(NZ - 1, Math.ceil(cz + rz + 1));
          for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
            if (d > 1.6) continue;
            const s = v * Math.min(1, Math.max(0, (1.6 - d) / 0.9)), i = (z * NY + y) * NX + x;
            vol[i] = mode === 'add' ? vol[i] + s : Math.max(vol[i], s);
          }
        };
        const C = NX / 2, F = NZ / 2;
        // soft tissue: the faint body outline every MIP shows
        put(C, 9, F, 7, 9, 8, 0.15); put(C, 19, F, 4, 4, 4, 0.15);
        put(C, 44, F, 15, 23, 10, 0.14); put(C, 70, F, 15, 8, 9, 0.14);
        [-1, 1].forEach(s => { put(C + s * 19.5, 42, F, 3.2, 20, 3.2, 0.13); put(C + s * 6.5, 96, F, 5, 25, 5, 0.13); });
        // muscle, bowel and other normal uptake
        for (let i = 0; i < 14; i++) put(C + (rnd() - 0.5) * 18, 56 + rnd() * 12, F + 2 + rnd() * 5, 1.6 + rnd() * 1.5, 1.4 + rnd(), 1.6, 0.16 + rnd() * 0.12);
        put(C, 9, F, 6, 7.5, 6.8, 1.15);                                   // brain gray matter
        [-1, 1].forEach(s => put(C + s * 4, 16, F + 3, 1.3, 1.2, 1.3, 0.42));   // tonsils / salivary glands
        put(C + 3, 35, F + 3.5, 4.4, 5, 4, 0.7); put(C + 3, 35, F + 3.5, 2.4, 3, 2.2, 0.15, 'max');   // heart (variable)
        put(C - 7, 46, F, 8, 5.5, 7, 0.36);                                // liver
        const sp = gcsf ? 1.25 : 1;
        put(C + 10, 45, F - 3, 2.7 * sp, 4 * sp, 3 * sp, gcsf ? 0.62 : 0.26);  // spleen
        [-1, 1].forEach(s => { put(C + s * 6, 51, F - 6, 2.2, 4, 2.2, 0.55); for (let y = 55; y < 70; y += 1.5) put(C + s * (6 - (y - 55) * 0.25), y, F - 4, 0.6, 0.9, 0.6, 0.45); });   // kidneys, ureters
        put(C, 74, F + 3, 3.6, 3, 3.2, 1.3);                               // bladder
        // bone marrow: low and patchy at baseline, high and even after G-CSF
        const m = gcsf ? 0.78 : 0.22, mv = () => m * (gcsf ? 0.96 + rnd() * 0.06 : 0.85 + rnd() * 0.3);
        for (let y = 21; y <= 66; y += 2.6) put(C, y, F - 6.5, 1.9, 1.55, 1.9, mv());           // vertebral bodies
        for (let k = 0; k < 9; k++) [-1, 1].forEach(s => { for (let a = 0; a < 1; a += 0.07) put(C + s * (3 + a * 11), 26 + k * 3.2 + a * 2.5, F - 7 + a * 6, 0.85, 0.7, 0.85, mv() * 0.55); });   // ribs
        put(C, 35, F + 8.5, 1, 5.5, 0.8, mv());                            // sternum
        [-1, 1].forEach(s => {
          put(C + s * 8, 64, F - 4, 4.6, 3.6, 1.8, mv()); put(C + s * 3.2, 68, F - 6, 2, 3.5, 1.6, mv());   // iliac wings, sacrum
          put(C + s * 16.5, 25, F, 2, 2, 2, mv());                         // humeral heads
          put(C + s * 9, 75, F, 2, 2, 2, mv());                            // femoral heads
          for (let y = 78; y < (gcsf ? 98 : 84); y += 1.1) put(C + s * (9 - (y - 78) * 0.1), y, F, 1.15, 1.2, 1.15, mv() * 0.9);   // femoral shafts fill in
          if (gcsf) for (let y = 28; y < 40; y += 1.1) put(C + s * 18.5, y, F, 1, 1.2, 1, mv() * 0.8);   // and the humeral shafts
        });
        put(C, 4, F - 1, 6, 2, 6, mv() * 0.5);                             // skull marrow under the brain
        return vol;
      }
      function mipFrames(vol) {
        const frames = [];
        for (let a = 0; a < NA; a++) {
          const th = a / NA * Math.PI * 2, c = Math.cos(th), s = Math.sin(th), img = new Float32Array(NX * NY);
          for (let y = 0; y < NY; y++) for (let u = 0; u < NX; u++) {
            let best = 0;
            const du = u - NX / 2;
            for (let d = -NZ / 2 - 9; d < NZ / 2 + 9; d += 0.8) {
              const x = Math.round(NX / 2 + du * c - d * s), z = Math.round(NZ / 2 + du * s + d * c);
              if (x < 0 || x >= NX || z < 0 || z >= NZ) continue;
              const v = vol[(z * NY + y) * NX + x];
              if (v > best) best = v;
            }
            img[y * NX + u] = best;
          }
          frames.push(img);
        }
        return frames;
      }
      // turns a projection into an inverted grey image with a little counting noise, like a reading monitor
      const small = document.createElement('canvas'); small.width = NX; small.height = NY;
      const sctx = small.getContext('2d'), simg = sctx.createImageData(NX, NY);
      const noise = Array.from({ length: NA }, () => Float32Array.from({ length: NX * NY }, () => rnd() * 2 - 1));
      function paintPet(panel, frames, a, title, note) {
        const img = frames[a], nz = noise[a];
        for (let i = 0; i < NX * NY; i++) {
          const v = img[i] * (1 + nz[i] * 0.22 / Math.sqrt(0.2 + img[i])), g = Math.round(255 * (1 - Math.min(1, Math.max(0, v / 0.95))));
          simg.data.set([g, g, g, 255], i * 4);
        }
        sctx.putImageData(simg, 0, 0);
        panel.draw((c, w, hh) => {
          c.fillStyle = '#fff'; c.fillRect(0, 0, w, hh);
          c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
          const sc = Math.min((w - 10) / NX, (hh - 52) / NY), dw = NX * sc, dh = NY * sc;
          c.drawImage(small, (w - dw) / 2, 26, dw, dh);
          c.fillStyle = '#222'; c.font = '600 13px sans-serif'; c.textAlign = 'left'; c.fillText(title, 8, 17);
          c.fillStyle = '#666'; c.font = '11px sans-serif'; c.fillText(note, 8, hh - 10);
          c.textAlign = 'right'; c.fillText('MIP · simulated', w - 8, 17);
        });
      }
      let petFrames = null;                                          // built the first time the PET view is opened
      const petA = k.panel(Pq, 4.3, 8, 256), petB = k.panel(Pq, 4.3, 8, 256);
      petA.mesh.position.set(0.4, 0, 0); petB.mesh.position.set(5.5, 0, 0);
      let petAngle = -1;
      function showPet(a) {
        if (a === petAngle) return; petAngle = a;
        if (!petFrames) petFrames = [mipFrames(buildVolume(false)), mipFrames(buildVolume(true))];
        paintPet(petA, petFrames[0], a, 'FDG-PET · baseline', 'Brain, heart, kidneys, bladder hot; marrow faint');
        paintPet(petB, petFrames[1], a, 'FDG-PET · after G-CSF', 'Even marrow uptake, larger hotter spleen');
      }

      // MRI: a simulated midline sagittal T1 slice of the lumbar spine, young (red marrow) beside older (yellow marrow)
      const mri = k.panel(Pq, 5.6, 8, 384);
      mri.mesh.position.set(-5.9, 0, 0);
      function sagittal(c, ox, w, hh, fatty) {
        const r = mulberry32(fatty ? 77 : 33), g = v => { const q = Math.round(255 * Math.max(0, Math.min(1, v))); return `rgb(${q},${q},${q})`; };
        const lord = y => 14 * Math.sin((y / hh) * Math.PI) - 7;        // a gentle lumbar curve, front to the left
        const X = f => ox + w * f;
        c.save(); c.beginPath(); c.rect(ox, 0, w, hh); c.clip();
        c.fillStyle = g(0.04); c.fillRect(ox, 0, w, hh);
        // in front of the spine: bowel and fat, then the aorta as a dark flow void
        c.fillStyle = g(0.3); c.fillRect(ox, 0, w * 0.3, hh);
        for (let i = 0; i < 9; i++) {
          const x = X(0.03 + r() * 0.24), y = r() * hh, rad = 8 + r() * 14, gr = c.createRadialGradient(x, y, 1, x, y, rad);
          const v = r() < 0.4 ? 0.06 : 0.38 + r() * 0.12;
          gr.addColorStop(0, g(v)); gr.addColorStop(1, 'rgba(77,77,77,0)'); c.fillStyle = gr; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
        const strip = (f0, f1, v, until = hh) => { c.fillStyle = g(v); c.beginPath(); for (let y = 0; y <= until; y += 8) c.lineTo(X(f0) + lord(y), y); for (let y = until; y >= 0; y -= 8) c.lineTo(X(f1) + lord(y), y); c.fill(); };
        strip(0.25, 0.33, fatty ? 0.72 : 0.5);                            // fat in front of the spine
        strip(0.29, 0.345, 0.05, hh * 0.68);                              // aorta, ending at its split near L4
        // behind the spine: muscle with fat streaks, then subcutaneous fat and skin
        strip(0.76, 0.93, 0.3);
        for (let i = 0; i < 8; i++) { const y = r() * hh; c.fillStyle = g(0.55); c.fillRect(X(0.78 + r() * 0.12), y, 2, 26 + r() * 30); }
        strip(0.92, 1.02, 0.86); strip(0.985, 1.02, 0.45);
        // vertebral bodies and discs
        const vx = 0.35, vw = 0.29, H = 58, gap = 16, base = fatty ? 0.78 : 0.4;
        for (let k2 = 0; k2 < 7; k2++) {
          const y = 4 + k2 * (H + gap), off = lord(y + H / 2), x0 = X(vx) + off, x1 = X(vx + vw) + off;
          // disc below: darker fibrous ring around a slightly brighter centre
          c.fillStyle = g(0.24); c.beginPath(); c.ellipse((x0 + x1) / 2, y + H + gap / 2, (x1 - x0) / 2 + 1, gap / 2 + 3, 0, 0, 7); c.fill();
          c.fillStyle = g(0.36); c.beginPath(); c.ellipse((x0 + x1) / 2 + 2, y + H + gap / 2, (x1 - x0) * 0.3, gap / 2 - 1, 0, 0, 7); c.fill();
          // body outline with slightly concave end plates
          const path = new Path2D(); const sag = 3;
          path.moveTo(x0 + 3, y); path.quadraticCurveTo((x0 + x1) / 2, y + sag, x1 - 3, y); path.quadraticCurveTo(x1 + 1, y + H / 2, x1 - 3, y + H);
          path.quadraticCurveTo((x0 + x1) / 2, y + H - sag, x0 + 3, y + H); path.quadraticCurveTo(x0 - 3, y + H / 2, x0 + 3, y); path.closePath();
          const gr = c.createLinearGradient(x0, y, x1, y + H);
          gr.addColorStop(0, g(base - 0.04)); gr.addColorStop(0.5, g(base + 0.03)); gr.addColorStop(1, g(base - 0.05));
          c.fillStyle = gr; c.fill(path);
          if (fatty) for (let p = 0; p < 5; p++) {                      // patchy fat islands in older marrow
            const fx = x0 + 8 + r() * (x1 - x0 - 16), fy = y + 8 + r() * (H - 16), rad = 5 + r() * 8, rg = c.createRadialGradient(fx, fy, 0, fx, fy, rad);
            rg.addColorStop(0, g(0.92)); rg.addColorStop(1, 'rgba(199,199,199,0)'); c.fillStyle = rg; c.fillRect(fx - rad, fy - rad, rad * 2, rad * 2);
          }
          c.strokeStyle = g(0.06); c.lineWidth = 2.2; c.stroke(path);                         // cortical bone is dark on T1
          c.fillStyle = g(0.1); c.beginPath(); c.ellipse(x1 - 4, y + H / 2, 6, 2, 0, 0, 7); c.fill();   // basivertebral vein
          // lamina and spinous process behind the canal carry the same marrow signal
          const px = X(0.81) + off, py = y + H * 0.5, pg = c.createRadialGradient(px, py, 1, px, py, H * 0.42);
          pg.addColorStop(0, g(base * 0.9)); pg.addColorStop(0.75, g(base * 0.75)); pg.addColorStop(1, 'rgba(77,77,77,0)');
          c.fillStyle = pg; c.beginPath(); c.ellipse(px, py, w * 0.06, H * 0.42, 0.35, 0, 7); c.fill();
        }
        strip(0.645, 0.735, 0.1);                                          // spinal canal: CSF is dark on T1
        c.strokeStyle = g(0.4); c.lineWidth = 4; c.beginPath(); for (let y = 0; y <= hh * 0.42; y += 8) c.lineTo(X(0.69) + lord(y), y); c.stroke();   // conus
        c.strokeStyle = g(0.24); c.lineWidth = 1; for (let n = 0; n < 4; n++) { c.beginPath(); for (let y = hh * 0.4; y <= hh; y += 8) c.lineTo(X(0.665 + n * 0.016) + lord(y), y); c.stroke(); }   // cauda equina
        c.restore();
      }
      mri.draw((c, w, hh) => {
        const half = w / 2;
        sagittal(c, 0, half - 2, hh, false); sagittal(c, half + 2, half - 2, hh, true);
        // a soft blur and grain so the slices read like an image rather than a drawing
        const tmp = document.createElement('canvas'); tmp.width = w / 2; tmp.height = hh / 2;
        const t2 = tmp.getContext('2d'); t2.imageSmoothingEnabled = true; t2.drawImage(c.canvas, 0, 0, w / 2, hh / 2);
        c.imageSmoothingEnabled = true; c.drawImage(tmp, 0, 0, w, hh);
        const id2 = c.getImageData(0, 0, w, hh), r3 = mulberry32(9);
        for (let i = 0; i < id2.data.length; i += 4) { const n = (r3() - 0.5) * 18; id2.data[i] += n; id2.data[i + 1] += n; id2.data[i + 2] += n; }
        c.putImageData(id2, 0, 0);
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, hh - 40, w, 40);
        c.fillStyle = '#e6e6e6'; c.font = '600 14px sans-serif'; c.textAlign = 'center';
        c.fillText('Child: red marrow', half / 2, hh - 23); c.fillText('Older adult: yellow marrow', half * 1.5, hh - 23);
        c.fillStyle = '#9a9a9a'; c.font = '12px sans-serif';
        c.fillText('about as dark as disc', half / 2, hh - 8); c.fillText('bright, like fat', half * 1.5, hh - 8);
        c.fillStyle = '#cfcfcf'; c.font = '600 13px sans-serif'; c.textAlign = 'left'; c.fillText('T1 MRI · sagittal · simulated', 8, 18);
      });
      tag('pet', 'T1 MRI, lumbar spine', 'electron', V(-5.9, 4.7, 0));
      tag('pet', 'FDG-PET baseline', 'electron', V(0.4, 4.7, 0));
      tag('pet', 'FDG-PET after G-CSF', 'fdg', V(5.5, 4.7, 0));
      tag('pet', 'Diffuse marrow + spleen uptake', 'fdg', V(5.5, -4.7, 0));

      let el = 0;
      function draw(dt) {
        const v = LESSON['stem-niche'] || 'niche';
        el += reduceMotion ? 0 : dt;
        Object.entries(subs).forEach(([key, s]) => { s.visible = key === v; });
        const u = reduceMotion ? 0.8 : (el % 10) / 10;
        if (v === 'niche') {
          [rbcFlow, prop, exitS, ...cxcl].forEach(s => s.update(dt));
          hsc.scale.setScalar(1 + Math.sin(el * 1.2) * 0.03);
          stroma.forEach((s, i) => { s.rotation.z = Math.sin(el * 0.5 + i) * 0.05; });
          mk.scale.setScalar(1 + Math.sin(el * 0.8) * 0.02);
        }
        if (v === 'tree') flows.forEach(s => s.update(dt));
        if (v === 'ipsc') {
          fac.forEach((b, i) => {
            const t = ease.inOut(seg(u, 0.04 + i * 0.05, 0.2 + i * 0.05));
            b.position.copy(b.userData.from).lerp(fib.position, t); b.visible = t < 0.98;
          });
          nucGlow.visible = u > 0.3; nucGlow.material.opacity = 0.5 + 0.3 * Math.sin(el * 4);
          const m = ease.inOut(seg(u, 0.34, 0.66));
          const pt = uphill.userData.curve.getPointAt(m);
          fib.position.copy(pt).add(V(0, 1.6 * (1 - m), 1));
          fib.userData.b.scale.set(lerp(2.6, 1, m), lerp(0.7, 1, m), lerp(0.9, 1, m));
          fib.tint(C('fibro').clone().lerp(C('stem'), m));
          fib.visible = u < 0.7;
          col.forEach((c, i) => { const s = seg(u, 0.66 + i * 0.02, 0.7 + i * 0.02); c.visible = s > 0; c.scale.setScalar(Math.max(0.001, 0.42 * s)); });
        }
        if (v === 'pet') showPet(reduceMotion ? 0 : Math.floor(el * 4) % NA);   // the PET cine turns once every 9 seconds
        tag.update(v, u);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
