/* Signal transduction: GPCRs and cAMP, receptor tyrosine kinases and the MAPK cascade, and IP₃-driven calcium release.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osRec: link('https://openstax.org/books/biology-2e/pages/9-1-signaling-molecules-and-cellular-receptors', 'OpenStax Biology 2e, 9.1 Signaling Molecules and Cellular Receptors'),
  osProp: link('https://openstax.org/books/biology-2e/pages/9-2-propagation-of-the-signal', 'OpenStax Biology 2e, 9.2 Propagation of the Signal'),
  rosenbaum: link('https://doi.org/10.1038/nature08144', 'Rosenbaum, Rasmussen &amp; Kobilka, structure and function of G-protein-coupled receptors (Nature, 2009)'),
  lemmon: link('https://doi.org/10.1016/j.cell.2010.06.011', 'Lemmon &amp; Schlessinger, cell signaling by receptor tyrosine kinases (Cell, 2010)'),
  simanshu: link('https://doi.org/10.1016/j.cell.2017.06.009', 'Simanshu, Nissley &amp; McCormick, RAS proteins and their regulators in human disease (Cell, 2017)'),
  berridge: link('https://doi.org/10.1038/nrm1155', 'Berridge, Bootman &amp; Roderick, calcium signaling: dynamics, homeostasis and remodeling (Nat Rev Mol Cell Biol, 2003)'),
  cheng: link('https://doi.org/10.1152/physrev.00030.2007', 'Cheng &amp; Lederer, calcium sparks (Physiol Rev, 2008)'),
};
const GPCR = {
  rest: 'No hormone: the receptor is idle and Gαs holds GDP, bound to its Gβγ partner. A little cAMP is made at random, and phosphodiesterase (PDE) breaks it down to AMP as fast as it appears, so PKA stays locked by its regulatory subunits.',
  gs: 'Gs: epinephrine binds a β-adrenergic receptor. The receptor swaps GDP for GTP on Gαs, which leaves Gβγ and switches on adenylyl cyclase. Each cyclase turns many ATP into cAMP, and cAMP frees PKA’s catalytic subunits to phosphorylate targets: amplification at every step. Gα’s own GTPase and PDE switch it off within seconds.',
  gi: 'Gi: an inhibitory receptor, such as the α2-adrenergic or M2 muscarinic receptor, activates Gαi, which slows adenylyl cyclase, so cAMP falls and PKA relocks. In the heart, the freed Gβγ also opens potassium channels, which slows the pacemaker.',
  cholera: 'Cholera toxin: it chemically modifies Gαs so its GTPase cannot work. Gαs stays locked on, cAMP stays high in gut cells, and PKA opens CFTR chloride channels. Salt and water pour into the gut, causing severe watery diarrhea.',
};
const MAPK = {
  off: 'No growth factor: receptor tyrosine kinases sit apart as single chains, RAS holds GDP and is off, and the RAF–MEK–ERK relay is quiet.',
  egf: 'EGF bound: two receptors pair up and phosphorylate each other’s tails on tyrosines. GRB2 and SOS dock there, and SOS makes RAS drop GDP and pick up GTP. Active RAS starts the relay: RAF phosphorylates MEK, MEK phosphorylates ERK, and ERK enters the nucleus to switch on growth genes such as FOS and cyclin D. A GTPase-activating protein (GAP) soon turns RAS off again.',
  ras: 'Oncogenic RAS: a mutation such as KRAS G12 blocks GTP hydrolysis, so RAS stays on with no growth factor at all. ERK signals nonstop, pushing the cell to divide. RAS genes are mutated in roughly one in five human cancers, especially pancreatic, colorectal and lung cancers.',
  drug: 'KRAS G12C inhibitor: drugs such as sotorasib and adagrasib bind the mutant KRAS G12C protein only in its GDP-bound off state and trap it there, so the relay goes quiet. They are approved for some lung and colorectal cancers, but tumors often find ways around them.',
};
const CALCIUM = {
  rest: 'Resting: cytosolic calcium is about 100 nanomolar, thousands of times lower than inside the ER and about 10,000 times lower than outside the cell. SERCA pumps on the ER and pumps on the plasma membrane spend ATP to keep it that low.',
  puff: 'IP₃ puff: a hormone acting through a Gq-coupled receptor switches on phospholipase Cβ, which cuts PIP₂ into DAG, which stays in the membrane, and IP₃, which diffuses to the ER. IP₃ opens a small cluster of IP₃ receptor channels, releasing a brief local puff of calcium that calmodulin senses.',
  wave: 'Calcium wave: released calcium helps open the next channel cluster (calcium-induced calcium release), so puffs link into a wave that sweeps across the cell. In heart and skeletal muscle, the elementary events are calcium sparks from clusters of ryanodine receptors on the sarcoplasmic reticulum.',
  blocked: 'SERCA blocked: with the pump stopped (the plant toxin thapsigargin does this in the lab), calcium cannot be returned to the ER. The ER drains, cytosolic calcium stays high, the signal can no longer switch off, and the stressed ER can push the cell toward apoptosis.',
};
whenLesson('sig-gpcr', v => setCaption('sigGpcrCaption', GPCR[v]));
whenLesson('sig-mapk', v => setCaption('sigMapkCaption', MAPK[v]));
whenLesson('sig-ca', v => setCaption('sigCaCaption', CALCIUM[v]));

const CHAPTERS = [
  {
    id: 'sig-gpcr', short: 'GPCR & cAMP', where: 'A patch of plasma membrane and the cytosol beneath it',
    title: 'G proteins and the cAMP amplifier',
    legend: [['hot', 'Hormone'], ['signal', 'GPCR'], ['gprot', 'Gα (GDP or GTP)'], ['electron', 'Gβγ'], ['nadh', 'Adenylyl cyclase'], ['camp', 'cAMP'], ['pka', 'PKA'], ['cut', 'Phosphodiesterase']],
    html: () => `
      <p class="lede">Most hormones and neurotransmitters cannot enter the cell. They bind a <b>G-protein-coupled receptor</b> (GPCR), a protein that snakes through the membrane seven times, and the message is relayed inside by a <b>second messenger</b>: here, cyclic AMP.</p>
      ${lessonSeg('sig-gpcr', 'Signal', [['rest', 'No hormone'], ['gs', 'Gs: epinephrine'], ['gi', 'Gi: inhibitory'], ['cholera', 'Cholera toxin']])}
      ${caption('sigGpcrCaption', GPCR[LESSON['sig-gpcr']])}
      <ul class="facts">
        <li>Humans have about 800 GPCR genes, and roughly a third of approved drugs act on GPCRs, including beta blockers, antihistamines and opioids.</li>
        <li>The G protein is a timer: it is on while it holds GTP and turns itself off by hydrolyzing GTP to GDP.</li>
        <li>Amplification: one receptor activates many G proteins, and each cyclase makes many cAMP, so a few hormone molecules can change thousands of enzymes.</li>
        <li>Glucagon uses this route in the liver to break down glycogen; caffeine can raise cAMP slightly by blocking PDE, though at normal intake it acts mainly by blocking adenosine receptors.</li>
      </ul>
      <p><a href="#endocrine-receptors">Receptor routes for hormones</a> · <a href="#synapse">Neurotransmitter receptors at the synapse</a> · <a href="#liver-glycogen">Glucagon in the liver</a> · <a href="#sig-mapk">Next: RTKs and MAPK</a></p>
      ${sources([SRC.rosenbaum, SRC.osProp, SRC.osRec], 'Proteins are drawn as simple shapes far larger than life, and cAMP particles are enlarged. Real GPCRs sit in a crowded membrane alongside many receptor types, and the timing is slowed so the steps can be followed.')}`,
  },
  {
    id: 'sig-mapk', short: 'RTK & MAPK', where: 'From the plasma membrane to the nucleus',
    title: 'Receptor tyrosine kinases and the MAPK relay',
    legend: [['hot', 'Growth factor (EGF)'], ['signal', 'Receptor tyrosine kinase'], ['atp', 'Phosphate'], ['electron', 'GRB2–SOS'], ['ras', 'RAS (GTP = on)'], ['kinase', 'RAF, MEK, ERK'], ['nucleus', 'Nucleus'], ['drug', 'KRAS G12C inhibitor']],
    html: () => `
      <p class="lede">Growth factors such as EGF signal through <b>receptor tyrosine kinases</b> (RTKs). The receptor is itself an enzyme, and the signal runs through a chain of kinases, each phosphorylating the next, to reach the genes that decide whether a cell divides.</p>
      ${lessonSeg('sig-mapk', 'Signal', [['off', 'No growth factor'], ['egf', 'EGF bound'], ['ras', 'Oncogenic RAS'], ['drug', 'KRAS G12C inhibitor']])}
      ${caption('sigMapkCaption', MAPK[LESSON['sig-mapk']])}
      <ul class="facts">
        <li>RAS is a small GTPase, a cousin of the Gα subunit: on with GTP, off with GDP. The cancer mutations jam the off switch.</li>
        <li>The relay is called a <b>MAPK cascade</b> (mitogen-activated protein kinase). Each kinase activates many copies of the next, amplifying the signal.</li>
        <li>Targeted drugs act at several points: EGFR inhibitors such as osimertinib in lung cancer, BRAF plus MEK inhibitors in BRAF V600E melanoma, and HER2 antibodies such as trastuzumab in breast cancer.</li>
        <li>The insulin receptor is also an RTK; it signals mainly through IRS, PI3K and AKT to move GLUT4 to the surface, with a smaller MAPK arm.</li>
      </ul>
      <p><a href="#cancer-genes">Oncogenes and checkpoints</a> · <a href="#receptor">The insulin receptor in muscle</a> · <a href="#endocrine-receptors">Receptor routes</a> · <a href="#cycle">The cell cycle that ERK pushes</a></p>
      ${sources([SRC.lemmon, SRC.simanshu, SRC.osProp], 'The relay is shown as a straight chain. In cells, scaffold proteins hold the kinases together, feedback loops trim the signal, and RAS, RAF, MEK and ERK each come in several forms.')}`,
  },
  {
    id: 'sig-calcium', short: 'Calcium & IP₃', where: 'Plasma membrane, cytosol and endoplasmic reticulum',
    title: 'IP₃, calcium puffs, sparks and waves',
    legend: [['signal', 'Gq-coupled receptor'], ['kinase', 'Phospholipase Cβ'], ['fat', 'DAG'], ['ip3', 'IP₃'], ['er', 'Endoplasmic reticulum'], ['calcium', 'Calcium'], ['pump', 'SERCA pump'], ['insulin', 'Calmodulin']],
    html: () => `
      <p class="lede">Calcium is the most widely used second messenger. Cells keep it very low in the cytosol and store it in the ER, so opening a channel even briefly gives a sharp, local signal.</p>
      ${lessonSeg('sig-ca', 'Calcium', [['rest', 'Resting'], ['puff', 'IP₃ puff'], ['wave', 'Calcium wave'], ['blocked', 'SERCA blocked']])}
      ${caption('sigCaCaption', CALCIUM[LESSON['sig-ca']])}
      <ul class="facts">
        <li><b>DAG</b> and calcium together switch on protein kinase C, so one receptor launches two branches at once.</li>
        <li><b>Calmodulin</b> binds four calcium ions and then activates targets such as CaM kinase II, which helps store memories at synapses, and myosin light-chain kinase, which contracts smooth muscle.</li>
        <li>Calcium carries information in its timing: the frequency of repeated spikes, not just their height, tells cells such as liver cells and T cells how strong the stimulus is.</li>
        <li>In skeletal muscle, the voltage sensor pulls ryanodine receptors open directly; in heart muscle, a little calcium entering through L-type channels triggers the sparks.</li>
      </ul>
      <p><a href="#muscle-contraction">Calcium release in muscle</a> · <a href="#synapse">Calcium at the synapse</a> · <a href="#pacemaker">Calcium in the pacemaker</a> · <a href="#apoptosis">ER stress and apoptosis</a></p>
      ${sources([SRC.berridge, SRC.cheng, SRC.osProp], 'Calcium ions are drawn as large beads and far fewer than in life. The ER is shown as one flat sheet; real ER is a network of tubes and sheets spreading through the cell, and puffs last tens of milliseconds.')}`,
  },
];

CellCity.register('signaling', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const lerp = (a, b, u) => a + (b - a) * u;
    function membrane(parent, w, d, y, color = 'membrane') {
      const grp = new THREE.Group(); grp.position.y = y; parent.add(grp);
      [-0.55, 0.55].forEach(dy => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), ghost(C(color), 0.32)); m.position.y = dy; grp.add(m); });
      const core = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), ghost(C('fat'), 0.06)); grp.add(core);
      return grp;
    }
    function helices(parent, x, y, color, r = 0.75, h = 2.2) {      // seven transmembrane helices in a ring
      const mat = std(C(color), { emissiveIntensity: 0.35 });
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; rod(parent, mat, V(x + Math.cos(a) * r, y - h / 2, Math.sin(a) * r), V(x + Math.cos(a + 0.4) * r, y + h / 2, Math.sin(a + 0.4) * r), 0.22); }
      return mat;
    }
    // a pool of beads that a scene positions itself each frame
    function pool(parent, color, n, r, glowIt = true) { const mat = std(C(color), { emissiveIntensity: 0.7 }); return Array.from({ length: n }, () => { const m = ball(parent, mat, r); if (glowIt) { const s = k.glow(C(color), r * 5); s.scale.divideScalar(r); m.add(s); } m.visible = false; return m; }); }

    /* ================= GPCR and cAMP ================= */
    {
      const id = 'sig-gpcr', root = new THREE.Group();
      add(id, root, { target: V(0.5, -1.2, 0), pos: V(3, 5, 27), w: 13 }, { fade: 'To the plasma membrane' });
      membrane(root, 22, 8, 0);
      helices(root, -5, 0, 'signal');
      const hormone = ball(root, std(C('hot'), { emissiveIntensity: 0.7 }), 0.45); hormone.add(k.glow(C('hot'), 3));
      const aMat = std(C('gprot'), { emissiveIntensity: 0.4 });
      const ga = ball(root, aMat, 0.62), nuc = ball(ga, std(C('dead')), 0.4, V(0.55, -0.4, 0.4));
      const gb = ball(root, std(C('electron'), { emissiveIntensity: 0.2 }), 0.55, V(-4.6, -1.6, 0.6)); ball(gb, std(C('electron'), { emissiveIntensity: 0.2 }), 0.5, V(0.9, 0.2, 0));
      const acMat = std(C('nadh'), { emissiveIntensity: 0.3, roughness: 0.7 });
      [-0.55, 0.55].forEach(dx => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 14), acMat); c.position.set(2 + dx, 0, 0); root.add(c); });
      ball(root, acMat, 0.9, V(2, -1.7, 0)).scale.set(1.4, 0.8, 1);
      const pka = new THREE.Group(); pka.position.set(7, -5, 0); root.add(pka);
      const rMat = std(C('pka'), { emissiveIntensity: 0.3 }), cMat = std(C('kinase'), { emissiveIntensity: 0.3 });
      [[-0.5, 0.5], [0.5, 0.5]].forEach(p => ball(pka, rMat, 0.5, V(p[0], p[1], 0)));
      const cats = [[-0.6, -0.5], [0.6, -0.5]].map(p => ({ m: ball(pka, cMat, 0.55, V(p[0], p[1], 0)), home: V(p[0], p[1], 0), out: V(p[0] * 4.2, -1.6 + Math.abs(p[0]), 1) }));
      const pde = ball(root, std(C('cut'), { emissiveIntensity: 0.5 }), 0.6, V(4.5, -6.3, 1.5));
      const camp = pool(root, 'camp', 36, 0.13).map(m => ({ m, life: 0, p: V(0, 0, 0), v: V(0, 0, 0) }));
      lbl('Outside the cell', 'electron', root, V(-9, 2.6, -2), id);
      lbl('Cytosol', 'electron', root, V(-9, -3, -2), id);
      lbl('GPCR · 7 helices', 'signal', root, V(-7.6, 1.2, 1.2), id);
      lbl('Gα', 'gprot', ga, V(0, 1, 0), id);
      lbl('Gβγ', 'electron', gb, V(0.4, -1, 0), id);
      lbl('Adenylyl cyclase', 'nadh', root, V(2.8, 1.9, 1), id);
      lbl('cAMP', 'camp', root, V(4.6, -3, 2.6), id);
      lbl('PKA', 'pka', pka, V(0, 1.4, 0), id);
      lbl('PDE · cAMP → AMP', 'cut', pde, V(0, -1.1, 0), id);
      let el = 0, lvl = 0, cur = null;
      const AT = { rest: V(-3.6, -1.6, 0.6), gs: V(2.2, -1.7, 1.2), gi: V(2.2, -1.7, 1.2), cholera: V(2.2, -1.7, 1.2) };
      function draw(dt) {
        const v = LESSON['sig-gpcr'] || 'rest';
        if (v !== cur) { cur = v; aMat.color.copy(C(v === 'gi' ? 'ras' : 'gprot')); aMat.emissive.copy(aMat.color); }
        el += reduceMotion ? 0 : dt;
        const bound = v === 'gs' || v === 'gi';
        const hy = bound ? 1.6 : 5 + Math.sin(el) * 0.3;
        hormone.visible = v !== 'cholera';
        hormone.position.set(-5 + (bound ? 0 : 2.5), reduceMotion ? hy : lerp(hormone.position.y || hy, hy, Math.min(1, dt * 3)), 0);
        const target = AT[v], s = reduceMotion ? 1 : Math.min(1, dt * 2.5);
        ga.position.lerp(target, s);
        nuc.material.color.copy(C(v === 'rest' ? 'dead' : 'atp')); nuc.material.emissive.copy(nuc.material.color);
        const want = { rest: 0.08, gs: 1, gi: 0, cholera: 1 }[v];
        lvl = reduceMotion ? want : lvl + (want - lvl) * Math.min(1, dt * 1.5);
        camp.forEach((c, i) => {
          if (c.life <= 0) {
            if (i / camp.length < lvl && (reduceMotion || Math.random() < dt * 3)) { c.life = 3 + Math.random() * 2; c.p.set(2 + rr(-0.6, 0.6), -2.3, rr(-0.6, 0.6)); c.v.set(rr(0.2, 1.4), rr(-1.4, -0.5), rr(-0.4, 0.6)); }
            c.m.visible = false; return;
          }
          if (!reduceMotion) { c.life -= dt; c.p.addScaledVector(c.v, dt); c.v.x += rr(-1, 1) * dt; }
          c.m.position.copy(c.p); c.m.visible = true;
          if (c.p.distanceTo(pde.position) < 1 || c.p.y < -8) c.life = 0;
        });
        cats.forEach((c, i) => { c.m.position.lerpVectors(c.home, c.out, Math.min(1, lvl * 1.2)); c.m.position.y += lvl > 0.5 ? Math.sin(el * 3 + i) * 0.15 : 0; });
        cMat.emissiveIntensity = 0.25 + 0.6 * lvl;
        acMat.emissiveIntensity = v === 'gi' ? 0.06 : 0.2 + 0.3 * lvl;
      }
      behaviors[id] = { enter() { cur = null; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= RTK and MAPK ================= */
    {
      const id = 'sig-mapk', root = new THREE.Group();
      add(id, root, { target: V(0.5, -1.5, 0), pos: V(4, 4, 30), w: 14 }, { fade: 'Down the MAPK relay' });
      membrane(root, 22, 8, 4);
      const nucleus = body(root, C('nucleus'), [5, 2.6, 4], V(-1, -8.6, 0), 0.22);
      const rtkMat = std(C('signal'), { emissiveIntensity: 0.35 });
      const rtks = [-1, 1].map(s => {
        const grp = new THREE.Group(); root.add(grp);
        ball(grp, rtkMat, 0.85, V(0, 6.2, 0)).scale.set(0.8, 1.2, 0.8);
        rod(grp, rtkMat, V(0, 5.1, 0), V(0, 2.8, 0), 0.22);
        ball(grp, rtkMat, 0.7, V(0, 2.2, 0));
        const egf = ball(grp, std(C('hot'), { emissiveIntensity: 0.7 }), 0.4, V(s * 0.7, 7.4, 0)); egf.add(k.glow(C('hot'), 2.4));
        const ps = [1.8, 1.2].map(y => { const p = ball(grp, std(C('atp'), { emissiveIntensity: 0.9 }), 0.17, V(s * 0.55, y, 0.4)); p.add(k.glow(C('atp'), 1.4)); return p; });
        return { grp, egf, ps, s };
      });
      const sos = ball(root, std(C('electron'), { emissiveIntensity: 0.25 }), 0.55, V(2.2, 1.6, 0.3));
      const rasMat = std(C('dead'), { emissiveIntensity: 0.2 });
      const ras = ball(root, rasMat, 0.6, V(4.4, 2.6, 0)); rod(root, rasMat, V(4.4, 3.2, 0), V(4.4, 3.5, 0), 0.08);
      const rasGlow = k.glow(C('ras'), 3.5); ras.add(rasGlow);
      const drug = ball(ras, std(C('drug'), { emissiveIntensity: 0.6 }), 0.3, V(0.5, -0.3, 0.4));
      const kMat = () => std(C('kinase'), { emissiveIntensity: 0.15 });
      const chain = [V(4.4, 2.6, 0), V(4, 0, 0.5), V(2.4, -2.4, 0.5), V(0.4, -4.4, 0.3), V(-1, -8.2, 0.6)];
      const kin = ['RAF', 'MEK', 'ERK'].map((n, i) => ({ m: ball(root, kMat(), 0.6, chain[i + 1]), n }));
      for (let i = 0; i < 3; i++) rod(root, std(C('kinase'), { emissiveIntensity: 0.1, transparent: true, opacity: 0.4 }), chain[i], chain[i + 1], 0.05);
      const spark = ball(root, std(C('atp'), { emissiveIntensity: 1 }), 0.2); spark.add(k.glow(C('atp'), 2));
      const erkIn = ball(root, std(C('kinase'), { emissiveIntensity: 0.8 }), 0.45); erkIn.add(k.glow(C('kinase'), 2.5));
      const path = curve(chain);
      lbl('Growth factor', 'hot', rtks[0].grp, V(-0.8, 8.2, 0), id);
      lbl('Receptor tyrosine kinase', 'signal', rtks[1].grp, V(3.6, 6.3, 0), id);
      lbl('GRB2–SOS', 'electron', sos, V(-1.1, 0.4, 0.4), id);
      lbl('RAS', 'ras', ras, V(1.1, 0.5, 0), id);
      kin.forEach(x => lbl(x.n, 'kinase', x.m, V(1.2, 0.2, 0), id));
      lbl('Nucleus · growth genes on', 'nucleus', nucleus, V(0, -0.6, 0.4), id);
      lbl('KRAS G12C inhibitor', 'drug', drug, V(2.6, -1.4, 0), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['sig-mapk'] || 'off';
        el += reduceMotion ? 0 : dt;
        const dimer = v === 'egf';
        rtks.forEach(r => {
          const x = r.s * (dimer ? 0.75 : 2.6 + (reduceMotion ? 0 : 0.35 * Math.sin(el * 0.9 + r.s)));   // apart, the monomers drift in the membrane
          r.grp.position.x = reduceMotion ? x : lerp(r.grp.position.x || x, x, Math.min(1, dt * 3));
          r.egf.visible = dimer; r.ps.forEach(p => { p.visible = dimer; });
        });
        sos.visible = dimer;
        const loop = (el % 4) / 4;
        const rasOn = v === 'ras' || (dimer && loop < 0.85);
        rasMat.color.copy(C(rasOn ? 'ras' : 'dead')); rasMat.emissive.copy(rasMat.color); rasMat.emissiveIntensity = rasOn ? 0.7 : 0.15;
        rasGlow.visible = rasOn; drug.visible = v === 'drug';
        const active = v === 'egf' || v === 'ras';
        const u = reduceMotion ? 0.7 : (v === 'ras' ? (el % 2.2) / 2.2 : loop);
        spark.visible = active && u < 0.75; erkIn.visible = active && u >= 0.75;
        if (spark.visible) spark.position.copy(path.getPointAt(Math.min(0.75, u) / 0.75 * 0.75));
        if (erkIn.visible) erkIn.position.copy(path.getPointAt(u));
        kin.forEach((x, i) => { const lit = active && u * 4 > i + 0.4; x.m.material.emissiveIntensity = lit ? 0.85 : 0.15; });
        nucleus.children[1].material.uniforms.uI.value = active && u > 0.85 ? 1.5 : 0.8;
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Calcium and IP3 ================= */
    {
      const id = 'sig-calcium', root = new THREE.Group();
      add(id, root, { target: V(0, 0.5, 0), pos: V(2, 6, 27), w: 14 }, { fade: 'Into the cytosol' });
      membrane(root, 22, 7, 5.5);
      helices(root, -7, 5.5, 'signal', 0.65, 2);
      const plc = ball(root, std(C('kinase'), { emissiveIntensity: 0.4 }), 0.6, V(-4.8, 4.2, 0));
      const dag = Array.from({ length: 5 }, (_, i) => ball(root, std(C('fat'), { emissiveIntensity: 0.5 }), 0.2, V(-4 + i * 0.7, 5, 1.2)));
      const er = new THREE.Mesh(new THREE.BoxGeometry(20, 2.2, 6), ghost(C('er'), 0.3)); er.position.y = -3; root.add(er);
      const erEdge = new THREE.LineSegments(new THREE.EdgesGeometry(er.geometry), new THREE.LineBasicMaterial({ color: C('er') })); erEdge.position.copy(er.position); root.add(erEdge);
      const store = Array.from({ length: 60 }, (_, i) => ball(root, std(C('calcium'), { emissiveIntensity: 0.4 }), 0.1, V(rr(-9.5, 9.5), rr(-3.8, -2.2), rr(-2.6, 2.6))));
      const xs = [-6, -3, 0, 3, 6];
      const chMat = std(C('ip3'), { emissiveIntensity: 0.3 });
      const chans = xs.map(x => {
        const grp = new THREE.Group(); grp.position.set(x, -1.9, 0); root.add(grp);
        [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2; rod(grp, chMat, V(Math.cos(a) * 0.3, -0.3, Math.sin(a) * 0.3), V(Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3), 0.14); });
        const gl = k.glow(C('calcium'), 4); gl.position.y = 0.8; grp.add(gl);
        const ions = Array.from({ length: 8 }, () => ball(grp, std(C('calcium'), { emissiveIntensity: 0.8 }), 0.13));
        return { grp, gl, ions, x, a: 0 };
      });
      const sMat = std(C('pump'), { emissiveIntensity: 0.4 });
      const sercas = [-4.5, -1.5, 1.5, 4.5].map(x => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.9, 12), sMat); m.position.set(x, -1.9, -1.4); root.add(m); return m; });
      const cam = [-5, -1, 2.5, 6.5].map(x => ({ m: ball(root, std(C('insulin'), { emissiveIntensity: 0.2 }), 0.42, V(x, 1.3, 1.2)), x }));
      const ip3 = pool(root, 'ip3', 6, 0.18);
      lbl('Gq-coupled receptor', 'signal', root, V(-7, 7.3, 0), id);
      lbl('PLCβ', 'kinase', plc, V(0, -1, 0), id);
      lbl('DAG stays in membrane', 'fat', root, V(1.8, 6.8, 1.2), id);
      lbl('IP₃', 'ip3', root, V(-6.6, 1.6, 0.6), id);
      lbl('ER · calcium store', 'er', root, V(7.5, -4.6, 2.6), id);
      lbl('IP₃ receptor channels', 'ip3', root, V(-0.5, -1.2, 2.6), id);
      lbl('SERCA pumps', 'pump', root, V(5.8, -0.9, -1.4), id);
      lbl('Calmodulin', 'insulin', cam[3].m, V(0, 0.9, 0), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['sig-ca'] || 'rest';
        el += reduceMotion ? 0 : dt;
        const on = v !== 'rest';
        plc.material.emissiveIntensity = on && v !== 'blocked' ? 0.8 : 0.2;
        dag.forEach(d => { d.visible = v === 'puff' || v === 'wave'; });
        ip3.forEach((m, i) => {
          m.visible = v === 'puff' || v === 'wave';
          const u = reduceMotion ? 0.6 : ((el * 0.4 + i / ip3.length) % 1);
          const tx = v === 'wave' ? -6 : -6 + (i % 2) * 3;
          m.position.set(lerp(-4.4 + (i % 3) * 0.5, tx, u), lerp(4.6, -1.2, u), 0.6);
        });
        chans.forEach((c, i) => {
          let a = 0;
          if (v === 'puff') a = i < 2 ? Math.max(0, Math.sin(el * 2.4 + i * 1.7)) : 0;
          else if (v === 'wave') { const front = (el * 4) % 16 - 2; a = Math.max(0, 1 - Math.abs(front - i * 3) / 2.2); }
          else if (v === 'blocked') a = 0.35;
          if (reduceMotion && v !== 'rest') a = v === 'puff' ? (i < 2 ? 0.8 : 0) : v === 'wave' ? 0.7 : 0.35;
          c.a = a;
          c.gl.material.opacity = a; c.gl.visible = a > 0.02; c.gl.scale.setScalar(2 + a * 4);
          c.ions.forEach((m, j) => { const ang = j / 8 * Math.PI * 2 + i; const r = 0.4 + a * 1.8; m.visible = a > 0.05; m.position.set(Math.cos(ang) * r, 0.7 + a * 1.2 * Math.abs(Math.sin(ang)), Math.sin(ang) * r); });
        });
        cam.forEach(c => { const near = chans.reduce((s, ch) => s + ch.a * Math.max(0, 1 - Math.abs(ch.x - c.x) / 3.5), 0); c.m.material.emissiveIntensity = 0.15 + Math.min(1, near) * 0.85; c.m.scale.setScalar(0.42 * (1 + Math.min(1, near) * 0.25)); });
        sMat.color.copy(C(v === 'blocked' ? 'dead' : 'pump')); sMat.emissive.copy(sMat.color);
        sercas.forEach((m, i) => { m.rotation.y += v === 'blocked' || reduceMotion ? 0 : dt * (2 + i * 0.3); });
        store.forEach((m, i) => { m.visible = v === 'blocked' ? i % 4 === 0 : true; });
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
