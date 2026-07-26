package com.booknook.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.booknook.util.DBConnection;

@WebServlet("/OrdersServlet")
public class OrdersServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"orders\": []}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");

        try (Connection conn = DBConnection.getConnection()) {
            String action = request.getParameter("action");
            if ("detail".equalsIgnoreCase(action) && request.getParameter("orderId") != null) {
                int orderId = Integer.parseInt(request.getParameter("orderId"));
                listOrderDetail(conn, response, userEmail, orderId);
            } else if ("list".equalsIgnoreCase(action)) {
                listOrders(conn, response, userEmail);
            } else {
                writeJson(response, "{\"orders\": []}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"orders\": []}");
        }
    }

    private void listOrders(Connection conn, HttpServletResponse response, String userEmail) throws Exception {
        String sql = "SELECT id, order_date, status, total_amount, tracking_code FROM orders WHERE user_email = ? ORDER BY order_date DESC LIMIT 25";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ResultSet rs = ps.executeQuery();

        List<String> orders = new ArrayList<>();
        while (rs.next()) {
            String status = rs.getString("status");
            String statusClass = "bg-secondary";
            String statusLabel = status;
            if ("Pending".equalsIgnoreCase(status)) {
                statusClass = "bg-warning text-dark";
                statusLabel = "Pending confirmation";
            } else if ("Success".equalsIgnoreCase(status) || "Delivered".equalsIgnoreCase(status)) {
                statusClass = "bg-success";
                statusLabel = "Delivered";
            } else if ("Cancelled".equalsIgnoreCase(status)) {
                statusClass = "bg-danger";
                statusLabel = "Cancelled";
            }
            orders.add("{\"orderId\":" + rs.getInt("id") + ",\"orderedAt\":\"" + escapeJson(rs.getString("order_date")) + "\",\"status\":\"" + escapeJson(status) + "\",\"statusClass\":\"" + statusClass + "\",\"statusLabel\":\"" + escapeJson(statusLabel) + "\",\"totalAmount\":" + rs.getDouble("total_amount") + ",\"trackingCode\":\"" + escapeJson(rs.getString("tracking_code")) + "\"}");
        }
        ps.close();
        writeJson(response, "{\"orders\": [" + String.join(",", orders) + "]}");
    }

    private void listOrderDetail(Connection conn, HttpServletResponse response, String userEmail, int orderId) throws Exception {
        String orderSql = "SELECT id, order_date, status, total_amount, tracking_code FROM orders WHERE id = ? AND user_email = ?";
        PreparedStatement orderPs = conn.prepareStatement(orderSql);
        orderPs.setInt(1, orderId);
        orderPs.setString(2, userEmail);
        ResultSet orderRs = orderPs.executeQuery();
        if (!orderRs.next()) {
            orderRs.close();
            orderPs.close();
            writeJson(response, "{\"order\": null}");
            return;
        }

        String orderPayload = "{\"orderId\":" + orderRs.getInt("id") + ",\"orderedAt\":\"" + escapeJson(orderRs.getString("order_date")) + "\",\"status\":\"" + escapeJson(orderRs.getString("status")) + "\",\"totalAmount\":" + orderRs.getDouble("total_amount") + ",\"trackingCode\":\"" + escapeJson(orderRs.getString("tracking_code")) + "\"";
        orderRs.close();
        orderPs.close();

        String itemsSql = "SELECT product_id, product_name, product_author, product_image, product_price, quantity, product_category FROM order_items WHERE order_id = ?";
        PreparedStatement itemPs = conn.prepareStatement(itemsSql);
        itemPs.setInt(1, orderId);
        ResultSet itemRs = itemPs.executeQuery();
        StringBuilder items = new StringBuilder();
        while (itemRs.next()) {
            if (items.length() > 0) items.append(",");
            items.append("{\"id\":").append(itemRs.getInt("product_id"))
                    .append(",\"title\":\"").append(escapeJson(itemRs.getString("product_name"))).append("\"")
                    .append(",\"author\":\"").append(escapeJson(itemRs.getString("product_author"))).append("\"")
                    .append(",\"coverUrl\":\"").append(escapeJson(itemRs.getString("product_image"))).append("\"")
                    .append(",\"unitPrice\":").append(itemRs.getDouble("product_price"))
                    .append(",\"quantity\":").append(itemRs.getInt("quantity"))
                    .append(",\"category\":\"").append(escapeJson(itemRs.getString("product_category"))).append("\"}");
        }
        itemRs.close();
        itemPs.close();

        writeJson(response, orderPayload + ",\"items\": [" + items.toString() + "]}");
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
