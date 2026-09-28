/* Identificadores extraídos del Taller 4 (Parrado, Jiménez, Doncel, Angulo) */
(function(){
const I={};
const add=(type,arr,extra={})=>arr.forEach(([id,title,text,more])=>I[id]=Object.assign({type,title,text:text||title,src:"Taller 4"},extra,more||{}));
add("Requisito funcional",[
["RF-01","Registrar desastre manualmente","Registrar manualmente un desastre con identificador, tipo, fecha, ubicación, área afectada, severidad, descripción, fuente, organismo responsable y estado. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-02","Crear desastre desde sistemas externos","Crear un desastre automáticamente desde sistemas externos de alerta temprana, estaciones meteorológicas o sensores. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-03","Consolidar reportes","Recibir múltiples reportes sobre un mismo evento y consolidarlos. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-04","Clasificar en niveles 1 a 4","Clasificar y reclasificar el desastre en niveles 1 a 4. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-05","Ciclo de vida flexible","Gestionar el ciclo de vida del evento admitiendo que no todos los desastres recorren los mismos estados. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-06","Delimitar el área","Delimitar el área del desastre desde coordenadas, polígonos, municipios, barrios o información GIS, conservando el histórico. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-07","Asociar organismos","Asociar organismos participantes y su responsabilidad. <b>Primario: no.</b>",{prim:"No",it:"—"}],
["RF-08","Priorizar tareas y alertar","Priorizar tareas y generar alertas ante cambios relevantes. <b>Primario: no.</b>",{prim:"No",it:"—"}],
["RF-09","Vista situacional","Consultar la evolución del desastre y la vista situacional consolidada. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-10","Catálogo de tipos fuera del código","Administrar el catálogo de tipos de desastre fuera del código. <b>Primario: sí.</b>",{prim:"Sí",it:"2, 5"}],
["RF-11","Publicar cambios","Publicar los cambios del evento hacia los demás módulos. <b>Primario: sí.</b>",{prim:"Sí",it:"2"}],
["RF-12","Trazabilidad de cambios","Registrar la trazabilidad de todo cambio de estado, clasificación y delimitación. <b>Primario: no.</b>",{prim:"No",it:"—"}],
]);
add("Escenario de calidad",[
["QA-01","Disponibilidad","<b>Fuente:</b> nodo interno. <b>Estímulo:</b> el nodo deja de responder. <b>Artefacto:</b> servicio de Gestión de Desastres. <b>Entorno:</b> emergencia activa con carga alta. <b>Respuesta:</b> detecta el fallo, retira el nodo del balanceo y redirige sin perder solicitudes confirmadas. <b>Medida:</b> disponibilidad mensual ≥ 99,95 % (21,9 min/mes); detección ≤ 10 s; cero solicitudes confirmadas perdidas; RTO 5 min; RPO 1 min.",{qa:"Disponibilidad"}],
["QA-02","Escalabilidad","<b>Fuente:</b> ciudadanos, funcionarios y organismos. <b>Estímulo:</b> la concurrencia pasa de 1.000 a 10.000 usuarios en 15 minutos. <b>Artefacto:</b> consultas situacionales. <b>Entorno:</b> pico posterior a un terremoto. <b>Respuesta:</b> aumenta la capacidad de los componentes afectados sin escalar toda la plataforma. <b>Medida:</b> p95 de consultas < 2 s durante el pico; solo se escalan los servicios saturados; cero cambios de código.",{qa:"Escalabilidad"}],
["QA-03","Rendimiento","<b>Fuente:</b> operador o sistema externo. <b>Estímulo:</b> solicitud de consulta, registro o alerta. <b>Artefacto:</b> servicios de consulta, comando y notificación. <b>Entorno:</b> operación normal y pico. <b>Respuesta:</b> responde dentro de los objetivos. <b>Medida:</b> consultas p95 < 2 s; registro p95 < 3 s; alerta crítica publicada en < 5 s.",{qa:"Desempeño"}],
["QA-04","Modificabilidad de tipos","<b>Fuente:</b> administrador. <b>Estímulo:</b> incorporar un nuevo tipo de desastre con atributos y estados propios. <b>Artefacto:</b> catálogo de tipos. <b>Entorno:</b> configuración, con el sistema en operación. <b>Respuesta:</b> el tipo queda disponible sin modificar los demás componentes. <b>Medida:</b> ≤ 1 día-persona; cero componentes recompilados; cero minutos de indisponibilidad.",{qa:"Modificabilidad"}],
["QA-05","Interoperabilidad","<b>Fuente:</b> organismo con sistema propio. <b>Estímulo:</b> integrar un sistema externo con tecnología y formato distintos. <b>Artefacto:</b> capa de integración. <b>Entorno:</b> desarrollo. <b>Respuesta:</b> se construye un adaptador que traduce al modelo canónico. <b>Medida:</b> ≤ 10 días-persona; cero cambios en servicios de dominio; todos los mensajes traducidos o rechazados con registro.",{qa:"Interoperabilidad"}],
["QA-06","Resiliencia","<b>Fuente:</b> sistema hospitalario externo. <b>Estímulo:</b> deja de estar disponible. <b>Artefacto:</b> adaptador y servicios dependientes. <b>Entorno:</b> emergencia activa. <b>Respuesta:</b> la plataforma sigue operando y lo pendiente se sincroniza al restablecerse. <b>Medida:</b> el fallo no se propaga; el circuito se abre tras 3 fallos consecutivos o 50 % de errores en 30 s; todo lo pendiente se reconcilia sin pérdida ni duplicación.",{qa:"Disponibilidad"}],
["QA-07","Seguridad y trazabilidad","<b>Fuente:</b> auditor. <b>Estímulo:</b> determinar quién hizo qué, cuándo, sobre qué y con qué resultado. <b>Artefacto:</b> bitácora de operaciones críticas. <b>Entorno:</b> posterior a la emergencia. <b>Respuesta:</b> reconstruye la secuencia de cambios. <b>Medida:</b> todas las operaciones críticas registradas; registro inmutable; consulta de auditoría < 5 s; datos personales cifrados.",{qa:"Seguridad"}],
["QA-08","Modificabilidad estructural","<b>Fuente:</b> equipo de desarrollo. <b>Estímulo:</b> incorporar un nuevo módulo de dominio u organismo. <b>Artefacto:</b> plataforma. <b>Entorno:</b> desarrollo. <b>Respuesta:</b> el elemento nuevo se integra suscribiéndose a los eventos existentes. <b>Medida:</b> cero modificaciones en servicios desplegados; despliegue independiente.",{qa:"Modificabilidad"}],
]);
add("Restricción",[
["RES-01","No reemplazar sistemas existentes","La plataforma no reemplazará los sistemas existentes."],
["RES-02","Integrar tecnologías diferentes","Debe integrarse con sistemas de tecnologías diferentes."],
["RES-03","Indisponibilidad externa","Los sistemas externos pueden presentar indisponibilidad temporal."],
["RES-04","Usuarios aumentan abruptamente","La cantidad de usuarios puede aumentar abruptamente."],
["RES-05","Síncrono y asíncrono","Algunas operaciones requieren respuesta inmediata y otras pueden procesarse de manera asíncrona."],
["RES-06","Disponible ante fallos parciales","La información debe mantenerse disponible durante fallos parciales."],
["RES-07","Justificar con atributos","Toda decisión debe justificarse mediante atributos de calidad."],
["RES-08","Agnóstico de tecnología","El diseño debe ser agnóstico de tecnología."],
["RES-09","Tipos fuera del código","Los tipos de desastre no deben estar definidos en el código."],
["RES-10","Dato sensible","La información de personas afectadas es dato sensible."],
],{src:"Taller 4 (tomadas del enunciado)"});
add("Preocupación arquitectónica",[
["PA-01","Estructura general","Establecer la estructura general y la asignación de responsabilidades."],
["PA-02","Comunicación uniforme","Definir un mecanismo uniforme de comunicación entre módulos."],
["PA-03","Información geográfica","Definir cómo se representa y versiona la información geográfica."],
["PA-04","Consistencia de vistas","Definir la estrategia de consistencia entre el estado del evento y las vistas consultadas."],
["PA-05","Identidad multiorganización","Definir el modelo de identidad y control de acceso multiorganización."],
["PA-06","Trabajo en paralelo","Habilitar el trabajo paralelo de varios equipos."],
]);
add("Decisión arquitectónica",[
["DA-01","Microservicios particionados por dominio","Escalar el módulo saturado, contener fallos dentro del proceso y agregar módulos sin tocar los demás salen de la misma propiedad: unidades de despliegue autónomas. Se descartó la arquitectura basada en servicios (comparte BD → impide despliegue independiente). Granularidad por dominio porque los cambios anticipados son de dominio. <b>Se acepta:</b> más complejidad operativa, costo y latencia de red.",{it:"1"}],
["DA-02","Pub/sub sobre bus duradero","Un cambio debe llegar a 7 consumidores; con invocación directa, la caída de un consumidor haría fallar al productor. Se descartó la consulta periódica (desperdicia capacidad o incumple los 5 s). Los tópicos retienen eventos (RES-06). <b>Se acepta:</b> consistencia eventual, mitigada particionando por identificador de desastre.",{it:"1"}],
["DA-03","Un adaptador por sistema externo + modelo canónico","Integrar directo dispersaría el formato externo; un integrador central único sería punto único de fallo. Con un adaptador por sistema el dominio conoce un solo formato, y el adaptador aloja el cortacircuitos. <b>Se acepta:</b> costo de construir y mantener cada adaptador.",{it:"1"}],
["DA-04","API Gateway con BFF por canal","Evita repetir autenticación y limitación de tasa en cada servicio y permite políticas por canal (proteger funciones críticas limitando primero al canal ciudadano). <b>Consecuencia:</b> el gateway es punto único de fallo hasta replicarlo (R1).",{it:"1"}],
["DA-05","Frontera explícita síncrono/asíncrono","Regla: una operación es síncrona si tiene objetivo de latencia en QA-03 o si el usuario necesita el resultado para continuar; asíncrona en los demás casos. <b>Consecuencia:</b> el camino de escritura queda expuesto al pico (se atiende en la iteración 4).",{it:"1"}],
["DA-06","Capas internas dentro de cada servicio","La desventaja del estilo en capas es escalabilidad y despliegue, no modificabilidad; dentro de un servicio ya replicado esa desventaja desaparece. Las calificaciones de un estilo dependen del nivel en que se aplica. Se consideró hexagonal pero no se adoptó su terminología.",{it:"2"}],
["DA-07","Ciclo de vida como máquina de estados dirigida por datos","Condicionales dispersos obligan a buscar y cambiar todos los puntos; una máquina por tipo exige desplegar código (incumple QA-04). Mecanismo genérico en el núcleo, definición en el catálogo. <b>Se requiere:</b> herramienta de administración y validador.",{it:"2"}],
["DA-08","Zonas versionadas por marca de tiempo","Para reconstruir el mapa “tal como estaba a las 10:00” (crece de 3 a 7 barrios). Cada delimitación es una entidad con vigencia. <b>Se acepta:</b> crecimiento del volumen geométrico → política de retención.",{it:"2"}],
["DA-09","Comandos y consultas separados con proyección de lectura","Escrituras poco frecuentes y transaccionales vs. consultas masivas en pico; se precalcula la agregación. Se descartó event sourcing (cambio conceptual y riesgo). <b>Se acepta:</b> proyección eventualmente consistente → la UI muestra la antigüedad.",{it:"2"}],
["DA-10","Outbox transaccional","Si el servicio falla entre escribir en BD y publicar, nadie se entera. Publicar antes puede anunciar algo revertido; una transacción distribuida acopla BD y bus. <b>Se acepta:</b> entrega al menos una vez → consumidores idempotentes.",{it:"2"}],
["DA-11","Servicios sin estado con redundancia activa","99,95 % admite 21,9 min/mes; una instancia única lo gasta en un reinicio. Frío = arranque lento; pasiva = sincronizar estado. Sin estado de sesión, la redundancia activa pierde su desventaja. <b>Se acepta:</b> costo de infraestructura y disciplina de no introducir estado.",{it:"3"}],
["DA-12","Timeout + reintento acotado + cortacircuitos","Sin timeout cada llamada retiene un hilo hasta agotar el pool; el reintento agrava; el cortacircuitos corta el ciclo. Valores: 800 ms, apertura tras 3 fallos o 50 % en 30 s, sonda a los 30 s, configurables por adaptador (R6).",{it:"3"}],
["DA-13","Degradación controlada con clasificación de funciones","Devolver error traslada el fallo; devolver dato antiguo sin marcar es lo más peligroso. Se clasifican funciones (críticas, importantes, diferibles) y se marca la antigüedad (R7).",{it:"3"}],
["DA-14","Cola de reconciliación ordenada e idempotente","Descartar incumple la sincronización; reintentar en memoria se pierde si el servicio reinicia. Cola persistente, orden por entidad; deduplicación en el adaptador si el destino no es idempotente.",{it:"3"}],
["DA-15","Réplica sincrónica del almacén primario en otra zona","Copias periódicas → RPO = intervalo; replicación asíncrona admite pérdida de confirmadas. <b>Se acepta:</b> más latencia de escritura (el camino de lectura no pasa por el primario gracias a DA-09).",{it:"3"}],
["DA-16","Separación física de caminos de escritura, lectura e ingesta","Un único conjunto de instancias hace que el pico de lectura robe capacidad. Pools de hilos no permiten escalar cada camino con factor distinto (lectura ×10, escritura ×6). <b>Se acepta:</b> operar tres despliegues del mismo dominio.",{it:"4"}],
["DA-17","Autoescalado con métricas propias por camino","Manual depende de alguien reaccionando en plena emergencia; por CPU reacciona tarde en cargas de E/S. Ingesta escala por longitud de cola. Requiere observabilidad madura.",{it:"4"}],
["DA-18","Caché situacional con TTL corto + invalidación por evento","Las consultas piden lo mismo sobre 2–3 eventos activos. Solo TTL obliga a elegir entre dato viejo o poca eficacia; se combina con invalidación por evento. Queda ventana de segundos (se indica en UI).",{it:"4"}],
["DA-19","Ingesta asíncrona con confirmación inmediata y colas acotadas","Síncrono ata el tiempo del equipo de campo a la carga total; una cola sin límite solo desplaza el fallo. Acotar convierte la saturación en señal temprana. Se confirma recepción, no procesamiento.",{it:"4"}],
["DA-20","Limitación de tasa y priorización por canal en el gateway","Si la demanda supera la capacidad, alguien recibe servicio degradado; se reserva capacidad para operaciones críticas según la clasificación de la iteración 3. Es también decisión de política pública.",{it:"4"}],
["DA-21","Tipos y transiciones como datos versionados","Enum/jerarquía obliga a recompilar; plugins ejecutables dan más flexibilidad de la necesaria y riesgo. Expresividad acotada a atributos, niveles, estados y transiciones (R10). Validador por esquema sustituye al compilador.",{it:"5"}],
["DA-22","Modelo canónico con esquemas versionados","Traducir entre pares crece cuadráticamente; el canónico reduce a una traducción por sistema. Compatibilidad hacia atrás evita actualizar todos los adaptadores a la vez. Requiere responsable (R11).",{it:"5"}],
["DA-23","Registro dinámico de adaptadores","Una lista en la configuración del módulo reintroduce el acoplamiento. El adaptador declara su mapeo y se suscribe; el dominio solo consume el tópico canónico.",{it:"5"}],
["DA-24","Autorización por rol, organización y finalidad","Solo rol: cualquiera ve todo el país; rol + organización: acceso a eventos donde no participa. Se considera participación en el evento. <b>Se acepta:</b> permisos más complejos; escalamiento de acceso auditado.",{it:"5"}],
["DA-25","Bitácora inmutable en almacén independiente","Campos de auditoría solo guardan el último cambio; una tabla modificable no garantiza integridad. Se escribe dentro de la transacción del cambio: no hay cambio sin registro. <b>Se acepta:</b> duplicación y crecimiento del almacenamiento.",{it:"5"}],
]);
add("Riesgo",[
["R1","Gateway y bus como puntos únicos de fallo","Origen: DA-04 / iteración 1. Tratamiento: mitigado con redundancia activa y réplicas de partición (iteración 3)."],
["R2","Vistas divergentes por consistencia eventual","Tratamiento: particionamiento por evento e indicación de antigüedad."],
["R3","Complejidad operativa de los microservicios","Tratamiento: capacidad de observabilidad desde el inicio del proyecto."],
["R4","Gestor de ciclo de vida sobrecargado","Tratamiento: vigilar su crecimiento y extraer reglas al catálogo."],
["R5","Fusión errónea de reportes","Tratamiento: admitir revisión y deshacer manual de la consolidación."],
["R6","Cortacircuitos mal calibrado","Tratamiento: umbrales configurables y observación en producción."],
["R7","Decisiones sobre datos antiguos","Tratamiento: marca de antigüedad visible; el riesgo no se elimina."],
["R8","Latencia del autoescalado frente al pico","Tratamiento: capacidad reservada y contrapresión inicial."],
["R9","Almacén de escritura como límite de escalado","Tratamiento: particionamiento, sujeto a decisiones tecnológicas."],
["R10","Lenguaje de reglas informal","Tratamiento: acotar la expresividad del catálogo."],
["R11","Modelo canónico como cuello de botella","Tratamiento: responsable asignado y compatibilidad hacia atrás."],
]);
DATA.IDS=I;
})();
