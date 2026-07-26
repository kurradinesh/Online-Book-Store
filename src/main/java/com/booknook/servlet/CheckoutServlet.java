package com.booknook.servlet;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.booknook.util.DBConnection;

@WebServlet("/CheckoutServlet")
public class CheckoutServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processCheckout(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processCheckout(request, response);
    }

    private void processCheckout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.sendRedirect("login.html");
            return;
        }

        String userEmail = (String) session.getAttribute("userEmail");

        try (Connection conn = DBConnection.getConnection()) {
            if (conn == null) {
                response.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "Database connection is not available.");
                return;
            }

            String selectSql = "SELECT product_id, product_name, product_author, product_image, product_price, quantity, product_category FROM cart WHERE user_email = ?";
            try (PreparedStatement selectPs = conn.prepareStatement(selectSql)) {
                selectPs.setString(1, userEmail);
                try (ResultSet rs = selectPs.executeQuery()) {
                    if (!rs.isBeforeFirst()) {
                        response.sendRedirect("pages/Cart.jsp");
                        return;
                    }

                    double totalAmount = 0.0;
                    while (rs.next()) {
                        totalAmount += rs.getDouble("product_price") * rs.getInt("quantity");
                    }

                    conn.setAutoCommit(false);
                    try {
                        String insertOrderSql = "INSERT INTO orders (user_email, order_date, status, total_amount) VALUES (?, NOW(), 'Pending', ?)";
                        try (PreparedStatement orderPs = conn.prepareStatement(insertOrderSql, Statement.RETURN_GENERATED_KEYS)) {
                            orderPs.setString(1, userEmail);
                            orderPs.setDouble(2, totalAmount);
                            orderPs.executeUpdate();

                            try (ResultSet generatedKeys = orderPs.getGeneratedKeys()) {
                                if (!generatedKeys.next()) {
                                    conn.rollback();
                                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to create order.");
                                    return;
                                }

                                int orderId = generatedKeys.getInt(1);
                                rs.beforeFirst();
                                while (rs.next()) {
                                    String itemSql = "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, product_image, product_category, product_author) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                                    try (PreparedStatement itemPs = conn.prepareStatement(itemSql)) {
                                        itemPs.setInt(1, orderId);
                                        itemPs.setInt(2, rs.getInt("product_id"));
                                        itemPs.setString(3, rs.getString("product_name"));
                                        itemPs.setDouble(4, rs.getDouble("product_price"));
                                        itemPs.setInt(5, rs.getInt("quantity"));
                                        itemPs.setString(6, rs.getString("product_image"));
                                        itemPs.setString(7, rs.getString("product_category"));
                                        itemPs.setString(8, rs.getString("product_author"));
                                        itemPs.executeUpdate();
                                    }
                                }
                            }
                        }

                        String clearSql = "DELETE FROM cart WHERE user_email = ?";
                        try (PreparedStatement clearPs = conn.prepareStatement(clearSql)) {
                            clearPs.setString(1, userEmail);
                            clearPs.executeUpdate();
                        }

                        conn.commit();
                        response.sendRedirect("pages/MyOrders.jsp");
                    } catch (Exception e) {
                        conn.rollback();
                        throw e;
                    } finally {
                        conn.setAutoCommit(true);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to complete checkout right now.");
        }
    }
}