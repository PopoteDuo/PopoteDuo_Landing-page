/* Popote Duo · landing page : Gari animée, repères de défilement, démo du mode cuisine. Les boutons mènent à l'appli (app.popoteduo.app). */
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
/* ---------- Réglages à remplir avant la mise en ligne (voir LISEZMOI.md) ---------- */
const CONFIG={
  // Mesure d'audience Vercel Web Analytics : sans cookie, rien à régler ici, il suffit de l'activer dans le projet Vercel.
  // Laisser vide pour ne rien mesurer.
  analytics:{provider:'vercel'}
};
// Racine du site, déduite de l'adresse de ce script : la page anglaise (en/) trouve ainsi les mêmes fichiers.
const BASE=document.currentScript?new URL('../../',document.currentScript.src).href:'';

/* ---------- Langue : la page française (/) ou anglaise (/en) ---------- */
const LANG=document.documentElement.lang.indexOf('en')===0?'en':'fr';
const T={
  fr:{step:(i,n)=>`Étape ${i} sur ${n}`,geste:'Geste&nbsp;: ',next:'Étape suivante',finish:'Terminer',done:'Recette terminée',speaking:'Gari parle…',listen:'Écouter',listenGari:'Écouter Gari',
    noVoice:'Voix indisponible ici',bravo:'Bravo ! Le cookie géant est prêt.',
    hello:'Coucou, moi c’est Gari !',hop:'Hop !',giggle:'Hihi, ça chatouille !',boing:'Boing !'},
  en:{step:(i,n)=>`Step ${i} of ${n}`,geste:'Skill: ',next:'Next step',finish:'Finish',done:'Recipe complete',speaking:'Gari is talking…',listen:'Listen',listenGari:'Listen to Gari',
    noVoice:'Voice not available here',bravo:'Well done! The giant cookie is ready.',
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
// Événements (démo, Gari) : Vercel ne les enregistre qu'avec l'offre Pro. Sur l'offre gratuite, ils sont ignorés.
function track(name,props){
  try{if(window.va)window.va('event',{name,data:props})}catch(e){}
}
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
  sun.addEventListener('click',()=>{if(!noClick)react()});

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

})();

