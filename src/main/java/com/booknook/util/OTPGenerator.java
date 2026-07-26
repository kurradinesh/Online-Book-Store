package com.booknook.util;

import java.security.SecureRandom;

public class OTPGenerator {
    private static final SecureRandom random = new SecureRandom();

    public static String generateOTP() {
        int otp = random.nextInt(1_000_000); 
        return String.format("%06d", otp);
    }
}
