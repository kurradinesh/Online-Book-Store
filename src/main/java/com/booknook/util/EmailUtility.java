package com.booknook.util;

import java.lang.reflect.Method;
import java.util.Properties;

public class EmailUtility {
    // Configure these values for your SMTP provider. Prefer environment variables for security.
    public static final String SMTP_HOST = System.getenv().getOrDefault("BOOKNOOK_SMTP_HOST", "smtp.example.com");
    public static final String SMTP_PORT = System.getenv().getOrDefault("BOOKNOOK_SMTP_PORT", "587");
    public static final String SMTP_USER = System.getenv().getOrDefault("BOOKNOOK_SMTP_USER", "your-email@example.com");
    public static final String SMTP_PASS = System.getenv().getOrDefault("BOOKNOOK_SMTP_PASS", "your-email-password");
    public static final String FROM_ADDRESS = System.getenv().getOrDefault("BOOKNOOK_FROM", "no-reply@booknook.com");

    public static boolean sendEmail(String toAddress, String subject, String htmlBody) {
        try {
            Class.forName("jakarta.mail.Session");
            Class.forName("jakarta.mail.internet.MimeMessage");
            Class.forName("jakarta.mail.Transport");

            Properties props = new Properties();
            props.put("mail.smtp.host", SMTP_HOST);
            props.put("mail.smtp.port", SMTP_PORT);
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");

            Class<?> sessionClass = Class.forName("jakarta.mail.Session");
            Object session = sessionClass.getMethod("getInstance", Properties.class).invoke(null, props);

            Class<?> messageClass = Class.forName("jakarta.mail.internet.MimeMessage");
            Object message = messageClass.getConstructor(sessionClass).newInstance(session);

            Method setFrom = messageClass.getMethod("setFrom", Class.forName("jakarta.mail.Address"));
            Object fromAddress = Class.forName("jakarta.mail.internet.InternetAddress")
                    .getConstructor(String.class)
                    .newInstance(FROM_ADDRESS);
            setFrom.invoke(message, fromAddress);

            Method setRecipient = messageClass.getMethod("setRecipient", Class.forName("jakarta.mail.Message$RecipientType"), Class.forName("jakarta.mail.Address"));
            Object recipientType = Class.forName("jakarta.mail.Message$RecipientType")
                    .getField("TO")
                    .get(null);
            Object toInternetAddress = Class.forName("jakarta.mail.internet.InternetAddress")
                    .getConstructor(String.class)
                    .newInstance(toAddress);
            setRecipient.invoke(message, recipientType, toInternetAddress);

            Method setSubject = messageClass.getMethod("setSubject", String.class);
            setSubject.invoke(message, subject);

            Method setContent = messageClass.getMethod("setContent", Object.class, String.class);
            setContent.invoke(message, htmlBody, "text/html; charset=utf-8");

            Class<?> transportClass = Class.forName("jakarta.mail.Transport");
            transportClass.getMethod("send", messageClass).invoke(null, message);
            return true;
        } catch (Exception e) {
            System.out.println("Email delivery skipped. Configure SMTP or add Jakarta Mail dependency. " + e.getMessage());
            return false;
        }
    }
}
