/* Real-time playback check.
   Open the site with ?check=playback, for example http://localhost:8000/?check=playback, and keep the tab visible.
   It opens every chapter in turn, lets its 3D scene run, and reports chapters where:
     - nothing in the scene moved or changed (a frozen animation),
     - the number of running animation helpers keeps growing (animations piling up, as in the old Ledger bug),
     - an error was thrown, or the animation clock stopped (usually because the tab was hidden).
   Options: &module=bone,nephron checks only those modules; &secs=4 sets how long each chapter runs (default 2.5).
   The result is shown on the page, printed with console.table and kept in window.playbackResult. */
(async () => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const only = (params.get('module') || '').split(',').filter(Boolean);
  const secs = Math.max(1, +(params.get('secs') || 2.5));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const errors = [];
  addEventListener('error', e => errors.push(e.message));
  addEventListener('unhandledrejection', e => errors.push(String(e.reason)));

  const box = document.createElement('div');
  box.className = 'playback-check';
  box.setAttribute('role', 'status');
  document.body.appendChild(box);
  const rows = [];
  const BAD = new Set(['no motion', 'animations piling up', 'error', 'clock stalled', 'did not open']);
  function render(done) {
    const bad = rows.filter(r => BAD.has(r.status));
    box.innerHTML = `<b>Playback check</b> · ${rows.length} chapters${done ? '' : ' so far, running…'} · `
      + `<span class="${bad.length ? 'bad' : 'ok'}">${bad.length} problem${bad.length === 1 ? '' : 's'}</span>`
      + (reduceMotion ? '<p class="bad">Reduced motion is on, so many scenes hold still on purpose. Turn it off to check playback.</p>' : '')
      + `<table><thead><tr><th>Chapter</th><th>Changed</th><th>Helpers</th><th>Result</th></tr></thead><tbody>`
      + rows.map(r => `<tr><td>${r.module} · ${r.id}</td><td>${r.changed}/${r.objects}</td><td>${r.helpers}</td><td class="${BAD.has(r.status) ? 'bad' : 'ok'}">${r.status}${r.error ? ': ' + r.error : ''}</td></tr>`).join('')
      + `</tbody></table>${done ? '<button class="btn" type="button" id="pbCopy">Copy report</button>' : ''}`;
    const copy = box.querySelector('#pbCopy');
    if (copy) copy.onclick = () => navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
  }
  if (!G3) { box.textContent = 'The 3D viewer did not start, so playback cannot be checked.'; return; }

  // A fingerprint of every object in the visible scene group: transform, visibility, material and geometry updates.
  function snapshot() {
    const g = GROUPS[G3.group], shot = new Map();
    if (!g) return shot;
    g.updateMatrixWorld(true);
    g.traverse(o => {
      let shown = o.visible;
      for (let p = o.parent; shown && p && p !== g; p = p.parent) shown = p.visible;
      const e = o.matrixWorld.elements, m = !Array.isArray(o.material) && o.material;
      const geo = o.geometry, pos = geo && geo.attributes && geo.attributes.position;
      shot.set(o.uuid, [e[12], e[13], e[14], e[0], e[1], e[5], e[10], shown ? 1 : 0,
        m ? (m.opacity ?? 1) + ',' + (m.emissiveIntensity ?? 0) + ',' + (m.color ? m.color.getHexString() : '') : '',
        pos ? pos.version : 0, geo && geo.drawRange ? geo.drawRange.count : 0].map(v => typeof v === 'number' ? v.toFixed(4) : v).join('|'));
    });
    // labels are DOM elements that follow the scene, so their text and visibility count too
    G3.labels.forEach(l => shot.set('lbl' + G3.labels.indexOf(l), (l.el.hidden ? 0 : 1) + l.el.textContent));
    return shot;
  }

  await sleep(1500);
  for (const m of MANIFEST) {
    if (only.length && !only.includes(m.key)) continue;
    for (const id of m.ids) {
      const e0 = errors.length;
      location.hash = id;
      let waited = 0;
      while (waited < 15000 && !(chapters[chapterIndex] && chapters[chapterIndex].id === id)) { await sleep(100); waited += 100; }
      const ch = chapters[chapterIndex];
      if (!ch || ch.id !== id) { rows.push({ module: m.key, id, changed: 0, objects: 0, helpers: '', status: 'did not open', error: errors.slice(e0).join(' | ') }); render(); continue; }
      if (ch.panelOnly) { rows.push({ module: m.key, id, changed: 0, objects: 0, helpers: '', status: 'text only' }); render(); continue; }
      await sleep(900);                                  // let the camera move and the scene settle in
      const a = snapshot(), n0 = agents.length, t0 = now;
      await sleep(secs * 500);
      const nMid = agents.length;                       // a scene may ramp up to a steady number of helpers; only growth that continues counts
      await sleep(secs * 500);
      const b = snapshot(), n1 = agents.length, t1 = now;
      let changed = 0;
      b.forEach((v, k) => { if (a.get(k) !== v) changed++; });
      let status = 'ok';
      if (errors.length > e0) status = 'error';
      else if (t1 - t0 < secs * 0.4) status = 'clock stalled';
      else if (changed === 0) status = 'no motion';
      else if (n1 > n0 * 2 + 20 && n1 > nMid * 1.4 + 10) status = 'animations piling up';
      rows.push({ module: m.key, id, changed, objects: b.size, helpers: `${n0}→${nMid}→${n1}`, status, error: errors.slice(e0).join(' | ') });
      render();
    }
  }
  render(true);
  window.playbackResult = rows;
  console.table(rows);
})();
