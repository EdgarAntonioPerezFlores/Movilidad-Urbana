import {parseFilters} from '../../server/queries.js';

const cache = new Map();
function load(file, json = false) {
  if (!cache.has(file)) cache.set(file, fetch('/data/' + file).then(async response => {
    if (!response.ok) throw Error('No se pudo cargar ' + file);
    if (json) return response.json();
    return (await response.text()).trim().split(/\r?\n/).map(line => {
      const [timestamp, ...fields] = line.split(',');
      return [timestamp, fields.map(Number)];
    });
  }));
  return cache.get(file);
}
function add(group, key, values) {
  if (!group.has(key)) group.set(key, Array(10).fill(0));
  const sums = group.get(key);
  for (let i = 0; i < sums.length; i++) sums[i] += values[i + 1];
}
function metrics([trips, duration_n, minutes, distance_n, miles, fare, fare_distance_sum, fare_n, tips, tip_n]) {
  return {trips, duration_n, distance_n, fare_n, tip_n, fare_distance_sum,
    duration: duration_n ? minutes / duration_n : null,
    distance: distance_n ? miles / distance_n : null,
    fare_per_mile: fare_distance_sum ? fare / fare_distance_sum : null,
    tip: tip_n ? tips / tip_n : null};
}
async function dashboard(input) {
  const filters = parseFilters(input);
  const {start, end, zone, day, grain} = filters;
  const months = ['01','02','03','04'].filter(m => m >= start.slice(5,7) && m <= end.slice(5,7));
  const [catalog, coverage, ...chunks] = await Promise.all([
    load('zones.json', true), load('coverage.json', true),
    ...months.map(m => load('metrics-' + m + '.csv'))
  ]);
  const totals = new Map(), areas = new Map(), types = new Map(), series = new Map(), dates = new Set();
  let previousDate, weekend;
  for (const chunk of chunks) for (const [timestamp, values] of chunk) {
    const date = timestamp.slice(0,10);
    if (date < start || date > end || (zone && zone !== values[0])) continue;
    if (previousDate !== date) {
      const weekday = new Date(date).getUTCDay();
      weekend = weekday === 6 || weekday === 0;
      previousDate = date;
    }
    if ((day === 'weekday' && weekend) || (day === 'weekend' && !weekend)) continue;
    const label = grain === 'hour' ? timestamp.slice(11,13) : grain === 'day' ? date : date.slice(0,7) + '-01';
    dates.add(date);
    series.set(label, (series.get(label) || 0) + values[1]);
    add(totals, 'all', values);
    add(areas, values[0], values);
    add(types, weekend ? 'Fin de semana' : 'Entre semana', values);
  }
  const names = new Map(catalog.map(z => [Number(z.id), z.label]));
  const rows = Array.from(areas, ([id, sums]) => ({id: id === -1 ? null : id, label: names.get(id) || (id === -1 ? 'Sin zona' : 'Zona ' + id), ...metrics(sums)}));
  return {status:'ready', filters, coverage, kpis:{...metrics(totals.get('all') || Array(10).fill(0)), days_covered:dates.size},
    series:Array.from(series).sort(([a],[b]) => a.localeCompare(b)).map(([label,trips]) => ({label,trips})),
    days:Array.from(types).sort(([a],[b]) => a.localeCompare(b)).map(([label,sums]) => ({label,...metrics(sums)})),
    map:rows.map(({id,trips}) => ({id,trips})),
    zones:rows.sort((a,b) => b.trips-a.trips || a.id-b.id).slice(0,7),
    fares:rows.filter(z => z.id >= 1 && z.id <= 263 && z.fare_distance_sum > 0).sort((a,b) => b.fare_per_mile-a.fare_per_mile || a.id-b.id).slice(0,7)};
}
self.onmessage = async ({data:{id,filters}}) => {
  try { self.postMessage({id,result:await dashboard(filters)}); }
  catch (error) { self.postMessage({id,error:error.message}); }
};
