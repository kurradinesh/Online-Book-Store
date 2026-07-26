package com.booknook.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import com.booknook.util.DBConnection;

public class UserDAO {
    public static boolean isEmailRegistered(String email) throws Exception {
        String sql = "SELECT id FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection(); PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }
}
