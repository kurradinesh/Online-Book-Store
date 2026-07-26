package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.booknook.util.DBConnection;
import com.booknook.util.PasswordUtil;

@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        response.setContentType("text/plain;charset=UTF-8");

        if (name == null || email == null || password == null || name.trim().isEmpty() || email.trim().isEmpty() || password.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("All fields are required.");
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            if (conn == null) {
                response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                response.getWriter().println("Database connection is not available.");
                return;
            }

            // Check if email already exists
            String checkSql = "SELECT id FROM users WHERE email = ?";
            try (PreparedStatement checkPs = conn.prepareStatement(checkSql)) {
                checkPs.setString(1, email.trim().toLowerCase());
                try (java.sql.ResultSet rs = checkPs.executeQuery()) {
                    if (rs.next()) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        response.getWriter().println("Email is already registered.");
                        return;
                    }
                }
            }

            String sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, name.trim());
                ps.setString(2, email.trim().toLowerCase());
                ps.setString(3, PasswordUtil.hash(password));
                ps.executeUpdate();
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().println("Registration successful.");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Registration failed: " + e.getMessage());
        }
    }
}