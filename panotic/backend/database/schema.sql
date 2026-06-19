-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    points INT DEFAULT 0
);

-- 2. Create billboards table (for approved data)
CREATE TABLE IF NOT EXISTS billboards (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create pending_billboards table (for crowdsourced data)
CREATE TABLE IF NOT EXISTS pending_billboards (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    size VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add spatial GIST indexes on the 'location' columns to optimize geospatial queries
CREATE INDEX IF NOT EXISTS billboards_location_idx ON billboards USING GIST (location);
CREATE INDEX IF NOT EXISTS pending_billboards_location_idx ON pending_billboards USING GIST (location);
