import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {eligibleDays} from '../src/lib/format.js';
test('Geometría TLC: 263 IDs únicos y coordenadas en NYC',async()=>{
 const geo=JSON.parse(await readFile(new URL('../public/data/taxi-zones.geojson',import.meta.url),'utf8'));
 assert.equal(geo.features.length,263);
 assert.equal(new Set(geo.features.map(f=>f.properties.LocationID)).size,263);
 for(const feature of geo.features){
  const coords=feature.geometry.coordinates.flat(Infinity);
  for(let i=0;i<coords.length;i+=2){assert.ok(coords[i]>-75&&coords[i]<-73);assert.ok(coords[i+1]>40&&coords[i+1]<42);}
 }
});
test('Cobertura: días elegibles por tipo de día',()=>{
 assert.equal(eligibleDays({start:'2018-01-01',end:'2018-04-30',day:'all'}),120);
 assert.equal(eligibleDays({start:'2018-01-01',end:'2018-01-07',day:'weekday'}),5);
 assert.equal(eligibleDays({start:'2018-01-01',end:'2018-01-07',day:'weekend'}),2);
});
