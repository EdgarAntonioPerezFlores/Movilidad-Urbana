import React from 'react';
import {eligibleDays,number} from '../lib/format';
export function Coverage({data,filters}) {
 const coverage=data?.coverage;
 return <>
  <p>Alcance: <strong>enero–abril de 2018</strong>. {coverage?.aggregates_complete?'Cuatro meses declarados completos por el proceso de carga.':'La carga completa aún no está confirmada.'}</p>
  <p>Días con viajes para los filtros: <strong>{number(data?.kpis?.days_covered)} / {eligibleDays(filters)}</strong>. La ausencia de registros no demuestra por sí sola que no hubo viajes.</p>
  <p>Filas de origen procesadas: {number(coverage?.aggregates_rows==null?null:Number(coverage.aggregates_rows))}. Este total puede diferir del KPI por las fechas válidas y los filtros.</p>
  <p>Actualización: {coverage?.aggregates_at?new Date(coverage.aggregates_at).toLocaleString('es-MX'):'sin publicar'}.</p>
  <p>Más viajes no equivale a mayor congestión. Lunes a viernes incluye feriados. Se conservan extremos positivos; cada KPI utiliza su propio N válido. No se registran propinas en efectivo.</p>
  <a href="https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page" target="_blank" rel="noreferrer">Fuente: NYC TLC · Parquet mensuales ↗</a>
 </>;
}
