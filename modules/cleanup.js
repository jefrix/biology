/* Recycling and cleanup: endocytosis, lysosomes, the proteasome, autophagy, peroxisomes and what happens when they fail. */
(() => {
'use strict';

/* ================================================================
   Rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
// Taking LDL in. Without working receptors it is not captured by this route and stays outside.
function ldlUptake(receptors) {
  return receptors === 'ok' ? { taken: true, outside: 'falls' } : { taken: false, outside: 'builds up' };
}
// pH inside a lysosome. The proton pump keeps it acidic. Values are typical, not measured by this model.
function lysoPH(pumpOn) { return pumpOn ? 4.8 : 7.0; }
// Illustrative share of full activity for an acid-loving enzyme at a given pH (teaching curve, not data).
function enzymeActivity(ph) { return 1 / (1 + Math.pow(10, (ph - 6) * 1.6)); }
// What happens to a protein in the cytosol.
function proteinFate(tag, blocked) {
  if (tag !== 'chain') return 'stays';
  return blocked ? 'piles' : 'degraded';
}
// How strongly bulk autophagy is running.
function autophagyLevel(food) { return food === 'starved' ? 'high' : 'low'; }
// The PINK1 and Parkin route for tagging a damaged mitochondrion.
function mitoRoute(mito, pinkParkin) {
  if (mito === 'healthy') return 'imported';          // PINK1 is taken in and cut, so it does not build up
  return pinkParkin === 'ok' ? 'tagged' : 'untagged';
}
// Hydrogen peroxide made inside the peroxisome.
function peroxide(catalase) { return catalase === 'ok' ? 'cleared' : 'lingers'; }
/*RULES-END*/

const C_ = {
  way: 'receptor', receptors: 'ok',
  pump: 'on', place: 'inside',
  tag: 'chain', blocker: 'no',
  food: 'fed', mito: 'healthy', pink: 'ok',
  catalase: 'ok',
  defect: 'gaucher',
};
const CONTROLS = {
  way: ['Way in', [['receptor', 'Receptor-mediated'], ['phago', 'Phagocytosis'], ['pino', 'Pinocytosis']]],
  receptors: ['LDL receptors', [['ok', 'Working'], ['missing', 'Missing']]],
  pump: ['Proton pump', [['on', 'Running'], ['off', 'Stopped']]],
  place: ['Digestive enzymes', [['inside', 'Inside the lysosome'], ['leaked', 'Leaked into the cytosol']]],
  tag: ['Ubiquitin tag', [['none', 'None'], ['chain', 'Ubiquitin chain']]],
  blocker: ['Proteasome', [['no', 'Working'], ['yes', 'Blocked']]],
  food: ['Nutrients', [['fed', 'Plentiful'], ['starved', 'Starved']]],
  mito: ['Mitochondrion', [['healthy', 'Healthy'], ['damaged', 'Damaged']]],
  pink: ['PINK1 and Parkin', [['ok', 'Working'], ['lost', 'Lost']]],
  catalase: ['Catalase', [['ok', 'Working'], ['missing', 'Missing']]],
};
const seg = (name) => `<div><div class="eyebrow seg-label">${CONTROLS[name][0]}</div><div class="seg" role="group" aria-label="${CONTROLS[name][0]}">${CONTROLS[name][1].map(([v, t]) =>
  `<button type="button" class="btn${C_[name] === v ? ' on' : ''}" data-cv="${name}" data-val="${v}" aria-pressed="${C_[name] === v}">${t}</button>`).join('')}</div></div>`;
const row = (label, value, on) => `<li class="${on ? 'on' : ''}"><span>${label}</span><b>${value}</b></li>`;
const REPLAY = '<button class="btn primary" type="button" data-cact="replay">Replay</button>';

/* Inherited faults. Each one breaks a different part of the service. */
const DEFECTS = {
  gaucher: { name: 'Gaucher disease', gene: 'GBA1', broken: 'A lysosomal enzyme, glucocerebrosidase', builds: 'Glucocerebroside, a fatty molecule', where: 'Inside lysosomes. Liver, spleen, bone and blood-forming cells are affected, and in some types the brain.', link: 'https://medlineplus.gov/genetics/condition/gaucher-disease/', kind: 'store' },
  taysachs: { name: 'Tay-Sachs disease', gene: 'HEXA', broken: 'Part of the enzyme beta-hexosaminidase A', builds: 'GM2 ganglioside, a fatty membrane molecule', where: 'Inside lysosomes of nerve cells in the brain and spinal cord, which are damaged and die.', link: 'https://medlineplus.gov/genetics/condition/tay-sachs-disease/', kind: 'store' },
  pompe: { name: 'Pompe disease', gene: 'GAA', broken: 'The enzyme acid alpha-glucosidase', builds: 'Glycogen, the stored form of glucose', where: 'Inside lysosomes throughout the body, with muscle especially affected.', link: 'https://medlineplus.gov/genetics/condition/pompe-disease/', kind: 'store' },
  icell: { name: 'I-cell disease (mucolipidosis II)', gene: 'GNPTAB', broken: 'The enzyme that starts the mannose-6-phosphate address tag', builds: 'Many large molecules at once', where: 'The digestive enzymes are made but sent outside the cell, so the lysosomes lack them.', link: 'https://medlineplus.gov/genetics/condition/mucolipidosis-ii-alpha-beta/', kind: 'lost' },
  zellweger: { name: 'Zellweger spectrum disorder', gene: 'PEX1 and other PEX genes', broken: 'Proteins needed to build peroxisomes', builds: 'Molecules that peroxisomes normally process, such as very long fatty acids', where: 'Peroxisomes do not form properly. This one is not a lysosomal disease.', link: 'https://medlineplus.gov/genetics/condition/zellweger-spectrum-disorder/', kind: 'perox' },
};
const defectButtons = () => `<div class="seg" role="group" aria-label="Inherited condition">${Object.entries(DEFECTS).map(([k, d]) => `<button type="button" class="btn${C_.defect === k ? ' on' : ''}" data-cv="defect" data-val="${k}" aria-pressed="${C_.defect === k}">${d.name.replace(/ \(.*\)| spectrum disorder| disease/g, '')}</button>`).join('')}</div>`;

const WAYS = {
  receptor: ['Receptor-mediated endocytosis', 'Receptors catch one kind of cargo and gather in a patch. <b>Clathrin</b> builds a cage that bends the patch into a bud, and <b>dynamin</b> pinches it off. The coat comes off, the vesicle joins an <b>endosome</b>, and there the mildly acidic fluid parts LDL from its receptor.'],
  phago: ['Phagocytosis: cell eating', 'The cell wraps its membrane around something large, such as a bacterium, using its actin skeleton. A lysosome then fuses with the new compartment and delivers digestive enzymes. In our bodies this is mainly the work of specialized cells such as <a href="#blood">macrophages and neutrophils</a>.'],
  pino: ['Pinocytosis: cell drinking', 'Small vesicles take in sips of the surrounding fluid and whatever is dissolved in it. It happens all the time and is not very selective. It also takes membrane back in, which balances what <a href="#export">exocytosis</a> adds.'],
};

const READ = {
  intake() {
    const [name, text] = WAYS[C_.way];
    if (C_.way !== 'receptor') return `<p><b>${name}.</b> ${text}</p>`;
    const r = ldlUptake(C_.receptors);
    return `<ol class="chain">${row('LDL taken in by this route', r.taken ? 'yes' : 'no', r.taken)}${row('LDL level outside the cell', r.outside, !r.taken)}</ol><p>${r.taken
      ? text + ' The receptor goes back to the surface to be used again, while LDL moves on to a lysosome that frees its cholesterol.'
      : 'With no working receptors, LDL is not captured and stays in the blood. Faults in the LDL receptor gene are the most common cause of <b>familial hypercholesterolemia</b>, which raises the risk of early heart disease.'}</p>`;
  },
  lysosome() {
    const ph = lysoPH(C_.pump === 'on');
    const leaked = C_.place === 'leaked';
    const here = leaked ? 7.2 : ph, act = enzymeActivity(here);
    return `<div class="tally three"><div style="--c:var(--proton)"><b>${here.toFixed(1)}</b><small>pH around the enzymes</small></div><div style="--c:var(--lyso)"><b>${act > 0.5 ? 'High' : act > 0.15 ? 'Low' : 'Very low'}</b><small>digestion (model)</small></div><div style="--c:var(--atp)"><b>${C_.pump === 'on' ? 'ATP' : 'none'}</b><small>spent pumping</small></div></div><p>${leaked
      ? '<b>A built-in safety catch.</b> These enzymes work best in acid. The cytosol is close to neutral, so enzymes that leak out work poorly there. It lowers the danger but does not remove it: a large leak can still harm the cell.'
      : C_.pump === 'on' ? 'The pump uses ATP to push protons in. In the acid, the enzymes take large molecules apart, and transporters return the small pieces to the cytosol for reuse.'
        : 'With the pump stopped, the inside drifts toward neutral. The enzymes slow right down and undigested material collects.'}</p>`;
  },
  proteasome() {
    const f = proteinFate(C_.tag, C_.blocker === 'yes');
    return `<ol class="chain">${row('1 · Tagged with a ubiquitin chain', C_.tag === 'chain' ? 'yes' : 'no', C_.tag === 'chain')}${row('2 · Unfolded and fed in, using ATP', f === 'degraded' ? 'yes' : 'no', f === 'degraded')}${row('3 · Cut into short peptides', f === 'degraded' ? 'yes' : 'no', f === 'degraded')}</ol><p>${f === 'stays'
      ? 'In this scene the untagged protein drifts past. The tag is the main way a protein is picked out for the proteasome.'
      : f === 'piles' ? '<b>Blocked.</b> Tagged proteins arrive but cannot be destroyed, so they pile up. Drugs that block the proteasome are used against some cancers.'
        : 'The cap recognizes the chain, takes the ubiquitin off to be reused, unfolds the protein and threads it into the central chamber. Other enzymes in the cytosol then trim nearly all the short pieces to single amino acids.'}</p>`;
  },
  autophagy() {
    const lvl = autophagyLevel(C_.food), r = mitoRoute(C_.mito, C_.pink);
    const food = lvl === 'high'
      ? '<b>Starved:</b> the energy sensor AMPK switches on the starter enzyme ULK1. The cell digests some of its own contents for fuel and building blocks.'
      : '<b>Fed:</b> the growth controller mTOR holds ULK1 back, so bulk autophagy stays low. Some still goes on as housekeeping.';
    const mito = r === 'imported' ? 'The healthy mitochondrion pulls <b>PINK1</b> inside, where it is cut and removed.'
      : r === 'tagged' ? 'The damaged mitochondrion has lost its membrane voltage, so <b>PINK1</b> stays on the surface and calls in <b>Parkin</b>. Parkin adds ubiquitin tags, and a membrane wraps the whole organelle. This is <b>mitophagy</b>.'
        : 'Without working PINK1 or Parkin, this damaged mitochondrion is not tagged by this route. Cells have other routes too. Faults in these two genes cause inherited forms of parkinsonism.';
    return `<ol class="chain">${row('Bulk autophagy', lvl, lvl === 'high')}${row('Damaged mitochondrion tagged', r === 'tagged' ? 'yes' : r === 'imported' ? 'not damaged' : 'no', r === 'tagged')}</ol><p>${food}</p><p>${mito}</p>`;
  },
  peroxisome() {
    const p = peroxide(C_.catalase);
    return `<ol class="chain">${row('Very long fatty acid shortened', 'yes', true)}${row('H₂O₂ made as a by-product', 'yes', true)}${row('H₂O₂ cleared by catalase', p === 'cleared' ? 'yes' : 'no', p === 'cleared')}</ol><p>${p === 'cleared'
      ? 'Peroxisomes trim very long fatty acids. Mitochondria handle most of the shorter ones. The first trimming step makes hydrogen peroxide, and <b>catalase</b> next door turns it into water and oxygen.'
      : 'In this scene catalase is missing, so hydrogen peroxide lingers. Real cells have other enzymes that can also remove peroxide, so this shows one part of the defense only.'}</p><div class="eq wrapeq">2 H₂O₂ → 2 H₂O + O₂</div>`;
  },
  storage() {
    const d = DEFECTS[C_.defect];
    return `<p><b>${d.name}</b></p><dl class="organ rs"><dt>Gene</dt><dd>${d.gene}</dd><dt>What is broken</dt><dd>${d.broken}</dd><dt>What builds up</dt><dd>${d.builds}</dd><dt>Where</dt><dd>${d.where}</dd></dl><p class="credit"><a href="${d.link}" target="_blank" rel="noopener">MedlinePlus Genetics page</a></p>`;
  },
};

let current = 'intake', onChange = () => {};
function renderRead() { const el = $('#cRead'); if (el) el.innerHTML = READ[current](); }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cv]');
  if (b) {
    const name = b.dataset.cv;
    C_[name] = b.dataset.val;
    document.querySelectorAll(`[data-cv="${name}"]`).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    const rec = $('#cReceptors'); if (rec) rec.hidden = C_.way !== 'receptor';
    renderRead(); onChange(name);
    return;
  }
  if (e.target.closest('[data-cact="replay"]')) onChange('replay');
});

const panel = (id, inner) => { current = id; return `<div class="lab">${inner}<div class="readout" id="cRead" aria-live="polite">${READ[id]()}</div></div>`; };
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, extra = '') => `<p class="credit">Sources: ${items.join(' · ')}. ${extra}</p>`;
const SRC = {
  fcb: link('https://open.oregonstate.education/cellbiology', 'Dalton &amp; Young, <i>Fundamentals of Cell Biology</i> (CC BY-NC 4.0), ch. 4, summarized and adapted'),
  bol: 'Bolsover et al., <i>Cell Biology</i> (2004)',
  fh: link('https://medlineplus.gov/genetics/condition/familial-hypercholesterolemia/', 'MedlinePlus, familial hypercholesterolemia'),
  prot: link('https://doi.org/10.1016/j.cell.2017.04.023', 'Collins and Goldberg 2017, the 26S proteasome'),
  auto: link('https://doi.org/10.1038/s41580-018-0003-4', 'Dikic and Elazar 2018, mammalian autophagy (abstract)'),
  ulk: link('https://doi.org/10.1038/ncb2152', 'Kim et al. 2011, AMPK, mTOR and ULK1 (abstract)'),
  pink: link('https://doi.org/10.1371/journal.pbio.1000298', 'Narendra et al. 2010, PINK1 and Parkin (abstract)'),
  perox: link('https://doi.org/10.1152/physrev.00051.2021', 'Wanders et al. 2023, human peroxisomes (abstract)'),
  vlcfa: link('https://doi.org/10.1146/annurev.nutr.21.1.193', 'Reddy and Hashimoto 2001, peroxisomal fatty acid oxidation (abstract)'),
  lsd: link('https://doi.org/10.1038/s41572-018-0025-4', 'Platt et al. 2018, lysosomal storage diseases (abstract)'),
};

const CHAPTERS = [
  {
    id: 'intake', short: 'Intake', where: 'The cell’s receiving dock',
    title: 'Bringing things in',
    legend: [['membrane', 'Cell membrane'], ['fat', 'LDL or cargo'], ['fix', 'Receptor'], ['golgi', 'Clathrin coat'], ['gate', 'Dynamin'], ['lyso', 'Lysosome']],
    html: () => `
      <p class="lede">Before a city can recycle anything, it needs a receiving dock. Cells bring material in by folding their own membrane inward to make a bubble. This is <b>endocytosis</b>.</p>
      ${panel('intake', seg('way') + `<div id="cReceptors"${C_.way === 'receptor' ? '' : ' hidden'}>${seg('receptors')}</div>` + REPLAY)}
      <ul class="facts">
        <li>What comes in usually reaches an <b>endosome</b>, a sorting station. Some items go back to the surface and others go on to be digested.</li>
        <li>As endosomes mature they grow more acidic and take on the features of lysosomes.</li>
        <li>Some bacteria, including the one that causes tuberculosis, survive after being swallowed by interfering with this system.</li>
      </ul>
      <p><a href="#lipid-ldl">Follow LDL cholesterol on to statins and PCSK9</a></p>
      ${sources([SRC.fcb, SRC.bol, SRC.fh], 'The 3D scene is schematic, not to scale and much slower than life. Clathrin cages are drawn as dots.')}`,
  },
  {
    id: 'lysosome', short: 'Lysosome', where: 'Inside a lysosome',
    title: 'The recycling center',
    legend: [['lyso', 'Lysosome membrane'], ['proton', 'H⁺'], ['golgi', 'Digestive enzyme'], ['fat', 'Large molecule'], ['glucose', 'Small pieces']],
    html: () => `
      <p class="lede">A lysosome is a bag of acid and digestive enzymes. It takes apart proteins, fats, sugars and nucleic acids, then hands the building blocks back to the cell.</p>
      ${panel('lysosome', seg('pump') + seg('place'))}
      <ul class="facts">
        <li>It holds around <b>40 kinds of digestive enzyme</b>. Its inside is usually about <b>pH 4–5</b>.</li>
        <li>Pumps driven by <b>ATP</b> push protons in to keep it acidic.</li>
        <li>A heavy coat of sugars on the membrane proteins helps protect the membrane from its own contents.</li>
        <li>Newly made enzymes get an address tag, <b>mannose-6-phosphate</b>, in the <a href="#golgi">Golgi</a>. Receptors read it and ship them toward the lysosome.</li>
      </ul>
      ${sources([SRC.fcb, SRC.bol], 'The pH readings and activity levels are a simple teaching model. Real enzymes each have their own pH range.')}`,
  },
  {
    id: 'proteasome', short: 'Proteasome', where: 'A protein shredder in the cytosol',
    title: 'Tag it, then shred it',
    legend: [['membrane', 'Core chamber'], ['golgi', 'Regulatory cap'], ['amino', 'Protein'], ['atp', 'Ubiquitin']],
    html: () => `
      <p class="lede">Cells also destroy proteins one at a time: damaged ones, misfolded ones and ones whose job is finished. A small protein called <b>ubiquitin</b> is the “collect me” sticker, and the <b>proteasome</b> is the shredder.</p>
      ${panel('proteasome', seg('tag') + seg('blocker') + REPLAY)}
      <ul class="facts">
        <li>In growing mammalian cells, this route does <b>at least 80%</b> of protein breakdown.</li>
        <li>Chains linked through one particular spot on ubiquitin (<b>lysine 48</b>) are a classic route to the proteasome. Not every ubiquitin tag means “destroy”.</li>
        <li>The cutting sites are hidden inside the barrel, so a protein must be unfolded to reach them.</li>
        <li>Timed destruction drives the <a href="#cycle">cell cycle</a>: tagging a cyclin for the proteasome switches off its partner kinase.</li>
        <li>A few of the short pieces are displayed on the cell surface for the immune system to inspect.</li>
      </ul>
      ${sources([SRC.prot, SRC.fcb], 'The shape is simplified. The real complex has dozens of protein subunits.')}`,
  },
  {
    id: 'autophagy', short: 'Autophagy', where: 'The cell digesting parts of itself',
    title: 'The demolition and salvage crew',
    legend: [['golgi', 'New membrane'], ['mito', 'Mitochondrion'], ['atp', 'Ubiquitin tag'], ['lyso', 'Lysosome'], ['glucose', 'Salvaged pieces']],
    html: () => `
      <p class="lede">Some things are too big for the shredder. In <b>autophagy</b>, “self-eating”, a new membrane grows around them and delivers the whole package to a lysosome.</p>
      ${panel('autophagy', seg('food') + seg('mito') + seg('pink') + REPLAY)}
      <ul class="facts">
        <li>The steps: a cup-shaped membrane forms → it closes into a double-membraned <b>autophagosome</b> → this fuses with a lysosome → the contents are digested.</li>
        <li>It mainly protects the cell, helping it through shortages and clearing damage.</li>
        <li>Problems with autophagy are studied in cancer and in diseases where nerve cells degenerate.</li>
      </ul>
      <p><a href="#mito-mitophagy">PINK1 and Parkin mitophagy up close</a> · <a href="#mito-dynamics">How fission separates a damaged mitochondrion</a></p>
      ${sources([SRC.auto, SRC.ulk, SRC.pink, SRC.bol], 'Control of autophagy involves many more signals than the two switches shown.')}`,
  },
  {
    id: 'peroxisome', short: 'Peroxisome', where: 'Inside a peroxisome',
    title: 'The chemical processing station',
    legend: [['membrane', 'Peroxisome membrane'], ['fat', 'Fatty acid'], ['gate', 'H₂O₂'], ['golgi', 'Catalase'], ['electron', 'Water and oxygen'], ['mito', 'Mitochondrion']],
    html: () => `
      <p class="lede">Peroxisomes are small compartments, about 500 nm across in human cells, that handle special chemical jobs, many of them involving fats.</p>
      ${panel('peroxisome', seg('catalase') + REPLAY)}
      <ul class="facts">
        <li>They shorten <b>very long fatty acids</b>, working in partnership with <a href="#krebs">mitochondria</a> and other organelles.</li>
        <li>They also help process some branched fatty acids and steps in making bile acids.</li>
        <li>Unlike lysosomes, they do not receive their enzymes from the Golgi. Their proteins are made on free ribosomes and imported afterward.</li>
      </ul>
      ${sources([SRC.bol, SRC.perox, SRC.vlcfa], 'Only two jobs are drawn. The molecules are not to scale.')}`,
  },
  {
    id: 'storage', short: 'Breakdowns', where: 'When the service fails',
    title: 'When cleanup fails',
    legend: [['lyso', 'Lysosome'], ['fat', 'Stored material'], ['golgi', 'Digestive enzyme'], ['membrane', 'Cell'], ['nadh', 'Peroxisome']],
    html: () => `
      <p class="lede">One missing worker can clog the whole service. These inherited conditions each break a different step, and they show why each step matters. Pick one to see its effect on the cell.</p>
      ${panel('storage', defectButtons())}
      <ul class="facts">
        <li>There are more than <b>70 lysosomal storage diseases</b>. Each is rare, but together they affect about 1 in 5,000 live births.</li>
        <li>Most are <b>autosomal recessive</b>: a child inherits a faulty copy from each parent.</li>
        <li>Some have approved treatments, mostly replacing the missing enzyme. Other approaches also exist or are being developed.</li>
      </ul>
      ${sources([SRC.lsd], 'Each condition varies widely between people. This is an explanation of the cell biology, not medical information about anyone’s case.')}`,
  },
];

CellCity.register('cleanup', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, C, fresnelMat, glow, textSprite, atomGeo, atomMat, disposeObj, travel, every, clearAgents, addLabel } = g;
    const P = {};
    ['membrane', 'fat', 'fix', 'golgi', 'gate', 'lyso', 'proton', 'glucose', 'amino', 'atp', 'mito', 'electron', 'nucleus', 'nadh'].forEach(k => P[k] = col(k));
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: color.clone(), emissive: color.clone(), emissiveIntensity: 0.28, roughness: 0.5 }, extra));
    const mesh = (geo, mat, parent, pos, scale) => { const o = new THREE.Mesh(geo, mat); if (pos) o.position.copy(Array.isArray(pos) ? new V3(...pos) : pos); if (scale !== undefined) (Array.isArray(scale) ? o.scale.set(...scale) : o.scale.setScalar(scale)); parent.add(o); return o; };
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const span = (u, a, b) => ease.inOut(clamp((u - a) / (b - a)));
    const mix = (a, b, u) => a + (b - a) * u;
    const randDir = () => new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
    const inBall = (r) => { for (;;) { const v = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)); if (v.lengthSq() <= 1) return v.multiplyScalar(r); } };
    const show = (label, on) => { label.el.dataset.off = on ? '' : '1'; };
    const text = (label, s) => { const el = label.el.querySelector('span'); if (el.textContent !== s) el.textContent = s; };
    function dot(parent, color, r, pos, glowSize = 0) { const o = new THREE.Group(); mesh(atomGeo, atomMat(color), o, null, r); if (glowSize) o.add(glow(color, glowSize)); if (pos) o.position.copy(pos); parent.add(o); return o; }
    function shell(parent, r, color, opacity = 0.07) {
      const gr = new THREE.Group(), geo = new THREE.SphereGeometry(r, 48, 36);
      gr.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color.clone(), transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })), new THREE.Mesh(geo, fresnelMat(color, 1.0, 2.4)));
      gr.userData.rim = gr.children[1].material; gr.userData.fill = gr.children[0].material;
      parent.add(gr); return gr;
    }
    const tintShell = (s, color) => { s.userData.fill.color.copy(color); s.userData.rim.uniforms.uColor.value.copy(color); };
    function say(parent, str, color, at, dur = 2.6, size = 0.9) {
      const sp = textSprite(str, color, size); sp.position.copy(at); sp.material.depthTest = false; sp.renderOrder = 5; parent.add(sp);
      const t0 = now;
      every(t => { const u = (t - t0) / dur; sp.material.opacity = u < 0.75 ? 1 : Math.max(0, (1 - u) / 0.25); if (u >= 1) { disposeObj(sp); return false; } return true; }, sp);
    }
    const fly = (parent, color, r, pts, dur, opts = {}) => { const o = dot(parent, color, r, null, r * 3.4); parent.remove(o); travel(parent, o, pts, dur, Object.assign({ shrinkEnd: true }, opts)); };
    const group = () => { const o = new THREE.Group(); scene.add(o); return o; };

    /* each scene runs on its own clock, restarted when a chapter opens or a control changes */
    const clock = { t0: 0, cues: new Set() };
    const restart = () => { clearAgents(); clock.t0 = now; clock.cues.clear(); };
    const cue = (u, at, name, fn) => { if (u >= at && !clock.cues.has(name)) { clock.cues.add(name); fn(); } };
    function loopTime(t, period) {                     // seconds into the current loop; a still frame if motion is reduced
      if (reduceMotion) return period * 0.62;
      if (t - clock.t0 > period) { clock.t0 = t; clock.cues.clear(); }
      return t - clock.t0;
    }

    /* ================= INTAKE ================= */
    const inGroup = group();
    const MY = 4, NPTS = 90;                          // resting membrane height
    const memGeo = new THREE.BufferGeometry();
    const memPos = new Float32Array(NPTS * 2 * 3);
    memGeo.setAttribute('position', new THREE.BufferAttribute(memPos, 3));
    { const idx = []; for (let i = 0; i < NPTS - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); memGeo.setIndex(idx); }
    mesh(memGeo, new THREE.MeshBasicMaterial({ color: P.membrane.clone(), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), inGroup).frustumCulled = false;
    const beads = Array.from({ length: NPTS * 2 }, () => mesh(atomGeo, atomMat(P.membrane), inGroup, null, 0.17));
    function membrane(points) {                       // points: list of [x, y]; drawn as a ribbon with beaded edges
      const run = [0];                               // distance along the path, so beads stay evenly spaced
      for (let i = 1; i < points.length; i++) run.push(run[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
      for (let i = 0, k = 0; i < NPTS; i++) {
        const s = i / (NPTS - 1) * run[run.length - 1];
        while (k < points.length - 2 && run[k + 1] < s) k++;
        const u = clamp((s - run[k]) / Math.max(1e-6, run[k + 1] - run[k]));
        const x = mix(points[k][0], points[k + 1][0], u), y = mix(points[k][1], points[k + 1][1], u);
        [-1.6, 1.6].forEach((z, j) => { memPos.set([x, y, z], (i * 2 + j) * 3); beads[i * 2 + j].position.set(x, y, z); });
      }
      memGeo.attributes.position.needsUpdate = true;
    }
    function pitPath(depth, neck) {                   // flat membrane with a bud of the given depth; neck 0 open, 1 nearly closed
      const w = 3.4, pts = [[-16, MY], [-w - 1, MY]];
      for (let i = 0; i <= 24; i++) {
        const a = i / 24 * Math.PI, round = Math.sin(a);
        const x = -Math.cos(a) * w * (1 - 0.85 * neck * Math.pow(1 - round, 2));
        pts.push([x, MY - depth * Math.pow(round, 0.75)]);
      }
      pts.push([w + 1, MY], [16, MY]);
      return pts;
    }
    const vesicle = shell(inGroup, 2.5, P.membrane, 0.12);
    const coat = Array.from({ length: 44 }, () => mesh(atomGeo, atomMat(P.golgi), inGroup, null, 0.26));
    const coatDirs = coat.map((_, i) => { const y = 1 - (i + 0.5) / coat.length * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996; return new V3(Math.cos(a) * r, y, Math.sin(a) * r); });
    const dyn = mesh(new THREE.TorusGeometry(1, 0.28, 10, 40), std(P.gate), inGroup); dyn.rotation.x = Math.PI / 2;
    const receptorGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.1, 8);
    const recs = [-2.2, -0.8, 0.8, 2.2].map(x0 => {
      const o = new THREE.Group(); inGroup.add(o);
      mesh(receptorGeo, std(P.fix), o, [0, 0.4, 0]); mesh(atomGeo, std(P.fix), o, [0, 1.05, 0], 0.32);
      return { o, x0 };
    });
    const ldl = [-2.2, -0.8, 0.8, 2.2].map(x0 => ({ o: dot(inGroup, P.fat, 0.62, null, 1.8), x0 }));
    const endo = shell(inGroup, 3.1, P.nucleus, 0.1); endo.position.set(-7.5, -6, 0);
    const lyso = shell(inGroup, 2.7, P.lyso, 0.18); lyso.position.set(8, -6.5, 0);
    for (let i = 0; i < 14; i++) mesh(atomGeo, atomMat(P.golgi), lyso, inBall(1.9), 0.2);
    const germ = new THREE.Group(); inGroup.add(germ);
    mesh(new THREE.CapsuleGeometry(1.1, 2.2, 8, 16), std(P.amino), germ).rotation.z = 1.2;
    const sips = Array.from({ length: 26 }, () => dot(inGroup, P.electron, 0.2, null, 0.7));
    const sipHome = sips.map(() => new V3(rr(-2.4, 2.4), rr(0.6, 4.6), rr(-1.2, 1.2)));
    const inL = {
      mem: addLabel('Cell membrane', 'membrane', inGroup, new V3(-10, MY + 1.1, 0), ['intake']),
      out: addLabel('Outside the cell', 'electron', inGroup, new V3(9, MY + 5, 0), ['intake']),
      cargo: addLabel('LDL', 'fat', inGroup, new V3(5, MY + 2.6, 0), ['intake']),
      endo: addLabel('Endosome', 'nucleus', endo, new V3(0, -4, 0), ['intake']),
      lyso: addLabel('Lysosome', 'lyso', lyso, new V3(0, -3.7, 0), ['intake']),
    };
    function drawReceptor(u) {
      const ok = C_.receptors === 'ok';
      const bind = span(u, 0.4, 2.2), dip = span(u, 2.4, 4.6), pinch = span(u, 4.6, 5.8), free = span(u, 5.8, 6.4);
      const travelV = span(u, 6.4, 8.6), release = span(u, 8.6, 9.8), recycle = span(u, 9.4, 11.6), onward = span(u, 9.8, 12.2);
      const budding = ok && free < 0.02;
      membrane(pitPath(budding ? 4.9 * dip : 0, pinch));
      const center = new V3(0, MY - 2.4, 0).lerp(new V3(0, -2.2, 0), free).lerp(new V3(-6.3, -5.4, 0), travelV);
      vesicle.visible = ok && free > 0.02 && u < 9.4; vesicle.position.copy(center); vesicle.scale.setScalar(mix(1, 0.55, travelV));
      const coatOn = ok ? span(u, 2.4, 3.8) * (1 - span(u, 6.3, 7.4)) : 0;
      coat.forEach((c, i) => {
        const d = coatDirs[i];
        c.visible = coatOn > 0.03 && (d.y < 0.55 || free > 0.02);
        if (free < 0.02) c.position.set(d.x * 3.7, MY - (4.9 * dip + 0.35) * Math.max(0, -d.y * 0.75 + 0.3), d.z * 2.1);
        else c.position.copy(center).addScaledVector(d, mix(2.85, 4.6, 1 - coatOn));
        c.scale.setScalar(0.26 * Math.max(0.01, coatOn));
      });
      dyn.visible = ok && u > 4.5 && u < 6.1; dyn.position.set(0, MY - 0.6, 0); dyn.scale.setScalar(mix(1.9, 0.5, pinch));
      recs.forEach((r, i) => {
        const x = r.x0;
        const inPit = new V3(x * 0.95, MY - 4.9 * dip * Math.pow(Math.max(0, Math.cos(x / 3.4 * Math.PI / 2)), 0.6), 0);
        const inVes = center.clone().add(new V3(x * 0.55, -1.3, 0));
        const back = new V3(x * 1.6 + 6, MY, 0);
        const p = free < 0.02 ? inPit : inVes;
        if (recycle > 0) p.lerp(back, recycle).y += Math.sin(recycle * Math.PI) * 2.2;
        r.o.position.copy(ok ? p : new V3(x, MY, 0)); r.o.visible = ok;
      });
      ldl.forEach((l, i) => {
        const away = new V3(l.x0 * 2.4 + (i - 1.5) * 1.2, MY + 7 + (i % 2) * 1.6, (i % 2 ? 1 : -1) * 0.8);
        if (!ok) { l.o.position.copy(away).add(new V3(Math.sin(u * 0.9 + i) * 1.6, -2.4 + Math.sin(u * 1.3 + i * 2) * 0.8, 0)); l.o.visible = true; l.o.scale.setScalar(1); return; }
        const seat = recs[i].o.position.clone().add(new V3(0, 1.75, 0));
        let p = away.clone().lerp(seat, bind);
        if (release > 0) {
          const inEndo = new V3(-7.5 + (i - 1.5) * 0.8, -5.4 + (i % 2) * 0.9, 0);
          const inLyso = new V3(8 + (i - 1.5) * 0.9, -6.4 + (i % 2) * 0.8, 0);
          p = center.clone().add(new V3(l.x0 * 0.5, 0.2, 0)).lerp(inEndo, release);
          if (onward > 0) { p.lerp(inLyso, onward); p.y -= Math.sin(onward * Math.PI) * 2; }
        }
        l.o.position.copy(p); l.o.scale.setScalar(mix(1, 0.2, span(u, 12.2, 13.4)));
      });
      if (ok) cue(u, 12.3, 'chol', () => { say(inGroup, 'cholesterol freed', P.fat, new V3(8, -2.8, 3), 2.4); for (let i = 0; i < 12; i++) { const d = randDir(); fly(inGroup, P.fat, 0.22, [new V3(8, -6.5, 0), new V3(8, -6.5, 0).add(d.multiplyScalar(5))], 1.8); } });
      cue(u, 2.6, 'coatname', () => ok && say(inGroup, 'clathrin coat forms', P.golgi, new V3(6.8, 0.8, 3), 2.2));
      cue(u, 4.7, 'dynname', () => ok && say(inGroup, 'dynamin pinches', P.gate, new V3(5.6, MY - 0.8, 3), 1.8));
      cue(u, 9.5, 'recname', () => ok && say(inGroup, 'receptors recycled', P.fix, new V3(9, MY + 2.6, 3), 2.2));
    }
    function drawPhago(u) {
      const reach = span(u, 1.2, 4.2), close = span(u, 4.2, 5.4), sink = span(u, 5.4, 7), join = span(u, 7, 8.8), digest = span(u, 8.8, 12);
      const open = close < 1;
      const pts = [[-16, MY]];
      if (open) {
        const H = 4.2 * reach, k = close;
        pts.push([-6, MY], [-4.3, MY + H * 0.35], [mix(-3.7, -0.35, k), MY + H], [-2.9, MY + H * 0.4], [-2.2, MY - 1.6 * reach], [0, MY - 2.4 * reach], [2.2, MY - 1.6 * reach], [2.9, MY + H * 0.4], [mix(3.7, 0.35, k), MY + H], [4.3, MY + H * 0.35], [6, MY]);
      }
      pts.push([16, MY]);
      membrane(pts);
      const caught = new V3(0, mix(MY + 7.5, MY + 0.4, span(u, 0, 2.6)), 0);
      const inside = caught.clone().lerp(new V3(1.2, -4.5, 0), sink).lerp(new V3(7.2, -6.3, 0), join);
      germ.position.copy(inside); germ.scale.setScalar(Math.max(0.001, (1 - digest) * mix(1, 0.75, sink)));
      germ.rotation.z = reduceMotion ? 0 : Math.sin(u * 5) * 0.15 * (1 - sink);
      vesicle.visible = !open && u < 8.8; vesicle.position.copy(inside); vesicle.scale.setScalar(1.15);
      cue(u, 6.9, 'fuse', () => say(inGroup, 'lysosome fuses', P.lyso, new V3(8, -2.4, 3), 2.2));
      cue(u, 9, 'bits', () => { for (let i = 0; i < 18; i++) fly(inGroup, P.glucose, 0.2, [new V3(7.6, -6.4, 0), new V3(7.6, -6.4, 0).add(randDir().multiplyScalar(5))], 2, { delay: rr(0, 1.6) }); });
    }
    function drawPino(u) {
      const dip = span(u, 1, 3.6), pinch = span(u, 3.6, 4.8), free = span(u, 4.8, 5.4), go = span(u, 5.4, 8.6);
      membrane(pitPath(free < 0.02 ? 3.6 * dip : 0, pinch));
      const center = new V3(0, MY - 2, 0).lerp(new V3(0, -1.6, 0), free).lerp(new V3(-6.5, -5.4, 0), go);
      vesicle.visible = free > 0.02 && u < 9.6; vesicle.position.copy(center); vesicle.scale.setScalar(0.7);
      sips.forEach((s, i) => {
        const home = sipHome[i].clone().add(new V3(0, MY, 0));
        if (i % 2) { s.position.copy(home).add(new V3(Math.sin(u + i) * 1.4, 1.2, 0)); return; }
        const inPit = new V3(sipHome[i].x * 0.5, MY - 3.6 * dip * 0.55 + sipHome[i].z * 0.5, sipHome[i].z * 0.6);
        const p = home.lerp(inPit, dip);
        if (free > 0.02) p.copy(center).add(new V3(sipHome[i].x * 0.4, (sipHome[i].y - 2.6) * 0.4, sipHome[i].z * 0.6));
        s.position.copy(p);
      });
    }
    function inTick(t) {
      const u = loopTime(t, 15);
      const w = C_.way;
      germ.visible = w === 'phago'; sips.forEach(s => { s.visible = w === 'pino'; });
      ldl.forEach(l => { l.o.visible = w === 'receptor'; }); recs.forEach(r => { r.o.visible = w === 'receptor'; });
      coat.forEach(c => { c.visible = false; }); dyn.visible = false;
      endo.visible = w !== 'phago'; show(inL.endo, w !== 'phago');
      if (w === 'receptor') drawReceptor(u); else if (w === 'phago') drawPhago(u); else drawPino(u);
      text(inL.cargo, w === 'receptor' ? 'LDL' : w === 'phago' ? 'Bacterium' : 'Fluid');
      inL.cargo.anchor.set(w === 'receptor' ? 5.6 : 6.5, MY + (w === 'receptor' ? 7.6 : 6), 0);
    }

    /* ================= LYSOSOME ================= */
    const lyGroup = group();
    const bag = shell(lyGroup, 9, P.lyso, 0.09);
    const pumps = [0.5, 2.3, 4.1, 5.4].map(a => {
      const p = new V3(Math.cos(a) * 9, Math.sin(a) * 9, 0), o = new THREE.Group(); o.position.copy(p); o.rotation.z = a; lyGroup.add(o);
      mesh(new THREE.CylinderGeometry(0.75, 0.75, 2, 14), std(P.atp), o).rotation.z = Math.PI / 2;
      const rotor = new THREE.Group(); rotor.position.x = -1.2; o.add(rotor);
      for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; mesh(atomGeo, atomMat(P.atp), rotor, [0, Math.cos(an) * 0.75, Math.sin(an) * 0.75], 0.3); }
      return { p, rotor };
    });
    const sugar = std(P.fix, { emissiveIntensity: 0.2 });
    for (let i = 0; i < 150; i++) mesh(atomGeo, sugar, lyGroup, randDir().multiplyScalar(8.55), 0.14);
    const protons = Array.from({ length: 120 }, () => { const home = inBall(7.8); return { o: dot(lyGroup, P.proton, 0.17, home, 0.55), home, phase: rr(0, 6.28) }; });
    const enzymes = Array.from({ length: 9 }, (_, i) => {
      const o = new THREE.Group(); lyGroup.add(o);
      [[0, 0, 0, 0.8], [0.7, 0.45, 0.2, 0.55], [-0.5, 0.6, -0.2, 0.5]].forEach(([x, y, z, r]) => mesh(atomGeo, std(P.golgi), o, [x, y, z], r));
      const a = i / 9 * Math.PI * 2;
      return { o, inside: new V3(Math.cos(a) * 5.4, Math.sin(a) * 5.4, rr(-2, 2)), outside: new V3(Math.cos(a) * 12.6, Math.sin(a) * 12.6, rr(-2, 2)) };
    });
    const chain = Array.from({ length: 22 }, (_, i) => mesh(atomGeo, std(P.fat), lyGroup, new V3((i - 10.5) * 0.62, Math.sin(i * 0.9) * 1.1, Math.cos(i * 0.7) * 0.8), 0.48));
    const junk = Array.from({ length: 40 }, () => mesh(atomGeo, std(P.fat, { emissiveIntensity: 0.15 }), lyGroup, inBall(5), 0.5));
    const lyL = {
      pump: addLabel('Proton pump (uses ATP)', 'atp', lyGroup, new V3(Math.cos(2.3) * 11, Math.sin(2.3) * 11, 0), ['lysosome']),
      enz: addLabel('Digestive enzymes', 'golgi', lyGroup, new V3(7.6, -7.6, 0), ['lysosome']),
      coat: addLabel('Protective sugar coat', 'fix', lyGroup, new V3(-6.5, -8.4, 0), ['lysosome']),
      cargo: addLabel('Molecule to digest', 'fat', lyGroup, new V3(0, 3.2, 0), ['lysosome']),
    };
    const ly = { acid: 1, leak: 0, next: 0, cut: 0, junk: 0 };
    function lyEnter() { ly.acid = C_.pump === 'on' ? 1 : 0; ly.leak = C_.place === 'leaked' ? 1 : 0; ly.next = now + 0.5; ly.cut = 0; ly.junk = 0; }
    function lyTick(t, dt) {
      const k = 1 - Math.exp(-dt * 1.4);
      ly.acid += ((C_.pump === 'on' ? 1 : 0) - ly.acid) * k;
      ly.leak += ((C_.place === 'leaked' ? 1 : 0) - ly.leak) * k;
      const count = Math.round(mix(8, protons.length, ly.acid));
      protons.forEach((p, i) => { p.o.visible = i < count; if (!reduceMotion) p.o.position.copy(p.home).add(new V3(Math.sin(t * 1.3 + p.phase) * 0.4, Math.cos(t * 1.1 + p.phase) * 0.4, 0)); });
      tintShell(bag, P.lyso.clone().lerp(P.proton, ly.acid * 0.28));
      pumps.forEach(p => { if (C_.pump === 'on' && !reduceMotion) p.rotor.rotation.x += dt * 5; });
      enzymes.forEach((e, i) => { e.o.position.copy(e.inside).lerp(e.outside, ly.leak); if (!reduceMotion) { e.o.rotation.z = Math.sin(t * 0.8 + i) * 0.5; e.o.position.y += Math.sin(t * 1.4 + i) * 0.3; } });
      const working = C_.pump === 'on' && C_.place === 'inside';
      if (t > ly.next) {
        if (C_.pump === 'on' && !reduceMotion) pumps.forEach((p, i) => fly(lyGroup, P.proton, 0.2, [p.p.clone().multiplyScalar(1.35), p.p.clone(), p.p.clone().multiplyScalar(0.6)], 1.2, { delay: i * 0.18 }));
        if (working) {
          ly.cut = (ly.cut + 1) % (chain.length + 5);
          if (ly.cut >= 1 && ly.cut <= chain.length && !reduceMotion) {
            const from = chain[ly.cut - 1].position.clone(), exit = pumps[ly.cut % 4].p.clone().applyAxisAngle(new V3(0, 0, 1), 0.7);
            fly(lyGroup, P.glucose, 0.3, [from, exit.clone().multiplyScalar(0.8), exit.clone().multiplyScalar(1.35)], 2.2);
          }
          ly.junk = Math.max(0, ly.junk - 2);
        } else ly.junk = Math.min(junk.length, ly.junk + 1);
        ly.next = t + 0.45;
      }
      const eaten = working ? (reduceMotion ? 8 : ly.cut) : 0;
      chain.forEach((c, i) => { c.visible = i >= eaten; });
      junk.forEach((j, i) => { j.visible = i < (reduceMotion && !working ? junk.length : ly.junk); });
      text(lyL.enz, ly.leak > 0.5 ? 'Leaked enzymes, mostly idle' : 'Digestive enzymes');
    }

    /* ================= PROTEASOME ================= */
    const prGroup = group();
    const barrel = new THREE.Group(); prGroup.add(barrel);
    const ringMat = [std(P.membrane, { emissiveIntensity: 0.22 }), std(P.nucleus, { emissiveIntensity: 0.3 })];
    [-3.15, -1.05, 1.05, 3.15].forEach((y, k) => {
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + k * 0.22; mesh(atomGeo, ringMat[k === 1 || k === 2 ? 1 : 0], barrel, [Math.cos(a) * 2.5, y, Math.sin(a) * 2.5], 1.12); }
    });
    const caps = [1, -1].map(s => {
      const o = new THREE.Group(); barrel.add(o);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mesh(atomGeo, std(P.golgi, { transparent: true, opacity: 0.88 }), o, [Math.cos(a) * 2.7, s * (5 + (i % 3) * 0.55), Math.sin(a) * 2.7], 0.85); }
      return o;
    });
    const LEN = 26;
    const strand = Array.from({ length: LEN }, () => mesh(atomGeo, std(P.amino), prGroup, null, 0.42));
    const foldPos = Array.from({ length: LEN }, () => inBall(1.7));
    const ubs = Array.from({ length: 4 }, () => dot(prGroup, P.atp, 0.55, null, 1.9));
    const pile = [0, 1, 2].map(i => {
      const o = new THREE.Group(); prGroup.add(o);
      for (let k = 0; k < 14; k++) mesh(atomGeo, std(P.amino), o, inBall(1.2), 0.38);
      for (let k = 0; k < 4; k++) mesh(atomGeo, atomMat(P.atp), o, [1.5 + k * 0.55, 0.6 + k * 0.35, 0], 0.36);
      o.userData.rest = new V3([-6.4, 6.2, -7.2][i], [7.4, 6.2, 1.6][i], [0.5, -0.5, 0.8][i]);
      return o;
    });
    const bar = mesh(new THREE.TorusGeometry(2.4, 0.35, 10, 40), std(P.gate), prGroup, [0, 6.3, 0]); bar.rotation.x = Math.PI / 2;
    const prL = {
      cap: addLabel('Regulatory cap', 'golgi', prGroup, new V3(5.4, 5.6, 0), ['proteasome']),
      core: addLabel('Core: cutting sites inside', 'membrane', prGroup, new V3(6.4, 0, 0), ['proteasome']),
      prot: addLabel('Protein', 'amino', prGroup, new V3(-5, 11.4, 0), ['proteasome']),
    };
    function prTick(t) {
      const u = loopTime(t, 14), fate = proteinFate(C_.tag, C_.blocker === 'yes');
      const arrive = span(u, 0.4, 3.4), unfold = fate === 'degraded' ? span(u, 4, 6) : 0, feed = fate === 'degraded' ? clamp((u - 5.6) / 5.4) : 0;
      let center = new V3(-8, 10.5, 0).lerp(new V3(0, 8.9, 0), arrive);
      if (fate === 'stays') center = new V3(mix(-13, 13, clamp(u / 13)), 9.4 + Math.sin(u) * 0.5, 2);
      const head = mix(7.4, -7.4 - LEN * 0.42, feed);
      strand.forEach((s, i) => {
        const folded = center.clone().add(foldPos[i]);
        const line = new V3(Math.sin(i * 1.3) * 0.18, head + i * 0.42, Math.cos(i * 1.3) * 0.18);
        s.position.copy(folded).lerp(line, unfold);
        s.visible = !(unfold > 0.95 && s.position.y < 1.2);                  // gone once it reaches the cutting chamber
      });
      const off = fate === 'degraded' ? span(u, 4.4, 6.4) : 0;
      ubs.forEach((b, i) => {
        b.visible = C_.tag === 'chain';
        const on = center.clone().add(new V3(1.7 + i * 0.75, 0.6 + i * 0.62, 0));
        b.position.copy(on).lerp(new V3(10 + i * 1.2, 7 - i * 1.5, 1), off);
      });
      pile.forEach((p, i) => {
        p.visible = fate === 'piles';
        const k = span(u, 1.5 + i * 2.2, 4.5 + i * 2.2);
        p.position.set(-18, 11, 0).lerp(p.userData.rest, k);
      });
      bar.visible = C_.blocker === 'yes';
      caps.forEach((c, i) => { c.rotation.y = fate === 'degraded' && !reduceMotion && u > 4 && u < 11 ? (i ? -1 : 1) * u * 1.2 : 0; });
      if (fate === 'degraded') {
        cue(u, 3.5, 'dock', () => say(prGroup, 'tag recognized', P.atp, new V3(-7.4, 7.4, 3), 2));
        cue(u, 5.2, 'ub', () => say(prGroup, 'ubiquitin reused', P.atp, new V3(10, 10, 3), 2.4));
        cue(u, 6.4, 'atp', () => say(prGroup, 'ATP spent unfolding', P.atp, new V3(-8, 4.6, 3), 2.6));
        cue(u, 7, 'out', () => {
          say(prGroup, 'short peptides', P.amino, new V3(7.2, -8.4, 3), 3.4);
          for (let i = 0; i < 9; i++) {
            const piece = new THREE.Group(), n = 2 + (i % 3);
            for (let j = 0; j < n; j++) mesh(atomGeo, atomMat(P.amino), piece, [j * 0.5, Math.sin(j * 2) * 0.2, 0], 0.34);
            travel(prGroup, piece, [new V3(0, -4.4, 0), new V3(rr(-2, 2), -8, rr(-1, 1)), new V3(rr(-9, 9), rr(-13, -10), rr(-2, 2))], 2.4, { delay: i * 0.45, spin: 1.5, shrinkEnd: true });
          }
        });
      }
      barrel.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.35;
    }

    /* ================= AUTOPHAGY ================= */
    const auGroup = group();
    function mitochondrion(parent) {
      const o = new THREE.Group(); parent.add(o);
      const body = mesh(new THREE.CapsuleGeometry(1.7, 3.4, 10, 24), std(P.mito, { transparent: true, opacity: 0.55, depthWrite: false }), o); body.rotation.z = Math.PI / 2;
      const folds = [-1.8, -0.9, 0, 0.9, 1.8].map((x, i) => { const f = mesh(new THREE.TorusGeometry(0.95, 0.18, 8, 24, Math.PI * 1.35), std(P.mito, { emissiveIntensity: 0.55 }), o, [x, 0, 0]); f.rotation.set(0, Math.PI / 2, i * 1.7); return f; });
      return { o, body, folds };
    }
    const target = mitochondrion(auGroup), healthyOne = mitochondrion(auGroup);
    const tags = Array.from({ length: 14 }, (_, i) => dot(target.o, P.atp, 0.32, new V3(rr(-2.8, 2.8), (i % 2 ? 1 : -1) * rr(1.5, 2), rr(-1, 1.2)), 1.1));
    const pinks = Array.from({ length: 6 }, (_, i) => dot(target.o, P.gate, 0.3, new V3((i - 2.5) * 0.9, 1.75, 0.5), 0.9));
    const R_CUP = 4.4;
    const cups = [0, 1].map(k => {
      const m = mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: P.golgi.clone(), emissive: P.golgi.clone(), emissiveIntensity: 0.3, transparent: true, opacity: k ? 0.22 : 0.3, side: THREE.DoubleSide, depthWrite: false }), auGroup);
      m.scale.setScalar(k ? 0.92 : 1); return m;
    });
    let cupCover = -1;
    function setCup(cover) {                           // cover 0..1 of a closed sphere
      const q = Math.round(cover * 60) / 60;
      if (q === cupCover) return;
      cupCover = q;
      cups.forEach(m => { m.geometry.dispose(); m.geometry = new THREE.SphereGeometry(R_CUP, 48, 32, 0, Math.PI * 2, Math.PI * (1 - Math.max(0.02, q)), Math.PI * Math.max(0.02, q)); });
    }
    const auLyso = shell(auGroup, 3.4, P.lyso, 0.2);
    for (let i = 0; i < 18; i++) mesh(atomGeo, atomMat(P.golgi), auLyso, inBall(2.4), 0.24);
    const bulk = Array.from({ length: 22 }, () => { const home = new V3(rr(-13, -5), rr(-9, -3), rr(-2, 2)); return { o: mesh(atomGeo, std(P.amino, { emissiveIntensity: 0.18 }), auGroup, home, rr(0.28, 0.55)), home }; });
    const small = mesh(new THREE.SphereGeometry(1, 36, 24), new THREE.MeshStandardMaterial({ color: P.golgi.clone(), emissive: P.golgi.clone(), emissiveIntensity: 0.35, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }), auGroup);
    const auL = {
      target: addLabel('Mitochondrion', 'mito', auGroup, new V3(0, 6.2, 0), ['autophagy']),
      healthy: addLabel('Healthy mitochondrion', 'mito', auGroup, new V3(-7.6, 8.6, 0), ['autophagy']),
      cup: addLabel('Growing membrane', 'golgi', auGroup, new V3(0, -5.8, 0), ['autophagy']),
      lyso: addLabel('Lysosome', 'lyso', auLyso, new V3(0, 4.6, 0), ['autophagy']),
      bulk: addLabel('Other contents', 'amino', auGroup, new V3(-9, -10.6, 0), ['autophagy']),
    };
    function auTick(t) {
      const u = loopTime(t, 15);
      const damaged = C_.mito === 'damaged', route = mitoRoute(C_.mito, C_.pink), eat = route === 'tagged', starved = autophagyLevel(C_.food) === 'high';
      const tagging = eat ? span(u, 1.2, 3.6) : 0, wrap = eat ? span(u, 3.6, 7) : 0, meet = eat ? span(u, 7.4, 9.6) : 0, digest = eat ? span(u, 9.8, 12.6) : 0;
      const col2 = P.mito.clone().lerp(new THREE.Color(0x77636a), damaged ? 0.7 : 0);
      target.body.material.color.copy(col2); target.body.material.emissive.copy(col2);
      target.folds.forEach((f, i) => { f.material.color.copy(col2); f.material.emissive.copy(col2); f.position.y = damaged ? Math.sin(i * 2.4) * 0.5 : 0; });
      target.o.scale.setScalar(Math.max(0.001, 1 - digest));
      target.o.rotation.z = reduceMotion || eat ? 0.12 : Math.sin(t * 0.6) * 0.12;
      healthyOne.o.position.set(-10, 5.5, -1); healthyOne.o.scale.setScalar(0.65); healthyOne.o.rotation.z = -0.35 + (reduceMotion ? 0 : Math.sin(t * 0.5) * 0.1);
      const pinkOn = damaged && C_.pink === 'ok';
      pinks.forEach((p, i) => { p.visible = C_.pink === 'ok' && (pinkOn ? u > 0.4 + i * 0.2 : !damaged); if (!damaged && !reduceMotion) { const k = (t * 0.45 + i / 6) % 1; p.position.y = mix(3.4, 0.4, k); p.scale.setScalar(Math.max(0.01, 1 - k)); } else { p.position.y = 1.75; p.scale.setScalar(1); } });
      tags.forEach((q, i) => { q.visible = tagging > i / tags.length; });
      setCup(wrap); cups.forEach((c, i) => { c.visible = wrap > 0.02 && digest < 0.98; c.scale.setScalar((i ? 0.92 : 1) * mix(1, 0.35, digest)); });
      auLyso.position.set(12, -3, 0).lerp(new V3(4.2, -0.8, 0), meet).lerp(new V3(0, 0, 0), digest);
      auLyso.scale.setScalar(mix(1, 1.25, digest));
      if (eat) {
        cue(u, 1.4, 'tag', () => say(auGroup, 'Parkin adds ubiquitin', P.atp, new V3(7.5, 7.4, 3), 2.4));
        cue(u, 5, 'wrap', () => say(auGroup, 'autophagosome forming', P.golgi, new V3(-7.5, -1, 3), 2.4));
        cue(u, 9.6, 'fuse', () => say(auGroup, 'fusion and digestion', P.lyso, new V3(0, 7.6, 3), 2.6));
        cue(u, 11, 'bits', () => { for (let i = 0; i < 24; i++) { const d = randDir(); fly(auGroup, P.glucose, 0.22, [d.clone().multiplyScalar(1.5), d.clone().multiplyScalar(10)], 2.4, { delay: rr(0, 1.4) }); } });
      }
      const pack = starved ? span(u, 1, 4.5) : 0, wrapB = starved ? span(u, 4.5, 6) : 0, gone = starved ? span(u, 7, 10) : 0;
      const mid = new V3(-9, -6, 0);
      bulk.forEach((b, i) => {
        const drift = reduceMotion ? new V3() : new V3(Math.sin(t * 0.7 + i) * 0.5, Math.cos(t * 0.9 + i) * 0.4, 0);
        const near = mid.clone().add(b.home.clone().sub(mid).multiplyScalar(0.32));
        b.o.position.copy(b.home).add(drift).lerp(near, i < 14 ? pack : 0);
        b.o.visible = !(i < 14 && gone > i / 14);
      });
      small.visible = starved && wrapB > 0.02 && gone < 0.98; small.position.copy(mid); small.scale.setScalar(2.6 * wrapB * (1 - gone * 0.5));
      if (starved) cue(u, 9, 'salvage', () => { say(auGroup, 'building blocks salvaged', P.glucose, new V3(-8, -1.8, 3), 2.6); for (let i = 0; i < 20; i++) fly(auGroup, P.glucose, 0.2, [mid.clone(), mid.clone().add(randDir().multiplyScalar(7))], 2.2, { delay: rr(0, 1.2) }); });
      text(auL.target, !damaged ? 'Healthy: PINK1 taken in' : pinkOn ? 'Damaged: PINK1 builds up' : 'Damaged, not tagged');
      show(auL.cup, wrap > 0.05 && digest < 0.5); show(auL.target, digest < 0.9);
    }

    /* ================= PEROXISOME ================= */
    const pxGroup = group();
    const pxBag = shell(pxGroup, 8, P.membrane, 0.1);
    const catalases = [[3, 2.6, 1], [2.4, -3.2, -1], [5, -0.4, 0], [0.6, 4.6, -1], [0.2, -5, 1]].map(p => {
      const o = new THREE.Group(); o.position.set(...p); pxGroup.add(o);
      [[0.55, 0.5], [-0.55, 0.5], [0.55, -0.5], [-0.55, -0.5]].forEach(([x, y]) => mesh(atomGeo, std(P.golgi), o, [x, y, 0], 0.65));
      return o;
    });
    const oxidase = new THREE.Group(); oxidase.position.set(-2.4, 0, 0); pxGroup.add(oxidase);
    mesh(new THREE.TorusGeometry(1.2, 0.5, 12, 32, Math.PI * 1.6), std(P.fix), oxidase).rotation.z = 0.7;
    const FAT = 24, KEEP = 8;
    const fatty = Array.from({ length: FAT }, () => mesh(atomGeo, std(P.fat), pxGroup, null, 0.38));
    const mito2 = mitochondrion(pxGroup); mito2.o.position.set(12.4, -7.4, 0); mito2.o.rotation.z = 0.5; mito2.o.scale.setScalar(0.8);
    const lingering = Array.from({ length: 22 }, () => { const home = inBall(6.4); return { o: dot(pxGroup, P.gate, 0.34, home, 1.2), home, phase: rr(0, 6.28) }; });
    const pxL = {
      fat: addLabel('Very long fatty acid', 'fat', pxGroup, new V3(-11, 4.2, 0), ['peroxisome']),
      ox: addLabel('Oxidation enzymes', 'fix', pxGroup, new V3(-3, -2.8, 0), ['peroxisome']),
      cat: addLabel('Catalase', 'golgi', pxGroup, new V3(5.4, 4.6, 0), ['peroxisome']),
      mito: addLabel('Mitochondrion', 'mito', pxGroup, new V3(12.4, -10.4, 0), ['peroxisome']),
    };
    const px = { round: 0, acc: 0 };
    function pxTick(t) {
      const u = loopTime(t, 18);
      const ok = peroxide(C_.catalase) === 'cleared';
      const enter = span(u, 0.3, 3), rounds = Math.max(0, Math.min((FAT - KEEP) / 2, Math.floor((u - 3.2) / 1.2) + 1));
      const removed = u < 3.2 ? 0 : rounds * 2, leave = span(u, 13.6, 16.4);
      const tip = -3.6;
      fatty.forEach((f, i) => {
        const j = i - removed;
        f.visible = j >= 0;
        const x = tip - Math.max(0, j) * 0.5 - (1 - enter) * 9;
        const p = new V3(x, Math.sin(Math.max(0, j) * 1.9) * 0.28, 0);
        if (leave > 0 && j >= 0) p.lerp(new V3(12.4 - j * 0.4, -7.4, 0), leave).y -= Math.sin(leave * Math.PI) * 2.4;
        f.position.copy(p); f.scale.setScalar(0.38 * (1 - span(u, 16.4, 17.4)));
      });
      for (let k = 1; k <= rounds; k++) {
        cue(u, 3.2 + (k - 1) * 1.2, 'r' + k, () => {
          const from = new V3(tip + 0.4, 0, 0);
          const unit = new THREE.Group(); [0, 0.5].forEach(x => mesh(atomGeo, atomMat(P.fat), unit, [x, 0, 0], 0.34));
          travel(pxGroup, unit, [from, new V3(rr(-1, 1), -4.5, 2), new V3(rr(-3, 3), -11.5, 1)], 2.6, { spin: 2, shrinkEnd: true });
          const cat = catalases[k % catalases.length].position;
          if (ok) fly(pxGroup, P.gate, 0.34, [from.clone().add(new V3(1.8, 0, 0)), cat.clone()], 1.3, { shrinkEnd: false, onDone: () => { for (let n = 0; n < 4; n++) fly(pxGroup, P.electron, 0.22, [cat.clone(), cat.clone().add(randDir().multiplyScalar(3.2))], 1.3); } });
        });
      }
      cue(u, 3.4, 'h2o2', () => say(pxGroup, 'H₂O₂ made', P.gate, new V3(-1, 3, 4), 2.2));
      cue(u, 4.8, 'two', () => say(pxGroup, '2-carbon units removed', P.fat, new V3(-7.5, -9, 3), 3));
      if (ok) cue(u, 5.6, 'cat', () => say(pxGroup, 'water + oxygen', P.electron, new V3(6.6, -5.4, 4), 2.8));
      cue(u, 13.7, 'handoff', () => say(pxGroup, 'shortened chain handed on', P.fat, new V3(8, -3.4, 4), 2.8));
      catalases.forEach(c => { c.visible = ok; if (!reduceMotion) c.rotation.z = Math.sin(t + c.position.x) * 0.3; });
      show(pxL.cat, ok);
      const count = ok ? 0 : reduceMotion ? 18 : Math.min(lingering.length, Math.max(0, rounds * 3));
      lingering.forEach((h, i) => { h.o.visible = i < count; if (!reduceMotion) h.o.position.copy(h.home).add(new V3(Math.sin(t * 1.7 + h.phase) * 0.6, Math.cos(t * 1.4 + h.phase) * 0.6, 0)); });
      tintShell(pxBag, ok ? P.membrane : P.membrane.clone().lerp(P.gate, clamp(count / lingering.length) * 0.5));
    }

    /* ================= STORAGE DISEASES ================= */
    const stGroup = group();
    shell(stGroup, 13, P.membrane, 0.04);
    shell(stGroup, 3.6, P.nucleus, 0.2).position.set(-1, 0.5, -2);
    const bins = [[6.6, 3.6, 0], [-6.4, 4.8, 1], [-7, -3.8, 0], [1.4, -7.4, 1], [7.2, -3.4, -1], [0.6, 7.6, -1]].map(p => {
      const o = new THREE.Group(); o.position.set(...p); stGroup.add(o);
      shell(o, 1.7, P.lyso, 0.2);
      const lumps = Array.from({ length: 34 }, () => mesh(atomGeo, std(P.fat, { emissiveIntensity: 0.25 }), o, inBall(1.35), 0.3));
      const workers = Array.from({ length: 5 }, () => mesh(atomGeo, atomMat(P.golgi), o, inBall(1.1), 0.2));
      return { o, lumps, workers };
    });
    const strays = Array.from({ length: 30 }, (_, i) => { const a = i / 30 * Math.PI * 2; const home = new V3(Math.cos(a) * rr(14.4, 16), Math.sin(a) * rr(14.4, 16), rr(-2, 2)); return { o: dot(stGroup, P.golgi, 0.3, home, 0.9), home }; });
    const peroxes = [[10, 0.4, 1], [-3.2, -9.6, 0], [-10.4, 0.8, -1], [4, 10, 0]].map(p => { const o = shell(stGroup, 0.95, P.nadh, 0.35); o.position.set(...p); return o; });
    const loose = Array.from({ length: 70 }, () => { for (;;) { const v = inBall(11.6); if (v.length() > 4.6) return mesh(atomGeo, std(P.fat, { emissiveIntensity: 0.2 }), stGroup, v, 0.3); } });
    const stL = {
      bin: addLabel('Lysosome', 'lyso', bins[0].o, new V3(0, 2.8, 0), ['storage']),
      nuc: addLabel('Nucleus', 'nucleus', stGroup, new V3(-1, -3.9, -2), ['storage']),
      extra: addLabel('Peroxisome', 'nadh', peroxes[0], new V3(0, -2, 0), ['storage']),
      stray: addLabel('Enzymes sent outside', 'golgi', stGroup, new V3(-8.4, 13.2, 0), ['storage']),
    };
    function stTick(t) {
      const u = loopTime(t, 16);
      const kind = DEFECTS[C_.defect].kind;
      const grow = reduceMotion ? 1 : span(u, 1, 11);
      bins.forEach((b, i) => {
        const filled = kind === 'perox' ? 3 : Math.round(3 + grow * (b.lumps.length - 3));
        b.lumps.forEach((l, k) => { l.visible = k < filled; });
        b.workers.forEach((w, k) => { w.visible = kind === 'perox' || (kind === 'store' && k > 0); });   // one enzyme type missing, or all of them
        b.o.scale.setScalar(kind === 'perox' ? 1 : 1 + grow * 0.75);
      });
      strays.forEach((s, i) => {
        s.o.visible = kind === 'lost';
        if (kind === 'lost' && !reduceMotion) { const k = (u * 0.16 + i / strays.length) % 1; s.o.position.copy(s.home).multiplyScalar(mix(0.72, 1.05, k)); }
      });
      peroxes.forEach(p => { p.visible = kind !== 'perox'; });
      loose.forEach((l, i) => { l.visible = kind === 'perox' && i < grow * loose.length; });
      show(stL.extra, kind !== 'perox');
      show(stL.stray, kind === 'lost');
      text(stL.bin, kind === 'perox' ? 'Lysosome' : 'Swollen lysosome');
      stGroup.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.25) * 0.3;
    }

    /* ================= labels, camera, behaviors ================= */
    // labels whose subject is currently absent are marked data-off and hidden by the stylesheet
    const POSES = {
      intake: { pos: new V3(0, 1, 40), target: new V3(0, 0.5, 0), group: 'intake', w: 15 },
      lysosome: { pos: new V3(0, 2, 38), target: new V3(0, 0, 0), group: 'lysosome', w: 14.5 },
      proteasome: { pos: new V3(8, 6, 38), target: new V3(0, 0, 0), group: 'proteasome', w: 14 },
      autophagy: { pos: new V3(0, 2, 38), target: new V3(0, -0.5, 0), group: 'autophagy', w: 15 },
      peroxisome: { pos: new V3(0, 1, 38), target: new V3(0.5, -1, 0), group: 'peroxisome', w: 15 },
      storage: { pos: new V3(0, 2, 49), target: new V3(0, 0, 0), group: 'storage', w: 17 },
    };
    const ticks = { intake: inTick, lysosome: lyTick, proteasome: prTick, autophagy: auTick, peroxisome: pxTick, storage: stTick };
    const B = {};
    Object.keys(POSES).forEach(id => {
      B[id] = {
        enter() {
          restart(); if (id === 'lysosome') lyEnter();
          onChange = (name) => { if (id === 'lysosome') { if (name === 'replay') lyEnter(); return; } restart(); };
        },
        tick: ticks[id],
        exit() { onChange = () => {}; clearAgents(); },
      };
    });

    return {
      groups: { intake: inGroup, lysosome: lyGroup, proteasome: prGroup, autophagy: auGroup, peroxisome: pxGroup, storage: stGroup },
      unitsPerNm: {},                                  // schematic scenes: no single true scale, so the scale bar is hidden
      fog: { intake: 0.004, lysosome: 0.004, proteasome: 0.004, autophagy: 0.004, peroxisome: 0.004, storage: 0.004 },
      depth: { intake: 1, lysosome: 2, proteasome: 3, autophagy: 1, peroxisome: 2, storage: 0 },
      fadeText: { intake: 'To the receiving dock', lysosome: 'Into the lysosome', proteasome: 'To the shredder', autophagy: 'With the salvage crew', peroxisome: 'Into the peroxisome', storage: 'Stepping back' },
      poses: POSES, behaviors: B,
    };
  },
});
})();
