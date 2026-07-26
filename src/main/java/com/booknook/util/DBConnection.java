package com.booknook.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DBConnection {
    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found", e);
        }

        String dbName = System.getProperty("booknook.db.name", "booknook_db");
        String url = System.getProperty(
                "booknook.db.url",
                "jdbc:mysql://localhost:3306/" + dbName + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
        );
        String adminUrl = System.getProperty(
                "booknook.db.adminUrl",
                "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
        );
        String user = System.getProperty("booknook.db.user", "root");
        String password = System.getProperty("booknook.db.password", "Bujjibabu@7732");

        try (Connection adminConn = DriverManager.getConnection(adminUrl, user, password);
             Statement stmt = adminConn.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS " + dbName + " DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }

        Connection conn = DriverManager.getConnection(url, user, password);
        SchemaInitializer.ensureSchema(conn);
        return conn;
    }
}