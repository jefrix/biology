/* Nephron anatomy and tubular transport scenes. */
(() => {
  const id = 'proximal-tubule';
  const chapter = {
    id, short: 'Reclaim glucose', where: 'Early proximal tubule',
    title: 'How the kidney takes filtered glucose back',
    legend: [['atp','Glucose'],['electron','Sodium (Na⁺)'],['dendrite','Potassium (K⁺)']],
    html: () => `<p class="lede">Follow a gold glucose molecule from the filtrate on the left, across a brush-border cell, to a nearby capillary on the right.</p>
      <label class="lesson-control">Sodium–potassium pump <select id="nephronPump"><option value="on">Running</option><option value="off">Paused</option></select></label>
      <div id="nephronReadout" hidden>
        <label for="nephronGradient">Relative sodium driving force</label>
        <meter id="nephronGradient" min="0" max="100" value="100">100%</meter>
        <p id="nephronPumpCaption" role="status">The pump maintains the inward sodium gradient.</p>
      </div>
      <ol class="lesson-sequence">
        <li><b>SGLT2 brings glucose in.</b> The microvilli of the brush border increase surface area. SGLT2 on this side carries one sodium ion and one glucose molecule into the cell together. Sodium moving down its electrochemical gradient supplies the energy for glucose uptake.</li>
        <li><b>GLUT2 lets glucose out.</b> Glucose leaves the cell by facilitated diffusion, enters the fluid between cell and capillary, then returns to the blood.</li>
        <li><b>The pump restores the gradient.</b> On the blood-facing membrane, the sodium–potassium pump uses ATP to export three sodium ions and import two potassium ions. Pause the pump and watch glucose recovery slow as the sodium gradient fades. Turn it back on to rebuild the gradient.</li>
      </ol>
      <p>Farther downstream in the proximal tubule, SGLT1 recovers glucose that remains. This cutaway focuses on early proximal tubule SGLT2.</p>
      <p>The meter and motion illustrate relative driving force. They represent neither measured concentrations nor biological times.</p>
      <p><a href="#pump">Watch the sodium–potassium pump cycle</a> · <a href="#junc-tight">Leaky claudin-2 tight junctions</a></p><p class="credit">Sources: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5886707/" target="_blank" rel="noopener">Probing SGLT2 as a therapeutic target for diabetes</a>.</p>`,
  };

  const anatomySource = '<p class="credit">Sources: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/25-4-microscopic-anatomy-of-the-kidney" target="_blank" rel="noopener">OpenStax · Microscopic anatomy of the kidney</a>.</p>';
  const transportSource = '<p class="credit">Sources: <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/25-6-tubular-reabsorption" target="_blank" rel="noopener">OpenStax · Tubular reabsorption</a>.</p>';
  const overview = {
    id:'nephron-overview', short:'Follow the filtrate', where:'The whole nephron', title:'One continuous route from filtrate to urine',
    legend:[['rbc','Blood'],['exon','Proximal tubule'],['dendrite','Thin limbs'],['g2','Thick ascending limb'],['fadh','Distal tubule'],['atp','Collecting duct'],['electron','Filtrate']],
    html:()=>`<p class="lede">Follow the moving markers. Blood flows through the glomerulus. Filtrate leaves Bowman’s capsule, travels through the nephron, and drains into a collecting duct shared by several nephrons.</p>
      <ol class="lesson-sequence"><li><b>Filtration.</b> Water and small solutes pass out of the glomerular capillaries into Bowman’s space.</li>
      <li><b>Reabsorption.</b> Tubule cells return useful material such as glucose, salts, and water toward the blood.</li>
      <li><b>Secretion.</b> Tubule cells move selected substances from the tissue fluid into the tubule, including hydrogen ions and some wastes.</li></ol>
      <p>From the collecting ducts, urine drains through the renal pelvis and ureter to the bladder. Each segment has its own color. The shading behind is the cortex (top) and the medulla, which gets saltier with depth. The model shows segment order and the two routes schematically, not to scale.</p>${anatomySource}`,
  };
  const filtration = {
    id:'glomerular-filtration', short:'Filter blood', where:'Glomerulus and Bowman’s capsule', title:'A capillary tuft filters fluid into Bowman’s space',
    legend:[['rbc','Red blood cells'],['electron','Water and small solutes']],
    html:()=>`<p class="lede">Blood enters through the afferent arteriole and leaves through the efferent arteriole. Pressure pushes water and small dissolved substances across the filtration barrier.</p>
      <p>The barrier has three layers: fenestrated capillary endothelium, the glomerular basement membrane, and filtration slits between podocyte foot processes. Red blood cells and most large plasma proteins stay in the blood.</p>
      <p>Rotate the capsule cutaway and follow the blue markers into the proximal tubule. The purple podocyte illustrates how foot processes reach the capillary surface. The capsule wall, branches, and cell are shown schematically.</p>${anatomySource}`,
  };
  const loop = {
    id:'nephron-loop', short:'Build a gradient', where:'Loop of Henle', title:'Different limbs build a salty medulla',
    legend:[['electron','Water leaving'],['atp','Salt leaving']],
    html:()=>`<p class="lede">Watch tubular fluid travel down one limb and up the other. Water leaves the thin descending limb. The thick ascending limb moves salts out while remaining relatively impermeable to water.</p>
      <p>The opposite directions of flow and the different transport properties help create a concentration gradient that rises deeper in the medulla. The collecting duct can use that gradient to reclaim water.</p>
      <p>The thick ascending limb moves sodium, potassium and chloride through NKCC2. The schematic omits urea recycling and the nearby blood vessels that help preserve the gradient.</p>${transportSource}`,
  };
  const collecting = {
    id:'collecting-duct', short:'Adjust the final mix', where:'Collecting duct', title:'Two hormones adjust water and salt separately',
    legend:[['electron','Water'],['atp','Sodium'],['dendrite','Potassium']],
    html:()=>`<p class="lede">Follow fluid down the duct. Toggle each hormone to see how it changes transport by principal cells.</p>
      <label class="lesson-control"><input id="nephronAdh" type="checkbox" checked> Vasopressin (ADH)</label>
      <label class="lesson-control"><input id="nephronAldosterone" type="checkbox" checked> Aldosterone</label>
      <ul class="facts"><li><b>Vasopressin</b> increases aquaporin-2 channels on the lumen-facing surface. With a medullary gradient, more water can leave the duct and return toward the blood.</li>
      <li><b>Aldosterone</b> increases sodium uptake through ENaC and supports potassium secretion into the duct.</li></ul>
      <p>The toggles compare baseline transport with increased hormone action. They show direction and relative intensity, without predicting clinical urine output.</p><p><a href="#endocrine-map">See the endocrine gland map</a></p>${transportSource}`,
  };

  function anatomyScenes({scene,addLabel}) {
    const groups={}, poses={}, fog={}, depth={}, behaviors={};
    const sphere=new THREE.SphereGeometry(1,18,12);
    const gold=0xffd75e, aqua=0xd8f1ff, blood=0xc94363, blue=0x4fb8ff;
    const materials=new Map();
    function material(color) {
      if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.52}));
      return materials.get(color);
    }
    function path(points) {
      return new THREE.CatmullRomCurve3(points.map(([x,y,z=0])=>new V3(x,y,z)));
    }
    function mesh(parent,geometry,finish) {
      const object=new THREE.Mesh(geometry,finish);
      parent.add(object);
      return object;
    }
    function tube(parent,curve,radius,color,opacity=1) {
      const finish=opacity<1 ? new THREE.MeshStandardMaterial({color,transparent:true,opacity,depthWrite:false}) : material(color);
      return mesh(parent,new THREE.TubeGeometry(curve,72,radius,12,false),finish);
    }
    function bead(parent,color,radius) {
      const object=mesh(parent,sphere,material(color));
      object.scale.setScalar(radius);
      return object;
    }
    function flow(parent,curve,color,count,speed,radius=.085) {
      const particles=Array.from({length:count},()=>bead(parent,color,radius));
      return (time,visibleCount=count)=>particles.forEach((object,i)=>{
        object.visible=i<visibleCount;
        curve.getPointAt((time*speed+i/count)%1,object.position);
      });
    }

    for (const chapter of [overview,filtration,loop,collecting]) {
      const root=new THREE.Group(), key=chapter.id;
      groups[key]=root; scene.add(root); fog[key]=.002; depth[key]=1;
      poses[key]={group:key,target:new V3(),pos:new V3(0,1.5,17),w:6.45};
      const label=(text,color,x,y,z=.50)=>addLabel(text,color,root,new V3(x,y,z),[key]);
      let animate;
      if (chapter===overview) {
        // Cortex and medulla behind the nephron; the medulla darkens with depth to show the salt gradient.
        const band=(y0,y1,c0,c1,opacity)=>{
          const geo=new THREE.PlaneGeometry(11.6,y1-y0,1,12), colors=[], p=geo.attributes.position;
          for (let i=0;i<p.count;i++) { const u=(p.getY(i)+(y1-y0)/2)/(y1-y0); const c=new THREE.Color(c0).lerp(new THREE.Color(c1),1-u); colors.push(c.r,c.g,c.b); }
          geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
          const m=mesh(root,geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity,depthWrite:false}));
          m.position.set(0,(y0+y1)/2,-.9); return m;
        };
        band(.5,3.95,0x3a3048,0x3a3048,.5);
        band(-4.2,.5,0x24344d,0x8a5a2a,.6);
        const edge=mesh(root,new THREE.PlaneGeometry(11.6,.03),new THREE.MeshBasicMaterial({color:0x8c9bb0,transparent:true,opacity:.5}));
        edge.position.set(0,.5,-.85);
        const hex=name=>col(name).getHex();
        const SEG={pct:hex('exon'),thin:hex('dendrite'),thick:hex('g2'),dct:hex('fadh'),cd:hex('atp')};
        const segs={
          pct:[[-2.0,2.45],[-2.6,2.95],[-3.2,2.5],[-3.7,3.0],[-4.25,2.55],[-3.95,2.0],[-3.4,2.1],[-3.25,1.4],[-3.2,.4]],
          thin:[[-3.2,.4],[-3.2,-2.0],[-3.1,-3.1],[-2.7,-3.55],[-2.3,-3.1],[-2.2,-1.4]],
          thick:[[-2.2,-1.4],[-2.15,.4],[-2.0,1.6],[-1.75,2.15]],
          dct:[[-1.75,2.15],[-1.0,1.85],[-.3,2.4],[.35,1.8],[.9,2.45],[1.5,1.95],[2.1,2.35],[2.7,2.05]],
          cd:[[2.7,2.05],[2.74,0],[2.78,-2],[2.8,-3.95]],
        };
        tube(root,path(segs.pct),.21,SEG.pct,.55);
        tube(root,path(segs.thin),.1,SEG.thin,.7);
        tube(root,path(segs.thick),.17,SEG.thick,.6);
        tube(root,path(segs.dct),.17,SEG.dct,.55);
        tube(root,path([[2.68,3.55],...segs.cd]),.26,SEG.cd,.45);
        tube(root,path([[4.4,3.15],[3.5,2.75],[2.72,2.4]]),.15,SEG.cd,.3);           // another nephron joining the duct
        const route=path([...segs.pct,...segs.thin.slice(1),...segs.thick.slice(1),...segs.dct.slice(1),...segs.cd.slice(1)]);
        // glomerulus: a knot of capillary loops inside Bowman's capsule, open at the vascular pole
        const G=new V3(-1.4,2.75,0), gap=1.1;
        const cup=mesh(root,new THREE.SphereGeometry(.66,32,20,Math.PI+gap/2,Math.PI*2-gap),
          new THREE.MeshStandardMaterial({color:SEG.cd,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
        cup.position.copy(G); cup.rotation.z=.45;
        const loops=[];
        for (let i=0;i<6;i++) {
          const a=i/6*Math.PI*2, c=new V3(Math.cos(a)*.18,Math.sin(a)*.18,Math.sin(a*2)*.12);
          loops.push([G.x+.42,G.y+.12,0],[G.x+c.x*2.1,G.y+c.y*2.1+.05,c.z*2],[G.x+c.x*1.2-.05,G.y+c.y*1.2,c.z-.15]);
        }
        const tuft=path([[G.x+.55,G.y+.22,0],...loops,[G.x+.55,G.y-.1,0]]);
        tube(root,tuft,.07,blood);
        const afferent=[[1.1,3.8,0],[-.1,3.4,0],[G.x+.75,G.y+.25,0]];
        const efferent=[[G.x+.72,G.y-.12,0],[-.45,2.15,-.2],[-1.55,1.55,-.4],[-2.72,.8,-.45],[-2.85,-2.55,-.45],[-2.68,-2.95,-.45],[-2.52,-2.55,-.45],[-2.45,.55,-.45],[-1.2,1.0,-.45],[1.4,1.15,-.45],[5.2,1.3,-.45]];
        tube(root,path(afferent),.12,blood); tube(root,path(efferent),.075,blood,.75);
        const circulation=path([...afferent,...loops,...efferent]);
        const filtrate=flow(root,route,aqua,26,.06,.085);
        const bloodFlow=flow(root,circulation,0xf06c85,14,.07,.085);
        // what leaves where: water from the thin descending limb, salt from the thick ascending limb
        const sideFlows=[-.6,-1.6,-2.5].map(y=>flow(root,path([[-3.2,y,.1],[-3.75,y-.05,.15],[-4.3,y-.1,.1]]),aqua,2,.3,.06))
          .concat([-.8,.4].map(y=>flow(root,path([[-2.15,y,.1],[-1.6,y+.05,.15],[-1.05,y+.1,.1]]),gold,2,.3,.06)));
        label('Glomerulus in Bowman’s capsule','rbc',-2.3,4.15);
        label('Afferent arteriole','rbc',1.95,3.25);
        label('Proximal tubule','exon',-4.3,3.4);
        label('Thin limb · water out','dendrite',-4.1,-1.75);
        label('Thick ascending limb · salt out','g2',.55,-.95);
        label('Loop of Henle','dendrite',-2.7,-3.95);
        label('Distal tubule','fadh',.6,2.85);
        label('Collecting duct','atp',3.85,.2);
        label('Vasa recta','rbc',-1.1,.55);
        label('Cortex','muted',4.6,3.55);
        label('Medulla · saltier deeper','muted',3.95,-2.4);
        label('Toward renal pelvis','atp',2.8,-4.3);
        animate=time=>{filtrate(time);bloodFlow(time);sideFlows.forEach(d=>d(time));};
      } else if (chapter===filtration) {
        poses[key].pos.set(1.1,1.2,16);
        const shell=mesh(root,new THREE.SphereGeometry(2.10,48,28,Math.PI*.47,Math.PI*1.40),
          new THREE.MeshStandardMaterial({color:0xd88b65,side:THREE.DoubleSide,roughness:.66}));
        shell.position.set(.13,0,-.22); shell.scale.set(1,.86,.66);
        const rim=path(Array.from({length:21},(_,i)=>{
          const a=2*Math.PI*i/20;
          return [.13+2.1*Math.cos(a),1.8*Math.sin(a),.08];
        }));
        tube(root,rim,.065,0xf8bd79);
        const inlet=[[-5,-1.73,.20],[-3.8,-1.76,.24],[-2.88,-.88,.25],[-1.62,-.28,.22]];
        const outlet=[[-1.55,.34,.24],[-2.67,.98,.28],[-3.67,1.86,.24],[-5,1.70,.24]];
        tube(root,path(inlet),.24,blood); tube(root,path(outlet),.16,blood);
        const circuits=[];
        for (let i=0;i<5;i++) {
          const y=(i-2)*.49, z=.23+.16*Math.sin(i*1.5);
          const capillary=[[-1.62,-.28,.22],[-.87,y,z],[.30,y-.25,z+.25],[1.02,y+.17,z+.16],
            [.44,y+.42,z-.23],[-.59,y+.15,z-.16],[-1.55,.34,.24]];
          const curve=path(capillary);
          tube(root,curve,.115,blood);
          circuits.push(flow(root,path([...inlet.slice(0,-1),...capillary,...outlet.slice(1)]),0xf4738d,3,.15,.082));
        }
        const podocyte=bead(root,0xb898e2,.14);
        podocyte.position.set(.25,.92,.72);
        for (const side of [-1,1]) {
          const x=.25+side*.25;
          tube(root,path([[.25,.92,.72],[x,.84,.66],[x+side*.10,.68,.57]]),.035,0xb898e2);
          for (const offset of [-.06,.02,.10]) {
            tube(root,path([[x,.84,.67],[x+side*.08,.79,.62],[x+side*.12,.68+offset,.55]]),.021,0xb898e2);
          }
        }
        label('Podocyte and foot processes','dendrite',1.45,1.49);
        const tubule=path([[1.89,.26,.08],[2.74,.25,.08],[3.49,-.1,.1],[3.72,-1.1,.1],[4.57,-1.55,.1],[5.22,-1.12,.15]]);
        tube(root,tubule,.29,gold,.50);
        const filtrate=[-.85,-.32,.18,.63].map(y=>flow(root,path([[.87,y,.39],[1.37,y*.64,.60],[1.80,.23,.27],
          [2.9,.24,.21],[3.54,-.25,.21],[3.78,-1.12,.21],[4.60,-1.4,.21],[5.22,-1.12,.21]]),aqua,4,.17));
        label('Afferent arteriole','rbc',-4.19,-2.23); label('Efferent arteriole','rbc',-4.06,2.30);
        label('Glomerular capillaries','rbc',-.02,2.12); label('Bowman’s space','atp',.74,-2.12);
        label('To proximal tubule','atp',4.26,-2.03);
        animate=time=>{circuits.forEach(draw=>draw(time));filtrate.forEach(draw=>draw(time));};
      } else if (chapter===loop) {
        const hairpin=path([[-1.68,2.94],[-1.63,1.48],[-1.58,-.95],[-1.43,-2.47],[-.48,-2.95],
          [.53,-2.44],[.65,-.87],[.68,1.38],[.74,2.96]]);
        tube(root,hairpin,.29,gold,.42);
        const lumen=flow(root,hairpin,0x96a8bf,13,.15);
        const exits=[];
        for (const y of [1.58,.48,-.72,-1.63]) {
          exits.push(flow(root,path([[-1.60,y,.16],[-2.38,y,.32],[-3.45,y-.12,.26]]),aqua,3,.25));
        }
        for (const y of [1.72,.61,-.48]) {
          exits.push(flow(root,path([[.66,y,.16],[1.65,y,.31],[2.87,y+.11,.26]]),gold,3,.29));
        }
        for (let row=0;row<6;row++) {
          for (let i=0;i<=row;i++) {
            const dot=bead(root,0x96754f,.040);
            dot.position.set(3.21+((i*3)%7)*.22,1.9-row*.72-(i%2)*.16,-.20);
          }
        }
        label('Thin descending limb','electron',-2.65,3.35);
        label('Thick ascending limb','atp',1.63,3.35);
        label('Water out','electron',-3.36,.97); label('Salt out','atp',2.10,1.10);
        label('Higher concentration deeper in the medulla','atp',2.70,-3.15);
        animate=time=>{lumen(time);exits.forEach(draw=>draw(time));};
      } else {
        const conduit=path([[-.94,3],[-.94,1],[-.94,-1],[-.94,-3]]);
        tube(root,conduit,.68,gold,.30);
        const cells=new THREE.Group();root.add(cells);
        for (let row=0;row<5;row++) {
          const y=2.24-row*1.1, dot=bead(cells,0xca7d98,.36);
          dot.position.set(-.10,y,.04);dot.scale.set(.27,.41,.34);
          const nucleus=bead(cells,0x985eae,.09);
          nucleus.position.set(-.05,y,.37);
        }
        const water=flow(root,path([[-.91,1.60,.50],[-.12,1.60,.53],[1.04,1.54,.54],[2.97,1.51,.51]]),aqua,6,.28);
        const salt=flow(root,path([[-.91,.01,.50],[-.12,.01,.53],[1.04,-.04,.54],[2.97,-.10,.51]]),gold,6,.29);
        const potassium=flow(root,path([[2.97,-1.66,.51],[1,-1.55,.54],[-.12,-1.58,.53],[-.91,-1.59,.50]]),blue,5,.26);
        const down=flow(root,conduit,0x9bafc2,10,.16);
        label('Tubular fluid','atp',-.93,3.43);label('Principal cells','rbc',.94,2.65);
        label('Water reabsorbed','electron',3.13,1.91); label('Sodium reabsorbed','atp',3.13,.35);
        label('Potassium secreted','dendrite',3.13,-1.15);
        animate=time=>{
          const adh=$('#nephronAdh')?.checked!==false;
          const aldosterone=$('#nephronAldosterone')?.checked!==false;
          down(time);
          water(time,adh ? 6 : 1);salt(time,aldosterone ? 6 : 2);potassium(time,aldosterone ? 5 : 1);
        };
      }
      let time=0;
      const draw=()=>animate(reduceMotion ? 2 : time);
      behaviors[key]={enter(){time=0;draw();},tick(_,dt){time+=dt;draw();}};
    }
    return {groups,poses,fog,depth,behaviors};
  }

  function build({scene,addLabel,textSprite}) {
    const anatomy=anatomyScenes({scene,addLabel});
    const group = new THREE.Group();
    scene.add(group);
    const gold=0xffd75e, sodium=0xd8f1ff, potassium=0x4fb8ff;
    const red=0xd6657b, sea=0x48c1bb, orchid=0xb19cf1;
    const sphere=new THREE.SphereGeometry(1,20,14);
    const materials=new Map();
    function paint(color) {
      if (!materials.has(color)) materials.set(color,new THREE.MeshStandardMaterial({color,roughness:.62}));
      return materials.get(color);
    }
    function ellipsoid(parent,color,p,size) {
      const object=new THREE.Mesh(sphere,paint(color));
      object.position.set(...p);
      object.scale.set(...size);
      parent.add(object);
      return object;
    }
    function layer() {
      const object=new THREE.Group();
      group.add(object);
      return object;
    }
    function track(points) {
      return new THREE.CatmullRomCurve3(points.map(p=>new V3(...p)));
    }
    function line(curve,color,opacity=.5) {
      const geo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
      group.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color,transparent:true,opacity})));
    }
    const label=(title,color,x,y,z=1)=>addLabel(title,color,group,new V3(x,y,z),[id]);

    // Sectioned cytoplasm with distinct apical and basolateral surfaces.
    const cytoplasm = new THREE.Mesh(new THREE.BoxGeometry(4.36,4.25,.62),paint(0x6a354e));
    cytoplasm.position.z=-.58;
    group.add(cytoplasm);
    for (const side of [-1,1]) {
      const wall=new THREE.Mesh(new THREE.BoxGeometry(.17,4.25,.73),paint(side<0 ? 0xf2a4a6 : red));
      wall.position.set(side*2.22,0,-.48);
      group.add(wall);
    }
    for (let i=0;i<17;i++) {
      const y=-1.99+i*.247;
      for (const depth of [-.67,-.36,-.04]) {
        if (Math.abs(y-.72)<.29 && depth>-.6) continue;
        ellipsoid(group,0xe6899c,[-2.54+.035*Math.sin(i*2),y,depth],[.43,.072,.075]);
      }
    }
    ellipsoid(group,0x995fa3,[.26,-.45,-.19],[.61,.43,.24]);
    ellipsoid(group,0xaf7eb7,[.35,-.40,.035],[.14,.12,.05]);
    for (const [x,y,rotation] of [[-.99,-1.48,.25],[.99,-1.64,-.3],[1.31,1.52,.4]]) {
      const mitochondrion=ellipsoid(group,0xcb9a70,[x,y,-.13],[.32,.115,.13]);
      mitochondrion.rotation.z=rotation;
    }

    const capillary = new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,4.85,32,1,true),
      new THREE.MeshStandardMaterial({color:0xb6425e,transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}));
    capillary.position.set(5.07,0,-.12);
    group.add(capillary);
    const redCells=Array.from({length:6},(_,i)=>{
      const redCell=ellipsoid(group,0xd64b65,[5.07,0,-.1],[.43,.13,.32]);
      redCell.rotation.z=.21*Math.sin(i);
      return redCell;
    });

    const portal=(x,y,color)=>{
      for (const side of [-1,1]) ellipsoid(group,color,[x,y+side*.22,.24],[.31,.17,.26]);
    };
    portal(-2.4,.72,sea);
    portal(2.24,.72,0x8cce73);
    portal(2.24,-1.25,orchid);
    label('Filtrate','electron',-4.17,2.57);
    label('Brush-border cell','rbc',-.10,2.57);
    label('Peritubular capillary','rbc',4.66,2.57);
    label('Apical brush border','rbc',-3.3,-1.3);
    label('Basolateral membrane','rbc',2.95,-2.56);
    label('SGLT2 · sodium + glucose','electron',-3.6,1.65);
    label('GLUT2 · glucose exit','atp',2.6,1.75,.6);
    label('Tissue fluid','electron',3.6,-.35,.6);
    label('Na⁺/K⁺ pump','dendrite',2.40,-1.98);

    const glucoseRoute=track([[-5.10,.71,.58],[-3.45,.72,.59],[-2.42,.72,.59],
      [-.75,.72,.59],[.80,.75,.59],[2.24,.72,.59],[3.37,.75,.59],[5.05,.69,.35]]);
    line(glucoseRoute,gold);
    const glucose=layer();
    for (let i=0;i<6;i++) {
      const angle=i*Math.PI/3;
      ellipsoid(glucose,i===0 ? red : gold,[.12*Math.cos(angle),.12*Math.sin(angle),0],[.069,.069,.069]);
    }
    const glucoseText=textSprite('Glucose',new THREE.Color(gold),.33);
    glucoseText.position.y=.35;
    glucose.add(glucoseText);
    const coupled=textSprite('Na⁺',new THREE.Color(sodium),.36);
    group.add(coupled);
    const sodiumOut=track([[1.25,-1.22,.54],[2.24,-1.25,.61],[3.27,-1.33,.58]]);
    const potassiumIn=track([[3.23,-1.36,.60],[2.24,-1.25,.66],[1.26,-1.29,.63]]);
    const pumpMarkers=[
      {path:sodiumOut,objects:Array.from({length:3},()=>textSprite('Na⁺',new THREE.Color(sodium),.28))},
      {path:potassiumIn,objects:Array.from({length:2},()=>textSprite('K⁺',new THREE.Color(potassium),.28))},
    ];
    pumpMarkers.forEach(({objects})=>objects.forEach(object=>group.add(object)));

    let gradient=1, progress=0, elapsed=0;
    function draw(dt) {
      const running=$('#nephronPump')?.value!=='off';
      const target=running ? 1 : 0;
      elapsed+=dt;
      gradient=target+(gradient-target)*Math.exp(-dt*(running ? .52 : .32));
      // In reduced motion, keep the diagram readable and still update its meter.
      if (!reduceMotion) progress=(progress+dt*.23*gradient)%1;
      glucoseRoute.getPointAt(reduceMotion ? .37 : progress,glucose.position);
      const {x,y,z}=glucose.position;
      const separation=Math.min(1,Math.max(0,(x+2.35)/1.6));
      coupled.visible=x<-.75;
      coupled.position.set(x,y-.22-.31*separation,z+.12);
      const cycle=(reduceMotion ? .24 : elapsed*.65)%1;
      pumpMarkers.forEach(({path,objects},direction)=>{
        const active=direction===0 ? cycle<.5 : cycle>=.5;
        objects.forEach((object,i)=>{
          object.visible=running && active;
          path.getPointAt((cycle*2)%1,object.position);
          object.position.y+=(i-(objects.length-1)/2)*.22;
        });
      });
      redCells.forEach((object,i)=>{object.position.y=2.4-4.8*((i/redCells.length+(reduceMotion ? 0 : elapsed*.29))%1);});

      const meter=$('#nephronGradient');
      if (!meter) return;
      $('#nephronReadout').hidden=false;
      const value=Math.round(100*gradient);
      if (meter.value!==value) meter.value=value;
      const caption=$('#nephronPumpCaption');
      const message=running ? (value>=98 ? 'The pump maintains the inward sodium gradient.' : 'The pump is rebuilding the inward sodium gradient.') :
        (value>2 ? 'The pump is paused. The gradient is fading and uptake is slowing.' : 'The gradient has nearly dissipated. Glucose uptake is minimal in this model.');
      if (caption.textContent!==message) caption.textContent=message;
    }
    return {
      groups:{...anatomy.groups,[id]:group}, fog:{...anatomy.fog,[id]:.002}, depth:{...anatomy.depth,[id]:1},
      poses:{...anatomy.poses,[id]:{group:id,target:new V3(0,.2,0),pos:new V3(6.5,4.2,15),w:6.3}},
      behaviors:{...anatomy.behaviors,[id]:{enter(){gradient=1;progress=0;elapsed=0;draw(0);},tick(_,dt){draw(dt);}}},
    };
  }
  CellCity.register('nephron',{chapters:[overview,filtration,chapter,loop,collecting],build});
})();
