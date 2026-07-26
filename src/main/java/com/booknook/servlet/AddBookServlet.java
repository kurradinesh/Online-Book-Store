package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.booknook.util.DBConnection;

@WebServlet("/AddBookServlet")
public class AddBookServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || !"admin".equalsIgnoreCase((String) session.getAttribute("userRole"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().println("Forbidden - Admin access required.");
            return;
        }

        String title = request.getParameter("title");
        String author = request.getParameter("author");
        String price = request.getParameter("price");
        String genre = request.getParameter("genre");

        String contentType = request.getContentType();
        if (contentType != null && contentType.contains("application/json")) {
            String body = request.getReader().lines().reduce("", String::concat);
            if (!body.isBlank()) {
                java.util.Map<String, String> jsonMap = com.booknook.util.JsonParser.parse(body);
                title = jsonMap.getOrDefault("title", title);
                author = jsonMap.getOrDefault("author", author);
                price = jsonMap.getOrDefault("price", price);
                genre = jsonMap.getOrDefault("genre", genre);
            }
        }

        response.setContentType("text/plain;charset=UTF-8");

        if (title == null || author == null || price == null || genre == null
                || title.trim().isEmpty() || author.trim().isEmpty() || price.trim().isEmpty() || genre.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Please fill in all book fields.");
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            if (conn == null) {
                response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                response.getWriter().println("Database connection is not available.");
                return;
            }

            String sql = "INSERT INTO books (title, author, price, genre, image_url) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.setString(1, title.trim());
                ps.setString(2, author.trim());
                ps.setDouble(3, Double.parseDouble(price));
                ps.setString(4, genre.trim());
                ps.setString(5, null);
                ps.executeUpdate();
            }

            response.sendRedirect("ViewBooksServlet");
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("Price must be a valid number.");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("Unable to add the book right now: " + e.getMessage());
        }
    }
}