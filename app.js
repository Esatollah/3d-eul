'use strict';
const $=id=>document.getElementById(id);
const icons={book:'M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1z M12 5v15',cube:'m12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10 M7 4.6l9 5',cards:'M6 6h14v14H6z M3 16V3h13 M9 11h8 M9 15h5',list:'M8 6h13 M8 12h13 M8 18h13 M3 6h1 M3 12h1 M3 18h1',home:'M4 10a8 8 0 1 1 1.4 7 M4 3v7h7',layers:'m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5',check:'m4 12 5 5L20 6'};
document.querySelectorAll('[data-icon]').forEach(el=>{el.outerHTML='<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="'+icons[el.dataset.icon]+'"/></svg>';});
const pdf='./Handbuch%20PT%20EUL%202025.pdf';
const modelTypes={bone:'Knochen',muscle:'Muskel',nerve:'Nerv',vein:'Vene',artery:'Arterie',fascia:'Topographie',organ:'Organ',cartilage:'Knorpel',lymph:'Lymphbahn'};
const tabNames=['Halsoberfläche','Karotisdreieck','Seitliches Halsdreieck','Unter dem Kopfwender','Muskeldreieck','Unterkieferregion'];
const figures=[
  [[0,51,1],[2,51,3]],[[5,55,6],[7,56,8]],[[9,59,10],[11,61,12],[13,61]],
  [[17,65],[18,67],[19,67]],[[20,69]],[[22,72]]
];
let figureIndex=0;
const pad=n=>String(n).padStart(2,'0');
let region=0,index=0,revealed=false,deep=false,markers=[];
let prefs={};
try{prefs=JSON.parse(localStorage.getItem('halsatlas-v1')||'{}')||{};}catch{}
const valid=(n,l)=>Number.isInteger(n)&&n>=0&&n<l;
if(valid(prefs.region,regionen.length))region=prefs.region;
if(valid(prefs.index,regionen[region].items.length))index=prefs.index;
const learned=new Set(Array.isArray(prefs.learned)?prefs.learned:[]);
$('quiz').checked=prefs.quiz===true;
const id=(r,i)=>r+'|'+regionen[r].items[i].name;
const total=regionen.reduce((sum,r)=>sum+r.items.length,0);
function save(){try{localStorage.setItem('halsatlas-v1',JSON.stringify({region,index,learned:[...learned],quiz:$('quiz').checked}));}catch{$('progressText').textContent='Lernstand für diese Sitzung';}}
function stats(){
  const count=regionen.reduce((sum,r,ri)=>sum+r.items.filter((_,i)=>learned.has(id(ri,i))).length,0);
  $('percent').textContent=Math.round(100*count/total)+' %';$('progress').value=count;$('progress').max=total;
  $('progressText').textContent=count+' von '+total+' Lernpunkten gelernt';
}
function selectRegion(r,i=0){
  const switchArea=r!==region;region=r;index=i;revealed=false;
  if(switchArea){defaultDepth();$('direction').value='';}
  render();save();
}
function defaultDepth(){deep=[1,3,4,5].includes(region);viewer.layer(deep);}
function step(delta){
  let r=region,i=index+delta;
  if(i<0&&r>0){r--;i=regionen[r].items.length-1;}
  else if(i>=regionen[r].items.length&&r<regionen.length-1){r++;i=0;}
  if(valid(i,regionen[r].items.length))selectRegion(r,i);
}
function paintPins(project,w,h){
  const occupied=[];
  // Numbered callouts fan out to either side. The line origin stays on the anatomical landmark.
  const order=[...markers].sort((a,b)=>Number(b.i===index)-Number(a.i===index));
  for(const {i,el,line} of order){
    const item=regionen[region].items[i],point=anatomy.anchors[item.anchor];
    const [x,y]=project(point);
    const outside=($('focus').getAttribute('aria-pressed')==='true'&&i!==index)||x<2||y<2||x>w-2||y>h-2;
    el.hidden=line.hidden=outside;if(outside)continue;
    const left=(i%2===0),sign=left?-1:1;
    const tx=Math.min(w-24,Math.max(24,x+sign*(45+(i%3)*12)));
    let ty=Math.min(h-43,Math.max(46,y+(i%3-1)*22));
    for(let d=0;d<10;d++){
      if(!occupied.some(p=>Math.hypot(tx-p[0],ty-p[1])<34))break;
      ty=ty+35<h-40?ty+35:Math.max(42,ty-70);
    }
    occupied.push([tx,ty]);el.style.left=tx+'px';el.style.top=ty+'px';
    line.style.left=x+'px';line.style.top=y+'px';line.style.width=Math.hypot(tx-x,ty-y)+'px';line.style.transform='rotate('+Math.atan2(ty-y,tx-x)+'rad)';
  }
}
const viewer=createViewer($('model'),paintPins);
function makePins(){
  $('pins').replaceChildren();$('leaders').replaceChildren();markers=[];
  const start=Math.floor(index/5)*5,items=regionen[region].items;
  for(let i=start;i<Math.min(items.length,start+5);i++){
    const el=document.createElement('button'),line=document.createElement('div');
    el.className='pin'+(i===index?' active':'');el.textContent=pad(i+1);
    const label='Lernpunkt '+(i+1)+($('quiz').checked?'':' · '+items[i].name);
    el.title=label;el.setAttribute('aria-label',label);el.setAttribute('aria-pressed',String(i===index));el.onclick=()=>selectRegion(region,i);
    line.className='leader'+(i===index?' active':'');$('pins').append(el);$('leaders').append(line);markers.push({i,el,line});
  }
}
regionen.forEach((r,i)=>{
  const btn=document.createElement('button');btn.title=r.name+' · S. '+r.start+'–'+r.end;
  const sm=document.createElement('small');sm.textContent='REGION '+pad(i+1);
  btn.append(sm,document.createTextNode(tabNames[i]));btn.onclick=()=>selectRegion(i);$('regions').append(btn);
});
function render(){
  const r=regionen[region],item=r.items[index],test=$('quiz').checked&&!revealed,done=learned.has(id(region,index));
  [...$('regions').children].forEach((b,i)=>{b.classList.toggle('active',i===region);b.setAttribute('aria-pressed',String(i===region));});
  const closest=figures[region].reduce((best,fig)=>Math.abs(fig[1]-item.page)<Math.abs(best[1]-item.page)?fig:best,figures[region][0]);
  figureIndex=figures[region].indexOf(closest);
  $('atlasFigure').querySelector('img').src='abbildungen/'+closest[0]+'.jpg';
  $('atlasFigure').querySelector('strong').textContent=tabNames[region]+' · S. '+closest[1];
  $('atlasFigure').hidden=test;
  $('figRegion').textContent=tabNames[region].toLocaleUpperCase('de');
  $('count').textContent='LERNPUNKT '+pad(index+1)+' / '+pad(r.items.length);
  $('title').textContent=test?'Welche Struktur ist markiert?':item.name;
  $('type').textContent=test?'':modelTypes[anatomy.tissue[item.anchor]]||'Landmarke';
  $('question').textContent=item.q;$('note').textContent=item.note;$('note').hidden=test;
  $('source').href=pdf+'#page='+item.page;$('source').querySelector('span').textContent='Handbuch · S. '+item.page;$('source').hidden=test;
  $('reveal').hidden=!test;$('reveal').style.display='block';
  $('learned').querySelector('span').textContent=done?'Gelernt':'Als gelernt markieren';$('learned').setAttribute('aria-pressed',String(done));
  $('prev').disabled=region===0&&index===0;$('next').disabled=region===regionen.length-1&&index===r.items.length-1;
  $('depth').setAttribute('aria-pressed',String(deep));makePins();viewer.set(region,item.anchor);stats();
}
$('depth').onclick=()=>{deep=!deep;viewer.layer(deep);$('depth').setAttribute('aria-pressed',String(deep));};
$('direction').onchange=e=>{if(e.target.value==='')viewer.reset();else viewer.orient(+e.target.value);};
$('home').onclick=()=>{$('direction').value='';viewer.reset();};$('zoomIn').onclick=()=>viewer.magnify(1.22);$('zoomOut').onclick=()=>viewer.magnify(1/1.22);
$('learned').onclick=()=>{const k=id(region,index);learned.has(k)?learned.delete(k):learned.add(k);render();save();};
$('next').onclick=()=>step(1);$('prev').onclick=()=>step(-1);
$('quiz').onchange=()=>{revealed=false;render();save();};$('reveal').onclick=()=>{revealed=true;render();};
function showDialog(title){$('dialog').classList.remove('figureDialog');$('dialogTitle').textContent=title;$('dialogBody').replaceChildren();$('dialog').showModal();}
$('list').onclick=()=>{
  showDialog(regionen[region].name);
  regionen[region].items.forEach((item,i)=>{
    const b=document.createElement('button');b.className='row'+(i===index?' active':'');
    const num=document.createElement('small');num.textContent=pad(i+1);
    b.append(num,document.createTextNode(item.name+(learned.has(id(region,i))?' ✓':'')));
    b.onclick=()=>{$('dialog').close();selectRegion(region,i);};$('dialogBody').append(b);
  });
};
$('sources').onclick=()=>{
  showDialog('Quellen und Modell');
  $('dialogBody').innerHTML='<h3>PT EuL Handbuch 2025/26</h3><p>Die sechs Lernregionen folgen den Seiten 49–73. Die halsbezogenen Punkte der Testatcheckliste und ihre Muskelsteckbriefe ergänzen die Karten. Der Seitenlink auf jeder Karte führt zur jeweiligen Grundlage.</p><p><a target="_blank" rel="noopener" href="'+pdf+'#page=49">Halskapitel öffnen ↗</a> · <a target="_blank" rel="noopener" href="'+pdf+'#page=108">Testatcheckliste ↗</a></p><h3>Darstellung am Modell</h3><p>Schädel, Unterkiefer, C1–C7, T1 und die oberen beiden Rippenpaare stammen aus OpenSim Gait2392. Die übrige Geometrie ist ein eigens erstelltes, vereinfachtes Lehrmodell. Die Punkte markieren Strukturen, Abschnitte oder topographische Räume in Projektion, auch wenn Gewebe davorliegt. Die tiefe Schicht blendet oberflächliche Strukturen auf der präparierten Seite aus.</p><p>OpenSim Gait2392 von Ajay Seth, Darryl Thelen, Frank C. Anderson und Scott L. Delp. Oberflächen für die Ansicht ausgewählt, trianguliert, skaliert und eingefärbt. <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0 ↗</a> · <a href="modelle.md" target="_blank" rel="noopener">Modellnachweise und Vergleich</a></p>';
};
$('close').onclick=()=>$('dialog').close();$('dialog').onclick=e=>{if(e.target===$('dialog'))$('dialog').close();};
defaultDepth();render();viewer.reset();

$('focus').onclick=()=>{const on=$('focus').getAttribute('aria-pressed')!=='true';$('focus').setAttribute('aria-pressed',String(on));viewer.focus(on);};
function figureContent(){
  const entries=figures[region],[n,page,caption]=entries[figureIndex],body=$('dialogBody');
  body.replaceChildren();const image=document.createElement('img');image.className='sourcePicture';image.src='abbildungen/'+n+'.jpg';image.alt=regionen[region].name+', Abbildung aus dem Handbuch, Seite '+page;body.append(image);
  if(caption){const legend=document.createElement('img');legend.className='sourceCaption';legend.src='abbildungen/'+caption+'.png';legend.alt='Originallegende zur Abbildung';body.append(legend);}
  const nav=document.createElement('div');nav.className='figureNav';
  const prev=document.createElement('button'),next=document.createElement('button'),ref=document.createElement('a');
  prev.textContent='← Zurück';next.textContent='Weiter →';ref.textContent='Handbuch · S. '+page+' ↗';ref.href=pdf+'#page='+page;ref.target='_blank';ref.rel='noopener';
  prev.disabled=figureIndex===0;next.disabled=figureIndex===entries.length-1;
  prev.onclick=()=>{figureIndex--;figureContent();};next.onclick=()=>{figureIndex++;figureContent();};
  if(entries.length>1)nav.append(prev);nav.append(ref);if(entries.length>1)nav.append(next);body.append(nav);
}
$('atlasFigure').onclick=()=>{showDialog(regionen[region].name);$('dialog').classList.add('figureDialog');figureContent();};
