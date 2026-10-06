CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS artisans (
 id BIGSERIAL PRIMARY KEY,
 name VARCHAR(160) NOT NULL,
 trade VARCHAR(80) NOT NULL,
 latitude DOUBLE PRECISION NOT NULL,
 longitude DOUBLE PRECISION NOT NULL,
 location GEOGRAPHY(POINT,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude,latitude),4326)::geography) STORED,
 available BOOLEAN NOT NULL DEFAULT FALSE,
 verified BOOLEAN NOT NULL DEFAULT FALSE,
 rating NUMERIC(3,2) NOT NULL DEFAULT 0,
 completed_jobs INTEGER NOT NULL DEFAULT 0,
 location_label VARCHAR(160),
 price_from VARCHAR(100),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_artisans_location_gist ON artisans USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_artisans_trade ON artisans(trade);
CREATE INDEX IF NOT EXISTS idx_artisans_available ON artisans(available);

CREATE TABLE IF NOT EXISTS jobs (
 id BIGSERIAL PRIMARY KEY,
 client_id BIGINT,
 artisan_id BIGINT REFERENCES artisans(id),
 title VARCHAR(180) NOT NULL,
 category VARCHAR(80) NOT NULL,
 description TEXT NOT NULL,
 budget NUMERIC(12,2),
 latitude DOUBLE PRECISION NOT NULL,
 longitude DOUBLE PRECISION NOT NULL,
 location GEOGRAPHY(POINT,4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude,latitude),4326)::geography) STORED,
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(status IN ('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CLOSED'))
);
CREATE INDEX IF NOT EXISTS idx_jobs_location_gist ON jobs USING GIST(location);

CREATE TABLE IF NOT EXISTS reviews (
 id BIGSERIAL PRIMARY KEY,
 job_id BIGINT NOT NULL REFERENCES jobs(id),
 artisan_id BIGINT NOT NULL REFERENCES artisans(id),
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 comment TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nearby artisans within radius (metres), sorted by physical distance:
-- SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography) AS distance_m
-- FROM artisans
-- WHERE available = true
-- AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography, :radius_m)
-- ORDER BY location <-> ST_SetSRID(ST_MakePoint(:lng,:lat),4326)::geography;