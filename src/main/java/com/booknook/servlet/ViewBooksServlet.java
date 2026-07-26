package com.booknook.servlet;

import java.io.IOException;
import java.sql.*;
import java.util.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import com.booknook.util.DBConnection;

@WebServlet("/ViewBooksServlet")
public class ViewBooksServlet extends HttpServlet {
    
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || !"admin".equalsIgnoreCase((String) session.getAttribute("userRole"))) {
            response.sendRedirect("login.html");
            return;
        }

        List<String[]> books = new ArrayList<>();
        
        try (Connection conn = DBConnection.getConnection()) {
            
            String sql = "SELECT id, title, author, price, genre FROM books";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);
            
            while (rs.next()) {
                books.add(new String[]{
                    rs.getString("id"), 
                    rs.getString("title"), 
                    rs.getString("author"), 
                    rs.getString("price"), 
                    rs.getString("genre")
                });
            }
            
            request.setAttribute("bookList", books);
            request.getRequestDispatcher("admin.jsp").forward(request, response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<h1>Error loading books: " + e.getMessage() + "</h1>");
        }
    }
}