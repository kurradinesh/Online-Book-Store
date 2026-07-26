package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.booknook.util.DBConnection;

@WebServlet("/DeleteBookServlet")
public class DeleteBookServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || !"admin".equalsIgnoreCase((String) session.getAttribute("userRole"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().print("{\"success\":false,\"message\":\"Forbidden - Admin access required.\"}");
            return;
        }

        response.setContentType("application/json;charset=UTF-8");
        String idParam = request.getParameter("id");
        if (idParam == null || idParam.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("{\"success\":false,\"message\":\"Missing book id\"}");
            return;
        }

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM books WHERE id = ?")) {
            ps.setInt(1, Integer.parseInt(idParam));
            int rows = ps.executeUpdate();
            response.getWriter().print("{\"success\":" + (rows > 0) + "}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"success\":false,\"message\":\"Delete failed\"}");
        }
    }
}
