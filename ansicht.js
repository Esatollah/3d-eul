/* Orthographic mesh viewer. Pins and surfaces use the same camera transform. */
function createViewer(canvas, changed) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true});
  const scene=anatomy.parts;
  const meshes=scene.map(part=>{
    const norms=new Float32Array(part.v.length);
    const p=part.v;
    for(let i=0;i<part.f.length;i+=3){
      const a=part.f[i]*3,b=part.f[i+1]*3,c=part.f[i+2]*3;
      const u=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],v=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]];
      const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      for(const idx of [a,b,c])for(let k=0;k<3;k++)norms[idx+k]+=n[k];
    }
    for(let i=0;i<norms.length;i+=3){const l=Math.hypot(norms[i],norms[i+1],norms[i+2])||1;for(let k=0;k<3;k++)norms[i+k]/=l;}
    return {...part,norms};
  });
  let yaw=.89, pitch=.05, zoom=1, region=0, key='scm', width=1,height=1,scale=1,frame=0,deep=false,focus=false,dx=0,dy=0;
  let program,uniform={},buffers;
  if(gl){
    function shader(type,src){
      const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;
    }
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,`
      attribute vec3 pos,normal,color; uniform vec4 camera; uniform vec2 scale,pan;
      uniform float selected; varying vec3 rgb;
      vec3 turn(vec3 p){float x=-camera.x*p.x+camera.y*p.z;float z=camera.y*p.x+camera.x*p.z;return vec3(x,camera.z*p.y-camera.w*z,camera.w*p.y+camera.z*z);}
      void main(){vec3 loc=turn(pos-vec3(0.,.34,0.));gl_Position=vec4(loc.xy*scale+pan,-loc.z*.076,1.);
        vec3 n=normalize(turn(normal));float lum=.57+.41*max(0.,dot(n,normalize(vec3(-.4,.68,.79))))+.09*max(0.,n.z);
        rgb=mix(color,vec3(.97,.61,.27),selected*.36)*lum+selected*vec3(.042,.024,.012);
      }`));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float; varying vec3 rgb; void main(){gl_FragColor=vec4(rgb,1.);}'));
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    for(const k of ['camera','scale','pan','selected'])uniform[k]=gl.getUniformLocation(program,k);
    function buffer(target,data){let b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);return b;}
    const loc=['pos','normal','color'].map(k=>gl.getAttribLocation(program,k));
    buffers=meshes.map(m=>{
      const data=new Float32Array(m.v.length*3);
      for(let i=0;i<m.v.length;i+=3){data.set(m.v.slice(i,i+3),i*3);data.set(m.norms.subarray(i,i+3),i*3+3);data.set(m.rgb.slice(i,i+3),i*3+6);}
      return {data:buffer(gl.ARRAY_BUFFER,data),index:buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(m.f)),loc};
    });
    gl.enable(gl.DEPTH_TEST);
  }
  function camera(p){
    const x=-Math.cos(yaw)*p[0]+Math.sin(yaw)*p[2],z=Math.sin(yaw)*p[0]+Math.cos(yaw)*p[2],y=p[1]-.34;
    return [width/2+dx+x*scale,height*.5+dy-(Math.cos(pitch)*y-Math.sin(pitch)*z)*scale,Math.sin(pitch)*y+Math.cos(pitch)*z];
  }
  const modelKeys=new Set(meshes.map(m=>m.key));
  function selected(k){return modelKeys.has(k)?k:anatomy.references[k];}
  function visible(m){
    if(focus){
      const target=selected(key);
      if(target&&modelKeys.has(target)){
        if(m.key===target)return m.side!==-1;
        if(m.type!=='bone')return false;
      }
    }
    if(m.overlay)return m.key===key;
    if(m.key===key)return true;
    const uncover=deep;
    return !(uncover && m.side===1 && ['scm','externalJugular','greatAuricular','transverseCervical','superficialAnsa','lesserOccipital','supraclavicular',...(region===4?['sternohyoid','sternothyroid']:[])].includes(m.key));
  }
  // Canvas fallback uses a depth buffer so crossing vessels and deep muscles remain distinguishable.
  const ctx=gl?null:canvas.getContext('2d');
  function software(){
    const w=canvas.width,h=canvas.height,dpr=w/width,depth=new Float32Array(w*h).fill(-Infinity),img=ctx.createImageData(w,h);
    for(const m of meshes.filter(visible)){
      const active=m.key===selected(key)&&m.side!==-1;
      const p=m.v,V=new Float32Array(p.length),brightness=new Float32Array(p.length/3);
      for(let i=0;i<p.length;i+=3){let a=camera([p[i],p[i+1],p[i+2]]);V[i]=a[0]*dpr;V[i+1]=a[1]*dpr;V[i+2]=a[2];brightness[i/3]=.63+.43*Math.max(0,(m.norms[i]*Math.sin(yaw+.45)+m.norms[i+2]*Math.cos(yaw+.45))*.78+m.norms[i+1]*.62);}
      for(let i=0;i<m.f.length;i+=3){
        const a=m.f[i]*3,b=m.f[i+1]*3,c=m.f[i+2]*3, ax=V[a],ay=V[a+1],bx=V[b],by=V[b+1],cx=V[c],cy=V[c+1];
        const det=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);if(Math.abs(det)<.02)continue;
        const loX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),hiX=Math.min(w-1,Math.ceil(Math.max(ax,bx,cx)));
        const loY=Math.max(0,Math.floor(Math.min(ay,by,cy))),hiY=Math.min(h-1,Math.ceil(Math.max(ay,by,cy)));
        const la=brightness[a/3],lb=brightness[b/3],lc=brightness[c/3];
        for(let y=loY;y<=hiY;y++)for(let x=loX;x<=hiX;x++){
          const s=((by-cy)*(x-cx)+(cx-bx)*(y-cy))/det,t=((cy-ay)*(x-cx)+(ax-cx)*(y-cy))/det,u=1-s-t;
          if(s<0||t<0||u<0)continue;
          const z=s*V[a+2]+t*V[b+2]+u*V[c+2],idx=y*w+x;
          if(z<=depth[idx])continue;
          depth[idx]=z;const light=255*(s*la+t*lb+u*lc);for(let k=0;k<3;k++){const col=s*m.rgb[a+k]+t*m.rgb[b+k]+u*m.rgb[c+k];img.data[idx*4+k]=light*(active?col*.64+[.97,.61,.27][k]*.36:col);}img.data[idx*4+3]=255;
        }
      }
    }
    ctx.putImageData(img,0,0);
  }
  function draw(){
    frame=0;width=canvas.clientWidth;height=canvas.clientHeight;if(!width||!height)return;
    const dpr=gl?Math.min(2,devicePixelRatio):Math.min(1,devicePixelRatio);
    const w=Math.round(width*dpr),h=Math.round(height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    scale=Math.min(height/7.8,width/8.3)*zoom;
    if(gl){
      gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.uniform4f(uniform.camera,Math.cos(yaw),Math.sin(yaw),Math.cos(pitch),Math.sin(pitch));
      gl.uniform2f(uniform.scale,2*scale/width,2*scale/height);gl.uniform2f(uniform.pan,2*dx/width,-2*dy/height);
      meshes.forEach((m,i)=>{
        if(!visible(m))return;
        const b=buffers[i];gl.bindBuffer(gl.ARRAY_BUFFER,b.data);
        b.loc.forEach((l,k)=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,3,gl.FLOAT,false,36,k*12);});
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,b.index);
        gl.uniform1f(uniform.selected,Number(m.key===selected(key)&&(m.side!==-1)));gl.drawElements(gl.TRIANGLES,m.f.length,gl.UNSIGNED_SHORT,0);
      });
    } else software();
    changed(camera,width,height);
  }
  function redraw(){if(!frame)frame=requestAnimationFrame(draw);}
  function magnify(f){zoom=Math.min(2.4,Math.max(.59,zoom*f));redraw();}
  const angles=[.94,.51,1.31,1.04,.09,.79];
  function reset(){yaw=key==='thoracicDuct'?-.75:angles[region];pitch=region===5?-.36:.055;dx=0;dy=0;zoom=1;redraw();}
  const pointers=new Map(); let pinch=0;
  canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);pinch=0;};
  canvas.onpointermove=e=>{
    const p=pointers.get(e.pointerId);if(!p)return;
    pointers.set(e.pointerId,[e.clientX,e.clientY]);
    if(pointers.size===2){const [a,b]=pointers.values(),d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)magnify(d/pinch);pinch=d;return;}
    if(e.shiftKey){dx+=e.clientX-p[0];dy+=e.clientY-p[1];}
    else {yaw-=(e.clientX-p[0])*.012; pitch=Math.max(-1.28,Math.min(1.28,pitch+(e.clientY-p[1])*.009));}
    redraw();
  };
  canvas.onpointerup=canvas.onpointercancel=e=>{pointers.delete(e.pointerId);pinch=0;};
  canvas.addEventListener('wheel',e=>{e.preventDefault();magnify(Math.exp(-e.deltaY*.0014));},{passive:false});
  canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;e.preventDefault();
    if(e.key==='Home')reset();else if(e.key==='+')magnify(1.2);else if(e.key==='-')magnify(1/1.2);
    else{yaw+=({'ArrowRight':.14,'ArrowLeft':-.14}[e.key]||0);pitch=Math.max(-1.28,Math.min(1.28,pitch+({'ArrowUp':.1,'ArrowDown':-.1}[e.key]||0)));redraw();}
  };
  new ResizeObserver(redraw).observe(canvas);
  return {reset,magnify,redraw,set(r,k){const recenter=r!==region||k==='thoracicDuct'||key==='thoracicDuct';region=r;key=k;if(recenter)reset();redraw();},focus(value){focus=value;redraw();},layer(value){deep=value;redraw();},orient(a){yaw=a;pitch=.05;redraw();}};
}
