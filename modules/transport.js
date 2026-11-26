/* Membranes and transport: passive crossings, red cell osmosis and the sodium–potassium pump.
   Scenes use the atlas camera, lighting and chapter lifecycle. */
(() => {
  const credit = (links, limits) => '<p class="credit">Sources: ' + links.map(([href, text]) => '<a href="' + href + '" target="_blank" rel="noopener">' + text + '</a>').join(' · ') + '. ' + limits + '</p>';
  const OS = {
    passive: ['https://openstax.org/books/biology-2e/pages/5-2-passive-transport', 'OpenStax Biology 2e, 5.2 Passive Transport'],
    active: ['https://openstax.org/books/biology-2e/pages/5-3-active-transport', 'OpenStax Biology 2e, 5.3 Active Transport'],
  };
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
      html: () => '<p class="lede">Watch one transport cycle. The upper side faces the surrounding fluid. The lower side faces the cytoplasm. The blue pump spans both rows of coral lipid heads and their inward-facing golden tails. The circled Na&#8314; and K&#8314; are sodium and potassium ions. Follow them through the pump. Glucose and albumin are shown in the surrounding plasma, and hemoglobin and ATP in the cytoplasm. The glucose symbol shows its carbon-and-oxygen ring. The protein symbols show three domains for albumin and four subunits for hemoglobin. ATP has a chain of three gold phosphate groups. Symbols are enlarged for visibility. Only sodium and potassium cross through this pump. ATP supplies energy on the inside.</p><ol class="facts"><li>Three sodium ions bind from inside. ATP transfers a phosphate to the pump, changing its shape so it opens outward and releases sodium.</li><li>Two potassium ions bind from outside. The pump releases its phosphate and returns to its inward-facing shape, releasing potassium inside.</li></ol><p>Each cycle moves one net positive charge outward. Over many cycles the pump maintains high potassium inside and high sodium outside despite ongoing leaks. These gradients help cells regulate volume and help neurons generate electrical signals.</p><p><a href="#tally">Follow the ATP supply</a> · <a href="#rest">See the gradients in a neuron</a></p>' + credit([OS.active], 'The pump cycle is simplified to two shapes. The real Na⁺/K⁺-ATPase passes through more intermediate states, and its α and β subunits are drawn as one rounded protein.') },
  ];
  function build({scene, addLabel, textSprite}) {
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
      } else {
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

