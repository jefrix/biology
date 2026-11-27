/* Sensory cells: a rod turning light into a drop in glutamate, three cones and color, a cochlear hair cell, and smell.
   Scenes use sceneKit() from shared/core.js; shared choices live in LESSON so captions work without WebGL. */
(() => {
'use strict';
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, limits) => `<p class="credit">Sources: ${items.join(' · ')}. ${limits}</p>`;
const plain = (s) => s.replace(/<[^>]+>/g, '');           // captions are plain text, like the other modules
const caption = (id, text) => `<p id="${id}" class="lesson-phase" aria-live="polite">${plain(text)}</p>`;
function setCaption(id, text) { const el = $('#' + id); text = plain(text); if (el && el.textContent !== text) el.textContent = text; }

/* ================================================================
   Rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
// A rod in the dark, in dim light and in bright light. Values are rounded teaching numbers, not measurements.
function rodState(light) {
  if (light === 'bright') return { cgmp: 0.1, open: 0.05, vm: -65, release: 0.1 };
  if (light === 'dim') return { cgmp: 0.75, open: 0.7, vm: -46, release: 0.7 };
  return { cgmp: 1, open: 1, vm: -40, release: 1 };
}
// Cone pigment peaks in nanometers (isolated human pigments, rounded) and a simple bell-shaped sensitivity.
const CONES = { S: 424, M: 530, L: 560 };
function coneResponse(peak, nm) { const w = peak < 480 ? 28 : 42; return Math.exp(-0.5 * ((nm - peak) / w) ** 2); }
function conesFor(vision) { return vision === 'protan' ? ['S', 'M'] : vision === 'deutan' ? ['S', 'L'] : ['S', 'M', 'L']; }
// Where along the cochlea a pure tone peaks: 0 is the base (stiff, high pitch), 1 the apex. Greenwood's human map.
function cochlearPlace(hz) { const x = Math.log10(hz / 165.4 + 0.88) / 2.1; return Math.max(0, Math.min(1, 1 - x)); }
// Which receptor types an odorant activates: each receptor reads part of a molecule, so odors are codes across receptors.
const ODOR_MAP = { none: [], a: [1, 3], b: [2, 3], ab: [1, 2, 3] };
function activeReceptors(odor) { return ODOR_MAP[odor] || []; }
/*RULES-END*/

const SRC = {
  osVision: link('https://openstax.org/books/biology-2e/pages/36-5-vision', 'OpenStax Biology 2e, 36.5 Vision'),
  osHearing: link('https://openstax.org/books/biology-2e/pages/36-4-hearing-and-vestibular-sensation', 'OpenStax Biology 2e, 36.4 Hearing and Vestibular Sensation'),
  osSmell: link('https://openstax.org/books/biology-2e/pages/36-3-taste-and-smell', 'OpenStax Biology 2e, 36.3 Taste and Smell'),
  baylor: link('https://doi.org/10.1073/pnas.93.2.560', 'Baylor, how photons start vision (PNAS, 1996)'),
  oprian: link('https://doi.org/10.1021/bi00112a002', 'Oprian et al., the three human color vision pigments (Biochemistry, 1991)'),
  kuo: link('https://doi.org/10.3390/ijms242015247', 'Kuo et al., prevalence of congenital color vision deficiency (Int J Mol Sci, 2023)'),
  fettiplace: link('https://doi.org/10.1002/cphy.c160049', 'Fettiplace, hair cell transduction, tuning and synaptic transmission (Compr Physiol, 2017)'),
  fettiplaceKim: link('https://doi.org/10.1152/physrev.00038.2013', 'Fettiplace &amp; Kim, mechanoelectrical transduction channels (Physiol Rev, 2014)'),
  nin: link('https://doi.org/10.1073/pnas.1120067109', 'Nin et al., the cochlear K⁺ circulation and endocochlear potential (PNAS, 2012)'),
  greenwood: link('https://doi.org/10.1121/1.399052', 'Greenwood, a cochlear frequency-position function (J Acoust Soc Am, 1990)'),
  buck: link('https://doi.org/10.1016/0092-8674(91)90418-x', 'Buck &amp; Axel, a multigene family encoding odorant receptors (Cell, 1991)'),
  zozulya: link('https://doi.org/10.1186/gb-2001-2-6-research0018', 'Zozulya et al., the human olfactory receptor repertoire (Genome Biol, 2001)'),
  ano2: link('https://doi.org/10.1073/pnas.0903304106', 'Stephan et al., ANO2 as the olfactory chloride channel (PNAS, 2009)'),
};

const LIGHT = {
  dark: 'Dark: cGMP is high and holds the channels in the outer segment open. Sodium (and some calcium) flows in all the time, the <b>dark current</b>, so the rod sits fairly depolarized, near −40 mV, and releases glutamate steadily onto its bipolar cell.',
  dim: 'Dim light: now and then a single photon is caught. It flips retinal inside one rhodopsin, which switches on many transducin molecules; each turns on a phosphodiesterase that breaks down cGMP. Nearby channels close, and one photon makes a small, reliable dip in the current.',
  bright: 'Bright light: so many rhodopsins are active that cGMP collapses and nearly all the channels close. The rod hyperpolarizes toward −65 mV and its glutamate release almost stops. Rods saturate in daylight, which is why cones take over.',
};
whenLesson('sense-light', v => setCaption('senseLightCaption', LIGHT[v]));

const NAMES = { S: 'S (short, blue)', M: 'M (middle, green)', L: 'L (long, red)' };
function colorCaption() {
  const nm = +(LESSON['sense-hue'] || 540), vision = LESSON['sense-vision'] || 'normal', have = conesFor(vision);
  const parts = Object.keys(CONES).map(k => have.includes(k) ? `${k} ${Math.round(coneResponse(CONES[k], nm) * 100)}%` : `${k} missing`).join(' · ');
  const note = vision === 'normal'
    ? 'The brain reads color from the <b>ratio</b> between the three cone types, not from any one of them.'
    : vision === 'protan'
      ? 'Without L cones (<b>protan</b> type), only S and M remain. Long wavelengths look dim, and reds and greens that differ mainly in their L signal can look alike.'
      : 'Without M cones (<b>deutan</b> type, the most common), only S and L remain, so greens, yellows and reds that differ mainly in their M signal are hard to tell apart.';
  return `Light at <b>${nm} nm</b>: ${parts}. ${note}`;
}
whenLesson('sense-hue', () => setCaption('senseColorCaption', colorCaption()));
whenLesson('sense-vision', () => setCaption('senseColorCaption', colorCaption()));

const PITCH = { low: 200, mid: 2000, high: 12000 };
function hairCaption() {
  const hz = PITCH[LESSON['sense-pitch'] || 'mid'], place = cochlearPlace(hz), damaged = (LESSON['sense-bundle'] || 'healthy') === 'damaged';
  const where = place < 0.3 ? 'near the stiff, narrow <b>base</b>' : place > 0.7 ? 'near the floppy, wide <b>apex</b>' : 'in the <b>middle</b> of the coil';
  const tone = `A ${hz >= 1000 ? hz / 1000 + ' kHz' : hz + ' Hz'} tone makes the basilar membrane vibrate most ${where}, about ${Math.round(place * 100)}% of the way from base to apex. Hair cells there respond most.`;
  return tone + (damaged
    ? ' <b>Damaged bundle:</b> with tip links broken and stereocilia splayed, deflection no longer pulls channels open, so this cell sends almost nothing. In mammals, lost cochlear hair cells do not grow back.'
    : ' Each push toward the tallest stereocilia stretches the <b>tip links</b> and opens channels at their tips. Potassium rushes in from the endolymph, the cell depolarizes and releases glutamate onto its nerve fiber. Pushing the other way closes them.');
}
whenLesson('sense-pitch', () => setCaption('senseHairCaption', hairCaption()));
whenLesson('sense-bundle', () => setCaption('senseHairCaption', hairCaption()));

const ODOR = {
  none: 'Clean air: the receptor neurons fire only a little at rest, and the glomeruli are quiet.',
  a: 'Odorant A binds receptor types 1 and 3. Only the neurons that carry those receptors fire, and their axons light up two glomeruli. That pattern is what “A” smells like.',
  b: 'Odorant B binds receptor types 2 and 3. Type 3 responds to both odorants, but the overall pattern, glomeruli 2 and 3, is different, so B smells different.',
  ab: 'A mixture activates all three types. Because each odor is a combination code across receptors, a few hundred receptor types can tell apart a vast number of smells.',
};
whenLesson('sense-odor', v => setCaption('senseOdorCaption', ODOR[v]));

const CHAPTERS = [
  {
    id: 'sense-rod', short: 'Rods & light', where: 'One rod photoreceptor in the retina',
    title: 'A rod turns light into less glutamate',
    legend: [['acetyl', 'Rhodopsin discs'], ['atp', 'Photon'], ['nadh', 'cGMP'], ['sodium', 'Na⁺ dark current'], ['glu', 'Glutamate'], ['dendrite', 'Bipolar cell']],
    html: () => `
      <p class="lede">Rods are the retina’s night-vision cells, sensitive enough to respond to a single photon. Oddly, light makes them <b>less</b> active: they hyperpolarize and release less transmitter.</p>
      ${lessonSeg('sense-light', 'Light', [['dark', 'Dark'], ['dim', 'Dim (single photons)'], ['bright', 'Bright']])}
      ${caption('senseLightCaption', LIGHT[LESSON['sense-light'] || 'dark'])}
      <ol class="lesson-sequence">
        <li><b>Catch.</b> Rhodopsin is a protein (opsin) holding a light-sensitive molecule, retinal. A photon changes retinal’s shape from <i>cis</i> to <i>trans</i>, which switches rhodopsin on.</li>
        <li><b>Amplify.</b> Active rhodopsin switches on the G protein <b>transducin</b> again and again. Transducin turns on <b>phosphodiesterase</b>, which breaks down cGMP.</li>
        <li><b>Close.</b> As cGMP falls, cGMP-gated channels in the outer segment close, the inward current drops and the cell hyperpolarizes.</li>
        <li><b>Signal.</b> Less glutamate reaches the bipolar cell. The retina’s own circuits then turn that change into spikes to the brain.</li>
      </ol>
      <ul class="facts">
        <li>The outer segment is a stack of membrane discs packed with rhodopsin, a G-protein-coupled receptor like those in <a href="#sig-gpcr">signal transduction</a>.</li>
        <li>Falling calcium during light speeds the resynthesis of cGMP and turns the response off, which lets rods adapt.</li>
        <li>Spent retinal is recycled with help from the pigment epithelium, which needs vitamin A. Vitamin A deficiency causes night blindness.</li>
      </ul>
      ${sources([SRC.osVision, SRC.baylor], 'The rod is drawn short and wide, with far fewer discs than the hundreds it really has. The membrane voltages are rounded teaching values.')}`,
  },
  {
    id: 'sense-color', short: 'Cones & color', where: 'Three cone types side by side',
    title: 'Three cones, every color',
    legend: [['cone-s', 'S cone'], ['cone-m', 'M cone'], ['cone-l', 'L cone'], ['atp', 'Incoming light']],
    html: () => `
      <p class="lede">Cones work in bright light and give us color. Each of the three types carries a different opsin, tuned to short, middle or long wavelengths. Pick a color of light and watch how strongly each cone answers.</p>
      ${lessonSeg('sense-hue', 'Light', [['450', 'Blue 450 nm'], ['500', 'Cyan 500 nm'], ['540', 'Green 540 nm'], ['580', 'Yellow 580 nm'], ['620', 'Red 620 nm']], '540')}
      ${lessonSeg('sense-vision', 'Color vision', [['normal', 'Typical (3 cones)'], ['protan', 'No L cones'], ['deutan', 'No M cones']])}
      ${caption('senseColorCaption', colorCaption())}
      <ul class="facts">
        <li>The isolated human cone pigments absorb best at about <b>424, 530 and 560 nm</b>. Rods peak near 500 nm and do not contribute to color.</li>
        <li>The M and L opsin genes sit side by side on the X chromosome and are very alike, so they are easily lost or fused. Red-green color deficiency is therefore far more common in males: studies report roughly 3% of boys and men in Taiwan and Saudi Arabia, and higher figures elsewhere.</li>
        <li>Cones crowd the <b>fovea</b>, the center of the retina used for sharp detail. Rods dominate the periphery, which is why a faint star is easier to see slightly off center.</li>
      </ul>
      ${sources([SRC.osVision, SRC.oprian, SRC.kuo], 'The sensitivity curves are simple bell shapes fitted to the pigment peaks, so the percentages are approximate. The 3D cones are schematic, and the swatch only roughly matches each wavelength.')}`,
  },
  {
    id: 'sense-hair', short: 'Hair cells', where: 'An inner hair cell and the cochlea',
    title: 'Hair cells turn vibration into voltage',
    legend: [['sense', 'Hair cell'], ['electron', 'Stereocilia'], ['atp', 'Tip links and channels'], ['potassium', 'K⁺ from endolymph'], ['glu', 'Glutamate'], ['dendrite', 'Auditory nerve fiber']],
    html: () => `
      <p class="lede">Sound becomes a traveling wave along the basilar membrane in the cochlea. Hair cells sitting on it carry bundles of <b>stereocilia</b> that bend by mere nanometers, and that tiny bend opens ion channels directly, with no second messenger.</p>
      ${lessonSeg('sense-pitch', 'Tone', [['low', 'Low 200 Hz'], ['mid', 'Middle 2 kHz'], ['high', 'High 12 kHz']], 'mid')}
      ${lessonSeg('sense-bundle', 'Hair bundle', [['healthy', 'Healthy'], ['damaged', 'Damaged']])}
      ${caption('senseHairCaption', hairCaption())}
      <ul class="facts">
        <li>Stereocilia stand in rows of rising height. Fine <b>tip links</b> join each to its taller neighbor, and the transduction channels sit at their lower ends.</li>
        <li>The fluid bathing the bundle, <b>endolymph</b>, is rich in potassium and held about 80 mV positive, so opening the channels drives potassium <i>in</i> and depolarizes the cell, the reverse of most cells.</li>
        <li><b>Inner hair cells</b>, in a single row, send most of the signal to the brain. <b>Outer hair cells</b>, in three or four rows, change length with their voltage using the motor protein prestin, amplifying faint sounds about a hundredfold.</li>
        <li>Loud noise and some drugs, such as aminoglycoside antibiotics, can permanently destroy hair cells.</li>
      </ul>
      ${sources([SRC.osHearing, SRC.fettiplace, SRC.fettiplaceKim, SRC.nin, SRC.greenwood], 'The bundle has far fewer stereocilia than the roughly 50 to 100 of a real hair cell, the cochlea is drawn uncoiled, and the place map is an approximation for humans. The vibration is slowed by many thousands of times.')}`,
  },
  {
    id: 'sense-smell', short: 'Smell', where: 'Olfactory epithelium and bulb',
    title: 'One receptor per neuron, one odor per pattern',
    legend: [['or1', 'Receptor type 1'], ['or2', 'Receptor type 2'], ['or3', 'Receptor type 3'], ['odor-a', 'Odorant A'], ['odor-b', 'Odorant B'], ['membrane', 'Mucus and support cells']],
    html: () => `
      <p class="lede">High in the nose, millions of olfactory neurons dip hair-like cilia into mucus. Each neuron makes just <b>one</b> type of odorant receptor, and all neurons with the same receptor send their axons to the same small knot in the brain, a <b>glomerulus</b>.</p>
      ${lessonSeg('sense-odor', 'Smell', [['none', 'Clean air'], ['a', 'Odorant A'], ['b', 'Odorant B'], ['ab', 'A + B mix']])}
      ${caption('senseOdorCaption', ODOR[LESSON['sense-odor'] || 'none'])}
      <ol class="lesson-sequence">
        <li><b>Bind.</b> An odorant binds a receptor, a G-protein-coupled receptor, on the cilia.</li>
        <li><b>Amplify.</b> The G protein G<sub>olf</sub> switches on adenylyl cyclase, and cAMP rises.</li>
        <li><b>Depolarize.</b> cAMP opens cation channels that let in sodium and calcium. Calcium then opens chloride channels (ANO2). These neurons keep extra chloride inside, so chloride flows <i>out</i> and boosts the depolarization.</li>
        <li><b>Sort.</b> Spikes run up through the cribriform plate to the olfactory bulb, where each glomerulus collects one receptor type.</li>
      </ol>
      <ul class="facts">
        <li>Linda Buck and Richard Axel found the huge family of odorant receptor genes in 1991. Humans have about <b>350</b> working ones, and many more broken copies.</li>
        <li>Olfactory neurons are among the few neurons that are replaced throughout life, made by stem cells in the epithelium.</li>
        <li><b>Taste</b> works differently: sweet, bitter and umami use G-protein-coupled receptors, while salty and sour act through ion channels. Taste cells are replaced every one to two weeks.</li>
      </ul>
      ${sources([SRC.osSmell, SRC.buck, SRC.zozulya, SRC.ano2], 'Three receptor types stand in for hundreds, and the odorant–receptor pairings are invented to show the principle. Real glomeruli number in the thousands.')}`,
  },
];

CellCity.register('senses', {
  chapters: CHAPTERS,
  build(g) {
    const k = sceneKit(g), { C, std, ghost, ball, rod, tube, body, blob, add, lbl, stream, curve, V } = k;
    const { behaviors } = k.out;
    const R = mulberry32(1717);
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const mix = (a, b, u) => a + (b - a) * u;
    const glowBall = (parent, color, r, pos) => { const m = ball(parent, std(color, { emissiveIntensity: 0.8 }), r, pos); m.add(k.glow(color, r * 7)); return m; };

    /* ================= Rod ================= */
    {
      const id = 'sense-rod', root = new THREE.Group();
      add(id, root, { target: V(0, 0, 0), pos: V(7, 3, 26), w: 12 }, { fade: 'Into a rod photoreceptor' });
      const memb = C('membrane');
      const outer = body(root, memb, [1.8, 4.6, 1.8], V(0, 5, 0), 0.12);                    // outer segment
      const discs = [];
      for (let i = 0; i < 16; i++) {
        const d = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.12, 32), std(C('acetyl'), { emissiveIntensity: 0.2, transparent: true, opacity: 0.85 }));
        d.position.set(0, 1.4 + i * 0.48, 0); root.add(d); discs.push(d);
      }
      rod(root, std(memb, { emissiveIntensity: 0.3 }), V(0, 0.5, 0), V(0, 1.1, 0), 0.25);            // connecting cilium
      body(root, memb, [1.6, 2.2, 1.6], V(0, -1.6, 0), 0.14);                                   // inner segment
      for (let i = 0; i < 6; i++) ball(root, std(C('mito'), { emissiveIntensity: 0.35 }), 0.32, V(rr(-0.8, 0.8), -0.9 + rr(-0.8, 0.8), rr(-0.6, 0.6))).scale.set(0.7, 0.35, 0.35);
      body(root, C('nucleus'), [1.1, 1.4, 1.1], V(0, -4.6, 0), 0.35);
      body(root, memb, [1.2, 1.4, 1.2], V(0, -4.6, 0), 0.1);
      tube(root, std(memb, { emissiveIntensity: 0.3 }), [V(0, -6, 0), V(0, -7, 0)], 0.3);
      body(root, memb, [1.3, 0.8, 1.3], V(0, -7.6, 0), 0.2);                                    // synaptic terminal
      const bip = new THREE.Group(); root.add(bip);
      tube(bip, std(C('dendrite'), { emissiveIntensity: 0.35 }), [V(-2.5, -11.5, 0), V(-0.8, -9.6, 0.2), V(0, -8.7, 0)], 0.18);
      tube(bip, std(C('dendrite'), { emissiveIntensity: 0.35 }), [V(2.4, -11.6, 0.3), V(0.7, -9.6, 0), V(0.2, -8.7, 0)], 0.15);
      // channels on the outer segment, each with an inflow of sodium
      const chans = [], flows = [];
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2, y = 1.8 + (i % 4) * 1.8, p = V(Math.cos(a) * 1.8, y, Math.sin(a) * 1.8);
        chans.push(ball(root, std(C('sodium'), { emissiveIntensity: 0.6 }), 0.16, p));
        const s = stream(root, std(C('sodium'), { emissiveIntensity: 0.7 }), 0.09, curve([p.clone().multiplyScalar(1.9).setY(y), p.clone().multiplyScalar(1.3).setY(y), V(p.x * 0.5, y, p.z * 0.5)]), 3, 0.9);
        flows.push(s);
      }
      const cgmp = Array.from({ length: 46 }, () => { const home = V(rr(-1.2, 1.2), rr(1.3, 8.8), rr(-1.2, 1.2)); return { m: ball(root, std(C('nadh'), { emissiveIntensity: 0.6 }), 0.09, home), home, ph: R() * 6.28 }; });
      const glu = stream(root, std(C('glu'), { emissiveIntensity: 0.7 }), 0.11, curve([V(0, -8.1, 0), V(0.3, -8.5, 0.2), V(0.1, -8.9, 0)]), 6, 0.8);
      const photon = glowBall(root, C('atp'), 0.18, V(0, 0, 0));
      lbl('Outer segment · rhodopsin discs', 'acetyl', root, V(-3.4, 8.2, 0), id);
      lbl('cGMP-gated channels · Na⁺ in', 'sodium', root, V(3.6, 6, 0), id);
      lbl('Inner segment · mitochondria', 'mito', root, V(-3.2, -1.4, 0), id);
      lbl('Nucleus', 'nucleus', root, V(2.4, -4.6, 0), id);
      lbl('Synaptic terminal · glutamate', 'glu', root, V(3.4, -7.6, 0), id);
      lbl('Bipolar cell', 'dendrite', bip, V(-3, -11.4, 0), id);
      const vmL = lbl('Rod at about −40 mV', 'fg', root, V(0, 11, 0), id);
      let el = 0, shot = -1, hit = null, st = rodState('dark');
      function draw(dt) {
        const v = LESSON['sense-light'] || 'dark', target = rodState(v);
        el += reduceMotion ? 0 : dt;
        const kk = Math.min(1, dt * 2.5 + (reduceMotion ? 1 : 0));
        st = { cgmp: mix(st.cgmp, target.cgmp, kk), open: mix(st.open, target.open, kk), vm: mix(st.vm, target.vm, kk), release: mix(st.release, target.release, kk) };
        // photons: occasional in dim light, constant in bright light
        const period = v === 'bright' ? 0.35 : 2.4, n = Math.floor(el / period);
        if (v !== 'dark' && n !== shot) { shot = n; hit = { disc: discs[Math.floor(R() * discs.length)], t0: el }; }
        const age = hit ? el - hit.t0 : 99;
        photon.visible = v !== 'dark' && age < 0.5;
        if (photon.visible && hit) photon.position.set(mix(-6, 0, age / 0.5), hit.disc.position.y, mix(3, 0, age / 0.5));
        discs.forEach(d => { const lit = (v === 'bright') || (hit && d === hit.disc && age > 0.45 && age < 2); d.material.emissiveIntensity = lit ? 0.9 : 0.2; });
        cgmp.forEach((c, i) => {
          let on = i / cgmp.length < st.cgmp;
          if (v === 'dim' && hit && age > 0.5 && age < 2 && Math.abs(c.home.y - hit.disc.position.y) < 0.9) on = false;   // a local dip around the caught photon
          c.m.visible = on;
          if (!reduceMotion) c.m.position.copy(c.home).add(V(Math.sin(el * 1.3 + c.ph) * 0.15, Math.cos(el * 1.1 + c.ph) * 0.15, 0));
        });
        const openN = Math.round(st.open * chans.length);
        chans.forEach((c, i) => { c.material.emissiveIntensity = i < openN ? 0.8 : 0.08; });
        flows.forEach((s, i) => { s.visible = i < openN; s.update(dt); });
        glu.speed = 0.25 + 0.9 * st.release; glu.items.forEach((m, i) => { m.visible = i < Math.round(st.release * glu.items.length); }); glu.update(dt);
        outer.children[1].material.uniforms.uColor.value.copy(memb.clone().lerp(C('dendrite'), clamp((-st.vm - 40) / 25)));
        const t = `Rod at about ${Math.round(st.vm)} mV`; const sp = vmL.el.querySelector('span'); if (sp.textContent !== t) sp.textContent = t;
      }
      behaviors[id] = { enter() { el = 0; shot = -1; st = rodState(LESSON['sense-light'] || 'dark'); draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Cones and color ================= */
    {
      const id = 'sense-color', root = new THREE.Group();
      add(id, root, { target: V(0, 0.5, 0), pos: V(3, 4, 27), w: 12 }, { fade: 'Among the cones' });
      const KEYS = ['S', 'M', 'L'], cols = { S: C('cone-s'), M: C('cone-m'), L: C('cone-l') }, grey = new THREE.Color(0x5b6474);
      const cones = KEYS.map((key, i) => {
        const x = -5 + i * 5, grp = new THREE.Group(); grp.position.x = x; root.add(grp);
        const os = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3.6, 32, 1, true), std(cols[key], { emissiveIntensity: 0.2, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
        os.position.y = 3; grp.add(os);
        for (let d = 0; d < 7; d++) { const r = 0.95 - d * 0.12, disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.07, 24), std(cols[key], { emissiveIntensity: 0.35 })); disc.position.y = 1.5 + d * 0.45; grp.add(disc); }
        body(grp, C('membrane'), [1.4, 1.8, 1.4], V(0, -0.5, 0), 0.14);
        body(grp, C('nucleus'), [0.8, 0.9, 0.8], V(0, -2.8, 0), 0.35);
        tube(grp, std(C('membrane'), { emissiveIntensity: 0.3 }), [V(0, -3.6, 0), V(0, -5.2, 0)], 0.22);
        const term = body(grp, C('membrane'), [0.9, 0.5, 0.9], V(0, -5.6, 0), 0.25);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 1.4), std(cols[key], { emissiveIntensity: 0.6 })); grp.add(bar);
        const halo = k.glow(cols[key], 6); halo.position.y = 3; grp.add(halo);
        return { key, grp, os, bar, halo, term };
      });
      const photons = Array.from({ length: 18 }, (_, i) => glowBall(root, C('atp'), 0.12, V(0, 0, 0)));
      const swatch = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), new THREE.MeshBasicMaterial({ color: 0xffffff })); swatch.position.set(9.5, 9.5, 0); root.add(swatch);
      KEYS.forEach((key, i) => lbl(`${key} cone · ${CONES[key]} nm`, 'cone-' + key.toLowerCase(), cones[i].grp, V(0, i === 1 ? -8.1 : -7, 0), id));
      lbl('Light', 'atp', swatch, V(0, 1.2, 0), id);
      lbl('Bar height: how strongly each cone responds', 'fg', root, V(0, 12.8, 0), id);
      // approximate display color for a wavelength (a common visible-spectrum mapping)
      function nmColor(nm) {
        let r = 0, gr = 0, b = 0;
        if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { gr = (nm - 440) / 50; b = 1; } else if (nm < 510) { gr = 1; b = (510 - nm) / 20; }
        else if (nm < 580) { r = (nm - 510) / 70; gr = 1; } else if (nm < 645) { r = 1; gr = (645 - nm) / 65; } else r = 1;
        return new THREE.Color(r, gr, b);
      }
      let el = 0;
      function draw(dt) {
        const nm = +(LESSON['sense-hue'] || 540), have = conesFor(LESSON['sense-vision'] || 'normal'), light = nmColor(nm);
        el += reduceMotion ? 0 : dt;
        swatch.material.color.copy(light);
        cones.forEach(c => {
          const on = have.includes(c.key), resp = on ? coneResponse(CONES[c.key], nm) : 0;
          const tint = on ? cols[c.key] : grey;
          c.os.material.color.copy(tint); c.os.material.emissive.copy(tint); c.os.material.emissiveIntensity = 0.15 + resp * 0.9;
          c.halo.visible = on && resp > 0.05; c.halo.material.opacity = resp; c.halo.material.color.copy(tint);
          const h = 0.15 + resp * 5; c.bar.scale.y = h; c.bar.position.y = 6.6 + h / 2; c.bar.visible = on;
          c.term.scale.setScalar(on ? 1 + 0.15 * resp * Math.sin(el * 6) : 1);
        });
        photons.forEach((p, i) => {
          const u = ((el * 0.7 + i / photons.length) % 1), x = -5 + (i % 3) * 5;
          p.position.set(x + Math.sin(i) * 0.4, mix(12, 4.6, u), Math.cos(i) * 0.4); p.visible = !reduceMotion || i < 3;
          p.material.color.copy(light); p.material.emissive.copy(light); p.children[0].material.color.copy(light);
        });
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Hair cell ================= */
    {
      const id = 'sense-hair', root = new THREE.Group();
      add(id, root, { target: V(3, 0.3, 0), pos: V(5, 4, 28), w: 11.5 }, { fade: 'Into the cochlea' });
      const cell = blob(root, C('sense'), [1.9, 3.2, 1.9], V(-3.5, -1.5, 0), 0.22, 0.03, 4);
      body(root, C('nucleus'), [0.9, 1, 0.9], V(-3.5, -2.6, 0), 0.4);
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.18, 32), std(C('membrane'), { emissiveIntensity: 0.25 })); plate.position.set(-3.5, 1.6, 0); root.add(plate);
      // the hair bundle: four rows of rising height, joined tip to side by tip links, pivoting at their base
      const bundle = new THREE.Group(); bundle.position.set(-3.5, 1.7, 0); bundle.scale.setScalar(1.35); root.add(bundle);
      const ROWS = [1.1, 1.8, 2.5, 3.2], COLS = 5, sMat = std(C('electron'), { emissiveIntensity: 0.25 });
      const cilia = [], links = [], chans = [];
      ROWS.forEach((h, r) => {
        for (let c = 0; c < COLS; c++) {
          const piv = new THREE.Group(); piv.position.set(-0.75 + r * 0.5, 0, -0.8 + c * 0.4); bundle.add(piv);
          const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, h, 10), sMat); m.position.y = h / 2; piv.add(m);
          cilia.push({ piv, r, c, h });
          if (r < ROWS.length - 1) {
            const ch = ball(piv, std(C('atp'), { emissiveIntensity: 0.3 }), 0.07, V(0, h, 0)); chans.push(ch);
            const link = new THREE.Mesh(k.rodGeo, std(C('atp'), { emissiveIntensity: 0.5 })); bundle.add(link); links.push({ link, r, c });
          }
        }
      });
      const kIn = Array.from({ length: 24 }, () => ball(root, std(C('potassium'), { emissiveIntensity: 0.7 }), 0.08));
      const kHome = kIn.map(() => V(rr(-0.8, 0.8), rr(0, 1), rr(-0.8, 0.8)));
      const ribbon = ball(root, std(C('glu'), { emissiveIntensity: 0.5 }), 0.22, V(-3.2, -4.6, 0.3)); ribbon.scale.set(0.5, 1.4, 0.5);
      const fiberPts = [V(-3, -4.9, 0.4), V(-2, -5.8, 0.6), V(0.5, -6.6, 0.2), V(4, -6.9, 0)];
      tube(root, std(C('dendrite'), { emissiveIntensity: 0.3 }), fiberPts, 0.16);
      const spikes = stream(root, std(C('dendrite'), { emissiveIntensity: 1 }), 0.14, curve(fiberPts), 4, 0.8, C('dendrite'));
      const gluS = stream(root, std(C('glu'), { emissiveIntensity: 0.8 }), 0.09, curve([V(-3.2, -4.7, 0.3), V(-3.1, -5, 0.5), V(-3, -5.2, 0.5)]), 4, 1.2);
      // the basilar membrane, uncoiled: narrow and stiff at the base (left), wide and floppy at the apex (right)
      const BM = { x0: 2, x1: 13, y: 3.5, n: 90 };
      const bmGeo = new THREE.PlaneGeometry(BM.x1 - BM.x0, 1, BM.n, 1), bmPos = bmGeo.attributes.position, base = bmPos.array.slice();
      for (let i = 0; i < bmPos.count; i++) { const u = (base[i * 3] + (BM.x1 - BM.x0) / 2) / (BM.x1 - BM.x0); base[i * 3 + 1] *= mix(0.6, 2.4, u); }
      const bm = new THREE.Mesh(bmGeo, std(C('membrane'), { emissiveIntensity: 0.3, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
      bm.position.set((BM.x0 + BM.x1) / 2, BM.y, 0); bm.rotation.x = -1.1; root.add(bm);
      const peak = glowBall(root, C('atp'), 0.16, V(0, 0, 0));
      lbl('Inner hair cell', 'sense', root, V(-1, -1.4, 0), id);
      lbl('Stereocilia · tip links', 'atp', root, V(-7, 4.6, 0), id);
      lbl('Endolymph · rich in K⁺', 'potassium', root, V(-3.5, 7.8, 0), id);
      lbl('Ribbon synapse', 'glu', root, V(-5.4, -5.4, 0), id);
      lbl('Auditory nerve fiber', 'dendrite', root, V(3.6, -7.8, 0), id);
      lbl('Base · high pitch', 'electron', root, V(BM.x0 + 0.5, BM.y - 1.6, 0), id);
      lbl('Apex · low pitch', 'electron', root, V(BM.x1 - 2.2, BM.y - 2.4, 0), id);
      lbl('Basilar membrane, uncoiled', 'membrane', root, V((BM.x0 + BM.x1) / 2, BM.y + 2.2, 0), id);
      const VIS = { low: 1.1, mid: 1.8, high: 2.8 };                          // on-screen vibration, slowed enormously
      let el = 0;
      function draw(dt) {
        const pitch = LESSON['sense-pitch'] || 'mid', damaged = (LESSON['sense-bundle'] || 'healthy') === 'damaged', place = cochlearPlace(PITCH[pitch]);
        el += reduceMotion ? 0 : dt;
        const ph = el * VIS[pitch] * Math.PI * 2, swing = reduceMotion ? 0.12 : 0.16 * Math.sin(ph);
        const open = damaged ? 0.02 : clamp(0.1 + swing / 0.16 * 0.9);                // about a tenth open at rest
        cilia.forEach(s => { s.piv.rotation.z = -swing - (damaged ? (s.c - 2) * 0.12 + 0.25 * Math.sin(s.r * 2 + s.c) : 0); s.piv.visible = !(damaged && (s.r + s.c) % 3 === 0); });
        bundle.updateMatrixWorld(true);
        links.forEach(({ link, r, c }) => {
          link.visible = !damaged;
          if (damaged) return;
          const a = cilia.find(s => s.r === r && s.c === c), b = cilia.find(s => s.r === r + 1 && s.c === c);
          const pa = V(0, a.h, 0).applyMatrix4(a.piv.matrix), pb = V(0, a.h + 0.35, 0).applyMatrix4(b.piv.matrix);
          k.setRod(link, pa, pb, 0.022);
        });
        chans.forEach(ch => { ch.material.emissiveIntensity = 0.15 + open * 1.2; });
        kIn.forEach((m, i) => { const u = (el * 0.8 + i / kIn.length) % 1; m.visible = !damaged && i < open * kIn.length; m.position.set(-3.5 + kHome[i].x, mix(7, 1.6, u), kHome[i].z); });
        cell.children[1].material.uniforms.uI.value = 0.8 + open * 0.9;
        gluS.visible = open > 0.15; gluS.update(dt);
        spikes.speed = 0.4 + open * 1.2; spikes.visible = open > 0.3; spikes.update(dt);
        // traveling wave: grows toward its characteristic place, then dies away just beyond it
        const bp = bmPos.array;
        for (let i = 0; i < bmPos.count; i++) {
          const u = (base[i * 3] + (BM.x1 - BM.x0) / 2) / (BM.x1 - BM.x0);
          const env = u < place ? Math.pow(u / Math.max(place, 0.02), 2.2) : Math.exp(-(((u - place) / 0.05) ** 2));
          bp[i * 3 + 1] = base[i * 3 + 1]; bp[i * 3 + 2] = 0.55 * env * Math.sin(ph - u * 22);
        }
        bmPos.needsUpdate = true; bmGeo.computeVertexNormals();
        peak.position.set(mix(BM.x0, BM.x1, place), BM.y + 0.9, 0.2);
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }

    /* ================= Smell ================= */
    {
      const id = 'sense-smell', root = new THREE.Group();
      add(id, root, { target: V(0, 0.5, 0), pos: V(4, 3, 27), w: 12.5 }, { fade: 'Up into the nose' });
      // mucus at the bottom, neurons in the epithelium, axons up through the cribriform plate into the bulb
      const mucus = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 5), ghost(C('membrane'), 0.18)); mucus.position.y = -6.2; root.add(mucus);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(18, 0.6, 5), std(new THREE.Color(0xd9d2c0), { emissiveIntensity: 0.1, transparent: true, opacity: 0.55 })); plate.position.y = 2.4; root.add(plate);
      const TYPES = [1, 2, 3, 2, 1, 3, 2, 3, 1], tc = { 1: C('or1'), 2: C('or2'), 3: C('or3') };
      const GLOM = { 1: V(-5, 7.4, 0), 2: V(0, 8, 0), 3: V(5, 7.4, 0) };
      const neurons = TYPES.map((t, i) => {
        const x = -8 + i * 2, grp = new THREE.Group(); root.add(grp);
        body(grp, tc[t], [0.55, 0.85, 0.55], V(x, -2, 0), 0.4);
        tube(grp, std(tc[t], { emissiveIntensity: 0.3 }), [V(x, -2.8, 0), V(x, -4.4, 0), V(x, -5.4, 0)], 0.09);
        for (let c = 0; c < 4; c++) tube(grp, std(tc[t], { emissiveIntensity: 0.3 }), [V(x, -5.4, 0), V(x + (c - 1.5) * 0.4, -6.1, (c % 2 - 0.5) * 0.6), V(x + (c - 1.5) * 0.7, -6.6, (c % 2 - 0.5) * 1)], 0.03);
        const axon = curve([V(x, -1.2, 0), V(x, 2.4, 0), V(mix(x, GLOM[t].x, 0.6), 5.2, 0.4), GLOM[t].clone().add(V(0, -0.9, 0))]);
        tube(grp, std(tc[t], { emissiveIntensity: 0.25 }), axon.points, 0.05);
        const spike = stream(grp, std(tc[t], { emissiveIntensity: 1 }), 0.12, axon, 2, 0.7, tc[t]);
        return { t, x, grp, spike };
      });
      for (let i = 0; i < 8; i++) body(root, C('membrane'), [0.35, 1.3, 0.35], V(-7 + i * 2, -3.2, -1), 0.12);   // supporting cells
      for (let i = 0; i < 6; i++) ball(root, std(C('stem'), { emissiveIntensity: 0.3 }), 0.25, V(-7.5 + i * 3, 0.4, -0.8));   // basal stem cells
      const gloms = Object.fromEntries([1, 2, 3].map(t => [t, blob(root, tc[t], 1.15, GLOM[t], 0.35, 0.08, t)]));
      const odor = { a: [], b: [] };
      ['a', 'b'].forEach(o => { for (let i = 0; i < 9; i++) { const m = new THREE.Group(); root.add(m); [[0, 0, 0], [0.22, 0.12, 0], [-0.18, 0.16, 0.1]].forEach(p => ball(m, std(C('odor-' + o), { emissiveIntensity: 0.7 }), 0.11, V(...p))); m.userData = { x: rr(-8.5, 8.5), z: rr(-1.5, 1.5), ph: R() }; odor[o].push(m); } });
      lbl('Mucus and cilia', 'membrane', root, V(-7.4, -7.6, 0), id);
      lbl('Olfactory neurons', 'or1', root, V(-6.6, -0.6, 0), id);
      lbl('Basal stem cells', 'stem', root, V(7.2, 0.9, 0), id);
      lbl('Cribriform plate', 'electron', root, V(6.8, 3.3, 0), id);
      [1, 2, 3].forEach(t => lbl('Glomerulus ' + t, 'or' + t, gloms[t], V(0, 1.6, 0), id));
      lbl('Air · odorants', 'odor-a', root, V(6.4, -9.2, 0), id);
      let el = 0;
      function draw(dt) {
        const o = LESSON['sense-odor'] || 'none', act = activeReceptors(o);
        el += reduceMotion ? 0 : dt;
        ['a', 'b'].forEach(key => odor[key].forEach((m, i) => {
          const show = o === key || o === 'ab';
          m.visible = show;
          const u = (el * 0.18 + m.userData.ph) % 1;
          m.position.set(m.userData.x + Math.sin(el + i) * 0.3, mix(-9.5, -6.4, u), m.userData.z); m.rotation.y += dt;
        }));
        neurons.forEach(n => {
          const on = act.includes(n.t);
          n.spike.visible = on || (Math.sin(el * 0.7 + n.x) > 0.96);              // a little spontaneous firing
          n.spike.speed = on ? 1.1 : 0.5; n.spike.update(dt);
        });
        [1, 2, 3].forEach(t => { const on = act.includes(t); gloms[t].children[1].material.uniforms.uI.value = on ? 1.6 + 0.4 * Math.sin(el * 6) : 0.6; gloms[t].scale.setScalar(on ? 1.15 + 0.05 * Math.sin(el * 6) : 1.15); });
      }
      behaviors[id] = { enter() { draw(0); }, tick(t, dt) { draw(dt); } };
    }
    return k.out;
  },
});
})();
