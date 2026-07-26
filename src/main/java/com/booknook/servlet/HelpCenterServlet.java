package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.booknook.util.DBConnection;

@WebServlet("/HelpCenterServlet")
public class HelpCenterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"success\": false, \"message\": \"Unauthorized\"}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");
        String body = request.getReader().lines().reduce("", String::concat);
        java.util.Map<String, String> jsonMap = com.booknook.util.JsonParser.parse(body);
        String action = jsonMap.getOrDefault("action", "");

        try (Connection conn = DBConnection.getConnection()) {
            if ("contact".equalsIgnoreCase(action)) {
                String subject = jsonMap.getOrDefault("subject", "");
                String message = jsonMap.getOrDefault("message", "");
                saveRequest(conn, userEmail, "contact", subject, message);
                writeJson(response, "{\"success\": true}");
            } else if ("report".equalsIgnoreCase(action)) {
                String issueType = jsonMap.getOrDefault("issueType", "");
                String details = jsonMap.getOrDefault("details", "");
                saveRequest(conn, userEmail, issueType, "Report issue", details);
                writeJson(response, "{\"success\": true}");
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"Invalid action\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Unable to submit request\"}");
        }
    }

    private void saveRequest(Connection conn, String userEmail, String requestType, String subject, String details) throws Exception {
        String sql = "INSERT INTO help_requests (user_email, request_type, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ps.setString(2, requestType);
        ps.setString(3, subject);
        ps.setString(4, details);
        ps.executeUpdate();
        ps.close();
    }

    private void writeJson(HttpServletResponse response, String payload) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(payload);
        out.flush();
    }
}
