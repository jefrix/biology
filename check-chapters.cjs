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
  // The home screen is a microscope bench: 12 glass slides in two full trays of 6, with Energy loaded on the stage.
  const keys = Array.from(run('MANIFEST'), x => x.key);
  const trays = element('#slideTrays').innerHTML;
  assert.equal(keys.length, 12, '12 modules');
  assert.deepEqual(Array.from(trays.matchAll(/data-key="([^"]+)"/g), x => x[1]), keys, 'one slide per module, in curriculum order');
  assert.match(trays, /Cell mechanisms[\s\S]*data-key="division"[\s\S]*data-key="cytoskeleton"[\s\S]*Cells in tissues[\s\S]*data-key="neural"/);
  const [mech, tissue] = trays.split('<section').slice(1);
  assert.equal((mech.match(/data-key=/g) || []).length, 6, 'Cell mechanisms tray holds 6 slides');
  assert.equal((tissue.match(/data-key=/g) || []).length, 6, 'Cells in tissues tray holds 6 slides');
  assert(!/slot-empty/.test(trays), 'no empty slots once both trays are full');
  assert.match(trays, /CM-06<\/span><span class="slide-name">Cyto(&shy;)?skeleton</, 'Cytoskeleton is slide CM-06');
  assert.equal(run('SLIDE_PREP.cytoskeleton'), 'Phalloidin + anti-tubulin');
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
    chromatin: ['gene'], cotransport: ['proximal-tubule', 'pump', 'tally'], epithelia: ['proximal-tubule', 'collecting-duct', 'endocrine-receptors'], channels: ['permeability'],
    apoptosis: ['fate', 'survival'], fate: ['apoptosis'], branches: ['krebs', 'blood/rbc'], warburg: ['petprep', 'cycle', 'branches'], glycolysis: ['warburg'], pump: ['cotransport'],
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
      assert(!/\b(colour|centre|haem|anaem|tumour|behaviour|signalling|fibre|organis|analys(e|ing)|oesoph|leukaem)\w*/i.test(html.replace(/https?:[^"]+/g, '')), id + ' uses US spelling');
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
  run("go('endocrine-targets')");
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(context.location.hash, '#endocrine-receptors', 'old endocrine-targets links redirect');
  run('goHome()');
  assert.equal(context.location.hash, '#home');
  assert.equal(element('#scopeTitle').textContent, 'Hormones & endocrine', 'returning home puts the last module back on the stage');
  console.log(seen.size + ' chapter routes in ' + run('MANIFEST').length + ' modules, text-mode navigation, cross-links, US spelling, lesson controls, the red-cell exercise, blood card deep links, the merged-module redirect and the 12-slide microscope bench passed.');
}
main().catch(err => { console.error(err); process.exitCode = 1; });

