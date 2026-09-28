/* ===================== Simuladores ===================== */
window.SIMS=[];

/* ---- árboles de tácticas (HTML) ---- */
SIMS.push(({$$,esc,D})=>{
  $$("[data-tactree]").forEach(el=>{
    const a=el.dataset.tactree; const rows=D.TACTICS.filter(r=>r[0]===a); const groups={};
    rows.forEach(r=>(groups[r[1]]=groups[r[1]]||[]).push(r));
    el.innerHTML=`<div class="grid3">${Object.entries(groups).map(([g,rs])=>`<div class="card flat" style="padding:14px"><div class="eyebrow" style="margin-bottom:8px">${esc(g)}</div><ul style="margin:0;padding-left:18px;display:grid;gap:6px;font-size:14px">${rs.map(r=>`<li><b>${esc(r[2])}</b><br><span class="muted small">${esc(r[3])}</span></li>`).join("")}</ul></div>`).join("")}</div>`;
  });
});

/* ---- constructor de escenarios ---- */
SIMS.push(({$,esc})=>{
  const root=$("#simEsc"); if(!root) return;
  const F=[["src","Fuente del estímulo","¿Quién o qué lo provoca?"],["stim","Estímulo","¿Qué evento llega?"],["art","Artefacto","¿Qué parte del sistema lo recibe?"],["env","Entorno","¿En qué condiciones?"],["resp","Respuesta","¿Qué hace el sistema/equipo?"],["meas","Medida de respuesta","¿Con qué número se verifica?"]];
  const EX={
    qa01:{src:"Nodo interno del servicio",stim:"El nodo deja de responder",art:"Servicio de Gestión de Desastres",env:"Emergencia activa con carga alta",resp:"Detecta el fallo, retira el nodo del balanceo y redirige el tráfico sin perder solicitudes confirmadas",meas:"Detección en 10 s o menos; 0 solicitudes confirmadas perdidas; disponibilidad mensual ≥ 99,95 %"},
    qa04:{src:"Administrador",stim:"Incorporar un nuevo tipo de desastre con atributos y estados propios",art:"Catálogo de tipos",env:"Configuración, con el sistema en operación",resp:"El tipo queda disponible sin modificar los demás componentes",meas:"≤ 1 día-persona; 0 componentes recompilados; 0 minutos de indisponibilidad"},
    bass:{src:"Empleado descontento en una ubicación remota",stim:"Intenta modificar indebidamente la tabla de tarifas de pago",art:"Datos del sistema (base de datos)",env:"Operación normal",resp:"Se detecta el acceso no autorizado y el sistema mantiene una pista de auditoría",meas:"Los datos correctos se restauran en un día"},
    malo:{src:"Usuarios",stim:"Muchos usuarios",art:"El sistema",env:"",resp:"El sistema debe ser rápido y escalable",meas:"Buen rendimiento"},
  };
  root.innerHTML=`<div class="player-bar"><span class="small muted">Cargar ejemplo:</span><button class="btn small" data-ex="qa01" type="button">QA-01 disponibilidad</button><button class="btn small" data-ex="qa04" type="button">QA-04 modificabilidad</button><button class="btn small" data-ex="bass" type="button">Bass: seguridad</button><button class="btn small" data-ex="malo" type="button">Uno mal escrito</button><button class="btn small" data-ex="clear" type="button">Vaciar</button></div>
  <div class="grid2" style="margin-top:12px">${F.map(([k,l,h])=>`<div class="field"><label for="se_${k}">${l}</label><textarea id="se_${k}" rows="2"></textarea><span class="hint">${h}</span></div>`).join("")}</div>
  <div class="field" style="margin-top:10px"><label for="se_qa">Atributo</label><select id="se_qa"><option>Disponibilidad</option><option>Desempeño</option><option>Escalabilidad</option><option>Modificabilidad</option><option>Seguridad</option><option>Integrabilidad / interoperabilidad</option><option>Usabilidad</option><option>Testabilidad</option><option>Safety</option><option>Desplegabilidad</option><option>Eficiencia energética</option></select></div>
  <div class="card" style="margin-top:12px;display:grid;gap:10px"><div class="eyebrow">Tu escenario en una frase</div><div id="se_out" style="font-size:15.5px"></div><div class="eyebrow">Revisión automática</div><div class="feedback" id="se_fb"></div><div class="small muted">La revisión es heurística: busca que cada parte exista, que la medida tenga números y unidades, y que no uses palabras vagas. Un profesor también revisará que el estímulo corresponda al atributo.</div></div>`;
  const vague=/\b(r[aá]pid[oa]|f[aá]cil|escalable|bueno|buen|adecuad[oa]|eficiente|robust[oa]|seguro|siempre|muchos|optimo|óptimo)\b/i;
  const unit=/(\d).*?(ms|s\b|seg|min|hora|h\b|d[ií]a|semana|%|usuarios|peticiones|transacciones|persona|req|tps|nueves|veces|mb|gb|kwh|w\b)|\b0\b|cero/i;
  const val=k=>$("#se_"+k).value.trim();
  const paint=()=>{
    const v={}; F.forEach(([k])=>v[k]=val(k));
    $("#se_out").innerHTML=(v.src||v.stim)?`Cuando <b>${esc(v.src||"[fuente]")}</b> provoca que <b>${esc(v.stim||"[estímulo]")}</b> sobre <b>${esc(v.art||"[artefacto]")}</b> durante <b>${esc(v.env||"[entorno]")}</b>, el sistema <b>${esc(v.resp||"[respuesta]")}</b>, medido como <b>${esc(v.meas||"[medida]")}</b>.`:`<span class="muted">Escribe o carga un ejemplo.</span>`;
    const fb=[];
    F.forEach(([k,l])=>{ if(!v[k]) fb.push(["bad",`Falta: ${l}.`]); });
    if(v.meas){ if(!unit.test(v.meas)) fb.push(["bad","La medida no tiene número con unidad (s, ms, %, días-persona, usuarios…). Sin eso no se puede verificar."]); else fb.push(["good","La medida es cuantitativa."]); }
    ["resp","meas"].forEach(k=>{ if(v[k]&&vague.test(v[k])) fb.push(["meh",`“${v[k].match(vague)[0]}” es vago en ${k==="resp"?"la respuesta":"la medida"}: cámbialo por algo observable.`]); });
    if(v.art && /^el sistema$/i.test(v.art)) fb.push(["meh","Artefacto = “el sistema” es válido pero impreciso; nombra la parte (servicio, catálogo, adaptador…)."]);
    if(v.env && v.env.length<6) fb.push(["meh","El entorno es muy corto; ¿operación normal, pico, degradado, en desarrollo?"]);
    const qa=$("#se_qa").value;
    if(/Modificabilidad|Desplegabilidad|Testabilidad/.test(qa) && v.env && !/desarroll|dise[ñn]o|configura|compila|prueba|despliegue|build|mantenimiento/i.test(v.env)) fb.push(["meh",`Para ${qa} el entorno suele ser de desarrollo, diseño, configuración o despliegue.`]);
    if(/Disponibilidad/.test(qa) && v.stim && !/fall|ca[ií]d|deja de|no respond|error|crash|omisi|timeout|tiempo/i.test(v.stim)) fb.push(["meh","En disponibilidad el estímulo típico es una falla: omisión, caída, tiempo incorrecto o respuesta incorrecta."]);
    if(/Seguridad/.test(qa) && v.stim && !/ataque|intenta|acceso|no autoriz|robo|modificar|malicios|suplant/i.test(v.stim)) fb.push(["meh","En seguridad el estímulo suele ser un ataque o intento de acceso no autorizado."]);
    if(!fb.some(f=>f[0]!=="good") && F.every(([k])=>v[k])) fb.push(["good","Las 6 partes están presentes. ¡Listo para un examen!"]);
    $("#se_fb").innerHTML=fb.map(([c,t])=>`<div class="fb ${c}"><i>${c==="good"?"bien":c==="bad"?"falta":"mejora"}</i><span>${esc(t)}</span></div>`).join("");
  };
  root.addEventListener("input",paint); root.addEventListener("change",paint);
  root.addEventListener("click",e=>{const b=e.target.closest("[data-ex]"); if(!b) return; const ex=EX[b.dataset.ex]||{}; F.forEach(([k])=>$("#se_"+k).value=ex[k]||"");
    $("#se_qa").value=b.dataset.ex==="qa04"?"Modificabilidad":b.dataset.ex==="bass"?"Seguridad":b.dataset.ex==="malo"?"Desempeño":"Disponibilidad"; paint();});
  F.forEach(([k])=>$("#se_"+k).value=EX.qa01[k]); paint();
});

/* ---- calculadora de disponibilidad ---- */
SIMS.push(({$,esc})=>{
  const root=$("#simDisp"); if(!root) return;
  root.innerHTML=`<div class="grid2"><div class="field"><label for="d_mtbf">MTBF (horas entre fallas)</label><input id="d_mtbf" type="number" min="1" step="1" value="720"></div><div class="field"><label for="d_mttr">MTTR (horas para reparar)</label><input id="d_mttr" type="number" min="0" step="0.01" value="0.36"></div></div>
  <div class="card" style="margin-top:12px;display:grid;gap:8px"><div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px"><span class="eyebrow">Disponibilidad = MTBF / (MTBF + MTTR)</span><span id="d_a" class="mono" style="font-size:26px;font-weight:600"></span></div><div class="bar"><i id="d_bar"></i></div><div id="d_txt" class="small"></div></div>
  <div class="field" style="margin-top:14px"><label for="d_goal">Objetivo de disponibilidad (%)</label><input id="d_goal" type="number" min="90" max="99.9999" step="0.001" value="99.95"><span class="hint">¿Cuánto tiempo caído permite? (El Taller 4 usa 99,95 % → 21,9 min/mes)</span></div>
  <div id="d_goal_out" class="note" style="margin-top:8px"></div>
  <div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>Disponibilidad</th><th class="num">Caída por año</th><th class="num">Caída por mes (30,4 d)</th></tr></thead><tbody id="d_tbl"></tbody></table></div>`;
  const fmt=m=>m>=1440?(m/1440).toFixed(2)+" días":m>=60?(m/60).toFixed(2)+" h":m>=1?m.toFixed(1)+" min":(m*60).toFixed(1)+" s";
  const paint=()=>{const a=+$("#d_mtbf").value, r=+$("#d_mttr").value; const A=a>0?a/(a+r):0; const pct=A*100;
    $("#d_a").textContent=pct.toFixed(4).replace(".",",")+" %"; $("#d_bar").style.width=Math.max(0,Math.min(100,(pct-90)*10))+"%";
    const yearDown=(1-A)*525600; const nines=A<1?Math.floor(-Math.log10(1-A)+1e-9):"∞";
    $("#d_txt").innerHTML=`≈ <b>${nines}</b> nueves · caída esperada ≈ <b>${fmt(yearDown)}</b>/año, <b>${fmt(yearDown/12)}</b>/mes. ${pct>=99.999?"Alta disponibilidad (≥ 5 nueves).":"Para 5 nueves con este MTBF, el MTTR debería ser ≤ "+fmt(a*60*(1/0.99999-1))+"."}<br><span class="muted">Barra: escala 90 % → 100 %.</span>`;
    const g=+$("#d_goal").value/100; const allowYear=(1-g)*525600;
    $("#d_goal_out").innerHTML=`<b>Presupuesto de caída:</b> ${fmt(allowYear)}/año · ${fmt(allowYear/12)}/mes · ${fmt(allowYear/52)}/semana. ${A>=g?"Tu MTBF/MTTR <b>cumplen</b> el objetivo.":"Tu MTBF/MTTR <b>no cumplen</b>: aumenta MTBF (prevenir) o baja MTTR (detectar y recuperar más rápido)."}`;
    $("#d_tbl").innerHTML=[0.99,0.999,0.9995,0.9999,0.99999].map(x=>`<tr${Math.abs(x-g)<1e-9?' style="background:var(--accent-soft)"':''}><td>${(x*100).toString().replace(".",",")} %</td><td class="num">${fmt((1-x)*525600)}</td><td class="num">${fmt((1-x)*43800)}</td></tr>`).join("");};
  root.addEventListener("input",paint); paint();
});

/* ---- simulador heartbeat + cortacircuitos ---- */
SIMS.push(({$,esc})=>{
  const root=$("#simCB"); if(!root) return;
  root.innerHTML=`<div class="grid2">
   <div class="card" style="display:grid;gap:10px"><h4>Sistema hospitalario externo</h4><label class="small"><input type="checkbox" id="cb_down"> Está caído</label>
     <div class="range-row"><label for="cb_thr">Umbral de fallos</label><input id="cb_thr" type="range" min="1" max="6" value="3"><output id="cb_thr_o">3</output></div>
     <div class="range-row"><label for="cb_wait">Espera antes de sonda (ticks)</label><input id="cb_wait" type="range" min="2" max="10" value="5"><output id="cb_wait_o">5</output></div>
     <div class="statebox"><div data-s="CERRADO">CERRADO</div><div data-s="ABIERTO">ABIERTO</div><div data-s="SEMIABIERTO">SEMI-<br>ABIERTO</div></div>
     <div class="small" id="cb_stats"></div></div>
   <div class="card" style="display:grid;gap:10px"><h4>Nodo GD-Consulta #2 (heartbeat)</h4><label class="small"><input type="checkbox" id="hb_down"> El nodo se cuelga</label>
     <div class="range-row"><label for="hb_miss">Latidos perdidos para declarar falla</label><input id="hb_miss" type="range" min="1" max="5" value="2"><output id="hb_miss_o">2</output></div>
     <div class="statebox" style="grid-template-columns:repeat(3,1fr)"><div id="hb_n1" class="on">Nodo 1</div><div id="hb_n2" class="on">Nodo 2</div><div id="hb_n3" class="on">Nodo 3</div></div>
     <div class="small" id="hb_stats"></div></div></div>
  <div class="player-bar" style="margin-top:10px"><button class="btn small primary" id="cb_run" type="button">▶ Iniciar</button><button class="btn small" id="cb_step" type="button">Un tick</button><button class="btn small" id="cb_reset" type="button">Reiniciar</button><span class="small muted">1 tick ≈ 6 s simulados. Cada tick llega 1 petición al adaptador y cada nodo envía un latido.</span></div>
  <div class="log" id="cb_log" aria-live="polite" style="margin-top:8px"></div>`;
  let st,timer=null;
  const reset=()=>{st={t:0,state:"CERRADO",fails:0,openedAt:0,ok:0,fast:0,slow:0,pending:0,last:[0,0,0],removed:[false,false,false]}; $("#cb_log").innerHTML=""; paint(); log("Listo. Marca “Está caído” y dale ▶ para ver el cortacircuitos.","o");};
  const log=(m,c="")=>{const d=document.createElement("div"); d.className=c; d.textContent=`t=${String(st.t).padStart(2,"0")}  ${m}`; const L=$("#cb_log"); L.appendChild(d); L.scrollTop=L.scrollHeight;};
  const paint=()=>{root.querySelectorAll(".statebox div[data-s]").forEach(d=>d.classList.toggle("on",d.dataset.s===st.state));
    $("#cb_stats").innerHTML=`Respuestas OK: <b>${st.ok}</b> · Esperas por timeout (800 ms): <b>${st.slow}</b> · Fallas rápidas (circuito abierto): <b>${st.fast}</b> · Pendientes en cola de reconciliación: <b>${st.pending}</b>`;
    [0,1,2].forEach(i=>{const e=$("#hb_n"+(i+1)); e.classList.toggle("on",!st.removed[i]); e.style.textDecoration=st.removed[i]?"line-through":"";});
    $("#hb_stats").innerHTML=`Nodos en el balanceador: <b>${st.removed.filter(x=>!x).length}/3</b>`;
    ["thr","wait"].forEach(k=>$("#cb_"+k+"_o").textContent=$("#cb_"+k).value); $("#hb_miss_o").textContent=$("#hb_miss").value;};
  const tick=()=>{st.t++; const down=$("#cb_down").checked, thr=+$("#cb_thr").value, wait=+$("#cb_wait").value;
    if(st.state==="ABIERTO"){ if(st.t-st.openedAt>=wait){st.state="SEMIABIERTO"; log("Espera cumplida → SEMIABIERTO: se deja pasar una sonda.","w");} else {st.fast++; st.pending++; log("Circuito ABIERTO: respuesta degradada inmediata (último valor + antigüedad). Actualización a la cola.","w");} }
    else if(st.state==="SEMIABIERTO"){ if(down){st.state="ABIERTO"; st.openedAt=st.t; st.slow++; log("Sonda falló → vuelve a ABIERTO.","e");} else {st.state="CERRADO"; st.fails=0; st.ok++; log("Sonda OK → CERRADO.","o"); if(st.pending){log(`Reconciliación: reenviando ${st.pending} actualizaciones en orden (idempotente).`,"o"); st.pending=0;}} }
    else if(st.state==="CERRADO"){ if(down){st.fails++; st.slow++; st.pending++; log(`Petición esperó 800 ms y falló (${st.fails}/${thr}).`,"e"); if(st.fails>=thr){st.state="ABIERTO"; st.openedAt=st.t; log(`Umbral alcanzado → circuito ABIERTO.`,"e");}} else {st.fails=0; st.ok++; log("Petición OK.","o"); if(st.pending){log(`Reconciliación: ${st.pending} pendientes aplicadas.`,"o"); st.pending=0;}} }
    const miss=+$("#hb_miss").value; const n2down=$("#hb_down").checked;
    [0,1,2].forEach(i=>{const alive=!(i===1&&n2down); if(alive){ if(st.removed[i]){st.removed[i]=false; log(`Nodo ${i+1} vuelve a latir → reintroducido al balanceador.`,"o");} st.last[i]=st.t; } else if(!st.removed[i] && st.t-st.last[i]>=miss){st.removed[i]=true; log(`Nodo ${i+1}: ${miss} latido(s) perdidos → retirado del balanceo (QA-01).`,"e");}});
    paint();};
  $("#cb_run").onclick=function(){ if(timer){clearInterval(timer);timer=null;this.textContent="▶ Iniciar";} else {timer=setInterval(tick,900); this.textContent="❚❚ Pausar";} };
  $("#cb_step").onclick=tick; $("#cb_reset").onclick=reset; root.addEventListener("input",paint);
  reset();
});

/* ---- matriz del Taller 3 con pesos ---- */
SIMS.push(({$,esc})=>{
  const root=$("#simMatriz"); if(!root) return;
  const A=["Disponibilidad","Seguridad (CIA)","Desempeño","Escalabilidad","Modificabilidad","Mantenibilidad","Reutilización y portabilidad","Interoperabilidad","Simplicidad y costo"];
  const R=[["Flujo de Datos",2,3,3,2,3,4,5,3,5],["Centrado en Datos",2,3,3,2,2,3,3,3,4],["Llamada y Retorno",1,2,5,1,1,3,2,1,5],["Orientado a Objetos",2,3,3,2,3,3,4,2,4],["Microkernel",2,3,3,1,4,3,4,3,5],["Basado en Eventos",4,3,4,5,5,3,4,4,2],["Basado en Servicios",3,4,2,4,3,2,5,5,1],["Basado en la Nube",5,4,3,5,5,4,4,4,2],["Distribuido / P2P",5,3,4,4,4,2,3,3,3]];
  const P={base:[1,1,1,1,1,1,1,1,1],desastres:[3,2,2,3,2,1,0,3,1],academico:[1,2,1,0,2,3,1,1,3],banco:[2,3,1,1,1,1,0,1,1],iot:[2,1,3,3,1,1,0,1,1]};
  root.innerHTML=`<div class="player-bar"><span class="small muted">Pesos de ejemplo:</span><button class="btn small" data-p="base" type="button">Todos = 1 (taller)</button><button class="btn small" data-p="desastres" type="button">Gestión de desastres</button><button class="btn small" data-p="academico" type="button">Sistema académico</button><button class="btn small" data-p="banco" type="button">Banco</button><button class="btn small" data-p="iot" type="button">Monitoreo IoT</button></div>
  <div class="grid2" style="margin-top:12px"><div class="card" style="display:grid;gap:8px">${A.map((a,i)=>`<div class="range-row"><label for="mw${i}">${esc(a)}</label><input id="mw${i}" type="range" min="0" max="3" step="1" value="1"><output id="mw${i}o">1</output></div>`).join("")}<p class="small muted">0 = no importa · 3 = crítico. Puntaje = Σ(peso × calificación) / Σ pesos.</p></div>
  <div class="card" style="display:grid;gap:10px"><div class="eyebrow">Ranking de estilos</div><div class="meter-list" id="m_out"></div><div id="m_why" class="small"></div></div></div>`;
  const paint=()=>{const w=A.map((_,i)=>+$("#mw"+i).value); A.forEach((_,i)=>$("#mw"+i+"o").textContent=w[i]); const sw=w.reduce((a,b)=>a+b,0)||1;
    const sc=R.map(r=>({n:r[0],s:r.slice(1).reduce((a,v,i)=>a+v*w[i],0)/sw,r:r.slice(1)})).sort((a,b)=>b.s-a.s);
    $("#m_out").innerHTML=sc.map((x,i)=>`<div class="meter-row${i===0?" top":""}"><span>${esc(x.n)}</span><div class="bar"><i style="width:${(x.s/5*100).toFixed(0)}%"></i></div><span class="v">${x.s.toFixed(2)}</span></div>`).join("");
    const top=sc[0]; const weak=A.map((a,i)=>({a,v:top.r[i],w:w[i]})).filter(x=>x.w>0&&x.v<=2);
    $("#m_why").innerHTML=`<b>${esc(top.n)}</b> gana con estos pesos.${weak.length?` Pero ojo al trade-off: es débil en ${weak.map(x=>`<b>${esc(x.a)}</b> (${x.v})`).join(", ")}. Si ese atributo es crítico, necesitas tácticas que lo compensen o una combinación de estilos.`:" No tiene debilidades graves en los atributos que te importan."}<br><span class="muted">Recuerda: la matriz es una herramienta para razonar, no una verdad universal. Las calificaciones dependen del nivel donde apliques el estilo (DA-06).</span>`;};
  root.addEventListener("input",paint);
  root.addEventListener("click",e=>{const b=e.target.closest("[data-p]"); if(!b) return; P[b.dataset.p].forEach((v,i)=>$("#mw"+i).value=v); paint();});
  paint();
});

/* ---- clasificador 4+1 ---- */
SIMS.push(({$,esc})=>{
  const root=$("#sim41"); if(!root) return;
  const V=[["log","Lógica"],["pro","Procesos"],["des","Desarrollo"],["fis","Física"],["esc","Escenarios"]];
  const I=[
   ["Diagrama de clases con Desastre, ZonaAfectada y NivelEmergencia","log","Clases y relaciones del dominio = descomposición funcional."],
   ["El Gateway corre en 2 a 8 instancias sin estado","pro","Multiplicidad de unidades de ejecución y su concurrencia."],
   ["Réplica de la BD primaria en otra zona con replicación sincrónica","fis","Nodos, zonas y distribución física de los datos."],
   ["El repositorio gd-dominio depende de la librería modelo-canonico v2","des","Organización estática del software y dependencias de compilación."],
   ["Un operador registra un desastre y los organismos reciben la alerta","esc","Escenario que recorre las demás vistas."],
   ["El Consumidor de ingesta procesa el tópico particionado por ID de evento","pro","Asincronía, tópicos y orden: comunicación y sincronización en ejecución."],
   ["El módulo Gestión de Desastres expone la interfaz ConsultarSituacion","log","Subsistemas e interfaces expuestas (Clase 10)."],
   ["El equipo de plataforma mantiene gateway-bff en un repositorio aparte","des","Asignación de trabajo y repositorios."],
   ["Servidor web en la DMZ y servidor de datos en la LAN tras un firewall","fis","Topología de red y mapeo a hardware (ejemplo BookStore)."],
   ["Diagrama de casos de uso con actores Ciudadano, Auditor y Sistema de alerta","esc","Actores y casos de uso."],
   ["Diagrama de actividades con ramas paralelas: notificar y actualizar proyección","pro","Actividades con bifurcación = concurrencia (la Clase 10 lo pone en procesos)."],
   ["Paquetes api, dominio y persistencia dentro del servicio (capas internas)","log","Distribución de responsabilidades en capas lógicas. (También puede aparecer en desarrollo si hablas de paquetes de código: acepta ambas si lo justificas.)","des"],
   ["Timeout de 800 ms y cortacircuitos entre adaptador y hospital","pro","Comportamiento en ejecución ante fallas: tolerancia a fallos."],
   ["El artefacto gd-consulta.war se despliega en el nodo Servidor-App-A","fis","Mapeo de artefactos a nodos («deploy»)."],
  ];
  root.innerHTML=`<div class="classify">${I.map((it,i)=>`<div class="cl-item" data-i="${i}"><div>${esc(it[0])}</div><div class="cl-btns">${V.map(([k,l])=>`<button type="button" data-v="${k}">${l}</button>`).join("")}</div><div class="small muted" hidden></div></div>`).join("")}</div><p class="small" id="cl_score" style="margin-top:10px"></p>`;
  let ok=0,done=0;
  root.addEventListener("click",e=>{const b=e.target.closest("button[data-v]"); if(!b) return; const item=b.closest(".cl-item"); if(item.dataset.done) return; const it=I[+item.dataset.i]; const right=b.dataset.v===it[1]||b.dataset.v===it[3];
    item.dataset.done=1; done++; if(right) ok++; b.classList.add(right?"right":"wrong"); if(!right) item.querySelector(`button[data-v="${it[1]}"]`).classList.add("right");
    const ex=item.querySelector(".muted"); ex.hidden=false; ex.textContent=(right?"✓ ":"✗ ")+it[2];
    $("#cl_score").textContent=`Aciertos: ${ok} de ${done} (de ${I.length}).`;});
});

/* ---- árbol de utilidad editable ---- */
SIMS.push(({$,esc})=>{
  const root=$("#simUtil"); if(!root) return;
  let rows=[
   {qa:"Disponibilidad",ref:"Falla de nodo",sc:"Un nodo GD cae en emergencia; se detecta en ≤ 10 s sin perder solicitudes confirmadas",b:"H",r:"H"},
   {qa:"Escalabilidad",ref:"Pico de usuarios",sc:"De 1.000 a 10.000 usuarios en 15 min; p95 consultas < 2 s",b:"H",r:"H"},
   {qa:"Desempeño",ref:"Alertas",sc:"Alerta crítica publicada en < 5 s",b:"H",r:"M"},
   {qa:"Modificabilidad",ref:"Nuevos tipos",sc:"Nuevo tipo de desastre en ≤ 1 día-persona sin recompilar",b:"M",r:"M"},
   {qa:"Seguridad",ref:"Trazabilidad",sc:"Auditor reconstruye quién hizo qué en < 5 s",b:"M",r:"L"},
   {qa:"Interoperabilidad",ref:"Nuevo sistema externo",sc:"Integrar un sistema nuevo en ≤ 10 días-persona sin tocar el dominio",b:"H",r:"M"},
  ];
  const w={H:3,M:2,L:1};
  const paint=()=>{
    const sorted=[...rows].map((r,i)=>({...r,i})).sort((a,b)=>(w[b.b]*10+w[b.r])-(w[a.b]*10+w[a.r]));
    $("#ut_list").innerHTML=sorted.map(r=>`<div class="uitem"><span class="txt"><b>${esc(r.qa)}</b> › ${esc(r.ref)} › ${esc(r.sc)}</span><label class="small">Negocio <select data-i="${r.i}" data-f="b">${["H","M","L"].map(x=>`<option${x===r.b?" selected":""}>${x}</option>`).join("")}</select></label><label class="small">Riesgo <select data-i="${r.i}" data-f="r">${["H","M","L"].map(x=>`<option${x===r.r?" selected":""}>${x}</option>`).join("")}</select></label><button class="btn small" data-del="${r.i}" type="button" aria-label="Quitar">×</button></div>`).join("");
    const byQa={}; rows.forEach(r=>{(byQa[r.qa]=byQa[r.qa]||{});(byQa[r.qa][r.ref]=byQa[r.qa][r.ref]||[]).push(r);});
    let t="Utilidad\n"; const qas=Object.keys(byQa);
    qas.forEach((q,qi)=>{const lq=qi===qas.length-1; t+=(lq?"└─ ":"├─ ")+q+"\n"; const refs=Object.keys(byQa[q]); refs.forEach((rf,ri)=>{const lr=ri===refs.length-1; t+=(lq?"   ":"│  ")+(lr?"└─ ":"├─ ")+rf+"\n"; byQa[q][rf].forEach((s,si)=>{const ls=si===byQa[q][rf].length-1; t+=(lq?"   ":"│  ")+(lr?"   ":"│  ")+(ls?"└─ ":"├─ ")+`(${s.b},${s.r}) ${s.sc}\n`;});});});
    $("#ut_tree").textContent=t;
    const top=sorted.filter(r=>r.b==="H"&&r.r==="H"); $("#ut_top").innerHTML=top.length?`Analiza primero (H,H): ${top.map(r=>`<b>${esc(r.ref)}</b>`).join(", ")}. Son los que más restringen la arquitectura y más cuesta incorporar tarde.`:"No tienes escenarios (H,H). Revisa si estás subestimando el riesgo técnico.";
  };
  root.innerHTML=`<div class="grid3"><div class="field"><label for="ut_qa">Atributo</label><input id="ut_qa" value="Usabilidad"></div><div class="field"><label for="ut_ref">Refinamiento</label><input id="ut_ref" value="Operación en campo"></div><div class="field"><label for="ut_sc">Escenario (con medida)</label><input id="ut_sc" value="Un rescatista registra un reporte sin conexión en < 60 s"></div></div><div class="player-bar" style="margin-top:8px"><button class="btn small primary" id="ut_add" type="button">Agregar escenario</button></div>
  <div class="grid2" style="margin-top:12px"><div><div class="eyebrow" style="margin-bottom:6px">Escenarios ordenados por prioridad</div><div class="sortable-list" id="ut_list"></div></div><div><div class="eyebrow" style="margin-bottom:6px">Árbol resultante</div><div class="tree" id="ut_tree"></div><p class="note small" id="ut_top" style="margin-top:10px"></p></div></div>`;
  root.addEventListener("change",e=>{const s=e.target.closest("select[data-i]"); if(s){rows[+s.dataset.i][s.dataset.f]=s.value; paint();}});
  root.addEventListener("click",e=>{const d=e.target.closest("[data-del]"); if(d){rows.splice(+d.dataset.del,1); paint();}
    if(e.target.id==="ut_add"){const qa=$("#ut_qa").value.trim(),ref=$("#ut_ref").value.trim(),sc=$("#ut_sc").value.trim(); if(qa&&ref&&sc){rows.push({qa,ref,sc,b:"M",r:"M"}); paint();}}});
  paint();
});
