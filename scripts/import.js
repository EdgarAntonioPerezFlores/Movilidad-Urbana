// Ejecutar únicamente en infraestructura remota dimensionada para el año completo.
import {Readable} from 'node:stream';
import {parse} from 'csv-parse';
import {getPool} from '../server/db.js';
import {normalize} from './normalize.js';
const url='https://data.cityofnewyork.us/api/v3/views/t29m-gskq/export.csv?accessType=DOWNLOAD';
const metadata='https://data.cityofnewyork.us/api/views/t29m-gskq.json';
async function revision(){const r=await fetch(metadata,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error(`Metadatos HTTP ${r.status}`);const j=await r.json();if(!j.rowsUpdatedAt)throw new Error('La fuente no informa revisión; no es seguro reanudar.');return String(j.rowsUpdatedAt);}
const size=Number(process.env.IMPORT_BATCH_SIZE??2000);
if(!Number.isInteger(size)||size<1||size>10000)throw new Error('IMPORT_BATCH_SIZE debe estar entre 1 y 10000.');
const pool=getPool(),client=await pool.connect();let lock=false;
try {
 lock=(await client.query('SELECT pg_try_advisory_lock(20182018) AS locked')).rows[0].locked;
 if(!lock)throw new Error('Ya hay otra importación ejecutándose.');
 const rev=await revision();
 await client.query('INSERT INTO import_state(id,source_revision) VALUES(1,$1) ON CONFLICT DO NOTHING',[rev]);
 const state=(await client.query('SELECT * FROM import_state WHERE id=1')).rows[0];
 if(state.source_revision!==rev)throw new Error('La fuente cambió. Usa una base nueva para evitar mezclar revisiones.');
 if(state.completed){console.log('La importación ya está completa.');}
 else {
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.SOCRATA_APP_TOKEN?{'X-App-Token':process.env.SOCRATA_APP_TOKEN}:{})},body:JSON.stringify({query:'SELECT * ORDER BY :id',orderingSpecifier:'total'}),signal:AbortSignal.timeout(86400000)});
 if(!response.ok||!response.body)throw new Error(`Exportación HTTP ${response.status}`);
 let index=0,batch=[];const checkpoint=Number(state.last_row);
 const parser=Readable.fromWeb(response.body).pipe(parse({columns:headers=>{for(const key of ['tpep_pickup_datetime','trip_distance','fare_amount'])if(!headers.map(h=>h.toLowerCase()).includes(key))throw new Error('CSV inesperado: faltan columnas.');return headers;},bom:true}));
 async function flush(){if(!batch.length)return;
 await client.query('BEGIN');try{
 await client.query(`INSERT INTO trips SELECT * FROM jsonb_to_recordset($1::jsonb) AS t(source_row bigint,pickup_at timestamp,dropoff_at timestamp,pickup_zone integer,dropoff_zone integer,distance float8,fare float8,tip float8,payment_type integer) ON CONFLICT(source_row) DO NOTHING`,[JSON.stringify(batch)]);
 await client.query('UPDATE import_state SET last_row=$1,updated_at=now() WHERE id=1',[index]);
 await client.query('COMMIT');batch=[];console.log(`Filas procesadas: ${index}`);
 }catch(e){await client.query('ROLLBACK');throw e;}}
 for await(const row of parser){index++;if(index<=checkpoint)continue;batch.push(normalize(row,index));if(batch.length>=size)await flush();}
 await flush();if(index<checkpoint)throw new Error('La exportación es más corta que el punto de reanudación.');
 if(await revision()!==rev)throw new Error('La fuente cambió durante la importación. No uses esta carga: inicia una base nueva.');
 await client.query('UPDATE import_state SET completed=true,updated_at=now() WHERE id=1');
 console.log('CSV completo procesado. Ejecuta npm run data:refresh para publicar agregados.');
 }
} finally {if(lock)await client.query('SELECT pg_advisory_unlock(20182018)');client.release();await pool.end();}
