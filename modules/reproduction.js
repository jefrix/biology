/* Human reproductive cells and staged division, drawn schematically. */
(() => {
  const examples = {
    gametes: [
      ['Sperm and secondary oocyte','Compare the sperm head, midpiece, and flagellum with the much larger oocyte. The three-dimensional figures use different magnifications so both are visible.'],
    ],
    'human-meiosis': [
      ['Prophase I','A pair of duplicated homologous chromosomes comes together. Matching segments can be exchanged between nonsister chromatids.'],
      ['Metaphase I','Paired homologs line up across the center. Each homolog still consists of two sister chromatids.'],
      ['Anaphase I','Homologs separate toward opposite poles. Sister chromatids stay attached.'],
      ['After meiosis I','Each daughter has one chromosome from each pair: 23 chromosomes, each with two chromatids.'],
      ['Meiosis II','A second spindle forms in each daughter, and the sister chromatids are pulled apart. DNA was copied only before meiosis I.'],
      ['After meiosis II','Four spermatids are shown. Each has 23 single-chromatid chromosomes.'],
    ],
    fertilization: [
      ['Approach','A capacitated sperm approaches through the surrounding cells. Its acrosomal reaction helps it pass through the zona pellucida.'],
      ['Membrane fusion','The sperm membrane fuses with the oocyte membrane. The sperm contributes its genetic material.'],
      ['Egg activation','Calcium rises trigger cortical granule release. Changes to the zona help prevent additional sperm entry, and the oocyte completes meiosis II.'],
      ['Two pronuclei','Maternal and paternal pronuclei form. Their envelopes later break down as both chromosome sets enter the first mitotic division.'],
    ],
    'early-cleavage': [
      ['One-cell zygote','The first mitotic division begins within the zona pellucida.'],
      ['Two blastomeres','The first cleavage splits the original cytoplasm between two daughter cells.'],
      ['Four blastomeres','Another round of division produces four smaller cells.'],
      ['Eight blastomeres','The third round produces approximately eight cells. Compaction begins as cells adhere closely.'],
      ['Morula','Repeated division forms a compact, solid cluster. The overall size has changed much less than the individual cells.'],
      ['Early blastocyst','A fluid-filled cavity opens. The outer trophoblast and the inner cell mass become distinct.'],
    ],
  };
  const source = (...pairs) => { const list = []; for (let i = 0; i < pairs.length; i += 2) list.push(`<a href="${pairs[i]}" target="_blank" rel="noopener">${pairs[i + 1]}</a>`); return `<p class="credit">Sources: ${list.join(' · ')}. The 3D scenes are schematic and not to scale.</p>`; };
  function sequence(id) {
    const stages=examples[id];
    return `<fieldset id="reproControls" hidden><div class="lesson-control">
      <label>Stage <select id="reproStage">${stages.map(([title],i)=>`<option value="${i}">${title}</option>`).join('')}</select></label>
      <label><input type="checkbox" id="reproPlay" checked> Play sequence</label>
    </div></fieldset><ol class="lesson-sequence">${stages.map(([title,detail])=>`<li><b>${title}.</b> ${detail}</li>`).join('')}</ol>`;
  }
  const chapters = [
    {id:'gametes',short:'Sperm and oocyte',title:'Two cells built for different roles',
      legend:[['electron','Sperm'],['rbc','Oocyte'],['atp','Zona pellucida']],
      html:()=>`<p class="lede">A sperm delivers a set of chromosomes. A secondary oocyte supplies another set and the cytoplasm, organelles, and stored molecules that support early development.</p>
      <ul class="facts"><li>The sperm’s compact nucleus lies beneath the acrosomal cap. Its midpiece contains a sheath of mitochondria. Its flagellum propels it.</li>
      <li>The oocyte sits inside a glycoprotein coat called the zona pellucida. The small first polar body is a product of meiosis I. The ovulated oocyte is paused in meiosis II.</li></ul>
      <p>The figures use different magnifications so both cells are easy to see.</p>${source('https://openstax.org/books/anatomy-and-physiology-2e/pages/28-1-fertilization','OpenStax · Fertilization')}`},
    {id:'human-meiosis',short:'Meiosis',title:'Two divisions reduce the chromosome set',
      legend:[['electron','One parental homolog'],['rbc','Other parental homolog']],
      html:()=>`<p class="lede">Follow one representative chromosome pair through sperm-cell meiosis. Color follows the homologs so you can see when homologs and sister chromatids separate.</p>
      ${sequence('human-meiosis')}<p>The model shows one pair out of 23 and preserves the base colors after pairing for tracking. In oogenesis the cell divisions are unequal: one product retains most cytoplasm, while the other products are polar bodies.</p>
      <p><a href="#mitosis">Compare with mitosis</a></p>${source('https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis','OpenStax · Meiosis')}`},
    {id:'fertilization',short:'Fertilization',title:'From sperm entry to two pronuclei',
      legend:[['electron','Sperm contribution'],['rbc','Oocyte'],['atp','Zona and activation markers']],
      html:()=>`<p class="lede">Step through the changes in the oocyte from sperm approach to the start of the first division.</p>${sequence('fertilization')}
      <p><a href="#early-cleavage">Continue to early cleavage</a></p>${source('https://openstax.org/books/anatomy-and-physiology-2e/pages/28-1-fertilization','OpenStax · Fertilization')}`},
    {id:'early-cleavage',short:'Early cleavage',title:'One cell becomes a blastocyst',
      legend:[['rbc','Blastomeres'],['atp','Zona pellucida'],['electron','Blastocyst cavity']],
      html:()=>`<p class="lede">Watch one cell divide into progressively smaller daughter cells within the same outer coat. Rotate the model to see cells behind the front row.</p>${sequence('early-cleavage')}
      <p>The scene illustrates stage order and cell arrangement. Human cleavage can be asynchronous, and the morula and blastocyst models use representative cell counts.</p>
      <p><a href="#stem-potency">The inner cell mass and pluripotent stem cells</a></p>
      ${source('https://openstax.org/books/anatomy-and-physiology-2e/pages/28-2-embryonic-development','OpenStax · Embryonic development','https://embryology.med.unsw.edu.au/embryology/index.php/Carnegie_stage_2','UNSW Embryology · Human cleavage images')}`},
  ].map(chapter=>({where:'Human reproductive cells',...chapter}));

  function build({scene,addLabel}) {
    const groups={}, poses={}, fog={}, depth={}, behaviors={};
    const sphere=new THREE.SphereGeometry(1,28,18);
    const pink=0xe7899e, blue=0x80cffa, gold=0xefbd76, plum=0x8465a8;
    const material=(color,opacity=1)=>new THREE.MeshStandardMaterial({
      color,roughness:.58,transparent:opacity<1,opacity,depthWrite:opacity===1,
    });
    const pinkMat=material(pink), blueMat=material(blue), goldMat=material(gold), nucleus=material(plum);
    const envelope=material(gold,.19), membrane=material(0x9db9db,.17);
    const vector=point=>new V3(...point);
    function group(parent) {
      const object=new THREE.Group();
      parent.add(object);
      return object;
    }
    function ball(parent,finish,point,radius) {
      const object=new THREE.Mesh(sphere,finish);
      object.position.copy(vector(point));
      object.scale.setScalar(radius);
      parent.add(object);
      return object;
    }
    function strand(parent,finish,points,radius) {
      const curve=new THREE.CatmullRomCurve3(points.map(vector));
      const line=new THREE.Mesh(new THREE.TubeGeometry(curve,36,radius,8,false),finish);
      parent.add(line);
      return line;
    }
    function sperm(parent,point,scale) {
      const cell=group(parent); cell.position.copy(vector(point)); cell.scale.setScalar(scale);
      ball(cell,blueMat,[0,0,0],1).scale.set(.50,.34,.23);
      ball(cell,goldMat,[.24,0,.035],1).scale.set(.30,.31,.216);
      for(let i=0;i<7;i++) ball(cell,nucleus,[-.46-i*.085,0,0],.105-i*.006);
      const tail=group(cell);
      const points=Array.from({length:22},(_,i)=>[-.82-i*.14,.20*Math.sin(i*.56)*(i/21),.08*Math.sin(i*.36)]);
      strand(tail,blueMat,points,.040);
      return {cell,tail};
    }
    function egg(parent,position,radius,{coat=true,cells=false,cortex=false}={}) {
      const body=group(parent); body.position.copy(vector(position));
      ball(body,material(pink,.78),[0,0,0],radius*.86);
      if(coat) ball(body,envelope,[0,0,0],radius);
      if(cells) for(let i=0;i<22;i++) {
        const a=i*2.39996, y=1-2*(i+.5)/22, width=Math.sqrt(1-y*y);
        const point=[Math.cos(a)*width*radius*1.07,y*radius*1.07,Math.sin(a)*width*radius*1.07];
        ball(body,nucleus,point,.10);
      }
      if(cortex) for(let i=0;i<28;i++) {
        const a=i*2*Math.PI/28;
        ball(body,goldMat,[.83*radius*Math.cos(a),.83*radius*Math.sin(a),.13],.052);
      }
      return body;
    }
    function chromatid(parent,finish,side) {
      return strand(parent,finish,[[side*.23,-.57,0],[side*.17,-.27,.02],[0,0,0],[side*.17,.27,.02],[side*.25,.57,0]],.082);
    }
    function chromosome(parent,finish,point,duplicated) {
      const object=group(parent);
      object.position.copy(vector(point));
      chromatid(object,finish,-1);
      if(duplicated) chromatid(object,finish,1);
      return object;
    }
    function spindle(parent,x,separation,y=0) {
      for(const side of [-1,1]) {
        ball(parent,goldMat,[x+side*separation,y,.02],.10);
        for(const offset of [-.18,0,.18]) {
          strand(parent,goldMat,[[x+side*separation,y,.02],[x+side*separation*.55,y+offset,.05],[x,y+offset,.04]],.018);
        }
      }
    }

    for(const {id} of chapters) {
      const root=group(scene);
      groups[id]=root; fog[id]=.002; depth[id]=1;
      poses[id]={group:id,target:new V3(),pos:new V3(0,1,14),w:id==='gametes' ? 6.2 : 4.7};
      const label=(parent,text,color,x,y,z=.54)=>addLabel(text,color,parent,new V3(x,y,z),[id]);
      const stages=examples[id].map(()=>{
        const object=group(root);object.visible=false;
        return {object,draw:()=>{}};
      });
      if(id==='gametes') {
        const frame=stages[0].object;
        const model=sperm(frame,[-1.95,.4,0],.85);
        const oocyte=egg(frame,[2.5,0,0],1.70,{cells:true});
        ball(oocyte,goldMat,[.91,1.24,.29],.13);
        label(frame,'Acrosomal cap','atp',-1.75,.98);
        label(frame,'Midpiece','dendrite',-2.50,-.17);
        label(frame,'Flagellum','electron',-4.1,.02);
        label(frame,'Zona pellucida','atp',2.45,2.09);
        label(frame,'First polar body','atp',3.62,1.27,.48);
        label(frame,'Oocyte cytoplasm','rbc',2.43,-1.98);
        stages[0].draw=time=>{model.tail.rotation.z=reduceMotion ? 0 : .14*Math.sin(time*6);};
      } else if(id==='human-meiosis') {
        stages.forEach(({object},index)=>{
          if(index<=2) {
            ball(object,membrane,[0,0,0],2.13).scale.z=1.55;
            const maternal=chromosome(object,pinkMat,[-.42,0,.45],true);
            const paternal=chromosome(object,blueMat,[.42,0,.45],true);
            if(index===0) {
              maternal.rotation.z=-.18; paternal.rotation.z=.18;
              label(object,'Paired homologs','electron',0,2.52);
            } else {
              spindle(object,0,1.72);
              label(object,index===1 ? 'Spindle aligns the pair' : 'Homologs move apart','atp',0,2.52);
              if(index===2) stages[index].draw=(_,phase)=>{
                maternal.position.x=-.49-.96*phase;
                paternal.position.x=.49+.96*phase;
              };
            }
          } else if(index<=4) {
            for(const side of [-1,1]) {
              const x=side*1.44, finish=side<0 ? pinkMat : blueMat;
              ball(object,membrane,[x,0,0],1.24);
              if(index===3) chromosome(object,finish,[x,0,.36],true);
              else {
                spindle(object,x,.99);
                const left=chromosome(object,finish,[x-.24,0,.37],false);
                const right=chromosome(object,finish,[x+.24,0,.37],false);
                right.rotation.y=Math.PI;
                const previous=stages[index].draw;
                stages[index].draw=(time,phase)=>{
                  previous(time,phase);
                  left.position.x=x-.19-.48*phase;
                  right.position.x=x+.19+.48*phase;
                };
              }
            }
            label(object,index===3 ? 'Two cells · duplicated chromosomes' : 'Sister chromatids separate','electron',0,1.82);
          } else {
            for(const x of [-.89,.89]) for(const y of [-.89,.89]) {
              ball(object,membrane,[x,y,0],.79);
              const single=chromosome(object,x<0 ? pinkMat : blueMat,[x,y,.39],false);
              single.scale.setScalar(.72);
            }
            label(object,'Four spermatids · single chromatids','electron',0,2.07);
          }
        });
      } else if(id==='fertilization') {
        stages.forEach(({object},index)=>{
          const body=egg(object,[.63,0,0],1.68,{cells:index===0,cortex:index===2});
          ball(body,goldMat,[1.02,1.13,.25],.12);
          if(index<2) {
            const model=sperm(object,[-2.79,.18,.26],.48);
            stages[index].draw=(time,phase)=>{
              model.cell.position.x=index===0 ? -2.85+.95*phase : -1.34+.31*phase;
              model.tail.rotation.z=reduceMotion ? 0 : .14*Math.sin(time*6);
            };
          } else if(index===2) {
            const wave=ball(body,material(0xffd887,.16),[0,0,0],.5);
            stages[index].draw=(_,phase)=>{wave.scale.setScalar(.38+phase*.93);};
          } else {
            ball(body,blueMat,[-.43,.02,.70],.39);
            ball(body,pinkMat,[.43,.02,.70],.39);
            label(object,'Paternal pronucleus','dendrite',-.67,.61,1.44);
            label(object,'Maternal pronucleus','rbc',1.63,-.57,1.44);
          }
          label(object,['Sperm approaches','Fusion at the oocyte membrane','Calcium signal spreads','Two pronuclei'][index],
            index===2 ? 'atp' : 'electron',.55,2.12);
        });
      } else {
        const patterns=[
          [[0,0,0]],
          [[-1,0,0],[1,0,0]],
          [[-1,-1,0],[-1,1,0],[1,-1,0],[1,1,0]],
          Array.from({length:8},(_,i)=>[i&4 ? 1 : -1,i&2 ? 1 : -1,i&1 ? 1 : -1]),
        ];
        stages.forEach(({object},index)=>{
          ball(object,envelope,[0,0,0],1.86);
          if(index<=3) {
            const targets=patterns[index], parents=patterns[Math.max(0,index-1)];
            const spread=[0,.75,.57,.48][index], previousSpread=[0,0,.75,.57][index];
            const radius=[1.52,.98,.75,.61][index], lastRadius=[1.52,1.52,.98,.75][index];
            const blastomeres=targets.map(()=>{
              const compartment=group(object);
              ball(compartment,material(pink,.82),[0,0,0],1);
              if(index>0) ball(compartment,nucleus,[.12,.08,.32],.24);
              return compartment;
            });
            if(index===0) {
              spindle(object,0,1.07);
              const pair=chromosome(object,nucleus,[0,0,.30],true);
              pair.scale.setScalar(.64);
            }
            stages[index].draw=(_,phase)=>{
              const fraction=index ? phase*phase*(3-2*phase) : 1;
              blastomeres.forEach((cell,i)=>{
                const from=parents[Math.floor(i/2)], to=targets[i];
                cell.position.set(...to.map((v,axis)=>from[axis]*previousSpread*(1-fraction)+v*spread*fraction));
                cell.scale.setScalar(lastRadius+(radius-lastRadius)*fraction);
              });
            };
          } else if(index===4) {
            for(let i=0;i<16;i++) {
              const a=i*2.39996,y=1-2*(i+.5)/16,r=Math.sqrt(1-y*y);
              ball(object,pinkMat,[Math.cos(a)*r*1.03,y*1.03,Math.sin(a)*r*1.03],.52);
            }
          } else {
            ball(object,material(0x87cbf2,.42),[.27,.02,0],1.23);
            for(let i=0;i<34;i++) {
              const a=i*2.39996,y=1-2*(i+.5)/34,r=Math.sqrt(1-y*y);
              const z=Math.sin(a)*r;
              if(z>.46 && i%3!==0) continue;
              ball(object,pinkMat,[Math.cos(a)*r*1.43,y*1.43,z*1.43],.29);
            }
            for(let i=0;i<8;i++) {
              ball(object,nucleus,[-1.01+(i%3)*.24,-.32+Math.floor(i/3)*.25,.48+(i%2)*.20],.21);
            }
            label(object,'Inner cell mass','rbc',-2.20,-.42,1.1);
            label(object,'Fluid cavity','electron',.82,-.97,1.24);
            label(object,'Trophoblast','rbc',2.03,.85,.86);
          }
          label(object,examples[id][index][0],'atp',0,2.25);
        });
      }

      let elapsed=0,stageTime=0,index=0,previousPlay=false;
      function draw(dt) {
        const selector=$('#reproStage'), play=$('#reproPlay');
        const automatic=Boolean(play?.checked);
        const selected=selector ? Number(selector.value) : 0;
        if(selected!==index) {index=selected;stageTime=0;}
        if(automatic && !previousPlay) stageTime=0;
        previousPlay=automatic;
        elapsed+=dt;
        stageTime+=dt;
        if(automatic && stageTime>=4) {
          if(index+1<stages.length) {
            index++;stageTime=0;selector.value=String(index);
          } else {
            index=0;stageTime=0;selector.value='0';          // loop back to the first stage
          }
        }
        const phase=reduceMotion || !automatic ? 1 : Math.min(1,.12+stageTime/2.15);
        stages.forEach(({object},i)=>{object.visible=i===index; object.rotation.y=reduceMotion ? 0 : .22*Math.sin(elapsed*.35);});
        stages[index].draw(elapsed,phase);
      }
      behaviors[id]={
        enter(){
          elapsed=0;stageTime=0;index=0;previousPlay=false;
          const controls=$('#reproControls');
          if(controls) controls.hidden=false;
          draw(0);
        },
        tick(_,dt){draw(dt);},
      };
    }
    return {groups,poses,fog,depth,behaviors};
  }
  CellCity.register('reproduction',{chapters,build});
})();
