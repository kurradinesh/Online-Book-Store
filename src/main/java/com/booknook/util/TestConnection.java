package com.booknook.util;

import java.sql.Connection;
import java.sql.SQLException;

public class TestConnection {
    public static void main(String[] args) {
        try (Connection conn = DBConnection.getConnection()) {
            if (conn != null) {
                System.out.println("SUCCESS: The bridge is working perfectly!");
            } else {
                System.out.println("FAILURE: Check your password or the .jar file.");
            }
        } catch (SQLException e) {
            System.out.println("FAILURE: " + e.getMessage());
        }
    }
}