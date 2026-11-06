/* Popote Duo · landing page : Popote animée, histoire au scroll, démo du mode cuisine, liste d'attente. */
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
// Racine du site, déduite de l'adresse de ce script : la page anglaise (en/) trouve ainsi les mêmes fichiers.
const BASE=document.currentScript?new URL('../../',document.currentScript.src).href:'';
const THREE_SRC=BASE+'assets/js/three.min.js';

/* ---------- Langue : la page française (/) ou anglaise (/en) ---------- */
const LANG=document.documentElement.lang.indexOf('en')===0?'en':'fr';
const T={
  fr:{step:(i,n)=>`Étape ${i} sur ${n}`,geste:'Geste&nbsp;: ',next:'Étape suivante ',finish:'Terminer ',done:'Recette terminée',speaking:'Popote parle…',listen:'Écouter',listenPopote:'Écouter Popote',
    noVoice:'Voix indisponible ici',bravo:'Bravo ! Le cookie géant est prêt.',sending:'Envoi… ',send:'M’inscrire',
    okPro:'Votre structure est sur la liste. On vous recontacte dès que l’offre pour les structures est prête.',
    okBeta:'Vous êtes sur la liste. On vous écrit dès que la bêta ouvre, en février.',okLaunch:'Vous êtes sur la liste. On vous écrit au lancement de l’appli.',
    hello:'Coucou, moi c’est Popote !',hop:'Hop !',wee:'Wiii !',giggle:'Hihi, ça chatouille !',boing:'Boing !'},
  en:{step:(i,n)=>`Step ${i} of ${n}`,geste:'Skill: ',next:'Next step ',finish:'Finish ',done:'Recipe complete',speaking:'Popote is talking…',listen:'Listen',listenPopote:'Listen to Popote',
    noVoice:'Voice not available here',bravo:'Well done! The giant cookie is ready.',sending:'Sending… ',send:'Sign me up',
    okPro:'Your organisation is on the list. We’ll get back to you as soon as the offer for organisations is ready.',
    okBeta:'You’re on the list. We’ll email you as soon as the beta opens in February.',okLaunch:'You’re on the list. We’ll email you when the app launches.',
    hello:'Hi, I’m Popote!',hop:'Hop!',wee:'Wheee!',giggle:'Hee hee, that tickles!',boing:'Boing!'}
}[LANG];
// Sélecteur FR / EN : le choix est retenu et passe avant la langue du navigateur (voir le script en tête de page).
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-lang]');if(!a)return;
  try{localStorage.setItem('popote-lang',a.dataset.lang)}catch(_){}
  e.preventDefault();location.href=a.href+location.hash;
});

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

/* ---------- Popote ---------- */
// Popote est un dessin SVG posé sur sa carte menthe (index.html, outils/dessiner-popote.py).
// La carte vit dans le bloc collant de l'histoire : elle défile avec la page comme le texte, et le script la place
// seulement sur le hero ou sur l'histoire. Le relief vient de la carte, qui s'incline en 3D (CSS) vers ce que
// Popote regarde, avec Popote qui flotte au-dessus, et du visage, des graines et des feuilles qui se décalent
// chacun à leur profondeur. Chaque image, le script change seulement les attributs qui ont bougé.
function initMascotte(){
  const el=$('#mascotte');
  if(!el) return null;
  const q=c=>el.querySelector(c);
  const P={corps:q('.m-corps'),ombre:q('.m-ombre'),brasG:q('.m-bras-g'),brasD:q('.m-bras-d'),visage:q('.m-visage'),
    graines:q('.m-graines'),reflet:q('.m-reflet'),yeux:q('.m-yeux'),joie:q('.m-joie'),
    bouche:q('.m-bouche'),boucheJoie:q('.m-bouche-joie'),boucheO:q('.m-bouche-o'),couronne:q('.m-couronne'),bulle:q('.m-bulle')};
  // Taille de la carte, en fraction de la hauteur de la place réservée à Popote (hero ou histoire) :
  // plus grande sur ordinateur, où le hero a de la place autour d'elle.
  const CARD=()=>innerWidth>=900?.7:.62, CARD_H=1.083;
  // box : la plus grande de ces hauteurs (hero ou histoire), en pixels. La carte est dessinée à cette taille, puis seulement réduite.
  let box=1, W=1, H=1, tf='', shown=false;
  function size(h){
    const w=Math.round(Math.max(1,h)*CARD()), hh=Math.round(w*CARD_H);
    if(w===W&&hh===H)return;
    box=Math.max(1,h);W=w;H=hh;
    el.style.width=W+'px';el.style.height=H+'px';tf='';
  }

  // Le pointeur, en pixels dans la fenêtre. Sur écran tactile, il ne bouge qu'au toucher : Popote regarde alors seule autour d'elle.
  const ptr={x:0,y:0,at:-1e9,touch:true};
  addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.at=performance.now();ptr.touch=e.pointerType==='touch'},{passive:true});

  // Tirer Popote : elle s'étire, puis revient comme un ressort. Sur mobile, seulement à l'horizontale :
  // un glissement vertical fait toujours défiler la page (touch-action: pan-y dans le CSS).
  const pull={x:0,y:0,vx:0,vy:0,tx:0,ty:0};
  let drag=null, noClick=false, unit=1;
  const lim=v=>v/(1+Math.abs(v)/380);
  [$('#spotHero'),$('#spotStory')].forEach(sp=>{
    sp.addEventListener('pointerdown',e=>{
      if(e.button>0||e.target.closest('.pin'))return;
      drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false,sp};
      try{sp.setPointerCapture(e.pointerId)}catch(_){}
    });
    sp.addEventListener('pointermove',e=>{
      if(!drag||e.pointerId!==drag.id)return;
      const dx=e.clientX-drag.x0, dy=e.pointerType==='touch'?0:e.clientY-drag.y0;
      if(!drag.moved&&Math.hypot(dx,dy)>8){drag.moved=true;sp.classList.add('grab')}
      if(drag.moved){pull.tx=dx/unit;pull.ty=dy/unit}
    });
    const end=e=>{
      if(!drag||e.pointerId!==drag.id)return;
      if(drag.moved){
        noClick=true;setTimeout(()=>{noClick=false});
        if(Math.hypot(pull.x,pull.y)>90)react('boing');
      }
      sp.classList.remove('grab');pull.tx=pull.ty=0;drag=null;
    };
    sp.addEventListener('pointerup',end);sp.addEventListener('pointercancel',end);
    sp.addEventListener('click',e=>{if(!e.target.closest('.pin')&&!noClick)react()});
  });

  // Toucher Popote : une réaction différente à chaque fois, avec une bulle.
  let jump=0, spin=0, giggle=0, boing=0, nReact=0, said=false, bulleT=0;
  function say(txt){
    P.bulle.textContent=txt;P.bulle.classList.add('on');
    clearTimeout(bulleT);bulleT=setTimeout(()=>P.bulle.classList.remove('on'),1900);
  }
  function react(kind){
    if(kind==='boing'){boing=1;say(T.boing);return}
    const k=nReact++%3;
    if(k===0){jump=1;say(said?T.hop:T.hello);said=true}
    else if(k===1){spin=1;say(T.wee)}
    else{giggle=1;say(T.giggle)}
    track('Popote touchée');
  }

  let intro=0, blinkAt=1.5, blink=0, waveAt=1.2, wave=0, wasNear=false, last=performance.now(), pS=null, expr=-1;
  const look={x:0,y:0};
  const anchors=[{x:0,y:0},{x:0,y:0}], res={p:0,anchors};
  const set=(n,v)=>{if(n._t!==v){n._t=v;n.setAttribute('transform',v)}};
  const css=(k,v)=>{if(el['_'+k]!==v){el['_'+k]=v;el.style.setProperty(k,v)}};
  const show=(n,v)=>n.setAttribute('visibility',v?'visible':'hidden');
  const r=v=>Math.round(v*10)/10, r3=v=>Math.round(v*1000)/1000;
  const M=RM?0:1; // avec « Réduire les animations », Popote change seulement d'expression

  return {
    resize:size,
    // st : positions de Popote (hero, histoire) dans le bloc collant, passage de l'un à l'autre (b), scroll de l'histoire (p),
    // position du bloc collant dans la fenêtre (top, left) et bulle active de l'histoire (idx)
    frame(now,st){
      const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
      intro=Math.min(1,intro+dt/1.1);
      const ib=RM?1:easeOutBack(intro);

      // b vient d'une animation dans le temps (voir la boucle) : il n'est jamais lié directement au scroll.
      // Seul le léger balancement dans l'histoire suit le scroll, amorti.
      if(st.reset||pS===null)pS=st.p;
      pS+=(st.p-pS)*(RM?1:1-Math.exp(-dt*6));
      const b=st.b;

      // La carte se place sur le hero ou sur l'histoire et change seulement d'échelle,
      // avec un petit bond et une bascule pendant le passage de l'un à l'autre.
      const hop=M*Math.sin(b*Math.PI);
      const s=lerp(st.hero.h,st.story.h,b)/box*ib;
      const x=lerp(st.hero.x,st.story.x,b), y=lerp(st.hero.y,st.story.y,b)-hop*H*s*.2;
      unit=Math.max(.01,W*s/720); // pixels par unité du dessin
      const cx=st.left+x, cy=st.top+y; // centre de la carte dans la fenêtre

      // Où regarde Popote (de -1 à 1) : vers où on la tire ; sinon la souris si elle a bougé il y a moins de 4 s ;
      // sinon, dans l'histoire, la bulle active ; sinon son regard se promène.
      const fresh=!ptr.touch&&now-ptr.at<4000;
      let gx, gy;
      if(drag&&drag.moved){gx=clamp(pull.tx/220,-1,1);gy=clamp(pull.ty/220,-1,1)}
      else if(fresh){const R=Math.max(180,W*s);gx=(ptr.x-cx)/R;gy=(ptr.y-cy)/R;const m=Math.hypot(gx,gy);if(m>1){gx/=m;gy/=m}}
      else if(b>.8){gx=st.idx===0?-.8:.8;gy=st.idx===0?-.25:.25}
      else{gx=Math.sin(t*.43)*.55+Math.sin(t*.17+1)*.3;gy=Math.sin(t*.29+2)*.3}
      const lk=1-Math.exp(-dt*(fresh||drag?8:2.5));
      look.x+=(gx*M-look.x)*lk;look.y+=(gy*M-look.y)*lk;
      const lx=look.x, ly=look.y;

      // La carte s'incline vers ce qu'elle regarde ; un reflet glisse dessus.
      const rot=r(-hop*7+Math.sin(pS*Math.PI*2)*2*b*M), ns=r3(s);
      const nt=`translate3d(${Math.round((x-W/2)*4)/4}px,${Math.round((y-H/2)*4)/4}px,0) perspective(${W*3}px) rotateX(${r(-ly*11)}deg) rotateY(${r(lx*15)}deg) rotate(${rot}deg) scale3d(${ns},${ns},${ns})`;
      if(nt!==tf){tf=nt;el.style.transform=nt}
      css('--gx',Math.round(-lx*W*.3)+'px');css('--gy',Math.round(-ly*H*.3)+'px');
      css('--go',(Math.round(Math.hypot(lx,ly)*40)/100).toString());
      css('--m-s',ns.toString());

      // Le ressort quand on la tire (deux demi-pas : plus stable quand une image arrive en retard).
      const k=190, c=11;
      for(let i=0;i<2;i++){const h=dt/2;
        pull.vx+=(k*(lim(pull.tx)-pull.x)-c*pull.vx)*h;pull.x+=pull.vx*h;
        pull.vy+=(k*(lim(pull.ty)-pull.y)-c*pull.vy)*h;pull.y+=pull.vy*h;}
      if(RM){pull.x=lim(pull.tx);pull.y=lim(pull.ty);pull.vx=pull.vy=0}

      // Le corps : respiration, saut, pirouette, fou rire, étirement quand on le tire ; les pieds restent au sol.
      jump=Math.max(0,jump-dt*1.5);spin=Math.max(0,spin-dt*1.25);giggle=Math.max(0,giggle-dt/1.3);boing=Math.max(0,boing-dt*1.2);
      const jh=Math.sin(jump*Math.PI)*M, sh=Math.sin(spin*Math.PI)*M;
      const squash=1+Math.sin(jump*Math.PI*2)*.07*M, breath=Math.sin(t*2.1)*.014*M;
      const stretch=clamp(1-pull.y/700,.75,1.3);
      const flip=spin>0&&M?Math.cos((1-spin)*Math.PI*2):1; // pirouette : le dessin se retourne et revient
      const sy=squash*(1+breath)*stretch, sx=(1-breath*.5)/Math.sqrt(squash*stretch)*(1-Math.abs(lx)*.03)*flip;
      const lean=r(clamp(-Math.atan2(pull.x,520)*57.3,-32,32));
      const tilt=r((lx*3+Math.sin(t*1.1)*1.5+Math.sin(t*38)*7*giggle)*M);
      const yOff=r((Math.sin(t*1.7)*7-jh*130-sh*90-hop*30)*M);
      set(P.corps,`translate(${r(pull.x*.25)} ${yOff}) translate(336 620) rotate(${tilt}) skewX(${lean}) scale(${r3(sx)} ${r3(sy)}) translate(-336 -620)`);
      set(P.ombre,`translate(336 634.5) scale(${Math.round((1-jh*.45-sh*.35-hop*.2)*100)/100} 1) translate(-336 -634.5)`);

      // L'expression : surprise quand on la tire, joie après une réaction ou pendant le passage vers l'histoire.
      const surpris=!!(drag&&drag.moved);
      const joie=!surpris&&(jump>.02||spin>0||giggle>0||boing>0||b>.1&&b<.9);
      const ex=surpris?2:joie?1:0;
      if(ex!==expr){expr=ex;show(P.yeux,ex!==1);show(P.joie,ex===1);show(P.bouche,ex===0);show(P.boucheJoie,ex===1);show(P.boucheO,ex===2)}

      // Les bras : un salut quand la souris s'approche, et de temps en temps ; levés de joie ; agités de surprise.
      const near=fresh&&Math.hypot(ptr.x-cx,ptr.y-cy)<W*s*.8;
      if(!RM){
        if(near&&!wasNear&&wave<=0)wave=1;
        waveAt-=dt;if(waveAt<=0){if(wave<=0)wave=1;waveAt=5+Math.random()*4}
        wave=Math.max(0,wave-dt/1.6);
      }
      wasNear=near;
      const waving=Math.sin((1-wave)*Math.PI*5)*18*Math.sin(wave*Math.PI);
      const flail=surpris?Math.sin(t*16)*12:0;
      set(P.brasD,`rotate(${r(waving+(Math.sin(t*1.3)*3-(joie?12:0)-(surpris?20:0)+flail)*M)} 561 322)`);
      set(P.brasG,`rotate(${r((Math.sin(t*1.1+1)*4+(joie?78:0)+(surpris?45:0)-flail)*M)} 110 374)`);

      // Le relief : le visage se décale le plus, puis les feuilles et les graines ; le reflet glisse en sens inverse.
      set(P.visage,`translate(${r(lx*24)} ${r(ly*14)})`);
      set(P.graines,`translate(${r(lx*9)} ${r(ly*5)})`);
      set(P.reflet,`translate(${r(-lx*6)} ${r(-ly*4)})`);
      set(P.couronne,`rotate(${r(Math.sin(t*2.2)*2.5*M-lx*4-lean*.4)} 336 152) translate(${r(lx*8)} ${r(ly*3)})`);

      // Les yeux clignent.
      if(!RM){blinkAt-=dt;if(blinkAt<=0){blink=1;blinkAt=2.5+Math.random()*3}blink=Math.max(0,blink-dt*7)}
      set(P.yeux,`translate(0 284.5) scale(1 ${Math.round((1-Math.sin(blink*Math.PI)*.9)*100)/100}) translate(0 -284.5)`);

      // Points d'ancrage des traits de l'histoire : les bords de la carte, en pixels dans le bloc collant.
      const hw=W*s/2;
      anchors[0].x=x-hw;anchors[0].y=y-H*s*.04;
      anchors[1].x=x+hw;anchors[1].y=y+H*s*.08;
      res.p=pS;
      return res;
    },
    setVisible(v){if(v!==shown){shown=v;el.style.visibility=v?'visible':'hidden'}}
  };
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
/* ---- Modèles 3D des ingrédients ---- */
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

// Textures dessinées une fois : grain de peau et pores.
let TX=null;
function tex(){
  if(TX) return TX;
  const make=(w,h,draw,srgb)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
  const dots=(x,w,h,n,r,minR,maxR,color,minA,maxA,sx)=>{for(let i=0;i<n;i++){const cx=r()*w,cy=r()*h,rad=minR+r()*(maxR-minR),a=minA+r()*(maxA-minA);x.fillStyle=color.replace('A',a.toFixed(3));[cx-w,cx,cx+w].forEach(px=>{x.beginPath();x.ellipse(px,cy,rad*(sx||1),rad,0,0,7);x.fill()})}};
  TX={
    skin:make(512,512,(x,w,h)=>{const r=rnd(3);x.fillStyle='#808080';x.fillRect(0,0,w,h);
      for(let i=0;i<110;i++){x.fillStyle=r()<.5?'rgba(0,0,0,.05)':'rgba(255,255,255,.05)';x.fillRect(r()*w,0,1+r()*3,h)}
      dots(x,w,h,520,r,.5,1.5,'rgba(30,30,30,A)',.18,.42,2.4)}),
    pores:make(512,512,(x,w,h)=>{const r=rnd(5);x.fillStyle='#8a8a8a';x.fillRect(0,0,w,h);dots(x,w,h,4200,r,.6,1.6,'rgba(20,20,20,A)',.25,.55)})
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

const BUILD={
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

/* ---- Images des ingrédients ---- */
// Elles sont rendues une fois pour toutes à partir des modèles ci-dessus et servies en WebP
// (assets/img/ingredients). Pour les refaire : ouvrir la page avec ?rendus,
// puis enregistrer chaque image proposée.
function exportRenders(){
  const pose={tomate:['tomato',[.45,0,.15]],carotte:['carrot',[0,.3,-.62]],banane:['banana',[.35,.25,.12]],cookie:['cookie',[.78,0,-.12]]};
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

/* ---------- Démarrage ---------- */
// Popote est là dès le premier affichage. Three.js (600 Ko) ne se charge que pour refaire les images des ingrédients (?rendus).
const mascotte=initMascotte();
if(/[?&]rendus/.test(location.search)){const s=document.createElement('script');s.src=THREE_SRC;s.onload=exportRenders;document.head.appendChild(s)}
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

// Positions mises en cache, relatives au bloc collant de l'histoire (où vit la carte de Popote).
// Elles ne changent qu'avec la mise en page : on les recalcule au redimensionnement, pas à chaque image.
const geo={heroX:0,heroY:0,heroH:1,spotX:0,spotY:0,spotH:1,stickyH:1,skLeft:0,pins:[],fallback:[]};
function measure(){
  const st=story.getBoundingClientRect(), sk=sticky.getBoundingClientRect(), hr=spotHero.getBoundingClientRect(), sp=spotStory.getBoundingClientRect();
  // Le hero est mesuré par rapport au haut de l'histoire : c'est là que se trouve le bloc collant tant qu'il n'a pas glissé.
  geo.heroX=hr.left+hr.width/2-sk.left;geo.heroY=hr.top+hr.height/2-st.top;geo.heroH=hr.height;
  geo.spotX=sp.left+sp.width/2-sk.left;geo.spotY=sp.top+sp.height/2-sk.top;geo.spotH=sp.height;
  geo.stickyH=sk.height;geo.skLeft=sk.left;
  // Le centre d'une bulle ne bouge pas quand elle grandit (elle est centrée sur son point) : une mesure suffit.
  geo.pins=pins.map(el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2-sk.left,y:r.top+r.height/2-sk.top}});
  geo.fallback=FALLBACK_ANCH.map(([fx,fy])=>({x:sp.left+sp.width*fx-sk.left,y:sp.top+sp.height*fy-sk.top}));
  if(mascotte)mascotte.resize(Math.max(geo.heroH,geo.spotH));
}
measure();
addEventListener('resize',measure);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
if('ResizeObserver' in window){const ro=new ResizeObserver(()=>measure());[stage,spotHero,spotStory].forEach(el=>ro.observe(el))}

let wasVisible=false, storySeen=false;
const heroEl=$('.hero');
// Passage du hero à l'histoire : au lieu de suivre le scroll pixel par pixel (ce qui saccade sur mobile,
// où la page défile sans attendre le JavaScript), Popote bondit vers l'histoire en 0,9 s quand on passe un seuil.
// Deux seuils différents évitent les allers-retours si l'on s'arrête juste dessus.
const HOP=.9;
let mode=-1, tB=0, tFrom=0, tStart=0;
// Compteur de diagnostic, visible seulement avec ?fps dans l'adresse : images par seconde.
const fpsBox=/[?&]fps/.test(location.search)?document.body.appendChild(Object.assign(document.createElement('div'),{style:'position:fixed;left:8px;bottom:8px;z-index:99;padding:6px 10px;border-radius:10px;background:#000c;color:#fff;font:600 13px/1.3 system-ui;pointer-events:none'})):null;
let fpsN=0, fpsT=0;
function loop(now){
  requestAnimationFrame(loop);
  if(fpsBox){fpsN++;if(!fpsT)fpsT=now;if(now-fpsT>=1000){fpsBox.textContent=Math.round(fpsN*1000/(now-fpsT))+' i/s';fpsN=0;fpsT=now}}
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
  if(mascotte){
    mascotte.setVisible(stageVisible);
    if(stageVisible&&document.visibilityState!=='hidden'){
      res=mascotte.frame(now,{hero:{x:geo.heroX,y:geo.heroY-slide,h:geo.heroH},story:{x:geo.spotX,y:geo.spotY,h:geo.spotH},b,p,reset,
        top:st.top+slide,left:geo.skLeft,idx:Math.min(pins.length-1,Math.floor(p*pins.length*.9999))});
      jumped=false;
    }
  }
  wasVisible=stageVisible;
  if(st.top<H&&st.bottom>0) updateStory(p,res&&res.anchors,b);
  if(p>.97&&!storySeen){storySeen=true;track('Histoire vue en entier')}
}
function updateStory(p,anchors,b){
  // Les traits ne relient Popote aux bulles qu'une fois qu'elle est arrivée dans l'histoire.
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
const STEPS=LANG==='en'?[
  {big:'180 g',kid:'Help weigh the ingredients: 180 g of brown sugar, then 180 g of flour.',geste:'weighing',parent:'Preheat the oven to 180 °C and line the tin with baking paper.',feu:true},
  {big:'Creamy',kid:'Mix the soft butter and the sugar until it’s nice and creamy.',geste:'mixing',parent:'Crack the egg into a bowl, then add it with the vanilla.',feu:false},
  {big:'150 g',kid:'Add the flour and baking powder, then the chocolate chips. Spread the dough in the tin.',geste:'folding in',parent:'Help spread the dough out evenly.',feu:false},
  {big:'25 min',kid:'The cookie is baking! Meanwhile, set out the little plates.',geste:'setting the table',parent:'Bake for 25 min at 180 °C, then let it cool before cutting.',feu:true,timer:true}
]:[
  {big:'180 g',kid:'Aide à peser les ingrédients&nbsp;: 180 g de sucre roux, puis 180 g de farine.',geste:'peser',parent:'Préchauffer le four à 180 °C et tapisser le moule de papier cuisson.',feu:true},
  {big:'Crémeux',kid:'Mélange le beurre mou et le sucre jusqu’à ce que ce soit bien crémeux.',geste:'mélanger',parent:'Casser l’œuf dans un bol, puis l’ajouter avec la vanille.',feu:false},
  {big:'150 g',kid:'Ajoute la farine et la levure, puis les pépites de chocolat. Répartis la pâte dans le moule.',geste:'incorporer',parent:'Aider à étaler la pâte bien régulièrement.',feu:false},
  {big:'25 min',kid:'Le cookie cuit&nbsp;! Pendant ce temps, prépare les petites assiettes.',geste:'mettre la table',parent:'Enfourner 25 min à 180 °C, puis laisser tiédir avant de découper.',feu:true,timer:true}
];
let step=0;
const tsScreen=$('#tabScreen'), tsKid=$('#tsKid'), voiceBtn=$('#tsVoice');
function renderStep(){
  const s=STEPS[step];
  $('#tsStep').textContent=T.step(step+1,STEPS.length);
  $('#tsBar').style.width=((step+1)/STEPS.length*100)+'%';
  $('#tsBig').textContent=s.big;
  $('#tsKidText').innerHTML=s.kid;
  $('#tsParent').textContent=s.parent;
  $('#tsFeu').hidden=!s.feu;
  const g=$('#tsGeste');g.hidden=!s.geste;if(s.geste)g.querySelector('span').innerHTML=T.geste+s.geste;
  tsKid.classList.toggle('timer',!!s.timer);
  $$('#tsDots i').forEach((d,i)=>d.classList.toggle('on',i===step));
  $('#tsPrev').disabled=step===0;$('#tsPrev').style.opacity=step===0?.35:1;
  $('#tsNext').firstChild.textContent=step===STEPS.length-1?T.finish:T.next;
  if(!RM&&tsKid.animate) tsKid.animate([{transform:'translateY(8px)',opacity:.4},{transform:'none',opacity:1}],{duration:380,easing:'cubic-bezier(.2,.8,.2,1)'});
  stopVoice();
}
$('#tsNext').addEventListener('click',()=>{if(step<STEPS.length-1){step++;renderStep()}else{tsScreen.classList.add('is-done');$('#tsStep').textContent=T.done;$('#tsBar').style.width='100%';stopVoice();track('Démo : terminée')}});
$('#tsPrev').addEventListener('click',()=>{if(step>0){step--;renderStep()}});
$('#tsRestart').addEventListener('click',()=>{step=0;tsScreen.classList.remove('is-done');$$('#badges button').forEach(b=>b.setAttribute('aria-pressed','false'));renderStep()});
$$('#badges button').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true')));
// La voix de Popote : des consignes pré-enregistrées avec une voix de synthèse neuronale (outils/generer-voix.py),
// chargées seulement au premier appui. Si un fichier ne se lit pas, on se rabat sur la plus naturelle des voix de l'appareil.
const voice=new Audio();voice.preload='none';
let voiceBtnCur=null;
function setVoiceBtn(btn,on){if(!btn)return;btn.classList.toggle('speaking',on);btn.querySelector('span').textContent=on?T.speaking:btn.dataset.label}
function stopVoice(){voice.pause();try{speechSynthesis.cancel()}catch(e){}setVoiceBtn(voiceBtnCur,false);voiceBtnCur=null}
voice.addEventListener('ended',stopVoice);
function bestFrenchVoice(){
  const vs=('speechSynthesis' in window)?speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().indexOf(LANG)===0):[];
  const score=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?4:0)+(/denise|audrey|amélie|amelie|samantha|google/i.test(v.name)?2:0)+(/fr-FR|en-US|en-GB/i.test(v.lang)?1:0);
  return vs.sort((a,b)=>score(b)-score(a))[0]||null;
}
function speakFallback(text,btn){
  if(!('speechSynthesis' in window)){btn.querySelector('span').textContent=T.noVoice;return}
  const u=new SpeechSynthesisUtterance(text);u.lang=LANG==='en'?'en-US':'fr-FR';u.rate=.92;u.pitch=1.08;
  const v=bestFrenchVoice();if(v)u.voice=v;
  u.onend=u.onerror=stopVoice;speechSynthesis.speak(u);
}
function playVoice(btn,clip,text){
  btn.classList.remove('hint');
  if(voiceBtnCur===btn){stopVoice();return}
  stopVoice();voiceBtnCur=btn;setVoiceBtn(btn,true);
  voice.src=BASE+'assets/audio/'+(LANG==='en'?'en/':'')+clip+'.mp3';
  voice.play().then(()=>track('Démo : écouter',{etape:clip})).catch(()=>{if(voiceBtnCur===btn)speakFallback(text,btn)});
}
voiceBtn.dataset.label=T.listen;voiceBtn.classList.add('hint');
voiceBtn.addEventListener('click',()=>playVoice(voiceBtn,'etape-'+(step+1),$('#tsKidText').textContent));
const bravoBtn=$('#tsBravo');bravoBtn.dataset.label=T.listenPopote;
bravoBtn.addEventListener('click',()=>playVoice(bravoBtn,'bravo',T.bravo));
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
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...d,lang:LANG})});
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
    sendBtn.disabled=true;sendBtn.firstChild.textContent=T.sending;
    let ok=false;
    try{ok=await sendWaitlist(d)}catch(err){ok=false}
    sendBtn.disabled=false;sendBtn.firstChild.textContent=T.send;
    if(!ok){sendErr.hidden=false;return}
    track('Inscription liste d’attente',{profil:d.role,beta:d.beta?'oui':'non'});
  }
  $('#joinOkText').textContent=pro
    ? T.okPro
    : ($('#beta').checked?T.okBeta:T.okLaunch);
  form.hidden=true;$('#joinOk').hidden=false;
  $('#formCard .peek').hidden=true;
});
$('#joinAgain').addEventListener('click',()=>{form.reset();syncRole();form.hidden=false;$('#joinOk').hidden=true;$('#formCard .peek').hidden=false;email.focus()});
})();
