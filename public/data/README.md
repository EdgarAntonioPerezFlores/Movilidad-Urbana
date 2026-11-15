# Geometría de zonas TLC

Fuente: https://d37ci6vzurychx.cloudfront.net/misc/taxi_zones.zip

SHA256 del ZIP: `f6d711917bb4340f8f644d5366c51665489eb2d426dd1a4a55677721ae5adf17`.

Conversión con scripts/build-zones.py: CRS original a EPSG:4326, unión por LocationID y simplificación de 0.00008 grados conservando topología. Se distribuyen 263 zonas para visualización; no para mediciones catastrales. La geometría no contiene cifras de viajes. No usa teselas ni un servicio de mapas externo. Los conteos se unen con PULocationID mediante la API. La leyenda se recalcula para cada selección. La ausencia de registros se muestra en gris, separada de cero.
