package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.booknook.util.DBConnection;

@WebServlet("/CartServlet")
public class CartServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"items\": []}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        List<String> items = new ArrayList<>();
        double total = 0.0;
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT c.id, c.product_id, c.product_name, c.product_author, c.product_image, c.product_price, c.quantity, c.product_category " +
                         "FROM cart c WHERE c.user_email = ? ORDER BY c.id DESC";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, userEmail);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int cartId = rs.getInt("id");
                int productId = rs.getInt("product_id");
                String productName = escapeJson(rs.getString("product_name"));
                String productAuthor = escapeJson(rs.getString("product_author"));
                String productImage = escapeJson(rs.getString("product_image"));
                double price = rs.getDouble("product_price");
                int quantity = rs.getInt("quantity");
                String category = escapeJson(rs.getString("product_category"));
                total += price * quantity;
                items.add("{\"cartId\":" + cartId + ",\"id\":" + productId + ",\"title\":\"" + productName + "\",\"author\":\"" + productAuthor + "\",\"coverUrl\":\"" + productImage + "\",\"unitPrice\":" + price + ",\"quantity\":" + quantity + ",\"category\":\"" + category + "\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        PrintWriter out = response.getWriter();
        out.print("{\"items\": [" + String.join(",", items) + "], \"total\":" + total + "}");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"success\":false,\"message\":\"Unauthorized\"}");
            return;
        }
        
        String action = request.getParameter("action");
        if (action == null || action.isEmpty()) {
            action = request.getParameter("actionType");
        }
        
        String body = "";
        java.util.Map<String, String> jsonMap = new java.util.HashMap<>();
        if (request.getContentType() != null && request.getContentType().contains("application/json")) {
            body = readRequestBody(request);
            jsonMap = com.booknook.util.JsonParser.parse(body);
            String bodyAction = jsonMap.get("action");
            if (bodyAction != null && !bodyAction.isEmpty()) {
                action = bodyAction;
            }
        }
        
        String userEmail = (String) session.getAttribute("userEmail");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        try (Connection conn = DBConnection.getConnection()) {
            if ("add".equalsIgnoreCase(action)) {
                addItem(conn, userEmail, jsonMap, response);
            } else if ("update".equalsIgnoreCase(action)) {
                int cartId;
                int quantity;
                if (!jsonMap.isEmpty()) {
                    cartId = Integer.parseInt(jsonMap.getOrDefault("cartId", "0"));
                    quantity = Integer.parseInt(jsonMap.getOrDefault("quantity", "0"));
                } else {
                    cartId = Integer.parseInt(request.getParameter("cartId"));
                    quantity = Integer.parseInt(request.getParameter("quantity"));
                }
                updateQuantity(conn, cartId, quantity, userEmail);
                response.getWriter().print("{\"success\":true}");
            } else if ("remove".equalsIgnoreCase(action)) {
                int cartId;
                if (!jsonMap.isEmpty()) {
                    cartId = Integer.parseInt(jsonMap.getOrDefault("cartId", "0"));
                } else {
                    cartId = Integer.parseInt(request.getParameter("cartId"));
                }
                removeItem(conn, cartId, userEmail);
                response.getWriter().print("{\"success\":true}");
            } else if ("buy".equalsIgnoreCase(action)) {
                int cartId;
                if (!jsonMap.isEmpty()) {
                    cartId = Integer.parseInt(jsonMap.getOrDefault("cartId", "0"));
                } else {
                    cartId = Integer.parseInt(request.getParameter("cartId"));
                }
                boolean purchased = purchaseItem(conn, cartId, userEmail);
                response.getWriter().print("{\"success\":" + purchased + ",\"message\":\"Purchase completed\"}");
            } else if ("clear".equalsIgnoreCase(action)) {
                clearCart(conn, userEmail);
                response.getWriter().print("{\"success\":true}");
            } else {
                response.getWriter().print("{\"success\":false,\"message\":\"Invalid action\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().print("{\"success\":false,\"message\":\"Server error\"}");
        }
    }

    private void addItem(Connection conn, String userEmail, java.util.Map<String, String> jsonMap, HttpServletResponse response) throws Exception {
        String productIdStr = jsonMap.getOrDefault("productId", "0");
        int productId = Integer.parseInt(productIdStr.isBlank() ? "0" : productIdStr);
        String title = jsonMap.getOrDefault("title", "");
        if (title.isBlank()) {
            title = jsonMap.getOrDefault("name", "");
        }
        String author = jsonMap.getOrDefault("author", "");
        String coverUrl = jsonMap.getOrDefault("coverUrl", "");
        String priceValue = jsonMap.getOrDefault("unitPrice", "0");
        String category = jsonMap.getOrDefault("category", "");
        String qtyValue = jsonMap.getOrDefault("quantity", "1");
        double unitPrice = priceValue.isBlank() ? 0.0 : Double.parseDouble(priceValue);
        int quantity = qtyValue.isBlank() ? 1 : Integer.parseInt(qtyValue);

        String selectSql = "SELECT id, quantity FROM cart WHERE user_email = ? AND product_id = ?";
        try (PreparedStatement selectPs = conn.prepareStatement(selectSql)) {
            selectPs.setString(1, userEmail);
            selectPs.setInt(2, productId);
            try (ResultSet rs = selectPs.executeQuery()) {
                if (rs.next()) {
                    int existingId = rs.getInt("id");
                    int existingQty = rs.getInt("quantity");
                    String updateSql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_email = ?";
                    try (PreparedStatement updatePs = conn.prepareStatement(updateSql)) {
                        updatePs.setInt(1, existingQty + quantity);
                        updatePs.setInt(2, existingId);
                        updatePs.setString(3, userEmail);
                        updatePs.executeUpdate();
                    }
                } else {
                    String insertSql = "INSERT INTO cart (user_email, product_id, product_name, product_author, product_image, product_price, quantity, product_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                    try (PreparedStatement insertPs = conn.prepareStatement(insertSql)) {
                        insertPs.setString(1, userEmail);
                        insertPs.setInt(2, productId);
                        insertPs.setString(3, title);
                        insertPs.setString(4, author);
                        insertPs.setString(5, coverUrl);
                        insertPs.setDouble(6, unitPrice);
                        insertPs.setInt(7, quantity);
                        insertPs.setString(8, category);
                        insertPs.executeUpdate();
                    }
                }
            }
        }

        response.getWriter().print("{\"success\":true,\"message\":\"Added to cart\"}");
    }

    private void updateQuantity(Connection conn, int cartId, int quantity, String userEmail) throws Exception {
        if (quantity < 1) {
            removeItem(conn, cartId, userEmail);
            return;
        }
        String sql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, quantity);
        ps.setInt(2, cartId);
        ps.setString(3, userEmail);
        ps.executeUpdate();
        ps.close();
    }

    private void removeItem(Connection conn, int cartId, String userEmail) throws Exception {
        String sql = "DELETE FROM cart WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, cartId);
        ps.setString(2, userEmail);
        ps.executeUpdate();
        ps.close();
    }

    private boolean purchaseItem(Connection conn, int cartId, String userEmail) throws Exception {
        String selectSql = "SELECT product_id, product_name, product_author, product_image, product_price, quantity, product_category FROM cart WHERE id = ? AND user_email = ?";
        PreparedStatement select = conn.prepareStatement(selectSql);
        select.setInt(1, cartId);
        select.setString(2, userEmail);
        ResultSet rs = select.executeQuery();
        if (!rs.next()) {
            select.close();
            return false;
        }
        int productId = rs.getInt("product_id");
        String productName = rs.getString("product_name");
        String productAuthor = rs.getString("product_author");
        String productImage = rs.getString("product_image");
        double price = rs.getDouble("product_price");
        int quantity = rs.getInt("quantity");
        String category = rs.getString("product_category");
        select.close();

        conn.setAutoCommit(false);
        try {
            String orderSql = "INSERT INTO orders (user_email, order_date, status, total_amount) VALUES (?, NOW(), 'Pending', ?)";
            PreparedStatement orderPs = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS);
            orderPs.setString(1, userEmail);
            orderPs.setDouble(2, price * quantity);
            orderPs.executeUpdate();
            ResultSet generatedKeys = orderPs.getGeneratedKeys();
            int orderId = 0;
            if (generatedKeys.next()) {
                orderId = generatedKeys.getInt(1);
            }
            orderPs.close();
            String itemSql = "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, product_image, product_category, product_author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement itemPs = conn.prepareStatement(itemSql);
            itemPs.setInt(1, orderId);
            itemPs.setInt(2, productId);
            itemPs.setString(3, productName);
            itemPs.setDouble(4, price);
            itemPs.setInt(5, quantity);
            itemPs.setString(6, productImage);
            itemPs.setString(7, category);
            itemPs.setString(8, productAuthor);
            itemPs.executeUpdate();
            itemPs.close();
            removeItem(conn, cartId, userEmail);
            conn.commit();
            return true;
        } catch (Exception e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    private void clearCart(Connection conn, String userEmail) throws Exception {
        String sql = "DELETE FROM cart WHERE user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ps.executeUpdate();
        ps.close();
    }

    private String readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder body = new StringBuilder();
        char[] buffer = new char[1024];
        int read;
        while ((read = request.getReader().read(buffer)) != -1) {
            body.append(buffer, 0, read);
        }
        return body.toString();
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
