# BOOKNOOK — Production Deployment Guide (Hostinger VPS / Ubuntu Linux)

This guide provides end-to-end instructions for deploying the modernized **BookNook** e-commerce platform onto a Linux Virtual Private Server (such as Hostinger VPS, DigitalOcean, or Linode) running **Ubuntu 22.04 LTS or 24.04 LTS**.

---

## 1. Production Architecture Overview

```
                      INTERNET / CLIENTS
                              │
                    HTTPS (Port 443) / SSL
                              ▼
            ┌───────────────────────────────────┐
            │       NGINX Web Server            │
            │  - SSL Termination (Let's Encrypt)│
            │  - Serves React SPA (Static HTML) │
            │  - Gzip compression & HTTP/2      │
            └───────────────┬───────────────────┘
                            │
               Reverse Proxy │ /api/*
                            ▼
            ┌───────────────────────────────────┐
            │  Spring Boot REST API (Port 8080) │
            │  - Managed by Systemd Service     │
            │  - Bound to 127.0.0.1 (Localhost) │
            └───────────────┬───────────────────┘
                            │
               JPA / JDBC   │ Port 3306
                            ▼
            ┌───────────────────────────────────┐
            │   MySQL 8.0 Server                │
            │  - Bound to 127.0.0.1 only        │
            │  - Isolated app credentials       │
            └───────────────────────────────────┘
```

---

## 2. Step 1: Initial VPS Setup & Firewall Hardening

Connect to your VPS via SSH as root:
```bash
ssh root@YOUR_SERVER_IP
```

### 1. Update system packages
```bash
apt update && apt upgrade -y
```

### 2. Create a dedicated application user (Non-root)
```bash
adduser booknook
usermod -aG sudo booknook
```

### 3. Configure UFW Firewall
Protect MySQL and internal services by allowing only HTTP, HTTPS, and SSH:
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```
*(Verify status with `ufw status`. Port 3306 and 8080 must NEVER be exposed publicly).*

---

## 3. Step 2: Install Required Server Software

Run the following command to install Java 17, MySQL 8, Nginx, and Certbot:
```bash
apt install -y openjdk-17-jdk-headless mysql-server nginx certbot python3-certbot-nginx
```

Verify software versions:
```bash
java -version
mysql --version
nginx -v
```

---

## 4. Step 3: Secure MySQL & Create Production Database

### 1. Secure MySQL installation
```bash
mysql_secure_installation
```
Follow prompts:
- Enable password validation: `Y`
- Remove anonymous users: `Y`
- Disallow root login remotely: `Y`
- Remove test database: `Y`
- Reload privilege tables: `Y`

### 2. Create database and dedicated production user
Log in to MySQL as root:
```bash
mysql -u root -p
```

Run these SQL queries:
```sql
-- Create production database
CREATE DATABASE booknook_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create application user with a strong unique password
CREATE USER 'booknook_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_VERY_STRONG_SECRET_PASSWORD';

-- Grant privileges only on this database
GRANT ALL PRIVILEGES ON booknook_prod.* TO 'booknook_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Import Initial Catalog & Schema
Transfer `database/booknook_complete_schema.sql` to your server (or clone the repository) and import it:
```bash
mysql -u booknook_user -p booknook_prod < /path/to/booknook_complete_schema.sql
```

---

## 5. Step 4: Build & Deploy Spring Boot Backend

### 1. Package JAR on your local development machine
In Windows Command Prompt:
```cmd
cd c:\eclipsecodes\Online_Book_Store\backend
mvn clean package -DskipTests
```
This produces an executable JAR in `backend/target/bookstore-api-1.0.0.jar`.

### 2. Upload JAR to VPS
Using SCP or SFTP (e.g. WinSCP or FileZilla):
```cmd
scp backend/target/bookstore-api-1.0.0.jar booknook@YOUR_SERVER_IP:/home/booknook/
```

### 3. Place JAR in standard deployment directory on VPS
On the VPS:
```bash
mkdir -p /opt/booknook
cp /home/booknook/bookstore-api-1.0.0.jar /opt/booknook/bookstore-api.jar
chown -R booknook:booknook /opt/booknook
```

### 4. Create secure Environment Configuration File
Create `/opt/booknook/booknook.env`:
```bash
nano /opt/booknook/booknook.env
```
Paste the following (replace with your actual production secrets):
```ini
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_NAME=booknook_prod
DB_USER=booknook_user
DB_PASSWORD=REPLACE_WITH_VERY_STRONG_SECRET_PASSWORD
JWT_SECRET=BookNookProdSuperSecretKeyThatMustBeAtLeast32BytesLongForSha256!
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```
Protect the secret file so only the `booknook` user can read it:
```bash
chmod 600 /opt/booknook/booknook.env
chown booknook:booknook /opt/booknook/booknook.env
```

### 5. Create Systemd Service for Auto-Start & Auto-Restart
Create `/etc/systemd/system/booknook.service`:
```bash
nano /etc/systemd/system/booknook.service
```
Paste this configuration:
```ini
[Unit]
Description=BookNook Spring Boot Application
After=syslog.target network.target mysql.service

[Service]
User=booknook
Group=booknook
WorkingDirectory=/opt/booknook
EnvironmentFile=/opt/booknook/booknook.env
ExecStart=/usr/bin/java -Xms256m -Xmx512m -jar /opt/booknook/bookstore-api.jar
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
systemctl daemon-reload
systemctl enable booknook.service
systemctl start booknook.service
```

Check status and live logs:
```bash
systemctl status booknook.service
journalctl -u booknook.service -f
```

---

## 6. Step 5: Build & Deploy React Frontend

### 1. Build production bundle on your local machine
In Windows Command Prompt:
```cmd
cd c:\eclipsecodes\Online_Book_Store\frontend
npm run build
```
This produces an optimized production bundle in `frontend/dist/`.

### 2. Transfer `dist/` folder to VPS
```cmd
scp -r frontend/dist/* booknook@YOUR_SERVER_IP:/home/booknook/dist/
```

### 3. Move static assets to web root
On the VPS:
```bash
mkdir -p /var/www/booknook
cp -r /home/booknook/dist/* /var/www/booknook/
chown -R www-data:www-data /var/www/booknook
chmod -R 755 /var/www/booknook
```

---

## 7. Step 6: Configure Nginx & SSL Certificate

### 1. Create Nginx Site Configuration
Create `/etc/nginx/sites-available/booknook`:
```bash
nano /etc/nginx/sites-available/booknook
```
Paste this configuration (replace `yourdomain.com` with your actual domain name):
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/booknook;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # React SPA Routing - Fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Reverse Proxy for Spring Boot REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Enable the configuration and reload Nginx:
```bash
ln -s /etc/nginx/sites-available/booknook /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### 2. Configure Free SSL with Let's Encrypt Certbot
Ensure your domain's DNS `A` records point to your VPS IP address, then run:
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow prompts to enter your email and agree to terms. Certbot will automatically install SSL certificates and configure HTTPS redirects!

---

## 8. Step 7: Automated Daily Database Backups

Create a backup script at `/opt/booknook/backup_db.sh`:
```bash
nano /opt/booknook/backup_db.sh
```
Paste:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/booknook"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mysqldump -u booknook_user -p'REPLACE_WITH_VERY_STRONG_SECRET_PASSWORD' booknook_prod | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Keep only last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```
Make it executable:
```bash
chmod +x /opt/booknook/backup_db.sh
```
Add to crontab to run every night at 2:00 AM:
```bash
crontab -e
```
Add line:
```cron
0 2 * * * /opt/booknook/backup_db.sh > /dev/null 2>&1
```

---

## 9. Summary of Production Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Restart Backend** | `sudo systemctl restart booknook.service` |
| **View Live Backend Logs** | `sudo journalctl -u booknook.service -f` |
| **Check Backend Status** | `sudo systemctl status booknook.service` |
| **Reload Nginx** | `sudo systemctl reload nginx` |
| **View Nginx Error Logs** | `sudo tail -f /var/log/nginx/error.log` |
| **Renew SSL Certificate** | `sudo certbot renew --dry-run` |
| **Restart MySQL** | `sudo systemctl restart mysql` |
