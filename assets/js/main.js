/* Popote Duo · landing page : scène 3D de Pépin, histoire au scroll, démo du mode cuisine, liste d'attente. */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
/* ---------- Réglages à remplir avant la mise en ligne (voir LISEZMOI.md) ---------- */
const CONFIG={
  // Mesure d'audience Vercel Web Analytics : sans cookie, rien à régler ici, il suffit de l'activer dans le projet Vercel.
  // Laisser vide pour ne rien mesurer.
  analytics:{provider:'vercel'},
  // Liste d'attente : l'adresse de la fonction qui envoie l'inscription par e-mail (api/inscription.js).
  // Laisser vide : rien n'est envoyé et la page affiche seulement la confirmation (mode démo).
  waitlist:{endpoint:'/api/inscription'}
};
const THREE_SRC='assets/js/three.min.js';

const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mesure d'audience ---------- */
// Chargée après la page, uniquement si elle est réglée. Les événements ne contiennent jamais de donnée personnelle.
// Le script n'existe que sur le site en ligne (Vercel le sert lui-même) : rien n'est chargé en local.
function loadAnalytics(){
  if(CONFIG.analytics.provider!=='vercel'||/^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname)||location.protocol==='file:')return;
  window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};
  const s=document.createElement('script');s.defer=true;s.src='/_vercel/insights/script.js';
  document.head.appendChild(s);
}
// Événements (clics, inscriptions, démo) : Vercel ne les enregistre qu'avec l'offre Pro. Sur l'offre gratuite, ils sont ignorés.
function track(name,props){
  try{if(window.va)window.va('event',{name,data:props})}catch(e){}
}
document.addEventListener('click',e=>{const a=e.target.closest('[data-track]');if(a)track('Clic inscription',{emplacement:a.dataset.track})});

/* ---------- Scène 3D ---------- */

function initScene(){
  if(!window.THREE) return null;
  const canvas=$('#scene');
  let renderer;
  try{
    const c=document.createElement('canvas');
    if(!(c.getContext('webgl')||c.getContext('experimental-webgl'))) return null;
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  }catch(e){return null}
  setupRenderer(renderer);
  const scene=new THREE.Scene();
  scene.environment=makeEnv(renderer);
  addLights(scene);
  // Le canvas ne couvre que Pépin et son ombre (VIEW_W × VIEW_H hauteurs de Pépin), au lieu de tout l'écran.
  // Il est posé dans le bloc collant de l'histoire : il défile avec la page comme le texte, sans attendre le JavaScript.
  const VIEW_W=.95, VIEW_H=1.45;
  const camera=new THREE.PerspectiveCamera(22,VIEW_W/VIEW_H,.1,100);
  camera.position.set(0,0,(VIEW_H*PEPIN_H/2)/Math.tan(THREE.MathUtils.degToRad(11)));

  const pepin=buildPepin(true);
  scene.add(pepin.root);
  const shadow=makeShadow();
  scene.add(shadow);

  // box : la plus grande hauteur de Pépin à l'écran (hero ou histoire), en pixels.
  let box=1, CW=1, CH=1, prCap=matchMedia('(pointer: coarse)').matches?1.5:2, ox=NaN, oy=NaN, shown=true;
  function size(h){
    const pr=Math.min(devicePixelRatio||1,prCap), w=Math.ceil(Math.max(1,h)*VIEW_W), hh=Math.ceil(Math.max(1,h)*VIEW_H);
    // Rien à refaire si rien ne change (la barre d'adresse mobile déclenche souvent des « resize » pour rien).
    if(w===CW&&hh===CH&&pr===renderer.getPixelRatio())return;
    box=Math.max(1,h);CW=w;CH=hh;
    renderer.setPixelRatio(pr);
    renderer.setSize(CW,CH);
  }

  // pointeur : Pépin tourne la tête et suit des yeux
  const ptr={x:0,y:0,tx:0,ty:0};
  addEventListener('pointermove',e=>{ptr.tx=(e.clientX/innerWidth)*2-1;ptr.ty=(e.clientY/innerHeight)*2-1},{passive:true});
  // câlin : un saut quand on touche Pépin
  let jump=0;
  [$('#spotHero'),$('#spotStory')].forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('.pin'))return;jump=1}));

  let intro=0, blinkAt=1.5, blink=0, last=performance.now(), pS=null;
  // Qualité adaptative : si l'appareil peine (moins de 52 images/s), on allège par paliers :
  // matières plus simples (sans vernis), puis résolution du rendu plus basse.
  const perf={n:0,t:0,wait:1.5,lvl:0};
  function degrade(){
    perf.lvl++;
    if(perf.lvl===1)simplify(scene);
    else{prCap=perf.lvl===2?1.25:1;size(box)}
  }
  const anchorsLocal=[[-.8,-.06,.34],[.8,.12,.34]].map(a=>new THREE.Vector3(...a));
  const anchors=anchorsLocal.map(()=>({x:0,y:0,front:true}));
  const tmp=new THREE.Vector3();
  const res={p:0,anchors};

  return {
    resize:size,
    stats:()=>({lvl:perf.lvl,pr:renderer.getPixelRatio()}),
    frame(now,st){ // st : positions de Pépin (hero, histoire) dans le bloc collant, passage de l'un à l'autre (b), scroll de l'histoire (p)
      const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
      if(perf.lvl<3&&dt>0){
        if(perf.wait>0)perf.wait-=dt;
        else{perf.n++;perf.t+=dt;if(perf.n===60){const avg=perf.t/60;perf.n=perf.t=0;if(avg>.019){degrade();perf.wait=1}}}
      }
      intro=Math.min(1,intro+dt/1.1);
      const ib=RM?1:easeOutBack(intro);
      const pk=1-Math.exp(-dt*5);
      ptr.x+=(ptr.tx-ptr.x)*pk;ptr.y+=(ptr.ty-ptr.y)*pk;

      // b vient d'une animation dans le temps (voir la boucle) : il n'est jamais lié directement au scroll.
      // Seul le léger balancement dans l'histoire suit le scroll, amorti.
      if(st.reset||pS===null)pS=st.p;
      pS+=(st.p-pS)*(RM?1:1-Math.exp(-dt*6));
      const b=st.b;

      // Le canvas se place sur Pépin ; dans le canvas, Pépin reste au centre et change seulement d'échelle.
      const x=lerp(st.hero.x,st.story.x,b), y=lerp(st.hero.y,st.story.y,b), s=lerp(st.hero.h,st.story.h,b)/box*ib;
      const nx=Math.round((x-CW/2)*4)/4, ny=Math.round((y-CH/2)*4)/4;
      if(nx!==ox||ny!==oy){ox=nx;oy=ny;canvas.style.transform=`translate3d(${nx}px,${ny}px,0)`}
      const idle=RM?0:1;
      jump=Math.max(0,jump-dt*1.4);
      // un petit bond pendant le passage du hero à l'histoire, en plus du saut quand on le touche
      const jy=(Math.sin(jump*Math.PI)*.55+(RM?0:Math.sin(b*Math.PI)*.4))*s;
      const root=pepin.root;
      root.position.set(0, Math.sin(t*1.7)*.05*s*idle+jy, 0);
      root.scale.setScalar(Math.max(s,.0001));
      const squash=1+Math.sin(jump*Math.PI*2)*.08, breath=Math.sin(t*2.1)*.012*idle;
      pepin.inner.scale.set((1-breath*.5)/Math.sqrt(squash),squash*(1+breath),(1-breath*.5)/Math.sqrt(squash));
      const transfer=RM?0:b*Math.PI*2;
      const spin=jump>0?(1-jump)*Math.PI*2:0;
      root.rotation.y=ptr.x*.38+transfer+spin+Math.sin(pS*Math.PI*2)*.32*b;
      root.rotation.x=ptr.y*.14+.04;
      root.rotation.z=Math.sin(t*1.1)*.045*idle;
      pepin.leaves.forEach((l,i)=>{l.rotation.z=l.userData.rz+Math.sin(t*2.2+i*1.3)*.06*idle;l.rotation.x=l.userData.rx+Math.sin(t*1.7+i)*.03*idle});
      pepin.pupils.forEach(pu=>{pu.position.x=pu.userData.x+ptr.x*.028;pu.position.y=pu.userData.y-ptr.y*.022});
      if(!RM){blinkAt-=dt;if(blinkAt<=0){blink=1;blinkAt=2.5+Math.random()*3}blink=Math.max(0,blink-dt*7);}
      const eyeS=1-Math.sin(blink*Math.PI)*.9;
      pepin.eyes.forEach(e=>e.scale.y=eyeS);

      // ombre de contact
      shadow.position.set(0, -1.6*s*ib, -.2);
      const sh=1-(jy/(s||1))*.6;
      shadow.scale.set(2.2*s*sh,2.2*s*sh,1);
      shadow.material.opacity=.55*(1-b*.3);

      renderer.render(scene,camera);

      // points d'ancrage des bulles, en pixels dans le bloc collant (objets réutilisés : rien à ramasser pour le ramasse-miettes)
      anchorsLocal.forEach((a,i)=>{tmp.copy(a).applyMatrix4(pepin.inner.matrixWorld).project(camera);anchors[i].x=ox+(tmp.x+1)/2*CW;anchors[i].y=oy+(1-tmp.y)/2*CH});
      res.p=pS;
      return res;
    },
    setVisible(v){if(v!==shown){shown=v;canvas.style.visibility=v?'visible':'hidden'}}
  };
}

// Remplace les matières physiques (avec vernis) par des matières standard, bien moins coûteuses à dessiner.
function simplify(scene){
  const done=new Map();
  scene.traverse(o=>{
    const m=o.material;if(!m||!m.isMeshPhysicalMaterial)return;
    if(!done.has(m)){
      const n=new THREE.MeshStandardMaterial({color:m.color,map:m.map,roughness:Math.min(m.roughness,.35),metalness:m.metalness,vertexColors:m.vertexColors,bumpMap:m.bumpMap,bumpScale:m.bumpScale,side:m.side,transparent:m.transparent,opacity:m.opacity});
      n.onBeforeCompile=m.onBeforeCompile;n.customProgramCacheKey=m.customProgramCacheKey;
      done.set(m,n);
    }
    o.material=done.get(m);
  });
  done.forEach((n,m)=>m.dispose());
}
function easeInOut(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function easeOutBack(t){const c1=1.4,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)}

function setupRenderer(r){
  r.outputEncoding=THREE.sRGBEncoding;
  r.toneMapping=THREE.ACESFilmicToneMapping;
  r.toneMappingExposure=1;
}
// Studio d'éclairage virtuel, sombre comme le fond du haut de page : une grande boîte à lumière chaude en haut à gauche,
// deux bandes de contre-jour (menthe à droite, plus douce à gauche) et un rebond chaud en bas.
function makeEnv(renderer){
  const pm=new THREE.PMREMGenerator(renderer);
  const s=new THREE.Scene();
  const geo=new THREE.SphereGeometry(10,48,24);
  const top=new THREE.Color(.18,.26,.21), mid=new THREE.Color(.07,.12,.09), bot=new THREE.Color(.025,.04,.032);
  const cols=[];const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i)/10;const c=y>0?mid.clone().lerp(top,y):mid.clone().lerp(bot,-y);cols.push(c.r,c.g,c.b)}
  geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  s.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})));
  const box=(x,y,z,w,h,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);s.add(m)};
  box(-4.5,5.5,5,5,3.6,new THREE.Color(3.4,3.2,3.0));
  box(6.5,1.2,-2.5,1.4,7,new THREE.Color(1.5,2.4,1.8));
  box(-6.5,.5,-3,1,6,new THREE.Color(1.1,1.2,1.15));
  box(0,-5,5.5,7,1.6,new THREE.Color(.75,.55,.42));
  const rt=pm.fromScene(s,.03);pm.dispose();
  return rt.texture;
}
function addLights(scene){
  scene.add(new THREE.HemisphereLight(0xfff4e6,0x163b2a,.38));
  const key=new THREE.DirectionalLight(0xfff1e0,1.15);key.position.set(-3,5,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,.22);fill.position.set(4,-1,5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xc8f5d4,1.5);rim.position.set(4,2.5,-4);scene.add(rim);
}
function makeShadow(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(2,12,7,.8)');g.addColorStop(.35,'rgba(2,12,7,.4)');g.addColorStop(1,'rgba(2,12,7,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  return new THREE.Mesh(new THREE.PlaneGeometry(1,.38),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,toneMapped:false}));
}

/* ---- Modèles ---- */
const PEPIN_H=3.0;
const col=h=>new THREE.Color(h).convertSRGBToLinear();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function rnd(seed){let s=seed>>>0||1;return()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296}

// Matière PBR, avec en option un liseré lumineux sur les bords : la lumière qui traverse la peau.
function mat(h,o,rim){
  const m=new THREE.MeshPhysicalMaterial(Object.assign({color:col(h),roughness:.45,metalness:0,clearcoat:.4,clearcoatRoughness:.35},o||{}));
  if(rim){
    const [rc,rs,rp]=rim, c=col(rc);
    m.onBeforeCompile=sh=>{
      sh.uniforms.uRimC={value:c};sh.uniforms.uRimS={value:rs};sh.uniforms.uRimP={value:rp};
      sh.fragmentShader='uniform vec3 uRimC;\nuniform float uRimS;\nuniform float uRimP;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',
        'float rimF=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);\ngl_FragColor.rgb+=uRimC*pow(rimF,uRimP)*uRimS;\n#include <tonemapping_fragment>');
    };
    m.customProgramCacheKey=()=>'rim'+rc+rs+rp;
  }
  return m;
}
// Couleurs par sommet : dégradés naturels et ombre douce dans les creux.
function paint(geo,fn){
  const p=geo.attributes.position, out=new Float32Array(p.count*3), c=new THREE.Color();
  for(let i=0;i<p.count;i++){fn(p.getX(i),p.getY(i),p.getZ(i),c);c.convertSRGBToLinear();out[i*3]=c.r;out[i*3+1]=c.g;out[i*3+2]=c.b}
  geo.setAttribute('color',new THREE.BufferAttribute(out,3));
  return geo;
}
const S=h=>new THREE.Color(h);

// Textures dessinées une fois : grain de peau, pores, coquille d'œuf, points lumineux, joues.
let TX=null;
function tex(){
  if(TX) return TX;
  const make=(w,h,draw,srgb)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
  const dots=(x,w,h,n,r,minR,maxR,color,minA,maxA,sx)=>{for(let i=0;i<n;i++){const cx=r()*w,cy=r()*h,rad=minR+r()*(maxR-minR),a=minA+r()*(maxA-minA);x.fillStyle=color.replace('A',a.toFixed(3));[cx-w,cx,cx+w].forEach(px=>{x.beginPath();x.ellipse(px,cy,rad*(sx||1),rad,0,0,7);x.fill()})}};
  TX={
    skin:make(512,512,(x,w,h)=>{const r=rnd(3);x.fillStyle='#808080';x.fillRect(0,0,w,h);
      for(let i=0;i<110;i++){x.fillStyle=r()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';x.fillRect(r()*w,0,1+r()*3,h)}
      dots(x,w,h,520,r,.5,1.5,'rgba(30,30,30,A)',.18,.42,2.4)}),
    pores:make(512,512,(x,w,h)=>{const r=rnd(5);x.fillStyle='#8a8a8a';x.fillRect(0,0,w,h);dots(x,w,h,4200,r,.6,1.6,'rgba(20,20,20,A)',.25,.55)}),
    blush:make(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.55,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)})
  };
  TX.skin.repeat.set(2,1);TX.pores.repeat.set(2,1);
  return TX;
}

function lathe(prof,seg,pts){
  const curve=new THREE.SplineCurve(prof.map(p=>new THREE.Vector2(p[0],p[1])));
  const P=curve.getPoints(pts||110);P.forEach(p=>{if(p.x<0)p.x=0});P[0].x=0;P[P.length-1].x=0;
  const geo=new THREE.LatheGeometry(P,seg||96);
  const rAt=y=>{for(let i=1;i<P.length;i++){if(P[i].y>=y){const a=P[i-1],b=P[i];const t=(y-a.y)/((b.y-a.y)||1);return a.x+(b.x-a.x)*t}}return 0};
  return {geo,rAt};
}
// Feuille : une surface fine, pliée le long de la nervure, aux bords légèrement ondulés,
// plus foncée à la base et plus claire à la pointe.
let LEAF_MAT=null;
function leafMat(){return LEAF_MAT||(LEAF_MAT=mat('#ffffff',{vertexColors:true,roughness:.55,clearcoat:.18,clearcoatRoughness:.4,side:THREE.DoubleSide},['#B8F27A',.16,3]))}
function leaf(L,W,o){
  o=o||{};
  const g=new THREE.PlaneGeometry(1,1,12,30), p=g.attributes.position, cols=new Float32Array(p.count*3), c=new THREE.Color();
  const base=S(o.base||'#195E28'), mid=S(o.mid||'#2E9442'), tip=S(o.tip||'#62BE55'), vein=S(o.vein||'#A9DE92');
  const bend=o.bend==null?.3:o.bend, fold=o.fold==null?.22:o.fold, wave=o.wave==null?1:o.wave;
  for(let i=0;i<p.count;i++){
    const u=p.getX(i)*2, v=p.getY(i)+.5, au=Math.abs(u);
    const wv=Math.pow(Math.sin(Math.PI*Math.min(1,v)),.72)*(1-.12*v);
    const x=u*W*wv, y=v*L;
    const z=bend*(y*y)/L+fold*W*au*wv+Math.sin(v*24+u*2)*.012*au*wave*wv;
    p.setXYZ(i,x,y,z);
    c.copy(base).lerp(mid,sstep(0,.45,v)).lerp(tip,sstep(.45,1,v)*.75);
    c.lerp(vein,(1-sstep(.02,.1,au))*.6*(1-v*.6));
    c.multiplyScalar(1-.14*au);
    c.convertSRGBToLinear();cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;
  }
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();
  return new THREE.Mesh(g,leafMat());
}
function tube(pts,r,color,taper,painter){
  const g=new THREE.Group();
  const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,r,12,false);
  if(taper){const p=geo.attributes.position,n=geo.parameters.tubularSegments,rs=geo.parameters.radialSegments,path=geo.parameters.path;
    for(let i=0;i<=n;i++){const c=path.getPointAt(i/n),k=1-taper*(i/n);for(let j=0;j<=rs;j++){const idx=i*(rs+1)+j;const v=V(p.getX(idx),p.getY(idx),p.getZ(idx)).sub(c).multiplyScalar(k).add(c);p.setXYZ(idx,v.x,v.y,v.z)}}geo.computeVertexNormals()}
  if(painter)paint(geo,painter);
  const m=mat(painter?'#ffffff':color,{roughness:.4,vertexColors:!!painter});
  g.add(new THREE.Mesh(geo,m));
  const cap=new THREE.Mesh(new THREE.SphereGeometry(r,16,10),m);cap.position.copy(pts[0]);g.add(cap);
  if(!taper){const c2=cap.clone();c2.position.copy(pts[pts.length-1]);g.add(c2)}
  return g;
}

function buildPepin(face){
  const root=new THREE.Group(), inner=new THREE.Group();root.add(inner);inner.position.y=-.13;
  const {geo,rAt}=lathe([[0,-.88],[.22,-.84],[.47,-.72],[.69,-.52],[.83,-.26],[.88,.02],[.83,.32],[.66,.58],[.37,.76],[0,.82]]);
  // dégradé du radis : rouge profond en haut, rose puis blanc vers la racine, ombre douce sous les feuilles
  const cTop=S('#93102D'), cBody=S('#D2264A'), cLow=S('#EC6F8A'), cTip=S('#F8DCE2');
  paint(geo,(x,y,z,c)=>{
    const r=Math.hypot(x,z);
    c.copy(cBody).lerp(cTop,sstep(.3,.8,y)*.7).lerp(cLow,sstep(-.42,-.8,y)).lerp(cTip,sstep(-.72,-.88,y));
    c.multiplyScalar(1-.38*sstep(.6,.8,y)*(1-sstep(.05,.42,r)));
  });
  const T=tex();
  inner.add(new THREE.Mesh(geo,mat('#ffffff',{vertexColors:true,roughness:.3,clearcoat:.85,clearcoatRoughness:.16,bumpMap:T.skin,bumpScale:.0025},['#FF8FA8',.42,2.6])));
  const tailA=S('#CF4562'), tailB=S('#F5D2DA');
  inner.add(tube([V(0,-.84,0),V(0,-1.02,.02),V(.06,-1.18,.05),V(.19,-1.29,.08)],.034,null,.75,(x,y,z,c)=>c.copy(tailA).lerp(tailB,sstep(-.9,-1.25,y))));
  const placeOn=(o,x,y,lift)=>{const r=rAt(y);const z=Math.sqrt(Math.max(r*r-x*x,1e-4));const n=V(x,y*.35,z).normalize();o.position.set(x,y,z).addScaledVector(n,lift);inner.add(o);o.lookAt(V(o.position.x+n.x,o.position.y+n.y-.13,o.position.z+n.z));};
  const eyes=[], pupils=[];
  if(face){
    const whiteM=mat('#FBFCFF',{roughness:.12,clearcoat:1,clearcoatRoughness:.05}), pupM=mat('#1E1A1A',{roughness:.1,clearcoat:1,clearcoatRoughness:.04});
    [-1,1].forEach(sd=>{
      const e=new THREE.Group();
      const w=new THREE.Mesh(new THREE.SphereGeometry(.128,40,24),whiteM);w.scale.set(1,1.22,.42);e.add(w);
      const pu=new THREE.Mesh(new THREE.SphereGeometry(.076,32,16),pupM);pu.scale.set(1,1.06,.5);pu.position.set(.012,-.022,.048);pu.userData={x:.012,y:-.022};e.add(pu);pupils.push(pu);
      const gl=new THREE.Mesh(new THREE.SphereGeometry(.026,16,10),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));gl.position.set(.036,.02,.088);pu.add(gl);
      const gl2=new THREE.Mesh(new THREE.SphereGeometry(.011,10,8),gl.material);gl2.position.set(-.03,-.035,.082);pu.add(gl2);
      placeOn(e,sd*.27,.03,-.012);eyes.push(e);
    });
    [-1,1].forEach(sd=>{
      const ck=new THREE.Mesh(new THREE.PlaneGeometry(.3,.19),new THREE.MeshBasicMaterial({map:T.blush,color:col('#FF8FA6'),transparent:true,opacity:.85,depthWrite:false}));
      placeOn(ck,sd*.5,-.16,.016);
    });
    const pts=[];for(let i=0;i<=16;i++){const t=i/16;const x=-.15+.3*t;const y=-.18-.088*Math.sin(Math.PI*t);const r=rAt(y);pts.push(V(x,y,Math.sqrt(r*r-x*x)+.004))}
    inner.add(tube(pts,.022,'#3A161E'));
  }
  const top=new THREE.Group();top.position.set(0,.79,0);inner.add(top);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.13,16),mat('#3C8F47',{roughness:.5}));stem.position.y=.03;top.add(stem);
  const leaves=[];
  [{L:.8,W:.25,rz:.8,ry:.45,rx:-.2},{L:.94,W:.27,rz:-.08,ry:0,rx:-.3,o:{mid:'#38A84B',tip:'#78CC62'}},{L:.76,W:.23,rz:-.95,ry:-.45,rx:-.14}].forEach(d=>{
    const piv=new THREE.Group();piv.rotation.set(d.rx,d.ry,d.rz);piv.userData.rz=d.rz;piv.userData.rx=d.rx;
    piv.add(leaf(d.L,d.W,Object.assign({bend:.34},d.o)));top.add(piv);leaves.push(piv);
  });
  return {root,inner,eyes,pupils,leaves};
}

const BUILD={
  pepin(){const g=new THREE.Group();g.add(buildPepin(true).root);return g},
  tomato(){
    const g=new THREE.Group();
    const geo=new THREE.SphereGeometry(.5,72,48);const p=geo.attributes.position;const v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const a=Math.atan2(v.z,v.x);const k=1+.045*Math.cos(a*5)*(1-Math.abs(v.y)/.5);v.x*=k;v.z*=k;v.y*=.84;if(v.y>.3)v.y-=(v.y-.3)*.6;p.setXYZ(i,v.x,v.y,v.z)}
    geo.computeVertexNormals();
    const cA=S('#E0372D'), cTop=S('#EE6A2C'), cBot=S('#C8291F');
    paint(geo,(x,y,z,c)=>{const r=Math.hypot(x,z);c.copy(cA).lerp(cTop,sstep(.12,.34,y)*.55).lerp(cBot,sstep(-.1,-.4,y)*.5);c.multiplyScalar(1-.3*sstep(.26,.34,y)*(1-sstep(0,.18,r)))});
    g.add(new THREE.Mesh(geo,mat('#ffffff',{vertexColors:true,roughness:.22,clearcoat:1,clearcoatRoughness:.08,bumpMap:tex().skin,bumpScale:.0012},['#FFB08A',.45,2.4])));
    const top=new THREE.Group();top.position.y=.36;g.add(top);
    for(let i=0;i<5;i++){const pv=new THREE.Group();pv.rotation.y=i*Math.PI*2/5+.2;const l=leaf(.32,.08,{bend:-.55,fold:.35,wave:.6,base:'#2A6E35',mid:'#3F9A4C',tip:'#5DB560'});l.rotation.x=-(Math.PI/2-.12);pv.add(l);top.add(pv)}
    top.add(tube([V(0,0,0),V(0,.08,0),V(.03,.15,.01),V(.07,.18,.02)],.026,'#3C8F47'));
    return g;
  },
  // Carotte : trapue et bien orange, légèrement courbée, avec des sillons irréguliers et un bouquet de fanes.
  carrot(){
    const g=new THREE.Group(), r=rnd(7);
    const {geo}=lathe([[0,-1.0],[.05,-.93],[.14,-.6],[.23,-.2],[.31,.18],[.355,.4],[.345,.5],[.24,.57],[0,.6]],72,100);
    const p=geo.attributes.position;
    const grooves=[...Array(11)].map(()=>[-.85+r()*1.3,.035+r()*.03,r()*Math.PI*2,.35+r()*.5]);
    const depth=new Float32Array(p.count);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);
      let k=1;
      grooves.forEach(([gy,d,a0,f])=>{k-=d*Math.exp(-Math.pow((y-gy)/.02,2))*sstep(1-2*f,1-2*f+.4,Math.cos(a-a0))});
      depth[i]=1-k;
      const bend=.11*Math.pow((.6-y)/1.6,2);
      p.setXYZ(i,x*k+bend,y,z*k);
    }
    geo.computeVertexNormals();
    const cA=S('#EE5E0C'), cTop=S('#D24A06'), cTip=S('#F27A22'), cCrown=S('#7E9A2E');
    let vi=0;
    paint(geo,(x,y,z,c)=>{c.copy(cA).lerp(cTop,sstep(.15,.45,y)*.55).lerp(cTip,sstep(-.45,-.95,y)*.6).lerp(cCrown,sstep(.53,.59,y)*.8);c.multiplyScalar(1-Math.min(.32,depth[vi++]*6))});
    g.add(new THREE.Mesh(geo,mat('#ffffff',{vertexColors:true,roughness:.45,clearcoat:.35,clearcoatRoughness:.3,bumpMap:tex().skin,bumpScale:.0025},['#FF9A4A',.22,2.6])));
    const top=new THREE.Group();top.position.y=.57;g.add(top);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,.1,16),mat('#5E9A3A',{roughness:.5}));stem.position.y=.02;top.add(stem);
    for(let i=0;i<11;i++){
      const t=i/10, pv=new THREE.Group();
      pv.rotation.set(-.15+r()*.3,(r()-.5)*2.4,-.95+t*1.9+(r()-.5)*.2);
      pv.add(leaf(.5+r()*.35,.1,{bend:.25,fold:.35,wave:2.2,base:'#1F6127',mid:'#2F9038',tip:'#62B84A'}));top.add(pv);
    }
    return g;
  },
  // Cookie géant : un disque doré aux bords irréguliers, plus foncé sur le pourtour, parsemé de pépites.
  cookie(){
    const g=new THREE.Group(), r=rnd(21);
    const {geo}=lathe([[0,-.13],[.42,-.13],[.6,-.1],[.68,-.03],[.66,.05],[.56,.11],[.3,.14],[0,.15]],96,60);
    const p=geo.attributes.position, v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i);const a=Math.atan2(v.z,v.x), rr=Math.hypot(v.x,v.z);
      const k=1+.035*Math.sin(a*7+1.3)+.02*Math.sin(a*13);v.x*=k;v.z*=k;
      if(v.y>0)v.y+=.022*Math.sin(v.x*9)*Math.cos(v.z*8)*(rr/.66);
      p.setXYZ(i,v.x,v.y,v.z);
    }
    geo.computeVertexNormals();
    const cIn=S('#D99442'), cTop=S('#E6AA5C'), cEdge=S('#A65F22');
    paint(geo,(x,y,z,c)=>{const rr=Math.hypot(x,z);c.copy(cIn).lerp(cTop,sstep(.05,.14,y)*(1-sstep(.3,.6,rr))*.6).lerp(cEdge,sstep(.45,.68,rr)*.75)});
    g.add(new THREE.Mesh(geo,mat('#ffffff',{vertexColors:true,roughness:.78,clearcoat:.05,bumpMap:tex().pores,bumpScale:.01},['#FFD9A0',.25,2.6])));
    const chipM=mat('#3A2116',{roughness:.35,clearcoat:.6,clearcoatRoughness:.3});
    for(let i=0;i<14;i++){
      const a=r()*Math.PI*2, rr=Math.sqrt(r())*.5;
      const ch=new THREE.Mesh(new THREE.DodecahedronGeometry(.055+r()*.03,0),chipM);
      ch.position.set(Math.cos(a)*rr,.125-rr*.05,Math.sin(a)*rr);ch.rotation.set(r()*3,r()*3,r()*3);ch.scale.set(1,.7,1);g.add(ch);
    }
    return g;
  },
  // Banane : un tube courbe, renflé au milieu, à cinq pans légers, avec sa queue et sa pointe brune.
  banana(){
    const g=new THREE.Group();
    const curve=new THREE.CatmullRomCurve3([V(-.72,.42,0),V(-.48,.06,.02),V(-.12,-.14,.03),V(.28,-.1,.02),V(.6,.13,0),V(.74,.42,-.02)]);
    const N=72, RS=20, geo=new THREE.TubeGeometry(curve,N,.2,RS,false), p=geo.attributes.position, cols=new Float32Array(p.count*3), c=new THREE.Color();
    const cY=S('#F0C21E'), cStem=S('#9A9A2C'), cTip=S('#4A3218');
    for(let i=0;i<=N;i++){
      const t=i/N, ctr=curve.getPointAt(t), k=.12+.88*Math.pow(Math.sin(Math.PI*t),.62);
      for(let j=0;j<=RS;j++){
        const idx=i*(RS+1)+j, ridge=1+.06*Math.cos(5*j/RS*Math.PI*2);
        const q=V(p.getX(idx),p.getY(idx),p.getZ(idx)).sub(ctr).multiplyScalar(k*ridge).add(ctr);p.setXYZ(idx,q.x,q.y,q.z);
        c.copy(cY).lerp(cStem,1-sstep(.02,.16,t)).lerp(cTip,sstep(.93,.99,t));c.multiplyScalar(.94+.06*ridge);
        c.convertSRGBToLinear();cols[idx*3]=c.r;cols[idx*3+1]=c.g;cols[idx*3+2]=c.b;
      }
    }
    geo.setAttribute('color',new THREE.BufferAttribute(cols,3));geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo,mat('#ffffff',{vertexColors:true,roughness:.5,clearcoat:.35,clearcoatRoughness:.3,bumpMap:tex().skin,bumpScale:.0015},['#FFF2A8',.35,2.4])));
    g.add(tube([V(-.72,.42,0),V(-.79,.55,0),V(-.78,.66,0)],.045,'#7A6A35'));
    const tip=new THREE.Mesh(new THREE.SphereGeometry(.035,12,8),mat('#4A3520'));tip.position.copy(curve.getPointAt(1));g.add(tip);
    return g;
  }
};

/* ---- Images des ingrédients et de Pépin ---- */
// Elles sont rendues une fois pour toutes à partir des modèles ci-dessus et servies en WebP
// (assets/img/ingredients, assets/img/pepin-3d.webp). Pour les refaire : ouvrir la page avec ?rendus,
// puis enregistrer chaque image proposée.
function exportRenders(){
  const pose={tomate:['tomato',[.45,0,.15]],carotte:['carrot',[0,.3,-.62]],banane:['banana',[.35,.25,.12]],cookie:['cookie',[.78,0,-.12]],'pepin-3d':['pepin',[.05,-.35,0]]};
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  setupRenderer(R);R.setPixelRatio(1);R.setSize(512,512,false);
  const sc=new THREE.Scene();sc.environment=makeEnv(R);addLights(sc);
  const cam=new THREE.PerspectiveCamera(30,1,.1,60);
  const box=document.createElement('div');
  box.style.cssText='position:fixed;inset:12px;z-index:99;overflow:auto;padding:16px;border-radius:24px;background:#F3EEE2;display:flex;flex-wrap:wrap;gap:16px;align-content:flex-start';
  document.body.appendChild(box);
  Object.entries(pose).forEach(([name,[k,rot]])=>{
    const m=BUILD[k]();m.rotation.set(...rot);
    const h=new THREE.Group();h.add(m);sc.add(h);
    const bb=new THREE.Box3().setFromObject(h), c=bb.getCenter(new THREE.Vector3()), sz=bb.getSize(new THREE.Vector3());
    m.position.sub(c);
    cam.position.set(0,0,Math.max(sz.x,sz.y)/(2*Math.tan(THREE.MathUtils.degToRad(15))*.9)+sz.z/2);cam.lookAt(0,0,0);
    R.render(sc,cam);sc.remove(h);
    const url=R.domElement.toDataURL('image/webp',.9);
    box.insertAdjacentHTML('beforeend','<a download="'+name+'.webp" href="'+url+'" style="text-align:center;font:14px sans-serif;color:#173F2E"><img src="'+url+'" width="200" height="200" alt="">'+name+'.webp</a>');
  });
  R.dispose();
}

/* ---------- Démarrage de la 3D, après le premier affichage ---------- */
// Le texte et les boutons s'affichent tout de suite ; Three.js (600 Ko) se charge ensuite, et Pépin arrive en sautillant.
let GL=null;
function giveUp3D(){document.documentElement.classList.add('no-gl');$('#scene').style.display='none'}
function start3D(){
  GL=initScene();
  if(!GL){giveUp3D();return}
  measure();
  if(/[?&]rendus/.test(location.search))exportRenders();
}
const idle=f=>('requestIdleCallback' in window)?requestIdleCallback(f,{timeout:600}):setTimeout(f,60);
function load3D(){
  if(window.THREE){start3D();return}
  const s=document.createElement('script');s.src=THREE_SRC;s.async=true;
  s.onload=start3D;s.onerror=giveUp3D;document.head.appendChild(s);
}
if(document.readyState==='complete')idle(load3D);else addEventListener('load',()=>idle(load3D),{once:true});
addEventListener('load',()=>setTimeout(loadAnalytics,1200),{once:true});

/* ---------- Histoire au scroll ---------- */
const story=$('#story'), stage=$('.stage'), spotHero=$('#spotHero'), spotStory=$('#spotStory'), sticky=$('.story-sticky');
const pins=$$('.pin'), items=$$('.sp-item'), bars=$$('.sp-bars span'), linesSvg=$('#storyLines');
const NS='http://www.w3.org/2000/svg';
const lineEls=pins.map(()=>{const g=document.createElementNS(NS,'g');const p=document.createElementNS(NS,'path');const r=document.createElementNS(NS,'circle');r.setAttribute('class','r');r.setAttribute('r','9');const d=document.createElementNS(NS,'circle');d.setAttribute('class','d');d.setAttribute('r','4.5');g.append(p,r,d);g.style.opacity=0;linesSvg.appendChild(g);return {g,p,r,d}});
const FALLBACK_ANCH=[[.15,.52],[.85,.5]];
let curIdx=-1;
pins.forEach((el,i)=>el.addEventListener('click',()=>{
  const r=story.getBoundingClientRect();const top=r.top+scrollY;const span=r.height-innerHeight;
  smoothScrollTo(top+span*((i+.5)/pins.length));
}));

/* ---------- Défilement vers les ancres ---------- */
// Le scroll natif traverse toute la scène 3D en une fraction de seconde. Ici, quand la cible est loin,
// on saute juste avant elle, puis on glisse sur la fin avec une durée maîtrisée.
let scrollRaf=0, jumped=false;
function smoothScrollTo(y){
  y=clamp(Math.round(y),0,document.documentElement.scrollHeight-innerHeight);
  cancelAnimationFrame(scrollRaf);
  if(RM){scrollTo(0,y);jumped=true;return}
  const vh=innerHeight;let from=scrollY, far=Math.abs(y-from)>vh*1.6;
  if(far){from=y-Math.sign(y-from)*vh*.8;scrollTo(0,from);jumped=true}
  const d=y-from, dur=clamp(Math.abs(d)/vh*650,420,900), t0=performance.now();
  const ease=far?(t=>1-Math.pow(1-t,4)):(t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2);
  const step=now=>{const t=clamp((now-t0)/dur,0,1);scrollTo(0,from+d*ease(t));if(t<1)scrollRaf=requestAnimationFrame(step)};
  scrollRaf=requestAnimationFrame(step);
}
['wheel','touchstart'].forEach(ev=>addEventListener(ev,()=>cancelAnimationFrame(scrollRaf),{passive:true}));
document.addEventListener('click',e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const id=a.getAttribute('href').slice(1), el=id&&document.getElementById(id);if(!el)return;
  e.preventDefault();
  const card=el.classList.contains('rc');
  smoothScrollTo(id==='top'?0:el.getBoundingClientRect().top+scrollY-(card?110:0));
  try{history.replaceState(null,'','#'+id)}catch(_){}
  el.setAttribute('tabindex','-1');el.focus({preventScroll:true});
  if(a.dataset.recette)track('Carte ingrédient',{recette:a.dataset.recette});
  if(card)showRecipe(el);
});
// Sur mobile, les recettes défilent à l'horizontale : on amène la bonne carte devant, puis on la signale.
function showRecipe(el){
  const grid=el.parentElement, gl=grid.getBoundingClientRect().left, pl=parseFloat(getComputedStyle(grid).paddingLeft)||0;
  if(grid.scrollWidth>grid.clientWidth)grid.scrollTo({left:grid.scrollLeft+el.getBoundingClientRect().left-gl-pl,behavior:RM?'auto':'smooth'});
  el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');
}

// Positions mises en cache, relatives au bloc collant de l'histoire (où vit le canvas de Pépin).
// Elles ne changent qu'avec la mise en page : on les recalcule au redimensionnement, pas à chaque image.
const geo={heroX:0,heroY:0,heroH:1,spotX:0,spotY:0,spotH:1,stickyH:1,pins:[],fallback:[]};
function measure(){
  const st=story.getBoundingClientRect(), sk=sticky.getBoundingClientRect(), hr=spotHero.getBoundingClientRect(), sp=spotStory.getBoundingClientRect();
  // Le hero est mesuré par rapport au haut de l'histoire : c'est là que se trouve le bloc collant tant qu'il n'a pas glissé.
  geo.heroX=hr.left+hr.width/2-sk.left;geo.heroY=hr.top+hr.height/2-st.top;geo.heroH=hr.height;
  geo.spotX=sp.left+sp.width/2-sk.left;geo.spotY=sp.top+sp.height/2-sk.top;geo.spotH=sp.height;
  geo.stickyH=sk.height;
  // Le centre d'une bulle ne bouge pas quand elle grandit (elle est centrée sur son point) : une mesure suffit.
  geo.pins=pins.map(el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2-sk.left,y:r.top+r.height/2-sk.top}});
  geo.fallback=FALLBACK_ANCH.map(([fx,fy])=>({x:sp.left+sp.width*fx-sk.left,y:sp.top+sp.height*fy-sk.top}));
  if(GL)GL.resize(Math.max(geo.heroH,geo.spotH));
}
measure();
addEventListener('resize',measure);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
if('ResizeObserver' in window){const ro=new ResizeObserver(()=>measure());[stage,spotHero,spotStory].forEach(el=>ro.observe(el))}

let wasVisible=false, storySeen=false;
const heroEl=$('.hero');
// Passage du hero à l'histoire : au lieu de suivre le scroll pixel par pixel (ce qui saccade sur mobile,
// où la page défile sans attendre le JavaScript), Pépin bondit vers l'histoire en 0,9 s quand on passe un seuil.
// Deux seuils différents évitent les allers-retours si l'on s'arrête juste dessus.
const HOP=.9;
let mode=-1, tB=0, tFrom=0, tStart=0;
// Compteur de diagnostic, visible seulement avec ?fps dans l'adresse : images par seconde, palier de qualité, résolution.
const fpsBox=/[?&]fps/.test(location.search)?document.body.appendChild(Object.assign(document.createElement('div'),{style:'position:fixed;left:8px;bottom:8px;z-index:99;padding:6px 10px;border-radius:10px;background:#000c;color:#fff;font:600 13px/1.3 system-ui;pointer-events:none'})):null;
let fpsN=0, fpsT=0;
function loop(now){
  requestAnimationFrame(loop);
  if(fpsBox){fpsN++;if(!fpsT)fpsT=now;if(now-fpsT>=1000){const q=GL?GL.stats():null;fpsBox.textContent=Math.round(fpsN*1000/(now-fpsT))+' i/s'+(q?' · palier '+q.lvl+' · rendu ×'+q.pr:' · 3D non chargée');fpsN=0;fpsT=now}}
  // 1. Lecture : une seule mesure par image, avant toute écriture, pour ne jamais forcer un recalcul de la mise en page.
  const H=innerHeight, st=story.getBoundingClientRect();
  const stageVisible=st.bottom>0;
  const want=st.top<H*.5?1:st.top>H*.62?0:Math.max(mode,0);
  const p=clamp(-st.top/Math.max(1,st.height-H),0,1);
  const slide=clamp(-st.top,0,Math.max(0,st.height-geo.stickyH)); // de combien le bloc collant a glissé dans l'histoire
  // 2. Animation et écriture
  const reset=!wasVisible||jumped;
  if(mode<0||(reset&&stageVisible)){mode=want;tB=want;tStart=0;heroEl.classList.toggle('flown',want===1)}
  else if(want!==mode){mode=want;tFrom=tB;tStart=now;heroEl.classList.toggle('flown',want===1)}
  if(tStart){const k=RM?1:clamp((now-tStart)/1000/HOP,0,1);tB=lerp(tFrom,mode,easeInOut(k));if(k>=1)tStart=0}
  const b=tB;
  let res=null;
  if(GL){
    GL.setVisible(stageVisible);
    if(stageVisible&&document.visibilityState!=='hidden'){
      res=GL.frame(now,{hero:{x:geo.heroX,y:geo.heroY-slide,h:geo.heroH},story:{x:geo.spotX,y:geo.spotY,h:geo.spotH},b,p,reset});
      jumped=false;
    }
  }
  wasVisible=stageVisible;
  if(st.top<H&&st.bottom>0) updateStory(p,res&&res.anchors,b);
  if(p>.97&&!storySeen){storySeen=true;track('Histoire vue en entier')}
}
function updateStory(p,anchors,b){
  // Les traits ne relient Pépin aux bulles qu'une fois qu'il est arrivé dans l'histoire.
  const lk=clamp((b-.8)/.2,0,1);
  const N=pins.length, idx=Math.min(N-1,Math.floor(p*N*.9999));
  if(idx!==curIdx){
    curIdx=idx;
    items.forEach((el,i)=>el.classList.toggle('on',i===idx));
    pins.forEach((el,i)=>el.classList.toggle('active',i===idx));
  }
  bars.forEach((el,i)=>{const f=Math.round(clamp(p*N-i,0,1)*200)/200;if(el._f!==f){el._f=f;el.style.setProperty('--f',f)}});
  pins.forEach((el,i)=>{
    const on=p>=i/N-.03||i===0;
    if(el._on!==on){el._on=on;el.classList.toggle('on',on)}
    const L=lineEls[i], a=anchors?anchors[i]:geo.fallback[i], pc=geo.pins[i];
    if(!a||!pc)return;
    const op=(on&&a.front!==false)?Math.round((i===idx?1:.45)*lk*100)/100:0;
    if(L.op!==op){L.op=op;L.g.style.opacity=op}
    if(!op)return; // trait invisible : inutile de le redessiner
    const ax=Math.round(a.x*2)/2, ay=Math.round(a.y*2)/2;
    if(ax===L.ax&&ay===L.ay&&pc.x===L.px&&pc.y===L.py)return;
    L.ax=ax;L.ay=ay;L.px=pc.x;L.py=pc.y;
    const px=pc.x.toFixed(1), py=pc.y.toFixed(1);
    L.p.setAttribute('d',`M${px} ${py} Q ${((pc.x+ax)/2).toFixed(1)} ${py} ${ax} ${ay}`);
    L.r.setAttribute('cx',ax);L.r.setAttribute('cy',ay);
    L.d.setAttribute('cx',ax);L.d.setAttribute('cy',ay);
  });
}
requestAnimationFrame(loop);

/* ---------- Démo du mode cuisine ---------- */
// La recette du cookie géant, d'après la fiche de l'équipe (Notion > Landing page).
const STEPS=[
  {big:'180 g',kid:'Aide à peser les ingrédients&nbsp;: 180 g de sucre roux, puis 180 g de farine.',geste:'peser',parent:'Préchauffer le four à 180 °C et tapisser le moule de papier cuisson.',feu:true},
  {big:'Crémeux',kid:'Mélange le beurre mou et le sucre jusqu’à ce que ce soit bien crémeux.',geste:'mélanger',parent:'Casser l’œuf dans un bol, puis l’ajouter avec la vanille.',feu:false},
  {big:'150 g',kid:'Ajoute la farine et la levure, puis les pépites de chocolat. Répartis la pâte dans le moule.',geste:'incorporer',parent:'Aider à étaler la pâte bien régulièrement.',feu:false},
  {big:'25 min',kid:'Le cookie cuit&nbsp;! Pendant ce temps, prépare les petites assiettes.',geste:'mettre la table',parent:'Enfourner 25 min à 180 °C, puis laisser tiédir avant de découper.',feu:true,timer:true}
];
let step=0;
const tsScreen=$('#tabScreen'), tsKid=$('#tsKid'), voiceBtn=$('#tsVoice');
function renderStep(){
  const s=STEPS[step];
  $('#tsStep').textContent=`Étape ${step+1} sur ${STEPS.length}`;
  $('#tsBar').style.width=((step+1)/STEPS.length*100)+'%';
  $('#tsBig').textContent=s.big;
  $('#tsKidText').innerHTML=s.kid;
  $('#tsParent').textContent=s.parent;
  $('#tsFeu').hidden=!s.feu;
  const g=$('#tsGeste');g.hidden=!s.geste;if(s.geste)g.querySelector('span').innerHTML='Geste&nbsp;: '+s.geste;
  tsKid.classList.toggle('timer',!!s.timer);
  $$('#tsDots i').forEach((d,i)=>d.classList.toggle('on',i===step));
  $('#tsPrev').disabled=step===0;$('#tsPrev').style.opacity=step===0?.35:1;
  $('#tsNext').firstChild.textContent=step===STEPS.length-1?'Terminer ':'Étape suivante ';
  if(!RM&&tsKid.animate) tsKid.animate([{transform:'translateY(8px)',opacity:.4},{transform:'none',opacity:1}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
  stopVoice();
}
$('#tsNext').addEventListener('click',()=>{if(step<STEPS.length-1){step++;renderStep()}else{tsScreen.classList.add('is-done');$('#tsStep').textContent='Recette terminée';$('#tsBar').style.width='100%';stopVoice();track('Démo : terminée')}});
$('#tsPrev').addEventListener('click',()=>{if(step>0){step--;renderStep()}});
$('#tsRestart').addEventListener('click',()=>{step=0;tsScreen.classList.remove('is-done');$$('#badges button').forEach(b=>b.setAttribute('aria-pressed','false'));renderStep()});
$$('#badges button').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true')));
// La voix de Pépin : des consignes pré-enregistrées avec une voix de synthèse neuronale (outils/generer-voix.py),
// chargées seulement au premier appui. Si un fichier ne se lit pas, on se rabat sur la plus naturelle des voix de l'appareil.
const voice=new Audio();voice.preload='none';
let voiceBtnCur=null;
function setVoiceBtn(btn,on){if(!btn)return;btn.classList.toggle('speaking',on);btn.querySelector('span').textContent=on?'Pépin parle…':btn.dataset.label}
function stopVoice(){voice.pause();try{speechSynthesis.cancel()}catch(e){}setVoiceBtn(voiceBtnCur,false);voiceBtnCur=null}
voice.addEventListener('ended',stopVoice);
function bestFrenchVoice(){
  const vs=('speechSynthesis' in window)?speechSynthesis.getVoices().filter(v=>/^fr/i.test(v.lang)):[];
  const score=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?4:0)+(/denise|audrey|amélie|amelie|google/i.test(v.name)?2:0)+(/fr-FR/i.test(v.lang)?1:0);
  return vs.sort((a,b)=>score(b)-score(a))[0]||null;
}
function speakFallback(text,btn){
  if(!('speechSynthesis' in window)){btn.querySelector('span').textContent='Voix indisponible ici';return}
  const u=new SpeechSynthesisUtterance(text);u.lang='fr-FR';u.rate=.92;u.pitch=1.08;
  const v=bestFrenchVoice();if(v)u.voice=v;
  u.onend=u.onerror=stopVoice;speechSynthesis.speak(u);
}
function playVoice(btn,clip,text){
  btn.classList.remove('hint');
  if(voiceBtnCur===btn){stopVoice();return}
  stopVoice();voiceBtnCur=btn;setVoiceBtn(btn,true);
  voice.src='assets/audio/'+clip+'.mp3';
  voice.play().then(()=>track('Démo : écouter',{etape:clip})).catch(()=>{if(voiceBtnCur===btn)speakFallback(text,btn)});
}
voiceBtn.dataset.label='Écouter';voiceBtn.classList.add('hint');
voiceBtn.addEventListener('click',()=>playVoice(voiceBtn,'etape-'+(step+1),$('#tsKidText').textContent));
const bravoBtn=$('#tsBravo');bravoBtn.dataset.label='Écouter Pépin';
bravoBtn.addEventListener('click',()=>playVoice(bravoBtn,'bravo','Bravo ! Le cookie géant est prêt.'));
renderStep();

/* ---------- Liste d'attente ---------- */
const form=$('#joinForm'), email=$('#email'), emailErr=$('#emailErr');
$$('input[name="role"]').forEach(r=>r.addEventListener('change',syncRole));
function syncRole(){const pro=$('#role-pro').checked;$('#ageField').hidden=pro;$('#orgField').hidden=!pro}
$$('[data-role="pro"]').forEach(a=>a.addEventListener('click',()=>{$('#role-pro').checked=true;syncRole()}));
email.addEventListener('input',()=>{if(email.getAttribute('aria-invalid')==='true'&&valid(email.value)){email.removeAttribute('aria-invalid');emailErr.hidden=true}});
function valid(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())}
// Envoie l'inscription à la fonction du site, qui la transmet par e-mail à l'équipe.
// Renvoie true si c'est parti (ou en mode démo, sans adresse réglée).
async function sendWaitlist(d){
  const url=CONFIG.waitlist.endpoint;
  if(!url){console.warn('Popote Duo : liste d’attente en mode démo (CONFIG.waitlist), rien n’a été envoyé.');return true}
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
  return r.ok;
}
const sendBtn=form.querySelector('button[type="submit"]'), sendErr=$('#sendErr');
form.addEventListener('submit',async e=>{
  e.preventDefault();
  sendErr.hidden=true;
  if(!valid(email.value)){email.setAttribute('aria-invalid','true');emailErr.hidden=false;email.focus();return}
  const fd=new FormData(form), pro=fd.get('role')==='pro';
  const d={email:email.value.trim(),role:pro?'pro':'parent',ages:pro?'':fd.getAll('age').join(', '),org:pro?(fd.get('org')||'').trim().slice(0,120):'',beta:$('#beta').checked};
  if(!fd.get('bot-field')){ // champ piège : rempli seulement par les robots
    sendBtn.disabled=true;sendBtn.firstChild.textContent='Envoi… ';
    let ok=false;
    try{ok=await sendWaitlist(d)}catch(err){ok=false}
    sendBtn.disabled=false;sendBtn.firstChild.textContent='M’inscrire';
    if(!ok){sendErr.hidden=false;return}
    track('Inscription liste d’attente',{profil:d.role,beta:d.beta?'oui':'non'});
  }
  $('#joinOkText').textContent=pro
    ? 'Votre structure est sur la liste. On vous recontacte dès que l’offre pour les structures est prête.'
    : ($('#beta').checked?'Vous êtes sur la liste. On vous écrit dès que la bêta ouvre, en février.':'Vous êtes sur la liste. On vous écrit au lancement de l’appli.');
  form.hidden=true;$('#joinOk').hidden=false;
  $('#formCard .peek').hidden=true;
});
$('#joinAgain').addEventListener('click',()=>{form.reset();syncRole();form.hidden=false;$('#joinOk').hidden=true;$('#formCard .peek').hidden=false;email.focus()});
})();
