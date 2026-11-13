# React y PostgreSQL en la nube

## Estado real de esta entrega

Se añadió una primera integración ejecutable: React → API de Express → PostgreSQL. Incluye diseño oscuro, filtros, KPIs, gráficos, catálogo de zonas, esquema SQL, importador y pruebas. **No hay una instancia remota provisionada, credenciales configuradas ni una carga real ejecutada.** El frontend muestra el estado de conexión y nunca inventa cifras.

El mapa geográfico, histogramas, boxplots y el tratamiento estadístico de outliers siguen pendientes. Esta entrega inicia la implementación; no sustituye el alcance del documento de diseño.

## 1. Abrir el proyecto sin instalarlo en tu computadora

En el repositorio, selecciona **Code → Codespaces → Create codespace on main**. Se utiliza la configuración de `.devcontainer/`. La instalación se ejecuta en el entorno remoto con `npm ci`.

Codespaces sirve para desarrollar; no es el alojamiento permanente de la base ni del dashboard. La disponibilidad y cuota dependen de tu cuenta. No descargues el CSV completo en ese entorno hasta dimensionar PostgreSQL.

## 2. Crear PostgreSQL remoto

Hace falta una instancia accesible desde el servidor que ejecutará Node. Conserva la base fuera del repositorio. Configura `DATABASE_URL` como secreto de Codespaces o variable secreta del servicio de despliegue; reinicia el entorno después de cambiar los secretos. Usa la cadena de conexión que entrega tu proveedor, con TLS y validación de certificado. `.env.example` documenta el formato, pero no contiene credenciales reales.

Nunca uses `VITE_DATABASE_URL`: las variables con prefijo `VITE_` pueden terminar en el navegador. React solo llama a `/api/*`; la API es quien conoce la contraseña. Una cuenta de lectura para la API y otra de escritura para importar son recomendables en producción.

Antes del año completo, dimensiona almacenamiento, índices, transferencia, tiempo de importación y espacio temporal de PostgreSQL. Esta versión conserva cada registro normalizado en `trips`; **no cabe presumir que un plan gratuito alojará el conjunto completo**. No se ha contratado ningún servicio.

## 3. Inicializar y arrancar

En la terminal del Codespace, con `DATABASE_URL` configurada:

```bash
npm run db:migrate
npm run data:zones
npm run dev
```

Abre el puerto **5173** en la pestaña Ports. Vite dirige `/api` al servidor Express del puerto 3001. Sin conexión, la pantalla muestra un aviso; con conexión y sin agregados, muestra un estado vacío.

## 4. Importar el conjunto correcto

El importador utiliza exclusivamente el dataset **2018 Yellow Taxi Trip Data**, ID `t29m-gskq`. Configura `SOCRATA_APP_TOKEN` como secreto de servidor para SODA3. Ejecuta en un trabajador remoto con capacidad suficiente:

```bash
npm run data:import
npm run data:refresh
```

La exportación CSV se lee como flujo en memoria y se inserta por lotes; no se guarda un archivo CSV en disco. Se solicita orden total por `:id`, se verifica la revisión de la fuente y se conserva un contador de filas. Si se interrumpe, vuelve a ejecutar `data:import`: se vuelve a leer la exportación y se omiten las filas ya confirmadas. **La reanudación ahorra almacenamiento pero vuelve a transferir el prefijo del archivo**; no es una descarga HTTP por rangos.

La escritura del lote y del contador ocurre en una transacción; un bloqueo impide dos importadores simultáneos. Una revisión distinta detiene la carga. Si la fuente cambia durante la ejecución, no publiques esa carga: utiliza una base nueva para la nueva revisión. La carga completa se marca únicamente tras finalizar la exportación y verificar la revisión.

`data:refresh` recalcula los agregados horarios y su cobertura en una transacción consistente. Puede tardar considerablemente en todo el año; ejecútalo fuera de las horas de consulta. La API consulta estos agregados, evitando recorrer todos los viajes para cada filtro. El servidor usa un pool limitado y consultas parametrizadas.

No se ha validado todavía la exportación completa contra el portal ni el rendimiento de la carga anual. Se detiene ante errores HTTP o un CSV incompatible; no sustituye la fuente por otra.

## Definición de los indicadores

- Viajes: registros con inicio válido dentro de 2018 y del filtro elegido.
- Duración: promedio en minutos de diferencias positivas entre llegada y salida.
- Distancia: promedio de distancias positivas, en millas.
- Tarifa/milla: suma de `fare_amount` / suma de `trip_distance`, sobre el mismo subconjunto con tarifa no negativa y distancia positiva.
- Propina: promedio de `tip_amount` no negativo en pagos con tarjeta (`payment_type=1`); incluye ceros, excluye faltantes. No mide propinas en efectivo.

Los faltantes y números no finitos pasan a NULL. Un dato inválido en una métrica no elimina el viaje de las demás. Se conservan extremos positivos: todavía no se aplica un umbral arbitrario ni se confunden con valores limpios. Los registros fuera de 2018 permanecen almacenados, pero no entran en los KPIs. Las fechas son horas locales sin conversión a UTC, como la fuente TLC. Las zonas se obtienen del catálogo oficial de TLC.

## Publicación permanente

Para publicar esta implementación, utiliza un alojamiento que ejecute Node y permita conexión a PostgreSQL. Configura:

- Instalación: `npm ci`
- Compilación: `npm run build`
- Inicio: `npm start`
- Secreto: `DATABASE_URL`
- Puerto: variable `PORT` del servicio

Express sirve `dist/` y `/api` bajo el mismo origen. GitHub Pages por sí solo no ejecuta esta API ni PostgreSQL. La importación y actualización de agregados se ejecutan por separado, no al arrancar el sitio ni dentro de una petición web.

**Pendiente para activar la conexión real:** crear o identificar el servicio de PostgreSQL, configurar el secreto, ejecutar las migraciones y cargar datos. No se ha desplegado un sitio público en esta entrega.

## Verificación

`npm test` ejecuta pruebas SQL con PGlite (motor PostgreSQL embebido de prueba), filtros, casos inválidos y respuestas HTTP de la API. `npm run build` compila React. Esto no verifica conectividad TLS a una instancia externa, capacidad para todo 2018 ni carga completa. La vista previa en navegador de este entorno falló al iniciar Vite por `uv_interface_addresses`; falta validación visual en el Codespace.

Fuentes técnicas:
- https://dev.socrata.com/docs/queries/index.html
- https://node-postgres.com/apis/client
- https://data.cityofnewyork.us/Transportation/2018-Yellow-Taxi-Trip-Data/t29m-gskq/about_data
- https://d37ci6vzurychx.cloudfront.net/misc/taxi_zone_lookup.csv
