# Proyecto 4: La movilidad urbana y el tráfico inteligente

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

**Fase 3: implementación.** React y PostgreSQL ya funcionaron en el Codespace del equipo. Esta revisión añade mapa, tarifas por zona, componentes y cobertura, y limita frontend/API a enero-abril. Falta ejecutar la verificación visual final y registrar capturas de esta revisión. No se ha desplegado un alojamiento permanente nuevo.

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

El código, documentos y bocetos se conservan en GitHub. Puedes abrir el repositorio en **Code → Codespaces** para trabajar sin instalar herramientas en tu computadora. La base PostgreSQL se ejecuta actualmente en el Codespace; no es un alojamiento permanente. El importador transmite el CSV por lotes sin guardarlo en disco.

## Documentación

- [Documento de justificación de la Fase 1](docs/Fase_1_Chicken_Brothers.pdf)

- [Reporte de diseño de la Fase 2](docs/Fase_2_Diseno_Dashboard.pdf)
- [Wireframe](design/Wireframe.png)
- [Cuadrícula](design/Cuadricula.png)

## Siguientes fases

Validar esta revisión en Codespaces, incorporar capturas finales al informe y sincronizar los importadores locales. Después, evaluar alojamiento permanente. No volver a importar los meses ya cargados.
