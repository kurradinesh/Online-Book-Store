package com.booknook.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.Instant;

import com.booknook.util.DBConnection;

public class PasswordResetDAO {

    // Create or update a reset entry for an email
    public static void createOrUpdate(String email, String otp, Timestamp expiry, String ip) throws Exception {
        String select = "SELECT id FROM password_resets WHERE email = ? AND used = FALSE";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(select)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String upd = "UPDATE password_resets SET otp = ?, expiry_time = ?, last_sent_at = ?, attempts = attempts + 1 WHERE email = ?";
                    try (PreparedStatement ps2 = conn.prepareStatement(upd)) {
                        ps2.setString(1, otp);
                        ps2.setTimestamp(2, expiry);
                        ps2.setTimestamp(3, Timestamp.from(Instant.now()));
                        ps2.setString(4, email);
                        ps2.executeUpdate();
                    }
                    // record request
                    try (PreparedStatement log = conn.prepareStatement("INSERT INTO password_reset_requests (email, ip) VALUES (?, ?)")) {
                        log.setString(1, email);
                        log.setString(2, ip);
                        log.executeUpdate();
                    }
                    return;
                }
            }
        }

        String insert = "INSERT INTO password_resets (email, otp, expiry_time, last_sent_at, attempts, used) VALUES (?, ?, ?, ?, 1, FALSE)";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(insert)) {
            ps.setString(1, email);
            ps.setString(2, otp);
            ps.setTimestamp(3, expiry);
            ps.setTimestamp(4, Timestamp.from(Instant.now()));
            ps.executeUpdate();
            try (PreparedStatement log = conn.prepareStatement("INSERT INTO password_reset_requests (email, ip) VALUES (?, ?)")) {
                log.setString(1, email);
                log.setString(2, ip);
                log.executeUpdate();
            }
        }
    }

    // Check simple rate limits: minIntervalSeconds between sends and maxAttempts within window
    // Check simple rate limits: minIntervalSeconds between sends and maxAttempts within window;
    // also enforce per-IP request limits (maxIpRequests within windowSeconds)
    public static boolean canSend(String email, String ip, int minIntervalSeconds, int maxAttempts, int windowSeconds, int maxIpRequests) throws Exception {
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT last_sent_at, attempts, created_at FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, email);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        // check ip history too
                        return checkIp(conn, ip, windowSeconds, maxIpRequests);
                    }
                    Timestamp lastSent = rs.getTimestamp("last_sent_at");
                    int attempts = rs.getInt("attempts");
                    Timestamp created = rs.getTimestamp("created_at");
                    long now = System.currentTimeMillis();
                    if (lastSent != null && now - lastSent.getTime() < minIntervalSeconds * 1000L) return false;
                    if (created != null && now - created.getTime() > windowSeconds * 1000L) {
                        return checkIp(conn, ip, windowSeconds, maxIpRequests);
                    }
                    if (attempts >= maxAttempts) return false;
                    return checkIp(conn, ip, windowSeconds, maxIpRequests);
                }
            }
        }
    }

    private static boolean checkIp(Connection conn, String ip, int windowSeconds, int maxIpRequests) throws Exception {
        // Check if IP is currently banned
        if (isIpBanned(conn, ip)) return false;
        String s = "SELECT COUNT(*) as cnt FROM password_reset_requests WHERE ip = ? AND requested_at >= ?";
        try (PreparedStatement ps = conn.prepareStatement(s)) {
            ps.setString(1, ip);
            ps.setTimestamp(2, Timestamp.from(Instant.now().minusSeconds(windowSeconds)));
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int cnt = rs.getInt("cnt");
                    if (cnt >= maxIpRequests) {
                        // Ban IP for 1 hour
                        banIp(conn, ip, 3600, "exceeded reset requests");
                        return false;
                    }
                    return cnt < maxIpRequests;
                }
            }
        }
        return true;
    }

    private static boolean isIpBanned(Connection conn, String ip) throws Exception {
        String q = "SELECT banned_until FROM password_reset_bans WHERE ip = ? ORDER BY id DESC LIMIT 1";
        try (PreparedStatement ps = conn.prepareStatement(q)) {
            ps.setString(1, ip);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Timestamp until = rs.getTimestamp("banned_until");
                    if (until != null && until.after(Timestamp.from(Instant.now()))) return true;
                }
            }
        }
        return false;
    }

    private static void banIp(Connection conn, String ip, int banSeconds, String reason) throws Exception {
        String ins = "INSERT INTO password_reset_bans (ip, banned_until, reason) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(ins)) {
            ps.setString(1, ip);
            ps.setTimestamp(2, Timestamp.from(Instant.now().plusSeconds(banSeconds)));
            ps.setString(3, reason);
            ps.executeUpdate();
        }
    }

    public static boolean verifyOtp(String email, String otp) throws Exception {
        String sql = "SELECT id, otp, expiry_time, used FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String stored = rs.getString("otp");
                    Timestamp expiry = rs.getTimestamp("expiry_time");
                    boolean used = rs.getBoolean("used");
                    if (used) return false;
                    if (expiry == null || expiry.before(Timestamp.from(Instant.now()))) return false;
                    if (!stored.equals(otp)) return false;
                    // mark used
                    int id = rs.getInt("id");
                    try (PreparedStatement mu = conn.prepareStatement("UPDATE password_resets SET used = TRUE WHERE id = ?")) {
                        mu.setInt(1, id);
                        mu.executeUpdate();
                    }
                    return true;
                }
            }
        }
        return false;
    }

    public static void clearByEmail(String email) throws Exception {
        String sql = "DELETE FROM password_resets WHERE email = ?";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.executeUpdate();
        }
    }
}
