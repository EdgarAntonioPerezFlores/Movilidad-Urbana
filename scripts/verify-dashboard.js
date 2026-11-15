// Ejecutar con la API encendida: npm run verify:dashboard
// Solo lectura. No cambia ni importa datos.
const base='http://127.0.0.1:3001';
async function get(path){const r=await fetch(base+path,{signal:AbortSignal.timeout(60000)});const data=await r.json();if(!r.ok)throw new Error(`${path}: HTTP ${r.status}`);return data;}
try{
 const health=await get('/api/health');
 if(health.database!=='connected')throw new Error('PostgreSQL no está conectado.');
 const data=await get('/api/dashboard');
 if(data.status!=='ready'||!data.kpis?.trips)throw new Error('No hay agregados con viajes.');
 if(data.filters.end!=='2018-04-30')throw new Error('API antigua: reinicia npm run dev.');
 if(!Array.isArray(data.map)||!Array.isArray(data.fares))throw new Error('Faltan las consultas del mapa o tarifas.');
 if(data.map.reduce((n,z)=>n+z.trips,0)!==data.kpis.trips)throw new Error('Mapa y KPI no coinciden.');
 const outside=await fetch(base+'/api/dashboard?end=2018-05-01');
 if(outside.status!==400)throw new Error('La API permite fechas fuera del alcance.');
 const zone=data.zones.find(z=>z.id>=1&&z.id<=263);
 if(zone){const filtered=await get(`/api/dashboard?zone=${zone.id}`);if(filtered.kpis.trips!==zone.trips)throw new Error('El filtro de zona no coincide.');}
 console.table([{viajes:data.kpis.trips,meses:data.series.length,dias:data.kpis.days_covered,zonas_mapa:data.map.length,zonas_tarifa:data.fares.length}]);
 console.log('Verificación API correcta. Falta comprobación visual del mapa, filtros y diseño en el navegador.');
}catch(error){console.error('VERIFICACION:',error.message);process.exitCode=1;}
