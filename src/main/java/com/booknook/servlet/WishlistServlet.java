package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.booknook.util.DBConnection;

@WebServlet("/WishlistServlet")
public class WishlistServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"items\": []}");
            return;
        }

        String userEmail = (String) session.getAttribute("userEmail");
        String action = request.getParameter("action");
        if (action == null) action = "list";

        try (Connection conn = DBConnection.getConnection()) {
            if ("list".equalsIgnoreCase(action)) {
                listWishlist(conn, response, userEmail);
            } else {
                writeJson(response, "{\"items\": []}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"items\": []}");
        }
    }

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
        String action = request.getParameter("action");
        if (action == null && !jsonMap.isEmpty()) {
            action = jsonMap.get("action");
        }
        if (action == null) action = request.getParameter("actionType");

        try (Connection conn = DBConnection.getConnection()) {
            if ("add".equalsIgnoreCase(action)) {
                String productIdStr = jsonMap.getOrDefault("productId", "0");
                int productId = Integer.parseInt(productIdStr.isBlank() ? "0" : productIdStr);
                String title = jsonMap.getOrDefault("title", "");
                String author = jsonMap.getOrDefault("author", "");
                String coverUrl = jsonMap.getOrDefault("coverUrl", "");
                String priceStr = jsonMap.getOrDefault("unitPrice", "0");
                double price = Double.parseDouble(priceStr.isBlank() ? "0" : priceStr);
                String category = jsonMap.getOrDefault("category", "");
                addWishlistItem(conn, userEmail, productId, title, author, coverUrl, price, category);
                writeJson(response, "{\"success\": true}");
            } else if ("remove".equalsIgnoreCase(action)) {
                int wishlistId = Integer.parseInt(jsonMap.getOrDefault("wishlistId", "0"));
                removeWishlistItem(conn, wishlistId, userEmail);
                writeJson(response, "{\"success\": true}");
            } else if ("move".equalsIgnoreCase(action)) {
                int wishlistId = Integer.parseInt(jsonMap.getOrDefault("wishlistId", "0"));
                moveToCart(conn, wishlistId, userEmail);
                writeJson(response, "{\"success\": true}");
            } else {
                writeJson(response, "{\"success\": false, \"message\": \"Invalid action\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Server error\"}");
        }
    }

    private void listWishlist(Connection conn, HttpServletResponse response, String userEmail) throws Exception {
        String sql = "SELECT id, product_id, product_name, product_author, product_image, product_price, product_category FROM wishlist WHERE user_email = ? ORDER BY id DESC";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ResultSet rs = ps.executeQuery();
        StringBuilder items = new StringBuilder();
        while (rs.next()) {
            if (items.length() > 0) items.append(",");
            items.append("{\"wishlistId\":").append(rs.getInt("id"))
                    .append(",\"id\":").append(rs.getInt("product_id"))
                    .append(",\"title\":\"").append(escapeJson(rs.getString("product_name"))).append("\"")
                    .append(",\"author\":\"").append(escapeJson(rs.getString("product_author"))).append("\"")
                    .append(",\"coverUrl\":\"").append(escapeJson(rs.getString("product_image"))).append("\"")
                    .append(",\"unitPrice\":").append(rs.getDouble("product_price"))
                    .append(",\"category\":\"").append(escapeJson(rs.getString("product_category"))).append("\"}");
        }
        ps.close();
        writeJson(response, "{\"items\": [" + items.toString() + "]}");
    }

    private void addWishlistItem(Connection conn, String userEmail, int productId, String title, String author, String coverUrl, double price, String category) throws Exception {
        String sql = "INSERT INTO wishlist (user_email, product_id, product_name, product_author, product_image, product_price, product_category) VALUES (?, ?, ?, ?, ?, ?, ?)";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ps.setInt(2, productId);
        ps.setString(3, title);
        ps.setString(4, author);
        ps.setString(5, coverUrl);
        ps.setDouble(6, price);
        ps.setString(7, category);
        ps.executeUpdate();
        ps.close();
    }

    private void removeWishlistItem(Connection conn, int wishlistId, String userEmail) throws Exception {
        String sql = "DELETE FROM wishlist WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, wishlistId);
        ps.setString(2, userEmail);
        ps.executeUpdate();
        ps.close();
    }

    private void moveToCart(Connection conn, int wishlistId, String userEmail) throws Exception {
        String sql = "SELECT product_id, product_name, product_author, product_image, product_price, product_category FROM wishlist WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, wishlistId);
        ps.setString(2, userEmail);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            int productId = rs.getInt("product_id");
            String productName = rs.getString("product_name");
            String productAuthor = rs.getString("product_author");
            String productImage = rs.getString("product_image");
            double price = rs.getDouble("product_price");
            String category = rs.getString("product_category");
            rs.close();
            ps.close();

            String insert = "INSERT INTO cart (user_email, product_id, product_name, product_author, product_image, product_price, quantity, product_category) VALUES (?, ?, ?, ?, ?, ?, 1, ?)";
            PreparedStatement insertPs = conn.prepareStatement(insert);
            insertPs.setString(1, userEmail);
            insertPs.setInt(2, productId);
            insertPs.setString(3, productName);
            insertPs.setString(4, productAuthor);
            insertPs.setString(5, productImage);
            insertPs.setDouble(6, price);
            insertPs.setString(7, category);
            insertPs.executeUpdate();
            insertPs.close();
            removeWishlistItem(conn, wishlistId, userEmail);
        } else {
            rs.close();
            ps.close();
        }
    }

    private void writeJson(HttpServletResponse response, String payload) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();
        out.print(payload);
        out.flush();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
