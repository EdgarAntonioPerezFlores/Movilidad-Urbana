# Proyecto 4: La movilidad urbana y el tráfico inteligente

[Abrir el dashboard en Vercel](https://movilidad-urbana-six.vercel.app/)

## Equipo

**Chicken Brothers**

### Integrantes

- Edgar Antonio Perez Flores
- Julio Cesar Paredes Arceo

## Descripción

Proyecto académico sobre transporte, ciudades inteligentes y sostenibilidad urbana. Se propone desarrollar un dashboard dinámico en React para analizar los patrones históricos de viajes de taxis amarillos de Nueva York durante 2018. Permitirá explorar demanda observada, duración, distancia, tarifas y propinas registradas mediante filtros por fecha, horario y zona.

## Objetivo

Analizar los patrones históricos de movilidad de los taxis amarillos de Nueva York durante 2018 para identificar diferencias temporales y geográficas que apoyen la planificación del servicio de transporte.

## Dataset y alcance

**Enero a abril de 2018**, taxis amarillos de NYC TLC. El equipo sustituyó la exportación anual propuesta de NYC Open Data (`t29m-gskq`) por cuatro archivos mensuales oficiales `yellow_tripdata_2018-MM.parquet`. No se presupone equivalencia registro a registro entre ambas publicaciones.

Según las verificaciones aportadas desde Codespaces, se importaron **35,991,011 filas**, y la API mostró **35,990,259 viajes** con los filtros de la comprobación anterior. Estas cifras son evidencias de esa ejecución, no una nueva medición desde este repositorio. Los KPIs se calculan dinámicamente con el periodo y filtros.

Fuente: https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page

## Fase actual

La Fase 3 documenta la implementación y las pruebas del dashboard. En la Fase 4 se evaluará su uso con participantes.

- [Informe de implementación y revisión de rúbrica](docs/Fase_3_Implementacion.md)
- [Informe en PDF](docs/Fase_3_Implementacion.pdf)
- Verificación: `npm test`, `npm run build`, y `npm run verify:dashboard` con la API encendida.

## Implementación

- **Frontend:** React + Vite, paleta oscura y gráficos Recharts.
- **API:** Node + Express, consultas agregadas y filtros validados.
- **Base de datos:** PostgreSQL; conexión privada mediante `DATABASE_URL`.
- **Desarrollo remoto:** configuración de GitHub Codespaces incluida.
- **Comprobaciones:** `npm test` y `npm run build`.

Consulta la [guía para conectar React y PostgreSQL en la nube](docs/Conexion_React_PostgreSQL.md). La aplicación distingue errores, ausencia de datos y cargas parciales.

## Indicadores y visualizaciones

- Cantidad de viajes por fecha, hora y zona.
- Duración y distancia promedio.
- Tarifa por milla: suma de tarifas / suma de distancias del mismo conjunto válido.
- Propina registrada promedio en pagos con tarjeta, por zona o tipo de día.
- Distribución de duración entre horas pico y valle.

Se implementan la serie temporal, el mapa por zonas y las barras comparativas definidos en la Fase 2. Histogramas y boxplots eran sugerencias iniciales; no forman parte del wireframe seleccionado. La cantidad de viajes representa demanda observada, no una medición directa de congestión. Las propinas en efectivo no están incluidas en el campo de propinas de TLC.

## Trabajo en la nube

En Codespaces procesamos los cuatro archivos mensuales en PostgreSQL. Alojar una segunda copia de los casi 36 millones de registros y sus índices habría requerido almacenamiento adicional. Para publicar el dashboard en Vercel exportamos resúmenes por hora y zona en cuatro archivos CSV, junto con el catálogo de zonas y los datos de cobertura.

La rama `vercel` sirve esos archivos y la aplicación React. Al cambiar un filtro, el navegador calcula los indicadores con las sumas y conteos exportados. Así, el sitio público funciona incluso cuando el Codespace está apagado.

## Documentación

- Fase 1: [Análisis en Markdown](docs/Fase_1_Chicken_Brothers.md).
- Fase 2: [Diseño en Markdown](docs/Fase_2_Diseno_Dashboard.md).
- Fase 3: [Implementación en Markdown](docs/Fase_3_Implementacion.md).

- [Documento de justificación de la Fase 1](docs/Fase_1_Chicken_Brothers.pdf)

- [Reporte de diseño de la Fase 2](docs/Fase_2_Diseno_Dashboard.pdf)
- [Wireframe](design/Wireframe.png)
- [Cuadrícula](design/Cuadricula.png)

## Siguientes fases

Aplicar la encuesta de la Fase 4 a usuarios del dashboard publicado y analizar sus respuestas.
