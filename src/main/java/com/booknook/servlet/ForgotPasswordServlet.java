package com.booknook.servlet;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.Instant;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.booknook.dao.PasswordResetDAO;
import com.booknook.util.EmailUtility;
import com.booknook.util.OTPGenerator;

@WebServlet("/ForgotPasswordServlet")
public class ForgotPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        
        String csrfParam = request.getParameter("csrfToken");
        String csrfSession = (String) request.getSession().getAttribute("csrfToken");
        if (csrfSession == null || csrfParam == null || !csrfSession.equals(csrfParam)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().println("<div class='alert alert-danger'>Invalid request.</div>");
            return;
        }

        String email = request.getParameter("email");
        response.setContentType("text/html;charset=UTF-8");

        if (email == null || email.trim().isEmpty()) {
            response.getWriter().println("<div class='alert alert-danger'>Please provide an email.</div>");
            return;
        }

        email = email.trim().toLowerCase();

        try {
            boolean exists = com.booknook.dao.UserDAO.isEmailRegistered(email);

           
            if (exists) {
                    
                    String clientIp = request.getRemoteAddr();
                    if (!PasswordResetDAO.canSend(email, clientIp, 30, 5, 3600, 20)) {
                    
                    response.sendRedirect("verify-otp.jsp");
                    return;
                }

                    String otp = OTPGenerator.generateOTP();
                    Timestamp expiry = Timestamp.from(Instant.now().plusSeconds(5 * 60));
                    PasswordResetDAO.createOrUpdate(email, otp, expiry, clientIp);

                String subject = "Password Reset OTP";
                String body = "<p>Dear User,</p>"
                        + "<p>Your password reset OTP is:</p>"
                        + "<h2>" + otp + "</h2>"
                        + "<p>This OTP will expire in 5 minutes.</p>"
                        + "<p>If you did not request this reset, please ignore this email.</p>"
                        + "<p>Regards,<br/>Online Book Store Team</p>";

           
                try { EmailUtility.sendEmail(email, subject, body); } catch (Exception e) { e.printStackTrace(); }

               
                HttpSession session = request.getSession();
                session.setAttribute("resetEmail", email);
                session.setAttribute("otpSentAt", System.currentTimeMillis());
            }

            
            response.sendRedirect("verify-otp.jsp");
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<div class='alert alert-danger'>Server error. Try again later.</div>");
        }
    }
}
