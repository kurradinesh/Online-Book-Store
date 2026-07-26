package com.booknook.servlet;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.Instant;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.booknook.util.OTPGenerator;
import com.booknook.util.EmailUtility;

@WebServlet("/ResendOtpServlet")
public class ResendOtpServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        response.setContentType("text/html;charset=UTF-8");
        if (session == null || session.getAttribute("resetEmail") == null) {
            response.getWriter().println("<div class='alert alert-danger'>Session expired. Start again.</div>");
            return;
        }
        // CSRF validation: token may come in header X-CSRF-Token
        String csrfHeader = request.getHeader("X-CSRF-Token");
        String csrfSession = (String) request.getSession().getAttribute("csrfToken");
        if (csrfSession == null || csrfHeader == null || !csrfSession.equals(csrfHeader)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().println("<div class='alert alert-danger'>Invalid request.</div>");
            return;
        }
        String email = (String) session.getAttribute("resetEmail");
        long now = System.currentTimeMillis();

        try {
            
            String clientIp = request.getRemoteAddr();
            if (!com.booknook.dao.PasswordResetDAO.canSend(email, clientIp, 30, 5, 3600, 20)) {
                response.getWriter().println("<div class='alert alert-warning'>Please wait before resending OTP.</div>");
                return;
            }

            String otp = OTPGenerator.generateOTP();
            Timestamp expiry = Timestamp.from(Instant.now().plusSeconds(5 * 60));
            com.booknook.dao.PasswordResetDAO.createOrUpdate(email, otp, expiry, clientIp);

            String subject = "Password Reset OTP";
            String body = "<p>Your password reset OTP is:</p><h2>" + otp + "</h2><p>It will expire in 5 minutes.</p>";
            try { EmailUtility.sendEmail(email, subject, body); } catch (Exception e) { e.printStackTrace(); }

            session.setAttribute("otpSentAt", now);
            response.getWriter().println("<div class='alert alert-success'>A new OTP was sent if the address exists.</div>");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<div class='alert alert-danger'>Unable to resend OTP currently.</div>");
        }
    }
}
