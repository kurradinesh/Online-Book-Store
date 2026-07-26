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

@WebServlet("/AddressServlet")
public class AddressServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userEmail") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            writeJson(response, "{\"addresses\": []}");
            return;
        }
        String userEmail = (String) session.getAttribute("userEmail");
        String action = request.getParameter("action");
        if (action == null) action = "list";

        try (Connection conn = DBConnection.getConnection()) {
            if ("list".equalsIgnoreCase(action)) {
                listAddresses(conn, response, userEmail);
            } else if ("view".equalsIgnoreCase(action)) {
                int addressId = Integer.parseInt(request.getParameter("addressId"));
                viewAddress(conn, response, userEmail, addressId);
            } else {
                writeJson(response, "{\"addresses\": []}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"addresses\": []}");
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
        String action = jsonMap.getOrDefault("action", "");

        try (Connection conn = DBConnection.getConnection()) {
            if ("delete".equalsIgnoreCase(action)) {
                int addressId = Integer.parseInt(jsonMap.getOrDefault("addressId", "0"));
                deleteAddress(conn, userEmail, addressId);
                writeJson(response, "{\"success\": true}");
            } else if ("default".equalsIgnoreCase(action)) {
                int addressId = Integer.parseInt(jsonMap.getOrDefault("addressId", "0"));
                setDefaultAddress(conn, userEmail, addressId);
                writeJson(response, "{\"success\": true}");
            } else {
                String addressIdValue = jsonMap.getOrDefault("addressId", "");
                upsertAddress(conn, userEmail, addressIdValue, jsonMap);
                writeJson(response, "{\"success\": true}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, "{\"success\": false, \"message\": \"Server error\"}");
        }
    }

    private void listAddresses(Connection conn, HttpServletResponse response, String userEmail) throws Exception {
        String sql = "SELECT id, label, recipient, line1, line2, city, state, zip, country, is_default FROM addresses WHERE user_email = ? ORDER BY is_default DESC, id DESC";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setString(1, userEmail);
        ResultSet rs = ps.executeQuery();
        StringBuilder addresses = new StringBuilder();
        while (rs.next()) {
            if (addresses.length() > 0) addresses.append(",");
            addresses.append("{\"addressId\":").append(rs.getInt("id"))
                    .append(",\"label\":\"").append(escapeJson(rs.getString("label"))).append("\"")
                    .append(",\"recipient\":\"").append(escapeJson(rs.getString("recipient"))).append("\"")
                    .append(",\"line1\":\"").append(escapeJson(rs.getString("line1"))).append("\"")
                    .append(",\"line2\":\"").append(escapeJson(rs.getString("line2"))).append("\"")
                    .append(",\"city\":\"").append(escapeJson(rs.getString("city"))).append("\"")
                    .append(",\"state\":\"").append(escapeJson(rs.getString("state"))).append("\"")
                    .append(",\"zip\":\"").append(escapeJson(rs.getString("zip"))).append("\"")
                    .append(",\"country\":\"").append(escapeJson(rs.getString("country"))).append("\"")
                    .append(",\"isDefault\":").append(rs.getBoolean("is_default")).append("}");
        }
        ps.close();
        writeJson(response, "{\"addresses\": [" + addresses.toString() + "]}");
    }

    private void viewAddress(Connection conn, HttpServletResponse response, String userEmail, int addressId) throws Exception {
        String sql = "SELECT id, label, recipient, line1, line2, city, state, zip, country, is_default FROM addresses WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, addressId);
        ps.setString(2, userEmail);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            String address = "{\"addressId\":" + rs.getInt("id") + ",\"label\":\"" + escapeJson(rs.getString("label")) + "\",\"recipient\":\"" + escapeJson(rs.getString("recipient")) + "\",\"line1\":\"" + escapeJson(rs.getString("line1")) + "\",\"line2\":\"" + escapeJson(rs.getString("line2")) + "\",\"city\":\"" + escapeJson(rs.getString("city")) + "\",\"state\":\"" + escapeJson(rs.getString("state")) + "\",\"zip\":\"" + escapeJson(rs.getString("zip")) + "\",\"country\":\"" + escapeJson(rs.getString("country")) + "\",\"isDefault\":" + rs.getBoolean("is_default") + "}";
            writeJson(response, "{\"address\": " + address + "}");
        } else {
            writeJson(response, "{\"address\": null}");
        }
        ps.close();
    }

    private void upsertAddress(Connection conn, String userEmail, String addressIdValue, java.util.Map<String, String> jsonMap) throws Exception {
        boolean isUpdate = !addressIdValue.isEmpty();
        String label = jsonMap.getOrDefault("label", "");
        String recipient = jsonMap.getOrDefault("recipient", "");
        String line1 = jsonMap.getOrDefault("line1", "");
        String line2 = jsonMap.getOrDefault("line2", "");
        String city = jsonMap.getOrDefault("city", "");
        String state = jsonMap.getOrDefault("state", "");
        String zip = jsonMap.getOrDefault("zip", "");
        String country = jsonMap.getOrDefault("country", "");
        int isDefault = 0;
        if (!isUpdate) {
            String insert = "INSERT INTO addresses (user_email, label, recipient, line1, line2, city, state, zip, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )";
            PreparedStatement ps = conn.prepareStatement(insert);
            ps.setString(1, userEmail);
            ps.setString(2, label);
            ps.setString(3, recipient);
            ps.setString(4, line1);
            ps.setString(5, line2);
            ps.setString(6, city);
            ps.setString(7, state);
            ps.setString(8, zip);
            ps.setString(9, country);
            ps.setInt(10, isDefault);
            ps.executeUpdate();
            ps.close();
        } else {
            int addressId = Integer.parseInt(addressIdValue);
            String update = "UPDATE addresses SET label = ?, recipient = ?, line1 = ?, line2 = ?, city = ?, state = ?, zip = ?, country = ? WHERE id = ? AND user_email = ?";
            PreparedStatement ps = conn.prepareStatement(update);
            ps.setString(1, label);
            ps.setString(2, recipient);
            ps.setString(3, line1);
            ps.setString(4, line2);
            ps.setString(5, city);
            ps.setString(6, state);
            ps.setString(7, zip);
            ps.setString(8, country);
            ps.setInt(9, addressId);
            ps.setString(10, userEmail);
            ps.executeUpdate();
            ps.close();
        }
    }

    private void deleteAddress(Connection conn, String userEmail, int addressId) throws Exception {
        String sql = "DELETE FROM addresses WHERE id = ? AND user_email = ?";
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, addressId);
        ps.setString(2, userEmail);
        ps.executeUpdate();
        ps.close();
    }

    private void setDefaultAddress(Connection conn, String userEmail, int addressId) throws Exception {
        String clearSql = "UPDATE addresses SET is_default = 0 WHERE user_email = ?";
        PreparedStatement clearPs = conn.prepareStatement(clearSql);
        clearPs.setString(1, userEmail);
        clearPs.executeUpdate();
        clearPs.close();

        String setDefaultSql = "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_email = ?";
        PreparedStatement setPs = conn.prepareStatement(setDefaultSql);
        setPs.setInt(1, addressId);
        setPs.setString(2, userEmail);
        setPs.executeUpdate();
        setPs.close();
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
