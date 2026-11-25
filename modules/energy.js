/* Energy module: the cell, digestion, glycolysis, link reaction, Krebs cycle, electron transport chain, ATP ledger. */
(() => {
'use strict';

const ORGANELLES = [
  { id: 'nucleus', name: 'Nucleus', role: 'Head office & archive', c: 'nucleus',
    text: 'Holds the blueprints: about 2 metres of DNA folded into a sphere roughly 6 µm across. Orders go out as messenger RNA through thousands of nuclear pores.' },
  { id: 'er', name: 'Rough ER', role: 'Production line', c: 'membrane',
    text: 'A maze of membrane sheets studded with ribosomes. Proteins meant for export or for membranes are built and folded here.' },
  { id: 'golgi', name: 'Golgi apparatus', role: 'Shipping & packaging', c: 'golgi',
    text: 'A stack of flattened sacs that trims, tags and sorts proteins, then buds them off in vesicles addressed to their destination.' },
  { id: 'mito', name: 'Mitochondria', role: 'Power plants', c: 'mito',
    text: 'Where the Krebs cycle and the electron transport chain run. A liver cell has around a thousand or more; heart muscle is packed with them.' },
  { id: 'lyso', name: 'Lysosomes', role: 'Recycling centre', c: 'lyso',
    text: 'Acidic sacs (pH about 4.5 to 5) full of digestive enzymes that break down worn-out parts and anything the cell swallows.' },
  { id: 'ribo', name: 'Ribosomes', role: 'Assembly benches', c: 'co2',
    text: 'Molecular machines that read mRNA and link amino acids into proteins. Free ones in the cytosol make the cell’s own working proteins.' },
  { id: 'cyto', name: 'Cytoskeleton', role: 'Roads & rail', c: 'pyruvate',
    text: 'Microtubules and actin filaments hold the city’s shape. Motor proteins walk cargo along them like trains on tracks.' },
  { id: 'membrane', name: 'Plasma membrane', role: 'City wall & gates', c: 'glucose',
    text: 'A lipid bilayer only 5 to 10 nm thick. Transporters such as GLUT act as gates, so glucose only enters where a door is open.' },
];

const KN = [
  { name: 'Oxaloacetate', short: 'OAA', c: 4 },
  { name: 'Citrate', short: 'CIT', c: 6 },
  { name: 'Isocitrate', short: 'ICT', c: 6 },
  { name: 'α-Ketoglutarate', short: 'αKG', c: 5 },
  { name: 'Succinyl-CoA', short: 'SCoA', c: 4 },
  { name: 'Succinate', short: 'SUC', c: 4 },
  { name: 'Fumarate', short: 'FUM', c: 4 },
  { name: 'Malate', short: 'MAL', c: 4 },
];
const KSTEPS = [
  { enzyme: 'Citrate synthase', extraIn: 'Acetyl-CoA', extraInC: 2, out: [],
    note: 'The 2-carbon acetyl group joins 4-carbon oxaloacetate to make citrate. Coenzyme A is set free to go and collect another acetyl group.' },
  { enzyme: 'Aconitase', out: [],
    note: 'A hydroxyl group is moved, turning citrate into its isomer isocitrate. Nothing is released; this sets up the first oxidation.' },
  { enzyme: 'Isocitrate dehydrogenase', out: ['NADH', 'CO2'],
    note: 'First oxidation. One carbon leaves as CO₂ and a pair of electrons is loaded onto NAD⁺. This is the cycle’s main control point.' },
  { enzyme: 'α-Ketoglutarate dehydrogenase', out: ['NADH', 'CO2'],
    note: 'A second carbon leaves as CO₂ and another NADH is made. Two carbons in, two carbons out: the books now balance.' },
  { enzyme: 'Succinyl-CoA synthetase', out: ['GTP'],
    note: 'The energy in the thioester bond makes one GTP (ATP in some tissues). This is the only energy currency the cycle makes directly.' },
  { enzyme: 'Succinate dehydrogenase', out: ['FADH2'],
    note: 'This enzyme is built into the inner membrane and doubles as Complex II of the electron transport chain. It loads electrons onto FAD.' },
  { enzyme: 'Fumarase', out: [],
    note: 'Water is added across the double bond of fumarate, giving malate.' },
  { enzyme: 'Malate dehydrogenase', out: ['NADH'],
    note: 'The third NADH. Oxaloacetate is regenerated, ready to grab the next acetyl group, which is what makes this a cycle.' },
];

/* ---------- carbon tracing (pure logic) ----------
   Labels: 'M' = traced carbon that arrived as the acetyl CH3, 'K' = as the acetyl C=O, 0 = any other carbon.
   Carbon order per intermediate:
     oxaloacetate [1,2,3,4]; citrate and isocitrate [oaa1, oaa2, oaa3, oaa4, acetyl CH2, acetyl COO];
     alpha-ketoglutarate [oaa4, oaa3, oaa2, CH2, COO]; succinyl-CoA onward [4 carbons]. */
/*TRACE-START*/
function traceTurn(oaa, acetyl, flip) {
  const [o1, o2, o3, o4] = oaa, [aM, aK] = acetyl;
  const cit = [o1, o2, o3, o4, aM, aK];
  const akg = [o4, o3, o2, aM, aK];              // isocitrate dehydrogenase removes oaa1
  const scoa = [o3, o2, aM, aK];                 // alpha-KG dehydrogenase removes oaa4
  const fum = flip ? scoa.slice().reverse() : scoa.slice(); // succinate is symmetrical
  return { nodes: [oaa.slice(), cit, cit, akg, scoa, scoa, fum, fum], released: { 2: o1, 3: o4 }, end: fum };
}
function makeTrace(rand) {
  const turns = [];
  return function turn(n) {                      // n starts at 1
    while (turns.length < n) {
      const i = turns.length;
      turns.push(traceTurn(i ? turns[i - 1].end : [0, 0, 0, 0], i ? [0, 0] : ['M', 'K'], rand() < 0.5));
    }
    return turns[n - 1];
  };
}
/*TRACE-END*/
const CARBON_NAMES = [
  ['COO⁻', 'C=O', 'CH₂', 'COO⁻'],
  ['COO⁻', 'C–OH', 'CH₂', 'COO⁻', 'CH₂', 'COO⁻'],
  ['COO⁻', 'CH', 'CHOH', 'COO⁻', 'CH₂', 'COO⁻'],
  ['COO⁻', 'C=O', 'CH₂', 'CH₂', 'COO⁻'],
  ['C–SCoA', 'CH₂', 'CH₂', 'COO⁻'],
  ['COO⁻', 'CH₂', 'CH₂', 'COO⁻'],
  ['COO⁻', '=CH', '=CH', 'COO⁻'],
  ['COO⁻', 'CHOH', 'CH₂', 'COO⁻'],
];
const MOL_KEYS = ['oaa', 'cit', 'icit', 'akg', 'scoa', 'suc', 'fum', 'mal'];
/* PubChem computed 3D conformers, heavy atoms only: a = [element, x, y, z] in angstrom, b = [atom, atom, bond order].
   Carbons come first, in the order described above. */
const MOLS = {"oaa":{"a":[["C",1.913,0.31,0.01],["C",0.533,-0.286,0.008],["C",-0.622,0.683,0.03],["C",-1.998,0.066,0.004],["O",-2.967,1.019,-0.002],["O",0.456,-1.505,-0.001],["O",2.832,-0.663,0.002],["O",-2.244,-1.132,-0.022],["O",2.097,1.51,-0.028]],"b":[[4,3,1],[5,1,2],[6,0,1],[7,3,2],[8,0,2],[2,1,1],[2,3,1],[1,0,1]],"nc":4,"cid":970},"cit":{"a":[["C",0.607,-1.686,-0.323],["C",-0.124,-0.391,0.117],["C",-1.532,-0.535,-0.487],["C",-2.47,0.642,-0.19],["C",0.568,0.898,-0.335],["C",2.005,1.158,0.147],["O",-0.213,-0.39,1.542],["O",0.073,-2.77,0.048],["O",1.668,-1.511,-0.989],["O",2.257,0.686,1.294],["O",-2.106,1.748,-0.679],["O",2.761,1.79,-0.639],["O",-3.495,0.361,0.492]],"b":[[6,1,1],[7,0,1],[8,0,2],[9,5,1],[10,3,1],[11,5,2],[12,3,2],[1,4,1],[1,2,1],[1,0,1],[4,5,1],[2,3,1]],"nc":6,"cid":31348},"icit":{"a":[["C",-0.733,-1.581,0.187],["C",-0.034,-0.262,-0.224],["C",1.423,-0.391,0.256],["C",2.344,0.806,-0.048],["C",-0.736,0.984,0.33],["C",-2.206,1.168,-0.073],["O",2.019,-1.552,-0.325],["O",-0.815,-1.812,1.425],["O",-1.142,-2.28,-0.786],["O",2.436,1.147,-1.26],["O",2.888,1.328,0.969],["O",-2.783,2.208,0.348],["O",-2.663,0.237,-0.797]],"b":[[6,2,1],[7,0,1],[8,0,2],[9,3,1],[10,3,2],[11,5,1],[12,5,2],[1,2,1],[1,4,1],[1,0,1],[2,3,1],[4,5,1]],"nc":6,"cid":5459771},"akg":{"a":[["C",2.247,-0.026,-0.096],["C",0.791,-0.109,0.267],["C",-0.038,1.151,0.378],["C",-1.488,0.873,0.752],["C",-2.291,-0.007,-0.214],["O",0.389,-1.248,0.458],["O",-1.978,0.059,-1.434],["O",-3.19,-0.7,0.346],["O",2.858,-1.132,-0.156],["O",2.702,1.137,-0.302]],"b":[[5,1,2],[6,4,1],[7,4,2],[8,0,1],[9,0,2],[2,3,1],[2,1,1],[3,4,1],[1,0,1]],"nc":5,"cid":164533},"suc":{"a":[["C",1.588,-0.189,0.067],["C",0.75,1.089,0.194],["C",-0.675,0.918,0.699],["C",-1.595,0.026,-0.143],["O",2.757,0.003,-0.375],["O",-1.378,0.002,-1.385],["O",1.031,-1.266,0.415],["O",-2.478,-0.583,0.528]],"b":[[4,0,1],[5,3,1],[6,0,2],[7,3,2],[1,2,1],[1,0,1],[2,3,1]],"nc":4,"cid":160419},"fum":{"a":[["C",1.969,0.03,0.0],["C",0.503,-0.43,-0.001],["C",-0.508,0.447,-0.0],["C",-1.974,-0.014,-0.0],["O",2.806,-0.92,0.001],["O",-2.86,0.886,0.001],["O",2.181,1.275,-0.001],["O",-2.118,-1.272,-0.001]],"b":[[4,0,1],[5,3,1],[6,0,2],[7,3,2],[1,2,2],[1,0,1],[2,3,1]],"nc":4,"cid":5460307},"mal":{"a":[["C",-1.352,0.564,-0.184],["C",-0.682,-0.63,0.514],["C",0.671,-1.025,-0.064],["C",1.782,0.031,0.034],["O",-1.574,-1.735,0.374],["O",-1.54,0.457,-1.427],["O",-1.641,1.523,0.59],["O",2.628,0.052,-0.901],["O",1.706,0.763,1.063]],"b":[[4,1,1],[5,0,1],[6,0,2],[7,3,1],[8,3,2],[1,2,1],[1,0,1],[2,3,1]],"nc":4,"cid":5459792}};
MOLS.scoa = (() => {                              // schematic: one single-bonded O on carbon 0 of succinate becomes S-CoA
  const m = JSON.parse(JSON.stringify(MOLS.suc));
  const bond = m.b.find(b => b[2] === 1 && (b[0] === 0 || b[1] === 0) && m.a[b[0] === 0 ? b[1] : b[0]][0] === 'O');
  const o = m.a[bond[0] === 0 ? bond[1] : bond[0]], c = m.a[0];
  const len = Math.hypot(o[1] - c[1], o[2] - c[2], o[3] - c[3]);
  o[0] = 'S'; for (let k = 1; k < 4; k++) o[k] = c[k] + (o[k] - c[k]) / len * 1.8;
  return m;
})();

const CHAPTERS = [
  {
    id: 'cell', short: 'Cell city', where: 'The whole cell · about 20 µm across',
    title: 'A city the size of a speck of dust',
    legend: [['nucleus', 'Nucleus'], ['membrane', 'Membrane & ER'], ['golgi', 'Golgi'], ['mito', 'Mitochondria'], ['lyso', 'Lysosomes']],
    html: () => `
      <p class="lede">Every one of your roughly <a href="https://doi.org/10.1371/journal.pbio.1002533" target="_blank" rel="noopener">30 trillion cells</a> runs like a small industrial city. It has an archive, production lines, a shipping depot, recycling and, most important for this story, power plants.</p>
      <p class="muted">Pick a district to fly to it. Then follow a single glucose molecule from your last meal all the way to ATP, the energy currency every district spends.</p>
      <div class="orgs" id="orgs">${ORGANELLES.map(o => `
        <button class="org" type="button" data-id="${o.id}" style="--c:var(--${o.c})"><i></i><span><b>${o.name}</b><small>${o.role}</small></span></button>`).join('')}
      </div>
      <div class="org-card" id="orgCard"><h3>Choose a district</h3><p>Each label in the 3D view is clickable too.</p></div>`,
  },
  {
    id: 'fuel', short: 'Fuel', where: 'Digestion & the cell surface',
    title: 'Three fuel lines, one destination',
    legend: [['glucose', 'Glucose (from carbs)'], ['fat', 'Fatty acids (from fats)'], ['amino', 'Amino acids (from protein)']],
    html: () => `
      <p class="lede">Carbohydrates really are broken down to glucose. Fats and proteins take their own roads, though, and merge into the same pathway further downstream. The shared destination is ATP.</p>
      <div class="routes">
        <div class="route">
          <h3>${m('Carbohydrates', 'glucose')}</h3>
          <div class="path">starch, sugar → glucose → glycolysis → pyruvate → acetyl-CoA</div>
          <p>The main road, and the one this explainer follows. Your brain runs almost entirely on it.</p>
        </div>
        <div class="route">
          <h3>${m('Fats', 'fat')}</h3>
          <div class="path">triglyceride → fatty acids → β-oxidation → acetyl-CoA</div>
          <p>Fatty acids are chopped two carbons at a time inside mitochondria and join the Krebs cycle directly. One 16-carbon palmitate yields 8 acetyl-CoA and about 106 ATP. The glycerol backbone joins glycolysis.</p>
        </div>
        <div class="route">
          <h3>${m('Proteins', 'amino')}</h3>
          <div class="path">protein → amino acids → pyruvate, acetyl-CoA or Krebs intermediates</div>
          <p>Mostly reused to build new proteins. When burned, the nitrogen is removed (it leaves as urea) and the carbon skeleton enters wherever it fits.</p>
        </div>
      </div>
      <p class="muted">Where the idea that everything becomes glucose comes from: between meals the liver does build new glucose from amino acids and glycerol (gluconeogenesis) to keep blood sugar steady for the brain.</p>`,
  },
  {
    id: 'glycolysis', short: 'Glycolysis', where: 'Cytosol · no oxygen needed',
    title: 'Glycolysis: splitting sugar in the streets',
    legend: [['glucose', 'Glucose 6C'], ['pyruvate', 'Pyruvate 3C'], ['atp', 'ATP'], ['nadh', 'NADH'], ['fdg', 'FDG (PET tracer)']],
    html: () => `
      <p class="lede">Glucose enters through a GLUT transporter and is taken apart in the cytosol by ten enzymes in a row. One 6-carbon sugar becomes two 3-carbon pyruvates.</p>
      <div class="eq">${m('glucose', 'glucose')} + 2 NAD⁺ + 2 ADP → 2 ${m('pyruvate', 'pyruvate')} + 2 ${m('NADH', 'nadh')} + 2 ${m('ATP', 'atp')}</div>
      <ul class="facts">
        <li>The cell invests 2 ATP up front and earns 4 back: a net profit of <b>2 ATP</b>.</li>
        <li>It also loads <b>2 NADH</b>, which carry electrons to the mitochondria for a much bigger payout later.</li>
        <li>What opens glucose gates in muscle and fat? Insulin, covered in <a href="#receptor">Hormones</a>.</li>
        <li>It works without oxygen. When oxygen runs short (a sprinting muscle), pyruvate is turned into lactate so glycolysis can keep going.</li>
      </ul>
      <div class="callout">
        <span class="eyebrow">Radiology link · FDG-PET</span>
        <p><b>¹⁸F-FDG</b> is glucose with one oxygen swapped for radioactive fluorine. It enters through the same GLUT gates and hexokinase phosphorylates it, but FDG-6-phosphate cannot continue down glycolysis, so it stays trapped in the cell.</p>
        <p>A PET scan maps that trapped tracer. Tissues burning lots of glucose light up: brain, heart, active muscle and many tumours, which lean heavily on glycolysis (the Warburg effect). Watch for the orange molecule in the 3D view.</p>
      </div>
      <details>
        <summary>All ten steps</summary>
        <ol>
          <li><b>Hexokinase</b>: glucose → glucose-6-phosphate. Spends 1 ATP and traps the sugar. FDG stops here.</li>
          <li><b>Phosphoglucose isomerase</b>: → fructose-6-phosphate.</li>
          <li><b>Phosphofructokinase-1</b>: → fructose-1,6-bisphosphate. Spends 1 ATP. The main control valve.</li>
          <li><b>Aldolase</b>: splits the 6-carbon sugar into two 3-carbon halves.</li>
          <li><b>Triose phosphate isomerase</b>: makes both halves the same (G3P).</li>
          <li><b>GAPDH</b>: G3P → 1,3-bisphosphoglycerate, making NADH (×2).</li>
          <li><b>Phosphoglycerate kinase</b>: makes ATP (×2).</li>
          <li><b>Phosphoglycerate mutase</b>: moves the phosphate.</li>
          <li><b>Enolase</b>: removes water to make PEP.</li>
          <li><b>Pyruvate kinase</b>: makes ATP (×2) and releases pyruvate.</li>
        </ol>
      </details>`,
  },
  {
    id: 'link', short: 'Link', where: 'Mitochondrial matrix · about 2 µm long',
    title: 'Through the power plant gates',
    legend: [['pyruvate', 'Pyruvate 3C'], ['acetyl', 'Acetyl-CoA 2C'], ['nadh', 'NADH'], ['co2', 'CO₂'], ['mito', 'Membranes']],
    html: () => `
      <p class="lede">We have zoomed about 10× into one mitochondrion. It has two membranes: a smooth outer one and a heavily folded inner one (the cristae). The space inside is the matrix.</p>
      <p>Pyruvate is carried across both membranes into the matrix. There the pyruvate dehydrogenase complex cuts off one carbon and attaches what is left to coenzyme A.</p>
      <div class="eq">${m('pyruvate', 'pyruvate')} + CoA + NAD⁺ → ${m('acetyl-CoA', 'acetyl')} + ${m('CO₂', 'co2')} + ${m('NADH', 'nadh')}</div>
      <ul class="facts">
        <li>This is the first CO₂ you breathe out from that meal. It happens twice per glucose.</li>
        <li>The enzyme complex needs vitamins B1 (thiamine), B2, B3 and B5 plus lipoic acid. Thiamine deficiency stalls it, which is part of why Wernicke encephalopathy hits the glucose-hungry brain (<a href="https://doi.org/10.1016/S1474-4422(07)70104-7" target="_blank" rel="noopener">review</a>).</li>
        <li>Acetyl-CoA is the hub: glucose, fats and many amino acids all funnel into it before the Krebs cycle.</li>
      </ul>`,
  },
  {
    id: 'krebs', short: 'Krebs', where: 'Mitochondrial matrix',
    title: 'The Krebs cycle',
    legend: [['tag-m', 'Traced C (was CH₃)'], ['tag-k', 'Traced C (was C=O)'], ['carbon', 'Other carbon'], ['oxygen', 'Oxygen'], ['nadh', 'NADH'], ['fadh', 'FADH₂'], ['atp', 'GTP'], ['co2', 'CO₂']],
    html: () => `
      <p class="lede">Each turn takes in a 2-carbon acetyl group, releases two carbons as CO₂ and loads the electrons onto carrier molecules. The molecule in the middle is the current intermediate in 3D. Follow the two coloured carbons from your first acetyl group.</p>
      <div class="krebs">
        <div class="step-card" id="kCard"></div>
        <div class="ctl">
          <button class="btn" id="kPrev" type="button" aria-label="Previous step">← Step</button>
          <button class="btn primary" id="kPlay" type="button">Pause</button>
          <button class="btn" id="kNext" type="button" aria-label="Next step">Step →</button>
        </div>
        <div class="dots" id="kDots">${KN.map((k, i) => `<button type="button" data-i="${i}" title="Step ${i + 1}: ${KN[i].name} → ${KN[(i + 1) % 8].name}">${i + 1}</button>`).join('')}</div>
        <div class="tracer">
          <div class="tr-head"><span class="eyebrow" id="kTurn">Carbon tracer · turn 1</span><button class="btn" id="kRestart" type="button">Restart trace</button></div>
          <div class="strip" id="kStrip"></div>
          <p id="kStatus"></p>
          <div class="fates" id="kFates"></div>
        </div>
        <div>
          <div class="eyebrow" style="margin-bottom:6px">This turn so far</div>
          <div class="tally" id="kTally"></div>
        </div>
      </div>
      <ul class="facts">
        <li>The two CO₂ released in a turn are <b>not</b> the two carbons that just arrived. Both come from the oxaloacetate half of citrate. Aconitase can tell citrate’s two look-alike arms apart, even though citrate has no chiral carbon.</li>
        <li>Succinate is symmetrical, so from fumarate onward each traced carbon can sit at either of two mirror-image positions. The tracer picks one at random, so restart it to see another path. The former C=O carbon always leaves during turn 2. The former CH₃ carbon stays through turn 2 and may leave in turn 3 or much later.</li>
        <li>This follows one molecule through the cycle alone. In a living cell, intermediates are also drawn off to build other things and topped up from elsewhere.</li>
        <li>Per turn: <b>3 NADH, 1 FADH₂, 1 GTP and 2 CO₂</b>. Glucose gives two acetyl-CoA, so the cycle turns twice per glucose.</li>
        <li>The cycle makes very little ATP by itself. Its real product is high-energy electrons, handed to the next chapter.</li>
        <li>Hans Krebs worked out the cycle in 1937 using minced pigeon breast muscle, and shared the 1953 Nobel Prize for it.</li>
      </ul>
      <p class="mnemonic">Mnemonic for the order: <b>C</b>itrate <b>I</b>s <b>K</b>rebs’ <b>S</b>tarting <b>S</b>ubstrate <b>F</b>or <b>M</b>aking <b>O</b>xaloacetate.</p>
      <p class="credit">3D shapes are computed conformers from <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener">PubChem</a> (CIDs 970, 31348, 5459771, 164533, 160419, 5460307, 5459792), shown enlarged, with hydrogens hidden and acids as their ions. PubChem had no 3D record for succinyl-CoA, so it is a schematic adapted from succinate with coenzyme A abbreviated. A conformer is one possible shape; in water these molecules flex.</p>`,
  },
  {
    id: 'etc', short: 'ETC', where: 'Inner mitochondrial membrane · nanometre scale',
    title: 'The electron transport chain',
    legend: [['electron', 'Electrons (2e⁻)'], ['proton', 'H⁺ protons'], ['atp', 'ATP'], ['fadh', 'Ubiquinone (Q)'], ['mito', 'Cytochrome c']],
    html: () => `
      <p class="lede">Another 1,000× zoom, onto a patch of the inner membrane. NADH and FADH₂ drop off their electrons here, and the electrons pass down a chain of protein complexes like water down a series of mill wheels.</p>
      <ul class="facts">
        <li>${m('NADH', 'nadh')} feeds Complex I and ${m('FADH₂', 'fadh')} feeds Complex II. Ubiquinone (Q) ferries electrons to Complex III, and cytochrome c carries them to Complex IV.</li>
        <li>Complex IV hands the electrons to <b>oxygen</b>, which picks up protons and becomes water. This is why you breathe. Cyanide and carbon monoxide block Complex IV.</li>
        <li>Complexes I, III and IV use the energy to pump ${m('H⁺', 'proton')} into the intermembrane space: about 10 protons per NADH. That builds a charge of roughly 150 to 180 mV across a membrane only a few nanometres thick.</li>
        <li>Protons flow back through <b>ATP synthase</b>, a true rotary motor. The flow spins its rotor, and each full turn makes 3 ${m('ATP', 'atp')}.</li>
        <li>Roughly 2.5 ATP per NADH and 1.5 per FADH₂. Brown fat lets protons leak back through UCP1 instead, releasing the energy as heat.</li>
      </ul>`,
  },
  {
    id: 'tally', short: 'Ledger', where: 'The whole cell, again',
    title: 'The ledger: one glucose, about 32 ATP',
    legend: [['mito', 'Mitochondria'], ['atp', 'ATP leaving to be spent']],
    html: () => `
      <div class="big"><b>≈32</b><span>ATP from one glucose<br>with oxygen, versus 2 without</span></div>
      <div class="table-wrap">
        <table class="ledger">
          <thead><tr><th>Stage</th><th>ATP/GTP</th><th>NADH</th><th>FADH₂</th><th>CO₂</th></tr></thead>
          <tbody>
            <tr><td>Glycolysis<small>cytosol</small></td><td>2</td><td>2</td><td>–</td><td>–</td></tr>
            <tr><td>Link reaction ×2<small>matrix</small></td><td>–</td><td>2</td><td>–</td><td>2</td></tr>
            <tr><td>Krebs cycle ×2<small>matrix</small></td><td>2</td><td>6</td><td>2</td><td>4</td></tr>
            <tr class="sum"><td>Total</td><td>4</td><td>10</td><td>2</td><td>6</td></tr>
          </tbody>
        </table>
      </div>
      <div class="eq">10 ${m('NADH', 'nadh')} × 2.5 = 25 · 2 ${m('FADH₂', 'fadh')} × 1.5 = 3 · + 4 = <span class="m" style="--c:var(--atp)">≈32 ATP</span></div>
      <ul class="facts">
        <li>The figure is about 30 when NADH from glycolysis enters the mitochondrion by the glycerol-phosphate shuttle, which hands its electrons to FAD instead.</li>
        <li>All six carbons of glucose leave as the CO₂ you exhale. The oxygen you inhale ends up as water.</li>
        <li>ATP is spent almost as fast as it is made. An average person uses and remakes about <b>50 kg</b> of it a day (Bolsover et al., <i>Cell Biology</i>, 2004).</li>
      </ul>
      <div class="eq">C₆H₁₂O₆ + 6 O₂ → 6 ${m('CO₂', 'co2')} + 6 H₂O + ≈32 ${m('ATP', 'atp')}</div>`,
  },
];

CellCity.register('energy', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, camera, controls, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, layout, molecule, disposeObj,
      clearAgents, travel, emit, every, addLabel, labels, fitPose, tweenTo } = g;

  /* ================= CELL GROUP ================= */
  const cellGroup = new THREE.Group(); scene.add(cellGroup);
  const R = 12;
  const nucleusPos = new V3(-2, 0.5, -0.5);
  const D = new V3(0.85, 0.15, 0.5).normalize();   // GLUT gate direction
  const SIDE = new V3().crossVectors(UP, D).normalize();
  const GLUT = D.clone().multiplyScalar(R);
  const SPLIT = D.clone().multiplyScalar(9.4);

  // membrane
  {
    const geo = new THREE.SphereGeometry(R, 128, 96);
    const p = geo.attributes.position, v = new V3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.sin(v.x * 0.35 + 1.3) * Math.cos(v.y * 0.42) * 0.45 + Math.sin(v.z * 0.5 + v.y * 0.2) * 0.3;
      v.multiplyScalar(1 + n / R); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    cellGroup.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: C.membrane, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, roughness: 0.4 })));
    cellGroup.add(new THREE.Mesh(geo, fresnelMat(C.membrane, 1.1, 2.6)));
    // membrane proteins
    const n = 1600, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); arr.set([s * Math.cos(th) * R, u * R, s * Math.sin(th) * R], i * 3); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    cellGroup.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x9fe3ea, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false })));
  }
  // GLUT transporter
  {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: C.glucose, emissive: C.glucose, emissiveIntensity: 0.35, roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 1.1, 4, 10), mat);
      c.position.set(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42); g.add(c);
    }
    g.position.copy(GLUT);
    g.quaternion.setFromUnitVectors(UP, D);
    cellGroup.add(g);
  }
  // nucleus
  const nucleus = new THREE.Group(); nucleus.position.copy(nucleusPos); cellGroup.add(nucleus);
  {
    const geo = new THREE.SphereGeometry(3.6, 64, 48);
    nucleus.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: C.nucleus, emissive: C.nucleus, emissiveIntensity: 0.18, transparent: true, opacity: 0.35, roughness: 0.6, depthWrite: false })));
    nucleus.add(new THREE.Mesh(geo, fresnelMat(C.nucleus, 1.4, 2.0)));
    const nl = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 24), new THREE.MeshStandardMaterial({ color: 0x3348a8, emissive: 0x2a3f9a, emissiveIntensity: 0.6, roughness: 0.7 }));
    nl.position.set(0.8, 0.4, 0.6); nucleus.add(nl);
    // chromatin
    const n = 900, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)); if (d.length() > 1) { i--; continue; } d.multiplyScalar(3.2); arr.set([d.x, d.y, d.z], i * 3); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    nucleus.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xa9b8ff, size: 0.08, transparent: true, opacity: 0.7, depthWrite: false })));
    // pores
    const pm = new THREE.MeshBasicMaterial({ color: 0xc3ceff });
    const pgeo = new THREE.TorusGeometry(0.12, 0.04, 6, 12);
    for (let i = 0; i < 70; i++) {
      const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
      const t = new THREE.Mesh(pgeo, pm); t.position.copy(d.clone().multiplyScalar(3.62)); t.lookAt(d.clone().multiplyScalar(10)); nucleus.add(t);
    }
  }
  // rough ER
  const erGroup = new THREE.Group(); cellGroup.add(erGroup);
  {
    const mat = new THREE.MeshStandardMaterial({ color: C.membrane, emissive: C.membrane, emissiveIntensity: 0.3, roughness: 0.5, transparent: true, opacity: 0.85 });
    const riboPts = [];
    for (let k = 0; k < 5; k++) {
      const r = 4.5 + k * 0.48, tilt = (k - 2) * 0.22, pts = [];
      for (let i = 0; i <= 48; i++) {
        const a = 0.2 + k * 0.1 + i / 48 * 4.7;
        const y = Math.sin(a * 3 + k) * 0.8 + (k - 2) * 0.55;
        pts.push(new V3(Math.cos(a) * r, y, Math.sin(a) * r).applyAxisAngle(new V3(1, 0, 0), tilt).add(nucleusPos));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      erGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.15, 8, false), mat));
      for (let i = 0; i < 140; i++) { const p = curve.getPointAt(rnd()); p.add(new V3(rr(-.22, .22), rr(-.22, .22), rr(-.22, .22))); riboPts.push(p.x, p.y, p.z); }
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(riboPts, 3));
    erGroup.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xd6e2ee, size: 0.09, transparent: true, opacity: 0.9, depthWrite: false })));
  }
  // golgi
  const golgiPos = new V3(3.2, 4.6, -4.2);
  const golgi = new THREE.Group(); golgi.position.copy(golgiPos); cellGroup.add(golgi);
  {
    const inner = new THREE.Group(); inner.rotation.x = Math.PI / 2; golgi.add(inner);
    const mat = new THREE.MeshStandardMaterial({ color: C.golgi, emissive: C.golgi, emissiveIntensity: 0.3, roughness: 0.5 });
    for (let i = 0; i < 5; i++) {
      const rad = 1.7 - Math.abs(i - 2) * 0.18;
      const geo = new THREE.CylinderGeometry(rad, rad, 0.17, 48, 1);
      const p = geo.attributes.position;
      for (let j = 0; j < p.count; j++) { const x = p.getX(j), z = p.getZ(j); p.setY(j, p.getY(j) + 0.16 * (x * x + z * z)); }
      geo.computeVertexNormals();
      const s = new THREE.Mesh(geo, mat); s.position.y = (i - 2) * 0.4; inner.add(s);
    }
    for (let i = 0; i < 9; i++) {
      const a = rnd() * Math.PI * 2, v = new THREE.Mesh(atomGeo, mat);
      v.scale.setScalar(rr(0.14, 0.22)); v.position.set(Math.cos(a) * 2.1, rr(-1, 1.2), Math.sin(a) * 2.1); inner.add(v);
    }
    golgi.lookAt(nucleusPos);
  }
  // mitochondria (small)
  const mitos = [];
  {
    const spots = [D.clone().multiplyScalar(6.6).add(new V3(0, -2.6, 0))];
    let guard = 0;
    while (spots.length < 9 && guard++ < 4000) {
      const p = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(10.4);
      const len = p.length();
      if (len < 4.5 || len > 10.2) continue;
      if (p.distanceTo(nucleusPos) < 6.2 || p.distanceTo(golgiPos) < 3.2) continue;
      if (spots.some(s => s.distanceTo(p) < 3.0)) continue;
      spots.push(p);
    }
    const geo = new THREE.CapsuleGeometry(0.55, 1.7, 8, 18);
    const mat = new THREE.MeshStandardMaterial({ color: C.mito, emissive: C.mito, emissiveIntensity: 0.35, roughness: 0.45 });
    const fr = fresnelMat(C.mito, 1.3, 1.8);
    spots.forEach((p, i) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(geo, mat));
      const sh = new THREE.Mesh(geo, fr); sh.scale.setScalar(1.12); g.add(sh);
      g.position.copy(p); g.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3));
      g.userData = { base: p.clone(), ph: rr(0, 6.28) };
      cellGroup.add(g); mitos.push(g);
    });
  }
  const M1 = mitos[0].position.clone();
  // lysosomes
  const lysos = [];
  {
    const mat = new THREE.MeshStandardMaterial({ color: C.lyso, emissive: C.lyso, emissiveIntensity: 0.4, roughness: 0.4 });
    let guard = 0;
    while (lysos.length < 6 && guard++ < 3000) {
      const p = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(10);
      if (p.length() > 10 || p.distanceTo(nucleusPos) < 5.6) continue;
      if (mitos.some(mm => mm.position.distanceTo(p) < 2) || p.distanceTo(golgiPos) < 2.6) continue;
      const l = new THREE.Mesh(atomGeo, mat); l.scale.setScalar(rr(0.35, 0.5)); l.position.copy(p);
      l.userData = { base: p.clone(), ph: rr(0, 6.28) };
      cellGroup.add(l); lysos.push(l);
    }
  }
  // free ribosomes
  {
    const arr = [];
    while (arr.length < 2000 * 3) {
      const p = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(11.2);
      if (p.length() > 11.2 || p.distanceTo(nucleusPos) < 4) continue;
      arr.push(p.x, p.y, p.z);
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    cellGroup.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x8fa2b8, size: 0.07, transparent: true, opacity: 0.6, depthWrite: false })));
  }
  // cytoskeleton
  const cytoAnchor = new V3();
  {
    const mat = new THREE.LineBasicMaterial({ color: C.pyruvate, transparent: true, opacity: 0.28 });
    for (let i = 0; i < 44; i++) {
      const d = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
      const a = nucleusPos.clone().add(d.clone().multiplyScalar(3.9));
      const e = d.clone().add(new V3(rr(-.3, .3), rr(-.3, .3), rr(-.3, .3))).normalize().multiplyScalar(11.6);
      const mid = a.clone().lerp(e, 0.5).add(new V3(rr(-1.2, 1.2), rr(-1.2, 1.2), rr(-1.2, 1.2)));
      const pts = new THREE.CatmullRomCurve3([a, mid, e]).getPoints(24);
      cellGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      if (i === 3) cytoAnchor.copy(pts[16]);
    }
  }

  /* ================= MITOCHONDRION GROUP ================= */
  const mitoGroup = new THREE.Group(); scene.add(mitoGroup);
  const cristae = [];
  {
    const outer = new THREE.CapsuleGeometry(6, 18, 24, 64); outer.rotateZ(Math.PI / 2);
    mitoGroup.add(new THREE.Mesh(outer, new THREE.MeshStandardMaterial({ color: C.mito, transparent: true, opacity: 0.05, depthWrite: false, side: THREE.DoubleSide })));
    mitoGroup.add(new THREE.Mesh(outer, fresnelMat(C.mito, 1.0, 2.6)));
    const inner = new THREE.CapsuleGeometry(5.3, 17, 24, 64); inner.rotateZ(Math.PI / 2);
    const innerMat = fresnelMat(new THREE.Color(0xffa15c), 0.55, 2.2);
    mitoGroup.add(new THREE.Mesh(inner, innerMat));
    for (let i = 0; i < 9; i++) {
      const x = -12 + i * 3;
      const geo = new THREE.CylinderGeometry(3.6, 3.6, 0.32, 48); geo.rotateZ(Math.PI / 2);
      const mat = new THREE.MeshStandardMaterial({ color: 0xff8a4f, emissive: 0xff6a3a, emissiveIntensity: 0.35, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
      const cr = new THREE.Mesh(geo, mat);
      cr.position.set(x, i % 2 ? 1.6 : -1.6, 0); cr.scale.set(1, 1, 1.15);
      mitoGroup.add(cr); cristae.push(cr);
    }
    // ATP synthase knobs on cristae
    const knobs = new THREE.InstancedMesh(atomGeo, new THREE.MeshStandardMaterial({ color: C.atp, emissive: C.atp, emissiveIntensity: 0.4 }), 9 * 22);
    const m4 = new THREE.Matrix4(); let k = 0;
    cristae.forEach((cr) => {
      for (let j = 0; j < 22; j++) {
        const a = rnd() * Math.PI * 2, rad = rr(1.2, 3.4);
        const p = new V3(cr.position.x + (rnd() < 0.5 ? -0.3 : 0.3), cr.position.y + Math.cos(a) * rad, Math.sin(a) * rad * 1.15);
        m4.compose(p, new THREE.Quaternion(), new V3(0.12, 0.12, 0.12)); knobs.setMatrixAt(k++, m4);
      }
    });
    mitoGroup.add(knobs);
    // matrix granules
    const arr = [];
    while (arr.length < 900 * 3) { const x = rr(-13, 13), y = rr(-4.8, 4.8), z = rr(-4.8, 4.8); if (y * y + z * z > 23) continue; arr.push(x, y, z); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    mitoGroup.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd0a6, size: 0.07, transparent: true, opacity: 0.5, depthWrite: false })));
    // mtDNA loops
    const dm = new THREE.MeshStandardMaterial({ color: 0xffd2a8, emissive: 0xffb27a, emissiveIntensity: 0.4 });
    [[-10, -2.8, -2.5], [9.5, 2.6, -2.2], [11, -2.4, 2.4]].forEach(p => { const t = new THREE.Mesh(new THREE.TorusKnotGeometry(0.45, 0.05, 64, 6, 2, 3), dm); t.position.set(...p); mitoGroup.add(t); });
  }
  // Krebs ring
  const ring = new THREE.Group(); ring.position.set(0, 0, 2); mitoGroup.add(ring);
  const RR = 4.4;
  const nodeAngle = (i) => Math.PI / 2 - i * Math.PI * 2 / 8;
  const nodePos = (i) => new V3(Math.cos(nodeAngle(i)) * RR, Math.sin(nodeAngle(i)) * RR, 0);
  const arcPos = (i, u) => { const a = nodeAngle(i) - u * Math.PI * 2 / 8; return new V3(Math.cos(a) * RR, Math.sin(a) * RR, 0); };
  const nodeMeshes = [];
  {
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(RR, 0.045, 8, 200), new THREE.MeshBasicMaterial({ color: 0x8e7ac8, transparent: true, opacity: 0.8 })));
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(RR, 0.25, 8, 200), new THREE.MeshBasicMaterial({ color: C.acetyl, transparent: true, opacity: 0.07, depthWrite: false })));
    const coneGeo = new THREE.ConeGeometry(0.15, 0.42, 12);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xb9a8ec });
    for (let i = 0; i < 8; i++) {
      const a = nodeAngle(i) - Math.PI / 8;
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(Math.cos(a) * RR, Math.sin(a) * RR, 0);
      cone.quaternion.setFromUnitVectors(UP, new V3(Math.sin(a), -Math.cos(a), 0));
      ring.add(cone);
      const nm = new THREE.Mesh(atomGeo, new THREE.MeshStandardMaterial({ color: 0xcfd8e6, emissive: 0x7a86a0, emissiveIntensity: 0.4 }));
      nm.scale.setScalar(0.24); nm.position.copy(nodePos(i)); ring.add(nm); nodeMeshes.push(nm);
    }
  }
  C.tagM = col('tag-m'); C.tagK = col('tag-k'); C.carbon = col('carbon'); C.oxygen = col('oxygen');
  const tagColor = (l) => (l === 'M' ? C.tagM : l === 'K' ? C.tagK : C.carbon);
  function carbonCluster(labs, { shape = 'ring', r = 0.2, glowSize = 2 } = {}) {
    const g = new THREE.Group();
    layout(labs.length, shape, r * 2.1).forEach((p, i) => {
      const a = new THREE.Mesh(atomGeo, atomMat(tagColor(labs[i])));
      a.scale.setScalar(labs[i] ? r * 1.2 : r); a.position.copy(p); g.add(a);
      if (labs[i]) { const gl = glow(tagColor(labs[i]), r * 5); gl.position.copy(p); g.add(gl); }
    });
    if (glowSize) { const gl = glow(C.electron, glowSize); gl.material.opacity = 0.45; g.add(gl); }
    return g;
  }
  let token = null;
  function setToken(labs) {
    if (token) disposeObj(token);
    token = carbonCluster(labs);
    token.position.copy(tokenPos);
    ring.add(token);
  }

  // large ball-and-stick model of the current intermediate, in the middle of the ring
  const viewer = new THREE.Group(); viewer.position.set(0, 0.15, 0.4); ring.add(viewer);
  const backdrop = new THREE.Mesh(new THREE.CircleGeometry(3.5, 64), new THREE.MeshBasicMaterial({ color: 0x0a0d15 }));
  backdrop.position.set(0, 0, -2.8); ring.add(backdrop);
  viewer.visible = backdrop.visible = false;
  const stickGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
  const stickMat = new THREE.MeshStandardMaterial({ color: 0xaab6c8, roughness: 0.55 });
  let model = null, modelKey = '';
  function buildModel(node, labs) {
    const key = node + ':' + labs.join('');
    if (key === modelKey) return;
    modelKey = key;
    if (model) disposeObj(model);
    const d = MOLS[MOL_KEYS[node]];
    model = new THREE.Group();
    const S = 0.82;
    const pts = d.a.map(a => new V3(a[1], a[2], a[3]).multiplyScalar(S));
    d.a.forEach((a, i) => {
      const el = a[0];
      const color = el === 'C' ? tagColor(labs[i]) : el === 'O' ? C.oxygen : C.atp;
      const ball = new THREE.Mesh(atomGeo, atomMat(color));
      ball.scale.setScalar((el === 'S' ? 0.46 : el === 'O' ? 0.34 : 0.37) * S);
      ball.position.copy(pts[i]); model.add(ball);
      if (el === 'C' && labs[i]) { const gl = glow(color, 1.7); gl.position.copy(pts[i]); model.add(gl); }
      if (el === 'S') { const t = textSprite('S–CoA', new THREE.Color(0xffd75e), 0.5); t.position.copy(pts[i]).add(new V3(0, 0.62, 0.2)); model.add(t); }
    });
    d.b.forEach(([i, j, order]) => {
      const a = pts[i], b = pts[j], dir = b.clone().sub(a);
      const side = new V3().crossVectors(dir, new V3(0, 0, 1)).normalize().multiplyScalar(0.11);
      (order === 2 ? [side, side.clone().negate()] : [new V3()]).forEach(off => {
        const c = new THREE.Mesh(stickGeo, stickMat);
        const rad = order === 2 ? 0.055 : 0.085;
        c.scale.set(rad, dir.length(), rad);
        c.position.copy(a).add(b).multiplyScalar(0.5).add(off);
        c.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
        model.add(c);
      });
    });
    viewer.add(model);
  }
  let molLabel = null;
  const tokenPos = nodePos(0);
  function highlightNode(i) {
    nodeMeshes.forEach((nm, k) => {
      const on = k === i;
      nm.material.emissive.set(on ? C.acetyl : new THREE.Color(0x7a86a0));
      nm.material.emissiveIntensity = on ? 1.1 : 0.4;
      nm.scale.setScalar(on ? 0.34 : 0.24);
    });
    labels.forEach(l => { if (l.node !== undefined) l.el.classList.toggle('on', l.node === i); });
  }

  /* ================= ETC GROUP ================= */
  const etcGroup = new THREE.Group(); scene.add(etcGroup);
  const X = { I: -15, II: -9, III: -3, IV: 4, SYN: 13 };
  let rotor;
  {
    const foot = [{ x: X.I, w: 3.5, d: 1.9 }, { x: X.II, w: 1.1, d: 1.1 }, { x: X.III, w: 2.3, d: 2.1 }, { x: X.IV, w: 2, d: 1.9 }, { x: X.SYN, w: 1.9, d: 1.9 }, { x: X.SYN + 2.1, w: 0.8, d: 0.8 }];
    const heads = [];
    for (let x = -22; x <= 22; x += 0.6) for (let z = -5.1; z <= 5.1; z += 0.6) {
      if (foot.some(f => ((x - f.x) / f.w) ** 2 + (z / f.d) ** 2 < 1)) continue;
      heads.push([x + rr(-.05, .05), z + rr(-.05, .05)]);
    }
    const hg = new THREE.SphereGeometry(0.24, 10, 8);
    const hm = new THREE.MeshStandardMaterial({ color: 0x8f6d55, emissive: 0x2a1a10, emissiveIntensity: 0.5, roughness: 0.8 });
    const im = new THREE.InstancedMesh(hg, hm, heads.length * 2);
    const m4 = new THREE.Matrix4(); let k = 0;
    heads.forEach(([x, z]) => { [1.05, -1.05].forEach(y => { m4.makeTranslation(x, y + rr(-.04, .04), z); im.setMatrixAt(k++, m4); }); });
    etcGroup.add(im);
    etcGroup.add(new THREE.Mesh(new THREE.BoxGeometry(44.4, 1.7, 10.6), new THREE.MeshStandardMaterial({ color: 0x6b4630, transparent: true, opacity: 0.32, depthWrite: false })));

    function protein(color, parts) {
      const total = parts.reduce((s, p) => s + p.n, 0);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, emissive: color, emissiveIntensity: 0.3 });
      const ims = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), mat, total);
      let j = 0;
      parts.forEach(p => {
        for (let i = 0; i < p.n; i++) {
          let v; do { v = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)); } while (v.lengthSq() > 1);
          v.multiply(new V3(...p.r)).add(new V3(...p.c));
          const s = rr(0.42, 0.8) * (p.s || 1);
          m4.compose(v, new THREE.Quaternion(), new V3(s, s, s)); ims.setMatrixAt(j++, m4);
        }
      });
      etcGroup.add(ims);
    }
    protein(new THREE.Color(0x5f8dff), [{ c: [X.I, 0, 0], r: [3.2, 1.3, 1.5], n: 60 }, { c: [X.I - 2, -3.6, 0], r: [1.3, 2.6, 1.3], n: 34 }]);
    protein(C.fadh, [{ c: [X.II, -2.0, 0], r: [1.3, 1.3, 1.2], n: 18 }, { c: [X.II, -0.3, 0], r: [0.8, 0.8, 0.8], n: 6 }]);
    protein(new THREE.Color(0x4fd6b0), [{ c: [X.III, 0.2, 0], r: [2.0, 2.2, 1.8], n: 46 }]);
    protein(new THREE.Color(0xc58bff), [{ c: [X.IV, 0.3, 0], r: [1.7, 1.9, 1.6], n: 34 }]);

    // ATP synthase
    const syn = new THREE.Group(); syn.position.set(X.SYN, 0, 0); etcGroup.add(syn);
    rotor = new THREE.Group(); syn.add(rotor);
    const cm = new THREE.MeshStandardMaterial({ color: 0x9fd3ff, emissive: 0x2f6a9a, emissiveIntensity: 0.5, roughness: 0.4 });
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.6, 12), cm);
      c.position.set(Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3); rotor.add(c);
    }
    const gam = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 4.8, 12), new THREE.MeshStandardMaterial({ color: 0xe6f2ff, emissive: 0x6a8aa8, emissiveIntensity: 0.4 }));
    gam.position.set(0.18, -2.6, 0); rotor.add(gam);
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), gam.material); cam.position.set(0.5, -4.6, 0); rotor.add(cam);
    const fa = new THREE.MeshStandardMaterial({ color: C.atp, emissive: C.atp, emissiveIntensity: 0.22, roughness: 0.5 });
    const fb = new THREE.MeshStandardMaterial({ color: 0xe0a038, emissive: 0xe0a038, emissiveIntensity: 0.2, roughness: 0.5 });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2;
      const s = new THREE.Mesh(atomGeo, i % 2 ? fa : fb); s.scale.setScalar(1.0);
      s.position.set(Math.cos(a) * 1.15, -5.5, Math.sin(a) * 1.15); syn.add(s);
    }
    const cap = new THREE.Mesh(atomGeo, fb); cap.scale.setScalar(0.6); cap.position.set(0, -6.6, 0); syn.add(cap);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0xb7c3d6, roughness: 0.6 });
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6.6, 10), stalkMat); st.position.set(2.2, -2.6, 0); syn.add(st);
    const asub = new THREE.Mesh(atomGeo, stalkMat); asub.scale.set(0.8, 1.2, 0.8); asub.position.set(2.1, 0, 0); syn.add(asub);
    const top = new THREE.Mesh(atomGeo, stalkMat); top.scale.setScalar(0.45); top.position.set(1.5, -6.4, 0); syn.add(top);
  }

  /* ================= labels ================= */
  const orgAnchors = {
    nucleus: { pos: nucleusPos.clone().add(new V3(0, 3.9, 0)), focus: nucleusPos, dist: 13 },
    er: { pos: nucleusPos.clone().add(new V3(-4.6, -1.6, 2.6)), focus: nucleusPos.clone().add(new V3(-3.6, -1, 2.6)), dist: 11 },
    golgi: { pos: golgiPos.clone().add(new V3(0, 2.1, 0)), focus: golgiPos, dist: 8 },
    mito: { pos: M1.clone().add(new V3(0, 1.4, 0)), focus: M1, dist: 6.5 },
    lyso: { pos: lysos[0] ? lysos[0].position.clone().add(new V3(0, 0.9, 0)) : new V3(0, -6, 6), focus: lysos[0] ? lysos[0].position : new V3(0, -6, 6), dist: 5 },
    ribo: { pos: new V3(-3, -6.5, 5.5), focus: new V3(-3, -6.5, 5.5), dist: 5.5 },
    cyto: { pos: cytoAnchor.clone(), focus: cytoAnchor, dist: 8 },
    membrane: { pos: GLUT.clone().add(new V3(0, 1.4, 0)), focus: GLUT, dist: 9 },
  };
  ORGANELLES.forEach(o => {
    const a = orgAnchors[o.id];
    addLabel(o.name, o.c, cellGroup, a.pos, ['cell'], { onClick: () => selectOrg(o.id), org: o.id });
  });
  addLabel('GLUT gate', 'glucose', cellGroup, GLUT.clone().add(SIDE.clone().multiplyScalar(-1.6)).add(new V3(0, 1.2, 0)), ['glycolysis']);
  addLabel('Cytosol: glycolysis', 'pyruvate', cellGroup, SPLIT.clone().add(new V3(0, -1.6, 0)), ['glycolysis']);
  addLabel('Mitochondrion', 'mito', cellGroup, M1.clone().add(new V3(0, -1.4, 0)), ['glycolysis']);
  addLabel('Nucleus', 'nucleus', cellGroup, nucleusPos.clone().add(new V3(0, 3.9, 0)), ['fuel', 'tally']);
  const FAT_DIR = new V3(-0.35, 0.75, 0.56).normalize();
  const AA_DIR = new V3(-0.25, -0.7, 0.66).normalize();
  addLabel('Carbohydrates → glucose', 'glucose', cellGroup, D.clone().multiplyScalar(17).add(new V3(0, 1.2, 0)), ['fuel']);
  addLabel('Fats → fatty acids', 'fat', cellGroup, FAT_DIR.clone().multiplyScalar(17).add(new V3(0, 1.2, 0)), ['fuel']);
  addLabel('Proteins → amino acids', 'amino', cellGroup, AA_DIR.clone().multiplyScalar(17).add(new V3(0, -1.2, 0)), ['fuel']);
  addLabel('Outer membrane', 'mito', mitoGroup, new V3(-6, 6.4, 0.5), ['link']);
  addLabel('Inner membrane (cristae)', 'fadh', mitoGroup, new V3(-12, -4.3, 3.2), ['link']);
  addLabel('Pyruvate dehydrogenase', 'acetyl', mitoGroup, new V3(-10.5, 3.3, 2.4), ['link']);
  addLabel('Krebs cycle', 'acetyl', mitoGroup, new V3(0, 0, 2), ['link']);
  molLabel = addLabel('Oxaloacetate', 'electron', ring, new V3(0, -2.55, 0.8), ['krebs']);
  KN.forEach((k, i) => {
    const p = nodePos(i); const out = p.clone().normalize().multiplyScalar(RR + 1.35);
    addLabel(`${k.name} <small>${k.c}C</small>`, 'acetyl', ring, out, ['krebs'], { node: i });
  });
  addLabel('Intermembrane space', 'proton', etcGroup, new V3(-7, 6.2, 0), ['etc']);
  addLabel('Matrix', 'mito', etcGroup, new V3(-6, -6.5, 0), ['etc']);
  addLabel('Complex I', 'pyruvate', etcGroup, new V3(X.I + 1, 3.0, 0), ['etc']);
  addLabel('II', 'fadh', etcGroup, new V3(X.II, -4.3, 0), ['etc']);
  addLabel('Complex III', 'nadh', etcGroup, new V3(X.III, 3.7, 0), ['etc']);
  addLabel('Complex IV', 'acetyl', etcGroup, new V3(X.IV + 0.3, 3.7, 0), ['etc']);
  addLabel('O₂ → H₂O', 'electron', etcGroup, new V3(X.IV + 0.8, -4.2, 0), ['etc']);
  addLabel('ATP synthase', 'atp', etcGroup, new V3(X.SYN + 3.6, -6, 0), ['etc']);

  const glyTarget = SPLIT.clone().add(new V3(0, -0.6, 0));
  const POSES = {
    cell: { pos: new V3(10, 9, 30), target: new V3(0, 0, 0), group: 'cell', auto: true, w: 14 },
    fuel: { pos: new V3(8, 8, 43), target: new V3(0, 0, 3), group: 'cell', w: 19 },
    glycolysis: { pos: glyTarget.clone().add(D.clone().multiplyScalar(9)).add(SIDE.clone().multiplyScalar(7)).add(new V3(0, 4.5, 0)), target: glyTarget, group: 'cell', w: 7 },
    link: { pos: new V3(-24, 7, 19), target: new V3(-8, 0, 1), group: 'mito', w: 11 },
    krebs: { pos: new V3(0, 1, 19), target: new V3(0, -0.35, 2), group: 'mito', w: 8.3 },
    etc: { pos: new V3(0, 2.6, 34), target: new V3(0, -1.2, 0), group: 'etc', w: 21 },
    tally: { pos: new V3(-15, 10, 30), target: new V3(0, 0, 0), group: 'cell', auto: true, w: 14 },
  };

  const B = {};
  let cristaeTarget = 0.3;

  function selectOrg(id) {
    const o = ORGANELLES.find(x => x.id === id);
    const a = orgAnchors[id];
    controls.autoRotate = false;
    const dir = camera.position.clone().sub(a.focus).normalize();
    tweenTo({ pos: a.focus.clone().add(dir.multiplyScalar(a.dist * (camera.aspect < 1.25 ? 1.25 : 1))), target: a.focus.clone() }, 1.3);
    document.querySelectorAll('.org').forEach(b => b.classList.toggle('on', b.dataset.id === id));
    labels.forEach(l => { if (l.org) l.el.classList.toggle('on', l.org === id); });
    const card = $('#orgCard');
    if (card) { card.style.setProperty('--c', `var(--${o.c})`); card.innerHTML = `<h3>${o.name} <span class="muted">· ${o.role}</span></h3><p>${o.text}</p>`; }
  }

  B.cell = {
    enter() {
      const orgs = $('#orgs');
      if (orgs) orgs.addEventListener('click', (e) => { const b = e.target.closest('.org'); if (b) selectOrg(b.dataset.id); });
      labels.forEach(l => l.org && l.el.classList.remove('on'));
    },
  };

  function spawnGlucose(fdg) {
    const start = D.clone().multiplyScalar(20).add(SIDE.clone().multiplyScalar(rr(-2.5, 2.5))).add(new V3(0, rr(-2, 2), 0));
    const mol = molecule(6, fdg ? C.fdg : C.glucose, { shape: 'ring', special: fdg ? C.fdg : null, glowSize: fdg ? 3 : 2.2 });
    const inside = D.clone().multiplyScalar(10.6);
    if (fdg) {
      travel(cellGroup, mol, [start, D.clone().multiplyScalar(15), GLUT, inside], 3.4, {
        spin: 0.4, keep: true,
        onDone: (o) => {
          const tag = textSprite('FDG-6-P · trapped', C.fdg, 0.5); tag.position.set(0, 0.9, 0); o.add(tag);
          const t0 = now;
          every((t) => {
            const u = (t - t0) / 7;
            o.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
            o.rotation.y += dtG * 0.3;
            if (u > 0.85) { tag.material.opacity = Math.max(0, (1 - u) / 0.15); o.scale.setScalar(Math.max(0.001, (1 - u) / 0.15)); }
            if (u >= 1) { disposeObj(o); return false; }
            return true;
          }, o);
        },
      });
      return;
    }
    travel(cellGroup, mol, [start, D.clone().multiplyScalar(15), GLUT, inside, SPLIT], 4, {
      spin: 0.5,
      onDone: () => {
        [-1, 1].forEach((s, i) => {
          const pyr = molecule(3, C.pyruvate, { shape: 'chain' });
          const mid = SPLIT.clone().add(SIDE.clone().multiplyScalar(s * 1.3)).add(new V3(0, -0.9, 0));
          const end = M1.clone().add(SIDE.clone().multiplyScalar(s * 0.35));
          travel(cellGroup, pyr, [SPLIT, mid, end], 3.2, { spin: 0.9, shrinkEnd: true });
        });
        emit(cellGroup, 'ATP', SPLIT, SPLIT.clone().add(new V3(-0.6, 2.8, 0)).add(SIDE.clone().multiplyScalar(-1.2)), 2.4);
        emit(cellGroup, 'ATP', SPLIT, SPLIT.clone().add(new V3(0.4, 3.2, 0)).add(SIDE.clone().multiplyScalar(0.6)), 2.4, 0.25);
        emit(cellGroup, 'NADH', SPLIT, SPLIT.clone().add(new V3(0, -2.6, 0)).add(SIDE.clone().multiplyScalar(-1.8)), 2.4, 0.1);
        emit(cellGroup, 'NADH', SPLIT, SPLIT.clone().add(new V3(0, -3.0, 0)).add(SIDE.clone().multiplyScalar(1.4)), 2.4, 0.35);
      },
    });
  }
  B.glycolysis = {
    enter() { this.next = now + 0.3; this.count = 0; },
    tick(t) {
      if (t > this.next) {
        this.count++;
        spawnGlucose(this.count % 3 === 0);
        this.next = t + 2.6;
      }
    },
  };

  const nearestMito = (p) => mitos.reduce((b, mm) => (mm.position.distanceTo(p) < b.position.distanceTo(p) ? mm : b), mitos[0]).position;
  B.fuel = {
    enter() { this.next = [now + 0.2, now + 1.0, now + 1.8]; },
    tick(t) {
      if (t > this.next[0]) {
        this.next[0] = t + 2.4;
        const mol = molecule(6, C.glucose, { shape: 'ring' });
        const s = D.clone().multiplyScalar(21).add(new V3(rr(-2, 2), rr(-2, 2), rr(-2, 2)));
        travel(cellGroup, mol, [s, D.clone().multiplyScalar(15), GLUT, SPLIT], 4.2, { spin: 0.5, shrinkEnd: true });
      }
      if (t > this.next[1]) {
        this.next[1] = t + 2.8;
        const mol = molecule(10, C.fat, { shape: 'chain', r: 0.18, glowSize: 2.6 });
        const gate = FAT_DIR.clone().multiplyScalar(R);
        const target = nearestMito(FAT_DIR.clone().multiplyScalar(8));
        const s = FAT_DIR.clone().multiplyScalar(21).add(new V3(rr(-2, 2), rr(-2, 2), rr(-2, 2)));
        travel(cellGroup, mol, [s, FAT_DIR.clone().multiplyScalar(15), gate, target], 5, { spin: 0.3, shrinkEnd: true });
      }
      if (t > this.next[2]) {
        this.next[2] = t + 1.6;
        const mol = molecule(3, C.amino, { shape: 'ring', r: 0.2 });
        const gate = AA_DIR.clone().multiplyScalar(R);
        const toBuild = rnd() < 0.55;
        const target = toBuild ? nucleusPos.clone().add(AA_DIR.clone().multiplyScalar(4.9)) : nearestMito(AA_DIR.clone().multiplyScalar(8));
        const s = AA_DIR.clone().multiplyScalar(21).add(new V3(rr(-2, 2), rr(-2, 2), rr(-2, 2)));
        travel(cellGroup, mol, [s, AA_DIR.clone().multiplyScalar(15), gate, target], 4.6, { spin: 0.8, shrinkEnd: true });
      }
    },
  };

  B.tally = {
    enter() { this.next = now; },
    tick(t) {
      if (t > this.next) {
        this.next = t + (reduceMotion ? 0.6 : 0.22);
        const mm = mitos[Math.floor(rnd() * mitos.length)];
        const g = glow(C.atp, 0.9);
        const from = mm.position.clone();
        const to = from.clone().add(new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize().multiplyScalar(rr(2.5, 4.5)));
        cellGroup.add(g); g.position.copy(from);
        const t0 = t;
        agents.push({ obj: g, update(tt) { const u = Math.min(1, (tt - t0) / 2.2); g.position.lerpVectors(from, to, ease.out(u)); g.material.opacity = 1 - u; if (u >= 1) { disposeObj(g); return false; } return true; } });
      }
    },
  };

  // Link reaction
  const ringWorld = (p) => p.clone().add(ring.position);
  B.link = {
    enter() {
      cristaeTarget = 0.28; tokenPos.copy(nodePos(0)); setToken([0, 0, 0, 0]); highlightNode(0);
      this.next = now + 0.3;
    },
    tick(t) {
      if (t > this.next) {
        this.next = t + 3.6;
        const L = new V3(-10.2, 1.6, 2.4);
        const pyr = molecule(3, C.pyruvate, { shape: 'chain', r: 0.26 });
        travel(mitoGroup, pyr, [new V3(-31, 7, 8), new V3(-21, 4, 5), new V3(-14.6, 2.4, 3), L], 2.8, {
          spin: 0.6,
          onDone: () => {
            emit(mitoGroup, 'CO2', L, L.clone().add(new V3(-2.2, 3.4, 2.2)), 2.6);
            emit(mitoGroup, 'NADH', L, L.clone().add(new V3(1.6, -3.4, 2)), 2.6, 0.15);
            const ac = molecule(2, C.acetyl, { shape: 'chain', r: 0.26 });
            const coa = new THREE.Mesh(atomGeo, atomMat(new THREE.Color(0x8aa0c0))); coa.scale.setScalar(0.4); coa.position.set(0.7, 0.3, 0); ac.add(coa);
            travel(mitoGroup, ac, [L, new V3(-6.5, 3.4, 2.4), ringWorld(nodePos(0)).add(new V3(-0.6, 0.4, 0))], 2.6, { spin: 0.4, shrinkEnd: true });
          },
        });
      }
    },
  };

  // Krebs cycle
  const K = { step: 0, turn: 1, start: 0, hold: 2.4, move: 1.8, playing: true, emitted: false, arrived: false, trace: makeTrace(Math.random) };
  // what is on the ring now: the substrate before the reaction, the product afterwards
  function kShown() {
    const t = K.trace(K.turn);
    if (!K.emitted) return { node: K.step, labs: t.nodes[K.step] };
    if (K.step < 7) return { node: K.step + 1, labs: t.nodes[K.step + 1] };
    return { node: 0, labs: t.end };
  }
  function showCurrent() {
    const sh = kShown();
    buildModel(sh.node, sh.labs);
    if (molLabel) molLabel.el.querySelector('span').innerHTML = `${KN[sh.node].name} <small>enlarged 3D</small>`;
  }
  function kStart(s) {
    if (s > 7) { s = 0; K.turn++; }
    if (s < 0) { if (K.turn > 1) { K.turn--; s = 7; } else s = 0; }
    clearAgents();
    K.step = s; K.start = now; K.emitted = false; K.arrived = false;
    const labs = K.trace(K.turn).nodes[s];
    tokenPos.copy(nodePos(s)); setToken(labs); highlightNode(s); showCurrent();
    if (s === 0) {
      const ac = carbonCluster(K.turn === 1 ? ['M', 'K'] : [0, 0], { shape: 'chain', r: 0.24, glowSize: 0 });
      const coa = new THREE.Mesh(atomGeo, atomMat(new THREE.Color(0x8aa0c0))); coa.scale.setScalar(0.34); coa.position.set(0.65, 0.25, 0); ac.add(coa);
      const tag = textSprite('acetyl-CoA', new THREE.Color(0xd9ccff), 0.52); tag.position.y = 0.75; ac.add(tag);
      travel(ring, ac, [new V3(-7.5, 6.4, 2), new V3(-3.6, 5.8, 1), nodePos(0).add(new V3(-0.9, 0.5, 0))], K.hold, {
        ease: ease.out,
        onDone: () => emitFrom('CoA', nodePos(0)),
      });
    }
    updateKrebsUI();
  }
  function emitFrom(kind, p) {
    if (kind === 'CoA') {
      const coa = new THREE.Group();
      coa.add(glow(new THREE.Color(0x8aa0c0), 1.1));
      const lb = textSprite('CoA', new THREE.Color(0xaabbd6), 0.5); lb.position.y = 0.55; coa.add(lb);
      const from = p.clone(), to = p.clone().add(new V3(1.6, 2.6, 1.2));
      ring.add(coa); coa.position.copy(from);
      const t0 = now;
      agents.push({ obj: coa, update(t) { const u = Math.min(1, (t - t0) / 1.8); coa.position.lerpVectors(from, to, ease.out(u)); coa.children.forEach(c => c.material.opacity = 1 - u); if (u >= 1) { disposeObj(coa); return false; } return true; } });
      return;
    }
  }
  function kEmit() {
    const st = KSTEPS[K.step];
    showCurrent();
    setToken(kShown().labs);
    const p = tokenPos.clone();
    const out = p.clone().normalize();
    st.out.forEach((kind, i) => {
      const side = new V3(-out.y, out.x, 0).multiplyScalar((i - (st.out.length - 1) / 2) * 1.6);
      const lost = kind === 'CO2' ? K.trace(K.turn).released[K.step] : 0;
      emit(ring, kind, p.clone(), p.clone().add(out.clone().multiplyScalar(kind === 'CO2' ? 4.2 : 3.2)).add(side).add(new V3(0, 0, kind === 'CO2' ? 3 : 1.5)), lost ? 4 : 2.6, i * 0.18,
        lost ? tagColor(lost) : null, lost ? 'traced CO₂' : null);
    });
    updateKrebsUI();
  }
  B.krebs = {
    enter() {
      cristaeTarget = 0.06; K.playing = !reduceMotion;
      viewer.visible = backdrop.visible = true;
      K.turn = 1; K.trace = makeTrace(Math.random);
      const kc = $('#kPlay');
      if (kc) {
        kc.addEventListener('click', () => { K.playing = !K.playing; if (K.playing && now - K.start > K.hold + K.move) kStart(K.step + 1); updateKrebsUI(); });
        $('#kPrev').addEventListener('click', () => { K.playing = false; kStart(K.step - 1); });
        $('#kNext').addEventListener('click', () => { K.playing = false; kStart(K.step + 1); });
        $('#kDots').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { K.playing = false; kStart(+b.dataset.i); } });
        $('#kRestart').addEventListener('click', () => { K.turn = 1; K.trace = makeTrace(Math.random); K.playing = !reduceMotion; kStart(0); });
      }
      kStart(0);
    },
    tick(t) {
      const el = t - K.start;
      if (el < K.hold) tokenPos.copy(nodePos(K.step));
      else if (el < K.hold + K.move) {
        const u = (el - K.hold) / K.move;
        tokenPos.copy(arcPos(K.step, ease.inOut(u)));
        if (!K.emitted && u > 0.5) { K.emitted = true; kEmit(); }
      } else {
        if (!K.emitted) { K.emitted = true; kEmit(); }
        tokenPos.copy(nodePos(K.step + 1));
        if (!K.arrived) { K.arrived = true; highlightNode((K.step + 1) % 8); }
        if (K.playing && el > K.hold + K.move + 2.2) kStart(K.step + 1);
      }
      if (token) { token.position.copy(tokenPos); token.rotation.z += dtG * 0.6; }
      viewer.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.5) * 0.55;
    },
    exit() { cristaeTarget = 0.28; viewer.visible = backdrop.visible = false; },
  };
  function updateTracerUI() {
    const strip = $('#kStrip'); if (!strip) return;
    const sh = kShown();
    const cls = (l) => (l === 'M' ? 'tag-m' : l === 'K' ? 'tag-k' : 'carbon');
    $('#kTurn').textContent = `Carbon tracer · turn ${K.turn}`;
    strip.innerHTML = sh.labs.map((l, i) => `<span class="carbon${l ? ' hot' : ''}" style="--c:var(--${cls(l)})"${l ? ' title="traced carbon"' : ''}><i>${l ? '★' : 'C'}</i><small>${CARBON_NAMES[sh.node][i]}</small></span>`).join('');
    // where each traced carbon left, counting only reactions that have happened
    const gone = {};
    for (let n = 1; n <= K.turn; n++) [2, 3].forEach(st => {
      if (n === K.turn && (st > K.step || (st === K.step && !K.emitted))) return;
      const l = K.trace(n).released[st]; if (l) gone[l] = { turn: n, step: st + 1 };
    });
    const names = { M: 'Former CH₃ carbon', K: 'Former C=O carbon' };
    const waiting = K.turn === 1 && K.step === 0 && !K.emitted;
    $('#kFates').innerHTML = ['M', 'K'].map(l => {
      const where = gone[l] ? `left as CO₂: turn ${gone[l].turn}, step ${gone[l].step}` : waiting ? 'arriving on acetyl-CoA' : 'still in the cycle';
      return `<div style="--c:var(--${cls(l)})"><b>★ ${names[l]}</b>${where}</div>`;
    }).join('');
    const lost = K.emitted ? K.trace(K.turn).released[K.step] : undefined;
    let msg;
    if (lost) msg = `The CO₂ just released carries your <b>${names[lost].replace('Former', 'former')}</b>. It entered the cycle in turn 1.`;
    else if (lost === 0) msg = K.turn === 1
      ? 'This CO₂ came from the original oxaloacetate. Both of your traced carbons are still on board.'
      : 'This CO₂ carries an untraced carbon.';
    else if (gone.M && gone.K) msg = 'Both traced carbons have now left. Restart the trace to follow another molecule.';
    else if (K.step === 0 && !K.emitted) msg = K.turn === 1
      ? 'Your two traced carbons arrive on acetyl-CoA. Oxaloacetate is waiting for them.'
      : 'A new acetyl group arrives. Its carbons are not traced.';
    else if (K.step === 0) msg = K.turn === 1 ? 'Both traced carbons are now in one arm of citrate.' : 'Citrate is formed. Watch which carbons leave next.';
    else if (sh.node === 5) msg = 'Succinate is symmetrical. Its two ends cannot be told apart, so each carbon has an equal chance of ending up at either one.';
    else if (sh.node === 6 && K.step === 5) msg = 'Fumarate is formed. The tracer has picked one of the two equally likely orientations.';
    else if (sh.node === 0) msg = `Oxaloacetate is rebuilt. Turn ${K.turn + 1} starts with whatever it still carries.`;
    else msg = 'Follow the starred carbons through this step.';
    $('#kStatus').innerHTML = msg;
  }
  function updateKrebsUI() {
    const card = $('#kCard'); if (!card) return;
    const i = K.step, st = KSTEPS[i], a = KN[i], b = KN[(i + 1) % 8];
    const extra = st.extraIn ? `<span>+</span><span>${st.extraIn}<span class="c">${st.extraInC}C</span></span>` : '';
    const chips = st.out.length
      ? st.out.map(k => `<span class="chip" style="--c:var(--${OUT[k].c})">+ ${OUT[k].label}</span>`).join('')
      : `<span class="chip none">${i === 0 ? 'CoA released' : i === 6 ? 'H₂O added' : 'Rearrangement only'}</span>`;
    card.innerHTML = `
      <div class="step-top"><span class="step-n">Step ${i + 1} of 8</span><span class="enzyme">${st.enzyme}</span></div>
      <div class="rxn"><span>${a.name}<span class="c">${a.c}C</span></span>${extra}<span class="arrow">→</span><span>${b.name}<span class="c">${b.c}C</span></span></div>
      <p>${st.note}</p>
      <div class="chips">${chips}</div>`;
    updateTracerUI();
    const play = $('#kPlay'); if (play) play.textContent = K.playing ? 'Pause' : 'Play';
    [...$('#kDots').children].forEach((d, k) => d.classList.toggle('on', k === i));
    const counts = { NADH: 0, FADH2: 0, GTP: 0, CO2: 0 };
    for (let s = 0; s <= i; s++) { if (s === i && !K.emitted) break; KSTEPS[s].out.forEach(k => counts[k]++); }
    const max = { NADH: 3, FADH2: 1, GTP: 1, CO2: 2 };
    $('#kTally').innerHTML = Object.keys(counts).map(k => `<div style="--c:var(--${OUT[k].c})"><b>${counts[k]}/${max[k]}</b><small>${OUT[k].label}</small></div>`).join('');
  }

  // Electron transport chain
  const protonGeo = new THREE.SphereGeometry(0.2, 10, 8);
  const protonMat = new THREE.MeshBasicMaterial({ color: C.proton });
  function makeProton() { const g = new THREE.Group(); g.add(new THREE.Mesh(protonGeo, protonMat)); g.add(glow(C.proton, 0.9)); return g; }
  B.etc = {
    enter() { this.next = now + 0.3; this.free = []; this.nextUse = now + 1; this.used = 0; this.spin = 0.6; this.n = 0; },
    pump(x, n) {
      if (this.free.length > 70) return;
      for (let i = 0; i < n; i++) {
        const p = makeProton();
        const a = new V3(x + rr(-1, 1), -3.6, rr(-1, 1));
        travel(etcGroup, p, [a, new V3(x + rr(-.5, .5), 0, rr(-.5, .5)), new V3(x + rr(-2, 2), 3.4, rr(-2, 2))], 1.5, {
          keep: true, delay: i * 0.12,
          onDone: (o) => this.free.push({ o, v: new V3(rr(-1, 1), rr(-.5, .5), rr(-1, 1)) }),
        });
      }
    },
    electrons(fromFAD) {
      const e = new THREE.Group(); e.add(glow(C.electron, 1.5));
      const lb = textSprite('2e⁻', C.electron, 0.5); lb.position.y = 0.6; e.add(lb);
      const carrier = new THREE.Color(fromFAD ? C.fadh : C.nadh);
      const dropFrom = fromFAD ? new V3(X.II - 2, -7.5, 2.5) : new V3(X.I - 4.5, -8, 2.5);
      const dropAt = fromFAD ? new V3(X.II, -3.4, 0.6) : new V3(X.I - 2, -5.8, 0.6);
      emit(etcGroup, fromFAD ? 'FADH2' : 'NADH', dropFrom, dropAt, 1.3);
      const q = new THREE.Mesh(atomGeo, atomMat(C.fadh)); q.scale.setScalar(0.34);
      const cyt = new THREE.Mesh(atomGeo, atomMat(C.mito)); cyt.scale.setScalar(0.5);
      const seg1 = fromFAD ? [dropAt, new V3(X.II, -1.2, 0.4), new V3(X.II + 0.6, 0, 0.8)] : [dropAt, new V3(X.I - 2, -3, 0.5), new V3(X.I, -0.2, 0.6), new V3(X.I + 3.4, 0, 0.8)];
      setTimeout(() => {
        if (stageId !== 'etc') return;
        travel(etcGroup, e, seg1, fromFAD ? 1.2 : 1.6, {
          keep: true,
          onDone: () => {
            if (!fromFAD) this.pump(X.I, 4);
            e.add(q);
            travel(etcGroup, e, [e.position.clone(), new V3(-6, 0, 1.4), new V3(X.III - 1.2, 0, 0.8), new V3(X.III, 0.3, 0)], 1.5, {
              keep: true,
              onDone: () => {
                e.remove(q); this.pump(X.III, 4); e.add(cyt);
                travel(etcGroup, e, [e.position.clone(), new V3(X.III, 2.9, 0.5), new V3(0.5, 3.4, 0.8), new V3(X.IV, 2.7, 0.5), new V3(X.IV, 0.2, 0)], 1.8, {
                  keep: true,
                  onDone: () => {
                    e.remove(cyt); this.pump(X.IV, 2);
                    travel(etcGroup, e, [e.position.clone(), new V3(X.IV + 0.4, -2.6, 0.4)], 0.8, {
                      shrinkEnd: true,
                      onDone: () => emit(etcGroup, 'H2O', new V3(X.IV + 0.4, -2.8, 0.4), new V3(X.IV + 2.4, -7.5, 2.2), 2.4),
                    });
                  },
                });
              },
            });
          },
        });
      }, 1250);
    },
    tick(t, dt) {
      if (t > this.next) {
        this.n++;
        this.electrons(this.n % 3 === 0);
        this.next = t + 2.4;
      }
      this.free.forEach(f => {
        f.v.add(new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(dt * 2)).clampLength(0, 1.4);
        const p = f.o.position; p.addScaledVector(f.v, dt);
        if (p.x < -21 || p.x > 21) f.v.x *= -1;
        if (p.y < 2.2 || p.y > 6.5) f.v.y *= -1;
        if (p.z < -4.5 || p.z > 4.5) f.v.z *= -1;
        p.y = Math.min(6.5, Math.max(2.2, p.y));
      });
      if (t > this.nextUse && this.free.length > 3) {
        this.nextUse = t + 0.3;
        const target = new V3(X.SYN + 1.3, 2.4, 0);
        let bi = 0; this.free.forEach((f, i) => { if (f.o.position.distanceTo(target) < this.free[bi].o.position.distanceTo(target)) bi = i; });
        const f = this.free.splice(bi, 1)[0];
        const a = rnd() * Math.PI * 2;
        travel(etcGroup, f.o, [f.o.position.clone(), new V3(X.SYN + 1.9, 2.6, 0.4), new V3(X.SYN + Math.cos(a) * 1.3, 0, Math.sin(a) * 1.3), new V3(X.SYN + 1.8, -2.4, 1.2)], 1.6, {
          shrinkEnd: true,
          onDone: () => {
            this.used++; this.spin = Math.min(6, this.spin + 0.7);
            if (this.used % 3 === 0) emit(etcGroup, 'ATP', new V3(X.SYN, -6.2, 1.2), new V3(X.SYN + rr(-3, 3), -10, rr(1, 4)), 2.6);
          },
        });
      }
      this.spin += (0.6 - this.spin) * Math.min(1, dt * 0.6);
      rotor.rotation.y += this.spin * dt;
    },
    exit() { (this.free || []).forEach(f => disposeObj(f.o)); this.free = []; },
  };

    return {
      groups: { cell: cellGroup, mito: mitoGroup, etc: etcGroup },
      unitsPerNm: { cell: 0.0012, mito: 0.015, etc: 0.33 },
      fog: { cell: 0.006, mito: 0.008, etc: 0.007 },
      depth: { cell: 1, mito: 2, etc: 3 },
      poses: POSES, behaviors: B,
      ambient(dt) {
    // ambient life
    const amb = reduceMotion ? 0.2 : 1;
    if (cellGroup.visible) {
      mitos.forEach((mm, i) => {
        const d = mm.userData;
        mm.position.set(d.base.x + Math.sin(now * 0.4 + d.ph) * 0.12 * amb, d.base.y + Math.cos(now * 0.35 + d.ph) * 0.12 * amb, d.base.z);
        mm.rotation.y += dt * 0.08 * amb;
        const mat = mm.children[0].material;
        mat.emissiveIntensity = stageId === 'tally' ? 0.55 + Math.sin(now * 3 + i) * 0.25 : 0.35;
      });
      lysos.forEach(l => { const d = l.userData; l.position.set(d.base.x + Math.sin(now * 0.3 + d.ph) * 0.2 * amb, d.base.y + Math.sin(now * 0.25 + d.ph * 2) * 0.2 * amb, d.base.z + Math.cos(now * 0.3 + d.ph) * 0.2 * amb); });
      nucleus.rotation.y += dt * 0.02 * amb;
    }
    if (mitoGroup.visible) {
      cristae.forEach(c => { c.material.opacity += (cristaeTarget - c.material.opacity) * Math.min(1, dt * 3); });
    }
      },
    };
  },
});
})();
