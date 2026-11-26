/* Hormones and endocrine signaling: one module, two parts.
   Part 1 (this IIFE's top half): insulin and glucose, from the islet and beta cell to muscle GLUT4, diabetes and FDG-PET preparation.
   Part 2 (ENDOCRINE below): the gland map, endocrine versus exocrine secretion, receptor classes, sex-hormone patterns and feedback.
   The two parts keep their own 3D builders; register() at the bottom interleaves their chapters into one story. */
(() => {
'use strict';

/* ================================================================
   State and rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
// Pancreatic beta cell: what each link of the chain does for a given glucose level and drug.
function betaState(glucose, drug) {
  const fed = glucose === 'high';
  const closed = drug === 'sulf' ? true : drug === 'diaz' ? false : fed;   // KATP channel
  const release = !closed ? 'none' : drug === 'glp1' && fed ? 'strong' : 'normal';
  return { metabolism: fed, closed, depolarized: closed, calcium: closed, release };
}
// Muscle cell: share of GLUT4 vesicles drawn at the surface (out of 6). Illustrative, not measured.
function glutState(stimulus, resistant) {
  if (stimulus === 'exercise') return { surface: 5, insulinPath: false, exercisePath: true, blocked: false };
  if (stimulus === 'insulin') return { surface: resistant ? 2 : 6, insulinPath: true, exercisePath: false, blocked: resistant };
  return { surface: 1, insulinPath: false, exercisePath: false, blocked: false };
}
/*RULES-END*/

const H = { meal: 'fed', glucose: 'low', drug: 'none', stim: 'rest', resist: 'no', fuel: 'fed', dtype: 'healthy', pet: 'ready' };
let betaSince = 0;                 // when the beta cell inputs last changed (3D clock)
let betaLit = 7;                   // how many links of the chain have "arrived"

const CONTROLS = {
  meal: [['fed', 'After a meal'], ['fasting', 'Between meals']],
  glucose: [['low', 'Low glucose'], ['high', 'High glucose']],
  drug: [['none', 'No drug'], ['sulf', 'Sulfonylurea'], ['diaz', 'Diazoxide'], ['glp1', 'GLP-1 agonist']],
  stim: [['rest', 'Rest, fasting'], ['insulin', 'Insulin'], ['exercise', 'Exercise']],
  resist: [['no', 'Insulin sensitive'], ['yes', 'Insulin resistant']],
  fuel: [['fed', 'Fed'], ['fasting', 'Fasting']],
  dtype: [['healthy', 'No diabetes'], ['t1', 'Type 1'], ['t2', 'Type 2']],
  pet: [['ready', 'Well prepared'], ['insulin', 'Recent meal or insulin'], ['exercise', 'Recent exercise'], ['cold', 'Feeling cold'], ['metformin', 'On metformin']],
};
const LABELS = { meal: 'Timing', glucose: 'Blood glucose', drug: 'Drug', stim: 'Signal to the muscle cell', resist: 'Cell’s response to insulin', fuel: 'State', dtype: 'Compare', pet: 'Preparation' };
const seg = (name) => `<div><div class="eyebrow seg-label">${LABELS[name]}</div><div class="seg" role="group" aria-label="${LABELS[name]}">${CONTROLS[name].map(([v, t]) =>
  `<button type="button" class="btn${H[name] === v ? ' on' : ''}" data-ctl="${name}" data-val="${v}" aria-pressed="${H[name] === v}">${t}</button>`).join('')}</div></div>`;

const row = (label, value, on) => `<li class="${on ? 'on' : ''}"><span>${label}</span><b>${value}</b></li>`;
const READ = {
  islet() {
    return H.meal === 'fed'
      ? `<p><b>Glucose is arriving.</b> Beta cells release ${m('insulin', 'insulin')} into the capillary. Alpha cells quiet down.</p>`
      : `<p><b>Glucose is scarcer.</b> Insulin output falls and alpha cells release ${m('glucagon', 'glucagon')}, which tells the liver to supply glucose.</p>`;
  },
  beta() {
    const s = betaState(H.glucose, H.drug), n = betaLit;
    const items = [
      ['1 · Glucose enters (GLUT1)', s.metabolism ? 'faster' : 'slow', s.metabolism],
      ['2 · Glucokinase traps it', s.metabolism ? 'fast' : 'slow', s.metabolism],
      ['3 · Mitochondria: ATP-to-ADP ratio', s.metabolism ? 'rises' : 'low', s.metabolism],
      ['4 · K-ATP channel', s.closed ? 'closed' : 'open', s.closed],
      ['5 · Membrane', s.depolarized ? 'depolarized' : 'resting', s.depolarized],
      ['6 · Calcium channels', s.calcium ? 'open, Ca²⁺ in' : 'closed', s.calcium],
      ['7 · Insulin release', s.release === 'none' ? 'little' : s.release === 'strong' ? 'boosted' : 'yes', s.release !== 'none'],
    ];
    const why = {
      none: H.glucose === 'high' ? 'High glucose means more ATP, which closes the channel and triggers release.' : 'With little glucose, the channel stays open and potassium keeps leaking out, so the cell stays quiet.',
      sulf: H.glucose === 'high' ? 'The drug closes the channel directly. Here glucose is closing it too.' : '<b>The drug closes the channel even though glucose is low.</b> That is why sulfonylureas can cause hypoglycemia.',
      diaz: 'Diazoxide holds the channel open, so release is suppressed even with high glucose. It is used for some conditions with too much insulin.',
      glp1: H.glucose === 'high' ? 'GLP-1 signaling raises cAMP and <b>amplifies</b> the release that glucose has already triggered.' : 'With low glucose there is little to amplify. This glucose dependence is why GLP-1 drugs alone rarely cause hypoglycemia.',
    }[H.drug];
    return `<ol class="chain">${items.map(([a, b, on], i) => (i < n ? row(a, b, on) : row(a, '…', false))).join('')}</ol><p>${why}</p>`;
  },
  receptor() {
    const g = glutState(H.stim, H.resist === 'yes');
    const text = H.stim === 'rest' ? 'Most GLUT4 waits inside the cell on vesicles, so little glucose gets in through it.'
      : H.stim === 'exercise' ? 'Contraction moves GLUT4 to the surface by a route that does <b>not</b> need PI3K. AMP-activated protein kinase (AMPK) is one of the signals involved, and the details are less settled than for insulin.' + (H.resist === 'yes' ? ' This route largely still works in type 2 diabetes.' : '')
        : g.blocked ? '<b>Insulin arrives, but the signal is weakened</b> inside the cell. Fewer vesicles reach the surface, so more glucose stays in the blood.'
          : 'Insulin starts a relay that releases the brake on GLUT4 vesicles. They fuse with the membrane and glucose flows in.';
    return `<ol class="chain">${row('Insulin relay (IRS → PI3K → Akt)', g.insulinPath ? (g.blocked ? 'weakened' : 'active') : 'quiet', g.insulinPath && !g.blocked)}${row('Exercise signals (AMPK and others)', g.exercisePath ? 'active' : 'quiet', g.exercisePath)}${row('GLUT4 at the surface', g.surface > 3 ? 'many' : g.surface > 1 ? 'some' : 'few', g.surface > 3)}</ol><p>${text}</p>`;
  },
  balance() {
    const fed = H.fuel === 'fed';
    const rows = [
      ['Liver', fed ? 'Takes up glucose and stores glycogen. Output of new glucose is switched down.' : 'Releases glucose, first from glycogen and increasingly by gluconeogenesis.'],
      ['Muscle', fed ? 'Takes up glucose through GLUT4 and stores it as glycogen for its own use.' : 'Burns more fatty acids. Can supply amino acids to the liver, but cannot release free glucose.'],
      ['Fat', fed ? 'Takes up glucose and stores triglyceride. Insulin restrains fat breakdown.' : 'Breaks down triglyceride into fatty acids and glycerol.'],
      ['Brain', fed ? 'Takes up glucose without needing insulin.' : 'Still needs a steady glucose supply. In long fasting it also uses ketone bodies.'],
    ];
    return `<p>${fed ? `${m('Insulin', 'insulin')} is high: the message is <b>store</b>.` : `Insulin is low and ${m('glucagon', 'glucagon')} is higher: the message is <b>supply</b>.`}</p><dl class="organ">${rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`;
  },
  diabetes() {
    return {
      healthy: '<p>After a meal, beta cells release insulin, tissues take up glucose and blood levels settle again.</p>',
      t1: '<p><b>Type 1:</b> the immune system destroys beta cells. Little or no insulin is made, so <b>insulin treatment is essential</b>. Without it, glucose builds up and fat breakdown can run away into ketoacidosis. C-peptide is low.</p>',
      t2: '<p><b>Type 2:</b> tissues resist insulin and beta cells cannot keep up. Insulin levels may be high early on, and beta cell function tends to decline over time. It is the most common form.</p>',
    }[H.dtype];
  },
  petprep() {
    return {
      ready: '<p><b>Fasted, rested, warm and hydrated.</b> Insulin is low, so muscle takes up little FDG and the lesion stands out. The brain, kidneys and bladder are still bright, and heart uptake varies.</p>',
      insulin: '<p><b>High insulin</b> drives FDG into muscle, including the heart. Less is left for the lesion, and the scan can be hard to interpret.</p>',
      exercise: '<p><b>Recently worked muscles</b> take up extra FDG and can hide or mimic disease.</p>',
      cold: '<p><b>Brown fat</b> burns fuel to make heat and can light up, often around the neck and above the collarbones. Warmth reduces this.</p>',
      metformin: '<p><b>Metformin</b> can increase FDG activity in the bowel, which can complicate reading the abdomen.</p>',
    }[H.pet];
  },
};

let currentChapter = 'islet';
function renderRead() { const el = $('#hRead'); if (el) el.innerHTML = READ[currentChapter](); }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-ctl]'); if (!b) return;
  const name = b.dataset.ctl;
  H[name] = b.dataset.val;
  document.querySelectorAll(`[data-ctl="${name}"]`).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  if (name === 'glucose' || name === 'drug') { betaSince = now; betaLit = G ? 0 : 7; }
  renderRead();
});
let G = false;                      // true once the 3D scene exists

const panel = (id, ...names) => { currentChapter = id; return `<div class="lab">${names.map(seg).join('')}<div class="readout" id="hRead" aria-live="polite">${READ[id]()}</div></div>`; };
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, extra = '') => `<p class="credit">Sources: ${items.join(' · ')}. ${extra}</p>`;
const SRC = {
  human: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC185903/', 'glucose sensing in human beta cells'),
  glut12: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC11262048/', 'GLUT1 and GLUT2 in human beta cells'),
  secretion: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC5890906/', 'Ashcroft and Rorsman 2012, beta cells and diabetes review'),
  glp1: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC3556522/', 'GLP-1 receptor review'),
  neonatal: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC5582192/', 'K-ATP channel neonatal diabetes'),
  glut4: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC2789346/', 'insulin and GLUT4 review'),
  exercise: link('https://www.ncbi.nlm.nih.gov/books/NBK537322/', 'StatPearls'),
  t2ex: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC9277643/', 'exercise in type 2 diabetes'),
  ada: link('https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes', 'ADA Standards of Care 2026, section 2'),
  eanm: link('https://doi.org/10.1007/s00259-014-2961-x', 'EANM FDG PET/CT tumor imaging guideline, version 2.0 (2015)'),
  eanm3: link('https://doi.org/10.1016/j.eanmj.2025.100006', 'EANM guideline version 3.0 (2025), not reviewed for this page'),
  ajr: link('https://doi.org/10.2214/AJR.26.34744', 'AJR Expert Panel review on FDG-PET preparation (2026), abstract only'),
  niddk: link('https://www.niddk.nih.gov/health-information/diabetes/overview/tests-diagnosis', 'NIDDK, diabetes tests and diagnosis (reviewed 2022)'),
  gck: link('https://doi.org/10.2337/dc14-2769', 'Chakera et al. 2015, glucokinase (GCK) diabetes'),
  viability: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC6000987/', 'myocardial FDG viability imaging'),
  exendin: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC5227553/', 'exendin PET for insulinoma'),
};

const INSULIN_CHAPTERS = [
  {
    id: 'islet', short: 'Islet', where: 'An islet in the pancreas · about 100 µm across',
    title: 'The islet: a fuel gauge for the whole body',
    legend: [['insulin', 'Beta cell & insulin'], ['glucagon', 'Alpha cell & glucagon'], ['lyso', 'Delta cell'], ['glucose', 'Glucose'], ['rbc', 'Capillary']],
    html: () => `
      <p class="lede">Scattered through the pancreas are around a million tiny clusters called islets of Langerhans. Their cells taste the blood going past and release hormones that tell the rest of the body what to do with fuel.</p>
      ${panel('islet', 'meal')}
      <ul class="facts">
        <li>${m('Beta cells', 'insulin')} release <b>insulin</b>, which lowers blood glucose and favors storage.</li>
        <li>${m('Alpha cells', 'glucagon')} release <b>glucagon</b>, which raises blood glucose, mainly by acting on the liver.</li>
        <li>${m('Delta cells', 'lyso')} release somatostatin, which restrains their neighbors. A few <b>PP cells</b> release pancreatic polypeptide.</li>
        <li>The cells are intermingled around a dense capillary network, so hormones reach the blood quickly. This is the endocrine route from <a href="#endocrine-secretion">Blood or duct</a>.</li>
      </ul>
      <p class="credit">The 3D islet is schematic: it has far fewer cells than a real one, a single capillary and rounded cell shapes. Cell proportions vary between islets and people.</p>`,
  },
  {
    id: 'beta', short: 'Release', where: 'One beta cell · about 12 µm across',
    title: 'How ATP becomes a signal',
    legend: [['glucose', 'Glucose'], ['atp', 'ATP'], ['potassium', 'K⁺'], ['calcium', 'Ca²⁺'], ['insulin', 'Insulin'], ['cpeptide', 'C-peptide'], ['mito', 'Mitochondrion']],
    html: () => `
      <p class="lede">The beta cell burns glucose through the same <a href="#glycolysis">glycolysis</a> and <a href="#krebs">Krebs cycle</a> you followed in the Energy module. Here the resulting ATP does a second job: it reports how much sugar is in the blood.</p>
      ${panel('beta', 'glucose', 'drug')}
      <ul class="facts">
        <li>In human beta cells the main glucose transporter is <b>GLUT1</b>. Textbooks often say GLUT2, which is the main one in rodents. Newer work suggests human GLUT2 still plays a part.</li>
        <li><b>Glucokinase</b> sets the pace, which makes it the cell’s glucose sensor. FDG imaging uses the same family of trapping enzymes, the hexokinases.</li>
        <li>Release comes in two phases: a quick first burst from granules that are ready to go, then a slower sustained phase.</li>
        <li>Insulin is packed with zinc in granules. It is cut from proinsulin, and the leftover <b>C-peptide</b> is released in equal amounts, so C-peptide shows how much insulin the body is making itself.</li>
        <li>Some babies are born with a K-ATP channel that will not close, causing neonatal diabetes. Many can be treated with sulfonylurea tablets instead of insulin, depending on the mutation.</li>
      </ul>
      ${sources([SRC.human, SRC.glut12, SRC.secretion, SRC.glp1, SRC.neonatal], 'The cell is schematic: parts are enlarged, steps are slowed so you can follow them, and much of the control is left out. Drug effects are simplified and are not treatment advice.')}`,
  },
  {
    id: 'receptor', short: 'Muscle response', where: 'The surface of a muscle cell · molecular diagram',
    title: 'Opening the doors in muscle',
    legend: [['insulin', 'Insulin'], ['tagk', 'Insulin relay'], ['fadh', 'AMPK (exercise)'], ['glucose', 'Glucose & GLUT4'], ['proton', 'Brake (AS160)']],
    html: () => `
      <p class="lede">Glucose cannot cross a membrane on its own. Muscle and fat keep a reserve of <b>GLUT4</b> transporters inside the cell and move them to the surface when told to.</p>
      ${panel('receptor', 'stim', 'resist')}
      <details><summary>The insulin relay, step by step</summary>
        <ol>
          <li>Insulin binds the <b>insulin receptor</b>, a receptor tyrosine kinase that is already a pair.</li>
          <li>The receptor adds phosphate to itself and to <b>IRS</b> proteins.</li>
          <li>IRS recruits <b>PI3K</b>, which makes the membrane lipid <b>PIP3</b>.</li>
          <li>PIP3 helps switch on <b>Akt</b> (protein kinase B).</li>
          <li>Akt phosphorylates <b>AS160</b> (TBC1D4), which had been acting as a brake.</li>
          <li>With the brake off, Rab proteins let <b>GLUT4 vesicles</b> move to the membrane and fuse.</li>
        </ol>
      </details>
      <ul class="facts">
        <li>Exercise and insulin use different early signals that meet at related “brake” proteins.</li>
        <li>That is one reason physical activity helps people with insulin resistance.</li>
      </ul>
      ${sources([SRC.glut4, SRC.exercise, SRC.t2ex], 'The diagram is not to scale, and the number of vesicles drawn is illustrative.')}`,
  },
  {
    id: 'balance', short: 'Balance', where: 'Four organs sharing one blood supply',
    title: 'Store or supply: the body’s fuel economy',
    legend: [['glucose', 'Glucose'], ['insulin', 'Insulin'], ['glucagon', 'Glucagon'], ['fat', 'Fatty acids & glycerol'], ['calcium', 'Amino acids']],
    html: () => `
      <p class="lede">Blood glucose stays in a fairly narrow range even though you eat only now and then. Insulin and glucagon do much of that balancing, and each organ answers differently.</p>
      ${panel('balance', 'fuel')}
      <ul class="facts">
        <li>The liver and the beta cell use transporters that do not wait for insulin. Insulin changes what the liver does with glucose, not whether the door is open.</li>
        <li>This explains the <a href="#fuel">“everything becomes glucose”</a> idea: between meals the liver really does make new glucose from other molecules.</li>
        <li>Epinephrine, cortisol and growth hormone also raise glucose supply. They are not shown here.</li>
      </ul>
      <p class="credit">This is a schematic of the main directions of flow, not their relative sizes. It summarizes standard physiology and simplifies a continuum into two states.</p>`,
  },
  {
    id: 'diabetes', short: 'Diabetes', where: 'The islet, when regulation fails',
    title: 'When the system fails',
    legend: [['insulin', 'Beta cell & insulin'], ['glucagon', 'Alpha cell & glucagon'], ['glucose', 'Glucose'], ['rbc', 'Capillary']],
    html: () => `
      <p class="lede">Diabetes is persistently high blood glucose. The reason differs: too little insulin, a weak response to it, or both.</p>
      ${panel('diabetes', 'dtype')}
      <div class="table-wrap"><table class="ledger wrap">
        <thead><tr><th>Test (non-pregnant adults)</th><th>Diabetes threshold</th></tr></thead>
        <tbody>
          <tr><td>HbA1c</td><td>≥ 6.5% (48 mmol/mol)</td></tr>
          <tr><td>Fasting glucose<small>no calories for 8 h</small></td><td>≥ 126 mg/dL (7.0 mmol/L)</td></tr>
          <tr><td>2 h after 75 g oral glucose</td><td>≥ 200 mg/dL (11.1 mmol/L)</td></tr>
          <tr><td>Random glucose<small>with classic symptoms or crisis</small></td><td>≥ 200 mg/dL (11.1 mmol/L)</td></tr>
        </tbody></table></div>
      <p class="muted">Without unequivocal high glucose, a diagnosis needs confirmation with further testing. HbA1c reflects glucose stuck to hemoglobin over the life of <a href="#blood">red cells</a>, so conditions that change red cell turnover can mislead it.</p>
      <ul class="facts">
        <li><b>How some medicines act:</b> metformin mainly lowers the liver’s glucose output. Sulfonylureas push the beta cell to release insulin. GLP-1 agonists amplify glucose-driven release and lower glucagon. Insulin replaces or adds to the body’s own.</li>
        <li>There are other types too, including gestational diabetes and single-gene forms. Faults in glucokinase can cause a mild, stable high fasting glucose that often needs no drug treatment outside pregnancy.</li>
      </ul>
      ${sources([SRC.ada, SRC.niddk, SRC.gck], 'Thresholds can be revised, so check the current standard. This is not a tool for diagnosing yourself or anyone else.')}`,
  },
  {
    id: 'petprep', short: 'PET prep', where: 'Radiology · FDG biodistribution (schematic)',
    title: 'Why insulin can spoil a PET scan',
    legend: [['hot', 'FDG activity: brighter means more'], ['membrane', 'Body outline']],
    html: () => `
      <p class="lede">FDG enters cells through glucose transporters. Anything that opens GLUT4 doors in muscle, or makes other tissue hungry, pulls tracer away from what you want to see.</p>
      ${panel('petprep', 'pet')}
      <p id="petAnatomyStatus" role="status" hidden></p>
      <details><summary>3D anatomy source</summary><p>Open Anatomy 3D, adapted from BodyParts3D © The Database Center for Life Science, the HuBMAP Human Reference Atlas, and MakeHuman (CC0). This scene uses translucent skin and recolored tissue meshes to illustrate relative FDG activity. <a href="https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md">Full attribution</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p></details>
      <div class="callout"><span class="eyebrow">For patients</span><p>Follow your imaging center’s instructions. <b>Never change your insulin or diabetes medicine because of this page.</b> Centers use their own current protocols, which may differ from the older guideline summarized here.</p></div>
      <div class="callout"><span class="eyebrow">Newer guidance exists</span><p>The list below comes from EANM <b>version 2.0 (2015)</b>. A <b>version 3.0</b> was published in <b>2025</b> and was not reviewed for this page. A <b>2026 AJR expert panel review</b> notes that guidelines differ on glucose limits, insulin timing and pumps, with limited guidance on SGLT2 inhibitors, GLP-1 and related drugs, and automated insulin delivery. The panel favors facility protocols, <b>keeping insulin pumps in basal mode</b> (version 2.0 had pumps off for at least 4 hours), avoiding correction doses of insulin just before imaging, and fairly permissive glucose limits.</p></div>
      <h3>Adult oncology preparation, EANM 2015</h3>
      <ul class="facts">
        <li><b>Fasting:</b> no food or drink except plain water for at least 4 hours before injection (for people without diabetes). Intravenous fluids containing glucose also stop.</li>
        <li><b>Water:</b> about 1 liter in the 2 hours before injection is suggested, where medically suitable.</li>
        <li><b>Exercise:</b> none that is strenuous for at least 6 hours, preferably 24.</li>
        <li><b>Warmth and quiet:</b> keep warm from 30–60 minutes before injection, then sit or lie still and quiet during uptake.</li>
        <li><b>Glucose, clinical scans:</b> below 11 mmol/L (about 200 mg/dL) the study can proceed. At or above that, it is rescheduled or the patient excluded, depending on circumstances. A level below about 4 mmol/L (70 mg/dL) is too low.</li>
        <li><b>Glucose, research:</b> protocols may set a stricter limit of 7–8.3 mmol/L (126–150 mg/dL).</li>
        <li><b>Insulin timing:</b> inject FDG no sooner than 4 hours after subcutaneous rapid-acting insulin, or 6 hours after short-acting. Same-day FDG is not recommended after intermediate or long-acting insulin. Version 2.0 has further scheduling detail. Advice on insulin pumps has since diverged, as noted above.</li>
        <li><b>Uptake time:</b> 60 minutes, with 55–75 acceptable. Repeat scans should match closely so SUV values can be compared.</li>
        <li><b>Marrow growth factors:</b> G-CSF effects on marrow uptake generally last more than 2 weeks after the last dose. See <a href="#blood">Blood</a>.</li>
        <li><b>Lesions near the heart:</b> a low-carbohydrate diet beforehand can reduce heart muscle uptake.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Two twists</span>
        <p><b>Heart viability imaging wants the opposite.</b> Glucose loading or an insulin clamp is used so that living heart muscle takes up FDG.</p>
        <p><b>Finding an insulinoma</b> can use a different target. PET tracers based on exendin bind the GLP-1 receptor, which most benign insulinomas express strongly. The evidence comes mainly from small studies.</p>
      </div>
      <p><a href="#cancer-pet">Why tumors take up FDG</a> · <a href="#liver-cyp">The liver as the PET reference organ</a></p>
      ${sources([SRC.eanm, SRC.eanm3, SRC.ajr, SRC.viability, SRC.exendin], 'The 3D figure is an illustration with made-up relative brightness. It is not patient data and cannot be used to read scans.')}`,
  },
];


/* ================= 3D scenes for part 1 (insulin and glucose) ================= */
function buildInsulin(g) {
  const { scene, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, disposeObj, travel, every, addLabel } = g;
  G = true;
  const P = {};
  ['insulin', 'glucagon', 'potassium', 'calcium', 'cpeptide', 'hot', 'tag-k', 'rbc'].forEach(k => P[k] = col(k));
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, emissive: color, emissiveIntensity: 0.22, roughness: 0.55 }, extra));
  const randDir = () => new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
  const mesh = (geo, mat, parent, pos, scale) => { const o = new THREE.Mesh(geo, mat); if (pos) o.position.set(...pos); if (scale) (Array.isArray(scale) ? o.scale.set(...scale) : o.scale.setScalar(scale)); parent.add(o); return o; };
  function lumpy(r, amp, seed, seg_ = 40) {
    const geo = new THREE.SphereGeometry(r, seg_, Math.round(seg_ * 0.75)), p = geo.attributes.position, v = new V3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      v.multiplyScalar(1 + amp * (Math.sin(v.x * 3.7 / r + seed) * Math.cos(v.y * 4.1 / r + seed * 2) + 0.6 * Math.sin(v.z * 5.3 / r + seed * 3)));
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  function dot(color, r, glowSize = 0) {
    const o = new THREE.Group(); mesh(atomGeo, atomMat(color), o, null, r);
    if (glowSize) o.add(glow(color, glowSize));
    return o;
  }
  const fly = (parent, color, r, pts, dur, opts = {}) => travel(parent, dot(color, r, r * 3.4), pts, dur, Object.assign({ shrinkEnd: true, ease: ease.lin }, opts));
  // emit at a steady rate: returns true each time another one is due
  const timers = new Map();
  function due(key, period, t) { if (t < (timers.get(key) || 0)) return false; timers.set(key, t + period); return true; }

  /* ================= ISLET (1 unit = 1.5 µm) ================= */
  const isletGroup = new THREE.Group(); scene.add(isletGroup);
  const capCurve = new THREE.CatmullRomCurve3([new V3(-52, -7, 0), new V3(-28, -2, 3), new V3(-8, 3, 6), new V3(10, -3, 6), new V3(28, 2, 3), new V3(52, 7, 0)]);
  mesh(new THREE.TubeGeometry(capCurve, 160, 4.2, 20, false), new THREE.MeshStandardMaterial({ color: P.rbc, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }), isletGroup);
  isletGroup.add(new THREE.Mesh(new THREE.TubeGeometry(capCurve, 160, 4.25, 20, false), fresnelMat(P.rbc, 0.9, 2)));
  const capPoints = capCurve.getSpacedPoints(200);
  const isletCells = [];
  {
    const kinds = { beta: P.insulin, alpha: P.glucagon, delta: C.lyso };
    let guard = 0;
    while (isletCells.length < 64 && guard++ < 20000) {
      const p = new V3(rr(-1, 1) * 27, rr(-1, 1) * 24, rr(-1, 0.55) * 18);
      if ((p.x / 28) ** 2 + (p.y / 25) ** 2 + (p.z / 19) ** 2 > 1) continue;
      if (capPoints.some(c => c.distanceTo(p) < 8.4)) continue;
      if (isletCells.some(c => c.pos.distanceTo(p) < 7.3)) continue;
      const i = isletCells.length, kind = i % 10 === 4 ? 'delta' : [1, 2, 6, 8].includes(i % 10) ? 'alpha' : 'beta';
      const root = new THREE.Group(); root.position.copy(p); isletGroup.add(root);
      const body = mesh(lumpy(3.9, 0.025, i), std(kinds[kind], { transparent: true, opacity: 0.5, emissiveIntensity: 0.18, depthWrite: false }), root);
      mesh(atomGeo, std(new THREE.Color(0x6d4bd0)), root, null, 1.5);
      for (let k = 0; k < 7; k++) { const d = randDir().multiplyScalar(rr(2, 3.1)); mesh(atomGeo, atomMat(kinds[kind]), root, [d.x, d.y, d.z], 0.34); }
      isletCells.push({ kind, pos: p, root, body });
    }
  }
  const nearestU = (p) => { let bi = 0, bd = 1e9; capPoints.forEach((c, i) => { const d = c.distanceTo(p); if (d < bd) { bd = d; bi = i; } }); return bi / (capPoints.length - 1); };
  const downstream = (from, u) => [from, capCurve.getPointAt(u), capCurve.getPointAt(Math.min(1, u + 0.18)), capCurve.getPointAt(Math.min(1, u + 0.42))];
  function secrete(kind, color) {
    const list = isletCells.filter(c => c.kind === kind && c.root.visible);
    if (!list.length) return;
    const cell = list[Math.floor(rnd() * list.length)];
    fly(isletGroup, color, 0.62, downstream(cell.pos.clone(), nearestU(cell.pos)), 3.4);
  }
  function bloodSugar(period, t) {
    if (!due('islet-glucose', period, t)) return;
    const off = new V3(rr(-2.4, 2.4), rr(-2.4, 2.4), rr(-1.5, 1.5));
    fly(isletGroup, C.glucose, 0.55, [0, 0.25, 0.5, 0.75, 1].map(u => capCurve.getPointAt(u).add(off)), 6);
  }
  {
    const pick = (k, fx) => isletCells.filter(c => c.kind === k).sort(fx)[0];
    const spots = [['Beta cell', 'insulin', pick('beta', (a, b) => (b.pos.y - a.pos.y))], ['Alpha cell', 'glucagon', pick('alpha', (a, b) => (a.pos.x - b.pos.x))], ['Delta cell', 'lyso', pick('delta', (a, b) => (b.pos.x - a.pos.x))]];
    spots.forEach(([t, c, cell]) => { if (cell) addLabel(t, c, isletGroup, cell.pos.clone().add(new V3(0, 5.4, 0)), c === 'lyso' ? ['islet'] : ['islet', 'diabetes']); });
    addLabel('Capillary', 'rbc', isletGroup, capCurve.getPointAt(0.27).add(new V3(0, -6.5, 3)), ['islet', 'diabetes']);
  }
  function isletBetas(keep) {                       // type 1: most beta cells are gone
    let n = 0;
    isletCells.forEach(c => { if (c.kind !== 'beta') return; c.root.visible = keep || n++ % 9 === 0; c.body.material.opacity = keep ? 0.5 : 0.16; });
  }

  /* ================= BETA CELL (1 unit = 0.5 µm) ================= */
  const betaGroup = new THREE.Group(); scene.add(betaGroup);
  const BR = 12;
  const betaRim = fresnelMat(P.insulin, 0.75, 2.6);
  {
    const geo = lumpy(BR, 0.008, 2, 72);
    mesh(geo, new THREE.MeshStandardMaterial({ color: P.insulin, transparent: true, opacity: 0.06, depthWrite: false, side: THREE.DoubleSide }), betaGroup);
    betaGroup.add(new THREE.Mesh(geo, betaRim));
    mesh(lumpy(3.2, 0.02, 4), std(new THREE.Color(0x6d4bd0), { transparent: true, opacity: 0.85 }), betaGroup, [-2.5, -5.2, -3]);
  }
  const onRim = (deg, r = BR) => new V3(Math.cos(deg * Math.PI / 180) * r, Math.sin(deg * Math.PI / 180) * r, 0);
  function protein(deg, color) {                    // a two-sided channel sitting in the membrane
    const root = new THREE.Group(); root.position.copy(onRim(deg)); root.rotation.z = (deg - 90) * Math.PI / 180; betaGroup.add(root);
    const mat = std(color, { emissiveIntensity: 0.35 });
    const halves = [-1, 1].map(s => mesh(new THREE.CapsuleGeometry(0.5, 1.9, 6, 14), mat, root, [s * 0.75, 0, 0]));
    const lid = mesh(atomGeo, std(P.rbc, { emissiveIntensity: 0.7 }), root, [0, 0.2, 0.2], [0.55, 0.4, 0.55]);
    return { root, halves, lid, mat, open: 1 };
  }
  const glut1 = protein(180, C.glucose), katp = protein(308, P.potassium), cav = protein(48, P.calcium);
  glut1.lid.visible = false;
  function setGate(p, open, dt) {
    p.open += ((open ? 1 : 0) - p.open) * Math.min(1, dt * 4);
    p.halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (0.5 + p.open * 0.42); });
    p.lid.scale.set(0.55 * (1 - p.open) + 0.001, 0.4 * (1 - p.open) + 0.001, 0.55 * (1 - p.open) + 0.001);
  }
  const betaMito = new THREE.Group(); betaMito.position.set(-3.2, 2.6, 0); betaMito.rotation.z = 0.5; betaGroup.add(betaMito);
  const mitoMat = std(C.mito, { emissiveIntensity: 0.25 });
  mesh(new THREE.CapsuleGeometry(1.5, 3.2, 8, 20), mitoMat, betaMito);
  const sheath = mesh(new THREE.CapsuleGeometry(1.5, 3.2, 8, 20), fresnelMat(C.mito, 1.4, 1.8), betaMito, null, 1.14);
  const gk = mesh(lumpy(0.85, 0.14, 7), std(C.nadh), betaGroup, [-7.4, -0.4, 0]);
  const granules = [];
  {
    const spots = [[3.2, 5.2, 1], [5.6, 4.2, -1], [7.2, 2.2, 0.6], [4.6, 1.4, 1.6], [6.4, -0.4, -1.2], [3, -1.6, 0], [2, 3, -1.6], [5, -3, 1], [8, 0, -0.4], [2.2, 7.2, -0.6], [1, 0.4, 1], [3.6, -5.4, -1]];
    spots.forEach(([x, y, z]) => {
      const o = new THREE.Group(); o.position.set(x, y, z); betaGroup.add(o);
      o.add(new THREE.Mesh(new THREE.SphereGeometry(0.95, 20, 16), fresnelMat(P.insulin, 1.2, 1.6)));
      mesh(atomGeo, atomMat(P.insulin), o, null, 0.5);
      granules.push({ o, home: new V3(x, y, z) });
    });
  }
  addLabel('GLUT1', 'glucose', betaGroup, onRim(180, BR + 1).add(new V3(0, 2.2, 0)), ['beta']);
  addLabel('K-ATP channel', 'potassium', betaGroup, onRim(308, BR + 2.6), ['beta']);
  addLabel('Ca²⁺ channel', 'calcium', betaGroup, onRim(48, BR + 2.6), ['beta']);
  addLabel('Glucokinase', 'nadh', betaGroup, new V3(-7.4, -2.2, 0), ['beta']);
  addLabel('Mitochondrion', 'mito', betaGroup, new V3(-3.4, 6.2, 0), ['beta']);
  addLabel('Insulin granules', 'insulin', betaGroup, new V3(6.2, -2.4, 1), ['beta']);
  const betaStateTag = addLabel('Membrane: resting', 'electron', betaGroup, new V3(0, -BR - 1.8, 0), ['beta']);

  function betaTick(t, dt) {
    const s = betaState(H.glucose, H.drug);
    const lit = reduceMotion ? 7 : Math.min(7, Math.floor((t - betaSince) / 0.9) + 1);
    if (lit !== betaLit) { betaLit = lit; renderRead(); }
    const metab = s.metabolism && lit >= 1;
    // until the cascade reaches step 4 the channel stays in its resting (open) state
    const closed = s.closed && lit >= 4, depol = closed && lit >= 5, ca = depol && lit >= 6;
    setGate(katp, !closed, dt); setGate(cav, ca, dt); setGate(glut1, true, dt);
    betaRim.uniforms.uI.value = 0.75 + (depol ? 0.25 + Math.sin(t * 14) * 0.12 : 0);
    betaRim.uniforms.uColor.value.copy(P.insulin);
    if (depol) betaRim.uniforms.uColor.value.lerp(C.electron, 0.55);
    betaStateTag.el.querySelector('span').textContent = depol ? 'Membrane: depolarized, firing' : 'Membrane: resting, about −70 mV';
    mitoMat.emissiveIntensity = metab && lit >= 3 ? 0.6 + Math.sin(t * 5) * 0.2 : 0.18;
    sheath.visible = true;
    gk.rotation.y += dt * (metab ? 3 : 0.6);
    const gluP = metab ? 0.38 : 1.8;
    if (due('beta-glucose', gluP, t)) fly(betaGroup, C.glucose, 0.34, [new V3(-19, rr(-5, 5), rr(-2, 2)), onRim(180, BR + 1.2), onRim(180, BR - 1.2), new V3(-7.4, -0.4, 0)], 2.6);
    if (metab && lit >= 2 && due('beta-pyr', 0.8, t)) fly(betaGroup, C.pyruvate, 0.26, [new V3(-7.4, -0.4, 0), new V3(-6, 1.4, 0.8), new V3(-3.4, 2.6, 0)], 1.4);
    if (lit >= 3 && due('beta-atp', metab ? 0.35 : 2.2, t)) fly(betaGroup, C.atp, 0.24, [new V3(-2.4, 2.2, 1), new V3(rr(0, 3), rr(-4, -1), 1), katp.root.position.clone().multiplyScalar(0.86)], 1.8);
    if (!closed && katp.open > 0.7 && due('beta-k', 0.35, t)) fly(betaGroup, P.potassium, 0.3, [onRim(308 + rr(-14, 14), 8), onRim(308, BR), onRim(308 + rr(-12, 12), BR + 6)], 1.6);
    if (ca && due('beta-ca', 0.22, t)) fly(betaGroup, P.calcium, 0.28, [onRim(48 + rr(-16, 16), BR + 6), onRim(48, BR), new V3(rr(2.5, 6), rr(1, 5), rr(-1, 1))], 1.3);
    if (s.release !== 'none' && lit >= 7) {
      if (due('beta-granule', s.release === 'strong' ? 0.45 : 1.15, t)) {
        const gr = granules[Math.floor(rnd() * granules.length)];
        if (gr.o.visible) {
          gr.o.visible = false;
          const deg = rr(-5, 32), edge = onRim(deg, BR - 0.8);
          const copy = gr.o.clone(); copy.visible = true;
          travel(betaGroup, copy, [gr.home.clone(), gr.home.clone().lerp(edge, 0.5), edge], 1.2, {
            onDone: () => {
              for (let i = 0; i < 6; i++) fly(betaGroup, i % 2 ? P.cpeptide : P.insulin, 0.26, [edge.clone(), onRim(deg + rr(-9, 9), BR + 3), onRim(deg + rr(-22, 22), BR + rr(7, 10))], rr(1.5, 2.2), { ease: ease.out });
            },
          });
          every((tt) => { if (tt < t + 3) return true; gr.o.visible = true; return false; });
        }
      }
    }
  }

  /* ================= MUSCLE CELL SURFACE (diagram) ================= */
  const recGroup = new THREE.Group(); scene.add(recGroup);
  const VX = [1.5, 5.5, 9.5, 13.5, 17.5, 21.5];
  {
    const heads = [];
    for (let x = -23; x <= 24; x += 0.62) for (let z = -3.4; z <= 3.4; z += 0.62) heads.push([x, z]);
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.25, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8f6d55, emissive: 0x2a1a10, roughness: 0.8 }), heads.length * 2);
    const m4 = new THREE.Matrix4(); let k = 0;
    heads.forEach(([x, z]) => [0.8, -0.8].forEach(y => { m4.makeTranslation(x, y, z); im.setMatrixAt(k++, m4); }));
    recGroup.add(im);
    mesh(new THREE.BoxGeometry(47.6, 1.3, 7.2), new THREE.MeshStandardMaterial({ color: 0x6b4630, transparent: true, opacity: 0.35, depthWrite: false }), recGroup, [0.5, 0, 0]);
  }
  const recMat = std(P['tag-k'], { emissiveIntensity: 0.2 });
  [-1, 1].forEach(s => {
    mesh(new THREE.CapsuleGeometry(0.55, 4.6, 6, 14), recMat, recGroup, [-17 + s * 0.8, 0.2, 3.6]);
    const arm = mesh(new THREE.CapsuleGeometry(0.75, 1.9, 6, 14), recMat, recGroup, [-17 + s * 1.35, 3.8, 3.6]); arm.rotation.z = -s * 0.55;
    mesh(lumpy(1.0, 0.1, s + 3), recMat, recGroup, [-17 + s * 1.0, -3.6, 3.6]);
  });
  const boundInsulin = dot(P.insulin, 0.95, 3.4); boundInsulin.position.set(-17, 5.4, 3.6); recGroup.add(boundInsulin);
  const node = (x, y, color, r, name, labelColor) => {
    const mat = std(color, { emissiveIntensity: 0.12 });
    const o = mesh(lumpy(r, 0.07, x), mat, recGroup, [x, y, 3.6]);
    if (name) addLabel(name, labelColor, recGroup, new V3(x, y - r - 1.1, 3.6), ['receptor']);
    return { o, mat, p: new V3(x, y, 3.6), r };
  };
  const irs = node(-15.2, -7, P['tag-k'], 1.25, 'IRS', 'tagk');
  const pi3k = node(-11, -5, P['tag-k'], 1.25, 'PI3K', 'tagk');
  const pip3 = node(-8.4, -1.5, C.electron, 0.65, 'PIP3', 'electron');
  const akt = node(-6.4, -6.2, P['tag-k'], 1.35, 'Akt', 'tagk');
  const ampk = node(-12.6, -12.6, C.fadh, 1.5, 'AMPK', 'fadh');
  const brake = node(-1.2, -10, C.proton, 1.5, 'AS160 brake', 'proton');
  addLabel('Insulin receptor', 'tagk', recGroup, new V3(-15, 8.2, 3.6), ['receptor']);
  addLabel('Outside the cell', 'glucose', recGroup, new V3(6, 8.4, 0), ['receptor']);
  addLabel('Inside the cell', 'mito', recGroup, new V3(17, -5, 0), ['receptor']);
  addLabel('GLUT4 vesicles', 'glucose', recGroup, new V3(11.5, -16.2, 0), ['receptor']);
  const blockTag = textSprite('signal weakened', P.rbc, 1.15); blockTag.position.set(-14, -10, 5); recGroup.add(blockTag);

  const gluMat = std(C.glucose, { emissiveIntensity: 0.35 });
  const vesicles = VX.map((x, i) => {
    const home = new V3(x + (i % 2 ? 1 : -1), -9.5 - (i % 3) * 2.2, rr(-1.5, 1.5));
    const o = new THREE.Group(); o.position.copy(home); recGroup.add(o);
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(1.75, 24, 18), fresnelMat(new THREE.Color(0xd9a77c), 1.3, 1.6)); o.add(bubble);
    const pore = new THREE.Group(); o.add(pore);
    [-1, 1].forEach(s => mesh(new THREE.CapsuleGeometry(0.33, 1.5, 4, 10), gluMat, pore, [s * 0.46, 0, 0]));
    return { o, bubble, pore, home, at: 0, x };
  });
  const ORDER = [2, 0, 4, 1, 5, 3];               // which vesicles go up first
  function signal(from, to, color, delay = 0) { fly(recGroup, color, 0.38, [from.clone(), to.clone()], 0.8, { delay, ease: ease.inOut }); }
  function recTick(t, dt) {
    const gs = glutState(H.stim, H.resist === 'yes');
    boundInsulin.visible = H.stim === 'insulin';
    blockTag.visible = gs.blocked;
    const relayOn = gs.insulinPath && !gs.blocked;
    recMat.emissiveIntensity = gs.insulinPath ? 0.55 + Math.sin(t * 4) * 0.2 : 0.18;
    [irs, pi3k, akt].forEach(n => { n.mat.emissiveIntensity = relayOn ? 0.75 : gs.blocked ? 0.28 : 0.08; });
    pip3.o.visible = gs.insulinPath; pip3.mat.emissiveIntensity = relayOn ? 0.9 : 0.25;
    ampk.mat.emissiveIntensity = gs.exercisePath ? 0.8 + Math.sin(t * 5) * 0.2 : 0.07;
    brake.o.scale.setScalar(gs.surface > 3 ? 0.72 : 1);
    brake.mat.emissiveIntensity = gs.surface > 3 ? 0.06 : 0.55;
    if (due('rec-signal', gs.blocked ? 2.8 : 1.5, t)) {
      if (gs.insulinPath) {
        signal(new V3(-17, -3.6, 3.6), irs.p, P['tag-k']);
        if (!gs.blocked || rnd() < 0.35) { signal(irs.p, pi3k.p, P['tag-k'], 0.5); signal(pi3k.p, pip3.p, P['tag-k'], 0.9); signal(pip3.p, akt.p, P['tag-k'], 1.3); signal(akt.p, brake.p, P['tag-k'], 1.8); }
      }
      if (gs.exercisePath) signal(ampk.p, brake.p, C.fadh);
    }
    vesicles.forEach((v, i) => {
      const up = ORDER.indexOf(i) < gs.surface;
      const target = up ? 1 : 0;
      const step = dt * (reduceMotion ? 5 : 0.42);
      v.at += Math.max(-step, Math.min(step, target - v.at));
      const u = ease.inOut(Math.max(0, Math.min(1, v.at)));
      v.o.position.lerpVectors(v.home, new V3(v.x, 0, 3.6), u);
      const fused = Math.max(0, (u - 0.82) / 0.18);
      v.bubble.scale.setScalar(Math.max(0.001, 1 - fused));
      v.pore.scale.setScalar(0.55 + 0.75 * fused);
      if (fused > 0.9 && due('rec-flow' + i, 0.9, t)) fly(recGroup, C.glucose, 0.36, [new V3(v.x + rr(-1, 1), rr(6, 9), 3.6 + rr(-1, 1)), new V3(v.x, 1.4, 3.6), new V3(v.x, -1.4, 3.6), new V3(v.x + rr(-2, 2), -7, 3.6)], 2);
    });
    if (due('rec-outside', 0.3, t)) {              // glucose waiting outside; more of it when uptake is poor
      const crowd = gs.surface < 3 ? 2 : 1;
      for (let i = 0; i < crowd; i++) { const a = new V3(rr(-1, 23), rr(2.4, 7.4), rr(-2, 3)); fly(recGroup, C.glucose, 0.28, [a, a.clone().add(new V3(rr(-3, 3), rr(-1, 1), rr(-1, 1)))], rr(1.4, 2.4)); }
    }
  }

  /* ================= FUEL BALANCE (diagram) ================= */
  const balGroup = new THREE.Group(); scene.add(balGroup);
  const AT = { blood: new V3(0, 0, 0), pancreas: new V3(0, -2.6, 0), liver: new V3(-13, 7, 0), brain: new V3(13, 7, 0), muscle: new V3(-13, -8, 0), fat: new V3(13, -8, 0) };
  mesh(new THREE.TorusGeometry(3.6, 0.9, 20, 64), std(P.rbc, { transparent: true, opacity: 0.55 }), balGroup, [0, 1.6, 0]);
  mesh(lumpy(1, 0.09, 12), std(new THREE.Color(0xe0b878)), balGroup, [0, -4.6, 0], [3.6, 1.15, 1.1]);
  mesh(lumpy(1, 0.05, 3), std(new THREE.Color(0xa8483c)), balGroup, [-13, 7, 0], [4.6, 2.9, 2.2]).rotation.z = 0.18;
  [-1, 1].forEach(s => mesh(lumpy(1, 0.13, s + 6), std(new THREE.Color(0xd99aa8)), balGroup, [13 + s * 1.7, 7, 0], [2.3, 2.9, 2.6]));
  for (let i = 0; i < 5; i++) { const f = mesh(new THREE.CapsuleGeometry(0.62, 6, 6, 12), std(new THREE.Color(0xc4575f)), balGroup, [-13 + (i - 2) * 0.35, -8 + (i - 2) * 1.05, (i % 2) * 0.6]); f.rotation.z = Math.PI / 2 - 0.12; }
  [[0, 0, 0], [2, 0.9, 0], [-2, 0.7, 0.4], [0.8, -1.9, 0.3], [-1.2, -1.7, -0.3], [0.2, 2.2, -0.4]].forEach(([x, y, z]) => mesh(atomGeo, std(C.fat, { emissiveIntensity: 0.15 }), balGroup, [13 + x, -8 + y, z], 1.45));
  addLabel('Liver', 'mito', balGroup, new V3(-13, 11.2, 0), ['balance']);
  addLabel('Brain', 'glucagon', balGroup, new V3(13, 11.2, 0), ['balance']);
  addLabel('Muscle', 'rbc', balGroup, new V3(-13, -12.4, 0), ['balance']);
  addLabel('Fat', 'fat', balGroup, new V3(13, -12.4, 0), ['balance']);
  addLabel('Blood', 'rbc', balGroup, new V3(0, 6.6, 0), ['balance']);
  addLabel('Pancreas', 'insulin', balGroup, new V3(0, -7, 0), ['balance']);
  const FLOWS = {
    fed: [['blood', 'liver', 'glucose', 0.5], ['blood', 'muscle', 'glucose', 0.4], ['blood', 'fat', 'glucose', 0.9], ['blood', 'brain', 'glucose', 0.6],
      ['pancreas', 'liver', 'insulin', 0.8], ['pancreas', 'muscle', 'insulin', 0.8], ['pancreas', 'fat', 'insulin', 0.8]],
    fasting: [['liver', 'blood', 'glucose', 0.55], ['blood', 'brain', 'glucose', 0.6], ['fat', 'muscle', 'fat', 0.9], ['fat', 'liver', 'fat', 1.1], ['muscle', 'liver', 'amino', 1.3], ['pancreas', 'liver', 'glucagon', 0.7]],
  };
  const flowColor = (k) => (k === 'insulin' ? P.insulin : k === 'glucagon' ? P.glucagon : k === 'amino' ? P.calcium : C[k]);
  function balTick(t) {
    FLOWS[H.fuel].forEach(([a, b, kind, period], i) => {
      if (!due(`bal-${H.fuel}-${i}`, period, t)) return;
      const A = AT[a], Z = AT[b], dir = Z.clone().sub(A), side = new V3(-dir.y, dir.x, 0).normalize();
      const bend = (kind === 'insulin' || kind === 'glucagon' ? -1.8 : 1.4) + rr(-0.4, 0.4);
      fly(balGroup, flowColor(kind), kind === 'glucose' ? 0.52 : 0.42, [A.clone().add(new V3(0, 0, 3)), A.clone().lerp(Z, 0.5).add(side.multiplyScalar(bend)).add(new V3(0, 0, 3)), Z.clone().add(new V3(0, 0, 3))], 2.6);
    });
  }

  /* ================= PET FIGURE (schematic) ================= */
  const petGroup = new THREE.Group(); scene.add(petGroup);
  const petSchematic = new THREE.Group(); petGroup.add(petSchematic);
  const bodyMat = fresnelMat(C.membrane, 0.55, 2.2);
  const part = (geo, pos, rz = 0, scale) => { const o = mesh(geo, bodyMat, petSchematic, pos, scale); o.rotation.z = rz; return o; };
  part(new THREE.SphereGeometry(2.5, 40, 30), [0, 15.4, 0], 0, [1, 1.12, 1]);
  part(new THREE.CapsuleGeometry(1.05, 1.2, 8, 20), [0, 12.4, 0]);
  part(new THREE.CapsuleGeometry(4.1, 7.4, 12, 40), [0, 4.9, 0], 0, [1.08, 1, 0.62]);
  [-1, 1].forEach(s => {
    part(new THREE.CapsuleGeometry(1.15, 11.6, 8, 20), [s * 6.1, 4, 0], s * 0.15);
    part(new THREE.CapsuleGeometry(1.7, 13.4, 8, 24), [s * 2.35, -10.6, 0], s * 0.045);
  });
  const hot = {};
  function organ(key, spots) {
    hot[key] = spots.map(([x, y, z, sx, sy, sz]) => {
      const mat = new THREE.MeshBasicMaterial({ color: P.hot, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending });
      const o = mesh(atomGeo, mat, petSchematic, [x, y, z], [sx, sy, sz]);
      const gl = glow(P.hot, Math.max(sx, sy) * 3.4); gl.position.set(x, y, z); petSchematic.add(gl);
      return { o, mat, gl };
    });
  }
  organ('brain', [[0, 16, 0, 1.85, 1.55, 1.6]]);
  organ('heart', [[0.9, 7.6, 0.8, 1.3, 1.45, 1]]);
  organ('liver', [[-1.9, 4.6, 0.6, 2.2, 1.45, 1.1]]);
  organ('kidneys', [[-2, 2.4, -0.9, 0.72, 1.15, 0.6], [2, 2.6, -0.9, 0.72, 1.15, 0.6]]);
  organ('bladder', [[0, -3.1, 0.8, 1.05, 0.9, 0.9]]);
  organ('bowel', [[-1.3, 0.4, 1, 0.9, 0.75, 0.7], [0.9, -0.2, 1.2, 1.1, 0.7, 0.7], [1.9, 1.3, 0.8, 0.7, 0.9, 0.6], [-0.4, -1.2, 1, 0.9, 0.6, 0.6]]);
  organ('muscle', [[-6, 6.4, 0, 0.8, 2.6, 0.8], [6, 6.4, 0, 0.8, 2.6, 0.8], [-2.3, -7.6, 0, 1.15, 3.4, 1], [2.3, -7.6, 0, 1.15, 3.4, 1], [-2.7, -14.6, 0, 0.75, 2.6, 0.75], [2.7, -14.6, 0, 0.75, 2.6, 0.75]]);
  organ('bfat', [[-1.9, 11.2, 0.7, 0.85, 0.55, 0.6], [1.9, 11.2, 0.7, 0.85, 0.55, 0.6], [-3.4, 10.5, 0.4, 0.8, 0.5, 0.6], [3.4, 10.5, 0.4, 0.8, 0.5, 0.6]]);
  organ('lesion', [[-2.4, 8.7, 1, 0.62, 0.62, 0.62]]);
  const PET = {                                    // relative brightness 0-1, chosen to illustrate the direction of change only
    ready: { brain: 1, heart: 0.25, liver: 0.35, kidneys: 0.75, bladder: 0.9, bowel: 0.15, muscle: 0.04, bfat: 0, lesion: 1 },
    insulin: { brain: 0.55, heart: 0.9, liver: 0.3, kidneys: 0.55, bladder: 0.7, bowel: 0.15, muscle: 0.75, bfat: 0.04, lesion: 0.35 },
    exercise: { brain: 0.9, heart: 0.35, liver: 0.32, kidneys: 0.7, bladder: 0.85, bowel: 0.15, muscle: 0.8, bfat: 0, lesion: 0.65 },
    cold: { brain: 0.95, heart: 0.3, liver: 0.35, kidneys: 0.75, bladder: 0.85, bowel: 0.15, muscle: 0.06, bfat: 0.85, lesion: 0.85 },
    metformin: { brain: 1, heart: 0.25, liver: 0.35, kidneys: 0.75, bladder: 0.9, bowel: 0.85, muscle: 0.04, bfat: 0, lesion: 0.95 },
  };
  const petNow = Object.assign({}, PET.ready);
  let anatomyHot, avatarState = 'idle';
  const petRegions = {
    brain: ['brain'], heart: ['heart'], liver: ['liver'],
    kidneys: ['kidney_l','kidney_r'], bladder: ['bladder'],
    bowel: ['colon','small_intestine'],
    muscle: ['deltoid_l','deltoid_r','quadriceps_l','quadriceps_r','calf_l','calf_r'],
  };
  const petLabels = {brain:'Brain', heart:'Heart', kidneys:'Kidneys', bladder:'Bladder', muscle:'Muscle'};
  function showPetAvatar(asset) {
    const skin = asset.getObjectByName('skin');
    if (!skin) throw new Error('Anatomical skin mesh unavailable');
    const body = new THREE.Box3().setFromObject(skin);
    const center = body.getCenter(new V3());
    const height = body.max.y - body.min.y;
    if (!(height > 0 && Number.isFinite(height))) throw new Error('Invalid anatomical body bounds');
    const avatar = new THREE.Group();
    const unit = 36 / height;
    avatar.scale.setScalar(unit);
    avatar.position.copy(center).multiplyScalar(-unit);
    const shell = new THREE.MeshStandardMaterial({
      color: C.membrane, transparent: true, opacity: .17, depthWrite: false, side: THREE.DoubleSide,
    });
    function copyMeshes(node, material, order) {
      const copies = new THREE.Group();
      node.traverse(part => {
        if (!part.isMesh) return;
        const copy = mesh(part.geometry, material, copies);
        copy.applyMatrix4(part.matrixWorld);
        copy.renderOrder = order;
      });
      avatar.add(copies);
      return copies;
    }
    if (!copyMeshes(skin, shell, 1).children.length) throw new Error('Body has no skin geometry');
    const details = {};
    function tracerMaterial() {
      return new THREE.MeshBasicMaterial({color:P.hot, transparent:true, opacity:.1, depthWrite:false, blending:THREE.AdditiveBlending});
    }
    function mark(key, position, radius) {
      const mat = tracerMaterial();
      const o = mesh(atomGeo, mat, avatar, position.toArray(), radius);
      o.renderOrder = 2;
      details[key] ||= [];
      details[key].push({o,mat});
    }
    for (const [key,names] of Object.entries(petRegions)) {
      const bounds = new THREE.Box3();
      details[key] = names.flatMap(name => {
        const node = asset.getObjectByName(name);
        if (!node) return [];
        const mat = tracerMaterial();
        const region = copyMeshes(node,mat,2);
        bounds.union(new THREE.Box3().setFromObject(node));
        return [{o:region,mat}];
      });
      if (petLabels[key] && !bounds.isEmpty()) {
        const anchor = bounds.getCenter(new V3());
        anchor.x = key === 'muscle' ? bounds.min.x - .035 : bounds.max.x + .035;
        if (key === 'muscle') {
          const thigh = asset.getObjectByName('quadriceps_r');
          if (thigh) anchor.y = new THREE.Box3().setFromObject(thigh).getCenter(new V3()).y;
        }
        addLabel(petLabels[key], 'hot', avatar, anchor, ['petprep']);
      }
    }

    // The lesion and brown-fat activity are illustrative, placed from anatomical landmarks.
    const lung = asset.getObjectByName('lung_r');
    if (lung) {
      const lesion = new THREE.Box3().setFromObject(lung).getCenter(new V3());
      mark('lesion',lesion,.027);
      const callout = lesion.clone();
      callout.x -= .21; callout.y += .045;
      addLabel('Example lesion','hot',avatar,callout,['petprep']);
    }
    for (const side of ['l','r']) {
      const shoulder = asset.getObjectByName('deltoid_'+side);
      if (!shoulder) continue;
      const bounds = new THREE.Box3().setFromObject(shoulder);
      const depot = bounds.getCenter(new V3());
      depot.x = depot.x*.55 + center.x*.45;
      depot.y = bounds.max.y;
      mark('bfat',depot,.024);
      depot.x += (center.x-depot.x)*.45;
      depot.y += .02;
      mark('bfat',depot,.018);
    }
    petGroup.add(avatar);
    anatomyHot = details;
    petSchematic.visible = false;
  }
  function enterPet() {
    enter('petprep')();
    if (avatarState !== 'idle') return;
    avatarState = 'loading';
    loadAnatomyAvatar('female').then(showPetAvatar).then(() => {
      avatarState = 'ready';
    }).catch(error => {
      avatarState = 'failed';
      console.warn('Could not display the PET anatomy model',error);
    });
  }
  function petTick(t, dt) {
    Object.keys(hot).forEach(k => {
      petNow[k] += (PET[H.pet][k] - petNow[k]) * Math.min(1, dt * 3);
      const v = petNow[k], pulse = k === 'lesion' ? 1 + Math.sin(t * 4) * 0.08 : 1;
      (anatomyHot ? anatomyHot[k] || [] : hot[k]).forEach(h => {
        h.mat.opacity = (0.04 + v * 0.5) * pulse;
        h.o.visible = v > 0.02;
        if (h.gl) { h.gl.material.opacity = v * 0.5 * pulse; h.gl.visible = h.o.visible; }
      });
    });
    const message = $('#petAnatomyStatus');
    if (message) {
      message.hidden = avatarState === 'ready';
      const text = avatarState === 'failed' ? 'The detailed avatar could not load. Showing the schematic.' : 'Loading the detailed avatar…';
      if (message.textContent !== text) message.textContent = text;
    }
    petGroup.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.35) * 0.4;
  }
  [['Brain', [4.6, 16.4, 0]], ['Example lesion', [-7.4, 9.8, 0]], ['Heart', [4.4, 8.2, 0]], ['Kidneys', [5, 2.2, 0]], ['Bladder', [4.6, -3.2, 0]], ['Muscle', [-6.4, -8.4, 0]]].forEach(([t, p]) => addLabel(t, 'hot', petSchematic, new V3(...p), ['petprep']));

  /* ================= camera and behaviors ================= */
  const POSES = {
    islet: { pos: new V3(0, 8, 90), target: new V3(0, 0, 0), group: 'islet', w: 34 },
    beta: { pos: new V3(0, 0, 50), target: new V3(0, -1, 0), group: 'beta', w: 20 },
    receptor: { pos: new V3(0, 0, 50), target: new V3(0.5, -3.4, 0), group: 'receptor', w: 26.5 },
    balance: { pos: new V3(0, 0, 48), target: new V3(0, -0.6, 0), group: 'balance', w: 18.5 },
    diabetes: { pos: new V3(0, 8, 90), target: new V3(0, 0, 0), group: 'islet', w: 34 },
    petprep: { pos: new V3(0, 0, 64), target: new V3(0, 0, 0), group: 'pet', w: 13 },
  };
  const enter = (id) => () => { currentChapter = id; timers.clear(); renderRead(); };
  const B = {
    islet: {
      enter() { enter('islet')(); isletBetas(true); },
      tick(t) {
        const fed = H.meal === 'fed';
        bloodSugar(fed ? 0.14 : 0.75, t);
        if (due('islet-insulin', fed ? 0.2 : 1.9, t)) secrete('beta', P.insulin);
        if (due('islet-glucagon', fed ? 2.2 : 0.28, t)) secrete('alpha', P.glucagon);
        isletCells.forEach((c, i) => {
          const busy = (c.kind === 'beta' && fed) || (c.kind === 'alpha' && !fed);
          c.body.material.emissiveIntensity = busy ? 0.42 + Math.sin(t * 3 + i) * 0.16 : 0.1;
        });
      },
    },
    diabetes: {
      enter() { enter('diabetes')(); },
      tick(t) {
        const d = H.dtype;
        if (this.shown !== d) { this.shown = d; isletBetas(d !== 't1'); }
        bloodSugar(d === 'healthy' ? 0.3 : 0.07, t);
        if (d === 'healthy' && due('islet-insulin', 0.3, t)) secrete('beta', P.insulin);
        if (d === 't2' && due('islet-insulin', 0.24, t)) secrete('beta', P.insulin);
        if (due('islet-glucagon', d === 'healthy' ? 2 : 0.45, t)) secrete('alpha', P.glucagon);
        isletCells.forEach((c) => { c.body.material.emissiveIntensity = c.kind === 'delta' ? 0.1 : 0.26; });
      },
      exit() { this.shown = null; isletBetas(true); },
    },
    beta: {
      enter() { enter('beta')(); betaSince = now; betaLit = 0; granules.forEach(x => { x.o.visible = true; }); renderRead(); },
      tick: betaTick,
      exit() { betaLit = 7; granules.forEach(x => { x.o.visible = true; }); },
    },
    receptor: { enter: enter('receptor'), tick: recTick },
    balance: { enter: enter('balance'), tick: balTick },
    petprep: { enter: enterPet, tick: petTick },
  };

  return {
    groups: { islet: isletGroup, beta: betaGroup, receptor: recGroup, balance: balGroup, pet: petGroup },
    unitsPerNm: { islet: 1 / 1500, beta: 1 / 500 },
    fog: { islet: 0.0035, beta: 0.003, receptor: 0.002, balance: 0.002, pet: 0.002 },
    depth: { pet: -1, balance: 0.2, islet: 0.5, beta: 1.5, receptor: 2.5 },
    fadeText: { pet: 'To the scanner', balance: 'Zooming out to the organs' },
    poses: POSES, behaviors: B,
  };
}

/* ================= Part 2: the wider endocrine system ================= */
const ENDOCRINE = (() => {
  const source = '<p><a href="https://openstax.org/books/biology-2e/pages/43-4-hormonal-control-of-human-reproduction">OpenStax · Hormonal Control of Human Reproduction</a></p>';
  const credits = `<details><summary>3D anatomy sources</summary>
    <p>Body and named organs adapted by Open Anatomy 3D from BodyParts3D © The Database Center for Life Science, HuBMAP Human Reference Atlas 3D Reference Organs, and MakeHuman (CC0). The atlas displays selected parts with translucent skin and recolored glands. <a href="https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md">Full attribution</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>
    <p>Supplemental meshes come from Z-Anatomy by Gauthier Kervyn, Marcin Zielinski, and contributors, derived from BodyParts3D (CC BY-SA 2.1 Japan) and converted by Anatomy Explorer. The atlas isolates, scales, repositions, and recolors these meshes. <a href="https://github.com/ArianArsenal/anatomy-explorer#credits--license">Source and credits</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
    </details>`;
  const glands = [
    ['brain','Hypothalamus, pituitary and pineal','The hypothalamus regulates pituitary output. Pituitary hormones help govern growth, reproduction and other glands. The pineal gland releases melatonin.'],
    ['neck','Thyroid and parathyroids','The thyroid wraps around the front and sides of the trachea. The small parathyroid glands are usually on the back of the thyroid and help regulate blood calcium.'],
    ['chest','Thymus','The thymus lies behind the breastbone. It supports T-cell maturation and is proportionally larger early in life.'],
    ['abdomen','Adrenals and pancreas','The adrenal glands sit above the kidneys. The pancreatic islets release hormones such as insulin and glucagon into nearby capillaries.'],
    ['gonads','Ovaries or testes','Ovaries and testes produce reproductive hormones and gametes. Use the anatomy selector to compare their locations.'],
  ];
  const chapters = [
    {id:'endocrine-map', short:'Gland map', where:'The whole body · endocrine glands', title:'Where endocrine signals begin', legend:[['atp','Selected glands'],['muted','Body outline']],
      html:()=>`<p class="lede">Endocrine glands release hormones into the blood rather than through a duct, so one gland can signal to tissues anywhere in the body. Rotate the body to see how the glands sit at different depths. The parathyroids are behind the thyroid.</p>
      <label class="lesson-control">Region <select id="endocrineRegion">${glands.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>
      <label class="lesson-control">Reproductive anatomy <select id="endocrineAnatomy"><option value="ovaries">Ovaries</option><option value="testes">Testes</option></select></label>
      <div class="lesson-pair">${glands.map(([id,name,description])=>`<section><h3>${name}</h3><p>${description}</p></section>`).join('')}</div>
      <p><a href="#lipid-steroid">How adrenal and gonadal steroids are built from cholesterol</a></p>
      <p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-1-an-overview-of-the-endocrine-system">OpenStax · Endocrine system overview</a></p>`},
    {id:'endocrine-secretion', short:'Blood or duct', where:'The pancreas · islet and acini', title:'One pancreas, two routes out', legend:[['endocrine-insulin','Insulin'],['endocrine-glucagon','Glucagon'],['endocrine-delta','Somatostatin'],['endocrine-pp','Pancreatic polypeptide'],['amino','Digestive enzymes']],
      html:()=>`<p class="lede">At left, the pancreatic islet releases signals into nearby tissue fluid and capillaries. At right, acinar cells release digestive enzymes into a duct that leads toward the small intestine.</p>
      <label class="lesson-control">Highlight <select id="endocrineRoute"><option value="both">Both routes</option><option value="blood">Islet to blood</option><option value="duct">Acini to duct</option></select></label>
      <ul class="facts"><li><b>Endocrine route:</b> islet cells have no duct. Their hormones enter tissue fluid and capillaries and travel in the blood to distant targets.</li><li><b>Exocrine route:</b> acinar cells make up most of the pancreas. They send digestive enzymes through a branching duct to the small intestine.</li><li>The islets make up only about 1–2% of the pancreas, yet they set the body’s fuel policy. The next chapters zoom into one.</li></ul>
      <p><a href="#islet">Zoom into a pancreatic islet</a></p><p class="credit">Sources: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-9-the-endocrine-pancreas">OpenStax · Endocrine pancreas</a>. The scene compares routes. Cell counts, spacing, and particle timing are schematic.</p>`},
    {id:'endocrine-receptors', short:'Receptor routes', where:'Two target cells · schematic', legend:[['endocrine-insulin','Insulin'],['endocrine-glucagon','Estradiol'],['endocrine-pp','Receptors & GLUT4']], title:'A hormone reaches every tissue. Its receptor picks the target.',
      html:()=>`<p class="lede">A hormone in the blood washes past almost every cell, but only cells with a matching receptor and the machinery behind it respond. Where that receptor sits decides how the message gets in.</p>
      <div class="lesson-pair"><section><h3>Insulin · membrane receptor</h3><div class="lesson-flow"><span>Insulin binds a receptor on the cell surface</span><span>Signals are relayed through proteins inside the cell</span><span>More GLUT4 reaches the membrane, and glucose uptake and storage change</span></div></section>
      <section><h3>Estradiol · intracellular receptor</h3><div class="lesson-flow"><span>The steroid crosses the lipid bilayer</span><span>An intracellular estrogen receptor binds it</span><span>The complex can change gene expression</span></div></section></div>
      <ul class="facts"><li><b>Water-soluble hormones</b> such as insulin, glucagon and other peptides cannot cross the membrane, so they act through surface receptors. Effects can start within minutes.</li><li><b>Lipid-soluble hormones</b> such as steroids and thyroid hormone enter the cell and act mainly by changing which proteins it makes, over hours to days.</li><li>The same hormone can act differently in different tissues, depending on the receptors and signaling partners each cell has.</li></ul>
      <p>Later chapters follow insulin from its source, a <a href="#beta">beta cell</a>, to the step-by-step relay in <a href="#receptor">muscle</a>. <a href="#permeability">See how a glucose carrier works</a>. Follow the second messengers in <a href="#sig-gpcr">GPCRs and cAMP</a> and <a href="#sig-mapk">receptor tyrosine kinases</a>.</p>
      <p class="credit">Sources: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones">OpenStax · Hormones</a>. The two cells are schematic, and the receptors and transporters are enlarged.</p>`},
    {id:'endocrine-patterns', short:'Hormone patterns', where:'The whole body · reproductive hormones', legend:[['atp','Gonads (highlighted)'],['muted','Body outline']], title:'Shared hormones, different patterns',
      html:()=>`<p class="lede">People of both sexes produce testosterone, estradiol, and progesterone. Typical amounts and timing vary with reproductive anatomy, age, and life stage.</p>
      <label class="lesson-control">Reproductive anatomy <select id="endocrinePattern"><option value="ovaries">Ovaries</option><option value="testes">Testes</option></select></label><div class="table-wrap"><table class="ledger"><thead><tr><th>Hormone</th><th>Examples of sources</th><th>Example roles</th></tr></thead><tbody>
      <tr><td>Testosterone</td><td>Testes and ovaries. Adrenal precursors contribute.</td><td>Supports sperm production in the testes and contributes to muscle and bone maintenance.</td></tr>
      <tr><td>Estradiol</td><td>Ovarian follicles and conversion of androgens in other tissues.</td><td>Helps maintain bone and supports growth of the uterine lining.</td></tr>
      <tr><td>Progesterone</td><td>Corpus luteum after ovulation, placenta during pregnancy, and smaller amounts from other steroid-producing tissues.</td><td>Helps prepare the uterine lining after ovulation.</td></tr></tbody></table></div>
      <p>GnRH, LH, and FSH signaling increases during puberty. After menopause, ovarian estradiol and progesterone production falls and the ovulatory pattern ends. Testosterone levels vary among individuals and can change with age.</p>${source}`},
    {id:'endocrine-feedback', short:'Feedback loops', where:'Brain to gonads · feedback loop', legend:[['endocrine-delta','GnRH'],['endocrine-pp','LH and FSH'],['endocrine-glucagon','Gonadal hormones (feedback)']], title:'Feedback coordinates the gonads with the brain',
      html:()=>`<div class="lesson-flow"><span>Hypothalamus releases GnRH</span><span>Pituitary releases LH and FSH</span><span>Gonads release hormones</span></div>
      <label class="lesson-control">Feedback view <select id="endocrineFeedback"><option value="follicle">Follicle growth</option><option value="surge">LH surge</option><option value="luteal">After ovulation</option><option value="testes">Testicular feedback</option></select></label>
      <div class="lesson-pair"><section><h3>During an ovulatory cycle</h3>
      <details open><summary>Follicle growth</summary><p>FSH supports follicle growth. The developing follicle produces increasing estradiol.</p></details>
      <details><summary>Ovulation</summary><p>Sustained high estradiol briefly promotes positive feedback. The LH surge triggers ovulation.</p></details>
      <details><summary>After ovulation</summary><p>The corpus luteum produces progesterone and estradiol. If pregnancy does not begin, both fall as the corpus luteum regresses.</p></details></section>
      <section><h3>In the testes</h3>
      <details open><summary>Testosterone production</summary><p>LH stimulates Leydig cells to produce testosterone.</p></details>
      <details><summary>Sperm development</summary><p>FSH acts on Sertoli cells. Together with local testosterone, their support helps developing sperm cells mature.</p></details>
      <details><summary>Negative feedback</summary><p>Testosterone helps restrain upstream signaling. Inhibin B from Sertoli cells helps suppress FSH.</p></details></section></div>
      <p>The same logic, a downstream hormone damping its own upstream signal, also runs the thyroid and adrenal axes. Insulin and glucagon work on a shorter loop: blood glucose itself is the feedback signal (see <a href="#balance">Balance</a>).</p><p>The steps show the order of events. Timing and hormone levels vary.</p><p><a href="#gametes">Continue to reproductive cells</a></p>${source}`},
  ].map(chapter=>{
    const bodyView=['endocrine-map','endocrine-patterns'].includes(chapter.id);
    return {where:'Endocrine signaling',legend:[],...chapter,
      html:bodyView ? ()=>chapter.html()+'<p data-anatomy-status role="status">The schematic appears while the anatomical model loads.</p>'+credits : chapter.html};
  });
  const supplementBase='https://cdn.jsdelivr.net/gh/ArianArsenal/anatomy-explorer@8375d6ce7fec36e677c0eda66cae829ba55a4717/public/models/';
  const supplementalGlands={
    hypothalamus:/^hypothalamus$/,
    pineal:/^pineal(?: gland| body)?$/,
    thyroid:/^thyroid gland$/,
    parathyroid:/^(?:(?:superior|inferior|upper|lower|left|right) )?parathyroid(?: gland)?(?:s)?$/,
    testis:/^(?:testis|testicle)$/,
  };
  let supplements;
  function glandSources() {
    supplements ||= Promise.allSettled(['organs','nerves'].map(kind=>anatomyFile(supplementBase+kind+'.glb')))
      .then(results=>{
        const meshes={};
        for (const result of results) {
          if (result.status!=='fulfilled') continue;
          result.value.traverse(object=>{
            if (!object.isMesh) return;
            const names=[object.name,object.parent?.name].filter(Boolean).map(name=>
              name.toLowerCase().replace(/[_.-]/g,' ').replace(/ (?:l|r|left|right|[0-9]+)$/,'').trim());
            for (const [gland,pattern] of Object.entries(supplementalGlands)) {
              if (!names.some(name=>pattern.test(name))) continue;
              (meshes[gland] ||= []).push(object);
            }
          });
        }
        return meshes;
      });
    return supplements;
  }
  function build({scene,addLabel}) {
    const groups={}, poses={}, behaviors={}, fog={}, depth={};
    const sphere=new THREE.SphereGeometry(1,20,14);
    const palette={rose:0xe68499,gold:0xf4bd65,teal:0x55ddca,purple:0xb199ef,blue:0x75b9f3,blood:0xa74056,duct:0x248fa2,enzyme:0xff79c6,nucleus:0x564264};
    const materials={};
    const vec=values=>new V3(...values);
    function cell(parent,color,p,scale) {
      const object=new THREE.Mesh(sphere,materials[color] ||= new THREE.MeshStandardMaterial({color:palette[color],roughness:.65}));
      object.position.copy(vec(p));
      object.scale.copy(vec(typeof scale==='number' ? [scale,scale,scale] : scale));
      parent.add(object);
      return object;
    }
    function tube(parent,color,points,radius) {
      const curve=new THREE.CatmullRomCurve3(points.map(vec));
      const geometry=new THREE.TubeGeometry(curve,28,radius,10,false);
      parent.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:palette[color]})));
      return curve;
    }
    function stream(parent,color,points,count,radius=.085) {
      const curve=new THREE.CatmullRomCurve3(points.map(vec));
      const markers=Array.from({length:count},()=>cell(parent,color,points[0],radius));
      return (time,speed=.23)=>markers.forEach((marker,i)=>curve.getPointAt((time*speed+i/count)%1,marker.position));
    }
    function layer(parent) {
      const object=new THREE.Group();
      parent.add(object);
      return object;
    }
    for (const {id} of chapters) {
      const root=layer(scene);
      groups[id]=root; fog[id]=.002; depth[id]=1;
      poses[id]={group:id,target:new V3(),pos:new V3(0,1,17),w:6.15};
      const label=(text,x,y,parent=root,color='electron')=>addLabel(text,color,parent,new V3(x,y,.62),[id]);
      let draw;
      if (id==='endocrine-map' || id==='endocrine-patterns') {
        const map=id==='endocrine-map', organs=[], models=new Map();
        const schematic=layer(root);
        let supplementalMeshes;
        const ghost=new THREE.MeshStandardMaterial({color:0x889bad,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide});
        const silhouette=[
          [[0,3.42,0],[.90,1.04,.69]],[[0,2.28,0],[.48,.65,.46]],[[0,1.16,0],[1.86,1.05,.60]],
          [[0,-.23,0],[1.29,1.32,.63]],[[0,-1.57,0],[1.47,.81,.66]],
        ];
        for (const side of [-1,1]) silhouette.push([[side*1.78,.37,0],[.36,1.37,.35]],[[side*.70,-2.58,0],[.63,1.08,.49]]);
        silhouette.forEach(([p,s])=>{const part=cell(schematic,'blue',p,s);part.material=ghost;part.renderOrder=2;});
        const organ=(region,color,p,s,anatomy,key)=>{
          const object=cell(root,color,p,s);
          organs.push({region,object,base:object.material,anatomy,key,position:object.position.clone(),scale:object.scale.clone()});
        };
        organ('brain','blue',[0,3.49,.27],[.23,.14,.14],null,'hypothalamus');
        organ('brain','rose',[.04,3.20,.36],[.15,.13,.12],null,'pituitary');
        organ('brain','purple',[.20,3.63,-.14],.10,null,'pineal');
        for (const side of [-1,1]) {
          organ('neck','rose',[side*.23,2.02,.45],[.20,.34,.13],null,'thyroid');
          for (const y of [1.91,2.15]) organ('neck','gold',[side*.25,y,.27],.068,null,'parathyroid');
          cell(schematic,'blood',[side*.85,-.84,-.04],[.32,.42,.23]);
          organ('abdomen','gold',[side*.85,-.45,.08],[.26,.13,.20],null,side<0 ? 'adrenal_r' : 'adrenal_l');
          organ('gonads','rose',[side*.62,-1.92,.44],[.20,.12,.11],'ovaries',side<0 ? 'ovary_r' : 'ovary_l');
          organ('gonads','blue',[side*.23,-2.64,.44],[.16,.23,.14],'testes','testis');
        }
        organ('neck','rose',[0,1.97,.49],[.22,.085,.08],null,'thyroid');
        organ('chest','purple',[0,1.16,.54],[.22,.37,.13],null,'thymus');
        for (let i=0;i<8;i++) organ('abdomen','rose',[-.75+.21*i,-1+.19*Math.sin(i*.39),.52],[.21,.17,.15],null,'pancreas');
        for (const [text,x,y] of (map ? [['Hypothalamus / pituitary',-2.25,3.42],['Pineal',1.50,3.63],
          ['Thyroid / parathyroids',2.14,2.0],['Thymus',-1.68,1.16],['Adrenals',-1.93,-.45],
          ['Pancreas',1.63,-1.00],['Gonads',1.56,-2.12]] :
          [['Adrenals',-1.93,-.45],['Gonads',1.56,-2.12]])) label(text,x,y);
        const highlight=new THREE.MeshStandardMaterial({color:palette.gold,emissive:0x563215});
        const status=(target,text)=>{if (target && target.textContent!==text) target.textContent=text;};
        function extract(node, parent, replacementMaterial) {
          node.traverse(part=>{
            if (!part.isMesh) return;
            const mesh=new THREE.Mesh(part.geometry,replacementMaterial);
            mesh.applyMatrix4(part.matrixWorld);
            parent.add(mesh);
          });
        }
        function startAvatar(anatomy) {
          const entry={state:'loading',nodes:[]};
          models.set(anatomy,entry);
          const sex=anatomy==='testes' ? 'male' : 'female';
          loadAnatomyAvatar(sex).then(asset=>{
            const skin=asset.getObjectByName('skin');
            if (!skin) throw new Error('Skin node unavailable');
            const bounds=new THREE.Box3().setFromObject(skin);
            const center=bounds.getCenter(new V3());
            const height=bounds.max.y-bounds.min.y;
            if (!Number.isFinite(height) || height<=0) throw new Error('Invalid avatar bounds');
            const avatar=layer(root);
            avatar.visible=false;
            const scale=12.5/height;
            avatar.scale.setScalar(scale);
            avatar.position.set(-center.x*scale,4.45-bounds.max.y*scale,-center.z*scale);
            const shell=layer(avatar);
            extract(skin,shell,ghost);
            shell.traverse(mesh=>{mesh.renderOrder=2;});
            entry.keys=new Set();
            for (const key of new Set(organs.map(organ=>organ.key))) {
              if (supplementalGlands[key]) continue;
              const node=asset.getObjectByName(key);
              if (!node) continue;
              const bucket=layer(avatar), spec=organs.find(organ=>organ.key===key);
              extract(node,bucket,spec.base);
              if (bucket.children.length) {
                entry.keys.add(key);
                entry.nodes.push({bucket,spec});
              }
            }
            entry.avatar=avatar;
            entry.shell=shell;
            entry.placements=new Map();
            avatar.updateWorldMatrix(true,true);
            entry.state='ready';
            glandSources().then(meshes=>{supplementalMeshes=meshes;});
          }).catch(error=>{
            entry.state='failed';
            console.warn('Could not display the endocrine avatar',error);
          });
          return entry;
        }
        const ray = new THREE.Raycaster();
        const forward = new V3(0,0,1);
        const relativeDepth = {hypothalamus:.52,pineal:.32,thyroid:.76,parathyroid:.59,testis:.58};
        function placementFor(entry,spec) {
          if (entry.placements.has(spec)) return entry.placements.get(spec);
          const position=spec.position.clone(), scale=spec.scale.clone();
          if (spec.key==='thyroid' && position.x===0) scale.set(.38,.31,.13);
          if (spec.key==='hypothalamus') scale.set(.135,.105,.10);
          // Sample the skin in the same world coordinates as the gland overlays.
          // The first and last hits bound the body's depth at this height.
          ray.set(new V3(position.x,position.y,-20),forward);
          const hits=ray.intersectObject(entry.shell,true);
          if (hits.length>=2) {
            const back=hits[0].point.z, front=hits[hits.length-1].point.z;
            const depth=front-back;
            if (depth>.001) {
              scale.z=Math.min(scale.z,depth*.20);
              const margin=scale.z+.035;
              position.z=depth<=margin*2 ? (back+front)/2 :
                THREE.MathUtils.clamp(back+depth*(relativeDepth[spec.key] ?? .5),back+margin,front-margin);
            }
          } else {
            position.z=0;
          }
          const placement={position,scale};
          entry.placements.set(spec,placement);
          return placement;
        }
        const overlays=new Map();
        function installSupplement(spec,source) {
          const bounds=new THREE.Box3().setFromObject(source);
          const dimensions=bounds.getSize(new V3());
          if (!(Math.max(dimensions.x,dimensions.y,dimensions.z)>0)) return;
          const bucket=layer(root), centered=layer(bucket);
          extract(source,centered,spec.base);
          centered.position.copy(bounds.getCenter(new V3())).negate();
          overlays.set(spec,{bucket,dimensions});
        }
        draw=()=>{
          const selected=map ? $('#endocrineRegion')?.value || 'brain' : 'gonads';
          const anatomy=$(map ? '#endocrineAnatomy' : '#endocrinePattern')?.value || 'ovaries';
          const current=models.get(anatomy) || startAvatar(anatomy);
          const ready=current.state==='ready';
          schematic.visible=!ready;
          for (const entry of models.values()) if (entry.avatar) entry.avatar.visible=entry===current;
          for (const {bucket,spec} of current.nodes) {
            for (const mesh of bucket.children) mesh.material=spec.region===selected ? highlight : spec.base;
          }
          const fallback=new Set();
          const thyroidMesh=organs.some(spec=>spec.key==='thyroid' && overlays.has(spec));
          for (const spec of organs) {
            const {region,object,base,anatomy:kind,key}=spec;
            const applies=!kind || kind===anatomy;
            const source=supplementalMeshes?.[key]?.[0];
            const member=key!=='thyroid' || object.position.x===0;
            if (ready && source && applies && member && !overlays.has(spec)) installSupplement(spec,source);
            const overlay=overlays.get(spec);
            const placement=ready && applies && !current.keys.has(key) ? placementFor(current,spec) : spec;
            object.position.copy(placement.position);
            object.scale.copy(placement.scale);
            if (key==='thyroid' && member && !overlay) object.scale.copy(spec.scale);
            if (overlay) {
              const {bucket,dimensions}=overlay;
              bucket.visible=ready && applies;
              bucket.position.copy(placement.position);
              const size=placement.scale;
              const fit=Math.min(2*size.x/Math.max(.0001,dimensions.x),
                2*size.y/Math.max(.0001,dimensions.y),2*size.z/Math.max(.0001,dimensions.z));
              bucket.scale.setScalar(fit);
              bucket.traverse(mesh=>{if (mesh.isMesh) mesh.material=region===selected ? highlight : base;});
            }
            const imported=ready && (current.keys.has(key) || Boolean(overlay || (key==='thyroid' && !member && thyroidMesh)));
            object.visible=applies && !imported;
            object.material=region===selected ? highlight : base;
            if (object.visible) fallback.add(key.replace(/_/g,' '));
          }
          const output=$('[data-anatomy-status]');
          if (ready) status(output, fallback.size ? 'Open Anatomy 3D body. Schematic landmarks: '+[...fallback].join(', ')+'.' : 'Open Anatomy 3D body with supplemental gland meshes.');
          else status(output,current.state==='failed' ? 'The detailed model could not load. Showing the schematic body.' : 'The schematic appears while the anatomical model loads.');
        };
      } else if (id==='endocrine-secretion') {
        const islet=layer(root), acini=layer(root);
        const vessel=[[-5.2,-1.50,0],[-3.85,-1.26,0],[-2,-1.20,0],[-.4,-.78,0]];
        const outlet=[[2.75,-.8,0],[2.74,.32,0],[2.87,1.24,0],[4.9,1.88,0]];
        tube(islet,'blood',vessel,.22);
        tube(acini,'duct',outlet,.22);
        cell(islet,'nucleus',[-2.85,.11,-.34],[1.58,1.33,.33]);
        const cells=[['teal',-3.75,.44],['teal',-2.78,.80],['gold',-2.30,.24],['purple',-2.99,-.28],
          ['blue',-1.89,-.30],['teal',-2.40,-.54],['gold',-3.53,-.39],['teal',-3.08,.27],['teal',-1.98,.66]];
        const secretions=cells.map(([color,x,y])=>{
          cell(islet,color,[x,y,.13],[.34,.34,.24]);
          cell(islet,'nucleus',[x+.04,y+.05,.35],.082);
          return stream(islet,color,[[x,y,.39],[x+.05,y-.19,.53],[x+.24,-1.17,.19],[-.41,-.78,.17]],2,.067);
        });
        for (const [x,y] of [[1.86,-.56],[3.65,-.55],[1.87,.52],[3.65,.53]]) {
          for (let i=0;i<6;i++) {
            const angle=i*Math.PI/3, px=x+.33*Math.cos(angle), py=y+.33*Math.sin(angle);
            cell(acini,'rose',[px,py,.11],[.23,.23,.21]);
            cell(acini,'nucleus',[px,py,.30],.063);
          }
          tube(acini,'duct',[[x,y,.01],[(x+2.75)/2,y+.01,0],[2.75,y+.13,0]],.08);
        }
        const enzymes=stream(acini,'enzyme',[[3.65,-.70,.30],[3.57,-.55,.24],[2.76,-.46,.18],[2.74,.32,.18],[2.87,1.24,.18],[4.9,1.88,.18]],10);
        label('Pancreatic islet',-2.80,1.71,islet,'insulin');
        label('Capillary',-3.08,-1.91,islet,'rbc');
        label('Acinar cells',3.06,-1.45,acini,'rbc');
        label('Duct to small intestine',3.37,2.40,acini);
        draw=time=>{
          const view=$('#endocrineRoute')?.value;
          islet.visible=view!=='duct'; acini.visible=view!=='blood';
          secretions.forEach((animate,i)=>animate(time+i*.29));
          enzymes(time);
        };
      } else if (id==='endocrine-receptors') {
        // Left: insulin at a membrane receptor, with GLUT4 sliding to the surface. Right: estradiol entering to an intracellular receptor.
        const x=-2.58;
        cell(root,'rose',[x,-.32,0],[1.72,1.40,.43]);
        cell(root,'nucleus',[x,-.58,.37],[.55,.41,.17]);
        tube(root,'blue',[[x-.29,1.05,.23],[x-.13,.87,.34],[x,.80,.40],[x+.13,.87,.34],[x+.29,1.05,.23]],.092);
        const transporters=Array.from({length:4},(_,i)=>cell(root,'blue',[x+1.03,-.60+i*.28,.35],[.11,.095,.08]));
        cell(root,'purple',[2.61,-.32,0],[1.72,1.40,.40]);
        cell(root,'nucleus',[2.61,-.59,.38],[.58,.44,.14]);
        tube(root,'purple',[[2.43,-.45,.59],[2.62,-.57,.62],[2.79,-.44,.59]],.08);
        const estradiol=stream(root,'gold',[[2.62,2.46,.47],[2.62,1.06,.49],[2.65,.36,.49],[2.62,-.48,.67]],1,.13);
        const route=[[x,2.42,.46],[x,1.50,.47],[x,.92,.54]];
        label('Estradiol',2.61,2.83); label('Intracellular receptor',2.61,-2.10);
        const insulin=stream(root,'teal',route,1,.13);
        label('Insulin receptor',x,1.35); label('GLUT4 moves to the membrane',x,-2.07);
        draw=time=>{
          insulin(time,.19);
          estradiol(time,.19);
          const progress=Math.min(1,Math.max(0,((time*.19)%1-.76)*7));
          transporters.forEach(marker=>{marker.position.x=x+1.03+.62*progress;});
        };
      } else {
        const stages={
          follicle:['Ovary','Estradiol · negative feedback'],
          surge:['Mature follicle','High estradiol · positive feedback'],
          luteal:['Corpus luteum','Progesterone and estradiol · negative feedback'],
          testes:['Testes','Testosterone · negative feedback'],
        };
        cell(root,'purple',[-3.57,.36,0],[.82,.57,.47]);
        cell(root,'rose',[0,.36,0],[.70,.52,.44]);
        cell(root,'rose',[3.57,.36,0],[.88,.62,.46]);
        const signals=[
          ['purple',[[-2.81,.49,.04],[-1.83,.74,.06],[-.63,.49,.04]]],
          ['blue',[[.63,.49,.04],[1.83,.74,.06],[2.76,.49,.04]]],
          ['gold',[[3.53,-.18,.04],[2.68,-1.13,.05],[0,-1.51,.06],[-2.68,-1.13,.05],[-3.53,-.18,.04]]],
        ];
        const pulses=signals.map(([color,points])=>{
          tube(root,color,points,.064);
          return stream(root,color,points,3,.103);
        });
        label('Hypothalamus',-3.57,1.40); label('Pituitary',0,1.40);
        label('GnRH',-1.75,.98); label('LH and FSH',1.72,.98);
        const stageLayers=Object.entries(stages).map(([key,[organ,feedback]])=>{
          const frame=layer(root);
          label(organ,3.57,1.40,frame); label(feedback,0,-2.15,frame,'atp');
          return [key,frame];
        });
        draw=time=>{
          const view=$('#endocrineFeedback')?.value || 'follicle';
          stageLayers.forEach(([key,frame])=>{frame.visible=key===view;});
          pulses[0](time); pulses[1](time,view==='surge' ? .51 : .23); pulses[2](time);
        };
      }
      let elapsed=0;
      behaviors[id]={
        enter(){elapsed=0;draw(reduceMotion ? 2 : 0);},
        tick(_,delta){if (!reduceMotion) elapsed+=delta;draw(reduceMotion ? 2 : elapsed);},
      };
    }
    return {groups,poses,behaviors,fog,depth};
  }
  return { chapters, build };
})();

/* ================= one module, one chapter order ================= */
// Big picture first (glands, receptor classes, the pancreas as a mixed gland), then insulin in depth,
// then the reproductive axis, which leads on to the Reproductive cells module.
const ORDER = ['endocrine-map', 'endocrine-receptors', 'endocrine-secretion', 'islet', 'beta', 'receptor', 'balance', 'diabetes', 'petprep', 'endocrine-patterns', 'endocrine-feedback'];
const BY_ID = Object.fromEntries([...INSULIN_CHAPTERS, ...ENDOCRINE.chapters].map(ch => [ch.id, ch]));
// Depth only steers the "zooming in / out" fade between scenes: body < organ < tissue < cell < molecule.
const ENDOCRINE_DEPTH = { 'endocrine-map': -0.8, 'endocrine-patterns': -0.8, 'endocrine-feedback': -0.4, 'endocrine-secretion': 0.3, 'endocrine-receptors': 2 };

CellCity.register('hormones', {
  chapters: ORDER.map(id => BY_ID[id]),
  build(g) {
    const a = buildInsulin(g), b = ENDOCRINE.build(g);
    return {
      groups: { ...a.groups, ...b.groups },
      unitsPerNm: a.unitsPerNm,
      fog: { ...a.fog, ...b.fog },
      depth: { ...a.depth, ...b.depth, ...ENDOCRINE_DEPTH },
      fadeText: { ...a.fadeText, 'endocrine-map': 'Out to the whole body' },
      poses: { ...a.poses, ...b.poses },
      behaviors: { ...a.behaviors, ...b.behaviors },
    };
  },
});
})();
