(() => {
  const source = '<p><a href="https://openstax.org/books/biology-2e/pages/43-4-hormonal-control-of-human-reproduction">OpenStax · Hormonal Control of Human Reproduction</a></p>';
  const credits = `<details><summary>3D anatomy sources</summary>
    <p>Body and named organs adapted by Open Anatomy 3D from BodyParts3D © The Database Center for Life Science, HuBMAP Human Reference Atlas 3D Reference Organs, and MakeHuman (CC0). The atlas displays selected parts with translucent skin and recolored glands. <a href="https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md">Full attribution</a> · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>
    <p>Supplemental meshes come from Z-Anatomy by Gauthier Kervyn, Marcin Zielinski, and contributors, derived from BodyParts3D (CC BY-SA 2.1 Japan) and converted by Anatomy Explorer. The atlas isolates, scales, repositions, and recolors these meshes. <a href="https://github.com/ArianArsenal/anatomy-explorer#credits--license">Source and credits</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
    </details>`;
  const glands = [
    ['brain','Hypothalamus, pituitary and pineal','The hypothalamus regulates pituitary output. Pituitary hormones help govern growth, reproduction and other glands. The pineal gland releases melatonin.'],
    ['neck','Thyroid and parathyroids','The thyroid wraps around the front and sides of the trachea. The small parathyroid glands are usually on the back of the thyroid and help regulate blood calcium.'],
    ['chest','Thymus','The thymus lies behind the breastbone. It supports T-cell maturation and is proportionally larger early in life.'],
    ['abdomen','Adrenals and pancreas','The adrenal glands sit above the kidneys. The pancreatic islets release hormones such as insulin and glucagon into nearby capillaries.'],
    ['gonads','Ovaries or testes','Ovaries and testes produce reproductive hormones and gametes. Use the anatomy selector to compare their locations.'],
  ];
  const chapters = [
    {id:'endocrine-map', short:'Gland map', title:'Where endocrine signals begin', legend:[['atp','Selected glands']],
      html:()=>`<p class="lede">Rotate the body to see how the glands sit at different depths. The parathyroids are behind the thyroid.</p>
      <label class="lesson-control">Region <select id="endocrineRegion">${glands.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>
      <label class="lesson-control">Reproductive anatomy <select id="endocrineAnatomy"><option value="ovaries">Ovaries</option><option value="testes">Testes</option></select></label>
      <div class="lesson-pair">${glands.map(([id,name,description])=>`<section><h3>${name}</h3><p>${description}</p></section>`).join('')}</div>
      <p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-1-an-overview-of-the-endocrine-system">OpenStax · Endocrine system overview</a></p>`},
    {id:'endocrine-secretion', short:'Blood or duct', title:'One pancreas, two routes out', legend:[['endocrine-insulin','Insulin'],['endocrine-glucagon','Glucagon'],['endocrine-delta','Somatostatin'],['endocrine-pp','Pancreatic polypeptide'],['amino','Digestive enzymes']],
      html:()=>`<p class="lede">At left, the pancreatic islet releases signals into nearby tissue fluid and capillaries. At right, acinar cells release digestive enzymes into a duct that leads toward the small intestine.</p>
      <label class="lesson-control">Highlight <select id="endocrineRoute"><option value="both">Both routes</option><option value="blood">Islet to blood</option><option value="duct">Acini to duct</option></select></label>
      <ul class="facts"><li><b>Beta cells</b> release insulin, which promotes glucose uptake in muscle and fat.</li><li><b>Alpha cells</b> release glucagon, which helps raise blood glucose through effects on the liver.</li><li><b>Delta cells</b> release somatostatin, which restrains nearby hormone release. <b>PP cells</b> release pancreatic polypeptide.</li></ul>
      <p>The scene compares routes. Cell counts, spacing, and particle timing are schematic.</p><p><a href="#islet">Explore the pancreatic islet</a> · <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-9-the-endocrine-pancreas">OpenStax · Endocrine pancreas</a></p>`},
    {id:'endocrine-targets', short:'Signals and targets', legend:[['endocrine-insulin','Insulin'],['endocrine-pp','Insulin receptor']], title:'A hormone circulates. Its receptor selects the target.',
      html:()=>`<p class="lede">An endocrine cell releases a hormone into the blood. The signal travels widely, but each cell responds according to the receptors and signaling machinery it has.</p>
      <div class="lesson-flow"><span>Pancreatic beta cell</span><span>Insulin in blood</span><span>Receptor on muscle or fat cell</span><span>More GLUT4 at the membrane</span></div>
      <p>After a meal, insulin helps muscle and fat cells take up glucose by moving more GLUT4 transporters to the surface. The insulin receptor stays at the membrane and relays the signal inward.</p>
      <p><a href="#beta">Watch a beta cell release insulin</a> · <a href="#permeability">See how a glucose carrier works</a></p>`},
    {id:'endocrine-receptors', short:'Two receptor routes', legend:[['endocrine-insulin','Insulin'],['endocrine-glucagon','Estradiol']], title:'Hormones can signal at the membrane or inside the cell',
      html:()=>`<div class="lesson-pair"><section><h3>Insulin</h3><div class="lesson-flow"><span>Membrane receptor</span><span>Signals relayed through proteins inside the cell</span><span>Cell changes glucose uptake and storage</span></div></section>
      <section><h3>Estradiol</h3><div class="lesson-flow"><span>Hormone crosses the lipid bilayer</span><span>Intracellular estrogen receptor binds it</span><span>The complex can change gene expression</span></div></section></div>
      <p>These pathways illustrate different ways a circulating message becomes a local response. Insulin can rapidly change metabolism. Estradiol can change which proteins a target cell makes.</p>
      <p><a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/17-2-hormones">OpenStax · Hormones</a></p>`},
    {id:'endocrine-patterns', short:'Hormone patterns', title:'Shared hormones, different patterns',
      html:()=>`<p class="lede">People of both sexes produce testosterone, estradiol, and progesterone. Typical amounts and timing vary with reproductive anatomy, age, and life stage.</p>
      <label class="lesson-control">Reproductive anatomy <select id="endocrinePattern"><option value="ovaries">Ovaries</option><option value="testes">Testes</option></select></label><div class="table-wrap"><table class="ledger"><thead><tr><th>Hormone</th><th>Examples of sources</th><th>Example roles</th></tr></thead><tbody>
      <tr><td>Testosterone</td><td>Testes and ovaries. Adrenal precursors contribute.</td><td>Supports sperm production in the testes and contributes to muscle and bone maintenance.</td></tr>
      <tr><td>Estradiol</td><td>Ovarian follicles and conversion of androgens in other tissues.</td><td>Helps maintain bone and supports growth of the uterine lining.</td></tr>
      <tr><td>Progesterone</td><td>Corpus luteum after ovulation, placenta during pregnancy, and smaller amounts from other steroid-producing tissues.</td><td>Helps prepare the uterine lining after ovulation.</td></tr></tbody></table></div>
      <p>GnRH, LH, and FSH signaling increases during puberty. After menopause, ovarian estradiol and progesterone production falls and the ovulatory pattern ends. Testosterone levels vary among individuals and can change with age.</p>${source}`},
    {id:'endocrine-feedback', short:'Feedback through time', title:'Feedback coordinates the gonads with the brain',
      html:()=>`<div class="lesson-flow"><span>Hypothalamus releases GnRH</span><span>Pituitary releases LH and FSH</span><span>Gonads release hormones</span></div>
      <label class="lesson-control">Feedback view <select id="endocrineFeedback"><option value="follicle">Follicle growth</option><option value="surge">LH surge</option><option value="luteal">After ovulation</option><option value="testes">Testicular feedback</option></select></label>
      <div class="lesson-pair"><section><h3>During an ovulatory cycle</h3>
      <details open><summary>Follicle growth</summary><p>FSH supports follicle growth. The developing follicle produces increasing estradiol.</p></details>
      <details><summary>Ovulation</summary><p>Sustained high estradiol briefly promotes positive feedback. The LH surge triggers ovulation.</p></details>
      <details><summary>After ovulation</summary><p>The corpus luteum produces progesterone and estradiol. If pregnancy does not begin, both fall as the corpus luteum regresses.</p></details></section>
      <section><h3>In the testes</h3>
      <details open><summary>Testosterone production</summary><p>LH stimulates Leydig cells to produce testosterone.</p></details>
      <details><summary>Sperm development</summary><p>FSH acts on Sertoli cells. Together with local testosterone, their support helps developing sperm cells mature.</p></details>
      <details><summary>Negative feedback</summary><p>Testosterone helps restrain upstream signaling. Inhibin B from Sertoli cells helps suppress FSH.</p></details></section></div>
      <p>The steps show the order of events. Timing and hormone levels vary.</p><p><a href="#gametes">Continue to reproductive cells</a></p>${source}`},
  ].map(chapter=>{
    const bodyView=['endocrine-map','endocrine-patterns'].includes(chapter.id);
    return {where:'Endocrine signaling',legend:[],...chapter,
      html:bodyView ? ()=>chapter.html()+'<p data-anatomy-status role="status">The schematic appears while the anatomical model loads.</p>'+credits : chapter.html};
  });
  const supplementBase='https://cdn.jsdelivr.net/gh/ArianArsenal/anatomy-explorer@8375d6ce7fec36e677c0eda66cae829ba55a4717/public/models/';
  const supplementalGlands={
    hypothalamus:/^hypothalamus$/,
    pineal:/^pineal(?: gland| body)?$/,
    thyroid:/^thyroid gland$/,
    parathyroid:/^(?:(?:superior|inferior|upper|lower|left|right) )?parathyroid(?: gland)?(?:s)?$/,
    testis:/^(?:testis|testicle)$/,
  };
  let supplements;
  function glandSources() {
    supplements ||= Promise.allSettled(['organs','nerves'].map(kind=>anatomyFile(supplementBase+kind+'.glb')))
      .then(results=>{
        const meshes={};
        for (const result of results) {
          if (result.status!=='fulfilled') continue;
          result.value.traverse(object=>{
            if (!object.isMesh) return;
            const names=[object.name,object.parent?.name].filter(Boolean).map(name=>
              name.toLowerCase().replace(/[_.-]/g,' ').replace(/ (?:l|r|left|right|[0-9]+)$/,'').trim());
            for (const [gland,pattern] of Object.entries(supplementalGlands)) {
              if (!names.some(name=>pattern.test(name))) continue;
              (meshes[gland] ||= []).push(object);
            }
          });
        }
        return meshes;
      });
    return supplements;
  }
  function build({scene,addLabel}) {
    const groups={}, poses={}, behaviors={}, fog={}, depth={};
    const sphere=new THREE.SphereGeometry(1,20,14);
    const palette={rose:0xe68499,gold:0xf4bd65,teal:0x55ddca,purple:0xb199ef,blue:0x75b9f3,blood:0xa74056,duct:0x248fa2,enzyme:0xff79c6,nucleus:0x564264};
    const materials={};
    const vec=values=>new V3(...values);
    function cell(parent,color,p,scale) {
      const object=new THREE.Mesh(sphere,materials[color] ||= new THREE.MeshStandardMaterial({color:palette[color],roughness:.65}));
      object.position.copy(vec(p));
      object.scale.copy(vec(typeof scale==='number' ? [scale,scale,scale] : scale));
      parent.add(object);
      return object;
    }
    function tube(parent,color,points,radius) {
      const curve=new THREE.CatmullRomCurve3(points.map(vec));
      const geometry=new THREE.TubeGeometry(curve,28,radius,10,false);
      parent.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:palette[color]})));
      return curve;
    }
    function stream(parent,color,points,count,radius=.085) {
      const curve=new THREE.CatmullRomCurve3(points.map(vec));
      const markers=Array.from({length:count},()=>cell(parent,color,points[0],radius));
      return (time,speed=.23)=>markers.forEach((marker,i)=>curve.getPointAt((time*speed+i/count)%1,marker.position));
    }
    function layer(parent) {
      const object=new THREE.Group();
      parent.add(object);
      return object;
    }
    for (const {id} of chapters) {
      const root=layer(scene);
      groups[id]=root; fog[id]=.002; depth[id]=1;
      poses[id]={group:id,target:new V3(),pos:new V3(0,1,17),w:6.15};
      const label=(text,x,y,parent=root,color='electron')=>addLabel(text,color,parent,new V3(x,y,.62),[id]);
      let draw;
      if (id==='endocrine-map' || id==='endocrine-patterns') {
        const map=id==='endocrine-map', organs=[], models=new Map();
        const schematic=layer(root);
        let supplementalMeshes;
        const ghost=new THREE.MeshStandardMaterial({color:0x889bad,transparent:true,opacity:.15,depthWrite:false,side:THREE.DoubleSide});
        const silhouette=[
          [[0,3.42,0],[.90,1.04,.69]],[[0,2.28,0],[.48,.65,.46]],[[0,1.16,0],[1.86,1.05,.60]],
          [[0,-.23,0],[1.29,1.32,.63]],[[0,-1.57,0],[1.47,.81,.66]],
        ];
        for (const side of [-1,1]) silhouette.push([[side*1.78,.37,0],[.36,1.37,.35]],[[side*.70,-2.58,0],[.63,1.08,.49]]);
        silhouette.forEach(([p,s])=>{const part=cell(schematic,'blue',p,s);part.material=ghost;part.renderOrder=2;});
        const organ=(region,color,p,s,anatomy,key)=>{
          const object=cell(root,color,p,s);
          organs.push({region,object,base:object.material,anatomy,key,position:object.position.clone(),scale:object.scale.clone()});
        };
        organ('brain','blue',[0,3.49,.27],[.23,.14,.14],null,'hypothalamus');
        organ('brain','rose',[.04,3.20,.36],[.15,.13,.12],null,'pituitary');
        organ('brain','purple',[.20,3.63,-.14],.10,null,'pineal');
        for (const side of [-1,1]) {
          organ('neck','rose',[side*.23,2.02,.45],[.20,.34,.13],null,'thyroid');
          for (const y of [1.91,2.15]) organ('neck','gold',[side*.25,y,.27],.068,null,'parathyroid');
          cell(schematic,'blood',[side*.85,-.84,-.04],[.32,.42,.23]);
          organ('abdomen','gold',[side*.85,-.45,.08],[.26,.13,.20],null,side<0 ? 'adrenal_r' : 'adrenal_l');
          organ('gonads','rose',[side*.62,-1.92,.44],[.20,.12,.11],'ovaries',side<0 ? 'ovary_r' : 'ovary_l');
          organ('gonads','blue',[side*.23,-2.64,.44],[.16,.23,.14],'testes','testis');
        }
        organ('neck','rose',[0,1.97,.49],[.22,.085,.08],null,'thyroid');
        organ('chest','purple',[0,1.16,.54],[.22,.37,.13],null,'thymus');
        for (let i=0;i<8;i++) organ('abdomen','rose',[-.75+.21*i,-1+.19*Math.sin(i*.39),.52],[.21,.17,.15],null,'pancreas');
        for (const [text,x,y] of (map ? [['Hypothalamus / pituitary',-2.25,3.42],['Pineal',1.50,3.63],
          ['Thyroid / parathyroids',2.14,2.0],['Thymus',-1.68,1.16],['Adrenals',-1.93,-.45],
          ['Pancreas',1.63,-1.00],['Gonads',1.56,-2.12]] :
          [['Adrenals',-1.93,-.45],['Gonads',1.56,-2.12]])) label(text,x,y);
        const highlight=new THREE.MeshStandardMaterial({color:palette.gold,emissive:0x563215});
        const status=(target,text)=>{if (target && target.textContent!==text) target.textContent=text;};
        function extract(node, parent, replacementMaterial) {
          node.traverse(part=>{
            if (!part.isMesh) return;
            const mesh=new THREE.Mesh(part.geometry,replacementMaterial);
            mesh.applyMatrix4(part.matrixWorld);
            parent.add(mesh);
          });
        }
        function startAvatar(anatomy) {
          const entry={state:'loading',nodes:[]};
          models.set(anatomy,entry);
          const sex=anatomy==='testes' ? 'male' : 'female';
          loadAnatomyAvatar(sex).then(asset=>{
            const skin=asset.getObjectByName('skin');
            if (!skin) throw new Error('Skin node unavailable');
            const bounds=new THREE.Box3().setFromObject(skin);
            const center=bounds.getCenter(new V3());
            const height=bounds.max.y-bounds.min.y;
            if (!Number.isFinite(height) || height<=0) throw new Error('Invalid avatar bounds');
            const avatar=layer(root);
            avatar.visible=false;
            const scale=12.5/height;
            avatar.scale.setScalar(scale);
            avatar.position.set(-center.x*scale,4.45-bounds.max.y*scale,-center.z*scale);
            const shell=layer(avatar);
            extract(skin,shell,ghost);
            shell.traverse(mesh=>{mesh.renderOrder=2;});
            entry.keys=new Set();
            for (const key of new Set(organs.map(organ=>organ.key))) {
              if (supplementalGlands[key]) continue;
              const node=asset.getObjectByName(key);
              if (!node) continue;
              const bucket=layer(avatar), spec=organs.find(organ=>organ.key===key);
              extract(node,bucket,spec.base);
              if (bucket.children.length) {
                entry.keys.add(key);
                entry.nodes.push({bucket,spec});
              }
            }
            entry.avatar=avatar;
            entry.shell=shell;
            entry.placements=new Map();
            avatar.updateWorldMatrix(true,true);
            entry.state='ready';
            glandSources().then(meshes=>{supplementalMeshes=meshes;});
          }).catch(error=>{
            entry.state='failed';
            console.warn('Could not display the endocrine avatar',error);
          });
          return entry;
        }
        const ray = new THREE.Raycaster();
        const forward = new V3(0,0,1);
        const relativeDepth = {hypothalamus:.52,pineal:.32,thyroid:.76,parathyroid:.59,testis:.58};
        function placementFor(entry,spec) {
          if (entry.placements.has(spec)) return entry.placements.get(spec);
          const position=spec.position.clone(), scale=spec.scale.clone();
          if (spec.key==='thyroid' && position.x===0) scale.set(.38,.31,.13);
          if (spec.key==='hypothalamus') scale.set(.135,.105,.10);
          // Sample the skin in the same world coordinates as the gland overlays.
          // The first and last hits bound the body's depth at this height.
          ray.set(new V3(position.x,position.y,-20),forward);
          const hits=ray.intersectObject(entry.shell,true);
          if (hits.length>=2) {
            const back=hits[0].point.z, front=hits[hits.length-1].point.z;
            const depth=front-back;
            if (depth>.001) {
              scale.z=Math.min(scale.z,depth*.20);
              const margin=scale.z+.035;
              position.z=depth<=margin*2 ? (back+front)/2 :
                THREE.MathUtils.clamp(back+depth*(relativeDepth[spec.key] ?? .5),back+margin,front-margin);
            }
          } else {
            position.z=0;
          }
          const placement={position,scale};
          entry.placements.set(spec,placement);
          return placement;
        }
        const overlays=new Map();
        function installSupplement(spec,source) {
          const bounds=new THREE.Box3().setFromObject(source);
          const dimensions=bounds.getSize(new V3());
          if (!(Math.max(dimensions.x,dimensions.y,dimensions.z)>0)) return;
          const bucket=layer(root), centered=layer(bucket);
          extract(source,centered,spec.base);
          centered.position.copy(bounds.getCenter(new V3())).negate();
          overlays.set(spec,{bucket,dimensions});
        }
        draw=()=>{
          const selected=map ? $('#endocrineRegion')?.value || 'brain' : 'gonads';
          const anatomy=$(map ? '#endocrineAnatomy' : '#endocrinePattern')?.value || 'ovaries';
          const current=models.get(anatomy) || startAvatar(anatomy);
          const ready=current.state==='ready';
          schematic.visible=!ready;
          for (const entry of models.values()) if (entry.avatar) entry.avatar.visible=entry===current;
          for (const {bucket,spec} of current.nodes) {
            for (const mesh of bucket.children) mesh.material=spec.region===selected ? highlight : spec.base;
          }
          const fallback=new Set();
          const thyroidMesh=organs.some(spec=>spec.key==='thyroid' && overlays.has(spec));
          for (const spec of organs) {
            const {region,object,base,anatomy:kind,key}=spec;
            const applies=!kind || kind===anatomy;
            const source=supplementalMeshes?.[key]?.[0];
            const member=key!=='thyroid' || object.position.x===0;
            if (ready && source && applies && member && !overlays.has(spec)) installSupplement(spec,source);
            const overlay=overlays.get(spec);
            const placement=ready && applies && !current.keys.has(key) ? placementFor(current,spec) : spec;
            object.position.copy(placement.position);
            object.scale.copy(placement.scale);
            if (key==='thyroid' && member && !overlay) object.scale.copy(spec.scale);
            if (overlay) {
              const {bucket,dimensions}=overlay;
              bucket.visible=ready && applies;
              bucket.position.copy(placement.position);
              const size=placement.scale;
              const fit=Math.min(2*size.x/Math.max(.0001,dimensions.x),
                2*size.y/Math.max(.0001,dimensions.y),2*size.z/Math.max(.0001,dimensions.z));
              bucket.scale.setScalar(fit);
              bucket.traverse(mesh=>{if (mesh.isMesh) mesh.material=region===selected ? highlight : base;});
            }
            const imported=ready && (current.keys.has(key) || Boolean(overlay || (key==='thyroid' && !member && thyroidMesh)));
            object.visible=applies && !imported;
            object.material=region===selected ? highlight : base;
            if (object.visible) fallback.add(key.replace(/_/g,' '));
          }
          const output=$('[data-anatomy-status]');
          if (ready) status(output, fallback.size ? 'Open Anatomy 3D body. Schematic landmarks: '+[...fallback].join(', ')+'.' : 'Open Anatomy 3D body with supplemental gland meshes.');
          else status(output,current.state==='failed' ? 'The detailed model could not load. Showing the schematic body.' : 'The schematic appears while the anatomical model loads.');
        };
      } else if (id==='endocrine-secretion') {
        const islet=layer(root), acini=layer(root);
        const vessel=[[-5.2,-1.50,0],[-3.85,-1.26,0],[-2,-1.20,0],[-.4,-.78,0]];
        const outlet=[[2.75,-.8,0],[2.74,.32,0],[2.87,1.24,0],[4.9,1.88,0]];
        tube(islet,'blood',vessel,.22);
        tube(acini,'duct',outlet,.22);
        cell(islet,'nucleus',[-2.85,.11,-.34],[1.58,1.33,.33]);
        const cells=[['teal',-3.75,.44],['teal',-2.78,.80],['gold',-2.30,.24],['purple',-2.99,-.28],
          ['blue',-1.89,-.30],['teal',-2.40,-.54],['gold',-3.53,-.39],['teal',-3.08,.27],['teal',-1.98,.66]];
        const secretions=cells.map(([color,x,y])=>{
          cell(islet,color,[x,y,.13],[.34,.34,.24]);
          cell(islet,'nucleus',[x+.04,y+.05,.35],.082);
          return stream(islet,color,[[x,y,.39],[x+.05,y-.19,.53],[x+.24,-1.17,.19],[-.41,-.78,.17]],2,.067);
        });
        for (const [x,y] of [[1.86,-.56],[3.65,-.55],[1.87,.52],[3.65,.53]]) {
          for (let i=0;i<6;i++) {
            const angle=i*Math.PI/3, px=x+.33*Math.cos(angle), py=y+.33*Math.sin(angle);
            cell(acini,'rose',[px,py,.11],[.23,.23,.21]);
            cell(acini,'nucleus',[px,py,.30],.063);
          }
          tube(acini,'duct',[[x,y,.01],[(x+2.75)/2,y+.01,0],[2.75,y+.13,0]],.08);
        }
        const enzymes=stream(acini,'enzyme',[[3.65,-.70,.30],[3.57,-.55,.24],[2.76,-.46,.18],[2.74,.32,.18],[2.87,1.24,.18],[4.9,1.88,.18]],10);
        label('Pancreatic islet',-2.80,1.71,islet,'insulin');
        label('Capillary',-3.08,-1.91,islet,'rbc');
        label('Acinar cells',3.06,-1.45,acini,'rbc');
        label('Duct to small intestine',3.37,2.40,acini);
        draw=time=>{
          const view=$('#endocrineRoute')?.value;
          islet.visible=view!=='duct'; acini.visible=view!=='blood';
          secretions.forEach((animate,i)=>animate(time+i*.29));
          enzymes(time);
        };
      } else if (id==='endocrine-targets' || id==='endocrine-receptors') {
        const compare=id==='endocrine-receptors', x=compare ? -2.58 : 2.65;
        cell(root,'rose',[x,-.32,0],[1.72,1.40,.43]);
        cell(root,'nucleus',[x,-.58,.37],[.55,.41,.17]);
        tube(root,'blue',[[x-.29,1.05,.23],[x-.13,.87,.34],[x,.80,.40],[x+.13,.87,.34],[x+.29,1.05,.23]],.092);
        const transporters=Array.from({length:4},(_,i)=>cell(root,'blue',[x+1.03,-.60+i*.28,.35],[.11,.095,.08]));
        let route, estradiol;
        if (compare) {
          cell(root,'purple',[2.61,-.32,0],[1.72,1.40,.40]);
          cell(root,'nucleus',[2.61,-.59,.38],[.58,.44,.14]);
          tube(root,'purple',[[2.43,-.45,.59],[2.62,-.57,.62],[2.79,-.44,.59]],.08);
          estradiol=stream(root,'gold',[[2.62,2.46,.47],[2.62,1.06,.49],[2.65,.36,.49],[2.62,-.48,.67]],1,.13);
          route=[[x,2.42,.46],[x,1.50,.47],[x,.92,.54]];
          label('Estradiol',2.61,2.83); label('Intracellular receptor',2.61,-2.10);
        } else {
          cell(root,'rose',[-3.58,-.29,0],[1.07,.85,.47]);
          cell(root,'nucleus',[-3.65,-.47,.43],[.32,.26,.11]);
          tube(root,'blood',[[-3.68,.74,0],[-2.87,1.40,0],[-1.38,1.64,0],[.63,1.53,0]],.19);
          route=[[-3.58,.10,.36],[-3.48,.89,.16],[-2.40,1.50,.17],[-.59,1.59,.16],[1.38,1.44,.28],[x,.92,.54]];
          label('Beta cell',-3.58,-1.50); label('Insulin in the blood',-1.40,2.03,root,'insulin');
        }
        const insulin=stream(root,'teal',route,1,.13);
        label('Insulin receptor',x,1.35); label('GLUT4 moves to the membrane',x,-2.07);
        draw=time=>{
          insulin(time,.19);
          estradiol?.(time,.19);
          const progress=Math.min(1,Math.max(0,((time*.19)%1-.76)*7));
          transporters.forEach(marker=>{marker.position.x=x+1.03+.62*progress;});
        };
      } else {
        const stages={
          follicle:['Ovary','Estradiol · negative feedback'],
          surge:['Mature follicle','High estradiol · positive feedback'],
          luteal:['Corpus luteum','Progesterone and estradiol · negative feedback'],
          testes:['Testes','Testosterone · negative feedback'],
        };
        cell(root,'purple',[-3.57,.36,0],[.82,.57,.47]);
        cell(root,'rose',[0,.36,0],[.70,.52,.44]);
        cell(root,'rose',[3.57,.36,0],[.88,.62,.46]);
        const signals=[
          ['purple',[[-2.81,.49,.04],[-1.83,.74,.06],[-.63,.49,.04]]],
          ['blue',[[.63,.49,.04],[1.83,.74,.06],[2.76,.49,.04]]],
          ['gold',[[3.53,-.18,.04],[2.68,-1.13,.05],[0,-1.51,.06],[-2.68,-1.13,.05],[-3.53,-.18,.04]]],
        ];
        const pulses=signals.map(([color,points])=>{
          tube(root,color,points,.064);
          return stream(root,color,points,3,.103);
        });
        label('Hypothalamus',-3.57,1.40); label('Pituitary',0,1.40);
        label('GnRH',-1.75,.98); label('LH and FSH',1.72,.98);
        const stageLayers=Object.entries(stages).map(([key,[organ,feedback]])=>{
          const frame=layer(root);
          label(organ,3.57,1.40,frame); label(feedback,0,-2.15,frame,'atp');
          return [key,frame];
        });
        draw=time=>{
          const view=$('#endocrineFeedback')?.value || 'follicle';
          stageLayers.forEach(([key,frame])=>{frame.visible=key===view;});
          pulses[0](time); pulses[1](time,view==='surge' ? .51 : .23); pulses[2](time);
        };
      }
      let elapsed=0;
      behaviors[id]={
        enter(){elapsed=0;draw(reduceMotion ? 2 : 0);},
        tick(_,delta){if (!reduceMotion) elapsed+=delta;draw(reduceMotion ? 2 : elapsed);},
      };
    }
    return {groups,poses,behaviors,fog,depth};
  }
  CellCity.register('endocrine',{chapters,build});
})();

