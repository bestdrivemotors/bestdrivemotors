PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS make (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS model (
  id TEXT PRIMARY KEY,
  make_id TEXT NOT NULL REFERENCES make(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (make_id, name)
);

CREATE TABLE IF NOT EXISTS fuel_type (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS body_style (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feature (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicle (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('draft', 'available', 'sold')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  stock_number TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  make_id TEXT NOT NULL REFERENCES make(id),
  model_id TEXT NOT NULL REFERENCES model(id),
  fuel_id TEXT NOT NULL REFERENCES fuel_type(id),
  body_id TEXT NOT NULL REFERENCES body_style(id),
  variant TEXT,
  price_nzd INTEGER NOT NULL,
  odometer_km INTEGER NOT NULL,
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual', 'cvt')),
  drivetrain TEXT NOT NULL CHECK (drivetrain IN ('fwd', 'rwd', 'awd', '4wd')),
  colour TEXT NOT NULL,
  seats INTEGER NOT NULL,
  doors INTEGER NOT NULL,
  origin TEXT NOT NULL CHECK (origin IN ('nz_new', 'import')),
  wof_expiry TEXT,
  rego_expiry TEXT,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS vehicle_status_created_idx ON vehicle(status, created_at DESC);

CREATE TABLE IF NOT EXISTS vehicle_feature (
  vehicle_id TEXT NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL REFERENCES feature(id),
  PRIMARY KEY (vehicle_id, feature_id)
);

CREATE TABLE IF NOT EXISTS vehicle_image (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicle(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumb_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0 CHECK (is_cover IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  expiresAt TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  password TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);