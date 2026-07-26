package com.booknook.servlet;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.booknook.util.PasswordUtil;
import com.booknook.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;

@WebServlet("/ResetPasswordServlet")
public class ResetPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private boolean validatePassword(String pwd) {
        if (pwd == null) return false;
        if (pwd.length() < 8) return false;
        if (!pwd.matches(".*[A-Z].*")) return false;
        if (!pwd.matches(".*[a-z].*")) return false;
        if (!pwd.matches(".*[0-9].*")) return false;
        if (!pwd.matches(".*[\\W_].*")) return false;
        return true;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        response.setContentType("text/html;charset=UTF-8");

        if (session == null || session.getAttribute("resetEmail") == null || session.getAttribute("otpVerified") == null) {
            response.getWriter().println("<div class='alert alert-danger'>Unauthorized or session expired.</div>");
            return;
        }

        
        String csrfParam = request.getParameter("csrfToken");
        String csrfSession = (String) request.getSession().getAttribute("csrfToken");
        if (csrfSession == null || csrfParam == null || !csrfSession.equals(csrfParam)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().println("<div class='alert alert-danger'>Invalid request.</div>");
            return;
        }

        String email = (String) session.getAttribute("resetEmail");
        String pwd = request.getParameter("password");
        String confirm = request.getParameter("confirmPassword");

        if (pwd == null || confirm == null || !pwd.equals(confirm)) {
            response.getWriter().println("<div class='alert alert-danger'>Passwords do not match.</div>");
            return;
        }
        if (!validatePassword(pwd)) {
            response.getWriter().println("<div class='alert alert-danger'>Password does not meet complexity requirements.</div>");
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            String sql = "UPDATE users SET password = ? WHERE email = ?";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, PasswordUtil.hash(pwd));
                ps.setString(2, email);
                ps.executeUpdate();
            }

           
            try { com.booknook.dao.PasswordResetDAO.clearByEmail(email); } catch (Exception e) { e.printStackTrace(); }

            
            session.removeAttribute("resetEmail");
            session.removeAttribute("otpVerified");
            session.removeAttribute("otpSentAt");

            response.sendRedirect("login.html");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<div class='alert alert-danger'>Unable to reset password currently.</div>");
        }
    }
}
