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
  const seen = new Set();
  for (const { key, ids } of run('MANIFEST')) {
    run('go(' + JSON.stringify(ids[0]) + ')');
    assert.equal(element('#nextBtn').disabled, true);
    run('showChapter(0)');
    assert.equal(pending.src, 'modules/' + key + '.js');
    run(read(pending.src));
    pending.onload();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(element('#nextBtn').disabled, false);
    assert.deepEqual(Array.from(run('chapters'), ch => ch.id), Array.from(ids));
    for (const id of ids) {
      assert(!seen.has(id), 'Duplicate chapter ' + id);
      seen.add(id);
      run('showChapter(' + ids.indexOf(id) + ')');
      assert.equal(context.location.hash, '#' + id);
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
  console.log(seen.size + ' chapter routes, text-mode navigation, and red-cell exercise passed.');
}
main().catch(err => { console.error(err); process.exitCode = 1; });

