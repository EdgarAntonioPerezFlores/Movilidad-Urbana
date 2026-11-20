import {spawn} from 'node:child_process';
import {createWriteStream} from 'node:fs';
import {mkdir,stat,unlink,writeFile} from 'node:fs/promises';
import {pipeline} from 'node:stream/promises';
import {getPool} from '../server/db.js';

const pool=getPool();
const output='public/data';
const expected=35991011;

try {
  await mkdir(output,{recursive:true});

  console.log('=== VERIFICANDO BASE DE DATOS ===');

  const months=await pool.query(`
    SELECT month,last_row,completed
    FROM import_month_progress
    WHERE month BETWEEN 1 AND 4
    ORDER BY month
  `);

  console.table(months.rows);

  if(
    months.rows.length!==4 ||
    months.rows.some(r=>!r.completed) ||
    months.rows.reduce((n,r)=>n+Number(r.last_row),0)!==expected
  ) throw new Error('Importaciones incompletas');

  const view=await pool.query(`
    SELECT ispopulated
    FROM pg_matviews
    WHERE matviewname='hourly_metrics'
  `);

  if(!view.rows[0]?.ispopulated)
    throw new Error('hourly_metrics no esta publicada');

  const zones=await pool.query(`
    SELECT location_id AS id,zone AS label
    FROM taxi_zones ORDER BY zone
  `);

  await writeFile(
    `${output}/zones.json`,
    JSON.stringify(zones.rows)
  );

  const state=await pool.query(`
    SELECT last_row::text,completed,updated_at,
      aggregates_at,aggregates_rows::text,
      aggregates_complete
    FROM import_state WHERE id=1
  `);

  if(!state.rows[0]?.aggregates_at)
    throw new Error('No hay agregados publicados');

  await writeFile(
    `${output}/coverage.json`,
    JSON.stringify(state.rows[0])
  );

  const url=new URL(process.env.DATABASE_URL);

  const env={
    ...process.env,
    PGHOST:url.hostname,
    PGPORT:url.port||'5432',
    PGUSER:decodeURIComponent(url.username),
    PGPASSWORD:decodeURIComponent(url.password),
    PGDATABASE:decodeURIComponent(url.pathname.slice(1))
  };

  for(let month=1;month<=4;month++){
    const mm=String(month).padStart(2,'0');
    const next=String(month+1).padStart(2,'0');
    const file=`${output}/metrics-${mm}.csv`;

    console.log(`Exportando mes ${mm}...`);

    const sql=`
      COPY (
        SELECT
          to_char(hour,'YYYY-MM-DD HH24:MI:SS'),
          coalesce(pickup_zone,-1),
          trips,
          duration_n,
          coalesce(duration_sum,0),
          distance_n,
          coalesce(distance_sum,0),
          coalesce(fare_sum,0),
          coalesce(fare_distance_sum,0),
          fare_n,
          coalesce(tip_sum,0),
          tip_n
        FROM hourly_metrics
        WHERE hour >= '2018-${mm}-01'
          AND hour < '2018-${next}-01'
        ORDER BY hour,pickup_zone
      ) TO STDOUT WITH (FORMAT CSV)
    `;

    const child=spawn('psql',[
      '-X','-q','-v','ON_ERROR_STOP=1',
      '-c',sql
    ],{env,stdio:['ignore','pipe','pipe']});

    let errors='';
    child.stderr.on('data',c=>{
      errors+=c.toString();
    });

    const finished=new Promise((resolve,reject)=>{
      child.on('error',reject);
      child.on('close',code=>
        code===0?resolve():
        reject(new Error(errors||`psql: ${code}`))
      );
    });
    finished.catch(()=>{});

    try{
      await Promise.all([
        pipeline(child.stdout,createWriteStream(file)),
        finished
      ]);
    }catch(e){
      child.kill();
      await unlink(file).catch(()=>{});
      throw e;
    }

    const size=(await stat(file)).size;

    console.log(
      `Mes ${mm}: ${(size/1024**2).toFixed(2)} MiB`
    );
  }

  console.log('=== EXPORTACION COMPLETADA ===');

}catch(error){
  console.error('ERROR:',error.message);
  process.exitCode=1;
}finally{
  await pool.end();
}
