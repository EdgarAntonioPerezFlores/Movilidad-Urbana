BEGIN;
CREATE TABLE IF NOT EXISTS trips (
  source_row bigint PRIMARY KEY,
  pickup_at timestamp,
  dropoff_at timestamp,
  pickup_zone integer,
  dropoff_zone integer,
  distance double precision,
  fare double precision,
  tip double precision,
  payment_type integer
);
CREATE INDEX IF NOT EXISTS trips_pickup_idx ON trips(pickup_at);
CREATE TABLE IF NOT EXISTS import_state (
  id integer PRIMARY KEY CHECK(id=1),
  source_revision text NOT NULL,
  last_row bigint NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  aggregates_at timestamptz,
  aggregates_rows bigint,
  aggregates_complete boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS taxi_zones (
  location_id integer PRIMARY KEY, borough text NOT NULL, zone text NOT NULL
);
CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_metrics AS
SELECT date_trunc('hour',pickup_at) AS hour, pickup_zone,
 count(*)::bigint AS trips,
 count(*) FILTER (WHERE dropoff_at > pickup_at)::bigint AS duration_n,
 sum(extract(epoch FROM (dropoff_at-pickup_at))/60.0) FILTER (WHERE dropoff_at > pickup_at) AS duration_sum,
 count(*) FILTER (WHERE distance > 0)::bigint AS distance_n,
 sum(distance) FILTER (WHERE distance > 0) AS distance_sum,
 sum(fare) FILTER (WHERE distance > 0 AND fare >= 0) AS fare_sum,
 sum(distance) FILTER (WHERE distance > 0 AND fare >= 0) AS fare_distance_sum,
 count(*) FILTER (WHERE distance > 0 AND fare >= 0)::bigint AS fare_n,
 sum(tip) FILTER (WHERE payment_type=1 AND tip >= 0) AS tip_sum,
 count(*) FILTER (WHERE payment_type=1 AND tip >= 0)::bigint AS tip_n
FROM trips WHERE pickup_at >= '2018-01-01' AND pickup_at < '2019-01-01'
GROUP BY 1,2 WITH NO DATA;
CREATE INDEX IF NOT EXISTS metrics_hour_idx ON hourly_metrics(hour);
COMMIT;
