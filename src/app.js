/* ===================== Motor de la plataforma ===================== */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const D=window.DATA;
const IDS=D.IDS; const ID_RE=/\b(RF-\d{2}|QA-\d{2}|RES-\d{2}|PA-\d{2}|DA-\d{2}|R1[01]|R[1-9])\b/g;
const SKIP="script,style,svg,textarea,input,select,button,.idref,.no-id,code.no-id,a,.pop,title";
const G=D.GLOSS; const gTerms=[];
Object.entries(G).forEach(([k,g])=>{[g.t,...(g.a||[])].forEach(term=>gTerms.push({k,term}));});
gTerms.sort((a,b)=>b.term.length-a.term.length);
const gRe=new RegExp("(?<![\\p{L}\\d-])("+gTerms.map(x=>x.term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")(?![\\p{L}\\d])","iu");
const termMap={}; gTerms.forEach(x=>termMap[x.term.toLowerCase()]=x.k);

/* ---------- almacenamiento (tolerante a fallos) ---------- */
const KEY="as-parcial1-v1";
let S={read:{},quiz:{},cards:{}};
try{const raw=localStorage.getItem(KEY); if(raw) S=Object.assign(S,JSON.parse(raw));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ---------- tema ---------- */
function setTheme(t){document.documentElement.setAttribute("data-theme",t);try{localStorage.setItem(KEY+"-theme",t);}catch(e){}}
try{const t=localStorage.getItem(KEY+"-theme"); if(t) document.documentElement.setAttribute("data-theme",t);}catch(e){}
$("#themeBtn").addEventListener("click",()=>{
  const cur=document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  setTheme(cur==="dark"?"light":"dark");
});

/* ---------- navegación ---------- */
const views=$$("section.view");
const nav=$("#nav");
function buildNav(){
  const groups={};
  views.forEach(v=>{const g=v.dataset.group||"";(groups[g]=groups[g]||[]).push(v);});
  nav.innerHTML=Object.entries(groups).map(([g,vs])=>`<div class="nav-group"><span class="eyebrow">${esc(g)}</span>${
    vs.map(v=>`<a href="#${v.id.slice(2)}" data-v="${v.id}"><span class="num">${esc(v.dataset.num||"")}</span><span style="flex:1">${esc(v.dataset.title)}</span><span class="dot${S.read[v.id]?" done":""}"></span></a>`).join("")
  }</div>`).join("");
}
buildNav();
function go(id,anchor){
  let v=document.getElementById("v-"+id); if(!v){v=views[0];}
  views.forEach(x=>x.classList.toggle("on",x===v));
  $$("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.v===v.id));
  $("#sidebar").classList.remove("open");
  if(anchor){const el=document.getElementById(anchor); if(el){setTimeout(()=>{el.scrollIntoView({behavior:"smooth",block:"start"});flash(el);},30);return;}}
  window.scrollTo({top:0});
  requestAnimationFrame(()=>$$(".dg",v).forEach(fitDiagram));
}
function flash(el){el.style.transition="background .6s";el.style.background="var(--signal-soft)";setTimeout(()=>el.style.background="",900);}
function route(){const h=(location.hash||"#inicio").slice(1); go(h.split(".")[0], h.includes(".")?h.split(".")[1]:null);}
window.addEventListener("hashchange",route);
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("click",e=>{const a=e.target.closest("a[href^='#']"); if(a&&a.getAttribute("href").length>1){ /* default hash nav */ }});
window.goTo=(id,anchor)=>{ if(location.hash==="#"+id && !anchor){route();} else {location.hash=id+(anchor?"."+anchor:"");}};

/* marcar como estudiada */
$$("section.view").forEach(v=>{
  if(v.dataset.noDone) return;
  const d=document.createElement("div"); d.className="done-btn";
  const next=v.nextElementSibling&&v.nextElementSibling.matches("section.view")?v.nextElementSibling:null;
  d.innerHTML=`<button class="btn mark-read" type="button"></button>${next?`<a class="btn primary" href="#${next.id.slice(2)}">Siguiente: ${esc(next.dataset.title)} →</a>`:""}`;
  v.querySelector(".page").appendChild(d);
  const b=d.querySelector(".mark-read");
  const paint=()=>{b.textContent=S.read[v.id]?"✓ Sección estudiada (desmarcar)":"Marcar sección como estudiada";};
  paint();
  b.addEventListener("click",()=>{S.read[v.id]=!S.read[v.id];save();paint();buildNav();route2();renderProgress();});
});
function route2(){const h=(location.hash||"#inicio").slice(1).split(".")[0];$$("#nav a").forEach(a=>a.classList.toggle("active",a.dataset.v==="v-"+h));}

/* ---------- diagramas: renderizador de cajas/flechas ---------- */
const NS="http://www.w3.org/2000/svg";
const CW={"s-tb":7.9,"s-ts":6.4,"s-t":6.8};
function txtLines(x,y,lines,cls,anchor="middle",lh=15,maxW=0){return lines.map((l,i)=>{const est=l.length*(CW[cls]||7); const fit=maxW&&est>maxW?` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"`:""; return `<text x="${x}" y="${y+i*lh}" class="${cls}" text-anchor="${anchor}"${fit}>${esc(l)}</text>`;}).join("");}
function nodeSVG(n){
  const {x,y,w=150,h=50}=n; const cls=n.cls||"s-box"; const cx=x+w/2;
  const T=n.t?String(n.t).split("\n"):[]; const Sb=n.s?String(n.s).split("\n"):[];
  const total=T.length*16+Sb.length*13; let ty=y+h/2-total/2+12;
  let shape="";
  switch(n.shape){
    case "db": shape=`<path class="${cls} shape" d="M${x},${y+8} a${w/2},8 0 0 0 ${w},0 v${h-16} a${w/2},8 0 0 1 -${w},0 z"/><path class="${cls} shape" d="M${x},${y+8} a${w/2},8 0 0 1 ${w},0 a${w/2},8 0 0 1 -${w},0" />`;ty+=4;break;
    case "actor": {const ax=cx; shape=`<g class="s-line"><circle cx="${ax}" cy="${y+8}" r="8" class="${cls}"/><path d="M${ax},${y+16} v16 M${ax-12},${y+22} h24 M${ax},${y+32} l-10,14 M${ax},${y+32} l10,14"/></g>`; return `<g data-k="${n.k||""}">${shape}${txtLines(cx,y+h+14,T,"s-tb")}${txtLines(cx,y+h+28,Sb,"s-ts")}</g>`;}
    case "uc": shape=`<ellipse class="${cls} shape" cx="${cx}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}"/>`;break;
    case "node": shape=`<path class="${cls} shape" d="M${x},${y+10} l10,-10 h${w-10} v${h-10} l-10,10 z"/><path class="s-line" d="M${x},${y+10} h${w-10} v${h-10} M${x+w-10},${y+10} l10,-10"/>`;ty+=4;break;
    case "pkg": shape=`<path class="${cls} shape" d="M${x},${y} h${Math.min(60,w/2.5)} v10 h${w-Math.min(60,w/2.5)} v${h-10} h-${w} z"/>`;ty+=4;break;
    case "comp": shape=`<rect class="${cls} shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/><g class="s-box"><rect x="${x+w-22}" y="${y+6}" width="14" height="16"/><rect x="${x+w-26}" y="${y+9}" width="8" height="3"/><rect x="${x+w-26}" y="${y+15}" width="8" height="3"/></g>`;break;
    case "circle": shape=`<circle class="${cls} shape" cx="${cx}" cy="${y+h/2}" r="${Math.min(w,h)/2}"/>`;break;
    case "diamond": shape=`<path class="${cls} shape" d="M${cx},${y} L${x+w},${y+h/2} L${cx},${y+h} L${x},${y+h/2} Z"/>`;break;
    case "queue": shape=`<rect class="${cls} shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}"/>`;break;
    case "note": shape=`<path class="${cls} shape" d="M${x},${y} h${w-12} l12,12 v${h-12} h-${w} z"/>`;break;
    default: shape=`<rect class="${cls} shape" x="${x}" y="${y}" width="${w}" height="${h}" rx="${n.r??8}"/>`;
  }
  const mw=(n.shape==="uc"?w*0.82:n.shape==="db"?w-10:w-14); return `<g data-k="${n.k||""}">${shape}${txtLines(cx,ty,T,"s-tb",'middle',16,mw)}${txtLines(cx,ty+T.length*16-2,Sb,"s-ts",'middle',13,mw)}</g>`;
}
function clip(n,px,py){ // punto en el borde del nodo hacia (px,py)
  const w=n.w||150,h=n.h||50,cx=n.x+w/2,cy=n.y+h/2; const dx=px-cx,dy=py-cy;
  if(dx===0&&dy===0) return [cx,cy];
  if(n.shape==="actor"){return [cx,cy+10];}
  const sx=(w/2)/Math.abs(dx||1e-9), sy=(h/2)/Math.abs(dy||1e-9); const s=Math.min(sx,sy);
  return [cx+dx*s,cy+dy*s];
}
let MID=0; let LABELS=[];
function edgeSVG(e,map){
  const a=map[e.f],b=map[e.t]; if(!a||!b) return "";
  const ac=[a.x+(a.w||150)/2,a.y+(a.h||50)/2], bc=[b.x+(b.w||150)/2,b.y+(b.h||50)/2];
  const via=e.via||[]; const p0=clip(a,...(via[0]||bc)), p1=clip(b,...(via[via.length-1]||ac));
  const pts=[p0,...via,p1];
  const cls=e.cls||"s-line"; const id="m"+(++MID); const arrowCls=cls==="s-async"?"s-arrow-p":"s-arrow";
  const marker=`<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="${arrowCls}"/></marker>`;
  const d="M"+pts.map(p=>p.map(v=>Math.round(v)).join(",")).join(" L");
  let lab="";
  if(e.l){const m=Math.floor((pts.length-1)/2); const q=pts[m],r=pts[m+1]; const lx=(q[0]+r[0])/2+(e.dx||0), ly=(q[1]+r[1])/2+(e.dy??-6);
    const L=String(e.l).split("\n"); lab=`<g>${L.map((t,i)=>`<text x="${lx}" y="${ly+i*12}" text-anchor="middle" class="s-ts" style="paint-order:stroke;stroke:var(--surface);stroke-width:4px">${esc(t)}</text>`).join("")}</g>`;}
  LABELS.push(lab?`<g data-k="${e.k||""}">${lab}</g>`:""); return `<g data-k="${e.k||""}"><defs>${marker}</defs><path d="${d}" class="${cls}" ${e.noArrow?"":`marker-end="url(#${id})"`} ${e.both?`marker-start="url(#${id})"`:""}/></g>`;
}
function renderBoxes(spec){
  const map={}; (spec.nodes||[]).forEach(n=>map[n.k]=n);
  let s=`<svg xmlns="${NS}" viewBox="0 0 ${spec.w} ${spec.h}" width="${spec.w}" height="${spec.h}" role="img" aria-label="${esc(spec.title||"diagrama")}">`;
  (spec.groups||[]).forEach(g=>{s+=`<g data-k="${g.k||""}"><rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="10" class="${g.cls||"s-box2"}" ${g.dash?'stroke-dasharray="6 4"':''}/><text x="${g.x+10}" y="${g.y+18}" class="s-ts" style="font-weight:600;letter-spacing:.04em">${esc(g.l||"")}</text></g>`;});
  LABELS=[]; (spec.edges||[]).forEach(e=>s+=edgeSVG(e,map));
  (spec.nodes||[]).forEach(n=>s+=nodeSVG(n)); s+=LABELS.join("");
  (spec.texts||[]).forEach(t=>s+=`<text x="${t.x}" y="${t.y}" class="${t.cls||"s-ts"}" text-anchor="${t.a||"start"}">${esc(t.t)}</text>`);
  return s+"</svg>";
}
function renderSeq(spec){
  const P=spec.parts, gap=spec.gap||150, top=20, ph=46, x0=20, step=spec.step||44;
  const W=x0*2+gap*(P.length-1)+140, msgs=spec.msgs; const H=top+ph+30+msgs.length*step+30;
  const cx=i=>x0+70+i*gap; const idx={}; P.forEach((p,i)=>idx[p.k]=i);
  let s=`<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(spec.title||"diagrama de secuencia")}"><defs>
  <marker id="sq-f${++MID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="s-arrow"/></marker>
  <marker id="sq-a${MID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--v-pro)" stroke-width="1.6"/></marker>
  <marker id="sq-r${MID}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10" fill="none" stroke="var(--muted)" stroke-width="1.4"/></marker></defs>`;
  const m=MID;
  P.forEach((p,i)=>{const x=cx(i);s+=`<g data-k="${p.k}"><rect x="${x-66}" y="${top}" width="132" height="${ph}" rx="7" class="${p.cls||"s-box"} shape"/>${txtLines(x,top+(p.s?20:28),[p.t],"s-tb","middle",15,120)}${p.s?txtLines(x,top+36,[p.s],"s-ts","middle",13,120):""}<path d="M${x},${top+ph} V${H-14}" class="s-dash"/></g>`;});
  msgs.forEach((g,j)=>{
    const y=top+ph+34+j*step; const a=cx(idx[g.f]), b=cx(idx[g.t]);
    const cls=g.ty==="async"?"s-async":g.ty==="ret"?"s-dash":"s-line"; const mk=g.ty==="async"?`sq-a${m}`:g.ty==="ret"?`sq-r${m}`:`sq-f${m}`;
    let d; if(a===b){d=`M${a},${y-10} h40 v20 h-40`;} else d=`M${a},${y} L${b+(b>a?-2:2)},${y}`;
    const lx=a===b?a+46:(a+b)/2; const anchor=a===b?"start":"middle";
    s+=`<g data-k="${g.k||("m"+j)}"><path d="${d}" class="${cls}" marker-end="url(#${mk})"/><text x="${lx}" y="${a===b?y+4:y-7}" text-anchor="${anchor}" class="s-t" style="font-size:12px;paint-order:stroke;stroke:var(--surface);stroke-width:4px">${esc((g.n?g.n+". ":"")+g.l)}</text></g>`;
  });
  return s+"</svg>";
}
window.renderSeq=renderSeq; window.renderBoxes=renderBoxes;

/* montar diagramas declarados */
$$("[data-diagram]").forEach(el=>{
  const key=el.dataset.diagram; const spec=D.DIAG[key]; if(!spec){el.textContent="Diagrama no encontrado: "+key;return;}
  el.innerHTML=spec.seq?renderSeq(spec):renderBoxes(spec);
});

/* ---------- visor con zoom ---------- */
function setupViewer(fig){
  const stage=$(".dg-stage",fig), inner=$(".dg-inner",fig); if(!stage||!inner) return;
  if(fig.dataset.h) stage.style.setProperty("--h",fig.dataset.h+"px");
  const tools=document.createElement("div"); tools.className="dg-tools";
  tools.innerHTML=`<button type="button" data-a="in" title="Acercar" aria-label="Acercar">+</button><button type="button" data-a="out" title="Alejar" aria-label="Alejar">−</button><button type="button" data-a="fit" title="Ajustar a la pantalla" aria-label="Ajustar">⤢</button><button type="button" data-a="fs" title="Pantalla completa" aria-label="Pantalla completa">⛶</button>`;
  stage.appendChild(tools);
  const cap=$(".dg-cap",fig); if(cap && !$(".dg-hint",cap)){const h=document.createElement("span");h.className="dg-hint";h.textContent="Ctrl + rueda · doble clic · arrastrar";cap.appendChild(h);}
  const st={s:1,x:0,y:0}; fig._st=st;
  const apply=()=>{inner.style.transform=`translate(${st.x}px,${st.y}px) scale(${st.s})`;};
  fig._apply=apply;
  const zoomAt=(f,px,py)=>{const ns=Math.min(8,Math.max(.15,st.s*f)); const k=ns/st.s; st.x=px-(px-st.x)*k; st.y=py-(py-st.y)*k; st.s=ns; apply();};
  tools.addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return; const r=stage.getBoundingClientRect();
    if(b.dataset.a==="in") zoomAt(1.25,r.width/2,r.height/2); if(b.dataset.a==="out") zoomAt(.8,r.width/2,r.height/2);
    if(b.dataset.a==="fit") fitDiagram(fig);
    if(b.dataset.a==="fs"){fig.classList.toggle("fs"); document.body.style.overflow=fig.classList.contains("fs")?"hidden":""; requestAnimationFrame(()=>fitDiagram(fig));}
  });
  stage.addEventListener("wheel",e=>{ if(!(e.ctrlKey||e.metaKey)) return; e.preventDefault(); const r=stage.getBoundingClientRect(); zoomAt(e.deltaY<0?1.12:.89,e.clientX-r.left,e.clientY-r.top);},{passive:false});
  stage.addEventListener("dblclick",e=>{ if(e.target.closest(".dg-tools")) return; const r=stage.getBoundingClientRect(); zoomAt(e.shiftKey?.6:1.6,e.clientX-r.left,e.clientY-r.top);});
  let drag=null; const pts=new Map();
  stage.addEventListener("pointerdown",e=>{ if(e.target.closest(".dg-tools")) return; stage.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.clientX,e.clientY]); drag={x:e.clientX,y:e.clientY,ox:st.x,oy:st.y}; stage.classList.add("dragging"); fig._pinch=null;});
  stage.addEventListener("pointermove",e=>{ if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){const [p,q]=[...pts.values()]; const dist=Math.hypot(p[0]-q[0],p[1]-q[1]); const r=stage.getBoundingClientRect(); if(fig._pinch){zoomAt(dist/fig._pinch,(p[0]+q[0])/2-r.left,(p[1]+q[1])/2-r.top);} fig._pinch=dist; return;}
    if(drag){st.x=drag.ox+e.clientX-drag.x; st.y=drag.oy+e.clientY-drag.y; apply();}});
  const end=e=>{pts.delete(e.pointerId); if(pts.size===0){drag=null;stage.classList.remove("dragging");fig._pinch=null;}};
  stage.addEventListener("pointerup",end); stage.addEventListener("pointercancel",end);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&fig.classList.contains("fs")){fig.classList.remove("fs");document.body.style.overflow="";fitDiagram(fig);}});
  const img=$("img",inner); if(img && !img.complete) img.addEventListener("load",()=>fitDiagram(fig));
}
function contentSize(inner){
  const svg=$("svg",inner); if(svg){const vb=svg.viewBox.baseVal; return [vb.width||svg.width.baseVal.value, vb.height||svg.height.baseVal.value];}
  const img=$("img",inner); if(img) return [img.naturalWidth||800,img.naturalHeight||500];
  return [inner.scrollWidth,inner.scrollHeight];
}
function fitDiagram(fig){
  const stage=$(".dg-stage",fig), inner=$(".dg-inner",fig); if(!stage||!inner||!fig._st) return;
  const r=stage.getBoundingClientRect(); if(r.width<10) return;
  const [w,h]=contentSize(inner); const s=Math.min((r.width-24)/w,(r.height-24)/h);
  fig._st.s=s; fig._st.x=(r.width-w*s)/2; fig._st.y=(r.height-h*s)/2; fig._apply();
}
window.fitDiagram=fitDiagram;
document.addEventListener("toggle",e=>{const d=e.target; if(d.tagName==="DETAILS"&&d.open) requestAnimationFrame(()=>$$(".dg",d).forEach(fitDiagram));},true);
$$(".dg").forEach(setupViewer);
let rsz; window.addEventListener("resize",()=>{clearTimeout(rsz);rsz=setTimeout(()=>$$("section.view.on .dg").forEach(fitDiagram),120);});

/* ---------- reproductores paso a paso ---------- */
$$("[data-player]").forEach(el=>{
  const P=D.PLAYERS[el.dataset.player]; if(!P) return;
  const fig=el.dataset.target?document.getElementById(el.dataset.target):null;
  el.classList.add("player");
  el.innerHTML=`<div class="player-bar"><button class="btn small" data-a="prev" type="button">← Anterior</button><button class="btn small primary" data-a="next" type="button">Siguiente →</button><button class="btn small" data-a="auto" type="button">▶ Auto</button><div class="steps-dots">${P.steps.map((_,i)=>`<button type="button" data-i="${i}" aria-label="Paso ${i+1}">${i+1}</button>`).join("")}</div></div><div class="step-text" aria-live="polite"></div>`;
  let i=0, timer=null; const seen=new Set();
  const show=()=>{const st=P.steps[i]; seen.add(i);
    $(".step-text",el).innerHTML=`<div class="eyebrow">Paso ${i+1} de ${P.steps.length}${st.tag?" · "+esc(st.tag):""}</div><div class="st">${st.t}</div><div>${st.d}</div>${st.why?`<div class="why"><b>Por qué</b>${st.why}</div>`:""}`;
    $$(".steps-dots button",el).forEach((b,j)=>{b.classList.toggle("on",j===i);b.classList.toggle("seen",seen.has(j));});
    $("[data-a=prev]",el).disabled=i===0; $("[data-a=next]",el).disabled=i===P.steps.length-1;
    if(fig){const box=$(".dg-inner",fig)||fig; box.classList.toggle("hl-dim",!!(st.hl&&st.hl.length)); $$("[data-k]",box).forEach(g=>g.classList.toggle("hl",!!(st.hl&&st.hl.includes(g.dataset.k))));}
    linkify($(".step-text",el));
  };
  el.addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.i!==undefined){i=+b.dataset.i;show();}
    if(b.dataset.a==="prev"&&i>0){i--;show();}
    if(b.dataset.a==="next"&&i<P.steps.length-1){i++;show();}
    if(b.dataset.a==="auto"){ if(timer){clearInterval(timer);timer=null;b.textContent="▶ Auto";} else {b.textContent="❚❚ Pausa"; timer=setInterval(()=>{if(i<P.steps.length-1){i++;show();}else{clearInterval(timer);timer=null;b.textContent="▶ Auto";}},4200);} }
  });
  show();
});

/* ---------- tablas filtrables ---------- */
function renderTable(el){
  const T=D.TABLES[el.dataset.table]; if(!T) return;
  const fk=T.filter; const opts=fk?[...new Set(T.rows.map(r=>r[fk]))]:[];
  const uid="t_"+el.dataset.table;
  el.innerHTML=`<div class="tbl-tools"><input id="${uid}_q" type="search" placeholder="Filtrar ${esc(T.name||"")}…" aria-label="Filtrar tabla">${fk?`<select id="${uid}_f" aria-label="Filtrar por ${esc(T.filterLabel||fk)}"><option value="">${esc(T.filterLabel||"Todos")}: todos</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select>`:""}<span class="tbl-count"></span></div><div class="tbl-wrap" style="margin-top:8px"><table><thead><tr>${T.cols.map(c=>`<th>${esc(c.l)}</th>`).join("")}</tr></thead><tbody></tbody></table></div>`;
  const q=$("input",el), f=$("select",el), tb=$("tbody",el);
  const paint=()=>{const qq=q.value.toLowerCase().trim(), ff=f?f.value:"";
    const rows=T.rows.filter(r=>(!ff||r[fk]===ff)&&(!qq||T.cols.some(c=>String(r[c.k]??"").toLowerCase().includes(qq))));
    tb.innerHTML=rows.map(r=>`<tr>${T.cols.map(c=>`<td${c.num?' class="num"':''}${c.w?` style="min-width:${c.w}px"`:""}>${c.html?r[c.k]:esc(r[c.k]??"")}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${T.cols.length}" class="muted">Sin resultados.</td></tr>`;
    $(".tbl-count",el).textContent=`${rows.length} de ${T.rows.length}`; linkify(tb); glossify(tb,new Set());
  };
  q.addEventListener("input",paint); f&&f.addEventListener("change",paint); paint();
}
$$("[data-table]").forEach(renderTable);

/* ---------- identificadores clicables ---------- */
function textNodes(root){const out=[];const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{if(!n.nodeValue.trim())return NodeFilter.FILTER_REJECT; if(n.parentElement.closest(SKIP))return NodeFilter.FILTER_REJECT; return NodeFilter.FILTER_ACCEPT;}});let n;while(n=w.nextNode())out.push(n);return out;}
function linkify(root){
  textNodes(root).forEach(n=>{const t=n.nodeValue; ID_RE.lastIndex=0; if(!ID_RE.test(t)) return; ID_RE.lastIndex=0;
    const frag=document.createDocumentFragment(); let last=0,m;
    while((m=ID_RE.exec(t))){ if(!IDS[m[1]]) continue; frag.append(t.slice(last,m.index)); const b=document.createElement("button"); b.type="button"; b.className="idref"; b.dataset.id=m[1]; b.textContent=m[1]; frag.append(b); last=m.index+m[1].length;}
    if(last===0) return; frag.append(t.slice(last)); n.replaceWith(frag);});
}
window.linkify=linkify;
views.forEach(v=>linkify(v));
const MENTIONS={}; function computeMentions(){for(const k in MENTIONS) delete MENTIONS[k]; $$(".idref").forEach(b=>{const v=b.closest("section.view"); if(!v) return; (MENTIONS[b.dataset.id]=MENTIONS[b.dataset.id]||new Set()).add(v.id);});}
computeMentions();

/* ---------- glosario con tooltip ---------- */
function glossify(root,used){
  const nodes=textNodes(root).filter(n=>!n.parentElement.closest("h1,h2,h3,h4,.gl,.eyebrow,th,.chip,.fig .n,.no-gl,.step-text .st,.nav,.tabs,.btn,.opt,.fc"));
  nodes.forEach(n=>{let t=n.nodeValue; let m=gRe.exec(t); let guard=0; const frag=document.createDocumentFragment(); let changed=false;
    while(m && guard++<6){const k=termMap[m[1].toLowerCase()]; if(k && !used.has(k)){used.add(k); frag.append(t.slice(0,m.index)); const s=document.createElement("span"); s.className="gl"; s.tabIndex=0; s.dataset.g=k; s.textContent=m[1]; frag.append(s); t=t.slice(m.index+m[1].length); changed=true;} else { frag.append(t.slice(0,m.index+m[1].length)); t=t.slice(m.index+m[1].length);} m=gRe.exec(t);}
    if(changed){frag.append(t); n.replaceWith(frag);}
  });
}
views.forEach(v=>{ if(v.dataset.noGl) return; glossify($(".page",v),new Set()); });

/* ---------- popovers ---------- */
let pop=null, popFor=null, hideT=null;
function closePop(){if(pop){pop.remove();pop=null;popFor=null;}}
function place(el,target){const r=target.getBoundingClientRect(); const pw=el.offsetWidth, ph=el.offsetHeight; let x=Math.min(Math.max(12,r.left),innerWidth-pw-12); let y=r.bottom+8; if(y+ph>innerHeight-10) y=Math.max(10,r.top-ph-8); el.style.left=x+"px"; el.style.top=y+"px";}
function showGloss(target){
  const g=G[target.dataset.g]; if(!g) return; if(popFor===target) return; closePop();
  pop=document.createElement("div"); pop.className="pop"; pop.setAttribute("role","tooltip");
  pop.innerHTML=`<div class="t">${esc(g.t)}</div>${g.en?`<div class="en">en inglés: ${esc(g.en)}</div>`:""}<div>${g.d}</div>${g.ex?`<div class="ex"><b>Ejemplo</b><br>${g.ex}</div>`:""}${g.p?`<div class="refs">En tu proyecto: ${g.p}</div>`:""}`;
  document.body.appendChild(pop); popFor=target; place(pop,target);
  pop.addEventListener("mouseenter",()=>clearTimeout(hideT)); pop.addEventListener("mouseleave",()=>{hideT=setTimeout(closePop,150);});
}
function showId(target){
  const id=target.dataset.id, it=IDS[id]; if(!it) return; closePop();
  const ment=[...(MENTIONS[id]||[])].map(v=>{const s=document.getElementById(v); return `<a data-go="${v.slice(2)}">${esc(s?s.dataset.title:v)}</a>`;}).join(" · ");
  pop=document.createElement("div"); pop.className="pop"; pop.setAttribute("role","dialog");
  pop.innerHTML=`<button class="x" aria-label="Cerrar">×</button><div class="en">${esc(it.type)} · ${esc(it.src||"Taller 4")}</div><div class="t">${esc(id)} — ${esc(it.title)}</div><div>${it.text}</div>${ment?`<div class="refs">Mencionado en: ${ment}</div>`:""}`;
  document.body.appendChild(pop); popFor=target; place(pop,target);
  linkify(pop);
}
document.addEventListener("mouseover",e=>{const g=e.target.closest(".gl"); if(g&&matchMedia("(hover:hover)").matches){clearTimeout(hideT);showGloss(g);}});
document.addEventListener("mouseout",e=>{const g=e.target.closest(".gl"); if(g&&pop&&popFor===g){hideT=setTimeout(closePop,180);}});
document.addEventListener("focusin",e=>{const g=e.target.closest(".gl"); if(g) showGloss(g);});
document.addEventListener("click",e=>{
  const g=e.target.closest(".gl"); if(g){ if(popFor===g&&!matchMedia("(hover:hover)").matches){closePop();} else showGloss(g); return;}
  const b=e.target.closest(".idref"); if(b){e.stopPropagation(); if(popFor===b) closePop(); else showId(b); return;}
  const a=e.target.closest("[data-go]"); if(a){closePop(); location.hash=a.dataset.go; return;}
  if(e.target.closest(".x")){closePop();return;}
  if(pop && !e.target.closest(".pop")) closePop();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape") closePop();});
window.addEventListener("scroll",()=>{if(pop&&popFor&&popFor.classList.contains("gl")) closePop();},{passive:true});

/* ---------- pestañas ---------- */
$$("[data-tabs]").forEach(t=>{
  const btns=$$(":scope > .tabs button",t), panels=$$(":scope > .tabpanel",t);
  const sel=i=>{btns.forEach((b,j)=>b.setAttribute("aria-selected",j===i)); panels.forEach((p,j)=>p.hidden=j!==i); requestAnimationFrame(()=>$$(".dg",panels[i]).forEach(fitDiagram));};
  btns.forEach((b,i)=>{b.type="button";b.setAttribute("role","tab");b.addEventListener("click",()=>sel(i));}); sel(0);
});

/* ---------- buscador global ---------- */
const IDX=[];
views.forEach(v=>{
  const title=v.dataset.title;
  $$("h2,h3,h4",v).forEach(h=>{ if(!h.id) h.id=v.id+"-h"+IDX.length; let txt="",n=h.nextElementSibling,c=0; while(n&&c<3&&!/^H[234]$/.test(n.tagName)){txt+=" "+n.textContent;n=n.nextElementSibling;c++;}
    IDX.push({k:"Sección · "+title,t:h.textContent,s:txt.replace(/\s+/g," ").trim().slice(0,220),go:v.id.slice(2),a:h.id});});
});
Object.entries(G).forEach(([k,g])=>IDX.push({k:"Glosario",t:g.t+(g.en?" ("+g.en+")":""),s:g.d.replace(/<[^>]+>/g,""),go:"glosario",a:"g-"+k}));
Object.entries(IDS).forEach(([k,it])=>IDX.push({k:"Identificador · "+it.type,t:k+" — "+it.title,s:it.text.replace(/<[^>]+>/g,""),id:k}));
const sIn=$("#q"), sOut=$("#sres");
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function hl(s,q){const i=norm(s).indexOf(q); if(i<0) return esc(s); return esc(s.slice(0,i))+"<mark>"+esc(s.slice(i,i+q.length))+"</mark>"+esc(s.slice(i+q.length));}
sIn.addEventListener("input",()=>{
  const q=norm(sIn.value.trim()); if(q.length<2){sOut.hidden=true;return;}
  const res=IDX.map(r=>{const a=norm(r.t).indexOf(q), b=norm(r.s).indexOf(q); return {r,score:a===0?0:a>0?1:b>=0?2:9};}).filter(x=>x.score<9).sort((a,b)=>a.score-b.score).slice(0,14);
  sOut.innerHTML=res.length?res.map((x,i)=>`<a data-i="${IDX.indexOf(x.r)}" class="${i===0?"sel":""}"><span class="k">${esc(x.r.k)}</span><span>${hl(x.r.t,q)}</span><span class="s">${hl(x.r.s.slice(0,140),q)}</span></a>`).join(""):`<div class="muted small" style="padding:10px">Sin resultados para “${esc(sIn.value)}”.</div>`;
  sOut.hidden=false;
});
function openRes(i){const r=IDX[i]; sOut.hidden=true; sIn.value="";
  if(r.id){location.hash="taller4"; setTimeout(()=>{const b=$$(`#v-taller4 .idref[data-id="${r.id}"]`).find(x=>x.offsetParent); if(b){b.scrollIntoView({block:"center"}); setTimeout(()=>showId(b),250);} else {showId({dataset:{id:r.id},getBoundingClientRect:()=>sIn.getBoundingClientRect()});}},80); return;}
  location.hash=r.go+(r.a?"."+r.a:"");}
sOut.addEventListener("click",e=>{const a=e.target.closest("a[data-i]"); if(a) openRes(+a.dataset.i);});
sIn.addEventListener("keydown",e=>{const items=$$("a[data-i]",sOut); let k=items.findIndex(a=>a.classList.contains("sel"));
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault(); if(!items.length) return; items[k]?.classList.remove("sel"); k=(k+(e.key==="ArrowDown"?1:-1)+items.length)%items.length; items[k].classList.add("sel"); items[k].scrollIntoView({block:"nearest"});}
  if(e.key==="Enter"&&items[k]) openRes(+items[k].dataset.i);
  if(e.key==="Escape"){sOut.hidden=true;}
});
document.addEventListener("click",e=>{if(!e.target.closest(".search")) sOut.hidden=true;});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!e.target.closest("input,textarea,select")){e.preventDefault();sIn.focus();}});

/* ---------- glosario completo ---------- */
(function(){const el=$("#glossList"); if(!el) return;
  const items=Object.entries(G).sort((a,b)=>a[1].t.localeCompare(b[1].t,"es"));
  el.innerHTML=`<div class="tbl-tools"><input id="gq" type="search" placeholder="Buscar término…" aria-label="Buscar en el glosario"><span class="tbl-count"></span></div><div class="grid2" id="gcards" style="margin-top:10px"></div>`;
  const paint=()=>{const q=norm($("#gq").value); const f=items.filter(([k,g])=>!q||norm(g.t+" "+(g.en||"")+" "+g.d).includes(q));
    $("#gcards").innerHTML=f.map(([k,g])=>`<div class="card no-gl" id="g-${k}" style="display:grid;gap:6px"><div><b style="font-family:var(--f-display);font-size:16px">${esc(g.t)}</b>${g.en?` <span class="muted mono small">${esc(g.en)}</span>`:""}</div><div class="small">${g.d}</div>${g.ex?`<div class="small muted"><b>Ejemplo:</b> ${g.ex}</div>`:""}</div>`).join("");
    $(".tbl-count",el).textContent=`${f.length} términos`;};
  $("#gq").addEventListener("input",paint); paint();
})();

/* ---------- quiz ---------- */
(function(){const el=$("#quizBox"); if(!el) return; const Q=D.QUIZ;
  const secs=[...new Set(Q.map(q=>q.s))];
  const secTitle=s=>{const v=document.getElementById("v-"+s); return v?v.dataset.title:s;};
  el.innerHTML=`<div class="tbl-tools"><select id="qsec" aria-label="Tema del quiz"><option value="">Todos los temas (${Q.length})</option>${secs.map(s=>`<option value="${s}">${esc(secTitle(s))} (${Q.filter(q=>q.s===s).length})</option>`).join("")}</select><label class="small"><input type="checkbox" id="qwrong"> Solo las que fallé o no he respondido</label><button class="btn small" id="qshuf" type="button">Barajar</button></div><div class="card q" id="qcard" style="margin-top:12px"></div>`;
  let list=[],i=0;
  const build=()=>{const s=$("#qsec").value, w=$("#qwrong").checked; list=Q.map((q,j)=>j).filter(j=>(!s||Q[j].s===s)&&(!w||S.quiz[j]!==true)); i=0; show();};
  const show=()=>{const c=$("#qcard"); if(!list.length){c.innerHTML=`<p>¡No quedan preguntas en este filtro! Cambia el tema o desmarca el filtro.</p>`;return;}
    const j=list[i], q=Q[j]; const done=Object.keys(S.quiz).filter(k=>list.includes(+k)); const ok=done.filter(k=>S.quiz[k]).length;
    c.innerHTML=`<div class="qmeta"><span>Pregunta ${i+1} / ${list.length} · ${esc(secTitle(q.s))}</span><span>Aciertos en este filtro: ${ok}/${list.length}</span></div><div class="qtext">${q.q}</div><div class="opts">${q.o.map((o,k)=>`<button type="button" class="opt" data-k="${k}"><span class="l">${"ABCDE"[k]}</span><span>${o}</span></button>`).join("")}</div><div class="explain" hidden></div><div class="player-bar"><button class="btn small" id="qprev" type="button" ${i===0?"disabled":""}>← Anterior</button><button class="btn small primary" id="qnext" type="button" ${i===list.length-1?"disabled":""}>Siguiente →</button><a class="btn small" href="#${q.s}">Repasar el tema</a></div>`;
    $$(".opt",c).forEach(b=>b.addEventListener("click",()=>{const k=+b.dataset.k; S.quiz[j]=k===q.a; save(); renderProgress();
      $$(".opt",c).forEach((x,xi)=>{x.disabled=true; if(xi===q.a)x.classList.add("right"); else if(xi===k)x.classList.add("wrong");});
      const ex=$(".explain",c); ex.hidden=false; ex.innerHTML=`<b>${k===q.a?"Correcto.":"No es correcta."}</b> ${q.e}`; linkify(ex); glossify(ex,new Set());}));
    $("#qprev").onclick=()=>{i--;show();}; $("#qnext").onclick=()=>{i++;show();};
    linkify(c);
  };
  $("#qsec").addEventListener("change",build); $("#qwrong").addEventListener("change",build);
  $("#qshuf").addEventListener("click",()=>{for(let k=list.length-1;k>0;k--){const r=Math.floor(Math.random()*(k+1));[list[k],list[r]]=[list[r],list[k]];} i=0; show();});
  build();
})();

/* ---------- tarjetas de memoria ---------- */
(function(){const el=$("#cardsBox"); if(!el) return; const C=D.CARDS;
  const secs=[...new Set(C.map(c=>c.s))]; const secTitle=s=>{const v=document.getElementById("v-"+s); return v?v.dataset.title:s;};
  el.innerHTML=`<div class="tbl-tools"><select id="csec" aria-label="Tema de las tarjetas"><option value="">Todos los temas (${C.length})</option>${secs.map(s=>`<option value="${s}">${esc(secTitle(s))}</option>`).join("")}</select><label class="small"><input type="checkbox" id="conly"> Solo las que debo repasar</label><span class="tbl-count"></span></div>
  <div class="fc-wrap" style="margin-top:12px"><div class="fc" id="fc" tabindex="0" role="button" aria-label="Voltear tarjeta"><div class="front"></div><div class="back"></div></div></div>
  <div class="player-bar" style="margin-top:10px"><button class="btn small" id="cprev" type="button">←</button><button class="btn small" id="cflip" type="button">Voltear</button><button class="btn small" id="cnext" type="button">→</button><span style="flex:1"></span><button class="btn small" id="crev" type="button">Repasar otra vez</button><button class="btn small primary" id="cknow" type="button">La sé ✓</button></div>`;
  let list=[],i=0; const fc=$("#fc");
  const build=()=>{const s=$("#csec").value,o=$("#conly").checked; list=C.map((c,j)=>j).filter(j=>(!s||C[j].s===s)&&(!o||S.cards[j]!==true)); i=0; show();};
  const show=()=>{fc.classList.remove("flip"); if(!list.length){$(".front",fc).innerHTML="<div>Sin tarjetas en este filtro.</div>";$(".back",fc).innerHTML="";return;}
    const c=C[list[i]]; $(".front",fc).innerHTML=`<div class="eyebrow">${esc(secTitle(c.s))} · ${i+1}/${list.length}</div><div class="ft">${c.f}</div><div class="muted small">Toca para ver la respuesta</div>`; $(".back",fc).innerHTML=`<div>${c.b}</div>`;
    const known=list.filter(j=>S.cards[j]===true).length; $(".tbl-count",el).textContent=`Sabidas: ${known}/${list.length}`;};
  const flip=()=>fc.classList.toggle("flip");
  fc.addEventListener("click",flip); fc.addEventListener("keydown",e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();flip();}});
  $("#cflip").onclick=flip; $("#cprev").onclick=()=>{if(i>0){i--;show();}}; $("#cnext").onclick=()=>{if(i<list.length-1){i++;show();}};
  $("#cknow").onclick=()=>{if(!list.length)return; S.cards[list[i]]=true;save();renderProgress(); if(i<list.length-1){i++;} show();};
  $("#crev").onclick=()=>{if(!list.length)return; S.cards[list[i]]=false;save();renderProgress(); if(i<list.length-1){i++;} show();};
  $("#csec").addEventListener("change",build); $("#conly").addEventListener("change",build); build();
})();

/* ---------- progreso ---------- */
function renderProgress(){
  const el=$("#progBox"); const Q=D.QUIZ,C=D.CARDS;
  const rows=views.filter(v=>!v.dataset.noDone).map(v=>{const s=v.id.slice(2); const qs=Q.map((q,j)=>j).filter(j=>Q[j].s===s); const ok=qs.filter(j=>S.quiz[j]===true).length; const cs=C.map((c,j)=>j).filter(j=>C[j].s===s); const ck=cs.filter(j=>S.cards[j]===true).length;
    const parts=[S.read[v.id]?1:0]; if(qs.length) parts.push(ok/qs.length); if(cs.length) parts.push(ck/cs.length); const pct=Math.round(parts.reduce((a,b)=>a+b,0)/parts.length*100);
    return {v,pct,ok,qn:qs.length,ck,cn:cs.length};});
  const tot=Math.round(rows.reduce((a,r)=>a+r.pct,0)/rows.length);
  const top=$("#topProg"); if(top){top.style.width=tot+"%"; top.parentElement.title=`Progreso global: ${tot}%`; $("#topProgTxt").textContent=tot+"%";}
  if(!el) return;
  el.innerHTML=`<div class="card" style="display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:baseline"><h3>Progreso global</h3><span class="mono" style="font-size:22px;font-weight:600">${tot}%</span></div><div class="bar"><i style="width:${tot}%"></i></div><p class="small muted">Cada sección combina: marcada como estudiada + % de aciertos en su quiz + % de tarjetas que ya sabes. Se guarda solo en este navegador.</p></div>
  <div class="card" style="margin-top:12px">${rows.map(r=>`<div class="prog-row"><a href="#${r.v.id.slice(2)}">${esc(r.v.dataset.title)}</a><div class="bar"><i style="width:${r.pct}%"></i></div><span class="v">${r.pct}%</span><span class="small muted" style="grid-column:1/-1;margin-top:-4px">${S.read[r.v.id]?"✓ estudiada":"sin marcar"}${r.qn?` · quiz ${r.ok}/${r.qn}`:""}${r.cn?` · tarjetas ${r.ck}/${r.cn}`:""}</span></div>`).join("")}</div>
  <p style="margin-top:12px"><button class="btn small" id="resetProg" type="button">Borrar mi progreso</button> <span id="resetMsg" class="small muted"></span></p>`;
  $("#resetProg").onclick=function(){ if(this.dataset.c!=="1"){this.dataset.c="1";this.textContent="Confirmar: borrar todo";$("#resetMsg").textContent="Pulsa otra vez para confirmar.";return;} S={read:{},quiz:{},cards:{}};save();buildNav();route2();renderProgress();};
}
window.renderProgress=renderProgress;

/* ---------- simuladores ---------- */
window.SIMS && window.SIMS.forEach(f=>{try{f({$,$$,esc,D,linkify,glossify,fitDiagram});}catch(e){console.error("sim",e);}});

renderProgress();
route();
})();
