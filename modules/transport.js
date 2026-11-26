/* Membranes and transport: passive crossings, red cell osmosis, the sodium–potassium pump, channels versus carriers,
   secondary active transport and polarized epithelia.
   Scenes use the atlas camera, lighting and chapter lifecycle. */
(() => {
  const credit = (links, limits) => '<p class="credit">Sources: ' + links.map(([href, text]) => '<a href="' + href + '" target="_blank" rel="noopener">' + text + '</a>').join(' · ') + '. ' + limits + '</p>';
  const OS = {
    passive: ['https://openstax.org/books/biology-2e/pages/5-2-passive-transport', 'OpenStax Biology 2e, 5.2 Passive Transport'],
    active: ['https://openstax.org/books/biology-2e/pages/5-3-active-transport', 'OpenStax Biology 2e, 5.3 Active Transport'],
    membrane: ['https://openstax.org/books/anatomy-and-physiology-2e/pages/3-1-the-cell-membrane', 'OpenStax Anatomy &amp; Physiology 2e, 3.1 The Cell Membrane'],
    epith: ['https://openstax.org/books/anatomy-and-physiology-2e/pages/4-2-epithelial-tissue', 'OpenStax Anatomy &amp; Physiology 2e, 4.2 Epithelial Tissue'],
    reab: ['https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption', 'OpenStax Anatomy &amp; Physiology 2e, 25.6 Tubular Reabsorption'],
    wright: ['https://doi.org/10.1152/physrev.00055.2009', 'Wright et al., biology of human sodium glucose transporters (Physiol Rev, 2011)'],
  };
  // Channels versus carriers: a linear channel against a saturating carrier (Michaelis–Menten), in arbitrary units.
  const CONC = { low: 1, mid: 4, high: 12 }, KM = 2.5, VMAX = 1;
  const carrierRate = c => VMAX * c / (KM + c);
  function kineticsSVG() {
    const c = CONC[LESSON['tp-conc'] || 'mid'], open = (LESSON['tp-gate'] || 'open') === 'open';
    const X = v => 34 + v / 16 * 250, Y = v => 128 - v * 92;
    let curve = '';
    for (let v = 0; v <= 16; v += 0.25) curve += (v ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(carrierRate(v)).toFixed(1);
    const ch = v => Math.min(1.35, v * 0.085);
    return '<svg class="kinetics" viewBox="0 0 300 150" role="img" aria-label="Transport rate against concentration: the channel rises in a straight line while the carrier levels off" style="width:100%;max-width:420px;display:block">' +
      '<path d="M34 128H290M34 128V14" stroke="var(--muted)" fill="none" stroke-width="1"/>' +
      '<path d="M34 ' + Y(VMAX) + 'H290" stroke="var(--muted)" stroke-dasharray="3 4" fill="none" stroke-width=".8"/><text x="288" y="' + (Y(VMAX) - 4) + '" fill="var(--muted)" font-size="9" text-anchor="end">carrier maximum (all carriers busy)</text>' +
      '<path d="M' + X(KM) + ' 128V' + Y(carrierRate(KM)) + '" stroke="var(--co2)" stroke-dasharray="2 3" fill="none" stroke-width=".8"/><text x="' + (X(KM) + 3) + '" y="124" fill="var(--co2)" font-size="9">K<tspan baseline-shift="sub" font-size="7">m</tspan></text>' +
      '<path d="M' + X(0) + ' ' + Y(0) + 'L' + X(15.9) + ' ' + Y(ch(15.9)) + '" stroke="var(--atp)" fill="none" stroke-width="2"' + (open ? '' : ' opacity=".25"') + '/>' +
      '<path d="' + curve + '" stroke="var(--co2)" fill="none" stroke-width="2"/>' +
      '<circle cx="' + X(c) + '" cy="' + Y(open ? ch(c) : 0) + '" r="4" fill="var(--atp)"/><circle cx="' + X(c) + '" cy="' + Y(carrierRate(c)) + '" r="4" fill="var(--co2)"/>' +
      '<text x="' + (X(open ? 5 : 9.5) - 6) + '" y="' + (Y(ch(open ? 5 : 9.5)) - 6) + '" fill="var(--atp)" font-size="10" text-anchor="end">channel' + (open ? '' : ' (closed)') + '</text><text x="' + X(11) + '" y="' + (Y(carrierRate(11)) + 14) + '" fill="var(--co2)" font-size="10">carrier</text>' +
      '<text x="162" y="145" fill="var(--muted)" font-size="9" text-anchor="middle">concentration on the high side →</text><text x="10" y="70" fill="var(--muted)" font-size="9" transform="rotate(-90 10 70)" text-anchor="middle">rate →</text></svg>';
  }
  const gradientText = g => 'Sodium gradient: ' + Math.round(g * 100) + '% of normal. ' + (g > 0.8 ? 'Symport and exchange run at full speed.' : g > 0.4 ? 'The gradient is running down: glucose uptake slows and calcium removal weakens.' : 'Little driving force is left. Glucose uptake has nearly stopped and calcium builds up inside.');
  const epiText = () => {
    const tight = (LESSON['tp-tj'] || 'tight') === 'tight', polar = (LESSON['tp-polar'] || 'normal') === 'normal';
    return (polar ? 'Glucose enters at the apical side and leaves at the basolateral side, so it moves from lumen to blood. ' : 'With carriers scattered on both sides, glucose enters and leaves on the same side and there is little net transport. ') +
      (tight ? 'Tight junctions turn back solutes trying to slip between the cells.' : 'Leaky junctions let some solutes slip between the cells, the paracellular route.');
  };
  whenLesson('tp-conc', () => { const el = $('#tpKinetics'); if (el) el.innerHTML = kineticsSVG(); });
  whenLesson('tp-gate', () => { const el = $('#tpKinetics'); if (el) el.innerHTML = kineticsSVG(); });
  const updateEpi = () => { const el = $('#tpEpiCaption'); if (el) el.textContent = epiText(); };
  whenLesson('tp-tj', updateEpi); whenLesson('tp-polar', updateEpi);
  const solutions = {
    balanced: ['Balanced', 'Water enters and leaves at equal average rates. The red blood cell keeps its volume.', 1, 1],
    dilute: ['Dilute outside', 'With fewer nonpenetrating solute particles outside, water initially enters faster than it leaves. The cell swells and its hemoglobin becomes more dilute.', 1.12, 1.55],
    concentrated: ['Concentrated outside', 'With more nonpenetrating solute particles outside, water initially leaves faster than it enters. The cell shrinks and its hemoglobin becomes more concentrated.', .85, .8],
  };
  const solution = () => solutions[$('#transportSolution')?.value] || solutions.balanced;
  document.addEventListener('change', event => {
    if (event.target.id === 'transportSolution') $('#transportCaption').textContent = solution()[1];
  });
  const chapters = [
    { id: 'permeability', short: 'Selective passage', where: 'A patch of membrane', title: 'Three paths across one membrane',
      legend: [['rbc','Oxygen (O₂)'], ['atp','Glucose (C₆H₁₂O₆) & GLUT1'], ['glucose','Sodium (Na⁺)']],
      html: () => '<p class="lede">Follow three molecules from the fluid outside the cell (above) toward the cytoplasm (below). The coral heads face the watery fluid on each surface. Two golden fatty-acid tails extend from each head toward the membrane interior. Blue proteins span both layers.</p><ul class="facts"><li><b>Left · Oxygen</b> is small and nonpolar. It dissolves in the oily membrane interior and diffuses across. In a red blood cell, oxygen can bind to hemoglobin for delivery to tissues.</li><li><b>Center · Glucose</b> binds GLUT1. The carrier changes shape, exposes the binding site to the other side and releases glucose. Red cells use that fuel for glycolysis.</li><li><b>Right · Sodium</b> carries a charge. An open ion channel provides a water-filled passage across the oily interior.</li></ul><p>The animation traces individual inward crossings. Net passive transport follows the concentration gradient for uncharged molecules and the electrochemical gradient for ions. None of these crossings directly consumes ATP.</p>' + credit([OS.passive], 'The membrane patch is schematic: molecules are enlarged and crossings are slowed and shown one at a time. Real membranes also carry cholesterol and many more proteins, and channels open and close.') },
    { id: 'osmosis', short: 'Red cell osmosis', where: 'The whole red blood cell', title: 'Water moves even when cell size holds steady',
      legend: [['rbc','Red blood cell'], ['electron','Water (H₂O)']],
      html: () => '<p class="lede">Water crosses the red blood cell membrane in both directions. A difference in the concentration of solutes that stay on their own side changes the balance of that traffic.</p><label>Surrounding fluid <select id="transportSolution">' + Object.entries(solutions).map(([key,v]) => '<option value="'+key+'">'+v[0]+'</option>').join('') + '</select></label><p id="transportCaption" aria-live="polite">'+solutions.balanced[1]+'</p><p>Each bent red-and-white symbol traces one water molecule. Compare the inward and outward streams as the cell changes shape. The scene illustrates the initial response to each fluid. As a new equilibrium is approached, net flow slows.</p><p>Hemoglobin remains inside the cell, so changing the amount of water changes its concentration. Extreme swelling can rupture the membrane.</p><a href="#blood/rbc">Explore hemoglobin in the red blood cell</a>' + credit([OS.passive], 'Volume changes are exaggerated for visibility and the water symbols are greatly enlarged. In red cells most water crosses through aquaporin-1 channels, with some passing directly through the lipid bilayer.') },
    { id: 'pump', short: 'Ion pump', where: 'The sodium–potassium pump', title: 'One ATP moves three sodium out and two potassium in',
      legend: [['glucose','Sodium (Na⁺)'], ['atp','Potassium (K⁺)']],
      html: () => '<p class="lede">Watch one transport cycle. The upper side faces the surrounding fluid. The lower side faces the cytoplasm. The blue pump spans both rows of coral lipid heads and their inward-facing golden tails. The circled Na&#8314; and K&#8314; are sodium and potassium ions. Follow them through the pump. Glucose and albumin are shown in the surrounding plasma, and hemoglobin and ATP in the cytoplasm. The glucose symbol shows its carbon-and-oxygen ring. The protein symbols show three domains for albumin and four subunits for hemoglobin. ATP has a chain of three gold phosphate groups. Symbols are enlarged for visibility. Only sodium and potassium cross through this pump. ATP supplies energy on the inside.</p><ol class="facts"><li>Three sodium ions bind from inside. ATP transfers a phosphate to the pump, changing its shape so it opens outward and releases sodium.</li><li>Two potassium ions bind from outside. The pump releases its phosphate and returns to its inward-facing shape, releasing potassium inside.</li></ol><p>Each cycle moves one net positive charge outward. Over many cycles the pump maintains high potassium inside and high sodium outside despite ongoing leaks. These gradients help cells regulate volume and help neurons generate electrical signals.</p><p><a href="#tally">Follow the ATP supply</a> · <a href="#rest">See the gradients in a neuron</a> · <a href="#cotransport">See other carriers spend the sodium gradient</a></p>' + credit([OS.active], 'The pump cycle is simplified to two shapes. The real Na⁺/K⁺-ATPase passes through more intermediate states, and its α and β subunits are drawn as one rounded protein.') },
    { id: 'channels', short: 'Channels & carriers', where: 'Two kinds of transport protein', title: 'Channels open a pore; carriers change shape',
      legend: [['atp','Potassium (K⁺)'], ['co2','Glucose (C₆H₁₂O₆)'], ['pump','Transport proteins']],
      html: () => '<p class="lede">Left, a gated <b>potassium channel</b>. Right, the glucose carrier <b>GLUT1</b>. Both let solutes move down their gradients without ATP, but they work in very different ways.</p>' +
        lessonSeg('tp-gate', 'Channel gate', [['open','Open'], ['closed','Closed']]) + lessonSeg('tp-conc', 'Concentration on the high side', [['low','Low'], ['mid','Medium'], ['high','High']], 'mid') +
        '<div id="tpKinetics">' + kineticsSVG() + '</div>' +
        '<ul class="facts"><li><b>Channels</b> form a water-filled pore that is open or shut. When open, ions stream through in single file, often millions per second. Gates respond to voltage, a binding molecule, or stretch. A selectivity filter lets potassium through but not the smaller sodium ion, by matching how water normally surrounds each ion.</li>' +
        '<li><b>Carriers</b> (transporters) bind one or a few molecules, change shape to expose them to the other side, then release them. That is slower, roughly hundreds to thousands of molecules per second, and the rate <b>saturates</b>: once every carrier is busy, more glucose outside cannot speed things up. The concentration giving half the maximum rate is the K<sub>m</sub>.</li>' +
        '<li>GLUT1 has a K<sub>m</sub> for glucose of a few millimolar, below normal blood glucose (about 5 mM, 90 mg/dL), so red cells and the blood–brain barrier take up glucose steadily. GLUT2 in liver and beta cells has a much higher K<sub>m</sub>, so its uptake rises and falls with blood glucose.</li></ul>' +
        '<p><a href="#permeability">Back to the three crossing routes</a> · <a href="#spike">See gated sodium and potassium channels fire a nerve impulse</a> · <a href="#receptor">See insulin move GLUT4 carriers to the membrane</a></p>' +
        credit([OS.passive, OS.membrane], 'Rates in the scene are slowed by many orders of magnitude, and the curve shows shapes, not measured values. Real channels flicker between open and closed states, and GLUT1 is drawn as two rocking halves.') },
    { id: 'cotransport', short: 'Cotransport', where: 'Spending the sodium gradient', title: 'Secondary active transport rides the sodium gradient',
      legend: [['glucose','Sodium (Na⁺)'], ['atp','Potassium (K⁺)'], ['co2','Glucose'], ['calcium','Calcium (Ca²⁺)']],
      html: () => '<p class="lede">The sodium–potassium pump (left) spends ATP to keep sodium low inside the cell. Other carriers then let sodium flow back in and harness that downhill flow to move something else uphill. No ATP is used by those carriers directly, so this is called <b>secondary active transport</b>.</p>' +
        lessonSeg('tp-sglt', 'Symporter', [['sglt1','SGLT1 · 2 Na⁺ : 1 glucose'], ['sglt2','SGLT2 · 1 Na⁺ : 1 glucose']]) + lessonSeg('tp-pump', 'Na⁺/K⁺ pump', [['on','Running'], ['off','Blocked (digoxin-like)']]) +
        '<p id="tpGradient" class="lesson-phase" aria-live="polite">' + gradientText(1) + '</p>' +
        '<ul class="facts"><li><b>Symporters</b> move both cargoes the same way. SGLT1 in the small intestine and the late proximal tubule couples two sodium ions to each glucose, enough to pull glucose in against a steep gradient. SGLT2 in the early proximal tubule uses one sodium per glucose and reclaims most filtered glucose.</li>' +
        '<li><b>Antiporters</b> swap cargoes in opposite directions. The sodium–calcium exchanger (NCX) lets three sodium ions in for each calcium ion it pushes out, keeping cytoplasmic calcium very low in heart muscle and many other cells.</li>' +
        '<li>Block the pump and the sodium gradient slowly runs down. Glucose uptake falls and NCX removes less calcium. In heart muscle, digoxin uses this effect: a little more calcium stays inside, and each beat is a bit stronger.</li>' +
        '<li>SGLT2 inhibitors (gliflozins) block glucose reabsorption so excess glucose leaves in the urine. They are used for type 2 diabetes, heart failure and chronic kidney disease.</li></ul>' +
        '<p><a href="#pump">Review the pump cycle</a> · <a href="#proximal-tubule">See SGLTs reclaim glucose in the nephron</a> · <a href="#tally">Where the pump’s ATP comes from</a></p>' +
        credit([OS.active, OS.reab, OS.wright], 'Each carrier is drawn as two rocking halves with its cargo crossing together. Real carriers cycle through more states, and the gradient here falls within seconds, not the minutes to hours it takes in a cell.') },
    { id: 'epithelia', short: 'Epithelia', where: 'A sheet of absorbing epithelial cells', title: 'Polarized cells move cargo in one direction',
      legend: [['co2','Glucose'], ['glucose','Sodium (Na⁺)'], ['atp','Tight junctions'], ['rbc','Capillary blood'], ['fat','Other solutes']],
      html: () => '<p class="lede">An epithelium is a sheet of cells joined side to side. Its cells are <b>polarized</b>: the <b>apical</b> membrane faces the lumen and the <b>basolateral</b> membrane faces the blood, and each side carries a different set of transport proteins.</p>' +
        lessonSeg('tp-tj', 'Tight junctions', [['tight','Tight'], ['leaky','Leaky']]) + lessonSeg('tp-polar', 'Cell polarity', [['normal','Polarized'], ['lost','Lost']]) +
        '<p id="tpEpiCaption" class="lesson-phase" aria-live="polite">' + epiText() + '</p>' +
        '<ol class="lesson-sequence"><li><b>Apical entry.</b> SGLT carriers in the brush border of microvilli bring glucose in with sodium.</li><li><b>Across the cell.</b> Glucose builds up inside the cell, so it can flow downhill out the other side.</li><li><b>Basolateral exit.</b> GLUT2 lets glucose out toward the blood, and the Na⁺/K⁺ pump on this side keeps cell sodium low so apical entry continues.</li></ol>' +
        '<ul class="facts"><li><b>Tight junctions</b> seal the space between neighboring cells near the apical surface. They limit leakage between cells (the paracellular route) and act as a fence that keeps apical and basolateral proteins apart, which is what makes one-way transport possible.</li>' +
        '<li>Tightness varies. The proximal tubule is leaky, so water and some ions follow the absorbed solutes between cells. The collecting duct and the blood–brain barrier are tight, so what crosses is controlled by transporters and channels.</li>' +
        '<li>Hormones adjust the transporters: aldosterone adds sodium channels on the apical side and pumps on the basolateral side of collecting duct cells, and ADH inserts water channels.</li></ul>' +
        '<p><a href="#proximal-tubule">Watch glucose recovery in the proximal tubule</a> · <a href="#collecting-duct">See hormones tune the collecting duct</a> · <a href="#endocrine-receptors">How steroid hormones like aldosterone act</a> · <a href="#junc-tight">Tight junctions as gate and fence</a></p>' +
        credit([OS.epith, OS.membrane, OS.reab], 'Cells, microvilli and junctions are schematic and not to scale. Only one pathway is drawn per cell; real absorbing cells carry many more transporters and channels.') },
  ];
  function build({scene, addLabel, textSprite, glow}) {
    const groups = {}, poses = {}, behaviors = {}, fog = {};
    const sphere = new THREE.SphereGeometry(1, 16, 12);
    const material = color => new THREE.MeshStandardMaterial({color, roughness:.55});
    const cyan = 0x54dafe, gold = 0xffcf63, red = 0xeb5366;
    function bead(parent, color, radius, x, y, z = 0) {
      const mesh = new THREE.Mesh(sphere, material(color));
      mesh.scale.setScalar(radius);
      mesh.position.set(x,y,z);
      parent.add(mesh);
      return mesh;
    }
    // Compact molecular glyphs; sizes and protein domains are schematic.
    function symbol(name) {
      const model = new THREE.Group();
      const atom = (color,r,x,y,z=0) => bead(model,color,r,x,y,z);
      if (name === 'Glucose') {
        for (let i=0;i<6;i++) {
          const a = i*Math.PI/3, x=Math.cos(a), y=Math.sin(a);
          atom(i===0 ? red : 0x697788,.12,.21*x,.21*y,.035*(i%2));
          if (i===0) continue;
          if (i===5) atom(0x697788,.105,.38*x,.38*y);
          const distance = i===5 ? .52 : .37;
          atom(red,.095,distance*x,distance*y);
        }
      } else if (name === 'Oxygen') {
        atom(red,.18,-.13,0); atom(red,.18,.13,0);
      } else if (name === 'Water') {
        atom(red,.11,0,0);
        atom(0xffffff,.075,-.09,.07); atom(0xffffff,.075,.09,.07);
      } else if (name === 'Hemoglobin') {
        for (const x of [-.14,.14]) for (const y of [-.14,.14])
          atom(x*y>0 ? 0xc94568 : 0xe68c92,.20,x,y,.07*Math.sign(x*y));
      } else if (name === 'Albumin') {
        for (let i=0;i<3;i++) {
          const a=i*2*Math.PI/3;
          atom(0x99a8eb,.22,.17*Math.cos(a),.17*Math.sin(a)).scale.y=.27;
        }
      } else if (name === 'ATP') {
        atom(0x9792db,.18,-.42,.08); atom(0x64afbc,.14,-.20,-.04);
        for (let i=0;i<3;i++) atom(gold,.11,i*.18,-.04+.04*(i%2));
      } else {
        model.add(textSprite('Na\u207a',new THREE.Color(cyan),.54));
      }
      return model;
    }
    function membrane(parent, gaps) {
      // Keep the nearest row cut flush so the paired chains can be read in profile.
      const sites = [];
      for (let row = 0; row < 8; row++) {
        const z = .25 - row * .39;
        for (let column = 0; column < 23; column++) {
          const x = -5 + column * .45 + (row % 2) * .225;
          if (gaps.some(center => Math.hypot(x - center, z) < 1.03)) continue;
          const ripple = .10 * Math.sin(x * 1.13 + z * .54) + .04 * Math.cos(z * 2 - x);
          for (const side of [-1, 1]) sites.push({ x, z, ripple, side });
        }
      }
      const heads = new THREE.InstancedMesh(sphere, material(0xe98871), sites.length);
      // Each lipid has a straighter chain and one bent chain. Reuse both tube meshes.
      const chains = [[-.09,-.12,-.10,-.13],[.09,.14,.06,.02]].map((xs,index) => {
        const depths = [.12,.34,.53,.73];
        const path = new THREE.CatmullRomCurve3(xs.map((x,i) => new V3(x,-depths[i],.025*i)));
        const geometry = new THREE.TubeGeometry(path,8,.045,6,false);
        return new THREE.InstancedMesh(geometry,material(index ? 0xfac271 : 0xffdfa0),sites.length);
      });
      const stamp = new THREE.Object3D();
      sites.forEach(({x,z,ripple,side},i) => {
        stamp.position.set(x,ripple + side * .76,z);
        stamp.rotation.set(side < 0 ? Math.PI : 0,.22*Math.sin(x*3+z),0);
        stamp.scale.set(.237,.20,.227);
        stamp.updateMatrix();
        heads.setMatrixAt(i,stamp.matrix);
        stamp.scale.setScalar(1);
        stamp.updateMatrix();
        for (const chain of chains) chain.setMatrixAt(i,stamp.matrix);
      });
      parent.add(heads,...chains);
    }
    function protein(parent,x) {
      // Rounded, flared lobes surround the transport path and extend past both leaflets.
      const profile = [[0,-1.1],[.26,-1.06],[.38,-.85],[.32,-.36],
        [.29,.12],[.38,.72],[.36,.95],[.22,1.08],[0,1.12]];
      const geometry = new THREE.LatheGeometry(profile.map(([r,y]) => new THREE.Vector2(r,y)),24);
      return [-1,1].map(side => {
        const lobe = new THREE.Mesh(geometry,material(side < 0 ? 0x358db4 : 0x296f9c));
        lobe.position.x = x + side * .48;
        lobe.scale.z = 1.55;
        parent.add(lobe);
        return lobe;
      });
    }
    // Circled ion symbols for the newer chapters, one shared material per ion.
    const ionCache = {};
    function ionMat(text, color) {
      if (ionCache[text]) return ionCache[text];
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.beginPath(); ctx.arc(64,64,59,0,Math.PI*2); ctx.fillStyle = '#102031'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.stroke();
      ctx.font = 'bold ' + (text.length > 3 ? 40 : 50) + 'px Arial, sans-serif'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text,64,66);
      return (ionCache[text] = new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas), transparent:true, depthWrite:false}));
    }
    for (const ch of chapters) {
      const group = new THREE.Group();
      groups[ch.id] = group; scene.add(group); fog[ch.id] = .002;
      poses[ch.id] = { group:ch.id, target:new V3(), pos:new V3(0,ch.id === 'osmosis' ? 2 : 4.4,14), w:5.8 };
      const label = (name,x,y,color) => addLabel(name,color,group,new V3(x,y,0),[ch.id]);
      let draw;
      if (ch.id === 'permeability') {
        membrane(group,[0,3.3]);
        const carrier = protein(group,0); protein(group,3.3);
        const tracers = ['Oxygen','Glucose','Sodium'].map((name,i) => {
          const marker = symbol(name);
          marker.position.set((i-1)*3.3,0,.38);
          group.add(marker);
          return marker;
        });
        label('Lipid bilayer',-3.3,-2.7,'rbc'); label('GLUT1',0,-2.7,'atp'); label('Ion channel',3.3,-2.7,'electron');
        draw = t => {
          tracers.forEach((p,i) => { p.position.y = 2.3-4.6*((t/4+i*.27)%1); });
          carrier.forEach((p,i) => { p.rotation.z = (i?1:-1)*.24*Math.tanh(tracers[1].position.y*3); });
        };
      } else if (ch.id === 'osmosis') {
        const profile = [];
        for (let i=0;i<=64;i++) {
          const a=Math.PI*i/64, r=Math.sin(a);
          profile.push(new THREE.Vector2(2.8*r, -Math.cos(a)*(.32+1.5*r*r)));
        }
        const cell = new THREE.Mesh(new THREE.LatheGeometry(profile,64),material(red));
        group.add(cell); cell.rotation.x=.48;
        const water = Array.from({length:12},() => { const marker = symbol('Water'); group.add(marker); return marker; });
        draw = (t,dt) => {
          const [, , width,height] = solution();
          const blend = reduceMotion ? 1 : 1-Math.exp(-4*dt);
          cell.scale.x += (width-cell.scale.x)*blend; cell.scale.z=cell.scale.x;
          cell.scale.y += (height-cell.scale.y)*blend;
          water.forEach((p,i) => {
            const inward=i%2===0, speed=inward?width:1/width;
            const f=(t*.35*speed**5+i/12)%1;
            const radius=1.9+2.6*(inward?1-f:f), a=i*Math.PI/6;
            p.position.set(radius*Math.cos(a),radius*.42*Math.sin(a),radius*.7*Math.sin(a));
          });
        };
      } else if (ch.id === 'channels') {
        poses[ch.id].w = 7.4;
        membrane(group,[-2.4,2.4]);
        const pore = protein(group,-2.4), carrier = protein(group,2.4);
        const lid = bead(group,0xff4d5e,.42,-2.4,1.35,.1); lid.scale.set(.42 * 1.25, .42 * .35, .42 * 1.1);
        const kMat = ionMat('K\u207a','#ffcf63'), pool = Array.from({length:26},() => { const s = new THREE.Sprite(kMat); s.scale.setScalar(.5); s.visible = false; group.add(s); return s; });
        const waiting = Array.from({length:4},(_,i) => { const s = new THREE.Sprite(kMat); s.scale.setScalar(.5); group.add(s); s.userData.ph = i * 1.7; return s; });
        const outside = Array.from({length:8},(_,i) => { const g = symbol('Glucose'); g.scale.setScalar(.8); group.add(g); g.userData.ph = i * 2.1; return g; });
        const moving = symbol('Glucose'); moving.scale.setScalar(.9); group.add(moving);
        label('Gated K⁺ channel',-2.4,-3.25,'atp'); label('GLUT1 carrier',2.4,-3.25,'co2');
        label('Outside',-5,2.9,'electron'); label('Cytoplasm',-5,-3.25,'atp');
        const ions = []; let acc = 0, cyc = 0, idle = 0, lastT = 0;
        draw = (t, dt) => {
          const open = (LESSON['tp-gate'] || 'open') === 'open', c = CONC[LESSON['tp-conc'] || 'mid'];
          dt = reduceMotion ? 0 : Math.max(0, t - lastT); lastT = t;
          lid.position.x = -2.4 + (open ? .95 : 0); lid.rotation.z = open ? -.6 : 0;
          pore.forEach((p,i) => { p.rotation.z = (i ? 1 : -1) * (open ? .12 : 0); });
          acc += dt * (open ? c * .55 : 0);
          while (acc >= 1) { acc -= 1; const s = pool.find(x => !x.visible); if (s) { s.visible = true; s.userData.y = -2.6; ions.push(s); } }
          for (let i = ions.length - 1; i >= 0; i--) { const s = ions[i]; s.userData.y += dt * 4.2; s.position.set(-2.4 + Math.sin(s.userData.y * 3) * .06, s.userData.y, .5); if (s.userData.y > 2.7) { s.visible = false; ions.splice(i,1); } }
          waiting.forEach((s,i) => { s.position.set(-3.1 + (i % 2) * 1.4 + Math.sin(t + s.userData.ph) * .2, -1.95 - (i >> 1) * .45 + Math.cos(t * .8 + s.userData.ph) * .12, .6); });
          const nOut = { 1: 2, 4: 4, 12: 8 }[c] || 4;
          outside.forEach((g,i) => { g.visible = i < nOut; g.position.set(1.0 + (i % 4) * 1.05 + Math.sin(t * .7 + g.userData.ph) * .12, 2.15 + Math.floor(i / 4) * .75 + Math.cos(t + g.userData.ph) * .1, .4); });
          // carrier: bind outside, rock, release inside; waits between cycles when glucose is scarce
          const rate = carrierRate(c) * 1.4, ACTIVE = .9;
          if (reduceMotion) cyc = .5;
          else if (idle > 0) { idle -= dt; cyc = 0; }
          else { cyc += dt / ACTIVE; if (cyc >= 1) { cyc = 0; idle = Math.max(0, 1 / rate - ACTIVE); } }
          const u = cyc, rock = u < .3 ? 0 : u < .65 ? ease.inOut((u - .3) / .35) : 1 - ease.inOut(Math.min(1,(u - .65) / .35));
          carrier.forEach((p,i) => { p.rotation.z = (i ? 1 : -1) * (.26 - .52 * rock); });
          moving.visible = idle <= 0 || reduceMotion;
          moving.position.set(2.4, u < .3 ? 2.3 - u / .3 * 1.6 : u < .65 ? .7 - (u - .3) / .35 * 1.4 : -.7 - (u - .65) / .35 * 1.9, .45);
        };
      } else if (ch.id === 'cotransport') {
        poses[ch.id].w = 8.4;
        membrane(group,[-4,0,4]);
        const lobes = [-4,0,4].map(x => protein(group,x));
        const naM = ionMat('Na\u207a','#54dafe'), kM = ionMat('K\u207a','#ffcf63'), caM = ionMat('Ca\u00b2\u207a','#b6f36a');
        const spr = (mat) => { const s = new THREE.Sprite(mat); s.scale.setScalar(.48); group.add(s); return s; };
        const pump = { na: [0,1,2].map(() => spr(naM)), k: [0,1].map(() => spr(kM)) };
        const sglt = { na: [0,1].map(() => spr(naM)), glc: symbol('Glucose') }; sglt.glc.scale.setScalar(1.1); group.add(sglt.glc);
        const ncx = { na: [0,1,2].map(() => spr(naM)), ca: spr(caM) };
        const caInside = Array.from({length:10},(_,i) => { const s = spr(caM); s.userData.ph = i * 1.3; return s; });
        const naOut = Array.from({length:10},(_,i) => { const s = spr(naM); s.userData.ph = i * 1.9; return s; });
        const atpFlash = glow(new THREE.Color(0xffd75e), 1.6); atpFlash.position.set(-4,-1.6,.6); group.add(atpFlash);
        label('Na⁺/K⁺ pump · ATP',-4,-2.75,'pump'); label('SGLT symporter',0,-2.75,'co2'); label('NCX antiporter',4,-2.75,'calcium');
        label('Outside: high Na⁺',-6.3,3.0,'glucose'); label('Cytoplasm: low Na⁺',-6.3,-3.0,'glucose');
        const st = { G: 1, p: 0, s: 0, n: 0, lastT: 0, shown: -1 };
        const lane = (u, dir) => dir > 0 ? -2.5 + u * 5 : 2.5 - u * 5;
        draw = (t) => {
          const dt = reduceMotion ? 0 : Math.max(0, t - st.lastT); st.lastT = t;
          const pumpOn = (LESSON['tp-pump'] || 'on') === 'on', one = (LESSON['tp-sglt'] || 'sglt1') === 'sglt2';
          st.G = reduceMotion ? (pumpOn ? 1 : .2) : Math.max(.12, Math.min(1, st.G + dt * (pumpOn ? .18 : -.07)));
          if (pumpOn) st.p = (st.p + dt / 2.2) % 1;
          st.s = (st.s + dt / 1.8 * st.G) % 1; st.n = (st.n + dt / 2.0 * st.G) % 1;
          const pu = reduceMotion ? .3 : st.p, half = pu < .5, pp = (pu * 2) % 1;
          pump.na.forEach((s,i) => { s.visible = half; s.position.set(-4 + (i - 1) * .55, lane(pp, 1), .8); });
          pump.k.forEach((s,i) => { s.visible = !half; s.position.set(-4 + (i ? .3 : -.3), lane(pp, -1), .8); });
          atpFlash.material.opacity = pumpOn && half && pp < .25 ? 1 - pp * 4 : 0;
          lobes[0].forEach((p,i) => { p.rotation.z = (i ? 1 : -1) * .26 * Math.cos(pu * Math.PI * 2); });
          const su = reduceMotion ? .5 : st.s;
          sglt.na.forEach((s,i) => { s.visible = !(one && i); s.position.set((one ? 0 : (i ? .35 : -.35)) - .45, lane(su, -1), .85); });
          sglt.glc.position.set(.45, lane(su, -1), .5);
          lobes[1].forEach((p,i) => { p.rotation.z = (i ? 1 : -1) * .26 * Math.cos(su * Math.PI * 2); });
          const nu = reduceMotion ? .5 : st.n;
          ncx.na.forEach((s,i) => { s.position.set(4 + (i - 1) * .5, lane(nu, -1), .85); });
          ncx.ca.position.set(4, lane(nu, 1), .95);
          lobes[2].forEach((p,i) => { p.rotation.z = (i ? 1 : -1) * .26 * Math.cos(nu * Math.PI * 2); });
          const nCa = Math.round(1 + 9 * (1 - st.G));
          caInside.forEach((s,i) => { s.visible = i < nCa; s.position.set(1.6 + (i % 5) * .7 + Math.sin(t + s.userData.ph) * .1, -1.85 - Math.floor(i / 5) * .55, .7); });
          const nNa = Math.round(2 + 8 * st.G);
          naOut.forEach((s,i) => { s.visible = i < nNa; s.position.set(-2.3 + (i % 5) * .9 + Math.sin(t * .8 + s.userData.ph) * .15, 1.9 + Math.floor(i / 5) * .55, .7); });
          const shown = Math.round(st.G * 20);
          if (shown !== st.shown) { st.shown = shown; const el = $('#tpGradient'); if (el) el.textContent = gradientText(st.G); }
        };
      } else if (ch.id === 'epithelia') {
        poses[ch.id] = { group: ch.id, target: new V3(0, -.3, 0), pos: new V3(2, 4.5, 15.5), w: 8.6 };
        const cellMat = new THREE.MeshStandardMaterial({ color: 0x2f7fa6, roughness: .55, transparent: true, opacity: .55, depthWrite: false });
        const nucMat = material(0x6a86ff), mvMat = material(0x54dafe), tjMat = new THREE.MeshStandardMaterial({ color: 0xffcf63, emissive: 0xffcf63, emissiveIntensity: .45 });
        const XS = [-5, -2.5, 0, 2.5, 5];
        const capsule = new THREE.CapsuleGeometry(1.05, 3.4, 6, 16), mv = new THREE.CylinderGeometry(.09, .09, .55, 6);
        XS.forEach(x => {
          const c = new THREE.Mesh(capsule, cellMat); c.position.set(x, 0, 0); c.scale.set(1, 1, 1.25); group.add(c);
          bead(group, 0x6a86ff, .55, x, -1.2, 0).scale.set(.6, .75, .6);
          for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const m = new THREE.Mesh(mv, mvMat); m.position.set(x - .6 + i * .4, 2.95, -.55 + j * .55); group.add(m); }
        });
        const GAPS = [-3.75, -1.25, 1.25, 3.75];
        const tjs = GAPS.map(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(.5, .22, 2.4), tjMat); m.position.set(x, 1.95, 0); group.add(m); return m; });
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 14, 24, 1, true), new THREE.MeshStandardMaterial({ color: red, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }));
        cap.rotation.z = Math.PI / 2; cap.position.y = -4.6; group.add(cap);
        const rbcs = Array.from({length:5},(_,i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(.35,.2,8,16), material(red)); m.position.set(-6 + i * 3, -4.6, 0); group.add(m); return m; });
        // markers for the carriers on each face
        const marker = (x, y, color) => { const m = bead(group, color, .26, x, y, 1.15); m.scale.set(.26 * 1.3, .26 * .8, .26 * .8); return m; };
        const apical = XS.map(x => marker(x - .4, 2.55, 0x4fd6c8)), basal = XS.map(x => marker(x + .45, -2.55, 0xb18cff)), pumps = XS.map(x => marker(x - .5, -2.55, 0x8fd16a));
        const scatter = XS.map(x => [marker(x + .45, 2.55, 0xb18cff), marker(x - .5, 2.55, 0x8fd16a), marker(x - .4, -2.55, 0x4fd6c8)]);
        label('Lumen · apical side', -5.6, 4.2, 'electron'); label('Microvilli', 5.2, 3.6, 'glucose'); label('Tight junction', 3.75, 1.95, 'atp');
        label('Basolateral side', 6.6, -2.2, 'pump'); label('Capillary', -6.3, -5.6, 'rbc');
        label('SGLT', -5.4, 2.55, 'exon'); label('GLUT2', -4.3, -3.2, 'g2'); label('Na⁺/K⁺ pump', -2.9, -3.4, 'pump');
        const glc = Array.from({length:7},(_,i) => { const g = symbol('Glucose'); g.scale.setScalar(1.1); group.add(g); g.userData = { ph: i / 7, cell: i % 5, back: i % 2 === 1 }; return g; });
        const solute = Array.from({length:8},(_,i) => { const m = bead(group, 0xf1e4bd, .16, 0, 0, 0); m.userData = { ph: i / 8, gap: i % 4 }; return m; });
        const naMat = ionMat('Na\u207a','#54dafe');
        const na = Array.from({length:5},(_,i) => { const s = new THREE.Sprite(naMat); s.scale.setScalar(.42); group.add(s); s.userData = { ph: i / 5 + .1, cell: (i * 2) % 5 }; return s; });
        const path = (pts, u) => { const n = pts.length - 1, k = Math.min(n - 1, Math.floor(u * n)), f = u * n - k; return pts[k].clone().lerp(pts[k + 1], f); };
        draw = t => {
          const tight = (LESSON['tp-tj'] || 'tight') === 'tight', polar = (LESSON['tp-polar'] || 'normal') === 'normal';
          apical.concat(basal, pumps).forEach(m => { m.visible = true; });
          scatter.flat().forEach(m => { m.visible = !polar; });
          tjs.forEach(m => { m.scale.set(1, 1, tight ? 1 : .45); m.material.emissiveIntensity = tight ? .45 : .2; });
          glc.forEach(g => {
            const u = reduceMotion ? .5 : (t * .14 + g.userData.ph) % 1, x = XS[g.userData.cell];
            const pts = polar || !g.userData.back
              ? [new V3(x - .4, 4.3, .5), new V3(x - .4, 2.6, .5), new V3(x, .3, 1), new V3(x + .45, -2.6, .5), new V3(x + .45, -4.4, .3)]
              : [new V3(x - .4, 4.3, .5), new V3(x - .4, 2.6, .5), new V3(x, 1, 1), new V3(x + .45, 2.6, .5), new V3(x + .45, 4.3, .3)];
            g.position.copy(path(pts, u));
          });
          na.forEach(s => {
            const u = reduceMotion ? .3 : (t * .17 + s.userData.ph) % 1, x = XS[s.userData.cell];
            s.position.copy(path([new V3(x - .7, 4.1, .8), new V3(x - .4, 2.6, .9), new V3(x - .3, 0, 1.1), new V3(x - .5, -2.6, .9), new V3(x - .7, -4.2, .6)], u));
          });
          solute.forEach(m => {
            const u = reduceMotion ? .4 : (t * .2 + m.userData.ph) % 1, x = GAPS[m.userData.gap];
            if (tight) { const y = u < .5 ? 4.2 - u * 2 * 2.05 : 2.15 + (u - .5) * 2 * 2.05; m.position.set(x + Math.sin(u * 20) * .05, y, .6); }
            else m.position.copy(path([new V3(x, 4.2, .6), new V3(x, 2, .6), new V3(x, -2.8, .6), new V3(x + .3, -4.4, .4)], u));
          });
          rbcs.forEach((m,i) => { m.position.x = -7 + ((t * .8 + i * 3) % 14); m.rotation.y = t + i; });
        };
      } else if (ch.id === 'pump') {
        membrane(group,[0]); const lobes=protein(group,0);
        function ionMarkers(symbol, color, offsets) {
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 128;
          const ctx = canvas.getContext('2d');
          ctx.beginPath();
          ctx.arc(64,64,59,0,Math.PI*2);
          ctx.fillStyle = '#102031';
          ctx.fill();
          ctx.lineWidth = 6;
          ctx.strokeStyle = color;
          ctx.stroke();
          ctx.font = 'bold 50px Arial, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(symbol,64,66);
          const mat = new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas), transparent:true, depthWrite:false});
          return offsets.map(x => {
            const marker = new THREE.Sprite(mat);
            marker.scale.setScalar(.68);
            marker.position.set(x,0,.85);
            group.add(marker);
            return marker;
          });
        }
        const sodium = ionMarkers('Na\u207a','#54dafe',[-.74,0,.74]);
        const potassium = ionMarkers('K\u207a','#ffcf63',[-.37,.37]);
        // Front-facing symbols keep bystanders readable as learners orbit.
        for (const [name,x,y] of [['Glucose',-3.4,2.4],['Albumin',2.8,1.4],
                                   ['Hemoglobin',-3.2,-2.1],['ATP',2.7,-1.35]]) {
          const molecule = textSprite(name,new THREE.Color(0xb0c6c9),.52);
          molecule.position.set(x,y,.35);
          const icon = symbol(name);
          icon.position.set(x-molecule.scale.x/2-.58,y,.35);
          group.add(icon,molecule);
        }
        label('Outside',3.6,3.1,'electron'); label('Cytoplasm',3.6,-3.1,'atp');
        draw = t => {
          const phase=(t/7)%1, exporting=phase<.5, progress=(phase*2)%1;
          const y=4.6*(progress-.5)*(exporting?1:-1);
          sodium.forEach(p=>{p.visible=exporting;p.position.y=y;});
          potassium.forEach(p=>{p.visible=!exporting;p.position.y=y;});
          lobes.forEach((p,i)=>{p.rotation.z=(i?1:-1)*.28*Math.tanh(y*2);});
        };
      }
      let elapsed=0;
      behaviors[ch.id]={enter(){elapsed=0;draw(reduceMotion?2:0,1);},tick(t,dt){if (!reduceMotion) elapsed+=dt;draw(reduceMotion?2:elapsed,dt);}};
    }
    return {groups,poses,behaviors,fog};
  }
  CellCity.register('transport',{chapters,build});
})();

