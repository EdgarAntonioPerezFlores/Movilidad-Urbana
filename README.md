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

El CSV completo no se incluirá en el repositorio. Su procesamiento y carga se realizarán por lotes en una fase posterior.

## Fase actual

**Fase 1: Análisis.** Se definen audiencia, objetivo, plan de preprocesamiento y justificación del dashboard. La limpieza de datos, la implementación y el despliegue todavía no se han realizado.

## Propuesta

- **Tipo de dashboard:** táctico, basado en información histórica.
- **Frontend previsto:** React.
- **Base de datos propuesta:** PostgreSQL.
- **Acceso a datos previsto:** una API que entregue resultados agregados al frontend.

## Indicadores previstos

- Cantidad de viajes por fecha, hora y zona.
- Duración y distancia promedio.
- Tarifa por milla: suma de tarifas / suma de distancias del mismo conjunto válido.
- Propina registrada promedio en pagos con tarjeta, por zona o tipo de día.
- Distribución de duración entre horas pico y valle.

Se plantean series temporales, mapas por zonas, barras, histogramas y boxplots. La cantidad de viajes representa demanda observada, no una medición directa de congestión. Las propinas en efectivo no están incluidas en el campo de propinas de TLC.

## Documentación

- [Documento de justificación de la Fase 1](docs/Fase_1_Chicken_Brothers.pdf)

## Siguientes fases

Aplicar y documentar el preprocesamiento, cargar PostgreSQL, implementar el dashboard en React y publicar la aplicación en un entorno web.
