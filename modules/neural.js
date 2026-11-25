/* Neural cells: neurons and glia, membrane potentials, action potentials, myelin, synapses, integration, transport, brain imaging. */
(() => {
'use strict';

/* ================================================================
   Models and rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
const RT_F = 25;                                   // mV, about room temperature (the value used in Luo, Principles of Neurobiology, p. 39)
// Typical mammalian neuron, mM (Luo, Fig. 2-12).
const IONS = { K: { out: 4, in: 120, z: 1 }, Na: { out: 150, in: 15, z: 1 }, Cl: { out: 120, in: 5, z: -1 } };
function nernst(out, inside, z) { return RT_F / z * Math.log(out / inside); }
// Goldman-Hodgkin-Katz voltage equation. Permeabilities are relative to K.
function ghk(kOut, pNa, pCl) {
  const num = kOut + pNa * IONS.Na.out + pCl * IONS.Cl.in;
  const den = IONS.K.in + pNa * IONS.Na.in + pCl * IONS.Cl.out;
  return RT_F * Math.log(num / den);
}
/* Hodgkin-Huxley model with the classic squid giant axon constants (6.3 °C, resting near -65 mV).
   pulses: [[start ms, duration ms, current µA/cm²]]. gNaScale and gKScale mimic channel blockers. */
function simulate({ pulses, gNaScale = 1, gKScale = 1, duration = 30, dt = 0.01 }) {
  const gNa = 120 * gNaScale, gK = 36 * gKScale, gL = 0.3, ENa = 50, EK = -77, EL = -54.387;
  const vtrap = (x, y) => (Math.abs(x / y) < 1e-6 ? y * (1 + x / y / 2) : x / (1 - Math.exp(-x / y)));
  const am = (v) => 0.1 * vtrap(v + 40, 10), bm = (v) => 4 * Math.exp(-(v + 65) / 18);
  const ah = (v) => 0.07 * Math.exp(-(v + 65) / 20), bh = (v) => 1 / (1 + Math.exp(-(v + 35) / 10));
  const an = (v) => 0.01 * vtrap(v + 55, 10), bn = (v) => 0.125 * Math.exp(-(v + 65) / 80);
  let v = -65, m_ = am(v) / (am(v) + bm(v)), h = ah(v) / (ah(v) + bh(v)), n = an(v) / (an(v) + bn(v));
  const out = [], every = Math.round(0.05 / dt), steps = Math.round(duration / dt);
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    let stim = 0;
    for (const [start, len, amp] of pulses) if (t >= start && t < start + len) stim += amp;
    const na = gNa * m_ * m_ * m_ * h, k = gK * n * n * n * n;
    if (i % every === 0) out.push({ t, v, gNa: na, gK: k, stim });
    v += dt * (stim - na * (v - ENa) - k * (v - EK) - gL * (v - EL));
    m_ += dt * (am(v) * (1 - m_) - bm(v) * m_);
    h += dt * (ah(v) * (1 - h) - bh(v) * h);
    n += dt * (an(v) * (1 - n) - bn(v) * n);
  }
  return out;
}
function countSpikes(trace) {
  let count = 0, above = false;
  for (const p of trace) { if (!above && p.v > 0) { count++; above = true; } else if (above && p.v < -30) above = false; }
  return count;
}
// Share of a somatic EPSP that arrives from a dendritic compartment (Rall's model, as given in Luo, p. 111).
const ATTENUATION = { 1: 1, 4: 0.29, 8: 0.10 };
// Teaching arithmetic: sizes in mV are made up; only the attenuation shares come from the model above.
function integrate({ excit, inhib, where, timing }) {
  const overlap = timing === 'together' ? 1 : 0.35;      // spread-out inputs overlap less
  const dv = overlap * (excit * 4 * ATTENUATION[where] - inhib * 4);
  const vm = Math.max(-75, -65 + dv);
  return { vm, fires: vm >= -50 };
}
function synapseState(drug) {
  return {
    ap: true,
    calcium: drug !== 'cono',
    release: drug !== 'cono' && drug !== 'botox',
    response: drug === 'cono' || drug === 'botox' || drug === 'antagonist' ? 'none' : drug === 'reuptake' ? 'prolonged' : 'normal',
    cleared: drug !== 'reuptake',
  };
}
/*RULES-END*/

const N = {
  cell: 'neuron', kOut: 4, pNa: 0.05, amp: 15, drug: 'none', pulse2: 'off',
  axon: 'myelin', nt: 'glu', sdrug: 'none', excit: 2, inhib: 0, where: '1', timing: 'together',
  track: 'ok', brain: 'rest',
};
const CONTROLS = {
  drug: ['Channel blocker', [['none', 'None'], ['ttx', 'Tetrodotoxin (blocks Na⁺)'], ['tea', 'TEA (blocks K⁺)']]],
  pulse2: ['Second pulse', [['off', 'None'], ['early', '4 ms later'], ['middle', '15 ms later'], ['late', '20 ms later']]],
  axon: ['Axon', [['myelin', 'Myelinated'], ['bare', 'Unmyelinated'], ['demyel', 'Demyelinated patch']]],
  nt: ['Transmitter', [['glu', 'Glutamate (excites)'], ['gaba', 'GABA (usually inhibits)']]],
  sdrug: ['Interference', [['none', 'None'], ['botox', 'Botulinum toxin'], ['cono', 'ω-Conotoxin'], ['antagonist', 'Receptor blocker'], ['reuptake', 'Reuptake blocker']]],
  where: ['Where on the dendrite', [['1', 'At the cell body'], ['4', 'Middle'], ['8', 'Far out']]],
  timing: ['Timing', [['together', 'All together'], ['apart', 'Spread out']]],
  track: ['Microtubule tracks', [['ok', 'Intact'], ['broken', 'Disrupted']]],
  brain: ['Brain tissue', [['rest', 'At rest'], ['active', 'Working hard'], ['stroke', 'Blood supply cut off']]],
};
const seg = (name) => `<div><div class="eyebrow seg-label">${CONTROLS[name][0]}</div><div class="seg" role="group" aria-label="${CONTROLS[name][0]}">${CONTROLS[name][1].map(([v, t]) =>
  `<button type="button" class="btn${N[name] === v ? ' on' : ''}" data-nv="${name}" data-val="${v}" aria-pressed="${N[name] === v}">${t}</button>`).join('')}</div></div>`;
const slider = (name, label, min, max, step, unit) => `<label class="range"><span class="eyebrow">${label}: <b id="nv-${name}">${N[name]}</b> ${unit}</span><input type="range" id="nrange-${name}" data-nrange="${name}" min="${min}" max="${max}" step="${step}" value="${N[name]}"></label>`;
const row = (label, value, on) => `<li class="${on ? 'on' : ''}"><span>${label}</span><b>${value}</b></li>`;

const CELLS = [
  { id: 'neuron', name: 'Neuron', role: 'signals', c: 'dendrite', text: 'Gathers input on bushy <b>dendrites</b>, many studded with tiny spines. One long <b>axon</b> carries output to <b>presynaptic terminals</b>. In vertebrate neurons, information generally flows dendrite → cell body → axon.' },
  { id: 'astro', name: 'Astrocyte', role: 'support & regulation', c: 'astro', text: 'Star-shaped cells of gray matter. Their end-feet wrap blood vessels, and other processes reach connections between neurons. They help regulate communication and clear neurotransmitter.' },
  { id: 'oligo', name: 'Oligodendrocyte', role: 'myelin, brain & cord', c: 'myelin', text: 'Wraps <b>myelin</b> around axons in the central nervous system. One cell typically reaches out to several axons. Myelin is rich in lipid, which is why white matter looks white.' },
  { id: 'schwann', name: 'Schwann cell', role: 'myelin, nerves', c: 'schwann', text: 'Does the same job in the peripheral nervous system. A myelinating Schwann cell is usually dedicated to one segment of one axon. Others cradle several thin unmyelinated axons.' },
  { id: 'micro', name: 'Microglia', role: 'immune patrol', c: 'microglia', text: 'The resident immune cells. They engulf damaged cells and debris, and help remodel connections.' },
];

function lineChart(series, { yMin, yMax, xMax, ticks, label, extra = '' }) {
  const W = 360, H = 170, L = 34, R = 6, T = 8, Bm = 28;
  const X = (x) => L + x / xMax * (W - L - R), Y = (y) => T + (yMax - y) / (yMax - yMin) * (H - T - Bm);
  let g = '';
  ticks.forEach(t => { g += `<line x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}" class="grid-line"/><text x="${L - 4}" y="${Y(t) + 3}" text-anchor="end">${t}</text>`; });
  for (let x = 0; x <= xMax; x += 10) g += `<text x="${X(x)}" y="${H - 15}" text-anchor="middle">${x}</text>`;
  const paths = series.map(([pts, cls]) => `<path class="${cls}" d="M${pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(Math.max(yMin, Math.min(yMax, y))).toFixed(1)}`).join(' L')}"/>`).join('');
  return `<svg class="lq trace" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${g}<text x="${(L + W) / 2}" y="${H - 3}" text-anchor="middle">time (ms)</text>${paths}${extra}<line id="apCursor" class="cursor" x1="${L}" x2="${L}" y1="${T}" y2="${H - Bm}" data-l="${L}" data-w="${W - L - R}" data-x="${xMax}"/></svg>`;
}

const DUR = 30;
let apCache = null, apKey = '';
function currentTrace() {
  const key = [N.amp, N.drug, N.pulse2].join('|');
  if (key !== apKey) {
    apKey = key;
    const pulses = [[2, 0.5, N.amp]];
    if (N.pulse2 !== 'off') pulses.push([2 + { early: 4, middle: 15, late: 20 }[N.pulse2], 0.5, N.amp]);
    apCache = simulate({ pulses, gNaScale: N.drug === 'ttx' ? 0 : 1, gKScale: N.drug === 'tea' ? 0.05 : 1, duration: DUR });
    apCache.spikes = countSpikes(apCache);
    apCache.peak = Math.max(...apCache.map(p => p.v));
  }
  return apCache;
}

const READ = {
  neurons() { const c = CELLS.find(x => x.id === N.cell); return `<div class="org-card" style="--c:var(--${c.c})"><h3>${c.name} <span class="muted">· ${c.role}</span></h3><p>${c.text}</p></div>`; },
  rest() {
    const vm = ghk(N.kOut, N.pNa, 0.45), ek = nernst(N.kOut, IONS.K.in, 1), ena = nernst(IONS.Na.out, IONS.Na.in, 1), ecl = nernst(IONS.Cl.out, IONS.Cl.in, -1);
    const f = (x) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(0)} mV`;
    const note = N.kOut > 5.5 ? '<b>Raising potassium outside depolarises the cell.</b> This is one reason high blood potassium is dangerous for excitable cells, including heart muscle.' : N.pNa > 0.5 ? 'With high sodium permeability, the voltage swings towards the sodium equilibrium. That is the idea behind the action potential.' : 'At rest the membrane favours potassium, so the voltage sits fairly near the potassium equilibrium.';
    return `<div class="tally three"><div style="--c:var(--accent)"><b>${f(vm)}</b><small>membrane (GHK)</small></div><div style="--c:var(--potassium)"><b>${f(ek)}</b><small>E potassium</small></div><div style="--c:var(--sodium)"><b>${f(ena)}</b><small>E sodium</small></div></div><p class="muted">E chloride stays at ${f(ecl)}.</p><p>${note}</p>`;
  },
  spike() {
    const tr = currentTrace();
    const pts = tr.map(p => [p.t, p.v]), na = tr.map(p => [p.t, p.gNa]), k = tr.map(p => [p.t, p.gK]);
    let msg;
    if (N.drug === 'ttx') msg = 'With sodium channels blocked, there is <b>no action potential</b>, whatever the pulse size.';
    else if (N.drug === 'tea') msg = tr.spikes ? 'With potassium channels blocked, the spike <b>falls much more slowly</b>.' : 'This pulse is below threshold.';
    else if (!tr.spikes) msg = '<b>Below threshold.</b> The voltage rises a little and settles back.';
    else if (N.pulse2 === 'early' && tr.spikes === 1) msg = '<b>Refractory period.</b> The second pulse comes too soon: sodium channels have not recovered and potassium channels are still open.';
    else if (N.pulse2 === 'middle' && tr.spikes === 1) msg = '<b>Relative refractory period.</b> The cell is still recovering, so this pulse is now too weak. Raise the pulse strength to about 30 and the second spike appears.';
    else if (tr.spikes >= 2) msg = 'After enough recovery time, the second pulse fires a second action potential.';
    else msg = '<b>All or none.</b> Above threshold, a bigger pulse mainly makes the spike start sooner. Its height changes little.';
    return `<p><b>${tr.spikes} action potential${tr.spikes === 1 ? '' : 's'}</b> · peak ${tr.peak.toFixed(0)} mV</p>
      ${lineChart([[pts, 'vm']], { yMin: -90, yMax: 60, xMax: DUR, ticks: [-65, 0, 50], label: 'Simulated membrane voltage over time in millivolts' })}
      ${lineChart([[na, 'na'], [k, 'k']], { yMin: 0, yMax: 40, xMax: DUR, ticks: [0, 20, 40], label: 'Simulated sodium and potassium conductance over time' }).replace('id="apCursor"', 'id="apCursor2"')}
      <div class="lq-key"><span style="--c:var(--sodium)">Na⁺ conductance</span><span style="--c:var(--potassium)">K⁺ conductance (mS/cm²)</span></div><p>${msg}</p>`;
  },
  myelin() {
    return {
      myelin: '<p><b>Saltatory conduction.</b> Current spreads quickly under the myelin, and the spike is renewed only at the <b>nodes of Ranvier</b>, usually 0.2 to 2 mm apart. Speeds reach about <b>120 m/s</b>, and less pumping saves energy.</p>',
      bare: '<p><b>Continuous conduction.</b> Every patch of membrane has to fire in turn. In unmyelinated axons speeds are usually under <b>2 m/s</b>.</p>',
      demyel: '<p><b>A stripped segment leaks current.</b> The signal may slow, and may fail to reach the next excitable patch. This is shown here as a block.</p>',
    }[N.axon];
  },
  synapse() {
    const s = synapseState(N.sdrug), glu = N.nt === 'glu';
    const effect = s.response === 'none' ? 'none' : (glu ? 'depolarising (EPSP)' : 'usually hyperpolarising or shunting (IPSP)') + (s.response === 'prolonged' ? ', lasting longer' : '');
    const text = {
      none: glu ? 'Glutamate opens <b>AMPA</b> receptors, which pass Na⁺ and K⁺ with a reversal near 0 mV, so the net effect excites. <b>NMDA</b> receptors need glutamate and also enough depolarisation to clear a magnesium block, then let Ca²⁺ in.' : 'GABA opens <b>GABA-A</b> receptors, which are chloride channels. In mature neurons this usually opposes firing.',
      botox: '<b>Botulinum and tetanus toxins</b> cut SNARE proteins, so vesicles cannot fuse. Botulinum toxin A is also a medicine, for example for some eye-muscle misalignment.',
      cono: '<b>ω-Conotoxin</b>, from a marine snail, blocks the presynaptic calcium channels that release depends on.',
      antagonist: glu ? 'Transmitter is released, but blocked receptors cannot respond.' : 'Transmitter is released, but blocked receptors cannot respond. The plant toxin <b>picrotoxin</b> blocks GABA-A receptors.',
      reuptake: 'Transporters on the terminal and nearby astrocytes normally clear transmitter. Blocking reuptake keeps it in the cleft longer. Many antidepressants block serotonin reuptake at serotonin synapses.',
    }[N.sdrug];
    return `<ol class="chain">${row('Action potential arrives', 'yes', true)}${row('Ca²⁺ enters', s.calcium ? 'yes' : 'blocked', s.calcium)}${row('Vesicles fuse and release', s.release ? 'yes' : 'no', s.release)}${row('Receiving cell', effect, s.response !== 'none')}</ol><p>${text}</p>`;
  },
  integrate() {
    const r = integrate({ excit: +N.excit, inhib: +N.inhib, where: N.where, timing: N.timing });
    return `<div class="tally three"><div style="--c:var(--accent)"><b>${r.vm.toFixed(0)} mV</b><small>at the trigger zone</small></div><div style="--c:var(--fg)"><b>${Math.round(ATTENUATION[N.where] * 100)}%</b><small>of an input arrives</small></div><div style="--c:var(--${r.fires ? 'nadh' : 'carbon'})"><b>${r.fires ? 'fires' : 'quiet'}</b><small>threshold −50</small></div></div><p>${r.fires ? 'Together the inputs cross threshold at the <b>axon initial segment</b>.' : 'Not enough to reach threshold. Try more excitation, inputs closer to the cell body, or inputs arriving together.'}</p>`;
  },
  axon() {
    return N.track === 'ok'
      ? '<p><b>Kinesins</b> mostly carry cargo toward the axon terminal (anterograde). <b>Dynein</b> carries cargo back to the cell body (retrograde). Both walk on microtubules and spend ATP.</p>'
      : '<p><b>With the tracks disrupted, cargo stalls.</b> The far end of a long axon depends on this delivery. Some drugs that act on microtubules, including some chemotherapy agents, can injure peripheral nerves.</p>';
  },
  brain() {
    return {
      rest: '<p>Glucose crosses the blood–brain barrier through <b>GLUT1</b> and enters neurons mainly through <b>GLUT3</b>. Neither waits for <a href="#receptor">insulin</a> the way GLUT4 does.</p>',
      active: '<p>Active tissue uses more oxygen, but <b>blood flow rises even more</b>. That leaves less deoxygenated haemoglobin in the area. Deoxyhaemoglobin disturbs the MRI signal, so the signal there goes <b>up</b>: the basis of <b>BOLD</b> functional MRI, an indirect measure of activity.</p>',
      stroke: '<p>Without blood, ATP runs short and the <a href="#rest">sodium pumps</a> stall. Ions and water shift into cells, which swell. Water movement becomes restricted, so the area is typically <b>bright on diffusion-weighted MRI</b> and <b>dark on the ADC map</b>.</p>',
    }[N.brain];
  },
};

let current = 'neurons', onChange = () => {};
function renderRead() { const el = $('#nRead'); if (el) el.innerHTML = READ[current](); }
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-ncell]');
  if (c) { N.cell = c.dataset.ncell; document.querySelectorAll('[data-ncell]').forEach(b => b.classList.toggle('on', b.dataset.ncell === N.cell)); renderRead(); onChange('cell'); return; }
  const b = e.target.closest('[data-nv]');
  if (b) {
    const name = b.dataset.nv; N[name] = b.dataset.val;
    document.querySelectorAll(`[data-nv="${name}"]`).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    renderRead(); onChange(name); return;
  }
  if (e.target.closest('[data-nact="replay"]')) onChange('replay');
});
document.addEventListener('input', (e) => {
  const r = e.target.closest && e.target.closest('[data-nrange]'); if (!r) return;
  const name = r.dataset.nrange; N[name] = +r.value;
  const out = $('#nv-' + name); if (out) out.textContent = r.value;
  renderRead(); onChange(name);
});

const panel = (id, inner) => { current = id; return `<div class="lab">${inner}<div class="readout" id="nRead" aria-live="polite">${READ[id]()}</div></div>`; };
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, extra = '') => `<p class="credit">Sources: ${items.join(' · ')}. ${extra}</p>`;
const luo = (pages) => `L. Luo, <i>Principles of Neurobiology</i> (Garland Science, 2016), ${pages}`;
const SRC = {
  eanm: link('https://doi.org/10.1007/s00259-014-2961-x', 'EANM FDG PET/CT guideline (2015)'),
  energy: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC3389300', 'brain energy review'),
  anls: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC5792606', 'brain lactate research'),
  adc: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC2772048/', 'ADC time course in stroke'),
  dwi: link('https://radiopaedia.org/articles/diffusion-weighted-mri-in-acute-stroke-2', 'Radiopaedia, DWI in acute stroke'),
  ms: link('https://my.clevelandclinic.org/departments/neurological/depts/multiple-sclerosis/ms-approaches/diagnosing-ms-using-the-2024-mcdonald-criteria', '2024 McDonald criteria overview'),
  mcd: link('https://doi.org/10.1016/S1474-4422(25)00270-4', 'Montalban et al. 2025, McDonald criteria 2024 revision'),
  msrad: link('https://doi.org/10.2214/AJR.25.33997', 'Rai et al. 2026, the 2024 update for radiologists'),
  cdcstroke: link('https://www.cdc.gov/stroke/signs-symptoms/index.html', 'CDC, stroke signs and symptoms'),
  dwineg: link('https://doi.org/10.1212/WNL.0000000000004120', 'Edlow et al. 2017, DWI-negative stroke'),
  ions: link('https://doi.org/10.1016/j.jstrokecerebrovasdis.2017.09.011', 'Hu and Song 2017, ion balance in ischaemic stroke'),
};

const CHAPTERS = [
  {
    id: 'neurons', short: 'Cells', where: 'Neurons and their partners',
    title: 'Neurons and glia',
    legend: [['dendrite', 'Dendrites'], ['axonc', 'Axon'], ['myelin', 'Myelin (oligodendrocyte)'], ['astro', 'Astrocyte'], ['microglia', 'Microglia'], ['schwann', 'Schwann cell'], ['rbc', 'Blood vessel']],
    html: () => `
      <p class="lede">If the body is full of cell cities, the nervous system is their communications network. It has two broad kinds of cell: <b>neurons</b>, which signal, and <b>glia</b>, which support, insulate, protect and help tune those signals.</p>
      <div class="orgs">${CELLS.map(c => `<button class="org${N.cell === c.id ? ' on' : ''}" type="button" data-ncell="${c.id}" style="--c:var(--${c.c})"><i></i><span><b>${c.name}</b><small>${c.role}</small></span></button>`).join('')}</div>
      ${panel('neurons', '')}
      <ul class="facts">
        <li><b>The neuron doctrine:</b> neurons are separate cells that meet at junctions, not one continuous net. Golgi’s silver stain first showed whole neurons, and Ramón y Cajal used it to make the case. They shared the 1906 Nobel Prize while disagreeing about this.</li>
        <li>Sherrington later named those junctions <b>synapses</b>.</li>
        <li><b>Gray matter</b> is rich in cell bodies, dendrites and synapses. <b>White matter</b> is rich in myelinated axons.</li>
      </ul>
      ${sources([luo('pp. 7–9')], 'The 3D cells are schematic. Real shapes vary enormously, axons can be very long, and the cells are packed far more tightly.')}`,
  },
  {
    id: 'rest', short: 'Rest', where: 'A patch of neuron membrane',
    title: 'A charged battery at rest',
    legend: [['potassium', 'K⁺'], ['sodium', 'Na⁺'], ['chloride', 'Cl⁻'], ['pump', 'Na⁺/K⁺ pump'], ['atp', 'ATP']],
    html: () => `
      <p class="lede">A resting neuron is negative inside. Ions are unevenly spread across its membrane, and at rest the membrane lets potassium through much more easily than sodium.</p>
      ${panel('rest', slider('kOut', 'Potassium outside', 2.5, 12, 0.5, 'mM') + slider('pNa', 'Sodium permeability compared with potassium', 0.01, 5, 0.01, ''))}
      <div class="table-wrap"><table class="ledger wrap"><thead><tr><th>Typical mammalian neuron (mM)</th><th>Outside</th><th>Inside</th></tr></thead><tbody><tr><td>K⁺</td><td>4</td><td>120</td></tr><tr><td>Na⁺</td><td>150</td><td>15</td></tr><tr><td>Cl⁻</td><td>120</td><td>5</td></tr></tbody></table></div>
      <div class="eq wrapeq">Nernst: E = (RT / zF) × ln( outside / inside )</div>
      <ul class="facts">
        <li>The <b>Nernst equation</b> gives the voltage at which one ion has no net flow. The <b>Goldman–Hodgkin–Katz</b> equation combines several ions, weighted by permeability.</li>
        <li>The <b>Na⁺/K⁺ pump</b> uses ATP to move 3 Na⁺ out and 2 K⁺ in. It maintains the gradients that leaks would run down. It is a major reason neurons need so much <a href="#tally">ATP</a>.</li>
      </ul>
      ${sources([luo('pp. 39–40')], 'Values use RT/F = 25 mV (about room temperature). At body temperature voltages are a few percent larger. The chloride permeability is fixed at 0.45 of potassium, an illustrative value.')}`,
  },
  {
    id: 'spike', short: 'Spike', where: 'A simulated squid giant axon',
    title: 'The action potential, simulated',
    legend: [['sodium', 'Na⁺ & Na⁺ channel'], ['potassium', 'K⁺ & K⁺ channel'], ['gate', 'Blocked or inactivated']],
    html: () => `
      <p class="lede">Push the voltage past a threshold and sodium channels snap open. Moments later they inactivate while potassium channels open. The result is a brief spike. This chapter solves the <b>Hodgkin–Huxley</b> equations live.</p>
      ${panel('spike', slider('amp', 'Pulse strength (0.5 ms)', 0, 60, 1, 'µA/cm²') + seg('drug') + seg('pulse2') + '<button class="btn primary" type="button" data-nact="replay">Replay</button>')}
      <ul class="facts">
        <li><b>Rising phase:</b> depolarisation opens voltage-gated Na⁺ channels, Na⁺ flows in, and that opens still more.</li>
        <li><b>Falling phase:</b> Na⁺ channels <b>inactivate</b> and the slower K⁺ channels open.</li>
        <li>The <b>refractory period</b> helps keep a spike travelling one way down the axon. At first no pulse will work (absolute). For a while after, only a stronger one will (relative).</li>
        <li>In most projection neurons, spikes start at the <b>axon initial segment</b>, where sodium channels are densest. Information is carried by how often and when spikes occur.</li>
        <li><b>Tetrodotoxin</b>, found in pufferfish, blocks voltage-gated sodium channels. Local anaesthetics also act on sodium channels.</li>
      </ul>
      ${sources([luo('pp. 51, 53 and 77')], 'The model uses the classic squid axon constants (6.3 °C). It shows the principles; human neurons differ in channel types, temperature and timing. Blockers are modelled simply as reduced conductance.')}`,
  },
  {
    id: 'myelin', short: 'Myelin', where: 'Along the axon',
    title: 'Insulation and speed',
    legend: [['axonc', 'Axon'], ['myelin', 'Myelin'], ['sodium', 'Active membrane']],
    html: () => `
      <p class="lede">A spike has to be renewed as it travels. Wider axons conduct faster, and wrapping them in many layers of glial membrane speeds them up far more.</p>
      ${panel('myelin', seg('axon'))}
      <ul class="facts">
        <li>Myelin raises the membrane’s resistance and lowers its capacitance, so current spreads farther and charges the next patch quickly.</li>
        <li><b>Oligodendrocytes</b> make it in the brain and spinal cord, <b>Schwann cells</b> in peripheral nerves.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link: multiple sclerosis</span><p>MS involves inflammatory demyelination in the central nervous system. On MRI, <b>T2/FLAIR-bright</b> lesions in typical places, such as around the ventricles, next to or in the cortex, in the brainstem or cerebellum, and in the spinal cord, help show <b>spread in space</b>. The 2024 McDonald criteria added the optic nerve as a fifth location. <b>Gadolinium enhancement</b> has helped show <b>spread in time</b>. The 2024 revision also recognises another spinal fluid marker (kappa free light chains) that can substitute for it, and adds optional MRI signs: the central vein sign and paramagnetic rim lesions. A bright spot is not specific: it can reflect oedema, inflammation, demyelination, gliosis or axon loss, and has many other causes. Diagnosis needs the full clinical picture.</p></div>
      ${sources([luo('pp. 53–55'), SRC.ms, SRC.mcd, SRC.msrad], 'Playback speeds are illustrative and the difference is understated.')}`,
  },
  {
    id: 'synapse', short: 'Synapse', where: 'A chemical synapse · gap about 20 nm',
    title: 'Crossing the gap',
    legend: [['glu', 'Glutamate'], ['gaba', 'GABA'], ['calcium', 'Ca²⁺'], ['fix', 'Receptors'], ['rnapol', 'SNAREs & transporters']],
    html: () => `
      <p class="lede">At most synapses the electrical signal stops and a chemical one takes over. A spike lets calcium into the terminal, vesicles fuse, and transmitter crosses a tiny gap.</p>
      ${panel('synapse', seg('nt') + seg('sdrug') + '<button class="btn primary" type="button" data-nact="replay">Send a spike</button>')}
      <ul class="facts">
        <li>The order is: spike → depolarised terminal → <b>voltage-gated Ca²⁺ channels</b> open → vesicles fuse → transmitter release.</li>
        <li><b>SNARE proteins</b> drive fusion, much as in <a href="#export">insulin release</a>. A calcium sensor called <b>synaptotagmin</b> triggers it.</li>
        <li><b>Ionotropic</b> receptors are channels and act quickly. <b>Metabotropic</b> receptors work through G proteins and act more slowly.</li>
        <li><b>Curare</b> and the snake toxin α-bungarotoxin block the acetylcholine receptor where nerve meets muscle.</li>
        <li>Some synapses are <b>electrical</b>, passing current directly through gap junctions.</li>
      </ul>
      ${sources([luo('pp. 75, 77, 93 and 96')], 'Simplified. Not a guide to any drug’s effects or use.')}`,
  },
  {
    id: 'integrate', short: 'Sum', where: 'One neuron adding up its inputs',
    title: 'Thousands of voices, one decision',
    legend: [['nadh', 'Excitatory input'], ['gate', 'Inhibitory input'], ['dendrite', 'Dendrite'], ['axonc', 'Axon']],
    html: () => `
      <p class="lede">A neuron in the central nervous system typically receives thousands of inputs. One excitatory input is usually too small to make it fire, so it adds them up.</p>
      ${panel('integrate', slider('excit', 'Excitatory inputs', 0, 12, 1, '') + slider('inhib', 'Inhibitory inputs', 0, 6, 1, '') + seg('where') + seg('timing') + '<button class="btn primary" type="button" data-nact="replay">Send the inputs</button>')}
      <ul class="facts">
        <li><b>Spatial summation:</b> inputs at different places add together. <b>Temporal summation:</b> inputs close together in time build on each other.</li>
        <li>Signals fade as they travel along a dendrite. In a classic model, the same input arrives at 29% from a middle compartment and 10% from a far one, compared with one at the cell body.</li>
        <li>Real dendrites also have active channels that can boost or reshape inputs.</li>
      </ul>
      ${sources([luo('p. 111')], 'The attenuation percentages are from the cited model. The voltage per input, the effect of timing and the simple addition are made up for teaching.')}`,
  },
  {
    id: 'axon', short: 'Transport', where: 'Inside an axon',
    title: 'The longest supply lines in the body',
    legend: [['spindle', 'Microtubule'], ['kinesin', 'Kinesin → terminal'], ['dynein', 'Dynein → cell body'], ['insulin', 'Vesicle cargo'], ['mito', 'Mitochondrion']],
    html: () => `
      <p class="lede">Many neuronal proteins are made in the cell body, yet some axons are very long. Motor proteins haul cargo along internal tracks. Some proteins are also made locally in dendrites and axons.</p>
      ${panel('axon', seg('track'))}
      <ul class="facts">
        <li><b>Fast transport</b> moves about <b>50–400 mm a day</b>, mostly membrane and secreted proteins. <b>Slow transport</b> moves about <b>0.2–8 mm a day</b>, mostly proteins of the cytosol and cytoskeleton.</li>
        <li><b>Microtubules</b> are hollow tubes about 25 nm wide, usually built from 13 protofilaments. <b>Neurofilaments</b> help keep axons stable.</li>
        <li>Diffusion alone is far too slow for this job.</li>
      </ul>
      ${sources([luo('pp. 31–32')], 'The 3D motors are schematic and not to scale; speeds are compressed.')}`,
  },
  {
    id: 'brain', short: 'Imaging', where: 'Brain fuel supply · radiology',
    title: 'A hungry organ, seen on scans',
    legend: [['rbc', 'Capillary & red cells'], ['astro', 'Astrocyte'], ['dendrite', 'Neuron'], ['glucose', 'Glucose'], ['electron', 'O₂']],
    html: () => `
      <p class="lede">The brain is about 2% of body weight but uses about 20% of the body’s resting energy. It depends on a steady supply of glucose and oxygen, which is why it features so strongly in imaging.</p>
      ${panel('brain', seg('brain'))}
      <h3>FDG-PET</h3>
      <p>Because the brain takes up so much glucose, it is normally very bright on <a href="#petprep">FDG-PET</a>. The EANM tumour guideline puts brain uptake at about 7% of the injected activity. Brain PET looks for regions that take up less or more than expected.</p>
      <h3>Stroke on diffusion MRI</h3>
      <ul class="facts">
        <li>Diffusion-weighted imaging is <b>more sensitive early</b> than CT or ordinary T2 MRI. Ordinary sequences may show nothing for the first hours.</li>
        <li><b>ADC</b> falls early, with the greatest drop reported around days 1–4, then returns through normal (<b>pseudonormalisation</b>) at roughly one to two weeks. Timing varies between patients and studies.</li>
        <li>A normal DWI does not rule out stroke: some early, small or brainstem and cerebellar strokes are missed. A pooled analysis found about <b>7%</b> of acute ischaemic strokes were DWI-negative, with higher odds in the <b>posterior circulation</b>.</li>
        <li>Early CT signs can include darker tissue, loss of the gray–white boundary and effaced sulci.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Emergency</span><p>Remember <b>BE FAST</b>: <b>B</b>alance lost, <b>E</b>yesight trouble, <b>F</b>ace drooping, <b>A</b>rm weakness, <b>S</b>peech difficulty, <b>T</b>ime to call. Sudden numbness or weakness (especially on one side), confusion, or a severe headache with no known cause also count. <b>Call 911 or your local emergency number right away.</b> Do not drive yourself to hospital or have someone else drive you. If symptoms go away, it may have been a mini-stroke (TIA): tell a health care team right away. Treatment depends on time.</p></div>
      <p class="muted">Do neurons run on lactate handed over by astrocytes? This “astrocyte–neuron lactate shuttle” is still debated, so it is not shown.</p>
      ${sources([SRC.energy, SRC.eanm, SRC.dwi, SRC.dwineg, SRC.adc, SRC.ions, SRC.cdcstroke, SRC.anls], 'The 3D tissue is schematic and is not a scan. For learning, not diagnosis.')}`,
  },
];

CellCity.register('neural', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, disposeObj, travel, every, clearAgents, addLabel } = g;
    const P = {};
    ['dendrite', 'axonc', 'myelin', 'astro', 'microglia', 'schwann', 'sodium', 'potassium', 'chloride', 'pump', 'calcium', 'glu', 'gaba', 'fix', 'rnapol', 'gate', 'kinesin', 'dynein', 'rbc', 'spindle', 'insulin', 'nadh'].forEach(k => P[k] = col(k));
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: color.clone(), emissive: color.clone(), emissiveIntensity: 0.22, roughness: 0.55 }, extra));
    const randDir = () => new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
    const v = (a) => (Array.isArray(a) ? new V3(...a) : a);
    const mesh = (geo, mat, parent, pos, scale) => { const o = new THREE.Mesh(geo, mat); if (pos) o.position.copy(v(pos)); if (scale !== undefined) (Array.isArray(scale) ? o.scale.set(...scale) : o.scale.setScalar(scale)); parent.add(o); return o; };
    function dot(color, r, glowSize = 0) { const o = new THREE.Group(); mesh(atomGeo, atomMat(color), o, null, r); if (glowSize) o.add(glow(color, glowSize)); return o; }
    const fly = (parent, color, r, pts, dur, opts = {}) => travel(parent, dot(color, r, r * 3.4), pts.map(v), dur, Object.assign({ shrinkEnd: true, ease: ease.lin }, opts));
    const stick = new THREE.CylinderGeometry(1, 1, 1, 10);
    function setStick(o, a, b, r) { const d = b.clone().sub(a), len = d.length(); o.position.copy(a).add(b).multiplyScalar(0.5); o.scale.set(r, Math.max(0.001, len), r); if (len > 1e-4) o.quaternion.setFromUnitVectors(UP, d.normalize()); }
    const tube = (parent, pts, r, mat, seg_ = 40) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v)), seg_, r, 10, false), mat, parent);
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const timers = new Map();
    function due(key, period, t) { if (t < (timers.get(key) || 0)) return false; timers.set(key, t + period); return true; }
    function later(sec, fn) { const at = now + sec; every(t => { if (t < at) return true; fn(); return false; }); }
    function say(parent, text, color, at, dur = 2.6, size = 1.2) {
      const sp = textSprite(text, color, size); sp.position.copy(v(at)); sp.material.depthTest = false; sp.renderOrder = 5; parent.add(sp);
      const t0 = now;
      every(t => { const u = (t - t0) / dur; sp.material.opacity = u < 0.75 ? 1 : Math.max(0, (1 - u) / 0.25); if (u >= 1) { disposeObj(sp); return false; } return true; }, sp);
    }
    function lumpy(r, amp, seed) {
      const geo = new THREE.SphereGeometry(r, 36, 28), p = geo.attributes.position, q = new V3();
      for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i); q.multiplyScalar(1 + amp * (Math.sin(q.x * 3.7 / r + seed) * Math.cos(q.y * 4.1 / r + seed * 2) + 0.6 * Math.sin(q.z * 5.3 / r + seed * 3))); p.setXYZ(i, q.x, q.y, q.z); }
      geo.computeVertexNormals(); return geo;
    }
    function branch(parent, start, dir, len, r, depth, mat, spines) {
      const end = start.clone().add(dir.clone().multiplyScalar(len));
      const mid = start.clone().lerp(end, 0.5).add(randDir().multiplyScalar(len * 0.14));
      tube(parent, [start, mid, end], r, mat, 12);
      if (spines) for (let i = 0; i < 3; i++) { const p = start.clone().lerp(end, rnd()); const d = randDir(); d.z *= 0.4; mesh(atomGeo, mat, parent, p.add(d.multiplyScalar(r + 0.22)), 0.17); }
      if (depth > 0) for (let k = 0; k < 2; k++) {
        const d = dir.clone().add(new V3(rr(-0.7, 0.7), rr(-0.7, 0.7), rr(-0.35, 0.35))).normalize();
        branch(parent, end, d, len * 0.74, r * 0.68, depth - 1, mat, spines);
      }
    }

    /* ================= 1. NEURONS AND GLIA ================= */
    const gCells = new THREE.Group(); scene.add(gCells);
    const kinds = {};
    const part = (id) => { const o = new THREE.Group(); gCells.add(o); kinds[id] = { o, mats: [] }; return o; };
    const mk = (id, color, extra) => { const m_ = std(color, extra); kinds[id].mats.push(m_); return m_; };
    const AXON = [[-9, 2, 0], [-4, 0.5, 0], [2, 1.2, 0], [8, 0, 0], [14, 0.4, 0], [19, 1.6, 0]];
    {
      const nr = part('neuron');
      const dm = mk('neuron', P.dendrite), am = mk('neuron', P.axonc);
      mesh(lumpy(2.7, 0.08, 3), dm, nr, [-11, 2.4, 0]);
      mesh(atomGeo, std(new THREE.Color(0x6d4bd0)), nr, [-11.2, 2.6, 1.9], 1.1);
      [[-0.5, 1, 0], [-1, 0.35, 0.2], [-0.9, -0.7, -0.2], [0.1, 1, -0.2], [-0.3, -1, 0.1]].forEach(d => { const dir = new V3(...d).normalize(); branch(nr, new V3(-11, 2.4, 0).add(dir.clone().multiplyScalar(2)), dir, 4.2, 0.55, 2, dm, true); });
      tube(nr, AXON, 0.34, am, 120);
      [[23, 4.6, 0.5], [24, 0.6, -0.6], [22.5, -2.2, 0.8]].forEach(p => { tube(nr, [AXON[5], [21.5, (1.6 + p[1]) / 2, 0], p], 0.2, am, 16); mesh(atomGeo, am, nr, p, 0.65); });
      const ol = part('oligo');
      const om = mk('oligo', P.myelin);
      const curve = new THREE.CatmullRomCurve3(AXON.map(v));
      const sheaths = [0.17, 0.36, 0.55, 0.74].map(u => {
        const p = curve.getPointAt(u), tan = curve.getTangentAt(u);
        const s = mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.1, 20), om, ol, p); s.quaternion.setFromUnitVectors(UP, tan); return p;
      });
      const body = new V3(4, -6.4, -0.5);
      mesh(lumpy(1.5, 0.06, 5), om, ol, body);
      [1, 2, 3].forEach(i => tube(ol, [body, body.clone().lerp(sheaths[i], 0.5).add(new V3(0, -0.5, 1)), sheaths[i].clone().add(new V3(0, -0.9, 0))], 0.18, om, 16));
      const as = part('astro');
      const asm = mk('astro', P.astro);
      const ab = new V3(-1, 9.4, -1);
      mesh(lumpy(1.8, 0.12, 8), asm, as, ab);
      [[-1, 0.5, 0], [-0.7, -0.8, 0.2], [0.3, 1, 0], [-0.2, -1, -0.3], [-1, -0.2, 0.2]].forEach(d => branch(as, ab, new V3(...d).normalize(), 3.4, 0.32, 1, asm, false));
      const vessel = [[3, 14.5, -2], [9, 10, -2], [15, 9.4, -2], [24, 12, -2]];
      tube(as, vessel, 1.25, new THREE.MeshStandardMaterial({ color: P.rbc, transparent: true, opacity: 0.45, depthWrite: false }), 60);
      tube(as, [ab, [3, 8.6, -0.5], [8, 11, -1.4]], 0.34, asm, 20);
      mesh(atomGeo, asm, as, [8.4, 10.8, -1.6], [1.3, 0.55, 0.9]);
      addLabel('Blood vessel', 'rbc', gCells, new V3(18, 12.4, -2), ['neurons']);
      const mi = part('micro');
      const mm = mk('micro', P.microglia);
      const mb = new V3(15, -7, 0);
      mesh(lumpy(1.25, 0.16, 2), mm, mi, mb, [1.3, 0.9, 1]);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; branch(mi, mb, new V3(Math.cos(a), Math.sin(a) * 0.8, rr(-0.2, 0.2)).normalize(), 1.9, 0.17, 1, mm, false); }
      const sc = part('schwann');
      const sm = mk('schwann', P.schwann), thin = std(P.axonc);
      tube(sc, [[-16, -11, 0], [-9, -10.4, 0], [-1, -11.2, 0], [6, -10.8, 0]], 0.3, thin, 60);
      [-13, -7.2, -1.4].forEach((x, i) => { const y = [-10.8, -10.5, -11.2][i]; const s = mesh(new THREE.CylinderGeometry(1, 1, 4.6, 20), sm, sc, [x, y, 0]); s.rotation.z = Math.PI / 2; mesh(atomGeo, sm, sc, [x, y + 1.15, 0], [1.1, 0.55, 0.8]); });
      addLabel('Neuron', 'dendrite', kinds.neuron.o, new V3(-12, -3.2, 0), ['neurons']);
      addLabel('Axon', 'axonc', kinds.neuron.o, new V3(19.5, 3.6, 0), ['neurons']);
      addLabel('Oligodendrocyte', 'myelin', kinds.oligo.o, new V3(4, -8.8, 0), ['neurons']);
      addLabel('Astrocyte', 'astro', kinds.astro.o, new V3(-1, 12.4, 0), ['neurons']);
      addLabel('Microglia', 'microglia', kinds.micro.o, new V3(15, -11.2, 0), ['neurons']);
      addLabel('Schwann cells (peripheral nerve)', 'schwann', kinds.schwann.o, new V3(-5, -13.8, 0), ['neurons']);
    }
    function cellsTick(t, dt) {
      Object.entries(kinds).forEach(([id, k]) => k.mats.forEach(m_ => { const want = id === N.cell ? 0.62 + Math.sin(t * 3) * 0.14 : 0.1; m_.emissiveIntensity += (want - m_.emissiveIntensity) * Math.min(1, dt * 5); }));
      if (due('cells-spike', 2.4, t)) fly(gCells, C.electron, 0.55, AXON.map(p => [p[0], p[1], 1.2]), 1.6, { shrinkEnd: false });
    }

    /* ================= membrane helper ================= */
    function membrane(parent, y, x0, x1, gaps = [], depth = 3.2) {
      const heads = [];
      for (let x = x0; x <= x1; x += 0.65) for (let z = -depth; z <= depth; z += 0.65) if (!gaps.some(gx => Math.hypot(x - gx, z) < 1.7)) heads.push([x, z]);
      const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8f6d55, emissive: 0x2a1a10, roughness: 0.8 }), heads.length * 2);
      const m4 = new THREE.Matrix4(); let k = 0;
      heads.forEach(([x, z]) => [0.75, -0.75].forEach(dy => { m4.makeTranslation(x, y + dy, z); im.setMatrixAt(k++, m4); }));
      parent.add(im);
    }
    function channel(parent, x, y, color) {
      const root = new THREE.Group(); root.position.set(x, y, 0); parent.add(root);
      const mat = std(color, { emissiveIntensity: 0.3 });
      const halves = [-1, 1].map(s => mesh(new THREE.CapsuleGeometry(0.55, 2.2, 6, 14), mat, root, [s * 0.75, 0, 0]));
      const plug = mesh(atomGeo, std(P.gate, { emissiveIntensity: 0.8 }), root, [0, -0.2, 0.5], 0.001);
      return {
        root, open: 0,
        set(open, blocked, dt) {
          this.open += (open - this.open) * Math.min(1, dt * 8);
          halves.forEach((h, i) => { h.position.x = (i ? 1 : -1) * (0.55 + this.open * 0.5); });
          plug.scale.setScalar(blocked ? 0.75 : 0.001);
        },
      };
    }
    const scatter = (parent, color, n, r, x0, x1, y0, y1) => { for (let i = 0; i < n; i++) mesh(atomGeo, atomMat(color), parent, [rr(x0, x1), rr(y0, y1), rr(-3, 3)], r); };

    /* ================= 2. RESTING POTENTIAL ================= */
    const gRest = new THREE.Group(); scene.add(gRest);
    membrane(gRest, 0, -19, 19, [-11, -1, 11]);
    const restK = channel(gRest, -11, 0, P.potassium), restNa = channel(gRest, -1, 0, P.sodium);
    const pumpBody = mesh(lumpy(2.1, 0.08, 4), std(P.pump), gRest, [11, 0, 0], [1, 1.35, 1]);
    scatter(gRest, P.sodium, 34, 0.38, -18, 18, 2.6, 10);
    scatter(gRest, P.chloride, 28, 0.38, -18, 18, 2.6, 10);
    scatter(gRest, P.potassium, 30, 0.38, -18, 18, -10, -2.6);
    scatter(gRest, P.sodium, 4, 0.38, -18, 18, -10, -2.6);
    const extraK = Array.from({ length: 22 }, () => mesh(atomGeo, atomMat(P.potassium), gRest, [rr(-18, 18), rr(2.6, 10), rr(-3, 3)], 0.38));
    const vmTag = addLabel('Inside', 'electron', gRest, new V3(0, -12.2, 0), ['rest']);
    addLabel('Outside: much Na⁺ and Cl⁻', 'sodium', gRest, new V3(0, 12, 0), ['rest']);
    addLabel('K⁺ channel', 'potassium', gRest, new V3(-11, 3.8, 3), ['rest']);
    addLabel('Na⁺ channel', 'sodium', gRest, new V3(-1, -3.8, 3), ['rest']);
    addLabel('Na⁺/K⁺ pump', 'pump', gRest, new V3(11.5, 4.4, 3), ['rest']);
    function restTick(t, dt) {
      const naOpen = clamp(Math.log10(N.pNa / 0.01) / 2.7);
      restK.set(0.75, false, dt); restNa.set(naOpen, false, dt);
      const shown = Math.round((N.kOut - 2.5) / 9.5 * 22);
      extraK.forEach((o, i) => { o.visible = i < shown; });
      const vm = ghk(N.kOut, N.pNa, 0.45);
      vmTag.el.querySelector('span').textContent = `Inside: ${vm.toFixed(0)} mV compared with outside`;
      if (due('rest-k', 0.45, t)) fly(gRest, P.potassium, 0.4, [[-11 + rr(-2, 2), -6, 1], [-11, 0, 0.8], [-11 + rr(-3, 3), 6, 1]], 1.8);
      if (due('rest-na', 1 / (0.15 + naOpen * 4), t)) fly(gRest, P.sodium, 0.4, [[-1 + rr(-2, 2), 6, 1], [-1, 0, 0.8], [-1 + rr(-3, 3), -6, 1]], 1.6);
      pumpBody.scale.set(1 + Math.sin(t * 3) * 0.07, 1.35 - Math.sin(t * 3) * 0.07, 1);
      if (due('rest-pump', 2.2, t)) {
        for (let i = 0; i < 3; i++) fly(gRest, P.sodium, 0.4, [[9 + i, -6, 2.4], [11, 0, 2.6], [12 + i * 1.4, 6.5, 2]], 1.9, { delay: i * 0.12 });
        for (let i = 0; i < 2; i++) fly(gRest, P.potassium, 0.4, [[12 + i * 1.5, 6, 2.4], [11, 0, 2.6], [8 + i, -6.5, 2]], 1.9, { delay: 0.5 + i * 0.12 });
        fly(gRest, C.atp, 0.5, [[17, -7, 3], [12.5, -2.4, 2.6]], 1.2);
      }
    }

    /* ================= 3. ACTION POTENTIAL ================= */
    const gSpike = new THREE.Group(); scene.add(gSpike);
    membrane(gSpike, 0, -18, 18, [-11, -4, 4, 11]);
    const naCh = [-11, -4].map(x => channel(gSpike, x, 0, P.sodium)), kCh = [4, 11].map(x => channel(gSpike, x, 0, P.potassium));
    const spikeSheet = mesh(new THREE.BoxGeometry(37, 1.4, 6.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), gSpike);
    scatter(gSpike, P.sodium, 30, 0.34, -17, 17, 3, 9.5);
    scatter(gSpike, P.potassium, 30, 0.34, -17, 17, -9.5, -3);
    addLabel('Na⁺ channels', 'sodium', gSpike, new V3(-7.5, 4.4, 3), ['spike']);
    addLabel('K⁺ channels', 'potassium', gSpike, new V3(7.5, 4.4, 3), ['spike']);
    const spikeTag = addLabel('-65 mV', 'electron', gSpike, new V3(0, -11.8, 0), ['spike']);
    const sp = { t0: 0 };
    function spikeTick(t, dt) {
      const tr = currentTrace();
      const sim = reduceMotion ? 3 : ((t - sp.t0) * 3.2) % (DUR + 5);      // 1 s on screen ≈ 3.2 ms
      const p = tr[Math.max(0, Math.min(tr.length - 1, Math.round(Math.min(sim, DUR) / 0.05)))];
      const na = clamp(p.gNa / 22), k = clamp((p.gK - 0.5) / 14);
      naCh.forEach(c => c.set(na, N.drug === 'ttx', dt * 3));
      kCh.forEach(c => c.set(k, N.drug === 'tea', dt * 3));
      spikeSheet.material.opacity = clamp((p.v + 65) / 110) * 0.28;
      spikeTag.el.querySelector('span').textContent = `${p.v.toFixed(0)} mV at ${Math.min(sim, DUR).toFixed(0)} ms${p.stim ? ' · pulse' : ''}`;
      if (na > 0.12 && due('sp-na', 0.06 / na, t)) { const x = rnd() < 0.5 ? -11 : -4; fly(gSpike, P.sodium, 0.38, [[x + rr(-2, 2), 6, 1], [x, 0, 0.8], [x + rr(-2, 2), -6, 1]], 0.8); }
      if (k > 0.12 && due('sp-k', 0.09 / k, t)) { const x = rnd() < 0.5 ? 4 : 11; fly(gSpike, P.potassium, 0.38, [[x + rr(-2, 2), -6, 1], [x, 0, 0.8], [x + rr(-2, 2), 6, 1]], 0.9); }
      ['apCursor', 'apCursor2'].forEach(id => { const el = document.getElementById(id); if (el) { const x = +el.dataset.l + Math.min(sim, DUR) / +el.dataset.x * +el.dataset.w; el.setAttribute('x1', x); el.setAttribute('x2', x); } });
    }

    /* ================= 4. MYELIN ================= */
    const gMy = new THREE.Group(); scene.add(gMy);
    const X0 = -20, X1 = 20, NODES = [-20, -12, -4, 4, 12, 20];
    tube(gMy, [[X0, 0, 0], [X1, 0, 0]], 0.9, std(P.axonc, { transparent: true, opacity: 0.75 }), 4);
    const segs = NODES.slice(0, -1).map((x, i) => { const o = mesh(new THREE.CylinderGeometry(2.1, 2.1, 6.8, 32), std(P.myelin, { transparent: true, opacity: 0.55, depthWrite: false }), gMy, [(x + NODES[i + 1]) / 2, 0, 0]); o.rotation.z = Math.PI / 2; return o; });
    const rings = Array.from({ length: 41 }, (_, i) => { const o = mesh(new THREE.TorusGeometry(1.15, 0.22, 8, 24), std(P.sodium, { emissiveIntensity: 1 }), gMy, [X0 + i, 0, 0]); o.rotation.y = Math.PI / 2; o.visible = false; return o; });
    const nodeTag = addLabel('Node of Ranvier', 'sodium', gMy, new V3(-4, -4, 0), ['myelin']);
    const myTag = addLabel('Myelin', 'myelin', gMy, new V3(0, 4.2, 0), ['myelin']);
    const dmTag = addLabel('Stripped segment: current leaks', 'gate', gMy, new V3(0, -6.6, 0), ['myelin']);
    const myS = { t0: 0 };
    function myTick(t) {
      const bare = N.axon === 'bare', dm = N.axon === 'demyel';
      segs.forEach((o, i) => { o.visible = !bare && !(dm && i === 2); });
      nodeTag.stages = bare ? [] : ['myelin']; myTag.stages = bare ? [] : ['myelin']; dmTag.stages = dm ? ['myelin'] : [];
      const dur = bare ? 7 : 1.9, u = ((t - myS.t0) % (dur + 0.9)) / dur;
      rings.forEach(r => { r.visible = false; });
      if (u <= 1) {
        if (bare) { const x = Math.round(u * 40); [0, 1, 2].forEach(k => { if (rings[x - k]) { rings[x - k].visible = true; rings[x - k].scale.setScalar(1 - k * 0.18); } }); }
        else {
          const hop = Math.min(NODES.length - 1, Math.floor(u * NODES.length)), stop = dm ? 2 : NODES.length - 1;
          const i = NODES[Math.min(hop, stop)] - X0;
          if (!(dm && hop > stop)) [i - 1, i, i + 1].forEach(k => { if (rings[k]) { rings[k].visible = true; rings[k].scale.setScalar(1.35); } });
          if (dm && hop >= 2 && due('my-leak', 0.12, t)) fly(gMy, C.electron, 0.25, [[rr(-4, 0), 0, 1], [rr(-4, 2), rr(-5, 5), 3]], 0.9);
        }
      }
    }

    /* ================= 5. SYNAPSE ================= */
    const gSyn = new THREE.Group(); scene.add(gSyn);
    mesh(lumpy(1, 0.03, 2), std(P.axonc, { transparent: true, opacity: 0.18, depthWrite: false }), gSyn, [0, 8.4, 0], [12, 7, 5]);
    tube(gSyn, [[-17, 17, 0], [-10, 14, 0], [-5, 12.4, 0]], 1.5, std(P.axonc, { transparent: true, opacity: 0.35 }), 20);
    membrane(gSyn, 1.4, -10.5, 10.5, [-7.5, 7.5]);
    membrane(gSyn, -4.6, -14, 14, [-6, -2, 2, 6]);
    const synCa = [-7.5, 7.5].map(x => channel(gSyn, x, 1.4, P.calcium));
    const receptors = [-6, -2, 2, 6].map(x => channel(gSyn, x, -4.6, P.fix));
    const transporter = mesh(lumpy(1.3, 0.1, 7), std(P.rnapol), gSyn, [12.6, 1.6, 1]);
    const vesPos = [[-4.6, 6.2], [-1.6, 8.6], [1.8, 6.4], [4.8, 8.4], [-6.2, 9.6], [0.4, 11.4]];
    const vesicles = vesPos.map(([x, y]) => {
      const o = new THREE.Group(); o.position.set(x, y, 1); gSyn.add(o);
      const bubble = new THREE.Mesh(new THREE.SphereGeometry(1.35, 24, 18), fresnelMat(new THREE.Color(0xd9a77c), 1.4, 1.5)); o.add(bubble);
      const bits = Array.from({ length: 5 }, () => mesh(atomGeo, atomMat(P.glu), o, randDir().multiplyScalar(0.65), 0.3));
      return { o, bits, home: new V3(x, y, 1) };
    });
    addLabel('Presynaptic terminal', 'axonc', gSyn, new V3(6, 15.6, 0), ['synapse']);
    addLabel('Synaptic cleft', 'electron', gSyn, new V3(-11.6, -1.6, 0), ['synapse']);
    addLabel('Ca²⁺ channel', 'calcium', gSyn, new V3(-11.8, 4.2, 2), ['synapse']);
    addLabel('Receptors', 'fix', gSyn, new V3(-9.6, -7.6, 2), ['synapse']);
    addLabel('Transporter', 'rnapol', gSyn, new V3(13.6, 4.4, 1), ['synapse']);
    addLabel('Receiving neuron', 'dendrite', gSyn, new V3(7, -9.4, 0), ['synapse']);
    const syn = { t0: 0, flags: {} };
    function startSynapse() {
      clearAgents(); syn.flags = {}; syn.t0 = now;
      vesicles.forEach(x => { x.o.position.copy(x.home); x.o.scale.setScalar(1); x.bits.forEach(b => { b.material = atomMat(N.nt === 'glu' ? P.glu : P.gaba); b.visible = true; }); });
    }
    function synTick(t, dt) {
      const s = synapseState(N.sdrug), u = reduceMotion ? 3.2 : t - syn.t0, once = (k) => (syn.flags[k] ? false : (syn.flags[k] = true));
      const color = N.nt === 'glu' ? P.glu : P.gaba;
      if (u > 0.2 && once('ap')) fly(gSyn, C.electron, 0.8, [[-17, 17, 2], [-10, 14, 2], [-5, 12, 2], [0, 4, 3]], 1.2);
      const caOpen = u > 1.3 && u < 3 ? 1 : 0;
      synCa.forEach(c => c.set(s.calcium ? caOpen : 0, N.sdrug === 'cono', dt));
      if (caOpen && s.calcium && due('syn-ca', 0.09, t)) { const x = rnd() < 0.5 ? -7.5 : 7.5; fly(gSyn, P.calcium, 0.3, [[x + rr(-1.5, 1.5), -1.6, 2], [x, 1.4, 1], [x * 0.55, 4.4, 1]], 0.8); }
      [0, 2].forEach((idx, k) => {
        const ves = vesicles[idx], go = s.release ? ease.inOut(clamp((u - 2 - k * 0.15) / 0.8)) : 0;
        ves.o.position.lerpVectors(ves.home, new V3(ves.home.x, 2.4, 1), go);
        const fused = s.release ? clamp((u - 2.9) / 0.4) : 0;
        ves.o.scale.setScalar(Math.max(0.001, 1 - fused));
        if (fused > 0.2 && once('rel' + idx)) for (let i = 0; i < 16; i++) {
          const rx = [-6, -2, 2, 6][i % 4], linger = N.sdrug === 'reuptake';
          fly(gSyn, color, 0.34, [[ves.home.x, 1, 1], [ves.home.x + rr(-3, 3), -1.2, rr(0, 3)], [rx + rr(-0.6, 0.6), -3, rr(0, 2)]], 1 + rnd() * 0.5, { delay: rr(0, 0.3), shrinkEnd: false, keep: true, onDone: o => later(linger ? 4.6 : 0.9, () => { if (linger) disposeObj(o); else travel(gSyn, o, [o.position.clone(), new V3(12.6, 0.2, 2)], 0.9, { shrinkEnd: true }); }) });
        }
      });
      const active = s.response !== 'none' && u > 4.1 && u < (s.response === 'prolonged' ? 9.5 : 5.8);
      receptors.forEach(c => c.set(active ? 1 : 0, N.sdrug === 'antagonist', dt));
      transporter.material.emissiveIntensity = s.cleared ? 0.3 : 0.05;
      if (active && due('syn-ion', 0.1, t)) { const rx = [-6, -2, 2, 6][Math.floor(rnd() * 4)], ion = N.nt === 'glu' ? P.sodium : P.chloride; fly(gSyn, ion, 0.34, [[rx + rr(-1, 1), -2.6, 1], [rx, -4.6, 0.8], [rx + rr(-1.5, 1.5), -9, 1]], 0.9); }
      if (u > 4.1 && once('say')) say(gSyn, s.response === 'none' ? 'no response' : N.nt === 'glu' ? 'EPSP: excited' : 'IPSP: held back', s.response === 'none' ? P.gate : color, [0, -12, 3], 4, 1.7);
      if (u > 11) startSynapse();
    }

    /* ================= 6. INTEGRATION ================= */
    const gInt = new THREE.Group(); scene.add(gInt);
    const dmat = std(P.dendrite, { emissiveIntensity: 0.18 });
    const somaMat = std(P.dendrite, { emissiveIntensity: 0.2 });
    mesh(lumpy(3, 0.05, 4), somaMat, gInt, [4, 0, 0]);
    tube(gInt, [[3, 0, 0], [-6, 0.8, 0], [-14, 0, 0], [-21, 1, 0]], 0.7, dmat, 60);
    [[-6, 0.8, -4, 8], [-12, 0.2, -16, 7], [-9, 0.6, -11, -8], [-16, 0.2, -20, -6]].forEach(([x, y, ex, ey]) => tube(gInt, [[x, y, 0], [(x + ex) / 2, (y + ey) / 2 + 0.6, 0], [ex, ey, 0]], 0.38, dmat, 20));
    const intAxon = [[6.5, 0, 0], [12, -0.6, 0], [18, 0.4, 0], [24, -0.2, 0]];
    tube(gInt, intAxon, 0.45, std(P.axonc), 60);
    const ais = mesh(new THREE.CylinderGeometry(0.85, 0.85, 3, 20), std(P.gate, { transparent: true, opacity: 0.55 }), gInt, [8.4, -0.2, 0]); ais.rotation.z = Math.PI / 2;
    const SITE = { 1: [[3, 2.8], [5.4, 2.9], [3.4, -2.9], [5.8, -2.7], [1.4, 0.9]], 4: [[-5, 1.2], [-6.5, -0.1], [-4, 8], [-8, -3.4], [-9, 1]], 8: [[-20, 1.2], [-16, 7], [-20, -6], [-14, 5], [-18, -4.4]] };
    addLabel('Dendrites', 'dendrite', gInt, new V3(-13, 9.4, 0), ['integrate']);
    addLabel('Cell body', 'dendrite', gInt, new V3(4, 5.2, 0), ['integrate']);
    addLabel('Initial segment', 'gate', gInt, new V3(10.5, -3.4, 0), ['integrate']);
    const ist = { t0: 0, flags: {} };
    function startInputs() { clearAgents(); ist.t0 = now; ist.flags = {}; }
    function intTick(t) {
      const u = reduceMotion ? 3 : t - ist.t0, once = (k) => (ist.flags[k] ? false : (ist.flags[k] = true));
      const send = (n, color, tag) => { for (let i = 0; i < n; i++) { const when = 0.4 + (N.timing === 'together' ? 0 : i * 0.32); if (u > when && once(tag + i)) {
        const [x, y] = SITE[N.where][i % 5], from = [x + rr(-0.4, 0.4), y + rr(-0.4, 0.4), 1];
        fly(gInt, color, 0.55, [[from[0] + rr(-1, 1), from[1] + 3, 3], from], 0.6, { shrinkEnd: false });
        fly(gInt, color, tag === 'e' ? 0.45 : 0.4, [from, [Math.min(2, x * 0.4), y * 0.3, 1.2], [6.8, 0, 1.2]], 1.5, { delay: 0.65 });
      } } };
      send(+N.excit, P.nadh, 'e'); send(+N.inhib, P.gate, 'i');
      const r = integrate({ excit: +N.excit, inhib: +N.inhib, where: N.where, timing: N.timing });
      const decided = u > 2.8 + (N.timing === 'apart' ? Math.max(+N.excit, +N.inhib) * 0.32 : 0);
      somaMat.emissiveIntensity = 0.2 + (decided ? clamp((r.vm + 65) / 25) * 0.7 : 0);
      if (decided && once('decide')) {
        if (r.fires) { say(gInt, 'action potential!', C.electron, [14, 4, 3], 2.6, 1.7); fly(gInt, C.electron, 0.8, intAxon.map(p => [p[0], p[1], 1.4]), 1.2, { shrinkEnd: false }); }
        else say(gInt, 'below threshold', P.chloride, [12, 4, 3], 2.6, 1.5);
      }
      if (u > 8) startInputs();
    }

    /* ================= 7. AXONAL TRANSPORT ================= */
    const gAx = new THREE.Group(); scene.add(gAx);
    const wall = mesh(new THREE.CylinderGeometry(7.4, 7.4, 52, 48, 1, true), new THREE.MeshStandardMaterial({ color: P.axonc.clone(), transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide }), gAx);
    wall.rotation.z = Math.PI / 2;
    const TRACKS = [3.4, -3.4];
    const trackSegs = [];
    TRACKS.forEach(y => { for (let i = 0; i < 10; i++) { const seg_ = new THREE.Group(); gAx.add(seg_); const x = -22.5 + i * 5; for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; const o = mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.9, 8), std(P.spindle, { emissiveIntensity: 0.15 }), seg_, [0, Math.cos(a) * 0.55, Math.sin(a) * 0.55]); o.rotation.z = Math.PI / 2; } seg_.position.set(x, y, 0); trackSegs.push({ o: seg_, x, y, a: rr(-1, 1), dy: rr(-1.6, 1.6) }); } });
    for (let i = 0; i < 22; i++) tube(gAx, [[-24 + i * 2.2, rr(-1.6, 1.6), rr(-3, 3)], [-20 + i * 2.2, rr(-1.6, 1.6), rr(-3, 3)]], 0.07, std(new THREE.Color(0x7a8499)), 3);
    function motor(color, y, dir, cargo, phase) {
      const o = new THREE.Group(); gAx.add(o);
      const mat = std(color, { emissiveIntensity: 0.45 });
      const feet = [mesh(atomGeo, mat, o, null, 0.5), mesh(atomGeo, mat, o, null, 0.5)];
      const legs = [mesh(stick, mat, o), mesh(stick, mat, o)];
      const lift = y > 0 ? 3 : -3;
      if (cargo === 'mito') mesh(new THREE.CapsuleGeometry(0.9, 1.9, 6, 14), std(C.mito), o, [0, lift, 0]).rotation.z = Math.PI / 2;
      else { o.add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 24, 18), fresnelMat(P.insulin, 1.5, 1.5))); o.children[o.children.length - 1].position.y = lift; for (let i = 0; i < 4; i++) mesh(atomGeo, atomMat(P.insulin), o, [rr(-0.6, 0.6), lift + rr(-0.6, 0.6), rr(-0.6, 0.6)], 0.34); }
      return { o, feet, legs, y, dir, lift, x: -20 + phase * 40, step: phase * 6 };
    }
    const motors = [motor(P.kinesin, 3.4, 1, 'vesicle', 0.05), motor(P.kinesin, 3.4, 1, 'mito', 0.55), motor(P.kinesin, -3.4, 1, 'vesicle', 0.3), motor(P.dynein, -3.4, -1, 'vesicle', 0.8), motor(P.dynein, 3.4, -1, 'mito', 0.9)];
    addLabel('← Cell body', 'dynein', gAx, new V3(-11, -10, 0), ['axon']);
    addLabel('Axon terminal →', 'kinesin', gAx, new V3(10, -10, 0), ['axon']);
    addLabel('Microtubule', 'spindle', gAx, new V3(0, -6.6, 3), ['axon']);
    function axonTick(t, dt) {
      const broken = N.track === 'broken';
      trackSegs.forEach((s, i) => { const k = Math.min(1, dt * 3), on = broken && i % 2; s.o.position.y += ((s.y + (on ? s.dy : 0)) - s.o.position.y) * k; s.o.rotation.z += ((on ? s.a * 0.7 : 0) - s.o.rotation.z) * k; });
      motors.forEach(m_ => {
        if (!broken && !reduceMotion) { m_.x += m_.dir * dt * 3.2; m_.step += dt * 9; if (m_.x > 22) m_.x = -22; if (m_.x < -22) m_.x = 22; }
        m_.o.position.set(m_.x, m_.y, 0.9);
        const toward = m_.lift > 0 ? 0.75 : -0.75;
        m_.feet.forEach((f, i) => { const a = m_.step + i * Math.PI; f.position.set(Math.cos(a) * 0.8 * m_.dir, toward + Math.max(0, Math.sin(a)) * 0.45 * Math.sign(toward), 0); setStick(m_.legs[i], f.position.clone(), new V3(0, m_.lift * 0.62, 0), 0.17); });
        if (!broken && due('ax-atp' + motors.indexOf(m_), 1.3, t)) fly(gAx, C.atp, 0.25, [[m_.x - 3 * m_.dir, m_.y + rr(-2, 2), 3], [m_.x, m_.y, 1.5]], 0.7);
      });
    }

    /* ================= 8. BRAIN FUEL AND IMAGING ================= */
    const gBrain = new THREE.Group(); scene.add(gBrain);
    const capMat = new THREE.MeshStandardMaterial({ color: P.rbc.clone(), transparent: true, opacity: 0.24, depthWrite: false, side: THREE.DoubleSide });
    const cap = mesh(new THREE.CylinderGeometry(3.4, 3.4, 40, 40, 1, true), capMat, gBrain, [0, 9.4, 0]); cap.rotation.z = Math.PI / 2;
    const redCells = Array.from({ length: 12 }, (_, i) => { const o = mesh(new THREE.SphereGeometry(1.35, 24, 18), std(new THREE.Color(0xff4455)), gBrain, [-20 + i * 3.5, 9.4 + rr(-1, 1), rr(-1, 1)], [0.45, 1, 1]); return { o, x: -20 + i * 3.4 }; });
    const astroMat = std(P.astro, { transparent: true, opacity: 0.75 });
    mesh(lumpy(2.8, 0.1, 6), astroMat, gBrain, [-9, -0.6, 0]);
    [[-14, 5.6], [-6, 5.8], [-2, -3.6], [-15, -5.4], [-17, 0]].forEach(([x, y]) => { tube(gBrain, [[-9, -0.6, 0], [(x - 9) / 2, y / 2 - 0.3, 1], [x, y, 0]], 0.5, astroMat, 20); mesh(atomGeo, astroMat, gBrain, [x, y, 0], [1.5, 0.5, 1]); });
    const neuronMat = std(P.dendrite, { transparent: true, opacity: 0.62, depthWrite: false });
    const neuronBody = mesh(lumpy(4.6, 0.05, 9), neuronMat, gBrain, [7, -3.4, 0]);
    mesh(atomGeo, std(new THREE.Color(0x6d4bd0)), gBrain, [7.6, -3, 0], 1.7);
    [[18, 0.4], [18, -9], [-1, -8.4], [2, 2.8]].forEach(([x, y]) => tube(gBrain, [[7, -3.4, 0], [(x + 7) / 2, (y - 3.4) / 2 + 0.8, 0], [x, y, 0]], 0.7, neuronMat, 20));
    const brainMitos = [[5, -5.6], [9.4, -5.2], [5.4, -1.2]].map(([x, y]) => { const o = mesh(new THREE.CapsuleGeometry(0.55, 1.2, 6, 12), std(C.mito), gBrain, [x, y, 3.4]); o.rotation.z = rr(0, 3); return o; });
    addLabel('Capillary (blood–brain barrier, GLUT1)', 'rbc', gBrain, new V3(1, 14.4, 0), ['brain']);
    addLabel('Astrocyte', 'astro', gBrain, new V3(-12, -7.8, 0), ['brain']);
    addLabel('Neuron (GLUT3)', 'dendrite', gBrain, new V3(10, -10.4, 0), ['brain']);
    const scanTag = addLabel('Resting supply', 'electron', gBrain, new V3(0, -13.6, 0), ['brain']);
    const bst = { x: 0 };
    function brainTick(t, dt) {
      const act = N.brain === 'active', cut = N.brain === 'stroke';
      const speed = cut ? 0 : act ? 11 : 5;
      redCells.forEach(r => { if (!reduceMotion) r.x += dt * speed; if (r.x > 20) r.x -= 40; r.o.position.x = r.x; const c = new THREE.Color(cut ? 0x6d1f45 : act ? 0xff3347 : 0xd93a55); r.o.material.color.lerp(c, Math.min(1, dt * 2)); r.o.material.emissive.copy(r.o.material.color); });
      capMat.opacity = cut ? 0.1 : 0.24;
      const swell = cut ? 1.34 : 1, s = neuronBody.scale.x + (swell - neuronBody.scale.x) * Math.min(1, dt * 0.8);
      neuronBody.scale.setScalar(s);
      brainMitos.forEach(o => { o.material.emissiveIntensity = cut ? 0.03 : act ? 0.8 + Math.sin(t * 7) * 0.2 : 0.3; });
      const msg = cut ? 'Ischaemia: cells swell; DWI bright, ADC dark' : act ? 'Active: flow rises more than O₂ use; BOLD signal up' : 'Resting supply';
      const span = scanTag.el.querySelector('span'); if (span.textContent !== msg) span.textContent = msg;
      if (!cut) {
        if (due('br-glu', act ? 0.2 : 0.5, t)) { const x = rr(-14, -5); const toN = rnd() < 0.65; fly(gBrain, C.glucose, 0.36, toN ? [[x + 8, 9, 1], [x + 9, 5, 2], [rr(4, 10), -1, 3]] : [[x, 9, 1], [x, 5.6, 1], [-9, -0.6, 2]], 2.4); }
        if (due('br-o2', act ? 0.18 : 0.42, t)) { const x = rr(-2, 10); fly(gBrain, C.electron, 0.26, [[x, 8.6, 2], [x + 1, 3, 3], [rr(5, 10), -4, 3.6]], 2.1); }
        if (act && due('br-fire', 0.7, t)) fly(gBrain, C.electron, 0.7, [[18, 0.4, 2], [12, -1.5, 3], [7, -3.4, 4]], 0.6);
      } else if (s > 1.12 && due('br-water', 0.16, t)) { const d = randDir(); fly(gBrain, C.pyruvate, 0.24, [new V3(7, -3.4, 0).add(d.clone().multiplyScalar(9)), new V3(7, -3.4, 0).add(d.clone().multiplyScalar(4.4))], 1.4); }
    }

    /* ================= camera and behaviours ================= */
    const POSES = {
      neurons: { pos: new V3(0, 0, 60), target: new V3(4, 0, 0), group: 'nCells', w: 24 },
      rest: { pos: new V3(0, 0, 56), target: new V3(0, 0, 0), group: 'nRest', w: 21 },
      spike: { pos: new V3(0, 3, 56), target: new V3(0, 0, 0), group: 'nSpike', w: 19 },
      myelin: { pos: new V3(0, 6, 56), target: new V3(0, 0, 0), group: 'nMyelin', w: 23 },
      synapse: { pos: new V3(0, 1, 56), target: new V3(0, 2, 0), group: 'nSynapse', w: 18 },
      integrate: { pos: new V3(0, 0, 60), target: new V3(1, 0, 0), group: 'nSum', w: 24.5 },
      axon: { pos: new V3(0, 5, 54), target: new V3(0, -1, 0), group: 'nAxon', w: 20 },
      brain: { pos: new V3(0, 1, 58), target: new V3(0, 0.5, 0), group: 'nBrain', w: 20 },
    };
    const enter = (id, extra) => () => { current = id; timers.clear(); if (extra) extra(); renderRead(); };
    const B = {
      neurons: { enter: enter('neurons'), tick: cellsTick },
      rest: { enter: enter('rest'), tick: restTick },
      spike: { enter: enter('spike', () => { sp.t0 = now; }), tick: spikeTick },
      myelin: { enter: enter('myelin', () => { myS.t0 = now; }), tick: myTick },
      synapse: { enter: enter('synapse', startSynapse), tick: synTick },
      integrate: { enter: enter('integrate', startInputs), tick: intTick },
      axon: { enter: enter('axon'), tick: axonTick },
      brain: { enter: enter('brain'), tick: brainTick },
    };
    onChange = (name) => {
      if (current === 'spike' && ['amp', 'drug', 'pulse2', 'replay'].includes(name)) sp.t0 = now;
      if (current === 'myelin') myS.t0 = now;
      if (current === 'synapse' && ['nt', 'sdrug', 'replay'].includes(name)) startSynapse();
      if (current === 'integrate') startInputs();
    };

    return {
      groups: { nCells: gCells, nRest: gRest, nSpike: gSpike, nMyelin: gMy, nSynapse: gSyn, nSum: gInt, nAxon: gAx, nBrain: gBrain },
      unitsPerNm: {},
      fog: { nCells: 0.002, nRest: 0.002, nSpike: 0.002, nMyelin: 0.002, nSynapse: 0.002, nSum: 0.002, nAxon: 0.003, nBrain: 0.002 },
      depth: { nCells: 0.7, nSum: 0.75, nBrain: 0.65, nMyelin: 1.4, nAxon: 2.8, nSynapse: 2.9, nRest: 3.3, nSpike: 3.35 },
      poses: POSES, behaviors: B,
    };
  },
});
})();
