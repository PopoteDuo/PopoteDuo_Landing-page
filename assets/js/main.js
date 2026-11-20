/* Popote Duo · landing page : Gari animée, repères de défilement, démo du mode cuisine, liste d'attente. */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
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

/* ---------- Langue : la page française (/) ou anglaise (/en) ---------- */
const LANG=document.documentElement.lang.indexOf('en')===0?'en':'fr';
const T={
  fr:{step:(i,n)=>`Étape ${i} sur ${n}`,geste:'Geste&nbsp;: ',next:'Étape suivante',finish:'Terminer',done:'Recette terminée',speaking:'Gari parle…',listen:'Écouter',listenGari:'Écouter Gari',
    noVoice:'Voix indisponible ici',bravo:'Bravo ! Le cookie géant est prêt.',sending:'Envoi…',send:'M’inscrire',
    okPro:'Votre structure est sur la liste. On vous recontacte dès que l’offre pour les structures est prête.',
    okBeta:'Vous êtes sur la liste. On vous écrit dès que la bêta ouvre, en février.',okLaunch:'Vous êtes sur la liste. On vous écrit au lancement de l’appli.',
    quickBad:'Ajoutez une adresse e-mail valide, par exemple prenom@exemple.fr.',quickOk:'C’est noté : plus que deux questions, juste en dessous.',
    hello:'Coucou, moi c’est Gari !',hop:'Hop !',giggle:'Hihi, ça chatouille !',boing:'Boing !'},
  en:{step:(i,n)=>`Step ${i} of ${n}`,geste:'Skill: ',next:'Next step',finish:'Finish',done:'Recipe complete',speaking:'Gari is talking…',listen:'Listen',listenGari:'Listen to Gari',
    noVoice:'Voice not available here',bravo:'Well done! The giant cookie is ready.',sending:'Sending…',send:'Sign me up',
    okPro:'Your organisation is on the list. We’ll get back to you as soon as the offer for organisations is ready.',
    okBeta:'You’re on the list. We’ll email you as soon as the beta opens in February.',okLaunch:'You’re on the list. We’ll email you when the app launches.',
    quickBad:'Add a valid email address, for example name@example.com.',quickOk:'Got it: just two more questions, right below.',
    hello:'Hi, I’m Gari!',hop:'Hop!',giggle:'Hee hee, that tickles!',boing:'Boing!'}
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
addEventListener('load',()=>setTimeout(loadAnalytics,1200),{once:true});

/* ---------- Gari ---------- */
// Gari est le dessin « pop » de l'appli (outils/dessiner-gari.py), devant son soleil.
// Le relief vient du soleil, qui s'incline en 3D (CSS) vers ce que Gari regarde, avec Gari qui flotte devant,
// et du visage, des graines et des feuilles qui se décalent chacun à leur profondeur.
// Au repos, Gari respire en CSS (joué par la carte graphique) et le script dort : il ne se réveille que pour
// un clignement, un salut, un coup d'œil, ou quand on la touche, la tire ou bouge la souris près d'elle.
// Le dessin n'est donc redessiné que pendant ces gestes, ce qui garde la page fluide, y compris sur Firefox.
function initMascotte(){
  const el=$('#mascotte'), sun=$('#spotHero'), hero=$('#top');
  if(!el||!sun) return;
  const q=c=>el.querySelector(c);
  const P={corps:q('.m-corps'),ombre:q('.m-ombre'),brasG:q('.m-bras-g'),brasD:q('.m-bras-d'),visage:q('.m-visage'),
    graines:q('.m-graines'),reflet:q('.m-reflet'),yeux:q('.m-yeux'),joie:q('.m-joie'),
    bouche:q('.m-bouche'),boucheJoie:q('.m-bouche-joie'),boucheO:q('.m-bouche-o'),couronne:q('.m-couronne'),bulle:q('.m-bulle')};
  if(!P.corps) return;


  let veil=null, fruitCount=0, fruitTimer=0;

  function fruitHit(e){
    const r=el.getBoundingClientRect();
    return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;
  }
  function resetFruitCount(){
    fruitCount=0;
    clearTimeout(fruitTimer);
    fruitTimer=0;
  }
  function makeWipeSound(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return null;
    try{
      const ctx=new AC();
      const master=ctx.createGain();
      master.gain.value=.42;
      master.connect(ctx.destination);

      const buffer=ctx.createBuffer(1,Math.max(1,Math.floor(ctx.sampleRate*.35)),ctx.sampleRate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.65;
      const noise=ctx.createBufferSource();
      noise.buffer=buffer;
      noise.loop=true;
      const filter=ctx.createBiquadFilter();
      filter.type='bandpass';
      filter.frequency.value=2700;
      filter.Q.value=4.8;
      const noiseGain=ctx.createGain();
      noiseGain.gain.value=0;
      noise.connect(filter).connect(noiseGain).connect(master);
      noise.start();

      const tone=ctx.createOscillator();
      tone.type='triangle';
      tone.frequency.value=1800;
      const toneGain=ctx.createGain();
      toneGain.gain.value=0;
      tone.connect(toneGain).connect(master);
      tone.start();

      const wobble=ctx.createOscillator();
      wobble.type='sine';
      wobble.frequency.value=280;
      const wobbleGain=ctx.createGain();
      wobbleGain.gain.value=0;
      wobble.connect(wobbleGain).connect(master);
      wobble.start();

      if(ctx.state==='suspended')ctx.resume();
      return {ctx,master,filter,noiseGain,tone,toneGain,wobble,wobbleGain,last:0,x:0,y:0};
    }catch(_){return null}
  }
  function rubSound(e,state){
    const a=state.audio;
    if(!a)return;
    try{
      if(a.ctx.state==='suspended')a.ctx.resume();
      const now=a.ctx.currentTime;
      const dx=e.clientX-a.x,dy=e.clientY-a.y;
      a.x=e.clientX;a.y=e.clientY;
      if(now-a.last<.022)return;
      a.last=now;
      const motion=Math.min(1,Math.max(.3,Math.hypot(dx,dy)/15));
      const pos=clamp(e.clientX/innerWidth,0,1);
      a.filter.frequency.setTargetAtTime(1700+pos*3000,now,.015);
      a.filter.Q.setTargetAtTime(3+motion*3.5,now,.02);

      a.noiseGain.gain.cancelScheduledValues(now);
      a.noiseGain.gain.setTargetAtTime(.24*motion,now,.008);
      a.noiseGain.gain.setTargetAtTime(.025,now+.055,.06);

      a.tone.frequency.cancelScheduledValues(now);
      a.tone.frequency.setValueAtTime(1050+pos*1500,now);
      a.tone.frequency.exponentialRampToValueAtTime(2800+motion*1700,now+.045);
      a.toneGain.gain.cancelScheduledValues(now);
      a.toneGain.gain.setTargetAtTime(.095*motion,now,.008);
      a.toneGain.gain.setTargetAtTime(0,now+.06,.055);

      a.wobble.frequency.setTargetAtTime(190+pos*220+motion*260,now,.02);
      a.wobbleGain.gain.cancelScheduledValues(now);
      a.wobbleGain.gain.setTargetAtTime(.075*motion,now,.008);
      a.wobbleGain.gain.setTargetAtTime(0,now+.075,.08);
    }catch(_){}
  }
  function stopRubSound(state){
    const a=state.audio;
    if(!a)return;
    try{
      const now=a.ctx.currentTime;
      a.noiseGain.gain.setTargetAtTime(0,now,.06);
      a.toneGain.gain.setTargetAtTime(0,now,.05);
      a.wobbleGain.gain.setTargetAtTime(0,now,.05);
    }catch(_){}
  }
  function drawSplash(state){
    const started=performance.now(), source={x:state.sourceX,y:state.sourceY};
    const spots=[
      {x:.50,y:.46,delay:250,size:.42,seed:2},
      {x:.16,y:.28,delay:310,size:.24,seed:7},
      {x:.84,y:.23,delay:345,size:.26,seed:11},
      {x:.25,y:.80,delay:365,size:.25,seed:17},
      {x:.79,y:.78,delay:395,size:.28,seed:23}
    ];
    // Smooth, irregular radial contours stay stable across frames.
    function outline(ctx,seed){
      const n=48,points=[];
      for(let i=0;i<n;i++){
        const a=i*Math.PI*2/n;
        const spike=Math.pow(Math.max(0,Math.sin(a*5+seed)),8)*.44+
                    Math.pow(Math.max(0,Math.sin(a*9-seed*.7)),10)*.25;
        const radius=1+.12*Math.sin(a*3+seed)+.09*Math.sin(a*7-seed)+spike;
        points.push({x:Math.cos(a)*radius,y:Math.sin(a)*radius});
      }
      ctx.beginPath();
      for(let i=0;i<n;i++){
        const p=points[i],next=points[(i+1)%n];
        if(!i){const prev=points[n-1];ctx.moveTo((prev.x+p.x)/2,(prev.y+p.y)/2)}
        ctx.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);
      }
      ctx.closePath();
    }
    const svg=el.querySelector('.m-svg');
    if(svg&&svg.animate)state.reaction=svg.animate(
      [{transform:'scale(1)'},{transform:'scale(1.12,.82)'},{transform:'translateY(-5%) scale(.94,1.08)'},{transform:'none'}],
      {duration:300,easing:'ease-out'}
    );
    function frame(now){
      if(veil!==state)return;
      const ctx=state.ctx,w=innerWidth,h=innerHeight,t=Math.min(now-started,1050);
      ctx.clearRect(0,0,w,h);
      // A narrow stream leaves the lower part of the mascot before reaching the glass.
      if(t<340){
        const p=clamp((t-35)/230,0,1), ex=source.x+(w*.5-source.x)*p,ey=source.y+(h*.46-source.y)*p;
        ctx.save();ctx.strokeStyle='#fff';ctx.lineCap='round';
        ctx.shadowColor='rgba(120,92,75,.24)';ctx.shadowBlur=5;
        ctx.lineWidth=5+21*p;ctx.beginPath();ctx.moveTo(source.x,source.y);
        ctx.quadraticCurveTo(source.x-18*p,source.y+65*p,ex,ey);ctx.stroke();
        ctx.restore();
      }
      const extent=Math.hypot(w,h)*1.8;
      for(const spot of spots){
        const p=clamp((t-spot.delay)/650,0,1);
        if(!p)continue;
        const impact=1-Math.pow(1-clamp(p/.22,0,1),3);
        const spread=Math.pow(clamp((p-.16)/.84,0,1),2.8);
        const bounce=1+.12*Math.sin(Math.min(1,p/.35)*Math.PI);
        const size=extent*(spot.size*impact*bounce+spread);
        ctx.save();ctx.translate(w*spot.x,h*spot.y);
        ctx.scale(size*(1+.13*(1-impact)),size*(1-.1*(1-impact)));
        outline(ctx,spot.seed);
        ctx.fillStyle='#fff';
        if(p<.58){ctx.shadowColor='rgba(111,83,65,.28)';ctx.shadowBlur=12/size;ctx.shadowOffsetY=3/size}
        ctx.fill();
        ctx.shadowColor='transparent';
        if(p<.48){
          ctx.strokeStyle='rgba(255,247,230,.58)';ctx.lineWidth=.025;
          ctx.beginPath();ctx.arc(-.16,-.22,.52,3.65,4.9);ctx.stroke();
          ctx.strokeStyle='rgba(188,165,145,.20)';ctx.lineWidth=.014;
          ctx.beginPath();ctx.arc(.06,.08,.68,.25,1.25);ctx.stroke();
        }
        ctx.restore();
        if(p<.6){
          for(let i=0;i<8;i++){
            const angle=i*Math.PI/4+spot.seed,dist=size*(1.35+i%3*.13);
            ctx.beginPath();ctx.fillStyle='#fff';
            ctx.arc(w*spot.x+Math.cos(angle)*dist,h*spot.y+Math.sin(angle)*dist,
              Math.max(2,size*(.025+i%3*.012)),0,Math.PI*2);ctx.fill();
          }
        }
      }
      if(t<1050)state.splashRaf=requestAnimationFrame(frame);
      else{state.ready=true;layerReady(state)}
    }
    state.splashRaf=requestAnimationFrame(frame);
  }
  function layerReady(state){
    state.layer.classList.add('ready');
  }
  function closeVeil(state){
    if(!veil||veil!==state)return;
    veil=null;
    if(state.splashRaf)cancelAnimationFrame(state.splashRaf);
    if(state.reaction)state.reaction.cancel();
    window.removeEventListener('resize',state.resize);
    window.removeEventListener('keydown',state.onKey);
    window.removeEventListener('pagehide',state.onExit);
    resetFruitCount();
    stopRubSound(state);
    if(state.audio){
      try{
        const now=state.audio.ctx.currentTime;
        state.audio.master.gain.setTargetAtTime(0,now,.06);
        setTimeout(()=>{
          try{state.audio.noise.stop();state.audio.tone.stop();state.audio.wobble.stop();state.audio.ctx.close()}catch(_){}
        },220);
      }catch(_){}
    }
    state.layer.classList.add('closing');
    setTimeout(()=>state.layer.remove(),260);
  }
  function erase(e,state){
    if(!state.ready||!state.ctx)return;
    rubSound(e,state);
    const x=e.clientX,y=e.clientY;
    state.ctx.save();
    state.ctx.globalCompositeOperation='destination-out';
    const previous=state.previous||{x,y};
    state.ctx.lineWidth=state.radius*2;
    state.ctx.lineCap='round';
    state.ctx.strokeStyle='rgba(0,0,0,.92)';
    state.ctx.beginPath();
    state.ctx.moveTo(previous.x,previous.y);
    state.ctx.lineTo(x,y);
    state.ctx.stroke();
    state.previous={x,y};
    state.ctx.restore();

    const x0=Math.max(0,Math.floor((x-state.radius)/innerWidth*state.cols));
    const x1=Math.min(state.cols-1,Math.ceil((x+state.radius)/innerWidth*state.cols));
    const y0=Math.max(0,Math.floor((y-state.radius)/innerHeight*state.rows));
    const y1=Math.min(state.rows-1,Math.ceil((y+state.radius)/innerHeight*state.rows));
    for(let gy=y0;gy<=y1;gy++)for(let gx=x0;gx<=x1;gx++){
      const i=gy*state.cols+gx;
      const cx=(gx+.5)*innerWidth/state.cols,cy=(gy+.5)*innerHeight/state.rows;
      if(!state.grid[i]&&Math.hypot(cx-x,cy-y)<state.radius){state.grid[i]=1;state.cleared++}
    }
    if(state.cleared>=state.grid.length*.70)closeVeil(state);
  }
  function openVeil(){
    if(veil)return;
    const r=el.getBoundingClientRect();
    const x=Math.max(0,Math.min(innerWidth,r.left+r.width/2));
    const y=Math.max(0,Math.min(innerHeight,r.top+r.height*.85));
    const layer=document.createElement('div');
    layer.className='screen-veil';
    layer.setAttribute('aria-hidden','true');

    const canvas=document.createElement('canvas');
    canvas.className='veil-canvas';
    const brush=document.createElement('div');
    brush.className='veil-brush';
    layer.append(canvas,brush);
    document.body.appendChild(layer);

    const state={
      layer,canvas,brush,ctx:null,audio:makeWipeSound(),ready:false,drawing:false,radius:0,
      sourceX:x,sourceY:y,splashRaf:0,cols:18,rows:12,grid:new Uint8Array(18*12),cleared:0,resize:null
    };
    layer.style.setProperty('--veil-x',x+'px');
    layer.style.setProperty('--veil-y',y+'px');
    function resize(){
      const dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.max(1,Math.round(innerWidth*dpr));
      canvas.height=Math.max(1,Math.round(innerHeight*dpr));
      state.ctx=canvas.getContext('2d');
      state.ctx.setTransform(dpr,0,0,dpr,0,0);
      state.ctx.clearRect(0,0,innerWidth,innerHeight);
      state.grid.fill(0);
      state.cleared=0;
      if(state.ready){
        state.ctx.fillStyle='#fff';
        state.ctx.fillRect(0,0,innerWidth,innerHeight);
      }
    }
    state.resize=resize;
    resize();
    const brushSize=Math.max(180,Math.min(220,Math.max(innerWidth,innerHeight)*.16));
    state.radius=brushSize/2;
    brush.style.width=brushSize+'px';
    brush.style.height=brushSize+'px';
    layer.addEventListener('pointermove',e=>{
      brush.style.left=e.clientX+'px';
      brush.style.top=e.clientY+'px';
      brush.classList.add('show');
      if(e.pointerType!=='touch'||state.drawing)erase(e,state);
    },{passive:false});
    layer.addEventListener('pointerleave',()=>{brush.classList.remove('show');state.previous=null;stopRubSound(state)});
    layer.addEventListener('pointerdown',e=>{
      if(!state.ready)return;
      e.preventDefault();
      state.drawing=true;
      try{layer.setPointerCapture(e.pointerId)}catch(_){}
      brush.style.left=e.clientX+'px';
      brush.style.top=e.clientY+'px';
      brush.classList.add('show');
      erase(e,state);
    });
    const stop=e=>{
      state.drawing=false;
      state.previous=null;
      stopRubSound(state);
      try{layer.releasePointerCapture(e.pointerId)}catch(_){}
    };
    layer.addEventListener('pointerup',stop);
    layer.addEventListener('pointercancel',stop);
    layer.addEventListener('wheel',e=>e.preventDefault(),{passive:false});
    layer.addEventListener('contextmenu',e=>e.preventDefault());
    window.addEventListener('resize',state.resize);
    state.onKey=e=>{if(e.key==='Escape')closeVeil(state)};
    state.onExit=()=>closeVeil(state);
    window.addEventListener('keydown',state.onKey);
    window.addEventListener('pagehide',state.onExit,{once:true});
    veil=state;
    if(RM){state.ctx.fillStyle='#fff';state.ctx.fillRect(0,0,innerWidth,innerHeight);state.ready=true;layerReady(state)}
    else drawSplash(state);
  }
  function addFruitClick(){
    fruitCount++;
    clearTimeout(fruitTimer);
    fruitTimer=setTimeout(resetFruitCount,2000);
    if(fruitCount<10)return false;
    resetFruitCount();
    openVeil();
    return true;
  }
  document.addEventListener('click',e=>{
    if(!veil&&!fruitHit(e))resetFruitCount();
  },true);

  // Le pointeur, en pixels dans la fenêtre. Sur écran tactile, il ne bouge qu'au toucher : Gari regarde alors seule autour d'elle.
  const ptr={x:0,y:0,at:-1e9,touch:true};
  addEventListener('pointermove',e=>{ptr.x=e.clientX;ptr.y=e.clientY;ptr.at=performance.now();ptr.touch=e.pointerType==='touch';if(!ptr.touch&&visible)wake()},{passive:true});

  // Tirer Gari : elle s'étire, puis revient comme un ressort. Sur mobile, seulement à l'horizontale :
  // un glissement vertical fait toujours défiler la page (touch-action: pan-y dans le CSS).
  const pull={x:0,y:0,vx:0,vy:0,tx:0,ty:0};
  let drag=null, noClick=false, unit=1;
  const lim=v=>v/(1+Math.abs(v)/110);
  sun.addEventListener('pointerdown',e=>{
    if(e.button>0)return;
    drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,moved:false};
    try{sun.setPointerCapture(e.pointerId)}catch(_){}
    wake();
  });
  sun.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const dx=e.clientX-drag.x0, dy=e.pointerType==='touch'?0:e.clientY-drag.y0;
    if(!drag.moved&&Math.hypot(dx,dy)>8){drag.moved=true;sun.classList.add('grab')}
    if(drag.moved){pull.tx=dx/unit;pull.ty=dy/unit}
  });
  const end=e=>{
    if(!drag||e.pointerId!==drag.id)return;
    if(drag.moved){
      noClick=true;setTimeout(()=>{noClick=false});
      if(Math.hypot(pull.x,pull.y)>26)react('boing');
    }
    sun.classList.remove('grab');pull.tx=pull.ty=0;drag=null;
  };
  sun.addEventListener('pointerup',end);sun.addEventListener('pointercancel',end);
  sun.addEventListener('click',e=>{
    if(noClick)return;
    if(fruitHit(e)){
      if(addFruitClick()){react('boing');return}
    }else resetFruitCount();
    react();
  });

  // Toucher Gari : un saut de joie ou un fou rire, en alternance, avec une bulle.
  let jump=0, giggle=0, boing=0, nReact=0, said=false, bulleT=0;
  function say(txt){
    P.bulle.textContent=txt;P.bulle.classList.add('on');
    clearTimeout(bulleT);bulleT=setTimeout(()=>P.bulle.classList.remove('on'),1900);
  }
  function react(kind){
    if(kind==='boing'){boing=1;say(T.boing)}
    else if(nReact++%2===0){jump=1;say(said?T.hop:T.hello);said=true}
    else giggle=1,say(T.giggle);
    if(kind!=='boing')track('Gari touchée');
    wake();
  }

  let blink=0, wave=0, wasNear=false, last=0, expr=-1, raf=0, visible=true, tf='';
  const look={x:0,y:0}, gaze={x:0,y:0};
  const set=(n,v)=>{if(n._t!==v){n._t=v;n.setAttribute('transform',v)}};
  const show=(n,v)=>n.setAttribute('visibility',v?'visible':'hidden');
  const r=v=>Math.round(v*10)/10, r3=v=>Math.round(v*1000)/1000;
  const M=RM?0:1; // avec « Réduire les animations », Gari change seulement d'expression

  // Les petits gestes du repos, à intervalles irréguliers, seulement quand le haut de page est visible.
  function every(min,max,fn){const go=()=>setTimeout(()=>{if(visible&&document.visibilityState!=='hidden'){fn();wake()}go()},min+Math.random()*(max-min));go()}
  if(!RM){
    every(3000,6000,()=>{blink=1});
    every(9000,15000,()=>{if(wave<=0)wave=1});
    every(3500,7000,()=>{const c=Math.random()<.3;gaze.x=c?0:Math.random()*1.4-.7;gaze.y=c?0:Math.random()*.7-.35});
  }

  function frame(now){
    raf=0;
    const dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;const t=now/1000;
    const box=sun.getBoundingClientRect(), W=box.width;
    unit=Math.max(.01,W*.78/220); // pixels par unité du dessin
    const cx=box.left+W/2, cy=box.top+W/2;

    // Où regarde Gari (de -1 à 1) : vers où on la tire ; sinon la souris si elle a bougé il y a moins de 4 s ;
    // sinon un point choisi de temps en temps, qu'elle rejoint puis fixe.
    const fresh=!ptr.touch&&now-ptr.at<4000;
    let gx, gy;
    if(drag&&drag.moved){gx=clamp(pull.tx/70,-1,1);gy=clamp(pull.ty/70,-1,1)}
    else if(fresh){const R=Math.max(200,W*.8);gx=(ptr.x-cx)/R;gy=(ptr.y-cy)/R;const m=Math.hypot(gx,gy);if(m>1){gx/=m;gy/=m}}
    else{gx=gaze.x;gy=gaze.y}
    const lk=1-Math.exp(-dt*(fresh||drag?8:9));
    look.x+=(gx*M-look.x)*lk;look.y+=(gy*M-look.y)*lk;
    const settled=Math.abs(gx*M-look.x)+Math.abs(gy*M-look.y)<.01;
    const lx=look.x, ly=look.y;

    // Gari s'incline vers ce qu'elle regarde, comme posée devant son soleil.
    const nt=`rotateX(${r(-ly*12)}deg) rotateY(${r(lx*16)}deg) translateZ(30px)`;
    if(nt!==tf){tf=nt;el.style.transform=nt}

    // Le ressort quand on la tire (deux demi-pas : plus stable quand une image arrive en retard).
    for(let i=0;i<2;i++){const h=dt/2;
      pull.vx+=(190*(lim(pull.tx)-pull.x)-11*pull.vx)*h;pull.x+=pull.vx*h;
      pull.vy+=(190*(lim(pull.ty)-pull.y)-11*pull.vy)*h;pull.y+=pull.vy*h;}
    if(RM){pull.x=lim(pull.tx);pull.y=lim(pull.ty);pull.vx=pull.vy=0}

    // Le corps : saut, fou rire, étirement quand on la tire ; les pieds restent au sol.
    jump=Math.max(0,jump-dt*1.5);giggle=Math.max(0,giggle-dt/1.3);boing=Math.max(0,boing-dt*1.2);
    const jh=Math.sin(jump*Math.PI)*M, squash=1+Math.sin(jump*Math.PI*2)*.07*M;
    const stretch=clamp(1-pull.y/190,.75,1.3);
    const sy=squash*stretch, sx=1/Math.sqrt(squash*stretch)*(1-Math.abs(lx)*.03);
    const lean=r(clamp(-Math.atan2(pull.x,140)*57.3,-32,32));
    const tilt=r((lx*3+Math.sin(t*38)*7*giggle)*M);
    set(P.corps,`translate(${r(pull.x*.25)} ${r(-jh*38)}) rotate(${tilt}) skewX(${lean}) scale(${r3(sx)} ${r3(sy)})`);
    set(P.ombre,`scale(${Math.round((1-jh*.45)*100)/100} 1)`);

    // L'expression : surprise quand on la tire, joie après une réaction.
    const surpris=!!(drag&&drag.moved);
    const joie=!surpris&&(jump>.02||giggle>0||boing>0);
    const ex=surpris?2:joie?1:0;
    if(ex!==expr){expr=ex;show(P.yeux,ex!==1);show(P.joie,ex===1);show(P.bouche,ex===0);show(P.boucheJoie,ex===1);show(P.boucheO,ex===2)}

    // Les bras : un salut quand la souris s'approche, et de temps en temps ; levés de joie ; agités de surprise.
    const near=fresh&&Math.hypot(ptr.x-cx,ptr.y-cy)<W*.45;
    if(!RM&&near&&!wasNear&&wave<=0)wave=1;
    wasNear=near;
    wave=Math.max(0,wave-dt/1.6);
    const waving=Math.sin((1-wave)*Math.PI*5)*18*Math.sin(wave*Math.PI);
    const flail=surpris?Math.sin(t*16)*12:0;
    set(P.brasD,`rotate(${r((waving-(joie?14:0)-(surpris?20:0)+flail)*M)} 48 -70)`);
    set(P.brasG,`rotate(${r(((joie?120:0)+(surpris?60:0)-flail)*M)} -50 -58)`);

    // Le relief : le visage se décale le plus, puis les feuilles et les graines ; le reflet glisse en sens inverse.
    set(P.visage,`translate(${r(lx*7)} ${r(ly*4)})`);
    set(P.graines,`translate(${r(lx*2.6)} ${r(ly*1.5)})`);
    set(P.reflet,`translate(${r(-lx*2)} ${r(-ly*1.2)})`);
    set(P.couronne,`rotate(${r(-lx*4-lean*.4)} 0 -120) translate(${r(lx*2.4)} ${r(ly*1)})`);

    // Les yeux clignent.
    blink=Math.max(0,blink-dt*7);
    set(P.yeux,`translate(0 -78) scale(1 ${Math.round((1-Math.sin(blink*Math.PI)*.9)*100)/100}) translate(0 78)`);

    // On continue tant qu'un geste est en cours ; sinon le script dort jusqu'au prochain.
    const busy=jump>0||giggle>0||boing>0||blink>0||wave>0||drag||!settled||Math.abs(pull.x)+Math.abs(pull.y)+Math.abs(pull.vx)+Math.abs(pull.vy)>.3;
    if(visible&&busy&&document.visibilityState!=='hidden')raf=requestAnimationFrame(frame);
    else last=0;
  }
  function wake(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
  // Rien ne bouge quand le haut de page n'est pas à l'écran (y compris la respiration, en CSS).
  if('IntersectionObserver' in window){
    new IntersectionObserver(([en])=>{visible=en.isIntersecting;hero.classList.toggle('pause',!visible);if(visible)wake()}).observe(hero);
  }
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')wake()});
  wake();
}
initMascotte();

// Compteur de diagnostic, visible seulement avec ?fps dans l'adresse : images par seconde.
if(/[?&]fps/.test(location.search)){
  const box=document.body.appendChild(Object.assign(document.createElement('div'),{style:'position:fixed;left:8px;bottom:8px;z-index:99;padding:6px 10px;border-radius:10px;background:#000c;color:#fff;font:700 13px/1.3 system-ui;pointer-events:none'}));
  let n=0,t0=0;const f=now=>{n++;if(!t0)t0=now;if(now-t0>=1000){box.textContent=Math.round(n*1000/(now-t0))+' i/s';n=0;t0=now}requestAnimationFrame(f)};requestAnimationFrame(f);
}

/* ---------- Repères de défilement ---------- */
// Le point de la section à l'écran s'allume ; le bouton « retour en haut » apparaît après le haut de page.
const dots=$$('.dots a'), toTop=$('#toTop');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting)return;
    const id=en.target.id;
    dots.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));
    toTop.classList.toggle('on',id!=='top');
  }),{rootMargin:'-45% 0px -50% 0px'});
  dots.forEach(a=>{const s=document.getElementById(a.getAttribute('href').slice(1));if(s)io.observe(s)});
}

/* ---------- Apparitions au scroll ---------- */
// Une seule fois par élément, en fondu et montée légère (CSS) ; sans animation si le système le demande.
document.documentElement.classList.add('js');
if(!RM&&'IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{rootMargin:'0px 0px -8% 0px'});
  $$('[data-reveal]').forEach(el=>io.observe(el));
}else $$('[data-reveal]').forEach(el=>el.classList.add('in'));

// Le manifeste se colore mot à mot au fil du scroll : le navigateur s'en charge seul (CSS animation-timeline).
// Ici, on découpe seulement le texte en mots.
(function(){
  const p=$('.manif');if(!p||!CSS.supports||!CSS.supports('animation-timeline','view()'))return;
  const walk=node=>{
    Array.from(node.childNodes).forEach(n=>{
      if(n.nodeType===3){
        const frag=document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w=>{
          if(!w)return;
          if(/^\s+$/.test(w)){frag.appendChild(document.createTextNode(w));return}
          const s=document.createElement('span');s.className='mot';s.textContent=w;frag.appendChild(s);
        });
        n.replaceWith(frag);
      }else if(n.nodeType===1)walk(n);
    });
  };
  walk(p);
})();

/* ---------- Démo du mode cuisine ---------- */
// La recette du cookie géant, d'après la fiche de l'équipe (Notion > Landing page).
const STEPS=LANG==='en'?[
  {big:'180 g',kid:'Help weigh the ingredients: 180 g of brown sugar, then 180 g of flour.',geste:'weighing',ico:'peser',parent:'Preheat the oven to 180 °C and line the tin with baking paper.',feu:true},
  {big:'Creamy',kid:'Mix the soft butter and the sugar until it’s nice and creamy.',geste:'mixing',ico:'melanger',parent:'Crack the egg into a bowl, then add it with the vanilla.',feu:false},
  {big:'150 g',kid:'Add the flour and baking powder, then the chocolate chips. Spread the dough in the tin.',geste:'folding in',ico:'etaler',parent:'Help spread the dough out evenly.',feu:false},
  {big:'25 min',kid:'The cookie is baking! Meanwhile, set out the little plates.',geste:'setting the table',ico:'accueil',parent:'Bake for 25 min at 180 °C, then let it cool before cutting.',feu:true,timer:true}
]:[
  {big:'180 g',kid:'Aide à peser les ingrédients&nbsp;: 180 g de sucre roux, puis 180 g de farine.',geste:'peser',ico:'peser',parent:'Préchauffer le four à 180 °C et tapisser le moule de papier cuisson.',feu:true},
  {big:'Crémeux',kid:'Mélange le beurre mou et le sucre jusqu’à ce que ce soit bien crémeux.',geste:'mélanger',ico:'melanger',parent:'Casser l’œuf dans un bol, puis l’ajouter avec la vanille.',feu:false},
  {big:'150 g',kid:'Ajoute la farine et la levure, puis les pépites de chocolat. Répartis la pâte dans le moule.',geste:'incorporer',ico:'etaler',parent:'Aider à étaler la pâte bien régulièrement.',feu:false},
  {big:'25 min',kid:'Le cookie cuit&nbsp;! Pendant ce temps, prépare les petites assiettes.',geste:'mettre la table',ico:'accueil',parent:'Enfourner 25 min à 180 °C, puis laisser tiédir avant de découper.',feu:true,timer:true}
];
let step=0;
const tsScreen=$('#tabScreen'), tsKid=$('#tsKid'), voiceBtn=$('#tsVoice'), nextBtn=$('#tsNext');
function renderStep(){
  const s=STEPS[step];
  $('#tsStep').textContent=T.step(step+1,STEPS.length);
  $('#tsBig').textContent=s.big;
  $('#tsKidText').innerHTML=s.kid;
  $('#tsParent').textContent=s.parent;
  $('#tsFeu').hidden=!s.feu;
  const g=$('#tsGeste');g.querySelector('span').innerHTML=T.geste+s.geste;g.querySelector('use').setAttribute('href','#p-'+s.ico);
  tsKid.classList.toggle('timer',!!s.timer);
  $$('#tsDots i').forEach((d,i)=>{d.classList.toggle('on',i===step);d.classList.toggle('fait',i<step)});
  $('#tsPrev').disabled=step===0;
  nextBtn.firstChild.textContent=step===STEPS.length-1?T.finish:T.next;
  if(!RM&&tsKid.animate) tsKid.animate([{transform:'translateY(8px)',opacity:.4},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,0,0,1)'});
  stopVoice();
}
nextBtn.addEventListener('click',()=>{if(step<STEPS.length-1){step++;renderStep()}else{tsScreen.classList.add('is-done');$('#tsStep').textContent=T.done;$$('#tsDots i').forEach(d=>d.classList.add('fait'));stopVoice();track('Démo : terminée')}});
$('#tsPrev').addEventListener('click',()=>{if(step>0){step--;renderStep()}});
$('#tsRestart').addEventListener('click',()=>{step=0;tsScreen.classList.remove('is-done');$$('#badges button').forEach(b=>b.setAttribute('aria-pressed','false'));renderStep()});
$$('#badges button').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true')));
// La voix de Gari : des consignes pré-enregistrées avec une voix de synthèse neuronale (outils/generer-voix.py),
// chargées seulement au premier appui. Si un fichier ne se lit pas, on se rabat sur la plus naturelle des voix de l'appareil.
const voice=new Audio();voice.preload='none';
let voiceBtnCur=null;
function setVoiceBtn(btn,on){if(!btn)return;btn.classList.toggle('speaking',on);btn.querySelector('span').textContent=on?T.speaking:btn.dataset.label}
function stopVoice(){voice.pause();try{speechSynthesis.cancel()}catch(e){}setVoiceBtn(voiceBtnCur,false);voiceBtnCur=null}
voice.addEventListener('ended',stopVoice);
function bestVoice(){
  const vs=('speechSynthesis' in window)?speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().indexOf(LANG)===0):[];
  const score=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?4:0)+(/denise|audrey|amélie|amelie|samantha|google/i.test(v.name)?2:0)+(/fr-FR|en-US|en-GB/i.test(v.lang)?1:0);
  return vs.sort((a,b)=>score(b)-score(a))[0]||null;
}
function speakFallback(text,btn){
  if(!('speechSynthesis' in window)){btn.querySelector('span').textContent=T.noVoice;return}
  const u=new SpeechSynthesisUtterance(text);u.lang=LANG==='en'?'en-US':'fr-FR';u.rate=.92;u.pitch=1.08;
  const v=bestVoice();if(v)u.voice=v;
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
const bravoBtn=$('#tsBravo');bravoBtn.dataset.label=T.listenGari;
bravoBtn.addEventListener('click',()=>playVoice(bravoBtn,'bravo',T.bravo));
renderStep();

/* ---------- Liste d'attente ---------- */
const form=$('#joinForm'), email=$('#email'), emailErr=$('#emailErr');
$$('input[name="role"]').forEach(r=>r.addEventListener('change',syncRole));
function syncRole(){const pro=$('#role-pro').checked;$('#ageField').hidden=pro;$('#orgField').hidden=!pro}
email.addEventListener('input',()=>{if(email.getAttribute('aria-invalid')==='true'&&valid(email.value)){email.removeAttribute('aria-invalid');emailErr.hidden=true}});
function valid(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())}

// Inscription rapide du haut de page : l'e-mail passe dans le formulaire complet, qui n'a plus que deux questions.
const quick=$('#quickForm'), qEmail=$('#qEmail'), qNote=$('#quickNote'), qNoteText=qNote.textContent;
quick.addEventListener('submit',e=>{
  e.preventDefault();
  if(!valid(qEmail.value)){qEmail.setAttribute('aria-invalid','true');qNote.textContent=T.quickBad;qNote.classList.add('ok');qEmail.focus();return}
  qEmail.removeAttribute('aria-invalid');qNote.textContent=qNoteText;qNote.classList.remove('ok');
  email.value=qEmail.value.trim();
  const sub=$('#formSub');sub.textContent=T.quickOk;sub.classList.add('ok');
  $('#liste').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
  setTimeout(()=>{$('#age-4').focus({preventScroll:true})},RM?0:700);
  track('Inscription rapide');
});
qEmail.addEventListener('input',()=>{if(qEmail.getAttribute('aria-invalid')==='true'&&valid(qEmail.value)){qEmail.removeAttribute('aria-invalid');qNote.textContent=qNoteText;qNote.classList.remove('ok')}});

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

