"""Genera GeoJSON reproducible. Uso: python scripts/build-zones.py /ruta/taxi_zones.zip
Dependencias de preparación: pyshp, pyproj, shapely. No se necesitan en React.
Fuente: https://d37ci6vzurychx.cloudfront.net/misc/taxi_zones.zip
"""
import sys,json,zipfile,hashlib,tempfile
from pathlib import Path
import shapefile
from shapely.geometry import shape,mapping
from shapely.ops import transform,unary_union
from pyproj import CRS,Transformer
archive=Path(sys.argv[1])
out=Path(__file__).resolve().parents[1]/'public/data'
out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as folder:
 with zipfile.ZipFile(archive) as z:
  for name in z.namelist():
   if Path(name).name.startswith('taxi_zones.'):
    Path(folder,Path(name).name).write_bytes(z.read(name))
 reader=shapefile.Reader(str(Path(folder,'taxi_zones.shp')))
 source_crs=CRS.from_wkt(Path(folder,'taxi_zones.prj').read_text())
 transformer=Transformer.from_crs(source_crs,4326,always_xy=True)
 grouped={}
 for record in reader.shapeRecords():
  props=record.record.as_dict();idx=int(props['LocationID'])
  geom=transform(transformer.transform,shape(record.shape.__geo_interface__))
  grouped.setdefault(idx,{'props':props,'geometries':[]})['geometries'].append(geom)
 features=[]
 for idx,item in sorted(grouped.items()):
  geom=unary_union(item['geometries']).simplify(.00008,preserve_topology=True)
  if geom.is_empty or not geom.is_valid:raise ValueError(f'Geometría inválida {idx}')
  features.append({'type':'Feature','properties':{'LocationID':idx,'zone':item['props']['zone'],'borough':item['props']['borough']},'geometry':mapping(geom)})
def rounded(value):
 if isinstance(value,float):return round(value,5)
 if isinstance(value,(tuple,list)):return [rounded(v) for v in value]
 if isinstance(value,dict):return {k:rounded(v) for k,v in value.items()}
 return value
features=rounded(features)
(out/'taxi-zones.geojson').write_text(json.dumps({'type':'FeatureCollection','features':features},separators=(',',':')))
(out/'README.md').write_text(f'''# Geometría de zonas TLC

Fuente: https://d37ci6vzurychx.cloudfront.net/misc/taxi_zones.zip

SHA256 del ZIP: `{hashlib.sha256(archive.read_bytes()).hexdigest()}`.

Conversión con scripts/build-zones.py: CRS original a EPSG:4326, unión por LocationID y simplificación de 0.00008 grados conservando topología. Se distribuyen {len(features)} zonas para visualización; no para mediciones catastrales. La geometría no contiene cifras de viajes. No usa teselas ni un servicio de mapas externo. Los conteos se unen con PULocationID mediante la API. La leyenda se recalcula para cada selección. La ausencia de registros se muestra en gris, separada de cero.
''')
print(len(features),'zonas,', (out/'taxi-zones.geojson').stat().st_size,'bytes')
