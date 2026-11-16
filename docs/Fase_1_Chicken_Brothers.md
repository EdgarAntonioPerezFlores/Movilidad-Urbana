# Fase 1: Análisis y justificación del dashboard

**Proyecto 4:** La movilidad urbana y el tráfico inteligente  
**Equipo:** Chicken Brothers  
**Integrantes:** Edgar Antonio Perez Flores · Julio Cesar Paredes Arceo  
**Fecha del documento original:** 3 de noviembre de 2026.

Versión Markdown del [documento original en PDF](Fase_1_Chicken_Brothers.pdf).

> **Nota de evolución del proyecto:** se conserva el planteamiento de esta fase. En la implementación se delimitó el análisis a enero-abril de 2018 por el almacenamiento requerido por archivos, base de datos e índices en Codespaces. Se utilizaron cuatro archivos mensuales completos de NYC TLC en Parquet, con 35,991,011 registros de origen; no es una muestra aleatoria. El estado implementado, las pruebas y las diferencias respecto al plan se documentan en la [Fase 3](Fase_3_Implementacion.md).

## 1. Contexto y alcance

El proyecto propone un dashboard dinámico en React para explorar los viajes de taxis amarillos de Nueva York registrados en el conjunto 2018 Yellow Taxi Trip Data, publicado en NYC Open Data con el identificador t29m-gskq. La unidad de análisis será un viaje y se plantea utilizar el conjunto completo disponible en esa fuente, sujeto a las reglas de validación del periodo.

Esta fase define la audiencia, el objetivo, el plan de preprocesamiento y el tipo de dashboard. La limpieza, la carga a la base de datos y la programación se realizarán en fases posteriores. No se presentan resultados de análisis ni se afirma que los datos ya hayan sido procesados.

## 2. Análisis de la audiencia

| Usuarios | Decisiones que apoyará | Detalle requerido |
| --- | --- | --- |
| Analistas y planificadores de movilidad | Identificar zonas y horarios con mayor demanda observada y comparar patrones temporales. | Resúmenes mensuales y diarios, con desglose por hora y zona. |

Los usuarios necesitarán indicadores fáciles de interpretar y filtros por fecha y zona. Se priorizarán resultados agregados, con unidades visibles y explicación de los filtros, para evitar que tengan que revisar millones de registros individuales.

## 3. Definición del objetivo

Objetivo general: Analizar los patrones históricos de movilidad de los taxis amarillos de Nueva York durante 2018 mediante un dashboard interactivo que permita identificar variaciones de demanda, duración, distancia y tarifas por fecha, horario y zona, para apoyar la planificación del servicio de transporte.

Problema que resuelve: Los registros originales son numerosos y difíciles de interpretar directamente. El dashboard los transformará en indicadores y visualizaciones que faciliten comparar periodos y localizar zonas con mayor actividad.

El número de viajes se interpretará como demanda observada del servicio, no como una medición directa de congestión. El alcance tampoco permitirá representar toda la movilidad de Nueva York ni demostrar mejoras ambientales sin información adicional.

## 4. Plan de preprocesamiento

### 4.1 Identificación de variables. Se verificará el esquema del CSV y se conservarán los nombres originales en la capa de recepción. Las fechas se interpretarán como horas locales de Nueva York; se comprobará su formato antes de convertirlas.

| Variables | Significado y tipo previsto |
| --- | --- |
| tpep_pickup_datetime / tpep_dropoff_datetime | Inicio y fin del viaje; fecha y hora para calcular duración en minutos. |
| PULocationID / DOLocationID | Zonas de origen y destino; enteros categóricos, no coordenadas GPS. |
| trip_distance / passenger_count | Distancia en millas (decimal) y pasajeros (entero). |
| fare_amount / total_amount | Tarifa del taxímetro y total cobrado en USD (decimales). |
| tip_amount / payment_type | Propina registrada y código de pago. |
| extra, mta_tax, tolls_amount, improvement_surcharge | Recargos, impuesto y peajes en USD. |
| VendorID, RatecodeID, store_and_fwd_flag | Proveedor, código tarifario y bandera de almacenamiento previo al envío; categorías. |

Se derivarán fecha, mes, hora, día de la semana, tipo de día y duración. Las franjas pico y valle se definirán tras explorar la distribución horaria y se documentará el criterio elegido. El catálogo de zonas permitirá incorporar los nombres y boroughs; para un mapa por polígonos se requerirá además la geometría oficial.

### 4.2 Limpieza de faltantes e inconsistencias

Preservación: Se conservará una copia sin modificar del CSV y se registrarán fuente, fecha de descarga, cantidad de filas importadas y motivos de rechazo. Las transformaciones se aplicarán sobre una copia de trabajo.

Faltantes: Se cuantificarán por columna. Los viajes sin fechas válidas se excluirán de los indicadores temporales; los que no tengan distancia o tarifa utilizable se excluirán únicamente de los indicadores que dependan de ellas. No se reemplazarán faltantes con cero ni se imputarán fechas, tarifas o distancias sin evidencia.

Fechas y periodo: Se seleccionarán inicios de viaje desde el 1 de enero de 2018 hasta antes del 1 de enero de 2019. Se marcarán fechas ilegibles, duraciones no positivas y fechas fuera del periodo. Un viaje iniciado al final de diciembre y concluido en enero siguiente podrá conservarse si es consistente.

Montos y categorías: Se revisarán importes negativos y códigos desconocidos. Los valores negativos se separarán para distinguir posibles ajustes o anulaciones de errores antes de decidir su exclusión. Una propina igual a cero se conservará. Los identificadores de zona sin correspondencia se agruparán como desconocidos y se excluirán solo del análisis espacial.

Duplicados: Se identificarán filas idénticas y se investigará su origen. Al no contar con un identificador único de viaje garantizado, no se eliminarán automáticamente registros solo porque compartan hora y ubicación. Se distinguirán duplicaciones del proceso de carga de coincidencias presentes en la fuente.

### 4.3 Tratamiento de valores atípicos

Se examinarán histogramas, percentiles y el rango intercuartílico de duración, distancia y tarifa. Como señal inicial de revisión se utilizarán valores fuera de Q1 - 1.5 × RIC y Q3 + 1.5 × RIC, donde RIC = Q3 - Q1. Esta regla identificará candidatos, no autorizará su eliminación automática.

Se conservarán los extremos plausibles, como recorridos largos o viajes al aeropuerto. Los casos incoherentes se apartarán del análisis correspondiente y se documentará el motivo. No se recortarán ni ajustarán valores de manera automática. Se compararán medias y medianas para describir la influencia de los extremos.

### 4.4 Consideración sobre las propinas

La documentación de TLC indica que las propinas en efectivo no se incluyen en tip_amount. Por ello, el indicador de propina será la propina registrada promedio de viajes pagados con tarjeta, incluyendo ceros válidos y excluyendo faltantes. No se presentará como la propina real de todos los pasajeros.

### 4.5 Integración en la base de datos

Se propone PostgreSQL porque los viajes tienen una estructura tabular y requieren relaciones con zonas, filtros temporales y agregaciones. La decisión responde a la organización de los datos y a las consultas previstas, sin implicar que la base ya esté implementada.

Proceso previsto: 1) descargar y validar la integridad del CSV completo; 2) importar por lotes a una tabla de recepción; 3) convertir tipos y aplicar reglas de calidad; 4) cargar viajes válidos y catálogo de zonas; 5) conservar registros observados con sus motivos; 6) preparar índices y resúmenes por día, hora y zona. Los conteos de entrada, aceptación y rechazo se reconciliarán para detectar pérdidas o duplicaciones de carga.

La tabla de viajes tendrá un identificador interno generado y referencias a las zonas de origen y destino. Se evaluará particionar por mes según el volumen y las pruebas de rendimiento. En una fase posterior, una API consultará PostgreSQL y enviará resultados agregados a React; el navegador no recibirá el CSV completo.

## 5. Selección y justificación del dashboard

Se selecciona un dashboard táctico. Los usuarios compararán patrones históricos por mes, día, hora y zona para apoyar decisiones de planificación del servicio a medio plazo. La interacción permitirá pasar de un resumen del periodo a un detalle geográfico y temporal.

El conjunto de 2018 no proporciona seguimiento en tiempo real, por lo que no se plantea un dashboard operativo. Aunque los resultados puedan apoyar reflexiones de largo plazo, el enfoque principal será la comparación detallada del servicio, no la evaluación estratégica global de una organización.

## 6. Indicadores y visualizaciones previstas

| Indicador | Definición y visualización |
| --- | --- |
| Viajes por periodo y zona | Conteo de viajes válidos. Series por día/hora, barras y mapa por zonas. |
| Duración y distancia promedio | Media de minutos y millas sobre registros válidos para cada variable. Tarjetas e histogramas. |
| Tarifa por milla | SUM(fare_amount) / SUM(trip_distance), mismo subconjunto con distancia positiva y tarifa válida. USD/milla. |
| Propina registrada promedio | Media de tip_amount en pagos con tarjeta, por zona o tipo de día. Barras. |
| Comparación pico/valle | Distribución de duración por franja definida y documentada. Boxplots. |

El mapa mostrará cantidad de recogidas por zona. Solo se denominará densidad por superficie si se divide ese conteo entre el área de cada zona. Cada indicador mostrará el periodo, las unidades y el número de registros utilizados.

## 7. Organización del repositorio

Equipo: Chicken Brothers.

Visibilidad requerida: pública.

El repositorio incluirá un README.md con el nombre del proyecto, integrantes, descripción, fuente de datos y estado de la fase. El documento de justificación se incorporará en docs/. El CSV completo se mantendrá fuera del repositorio; se documentará su procedencia para facilitar la reproducción posterior.

En esta fase no se requiere una aplicación desplegada. La implementación en React, la API, la base de datos y la publicación web se desarrollarán posteriormente. La creación y la visibilidad pública del repositorio deberán verificarse en GitHub antes de entregar su enlace.

## 8. Referencias

NYC Open Data. 2018 Yellow Taxi Trip Data. Conjunto t29m-gskq. Consultar conjunto de datos en NYC Open Data.

NYC Taxi & Limousine Commission. TLC Trip Record Data. Catálogo de zonas, geometrías y documentación. Consultar documentación y recursos geográficos.

NYC Taxi & Limousine Commission. Data Dictionary - Yellow Taxi Trip Records, versión del 18 de marzo de 2025. Consultar diccionario oficial. Se utiliza para interpretar campos comunes; el esquema y los códigos históricos se verificarán para 2018 y no se añadirán columnas de años posteriores.

Fuentes consultadas el 3 de noviembre de 2026. Las reglas de preprocesamiento, la selección de PostgreSQL y el diseño del dashboard son propuestas del equipo para las siguientes fases.

Repositorio: Movilidad-Urbana.

## Enlaces de consulta

- [https://data.cityofnewyork.us/Transportation/2018-Yellow-Taxi-Trip-Data/t29m-gskq/about_data](https://data.cityofnewyork.us/Transportation/2018-Yellow-Taxi-Trip-Data/t29m-gskq/about_data)
- [https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
- [https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_yellow.pdf](https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_yellow.pdf)
