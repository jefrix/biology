/* Immune activation: MHC class I vs II antigen presentation, complement and acute inflammation, and antibody and cytotoxic T-cell effector responses.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }
const SRC = {
  osInnate: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/21-2-barrier-defenses-and-the-innate-immune-response', 'OpenStax Anatomy &amp; Physiology 2e, 21.2 Innate Immune Response'),
  osT: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/21-3-the-adaptive-immune-response-t-lymphocytes-and-their-functional-types', '21.3 T Lymphocytes'),
  osB: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/21-4-the-adaptive-immune-response-b-lymphocytes-and-antibodies', '21.4 B Lymphocytes and Antibodies'),
  osBio: link('https://openstax.org/books/biology-2e/pages/42-2-adaptive-immune-response', 'OpenStax Biology 2e, 42.2 Adaptive Immune Response'),
  neefjes: link('https://doi.org/10.1038/nri3084', 'Neefjes et al., MHC class I and class II antigen presentation (Nat Rev Immunol, 2011)'),
  ricklin: link('https://doi.org/10.1038/ni.1923', 'Ricklin et al., complement: a key system for immune surveillance and homeostasis (Nat Immunol, 2010)'),
};
const MHC = {
  class1: 'MHC class I: almost every nucleated cell chops a sample of its own proteins in the proteasome, pumps the peptides into the ER through TAP, loads them onto MHC I and displays them. A CD8⁺ cytotoxic T cell whose receptor fits a viral peptide kills the infected cell.',
  class2: 'MHC class II: professional antigen-presenting cells (dendritic cells, macrophages and B cells) engulf microbes, digest them in endosomes and load the fragments onto MHC II. A CD4⁺ helper T cell that recognizes the peptide releases cytokines that direct the rest of the response.',
};
const COMP = {
  opsonize: 'Opsonization: complement C3 is split, and C3b fragments coat the bacterium. Phagocytes carry complement receptors that grab C3b, so a coated microbe is engulfed far faster.',
  mac: 'Membrane attack: C5b, C6, C7, C8 and many copies of C9 assemble into the membrane attack complex, a pore that punches through the bacterial membrane so the cell leaks and dies. It matters most against Neisseria bacteria.',
  inflame: 'Inflammation: C3a and C5a, with histamine from mast cells and cytokines from macrophages, widen the vessel (redness, heat), open gaps between endothelial cells so plasma leaks out (swelling), and call neutrophils in.',
};
const EFF = {
  antibody: 'Antibodies: an activated B cell becomes a plasma cell, an antibody factory packed with rough ER. Its antibodies neutralize viruses by covering the parts they use to enter cells, and coat bacteria so phagocytes and complement can find them.',
  ctl: 'Cytotoxic T cell: the CD8⁺ T cell docks on the infected cell, releases perforin, which forms pores, and granzymes, which enter and switch on caspases. The target dies tidily by apoptosis, and the T cell moves on to the next.',
};
whenLesson('immune-mhc', v => setCaption('immuneMhcCaption', MHC[v]));
whenLesson('immune-comp', v => setCaption('immuneCompCaption', COMP[v]));
whenLesson('immune-effector', v => setCaption('immuneEffCaption', EFF[v]));

const CHAPTERS = [
  {
    id: 'immune-mhc', short: 'MHC presentation', where: 'A presenting cell meets a T cell',
    title: 'MHC class I and class II show peptides to T cells',
    legend: [['mhc1', 'MHC class I · CD8'], ['mhc2', 'MHC class II · CD4'], ['peptide', 'Peptide'], ['lymph', 'T cell'], ['lesion', 'Virus'], ['nadh', 'Bacteria']],
    html: () => `
      <p class="lede">T cells cannot see whole microbes. They read short <b>peptides</b> held up by <b>MHC</b> molecules (called HLA in humans) on other cells. Which MHC holds the peptide decides which T cell answers.</p>
      ${lessonSeg('immune-mhc', 'Pathway', [['class1', 'MHC class I → CD8'], ['class2', 'MHC class II → CD4']])}
      ${caption('immuneMhcCaption', MHC[LESSON['immune-mhc']])}
      <div class="table-wrap"><table class="ledger"><thead><tr><th></th><th>MHC class I</th><th>MHC class II</th></tr></thead><tbody>
        <tr><td>Found on</td><td>Nearly all nucleated cells</td><td>Dendritic cells, macrophages, B cells</td></tr>
        <tr><td>Peptides from</td><td>Proteins made inside the cell (<a href="#proteasome">proteasome</a>, then the <a href="#er">ER</a>)</td><td>Material taken in from outside (endosomes and <a href="#lysosome">lysosomes</a>)</td></tr>
        <tr><td>Read by</td><td>CD8⁺ cytotoxic T cells</td><td>CD4⁺ helper T cells</td></tr>
        <tr><td>Human genes</td><td>HLA-A, -B, -C</td><td>HLA-DR, -DQ, -DP</td></tr>
      </tbody></table></div>
      <ul class="facts">
        <li>A T cell needs a second signal from the presenting cell, a co-stimulatory molecule such as CD80/86 binding CD28, before it activates. Without it the T cell is switched off, which helps prevent autoimmunity.</li>
        <li>Some viruses and tumors hide by removing MHC class I. Natural killer cells notice the missing MHC and kill those cells instead.</li>
        <li>HIV infects CD4⁺ helper T cells. As their count falls, the whole adaptive response weakens.</li>
      </ul>
      <p><a href="#blood/lymph">Meet lymphocytes in the blood line-up</a> · <a href="#immune-effector">What activated T and B cells do next</a></p>
      ${sources([SRC.neefjes, SRC.osT, SRC.osBio], 'The two pathways are drawn in one cell at a time, with a few large MHC molecules. Real cells display many thousands of MHC molecules carrying many different peptides, and dendritic cells can also cross-present outside material on class I.')}`,
  },
  {
    id: 'immune-complement', short: 'Complement & inflammation', where: 'A bacterium in inflamed tissue',
    title: 'Complement tags and kills, inflammation calls for help',
    legend: [['nadh', 'Bacterium'], ['complement', 'C3b'], ['cyp', 'Membrane attack complex'], ['neut', 'Phagocyte'], ['rbc', 'Blood vessel'], ['electron', 'Leaking plasma']],
    html: () => `
      <p class="lede">The <b>complement</b> system is a set of blood proteins that switch each other on in a cascade on a microbe’s surface. With mast cells and macrophages it also triggers <b>acute inflammation</b>.</p>
      ${lessonSeg('immune-comp', 'Show', [['opsonize', 'C3b coating'], ['mac', 'Membrane attack'], ['inflame', 'Inflamed vessel']])}
      ${caption('immuneCompCaption', COMP[LESSON['immune-comp']])}
      <ul class="facts">
        <li>Three routes start the cascade: the <b>classical</b> pathway (antibody bound to a microbe), the <b>lectin</b> pathway (sugars on microbes) and the <b>alternative</b> pathway (spontaneous C3 activation on unprotected surfaces). All meet at C3.</li>
        <li>Host cells carry regulators such as CD55 and CD59 that shut complement down. Without them, as in paroxysmal nocturnal hemoglobinuria, complement destroys <a href="#blood/rbc">red cells</a>.</li>
        <li>Eculizumab blocks C5 and treats such diseases, but it raises the risk of meningococcal infection, so patients are vaccinated first.</li>
        <li>Neutrophils follow C5a and chemokines out of the vessel, using the <a href="#cyto-crawl">adhesion cascade</a>.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Inflamed tissue is busy and glucose hungry, so it takes up FDG on PET. That is useful for finding infection or vasculitis, but it is also a common cause of false-positive cancer scans. See <a href="#cancer-pet">FDG-avid tumors</a>.</p></div>
      ${sources([SRC.ricklin, SRC.osInnate], 'The cascade is shown as its end products only. Complement proteins are far smaller than drawn against the bacterium, and the vessel and bacterium are not to scale with each other.')}`,
  },
  {
    id: 'immune-effector', short: 'Antibodies & killer T cells', where: 'Plasma cell and cytotoxic T cell at work',
    title: 'Antibodies and cytotoxic T cells finish the job',
    legend: [['antibody', 'Antibody'], ['lesion', 'Virus'], ['lymph', 'Plasma cell or T cell'], ['perforin', 'Perforin and granzymes'], ['membrane', 'Infected cell']],
    html: () => `
      <p class="lede">Adaptive immunity has two arms. <b>B cells</b> become plasma cells that release antibodies into body fluids. <b>Cytotoxic T cells</b> kill infected cells directly.</p>
      ${lessonSeg('immune-effector', 'Arm', [['antibody', 'Antibodies'], ['ctl', 'Cytotoxic T cell']])}
      ${caption('immuneEffCaption', EFF[LESSON['immune-effector']])}
      <ul class="facts">
        <li>An antibody is Y-shaped. The two arms (Fab) grip one antigen, and the stem (Fc) is read by phagocytes and complement. IgM is made first; IgG follows, crosses the placenta and gives long-lasting protection.</li>
        <li>After an infection or vaccine, memory B and T cells remain, so a second exposure triggers a faster, stronger response.</li>
        <li>Perforin and granzymes trigger <a href="#apoptosis">apoptosis</a>, so the infected cell is packaged up and cleared without spilling its contents.</li>
        <li>Checkpoint inhibitor drugs block brakes such as PD-1 on T cells so they attack tumors. Their side effects, such as colitis or thyroiditis, can show up as new FDG uptake on PET.</li>
      </ul>
      <p><a href="#blood/lymph">Lymphocytes in the blood</a> · <a href="#cyto-crawl">How immune cells crawl to infection</a> · <a href="#immune-mhc">How T cells recognize targets</a></p>
      ${sources([SRC.osB, SRC.osT, SRC.osBio], 'Antibodies are drawn hundreds of times larger than real relative to the cells, and the killing sequence is compressed from tens of minutes into seconds.')}`,
  },
];

CellCity.register('immune', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, blob, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const virusGeo = new THREE.IcosahedronGeometry(1, 0);
    function virus(parent, r, pos) { const m = new THREE.Mesh(virusGeo, std(C('lesion'), { emissiveIntensity: 0.4, flatShading: true })); m.scale.setScalar(r); m.position.copy(pos); parent.add(m); return m; }
    function antibody(parent, s = 1) {           // a Y: two Fab arms and an Fc stem
      const y = new THREE.Group(), mat = std(C('antibody'), { emissiveIntensity: 0.5 });
      rod(y, mat, V(0, -0.6, 0), V(0, 0, 0), 0.09); rod(y, mat, V(0, 0, 0), V(-0.45, 0.5, 0), 0.09); rod(y, mat, V(0, 0, 0), V(0.45, 0.5, 0), 0.09);
      y.scale.setScalar(s); parent.add(y); return y;
    }
    function mhc(parent, color, pos, normal) {   // MHC as a stalk with a peptide-holding cup
      const gr = new THREE.Group(), mat = std(C(color), { emissiveIntensity: 0.4 });
      rod(gr, mat, V(-0.15, 0, 0), V(-0.15, 0.7, 0), 0.08); rod(gr, mat, V(0.15, 0, 0), V(0.15, 0.7, 0), 0.08);
      const cup = ball(gr, mat, 0.28, V(0, 0.85, 0)); cup.scale.set(0.38, 0.16, 0.28);
      const pep = ball(gr, std(C('peptide'), { emissiveIntensity: 0.6 }), 0.12, V(0, 0.98, 0)); pep.scale.set(0.28, 0.08, 0.1);
      gr.position.copy(pos); gr.quaternion.setFromUnitVectors(V(0, 1, 0), normal.clone().normalize()); parent.add(gr); return { gr, pep };
    }

    /* ================= MHC class I vs class II ================= */
    {
      const id = 'immune-mhc', root = new THREE.Group();
      add(id, root, { target: V(-2.2, 0.3, 0), pos: V(-1, 4, 26), w: 12.5 }, { fade: 'At the immune synapse' });
      const c1 = new THREE.Group(), c2 = new THREE.Group(); root.add(c1); root.add(c2);
      const CELL = V(-6, 0, 0), RAD = 4.2;
      // class I: an ordinary infected cell
      blob(c1, C('membrane'), RAD, CELL, 0.14, 0.04, 2);
      ball(c1, std(C('nucleus')), 1.3, V(-8, 1.2, 0));
      const viruses = [V(-8.5, -1.6, 1), V(-7, -2.4, -1), V(-9, 0, -1.5)].map(p => virus(c1, 0.45, p));
      const prot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 16), std(C('lyso'), { emissiveIntensity: 0.4 })); prot.position.set(-6.2, -1.5, 0.5); prot.rotation.z = 1; c1.add(prot);
      tube(c1, std(C('golgi'), { emissiveIntensity: 0.25 }), [V(-5.8, 1.6, -0.5), V(-4.6, 0.4, 0.5), V(-5, -0.6, -0.4), V(-3.8, -1.4, 0.4)], 0.3);
      const pep1 = stream(c1, std(C('peptide'), { emissiveIntensity: 0.7 }), 0.14, curve([V(-8, -1.8, 0.5), V(-6.2, -1.5, 0.5), V(-5, -0.4, 0.2), V(-4.2, 0.6, 0), V(-2.2, 0.4, 0)]), 6, 0.25, C('peptide'));
      // class II: a dendritic cell with an endosome full of bacteria
      blob(c2, C('mono'), RAD, CELL, 0.14, 0.06, 5);
      const dMat = std(C('mono'), { emissiveIntensity: 0.25, transparent: true, opacity: 0.6 });
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.6; if (Math.cos(a) > 0.5) continue; rod(c2, dMat, CELL.clone().add(V(Math.cos(a) * 3.6, Math.sin(a) * 3.6, 0)), CELL.clone().add(V(Math.cos(a) * 7, Math.sin(a) * 6.4, rr(-1, 1))), 0.35); }
      ball(c2, std(C('nucleus')), 1.3, V(-8, 1.4, 0));
      const endo = body(c2, C('lyso'), 1.3, V(-7, -1.6, 0.8), 0.25);
      const bug = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.8, 4, 10), std(C('nadh'), { emissiveIntensity: 0.4 }));
      [0, 1].forEach(i => { const b = bug.clone(); b.position.set(-7.3 + i * 0.6, -1.6, 0.8); b.rotation.z = i; c2.add(b); });
      const pep2 = stream(c2, std(C('peptide'), { emissiveIntensity: 0.7 }), 0.14, curve([V(-7, -1.6, 0.8), V(-5, -0.8, 0.4), V(-3.4, 0.2, 0), V(-2.2, 0.4, 0)]), 6, 0.25, C('peptide'));
      // MHC molecules on the face toward the T cell
      const slots = [], carriers = [];
      [c1, c2].forEach((grp, i) => { for (let j = -3; j <= 3; j++) { const a = j * 0.22, n = V(Math.cos(a), Math.sin(a), 0), m = mhc(grp, i ? 'mhc2' : 'mhc1', CELL.clone().add(n.clone().multiplyScalar(RAD)), n); if (!j) slots[i] = m; } });
      // each cycle one newly loaded MHC travels from where it picked up its peptide (ER or endosome) to the surface facing the T cell
      const routes = [curve([V(-5.4, 0.9, -0.3), V(-4, 0.5, 0.5), V(-2.9, 0.15, 0.3), V(-1.8, 0, 0)]), curve([V(-7, -1.6, 0.8), V(-5.2, -1.1, 0.7), V(-3.2, -0.3, 0.3), V(-1.8, 0, 0)])];
      [c1, c2].forEach((grp, i) => { carriers[i] = mhc(grp, i ? 'mhc2' : 'mhc1', routes[i].getPointAt(0), V(0, 1, 0)); });
      const qUp = new THREE.Quaternion(), qOut = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(1, 0, 0));
      // the T cell
      const T = new THREE.Group(); root.add(T);
      blob(T, C('lymph'), 2.6, null, 0.2, 0.035, 7); ball(T, std(C('nucleus')), 1.7, V(0.3, 0, 0));
      const tcrMat = std(C('lymph'), { emissiveIntensity: 0.5 });
      for (let j = -2; j <= 2; j++) { const a = Math.PI + j * 0.3; rod(T, tcrMat, V(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0), V(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0), 0.09); }
      const co1 = new THREE.Group(), co2 = new THREE.Group(); T.add(co1); T.add(co2);
      [[co1, 'mhc1'], [co2, 'mhc2']].forEach(([grp, c]) => [-0.45, 0.45].forEach(o => { const a = Math.PI + o; rod(grp, std(C(c), { emissiveIntensity: 0.5 }), V(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0.3), V(Math.cos(a) * 3.3, Math.sin(a) * 3.3, 0.3), 0.11); }));
      const syn = k.glow(C('peptide'), 4); syn.position.set(-1.9, 0, 0); root.add(syn);
      const cyto = stream(root, std(C('mhc2'), { emissiveIntensity: 0.6 }), 0.14, curve([V(3, 1, 0), V(6, 4, 1), V(10, 6, 0)]), 6, 0.3, C('mhc2'));
      lbl('Infected body cell', 'membrane', c1, V(-6, 4.9, 0), id);
      lbl('Virus', 'lesion', c1, V(-9.8, -2.6, 1), id);
      lbl('Proteasome → TAP → ER', 'lyso', c1, V(-5.4, -3, 1.2), id);
      lbl('MHC class I', 'mhc1', c1, V(-1.4, 2.4, 0), id);
      lbl('Dendritic cell', 'mono', c2, V(-6, 5.6, 0), id);
      lbl('Endosome · digested bacteria', 'lyso', c2, V(-7.4, -3.4, 1), id);
      lbl('MHC class II', 'mhc2', c2, V(-1.4, 2.4, 0), id);
      lbl('CD8⁺ cytotoxic T cell', 'mhc1', co1, V(4, 3.4, 0), id);
      lbl('CD4⁺ helper T cell', 'mhc2', co2, V(4, 3.4, 0), id);
      lbl('Cytokines', 'mhc2', cyto.items[3], V(0, 1.4, 0), id);
      let el = 0;
      function draw(dt) {
        const one = (LESSON['immune-mhc'] || 'class1') === 'class1';
        c1.visible = co1.visible = one; c2.visible = co2.visible = !one;
        el += reduceMotion ? 0 : dt;
        const cyc = el % 7, d = reduceMotion ? 0 : Math.max(0, Math.cos(Math.min(1, cyc / 3) * Math.PI) * 0.5 + 0.5) * (cyc < 5.5 ? 1 : (cyc - 5.5) / 1.5);
        const gap = cyc < 3 ? 1 - cyc / 3 : cyc < 5.5 ? 0 : (cyc - 5.5) / 1.5;
        T.position.set(2.2 + (reduceMotion ? 0 : gap * 4), 0, 0);
        const docked = reduceMotion || gap < 0.05;
        syn.material.opacity = docked ? 0.8 + 0.2 * Math.sin(el * 6) : 0.1;
        cyto.visible = docked && !one; cyto.update(dt);
        (one ? pep1 : pep2).update(dt);
        const i = one ? 0 : 1, travelU = reduceMotion ? 1 : Math.min(1, cyc / 2.6), car = carriers[i];
        car.gr.visible = travelU < 1; slots[i].gr.visible = travelU >= 1;
        car.gr.position.copy(routes[i].getPointAt(travelU)); car.gr.quaternion.slerpQuaternions(qUp, qOut, Math.min(1, travelU * 1.4));
        slots[i].pep.scale.set(0.28 * (docked ? 1.25 + 0.2 * Math.sin(el * 8) : 1), 0.08, 0.1);
        viruses.forEach((v, i) => { v.rotation.x += dt * (0.5 + i * 0.2); v.rotation.y += dt * 0.4; });
        prot.rotation.y += reduceMotion ? 0 : dt * 2; endo.scale.setScalar(1.3 + 0.05 * Math.sin(el * 2)); void d;
      }
      behaviors[id] = { enter() { el = 0; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Complement and inflammation ================= */
    {
      const id = 'immune-complement', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 5, 32), w: 20 }, { fade: 'Into inflamed tissue' });
      const bact = new THREE.Group(); bact.position.set(-5, 2, 0); root.add(bact);
      const bactMesh = new THREE.Mesh(new THREE.CapsuleGeometry(1.5, 3.6, 8, 20), std(C('nadh'), { emissiveIntensity: 0.3, transparent: true, opacity: 0.85 })); bactMesh.rotation.z = Math.PI / 2; bact.add(bactMesh);
      const surf = (i, n) => { const t = (i / n) * 2 - 1, a = i * 2.39996, x = t * 2.9; const r = Math.abs(x) > 1.8 ? Math.sqrt(Math.max(0, 1.5 * 1.5 - (Math.abs(x) - 1.8) ** 2)) : 1.5; return { p: V(x, Math.cos(a) * r, Math.sin(a) * r), n: V(Math.abs(x) > 1.8 ? Math.sign(x) * (Math.abs(x) - 1.8) : 0, Math.cos(a) * r, Math.sin(a) * r).normalize() }; };
      const c3b = new THREE.Group(); bact.add(c3b);
      const c3Mat = std(C('complement'), { emissiveIntensity: 0.6 });
      const c3s = Array.from({ length: 70 }, (_, i) => { const { p, n } = surf(i, 70); return ball(c3b, c3Mat, 0.2, p.add(n.multiplyScalar(0.12))); });
      const mac = new THREE.Group(); bact.add(mac);
      const macMat = std(C('cyp'), { emissiveIntensity: 0.55 });
      const pores = Array.from({ length: 14 }, (_, i) => { const { p, n } = surf(i * 5 + 2, 70); const t = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 8, 16), macMat); t.position.copy(p); t.lookAt(p.clone().add(n)); mac.add(t); return t; });
      const leak = stream(mac, std(C('nadh'), { emissiveIntensity: 0.6 }), 0.1, curve([V(0, 1.4, 0), V(0.4, 2.6, 0.4), V(1, 3.6, 0)]), 8, 0.5);
      const phago = new THREE.Group(); root.add(phago);
      body(phago, C('neut'), 2.4, null, 0.2); ball(phago, std(new THREE.Color(0x6d4bd0), { emissiveIntensity: 0.3 }), 0.8, V(0.4, 0.2, 0));
      const c3in = stream(root, c3Mat, 0.16, curve([V(-12, -2, 2), V(-9, 0, 2), V(-6, 1, 1.8)]), 6, 0.3, C('complement'));
      // the blood vessel
      const vessel = new THREE.Group(); vessel.position.set(0, -5.5, 0); root.add(vessel);
      const wallMat = ghost(C('rbc'), 0.3);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 26, 40, 1, true), wallMat); wall.rotation.z = Math.PI / 2; vessel.add(wall);
      const gaps = [-6, 0, 6].map(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 8, 40), std(C('electron'), { emissiveIntensity: 0.5 })); r.position.x = x; r.rotation.y = Math.PI / 2; vessel.add(r); return r; });
      const plasma = new THREE.Group(); vessel.add(plasma);
      const pMat = std(C('electron'), { emissiveIntensity: 0.5 });
      const drops = Array.from({ length: 18 }, (_, i) => ({ m: ball(plasma, pMat, 0.14), x: [-6, 0, 6][i % 3], a: rr(0, Math.PI * 2), t: rr(0, 1) }));
      const neut = body(vessel, C('neut'), 0.9, V(-4, 0, 0), 0.35);
      const flow = Array.from({ length: 10 }, (_, i) => ball(vessel, std(C('rbc'), { emissiveIntensity: 0.2 }), 0.4, V(-12 + i * 2.6, rr(-0.5, 0.5), rr(-0.5, 0.5))));
      const cMsg = stream(root, std(C('complement'), { emissiveIntensity: 0.6 }), 0.13, curve([V(-4, 0, 1), V(-2, -2.5, 1.5), V(0, -4.2, 1)]), 6, 0.3, C('complement'));
      lbl('Bacterium', 'nadh', bact, V(0, 2.4, 0), id);
      lbl('C3b coat', 'complement', c3b, V(-3.4, -1.6, 1), id);
      lbl('Membrane attack pores', 'cyp', mac, V(2.8, -1.8, 1), id);
      lbl('Phagocyte · C3b receptors', 'neut', phago, V(0, 3, 0), id);
      lbl('Blood vessel', 'rbc', vessel, V(-11, -2, 0), id);
      lbl('Gaps open · plasma leaks', 'electron', plasma, V(8.5, -3.2, 0), id);
      lbl('Neutrophil leaves', 'neut', neut, V(0, -1.6, 0), id);
      const cLbl = new THREE.Group(); root.add(cLbl); lbl('C3a / C5a signals', 'complement', cLbl, V(-6, -1.6, 2), id);
      let el = 0, dil = 1;
      function draw(dt) {
        const v = LESSON['immune-comp'] || 'opsonize';
        el += reduceMotion ? 0 : dt;
        const cyc = el % 8;
        c3b.visible = v !== 'inflame' || true; mac.visible = v === 'mac'; phago.visible = v === 'opsonize'; plasma.visible = v === 'inflame'; cMsg.visible = cLbl.visible = v === 'inflame';
        c3s.forEach((m, i) => { m.visible = v !== 'opsonize' || i < (reduceMotion ? 70 : Math.min(70, cyc / 4 * 70)); });
        c3in.visible = v === 'opsonize'; c3in.update(dt);
        if (v === 'opsonize') { const u = reduceMotion ? 0.6 : Math.min(1, Math.max(0, (cyc - 3) / 4)); phago.position.set(4 - u * 5.4, 2, 0); bact.scale.setScalar(u > 0.85 ? Math.max(0.2, 1 - (u - 0.85) * 5) : 1); }
        else bact.scale.setScalar(v === 'mac' ? 1 - 0.08 * (reduceMotion ? 1 : (cyc / 8)) : 1);
        bactMesh.material.opacity = v === 'mac' ? 0.55 : 0.85;
        leak.update(dt); cMsg.update(dt);
        const want = v === 'inflame' ? 1.7 : 1; dil += (want - dil) * Math.min(1, dt * (reduceMotion ? 99 : 1.5));
        wall.scale.set(dil, 1, dil); gaps.forEach(r => { r.scale.setScalar(dil); r.material.emissiveIntensity = v === 'inflame' ? 0.6 + 0.3 * Math.sin(el * 5) : 0.15; });
        drops.forEach(d => { if (!reduceMotion) d.t = (d.t + dt * 0.4) % 1; const r = dil + d.t * 2.4; d.m.position.set(d.x + Math.sin(d.a) * 0.2, Math.cos(d.a) * r, Math.sin(d.a) * r); });
        neut.visible = v === 'inflame';
        if (neut.visible) { const u = reduceMotion ? 0.7 : (el % 6) / 6; neut.position.set(-4 + u * 4, u < 0.6 ? dil - 0.5 : dil - 0.5 + (u - 0.6) * 6, 0); }
        flow.forEach(f => { if (!reduceMotion) { f.position.x += dt * (v === 'inflame' ? 2 : 5); if (f.position.x > 13) f.position.x = -13; } });
        pores.forEach((p, i) => p.scale.setScalar(1 + 0.15 * Math.sin(el * 4 + i)));
      }
      behaviors[id] = { enter() { el = 0; draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Antibodies and cytotoxic T cells ================= */
    {
      const id = 'immune-effector', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(0, 4, 30), w: 18 }, { fade: 'The effector response' });
      const ab = new THREE.Group(), ct = new THREE.Group(); root.add(ab); root.add(ct);
      // antibody arm
      const plasma = new THREE.Group(); plasma.position.set(-8, 0, 0); ab.add(plasma);
      body(plasma, C('lymph'), [3.2, 2.6, 2.6], null, 0.18); ball(plasma, std(C('nucleus')), 1, V(-1.6, 0.3, 0));
      for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.32, 0.06, 6, 40, Math.PI * 1.2), std(C('golgi'), { emissiveIntensity: 0.3 })); r.position.set(0.6, 0, 0); r.rotation.z = -0.6; plasma.add(r); }
      const vir = [V(4, 2.5, 0), V(6.5, -1, 1), V(3.5, -3, -1), V(8, 2.4, -1)].map(p => ({ m: virus(ab, 0.8, p), home: p.clone() }));
      const host = new THREE.Mesh(new THREE.BoxGeometry(2, 12, 6), ghost(C('membrane'), 0.25)); host.position.set(12, 0, 0); ab.add(host);
      const flying = Array.from({ length: 16 }, (_, i) => ({ y: antibody(ab, 0.9), target: vir[i % 4], off: V(Math.cos(i * 1.7), Math.sin(i * 2.3), Math.sin(i)).normalize().multiplyScalar(1.15), t0: i * 0.35 }));
      lbl('Plasma cell · rough ER', 'lymph', ab, V(-8, 3.1, 0), id);
      lbl('Antibodies', 'antibody', ab, V(-2, 3, 1), id);
      lbl('Neutralized virus', 'lesion', ab, V(4, 4.1, 0), id);
      lbl('Host cell it can no longer enter', 'membrane', ab, V(12, 6.6, 0), id);
      // cytotoxic T cell arm
      const tgt = new THREE.Group(); tgt.position.set(3.5, 0, 0); ct.add(tgt);
      const tBody = body(tgt, C('membrane'), 3.6, null, 0.18); const tNuc = ball(tgt, std(C('nucleus')), 1.3, V(1, 0.6, 0));
      const tVir = [V(1.5, -1.5, 1), V(0, 1.8, -1), V(2, 1.5, 1.2)].map(p => virus(tgt, 0.4, p));
      const blebs = Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return ball(tgt, ghost(C('membrane'), 0.3), 0.7, V(Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0.5)); });
      const ctl = new THREE.Group(); ct.add(ctl);
      body(ctl, C('lymph'), 2.4, null, 0.22); ball(ctl, std(C('nucleus')), 1.4, V(-0.6, 0, 0));
      const gran = Array.from({ length: 6 }, (_, i) => ball(ctl, std(C('perforin'), { emissiveIntensity: 0.6 }), 0.22, V(1 + (i % 2) * 0.5, -1 + i * 0.4, 0.5)));
      const perf = stream(ct, std(C('perforin'), { emissiveIntensity: 0.7 }), 0.14, curve([V(-1.2, 0, 0.4), V(-0.4, 0, 0.6), V(0.6, 0.2, 0.4), V(2, 0.4, 0)]), 8, 0.4, C('perforin'));
      const syn = k.glow(C('perforin'), 3.5); syn.position.set(-0.4, 0, 0); ct.add(syn);
      lbl('CD8⁺ cytotoxic T cell', 'lymph', ct, V(-5, 3, 0), id);
      lbl('Infected cell', 'membrane', ct, V(3.5, 4.2, 0), id);
      lbl('Perforin + granzymes', 'perforin', ct, V(-0.6, -2.2, 1), id);
      const blebLbl = new THREE.Group(); ct.add(blebLbl); lbl('Apoptotic blebs', 'membrane', blebLbl, V(6.5, -3.4, 0), id);
      let el = 0;
      function draw(dt) {
        const v = LESSON['immune-effector'] || 'antibody';
        ab.visible = v === 'antibody'; ct.visible = v === 'ctl';
        el += reduceMotion ? 0 : dt;
        if (ab.visible) {
          const cyc = reduceMotion ? 6 : el % 9;
          flying.forEach(f => { const u = Math.min(1, Math.max(0, (cyc - f.t0) / 2.2)); const from = V(-5, 0, 0), to = f.target.m.position.clone().add(f.off); f.y.position.lerpVectors(from, to, ease.inOut(u)); f.y.visible = cyc > f.t0; f.y.lookAt(f.target.m.position); f.y.rotateX(Math.PI / 2); });
          vir.forEach((w, i) => { const coated = flying.filter(f => f.target === w && cyc - f.t0 > 2.2).length; w.m.position.copy(w.home).add(V(reduceMotion ? 0 : Math.sin(el + i) * 0.3 * (coated ? 0.2 : 1), 0, 0)); w.m.rotation.y += dt * (coated ? 0.1 : 0.8); });
        }
        if (ct.visible) {
          const cyc = reduceMotion ? 5 : el % 10;
          const gap = cyc < 2 ? 1 - cyc / 2 : cyc < 8 ? 0 : (cyc - 8) / 2;
          ctl.position.set(-3.6 - gap * 4, 0, 0);
          const killing = cyc > 2.4 && cyc < 8;
          perf.visible = killing && cyc < 5; perf.update(dt); syn.material.opacity = killing ? 0.85 : 0.1;
          gran.forEach((m, i) => { m.visible = !(killing && cyc > 3 + i * 0.3); });
          const die = Math.min(1, Math.max(0, (cyc - 4.5) / 3));
          tgt.scale.setScalar(1 - die * 0.35); tNuc.scale.setScalar(1.3 * (1 - die * 0.6));
          blebs.forEach((b, i) => { b.visible = die > 0.1; b.scale.setScalar(0.3 + die * (0.5 + 0.2 * Math.sin(el * 3 + i))); }); blebLbl.visible = die > 0.3;
          tVir.forEach(w => { w.rotation.y += dt; });
        } else { blebLbl.visible = false;
        }
      }
      behaviors[id] = { enter() { el = 0; draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
