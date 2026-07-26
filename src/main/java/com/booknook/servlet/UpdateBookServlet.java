package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.booknook.util.DBConnection;

@WebServlet("/UpdateBookServlet")
public class UpdateBookServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session == null || !"admin".equalsIgnoreCase((String) session.getAttribute("userRole"))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().print("{\"success\":false,\"message\":\"Forbidden - Admin access required.\"}");
            return;
        }

        response.setContentType("application/json;charset=UTF-8");
        String idParam = request.getParameter("id");
        String name = request.getParameter("name");
        String priceParam = request.getParameter("price");

        String contentType = request.getContentType();
        if (contentType != null && contentType.contains("application/json")) {
            String body = request.getReader().lines().reduce("", String::concat);
            if (!body.isBlank()) {
                java.util.Map<String, String> jsonMap = com.booknook.util.JsonParser.parse(body);
                idParam = jsonMap.getOrDefault("id", idParam);
                name = jsonMap.getOrDefault("name", name);
                priceParam = jsonMap.getOrDefault("price", priceParam);
            }
        }

        if (idParam == null || idParam.isBlank()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("{\"success\":false,\"message\":\"Missing book id\"}");
            return;
        }

        try (Connection conn = DBConnection.getConnection()) {
            StringBuilder sql = new StringBuilder("UPDATE books SET ");
            boolean hasField = false;

            if (name != null && !name.isBlank()) {
                sql.append("title = ?");
                hasField = true;
            }
            if (priceParam != null && !priceParam.isBlank()) {
                if (hasField) {
                    sql.append(", ");
                }
                sql.append("price = ?");
                hasField = true;
            }

            if (!hasField) {
                response.getWriter().print("{\"success\":false,\"message\":\"No fields to update\"}");
                return;
            }

            sql.append(" WHERE id = ?");
            try (PreparedStatement ps = conn.prepareStatement(sql.toString())) {
                int index = 1;
                if (name != null && !name.isBlank()) {
                    ps.setString(index++, name.trim());
                }
                if (priceParam != null && !priceParam.isBlank()) {
                    ps.setDouble(index++, Double.parseDouble(priceParam));
                }
                ps.setInt(index, Integer.parseInt(idParam));
                int rows = ps.executeUpdate();
                response.getWriter().print("{\"success\":" + (rows > 0) + "}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"success\":false,\"message\":\"Update failed\"}");
        }
    }
}
