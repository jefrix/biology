(() => {
  const stages = [
    ['Motor neuron fires','Acetylcholine crosses the neuromuscular junction and activates receptors on the muscle fiber.'],
    ['Signal travels inward','The muscle action potential spreads along its membrane and down a T-tubule.'],
    ['Calcium is released','The voltage change triggers calcium release from the sarcoplasmic reticulum. Calcium binds troponin, shifting tropomyosin away from sites on actin.'],
    ['Filaments slide','Myosin heads repeatedly pull and release actin using ATP. The Z-discs move closer together while actin and myosin keep their lengths.'],
    ['Muscle relaxes','ATP-powered pumps return calcium to storage. Tropomyosin covers the binding sites again, and the schematic returns to resting length.'],
  ];
  const source = '<p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/10-3-muscle-fiber-contraction-and-relaxation">Source: OpenStax, Muscle Fiber Contraction and Relaxation</a></p>';
  const sequence = stages.map(([title,detail]) => '<li><strong>'+title+'</strong><br>'+detail+'</li>').join('');
  const fibers = [
    ['Type I','Slow','High','Sustained low-force work'],
    ['Type IIa','Fast','Intermediate','Repeated higher-force work'],
    ['Type IIx','Fastest','Lower','Brief, high-force efforts'],
  ];
  const chapters = [
    {id:'muscle-contraction', short:'Signal to force', where:'A skeletal muscle fiber', title:'From nerve impulse to muscle contraction',
      legend:[['electron','Electrical signal'],['atp','Calcium'],['rbc','Actin'],['dendrite','Myosin']],
      html:()=>`<p class="lede">Follow one signal from a motor neuron to the machinery that shortens a skeletal muscle fiber.</p>
        <label class="lesson-control">Playback step <select id="muscleStep"><option value="auto">Automatic cycle</option>${stages.map(([title],i)=>'<option value="'+i+'">'+title+'</option>').join('')}</select></label>
        <p id="musclePhase" class="lesson-phase" hidden></p>
        <ol class="lesson-sequence">${sequence}</ol><p>The scene stretches the timing and separates structures so their roles are visible. Actual muscle force depends on repeated signaling and load.</p>
        <p><a href="#synapse">See how a synapse transmits a signal</a> · <a href="#tally">Follow the ATP supply</a></p>${source}`},
    {id:'muscle-structure', short:'Inside the fiber', where:'Muscle architecture', title:'From whole muscle to sarcomere',legend:[],
      html:()=>`<p class="lede">Each level contains the next. Select a level to isolate it in the cutaway. Orbit the muscle fiber to see the cut end and the myofibril pulled out from the bundle.</p>
        <label class="lesson-control">Zoom level <select id="muscleLevel"><option value="0">Whole muscle</option><option value="1">Fascicle</option><option value="2">Muscle fiber</option><option value="3">Myofibril</option><option value="4">Sarcomere</option></select></label>
        <ol class="lesson-sequence"><li><b>Muscle.</b> A collection of bundles surrounded by connective tissue.</li><li><b>Fascicle.</b> One bundle of muscle fibers.</li><li><b>Fiber.</b> A single long cell enclosed by the sarcolemma. Nuclei sit near its surface. Mitochondria supply ATP, and the sarcoplasmic reticulum stores calcium.</li><li><b>Myofibril.</b> One strand of contractile machinery inside the cell.</li><li><b>Sarcomere.</b> The repeating segment between two Z-discs.</li></ol>${source}`},
    {id:'muscle-fibers', short:'Fiber types', where:'Human skeletal muscle', title:'Slow and fast fibers share the work',legend:[],
      html:()=>`<p class="lede">Compare the speed and persistence of three human skeletal fiber types. The animated traces show qualitative tendencies under repeated stimulation.</p>
        <div class="table-wrap"><table class="ledger"><thead><tr><th>Fiber</th><th>Speed</th><th>Fatigue resistance</th><th>Example role</th></tr></thead><tbody>${fibers.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')}</tbody></table></div>
        <ul class="facts"><li>Type I fibers generally have more mitochondria and support steady efforts such as climbing stairs at a comfortable pace.</li><li>Type IIa fibers combine rapid force with more fatigue resistance than Type IIx.</li><li>Type IIx fibers contract rapidly and fatigue sooner during repeated effort. A sprint also uses Type I and IIa fibers.</li></ul>
        <p>The nervous system generally recruits smaller motor units first and adds larger ones as force demand rises. The traces are illustrative, with no measured force or time scale.</p><p><a href="https://www.ncbi.nlm.nih.gov/books/NBK482280/">Source: Exercise Physiology, NCBI Bookshelf</a></p>`},
    {id:'muscle-tissues', short:'Three muscle tissues', where:'Skeletal, cardiac and smooth', title:'Three ways muscle cells generate motion',legend:[],
      html:()=>`<p class="lede">All three use actin and myosin. Compare the striations, nucleus placement, and cell shape. The three rows use different magnifications.</p>
        <ul class="facts"><li><b>Top · Skeletal.</b> Long striated fibers pull on the skeleton. Motor neurons activate them.</li><li><b>Middle · Cardiac.</b> Branched, striated cells join at intercalated discs. Electrical coupling helps the heart contract in sequence.</li><li><b>Bottom · Smooth.</b> Tapered cells in organs such as the gut contract without visible striations. Calcium activates a different regulatory pathway involving calmodulin.</li></ul>
        <p><a href="#rest">Explore electrical gradients</a></p>`},
  ];

  function build({scene,addLabel,goStage}) {
    const groups = {}, poses = {}, behaviors = {}, fog = {}, depth = {};
    const sphere = new THREE.SphereGeometry(1,20,14);
    const cylinder = new THREE.CylinderGeometry(1,1,1,12);
    const materials = new Map();
    const red = 0xdc6581, blue = 0x5f9fed, gold = 0xfad178, white = 0xdfe4ee, aqua = 0x62e3df;
    function mesh(parent,geometry,color) {
      if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.55}));
      const object = new THREE.Mesh(geometry,materials.get(color));
      parent.add(object);
      return object;
    }
    function ball(parent,color,x,y,z,radius) {
      const object = mesh(parent,sphere,color);
      object.position.set(x,y,z);
      object.scale.setScalar(radius);
      return object;
    }
    function rod(parent,color,x,y,z,length,radius) {
      const object = mesh(parent,cylinder,color);
      object.position.set(x,y,z);
      object.scale.set(radius,length,radius);
      object.rotation.z = Math.PI/2;
      return object;
    }
    const plum = 0x8067bf, membranePink = 0xec9eaa, darkRed = 0xa63d59;
    function ellipsoid(parent,color,x,y,z,width,height,depth) {
      const object = ball(parent,color,x,y,z,1);
      object.scale.set(width,height,depth);
      return object;
    }
    function shell(parent,color,start,length,radius,angle=Math.PI*1.33) {
      const geometry = new THREE.CylinderGeometry(radius,radius,length,40,1,true,(2*Math.PI-angle)/2,angle);
      const object = mesh(parent,geometry,color);
      object.material.side = THREE.DoubleSide;
      object.rotation.set(0,0,Math.PI/2);
      object.position.x = start+length/2;
      return object;
    }
    function bandedRod(parent,x,y,z,length,radius) {
      const segment = new THREE.Group();
      parent.add(segment); segment.position.set(x,y,z);
      rod(segment,red,0,0,0,length,radius);
      for (let offset=-length/2+.17;offset<length/2-.06;offset+=.34) {
        rod(segment,darkRed,offset,0,0,.12,radius*1.025);
        rod(segment,membranePink,offset+.09,0,0,.034,radius*1.035);
      }
      return segment;
    }
    function strand(parent,color,points,radius) {
      const path = new THREE.CatmullRomCurve3(points.map(point=>new V3(...point)));
      return mesh(parent,new THREE.TubeGeometry(path,32,radius,8,false),color);
    }
    function packedBundle(parent,level) {
      const radius = level===2 ? 1.27 : 1.42;
      const start = -4.3, cut = 1.05;
      shell(parent,membranePink,start,cut-start,radius);
      rod(parent,membranePink,cut,0,0,.11,radius);
      const rings = level===0 ? 1 : 2;
      const spacing = level===0 ? .76 : .52;
      const unitRadius = spacing*.44;
      for (let row=-rings;row<=rings;row++) {
        for (let column=-rings;column<=rings;column++) {
          if (Math.abs(row+column)>rings) continue;
          const selected = row===1 && column===0;
          const y = spacing*(column+row*.5);
          const z = spacing*row*.866;
          const end = selected ? 3.3 : cut+.14;
          const length = end-start-.13;
          bandedRod(parent,end-length/2,y,z,length,unitRadius);
          rod(parent,selected ? 0xefaa98 : 0xcb6878,end+.015,y,z,.045,unitRadius*.88);
        }
      }
      if (level===2) {
        for (const x of [-3.7,-2.35,-1.25]) ellipsoid(parent,plum,x,.78,.91,.34,.115,.07);
        for (const [x,y] of [[-.9,-.55],[.45,.53]]) {
          ellipsoid(parent,0xe7a650,x,y,1.05,.32,.115,.092);
          strand(parent,0xffdf9a,[[x-.21,y,1.12],[x-.10,y+.063,1.14],[x,y-.06,1.14],[x+.12,y+.05,1.14],[x+.22,y,1.12]],.024);
        }
        strand(parent,aqua,[[-2.95,-.50,1.08],[-2.52,-.69,1.12],[-2.09,-.47,1.14],[-1.67,-.69,1.12],[-1.28,-.46,1.10]],.065);
      }
    }
    function sarcomere(parent,y,z) {
      const heads = [];
      const ends = [-1,1].map(side => {
        const end = new THREE.Group(); parent.add(end);
        const disc = rod(end,white,0,y,z,.095,.90);
        disc.scale.z=.28;
        for (const level of [-.66,-.22,.22,.66]) {
          rod(end,red,-side*1.31,y+level,z,2.62,.048);
          for (let i=0;i<15;i++) ball(end,red,-side*(.11+i*.17),y+level,z,.077);
        }
        return end;
      });
      const center = rod(parent,0x70688e,0,y,z-.18,.07,.84);
      center.scale.z=.13;
      for (const level of [-.44,0,.44]) {
        rod(parent,blue,0,y+level,z-.08,3.40,.095);
        for (const x of [-1.44,-1.1,-.77,.77,1.1,1.44]) {
          const pivot = new THREE.Group();
          pivot.position.set(x,y+level,z-.08);
          parent.add(pivot);
          for (const side of [-1,1]) {
            const neck=rod(pivot,blue,.04*Math.sign(x),side*.09,0,.18,.035);
            neck.rotation.z=side*.25*Math.sign(x);
            ellipsoid(pivot,blue,.08*Math.sign(x),side*.16,0,.095,.061,.065);
          }
          heads.push({pivot,direction:Math.sign(x)});
        }
      }
      return (amount,stroke=0)=>{
        ends.forEach((end,i)=>{end.position.x=(i ? 1 : -1)*(3.85-amount*.92);});
        heads.forEach(({pivot,direction})=>{pivot.rotation.z=direction*stroke;});
      };
    }
    for (const chapter of chapters) {
      const id = chapter.id;
      const group = new THREE.Group();
      groups[id]=group; fog[id]=.002; depth[id]=1; scene.add(group);
      poses[id]={group:id,target:new V3(),pos:new V3(0,2,16),w:6.7};
      const label = (title,x,y,color='electron') => addLabel(title,color,group,new V3(x,y,.24),[id]);
      let render;
      if (id==='muscle-contraction') {
        const shorten=sarcomere(group,-1.32,0);
        rod(group,blue,-3.4,2.35,0,2.8,.12);
        ball(group,blue,-1.9,2.35,0,.27);
        rod(group,red,.5,1.72,0,6,.08);
        const tubule=rod(group,red,.9,.97,0,1.50,.12); tubule.rotation.z=0;
        rod(group,aqua,.9,.25,0,3.2,.15);
        const flash=ball(group,aqua,0,0,.23,.16);
        const ach=Array.from({length:5},(_,i)=>ball(group,white,-2.14+i*.11,2.1,.06,.055));
        const calcium=Array.from({length:16},()=>ball(group,gold,0,0,.32,.079));
        label('Motor neuron',-3.5,2.83); label('T-tubule',1.92,1.1); label('Calcium store',.9,.55);
        label('Z-disc',-3.85,-2.48,'rbc'); label('Sarcomere',0,-2.48);
        const durations=[2,2,2,3,3];
        const cycleLength=durations.reduce((sum,duration)=>sum+duration,0);
        render=time=>{
          const step=$('#muscleStep')?.value;
          let phase=0, local=time%cycleLength;
          while (local>=durations[phase]) local-=durations[phase++];
          const pinned=step && step!=='auto';
          if (pinned || reduceMotion) {phase=pinned ? Number(step) : 3;local=durations[phase]*.72;}
          const progress=local/durations[phase];
          const amount=phase===3 ? Math.min(1,progress*1.8) : phase===4 ? 1-progress : 0;
          const stroke = phase===3 && !reduceMotion && !pinned ? Math.sin(local*12)*.32 : 0;
          shorten(amount,stroke);
          flash.visible=phase<=1;
          flash.position.set(phase===0 ? -4.75+2.85*progress : -1.8+2.7*Math.min(1,progress*1.65),
            phase===0 ? 2.35 : 1.72-Math.max(0,progress-.6)*3.6,.23);
          ach.forEach((particle,i)=>{particle.visible=phase===0&&progress>.64;particle.position.y=2.3-(progress-.64)*(1.4+i*.18);});
          const spread=phase===2 ? progress : phase===3 ? 1 : 1-progress;
          calcium.forEach((particle,i)=>{
            particle.visible=phase>=2;
            particle.position.set(.9+((i%8)-3.5)*.87*spread,.25-(.76+.69*Math.floor(i/8))*spread,.32);
          });
          const caption=$('#musclePhase');
          if (caption && caption.dataset.phase!==String(phase)) {
            caption.hidden=false; caption.dataset.phase=phase; caption.textContent=stages[phase][0];
          }
        };
      } else if (id==='muscle-structure') {
        const levels=Array.from({length:5},()=>{const level=new THREE.Group();group.add(level);return level;});
        poses[id].pos.set(5.3,2.6,15.7);
        const annotate = (level,title,x,y,z=.65) => addLabel(title,'rbc',levels[level],new V3(x,y,z),[id]);
        for (let level=0;level<3;level++) packedBundle(levels[level],level);
        annotate(0,'Connective tissue',-2.6,1.63);
        annotate(0,'Fascicle',2.3,.88);
        annotate(1,'Muscle fiber',2.3,.88);
        annotate(2,'Sarcolemma',-3.6,1.76);
        annotate(2,'Peripheral nuclei',-2.05,1.20,1.1);
        annotate(2,'Mitochondria',.1,1.40,1.1);
        annotate(2,'Sarcoplasmic reticulum',-1.95,-1.7,1.1);
        annotate(2,'Exposed myofibril',2.57,-.53,.5);
        bandedRod(levels[3],-.55,0,0,6,1.02);
        for (const y of [-.42,0,.42]) {
          rod(levels[3],blue,3.04,y,-.13,2.4,.10);
          rod(levels[3],red,3.48,y+.15,.13,3.1,.06);
        }
        annotate(3,'Repeating striations',-2.15,1.55);
        annotate(3,'Actin and myosin',3.17,-.93);
        sarcomere(levels[4],0,.25)(0);
        annotate(4,'Z-disc',-3.82,1.10); annotate(4,'M-line',0,1.12);
        annotate(4,'Z-disc',3.82,1.10); annotate(4,'Thin actin',-2.3,-1.12);
        annotate(4,'Thick myosin',1.5,-1.12);
        render=()=>levels.forEach((level,i)=>{level.visible=i===Number($('#muscleLevel')?.value||0);});
      } else if (id==='muscle-fibers') {
        const strips=fibers.map(([name],i)=>{
          const y=2-i*1.85;label(name,-4.55,y+.35,'rbc');
          const points=Array.from({length:85},()=>new V3());
          const geometry=new THREE.BufferGeometry().setFromPoints(points);
          const trace=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:[red,gold,aqua][i]}));
          trace.frustumCulled=false;group.add(trace);
          return {trace,y};
        });
        render=time=>strips.forEach(({trace,y},i)=>{
          const positions=trace.geometry.attributes.position;
          for (let j=0;j<positions.count;j++) {
            const x=j/(positions.count-1), cycle=(x*(4+i*2)-(reduceMotion?0:time*.34)+100)%1;
            const height=Math.sin(cycle*Math.PI)**[2,4,7][i]*Math.exp(-x*[.12,.9,2.5][i]);
            positions.setXYZ(j,-3.4+x*7.9,y+height*.85,0);
          }
          positions.needsUpdate=true;
        });
      } else {
        poses[id].pos.set(1,1.4,17);
        for (const y of [1.83,2.30,2.77]) {
          bandedRod(group,.47,y,0,7.35,.21);
          for (const x of [-2.65,-.65,2.50]) ellipsoid(group,plum,x,y+.11,.18,.21,.076,.064);
        }
        label('Skeletal',-4.47,2.35,'rbc');
        label('Peripheral nuclei',2.55,3.28);
        bandedRod(group,.45,.04,0,7.10,.24);
        for (const side of [-1,1]) {
          const branch = bandedRod(group,side*1.9+.45,side*.38,0,3.1,.20);
          branch.rotation.z=side*.28;
        }
        for (const x of [-2.4,0,2.65]) ellipsoid(group,plum,x,.04,.23,.23,.105,.07);
        strand(group,0x622846,[[1.45,-.19,.12],[1.39,-.09,.23],[1.53,.01,.24],[1.45,.12,.23],[1.54,.25,.11]],.043);
        label('Cardiac',-4.47,.04,'rbc');
        label('Intercalated disc',1.47,.99);
        for (const [x,y,angle] of [[-1.85,-2.06,.12],[1.48,-2.06,-.08],[.10,-2.70,.08]]) {
          const cell = new THREE.Group(); group.add(cell);
          cell.position.set(x,y,0); cell.rotation.z=angle;
          const profile = [[0,-1.96],[.085,-1.34],[.17,-.62],[.25,0],[.17,.62],[.085,1.34],[0,1.96]];
          const spindle = mesh(cell,new THREE.LatheGeometry(profile.map(([radius,height])=>new THREE.Vector2(radius,height)),20),red);
          spindle.rotation.z=Math.PI/2;
          ellipsoid(cell,plum,0,0,.23,.31,.105,.076);
        }
        label('Smooth',-4.47,-2.13,'rbc');
        label('Central nucleus',1.48,-3.11);
        render=()=>{};
      }
      let elapsed=0;
      behaviors[id]={enter(){elapsed=0;render(0);},tick(_,dt){elapsed+=dt;render(elapsed);},reset(){elapsed=0;goStage(id);render(0);}};
    }
    return {groups,poses,behaviors,fog,depth};
  }
  CellCity.register('muscle',{chapters,build});
})();
