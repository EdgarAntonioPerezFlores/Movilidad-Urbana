import React from 'react';
import {number} from '../lib/format';
const definitions=[
 ['Duración media','duration','min','duration_n','Promedio de (llegada − salida), solo diferencias positivas.'],
 ['Distancia media','distance','mi','distance_n','Promedio de distancias positivas.'],
 ['Tarifa por milla','fare_per_mile','USD/mi','fare_n','Suma de tarifas / suma de distancias del mismo conjunto válido: distancia positiva y tarifa no negativa.'],
 ['Propina registrada','tip','USD','tip_n','Promedio de propinas no negativas en pagos con tarjeta; incluye ceros válidos.']
];
export function KpiCards({kpis,period}) {
 return <section className="kpis" aria-label="Indicadores">
  <article className="card primary"><div className="eyebrow">KPI PRINCIPAL · DEMANDA OBSERVADA</div><h2>Viajes registrados</h2><strong>{number(kpis?.trips)}</strong><small>Viajes con inicio válido · {period}</small></article>
  {definitions.map(([label,key,unit,n,definition])=><article className="card" key={key}>
   <h2>{label}</h2><strong>{number(kpis?.[key],2)} <em>{unit}</em></strong>
   <small>{kpis?`${number(kpis[n])} viajes válidos`:'Pendiente de datos'}</small>
   <details><summary>Cómo se calcula</summary><p>{definition}</p><p>Periodo: {period}</p></details>
  </article>)}
 </section>;
}
