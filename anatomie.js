/* Didaktisches Schnittmodell. x = rechts, y = kranial, z = ventral.
   Alle Positionsangaben verwenden denselben lokalen Modellraum. */
const anatomy = (() => {
  const parts = [], anchors = {}, tissue = {}, references = {};
  const colors = {bone:[.89,.82,.67],muscle:[.76,.33,.30],nerve:[.99,.80,.35],artery:[.82,.21,.20],vein:[.28,.49,.66],organ:[.78,.48,.36],cartilage:[.68,.76,.72],fascia:[.72,.78,.77],lymph:[.41,.66,.51]};
  const add=(a,b)=>a.map((v,i)=>v+b[i]), sub=(a,b)=>a.map((v,i)=>v-b[i]), mul=(a,s)=>a.map(v=>v*s);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const unit=a=>mul(a,1/(Math.hypot(...a)||1));
  let side=1;
  // A smooth elliptical sweep follows each centreline. Muscle fibres share the sweep coordinates.
  function sweep(key,type,path,width,depth=width,opts={}) {
    const p=path.map(([x,y,z])=>[x*side,y,z]);
    const at=t=>{
      const u=Math.max(0,Math.min(.999999,t))*(p.length-1),i=Math.floor(u),s=u-i;
      const a=p[Math.max(0,i-1)],b=p[i],c=p[i+1],d=p[Math.min(p.length-1,i+2)];
      return b.map((v,k)=>.5*(2*v+(-a[k]+c[k])*s+(2*a[k]-5*v+4*c[k]-d[k])*s*s+(-a[k]+3*v-3*c[k]+d[k])*s*s*s));
    };
    const v=[],f=[],rgb=[],n=type==='muscle'?48:16,steps=Math.max(14,p.length*5);
    const color=colors[type];
    for(let i=0;i<=steps;i++){
      const t=i/steps,pt=at(t),tan=unit(sub(at(t+.001),at(t-.001)));
      let a=unit(cross(opts.axis||[0,0,1],tan));
      if(Math.hypot(...a)<.5) a=[1,0,0];
      const b=unit(cross(tan,a));
      const belly=type==='muscle'?(.19+.81*Math.sin(Math.PI*t)**.62):1;
      for(let j=0;j<n;j++){
        const angle=j/n*2*Math.PI;
        const w=(typeof width==='function'?width(t):width)*belly;
        const h=(typeof depth==='function'?depth(t):depth)*belly;
        v.push(...add(pt,add(mul(a,w*Math.cos(angle)),mul(b,h*Math.sin(angle)))));
        const stripe=type==='muscle' ? .92+.09*Math.cos(angle*17+1.8*Math.sin(4*t)) : 1;
        const tendon=type==='muscle'?Math.pow(Math.abs(2*t-1),5)*.74:0;
        rgb.push(...color.map((ch,k)=>(ch*(1-tendon)+colors.bone[k]*tendon)*stripe));
        if(i>0){const a0=(i-1)*n+j,b0=(i-1)*n+(j+1)%n; f.push(a0,b0,a0+n,b0,b0+n,a0+n);}
      }
    }
    for(let j=1;j<n-1;j++)f.push(0,j+1,j,steps*n,steps*n+j,steps*n+j+1);
    parts.push({key,type,v,f,rgb,side,...opts});
    if(side===1){anchors[key]=at(opts.pin??.5);tissue[key]=type;}
  }
  function bulb(key,type,c,r,opts={}){
    const path=[[c[0],c[1]-r[1],c[2]],[c[0],c[1]+r[1],c[2]]];
    sweep(key,type,path,t=>r[0]*Math.sqrt(Math.max(.0001,1-(2*t-1)**2)),t=>r[2]*Math.sqrt(Math.max(.0001,1-(2*t-1)**2)),opts);
  }
  const m=(key,p,w,d,opts)=>sweep(key,'muscle',p,w,d,opts);
  const vessel=(key,p,w)=>sweep(key,'artery',p,w);
  const vein=(key,p,w)=>sweep(key,'vein',p,w);
  const nerve=(key,p,w=.038)=>sweep(key,'nerve',p,w);
  // Hyoid, cervical vertebrae and upper thoracic aperture.
  for(let i=0;i<7;i++){
    const y=1.64-i*.48,z=-.39+.14*Math.sin(i*.52);
    bulb('vertebra','bone',[0,y,z],[.46+i*.025,.215,.38]);
    sweep('vertebra','bone',[[-.36,y,z],[ -.57,y,-.71],[0,y-.09,-1.17],[.57,y,-.71],[.36,y,z]],.12);
    sweep('vertebra','bone',[[0,y,-.92],[0,y-.12,-1.43]],.13);
    for(side of [1,-1])sweep('vertebra','bone',[[.34,y,z],[.66,y,-.38],[.88,y+.04,-.52]],.105);
    side=1;
  }
  anchors.vertebra=[.38,-.7,-.35];
  sweep('trachea','organ',[[0,-2.56,.49],[0,-1.3,.59],[0,.18,.74]],.37,.32);
  for(let i=0;i<12;i++){
    const y=-2.43+i*.218,z=.5+i*.02;
    const arc=Array.from({length:11},(_,k)=>{let a=-2.58+k*.516;return [.367*Math.sin(a),y,z+.32*Math.cos(a)]});
    sweep('trachea','cartilage',arc,.052);
  }
  bulb('esophagus','organ',[0,-.77,.11],[.31,1.86,.18]);
  bulb('larynx','cartilage',[0,.49,.73],[.55,.44,.38]);
  sweep('hyoid','bone',[[-.68,.98,.43],[-.5,.93,1.03],[0,.91,1.22],[.5,.93,1.03],[.68,.98,.43]],.09);
  bulb('sternum','bone',[0,-2.73,.85],[.67,.55,.2]);
  for(side of [-1,1]){
    sweep('mandible','bone',[[1.46,2.95,-.16],[1.46,2.36,.01],[1.34,1.76,.24],[1.12,1.63,.96],[.66,1.52,1.58],[.01,1.49,1.85]],t=>.14+.23*Math.sin(Math.PI*t)**.6,t=>.14+.035*Math.sin(Math.PI*t),{axis:[1,0,0]});
    sweep('mandible','bone',[[1.35,1.9,.37],[1.36,2.25,.36],[1.28,2.72,.4]],t=>.19*(1-t)+.015,.13,{axis:[1,0,0]});
    bulb('condyle','bone',[1.46,2.93,-.16],[.22,.13,.15]);
    for(let i=0;i<8;i++){
      const a=(i+.46)/8*1.59;
      bulb('teeth','bone',[1.22*Math.sin(a),1.81+.27*(1-Math.cos(a)),.31+1.48*Math.cos(a)],[.121,.144,.133]);
    }
    sweep('clavicle','bone',[[.24,-2.27,1.02],[.87,-2.22,1.12],[1.77,-2.14,.92],[2.64,-2.18,.54],[3.36,-2.09,.54]],t=>.11+.073*(Math.cos(2*Math.PI*t)+1)/2,.16);
    sweep('firstRib','bone',[[.4,-2,-.54],[1.11,-2.11,-.76],[1.8,-2.3,-.3],[1.65,-2.48,.48],[.58,-2.68,.84]],.115,.16);
    // Superior scapular border, acromion and upper slips of serratus anterior.
    sweep('scapula','bone',[[1.89,-2.3,-1.10],[2.26,-2.01,-.93],[2.58,-1.93,-.58],[2.74,-2.03,-.41],[3.06,-2.16,-.21]],.11,.12);
    sweep('acromion','bone',[[2.04,-2.65,-1.03],[2.66,-2.46,-.7],[3.11,-2.16,-.14],[3.37,-2.1,.37]],.15,.11);
    for(let j=0;j<2;j++)m('serratus',[[1.62+.38*j,-2.48-.46*j,-.18],[1.84+.30*j,-2.66-.4*j,-.55],[1.93,-2.56-.33*j,-.94]],.12,.073);
    m('trapezius',[[.46,2.22,-.96],[.84,1.11,-1.01],[1.34,-.55,-.94],[2.12,-1.43,-.62],[3.35,-2.13,.12]],.71,.26);
    m('splenius',[[1.31,2.27,-.46],[.91,.86,-.76],[.53,-.56,-1.04],[.16,-1.85,-1.13]],.37,.2);
    m('levatorScapulae',[[.78,1.24,-.56],[1.05,.1,-.6],[1.55,-1.09,-.72],[2.04,-2.18,-.96]],.31,.17);
    m('longusColli',[[.35,1.62,-.08],[.47,.17,-.03],[.35,-1.02,.04],[.31,-2.34,-.02]],.2,.12);
    m('anteriorScalene',[[.73,.55,-.17],[.88,-.28,-.02],[1.09,-1.25,.24],[1.31,-2.17,.39]],.20,.13);
    m('middleScalene',[[.81,1.24,-.42],[1.02,.04,-.39],[1.4,-1.32,-.18],[1.57,-2.23,-.03]],.28,.16);
    m('posteriorScalene',[[.82,.15,-.55],[1.32,-1,-.53],[1.8,-2.42,-.36]],.18,.12);
    m('subclavius',[[.7,-2.57,.82],[1.25,-2.37,.8],[2.24,-2.18,.61]],.11,.1);
    bulb('thyroid','organ',[.39,-.41,.76],[.27,.58,.26]);
    m('sternothyroid',[[.35,-2.38,.97],[.43,-1.11,.99],[.41,.31,.96]],.18,.075);
    m('sternohyoid',[[.24,-2.3,1.13],[.2,-.83,1.16],[.19,.89,1.21]],.17,.078);
    m('omohyoidSuperior',[[.38,.9,1.16],[.57,.17,1.12],[.89,-.83,.88],[1.21,-1.47,.55]],.13,.09);
    m('omohyoidInferior',[[1.21,-1.47,.55],[1.81,-1.58,.18],[2.53,-1.77,-.43]],.115,.07);
    m('mylohyoid',[[1.13,1.82,.78],[.67,1.43,1.02],[.1,1.07,1.15]],.39,.09);
    m('digastricPosterior',[[1.39,2.42,-.12],[1.1,1.86,.28],[.62,1.1,.92]],.15,.11);
    m('digastricAnterior',[[.62,1.1,.92],[.45,1.24,1.38],[.16,1.56,1.63]],.13,.09);
    m('stylohyoid',[[1.21,2.58,-.01],[.94,1.89,.31],[.59,1.09,.84]],.093,.07);
    bulb('submandibular','organ',[.95,1.45,.96],[.36,.23,.32]);
    const common=[[.61,-2.37,.54],[.7,-1.24,.56],[.76,-.03,.56],[.82,.72,.59]];
    vessel('commonCarotid',common,.134);
    vessel('internalCarotid',[[.82,.72,.59],[.88,1.07,.42],[.85,1.71,.13],[.83,2.59,.02]],.121);
    vessel('externalCarotid',[[.82,.72,.59],[.85,1.18,.69],[1.03,1.7,.54],[1.29,2.33,.23]],.109);
    vessel('superiorThyroid',[[.83,.89,.66],[.65,.79,.85],[.47,.27,.88],[.48,-.05,.88]],.052);
    vessel('lingualArtery',[[.88,1.23,.69],[.72,1.2,.93],[.48,1.35,1.18],[.3,1.52,1.38]],.055);
    vessel('facialArtery',[[.95,1.46,.63],[1.03,1.44,1],[1.12,1.58,1.16],[1.18,1.95,1.19]],.059);
    vessel('occipitalArtery',[[.97,1.55,.55],[1.17,1.78,.11],[1.32,2.16,-.45]],.052);
    vessel('ascendingPharyngeal',[[.87,1.15,.6],[.68,1.81,.31],[.63,2.39,.22]],.04);
    vein('internalJugular',[[.85,-2.31,.56],[1.03,-1.22,.51],[1.05,.1,.47],[1.06,1.28,.32],[1,2.54,.14]],.16);
    vein('subclavianVein',[[.85,-2.31,.56],[1.39,-2.07,.71],[2.04,-1.98,.65],[2.79,-2.05,.45]],.14);
    vessel('subclavianArtery',[[.44,-2.55,.33],[.85,-1.98,.23],[1.4,-1.85,.05],[2.02,-1.94,.18],[2.74,-2.11,.33]],.128);
    vessel('vertebralArtery',[[.91,-1.95,.18],[.66,-1.52,-.19],[.65,-.63,-.30],[.67,.48,-.36],[.64,1.63,-.43]],.072);
    vessel('thyrocervical',[[.98,-1.93,.22],[1.02,-1.63,.29],[.84,-1.42,.39],[.52,-1.37,.55],[.43,-.74,.63]],.067);
    vessel('suprascapular',[[1.02,-1.63,.29],[1.61,-1.73,.42],[2.63,-1.86,.05]],.052);
    vessel('dorsalScapular',[[1.45,-1.85,.03],[1.82,-1.61,-.22],[2.18,-1.77,-.7]],.054);
    nerve('vagus',[[.96,2.42,.16],[.96,1.12,.28],[.89,-.15,.37],[.84,-1.35,.39],[.7,-2.48,.28]],.049);
    nerve('sympathetic',[[.61,2.42,-.02],[.57,1.53,-.07],[.58,.25,-.08],[.62,-1.1,-.1],[.64,-2.13,-.14]]);
    for(let y of [1.77,-.85,-1.99])bulb('ganglion','nerve',[.6,y,-.08],[.085,.17,.065]);
    nerve('deepAnsa',[[.99,1.46,.54],[.94,.75,.65],[.97,-.3,.66],[.95,-.69,.68],[.78,-.75,.72],[.74,-.23,.72],[.75,.44,.69]],.032);
    nerve('hypoglossal',[[1.05,2.2,.19],[1.05,1.58,.42],[.98,1.29,.76],[.7,1.32,1.09],[.44,1.47,1.28]]);
    nerve('superiorLaryngeal',[[.94,1.75,.29],[.73,1.2,.4],[.62,.85,.71],[.5,.72,.92]]);
    nerve('glossopharyngeal',[[.91,2.38,.12],[.85,1.98,.37],[.81,1.76,.63],[.69,1.59,.98]]);
    nerve('phrenic',[[.87,.14,.02],[.95,-.56,.19],[1.07,-1.31,.37],[1.11,-1.91,.47],[.94,-2.46,.49]]);
    nerve('accessory',[[1.03,2.36,.11],[1.22,1.43,.26],[1.34,.42,.16],[1.53,.08,-.06],[1.87,-.55,-.35],[2.02,-1.12,-.5]]);
    for(let i=0;i<5;i++)nerve('brachialPlexus',[[.76,.12-i*.33,-.32],[1.06,-.34-i*.24,-.18],[1.38,-1.08-i*.13,-.05],[1.92,-1.55-i*.085,.02],[2.77,-1.97-i*.058,.1]],.057);
    nerve('longThoracic',[[.84,-.2,-.32],[1.44,-1.06,-.29],[2.1,-1.98,-.24],[2.32,-2.47,-.14]]);
    nerve('recurrent',side===-1?[[.47,-2.68,.20],[.46,-1.91,.2],[.38,-.91,.32],[.38,.28,.47]]:[[.93,-2.14,.24],[.78,-2.28,.09],[.47,-1.91,.2],[.38,-.91,.32],[.38,.28,.47]]);
    m('scm',[[1.39,2.49,-.11],[1.36,1.4,.22],[1.18,.21,.63],[.88,-.98,.89],[.37,-2.27,1.12]],.325,.14);
    m('scm',[[1.38,2.44,-.12],[1.38,1.28,.16],[1.28,.03,.52],[1.17,-1.14,.81],[1.13,-2.15,1.02]],.19,.12);
    const pn=[1.39,.25,.54];
    nerve('greatAuricular',[pn,[1.38,.72,.58],[1.39,1.38,.42],[1.45,1.99,.17],[1.49,2.44,.02]]);
    nerve('transverseCervical',[pn,[1.25,.22,.79],[.97,.2,1.01],[.74,.35,1.12],[.51,.36,1.16]]);
    nerve('lesserOccipital',[[1.4,.86,.25],[1.42,1.31,.13],[1.45,1.88,-.1],[1.29,2.47,-.43]],.031);
    for(let i=0;i<3;i++)nerve('supraclavicular',[[1.41,-.05,.53],[1.45,-.68,.56],[1.32+.31*i,-1.45,.85-i*.17],[1.05+.76*i,-2.26,1.2-i*.24]],.03);
    nerve('superficialAnsa',[[1.41,1.95,.32],[1.18,1.27,.72],[1.0,.72,.95],[.78,.39,1.1],[.65,.32,1.15]],.032);
    vein('externalJugular',[[1.44,1.87,.33],[1.36,1.04,.60],[1.33,.21,.74],[1.44,-.7,.7],[1.54,-1.53,.67],[1.47,-2.02,.65]],.075);
    vein('anteriorJugular',[[.29,.89,1.26],[.33,.17,1.28],[.35,-1.02,1.28],[.38,-1.92,1.23],[.81,-2.1,1.18]],.047);
    m('platysma',[[1.07,1.66,1.25],[.96,.79,1.18],[1.02,-.28,1.13],[1.31,-1.42,1.16],[1.69,-2.36,1.2]],.7,.036,{overlay:true});
  }
  side=1;
  // Left cervical lymphatic arch at the left venous angle.
  sweep('thoracicDuct','lymph',[[-.38,-2.6,-.02],[-.61,-1.88,.05],[-.84,-1.76,.19],[-.94,-1.96,.43],[-.85,-2.26,.55]],.055);
  const alias=(key,ref,pos,type)=>{if(key!==ref)references[key]=ref;anchors[key]=pos||anchors[ref];tissue[key]=type||tissue[ref];};
  alias('punctum','greatAuricular',[1.39,.25,.54]); alias('carotidBifurcation','commonCarotid',[.82,.72,.59]);
  alias('cervicalPlexus','deepAnsa',[.83,.78,-.27]);alias('ansa','deepAnsa');alias('jugular','internalJugular');
  alias('subclavian','subclavianArtery');alias('superficialFascia','scm',[1.22,-.1,.8],'fascia');
  alias('pretrachealFascia','sternohyoid',[.26,-.62,1.27],'fascia');alias('prevertebralFascia','longusColli',[.42,-.57,.14],'fascia');
  alias('carotidSheath','commonCarotid',[.87,-.19,.57],'fascia');alias('pleura','firstRib',[1.18,-1.95,-.22],'organ');
  sweep('thyroidIma','artery',[[0,-2.32,1.08],[.06,-1.7,1.06],[.03,-1.02,1.04],[0,-.55,1.02]],.044,.044,{overlay:true});
  alias('inferiorThyroid','thyrocervical',[.52,-1.37,.55]);
  anchors.trachea=[0,-1.31,.92];
  const builders={sweep,m,nerve,vein,vessel,bulb,alias,anchors,tissue};
  window.extendLateral?.(builders);
  window.extendAnatomy?.(builders);
  if(window.realMeshes){
    const replace=new Set(['mandible','condyle','teeth','vertebra','firstRib']);
    for(let i=parts.length-1;i>=0;i--) if(replace.has(parts[i].key)) parts.splice(i,1);
    // Align the deep cervical attachment points with the imported vertebral column.
    // The superficial landmarks retain their positions at the jaw and clavicle.
    const register=([x,y,z])=>{
      const distance=((Math.abs(x)-.65)/.66)**2+((z+.31)/.53)**2;
      const taper=Math.max(0,Math.min(1,(y+2.23)/1.19,(2.82-y)/.96));
      const weight=Math.exp(-distance)*taper;
      return [x,y+1.13*weight,z-.49*weight];
    };
    for(const mesh of parts){
      for(let i=0;i<mesh.v.length;i+=3){
        const xyz=register(mesh.v.slice(i,i+3));for(let j=0;j<3;j++)mesh.v[i+j]=xyz[j];
      }
    }
    for(const key of Object.keys(anchors))anchors[key]=register(anchors[key]);
    for(const [key,{v:source,f:originalFaces}] of Object.entries(window.realMeshes)){
      // Swapping the lateral and anterior axes reverses the winding.
      const f=[];
      for(let i=0;i<originalFaces.length;i+=3)f.push(originalFaces[i],originalFaces[i+2],originalFaces[i+1]);
      const v=[],rgb=[];
      for(let i=0;i<source.length;i+=3){
        v.push(27*source[i+2],(source[i+1]<.457?44:27)*(source[i+1]-.457)+1.49,27*(source[i]-.082)+1.85);
        rgb.push(...colors.bone);
      }
      parts.push({key,type:'bone',v,f,rgb,side:0});
      const targets={c6:[.56,.45,-.68],mandible:[1.24,1.8,.8],rib1right:[1.64,-1.97,-.15]};
      if(targets[key]){
        let nearest=Infinity;
        for(let i=0;i<v.length;i+=3){
          const point=v.slice(i,i+3),d=Math.hypot(...sub(point,targets[key]));
          if(d<nearest){nearest=d;anchors[key]=point;}
        }
        tissue[key]='bone';
      }
    }
  }
  return {parts,anchors,tissue,colors,references};
})();
