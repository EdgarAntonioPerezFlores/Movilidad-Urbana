import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {queries,parseFilters} from '../server/queries.js';
import {normalize,timestamp,numeric} from '../scripts/normalize.js';
import {createApp} from '../server/app.js';
const db=new PGlite();
after(()=>db.close());
test('Fechas y filtros rechazan fechas imposibles e inyección',()=>{
 for(const f of [{start:'2018-02-30'},{grain:"month'); DROP TABLE trips;--"},{zone:'1 OR 1=1'},{start:'2018-12-31',end:'2018-01-01'}])assert.throws(()=>parseFilters(f));
 assert.equal(parseFilters({}).grain,'month');
 assert.equal(timestamp('2018 Jan 01 12:00:00 AM'),'2018-01-01 00:00:00');
 assert.equal(timestamp('2018 Jan 01 12:00:00 PM'),'2018-01-01 12:00:00');
 assert.equal(timestamp('2018 Feb 30 01:00:00 AM'),null);
 assert.equal(numeric(''),null);assert.equal(numeric('Infinity'),null);assert.equal(numeric('0'),0);
 assert.equal(normalize({PULocationID:'1.5'},1).pickup_zone,null);
});
test('PostgreSQL: métricas con denominadores propios, filtros y API',async()=>{
 await db.exec(await readFile(new URL('../db/001_initial.sql',import.meta.url),'utf8'));
 await db.exec(`INSERT INTO trips VALUES
 (1,'2018-01-01 10:00','2018-01-01 10:10',1,2,2,10,0,1),
 (2,'2018-01-01 10:00','2018-01-01 10:30',1,2,10,20,4,1),
 (3,'2018-01-01 10:00','2018-01-01 09:00',2,2,0,5,90,2),
 (4,'2018-01-06 12:00','2018-01-06 12:20',2,2,4,8,-1,1),
 (5,'2019-01-01 10:00','2019-01-01 10:30',1,2,10,20,4,1);
 INSERT INTO import_state(id,source_revision,last_row,completed) VALUES(1,'test',5,false);
 REFRESH MATERIALIZED VIEW hourly_metrics;
 UPDATE import_state SET aggregates_at=now();`);
 const q=queries(parseFilters({}));const k=(await db.query(q.kpis.text,q.kpis.values)).rows[0];
 assert.equal(k.trips,4);assert.equal(k.duration,20);assert.equal(k.distance,16/3);assert.equal(k.fare_per_mile,38/16);assert.equal(k.tip,2);assert.equal(k.tip_n,2);
 const weekend=queries(parseFilters({day:'weekend'})).kpis;
 assert.equal((await db.query(weekend.text,weekend.values)).rows[0].trips,1);
 const zone=queries(parseFilters({zone:'1'})).kpis;
 assert.equal((await db.query(zone.text,zone.values)).rows[0].trips,2);
 for(const grain of ['hour','day','month']){const s=queries(parseFilters({grain})).series;assert.ok((await db.query(s.text,s.values)).rows.length>0);}
 const server=createApp(()=>db).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const base=`http://127.0.0.1:${server.address().port}`;
 const result=await fetch(base+'/api/dashboard');assert.equal(result.status,200);const data=await result.json();assert.equal(data.kpis.trips,4);assert.equal(data.coverage.completed,false);assert.equal(data.zones.length,2);
 assert.equal((await fetch(base+'/api/dashboard?start=2018-02-30')).status,400);
 await db.exec('UPDATE import_state SET aggregates_at=NULL');assert.equal((await(await fetch(base+'/api/dashboard')).json()).status,'empty');
 }finally{await new Promise(r=>server.close(r));}
});
test('La API informa conexión faltante sin filtrar credenciales',async()=>{
 const server=createApp(()=>{const e=new Error('postgres://secret');e.code='DB_NOT_CONFIGURED';throw e;}).listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const r=await fetch(`http://127.0.0.1:${server.address().port}/api/dashboard`);assert.equal(r.status,503);assert.ok(!(await r.text()).includes('secret'));}finally{await new Promise(r=>server.close(r));}
});
