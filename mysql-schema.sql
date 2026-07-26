-- Optional: ensure index on users.email for lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Recommended: separate password_resets table for better auditing and rate-limiting
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expiry_time DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sent_at DATETIME NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  INDEX (email),
  INDEX (otp)
);

-- Track per-IP requests for rate limiting and auditing
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NULL,
  ip VARCHAR(64) NOT NULL,
  requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (ip),
  INDEX (email)
);

-- Temporary bans for abusive IPs
CREATE TABLE IF NOT EXISTS password_reset_bans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  banned_until DATETIME NOT NULL,
  reason VARCHAR(255) NULL,
  INDEX (ip)
);
