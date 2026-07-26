# Online Book Store — Password Reset Setup

This project now includes a complete Forgot Password / Reset Password flow using servlets, JSPs, and JDBC. Follow these steps to get it working locally.

## 1) Apply DB schema change
Run the SQL in `mysql-schema.sql` to create the `password_resets` table and related indexes:

```sql
-- creates a `password_resets` table and an index on `users.email` for lookups
-- (file: mysql-schema.sql)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
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
```

## 2) Add required JARs to `WEB-INF/lib`
Download these jars and place them in `src/main/webapp/WEB-INF/lib` (or your deployed `WEB-INF/lib`):

- jBCrypt: https://repo1.maven.org/maven2/org/mindrot/jbcrypt/0.4/jbcrypt-0.4.jar
- Jakarta Mail: https://repo1.maven.org/maven2/com/sun/mail/jakarta.mail/1.6.7/jakarta.mail-1.6.7.jar
- Jakarta Activation API: https://repo1.maven.org/maven2/jakarta/activation/jakarta.activation-api/1.2.2/jakarta.activation-api-1.2.2.jar

I included a PowerShell helper script `scripts/download-deps.ps1` to download these automatically.

## 3) Configure SMTP credentials
Set environment variables (recommended) for SMTP before starting Tomcat. Example (PowerShell):

```powershell
$env:BOOKNOOK_SMTP_HOST = 'smtp.gmail.com'
$env:BOOKNOOK_SMTP_PORT = '587'
$env:BOOKNOOK_SMTP_USER = 'your-email@gmail.com'
$env:BOOKNOOK_SMTP_PASS = 'your-app-password'
$env:BOOKNOOK_FROM = 'no-reply@booknook.com'
```

Alternatively, edit `src/main/java/com/booknook/util/EmailUtility.java` (not recommended).

## 4) Deploy
- In Eclipse: Refresh project, ensure new files are included.
- Put jars into `WEB-INF/lib`, Project -> Clean, restart Tomcat.

## 5) Test the flow
1. Open login page: `login.html` → click "Forgot password?".
2. Enter a registered email in `forgot-password.jsp`.
3. Check email for OTP.
4. Enter OTP in `verify-otp.jsp`.
5. Set new password in `reset-password.jsp`.
6. Login using new credentials.

## 6) Troubleshooting
- If emails don't send, verify SMTP credentials and that your provider allows SMTP.
- If BCrypt verification fails, ensure `jbcrypt-0.4.jar` is in `WEB-INF/lib`.
- Check Tomcat logs for stack traces.

## Notes on security improvements

- The project now uses a dedicated `password_resets` table to store OTPs and support rate-limiting. This is created by the updated `mysql-schema.sql`.
- Basic rate-limiting is enforced: minimum interval between sends (30s) and a maximum attempts window (configurable in code: currently 5 attempts per hour).
- CSRF protection: forms include a per-session CSRF token and servlets validate it. Ensure cookies/sessions are enabled.
 - Rate-limiting: minimum interval between sends (30s), maximum attempts per email (configurable, currently 5 per hour), and per-IP limits (currently 20 requests per hour). These values are configurable in `PasswordResetDAO`.
 - Rate-limiting: minimum interval between sends (30s), maximum attempts per email (configurable, currently 5 per hour), and per-IP limits (currently 20 requests per hour). IPs that exceed per-IP thresholds are temporarily banned (default 1 hour); these thresholds and ban durations are configurable in `PasswordResetDAO`.
 - CSRF protection: forms include a per-session CSRF token and servlets validate it. Ensure cookies/sessions are enabled.

## 7) Next improvements (optional)
- Move SMTP config to Tomcat context params.
- Add DB-backed rate limiting per IP/email.
- Add CSRF tokens to forms.
- Replace in-row OTP storage with a `password_resets` table for audit logging.

---
If you want, I can run the dependency download script or add CSRF tokens and/or a `password_resets` table next.