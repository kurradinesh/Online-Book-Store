package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.booknook.util.DBConnection;

@WebServlet("/GetBooksServlet")
public class GetBooksServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        StringBuilder json = new StringBuilder("[");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(
                     "SELECT id, title, author, price, genre, image_url FROM books ORDER BY id DESC");
             ResultSet rs = ps.executeQuery()) {
            boolean first = true;
            while (rs.next()) {
                if (!first) {
                    json.append(',');
                }
                first = false;
                json.append('{')
                    .append("\"id\":").append(rs.getInt("id"))
                    .append(",\"name\":\"").append(escapeJson(rs.getString("title"))).append("\"")
                    .append(",\"title\":\"").append(escapeJson(rs.getString("title"))).append("\"")
                    .append(",\"author\":\"").append(escapeJson(rs.getString("author"))).append("\"")
                    .append(",\"price\":").append(rs.getDouble("price"))
                    .append(",\"genre\":\"").append(escapeJson(rs.getString("genre"))).append("\"")
                    .append(",\"image\":\"").append(escapeJson(rs.getString("image_url"))).append("\"")
                    .append(",\"category\":\"").append(escapeJson(rs.getString("genre"))).append("\"")
                    .append('}');
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("[]");
            return;
        }

        json.append(']');
        response.getWriter().print(json.toString());
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
