/* Cell division, DNA damage and radiation. */
(() => {
'use strict';

/* ================================================================
   Rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
// Linear-quadratic model. total and perFraction in Gy; alpha in 1/Gy, beta in 1/Gy².
function survival(total, perFraction, alpha, beta) {
  const n = total / perFraction;
  return Math.exp(-n * (alpha * perFraction + beta * perFraction * perFraction));
}
function bed(total, perFraction, ab) { return total * (1 + perFraction / ab); }
function eqd2(total, perFraction, ab) { return bed(total, perFraction, ab) / (1 + 2 / ab); }
// Where a cycling cell stops. Returns 'G0', 'G1/S', 'G2/M' or null (it divides).
function cycleStop(growthSignal, damage, p53) {
  if (!growthSignal) return 'G0';
  if (damage && p53) return 'G1/S';
  if (damage) return 'G2/M';                     // this checkpoint does not depend only on p53
  return null;
}
// Main repair route for a lesion.
function repairRoute(lesion, phase) {
  if (lesion === 'base') return ['BER'];
  if (lesion === 'ssb') return ['SSBR'];
  return phase === 'g2' ? ['HR', 'NHEJ'] : ['NHEJ'];   // HR needs a sister chromatid (S and G2)
}
// Single-strand breaks left unrepaired become double-strand breaks when DNA is copied.
function parpOutcome(parpInhibitor, brcaLost) {
  if (!parpInhibitor) return 'repaired';
  return brcaLost ? 'dies' : 'rescued';
}
function cellFate(damage, p53) {
  if (damage === 'low') return p53 ? 'arrest' : 'mutant';
  return p53 ? 'apoptosis' : 'catastrophe';
}
function inverseSquare(distance) { return 1 / (distance * distance); }
/*RULES-END*/

const D = {
  growth: 'yes', dmg: 'no', p53: 'yes',
  phase: 0, attach: 'ok', play: !reduceMotion,
  beam: 'xray', oxygen: 'yes', shots: 0,
  lesion: 'dsb', rphase: 'g1', parpi: 'no', brca: 'ok',
  level: 'low', fp53: 'yes',
  tissue: 'tumor', total: 60, frac: '2',
  dist: 1,
};
const CONTROLS = {
  growth: ['Growth signals', [['yes', 'Present'], ['no', 'Absent']]],
  dmg: ['DNA damage', [['no', 'None'], ['yes', 'Damaged']]],
  p53: ['p53', [['yes', 'Working'], ['no', 'Lost']]],
  attach: ['Spindle', [['ok', 'All attached'], ['loose', 'One kinetochore loose'], ['drug', 'Microtubule drug']]],
  beam: ['Radiation', [['xray', 'X-rays (low LET)'], ['alpha', 'Alpha particle (high LET)']]],
  oxygen: ['Oxygen', [['yes', 'Well oxygenated'], ['no', 'Hypoxic']]],
  lesion: ['Lesion', [['base', 'Damaged base'], ['ssb', 'Single-strand break'], ['dsb', 'Double-strand break']]],
  rphase: ['Cell cycle phase', [['g1', 'G1 or G0'], ['g2', 'S or G2']]],
  parpi: ['PARP inhibitor', [['no', 'None'], ['yes', 'Given']]],
  brca: ['BRCA1/2', [['ok', 'Working'], ['lost', 'Lost']]],
  level: ['Damage', [['low', 'Repairable'], ['high', 'Overwhelming']]],
  fp53: ['p53', [['yes', 'Working'], ['no', 'Lost']]],
  tissue: ['Tissue model', [['tumor', 'Tumor / early (α/β 10)'], ['late', 'Late-responding (α/β 3)']]],
  frac: ['Dose per fraction', [['1.8', '1.8 Gy'], ['2', '2 Gy'], ['3', '3 Gy'], ['8', '8 Gy']]],
};
const seg = (name) => `<div><div class="eyebrow seg-label">${CONTROLS[name][0]}</div><div class="seg" role="group" aria-label="${CONTROLS[name][0]}">${CONTROLS[name][1].map(([v, t]) =>
  `<button type="button" class="btn${D[name] === v ? ' on' : ''}" data-dv="${name}" data-val="${v}" aria-pressed="${D[name] === v}">${t}</button>`).join('')}</div></div>`;
const slider = (name, label, min, max, step, unit) => `<label class="range"><span class="eyebrow">${label}: <b id="rv-${name}">${D[name]}</b> ${unit}</span><input type="range" id="range-${name}" data-range="${name}" min="${min}" max="${max}" step="${step}" value="${D[name]}"></label>`;
const row = (label, value, on) => `<li class="${on ? 'on' : ''}"><span>${label}</span><b>${value}</b></li>`;

const PHASES = [
  ['Interphase', 'DNA has already been copied. Chromosomes are loose threads inside the nucleus, and the centrosome has doubled.'],
  ['Prophase', 'Chromosomes condense into pairs of sister chromatids held by cohesin. The two centrosomes move apart and the spindle begins to form.'],
  ['Prometaphase', 'The nuclear envelope breaks up. Growing and shrinking microtubules search for kinetochores and capture them.'],
  ['Metaphase', 'Chromosomes line up midway. The spindle checkpoint waits until every kinetochore is properly attached.'],
  ['Anaphase', 'The anaphase-promoting complex releases the enzyme that cuts cohesin. Sister chromatids are pulled to opposite poles.'],
  ['Telophase', 'Chromosomes loosen and a nuclear envelope re-forms around each set.'],
  ['Cytokinesis', 'A ring of actin and myosin pinches the cytoplasm, leaving two daughter cells.'],
];
const REPAIRS = {
  BER: { name: 'Base excision repair', steps: ['An enzyme recognizes the damaged base and cuts it out', 'The backbone is opened at the gap', 'A polymerase fills in the correct base, using the other strand', 'A ligase seals the backbone'] },
  SSBR: { name: 'Single-strand break repair', steps: ['PARP1 finds the break and signals', 'Repair proteins are recruited', 'The ends are tidied and the gap filled, using the other strand', 'A ligase seals the backbone'] },
  NHEJ: { name: 'Non-homologous end joining', steps: ['The Ku protein ring grips both broken ends', 'Kinase and processing enzymes are recruited', 'The ends are trimmed to fit, which can lose a few bases', 'A ligase joins them. Fast, but it can make errors'] },
  HR: { name: 'Homologous recombination', steps: ['The ends are cut back to leave single strands', 'RAD51, helped by BRCA1 and BRCA2, coats them', 'They find the matching sister chromatid', 'It is used as a template, so repair is usually accurate'] },
};
const FATES = {
  arrest: ['Pause, repair, resume', 'p53 builds up and switches on p21, which holds back the cyclin–CDK complexes. With the damage repaired, the cell carries on.'],
  apoptosis: ['Apoptosis (or senescence)', 'Heavy damage with working p53 can trigger orderly self-destruction, with caspases and membrane blebbing. Many cell types instead become <b>senescent</b>: alive but permanently out of the cycle.'],
  mutant: ['Divides with damage', 'Without p53 the G1 brake is weak. Errors can be copied into the daughter cells. Accumulated mutations are one road to cancer.'],
  catastrophe: ['Mitotic catastrophe', 'The cell enters mitosis with broken chromosomes. Fragments mis-segregate and the cell often dies during or after division. This is a major way irradiated tumor cells die.'],
};
const DOSES = [                                       // RadiologyInfo adult effective doses, page last reviewed 15 April 2025
  ['Bone density (DEXA)', 0.001, '3 hours'], ['Dental X-ray', 0.005, '1 day'], ['Chest X-ray', 0.1, '10 days'], ['Screening digital mammogram', 0.28, '34 days'],
  ['Lumbar spine X-ray', 1.4, '6 months'], ['Low-dose lung screening CT', 1.5, '6 months'], ['CT brain', 1.6, '7 months'], ['CT chest', 6.1, '2 years'],
  ['CT abdomen and pelvis', 7.7, '2.6 years'], ['Coronary CT angiography', 8.7, '3 years'], ['CT spine', 8.8, '3 years'],
  ['CT abdomen and pelvis, with and without contrast', 15.4, '5.1 years'], ['PET/CT, whole body', 22.7, '7.6 years'],
];
const TISSUE = { tumor: { a: 0.3, b: 0.03, ab: 10 }, late: { a: 0.15, b: 0.05, ab: 3 } };   // illustrative α and β with the conventional ratios

function chart() {
  const t = TISSUE[D.tissue], d = +D.frac, W = 360, H = 200, L = 40, R = 8, T = 8, Bm = 30, maxD = 20, decades = 6;
  const X = (g) => L + g / maxD * (W - L - R);
  const Y = (sf) => T + Math.min(decades, -Math.log10(sf)) / decades * (H - T - Bm);
  const path = (per) => {                              // per = null: one single dose
    const pts = [];
    for (let g = 0; g <= maxD + 1e-9; g += 0.25) {
      const sf = per ? survival(g, per, t.a, t.b) : survival(g || 1e-9, g || 1e-9, t.a, t.b);
      pts.push(`${X(g).toFixed(1)},${Y(sf).toFixed(1)}`);
      if (-Math.log10(sf) > decades) break;
    }
    return 'M' + pts.join(' L');
  };
  let grid = '';
  for (let k = 0; k <= decades; k += 2) grid += `<line x1="${L}" x2="${W - R}" y1="${Y(10 ** -k)}" y2="${Y(10 ** -k)}" class="grid-line"/><text x="${L - 5}" y="${Y(10 ** -k) + 3}" text-anchor="end">${k ? '10⁻' + '⁰¹²³⁴⁵⁶'[k] : '1'}</text>`;
  for (let g = 0; g <= maxD; g += 5) grid += `<text x="${X(g)}" y="${H - 16}" text-anchor="middle">${g}</text>`;
  return `<svg class="lq" viewBox="0 0 ${W} ${H}" role="img" aria-label="Surviving fraction against dose: one single dose compared with ${d} gray fractions">${grid}
    <text x="${(L + W) / 2}" y="${H - 3}" text-anchor="middle">total dose (Gy)</text>
    <path d="${path(null)}" class="single"/><path d="${path(d)}" class="split"/></svg>
    <div class="lq-key"><span style="--c:var(--lesion)">One single dose</span><span style="--c:var(--accent)">Split into ${d} Gy fractions</span></div>`;
}

const READ = {
  cycle() {
    const stop = cycleStop(D.growth === 'yes', D.dmg === 'yes', D.p53 === 'yes');
    const text = stop === 'G0' ? 'With no growth signal the cell leaves the cycle for <b>G0</b>.'
      : stop === 'G1/S' ? 'p53 holds the cell at <b>G1/S</b> so damaged DNA is not copied.'
        : stop === 'G2/M' ? 'Without working p53 the cell slips past G1/S and copies damaged DNA. <b>G2/M</b> can still delay it, because that brake does not rely on p53 alone. It is not foolproof.'
          : 'All checks pass and the cell goes round to divide.';
    return `<ol class="chain">${row('G1/S checkpoint', stop === 'G0' ? 'not reached' : stop === 'G1/S' ? 'closed' : D.dmg === 'yes' ? 'slips through' : 'open', stop !== 'G1/S' && stop !== 'G0')}${row('G2/M checkpoint', stop === 'G2/M' ? 'holding' : stop ? 'not reached' : 'open', !stop)}</ol><p>${text}</p>`;
  },
  mitosis() {
    const [name, text] = PHASES[D.phase];
    const held = D.attach !== 'ok' && D.phase === 3;
    const why = !held ? '' : D.attach === 'loose' ? '<p><b>Held at the checkpoint.</b> One unattached kinetochore is enough to send a “wait” signal.</p>'
      : '<p><b>Held at the checkpoint.</b> The drug stops the spindle working normally. Vinca alkaloids block microtubule assembly and taxanes over-stabilize them.</p>';
    return `<div class="step-top"><span class="step-n">Stage ${D.phase + 1} of 7</span><span class="enzyme">${name}</span></div><p>${text}</p>${why}`;
  },
  damage() {
    const hi = D.beam === 'alpha';
    return `<ol class="chain">${row('How it deposits energy', hi ? 'dense track' : 'sparse hits', hi)}${row('Mostly acts', hi ? 'directly on DNA' : 'via water radicals', true)}${row('Damage pattern', hi ? 'tightly clustered' : 'mostly isolated', hi)}${row('Does oxygen matter?', hi ? 'much less' : D.oxygen === 'yes' ? 'yes: fixes damage' : 'less is fixed', !hi && D.oxygen === 'yes')}</ol>
      <p>${hi ? 'A single alpha track can break both strands close together, which is hard to repair.' : D.oxygen === 'yes' ? 'Radicals from water strike DNA, and oxygen helps make that damage permanent.' : '<b>Hypoxic cells are more resistant to X-rays</b>: without oxygen, more of the radical damage can be chemically restored.'}</p>`;
  },
  repair() {
    const routes = repairRoute(D.lesion, D.rphase), main = routes[0], r = REPAIRS[main];
    let out = `<p><b>${r.name}</b>${routes.length > 1 ? ' is available because there is a sister chromatid. End joining still handles many breaks, even in G2.' : D.lesion === 'dsb' ? ' is the route here: with no sister chromatid, there is no accurate template.' : '.'}</p><ol class="steps">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
    const o = parpOutcome(D.parpi === 'yes', D.brca === 'lost');
    out += `<p class="muted">${o === 'repaired' ? 'No PARP inhibitor: single-strand breaks are dealt with normally.' + (D.brca === 'lost' ? ' Losing BRCA1/2 cripples accurate double-strand repair.' : '')
      : o === 'rescued' ? 'With a PARP inhibitor, more breaks reach DNA copying and become double-strand problems. A cell with working BRCA1/2 can usually fix them by homologous recombination.'
        : '<b>Synthetic lethality:</b> the PARP inhibitor creates problems that need homologous recombination, and this cell has lost BRCA1/2. It tends to die, while normal cells with a working copy cope better.'}</p>`;
    return out;
  },
  fate() {
    const [name, text] = FATES[cellFate(D.level, D.fp53 === 'yes')];
    return `<p><b>${name}.</b> ${text}</p>`;
  },
  survival() {
    const t = TISSUE[D.tissue], d = +D.frac, one = survival(d, d, t.a, t.b);
    const fmt = (x) => (x >= 10 ? x.toFixed(0) : x.toFixed(1));
    return `<div class="tally"><div style="--c:var(--accent)"><b>${fmt(bed(D.total, d, t.ab))}</b><small>BED (Gy${t.ab})</small></div><div style="--c:var(--atp)"><b>${fmt(eqd2(D.total, d, t.ab))}</b><small>EQD2 (Gy)</small></div><div style="--c:var(--fg)"><b>${fmt(D.total / d)}</b><small>fractions</small></div><div style="--c:var(--nadh)"><b>${Math.round(one * 100)}%</b><small>survive one fraction</small></div></div>
      ${chart()}<p>The 3D field shows 100 cells after <b>one ${d} Gy fraction</b> in this model.${Number.isInteger(D.total / d) ? '' : ' This total is not a whole number of fractions, so read the figures as a mathematical comparison.'}</p>`;
  },
  dose() {
    const rel = inverseSquare(D.dist);
    return `<p>At <b>${D.dist} m</b> from a small source, the dose rate is <b>${rel >= 1 ? '100%' : (rel * 100).toFixed(rel < 0.1 ? 1 : 0) + '%'}</b> of the rate at 1 m.</p>`;
  },
};

let current = 'cycle', onChange = () => {};
function renderRead() { const el = $('#dRead'); if (el) el.innerHTML = READ[current](); }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-dv]');
  if (b) {
    const name = b.dataset.dv;
    D[name] = b.dataset.val;
    document.querySelectorAll(`[data-dv="${name}"]`).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    renderRead(); onChange(name);
    return;
  }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  const a = act.dataset.act;
  if (a === 'prev' || a === 'next') { D.play = false; D.phase = Math.max(0, Math.min(6, D.phase + (a === 'next' ? 1 : -1))); }
  if (a === 'play') { D.play = !D.play; if (D.play && D.phase === 6) D.phase = 0; }
  syncMitosis(); renderRead(); onChange(a);
});
document.addEventListener('input', (e) => {
  const r = e.target.closest && e.target.closest('[data-range]');
  if (!r) return;
  D[r.dataset.range] = +r.value;
  const out = $('#rv-' + r.dataset.range); if (out) out.textContent = r.value;
  renderRead(); onChange(r.dataset.range);
});
function syncMitosis() { const p = $('#mPlay'); if (p) p.textContent = D.play ? 'Pause' : 'Play'; }

const panel = (id, inner) => { current = id; return `<div class="lab">${inner}<div class="readout" id="dRead" aria-live="polite">${READ[id]()}</div></div>`; };
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, extra = '') => `<p class="credit">Sources: ${items.join(' · ')}. ${extra}</p>`;
const SRC = {
  fcb: link('https://open.oregonstate.education/cellbiology', 'Dalton &amp; Young, <i>Fundamentals of Cell Biology</i> (CC BY-NC 4.0), ch. 8, summarized and adapted'),
  repair: link('https://www.nature.com/articles/cr2007111', 'double-strand break repair review'),
  choice: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC4862604/', 'repair pathway choice'),
  parp: link('https://www.jci.org/articles/view/181062', 'PARP inhibitor review'),
  yields: link('https://www.env.go.jp/en/chemi/rhm/basic-info/2018/pdf/basic-1st-03-02-04.pdf', 'Ministry of the Environment, Japan: DNA damage per 1 mGy of X-rays (citing Morgan, NCRP 2008)'),
  acog: link('https://doi.org/10.1097/AOG.0000000000002355', 'ACOG Committee Opinion 723, imaging in pregnancy and lactation (2017), abstract'),
  lens: link('https://doi.org/10.1667/RADE-23-00030.1', 'Hamada 2023, radiation and cataract thresholds'),
  btlaw: link('https://doi.org/10.3109/09553002.2012.717732', 'Vogin and Foray 2013, on the law of Bergonié and Tribondeau'),
  doses: link('https://www.radiologyinfo.org/en/info/safety-xray', 'RadiologyInfo dose table, reviewed 15 April 2025'),
  ars: link('https://www.cdc.gov/radiation-emergencies/hcp/clinical-guidance/ars.html', 'CDC acute radiation syndrome guidance'),
  icrp: link('https://pubmed.ncbi.nlm.nih.gov/25816265/', 'ICRP tissue-reaction thresholds in imaging'),
  preg: link('https://www.rsna.org/-/media/Files/RSNA/Media/Medical-Imaging-During-Pregnancy.ashx', 'RSNA, imaging during pregnancy (quoting ACOG)'),
};

/* Apoptosis chapter: three pathways on a 16-second timeline; each caption starts at its time (s). */
const APO_PATHS = [
  ['intrinsic', 'Intrinsic', [[0, 'DNA damage activates p53, which switches on BH3-only proteins.'], [2.5, 'BAX and BAK open pores in the outer mitochondrial membrane.'], [3.5, 'Cytochrome c leaks out into the cytosol.'], [5.5, 'Cytochrome c and Apaf-1 assemble the apoptosome, which activates caspase-9.'], [7, 'Caspase-9 activates executioner caspases 3 and 7, which cut hundreds of proteins.'], [9, 'Chromatin condenses and the nucleus fragments. The membrane blebs.'], [12, 'The cell breaks into apoptotic bodies that display an “eat me” signal.'], [13, 'A macrophage swallows the pieces. No contents spill, so there is no inflammation.']]],
  ['extrinsic', 'Extrinsic', [[0, 'A cytotoxic T cell arrives carrying Fas ligand.'], [2, 'Fas ligand clusters death receptors on the target cell surface.'], [3, 'The receptors assemble a signaling complex that activates caspase-8.'], [4.5, 'Caspase-8 directly activates executioner caspases 3 and 7, and cuts Bid to pull in the mitochondria.'], [9, 'Chromatin condenses and the nucleus fragments. The membrane blebs.'], [12, 'The cell breaks into apoptotic bodies that display an “eat me” signal.'], [13, 'A macrophage swallows the pieces cleanly.']]],
  ['necrosis', 'Necrosis (contrast)', [[0, 'Without oxygen or ATP, ion pumps fail. Water rushes in and the cell and its mitochondria swell.'], [3, 'The plasma membrane ruptures.'], [3.6, 'Cell contents spill out and act as danger signals. The nucleus fades.'], [6, 'Neutrophils arrive and the surrounding tissue becomes inflamed.']]],
];
function apoText(path, T) {
  const p = APO_PATHS.find(x => x[0] === path) || APO_PATHS[0];
  let text = p[2][0][1];
  for (const [at, t] of p[2]) if (T >= at) text = t;
  return text;
}

const CHAPTERS = [
  {
    id: 'cycle', short: 'Cycle', where: 'The life of one dividing cell',
    title: 'The cell cycle and its checkpoints',
    legend: [['g1', 'G1: grow'], ['sphase', 'S: copy DNA'], ['g2', 'G2: prepare'], ['mphase', 'M: divide'], ['gate', 'Closed checkpoint']],
    html: () => `
      <p class="lede">Before the city can split in two, it has to grow, copy its whole archive and check the copy. Checkpoints stop the process if something is wrong.</p>
      ${panel('cycle', seg('growth') + seg('dmg') + seg('p53'))}
      <ul class="facts">
        <li><b>Cyclins</b> rise and fall through the cycle. Each pairs with a <b>cyclin-dependent kinase</b> (CDK), and the active pair pushes the cell into the next stage.</li>
        <li><b>G0</b> is the exit lane. Some cells, such as many stem cells, rest there and return. Mature neurons and muscle fibers generally do not divide again.</li>
        <li><b>p53</b> is mutated in as many as half of all cancers.</li>
        <li>Interphase (G1, S and G2) takes most of the time. Mitosis is brief.</li>
      </ul>
      ${sources([SRC.fcb], 'Arc lengths are not exact timings. Real checkpoint signaling involves many more proteins.')}`,
  },
  {
    id: 'mitosis', short: 'Mitosis', where: 'One cell becoming two',
    title: 'Mitosis, stage by stage',
    legend: [['chrom-a', 'Chromosome pair A'], ['chrom-b', 'Chromosome pair B'], ['spindle', 'Spindle microtubules'], ['atp', 'Centrosomes'], ['membrane', 'Membranes']],
    html: () => `
      <p class="lede">Mitosis shares two identical sets of chromosomes between two cells. The 3D cell shows four chromosomes so you can follow each one. Human cells have 46.</p>
      ${panel('mitosis', seg('attach') + `<div class="ctl"><button class="btn" type="button" data-act="prev" aria-label="Previous stage">← Stage</button><button class="btn primary" type="button" data-act="play" id="mPlay">${D.play ? 'Pause' : 'Play'}</button><button class="btn" type="button" data-act="next" aria-label="Next stage">Stage →</button></div>`)}
      <ul class="facts">
        <li><b>Mitosis</b> divides the nucleus. <b>Cytokinesis</b> divides the cytoplasm.</li>
        <li><b>Meiosis</b>, which makes eggs and sperm, is a different process that halves the chromosome number.</li>
        <li>Because chromosomes are tightly packed, almost no genes are read during mitosis.</li>
      </ul>
      ${sources([SRC.fcb], 'The drug effects are a simplified summary and are not treatment information.')}`,
  },
  {
    id: 'damage', short: 'Damage', where: 'A stretch of DNA · 2 nm wide',
    title: 'How radiation damages DNA',
    legend: [['strand-a', 'DNA strand'], ['strand-b', 'Partner strand'], ['lesion', 'Damage'], ['radical', 'Water radical (•OH)'], ['atp', 'Ionization']],
    html: () => `
      <p class="lede">Ionizing radiation knocks electrons off molecules. It can hit DNA itself (<b>direct action</b>), or ionize the water around it and make reactive radicals that attack DNA (<b>indirect action</b>).</p>
      ${panel('damage', seg('beam') + seg('oxygen') + '<button class="btn primary" type="button" data-act="fire">Fire another exposure</button>')}
      <ul class="facts">
        <li>For X-rays, roughly <b>two-thirds</b> of DNA damage is often attributed to indirect action. Estimates differ.</li>
        <li><b>LET</b> (linear energy transfer) is the energy left behind per length of track. Higher LET means denser, more clustered damage.</li>
        <li>Per cell, <b>1 Gy</b> of X-rays makes on the order of 1,000 single-strand breaks but only about <b>40 double-strand breaks</b>. These are rounded estimates, scaled up from figures per milligray.</li>
        <li>Double-strand and clustered lesions matter most for whether a cell survives.</li>
        <li>Your cells also repair large amounts of damage from ordinary metabolism, including oxygen radicals from the <a href="#etc">electron transport chain</a>.</li>
      </ul>
      ${sources([SRC.yields], 'The scene shows far more damage on one short stretch than a real exposure would, so you can see each kind. It is not a simulation of dose.')}`,
  },
  {
    id: 'repair', short: 'Repair', where: 'The cell’s DNA repair crews',
    title: 'Repair: matching the tool to the damage',
    legend: [['strand-a', 'DNA strand'], ['strand-b', 'Partner strand'], ['lesion', 'Damage'], ['fix', 'Repair proteins'], ['sister', 'Sister chromatid']],
    html: () => `
      <p class="lede">Cells have several repair systems. Which one acts depends on the kind of damage and, for double-strand breaks, on where the cell is in its cycle.</p>
      ${panel('repair', seg('lesion') + seg('rphase') + seg('parpi') + seg('brca') + '<button class="btn primary" type="button" data-act="replay">Replay repair</button>')}
      <ul class="facts">
        <li>Sensor kinases such as <b>ATM</b> raise the alarm. One mark they leave near a double-strand break, called <b>γ-H2AX</b>, lets researchers count breaks.</li>
        <li>When one strand is intact, it serves as the template. When both are broken, accurate repair needs another copy.</li>
        <li>How PARP inhibitors kill BRCA-deficient cells is still debated. “Trapping” PARP on DNA and gaps left in newly copied DNA are among the explanations.</li>
      </ul>
      ${sources([SRC.repair, SRC.choice, SRC.parp], 'Each pathway involves many more proteins than shown. This is not treatment information.')}`,
  },
  {
    id: 'fate', short: 'Fate', where: 'What happens to a damaged cell',
    title: 'Repair, retire, self-destruct or gamble',
    legend: [['g1', 'Cell'], ['lesion', 'Damaged DNA'], ['gate', 'Dying'], ['senescent', 'Senescent']],
    html: () => `
      <p class="lede">After damage, a cell’s fate depends on how bad the damage is, whether it can be repaired and which brakes still work.</p>
      ${panel('fate', seg('level') + seg('fp53') + '<button class="btn primary" type="button" data-act="replay">Replay</button>')}
      <ul class="facts">
        <li>Radiation “cell death” in radiobiology usually means <b>loss of the ability to keep dividing</b>. A cell can look alive for a while and still count as killed.</li>
        <li>Many damaged cells die only when they next try to divide. That is one reason some tissues and tumors respond slowly.</li>
        <li>Different cell types favor different fates. Lymphocytes are unusual in that many die quickly by apoptosis.</li>
      </ul>
      <p><a href="#apoptosis">Watch apoptosis step by step</a></p>
      <p class="credit">The choice is drawn as a simple switch. In real cells the outcome is a matter of probability and depends on cell type, dose and many other proteins.</p>`,
  },
  {
    id: 'apoptosis', short: 'Apoptosis', where: 'Inside a cell that has decided to die',
    title: 'Apoptosis: a tidy, programmed death',
    legend: [['g1', 'Cell'], ['mito', 'Mitochondria'], ['cytc', 'Cytochrome c'], ['caspase', 'Active caspases'], ['nucleus', 'Nucleus'], ['mono', 'Macrophage']],
    html: () => `
      <p class="lede">A damaged, infected or unneeded cell can take itself apart from the inside. <b>Apoptosis</b> packages the cell into small membrane-wrapped pieces that are eaten before they can leak, so neighbors are not inflamed. Compare it with <b>necrosis</b>, where a cell bursts.</p>
      ${lessonSeg('dv-death', 'Pathway', APO_PATHS.map(([v, name]) => [v, name]))}
      <p id="apoCaption" class="lesson-phase" aria-live="polite">${apoText(LESSON['dv-death'] || 'intrinsic', 0)}</p>
      <ol class="lesson-sequence">
        <li><b>Intrinsic (mitochondrial) pathway.</b> DNA damage or stress activates p53 and BH3-only proteins such as PUMA and NOXA. They overcome protective BCL-2 proteins, so BAX and BAK open pores in the outer mitochondrial membrane. <b>Cytochrome c</b> escapes into the cytosol, binds Apaf-1, and seven of them assemble an <b>apoptosome</b> that activates initiator <b>caspase-9</b>.</li>
        <li><b>Extrinsic (death receptor) pathway.</b> Fas ligand on a cytotoxic T cell, or TNF-family signals, cluster death receptors on the target. They build a signaling complex that activates initiator <b>caspase-8</b>, which can also cut Bid to recruit the mitochondria.</li>
        <li><b>Execution.</b> Both paths activate executioner <b>caspase-3 and caspase-7</b>, protein-cutting enzymes that dismantle the cytoskeleton and nuclear lamina and activate a DNA-cutting enzyme. Chromatin condenses and fragments, and the membrane blebs.</li>
        <li><b>Clearance.</b> Phosphatidylserine flips to the outer surface as an “eat me” signal. Macrophages swallow the apoptotic bodies quietly, with anti-inflammatory signals.</li>
      </ol>
      <div class="table-wrap"><table class="ledger"><thead><tr><th></th><th>Apoptosis</th><th>Necrosis</th></tr></thead><tbody>
        <tr><td>Cell size</td><td>Shrinks</td><td>Swells</td></tr>
        <tr><td>Membrane</td><td>Intact, blebs into apoptotic bodies</td><td>Ruptures and leaks</td></tr>
        <tr><td>Nucleus</td><td>Condenses and fragments</td><td>Fades or breaks up irregularly</td></tr>
        <tr><td>Energy</td><td>Needs ATP</td><td>Often follows ATP loss, as in ischemia</td></tr>
        <tr><td>Neighbors</td><td>Usually no inflammation</td><td>Inflammation as contents spill</td></tr>
      </tbody></table></div>
      <ul class="facts">
        <li>Apoptosis sculpts the embryo (it separates fingers), removes self-reactive lymphocytes, and is how cytotoxic T cells and NK cells kill infected cells. See them at work in <a href="#blood">Blood</a>.</li>
        <li>Too little apoptosis helps cancers survive. Venetoclax, a drug that blocks BCL-2, restarts it in some leukemias. Too much contributes to neurodegeneration and to cell loss after a stroke.</li>
        <li>Radiation and many chemotherapy drugs trigger apoptosis through DNA damage and p53. Lymphocytes are especially prone, which is why blood lymphocyte counts fall soon after radiation exposure. Many other cells instead die when they next try to divide, as described in <a href="#fate">Fate</a>.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Treatment response is partly a story of cell death. A tumor that responds may shrink, or may stay the same size while its center dies. On contrast-enhanced CT or MRI, a <b>necrotic core</b> does not enhance and looks darker than living tumor. On diffusion-weighted MRI, water moves more freely once cells die and membranes break down, so the apparent diffusion coefficient often rises after effective therapy. In the brain, <b>radiation necrosis</b> can mimic tumor regrowth months to years later, and perfusion MRI or PET may help tell them apart. Response criteria differ by tumor type, so follow the protocol used by the treating team.</p></div>
      <p><a href="#fate">Back to cell fate after damage</a> · <a href="#survival">Why radiotherapy is split into fractions</a> · <a href="#autophagy">Compare autophagy, the cell’s self-recycling</a></p>
      <p class="credit">Sources: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2117903/" target="_blank" rel="noopener">Elmore, apoptosis: a review of programmed cell death (Toxicol Pathol, 2007)</a> · <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/3-5-cell-growth-and-division" target="_blank" rel="noopener">OpenStax Anatomy &amp; Physiology 2e, 3.5 Cell Growth and Division</a> · <i>Alberts et al., Molecular Biology of the Cell</i>, cell death chapter. The scene compresses about an hour of real apoptosis into seconds. Only a few molecules are drawn, and other regulated forms of death, such as necroptosis, pyroptosis and ferroptosis, are not shown. For learning, not diagnosis.</p>`,
  },
  {
    id: 'survival', short: 'Survival', where: 'Radiobiology · a teaching model',
    title: 'Why radiotherapy is split into fractions',
    legend: [['g1', 'Surviving cell'], ['dead', 'Lost the ability to divide']],
    html: () => `
      <p class="lede">The <b>linear-quadratic model</b> describes the surviving fraction as e<sup>−(αD + βD²)</sup>. The α/β ratio says how much a tissue cares about the size of each dose.</p>
      ${panel('survival', seg('tissue') + seg('frac') + slider('total', 'Total dose', 10, 80, 1, 'Gy'))}
      <div class="eq wrapeq">BED = nd × (1 + d / (α/β))<br>EQD2 = BED / (1 + 2 / (α/β))</div>
      <ul class="facts">
        <li>Splitting the dose spares <b>late-responding tissues</b> (low α/β) more than tissue with a high α/β. Compare the two models at 2 Gy and 8 Gy.</li>
        <li>Check: 30 × 2 Gy gives BED 72 Gy₁₀ for early effects and 100 Gy₃ for late effects.</li>
        <li>α/β = 10 and 3 are conventions. Some tumors, including many prostate cancers, appear to differ.</li>
      </ul>
      <h3>The five Rs of radiotherapy</h3>
      <dl class="organ rs">
        <dt>Repair</dt><dd>Normal tissue mends sublethal damage between fractions.</dd>
        <dt>Reassortment</dt><dd>Surviving cells move into more sensitive phases. <b>G2 and M are generally the most sensitive, and late S the most resistant.</b></dd>
        <dt>Repopulation</dt><dd>Cells keep dividing during a course of treatment, tumor cells included.</dd>
        <dt>Reoxygenation</dt><dd>Hypoxic tumor areas can regain oxygen, becoming easier to kill.</dd>
        <dt>Radio&shy;sensitivity</dt><dd>Cell types differ in their built-in sensitivity.</dd>
      </dl>
      <div class="callout"><span class="eyebrow">Bergonié and Tribondeau, 1906</span><p>Their classic rule: cells are generally more radiosensitive when they divide often, have many divisions ahead and are less specialized. Marrow stem cells and gut crypt cells fit it. Lymphocytes are the famous exception: highly sensitive without actively dividing. Treat the rule as a first approximation.</p></div>
      ${sources([SRC.btlaw])}
      <p class="credit">A teaching model only. The α and β values are illustrative (0.30 and 0.03; 0.15 and 0.05), so absolute survival and comparisons between the two curves’ heights are not meaningful. The model is less certain at large doses per fraction and ignores overall treatment time. <b>Never use this to plan or change treatment.</b></p>`,
  },
  {
    id: 'dose', short: 'Dose', where: 'Radiology · dose in context',
    title: 'Dose in radiology',
    legend: [['atp', 'Source'], ['membrane', 'Same energy, spread over a bigger sphere']],
    html: () => `
      <p class="lede">Imaging doses are usually far below the doses that cause acute injury. The main concern at imaging levels is a small possible increase in later cancer risk, weighed against the benefit of the scan.</p>
      <dl class="organ">
        <dt>Gray</dt><dd>Absorbed dose: energy per kilogram of tissue. Used for tissue effects and radiotherapy.</dd>
        <dt>Sievert</dt><dd>Effective dose weights by radiation type and tissue sensitivity. It is for comparing exposures across a reference population, not for predicting one person’s risk.</dd>
      </dl>
      <h3>Typical adult effective doses</h3>
      <div class="dose-list">${DOSES.map(([n, v, bg]) => `<div><span>${n}</span><b>${v} mSv</b><span class="track"><i style="width:${Math.max(1.5, (Math.log10(v) + 3) / 4.4 * 100).toFixed(1)}%"></i></span><small>like ${bg} of natural background</small></div>`).join('')}</div>
      <p class="muted">Bars use a logarithmic scale. These are typical values for an average-sized adult and actual dose can vary substantially. Average natural background in the US is about 3 mSv a year.</p>
      <h3>Two kinds of effect</h3>
      <ul class="facts">
        <li><b>Tissue reactions</b> (deterministic) appear above a threshold and worsen with dose, such as skin injury or cataract. ICRP’s nominal threshold for lens cataract is <b>0.5 Gy</b>. Some newer studies report risk below that.</li>
        <li><b>Stochastic effects</b>, chiefly cancer, become more likely rather than more severe as dose rises. Protection practice assumes no safe threshold (linear no-threshold). The size of risk at very low doses is uncertain.</li>
        <li><b>Pregnancy:</b> RSNA, citing ACOG, says that when the fetus is in the field of view there is no evidence a routine procedure (under <b>50 mGy</b>) at any stage causes miscarriage or developmental abnormalities.</li>
        <li><b>Cancer risk in pregnancy is a separate question.</b> RSNA, citing ICRP, says that through most of pregnancy the fetus is assumed to be at about the same risk as a child. With the fetus in view, such as in a pelvic CT, the actual risk is unknown but thought to be very low.</li>
        <li>ACOG’s summary: ultrasound and MRI are preferred when they can answer the question. With few exceptions, X-ray, CT and nuclear medicine doses are well below those linked to fetal harm, and a needed exam should not be withheld.</li>
        <li><b>Acute radiation syndrome</b> follows large whole-body doses over a short time. CDC: the marrow syndrome usually appears above about <b>0.7 Gy</b>, the gut syndrome above about <b>10 Gy</b> (some symptoms from 6), and the cardiovascular and nervous system syndrome above about <b>50 Gy</b> (some from 20). Other sources give lower figures for the last. <a href="#blood">Lymphocyte counts</a> fall early.</li>
      </ul>
      <h3>Time, distance, shielding</h3>
      ${panel('dose', slider('dist', 'Distance', 1, 5, 0.5, 'm'))}
      <ul class="facts">
        <li><b>ALARA:</b> keep doses as low as reasonably achievable while still getting a diagnostic result.</li>
        <li>The inverse-square rule holds for a small source. Large sources, scatter and nearby surfaces change it.</li>
      </ul>
      <div class="callout"><span class="eyebrow">For patients</span><p>Don’t refuse or delay a needed exam because of this page. Ask your doctor or radiology team why it is recommended, whether there is an alternative, and tell them if you could be pregnant.</p></div>
      ${sources([SRC.doses, SRC.icrp, SRC.lens, SRC.preg, SRC.acog, SRC.ars], 'For learning only, not for estimating anyone’s dose or managing an exposure.')}`,
  },
];

CellCity.register('division', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, camera, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, disposeObj, travel, every, clearAgents, addLabel } = g;
    const P = {};
    ['g1', 'sphase', 'g2', 'mphase', 'gate', 'chrom-a', 'chrom-b', 'spindle', 'strand-a', 'strand-b', 'lesion', 'radical', 'fix', 'sister', 'senescent', 'dead'].forEach(k => P[k] = col(k));
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: color.clone(), emissive: color.clone(), emissiveIntensity: 0.25, roughness: 0.5 }, extra));
    const randDir = () => new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
    const mesh = (geo, mat, parent, pos, scale) => { const o = new THREE.Mesh(geo, mat); if (pos) o.position.copy(Array.isArray(pos) ? new V3(...pos) : pos); if (scale !== undefined) (Array.isArray(scale) ? o.scale.set(...scale) : o.scale.setScalar(scale)); parent.add(o); return o; };
    function dot(color, r, glowSize = 0) { const o = new THREE.Group(); mesh(atomGeo, atomMat(color), o, null, r); if (glowSize) o.add(glow(color, glowSize)); return o; }
    const fly = (parent, color, r, pts, dur, opts = {}) => travel(parent, dot(color, r, r * 3.6), pts, dur, Object.assign({ shrinkEnd: true, ease: ease.lin }, opts));
    function say(parent, text, color, at, dur = 2.6, size = 1) {
      const sp = textSprite(text, color, size); sp.position.copy(at); sp.material.depthTest = false; sp.renderOrder = 5; parent.add(sp);
      const t0 = now;
      every(t => { const u = (t - t0) / dur; sp.material.opacity = u < 0.75 ? 1 : Math.max(0, (1 - u) / 0.25); if (u >= 1) { disposeObj(sp); return false; } return true; }, sp);
    }
    const stick = new THREE.CylinderGeometry(1, 1, 1, 8);
    function setStick(o, a, b, r) {                    // stretch a unit cylinder from a to b
      const dir = b.clone().sub(a), len = dir.length();
      o.position.copy(a).add(b).multiplyScalar(0.5);
      o.scale.set(r, Math.max(0.001, len), r);
      if (len > 1e-4) o.quaternion.setFromUnitVectors(UP, dir.normalize());
    }
    function cellShell(r, color) {
      const gr = new THREE.Group(), geo = new THREE.SphereGeometry(r, 64, 48);
      const fill = new THREE.MeshStandardMaterial({ color: color.clone(), transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide });
      const rim = fresnelMat(color, 1.0, 2.5);
      gr.add(new THREE.Mesh(geo, fill), new THREE.Mesh(geo, rim));
      gr.userData = { fill, rim };
      return gr;
    }
    const tint = (shell, color) => { shell.userData.fill.color.copy(color); shell.userData.rim.uniforms.uColor.value.copy(color); };
    function chromosome(parent, color, len = 2.6, r = 0.34) {   // two sister chromatids joined at a centromere
      const gr = new THREE.Group(); parent.add(gr);
      const mat = std(color, { emissiveIntensity: 0.35 });
      const sisters = [-1, 1].map(s => {
        const o = new THREE.Group(); gr.add(o);
        [1, -1].forEach(v => { const arm = mesh(new THREE.CapsuleGeometry(r, len / 2, 6, 12), mat, o, [s * 0.22, v * len * 0.3, 0]); arm.rotation.z = -s * v * 0.2; });
        mesh(atomGeo, atomMat(new THREE.Color(0xffffff)), o, [s * 0.1, 0, 0], r * 0.55);
        return o;
      });
      return { gr, sisters };
    }

    /* ================= CELL CYCLE ================= */
    const cycGroup = new THREE.Group(); scene.add(cycGroup);
    const RC = 11;
    const ARCS = [['G1', 'g1', 0, 0.42], ['S', 'sphase', 0.42, 0.72], ['G2', 'g2', 0.72, 0.87], ['M', 'mphase', 0.87, 1]];
    const angle = (u) => Math.PI / 2 - u * Math.PI * 2;
    const ringPos = (u, r = RC) => new V3(Math.cos(angle(u)) * r, Math.sin(angle(u)) * r, 0);
    ARCS.forEach(([name, c, a, b]) => {
      const pts = []; for (let i = 0; i <= 40; i++) pts.push(ringPos(a + (b - a) * (0.008 + 0.984 * i / 40)));
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.55, 12, false), std(P[c]), cycGroup);
      addLabel(name, c, cycGroup, ringPos((a + b) / 2, RC + 2.4), ['cycle']);
    });
    const gates = {};
    [['G1/S', 0.42], ['G2/M', 0.87], ['Spindle', 0.95]].forEach(([name, u]) => {
      const mat = std(P.g1);
      const o = mesh(new THREE.TorusGeometry(1.15, 0.2, 10, 36), mat, cycGroup, ringPos(u));
      o.quaternion.setFromUnitVectors(new V3(0, 0, 1), new V3(Math.sin(angle(u)), -Math.cos(angle(u)), 0));
      const bar = mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.3, 8), mat, cycGroup, ringPos(u));
      bar.rotation.z = angle(u) - Math.PI / 2;
      gates[name] = { mat, bar };
    });
    addLabel('G1/S check', 'gate', cycGroup, ringPos(0.42, RC - 2.8), ['cycle']);
    addLabel('G2/M check', 'gate', cycGroup, ringPos(0.855, RC - 3), ['cycle']);
    const g0Pos = new V3(RC + 8, RC - 3.5, 0);
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([ringPos(0.12), new V3(RC + 3, RC - 2.5, 0), g0Pos]), 40, 0.14, 8, false), std(P.senescent), cycGroup);
    addLabel('G0 (resting)', 'senescent', cycGroup, g0Pos.clone().add(new V3(-1.5, 2.2, 0)), ['cycle']);
    const walker = new THREE.Group(); cycGroup.add(walker);
    walker.add(cellShell(1.9, C.membrane));
    const walkerSpots = [0, 1, 2].map(i => mesh(atomGeo, atomMat(P.lesion), walker, [rr(-0.7, 0.7), rr(-0.7, 0.7), 1], 0.22));
    const core = new THREE.Group(); cycGroup.add(core);
    core.add(cellShell(5.2, C.nucleus));
    const coreChroms = [[-2, 1.2, 'chrom-a'], [2, 1.2, 'chrom-b'], [-1.6, -1.8, 'chrom-b'], [1.8, -1.8, 'chrom-a']].map(([x, y, c]) => {
      const ch = chromosome(core, P[c]); ch.gr.position.set(x, y, 0); ch.gr.rotation.z = rr(-0.6, 0.6); return ch;
    });
    const coreTag = addLabel('Chromosomes', 'chrom-a', core, new V3(0, -3.8, 0), ['cycle']);
    const cyc = { u: 0.05, hold: 0, g0: 0 };
    function cycTick(t, dt) {
      const stop = cycleStop(D.growth === 'yes', D.dmg === 'yes', D.p53 === 'yes');
      const at = stop === 'G1/S' ? 0.40 : stop === 'G2/M' ? 0.85 : stop === 'G0' ? 0.12 : null;
      const speed = dt * (reduceMotion ? 0.03 : 0.075);
      if (stop === 'G0' && Math.abs(cyc.u - 0.12) < 0.012) cyc.g0 = Math.min(1, cyc.g0 + dt * 0.55);
      else if (cyc.g0 > 0 && stop !== 'G0') cyc.g0 = Math.max(0, cyc.g0 - dt * 0.8);
      else if (at === null || Math.abs(cyc.u - at) > 0.012) cyc.u = (cyc.u + speed) % 1;
      const u = cyc.u;
      walker.position.copy(ringPos(u)).lerp(g0Pos, ease.inOut(cyc.g0));
      walker.position.z = 1.2;
      walker.scale.setScalar(u > 0.95 ? 0.85 : 0.85 + u * 0.4);
      walkerSpots.forEach(s => { s.visible = D.dmg === 'yes'; });
      gates['G1/S'].bar.visible = stop === 'G1/S'; gates['G2/M'].bar.visible = stop === 'G2/M'; gates.Spindle.bar.visible = false;
      Object.entries(gates).forEach(([k, gt]) => { const c = gt.bar.visible ? P.gate : P.g1; gt.mat.color.copy(c); gt.mat.emissive.copy(c); });
      const copied = Math.max(0, Math.min(1, (u - 0.42) / 0.3));          // sister chromatid appears during S
      const packed = u > 0.87 ? 1 : 0.55;
      coreChroms.forEach(ch => { ch.sisters[1].scale.setScalar(Math.max(0.001, copied)); ch.gr.scale.set(packed, u > 0.87 ? 0.9 : 1.15, packed); });
      coreTag.el.querySelector('span').textContent = u < 0.42 || cyc.g0 > 0.5 ? 'DNA: 1 copy' : u < 0.72 ? 'Copying DNA' : 'DNA: 2 copies';
    }

    /* ================= MITOSIS (1 unit ≈ 1 µm) ================= */
    const mitGroup = new THREE.Group(); scene.add(mitGroup);
    const parentCell = cellShell(11, C.membrane); mitGroup.add(parentCell);
    const daughters = [-1, 1].map(() => { const s = cellShell(7.6, C.membrane); mitGroup.add(s); return s; });
    const envelope = cellShell(6, C.nucleus); mitGroup.add(envelope);
    const newEnv = [-1, 1].map(() => { const s = cellShell(3.6, C.nucleus); mitGroup.add(s); return s; });
    const cleave = mesh(new THREE.TorusGeometry(1, 0.025, 10, 80), std(P.gate), mitGroup); cleave.rotation.y = Math.PI / 2;
    const poles = [-1, 1].map(() => { const o = dot(C.atp, 0.55, 2.4); mitGroup.add(o); return o; });
    const HOME = [[-2.4, 2, 0.8], [2.1, 2.6, -0.6], [-1.4, -2.4, -0.8], [2.4, -1.6, 0.9]];
    const PLATE = [4.6, 1.55, -1.55, -4.6];
    const chroms = HOME.map((h, i) => {
      const ch = chromosome(mitGroup, P[i === 0 || i === 3 ? 'chrom-a' : 'chrom-b'], 2.5, 0.36);
      ch.home = new V3(...h); ch.spin = rr(-1.2, 1.2);
      ch.fibers = [0, 1].map(() => mesh(stick, std(P.spindle, { transparent: true, opacity: 0.75 }), mitGroup));
      return ch;
    });
    const polar = [-3, 3].map(y => mesh(stick, std(P.spindle, { transparent: true, opacity: 0.3 }), mitGroup));
    const poleLabels = addLabel('Centrosome', 'atp', mitGroup, new V3(-9, 1.6, 0), ['mitosis']);
    const mitTag = addLabel('Interphase', 'membrane', mitGroup, new V3(0, -12.4, 0), ['mitosis']);
    const mit = { s: 0, since: 0, shown: -1 };
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const mix = (a, b, u) => a + (b - a) * u;
    function drawMitosis(s) {                           // s runs 0 (interphase) to 6 (cytokinesis)
      const condense = clamp(s), capture = clamp(s - 1.4), line = clamp(s - 2), pull = clamp(s - 3), reform = clamp(s - 4), split = clamp(s - 5);
      const spread = clamp(s * 0.9);
      const poleX = mix(mix(1.2, 9, spread), 10.5, pull);
      poles[0].position.set(-poleX, mix(5.4, 0, spread), 0); poles[1].position.set(poleX, mix(5.4, 0, spread), 0);
      poleLabels.anchor.set(-poleX, mix(7, 1.7, spread), 0);
      envelope.visible = s < 1.8; envelope.scale.setScalar(Math.max(0.001, 1 - clamp(s - 1.2) * 0.35)); envelope.userData.fill.opacity = 0.07 * (1 - clamp(s - 1.2) / 0.6); envelope.userData.rim.uniforms.uI.value = 1 - clamp((s - 1.2) / 0.6);
      chroms.forEach((ch, i) => {
        const onPlate = new V3(0, PLATE[i], (i % 2) * 0.6);
        const mid = ch.home.clone().lerp(onPlate, ease.inOut(line));
        const loose = D.attach === 'loose' && i === 0 && s >= 2.5 && s <= 3.2;
        if (loose) mid.set(-4.2, 6.4, 0.5);
        ch.gr.position.set(0, 0, 0);
        const diffuse = 1 - condense, loosen = clamp(s - 4.2);
        ch.sisters.forEach((sis, k) => {
          const side = k ? 1 : -1;
          const target = new V3(side * mix(0, 7.4, ease.inOut(pull)), mix(mid.y, PLATE[i] * 0.45, pull), mid.z * (1 - pull));
          sis.position.set(mix(mid.x, target.x, pull), target.y, target.z);
          if (split) sis.position.x += side * split * 1.4;
          sis.position.x += (i % 2 ? 1.2 : -1.2) * loosen;       // relax into the new nucleus
          sis.position.y *= 1 - loosen * 0.25;
          sis.rotation.z = ch.spin * (1 - line) + ch.spin * loosen;
          sis.scale.set(1 - diffuse * 0.55 - loosen * 0.35, 1 + diffuse * 0.35 - loosen * 0.25, 1 - diffuse * 0.55 - loosen * 0.35);
          const attached = capture > 0.05 && !loose && D.attach !== 'drug';
          ch.fibers[k].visible = attached && s < 4.7;
          if (ch.fibers[k].visible) setStick(ch.fibers[k], poles[k].position, poles[k].position.clone().lerp(sis.position, clamp(capture * 1.4)), 0.07);
        });
      });
      polar.forEach((f, i) => { f.visible = s >= 1 && s < 5.4 && D.attach !== 'drug'; if (f.visible) setStick(f, poles[0].position, poles[1].position, 0.04); f.position.y += (i ? 3 : -3) * 0.9; });
      newEnv.forEach((e, i) => { const x = (i ? 1 : -1) * (7.4 + split * 1.4); e.position.set(x, 0, 0); e.visible = reform > 0.05; e.userData.rim.uniforms.uI.value = reform; e.userData.fill.opacity = 0.07 * reform; });
      const apart = split > 0.55;
      parentCell.visible = !apart;
      parentCell.scale.set(1 + pull * 0.22 + split * 0.18, 1 - split * 0.22, 1 - split * 0.22);
      cleave.visible = s > 4.5 && !apart;
      cleave.scale.setScalar(10.9 * (1 - clamp((s - 4.5) / 1.1) * 0.75));
      daughters.forEach((d, i) => { d.visible = apart; d.position.set((i ? 1 : -1) * mix(7.4, 9.2, clamp((split - 0.55) / 0.45)), 0, 0); });
    }
    function mitTick(t, dt) {
      const blocked = D.attach !== 'ok';
      if (blocked && D.phase > 3) D.phase = 3;
      const target = D.phase;
      const step = dt * (reduceMotion ? 20 : 0.75);
      const d = target - mit.s;
      if (Math.abs(d) > 2.5) mit.s = target; else mit.s += Math.max(-step, Math.min(step, d));
      if (Math.abs(target - mit.s) < 0.01) { if (!mit.since) mit.since = t; } else mit.since = 0;
      if (D.play && mit.since && t - mit.since > 3.4 && !(blocked && D.phase === 3)) {
        D.phase = (D.phase + 1) % 7; if (D.phase === 0) mit.s = 0; mit.since = 0; renderRead();
      }
      if (mit.shown !== D.phase) { mit.shown = D.phase; mitTag.el.querySelector('span').textContent = PHASES[D.phase][0]; }
      drawMitosis(mit.s);
      mitGroup.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.3) * 0.25;
    }

    /* ================= DNA (1 unit = 0.34 nm, one base pair) ================= */
    const N = 44, PITCH = 10.5;
    function helix(parent, colorA, colorB) {
      const gr = new THREE.Group(); parent.add(gr);
      const mats = [std(colorA), std(colorB)], rung = std(new THREE.Color(0x8794a8), { emissiveIntensity: 0.15 }), hot = std(P.lesion, { emissiveIntensity: 0.9 });
      const pairs = [];
      for (let i = 0; i < N; i++) {
        const one = new THREE.Group(); gr.add(one);
        const th = i / PITCH * Math.PI * 2, x = i - (N - 1) / 2;
        const pts = [0, 2.5].map(off => new V3(x, Math.cos(th + off) * 3, Math.sin(th + off) * 3));
        const next = [0, 2.5].map(off => new V3(x + 1, Math.cos(th + Math.PI * 2 / PITCH + off) * 3, Math.sin(th + Math.PI * 2 / PITCH + off) * 3));
        const beads = pts.map((p, k) => mesh(atomGeo, mats[k], one, p, 0.5));
        const links = pts.map((p, k) => { const o = mesh(stick, mats[k], one); if (i < N - 1) setStick(o, p, next[k], 0.28); else o.visible = false; return o; });
        const mid = pts[0].clone().lerp(pts[1], 0.5);
        const bases = pts.map((p, k) => { const o = mesh(stick, rung, one); setStick(o, p, mid, 0.17); return o; });
        pairs.push({ one, beads, links, bases, pts, mid, x });
      }
      const api = {
        gr, pairs,
        heal() { pairs.forEach(p => { p.links.forEach((l, k) => { l.visible = p.x < (N - 1) / 2; }); p.bases.forEach(b => { b.material = rung; b.visible = true; }); p.beads.forEach((b, k) => { b.material = mats[k]; b.scale.setScalar(0.5); }); p.one.visible = true; p.one.position.set(0, 0, 0); }); },
        base(i, strand = 0) { pairs[i].bases[strand].material = hot; },
        ssb(i, strand = 0) { pairs[i].links[strand].visible = false; pairs[i].beads[strand].material = hot; if (i + 1 < N) pairs[i + 1].beads[strand].material = hot; },
        dsb(i) { api.ssb(i, 0); api.ssb(i, 1); },
        gap(i, d) { pairs.forEach((p, k) => { p.one.position.x = k <= i ? -d : d; }); },
      };
      return api;
    }
    const dmgGroup = new THREE.Group(); scene.add(dmgGroup);
    const dna = helix(dmgGroup, P['strand-a'], P['strand-b']);
    const waters = [];
    {
      const wm = new THREE.MeshStandardMaterial({ color: 0x5c86b8, transparent: true, opacity: 0.45, depthWrite: false });
      for (let i = 0; i < 90; i++) { const p = new V3(rr(-22, 22), rr(-10, 10), rr(-7, 5)); if (Math.hypot(p.y, p.z) < 4.6) { i--; continue; } waters.push(mesh(atomGeo, wm, dmgGroup, p, 0.28)); }
    }
    addLabel('DNA double helix', 'strand-a', dmgGroup, new V3(-15, -5.4, 0), ['damage']);
    addLabel('Water around the DNA', 'radical', dmgGroup, new V3(13, 9.6, 0), ['damage']);
    function exposure() {
      clearAgents(); dna.heal();
      const hi = D.beam === 'alpha', oxy = D.oxygen === 'yes';
      const track = (from, to, color, r, dur, delay) => {
        fly(dmgGroup, color, r, [from, to], dur, { delay, shrinkEnd: false });
        for (let k = 1; k < (hi ? 16 : 4); k++) {
          const p = from.clone().lerp(to, k / (hi ? 16 : 4));
          later(delay + dur * k / (hi ? 16 : 4), () => fly(dmgGroup, C.atp, hi ? 0.34 : 0.24, [p, p.clone().add(randDir().multiplyScalar(1.6))], 0.7));
        }
      };
      const mark = (delay, i, kind, strand) => later(delay, () => { dna[kind](i, strand); const p = dna.pairs[i]; say(dmgGroup, kind === 'base' ? 'base damage' : kind === 'ssb' ? 'single-strand break' : 'double-strand break', P.lesion, new V3(p.x, 5.6, 2), 3.2, 0.95); });
      const radical = (delay, i, strand, then) => {      // water splits near the DNA and the radical drifts in
        const target = dna.pairs[i].pts[strand].clone();
        const start = target.clone().add(new V3(rr(-4, 4), Math.sign(target.y || 1) * rr(4.5, 6.5), rr(1, 4)));
        later(delay, () => { fly(dmgGroup, P.radical, 0.45, [start, start.clone().lerp(target, 0.5).add(randDir()), target], 1.5, { shrinkEnd: false }); });
        then(delay + 1.55);
      };
      if (hi) {
        const i = 22;
        track(new V3(-5, 14, 4), new V3(5, -14, -4), C.atp, 0.8, 1.5, 0.2);
        mark(0.95, i, 'dsb'); mark(1.0, i + 2, 'base', 1); mark(1.1, i - 2, 'base', 0); mark(1.2, i + 3, 'ssb', 0);
      } else {
        track(new V3(-24, 9, 3), new V3(-4, -11, 1), C.electron, 0.4, 1.4, 0.2);
        track(new V3(6, 13, -2), new V3(22, -9, 2), C.electron, 0.4, 1.4, 0.7);
        mark(1.0, 8, 'base', 0);                        // direct hit
        if (oxy) {
          radical(0.9, 17, 1, (d) => mark(d, 17, 'ssb', 1));
          radical(1.5, 30, 0, (d) => mark(d, 30, 'base', 0));
          radical(2.1, 36, 1, (d) => mark(d, 36, 'ssb', 1));
        } else {
          radical(0.9, 17, 1, (d) => mark(d, 17, 'ssb', 1));
          [30, 36].forEach((i, k) => radical(1.5 + k * 0.6, i, k, (d) => later(d, () => say(dmgGroup, 'restored', P.fix, new V3(dna.pairs[i].x, -5.8, 2), 2.4, 0.9))));
        }
      }
    }
    function later(sec, fn) { const at = now + sec; every(t => { if (t < at) return true; fn(); return false; }); }

    const repGroup = new THREE.Group(); scene.add(repGroup);
    const rdna = helix(repGroup, P['strand-a'], P['strand-b']);
    const sister = helix(repGroup, P.sister, P.sister);
    const MID = 21;
    addLabel('Damaged DNA', 'strand-a', repGroup, new V3(-16, 5.4, 0), ['repair']);
    const sisterTag = addLabel('Sister chromatid (template)', 'sister', repGroup, new V3(-8, -14.6, 0), ['repair']);
    function protein(label, from, to, delay, stay, size = 1.5) {
      const o = new THREE.Group(); mesh(atomGeo, std(P.fix, { transparent: true, opacity: 0.85 }), o, null, [size, size, size]);
      if (label) { const t = textSprite(label, new THREE.Color(0xd9ffe9), 1.15); t.position.set(0, size + 1, 2); t.material.depthTest = false; o.add(t); }
      travel(repGroup, o, [from, from.clone().lerp(to, 0.6).add(new V3(0, 1, 2)), to], 1.2, { delay, keep: true, ease: ease.out, onDone: () => later(stay, () => disposeObj(o)) });
    }
    const fixed = new Set();
    function startRepair() {
      clearAgents();
      repGroup.children.filter(o => !repGroup.userData.base.has(o)).forEach(disposeObj);
      rdna.heal(); sister.heal(); sister.gr.position.set(0, -10, -1); sister.gr.visible = false; sisterTag.el.dataset.off = '1';
      const route = repairRoute(D.lesion, D.rphase)[0];
      const outcome = parpOutcome(D.parpi === 'yes', D.brca === 'lost');
      const x = rdna.pairs[MID].x, at = new V3(x, 0, 0);
      const done = (when, text, color) => later(when, () => say(repGroup, text, color, new V3(0, 8.4, 2), 4, 1.5));
      if (route === 'BER') {
        rdna.base(MID, 0);
        protein('glycosylase', new V3(-18, 11, 4), new V3(x, 3.4, 2), 0.8, 1.2);
        later(2.4, () => { rdna.pairs[MID].bases[0].visible = false; });
        later(3.4, () => { rdna.pairs[MID].links[0].visible = false; });
        protein('polymerase', new V3(18, 11, 4), new V3(x, 3.4, 2), 3.4, 1.4);
        later(5.0, () => { rdna.pairs[MID].bases[0].visible = true; rdna.pairs[MID].bases[0].material = rdna.pairs[0].bases[1].material; });
        protein('ligase', new V3(-14, -11, 4), new V3(x, -3.4, 2), 5.4, 1.0);
        later(6.8, () => rdna.heal()); done(7.0, 'repaired accurately', P.fix);
      } else if (route === 'SSBR') {
        rdna.ssb(MID, 0);
        if (D.parpi === 'yes') {
          protein('PARP1 blocked', new V3(-18, 11, 4), new V3(x, 3.4, 2), 0.8, 9);
          later(3.2, () => say(repGroup, 'DNA copying reaches the break', C.electron, new V3(0, -8, 2), 2.6, 1.2));
          later(5.2, () => { rdna.dsb(MID); const t0 = now; every(t => { rdna.gap(MID, Math.min(1.2, (t - t0))); return t - t0 < 1.2; }); });
          if (outcome === 'dies') done(6.4, 'no BRCA: break not fixed, cell tends to die', P.gate);
          else { protein('BRCA + RAD51', new V3(18, -11, 4), new V3(x, -3.4, 2), 6.4, 1.8, 1.8); later(8.6, () => { rdna.heal(); }); done(8.8, 'rescued by recombination', P.fix); }
        } else {
          protein('PARP1', new V3(-18, 11, 4), new V3(x, 3.4, 2), 0.8, 1.6);
          protein('repair complex', new V3(18, 11, 4), new V3(x, 3.4, 2), 2.8, 2.0);
          later(5.2, () => rdna.heal()); done(5.4, 'repaired accurately', P.fix);
        }
      } else {
        rdna.dsb(MID);
        const t0 = now; every(t => { const u = t - t0; if (u > 1.2) return false; rdna.gap(MID, u * 1.1); return true; });
        if (route === 'NHEJ') {
          protein('Ku', new V3(-18, 11, 4), new V3(x - 1.5, 0, 0), 1.0, 5.0, 2.2); protein('Ku', new V3(18, 11, 4), new V3(x + 2.5, 0, 0), 1.0, 5.0, 2.2);
          later(3.6, () => [MID, MID + 1].forEach(i => { rdna.pairs[i].one.visible = false; }));
          protein('ligase IV', new V3(0, -13, 4), new V3(x + 0.5, -3.6, 2), 4.2, 2.0);
          later(6.0, () => { const t1 = now; every(t => { const u = Math.min(1, (t - t1) / 1.2); rdna.pairs.forEach((p, i) => { p.one.position.x = i < MID ? mix(-1.32, 1, u) : i > MID + 1 ? mix(1.32, -1, u) : p.one.position.x; }); return u < 1; }); });
          later(7.4, () => { rdna.pairs.forEach((p, i) => { p.bases.forEach(b => { b.material = rdna.pairs[0].bases[0].material; }); }); rdna.pairs[MID - 1].links.forEach(l => { l.visible = true; }); });
          done(7.6, 'joined, with a few bases lost', C.atp);
        } else {
          sister.gr.visible = true; delete sisterTag.el.dataset.off;
          if (D.brca === 'lost') {
            protein('ends cut back', new V3(-18, 11, 4), new V3(x - 2, 3.4, 2), 1.4, 1.6);
            later(3.6, () => say(repGroup, 'RAD51 cannot load properly', P.gate, new V3(0, -5, 4), 3, 1.2));
            done(4.6, 'accurate repair fails without BRCA1/2', P.gate);
          } else {
            protein('RAD51 + BRCA', new V3(-18, 11, 4), new V3(x - 2.4, 1.6, 2), 1.4, 5.0, 1.7);
            later(3.2, () => { const t1 = now; every(t => { const u = Math.min(1, (t - t1) / 1.3); sister.gr.position.y = mix(-10, -6.2, u); return u < 1; }); });
            for (let i = 0; i < 10; i++) fly(repGroup, P.sister, 0.45, [new V3(x + rr(-3, 3), -4, 1), new V3(x + rr(-2, 2), -1, 3), new V3(x + rr(-2, 2), rr(-1, 1), 0)], 1.4, { delay: 4.6 + i * 0.18 });
            later(7.0, () => { rdna.heal(); const t1 = now; every(t => { const u = Math.min(1, (t - t1) / 1.2); sister.gr.position.y = mix(-6.2, -10, u); return u < 1; }); });
            done(7.2, 'repaired using the sister copy', P.fix);
          }
        }
      }
    }
    repGroup.userData.base = new Set(repGroup.children);

    /* ================= CELL FATE ================= */
    const fateGroup = new THREE.Group(); scene.add(fateGroup);
    const fateTag = addLabel('Damaged cell', 'lesion', fateGroup, new V3(0, -11.6, 0), ['fate']);
    const fateLive = new THREE.Group(); fateGroup.add(fateLive);
    function makeCell(pos, scale = 1, damaged = true) {
      const o = new THREE.Group(); o.position.copy(pos); o.scale.setScalar(scale); fateLive.add(o);
      const shell = cellShell(6, P.g1), nuc = cellShell(2.7, C.nucleus); o.add(shell, nuc);
      const spots = [[-1, 0.8, 1.6], [0.9, -0.6, 1.8], [0.3, 1.4, 1.3], [-0.6, -1.2, 1.7]].map(p => mesh(atomGeo, atomMat(P.lesion), o, p, 0.34));
      spots.forEach(s => { s.visible = damaged; });
      return { o, shell, nuc, spots };
    }
    function startFate() {
      clearAgents();
      while (fateLive.children.length) disposeObj(fateLive.children[0]);
      const kind = cellFate(D.level, D.fp53 === 'yes');
      const c = makeCell(new V3(0, 0, 0), 1.15);
      if (D.level === 'high') [[1.6, 0.2, 1], [-1.6, -0.2, 1.2], [0, -1.8, 1.2]].forEach(p => c.spots.push(mesh(atomGeo, atomMat(P.lesion), c.o, p, 0.4)));
      const tag = (t) => { fateTag.el.querySelector('span').textContent = t; };
      const tween = (delay, dur, fn) => later(delay, () => { const t0 = now; every(t => { const u = Math.min(1, (t - t0) / dur); fn(ease.inOut(u)); return u < 1; }); });
      const divide = (delay, damaged) => later(delay, () => {
        disposeObj(c.o);
        const kids = [-1, 1].map(s => ({ s, c: makeCell(new V3(s * 2, 0, 0), 0.82, damaged) }));
        tween(0, 1.6, u => kids.forEach(k => { k.c.o.position.x = k.s * (2 + u * 5.6); }));
      });
      tag('Damage detected');
      if (kind === 'arrest') {
        later(0.8, () => { tag('p53 → p21: cycle paused'); say(fateGroup, 'paused', C.atp, new V3(0, 9.6, 3), 2.4, 1.5); });
        c.spots.forEach((s, i) => later(2.6 + i * 0.8, () => { s.visible = false; fly(fateGroup, P.fix, 0.5, [new V3(rr(-9, 9), rr(-7, 7), 5), s.position.clone().multiplyScalar(1.15)], 0.7); }));
        later(6.2, () => tag('Repaired: cycle resumes'));
        divide(7.0, false);
      } else if (kind === 'apoptosis') {
        later(0.8, () => tag('p53 switches on death genes'));
        tween(2.2, 1.6, u => { c.o.scale.setScalar(1.15 - u * 0.4); tint(c.shell, P.g1.clone().lerp(P.gate, u)); c.nuc.scale.setScalar(1 - u * 0.35); });
        later(4.2, () => {
          tag('Apoptosis: packaged into bodies'); disposeObj(c.o);
          for (let i = 0; i < 11; i++) { const b = new THREE.Group(); const sh = cellShell(rr(1, 2), P.gate); b.add(sh); mesh(atomGeo, atomMat(C.nucleus), b, null, 0.45); fateLive.add(b); const d = randDir(); d.z *= 0.3; travel(fateLive, b, [d.clone().multiplyScalar(2), d.clone().multiplyScalar(rr(7, 11))], 2.6, { keep: true, ease: ease.out, onDone: o => later(1.6, () => disposeObj(o)) }); }
        });
        later(8.6, () => { tag('Many cell types become senescent instead'); const s = makeCell(new V3(0, 0, 0), 0.9, true); tint(s.shell, P.senescent); tween(0, 1.6, u => s.o.scale.set(0.9 + u * 0.55, 0.9 - u * 0.05, 0.9 - u * 0.4)); });
      } else if (kind === 'mutant') {
        later(0.8, () => { tag('No p53: weak G1 brake'); say(fateGroup, 'carries on', P.lesion, new V3(0, 9.6, 3), 2.4, 1.5); });
        divide(3.0, true);
        later(5.4, () => tag('Both daughters may inherit errors'));
      } else {
        later(0.8, () => tag('No p53: enters mitosis damaged'));
        tween(2.4, 1.4, u => c.o.scale.set(1.15 + u * 0.25, 1.15 - u * 0.15, 1.15));
        later(4.0, () => {
          disposeObj(c.o);
          const parts = [[-6, 1, 0.72], [5, 2.4, 0.55], [3.5, -4.4, 0.34], [-1, -5.6, 0.24]];
          parts.forEach(([x, y, s]) => { const k = makeCell(new V3(0, 0, 0), s, true); tween(0, 1.8, u => k.o.position.set(x * u, y * u, 0)); tween(2.4, 1.6, u => tint(k.shell, P.g1.clone().lerp(P.gate, u))); });
          tag('Mitotic catastrophe: unequal fragments');
        });
      }
    }

    /* ================= SURVIVAL FIELD ================= */
    const surGroup = new THREE.Group(); scene.add(surGroup);
    const field = [];
    {
      const order = Array.from({ length: 100 }, (_, i) => i);
      for (let i = 99; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const geo = new THREE.SphereGeometry(0.92, 20, 16);
      for (let i = 0; i < 100; i++) {
        const mat = std(P.g1);
        const o = mesh(geo, mat, surGroup, [(i % 10 - 4.5) * 2.4, (4.5 - Math.floor(i / 10)) * 2.4, 0]);
        field.push({ o, mat, rank: order[i], v: 1 });
      }
    }
    const surTag = addLabel('100 cells', 'g1', surGroup, new V3(0, -13.8, 0), ['survival']);
    function surTick(t, dt) {
      const tm = TISSUE[D.tissue], d = +D.frac, alive = Math.round(survival(d, d, tm.a, tm.b) * 100);
      surTag.el.querySelector('span').textContent = `${alive} of 100 can still divide after one ${d} Gy fraction`;
      field.forEach((f) => {
        f.v += ((f.rank < alive ? 1 : 0) - f.v) * Math.min(1, dt * 4);
        const c = P.dead.clone().lerp(P.g1, f.v);
        f.mat.color.copy(c); f.mat.emissive.copy(c); f.mat.emissiveIntensity = 0.06 + f.v * 0.3;
        f.o.scale.setScalar(0.6 + f.v * 0.4);
      });
    }

    /* ================= INVERSE SQUARE ================= */
    const doseGroup = new THREE.Group(); scene.add(doseGroup);
    const SRCPOS = new V3(-13, 0, 0), M = 5;
    { const s = dot(C.atp, 0.8, 5); s.position.copy(SRCPOS); doseGroup.add(s); }
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), fresnelMat(C.membrane, 0.9, 2)); shell.position.copy(SRCPOS); doseGroup.add(shell);
    const badge = mesh(new THREE.BoxGeometry(0.5, 2.2, 2.2), std(P.g1), doseGroup);
    for (let m_ = 1; m_ <= 5; m_++) { mesh(atomGeo, atomMat(P.senescent), doseGroup, [SRCPOS.x + m_ * M, -9, 0], 0.22); const tx = textSprite(`${m_} m`, new THREE.Color(0xaab6c8), 1.1); tx.position.set(SRCPOS.x + m_ * M, -10.4, 0); doseGroup.add(tx); }
    const RAYS = Array.from({ length: 46 }, () => { const d = randDir(); d.z *= 0.35; return d.normalize(); });
    const badgeTag = addLabel('Detector: 100%', 'g1', doseGroup, new V3(-8, 3, 0), ['dose']);
    const dose = { next: 0, r: M };
    function doseTick(t, dt) {
      dose.r += (D.dist * M - dose.r) * Math.min(1, dt * 4);
      shell.scale.setScalar(dose.r);
      badge.position.set(SRCPOS.x + dose.r, 0, 0);
      badgeTag.anchor.set(SRCPOS.x + dose.r, 3, 0);
      const rel = inverseSquare(D.dist) * 100;
      badgeTag.el.querySelector('span').textContent = `Detector: ${rel >= 10 ? Math.round(rel) : rel.toFixed(1)}% of 1 m`;
      if (t > dose.next) { dose.next = t + 0.16; const d = RAYS[Math.floor(rnd() * RAYS.length)]; fly(doseGroup, C.atp, 0.22, [SRCPOS.clone(), SRCPOS.clone().add(d.clone().multiplyScalar(27))], 2.4); }
    }

    /* ================= camera and behaviors ================= */
    /* ================= APOPTOSIS (not to scale) ================= */
    const apoGroup = new THREE.Group(); scene.add(apoGroup);
    const apoBehavior = (() => {
      const A = {};
      ['g1', 'mito', 'cytc', 'caspase', 'nucleus', 'mono', 'lymph', 'neut', 'atp', 'proton', 'fat'].forEach(k => A[k] = col(k));
      const R = 6;
      const cell = new THREE.Group(); apoGroup.add(cell);
      const shell = cellShell(R, A.g1); cell.add(shell);
      const nucG = new THREE.Group(); nucG.position.set(0.6, 0.4, 0); cell.add(nucG);
      const nucMat = std(A.nucleus, { emissiveIntensity: 0.25, transparent: true, opacity: 0.85 });
      const nucBody = mesh(new THREE.SphereGeometry(2.3, 40, 30), nucMat, nucG);
      const frags = [[-0.9, 0.6, 0.3], [0.8, 0.7, -0.4], [0.5, -0.8, 0.6], [-0.6, -0.7, -0.5]].map(q => mesh(new THREE.SphereGeometry(0.8, 20, 16), std(A.nucleus.clone().multiplyScalar(0.7), { emissiveIntensity: 0.4 }), nucG, q));
      const mitoGeo = new THREE.CapsuleGeometry(0.45, 1.3, 6, 12), mitoMat = std(A.mito, { emissiveIntensity: 0.35 });
      const MITO = [[-3.4, 1.8, 1.2], [-2.6, -2.6, 0.8], [3.2, -2.2, 1.5], [-3.6, -0.4, -2.2], [2.4, 2.8, -1.6], [0.2, -3.6, -1.8]].map(q => new V3(...q));
      const mitos = MITO.map((p, i) => { const m = mesh(mitoGeo, mitoMat, cell, p); m.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3)); return m; });
      const pores = MITO.map(p => { const t = mesh(new THREE.TorusGeometry(0.32, 0.09, 6, 14), std(A.proton, { emissiveIntensity: 0.6 }), cell, p.clone().add(new V3(0, 0.75, 0.3))); return t; });
      const cytc = Array.from({ length: 36 }, (_, i) => { const d = dot(A.cytc, 0.13, 0.6); cell.add(d); d.userData = { from: MITO[i % 6], dir: randDir(), sp: rr(1.4, 3) }; return d; });
      const someCyt = new Set([0, 1, 2, 6, 7, 12]);
      const apoCenter = new V3(0.5, -1.8, 2.6);
      const wheel = Array.from({ length: 7 }, (_, k) => { const a = k / 7 * Math.PI * 2; const o = mesh(atomGeo, std(A.cytc.clone().lerp(new THREE.Color(0xffffff), 0.3), { emissiveIntensity: 0.4 }), cell, null, 0.32); o.userData = { at: apoCenter.clone().add(new V3(Math.cos(a) * 0.85, Math.sin(a) * 0.85, 0)), from: randDir().multiplyScalar(rr(2, 4)) }; return o; });
      const hub = glow(A.caspase, 2.2); hub.position.copy(apoCenter); cell.add(hub);
      const casp = Array.from({ length: 28 }, (_, i) => { const m = mesh(new THREE.TetrahedronGeometry(0.22), std(A.caspase, { emissiveIntensity: 0.7 }), cell); m.userData = { dir: randDir(), r: rr(1.5, 5), ph: rr(0, 6) }; return m; });
      const blebs = Array.from({ length: 12 }, () => { const d = randDir(); const m = mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: A.g1, transparent: true, opacity: 0.12, depthWrite: false }), cell, d.clone().multiplyScalar(R)); m.userData = { d }; return m; });
      const bodies = Array.from({ length: 5 }, (_, i) => {
        const g_ = new THREE.Group(); apoGroup.add(g_);
        g_.add(cellShell(1.7, A.g1));
        mesh(new THREE.SphereGeometry(0.6, 16, 12), std(A.nucleus.clone().multiplyScalar(0.7), { emissiveIntensity: 0.4 }), g_, [0.2, 0.1, 0]);
        for (let k = 0; k < 4; k++) mesh(atomGeo, atomMat(A.atp), g_, randDir().multiplyScalar(1.7), 0.12);
        const a = i / 5 * Math.PI * 2;
        g_.userData = { home: new V3(Math.cos(a) * 2.6, Math.sin(a) * 2.6, (i % 2 ? 1 : -1) * 1.2), out: new V3(Math.cos(a) * 4.6, Math.sin(a) * 4.2, (i % 2 ? 1 : -1) * 1.8) };
        return g_;
      });
      const macro = new THREE.Group(); apoGroup.add(macro);
      macro.add(new THREE.Mesh(new THREE.SphereGeometry(5, 40, 30), new THREE.MeshStandardMaterial({ color: A.mono, transparent: true, opacity: 0.16, depthWrite: false })));
      macro.add(new THREE.Mesh(new THREE.SphereGeometry(5, 40, 30), fresnelMat(A.mono, 1.1, 2.3)));
      mesh(new THREE.TorusGeometry(1.8, 1.1, 14, 30, 4), std(new THREE.Color(0x6d4bd0), { emissiveIntensity: 0.3 }), macro, [-1.2, 0, 0]);
      const tcell = new THREE.Group(); apoGroup.add(tcell);
      tcell.add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 24), new THREE.MeshStandardMaterial({ color: A.lymph, transparent: true, opacity: 0.2, depthWrite: false })));
      tcell.add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 24), fresnelMat(A.lymph, 1.1, 2.3)));
      mesh(new THREE.SphereGeometry(1.9, 24, 18), std(new THREE.Color(0x6d4bd0), { emissiveIntensity: 0.3 }), tcell, [0.3, 0, 0]);
      const contact = new V3(R * 0.94, 1.2, 0);
      const receptors = Array.from({ length: 6 }, (_, k) => { const s = mesh(stick, std(A.lymph, { emissiveIntensity: 0.5 }), cell); const off = new V3(0, (k - 2.5) * 0.45, (k % 2 ? 0.4 : -0.4)); setStick(s, contact.clone().add(off), contact.clone().add(off).add(new V3(0.9, 0, 0)), 0.08); return s; });
      const disc = glow(A.caspase, 2.4); disc.position.copy(contact).add(new V3(-0.8, 0, 0)); cell.add(disc);
      const spill = Array.from({ length: 44 }, (_, i) => { const d = dot([A.mito, A.atp, A.nucleus, A.fat][i % 4], 0.16, 0.5); apoGroup.add(d); d.userData = { dir: randDir(), sp: rr(1.5, 4.5) }; return d; });
      const shards = Array.from({ length: 12 }, (_, i) => { const geo = new THREE.SphereGeometry(R, 12, 8, rr(0, 6), 0.8, rr(0.4, 2.4), 0.7); const m = new THREE.Mesh(geo, fresnelMat(A.g1, 1.0, 2.5)); apoGroup.add(m); m.userData = { dir: randDir(), spin: rr(-1, 1) }; return m; });
      const neuts = Array.from({ length: 3 }, (_, i) => { const g_ = new THREE.Group(); apoGroup.add(g_); g_.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 18), fresnelMat(A.neut, 1.1, 2.3))); g_.add(new THREE.Mesh(new THREE.SphereGeometry(1.8, 24, 18), new THREE.MeshStandardMaterial({ color: A.neut, transparent: true, opacity: 0.2, depthWrite: false }))); const a = i / 3 * Math.PI * 2 + 0.6; g_.userData = { from: new V3(Math.cos(a) * 18, Math.sin(a) * 12, 4), to: new V3(Math.cos(a) * 8.5, Math.sin(a) * 7, 2) }; return g_; });
      const flames = Array.from({ length: 8 }, (_, i) => { const s = glow(A.proton, 7); const a = i / 8 * Math.PI * 2; s.position.set(Math.cos(a) * 7, Math.sin(a) * 6, -1); apoGroup.add(s); return s; });
      const hold = (name, color, parent, at) => { const h = new THREE.Group(); parent.add(h); addLabel(name, color, h, at, ['apoptosis']); return h; };
      const L = {
        mito: hold('Mitochondrion', 'mito', cell, MITO[0].clone().add(new V3(0, 1.2, 0))),
        nuc: hold('Nucleus', 'nucleus', nucG, new V3(0, 2.9, 0)),
        cytc: hold('Cytochrome c', 'cytc', cell, new V3(-4.5, 3, 2)),
        apo: hold('Apoptosome · caspase-9', 'caspase', cell, apoCenter.clone().add(new V3(0, -1.3, 0))),
        casp: hold('Caspases 3 and 7', 'caspase', cell, new V3(3.2, 3.8, 2)),
        bodies: hold('Apoptotic bodies', 'g1', apoGroup, new V3(0, -6.6, 0)),
        macro: hold('Macrophage', 'mono', macro, new V3(0, 5.6, 0)),
        tcell: hold('T cell · Fas ligand', 'lymph', tcell, new V3(0, 3.2, 0)),
        rec: hold('Death receptors · caspase-8', 'caspase', cell, contact.clone().add(new V3(-0.6, -1.6, 0))),
        spill: hold('Spilled contents', 'atp', apoGroup, new V3(-8, -5, 0)),
        neut: hold('Neutrophils', 'neut', apoGroup, new V3(9, 8, 2)),
      };
      const clamp = (x) => Math.max(0, Math.min(1, x));
      const seg = (T, a, b) => clamp((T - a) / (b - a));
      const st = { elapsed: 0, key: '' };
      function pose(path, T) {
        const nec = path === 'necrosis', ext = path === 'extrinsic', apo = !nec;
        Object.values(L).forEach(h => { h.visible = false; });
        // shared reset
        cell.visible = true; shell.visible = true; cell.scale.setScalar(1);
        mitos.forEach(m => m.scale.setScalar(1));
        nucBody.visible = true; nucBody.scale.setScalar(1); nucMat.opacity = 0.85; frags.forEach(f => { f.visible = false; });
        [pores, cytc, wheel, casp, blebs, receptors, bodies, spill, shards, neuts, flames].forEach(list => list.forEach(o => { o.visible = false; }));
        hub.visible = false; disc.visible = false; macro.visible = false; tcell.visible = false;
        L.nuc.visible = T < 9; L.mito.visible = T < 5;
        if (apo) {
          if (ext) {
            tcell.visible = T < 11;
            tcell.position.copy(new V3(13, 1.2, 0).lerp(new V3(R + 2.7, 1.2, 0), ease.out(seg(T, 0, 2))));
            L.tcell.visible = T < 9;
            receptors.forEach(r => { r.visible = T > 2; });
            disc.visible = T > 3 && T < 9; disc.material.opacity = 0.5 + 0.4 * Math.sin(T * 6);
            L.rec.visible = T > 2.5 && T < 7;
          }
          const poreT = ext ? 5 : 2.5, cytT = ext ? 5.6 : 3.5;
          pores.forEach(p => { p.visible = T > poreT && T < 12; p.scale.setScalar(Math.max(0.01, seg(T, poreT, poreT + 1))); });
          cytc.forEach((d, i) => {
            if (ext && !someCyt.has(i)) return;
            if (T < cytT || T > 12) return;
            d.visible = true;
            const u = seg(T, cytT, cytT + 2.4), toWheel = !ext && T > 5.5;
            const p = d.userData.from.clone().add(d.userData.dir.clone().multiplyScalar(u * d.userData.sp));
            if (toWheel && i < 7) p.lerp(wheel[i].userData.at, seg(T, 5.5, 6.8));
            d.position.copy(p);
          });
          L.cytc.visible = T > cytT && T < 7;
          if (!ext) {
            wheel.forEach(w => { w.visible = T > 5.5 && T < 12; w.position.copy(apoCenter.clone().add(w.userData.from).lerp(w.userData.at, ease.inOut(seg(T, 5.5, 6.8)))); });
            hub.visible = T > 6.6 && T < 11; hub.material.opacity = 0.6 + 0.3 * Math.sin(T * 5);
            L.apo.visible = T > 6 && T < 9;
          }
          const castT = ext ? 4.5 : 7, src = ext ? contact.clone().add(new V3(-0.8, 0, 0)) : apoCenter;
          casp.forEach(c => {
            if (T < castT || T > 12) return;
            c.visible = true;
            const u = ease.out(seg(T, castT, castT + 2.2));
            c.position.copy(src.clone().lerp(c.userData.dir.clone().multiplyScalar(c.userData.r), u));
            c.rotation.set(T * 3 + c.userData.ph, T * 2, 0);
          });
          L.casp.visible = T > castT + 0.5 && T < 11;
          const shrink = 1 - 0.18 * seg(T, 9, 11.5);
          cell.scale.setScalar(shrink);
          const pyk = seg(T, 9, 10.5);
          nucBody.scale.setScalar(1 - 0.45 * pyk); nucMat.opacity = 0.85 + 0.15 * pyk;
          if (T > 10.5) { nucBody.visible = false; frags.forEach((f, k) => { f.visible = true; f.position.copy(new V3(...[[-0.9, 0.6, 0.3], [0.8, 0.7, -0.4], [0.5, -0.8, 0.6], [-0.6, -0.7, -0.5]][k]).multiplyScalar(1 + 0.8 * seg(T, 10.5, 11.5))); }); }
          const bleb = seg(T, 10, 11) * (1 - seg(T, 11.8, 12));
          blebs.forEach((b, k) => { b.visible = bleb > 0.01; b.scale.setScalar(Math.max(0.01, bleb * (0.9 + 0.5 * Math.abs(Math.sin(T * 4 + k))))); });
          if (T > 12) {
            cell.visible = false;
            const eat = seg(T, 14, 15.6);
            const mPos = new V3(-16, -1, 0).lerp(new V3(-1, 0, 0), ease.inOut(seg(T, 12.4, 14.4)));
            macro.visible = true; macro.position.copy(mPos); L.macro.visible = true;
            bodies.forEach(b => { b.visible = eat < 0.98; const p = b.userData.home.clone().lerp(b.userData.out, seg(T, 12, 13)); b.position.copy(p.lerp(mPos.clone().add(new V3(0.6, 0, 0)), eat)); b.scale.setScalar(Math.max(0.01, 1 - 0.6 * eat)); });
            L.bodies.visible = T < 14.2;
          }
        } else {
          const swell = 1 + 0.35 * seg(T, 0, 3);
          cell.scale.setScalar(swell); mitos.forEach(m => m.scale.setScalar(1 + 0.6 * seg(T, 0, 3)));
          if (T > 3) {
            shell.visible = false;
            shards.forEach(s => { s.visible = true; s.position.copy(s.userData.dir.clone().multiplyScalar(seg(T, 3, 6) * 5)); s.rotation.set(T * s.userData.spin, T * s.userData.spin * 0.7, 0); s.scale.setScalar(swell); });
            spill.forEach(d => { d.visible = true; d.position.copy(d.userData.dir.clone().multiplyScalar(2 + seg(T, 3.4, 8) * d.userData.sp * 2.2)); });
            nucMat.opacity = 0.85 * (1 - 0.8 * seg(T, 3.6, 7)); L.spill.visible = true;
          }
          neuts.forEach(n => { n.visible = T > 5.5; n.position.copy(n.userData.from.clone().lerp(n.userData.to, ease.out(seg(T, 5.5, 9.5)))); });
          L.neut.visible = T > 6.5;
          flames.forEach((f, k) => { f.visible = T > 5; f.material.opacity = 0.18 * seg(T, 5, 8) * (0.7 + 0.3 * Math.sin(T * 2 + k)); });
        }
      }
      function update() {
        const path = LESSON['dv-death'] || 'intrinsic';
        const T = reduceMotion ? (path === 'necrosis' ? 8 : 10.8) : st.elapsed % 17.5;
        pose(path, Math.min(T, 16));
        const text = apoText(path, Math.min(T, 16));
        if (text !== st.key) { st.key = text; const el = $('#apoCaption'); if (el) el.textContent = text; }
      }
      whenLesson('dv-death', () => { st.elapsed = 0; });
      return {
        enter() { st.elapsed = 0; st.key = ''; update(); },
        tick(t, dt) { if (!reduceMotion) st.elapsed += dt; update(); },
        reset() { st.elapsed = 0; G3.goStage('apoptosis'); update(); },
      };
    })();

    const POSES = {
      cycle: { pos: new V3(0, 0, 50), target: new V3(3, 0, 0), group: 'cycle', w: 21 },
      mitosis: { pos: new V3(0, 3, 50), target: new V3(0, -0.5, 0), group: 'mitosis', w: 19 },
      damage: { pos: new V3(0, 4, 50), target: new V3(0, 0, 0), group: 'dna', w: 23 },
      repair: { pos: new V3(0, 2, 56), target: new V3(0, -3, 0), group: 'repair', w: 24 },
      fate: { pos: new V3(0, 0, 50), target: new V3(0, -1, 0), group: 'fate', w: 16 },
      apoptosis: { pos: new V3(-6, 6, 44), target: new V3(0, 0, 0), group: 'apoptosis', w: 12.5 },
      survival: { pos: new V3(0, 0, 50), target: new V3(0, -0.8, 0), group: 'survival', w: 15 },
      dose: { pos: new V3(0, 3, 56), target: new V3(0, -1.5, 0), group: 'dose', w: 18 },
    };
    const enter = (id, extra) => () => { current = id; renderRead(); if (extra) extra(); };
    const B = {
      apoptosis: apoBehavior,
      cycle: { enter: enter('cycle', () => { cyc.u = 0.05; cyc.g0 = 0; }), tick: cycTick },
      mitosis: { enter: enter('mitosis', () => { D.phase = 0; mit.s = 0; mit.since = 0; mit.shown = -1; D.play = !reduceMotion; syncMitosis(); renderRead(); }), tick: mitTick },
      damage: { enter: enter('damage', () => { exposure(); B.damage.next = now + 9; }), tick(t) { if (t > this.next) { this.next = t + 9; exposure(); } } },
      repair: { enter: enter('repair', () => { startRepair(); B.repair.next = now + 14; }), tick(t) { if (t > this.next) { this.next = t + 14; startRepair(); } sisterTag.stages = sisterTag.el.dataset.off ? [] : ['repair']; } },
      fate: { enter: enter('fate', () => { startFate(); B.fate.next = now + 15; }), tick(t) { if (t > this.next) { this.next = t + 15; startFate(); } } },
      survival: { enter: enter('survival'), tick: surTick },
      dose: { enter: enter('dose', () => { dose.next = 0; }), tick: doseTick },
    };
    onChange = (name) => {
      const id = current;
      if (id === 'damage' && ['beam', 'oxygen', 'fire'].includes(name)) { exposure(); B.damage.next = now + 9; }
      if (id === 'repair' && ['lesion', 'rphase', 'parpi', 'brca', 'replay'].includes(name)) { startRepair(); B.repair.next = now + 14; }
      if (id === 'fate' && ['level', 'fp53', 'replay'].includes(name)) { startFate(); B.fate.next = now + 15; }
      if (id === 'mitosis' && name === 'attach') { mit.since = 0; if (D.attach !== 'ok' && D.phase > 3) { D.phase = 3; mit.s = 3; } renderRead(); }
    };

    return {
      groups: { cycle: cycGroup, mitosis: mitGroup, dna: dmgGroup, repair: repGroup, fate: fateGroup, apoptosis: apoGroup, survival: surGroup, dose: doseGroup },
      unitsPerNm: { mitosis: 0.001, dna: 1 / 0.34, repair: 1 / 0.34 },
      fog: { cycle: 0.002, mitosis: 0.003, dna: 0.004, repair: 0.003, fate: 0.002, apoptosis: 0.002, survival: 0.001, dose: 0.002 },
      depth: { cycle: 0.8, mitosis: 1.2, dna: 4, repair: 4.2, fate: 1.1, apoptosis: 1.15, survival: 0.9, dose: -0.5 },
      poses: POSES, behaviors: B,
    };
  },
});
})();
