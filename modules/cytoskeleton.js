/* Cytoskeleton and cell motility: the three filament systems, motor proteins, and a white blood cell leaving a vessel.
   Scenes use the atlas camera, lighting, labels and chapter lifecycle. Shared choices live in LESSON (see shared/core.js). */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const SRC = {
  osCyto: link('https://openstax.org/books/biology-2e/pages/4-5-the-cytoskeleton', 'OpenStax Biology 2e, 4.5 The Cytoskeleton'),
  osMuscle: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation', 'OpenStax Anatomy &amp; Physiology 2e, 10.3'),
  osInnate: link('https://openstax.org/books/anatomy-and-physiology-2e/pages/21-2-barrier-defenses-and-the-innate-immune-response', 'OpenStax Anatomy &amp; Physiology 2e, 21.2 Innate immune response'),
  mitchison: link('https://doi.org/10.1038/312237a0', 'Mitchison &amp; Kirschner, dynamic instability of microtubule growth (Nature, 1984)'),
  vale: link('https://doi.org/10.1016/S0092-8674(03)00111-9', 'Vale, the molecular motor toolbox for intracellular transport (Cell, 2003)'),
  ley: link('https://doi.org/10.1038/nri2156', 'Ley et al., the leukocyte adhesion cascade updated (Nat Rev Immunol, 2007)'),
  alberts: '<i>Alberts et al., Molecular Biology of the Cell</i>, cytoskeleton chapter',
};
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${text}</p>`;
function setCaption(id, text) { const el = $('#' + id); if (el && el.textContent !== text) el.textContent = text; }

const MT_MODES = {
  dynamic: 'Dynamic instability: the tube grows while GTP-tubulin caps its + end, then suddenly loses the cap, peels apart and shrinks, until a rescue lets it grow again.',
  taxol: 'A paclitaxel-like drug binds the lattice and stabilizes it. The microtubule stops shrinking, and a dividing cell cannot remodel its spindle, so it stalls in mitosis.',
  colchicine: 'A colchicine- or vinca-like drug binds free tubulin so it cannot add on. The microtubule shrinks away and stays short.',
};
const MOTOR_TEXT = {
  all: 'Kinesin walks toward the + end, dynein toward the − end, and myosin V along actin. Each step is driven by one ATP.',
  kinesin: 'Kinesin-1 takes 8 nm steps toward the microtubule + end, hand over hand. One head stays bound while the other swings forward, so it can travel far without falling off.',
  dynein: 'Cytoplasmic dynein walks toward the − end, near the center of the cell. Its two large rings of AAA+ domains bind and use ATP; small stalks reach down to the track.',
  myosin: 'Myosin V walks along actin toward the + (barbed) end in long strides of about 36 nm, carrying cargo near the cell surface. Muscle myosin II instead pulls actin filaments in a sarcomere.',
};
const CRAWL = [
  ['Rolling', 'Selectins on the inflamed vessel lining grab sugar-bearing ligands on the neutrophil and let go again, so the cell tumbles slowly along the wall instead of racing past.'],
  ['Arrest', 'Chemokines on the lining switch the neutrophil’s integrins (such as LFA-1) to a high-affinity shape. They lock onto ICAM-1 and the cell stops and flattens.'],
  ['Crawling', 'The cell polarizes. At the front, Arp2/3 builds a branched actin mesh that pushes out a flat lamellipodium. At the back, myosin II contracts and pulls the tail (uropod) along.'],
  ['Diapedesis', 'The neutrophil squeezes between two endothelial cells, mostly through the junction, and its lobed nucleus deforms to fit. Some cells go through an endothelial cell instead.'],
  ['Chemotaxis', 'In the tissue it steers up a chemical gradient, such as bacterial peptides, complement C5a and the chemokine CXCL8 (IL-8), and engulfs the bacteria.'],
];
const CRAWL_T = [0, 4, 6, 9.5, 12.5, 16];

const CHAPTERS = [
  {
    id: 'cyto-filaments', short: 'Filaments', where: 'Three filament systems · nanometer scale',
    title: 'Actin, microtubules and intermediate filaments',
    legend: [['tubulin', 'Microtubule (α/β-tubulin)'], ['atp', 'GTP cap'], ['ifil', 'Intermediate filament'], ['actin', 'Actin (new ATP-actin is brighter)']],
    html: () => `
      <p class="lede">The cytoskeleton is the cell’s roads, rails and scaffolding. Three kinds of protein filament do different jobs. Two of them have a built-in direction, with a <b>+ end</b> that grows fastest and a <b>− end</b>.</p>
      ${lessonSeg('cyto-mt', 'Microtubule drug', [['dynamic', 'None'], ['taxol', 'Paclitaxel-like'], ['colchicine', 'Colchicine-like']])}
      ${caption('cytoMtCaption', MT_MODES[LESSON['cyto-mt']])}
      <div class="table-wrap"><table class="ledger"><thead><tr><th>Filament</th><th>Width</th><th>Built from</th><th>Main jobs</th></tr></thead><tbody>
        <tr><td>Microtubule</td><td>25 nm hollow tube</td><td>α/β-tubulin dimers, 13 protofilaments</td><td>Long-distance tracks, mitotic spindle, cilia and flagella</td></tr>
        <tr><td>Intermediate filament</td><td>about 10 nm rope</td><td>Keratins, vimentin, neurofilaments, nuclear lamins</td><td>Tensile strength, anchoring cell junctions</td></tr>
        <tr><td>Actin filament</td><td>about 7 nm</td><td>Two twisted strands of actin</td><td>Cell cortex, microvilli, crawling, muscle contraction, cell division</td></tr>
      </tbody></table></div>
      <ul class="facts">
        <li><b>Microtubules</b> grow from the centrosome near the nucleus, so their − ends sit in the middle of the cell and their + ends reach toward its edge. GTP-tubulin adds at the + end and later hydrolyzes its GTP. While a <b>GTP cap</b> remains the tube is stable; lose it and the curved GDP-tubulin protofilaments peel apart. Switching between growth and rapid shrinkage is called <b>dynamic instability</b>.</li>
        <li><b>Actin</b> filaments add ATP-actin at the + (barbed) end and lose ADP-actin from the − (pointed) end. When both happen at the same rate the filament keeps its length while subunits flow through it, called <b>treadmilling</b>.</li>
        <li><b>Intermediate filaments</b> have no polarity and no motors. They are the cell’s ropes. Mutations in skin keratins cause epidermolysis bullosa simplex, in which the skin blisters after minor friction.</li>
        <li>Drugs that freeze microtubules (taxanes) or prevent their assembly (vinca alkaloids) are used in chemotherapy because a cell cannot finish <a href="#mitosis">mitosis</a> without a working spindle. Colchicine, used for gout, blocks neutrophil microtubules.</li>
      </ul>
      <p><a href="#cell">See the cytoskeleton in the cell city tour</a> · <a href="#cyto-motors">Watch motors walk on these tracks</a></p>
      ${sources([SRC.osCyto, SRC.mitchison, SRC.alberts], 'Filaments are drawn at their true relative widths (1 scene unit = 5 nm) but far shorter than real ones, which reach many micrometers. Growth and shrinkage are sped up, and intermediate filaments are drawn as a simple twisted rope.')}`,
  },
  {
    id: 'cyto-motors', short: 'Motor proteins', where: 'Motors on their tracks · nanometer scale',
    title: 'Motor proteins walk on ATP',
    legend: [['kinesin', 'Kinesin → + end'], ['dynein', 'Dynein → − end'], ['myosin', 'Myosin V on actin'], ['atp', 'ATP used per step']],
    html: () => `
      <p class="lede">Motor proteins turn the chemical energy of ATP into steps along a filament. Each family walks in one direction only, so the polarity of the track decides where cargo goes.</p>
      ${lessonSeg('cyto-motor', 'Show', [['all', 'All motors'], ['kinesin', 'Kinesin'], ['dynein', 'Dynein'], ['myosin', 'Myosin V']])}
      ${lessonSeg('cyto-atp', 'Fuel', [['on', 'ATP available'], ['off', 'No ATP']])}
      ${caption('cytoMotorCaption', LESSON['cyto-atp'] === 'off' ? 'Without ATP the motors stay locked onto their tracks and stop.' : MOTOR_TEXT[LESSON['cyto-motor']])}
      <ol class="lesson-sequence">
        <li><b>Bind.</b> A head with ADP binds the track weakly, then releases ADP and binds tightly.</li>
        <li><b>Swing.</b> ATP binding and hydrolysis change the shape of the head and its lever or neck. That swings the partner head forward, or pulls the filament.</li>
        <li><b>Release.</b> Releasing phosphate and ADP resets the head for the next step. About one ATP is spent per step.</li>
      </ol>
      <ul class="facts">
        <li><b>Kinesins</b> mostly carry vesicles, organelles and mRNA outward toward + ends at the cell edge or the end of an axon. Kinesin-1 moves at roughly 1 µm per second.</li>
        <li><b>Dyneins</b> carry cargo inward toward − ends, such as endosomes on their way to lysosomes. Axonemal dyneins bend cilia and sperm flagella.</li>
        <li><b>Myosins</b> walk on actin. Myosin V carries cargo short distances under the membrane. <b>Myosin II</b> forms bipolar thick filaments that slide actin in muscle and pinch a dividing cell in two.</li>
        <li>No ATP leaves myosin locked onto actin. That is why muscles stiffen in rigor mortis after death.</li>
      </ul>
      <p><a href="#axon">See kinesin and dynein in axonal transport</a> · <a href="#muscle-contraction">See myosin II pull actin in a sarcomere</a> · <a href="#cyto-crawl">Watch a whole cell crawl</a></p>
      ${sources([SRC.vale, SRC.osCyto, SRC.osMuscle], 'Motors are simplified to their heads, necks and a shortened tail, with cargo drawn far smaller than a real vesicle. Steps are slowed and perfectly regular. Real motors pause, detach, and work in teams, sometimes in a tug-of-war on the same cargo. 1 scene unit = 4 nm.')}`,
  },
  {
    id: 'cyto-crawl', short: 'Crawling cells', where: 'A small vessel at a site of infection',
    title: 'A neutrophil rolls, crawls and squeezes out',
    legend: [['neut', 'Neutrophil'], ['actin', 'Actin at the leading edge'], ['myosin', 'Myosin II at the tail'], ['membrane', 'Endothelium'], ['nadh', 'Bacteria and chemoattractant']],
    html: () => `
      <p class="lede">White blood cells use the cytoskeleton to leave the bloodstream. Follow a neutrophil through the <b>leukocyte adhesion cascade</b> toward bacteria in the tissue.</p>
      ${lessonSeg('cyto-crawl', 'Step', [['auto', 'Play all'], ...CRAWL.map(([name], i) => [String(i), name])])}
      ${caption('cytoCrawlCaption', LESSON['cyto-crawl'] === 'auto' ? 'Playing all five steps.' : CRAWL[+LESSON['cyto-crawl']][1])}
      <ol class="lesson-sequence">${CRAWL.map(([name, text]) => `<li><b>${name}.</b> ${text}</li>`).join('')}</ol>
      <ul class="facts">
        <li>Crawling is driven at the front by polymerization itself: new actin subunits add against the membrane and push it forward, steered by small GTPases such as Rac and Cdc42. RhoA and myosin II contract the rear.</li>
        <li>In <b>leukocyte adhesion deficiency type 1</b>, the β2 integrin CD18 is missing. Neutrophils roll but cannot arrest, so blood neutrophil counts are high while infections form little pus.</li>
        <li>Monocytes leave vessels the same way and become macrophages in tissue. Lymphocytes use related steps to enter lymph nodes.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>A <b>labeled white cell scan</b> exploits this journey: a patient’s own leukocytes are tagged with a radioactive label, reinjected, and imaged as they migrate into infection. See the <a href="#blood/neut">neutrophil card</a> for the details.</p></div>
      <p><a href="#cell">Back to the cell city tour</a> · <a href="#cyto-filaments">Review actin filaments</a></p>
      ${sources([SRC.ley, SRC.osInnate, SRC.osCyto], 'The scene is not to scale and compresses minutes of migration into seconds. The endothelium is drawn as a single row of cells, and the leading-edge actin mesh is a stylized branched network.')}`,
  },
];

CellCity.register('cytoskeleton', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, glow, fresnelMat, atomGeo, addLabel, tweenTo, fitPose, goStage } = g;
    const groups = {}, poses = {}, behaviors = {}, fog = {}, depth = {}, unitsPerNm = {}, fadeText = {};
    const std = (c, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, emissive: c, emissiveIntensity: 0.25, roughness: 0.5 }, extra));
    const K = {};
    ['tubulin', 'atp', 'ifil', 'actin', 'kinesin', 'dynein', 'myosin', 'neut', 'membrane', 'nadh', 'rbc', 'nucleus', 'cyto'].forEach(k => K[k] = col(k));
    const sphere = new THREE.SphereGeometry(1, 16, 12);
    const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
    const UPV = new V3(0, 1, 0);
    function rod(parent, mat, a, b, r) {
      const m = new THREE.Mesh(rodGeo, mat); parent.add(m); setRod(m, a, b, r); return m;
    }
    function setRod(m, a, b, r) {
      const d = b.clone().sub(a), len = Math.max(0.001, d.length());
      m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(r, len, r);
      m.quaternion.setFromUnitVectors(UPV, d.normalize());
    }
    function ball(parent, mat, r, pos) { const m = new THREE.Mesh(sphere, mat); m.scale.setScalar(r); if (pos) m.position.copy(pos); parent.add(m); return m; }
    const m4 = new THREE.Matrix4(), qI = new THREE.Quaternion(), sc = new V3(), tmpC = new THREE.Color();
    function place(im, i, pos, s) { sc.setScalar(s); m4.compose(pos, qI, sc); im.setMatrixAt(i, m4); }
    function lattice(parent, rows, R, spacing, beadR) {           // a microtubule as 13 protofilaments of alternating α/β-tubulin
      const im = new THREE.InstancedMesh(sphere, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, emissive: 0x16261d }), 13 * rows);
      parent.add(im);
      const alpha = K.tubulin.clone().multiplyScalar(0.62), beta = K.tubulin.clone(), cap = K.atp.clone();
      return {
        im,
        pose(x0, len, opts = {}) {                                 // len = monomers per protofilament; opts.cap, opts.curl
          let n = 0; const p = new V3();
          for (let pf = 0; pf < 13; pf++) {
            const a = pf / 13 * Math.PI * 2, shift = pf * 3 / 13;
            for (let j = 0; j < rows; j++) {
              const along = j + shift;
              if (along > len) break;
              let r = R, x = x0 + along * spacing;
              const fromEnd = len - along;
              if (opts.curl && fromEnd < 5) { const c = (5 - fromEnd) / 5; r += c * c * spacing * 2.2; x -= c * c * spacing * 0.9; }
              p.set(x, Math.cos(a) * r, Math.sin(a) * r);
              place(im, n, p, beadR);
              im.setColorAt(n, opts.cap && fromEnd < 3 ? cap : j % 2 ? beta : alpha);
              n++;
            }
          }
          im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
        },
      };
    }
    function actinTrack(parent, count, rise, beadR, offset) {     // two-stranded actin: one subunit every 2.75 nm, turning about −166.6°
      const im = new THREE.InstancedMesh(sphere, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45, emissive: 0x2a0f18 }), count);
      parent.add(im);
      return {
        im,
        pose(x0, from, to, colorOf) {
          let n = 0; const p = new V3();
          for (let k = Math.ceil(from); k < to && n < count; k++) {
            const a = k * -166.6 * Math.PI / 180;
            p.set(x0 + k * rise, Math.cos(a) * offset, Math.sin(a) * offset);
            place(im, n, p, beadR); im.setColorAt(n, colorOf(k)); n++;
          }
          im.count = n; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
        },
      };
    }
    function add(id, group, pose, fogV = 0.002, unit = 0) {
      groups[id] = group; scene.add(group); fog[id] = fogV; depth[id] = 3; poses[id] = Object.assign({ group: id }, pose);
      if (unit) unitsPerNm[id] = unit;
    }
    const lbl = (text, c, parent, at, id) => addLabel(text, c, parent, at, [id]);

    /* ================= Filaments (1 unit = 5 nm) ================= */
    {
      const id = 'cyto-filaments', root = new THREE.Group();
      add(id, root, { target: new V3(3.5, 0.8, 0), pos: new V3(3, 7, 50), w: 24 }, 0.002, 0.2);
      fadeText[id] = 'Down to the filaments';
      const mtG = new THREE.Group(); mtG.position.y = 6; root.add(mtG);
      const MT_ROWS = 44, X0 = -14, SP = 0.8;
      const mt = lattice(mtG, MT_ROWS, 2.3, SP, 0.44);
      // centrosome side: a soft glow marks where − ends are anchored
      const cent = glow(K.tubulin, 6); cent.position.set(X0 - 1.2, 0, 0); cent.material.opacity = 0.35; mtG.add(cent);
      const ifG = new THREE.Group(); ifG.position.y = 0.6; root.add(ifG);
      for (let s = 0; s < 8; s++) {
        const pts = [];
        for (let i = 0; i <= 80; i++) { const x = X0 + i * 0.4, a = s / 8 * Math.PI * 2 + x * 0.22; pts.push(new V3(x, Math.cos(a) * 0.62, Math.sin(a) * 0.62)); }
        ifG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.2, 6, false), std(K.ifil.clone().multiplyScalar(s % 2 ? 1 : 0.8), { emissiveIntensity: 0.18 })));
      }
      const acG = new THREE.Group(); acG.position.y = -4.2; root.add(acG);
      const ACT_N = 46, RISE = 0.55;
      const actin = actinTrack(acG, ACT_N + 2, RISE, 0.5, 0.42);
      const young = K.actin.clone(), old = K.actin.clone().lerp(new THREE.Color(0x3a2030), 0.55);
      lbl('Microtubule · 25 nm', 'tubulin', mtG, new V3(X0 - 1, 3.8, 0), id);
      lbl('− end', 'tubulin', mtG, new V3(X0 - 2.4, -2.6, 0), id);
      lbl('+ end grows and shrinks', 'tubulin', mtG, new V3(X0 + 30, -3.2, 0), id);
      lbl('Intermediate filament · 10 nm', 'ifil', ifG, new V3(X0 + 4, 1.9, 0), id);
      lbl('Actin filament · 7 nm', 'actin', acG, new V3(X0 + 3, -1.9, 0), id);
      lbl('− end loses ADP-actin', 'actin', acG, new V3(X0 - 1, 1.6, 0), id);
      lbl('+ end adds ATP-actin', 'actin', acG, new V3(X0 + 31, 1.6, 0), id);
      let elapsed = 0, mtLen = 14, shrinking = false, lastMode = null;
      const phaseText = { grow: 'Growing: GTP-tubulin (gold) adds at the + end.', shrink: 'Catastrophe: the GTP cap is gone, protofilaments peel apart and the tube shrinks fast.' };
      function draw(dt) {
        const mode = LESSON['cyto-mt'] || 'dynamic';
        if (mode !== lastMode) { lastMode = mode; setCaption('cytoMtCaption', MT_MODES[mode]); if (mode === 'dynamic') shrinking = false; }
        if (mode === 'dynamic') {
          if (!shrinking) { mtLen += dt * 5.5; if (mtLen >= 38) shrinking = true; }
          else { mtLen -= dt * 22; if (mtLen <= 12) shrinking = false; }
        } else if (mode === 'taxol') { mtLen = Math.min(38, mtLen + dt * 5.5); shrinking = false; }
        else { mtLen = Math.max(5, mtLen - dt * 14); shrinking = mtLen > 5.01; }
        mt.pose(X0, mtLen, { cap: mode !== 'colchicine' && !shrinking, curl: shrinking });
        const s = reduceMotion ? 6 : (elapsed * 3.2) % 24;     // treadmilling window slides toward the + end
        actin.pose(X0, s, s + ACT_N, k => tmpC.copy(old).lerp(young, Math.max(0, 1 - (s + ACT_N - k) / 14)));
        ifG.rotation.x = reduceMotion ? 0 : Math.sin(elapsed * 0.6) * 0.05;
        if (mode === 'dynamic') setCaption('cytoMtCaption', MT_MODES.dynamic + ' ' + phaseText[shrinking ? 'shrink' : 'grow']);
      }
      behaviors[id] = {
        enter() { elapsed = 0; lastMode = null; mtLen = reduceMotion ? 30 : 14; shrinking = false; draw(0); },
        tick(t, dt) { if (!reduceMotion) elapsed += dt; draw(reduceMotion ? 0 : dt); },
      };
    }

    /* ================= Motors (1 unit = 4 nm) ================= */
    {
      const id = 'cyto-motors', root = new THREE.Group();
      add(id, root, { target: new V3(0, -2, 0), pos: new V3(4, 5, 66), w: 30 }, 0.002, 0.25);
      fadeText[id] = 'Onto the tracks';
      const MT_Y = 4, MT_R = 2.9, ACT_Y = -5.5, X0 = -20;
      const mtG = new THREE.Group(); mtG.position.y = MT_Y; root.add(mtG);
      lattice(mtG, 42, MT_R, 1, 0.53).pose(X0, 41, {});
      const acG = new THREE.Group(); acG.position.y = ACT_Y; root.add(acG);
      const tr = actinTrack(acG, 60, 0.69, 0.62, 0.52);
      tr.pose(X0, 0, 60, k => tmpC.copy(K.actin).multiplyScalar(k % 2 ? 0.85 : 0.7));
      lbl('Microtubule', 'tubulin', mtG, new V3(X0 + 2, -4.4, 0), id);
      lbl('− end', 'tubulin', mtG, new V3(X0 - 1.5, 3.4, 0), id); lbl('+ end', 'tubulin', mtG, new V3(X0 + 43, 3.4, 0), id);
      lbl('Actin filament', 'actin', acG, new V3(X0 + 4, -2.4, 2), id);
      lbl('− end', 'actin', acG, new V3(X0 - 1.5, 1.8, 0), id); lbl('+ end', 'actin', acG, new V3(X0 + 42.5, 1.8, 0), id);
      function vesicle(color, r) {
        const v = new THREE.Group();
        v.add(new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false, roughness: 0.4 })));
        v.add(new THREE.Mesh(sphere, fresnelMat(color, 1.1, 2.2)));
        v.scale.setScalar(r); return v;
      }
      // A two-headed walker: heads alternate, one bound while the other swings past it (hand over hand).
      // hang: the motor walks along the underside of its track, with its cargo below (used for myosin V on actin)
      function motor({ color, dir, step, period, from, to, track, headR, ring, lever, cargoR, label, hang }) {
        const sg = hang ? -1 : 1;
        const g = new THREE.Group(); root.add(g);
        const mat = std(color, { emissiveIntensity: 0.32 });
        const heads = [0, 1].map(() => {
          const h = new THREE.Group(); g.add(h);
          if (ring) {
            const t = new THREE.Mesh(new THREE.TorusGeometry(headR, headR * 0.42, 10, 6), mat); h.add(t);
            const stalk = rod(h, mat, new V3(0, -headR * 0.9, 0), new V3(0, -headR * 2.1, 0), 0.12); stalk.userData.keep = true;
          } else {
            const b = ball(h, mat, 1, null); b.scale.set(headR * 1.25, headR * 0.8, headR * 0.85);
          }
          return h;
        });
        const necks = [0, 1].map(() => rod(g, mat, new V3(), new V3(0, 1, 0), lever ? 0.22 : 0.16));
        const stalk = rod(g, std(color.clone().multiplyScalar(0.8)), new V3(), new V3(0, 1, 0), 0.22);
        const cargo = vesicle(color, cargoR); g.add(cargo);
        const spark = glow(K.atp, 2.4); spark.material.opacity = 0; g.add(spark);
        const site = (x) => track(x);
        const span = Math.floor((to - from) / step);
        const lift = ring ? headR * 1.2 : headR * 2.2;
        let lastN = -1;
        const lab = lbl(label, label === 'Kinesin' ? 'kinesin' : label === 'Dynein' ? 'dynein' : 'myosin', cargo, new V3(0, hang ? -1.6 : 1.6, 0), id);
        return {
          g, lab,
          pose(t) {
            const n = Math.floor(t / period), u = t / period - n;
            const k = n % span;
            const base = dir > 0 ? from + step * (k + 1) : to - step * (k + 1);
            const swing = u < 0.55 ? 0 : ease.inOut((u - 0.55) / 0.45);
            const fixed = site(base), a = site(base - dir * step), b = site(base + dir * step);
            const moving = a.clone().lerp(b, swing); moving.y += sg * Math.sin(Math.PI * swing) * lift; moving.z += Math.sin(Math.PI * swing) * lift * 0.5;
            const mv = n % 2, hp = [mv ? fixed : moving, mv ? moving : fixed];
            heads.forEach((h, i) => { h.position.copy(hp[i]); if (ring) h.position.y += headR * 2.1; });
            const top = hp[0].clone().add(hp[1]).multiplyScalar(0.5); top.y += sg * (lever ? lever : (ring ? headR * 4 : headR * 2.4));
            necks.forEach((nk, i) => { const from_ = heads[i].position.clone(); if (ring) from_.y += 0; setRod(nk, from_, top, lever ? 0.22 : 0.16); });
            const stalkTop = top.clone(); stalkTop.y += sg * (ring ? 3 : hang ? 2.2 : 4.2);
            setRod(stalk, top, stalkTop, 0.2);
            cargo.position.copy(stalkTop); cargo.position.y += sg * cargoR * 0.9;
            if (n !== lastN && u >= 0.55) { lastN = n; spark.userData.t0 = t; }
            const since = t - (spark.userData.t0 ?? -9);
            spark.position.copy(moving); spark.material.opacity = since < 0.5 ? (1 - since / 0.5) * 0.9 : 0;
          },
        };
      }
      const onMT = (phi) => (x) => new V3(x, MT_Y + Math.cos(phi) * (MT_R + 0.6), Math.sin(phi) * (MT_R + 0.6));
      const onActin = (x) => new V3(x, ACT_Y - 1.1, 0);
      const motors = {
        kinesin: motor({ color: K.kinesin, dir: 1, step: 2, period: 0.9, from: -18, to: 18, track: onMT(-0.25), headR: 1.1, cargoR: 2.4, label: 'Kinesin' }),
        dynein: motor({ color: K.dynein, dir: -1, step: 2, period: 1.1, from: -18, to: 18, track: onMT(0.75), headR: 1.5, ring: true, cargoR: 2.6, label: 'Dynein' }),
        myosin: motor({ color: K.myosin, dir: 1, step: 9, period: 1.6, from: -18, to: 18, track: onActin, headR: 1.0, lever: 5.5, cargoR: 2.4, label: 'Myosin V', hang: true }),
      };
      let elapsed = 0, lastKey = '';
      function draw() {
        const focus = LESSON['cyto-motor'] || 'all', atp = (LESSON['cyto-atp'] || 'on') === 'on';
        const key = focus + atp;
        if (key !== lastKey) { lastKey = key; setCaption('cytoMotorCaption', atp ? MOTOR_TEXT[focus] : 'Without ATP the motors stay locked onto their tracks and stop. In muscle this is rigor.'); }
        Object.entries(motors).forEach(([k, mo]) => { mo.g.visible = focus === 'all' || focus === k; mo.pose(reduceMotion ? 0.3 : elapsed + (k === 'dynein' ? 0.4 : 0)); });
      }
      behaviors[id] = {
        enter() { elapsed = 0; lastKey = ''; draw(); },
        tick(t, dt) { if (!reduceMotion && (LESSON['cyto-atp'] || 'on') === 'on') elapsed += dt; draw(); },
      };
    }

    /* ================= Crawling neutrophil (not to scale) ================= */
    {
      const id = 'cyto-crawl', root = new THREE.Group();
      add(id, root, { target: new V3(0, -0.6, 0), pos: new V3(-4, 9, 30), w: 18 }, 0.003);
      fadeText[id] = 'To an inflamed venule';
      const GAP = 3;
      const endoMat = std(K.membrane.clone().multiplyScalar(0.75), { emissiveIntensity: 0.05, roughness: 0.75, transparent: true, opacity: 0.92 });
      const endo = [];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
        const x = -19.5 + i * 4.5 + (i >= 5 ? 0.6 : 0), m = ball(root, endoMat, 1, new V3(x, -0.35, j ? -2.1 : 2.1));
        m.scale.set(2.25, 0.42, 2.05); endo.push({ m, x });
        const nuc = ball(root, std(K.nucleus, { emissiveIntensity: 0.15 }), 1, new V3(x, -0.05, j ? -2.1 : 2.1)); nuc.scale.set(0.9, 0.2, 0.7);
        endo[endo.length - 1].nuc = nuc;
      }
      const bm = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), new THREE.MeshBasicMaterial({ color: 0x2a3a4f, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
      bm.rotation.x = -Math.PI / 2; bm.position.y = -1.1; root.add(bm);
      const bugs = new THREE.Group(); bugs.position.set(11.5, -6, 0); root.add(bugs);
      const bugMat = std(K.nadh, { emissiveIntensity: 0.4 });
      for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.7, 4, 8), bugMat); b.position.set(rr(-1, 1), rr(-0.7, 0.7), rr(-1, 1)); b.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3)); bugs.add(b); }
      for (let i = 0; i < 6; i++) { const s = glow(K.nadh, 4 + i * 2.6); s.material.opacity = 0.16 - i * 0.022; s.position.set(-i * 1.2, i * 0.5, 0); bugs.add(s); }
      // flowing red cells above the lining
      const rbcProfile = [];                       // biconcave disc (Evans–Fung thickness profile)
      for (let i = 0; i <= 24; i++) { const x = Math.sin(i / 24 * Math.PI / 2); rbcProfile.push(new THREE.Vector2(x * 1.1, -0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.81 + 7.83 * x * x - 4.39 * x ** 4) * 0.28)); }
      for (let i = 23; i >= 0; i--) { const p = rbcProfile[i]; rbcProfile.push(new THREE.Vector2(p.x, -p.y)); }
      const rbcGeo = new THREE.LatheGeometry(rbcProfile, 32), rbcMat = std(K.rbc, { emissiveIntensity: 0.2, side: THREE.DoubleSide });
      const flow = Array.from({ length: 9 }, (_, i) => { const m = new THREE.Mesh(rbcGeo, rbcMat); m.position.set(-20 + i * 4.6, rr(3.6, 6.2), rr(-2.5, 2.5)); m.rotation.set(rr(0, 3), rr(0, 3), 0); root.add(m); return m; });
      // the neutrophil
      const cell = new THREE.Group(); root.add(cell);
      const body = new THREE.Group(); cell.add(body);
      body.add(new THREE.Mesh(sphere, new THREE.MeshStandardMaterial({ color: K.neut, transparent: true, opacity: 0.22, depthWrite: false, roughness: 0.4 })));
      body.add(new THREE.Mesh(sphere, fresnelMat(K.neut, 1.1, 2.4)));
      const lobeMat = std(new THREE.Color(0x6d4bd0), { emissiveIntensity: 0.3, roughness: 0.7 });
      [[-0.75, 0.2, 0.3], [-0.05, 0.55, -0.35], [0.65, 0.15, 0.25], [0.2, -0.5, -0.1]].forEach(q => ball(body, lobeMat, 0.36, new V3(...q)));
      const R = 2;
      body.scale.setScalar(R);
      const lam = new THREE.Group(); cell.add(lam);
      const lamSheet = ball(lam, new THREE.MeshStandardMaterial({ color: K.neut, transparent: true, opacity: 0.25, depthWrite: false }), 1, new V3(2.1, -1.2, 0)); lamSheet.scale.set(1.9, 0.32, 1.9);
      const meshPts = [];
      const branch = (p, dir, depth_) => {        // Arp2/3 builds branches at about 70° to the mother filament
        const end = p.clone().add(dir.clone().multiplyScalar(0.9 - depth_ * 0.15));
        meshPts.push(p, end);
        if (depth_ < 3) { const a = 70 * Math.PI / 180 * (depth_ % 2 ? 1 : -1); branch(end, dir.clone().applyAxisAngle(new V3(0, 1, 0), a * 0.5), depth_ + 1); branch(end, dir.clone().applyAxisAngle(new V3(0, 1, 0), -a * 0.3), depth_ + 1); }
      };
      for (let i = -3; i <= 3; i++) branch(new V3(1.2, -1.15, i * 0.4), new V3(1, 0, i * 0.12).normalize(), 0);
      const actinMesh = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(meshPts), new THREE.LineBasicMaterial({ color: K.actin, transparent: true, opacity: 0.9 }));
      lam.add(actinMesh);
      const tail = new THREE.Group(); cell.add(tail);
      ball(tail, std(K.neut, { emissiveIntensity: 0.3 }), 0.55, new V3(-2.1, 0.3, 0));
      const tailGlow = glow(K.myosin, 2.6); tailGlow.position.set(-2, 0.2, 0); tail.add(tailGlow);
      lbl('Endothelium', 'membrane', root, new V3(-15, -0.4, 4.4), id);
      lbl('Cell junction', 'membrane', root, new V3(GAP, -0.3, 4.4), id);
      lbl('Bacteria', 'nadh', bugs, new V3(0, -1.6, 0), id);
      lbl('Blood flow →', 'rbc', root, new V3(-12, 7, 0), id);
      lbl('Neutrophil', 'neut', cell, new V3(0, 2.8, 0), id);
      lbl('Lamellipodium · actin', 'actin', lam, new V3(3.6, -0.6, 0), id);
      lbl('Uropod · myosin II', 'myosin', tail, new V3(-2.6, 1.4, 0), id);
      const lerp = (a, b, u) => a + (b - a) * u;
      function poseAt(T) {
        let ph = 0; while (ph < 4 && T >= CRAWL_T[ph + 1]) ph++;
        const u = Math.min(1, (T - CRAWL_T[ph]) / (CRAWL_T[ph + 1] - CRAWL_T[ph])), e = ease.inOut(u);
        const P = { ph, x: 0, y: R, rot: 0, sx: 1, sy: 1, sz: 1, lam: 0, ang: 0, eat: 0 };
        if (ph === 0) { P.x = lerp(-17, -6, u); P.rot = -(P.x + 17) / R; }
        else if (ph === 1) { P.x = -6; P.rot = -11 / R; P.sy = lerp(1, 0.78, e); P.sx = P.sz = lerp(1, 1.12, e); P.y = lerp(R, R * 0.8, e); }
        else if (ph === 2) { P.x = lerp(-6, GAP - 1, e); P.rot = -11 / R; P.sy = 0.72; P.sx = 1.25; P.sz = 1.08; P.y = R * 0.74; P.lam = Math.min(1, u * 3); }
        else if (ph === 3) {
          const y = lerp(R * 0.74, -3.4, e); P.x = lerp(GAP - 1, GAP, Math.min(1, u * 2)); P.y = y; P.rot = -11 / R; P.lam = 1;
          // the cell has turned its front downward, so its local y axis now runs horizontally across the junction
          const squeeze = Math.max(0, 1 - Math.abs(y) / 2.2); P.sy = 1 - 0.4 * squeeze; P.sx = 1 + 0.45 * squeeze; P.sz = 1 - 0.15 * squeeze; P.ang = -Math.PI / 2 * Math.min(1, u * 1.6);
        } else { P.x = lerp(GAP, 9.4, e); P.y = lerp(-3.4, -5.4, e); P.rot = -11 / R; P.lam = 1; P.sx = 1.15; P.sy = 0.85; P.ang = lerp(-Math.PI / 2, -0.25, Math.min(1, u * 2)); P.eat = Math.max(0, (u - 0.75) / 0.25); }
        return P;
      }
      let elapsed = 0, lastKey = '';
      function draw() {
        const step = LESSON['cyto-crawl'] || 'auto';
        let T;
        if (reduceMotion) T = step === 'auto' ? 8 : (CRAWL_T[+step] + CRAWL_T[+step + 1]) / 2;
        else if (step === 'auto') T = elapsed % 17.5;
        else { const k = +step, dur = CRAWL_T[k + 1] - CRAWL_T[k]; T = CRAWL_T[k] + (elapsed % (dur + 1.2)) ; if (T > CRAWL_T[k + 1]) T = CRAWL_T[k + 1] - 0.001; }
        T = Math.min(T, 15.999);
        const P = poseAt(T);
        cell.position.set(P.x, P.y, 0);
        body.rotation.z = P.rot;
        cell.scale.set(P.sx, P.sy, P.sz);
        cell.rotation.z = P.ang;
        lam.visible = P.lam > 0.02; lam.scale.setScalar(Math.max(0.01, P.lam)); actinMesh.material.opacity = 0.55 + 0.45 * Math.sin(elapsed * 6) ** 2;
        tail.visible = P.lam > 0.02;
        bugs.children.forEach((b, i) => { if (i < 6) b.scale.setScalar(Math.max(0.001, 1 - P.eat)); });
        endo.forEach(({ m, x, nuc }) => { const near = P.ph === 3 ? Math.max(0, 1 - Math.abs(P.y) / 3) : 0; const push = x < GAP ? -near * 0.5 : x > GAP ? near * 0.5 : 0; m.position.x = x + push; nuc.position.x = x + push; });
        flow.forEach((f, i) => { if (!reduceMotion) { f.position.x += dtLocal * 5.5; if (f.position.x > 21) f.position.x = -21; f.rotation.x += dtLocal * 1.3; } });
        const key = step === 'auto' ? 'auto' + P.ph : step;
        if (key !== lastKey) { lastKey = key; setCaption('cytoCrawlCaption', `${CRAWL[P.ph][0]}: ${CRAWL[P.ph][1]}`); }
      }
      let dtLocal = 0;
      whenLesson('cyto-crawl', () => { elapsed = 0; });
      behaviors[id] = {
        enter() { elapsed = 0; lastKey = ''; dtLocal = 0; draw(); },
        tick(t, dt) { dtLocal = dt; if (!reduceMotion) elapsed += dt; draw(); },
      };
    }
    return { groups, poses, behaviors, fog, depth, unitsPerNm, fadeText };
  },
});
})();
