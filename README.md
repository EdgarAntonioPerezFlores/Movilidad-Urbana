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

## Dataset

- **Nombre general:** New York City Taxi Trips Dataset.
- **Conjunto seleccionado:** 2018 Yellow Taxi Trip Data.
- **Fuente:** NYC Open Data / Taxi and Limousine Commission (TLC).
- **Identificador:** `t29m-gskq`.
- **Alcance previsto:** conjunto completo de la fuente, con validación del periodo de inicio de viaje en 2018.
- **Enlace:** https://data.cityofnewyork.us/Transportation/2018-Yellow-Taxi-Trip-Data/t29m-gskq/about_data

El CSV completo no se incluye en el repositorio. Se añadió un importador por lotes para ejecutar en infraestructura remota; todavía no se ha ejecutado la carga completa.

## Fase actual

**Inicio de implementación tras la Fase 2.** Dashboard táctico para analistas y planificadores de movilidad. React, API de Express, esquema PostgreSQL y carga remota preparados. **La base remota aún no está provisionada ni conectada; no hay datos reales cargados ni despliegue público.**

## Implementación

- **Frontend:** React + Vite, paleta oscura y gráficos Recharts.
- **API:** Node + Express, consultas agregadas y filtros validados.
- **Base de datos:** PostgreSQL; conexión privada mediante `DATABASE_URL`.
- **Desarrollo remoto:** configuración de GitHub Codespaces incluida.
- **Comprobaciones:** `npm test` y `npm run build`.

Consulta la [guía para conectar React y PostgreSQL en la nube](docs/Conexion_React_PostgreSQL.md). La aplicación distingue errores, ausencia de datos y cargas parciales.

## Indicadores previstos

- Cantidad de viajes por fecha, hora y zona.
- Duración y distancia promedio.
- Tarifa por milla: suma de tarifas / suma de distancias del mismo conjunto válido.
- Propina registrada promedio en pagos con tarjeta, por zona o tipo de día.
- Distribución de duración entre horas pico y valle.

Se plantean series temporales, mapas por zonas, barras, histogramas y boxplots. La cantidad de viajes representa demanda observada, no una medición directa de congestión. Las propinas en efectivo no están incluidas en el campo de propinas de TLC.

## Trabajo en la nube

El código, documentos y bocetos se conservan en GitHub. Puedes abrir el repositorio en **Code → Codespaces** para trabajar sin instalar herramientas en tu computadora. La base PostgreSQL requiere un servicio remoto y dimensionamiento para el conjunto completo. El importador transmite el CSV por lotes sin guardarlo en disco.

## Documentación

- [Documento de justificación de la Fase 1](docs/Fase_1_Chicken_Brothers.pdf)

- [Reporte de diseño de la Fase 2](docs/Fase_2_Diseno_Dashboard.pdf)
- [Wireframe](design/Wireframe.png)
- [Cuadrícula](design/Cuadricula.png)

## Siguientes fases

Configurar PostgreSQL remoto, verificar y ejecutar la carga real, validar visualmente el dashboard, completar mapa y visualizaciones pendientes, y publicar la aplicación. Ver limitaciones y pasos en la guía de conexión.
