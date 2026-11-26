// Exercise the real loader and router with a minimal text-mode browser surface.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const elements = new Map();
const element = selector => {
  if (!elements.has(selector)) elements.set(selector, {
    style: { setProperty() {} }, classList: { toggle() {} },
    addEventListener() {}, appendChild() {}, getBoundingClientRect: () => ({ top: 0 }),
  });
  return elements.get(selector);
};
const events = {};
let pending;
const document = {
  querySelector: element, querySelectorAll: () => [], createElement: () => ({}),
  addEventListener: (type, fn) => (events[type] ??= []).push(fn),
  head: { appendChild: script => { pending = script; } },
};
const context = vm.createContext({
  document, window: { THREE: {} }, location: { hash: '' },
  history: { replaceState(_, __, hash) { context.location.hash = hash; } },
  matchMedia: () => ({ matches: false }), getComputedStyle: () => ({}),
  addEventListener() {}, console: { ...console, warn() {} },
});
context.THREE = context.window.THREE;
const run = source => vm.runInContext(source, context);
async function main() {
  run(read('shared/core.js'));
  assert.equal(run('G3'), null);
  assert.match(read('index.html'), new RegExp('shared/core\\.js\\?v=' + run('ASSET_VERSION') + '"'), 'index.html cache-busts core.js with ASSET_VERSION');
  // The home screen is a microscope bench: 23 glass slides, 11 in Cell mechanisms and 12 in Cells in tissues, with Energy loaded on the stage.
  const keys = Array.from(run('MANIFEST'), x => x.key);
  const trays = element('#slideTrays').innerHTML;
  assert.equal(keys.length, 23, '23 modules');
  assert.deepEqual(Array.from(trays.matchAll(/data-key="([^"]+)"/g), x => x[1]), keys, 'one slide per module, in curriculum order');
  assert.match(trays, /Cell mechanisms[\s\S]*data-key="division"[\s\S]*data-key="cytoskeleton"[\s\S]*data-key="mitochondria"[\s\S]*data-key="stem"[\s\S]*Cells in tissues[\s\S]*data-key="neural"/);
  const [mech, tissue] = trays.split('<section').slice(1);
  assert.equal((mech.match(/data-key=/g) || []).length, 11, 'Cell mechanisms tray holds 11 slides');
  assert.equal((tissue.match(/data-key=/g) || []).length, 12, 'Cells in tissues tray holds 12 slides');
  assert.equal((mech.match(/slot-empty/g) || []).length, 1, 'the 11-slide mechanisms tray pads its second row of 6 with one empty slot');
  assert(!/slot-empty/.test(tissue), 'the 12-slide tissue tray fills two rows exactly');
  assert.match(trays, /CM-06<\/span><span class="slide-name">Cyto(&shy;)?skeleton</, 'Cytoskeleton is slide CM-06');
  assert.equal(run('SLIDE_PREP.cytoskeleton'), 'Phalloidin + anti-tubulin');
  // The six tissue slides added after reproduction, in order, each with a prep label and a specimen motif.
  const NEW_SLIDES = [['hepatocyte', 'Hepato(&shy;)?cyte'], ['bone', 'Bone cells'], ['cancer', 'Cancer biology'], ['immune', 'Immune acti(&shy;)?vation'], ['bbb', 'Blood–brain barrier'], ['enterocyte', 'Entero(&shy;)?cyte']];
  NEW_SLIDES.forEach(([key, label], i) => {
    const no = 'CT-' + String(7 + i).padStart(2, '0');
    assert.match(trays, new RegExp('data-key="' + key + '"[^>]*>\\s*<span class="slide-label"><span class="slide-no">' + no + '</span><span class="slide-name">' + label + '<'), key + ' is slide ' + no);
    assert.equal(keys[17 + i], key, key + ' sits at position ' + (18 + i));
    assert(run('SLIDE_PREP[' + JSON.stringify(key) + ']'), key + ' has a prep label');
    assert(run('MOTIFS[' + JSON.stringify(key) + ']').length > 100, key + ' has a specimen motif');
  });
  // The four cross-cutting mechanism slides follow the cytoskeleton as CM-07 to CM-10.
  const MECH_SLIDES = [['signaling', 'Signal trans(&shy;)?duction', 'FRET cAMP biosensor'], ['junctions', 'Cell junctions', 'ZO-1 + E-cadherin immunostain'], ['lipids', 'Lipid &(amp;)? choles(&shy;)?terol', 'Oil Red O, arterial plaque'], ['mitochondria', 'Mito(&shy;)?chondria', 'MitoTracker live imaging']];
  MECH_SLIDES.forEach(([key, label, prep], i) => {
    const no = 'CM-' + String(7 + i).padStart(2, '0');
    assert.match(trays, new RegExp('data-key="' + key + '"[^>]*>\\s*<span class="slide-label"><span class="slide-no">' + no + '</span><span class="slide-name">' + label + '<'), key + ' is slide ' + no);
    assert.equal(keys[6 + i], key, key + ' sits at position ' + (7 + i));
    assert.equal(run('SLIDE_PREP[' + JSON.stringify(key) + ']'), prep, key + ' has its prep label');
    assert(run('MOTIFS[' + JSON.stringify(key) + ']').length > 100, key + ' has a specimen motif');
    assert.equal(run('MANIFEST')[6 + i].ids.length, 3, key + ' has three chapters');
  });
  // Stem cells close the mechanisms tray as CM-11, with its own prep label, motif and three chapters.
  assert.match(trays, /data-key="stem"[^>]*>\s*<span class="slide-label"><span class="slide-no">CM-11<\/span><span class="slide-name">Stem cells</, 'Stem cells is slide CM-11');
  assert.equal(keys[10], 'stem', 'stem sits at position 11');
  assert.equal(run('SLIDE_PREP.stem'), 'Oct4 + lineage immunostain');
  assert(run('MOTIFS.stem').length > 100, 'stem has a specimen motif');
  assert.deepEqual(Array.from(run('MANIFEST')[10].ids), ['stem-potency', 'stem-fate', 'stem-niches'], 'stem has its three chapters');
  assert.equal(keys[11], 'neural', 'Cells in tissues starts at position 12');
  const tokens = read('shared/core.css');
  const cards = Array.from(run('MANIFEST'), x => x.c);
  assert.equal(new Set(cards).size, cards.length, 'every slide has its own color token');
  cards.forEach(c => assert.match(tokens, new RegExp('--' + c + ':'), 'color token --' + c + ' is defined'));
  for (const x of run('MANIFEST')) assert.equal(x.ids.length, x.names.length, x.key + ' names one chapter per ID');
  assert.equal(element('#scopeTitle').textContent, 'Energy');
  assert.equal(element('#scopeOpen').href, '#cell');
  for (const x of run('MANIFEST')) {
    run('selectSlide(' + JSON.stringify(x.key) + ')');
    assert.equal(element('#scopeTitle').textContent, x.name);
    assert.equal(element('#scopeOpen').href, '#' + x.ids[0]);
    assert.match(element('#stageSlot').innerHTML, new RegExp('>' + x.name + '<'));
    const links = Array.from(element('#scopeChapters').innerHTML.matchAll(/href="#([^"]+)"/g), m => m[1]);
    assert.equal(links.length, (x.pills || x.names).length, x.key + ' has a chapter pill per chapter or deep link');
    x.ids.forEach(id => assert(links.some(r => r.split('/')[0] === id), x.key + ' pills reach chapter ' + id));
    links.forEach(route => assert.equal(run('moduleFor(' + JSON.stringify(route.split('/')[0]) + ')').key, x.key, route + ' opens ' + x.key));
  }
  run("selectSlide('blood')");
  assert.match(element('#scopeChapters').innerHTML, /#blood\/rbc[\s\S]*#blood\/neut[\s\S]*#blood\/plt[\s\S]*#clotting/);
  assert.equal(element('#scopeCount').textContent, '2 · 7 cell cards');
  // Cross-links that the new chapters promise, checked against the rendered chapter HTML below.
  const CROSS = {
    plt: ['clotting'], clotting: ['blood/plt'], 'cyto-motors': ['axon', 'muscle-contraction'], 'cyto-crawl': ['blood/neut', 'cell'], 'cyto-filaments': ['cell', 'mitosis'],
    chromatin: ['gene', 'stem-fate'], cotransport: ['proximal-tubule', 'pump', 'tally'], channels: ['permeability'],
    apoptosis: ['fate', 'survival'], fate: ['apoptosis'], warburg: ['petprep', 'cycle', 'branches', 'cancer-pet'], glycolysis: ['warburg'], pump: ['cotransport'],
    'liver-glycogen': ['glycolysis', 'balance', 'gut-portal', 'blood/rbc'], 'urea-cycle': ['nephron-overview', 'krebs', 'fuel'], 'liver-cyp': ['petprep', 'cancer-pet', 'gut-portal', 'er'],
    'bone-remodel': ['blood/mono', 'lysosome', 'bone-dexa', 'stem-niches'], 'bone-dexa': ['bone-remodel', 'bone-lesions'], 'bone-lesions': ['cancer-spread', 'cancer-pet', 'bone-remodel'],
    'cancer-spread': ['cyto-crawl', 'bone-lesions', 'cancer-pet'], 'cancer-pet': ['warburg', 'apoptosis', 'petprep', 'liver-cyp', 'glycolysis', 'stem-niches'],
    'immune-mhc': ['proteasome', 'er', 'lysosome', 'blood/lymph'], 'immune-complement': ['cyto-crawl', 'cancer-pet', 'blood/rbc'], 'immune-effector': ['blood/lymph', 'cyto-crawl', 'apoptosis'],
    'bbb-transport': ['channels', 'bbb-mri'], 'bbb-mri': ['brain', 'cancer-spread', 'bbb-unit'],
    'gut-sglt1': ['cotransport', 'pump', 'fuel', 'proximal-tubule', 'epithelia'], 'gut-portal': ['liver-glycogen', 'liver-cyp'],
    'sig-gpcr': ['endocrine-receptors', 'synapse'], 'sig-mapk': ['cancer-genes', 'endocrine-receptors', 'receptor'], 'sig-calcium': ['muscle-contraction', 'synapse'],
    'junc-tight': ['epithelia', 'bbb-unit', 'proximal-tubule'], 'junc-anchor': ['cyto-filaments', 'gut-sglt1'], 'junc-gap': ['pacemaker', 'muscle-tissues'],
    'lipid-ldl': ['intake', 'gut-fat'], 'lipid-plaque': ['immune-complement', 'clotting', 'blood/mono'], 'lipid-steroid': ['endocrine-map', 'endocrine-feedback', 'liver-cyp'],
    'mito-dynamics': ['etc', 'cyto-motors'], 'mito-ros': ['etc', 'branches'], 'mito-mitophagy': ['autophagy', 'apoptosis'],
    intake: ['lipid-ldl'], autophagy: ['mito-mitophagy'], etc: ['mito-ros'], 'muscle-contraction': ['sig-calcium'], synapse: ['sig-gpcr', 'junc-gap'],
    'cyto-filaments': ['junc-anchor'], 'gut-fat': ['er', 'golgi', 'gut-portal', 'lipid-ldl'], 'endocrine-map': ['lipid-steroid'], 'endocrine-receptors': ['sig-gpcr', 'sig-mapk'],
    'cancer-genes': ['cycle', 'apoptosis', 'damage', 'fate', 'sig-mapk', 'stem-niches'], 'proximal-tubule': ['junc-tight'],
    'bbb-unit': ['neurons', 'epithelia', 'junc-tight'], epithelia: ['proximal-tubule', 'collecting-duct', 'endocrine-receptors', 'junc-tight'], branches: ['krebs', 'blood/rbc', 'mito-ros'],
    pacemaker: ['muscle-tissues', 'rest', 'spike', 'junc-gap'], 'muscle-tissues': ['pacemaker'], petprep: ['cancer-pet', 'liver-cyp'],
    'stem-potency': ['early-cleavage', 'mitosis', 'gut-sglt1', 'stem-fate'], 'stem-fate': ['chromatin', 'sig-mapk', 'muscle-structure', 'neurons', 'blood', 'stem-niches'],
    'stem-niches': ['blood', 'clotting', 'bone-remodel', 'cancer-pet', 'petprep', 'stem-fate'],
    'early-cleavage': ['stem-potency'], blood: ['stem-niches'], clotting: ['blood/plt', 'stem-niches'],
  };
  const allIds = new Set(run('MANIFEST').flatMap(x => x.ids));
  const seen = new Set();
  for (const { key, ids } of run('MANIFEST')) {
    run('go(' + JSON.stringify(ids[0]) + ')');
    assert.equal(element('#nextBtn').disabled, true);
    run('showChapter(0)');
    assert.equal(pending.src, 'modules/' + key + '.js?v=' + run('ASSET_VERSION'));
    run(read(pending.src.split('?')[0]));
    pending.onload();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('#nextBtn').disabled, false);
    assert.deepEqual(Array.from(run('chapters'), ch => ch.id), Array.from(ids));
    for (const id of ids) {
      assert(!seen.has(id), 'Duplicate chapter ' + id);
      seen.add(id);
      run('showChapter(' + ids.indexOf(id) + ')');
      assert.equal(context.location.hash, '#' + id);
      const html = element('#chapter').innerHTML;
      // every in-app link points at a real chapter, and chapters that promise a cross-link carry it
      for (const [, route] of html.matchAll(/href="#([^"]+)"/g)) assert(allIds.has(route.split('/')[0]), id + ' links to unknown chapter #' + route);
      for (const route of CROSS[id] || []) assert(html.includes('href="#' + route + '"'), id + ' links to #' + route);
      assert(!/\b(colour|centre|haem|anaem|tumour|behaviour|signalling|fibre|organis|analys(e|ing)|oesoph|leukaem|ischaem|oedem|paediatr|hypoxaem|litre|metre|millimetre|centimetre|favour|labour|defence|ageing|grey|travell|modell|catalys(e|ing)|mobilis|metabolis(e|ing))\w*/i.test(html.replace(/https?:[^"]+/g, '')), id + ' uses US spelling');
      if (id === 'tally') {
        assert.match(element('#chapter').innerHTML, /#blood\/rbc/);
        for (const value of ['krebs', 'etc', 'glycolysis']) {
          events.change.forEach(fn => fn({target: {name: 'rbc-atp', value}}));
          assert.match(element('#rbcFeedback').textContent, value === 'glycolysis' ? /Correct/ : /again/i);
        }
      }
    }
  }
  run("go('blood/rbc')");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.location.hash, '#blood/rbc');
  assert.match(element('#bloodCard').innerHTML, /No mitochondria/);
  for (const [value, expected] of Object.entries({balanced: /equal average/, dilute: /swells/, concentrated: /shrinks/})) {
    element('#transportSolution').value = value;
    events.change.forEach(fn => fn({target: {id: 'transportSolution'}}));
    assert.match(element('#transportCaption').textContent, expected);
  }
  run("go('blood/plt')");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.location.hash, '#blood/plt');
  assert.match(element('#bloodCard').innerHTML, /megakaryocytes/);
  for (const route of CROSS.plt) assert(element('#bloodCard').innerHTML.includes('href="#' + route + '"'), 'platelet card links to #' + route);
  run("go('blood/neut')");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.location.hash, '#blood/neut', 'every blood card has a deep link');
  assert.match(element('#bloodCard').innerHTML, /href="#cyto-crawl"/);
  // Lesson controls drive captions: switching the chromatin cell type also flips the gene chapter's switch.
  run("go('chromatin')"); await new Promise(resolve => setImmediate(resolve));
  run("setLesson('pf-chromatin', 'other')");
  assert.equal(run("LESSON['pf-chromatin']"), 'other');
  run("go('gene')"); await new Promise(resolve => setImmediate(resolve));
  assert.match(element('#chapter').innerHTML, /data-pf="gene" data-val="other" aria-pressed="true"/, 'gene chapter shows the same cell type');
  run("setLesson('pf-chromatin', 'beta')");
  run("go('channels')"); await new Promise(resolve => setImmediate(resolve));
  run("setLesson('tp-conc', 'high')");
  assert.match(element('#tpKinetics').innerHTML, /<svg class="kinetics"/);
  run("go('warburg')"); await new Promise(resolve => setImmediate(resolve));
  run("setLesson('en-tracer', 'fdg')");
  assert.match(element('#warburgCaption').textContent, /trapped/);
  run("setLesson('en-tracer', 'glucose')");
  // Every new lesson switch updates its caption in text mode, without WebGL.
  const SWITCHES = [
    ['liver-glycogen', 'hep-state', 'fasted', 'hepStateCaption', /gluconeogenesis/, 'fed'],
    ['urea-cycle', 'urea-otc', 'otc', 'ureaCaption', /hyperammonemia/, 'normal'],
    ['liver-cyp', 'liver-view', 'pet', 'liverViewCaption', /Deauville/, 'drug'],
    ['liver-cyp', 'liver-view', 'fat', 'liverViewCaption', /spleen/, 'drug'],
    ['bone-remodel', 'bone-balance', 'resorb', 'boneBalanceCaption', /estrogen/, 'balanced'],
    ['bone-dexa', 'bone-density', 'osteoporosis', 'boneDensityCaption', /−2\.5 or lower/, 'normal'],
    ['bone-lesions', 'bone-lesion', 'sclerotic', 'boneLesionCaption', /prostate/, 'normal'],
    ['bone-lesions', 'bone-lesion', 'lytic', 'boneLesionCaption', /myeloma/, 'normal'],
    ['cancer-genes', 'cancer-genes', 'both', 'cancerGenesCaption', /no brakes/, 'normal'],
    ['cancer-genes', 'cancer-genes', 'ras', 'cancerGenesCaption', /RAS/, 'normal'],
    ['cancer-spread', 'cancer-step', '4', 'cancerSpreadCaption', /^Seeding/, 'auto'],
    ['cancer-pet', 'cancer-view', 'ct', 'cancerViewCaption', /anatomy/, 'pet'],
    ['immune-mhc', 'immune-mhc', 'class2', 'immuneMhcCaption', /CD4/, 'class1'],
    ['immune-complement', 'immune-comp', 'mac', 'immuneCompCaption', /membrane attack complex/, 'opsonize'],
    ['immune-complement', 'immune-comp', 'inflame', 'immuneCompCaption', /plasma leaks/, 'opsonize'],
    ['immune-effector', 'immune-effector', 'ctl', 'immuneEffCaption', /perforin/, 'antibody'],
    ['bbb-unit', 'bbb-layer', 'peri', 'bbbLayerCaption', /pericytes/, 'astro'],
    ['bbb-transport', 'bbb-pgp', 'off', 'bbbPgpCaption', /Loperamide/, 'on'],
    ['bbb-mri', 'bbb-state', 'ms', 'bbbStateCaption', /MS plaque/, 'intact'],
    ['bbb-mri', 'bbb-state', 'stroke', 'bbbStateCaption', /gyriform/, 'intact'],
    ['gut-sglt1', 'gut-surface', 'off', 'gutSurfaceCaption', /celiac/, 'on'],
    ['gut-fat', 'gut-fat-step', '3', 'gutFatCaption', /^Lacteal/, 'auto'],
    ['gut-portal', 'gut-route', 'iv', 'gutRouteCaption', /100%/, 'oral'],
    ['gut-portal', 'gut-route', 'oral', 'gutRouteCaption', /first pass/, 'oral'],
    ['pacemaker', 'heart-rate', 'fast', 'pacemakerCaption', /120 beats per minute/, 'normal'],
    ['sig-gpcr', 'sig-gpcr', 'gs', 'sigGpcrCaption', /adenylyl cyclase/, 'rest'],
    ['sig-gpcr', 'sig-gpcr', 'gi', 'sigGpcrCaption', /cAMP falls/, 'rest'],
    ['sig-gpcr', 'sig-gpcr', 'cholera', 'sigGpcrCaption', /CFTR/, 'rest'],
    ['sig-mapk', 'sig-mapk', 'egf', 'sigMapkCaption', /MEK phosphorylates ERK/, 'off'],
    ['sig-mapk', 'sig-mapk', 'ras', 'sigMapkCaption', /KRAS G12/, 'off'],
    ['sig-mapk', 'sig-mapk', 'drug', 'sigMapkCaption', /sotorasib/, 'off'],
    ['sig-calcium', 'sig-ca', 'puff', 'sigCaCaption', /PIP₂/, 'rest'],
    ['sig-calcium', 'sig-ca', 'wave', 'sigCaCaption', /ryanodine/, 'rest'],
    ['sig-calcium', 'sig-ca', 'blocked', 'sigCaCaption', /thapsigargin/, 'rest'],
    ['junc-tight', 'junc-tight', 'leaky', 'juncTightCaption', /claudin-2/, 'sealed'],
    ['junc-tight', 'junc-tight', 'lost', 'juncTightCaption', /fence fails/, 'sealed'],
    ['junc-anchor', 'junc-anchor', 'weld', 'juncAnchorCaption', /desmoglein/, 'belt'],
    ['junc-anchor', 'junc-anchor', 'shear', 'juncAnchorCaption', /intermediate filament/, 'belt'],
    ['junc-anchor', 'junc-anchor', 'pemphigus', 'juncAnchorCaption', /acantholysis/, 'belt'],
    ['junc-gap', 'junc-gap', 'closed', 'juncGapCaption', /arrhythmias/, 'open'],
    ['lipid-ldl', 'lipid-ldl', 'statin', 'lipidLdlCaption', /HMG-CoA reductase/, 'normal'],
    ['lipid-ldl', 'lipid-ldl', 'pcsk9', 'lipidLdlCaption', /inclisiran/, 'normal'],
    ['lipid-ldl', 'lipid-ldl', 'fh', 'lipidLdlCaption', /1 in 250/, 'normal'],
    ['lipid-plaque', 'lipid-plaque', 'stable', 'lipidPlaqueCaption', /fibrous cap/, 'streak'],
    ['lipid-plaque', 'lipid-plaque', 'vulnerable', 'lipidPlaqueCaption', /ruptures/, 'streak'],
    ['lipid-plaque', 'lipid-plaque', 'ct', 'lipidPlaqueCaption', /Agatston/, 'streak'],
    ['lipid-steroid', 'lipid-steroid', 'aldosterone', 'lipidSteroidCaption', /CYP11B2/, 'cortisol'],
    ['lipid-steroid', 'lipid-steroid', 'sex', 'lipidSteroidCaption', /aromatase/, 'cortisol'],
    ['lipid-steroid', 'lipid-steroid', 'star', 'lipidSteroidCaption', /lipoid/, 'cortisol'],
    ['mito-dynamics', 'mito-dyn', 'fission', 'mitoDynCaption', /DRP1/, 'fusion'],
    ['mito-ros', 'mito-ros', 'overload', 'mitoRosCaption', /reperfusion/, 'balanced'],
    ['mito-ros', 'mito-ros', 'nadph', 'mitoRosCaption', /G6PD/, 'balanced'],
    ['mito-mitophagy', 'mito-pink', 'damaged', 'mitoPinkCaption', /Parkin coats/, 'healthy'],
    ['mito-mitophagy', 'mito-pink', 'pd', 'mitoPinkCaption', /Parkinson/, 'healthy'],
    ['pacemaker', 'heart-rate', 'slow', 'pacemakerCaption', /50 beats per minute/, 'normal'],
    ['stem-potency', 'stem-potency', 'asym', 'stemPotencyCaption', /transit-amplifying progenitor/, 'ladder'],
    ['stem-potency', 'stem-potency', 'sym', 'stemPotencyCaption', /both stay stem cells/, 'ladder'],
    ['stem-potency', 'stem-potency', 'crypt', 'stemPotencyCaption', /Paneth cells/, 'ladder'],
    ['stem-potency', 'stem-potency', 'ladder', 'stemPotencyCaption', /totipotent/, 'ladder'],
    ['stem-fate', 'stem-fate', 'muscle', 'stemFateCaption', /MyoD/, 'pluri'],
    ['stem-fate', 'stem-fate', 'neuron', 'stemFateCaption', /ASCL1/, 'pluri'],
    ['stem-fate', 'stem-fate', 'blood', 'stemFateCaption', /GATA1 wins over PU\.1/, 'pluri'],
    ['stem-fate', 'stem-fate', 'pluri', 'stemFateCaption', /bivalent/, 'pluri'],
    ['stem-niches', 'stem-niche', 'tree', 'stemNicheCaption', /common myeloid/, 'niche'],
    ['stem-niches', 'stem-niche', 'ipsc', 'stemNicheCaption', /Oct4, Sox2, Klf4 and c-Myc/, 'niche'],
    ['stem-niches', 'stem-niche', 'pet', 'stemNicheCaption', /G-CSF/, 'niche'],
    ['stem-niches', 'stem-niche', 'niche', 'stemNicheCaption', /CXCL12/, 'niche'],
  ];
  for (const [route, key, value, cap, expected, back] of SWITCHES) {
    run('go(' + JSON.stringify(route) + ')'); await new Promise(resolve => setImmediate(resolve));
    assert.match(element('#chapter').innerHTML, new RegExp('data-lesson="' + key + '" data-val="' + value + '"'), route + ' renders the ' + key + ' switch');
    run('setLesson(' + JSON.stringify(key) + ', ' + JSON.stringify(value) + ')');
    assert.match(element('#' + cap).textContent, expected, route + ': ' + key + '=' + value + ' updates its caption');
    run('setLesson(' + JSON.stringify(key) + ', ' + JSON.stringify(back) + ')');
  }
  run("go('endocrine-targets')");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.location.hash, '#endocrine-receptors', 'old endocrine-targets links redirect');
  run('goHome()');
  assert.equal(context.location.hash, '#home');
  assert.equal(element('#scopeTitle').textContent, 'Hormones & endocrine', 'returning home puts the last module back on the stage');
  console.log(seen.size + ' chapter routes in ' + run('MANIFEST').length + ' modules, text-mode navigation, cross-links, US spelling, lesson controls, the red-cell exercise, blood card deep links, the merged-module redirect, ' + SWITCHES.length + ' lesson switches and the 23-slide microscope bench (11 Cell mechanisms + 12 Cells in tissues) passed.');
}
main().catch(err => { console.error(err); process.exitCode = 1; });

