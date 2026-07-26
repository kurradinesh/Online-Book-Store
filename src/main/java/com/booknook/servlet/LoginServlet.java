package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.booknook.util.DBConnection;
import com.booknook.util.PasswordUtil;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        
        request.setCharacterEncoding("UTF-8");
        
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        if (email == null || password == null || email.trim().isEmpty() || password.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("Please fill in all fields");
            return;
        }

        String sql = "SELECT name, role, password FROM users WHERE email = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            
            ps.setString(1, email.trim());
            
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    String name = rs.getString("name");
                    String role = rs.getString("role");
                    String storedPassword = rs.getString("password");
                    
                   
                    if (PasswordUtil.verify(password, storedPassword)) {
                        HttpSession session = request.getSession();
                        session.setAttribute("userName", name);
                        session.setAttribute("userEmail", email);
                        session.setAttribute("userRole", role != null ? role : "customer");

                        
                        response.setContentType("application/json");
                        out.print("{\"status\":\"success\",\"message\":\"Login successful\",\"role\":\"" + role + "\"}");
                        return;
                    }
                }
            }
            
            
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.print("Invalid email or password.");

        } catch (SQLException e) {
            getServletContext().log("Database login error", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("Database connection error. Please try again later.");
        }
    }
}