package com.booknook.util;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class SchemaInitializer {
    private static volatile boolean initialized = false;
    private static final Object lock = new Object();

    public static void ensureSchema(Connection conn) throws SQLException {
        if (initialized) {
            return;
        }
        synchronized (lock) {
            if (initialized) {
                return;
            }
            createTables(conn);
            createMissingColumns(conn);
            initialized = true;
        }
    }

    private static void createTables(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS users (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(150) NOT NULL, " +
                    "email VARCHAR(255) NOT NULL UNIQUE, " +
                    "password VARCHAR(255) NOT NULL, " +
                    "role VARCHAR(50) NOT NULL DEFAULT 'customer', " +
                    "avatar_url VARCHAR(512), " +
                    "mobile_number VARCHAR(20) NULL, " +
                    "language VARCHAR(10) DEFAULT 'en', " +
                    "timezone VARCHAR(50) DEFAULT 'Asia/Kolkata', " +
                    "promo_emails BOOLEAN DEFAULT TRUE, " +
                    "order_updates BOOLEAN DEFAULT TRUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS books (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "title VARCHAR(255) NOT NULL, " +
                    "author VARCHAR(255) NOT NULL, " +
                    "price DECIMAL(10,2) NOT NULL, " +
                    "genre VARCHAR(100), " +
                    "image_url VARCHAR(512), " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS cart (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_email VARCHAR(255) NOT NULL, " +
                    "product_id INT NOT NULL, " +
                    "product_name VARCHAR(255) NOT NULL, " +
                    "product_author VARCHAR(255), " +
                    "product_image VARCHAR(512), " +
                    "product_price DECIMAL(10,2) NOT NULL, " +
                    "quantity INT NOT NULL DEFAULT 1, " +
                    "product_category VARCHAR(150), " +
                    "added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "INDEX idx_cart_user (user_email), " +
                    "FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS wishlist (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_email VARCHAR(255) NOT NULL, " +
                    "product_id INT NOT NULL, " +
                    "product_name VARCHAR(255) NOT NULL, " +
                    "product_author VARCHAR(255), " +
                    "product_image VARCHAR(512), " +
                    "product_price DECIMAL(10,2) NOT NULL, " +
                    "product_category VARCHAR(150), " +
                    "added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "INDEX idx_wishlist_user (user_email), " +
                    "FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS orders (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_email VARCHAR(255) NOT NULL, " +
                    "order_date DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                    "status VARCHAR(50) NOT NULL DEFAULT 'Pending', " +
                    "total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00, " +
                    "tracking_code VARCHAR(100), " +
                    "INDEX idx_orders_user (user_email), " +
                    "FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS order_items (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "order_id INT NOT NULL, " +
                    "product_id INT NOT NULL, " +
                    "product_name VARCHAR(255) NOT NULL, " +
                    "product_price DECIMAL(10,2) NOT NULL, " +
                    "quantity INT NOT NULL DEFAULT 1, " +
                    "product_image VARCHAR(512), " +
                    "product_category VARCHAR(150), " +
                    "product_author VARCHAR(255), " +
                    "INDEX idx_order_items_order (order_id), " +
                    "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS addresses (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "user_email VARCHAR(255) NOT NULL, " +
                    "label VARCHAR(100) NOT NULL, " +
                    "recipient VARCHAR(150) NOT NULL, " +
                    "line1 VARCHAR(255) NOT NULL, " +
                    "line2 VARCHAR(255), " +
                    "city VARCHAR(100) NOT NULL, " +
                    "state VARCHAR(100) NOT NULL, " +
                    "zip VARCHAR(50) NOT NULL, " +
                    "country VARCHAR(100) NOT NULL, " +
                    "is_default BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "INDEX idx_addresses_user (user_email), " +
                    "FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS password_resets (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "email VARCHAR(255) NOT NULL, " +
                    "otp VARCHAR(10) NOT NULL, " +
                    "expiry_time DATETIME NOT NULL, " +
                    "created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                    "last_sent_at DATETIME NULL, " +
                    "attempts INT NOT NULL DEFAULT 0, " +
                    "used BOOLEAN NOT NULL DEFAULT FALSE, " +
                    "INDEX (email), " +
                    "INDEX (otp)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS password_reset_requests (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "email VARCHAR(255) NULL, " +
                    "ip VARCHAR(64) NOT NULL, " +
                    "requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, " +
                    "INDEX (ip), " +
                    "INDEX (email)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS password_reset_bans (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "ip VARCHAR(64) NOT NULL, " +
                    "banned_until DATETIME NOT NULL, " +
                    "reason VARCHAR(255) NULL, " +
                    "INDEX (ip)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }
    }

    private static void createMissingColumns(Connection conn) throws SQLException {
        addColumnIfMissing(conn, "users", "avatar_url", "VARCHAR(512)");
        addColumnIfMissing(conn, "users", "mobile_number", "VARCHAR(20) NULL");
        addColumnIfMissing(conn, "users", "language", "VARCHAR(10) DEFAULT 'en'");
        addColumnIfMissing(conn, "users", "timezone", "VARCHAR(50) DEFAULT 'Asia/Kolkata'");
        addColumnIfMissing(conn, "users", "promo_emails", "BOOLEAN DEFAULT TRUE");
        addColumnIfMissing(conn, "users", "order_updates", "BOOLEAN DEFAULT TRUE");
        addColumnIfMissing(conn, "orders", "status", "VARCHAR(50) NOT NULL DEFAULT 'Pending'");
        addColumnIfMissing(conn, "orders", "tracking_code", "VARCHAR(100)");
        addColumnIfMissing(conn, "order_items", "product_author", "VARCHAR(255)");
        addColumnIfMissing(conn, "order_items", "product_category", "VARCHAR(150)");
        addColumnIfMissing(conn, "wishlist", "product_category", "VARCHAR(150)");
        addColumnIfMissing(conn, "cart", "product_category", "VARCHAR(150)");
    }

    private static void addColumnIfMissing(Connection conn, String tableName, String columnName, String definition) throws SQLException {
        if (!columnExists(conn, tableName, columnName)) {
            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate("ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + definition);
            }
        }
    }

    private static boolean columnExists(Connection conn, String tableName, String columnName) throws SQLException {
        DatabaseMetaData metadata = conn.getMetaData();
        try (ResultSet rs = metadata.getColumns(conn.getCatalog(), null, tableName, columnName)) {
            return rs.next();
        }
    }
}
