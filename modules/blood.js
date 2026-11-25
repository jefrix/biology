/* Blood module: red cell, the five white cell types and platelets, drawn to scale (1 unit = 1 µm). */
(() => {
'use strict';

/* ---------- blood cells ---------- */
const BLOOD = [
  { id: 'rbc', name: 'Red blood cell', short: 'Red cell', tag: 'Erythrocyte · oxygen courier', size: 'about 7–8 µm across, 2 µm thick',
    look: 'A biconcave disc with no nucleus. The dimple adds surface area and lets it fold through capillaries narrower than itself.',
    job: 'Carries oxygen on roughly 270 million haemoglobin molecules (references give about 250–300 million), and helps carry CO₂ back to the lungs.',
    life: 'About 120 days. Worn-out cells are eaten by macrophages, mainly in the spleen and liver.',
    energy: '<b>No mitochondria</b>, so it runs on glycolysis alone and releases lactate. It uses none of the oxygen it delivers. A side branch makes 2,3-BPG, which helps haemoglobin let go of oxygen, at the cost of some ATP. The pentose phosphate pathway makes NADPH to protect against oxidation, which is why G6PD deficiency can cause haemolysis.',
    action: 'Oxygen loads (haemoglobin turns bright red), the cell folds to squeeze through a capillary, then unloads and darkens.',
    rad: 'A <b>Tc-99m tagged red cell scan</b> follows your own labelled cells to find bleeding that comes and goes, as in the gut. On unenhanced CT, the density of blood comes mostly from haemoglobin (flowing blood is about 40 HU), so anaemic blood looks darker. On MRI, the state of haemoglobin helps date a bleed:',
    mri: true,
    refs: [['https://doi.org/10.1007/s00330-020-07497-y', 'blood density on CT and anaemia (Zopfs et al. 2021)'], ['https://faculty.washington.edu/jeff8rob/trauma-radiology-reference-resource/1-cns/mri-appearance-of-intracranial-hemorrhage', 'University of Washington, MRI of intracranial haemorrhage, after Bradley 1993']] },
  { id: 'neut', name: 'Neutrophil', short: 'Neutrophil', tag: 'Granulocyte · first responder', pct: [40, 60], size: 'about 12–15 µm',
    look: 'A nucleus in 2 to 5 lobes joined by fine threads, with fine pale-lilac granules. Young <i>band</i> forms in the blood suggest a “left shift”. Six or more lobes points toward B12 or folate deficiency.',
    job: 'Arrives first at bacterial infection, swallows microbes and kills them with enzymes and reactive oxygen. It can also throw out DNA nets. Dead neutrophils are a major part of pus.',
    life: 'Only hours in the blood, longer once in tissue. Estimates differ between methods.',
    energy: 'Has few mitochondria and leans heavily on <b>glycolysis</b>. For its “respiratory burst”, the enzyme NADPH oxidase turns oxygen into microbe-killing oxidants. When that enzyme fails, the result is chronic granulomatous disease.',
    action: 'Bacteria are engulfed into a phagosome. Granules converge and an oxidative burst destroys them.',
    rad: 'In <b>labelled white cell scans</b> (In-111 oxine or Tc-99m HMPAO), labelled cells, many of them neutrophils, migrate to infection. They behave differently in the abdomen, where HMPAO activity can appear in normal bowel. Which is preferred depends on the clinical question and image timing. After <b>G-CSF</b>, marrow can light up diffusely on FDG-PET, often with the spleen. Diffuse uptake favours the drug effect and focal uptake raises concern for disease, but the pattern is not definitive.',
    refs: [['https://doi.org/10.1097/MNM.0b013e32832fa254', 'diffuse splenic FDG uptake (Liu 2009)'], ['https://doi.org/10.3109/00365529409091389', 'labelled white cells in abdominal infection (Lantto 1994)']] },
  { id: 'lymph', name: 'Lymphocytes', short: 'Lymphocyte', tag: 'Agranulocyte · targeted defence and memory', pct: [20, 40], size: 'about 7–8 µm when small, up to about 15 µm',
    look: 'A large, round, dense nucleus with a thin rim of cytoplasm. A resting small lymphocyte is close to a red cell in size. B and T cells cannot be reliably told apart by eye; laboratories use surface markers.',
    job: '', life: 'From weeks to many years. Memory cells are why immunity lasts.',
    energy: 'Resting cells tick over mostly on mitochondrial respiration. On activation, effector cells sharply increase <b>glycolysis even with oxygen available</b>, which supplies ATP and building blocks for rapid division.',
    action: '',
    rad: 'Activated lymphocytes take up more glucose, so <b>reactive lymph nodes can be FDG-avid</b> and mimic cancer, for example after vaccination or during infection. FDG PET/CT is also central to staging and response assessment in many lymphomas, which are cancers of lymphocytes.',
    refs: [['https://doi.org/10.1097/MNM.0000000000002041', 'reactive lymph nodes after COVID-19 vaccination (Adin et al. 2025)']],
    subs: [
      { id: 'b', label: 'B cell', job: '<b>B cells</b> make antibodies. When activated they can become plasma cells, which are antibody factories packed with rough ER, as well as long-lived memory cells.', action: 'An activated B cell, acting as a plasma cell, releases Y-shaped antibodies that coat a virus.' },
      { id: 't', label: 'T cell', job: '<b>T cells</b> are most of the lymphocytes in blood. Helper (CD4) T cells coordinate other immune cells. Cytotoxic (CD8) T cells kill infected or abnormal cells that display a matching antigen. Regulatory T cells restrain the response. HIV targets CD4 cells.', action: 'A cytotoxic T cell docks on an infected cell and delivers perforin and granzymes. The target dies by apoptosis.' },
      { id: 'nk', label: 'NK cell', job: '<b>Natural killer cells</b> belong to the innate system and need no prior exposure. They attack stressed cells, including some that have lost the “self” tag MHC class I. They are often larger, with a few visible granules.', action: 'An NK cell finds a cell missing its MHC class I “self” tag and triggers its death.' },
    ] },
  { id: 'mono', name: 'Monocyte', short: 'Monocyte', tag: 'Agranulocyte · cleanup crew in waiting', pct: [2, 8], size: 'about 12–20 µm, usually the largest in blood',
    look: 'A kidney or horseshoe-shaped nucleus in plentiful grey-blue cytoplasm, often with small vacuoles.',
    job: 'Moves into tissue and can become a <b>macrophage</b> or a dendritic-type cell. Macrophages eat microbes and debris, show antigens to T cells and recycle old red cells. Many resident tissue macrophages, such as brain microglia, were seeded before birth.',
    life: 'About 1 to 3 days in blood. Its descendants in tissue can last much longer.',
    energy: 'Has more mitochondria than a neutrophil and can shift its fuel use. Strongly activated macrophages favour glycolysis, while repair-type states lean more on oxidative metabolism.',
    action: 'It stretches around a worn-out red cell, swallows and digests it, and recovers the iron.',
    rad: 'Activated macrophages are a major reason <b>granulomatous disease</b> such as sarcoidosis or tuberculosis can be intensely FDG-avid. Macrophages also leave haemosiderin around old bleeds, which looks dark on T2* and susceptibility-weighted MRI.' },
  { id: 'eos', name: 'Eosinophil', short: 'Eosinophil', tag: 'Granulocyte · parasites and allergy', pct: [1, 4], size: 'about 12–15 µm',
    look: 'Usually a two-lobed nucleus, with large, even orange-red granules that take up the dye eosin.',
    job: 'Releases toxic granule proteins, such as major basic protein, against parasites too large to swallow, especially worms. Also drives tissue damage in asthma and other allergic disease.',
    life: 'Hours in the blood, then days in tissues such as the gut lining.',
    energy: 'Uses glycolysis and has more capacity for mitochondrial respiration than a neutrophil.',
    action: 'Granules are released onto a parasite that is far too big to engulf.',
    rad: 'In <b>chronic eosinophilic pneumonia</b>, peripheral, upper-lobe-predominant consolidation is classic: the “photographic negative” of pulmonary oedema. Not every patient shows it.',
    refs: [['https://doi.org/10.1056/NEJMicm2216444', 'the photographic negative sign, a case report (Ali and Mason 2023)']] },
  { id: 'baso', name: 'Basophil', short: 'Basophil', tag: 'Granulocyte · the alarm', pct: [0.5, 1], size: 'about 10–15 µm',
    look: 'Large, dark blue-purple granules that often hide the two-lobed or irregular nucleus. The rarest white cell.',
    job: 'Carries IgE on its surface. When an allergen cross-links it, the cell releases histamine and other signals. Granules also hold heparin. Tissue mast cells behave similarly but are a separate cell type. A persistent rise can point to a myeloproliferative disease such as CML.',
    life: 'Short: roughly hours to a few days.',
    energy: 'Less studied than the others. It relies on glucose, and its energy use changes when activated.',
    action: 'An allergen links two IgE antibodies on the surface, and the cell dumps its granules of histamine.',
    rad: 'Immediate reactions to <b>contrast agents</b> involve mediator release from mast cells and basophils. Many occur without proven IgE sensitisation, so a reaction can happen on first exposure. Emergency treatment of anaphylaxis centres on adrenaline.',
    refs: [['https://doi.org/10.1016/j.iac.2026.01.009', 'iodinated contrast and anaphylaxis (Lang et al. 2026)']] },
];
const bloodState = { id: null, sub: 'b' };
let bloodView = null;                              // set by the 3D scene when WebGL is available
function bloodCardHTML() {
  const c = BLOOD.find(x => x.id === bloodState.id);
  if (!c) return `<h3 style="--c:var(--fg)">Choose a cell</h3><p>Pick one above or click a label in the 3D view. All cells there are drawn to the same scale, so compare their sizes. Colours approximate a Wright-stained blood smear, brightened for the dark background.</p>`;
  const sub = c.subs && c.subs.find(x => x.id === bloodState.sub);
  const subs = c.subs ? `<div class="sub" role="group" aria-label="Lymphocyte type">${c.subs.map(x => `<button type="button" class="btn${x.id === bloodState.sub ? ' on' : ''}" data-sub="${x.id}">${x.label}</button>`).join('')}</div><p>${sub.job}</p>` : '';
  const mri = c.mri ? `<div class="table-wrap"><table class="ledger"><thead><tr><th>Stage (approx.)</th><th>Haemoglobin</th><th>T1</th><th>T2</th></tr></thead><tbody>
      <tr><td>Hyperacute, &lt;1 day</td><td>oxy, in cells</td><td>iso</td><td>bright</td></tr>
      <tr><td>Acute, 1–3 days</td><td>deoxy, in cells</td><td>iso</td><td>dark</td></tr>
      <tr><td>Early subacute, 3–7 d</td><td>met, in cells</td><td>bright</td><td>dark</td></tr>
      <tr><td>Late subacute, 1–4 wk</td><td>met, cells lysed</td><td>bright</td><td>bright</td></tr>
      <tr><td>Chronic, later</td><td>haemosiderin</td><td>dark</td><td>dark</td></tr>
    </tbody></table></div><p class="muted">A teaching simplification for brain haemorrhage. Real bleeds mix stages and the timing varies.</p>` : '';
  return `<div><h3 style="--c:var(--${c.id})">${c.name}</h3><div class="eyebrow">${c.tag}</div></div>${subs}
    <dl>
      <dt>Size</dt><dd>${c.size}</dd>
      <dt>Looks</dt><dd>${c.look}</dd>
      ${c.job ? `<dt>Job</dt><dd>${c.job}</dd>` : ''}
      <dt>Lifespan</dt><dd>${c.life}</dd>
      <dt>Energy</dt><dd>${c.energy}</dd>
    </dl>
    <p><span class="eyebrow">In the 3D view</span><br>${sub ? sub.action : c.action}</p>
    <div class="callout"><span class="eyebrow">Radiology link</span><p>${c.rad}</p></div>${mri}${c.refs ? `<p class="credit">Radiology references: ${c.refs.map(([u, t]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join(' · ')}.</p>` : ''}`;
}
function selectBlood(id, scroll) {
  bloodState.id = id;
  const card = $('#bloodCard'); if (!card) return;
  const c = BLOOD.find(x => x.id === id);
  card.style.setProperty('--c', `var(--${c ? c.id : 'fg'})`);
  card.innerHTML = bloodCardHTML();
  document.querySelectorAll('[data-cell]').forEach(b => b.classList.toggle('on', b.dataset.cell === (id || '')));
  if (bloodView) bloodView.focus(id);
  if (scroll) { const panel = $('#panel'); panel.scrollTop += card.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12; }
}
document.addEventListener('click', (e) => {
  const cellBtn = e.target.closest('[data-cell]');
  if (cellBtn) { selectBlood(cellBtn.dataset.cell || null, cellBtn.closest('.diff') !== null); return; }
  const subBtn = e.target.closest('[data-sub]');
  if (subBtn) { bloodState.sub = subBtn.dataset.sub; selectBlood('lymph'); }
});

const CHAPTERS = [
  {
    id: 'blood', short: 'Blood', where: 'A drop of blood · cells to scale',
    title: 'Blood: couriers and defenders',
    legend: [['rbc', 'Red cell'], ['neut', 'Neutrophil'], ['lymph', 'Lymphocyte'], ['mono', 'Monocyte'], ['eos', 'Eosinophil'], ['baso', 'Basophil'], ['plt', 'Platelet'], ['mito', 'Mitochondria']],
    details: { rbc: () => selectBlood('rbc', true) },
    html: () => `
      <p class="lede">Blood is the city’s delivery network and its security force. Red cells haul the oxygen that the electron transport chain consumes. White cells, the leukocytes, are mobile defenders that mostly use the blood to travel.</p>
      <div class="orgs">${BLOOD.map(c => `<button class="org" type="button" data-cell="${c.id}" style="--c:var(--${c.id})"><i></i><span><b>${c.name}</b><small>${c.tag.split(' · ')[1]}</small></span></button>`).join('')}
        <button class="org" type="button" data-cell="" style="--c:var(--fg)"><i></i><span><b>All cells</b><small>compare sizes</small></span></button></div>
      <div class="cell-card" id="bloodCard">${bloodCardHTML()}</div>
      <div>
        <div class="eyebrow" style="margin-bottom:6px">White cell differential · typical adult share</div>
        <div class="diff">${BLOOD.filter(c => c.pct).map(c => `<button type="button" data-cell="${c.id}" style="--c:var(--${c.id})"><span>${c.short}</span><span class="track"><i style="left:${c.pct[0]}%;width:${c.pct[1] - c.pct[0]}%"></i></span><span class="num">${c.pct[0]}–${c.pct[1]}%</span></button>`).join('')}
          <div class="axis" aria-hidden="true"><span></span><span><b>0</b><b>50</b><b>100%</b></span><span></span></div></div>
        <p class="mnemonic" style="margin-top:8px">By frequency: <b>N</b>ever <b>L</b>et <b>M</b>onkeys <b>E</b>at <b>B</b>ananas. Bars show reference ranges from <a href="https://medlineplus.gov/ency/article/003657.htm" target="_blank" rel="noopener" style="color:var(--accent)">MedlinePlus</a>. Laboratories differ, so use the range on the report.</p>
      </div>
      <ul class="facts">
        <li>Red cells vastly outnumber white cells, by several hundred to one. The 3D line-up is for comparing size and shape, not numbers.</li>
        <li><b>Platelets</b> are not white cells. They are small fragments shed by marrow megakaryocytes that help blood clot.</li>
        <li>All of these arise from blood-forming stem cells, mostly in the marrow. T cells mature in the thymus.</li>
        <li>Mast cells, macrophages and dendritic cells do much of their work in tissue and are not part of the routine differential.</li>
      </ul>
      <p class="credit">The 3D cells are schematic: granule numbers are reduced and actions are sped up. The red cell outline follows the Evans–Fung biconcave profile. Sizes and lifespans are approximate and vary between references. For learning, not diagnosis.</p>`,
  },
];

CellCity.register('blood', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, camera, controls, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, layout, molecule, disposeObj,
      clearAgents, travel, emit, every, addLabel, labels, fitPose, tweenTo } = g;

  /* ================= BLOOD GROUP (1 unit = 1 µm) ================= */
  const bloodGroup = new THREE.Group(); scene.add(bloodGroup);
  const BC = {};
  ['rbc', 'neut', 'eos', 'baso', 'lymph', 'mono', 'plt'].forEach(k => BC[k] = col(k));
  const BPOS = { rbc: new V3(-18, 9.5, 0), neut: new V3(0, 9.5, 0), lymph: new V3(18, 9.5, 0), mono: new V3(-18, -9.5, 0), eos: new V3(1, -9.5, 0), baso: new V3(18, -9.5, 0) };
  const BRAD = { rbc: 3.9, neut: 6.6, lymph: 4.6, mono: 8.2, eos: 6.7, baso: 6.0 };
  const cells = {};
  const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, emissive: color, emissiveIntensity: 0.22, roughness: 0.55 }, extra));
  function lumpy(r, amp, seed, seg = 48) {
    const geo = new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
    const p = geo.attributes.position, v = new V3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const k = Math.sin(v.x * 1.7 / r * 2.2 + seed) * Math.cos(v.y * 2.3 / r * 1.8 + seed * 2) + Math.sin(v.z * 3.1 / r * 1.5 + seed * 3) * 0.6;
      v.multiplyScalar(1 + k * amp); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals(); return geo;
  }
  function membraneShell(r, color, amp, seed) {
    const g = new THREE.Group(), geo = lumpy(r, amp, seed, 64);
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.09, depthWrite: false, roughness: 0.4 })));
    g.add(new THREE.Mesh(geo, fresnelMat(color, 1.0, 2.5)));
    return g;
  }
  function lobe(parent, mat, pos, scale, seed, amp = 0.06) {
    const m = new THREE.Mesh(lumpy(1, amp, seed, 32), mat); m.position.set(...pos); m.scale.set(...scale); parent.add(m); return m;
  }
  function strand(parent, mat, a, b, bend) {
    const A = new V3(...a), Bv = new V3(...b), mid = A.clone().lerp(Bv, 0.5).add(new V3(...bend));
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([A, mid, Bv]), 24, 0.17, 8, false), mat));
  }
  function granules(parent, color, n, size, R0, avoid) {
    const im = new THREE.InstancedMesh(atomGeo, std(color, { emissiveIntensity: 0.4 }), n);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    let i = 0, guard = 0;
    while (i < n && guard++ < 20000) {
      const v = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1));
      if (v.length() > 1) continue;
      v.multiplyScalar(R0 - size - 0.3);
      if (avoid.some(([c, rad]) => v.distanceTo(c) < rad + size * 0.6)) continue;
      const s = size * rr(0.8, 1.15);
      m4.compose(v, q, new V3(s, s, s)); im.setMatrixAt(i++, m4);
    }
    im.count = i; parent.add(im); return im;
  }
  function miniMitos(parent, n, R0, avoid) {
    const geo = new THREE.CapsuleGeometry(0.26, 0.75, 4, 10), mat = std(C.mito, { emissiveIntensity: 0.45 });
    let i = 0, guard = 0;
    while (i < n && guard++ < 3000) {
      const v = new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1));
      if (v.length() > 1) continue;
      v.multiplyScalar(R0 - 0.8);
      if (avoid.some(([c, rad]) => v.distanceTo(c) < rad + 0.4)) continue;
      const m = new THREE.Mesh(geo, mat); m.position.copy(v); m.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3)); parent.add(m); i++;
    }
  }
  function redCellGeo(R0) {                        // Evans & Fung thickness profile, scaled to radius R0
    const half = (x) => 0.5 * Math.sqrt(Math.max(0, 1 - x * x)) * (0.81 + 7.83 * x * x - 4.39 * Math.pow(x, 4)) * (R0 / 3.91);
    const pts = [], N = 40;
    for (let i = 0; i <= N; i++) { const x = Math.sin(i / N * Math.PI / 2); pts.push(new THREE.Vector2(x * R0, -half(x))); }
    for (let i = N - 1; i >= 0; i--) { const x = Math.sin(i / N * Math.PI / 2); pts.push(new THREE.Vector2(x * R0, half(x))); }
    const geo = new THREE.LatheGeometry(pts, 72); geo.computeVertexNormals(); return geo;
  }
  function makeCell(id) {
    const root = new THREE.Group(); root.position.copy(BPOS[id]); bloodGroup.add(root);
    const body = new THREE.Group(); root.add(body);
    const r = BRAD[id];
    cells[id] = { root, body, r };
    if (id === 'rbc') {
      const mat = std(BC.rbc, { emissiveIntensity: 0.18, roughness: 0.45 });
      const disc = new THREE.Mesh(redCellGeo(r), mat); disc.rotation.x = 1.05; body.add(disc);
      cells[id].mat = mat; cells[id].disc = disc;
      return;
    }
    body.add(membraneShell(r, BC[id], id === 'mono' ? 0.035 : 0.014, id.length * 1.7));
    const nm = std(new THREE.Color(0x6d4bd0), { emissiveIntensity: 0.3, roughness: 0.7 });
    const av = [];
    if (id === 'neut') {
      const lobes = [[-3.1, -0.9, 0.2], [-1.5, 1.9, -0.4], [1.8, 2.0, 0.3], [2.8, -1.4, -0.2]];
      lobes.forEach((q, i) => { lobe(body, nm, q, [1.65, 1.4, 1.35], i + 1); av.push([new V3(...q), 1.6]); });
      strand(body, nm, lobes[0], lobes[1], [-1.0, 0.1, 0]); strand(body, nm, lobes[1], lobes[2], [0, 0.9, 0]); strand(body, nm, lobes[2], lobes[3], [1.2, 0, 0]);
      granules(body, BC.neut, 520, 0.16, r, av); miniMitos(body, 3, r, av);
    } else if (id === 'eos') {
      [[-2.3, 0.5, 0], [2.3, 0.2, 0]].forEach((q, i) => { lobe(body, nm, q, [2.1, 2.4, 1.8], i + 4); av.push([new V3(...q), 2.1]); });
      strand(body, nm, [-2.3, 0.5, 0], [2.3, 0.2, 0], [0, 2.3, 0]);
      cells[id].grains = granules(body, BC.eos, 190, 0.47, r, av); miniMitos(body, 7, r, av);
    } else if (id === 'baso') {
      [[-1.5, 0.4, -0.6], [1.5, -0.3, -0.6]].forEach((q, i) => lobe(body, std(new THREE.Color(0x9a78c8), { emissiveIntensity: 0.18 }), q, [2.1, 2.3, 1.6], i + 7));
      cells[id].grains = granules(body, new THREE.Color(0x4a35c9), 120, 0.58, r, []); miniMitos(body, 4, r, []);
    } else if (id === 'lymph') {
      lobe(body, nm, [-0.3, 0.1, 0], [3.6, 3.5, 3.4], 11, 0.012);
      av.push([new V3(-0.3, 0.1, 0), 3.55]);
      granules(body, new THREE.Color(0xd05aa8), 14, 0.2, r, av); miniMitos(body, 7, r, av);
    } else if (id === 'mono') {
      const horse = new THREE.Group(); horse.position.set(-0.5, -0.2, 0); body.add(horse);
      const arc = 4.1, rad = 3.0, tube = 1.95;
      const t = new THREE.Mesh(new THREE.TorusGeometry(rad, tube, 24, 64, arc), nm); horse.add(t);
      [0, arc].forEach(a => { const cap = new THREE.Mesh(atomGeo, nm); cap.scale.setScalar(tube); cap.position.set(Math.cos(a) * rad, Math.sin(a) * rad, 0); horse.add(cap); });
      horse.rotation.z = 1.1;
      for (let i = 0; i <= 8; i++) { const a = 1.1 + arc * i / 8; av.push([new V3(Math.cos(a) * rad - 0.5, Math.sin(a) * rad - 0.2, 0), tube]); }
      granules(body, BC.mono, 170, 0.13, r, av);
      granules(body, new THREE.Color(0xbfe9ff), 14, 0.5, r, av);
      miniMitos(body, 20, r, av);
    }
  }
  Object.keys(BPOS).forEach(makeCell);
  Object.values(cells).forEach(c => { c.parts = new Set(c.root.children); });   // anything added later is temporary
  const platelets = new THREE.Group(); platelets.position.set(-9.5, 1.2, 0); bloodGroup.add(platelets);
  {
    const mat = std(BC.plt, { emissiveIntensity: 0.35 });
    [[0, 0, 0], [2.7, -1.3, 0.5], [-2.4, -1.5, -0.4], [0.6, -2.9, 0.3]].forEach((q, i) => {
      const m = new THREE.Mesh(lumpy(1.25, 0.09, i + 2, 20), mat); m.position.set(...q); m.scale.set(1, 0.8, 0.4); m.rotation.set(rr(-.6, .6), rr(-.6, .6), rr(0, 3)); platelets.add(m);
    });
  }

  /* ================= labels and camera ================= */
  BLOOD.forEach(c => {
    const l = addLabel(c.short, c.id, cells[c.id].root, new V3(0, -cells[c.id].r - 1.3, 0), ['blood'], { onClick: () => selectBlood(c.id) });
    l.blood = c.id;
  });
  addLabel('Platelets', 'plt', platelets, new V3(0, -5, 0), ['blood']);
  const POSES = {
    blood: { pos: new V3(0, 0, 60), target: new V3(0, -0.8, 0), group: 'blood', w: 30 },
  };

  /* ---------- blood cell actions ---------- */
  const OXY = new THREE.Color(0xff3347), DEOXY = new THREE.Color(0x8e1f4a);
  function ball(color, r, glowSize = 0) {
    const g = new THREE.Group(); const m = new THREE.Mesh(atomGeo, atomMat(color)); m.scale.setScalar(r); g.add(m);
    if (glowSize) g.add(glow(color, glowSize));
    return g;
  }
  function say(parent, text, color, at, dur = 2.6, size = 0.95) {
    const sp = textSprite(text, color, size); sp.position.copy(at); sp.material.depthTest = false; sp.renderOrder = 5; parent.add(sp);
    const t0 = now;
    every(t => { const u = (t - t0) / dur; sp.position.y = at.y + u * 0.8; sp.material.opacity = u < 0.7 ? 1 : Math.max(0, (1 - u) / 0.3); if (u >= 1) { disposeObj(sp); return false; } return true; }, sp);
  }
  function later(sec, fn) { const at = now + sec; every(t => { if (t < at) return true; fn(); return false; }); }
  function pulse(obj, dur, from, to, hold = 0) {   // scale an object, then remove it
    const t0 = now;
    every(t => { const u = Math.min(1, (t - t0) / dur); obj.scale.setScalar(Math.max(0.001, from + (to - from) * u)); if (t - t0 >= dur + hold) { disposeObj(obj); return false; } return true; }, obj);
  }
  function antibody(color) {
    const g = new THREE.Group(), mat = atomMat(color);
    [[0, -0.35, 0], [-0.28, 0.25, -0.65], [0.28, 0.25, 0.65]].forEach(([x, y, z]) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.72, 8), mat); m.position.set(x, y, 0); m.rotation.z = z; g.add(m);
    });
    return g;
  }
  function randDir() { return new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize(); }
  const ACTIONS = {
    rbc(c) {
      const root = c.root;
      for (let i = 0; i < 12; i++) {
        const a = i / 12 * Math.PI * 2, o = ball(new THREE.Color(0xd8f1ff), 0.22, 0.9);
        travel(root, o, [new V3(Math.cos(a) * 9, Math.sin(a) * 7, 2), new V3(Math.cos(a) * 2.6, Math.sin(a) * 1.4, 1)], 1.4, { delay: i * 0.07, shrinkEnd: true });
      }
      say(root, 'O₂ loading', new THREE.Color(0xd8f1ff), new V3(0, 4.6, 2), 2.4);
      const t0 = now;
      every(t => {
        const u = t - t0;
        const sat = u < 1 ? 0 : u < 2.4 ? (u - 1) / 1.4 : u < 5.2 ? 1 : Math.max(0, 1 - (u - 5.2) / 1.4);
        c.mat.color.copy(DEOXY).lerp(OXY, sat); c.mat.emissive.copy(c.mat.color);
        const sq = u > 2.8 && u < 5 ? Math.sin((u - 2.8) / 2.2 * Math.PI) : 0;
        c.body.scale.set(1 + sq * 0.5, 1 - sq * 0.45, 1 - sq * 0.2);
        return u < 7.5;
      });
      later(3.0, () => say(root, 'squeezing through a capillary', BC.rbc, new V3(0, 4.6, 2), 2.0, 0.8));
      later(5.2, () => {
        say(root, 'O₂ released to tissue', new THREE.Color(0xd8f1ff), new V3(0, 4.6, 2), 2.2);
        for (let i = 0; i < 10; i++) { const d = randDir(); travel(root, ball(new THREE.Color(0xd8f1ff), 0.2, 0.8), [d.clone().multiplyScalar(2), d.clone().multiplyScalar(9)], 1.6, { shrinkEnd: true, ease: ease.out }); }
      });
      return 8;
    },
    neut(c) {
      const green = col('lyso');
      [0, 1, 2].forEach(i => {
        const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.2, 4, 10), std(green, { emissiveIntensity: 0.6 }));
        const inside = new V3(-0.2 + i * 0.9, -3.6 + (i % 2) * 0.7, 3.2);
        travel(c.root, b, [new V3(8 + i * 2, -9 + i, 6), new V3(3.5 + i, -6.5, 5), inside], 2.6, { delay: i * 0.25, spin: 1.2, keep: true, onDone: o => later(2.2, () => pulse(o, 1.0, 1, 0)) });
      });
      later(3.0, () => {
        const centre = new V3(0.7, -3.4, 3.2);
        const bag = new THREE.Group(); bag.position.copy(centre); bag.add(new THREE.Mesh(atomGeo, fresnelMat(new THREE.Color(0xffd6ec), 1.3, 2))); c.root.add(bag);
        pulse(bag, 0.5, 0.2, 2.4, 2.4);
        say(c.root, 'phagosome', BC.neut, new V3(0.7, -0.6, 5), 1.8, 0.8);
        for (let i = 0; i < 40; i++) { const from = randDir().multiplyScalar(rr(3, 5.6)); travel(c.root, ball(BC.neut, 0.2, 0.5), [from, centre.clone().add(randDir())], 1.0, { delay: rr(0, 0.8), shrinkEnd: true }); }
      });
      later(4.3, () => {
        say(c.root, 'oxidative burst', col('atp'), new V3(0.7, -0.6, 5), 2.2);
        for (let i = 0; i < 26; i++) { const at = new V3(0.7, -3.4, 3.2); travel(c.root, ball(col('atp'), 0.12, 1.0), [at, at.clone().add(randDir().multiplyScalar(2.2))], 0.9, { delay: rr(0, 0.9), shrinkEnd: true, ease: ease.out }); }
      });
      return 7.5;
    },
    eos(c) {
      const pts = []; for (let i = 0; i <= 14; i++) pts.push(new V3(-9 + i * 1.3, Math.sin(i * 0.8) * 1.0, 0));
      const worm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.9, 14, false), std(new THREE.Color(0xd9c48a), { emissiveIntensity: 0.2 }));
      worm.position.set(1, -9.4, 1); c.root.add(worm);
      const t0 = now;
      every(t => { const u = t - t0; worm.position.x = 1 + Math.sin(u * 2.4) * 0.5; worm.rotation.z = Math.sin(u * 3.1) * 0.05 * Math.max(0, 1 - (u - 4) / 2); if (u > 6.5) worm.scale.setScalar(Math.max(0.001, 1 - (u - 6.5))); if (u > 7.5) { disposeObj(worm); return false; } return true; }, worm);
      say(c.root, 'parasite (not to scale)', new THREE.Color(0xe6d49a), new V3(0, -12.4, 3), 3, 0.8);
      later(1.8, () => {
        say(c.root, 'degranulation', BC.eos, new V3(0, 7.6, 3), 2.6);
        for (let i = 0; i < 55; i++) { const from = new V3(rr(-3.5, 3.5), rr(-5.5, -2), rr(-2, 2)); travel(c.root, ball(BC.eos, rr(0.25, 0.42), 0.6), [from, new V3(rr(-4, 4), -6.8, 2), new V3(rr(-7, 8), -9.4 + rr(-.8, .8), rr(0.5, 2.4))], 1.8, { delay: rr(0, 2.4), shrinkEnd: true }); }
      });
      return 8.5;
    },
    baso(c) {
      const ige = col('atp');
      [-0.45, 0.05].forEach(off => {
        const a = Math.PI / 2 + off, ab = antibody(ige); ab.scale.setScalar(1.3);
        ab.position.set(Math.cos(a) * (c.r + 0.65), Math.sin(a) * (c.r + 0.65), 0); ab.rotation.z = a - Math.PI / 2; c.root.add(ab); pulse(ab, 0.3, 0.4, 1.3, 6.4);
      });
      say(c.root, 'IgE on surface', ige, new V3(-4.5, 8, 2), 2.2, 0.8);
      const allergen = ball(col('lyso'), 0.8, 2.4);
      travel(c.root, allergen, [new V3(9, 13, 2), new V3(3, 10.5, 1), new V3(1.15, 8.1, 0)], 2.2, { keep: true, onDone: o => later(3.5, () => pulse(o, 0.6, 1, 0)) });
      later(2.4, () => {
        say(c.root, 'histamine release', BC.baso, new V3(0, -8.4, 3), 3);
        for (let i = 0; i < 70; i++) { const d = randDir(); travel(c.root, ball(new THREE.Color(0x7c63ff), rr(0.25, 0.45), 0.8), [d.clone().multiplyScalar(rr(2, 5)), d.clone().multiplyScalar(rr(9, 12))], 2.2, { delay: rr(0, 1.8), shrinkEnd: true, ease: ease.out }); }
      });
      return 7.5;
    },
    mono(c) {
      const old = new THREE.Group();
      const disc = new THREE.Mesh(redCellGeo(3.0), std(DEOXY.clone(), { emissiveIntensity: 0.4 })); disc.rotation.x = 1.0; old.add(disc);
      const at = new V3(4.0, -2.8, 4.2);
      travel(c.root, old, [new V3(17, -9, 6), new V3(11.5, -7, 5.5), at], 2.8, { keep: true, spin: 0.35, onDone: o => later(1.2, () => pulse(o, 2.4, 1, 0)) });
      say(c.root, 'worn-out red cell', BC.rbc, new V3(11, -2, 5), 2.4, 0.85);
      const t0 = now;
      every(t => {
        const u = t - t0, k = u > 2 && u < 6 ? Math.sin((u - 2) / 4 * Math.PI) : 0;
        c.body.scale.set(1 + k * 0.17, 1 - k * 0.05, 1); c.body.position.set(k * 0.8, -k * 0.5, 0);
        return u < 6.2;
      });
      later(3.2, () => say(c.root, 'engulfed and digested', BC.mono, new V3(0, 10, 3), 2.4));
      later(5.2, () => {
        say(c.root, 'iron recovered', col('fadh'), new V3(6, 1, 5), 2.4, 0.85);
        for (let i = 0; i < 14; i++) travel(c.root, ball(col('fadh'), 0.22, 0.9), [at.clone(), at.clone().add(randDir().multiplyScalar(4.5))], 1.8, { delay: rr(0, 0.7), shrinkEnd: true, ease: ease.out });
      });
      return 8.5;
    },
    lymph(c) { return ACTIONS['lymph_' + bloodState.sub](c); },
    lymph_b(c) {
      const gold = col('atp');
      const virus = new THREE.Group(); virus.add(ball(col('lyso'), 1.1, 2.2));
      for (let i = 0; i < 18; i++) { const s0 = ball(col('lyso'), 0.2); s0.position.copy(randDir().multiplyScalar(1.35)); virus.add(s0); }
      virus.position.set(7.8, 4.4, 2); c.root.add(virus); pulse(virus, 0.3, 0.6, 1, 6.2);
      say(c.root, 'virus (not to scale)', col('lyso'), new V3(7.8, 6.8, 2), 2.4, 0.65);
      for (let i = 0; i < 38; i++) {
        const d = randDir(), hit = i % 3 === 0;
        const ab = antibody(gold); ab.scale.setScalar(0.8); ab.rotation.z = rr(0, 6.28);
        const end = hit ? virus.position.clone().add(randDir().multiplyScalar(1.7)) : d.clone().multiplyScalar(rr(8, 11));
        travel(c.root, ab, [d.clone().multiplyScalar(4), d.clone().multiplyScalar(6.2), end], 2.2, { delay: 0.5 + i * 0.09, keep: hit, shrinkEnd: !hit, onDone: hit ? o => later(2.0, () => disposeObj(o)) : null });
      }
      later(1.4, () => say(c.root, 'antibodies', gold, new V3(-4.5, 6, 3), 3, 0.8));
      return 7.5;
    },
    killer(c, text, targetColor) {
      const target = new THREE.Group();
      const shell = membraneShell(3.2, targetColor, 0.05, 3); target.add(shell);
      target.add(ball(targetColor, 1.4, 3));
      const docked = new V3(7.4, -1.4, 0);
      travel(c.root, target, [new V3(16, -7, 2), new V3(11, -3.5, 1), docked], 2.2, { keep: true });
      say(c.root, text, targetColor, new V3(8.4, 3.8, 3), 2.8, 0.7);
      later(2.5, () => {
        say(c.root, 'perforin + granzymes', col('atp'), new V3(0, -6.8, 3), 2.6, 0.7);
        for (let i = 0; i < 30; i++) travel(c.root, ball(col('atp'), 0.16, 0.7), [new V3(3.2, -0.6 + rr(-1, 1), rr(-1, 1)), new V3(4.5, -0.8 + rr(-.6, .6), rr(-.6, .6)), docked.clone().add(randDir())], 1.0, { delay: rr(0, 1.4), shrinkEnd: true });
      });
      later(4.6, () => {
        say(c.root, 'apoptosis', targetColor, new V3(8.4, 3.8, 3), 2.2, 0.8);
        disposeObj(target);
        for (let i = 0; i < 9; i++) { const blob = membraneShell(rr(0.6, 1.2), targetColor, 0.05, i); blob.add(ball(targetColor, 0.28)); travel(c.root, blob, [docked.clone().add(randDir()), docked.clone().add(randDir().multiplyScalar(4.5))], 2.2, { shrinkEnd: true, ease: ease.out }); }
      });
      return 8;
    },
    lymph_t(c) { return ACTIONS.killer(c, 'infected cell', col('lyso')); },
    lymph_nk(c) { return ACTIONS.killer(c, 'no MHC I tag', col('fadh')); },
  };

  const blood = { focused: null, next: 0 };
  function resetBlood() {
    clearAgents();
    Object.values(cells).forEach(c => c.root.children.filter(o => !c.parts.has(o)).forEach(disposeObj));
    Object.values(cells).forEach(c => { c.body.scale.set(1, 1, 1); c.body.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0); });
    cells.rbc.mat.color.copy(BC.rbc); cells.rbc.mat.emissive.copy(BC.rbc);
  }
  function focusBlood(id) {
    if (stageId !== 'blood') return;
    resetBlood();
    blood.focused = id; blood.next = now + 1.4;
    Object.entries(cells).forEach(([k, c]) => { c.root.visible = !id || k === id; });
    platelets.visible = !id;
    labels.forEach(l => { if (l.blood) l.el.classList.toggle('on', l.blood === id); });
    if (!id) { tweenTo(fitPose(POSES.blood), 1.2); return; }
    const target = BPOS[id].clone();
    const half = { rbc: 11, neut: 12, lymph: 13, mono: 15, eos: 13.5, baso: 13.5 }[id];
    const dist = half / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * Math.min(camera.aspect, 1.15));
    tweenTo({ pos: target.clone().add(new V3(0, 0, dist)), target }, 1.2);
  }
  const B = {};
  B.blood = {
    reset() { selectBlood(null); },
    enter() {
      resetBlood(); blood.focused = null;
      Object.values(cells).forEach(c => { c.root.visible = true; }); platelets.visible = true;
      bloodView = { focus: focusBlood };
      bloodState.id = null; selectBlood(null);
      blood.next = Infinity;
    },
    tick(t) {
      const id = blood.focused;
      if (id) {
        if (t > blood.next) { resetBlood(); blood.next = t + ACTIONS[id](cells[id]) + 0.6; }
      } else {
        Object.values(cells).forEach((c, i) => { c.root.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.5 + i) * 0.35; });
        platelets.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.4) * 0.12;
      }
    },
    exit() { bloodView = null; resetBlood(); },
  };

    return {
      groups: { blood: bloodGroup },
      unitsPerNm: { blood: 0.001 },
      fog: { blood: 0.002 },
      depth: { blood: 0 },
      fadeText: { blood: 'To the bloodstream' },
      poses: POSES, behaviors: B,
    };
  },
});
})();
