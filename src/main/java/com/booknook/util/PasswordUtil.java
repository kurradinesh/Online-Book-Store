package com.booknook.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;


public class PasswordUtil {
    
    public static String hash(String value) {
        if (value == null) return null;
        try {
            
            try {
                return org.mindrot.jbcrypt.BCrypt.hashpw(value, org.mindrot.jbcrypt.BCrypt.gensalt(12));
            } catch (NoClassDefFoundError ex) {
                
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Unable to hash password", e);
        }
    }

    
    public static boolean verify(String rawPassword, String storedPassword) {
        if (rawPassword == null || storedPassword == null) return false;

       
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            try {
                return org.mindrot.jbcrypt.BCrypt.checkpw(rawPassword, storedPassword);
            } catch (NoClassDefFoundError ex) {
               
                return false;
            }
        }

        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            String hashed = sb.toString();
            if (hashed.equals(storedPassword)) return true;
        } catch (NoSuchAlgorithmException e) {
            
        }

        
        return rawPassword.equals(storedPassword);
    }
}
