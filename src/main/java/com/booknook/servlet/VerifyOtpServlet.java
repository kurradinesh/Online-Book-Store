package com.booknook.servlet;

import java.io.IOException;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;


@WebServlet("/VerifyOtpServlet")
public class VerifyOtpServlet extends HttpServlet {
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

        String otp = request.getParameter("otp");
        HttpSession session = request.getSession(false);
        response.setContentType("text/html;charset=UTF-8");

        if (session == null || session.getAttribute("resetEmail") == null) {
            response.getWriter().println("<div class='alert alert-danger'>Session expired. Start again.</div>");
            return;
        }

        String email = (String) session.getAttribute("resetEmail");

        try {
            boolean ok = com.booknook.dao.PasswordResetDAO.verifyOtp(email, otp);
            if (ok) {
                session.setAttribute("otpVerified", true);
                response.sendRedirect("reset-password.jsp");
            } else {
                response.getWriter().println("<div class='alert alert-danger'>Invalid or expired OTP.</div>");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("<div class='alert alert-danger'>Server error verifying OTP.</div>");
        }
    }
}
