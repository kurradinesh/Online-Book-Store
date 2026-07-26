package com.booknook.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;
import com.booknook.util.DBConnection;
import com.booknook.util.PasswordUtil;

@WebServlet("/ProfileServlet")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 5 * 1024 * 1024)
public class ProfileServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private static boolean schemaChecked = false;

    private synchronized void checkSchema(Connection conn) {
        if (schemaChecked) return;
        String[] alterQueries = {
            "ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20) NULL",
            "ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en'",
            "ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'",
            "ALTER TABLE users ADD COLUMN promo_emails BOOLEAN DEFAULT TRUE",
            "ALTER TABLE users ADD COLUMN order_updates BOOLEAN DEFAULT TRUE"
        };
        try (java.sql.Statement stmt = conn.createStatement()) {
            for (String query : alterQueries) {
                try {
                    stmt.executeUpdate(query);
                } catch (SQLException e) {
                    // 1060 is MySQL code for duplicate column name. We ignore it.
                    if (e.getErrorCode() != 1060) {
                        e.printStackTrace();
                    }
                }
            }
            schemaChecked = true;
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"success\": false, \"message\": \"Unauthorized\"}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");

        try (Connection conn = DBConnection.getConnection()) {
            checkSchema(conn);
            String sql = "SELECT name, email, role, avatar_url, mobile_number, language, timezone, promo_emails, order_updates FROM users WHERE email = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, userEmail);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String name = rs.getString("name");
                String email = rs.getString("email");
                String role = "customer";
                String avatarUrl = "";
                String mobileNumber = "";
                String language = "en";
                String timezone = "Asia/Kolkata";
                boolean promoEmails = true;
                boolean orderUpdates = true;

                try {
                    String fetchedRole = rs.getString("role");
                    if (fetchedRole != null) role = fetchedRole;
                } catch (SQLException ignore) {}
                try {
                    String fetchedAvatar = rs.getString("avatar_url");
                    if (fetchedAvatar != null) avatarUrl = fetchedAvatar;
                } catch (SQLException ignore) {}
                try {
                    String fetchedMobile = rs.getString("mobile_number");
                    if (fetchedMobile != null) mobileNumber = fetchedMobile;
                } catch (SQLException ignore) {}
                try {
                    String fetchedLang = rs.getString("language");
                    if (fetchedLang != null) language = fetchedLang;
                } catch (SQLException ignore) {}
                try {
                    String fetchedTz = rs.getString("timezone");
                    if (fetchedTz != null) timezone = fetchedTz;
                } catch (SQLException ignore) {}
                try {
                    promoEmails = rs.getBoolean("promo_emails");
                } catch (SQLException ignore) {}
                try {
                    orderUpdates = rs.getBoolean("order_updates");
                } catch (SQLException ignore) {}

                String initials = "BK";
                if (name != null && !name.trim().isEmpty()) {
                    String[] parts = name.trim().split("\\s+");
                    if (parts.length >= 2) {
                        initials = (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
                    } else {
                        initials = parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
                    }
                }
                writeJson(response, "{\"success\": true, \"name\": \"" + escapeJson(name) + 
                    "\", \"email\": \"" + escapeJson(email) + 
                    "\", \"role\": \"" + escapeJson(role) + 
                    "\", \"avatarUrl\": \"" + escapeJson(avatarUrl) + 
                    "\", \"initials\": \"" + escapeJson(initials) + 
                    "\", \"mobileNumber\": \"" + escapeJson(mobileNumber) + 
                    "\", \"language\": \"" + escapeJson(language) + 
                    "\", \"timezone\": \"" + escapeJson(timezone) + 
                    "\", \"promoEmails\": " + promoEmails + 
                    ", \"orderUpdates\": " + orderUpdates + "}");
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"Profile not found\"}");
            }
            ps.close();
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Unable to load profile\"}");
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"success\": false, \"message\": \"Unauthorized\"}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");
        String contentType = request.getContentType();
        
        // Handle JSON Password Change action
        if (contentType != null && contentType.contains("application/json")) {
            String body = request.getReader().lines().reduce("", String::concat);
            java.util.Map<String, String> jsonMap = com.booknook.util.JsonParser.parse(body);
            String action = jsonMap.getOrDefault("action", "");
            if ("changePassword".equalsIgnoreCase(action)) {
                changePassword(request, response, userEmail, jsonMap);
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"Invalid profile action\"}");
            }
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            checkSchema(conn);
            String name = request.getParameter("name");
            String mobileNumber = request.getParameter("mobileNumber");
            String language = request.getParameter("language");
            String timezone = request.getParameter("timezone");
            boolean promoEmails = request.getParameter("promoEmails") != null;
            boolean orderUpdates = request.getParameter("orderAlerts") != null;

            String avatarUrl = null;
            Part avatarPart = null;
            try {
                avatarPart = request.getPart("avatar");
            } catch (IllegalStateException | ServletException ignore) {
                avatarPart = null;
            }
            if (avatarPart != null && avatarPart.getSize() > 0) {
                String originalName = Path.of(avatarPart.getSubmittedFileName()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_" + originalName.replaceAll("[^a-zA-Z0-9_.-]", "_");
                String uploadDir = request.getServletContext().getRealPath("/uploads/avatars");
                if (uploadDir == null) {
                    uploadDir = System.getProperty("java.io.tmpdir") + "/uploads/avatars";
                }
                Files.createDirectories(Paths.get(uploadDir));
                Path saved = Paths.get(uploadDir, fileName);
                try (InputStream input = avatarPart.getInputStream()) {
                    Files.copy(input, saved, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                }
                avatarUrl = request.getContextPath() + "/uploads/avatars/" + fileName;
            }

            String updateSql = avatarUrl != null ?
                    "UPDATE users SET name = ?, mobile_number = ?, language = ?, timezone = ?, promo_emails = ?, order_updates = ?, avatar_url = ? WHERE email = ?" :
                    "UPDATE users SET name = ?, mobile_number = ?, language = ?, timezone = ?, promo_emails = ?, order_updates = ? WHERE email = ?";
            
            PreparedStatement ps = conn.prepareStatement(updateSql);
            ps.setString(1, name);
            ps.setString(2, mobileNumber);
            ps.setString(3, language);
            ps.setString(4, timezone);
            ps.setBoolean(5, promoEmails);
            ps.setBoolean(6, orderUpdates);
            
            if (avatarUrl != null) {
                ps.setString(7, avatarUrl);
                ps.setString(8, userEmail);
            } else {
                ps.setString(7, userEmail);
            }
            
            int updated = ps.executeUpdate();
            ps.close();
            
            if (updated > 0) {
                // Update dynamic session values for header
                session.setAttribute("userName", name);
                if (avatarUrl != null) {
                    session.setAttribute("userPhoto", avatarUrl);
                }
                
                if (avatarUrl != null) {
                    writeJson(response, "{\"success\": true, \"avatarUrl\": \"" + escapeJson(avatarUrl) + "\"}");
                } else {
                    writeJson(response, "{\"success\": true}");
                }
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"Unable to save profile\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Unable to save profile\"}");
        }
    }

    private void changePassword(HttpServletRequest request, HttpServletResponse response, String userEmail, java.util.Map<String, String> jsonMap) throws IOException {
        String currentPassword = jsonMap.getOrDefault("currentPassword", "");
        String newPassword = jsonMap.getOrDefault("newPassword", "");
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT password FROM users WHERE email = ?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, userEmail);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String storedPassword = rs.getString("password");
                if (PasswordUtil.verify(currentPassword, storedPassword)) {
                    String updateSql = "UPDATE users SET password = ? WHERE email = ?";
                    PreparedStatement update = conn.prepareStatement(updateSql);
                    update.setString(1, PasswordUtil.hash(newPassword));
                    update.setString(2, userEmail);
                    update.executeUpdate();
                    update.close();
                    writeJson(response, "{\"success\": true, \"message\": \"Password updated successfully\"}");
                } else {
                    writeJson(response, "{\"success\": false, \"message\": \"Current password is incorrect\"}");
                }
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"User not found\"}");
            }
            ps.close();
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Unable to update password\"}");
        }
    }

    private void writeJson(HttpServletResponse response, String payload) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(payload);
        out.flush();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
