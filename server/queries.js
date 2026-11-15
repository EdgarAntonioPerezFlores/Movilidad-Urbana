export function parseFilters(input={}) {
 const start=input.start??'2018-01-01', end=input.end??'2018-04-30';
 const validDate=v=>typeof v==='string' && /^2018-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10)===v;
 if(!validDate(start)||!validDate(end)||start>end||start<'2018-01-01'||end>'2018-04-30') throw new Error('Selecciona un rango válido entre enero y abril de 2018.');
 const day=input.day??'all'; if(!['all','weekday','weekend'].includes(day)) throw new Error('Tipo de día inválido.');
 const grain=input.grain??'month'; if(!['month','day','hour'].includes(grain)) throw new Error('Agrupación inválida.');
 const zone=input.zone ? Number(input.zone) : null;
 if(zone!==null && (!Number.isInteger(zone)||zone<1||zone>265)) throw new Error('Zona inválida.');
 return {start,end,day,grain,zone};
}
const measures=`coalesce(sum(trips),0)::float8 AS trips,
 (sum(duration_sum)/nullif(sum(duration_n),0))::float8 AS duration,
 (sum(distance_sum)/nullif(sum(distance_n),0))::float8 AS distance,
 (sum(fare_sum)/nullif(sum(fare_distance_sum),0))::float8 AS fare_per_mile,
 (sum(tip_sum)/nullif(sum(tip_n),0))::float8 AS tip,
 sum(duration_n)::float8 AS duration_n,sum(distance_n)::float8 AS distance_n,
 sum(fare_distance_sum)::float8 AS fare_distance_sum,
 sum(fare_n)::float8 AS fare_n,sum(tip_n)::float8 AS tip_n`;
export function queries(f) {
 const values=[f.start,f.end,f.day,f.zone];
 const where=`hour >= $1::date AND hour < $2::date + interval '1 day'
 AND ($3='all' OR ($3='weekend' AND extract(isodow FROM hour) IN (6,7)) OR ($3='weekday' AND extract(isodow FROM hour) BETWEEN 1 AND 5))
 AND ($4::integer IS NULL OR pickup_zone=$4)`;
 const bucket=f.grain==='hour'?`to_char(hour,'HH24')`:`to_char(date_trunc('${f.grain}',hour),'YYYY-MM-DD')`;
 return {
 kpis:{text:`SELECT ${measures}, count(DISTINCT hour::date)::integer AS days_covered FROM hourly_metrics WHERE ${where}`,values},
 series:{text:`SELECT ${bucket} AS label,sum(trips)::float8 AS trips FROM hourly_metrics WHERE ${where} GROUP BY 1 ORDER BY 1`,values},
 zones:{text:`SELECT pickup_zone AS id,coalesce(z.zone,'Zona '||pickup_zone::text,'Sin zona') AS label,${measures} FROM hourly_metrics h LEFT JOIN taxi_zones z ON z.location_id=h.pickup_zone WHERE ${where} GROUP BY 1,2 ORDER BY trips DESC LIMIT 7`,values},
 map:{text:`SELECT pickup_zone AS id,sum(trips)::float8 AS trips FROM hourly_metrics WHERE ${where} GROUP BY 1`,values},
 fares:{text:`SELECT pickup_zone AS id,coalesce(z.zone,'Zona '||pickup_zone::text) AS label,${measures} FROM hourly_metrics h LEFT JOIN taxi_zones z ON z.location_id=h.pickup_zone WHERE ${where} AND pickup_zone BETWEEN 1 AND 263 GROUP BY 1,2 HAVING sum(fare_distance_sum)>0 ORDER BY fare_per_mile DESC,pickup_zone LIMIT 7`,values},
 days:{text:`SELECT CASE WHEN extract(isodow FROM hour) IN (6,7) THEN 'Fin de semana' ELSE 'Entre semana' END AS label,${measures} FROM hourly_metrics WHERE ${where} GROUP BY 1 ORDER BY 1`,values}
 };
}
