/* The protein factory: one protein, human insulin, from gene to secretion. */
(() => {
'use strict';

/* ================================================================
   Real data and rules (pure logic, no DOM or three.js between the markers)
   ================================================================ */
/*RULES-START*/
// Coding sequence of human INS mRNA, NCBI RefSeq NM_000207.3, positions 60-392 (written as DNA letters).
const CDS = 'ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG';
// Human preproinsulin, UniProt P01308.
const PROTEIN = 'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN';
// Gene layout from Ensembl (GRCh38, chr 11) matching NM_000207.3: lengths in base pairs, in reading order.
const GENE = [['exon', 42, 'Exon 1'], ['intron', 179, 'Intron 1'], ['exon', 204, 'Exon 2'], ['intron', 787, 'Intron 2'], ['exon', 219, 'Exon 3']];
const CDS_START = 60;                              // first base of the AUG, counted along the spliced mRNA
const REGIONS = [                                  // [key, name, first residue, last residue], numbered along preproinsulin
  ['sig', 'Signal peptide', 1, 24], ['bchain', 'B chain', 25, 54], ['cut', 'Cut site (Arg-Arg)', 55, 56],
  ['cpeptide', 'C-peptide', 57, 87], ['cut', 'Cut site (Lys-Arg)', 88, 89], ['achain', 'A chain', 90, 110],
];
const DISULFIDES = [[31, 96], [43, 109], [95, 100]];
const BASES = 'UCAG';
const AMINO = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const NAMES = { A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartate', C: 'Cysteine', Q: 'Glutamine', E: 'Glutamate', G: 'Glycine', H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine', M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine', T: 'Threonine', W: 'Tryptophan', Y: 'Tyrosine', V: 'Valine' };
const toRNA = (dna) => dna.replace(/T/g, 'U');
function codonToAmino(c) { return AMINO[BASES.indexOf(c[0]) * 16 + BASES.indexOf(c[1]) * 4 + BASES.indexOf(c[2])]; }
function translate(dna) {
  const r = toRNA(dna); let out = '';
  for (let i = 0; i + 3 <= r.length; i += 3) { const a = codonToAmino(r.slice(i, i + 3)); if (a === '*') break; out += a; }
  return out;
}
const codonAt = (n) => toRNA(CDS.slice((n - 1) * 3, n * 3));      // n counts codons from 1
const pairing = (codon) => codon.split('').map(b => ({ A: 'U', U: 'A', G: 'C', C: 'G' })[b]).join('');
const regionOf = (n) => REGIONS.find(r => n >= r[2] && n <= r[3]);
// What happens to the protein in the ER for each teaching variant.
function erOutcome(variant) {
  if (variant === 'nosignal') return { entersER: false, signalCut: false, bonds: 0, leaves: false };
  if (variant === 'misfold') return { entersER: true, signalCut: true, bonds: 2, leaves: false };
  return { entersER: true, signalCut: true, bonds: 3, leaves: true };
}
function sortingRoute(cargo) {
  if (cargo === 'lyso') return { to: 'Endosome, then lysosome', signal: 'mannose-6-phosphate tag', waits: false };
  if (cargo === 'constitutive') return { to: 'Cell surface, continuously', signal: 'no further sorting signal needed', waits: false };
  return { to: 'Dense-core granule, then waits', signal: 'clumps with other cargo in the mildly acidic trans-Golgi network', waits: true };
}
/*RULES-END*/

/* Alpha-carbon positions (ångström) of the human insulin hexamer, PDB 1MSO biological assembly 1, and its two zinc ions. */
const HEXAMER = {"chains":[{"id":"A1","type":"A","ca":[[-9.38,16.94,12.94],[-10.28,14.14,10.57],[-6.75,12.79,10.51],[-6.74,12.36,14.26],[-10.34,11.14,14.58],[-9.9,8.36,12.06],[-6.87,7.07,13.94],[-7.85,7.51,17.57],[-11.52,6.62,17.08],[-13.24,5.58,13.83],[-14.57,7.56,10.89],[-16.91,7.0,7.96],[-16.31,7.3,4.25],[-18.99,10.01,4.28],[-16.94,12.05,6.79],[-13.9,11.56,4.53],[-15.82,12.85,1.56],[-15.86,16.3,3.1],[-12.13,16.53,2.34],[-12.56,15.97,-1.38],[-11.99,19.0,-3.63]]},{"id":"B1","type":"B","ca":[[-20.27,1.21,3.77],[-18.66,0.53,7.11],[-16.79,2.68,9.54],[-12.98,2.43,9.42],[-9.96,2.88,11.71],[-7.34,4.64,9.58],[-3.93,5.82,10.68],[-0.99,7.18,8.74],[-0.82,6.47,5.08],[-3.94,4.32,5.28],[-5.99,7.45,5.66],[-4.43,8.88,2.51],[-5.32,5.7,0.61],[-8.93,5.96,1.79],[-9.21,9.61,0.74],[-7.83,8.7,-2.64],[-10.51,6.08,-3.16],[-13.38,8.09,-1.81],[-12.57,11.24,-3.76],[-11.37,9.87,-7.04],[-10.83,12.46,-9.73],[-12.07,15.16,-7.4],[-8.84,14.92,-5.44],[-8.62,15.91,-1.79],[-6.74,17.79,0.88],[-4.81,15.97,3.64],[-4.54,18.22,6.67],[-3.26,16.78,9.92],[-3.14,18.82,13.11],[0.24,20.39,13.77]]},{"id":"A2","type":"A","ca":[[-0.88,19.68,-12.61],[0.75,17.08,-10.39],[-0.49,14.22,-12.62],[1.11,15.67,-15.7],[4.36,16.41,-13.9],[4.75,13.25,-11.85],[2.68,10.5,-13.41],[2.61,11.28,-17.12],[6.06,12.82,-16.96],[8.44,12.17,-14.02],[9.36,14.24,-11.06],[11.8,14.24,-8.15],[10.8,14.06,-4.51],[11.85,17.72,-4.38],[9.32,18.56,-7.04],[6.66,16.65,-5.06],[7.18,19.11,-2.22],[5.56,21.7,-4.43],[2.22,20.11,-3.48],[2.67,20.27,0.25],[0.77,22.83,2.3]]},{"id":"B2","type":"B","ca":[[20.02,8.95,-11.46],[16.65,9.5,-13.19],[13.16,9.53,-11.73],[10.21,7.16,-12.04],[6.51,7.71,-12.68],[4.22,8.04,-9.66],[0.58,7.57,-10.38],[-2.66,7.27,-8.46],[-2.44,5.89,-5.04],[1.3,5.67,-5.42],[1.45,9.41,-6.06],[-0.51,10.26,-2.91],[1.61,7.78,-0.89],[4.61,9.79,-2.1],[2.94,13.11,-1.15],[2.21,11.69,2.32],[5.89,10.69,2.65],[7.32,14.0,1.49],[4.81,16.31,3.21],[3.66,14.46,6.32],[2.5,16.89,9.02],[2.56,19.81,6.64],[-0.34,18.23,4.8],[-0.82,18.35,1.06],[-3.33,18.66,-1.74],[-3.91,16.12,-4.5],[-5.79,17.84,-7.28],[-5.59,15.84,-10.46],[-7.94,18.09,-12.4],[-5.59,21.0,-11.98]]},{"id":"A3","type":"A","ca":[[-9.98,-16.59,12.94],[-7.1,-15.97,10.57],[-7.71,-12.24,10.51],[-7.34,-12.02,14.26],[-4.48,-14.52,14.58],[-2.29,-12.75,12.06],[-2.69,-9.48,13.94],[-2.58,-10.56,17.57],[0.03,-13.29,17.08],[1.79,-14.25,13.83],[0.73,-16.4,10.89],[2.4,-18.14,7.96],[1.84,-17.77,4.25],[0.83,-21.45,4.28],[-1.96,-20.69,6.79],[-3.06,-17.82,4.53],[-3.21,-20.13,1.56],[-6.18,-21.89,3.1],[-8.25,-18.77,2.34],[-7.55,-18.86,-1.38],[-10.46,-19.89,-3.63]]},{"id":"B3","type":"B","ca":[[9.09,-18.16,3.77],[8.87,-16.42,7.11],[6.07,-15.88,9.54],[4.39,-12.46,9.42],[2.49,-10.07,11.71],[-0.35,-8.67,9.58],[-3.08,-6.31,10.68],[-5.72,-4.44,8.74],[-5.2,-3.94,5.08],[-1.77,-5.57,5.28],[-3.46,-8.92,5.66],[-5.47,-8.28,2.51],[-2.27,-7.46,0.61],[-0.7,-10.72,1.79],[-3.72,-12.78,0.74],[-3.62,-11.13,-2.64],[-0.01,-12.14,-3.16],[-0.32,-15.63,-1.81],[-3.45,-16.5,-3.76],[-2.86,-14.78,-7.04],[-5.38,-15.61,-9.73],[-7.1,-18.03,-7.4],[-8.51,-15.12,-5.44],[-9.47,-15.42,-1.79],[-12.04,-14.73,0.88],[-11.43,-12.15,3.64],[-13.51,-13.04,6.67],[-12.91,-11.21,9.92],[-14.73,-12.13,13.11],[-17.78,-9.99,13.77]]},{"id":"A4","type":"A","ca":[[-16.6,-10.6,-12.61],[-15.17,-7.89,-10.39],[-12.07,-7.54,-12.62],[-14.13,-6.88,-15.7],[-16.39,-4.43,-13.9],[-13.85,-2.51,-11.85],[-10.43,-2.92,-13.41],[-11.07,-3.38,-17.12],[-14.13,-1.17,-16.96],[-14.76,1.22,-14.02],[-17.01,0.98,-11.06],[-18.23,3.1,-8.15],[-17.57,2.32,-4.51],[-21.27,1.4,-4.38],[-20.73,-1.21,-7.04],[-17.75,-2.56,-5.06],[-20.14,-3.33,-2.22],[-21.57,-6.04,-4.43],[-18.53,-8.14,-3.48],[-18.89,-7.82,0.25],[-20.16,-10.75,2.3]]},{"id":"B4","type":"B","ca":[[-17.76,12.87,-11.46],[-16.55,9.67,-13.19],[-14.83,6.63,-11.73],[-11.3,5.27,-12.04],[-9.93,1.78,-12.68],[-9.07,-0.36,-9.66],[-6.84,-3.28,-10.38],[-4.96,-5.94,-8.46],[-3.88,-5.06,-5.04],[-5.56,-1.71,-5.42],[-8.87,-3.44,-6.06],[-8.63,-5.58,-2.91],[-7.54,-2.49,-0.89],[-10.78,-0.9,-2.1],[-12.83,-4.01,-1.15],[-11.23,-3.93,2.32],[-12.2,-0.25,2.65],[-15.78,-0.67,1.49],[-16.53,-3.99,3.21],[-14.35,-4.06,6.32],[-15.87,-6.28,9.02],[-18.44,-7.68,6.64],[-15.62,-9.41,4.8],[-15.48,-9.88,1.06],[-14.5,-12.22,-1.74],[-12.01,-11.45,-4.5],[-12.55,-13.93,-7.28],[-10.92,-12.76,-10.46],[-11.69,-15.92,-12.4],[-15.39,-15.34,-11.98]]},{"id":"A5","type":"A","ca":[[19.36,-0.34,12.94],[17.38,1.83,10.57],[14.45,-0.55,10.51],[14.07,-0.35,14.26],[14.82,3.38,14.58],[12.19,4.39,12.06],[9.56,2.42,13.94],[10.43,3.04,17.57],[11.49,6.67,17.08],[11.45,8.68,13.83],[13.84,8.84,10.89],[14.51,11.14,7.96],[14.47,10.48,4.25],[18.16,11.44,4.28],[18.9,8.65,6.79],[16.96,6.26,4.53],[19.04,7.28,1.56],[22.05,5.59,3.1],[20.38,2.24,2.34],[20.11,2.9,-1.38],[22.45,0.88,-3.63]]},{"id":"B5","type":"B","ca":[[11.18,16.95,3.77],[9.79,15.89,7.11],[10.72,13.2,9.54],[8.6,10.03,9.42],[7.48,7.19,11.71],[7.68,4.04,9.58],[7.0,0.49,10.68],[6.71,-2.73,8.74],[6.01,-2.53,5.08],[5.71,1.25,5.28],[9.45,1.47,5.66],[9.9,-0.6,2.51],[7.6,1.76,0.61],[9.63,4.75,1.79],[12.93,3.17,0.74],[11.45,2.43,-2.64],[10.52,6.06,-3.16],[13.7,7.54,-1.81],[16.02,5.26,-3.76],[14.23,4.91,-7.04],[16.21,3.15,-9.73],[19.16,2.87,-7.4],[17.34,0.19,-5.44],[18.09,-0.49,-1.79],[18.78,-3.06,0.88],[16.24,-3.82,3.64],[18.04,-5.18,6.67],[16.16,-5.57,9.92],[17.87,-6.69,13.11],[17.54,-10.4,13.77]]},{"id":"A6","type":"A","ca":[[17.48,-9.07,-12.61],[14.42,-9.19,-10.39],[12.56,-6.69,-12.62],[13.02,-8.79,-15.7],[12.03,-11.98,-13.9],[9.1,-10.74,-11.85],[7.75,-7.57,-13.41],[8.46,-7.9,-17.12],[8.07,-11.65,-16.96],[6.32,-13.39,-14.02],[7.65,-15.22,-11.06],[6.43,-17.34,-8.15],[6.78,-16.38,-4.51],[9.42,-19.12,-4.38],[11.41,-17.35,-7.04],[11.09,-14.09,-5.06],[12.96,-15.77,-2.22],[16.01,-15.66,-4.43],[16.31,-11.98,-3.48],[16.21,-12.45,0.25],[19.39,-12.08,2.3]]},{"id":"B6","type":"B","ca":[[-2.26,-21.81,-11.46],[-0.1,-19.16,-13.19],[1.67,-16.16,-11.73],[1.09,-12.42,-12.04],[3.42,-9.49,-12.68],[4.85,-7.67,-9.66],[6.26,-4.28,-10.38],[7.62,-1.33,-8.46],[6.32,-0.83,-5.04],[4.26,-3.96,-5.42],[7.42,-5.96,-6.06],[9.14,-4.69,-2.91],[5.93,-5.29,-0.89],[6.17,-8.89,-2.1],[9.88,-9.1,-1.15],[9.02,-7.76,2.32],[6.31,-10.44,2.65],[8.47,-13.34,1.49],[11.72,-12.32,3.21],[10.69,-10.4,6.32],[13.38,-10.61,9.02],[15.87,-12.13,6.64],[15.96,-8.82,4.8],[16.3,-8.47,1.06],[17.83,-6.45,-1.74],[15.91,-4.68,-4.5],[18.34,-3.9,-7.28],[16.51,-3.08,-10.46],[19.63,-2.17,-12.4],[20.98,-5.66,-11.98]]}],"zinc":[[0.0,0.0,8.14],[0.0,0.0,-8.27]]};

const W = { gene: 'beta', step: 0, play: !reduceMotion, codon: 1, tplay: !reduceMotion, variant: 'normal', cargo: 'insulin', view: 'cut', ca: 'low' };
const CONTROLS = {
  gene: ['Cell type', [['beta', 'Pancreatic beta cell'], ['other', 'Another cell type']]],
  variant: ['Version of the protein', [['normal', 'Normal'], ['misfold', 'Misfolding mutation'], ['nosignal', 'No signal peptide']]],
  cargo: ['Cargo', [['insulin', 'Proinsulin'], ['constitutive', 'An antibody'], ['lyso', 'A lysosomal enzyme']]],
  view: ['View', [['cut', 'Cutting proinsulin'], ['one', 'One insulin (real)'], ['six', 'Zinc hexamer (real)']]],
  ca: ['Calcium inside the cell', [['low', 'Low'], ['high', 'High']]],
};
const seg = (name) => `<div><div class="eyebrow seg-label">${CONTROLS[name][0]}</div><div class="seg" role="group" aria-label="${CONTROLS[name][0]}">${CONTROLS[name][1].map(([v, t]) =>
  `<button type="button" class="btn${W[name] === v ? ' on' : ''}" data-pf="${name}" data-val="${v}" aria-pressed="${W[name] === v}">${t}</button>`).join('')}</div></div>`;
const row = (label, value, on) => `<li class="${on ? 'on' : ''}"><span>${label}</span><b>${value}</b></li>`;
const controls = (id, playing, unit) => `<div class="ctl"><button class="btn" type="button" data-pfa="prev" aria-label="Previous ${unit}">← ${unit}</button><button class="btn primary" type="button" data-pfa="play" id="${id}">${playing ? 'Pause' : 'Play'}</button><button class="btn" type="button" data-pfa="next" aria-label="Next ${unit}">${unit} →</button></div>`;

const RNA_STEPS = [
  ['Pre-mRNA', 'The first copy holds all three exons and both introns.'],
  ['5′ cap added', 'A modified guanine caps the front end soon after copying starts. It protects the RNA and later helps ribosomes find it.'],
  ['Intron 1 removed', 'The spliceosome loops the intron into a lariat, cuts it out and joins exon 1 to exon 2.'],
  ['Intron 2 removed', 'The longer intron goes the same way. It had interrupted the part that codes for C-peptide.'],
  ['Poly-A tail added', 'The 3′ end is cut and a long run of adenines is added. Cap and tail mark a finished message.'],
  ['Export', 'Export proteins carry the mature mRNA through a nuclear pore into the cytosol.'],
];

function geneMap() {
  const total = GENE.reduce((s, g) => s + g[1], 0), width = 360;
  let x = 0, out = '';
  GENE.forEach(([kind, len, name]) => {
    const w = len / total * width;
    out += kind === 'exon' ? `<rect x="${x}" y="14" width="${w}" height="18" class="ex"/>` : `<rect x="${x}" y="22" width="${w}" height="2" class="in"/>`;
    out += `<text x="${x + w / 2}" y="${kind === 'exon' ? 46 : 12}" text-anchor="middle">${len}</text>`;
    x += w;
  });
  // coding part, mapped from spliced-mRNA positions back onto the gene
  const toGene = (m_) => { let rest = m_, pos = 0; for (const [kind, len] of GENE) { if (kind === 'exon') { if (rest <= len) return pos + rest; rest -= len; } pos += len; } return pos; };
  const a = toGene(CDS_START - 1) / total * width, b = toGene(CDS_START + CDS.length - 1) / total * width;
  return `<svg class="genemap" viewBox="-4 0 368 70" role="img" aria-label="The insulin gene to scale: exons of 42, 204 and 219 base pairs separated by introns of 179 and 787">${out}<path d="M${a} 54 H${b}" class="cod"/><text x="${(a + b) / 2}" y="67" text-anchor="middle">start codon to stop codon (introns removed)</text></svg>`;
}

function aminoStrip(upTo) {
  return `<div class="aa-strip" aria-label="Protein built so far, ${upTo} residues">${PROTEIN.slice(0, upTo).split('').map((a, i) => `<i style="--c:var(--${regionOf(i + 1)[0]})"${i === upTo - 1 ? ' class="new"' : ''}>${a}</i>`).join('')}</div>`;
}

const READ = {
  gene() {
    return W.gene === 'beta'
      ? '<p><b>The gene is being read.</b> Beta cells hold the particular set of transcription factors that switch INS on. RNA polymerase II copies one DNA strand into RNA.</p>'
      : '<p><b>The same gene is here, but kept quiet.</b> Almost every cell carries INS. Which genes a cell reads is much of what makes it that kind of cell.</p>';
  },
  mrna() {
    const [name, text] = RNA_STEPS[W.step];
    const splice = W.step === 2 ? '<p class="mono">intron 1: <b>GU</b>CUGUUC … UCUCCC<b>AG</b> (179 nt)</p>' : W.step === 3 ? '<p class="mono">intron 2: <b>GU</b>GAGCCA … CCUGGC<b>AG</b> (787 nt)</p>' : '';
    return `<div class="step-top"><span class="step-n">Step ${W.step + 1} of ${RNA_STEPS.length}</span><span class="enzyme">${name}</span></div><p>${text}</p>${splice}`;
  },
  translate() {
    const n = W.codon, stop = n > PROTEIN.length, codon = codonAt(n), aa = stop ? null : PROTEIN[n - 1];
    const cell = (k, cls) => (k < 1 || k > PROTEIN.length + 1 ? '<span class="codon empty">···</span>' : `<span class="codon ${cls}">${codonAt(k)}</span>`);
    return `<div class="step-top"><span class="step-n">Codon ${n} of ${PROTEIN.length + 1}</span><span class="enzyme">${stop ? 'Stop' : regionOf(n)[1]}</span></div>
      <div class="codons">${cell(n - 2, 'past')}${cell(n - 1, 'past')}${cell(n, 'now')}${cell(n + 1, '')}${cell(n + 2, '')}</div>
      <p>${stop ? `<b>${codon}</b> is a stop codon. No tRNA matches it. A release factor frees the finished chain of ${PROTEIN.length} amino acids.`
      : `tRNA anticodon <span class="m">3′-${pairing(codon)}-5′</span> pairs with <span class="m">5′-${codon}-3′</span> and brings <b>${NAMES[aa]}</b> (${aa}).${n === 1 ? ' AUG is also the start signal.' : ''}`}</p>
      ${aminoStrip(Math.min(n, PROTEIN.length))}`;
  },
  er() {
    const o = erOutcome(W.variant);
    const text = {
      normal: 'The signal peptide leads the growing chain into the ER and is then cut off, leaving <b>proinsulin</b>. In the oxidizing ER it folds and forms three disulfide bonds. Correctly folded proinsulin can leave.',
      misfold: '<b>A wrong or missing cysteine stops proper folding.</b> Misfolded proinsulin can bond to normal proinsulin and hold it back too. The build-up stresses the ER and can kill beta cells. Some INS mutations cause diabetes this way.',
      nosignal: '<b>A thought experiment:</b> with no signal peptide, the chain has no ticket into the ER. It would stay in the cytosol, unable to follow this route out of the cell.',
    }[W.variant];
    return `<ol class="chain">${row('Chain enters the ER', o.entersER ? 'yes' : 'no', o.entersER)}${row('Signal peptide cut off', o.signalCut ? 'yes' : 'no', o.signalCut)}${row('Correct disulfide bonds', o.bonds === 3 ? '3 of 3' : o.entersER ? 'faulty' : 'none', o.bonds === 3)}${row('Leaves for the Golgi', o.leaves ? 'yes, in COPII vesicles' : 'no', o.leaves)}</ol><p>${text}</p>`;
  },
  golgi() {
    const r = sortingRoute(W.cargo);
    const extra = W.cargo === 'constitutive' ? ' Plasma cells, the antibody factories in <a href="#blood">Blood</a>, secrete this way and are packed with rough ER.' : W.cargo === 'lyso' ? ' Receptors recognize the sugar tag and divert the enzyme.' : ' Human insulin carries no N-linked sugar chains.';
    return `<ol class="chain">${row('Sorting signal', r.signal, true)}${row('Destination', r.to, true)}</ol><p>All three travel from the cis face toward the trans face, then part ways in the trans-Golgi network.${extra}</p>`;
  },
  granule() {
    return {
      cut: '<p>Inside the maturing granule, <b>PC1/3</b> and <b>PC2</b> cut proinsulin beside two pairs of basic amino acids, and <b>carboxypeptidase E</b> trims off the leftover basic ones. This frees <b>C-peptide</b>. What remains is insulin: an A chain and a B chain held by disulfide bonds. In human beta cells, PC1/3 does most of the cutting.</p>',
      one: '<p><b>A real structure.</b> The tubes trace the backbone of one insulin: the 21-residue A chain and 30-residue B chain, from X-ray crystallography. Side chains are not drawn.</p>',
      six: '<p><b>A real structure.</b> Six insulins arranged around two zinc ions. Histidine at position B10 of the B chain holds the zinc. Beta cells store insulin tightly packed with zinc; after release it works as a single molecule.</p>',
    }[W.view];
  },
  export() {
    const go = W.ca === 'high';
    return `<ol class="chain">${row('Granule docked at the membrane', 'yes', true)}${row('Calcium trigger', go ? 'on' : 'waiting', go)}${row('SNAREs complete fusion', go ? 'yes' : 'held', go)}${row('Insulin and C-peptide released', go ? 'equal amounts' : 'no', go)}</ol><p>${go ? 'Calcium flows in and ready granules fuse. Zinc hexamers disperse into single insulin molecules in the blood.' : 'The granule is ready and waiting. This pause is what makes secretion <b>regulated</b>.'} See what raises the calcium in <a href="#beta">Hormones</a>.</p>`;
  },
};

let current = 'gene', onChange = () => {};
function renderRead() { const el = $('#pRead'); if (el) el.innerHTML = READ[current](); const r = $('#prange-codon'); if (r && +r.value !== W.codon) r.value = W.codon; const v = $('#pv-codon'); if (v) v.textContent = W.codon; }
function syncPlay() { const a = $('#rnaPlay'); if (a) a.textContent = W.play ? 'Pause' : 'Play'; const b = $('#trPlay'); if (b) b.textContent = W.tplay ? 'Pause' : 'Play'; }
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pf]');
  if (b) {
    const name = b.dataset.pf; W[name] = b.dataset.val;
    if (name === 'gene') LESSON['pf-chromatin'] = W.gene;      // the chromatin chapter shows the same cell
    document.querySelectorAll(`[data-pf="${name}"]`).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
    renderRead(); onChange(name); return;
  }
  const act = e.target.closest('[data-pfa]'); if (!act) return;
  const a = act.dataset.pfa, d = a === 'next' ? 1 : -1;
  if (current === 'mrna') {
    if (a === 'play') { W.play = !W.play; if (W.play && W.step === 5) W.step = 0; }
    else { W.play = false; W.step = Math.max(0, Math.min(5, W.step + d)); }
  } else if (current === 'translate') {
    if (a === 'play') { W.tplay = !W.tplay; if (W.tplay && W.codon > PROTEIN.length) W.codon = 1; }
    else if (a === 'prev' || a === 'next') { W.tplay = false; W.codon = Math.max(1, Math.min(PROTEIN.length + 1, W.codon + d)); }
    else if (a.startsWith('jump:')) { W.tplay = false; W.codon = +a.slice(5); }
  }
  syncPlay(); renderRead(); onChange(a);
});
document.addEventListener('input', (e) => {
  const r = e.target.closest && e.target.closest('[data-prange]'); if (!r) return;
  W.codon = +r.value; W.tplay = false; syncPlay(); renderRead(); onChange('codon');
});

const panel = (id, inner) => { current = id; return `<div class="lab">${inner}<div class="readout" id="pRead" aria-live="polite">${READ[id]()}</div></div>`; };
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
const sources = (items, extra = '') => `<p class="credit">Sources: ${items.join(' · ')}. ${extra}</p>`;
const SRC = {
  fcb: link('https://open.oregonstate.education/cellbiology', 'Dalton &amp; Young, <i>Fundamentals of Cell Biology</i> (CC BY-NC 4.0), ch. 3–4, summarized and adapted'),
  refseq: link('https://www.ncbi.nlm.nih.gov/nuccore/NM_000207.3', 'NCBI RefSeq NM_000207.3'),
  ensembl: link('https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=ENSG00000254647', 'Ensembl INS gene'),
  uniprot: link('https://www.uniprot.org/uniprotkb/P01308/entry', 'UniProt P01308 (CC BY 4.0)'),
  pdb: link('https://www.rcsb.org/structure/1MSO', 'PDB 1MSO, human insulin at 1.0 Å (CC0)'),
  entry: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC6463291/', 'preproinsulin entry into the ER'),
  folding: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC4404187/', 'proinsulin folding and INS mutations'),
  process: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC7734662/', 'proinsulin processing'),
  pet: link('https://pmc.ncbi.nlm.nih.gov/articles/PMC5226808/', 'amino acid PET tracer uptake'),
  osEpi: link('https://openstax.org/books/biology-2e/pages/16-3-eukaryotic-epigenetic-gene-regulation', 'OpenStax Biology 2e, 16.3 Eukaryotic epigenetic gene regulation'),
  luger: link('https://www.rcsb.org/structure/1AOI', 'PDB 1AOI, the nucleosome core particle (Luger et al., 1997)'),
  kuroda: link('https://doi.org/10.1371/journal.pone.0006953', 'Kuroda et al., insulin gene expression is regulated by DNA methylation (PLoS ONE, 2009)'),
  andrali: link('https://doi.org/10.1042/BJ20081029', 'Andrali et al., glucose regulation of insulin gene expression (Biochem J, 2008)'),
};
const CHROMATIN_TEXT = {
  beta: 'Beta cell: the region around INS is open euchromatin. Acetylated histones loosen, a nucleosome-free promoter exposes binding sites, and PDX1, MAFA and NEUROD1 recruit RNA polymerase II, which starts making RNA.',
  other: 'Neuron or muscle cell: the same DNA is packed into compact heterochromatin. Methylated DNA and histones keep the promoter wrapped up, the beta-cell factors are absent, and RNA polymerase II never lands.',
};
// The chromatin choice and the gene chapter's cell-type switch describe the same cell, so keep them in step.
whenLesson('pf-chromatin', (v) => { W.gene = v; });

const CHAPTERS = [
  {
    id: 'chromatin', short: 'Chromatin', where: 'The nucleus · packaging around the insulin gene',
    title: 'Why the insulin gene is open in a beta cell',
    legend: [['strand-a', 'DNA'], ['histone', 'Histone octamer'], ['acetyl-mark', 'Acetyl marks'], ['methyl-mark', 'Methyl marks'], ['tf', 'Beta-cell transcription factors'], ['rnapol', 'RNA polymerase II'], ['rna', 'New RNA']],
    html: () => {
      if (!Object.hasOwn(LESSON, 'pf-chromatin')) LESSON['pf-chromatin'] = W.gene;
      return `
      <p class="lede">Almost every cell in your body carries the <b>INS</b> gene for insulin, but only pancreatic beta cells read it. The difference is in how the DNA around the gene is packaged and which proteins can reach it.</p>
      ${lessonSeg('pf-chromatin', 'Cell type', [['beta', 'Pancreatic beta cell'], ['other', 'Neuron or muscle cell']])}
      <p id="chromCaption" class="lesson-phase" aria-live="polite">${CHROMATIN_TEXT[LESSON['pf-chromatin']]}</p>
      <ul class="facts">
        <li><b>Nucleosomes.</b> About 147 base pairs of DNA wrap 1.65 turns around a core of eight histone proteins, two each of H2A, H2B, H3 and H4. Short linker DNA joins one nucleosome to the next, like beads on a string.</li>
        <li><b>Euchromatin and heterochromatin.</b> Loosely packed euchromatin is accessible and usually active. Tightly packed heterochromatin hides its DNA from the machinery that reads genes.</li>
        <li><b>Epigenetic marks.</b> Acetyl groups on histone tails loosen their grip on DNA and recruit activators. Certain methyl marks on histones, and methyl groups on CpG sites in DNA itself, help keep genes silent. In mice and in human islets, the <b>INS</b> promoter carries little DNA methylation in beta cells and much more in other cells.</li>
        <li><b>Promoter and enhancers.</b> A short region upstream of the gene holds binding sites for transcription factors. In beta cells, <b>PDX1</b>, <b>MAFA</b> and <b>NEUROD1</b> bind their sites there. Together with coactivators and Mediator, they recruit <b>RNA polymerase II</b> to the start site.</li>
        <li>High glucose increases this binding and insulin gene transcription. Long-term exposure to high glucose and fatty acids can lower MAFA and PDX1 activity, one way beta cells fail in type 2 diabetes.</li>
      </ul>
      <p><a href="#gene">Next: read the INS gene</a> · <a href="#islet">Meet the beta cell in its islet</a> · <a href="#stem-fate">How master factors and Polycomb lock in a cell’s fate</a></p>
      ${sources([SRC.osEpi, SRC.fcb, SRC.luger, SRC.kuroda, SRC.andrali], 'The scene is schematic: real chromatin folds in three dimensions, the compact state is not a regular fiber, and the INS control region spans a few hundred base pairs with many more factors. 1 scene unit ≈ 2 nm for the nucleosomes; linker and promoter lengths are compressed.')}`;
    },
  },
  {
    id: 'gene', short: 'Gene', where: 'The nucleus · reading one gene',
    title: 'The blueprint: the insulin gene',
    legend: [['strand-a', 'DNA'], ['strand-b', 'DNA partner strand'], ['rnapol', 'RNA polymerase II'], ['rna', 'New RNA']],
    html: () => `
      <p class="lede">Our protein is <b>insulin</b>. Its instructions sit in the <b>INS</b> gene on chromosome 11. Follow them from the city’s archive all the way out of the cell.</p>
      ${panel('gene', seg('gene'))}
      <h3>The gene, drawn to scale</h3>
      ${geneMap()}
      <ul class="facts">
        <li>The stretch shown is <b>1,431 base pairs</b>: three <b>exons</b> (boxes) and two <b>introns</b> (lines).</li>
        <li>Everything is copied into RNA. The introns are cut out afterward.</li>
        <li><b>Transcription</b> uses DNA to make RNA. In RNA, uracil (U) takes the place of thymine (T).</li>
        <li>Controlling sequences nearby, not shown, help decide when and how strongly the gene is read.</li>
      </ul>
      ${sources([SRC.ensembl, SRC.refseq, SRC.fcb], 'The 3D scene is schematic and not to scale.')}`,
  },
  {
    id: 'mrna', short: 'mRNA', where: 'Still in the nucleus · editing the message',
    title: 'Editing the message',
    legend: [['exon', 'Exon'], ['intron', 'Intron'], ['rna', 'Cap & poly-A tail'], ['rnapol', 'Spliceosome'], ['nucleus', 'Nuclear envelope']],
    html: () => `
      <p class="lede">The first RNA copy is a rough draft. Before it can leave the nucleus it gets a cap, loses its introns and gains a tail.</p>
      ${panel('mrna', controls('rnaPlay', W.play, 'Step'))}
      <ul class="facts">
        <li>The <b>spliceosome</b>, built from small RNAs and many proteins, finds the ends of each intron. Both insulin introns begin <b>GU</b> and end <b>AG</b>.</li>
        <li>For insulin, 1,431 letters of draft become a <b>465-letter</b> message, plus the tail. 333 of those letters code for protein, including the stop codon.</li>
        <li>Many genes can be spliced in more than one way, which gives several proteins from one gene.</li>
        <li>Steps often overlap in a real cell. Splicing can begin while the RNA is still being copied.</li>
      </ul>
      ${sources([SRC.fcb, SRC.refseq, SRC.ensembl], 'RNA lengths are roughly to scale along the strand. Shapes and the spliceosome are schematic.')}`,
  },
  {
    id: 'translate', short: 'Ribosome', where: 'A ribosome · reading three letters at a time',
    title: 'Translation: codon by codon',
    legend: [['sig', 'Signal peptide'], ['bchain', 'B chain'], ['cpeptide', 'C-peptide'], ['achain', 'A chain'], ['cut', 'Cut sites'], ['rna', 'mRNA']],
    html: () => `
      <p class="lede">A <b>ribosome</b> reads the message three letters at a time. Each <b>codon</b> picks one amino acid. This is the real human insulin sequence, all ${PROTEIN.length} of them.</p>
      ${panel('translate', controls('trPlay', W.tplay, 'Codon') + `<label class="range"><span class="eyebrow">Codon <b id="pv-codon">${W.codon}</b></span><input type="range" id="prange-codon" data-prange="codon" min="1" max="${PROTEIN.length + 1}" step="1" value="${W.codon}"></label><div class="seg" role="group" aria-label="Jump to a part of the protein">${[['Start', 1], ['B chain', 25], ['C-peptide', 57], ['A chain', 90], ['Stop', 111]].map(([t, n]) => `<button type="button" class="btn" data-pfa="jump:${n}">${t}</button>`).join('')}</div>`)}
      <ul class="facts">
        <li><b>Transfer RNAs</b> are the adapters: one end matches a codon, the other carries an amino acid.</li>
        <li>The ribosome joins each new amino acid to the chain. Adding each one costs the cell several high-energy phosphate bonds, from ATP and GTP. This is a big use of the <a href="#tally">energy</a> you followed earlier.</li>
        <li>Several ribosomes can read one mRNA at the same time.</li>
        <li>Bacterial ribosomes differ from ours, which is why several antibiotics can target them.</li>
      </ul>
      <div class="callout"><span class="eyebrow">Radiology link</span><p>Brain tumor PET with amino acid tracers (¹¹C-methionine, ¹⁸F-FET, ¹⁸F-FDOPA) uses building blocks like these. Their uptake in gliomas appears to be driven mainly by <b>L-type amino acid transporters</b>, so a bright signal should not be read simply as protein synthesis. The picture for FET is less settled.</p></div>
      ${sources([SRC.refseq, SRC.uniprot, SRC.pet], 'The codons and amino acids are real. The 3D ribosome is schematic and the playback is far slower than life.')}`,
  },
  {
    id: 'er', short: 'ER', where: 'The rough ER membrane',
    title: 'Into the ER, then folded',
    legend: [['sig', 'Signal peptide'], ['bchain', 'B chain'], ['cpeptide', 'C-peptide'], ['achain', 'A chain'], ['disulf', 'Disulfide bond'], ['rnapol', 'Channel & helpers']],
    html: () => `
      <p class="lede">The first 24 amino acids are an address label. This <b>signal peptide</b> sends the chain into the endoplasmic reticulum, the start of the export line.</p>
      ${panel('er', seg('variant') + '<button class="btn primary" type="button" data-pfa="replay">Replay</button>')}
      <ul class="facts">
        <li>In the classic route, the <b>signal recognition particle</b> (SRP) grabs the signal peptide, pauses translation and docks the ribosome at a channel, which then threads the chain into the ER as it is made.</li>
        <li>Preproinsulin is short. Research reports routes both with and without SRP, and the balance is still debated. Both use the <b>Sec61</b> channel.</li>
        <li><b>Signal peptidase</b> cuts off the label. Helpers such as <b>BiP</b> and protein disulfide isomerase assist folding.</li>
        <li>The three bonds join cysteines <b>A7–B7</b>, <b>A20–B19</b> and, within the A chain, <b>A6–A11</b>.</li>
        <li>Proteins that fail quality control can be sent back out and destroyed. Too much backlog triggers the <b>unfolded protein response</b>.</li>
      </ul>
      ${sources([SRC.entry, SRC.folding, SRC.fcb, SRC.uniprot], 'The folding shown is a simplified path, not a simulation.')}`,
  },
  {
    id: 'golgi', short: 'Golgi', where: 'The Golgi apparatus · sorting office',
    title: 'The Golgi: sorting and shipping',
    legend: [['golgi', 'Golgi cisternae'], ['cpeptide', 'COPII vesicles (forward)'], ['rnapol', 'COPI vesicles (back)'], ['insulin', 'Proinsulin'], ['achain', 'Antibody'], ['sig', 'Lysosomal enzyme']],
    html: () => `
      <p class="lede">Vesicles carry proinsulin from the ER to the <b>Golgi</b>. It enters on the <b>cis</b> face and leaves from the <b>trans</b> face, where cargo is sorted by destination.</p>
      ${panel('golgi', seg('cargo'))}
      <ul class="facts">
        <li><b>COPII</b> coats vesicles leaving the ER. <b>COPI</b> vesicles carry material backward, including from the Golgi to the ER.</li>
        <li>In the favored <b>cisternal maturation</b> model, each layer moves forward and matures, while resident enzymes are sent back. Some transport by vesicles probably happens too.</li>
        <li>Many proteins gain or change sugar chains here.</li>
        <li><b>SNARE</b> proteins help each vesicle fuse with the right target.</li>
      </ul>
      ${sources([SRC.fcb], 'The number of layers and vesicles is schematic.')}`,
  },
  {
    id: 'granule', short: 'Granule', where: 'A maturing secretory granule',
    title: 'The final cuts, and a real structure',
    legend: [['bchain', 'B chain'], ['achain', 'A chain'], ['cpeptide', 'C-peptide'], ['disulf', 'Disulfide bond'], ['zinc', 'Zinc']],
    html: () => `
      <p class="lede">Proinsulin is not finished. In its granule, one chain becomes two, and the active hormone is packed away for later.</p>
      ${panel('granule', seg('view'))}
      <ul class="facts">
        <li>Preproinsulin has <b>110</b> amino acids. Removing the 24-residue signal peptide gives proinsulin with <b>86</b>.</li>
        <li>Mature insulin has <b>51</b> (21 + 30). <b>C-peptide</b> has <b>31</b>. The other four were the two basic pairs.</li>
        <li>Mutations at a cut site can leave proinsulin incompletely processed.</li>
      </ul>
      ${sources([SRC.process, SRC.uniprot, SRC.pdb], 'The cutting scene is schematic. The two “real” views are drawn from crystal-structure coordinates; a crystal shows one packed shape, and the molecule flexes in solution.')}`,
  },
  {
    id: 'export', short: 'Export', where: 'The edge of the beta cell',
    title: 'Out of the cell',
    legend: [['insulin', 'Insulin'], ['cpeptide', 'C-peptide'], ['calcium', 'Ca²⁺'], ['rnapol', 'SNARE proteins'], ['rbc', 'Blood capillary']],
    html: () => `
      <p class="lede">The finished granules wait near the surface. When the signal comes, the granule membrane fuses with the cell membrane and its contents spill out. This is <b>exocytosis</b>.</p>
      ${panel('export', seg('ca'))}
      <div class="callout"><span class="eyebrow">Clinical link</span><p>The body releases <b>C-peptide</b> along with its own insulin, but injected insulin does not contain it. So C-peptide helps show how much insulin a person is still making. It is cleared differently from insulin, so blood levels are not equal.</p></div>
      <h3>The whole journey</h3>
      <ol class="journey">
        <li><a href="#gene">Gene</a>: INS is transcribed in the nucleus.</li>
        <li><a href="#mrna">mRNA</a>: capped, spliced, tailed and exported.</li>
        <li><a href="#translate">Ribosome</a>: 110 amino acids are joined.</li>
        <li><a href="#er">ER</a>: signal peptide removed, three bonds formed.</li>
        <li><a href="#golgi">Golgi</a>: sorted into the regulated pathway.</li>
        <li><a href="#granule">Granule</a>: C-peptide cut out, insulin packed with zinc.</li>
        <li><b>Export</b>: released on demand. Next stop, <a href="#receptor">a muscle cell</a>.</li>
      </ol>
      ${sources([SRC.fcb, SRC.process], 'Membrane fusion involves more proteins than shown.')}`,
  },
];

CellCity.register('protein', {
  chapters: CHAPTERS,
  build(g) {
    const { scene, C, UP, fresnelMat, glow, textSprite, atomGeo, atomMat, disposeObj, travel, every, clearAgents, addLabel } = g;
    const P = {};
    ['strand-a', 'strand-b', 'rnapol', 'rna', 'exon', 'intron', 'sig', 'bchain', 'cpeptide', 'achain', 'cut', 'disulf', 'zinc', 'ribo', 'insulin', 'calcium', 'rbc', 'golgi'].forEach(k => P[k] = col(k));
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: color.clone(), emissive: color.clone(), emissiveIntensity: 0.25, roughness: 0.5 }, extra));
    const randDir = () => new V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize();
    const v = (a) => (Array.isArray(a) ? new V3(...a) : a);
    const mesh = (geo, mat, parent, pos, scale) => { const o = new THREE.Mesh(geo, mat); if (pos) o.position.copy(v(pos)); if (scale !== undefined) (Array.isArray(scale) ? o.scale.set(...scale) : o.scale.setScalar(scale)); parent.add(o); return o; };
    function dot(color, r, glowSize = 0) { const o = new THREE.Group(); mesh(atomGeo, atomMat(color), o, null, r); if (glowSize) o.add(glow(color, glowSize)); return o; }
    const fly = (parent, color, r, pts, dur, opts = {}) => travel(parent, dot(color, r, r * 3.4), pts, dur, Object.assign({ shrinkEnd: true, ease: ease.lin }, opts));
    const stick = new THREE.CylinderGeometry(1, 1, 1, 8);
    function setStick(o, a, b, r) { const d = b.clone().sub(a), len = d.length(); o.position.copy(a).add(b).multiplyScalar(0.5); o.scale.set(r, Math.max(0.001, len), r); if (len > 1e-4) o.quaternion.setFromUnitVectors(UP, d.normalize()); }
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const mix = (a, b, u) => a + (b - a) * u;
    const timers = new Map();
    function due(key, period, t) { if (t < (timers.get(key) || 0)) return false; timers.set(key, t + period); return true; }
    function lumpy(r, amp, seed) {
      const geo = new THREE.SphereGeometry(r, 40, 30), p = geo.attributes.position, q = new V3();
      for (let i = 0; i < p.count; i++) { q.fromBufferAttribute(p, i); q.multiplyScalar(1 + amp * (Math.sin(q.x * 3.7 / r + seed) * Math.cos(q.y * 4.1 / r + seed * 2) + 0.6 * Math.sin(q.z * 5.3 / r + seed * 3))); p.setXYZ(i, q.x, q.y, q.z); }
      geo.computeVertexNormals(); return geo;
    }
    /* a string of beads that can be re-posed each frame */
    function beads(parent, count, colorFn, r) {
      const list = [];
      for (let i = 0; i < count; i++) list.push({ ball: mesh(atomGeo, atomMat(colorFn(i)), parent, null, r), link: mesh(stick, atomMat(colorFn(i)), parent) });
      return {
        list,
        pose(fn, visibleFn = () => true) {
          const pts = list.map((_, i) => fn(i));
          list.forEach((b, i) => {
            const vis = visibleFn(i); b.ball.visible = vis; b.ball.position.copy(pts[i]);
            const joined = vis && i + 1 < list.length && visibleFn(i + 1) && pts[i].distanceTo(pts[i + 1]) < 4;
            b.link.visible = joined; if (joined) setStick(b.link, pts[i], pts[i + 1], r * 0.55);
          });
          return pts;
        },
      };
    }
    const resColor = (i) => P[regionOf(i + 1)[0]];

    /* ================= 1. GENE ================= */
    const gGene = new THREE.Group(); scene.add(gGene);
    const NB = 56, strands = [0, 1].map(k => beads(gGene, NB, () => P[k ? 'strand-b' : 'strand-a'], 0.42));
    const rungs = Array.from({ length: NB }, () => mesh(stick, std(new THREE.Color(0x8794a8), { emissiveIntensity: 0.15 }), gGene));
    const pol = new THREE.Group(); gGene.add(pol);
    mesh(lumpy(4.6, 0.07, 2), std(P.rnapol, { transparent: true, opacity: 0.42, depthWrite: false }), pol);
    const nascent = beads(gGene, 34, () => P.rna, 0.38);
    const polTag = addLabel('RNA polymerase II', 'rnapol', gGene, new V3(0, 6, 0), ['gene']);
    const rnaTag = addLabel('New RNA', 'rna', gGene, new V3(0, -10, 0), ['gene']);
    addLabel('INS gene (DNA)', 'strand-a', gGene, new V3(17, 5.4, 0), ['gene']);
    const gst = { x: -18 };
    function geneTick(t, dt) {
      const on = W.gene === 'beta';
      if (on) { gst.x += dt * (reduceMotion ? 0.6 : 3); if (gst.x > 18) gst.x = -18; }
      const x0 = -(NB - 1) / 2 * 0.9;
      const open = (x) => (on ? Math.exp(-((x - gst.x) ** 2) / 9) : 0);
      const pts = [0, 1].map(k => strands[k].pose((i) => {
        const x = x0 + i * 0.9, th = i / 10.5 * Math.PI * 2 + k * 2.5, o = open(x), r = 2.3;
        return new V3(x, mix(Math.cos(th) * r, k ? -2.9 : 2.9, o), mix(Math.sin(th) * r, 0, o));
      }));
      rungs.forEach((m_, i) => { m_.visible = open(x0 + i * 0.9) < 0.35; if (m_.visible) setStick(m_, pts[0][i], pts[1][i], 0.14); });
      pol.visible = on; pol.position.x = gst.x; polTag.anchor.set(gst.x, 6.4, 0);
      const len = on ? Math.floor(clamp((gst.x + 18) / 36) * 34) : 0;
      const tail = nascent.pose((i) => {
        const back = len - 1 - i;                    // newest bead sits inside the polymerase
        return new V3(gst.x - Math.min(back, 6) * 0.5 - Math.max(0, back - 6) * 0.25, -1.5 - Math.min(10, back) * 0.75 - Math.max(0, back - 10) * 0.12 + Math.sin(i * 0.8) * 0.7, 2.5);
      }, (i) => i < len);
      rnaTag.anchor.copy(len > 8 ? tail[Math.max(0, len - 14)] : new V3(gst.x, -8, 2)).add(new V3(0, -2, 0));
      rnaTag.stages = len > 8 ? ['gene'] : [];
    }

    /* ================= 2. mRNA PROCESSING ================= */
    const gRna = new THREE.Group(); scene.add(gRna);
    const NT = 15;                                    // nucleotides per bead
    const SEG = GENE.map(([kind, len, name], k) => ({ kind, name, k, n: Math.max(3, Math.round(len / NT)) }));
    const flat = []; SEG.forEach(s => { for (let j = 0; j < s.n; j++) flat.push({ s, j }); });
    const rnaChain = beads(gRna, flat.length, (i) => P[flat[i].s.kind], 0.42);
    const cap = dot(P.rna, 0.95, 3.4); gRna.add(cap);
    const tailBeads = beads(gRna, 16, () => P.rna, 0.34);
    const splicer = mesh(lumpy(2.1, 0.12, 5), std(P.rnapol, { transparent: true, opacity: 0.5, depthWrite: false }), gRna);
    const pore = new THREE.Group(); pore.position.set(23, 0, 0); gRna.add(pore);
    {
      const ringMat = std(C.nucleus, { emissiveIntensity: 0.4 });
      const t = mesh(new THREE.TorusGeometry(4.4, 1.1, 14, 48), ringMat, pore); t.rotation.y = Math.PI / 2;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; mesh(atomGeo, ringMat, pore, [0, Math.cos(a) * 4.4, Math.sin(a) * 4.4], 1.35); }
      [-1, 1].forEach(s => mesh(new THREE.BoxGeometry(0.5, 9, 4), std(C.nucleus, { transparent: true, opacity: 0.3, depthWrite: false }), pore, [0, s * 10.2, 0]));
    }
    const segTags = SEG.map(s => addLabel(s.name, s.kind, gRna, new V3(), ['mrna']));
    const capTag = addLabel('5′ cap', 'rna', gRna, new V3(), ['mrna']);
    const tailTag = addLabel('Poly-A tail', 'rna', gRna, new V3(), ['mrna']);
    addLabel('Nuclear pore', 'nucleus', gRna, new V3(23, 7.4, 0), ['mrna']);
    const rst = { s: 0, since: 0, shown: -1 };
    function rnaDraw(s) {                             // s runs 0 (pre-mRNA) to 5 (exported)
      const gone = [clamp(s - 1), clamp(s - 2)];       // splicing progress of intron 1 and 2
      let cursor = 0; const place = []; const BW = 0.5;
      SEG.forEach(sg => {
        const gi = sg.kind === 'intron' ? (sg.k === 1 ? 0 : 1) : -1;
        const width = sg.n * BW * (gi >= 0 ? 1 - ease.inOut(clamp(gone[gi] * 2)) : 1);
        place.push({ start: cursor, width, gi }); cursor += width;
      });
      const move = ease.inOut(clamp(s - 4));
      const shift = -cursor / 2 + move * 31;
      const pts = rnaChain.pose((i) => {
        const { s: sg, j } = flat[i], pl = place[sg.k];
        if (pl.gi < 0) { const x = shift + pl.start + j * BW; return new V3(x, Math.sin(x * 0.55) * 0.7, 0); }
        const u = sg.n > 1 ? j / (sg.n - 1) : 0, g_ = gone[pl.gi];
        const bulge = clamp(g_ * 2), away = clamp((g_ - 0.5) * 2);
        const radius = sg.n * BW / (2 * Math.PI) * 1.15;
        const x = shift + pl.start + u * pl.width + Math.sin(u * Math.PI * 2) * radius * bulge;
        const y = Math.sin(x * 0.55) * 0.7 * (1 - bulge) - (1 - Math.cos(u * Math.PI * 2)) * radius * bulge - away * 9;
        return new V3(x, y, away * 2);
      }, (i) => { const pl = place[flat[i].s.k]; return pl.gi < 0 || gone[pl.gi] < 0.98; });
      cap.visible = s > 0.15; cap.position.set(shift - 1, Math.sin((shift - 1) * 0.55) * 0.7, 0); cap.scale.setScalar(clamp(s * 1.4));
      const grow = Math.round(clamp(s - 3) * 16), endX = shift + cursor;
      tailBeads.pose((i) => new V3(endX + i * 0.45, Math.sin((endX + i * 0.45) * 0.55) * 0.7 + i * 0.06, 0), (i) => i < grow);
      const active = s > 1 && s < 2 ? 1 : s > 2 && s < 3 ? 3 : -1;
      splicer.visible = active > 0;
      if (active > 0) splicer.position.set(shift + place[active].start + place[active].width / 2, 0.4, 0.5);
      let first = 0;
      SEG.forEach((sg, k) => {
        const mid = pts[first + Math.floor(sg.n / 2)]; first += sg.n;
        const gi = place[k].gi, hidden = (gi >= 0 && gone[gi] > 0.75) || s > 4.3;
        segTags[k].anchor.copy(mid).add(new V3(0, sg.kind === 'exon' ? 2.7 + (k === 2 ? 1.4 : 0) : -3, 0));
        segTags[k].stages = hidden ? [] : ['mrna'];
      });
      capTag.anchor.copy(cap.position).add(new V3(-0.5, -2.6, 0)); capTag.stages = s > 0.6 && s < 4.3 ? ['mrna'] : [];
      tailTag.anchor.set(endX + 5, 3.6, 0); tailTag.stages = grow > 8 && s < 4.3 ? ['mrna'] : [];
    }
    function rnaTick(t, dt) {
      const d = W.step - rst.s;
      if (Math.abs(d) > 1.5) rst.s = W.step; else rst.s += Math.max(-dt * 0.55, Math.min(dt * 0.55, d));
      if (Math.abs(W.step - rst.s) < 0.01) { if (!rst.since) rst.since = t; } else rst.since = 0;
      if (W.play && rst.since && t - rst.since > 3) { W.step = (W.step + 1) % 6; if (!W.step) rst.s = 0; rst.since = 0; renderRead(); }
      rnaDraw(reduceMotion ? W.step : rst.s);
    }

    /* ================= 3. TRANSLATION ================= */
    const gRibo = new THREE.Group(); scene.add(gRibo);
    mesh(lumpy(5.6, 0.05, 1), std(P.ribo, { transparent: true, opacity: 0.4, depthWrite: false }), gRibo, [0, 3.4, 0], [1.15, 0.9, 0.9]);
    mesh(lumpy(4, 0.07, 4), std(P.ribo.clone().multiplyScalar(0.8), { transparent: true, opacity: 0.55, depthWrite: false }), gRibo, [0, -4.3, 0], [1.35, 0.62, 0.9]);
    const mrnaStrip = new THREE.Group(); gRibo.add(mrnaStrip);
    const CW = 3.6;
    const slots = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map(k => {
      const o = new THREE.Group(); o.position.set(k * CW, -2, 2.8); gRibo.add(o);
      const bar = mesh(new THREE.BoxGeometry(CW - 0.35, 0.55, 0.55), std(P.rna, { emissiveIntensity: 0.2 }), o);
      let sprite = null;
      return { k, o, bar, set(text, hot) { if (sprite) disposeObj(sprite); sprite = null; bar.visible = !!text; if (!text) return; sprite = textSprite(text, hot ? new THREE.Color(0xffffff) : P.rna, hot ? 1.5 : 1.1); sprite.position.set(0, -1.35, 0.4); sprite.material.depthTest = false; o.add(sprite); } };
    });
    const polypeptide = beads(gRibo, PROTEIN.length, resColor, 0.55);
    const trna = new THREE.Group(); gRibo.add(trna);
    mesh(new THREE.CapsuleGeometry(0.48, 3.2, 6, 12), std(new THREE.Color(0xd9e6b8)), trna, [0, 1.4, 0]);
    mesh(new THREE.CapsuleGeometry(0.42, 1.5, 6, 12), std(new THREE.Color(0xd9e6b8)), trna, [0.8, 2.2, 0]).rotation.z = Math.PI / 2;
    const cargoBall = mesh(atomGeo, atomMat(P.bchain), trna, [0, 3.9, 0], 0.75);
    let trnaText = null, shownCodon = -1, codonSince = 0;
    addLabel('Ribosome', 'ribo', gRibo, new V3(-8.6, 4.6, 0), ['translate']);
    addLabel('mRNA 5′ → 3′', 'rna', gRibo, new V3(-11.5, -6.6, 2.8), ['translate']);
    const chainTag = addLabel('Growing chain', 'bchain', gRibo, new V3(8, 12, 0), ['translate']);
    function chainPoint(back) {                       // back = how many residues ago it was added
      if (back < 8) return new V3(0.2 - back * 0.12, 1.6 + back * 0.92, 0.6);
      const k = back - 8, a = k * 0.42, r = 2.2 + k * 0.085;
      return new V3(-0.8 + Math.sin(a) * r + k * 0.04, 9.6 + (1 - Math.cos(a)) * r * 0.62, 0.6 + Math.sin(k * 0.23) * 1.2);
    }
    function setCodon(n, t) {
      shownCodon = n; codonSince = t;
      slots.forEach(sl => { const k = n + sl.k; sl.set(k >= 1 && k <= PROTEIN.length + 1 ? codonAt(k) : k > PROTEIN.length + 1 ? '···' : k > -3 ? '···' : '', sl.k === 0); sl.bar.material.emissiveIntensity = sl.k === 0 ? 0.9 : 0.15; });
      if (trnaText) disposeObj(trnaText);
      trnaText = null; trna.visible = n <= PROTEIN.length;
      if (trna.visible) {
        trnaText = textSprite(pairing(codonAt(n)), new THREE.Color(0xd9e6b8), 1.15); trnaText.position.set(0, -0.9, 3.4); trnaText.material.depthTest = false; trna.add(trnaText);
        cargoBall.material = atomMat(resColor(n - 1));
      }
      const added = Math.min(n, PROTEIN.length);
      chainTag.el.querySelector('span').textContent = n > PROTEIN.length ? 'Finished chain released' : `Growing chain: ${added}`;
    }
    function riboTick(t) {
      if (shownCodon !== W.codon) setCodon(W.codon, t);
      if (W.tplay && t - codonSince > 0.85) { W.codon = W.codon > PROTEIN.length ? 1 : W.codon + 1; if (W.codon === PROTEIN.length + 1) { W.tplay = false; syncPlay(); } renderRead(); }
      const n = Math.min(W.codon, PROTEIN.length), age = clamp((t - codonSince) / 0.6);
      const done = W.codon > PROTEIN.length, lift = done ? clamp((t - codonSince) / 2) * 1.6 : 0;
      const arrived = done || age > 0.75;
      polypeptide.pose((i) => chainPoint(Math.max(0, n - 1 - i)).add(new V3(0, lift, 0)), (i) => i < (arrived ? n : n - 1));
      trna.position.set(0, -0.9, 1.4).add(new V3(mix(9, 0, ease.out(clamp(age / 0.7))), mix(5, 0, ease.out(clamp(age / 0.7))), 0));
      cargoBall.visible = !arrived;
    }

    /* ================= 4. ENDOPLASMIC RETICULUM ================= */
    const gEr = new THREE.Group(); scene.add(gEr);
    function membrane(parent, y, x0, x1, gapAt) {
      const heads = [];
      for (let x = x0; x <= x1; x += 0.65) for (let z = -3.2; z <= 3.2; z += 0.65) if (gapAt === undefined || Math.hypot(x - gapAt, z) > 2) heads.push([x, z]);
      const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 8, 6), new THREE.MeshStandardMaterial({ color: 0x4f8f9a, emissive: 0x143038, roughness: 0.8 }), heads.length * 2);
      const m4 = new THREE.Matrix4(); let k = 0;
      heads.forEach(([x, z]) => [0.7, -0.7].forEach(dy => { m4.makeTranslation(x, y + dy, z); im.setMatrixAt(k++, m4); }));
      parent.add(im); return im;
    }
    membrane(gEr, 4, -21, 21, -9);
    [-1, 1].forEach(s => mesh(new THREE.CapsuleGeometry(0.75, 2.4, 6, 12), std(P.rnapol), gEr, [-9 + s * 1.6, 4, 0]));
    const erRibo = new THREE.Group(); erRibo.position.set(-9, 8.2, 0); gEr.add(erRibo);
    mesh(lumpy(2.9, 0.05, 1), std(P.ribo, { transparent: true, opacity: 0.75 }), erRibo, [0, 0, 0], [1.1, 0.85, 1]);
    mesh(lumpy(2, 0.07, 4), std(P.ribo.clone().multiplyScalar(0.8)), erRibo, [0, 2.6, 0], [1.3, 0.6, 1]);
    const peptidase = mesh(lumpy(1.5, 0.12, 9), std(P.rnapol), gEr, [-6.2, 2, 0]);
    const erChain = beads(gEr, PROTEIN.length, resColor, 0.42);
    const bonds = DISULFIDES.map(() => mesh(stick, std(P.disulf, { emissiveIntensity: 0.9 }), gEr));
    const stressRings = [0, 1, 2].map(i => { const o = mesh(new THREE.TorusGeometry(1.6 + i * 1.1, 0.12, 8, 40), std(P.cut), gEr, [6, -7, 0]); return o; });
    const second = beads(gEr, 86, (i) => resColor(i + 24), 0.34);
    addLabel('Cytosol', 'ribo', gEr, new V3(13, 10, 0), ['er']);
    addLabel('ER lumen', 'cpeptide', gEr, new V3(-16, -9, 0), ['er']);
    addLabel('Sec61 channel', 'rnapol', gEr, new V3(-14.8, 4, 3.4), ['er']);
    const caseTag = addLabel('Signal peptidase', 'rnapol', gEr, new V3(-2.4, 2, 2), ['er']);
    const erTag = addLabel('', 'disulf', gEr, new V3(7, -13, 0), ['er']);
    /* The folded shape is a diagram: B chain and A chain as two short ladders with C-peptide looping between them. */
    const folded = (() => {
      const key = [[25, -5, 1.6], [31, -2.2, 1.6], [43, 3, 1.6], [54, 5.6, 0.2], [57, 6, -1.4], [72, 0, -7], [87, -5.8, -3.4], [90, -4.6, -1.9], [95, -2.4, -0.9], [96, -2.0, -0.4], [100, -0.4, -2.2], [109, 3.2, -0.6], [110, 4.2, -1.4]];
      return (res) => { let i = 0; while (i < key.length - 2 && res > key[i + 1][0]) i++; const [a, ax, ay] = key[i], [b, bx, by] = key[i + 1]; const u = clamp((res - a) / (b - a)); return new V3(mix(ax, bx, u), mix(ay, by, u) + (res > 57 && res < 87 ? 0 : Math.sin(res * 1.7) * 0.25), Math.cos(res * 1.7) * 0.3); };
    })();
    const est = { t0: 0 };
    function erTick(t) {
      const o = erOutcome(W.variant), u = reduceMotion ? 20 : t - est.t0;
      const grown = Math.floor(clamp(u / 5) * PROTEIN.length);
      const fold = ease.inOut(clamp((u - 6) / 2.6));
      const cutAway = o.signalCut ? ease.inOut(clamp((u - 3) / 1.2)) : 0;
      const pts = erChain.pose((i) => {
        const res = i + 1;
        if (!o.entersER) { const a = i * 0.36, r = 1.4 + i * 0.035; return new V3(-4 + Math.sin(a) * r * 1.5 + i * 0.04, 10.2 + Math.cos(a) * r * 0.55, Math.sin(i * 0.5)); }
        if (res <= 24) {                              // signal peptide: anchored at the channel, then left in the membrane
          const held = new V3(-9 + 0.9 + Math.sin(res) * 0.25, 6 - res * 0.22, Math.cos(res) * 0.25);
          const parked = new V3(-12.6 + Math.sin(res * 1.7) * 0.35, 5.2 - (res % 8) * 0.34, 1 + Math.floor(res / 8) * 0.5);
          return held.lerp(parked, cutAway);
        }
        const back = Math.max(0, grown - res);        // distance from the end still in the channel
        const loose = back < 9 ? new V3(-9, 6 - back * 0.75, 0) : new V3(-9 + Math.sin((back - 9) * 0.22) * 5 + (back - 9) * 0.13, -0.8 - (1 - Math.cos((back - 9) * 0.3)) * 3.4, Math.sin(back * 0.4) * 1.2);
        let target = folded(res).multiplyScalar(1.15).add(new V3(5.5, -5.2, 0));
        if (!o.leaves && o.entersER) target = target.add(new V3(Math.sin(res * 2.3) * 1.6, Math.cos(res * 1.7) * 1.4, Math.sin(res * 3.1)));
        return loose.lerp(target, fold);
      }, (i) => i < grown);
      erRibo.position.set(-9, o.entersER ? 8.2 : 14.6, 0);
      peptidase.visible = o.entersER; peptidase.position.set(-6.2 - Math.sin(clamp((u - 2.4) / 1.2) * Math.PI) * 2.2, 2.2, 0.5); caseTag.stages = o.entersER ? ['er'] : [];
      bonds.forEach((b, i) => {
        const show = fold > 0.95 && i < o.bonds && u > 9 + i * 0.6; b.visible = show;
        if (show) setStick(b, pts[DISULFIDES[i][0] - 1], pts[DISULFIDES[i][1] - 1], 0.22);
      });
      const stressed = W.variant === 'misfold' && u > 10;
      stressRings.forEach((r, i) => { r.visible = stressed; r.scale.setScalar(1 + ((t * 0.7 + i / 3) % 1) * 2.2); });
      second.pose((i) => folded(i + 25).multiplyScalar(0.8).add(new V3(15 - clamp((u - 10) / 2) * 5, -8.5, 1)).add(new V3(Math.sin(i * 2.9) * 1.1, Math.cos(i * 2.1), 0)), () => stressed);
      const msg = u < 3 ? 'Chain being made' : !o.entersER ? 'Stranded in the cytosol' : u < 6 ? 'Signal peptide cut off' : u < 9 ? 'Folding' : W.variant === 'misfold' ? (stressed ? 'Traps a normal copy: ER stress' : 'Misfolded') : u < 11.2 ? 'Disulfide bonds forming' : 'Folded proinsulin: ready to leave';
      const span = erTag.el.querySelector('span'); if (span.textContent !== msg) span.textContent = msg;
    }

    /* ================= 5. GOLGI ================= */
    const gGolgi = new THREE.Group(); scene.add(gGolgi);
    const LAYERS = [-8, -4, 0, 4, 8];
    LAYERS.forEach((x, i) => {                        // curved, flattened sacs, bulging toward the cis face
      const half = 8.6 - Math.abs(i - 2) * 0.7;
      const pts = []; for (let k = 0; k <= 16; k++) { const y = -half + half * k / 8; pts.push(new V3(0, y, 0).setX(0.045 * y * y - 1.2)); }
      const mat = std(P.golgi, { transparent: true, opacity: 0.55, depthWrite: false, emissiveIntensity: 0.2 + i * 0.05 });
      const sac = new THREE.Group(); sac.position.x = x; sac.scale.z = 2.6; gGolgi.add(sac);
      mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.85, 14, false), mat, sac);
      [pts[0], pts[pts.length - 1]].forEach(q => mesh(atomGeo, mat, sac, q, [1.25, 1.25, 0.6]));
    });
    mesh(new THREE.TorusGeometry(10, 0.8, 12, 48, 2.2), std(C.membrane, { transparent: true, opacity: 0.6 }), gGolgi, [-17, 0, 0]).rotation.z = -1.1;
    const DEST = { insulin: new V3(19, 7.5, 0), constitutive: new V3(23, 0, 0), lyso: new V3(19, -8, 0) };
    mesh(atomGeo, std(P.insulin, { transparent: true, opacity: 0.35, depthWrite: false }), gGolgi, DEST.insulin, 2.8);
    mesh(new THREE.BoxGeometry(0.7, 10, 5), std(C.membrane, { transparent: true, opacity: 0.5 }), gGolgi, [24, 0, 0]);
    mesh(atomGeo, std(C.lyso, { transparent: true, opacity: 0.45, depthWrite: false }), gGolgi, DEST.lyso, 2.8);
    const golgiTags = { insulin: addLabel('Granule (waits)', 'insulin', gGolgi, new V3(18.5, 13.2, 0), ['golgi']), constitutive: addLabel('Cell surface', 'membrane', gGolgi, new V3(21.5, -3.4, 4), ['golgi']), lyso: addLabel('Lysosome', 'lyso', gGolgi, new V3(18, -11.8, 0), ['golgi']) };
    addLabel('From the ER', 'membrane', gGolgi, new V3(-17, -9.6, 0), ['golgi']);
    addLabel('cis', 'golgi', gGolgi, new V3(-8, 10.2, 0), ['golgi']);
    addLabel('trans', 'golgi', gGolgi, new V3(8, 10.2, 0), ['golgi']);
    const CARGO = { insulin: P.insulin, constitutive: P.achain, lyso: P.sig };
    function vesicle(coat, cargo) {
      const o = new THREE.Group();
      o.add(new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 16), fresnelMat(coat, 1.5, 1.5)));
      if (cargo) for (let i = 0; i < 4; i++) mesh(atomGeo, atomMat(cargo), o, randDir().multiplyScalar(0.55), 0.36);
      return o;
    }
    function golgiTick(t) {
      const color = CARGO[W.cargo];
      Object.entries(golgiTags).forEach(([k, l]) => l.el.classList.toggle('on', k === W.cargo));
      if (due('go-cargo', 1.7, t)) {
        const z = rr(-1.5, 1.5);
        travel(gGolgi, vesicle(P.cpeptide, color), [new V3(-16, rr(-4, 4), z), new V3(-11, rr(-2, 2), z), new V3(-8, 0, z)], 1.6, {
          shrinkEnd: true,
          onDone: () => {
            for (let i = 0; i < 4; i++) fly(gGolgi, color, 0.34, [new V3(-8, rr(-3, 3), rr(-1, 1)), new V3(-4, rr(-3, 3), 0), new V3(0, rr(-3, 3), 0), new V3(4, rr(-3, 3), 0), new V3(8, rr(-1.5, 1.5), 0)], 4, { delay: i * 0.12 });
            every((tt) => { if (tt < t + 5.8) return true; const d = DEST[W.cargo]; travel(gGolgi, vesicle(C.membrane, CARGO[W.cargo]), [new V3(9, 0, 0), new V3(13.5, d.y * 0.6, 0), d.clone()], 2.4, { shrinkEnd: true }); return false; });
          },
        });
      }
      if (due('go-copi', 1.3, t)) { const i = 1 + Math.floor(rnd() * 4), s = rnd() < 0.5 ? -1 : 1; travel(gGolgi, vesicle(P.rnapol), [new V3(LAYERS[i], s * 7.6, 1), new V3(LAYERS[i] - 2, s * 11, 1), new V3(LAYERS[i - 1], s * 7.6, 1)], 2.2, { shrinkEnd: true }); }
    }

    /* ================= 6. GRANULE: processing and real structure ================= */
    const gGran = new THREE.Group(); scene.add(gGran);
    const gran = { cut: new THREE.Group(), one: new THREE.Group(), six: new THREE.Group() };
    Object.values(gran).forEach(o => gGran.add(o));
    const pro = beads(gran.cut, 86, (i) => resColor(i + 24), 0.5);
    const proBonds = DISULFIDES.map(() => mesh(stick, std(P.disulf, { emissiveIntensity: 0.9 }), gran.cut));
    const cutters = [['PC1/3', 0], ['PC2', 1]].map(([name, i]) => { const o = new THREE.Group(); mesh(lumpy(1.7, 0.13, i + 3), std(P.rnapol, { transparent: true, opacity: 0.85 }), o); const tx = textSprite(name, new THREE.Color(0xeadcff), 1.2); tx.position.set(0, 2.5, 1); tx.material.depthTest = false; o.add(tx); gran.cut.add(o); return o; });
    addLabel('B chain', 'bchain', gran.cut, new V3(-9, 5.2, 0), ['granule']);
    addLabel('A chain', 'achain', gran.cut, new V3(-9, -4.4, 0), ['granule']);
    const cpTag = addLabel('C-peptide', 'cpeptide', gran.cut, new V3(9, -8, 0), ['granule']);
    const cst = { t0: 0 };
    function cutPoint(i, free) {                       // i indexes proinsulin residues, starting at preproinsulin 25
      const res = i + 25, p = folded(res).multiplyScalar(1.35).add(new V3(-1, 2.2, 0));
      if (res >= 57 && res <= 87) return p.add(new V3(free * 11, -free * 3.5, free * 2));
      if (res === 55 || res === 56 || res === 88 || res === 89) return p.add(new V3(free * (res < 60 ? 6 : 3), -free * 8, 0));
      return p.add(new V3(-free * 3, 0, 0));
    }
    function cutTick(t) {
      const u = reduceMotion ? 20 : (t - cst.t0) % 12;
      const free = ease.inOut(clamp((u - 5) / 2.5));
      const pts = pro.pose((i) => cutPoint(i, free), (i) => { const res = i + 25; const basic = res === 55 || res === 56 || res === 88 || res === 89; return !(basic && free > 0.92); });
      proBonds.forEach((b, i) => setStick(b, pts[DISULFIDES[i][0] - 25], pts[DISULFIDES[i][1] - 25], 0.24));
      [[55, 0], [88, 1]].forEach(([res, i]) => {
        const site = cutPoint(res - 25, 0), a = ease.inOut(clamp((u - 1.2 - i * 1.4) / 1.6)), leave = clamp((u - 5.4) / 1.5);
        cutters[i].position.set(site.x + (i ? -1 : 1) * mix(9, 0, a) , site.y - mix(7, 0, a) - leave * 7, 2.4);
        cutters[i].visible = u > 0.9 && u < 7;
      });
      cpTag.anchor.copy(pts[72 - 25]).add(new V3(0, -2.6, 0));
    }
    function structure(parent, chainFilter, scale) {
      const root = new THREE.Group(); parent.add(root);
      const keep = HEXAMER.chains.filter(chainFilter);
      const center = new V3(); let n = 0;
      keep.forEach(c => c.ca.forEach(p => { center.add(new V3(...p)); n++; }));
      center.multiplyScalar(1 / n);
      const at = (p) => new V3(...p).sub(center).multiplyScalar(scale);
      keep.forEach(c => {
        const color = c.type === 'A' ? P.achain : P.bchain;
        const curve = new THREE.CatmullRomCurve3(c.ca.map(at));
        mesh(new THREE.TubeGeometry(curve, c.ca.length * 8, 0.85 * scale, 10, false), std(color, { emissiveIntensity: 0.2 }), root);
        [c.ca[0], c.ca[c.ca.length - 1]].forEach(p => mesh(atomGeo, atomMat(color), root, at(p), 0.95 * scale));
      });
      return { root, at };
    }
    const one = structure(gran.one, (c) => c.id === 'A1' || c.id === 'B1', 0.62);
    const six = structure(gran.six, () => true, 0.42);
    HEXAMER.zinc.forEach(z => { const o = dot(P.zinc, 0.9, 4.5); o.position.copy(six.at(z)); six.root.add(o); });
    addLabel('A chain (21)', 'achain', gran.one, new V3(-9, 9.5, 0), ['granule']);
    addLabel('B chain (30)', 'bchain', gran.one, new V3(9, -10.5, 0), ['granule']);
    addLabel('Two zinc ions (one behind the other)', 'zinc', gran.six, new V3(0, -13.2, 0), ['granule']);
    function granTick(t, dt) {
      Object.entries(gran).forEach(([k, o]) => { o.visible = k === W.view; });
      if (W.view === 'cut') cutTick(t);
      if (!reduceMotion) { one.root.rotation.y += dt * 0.5; six.root.rotation.y = Math.sin(t * 0.35) * 0.9; six.root.rotation.x = Math.sin(t * 0.23) * 0.35; }
    }

    /* ================= 7. EXOCYTOSIS ================= */
    const gExo = new THREE.Group(); scene.add(gExo);
    const sheet = [];
    {
      const geo = new THREE.SphereGeometry(0.3, 8, 6), mat = new THREE.MeshStandardMaterial({ color: 0x4f8f9a, emissive: 0x143038, roughness: 0.8 });
      for (let x = -20; x <= 20; x += 0.7) for (let z = -2.8; z <= 2.8; z += 0.7) [0.55, -0.55].forEach(dy => { const o = mesh(geo, mat, gExo, [x, dy, z]); sheet.push({ o, x, dy }); });
    }
    const capTube = mesh(new THREE.CylinderGeometry(3.4, 3.4, 46, 32, 1, true), new THREE.MeshStandardMaterial({ color: P.rbc.clone(), transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), gExo, [0, 12, 0]);
    capTube.rotation.z = Math.PI / 2;
    const granule = new THREE.Group(); gExo.add(granule);
    const granShell = new THREE.Mesh(new THREE.SphereGeometry(4.6, 48, 36), fresnelMat(P.insulin, 1.1, 1.8)); granule.add(granShell);
    const coreBits = []; for (let i = 0; i < 46; i++) { const p = randDir().multiplyScalar(Math.cbrt(rnd()) * 3.2); coreBits.push(mesh(atomGeo, atomMat(P.insulin), granule, p, 0.55)); }
    const snares = [-1, 1].map(s => [0, 1].map(k => mesh(stick, std(P.rnapol, { emissiveIntensity: 0.5 }), gExo)));
    const exoTag = addLabel('Docked granule', 'insulin', gExo, new V3(8.4, -6, 0), ['export']);
    addLabel('Blood capillary', 'rbc', gExo, new V3(-13, 16.6, 0), ['export']);
    addLabel('Cell membrane', 'membrane', gExo, new V3(-14, -2.4, 3), ['export']);
    addLabel('SNAREs', 'rnapol', gExo, new V3(-8, -5, 2), ['export']);
    const xst = { open: 0 };
    function exoTick(t, dt) {
      const go = W.ca === 'high';
      xst.open += ((go ? 1 : 0) - xst.open) * Math.min(1, dt * 0.9);
      const o = xst.open, y = mix(-6.2, -2.6, o);
      granule.position.set(0, y, 0); granShell.scale.set(1 + o * 0.35, 1 - o * 0.5, 1);
      sheet.forEach(s => {                             // the membrane parts and dips into an open pocket
        const d = Math.abs(s.x), hole = d < 4.6 * clamp((o - 0.45) * 2);
        s.o.visible = !hole; s.o.position.y = s.dy - o * 3.2 * Math.exp(-((d - 5) ** 2) / 8) * (d < 5 ? 1 : 0.8);
      });
      coreBits.forEach((b, i) => { b.visible = o < 0.55 || i % 3 === 0 && o < 0.9; });
      snares.forEach((pair, i) => {
        const s = i ? 1 : -1;
        setStick(pair[0], new V3(s * mix(5.8, 5, o), -0.6 - o, 0.5), new V3(s * mix(3.6, 4.6, o), mix(-3.2, -2.2, o), 0.5), 0.22);
        setStick(pair[1], new V3(s * mix(5.2, 4.6, o), -0.6 - o, -0.5), new V3(s * mix(3.2, 4.2, o), mix(-3.4, -2.4, o), -0.5), 0.22);
      });
      const span = exoTag.el.querySelector('span'), msg = o > 0.8 ? 'Fused and open' : 'Docked granule';
      if (span.textContent !== msg) span.textContent = msg;
      if (!go && due('exo-ca-out', 0.9, t)) { const x = rr(-14, 14); fly(gExo, P.calcium, 0.22, [new V3(x, rr(3, 7), 2), new V3(x + rr(-2, 2), rr(3, 7), 2)], 1.8); }
      if (go && o < 0.95 && due('exo-ca-in', 0.12, t)) { const x = (rnd() < 0.5 ? -1 : 1) * rr(6, 14); fly(gExo, P.calcium, 0.3, [new V3(x, 6, 1), new V3(x * 0.85, 0, 1), new V3(x * 0.45, -5, 2)], 1.5); }
      if (go && o > 0.7) {
        if (due('exo-insulin', 0.14, t)) { const x = rr(-2.5, 2.5), end = rr(8, 19); fly(gExo, P.insulin, 0.42, [new V3(x, -2.6, rr(-1, 1)), new V3(x * 1.4, 3, 0), new V3(x * 2, 11 + rr(-1.5, 1.5), 0), new V3(end, 12 + rr(-2, 2), 0)], 4); }
        if (due('exo-cpep', 0.14, t)) { const x = rr(-2.5, 2.5), end = rr(8, 19); fly(gExo, P.cpeptide, 0.3, [new V3(x, -2.6, rr(-1, 1)), new V3(x * 1.4, 3, 0), new V3(x * 2, 11 + rr(-1.5, 1.5), 0), new V3(end, 12 + rr(-2, 2), 0)], 4); }
      }
    }

    /* ================= camera and behaviors ================= */
    /* ================= CHROMATIN (1 unit ≈ 2 nm for nucleosomes; linkers compressed) ================= */
    const gChrom = new THREE.Group(); scene.add(gChrom);
    const chromatinBehavior = (() => {
      const CC = {};
      ['histone', 'acetyl-mark', 'methyl-mark', 'tf', 'strand-a', 'strand-b', 'rnapol', 'rna', 'co2'].forEach(k => CC[k] = col(k));
      const N = 10, PROM = 4;                       // the promoter lies in the linker after nucleosome 4
      const WR = 2.15, PITCH = 1.2, TURNS = 1.65, OCT_R = 1.55;
      const openPos = [-27, -20.5, -14, -7.5, -1, 15, 21.5, 28, 34.5, 41].map((x, i) => new V3(x - 6, Math.sin(i * 1.3) * 0.8, Math.cos(i * 0.9) * 0.6));
      const closedPos = [], closedQ = [], openQ = [];
      for (let i = 0; i < N; i++) {
        const a = i * 2 * Math.PI / 5;
        closedPos.push(new V3(-2 + Math.cos(a) * 4.4, -6.5 + i * 1.35, Math.sin(a) * 4.4));
        closedQ.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2 - 0.35, -a, 0)));
        openQ.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25 * Math.sin(i), 0.35 * Math.cos(i * 1.7), 0.1)));
      }
      // nucleosome cores: two layers of four histone lobes, with H3 tails that carry marks
      const shades = [1, 0.8, 0.65, 0.9].map(f => CC.histone.clone().multiplyScalar(f));
      const nucs = [];
      const tailMat = std(CC.histone.clone().multiplyScalar(0.7), { emissiveIntensity: 0.2 });
      const acMat = std(CC['acetyl-mark'], { emissiveIntensity: 0.6 }), meMat = std(CC['methyl-mark'], { emissiveIntensity: 0.6 });
      for (let i = 0; i < N; i++) {
        const g = new THREE.Group(); gChrom.add(g);
        for (let k = 0; k < 8; k++) {
          const a = (k % 4) / 4 * Math.PI * 2 + (k > 3 ? Math.PI / 4 : 0);
          const m = mesh(lumpy(1, 0.08, k + i), std(shades[k % 4], { emissiveIntensity: 0.18 }), g, [Math.cos(a) * 0.75, Math.sin(a) * 0.75, k > 3 ? 0.55 : -0.55], [0.85, 0.85, 0.62]);
          m.scale.multiplyScalar(OCT_R / 1.55);
        }
        const tails = [];
        for (let k = 0; k < 2; k++) {
          const dir = new V3(k ? -1 : 1, 0.6, k ? -0.5 : 0.5).normalize();
          const a = dir.clone().multiplyScalar(1.4), b = dir.clone().multiplyScalar(3.1);
          const t = mesh(stick, tailMat, g); setStick(t, a, b, 0.14);
          const ac = mesh(atomGeo, acMat, g, b.clone().add(dir.clone().multiplyScalar(0.25)), 0.3);
          const me = mesh(atomGeo, meMat, g, a.clone().lerp(b, 0.6).add(new V3(0, 0.3, 0)), 0.3);
          tails.push({ ac, me });
        }
        nucs.push({ g, tails });
      }
      const MAXB = 1500;
      const dnaBeads = new THREE.InstancedMesh(atomGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, emissive: 0x101826 }), MAXB);
      gChrom.add(dnaBeads);
      const methylDots = new THREE.InstancedMesh(atomGeo, meMat, 8); gChrom.add(methylDots);
      const cA = CC['strand-a'], cB = CC['strand-b'];
      // transcription machinery
      const tfG = new THREE.Group(); gChrom.add(tfG);
      const tfDefs = [['NEUROD1', 0.16, CC.tf], ['MAFA', 0.33, CC.tf.clone().lerp(new THREE.Color(0xff79c6), 0.35)], ['PDX1', 0.5, CC.tf.clone().lerp(new THREE.Color(0xffe45e), 0.4)]];
      const tfs = tfDefs.map(([name, u, c], k) => {
        const o = new THREE.Group(); tfG.add(o);
        mesh(lumpy(1, 0.12, k + 3), std(c, { emissiveIntensity: 0.4 }), o, null, [1.1, 0.95, 1]);
        o.add(glow(c, 3.2));
        addLabel(name, 'tf', o, new V3(0, 1.9, 0), ['chromatin']);
        return { o, u };
      });
      const mediator = mesh(lumpy(1, 0.14, 11), std(CC.co2, { emissiveIntensity: 0.15, transparent: true, opacity: 0.75 }), tfG, null, [3.2, 1.3, 1.6]);
      addLabel('Mediator', 'co2', mediator, new V3(0, 1.4, 0), ['chromatin']);
      const pol = new THREE.Group(); tfG.add(pol);
      mesh(lumpy(1, 0.1, 7), std(CC.rnapol, { emissiveIntensity: 0.35 }), pol, null, [1.9, 1.7, 1.7]);
      addLabel('RNA polymerase II', 'rnapol', pol, new V3(0, 2.6, 0), ['chromatin']);
      const rna = new THREE.InstancedMesh(atomGeo, std(CC.rna, { emissiveIntensity: 0.4 }), 40); tfG.add(rna);
      const markers = new THREE.Group(); gChrom.add(markers);
      addLabel('Histone octamer', 'histone', nucs[1].g, new V3(0, -3.4, 0), ['chromatin']);
      const acHolder = new THREE.Group(), meHolder = new THREE.Group(); nucs[2].g.add(acHolder); nucs[7].g.add(meHolder);
      addLabel('Acetylated tails', 'acetyl-mark', acHolder, new V3(1.5, 3.8, 0), ['chromatin']);
      addLabel('Methyl marks', 'methyl-mark', meHolder, new V3(1.5, 3.8, 0), ['chromatin']);
      const promHolder = new THREE.Group(); markers.add(promHolder);
      addLabel('Promoter · nucleosome-free', 'strand-a', promHolder, new V3(0, -2.2, 0), ['chromatin']);
      const linkHolder = new THREE.Group(); markers.add(linkHolder);
      addLabel('Linker DNA', 'strand-a', linkHolder, new V3(0, -1.4, 0), ['chromatin']);
      const compactHolder = new THREE.Group(); compactHolder.position.set(-2, 7.5, 0); markers.add(compactHolder);
      addLabel('Compact heterochromatin', 'histone', compactHolder, new V3(0, 0, 0), ['chromatin']);
      // geometry of one wrap, in the nucleosome's own frame (axis along z)
      const wrapPt = (th) => new V3(WR * Math.sin(th), -WR * Math.cos(th), PITCH * th / (2 * Math.PI));
      const wrapTan = (th) => new V3(WR * Math.cos(th), WR * Math.sin(th), PITCH / (2 * Math.PI)).normalize();
      const TH = TURNS * Math.PI;
      const st = { o: W.gene === 'beta' ? 1 : 0, elapsed: 0, key: '' };
      const m4 = new THREE.Matrix4(), q0 = new THREE.Quaternion(), s3 = new V3();
      let promCurve = null;
      function bez(p0, t0, p1, t1, k) { const d = p0.distanceTo(p1) * 0.4; return new THREE.CubicBezierCurve3(p0, p0.clone().add(t0.clone().multiplyScalar(d * k)), p1.clone().sub(t1.clone().multiplyScalar(d * k)), p1); }
      function layout(o, t) {
        const e = ease.inOut(o);
        const frames = nucs.map((n, i) => {
          const p = closedPos[i].clone().lerp(openPos[i], e);
          if (!reduceMotion) p.y += Math.sin(t * 0.6 + i) * 0.12 * e;
          const q = closedQ[i].clone().slerp(openQ[i], e);
          n.g.position.copy(p); n.g.quaternion.copy(q);
          n.tails.forEach(tl => { tl.ac.visible = o > 0.5; tl.me.visible = o < 0.5; tl.ac.scale.setScalar(0.3 * Math.max(0.01, (o - 0.5) * 2)); tl.me.scale.setScalar(0.3 * Math.max(0.01, (0.5 - o) * 2)); });
          return { p, q };
        });
        // walk the DNA path and drop beads every 0.42 units
        const pts = [];
        const toW = (f, v) => v.clone().applyQuaternion(f.q).add(f.p);
        const dirW = (f, v) => v.clone().applyQuaternion(f.q);
        const pushCurve = (c, n) => { for (let k = 0; k <= n; k++) pts.push(c.getPoint(k / n)); };
        const first = frames[0], last = frames[N - 1];
        const entry0 = toW(first, wrapPt(-TH)), tan0 = dirW(first, wrapTan(-TH));
        pushCurve(new THREE.LineCurve3(entry0.clone().sub(tan0.clone().multiplyScalar(5)), entry0), 12);
        frames.forEach((f, i) => {
          for (let k = 0; k <= 48; k++) pts.push(toW(f, wrapPt(-TH + 2 * TH * k / 48)));
          if (i < N - 1) {
            const a = toW(f, wrapPt(TH)), ta = dirW(f, wrapTan(TH)), nf = frames[i + 1];
            const b = toW(nf, wrapPt(-TH)), tb = dirW(nf, wrapTan(-TH));
            const c = bez(a, ta, b, tb, 1);
            if (i === PROM) promCurve = c;
            pushCurve(c, Math.max(4, Math.ceil(a.distanceTo(b) / 0.3)));
          }
        });
        const exitL = toW(last, wrapPt(TH)), tanL = dirW(last, wrapTan(TH));
        pushCurve(new THREE.LineCurve3(exitL, exitL.clone().add(tanL.multiplyScalar(5))), 12);
        let n = 0, acc = 0;
        for (let k = 1; k < pts.length && n < MAXB; k++) {
          acc += pts[k].distanceTo(pts[k - 1]);
          if (acc < 0.42) continue;
          acc = 0; s3.setScalar(0.5); m4.compose(pts[k], q0, s3); dnaBeads.setMatrixAt(n, m4); dnaBeads.setColorAt(n, n % 2 ? cA : cB); n++;
        }
        dnaBeads.count = n; dnaBeads.instanceMatrix.needsUpdate = true; if (dnaBeads.instanceColor) dnaBeads.instanceColor.needsUpdate = true;
        // marks and machinery placed along the promoter linker
        const me = Math.max(0, 1 - o * 2);
        for (let k = 0; k < 8; k++) { const p = promCurve.getPoint(0.12 + k * 0.1).add(new V3(0, 0.7, 0)); s3.setScalar(0.28 * Math.max(0.01, me)); m4.compose(p, q0, s3); methylDots.setMatrixAt(k, m4); }
        methylDots.instanceMatrix.needsUpdate = true; methylDots.visible = me > 0.02;
        const tfOn = Math.max(0, (o - 0.55) / 0.45);
        tfG.visible = tfOn > 0.01;
        // labels hide only when their own parent is hidden, so toggle each machinery piece too
        tfs.forEach(({ o: g_ }) => { g_.visible = tfG.visible; }); mediator.visible = pol.visible = tfG.visible;
        tfs.forEach(({ o: g_, u }, k) => { const p = promCurve.getPoint(u); p.y += 1.2 + (1 - tfOn) * 6; g_.position.copy(p); g_.scale.setScalar(Math.max(0.01, tfOn)); });
        const mid = promCurve.getPoint(0.34); mediator.position.set(mid.x + 1, mid.y + 4 + (1 - tfOn) * 6, mid.z); mediator.scale.set(3.2, 1.3, 1.6).multiplyScalar(Math.max(0.01, tfOn));
        const tss = promCurve.getPoint(0.72); pol.position.set(tss.x, tss.y + 1.1 + (1 - tfOn) * 8, tss.z); pol.scale.setScalar(Math.max(0.01, tfOn));
        const grow = tfOn >= 0.99 ? Math.min(40, Math.floor(((reduceMotion ? 6 : st.elapsed) % 8) * 7)) : 0;
        for (let k = 0; k < 40; k++) { const p = new V3(pol.position.x + 1.4 + Math.sin(k * 0.5) * 0.6, pol.position.y + 1.2 + k * 0.32, pol.position.z + Math.cos(k * 0.5) * 0.6); s3.setScalar(k < grow ? 0.3 : 0.001); m4.compose(p, q0, s3); rna.setMatrixAt(k, m4); }
        rna.instanceMatrix.needsUpdate = true;
        promHolder.position.copy(promCurve.getPoint(0.5)); promHolder.visible = o > 0.7;
        linkHolder.position.copy(frames[6].p.clone().lerp(frames[7].p, 0.5)); linkHolder.visible = o > 0.7;
        compactHolder.visible = o < 0.3;
        acHolder.visible = o > 0.6; meHolder.visible = o < 0.4;
      }
      return {
        enter() { st.elapsed = 0; st.key = ''; if (!Object.hasOwn(LESSON, 'pf-chromatin')) LESSON['pf-chromatin'] = W.gene; st.o = LESSON['pf-chromatin'] === 'beta' ? 1 : 0; layout(st.o, 0); },
        tick(t, dt) {
          const want = (LESSON['pf-chromatin'] || W.gene) === 'beta' ? 1 : 0;
          if (!reduceMotion) st.elapsed += dt;
          st.o = reduceMotion ? want : st.o + Math.sign(want - st.o) * Math.min(Math.abs(want - st.o), dt * 0.45);
          layout(st.o, st.elapsed);
          const key = LESSON['pf-chromatin'];
          if (key !== st.key) { st.key = key; const el = $('#chromCaption'); if (el) el.textContent = CHROMATIN_TEXT[key]; }
        },
      };
    })();

    const POSES = {
      chromatin: { pos: new V3(-4, 9, 58), target: new V3(1, 1, 0), group: 'pfChromatin', w: 33 },
      gene: { pos: new V3(0, 2, 56), target: new V3(0, -2, 0), group: 'pfGene', w: 25 },
      mrna: { pos: new V3(0, 0, 58), target: new V3(1, -2, 0), group: 'pfRna', w: 32 },
      translate: { pos: new V3(0, 3, 56), target: new V3(0, 4.2, 0), group: 'pfRibo', w: 16 },
      er: { pos: new V3(0, 1, 56), target: new V3(-1, 0.5, 0), group: 'pfEr', w: 20 },
      golgi: { pos: new V3(0, 5, 60), target: new V3(2.5, 0, 0), group: 'pfGolgi', w: 29 },
      granule: { pos: new V3(0, 0, 54), target: new V3(0, -1, 0), group: 'pfGran', w: 17 },
      export: { pos: new V3(0, 1, 56), target: new V3(0, 4, 0), group: 'pfExo', w: 20 },
    };
    const enter = (id, extra) => () => { current = id; timers.clear(); if (extra) extra(); syncPlay(); renderRead(); };
    const B = {
      chromatin: chromatinBehavior,
      gene: { enter: enter('gene', () => { gst.x = -8; }), tick: geneTick },
      mrna: { enter: enter('mrna', () => { W.step = 0; W.play = !reduceMotion; rst.s = 0; rst.since = 0; }), tick: rnaTick },
      translate: { enter: enter('translate', () => { W.codon = 1; W.tplay = !reduceMotion; shownCodon = -1; }), tick: riboTick },
      er: { enter: enter('er', () => { est.t0 = now; B.er.next = now + 17; }), tick(t) { if (t > this.next) { est.t0 = t; this.next = t + 17; } erTick(t); } },
      golgi: { enter: enter('golgi'), tick: golgiTick },
      granule: { enter: enter('granule', () => { cst.t0 = now; }), tick: granTick },
      export: { enter: enter('export', () => { xst.open = 0; }), tick: exoTick },
    };
    onChange = (name) => {
      if (current === 'er' && (name === 'variant' || name === 'replay')) { est.t0 = now; B.er.next = now + 17; }
      if (current === 'golgi' && name === 'cargo') { clearAgents(); timers.clear(); }
      if (current === 'granule' && name === 'view') cst.t0 = now;
    };

    return {
      groups: { pfChromatin: gChrom, pfGene: gGene, pfRna: gRna, pfRibo: gRibo, pfEr: gEr, pfGolgi: gGolgi, pfGran: gGran, pfExo: gExo },
      unitsPerNm: { pfChromatin: 0.5 },
      fog: { pfChromatin: 0.003, pfGene: 0.003, pfRna: 0.002, pfRibo: 0.002, pfEr: 0.002, pfGolgi: 0.002, pfGran: 0.001, pfExo: 0.002 },
      depth: { pfChromatin: 3.3, pfGene: 3.1, pfRna: 3.05, pfRibo: 3.2, pfEr: 2.2, pfGolgi: 1.6, pfGran: 2.6, pfExo: 1.3 },
      fadeText: { pfChromatin: 'Into the nucleus', pfGene: 'Onto the gene', pfRibo: 'To the ribosome', pfEr: 'To the ER', pfGolgi: 'To the Golgi', pfGran: 'Into a granule', pfExo: 'To the cell edge' },
      poses: POSES, behaviors: B,
    };
  },
});
})();
