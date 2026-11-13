import {getPool} from '../server/db.js';
const pool=getPool(),client=await pool.connect();
try{
 await client.query('SET statement_timeout=0');
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
 await client.query('REFRESH MATERIALIZED VIEW hourly_metrics');
 await client.query('UPDATE import_state SET aggregates_at=now(),aggregates_rows=last_row,aggregates_complete=completed WHERE id=1');
 await client.query('COMMIT');console.log('Agregados actualizados.');
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
