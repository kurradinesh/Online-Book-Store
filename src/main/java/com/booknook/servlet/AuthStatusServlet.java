package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@WebServlet("/AuthStatusServlet")
public class AuthStatusServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        HttpSession session = request.getSession(false);

        if (session != null && session.getAttribute("userEmail") != null) {
            String username = (String) session.getAttribute("userName");
            String userEmail = (String) session.getAttribute("userEmail");
            String role = (String) session.getAttribute("userRole");
            out.print("{\"isLoggedIn\": true, \"username\": \"" + escapeJson(username) + "\", \"email\": \"" + escapeJson(userEmail) + "\", \"role\": \"" + escapeJson(role) + "\"}");
        } else {
            out.print("{\"isLoggedIn\": false}");
        }
        out.flush();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}