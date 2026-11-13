import {parse} from 'csv-parse/sync';
import {getPool} from '../server/db.js';
const r=await fetch('https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv',{signal:AbortSignal.timeout(60000)});
if(!r.ok)throw new Error(`Catálogo HTTP ${r.status}`);
const rows=parse(await r.text(),{columns:true,bom:true});
if(!rows.length||!rows.every(r=>Number.isInteger(Number(r.LocationID))&&r.Zone&&r.Borough))throw new Error('Catálogo inválido.');
const pool=getPool(),client=await pool.connect();
try{await client.query('BEGIN');for(const row of rows)await client.query('INSERT INTO taxi_zones(location_id,borough,zone) VALUES($1,$2,$3) ON CONFLICT(location_id) DO UPDATE SET borough=excluded.borough,zone=excluded.zone',[row.LocationID,row.Borough,row.Zone]);await client.query('COMMIT');console.log(`${rows.length} zonas cargadas.`);}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
