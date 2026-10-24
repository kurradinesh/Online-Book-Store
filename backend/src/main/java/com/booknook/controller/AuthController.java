package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.dto.AuthDto.*;
import com.booknook.model.PasswordReset;
import com.booknook.model.User;
import com.booknook.repository.PasswordResetRepository;
import com.booknook.repository.UserRepository;
import com.booknook.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(
            UserRepository userRepository,
            PasswordResetRepository passwordResetRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email is already registered. Please login instead."));
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole("customer");
        user.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80");
        user.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getName());

        AuthResponse authResponse = new AuthResponse(
                token, saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getAvatarUrl()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created successfully!", authResponse));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getName());
        AuthResponse authResponse = new AuthResponse(
                token, user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getAvatarUrl()
        );

        return ResponseEntity.ok(ApiResponse.success("Login successful!", authResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();

        // Check if user exists
        boolean exists = userRepository.existsByEmail(email);
        if (!exists) {
            // For security, return positive message to avoid email enumeration
            return ResponseEntity.ok(ApiResponse.success("If your email is registered, an OTP has been sent."));
        }

        // Generate 6-digit OTP
        SecureRandom random = new SecureRandom();
        String otp = String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);

        PasswordReset reset = new PasswordReset(email, otp, expiry);
        passwordResetRepository.save(reset);

        // Simulated/Logged OTP dispatch
        System.out.println("=================================================");
        System.out.println(">> [BookNook Password Reset OTP for " + email + "]: " + otp);
        System.out.println(">> Valid until: " + expiry);
        System.out.println("=================================================");

        return ResponseEntity.ok(ApiResponse.success(
                "A 6-digit OTP has been generated. (For local testing: check server console or use the OTP sent).",
                otp
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String otp = req.getOtp().trim();

        PasswordReset reset = passwordResetRepository
                .findTopByEmailAndOtpAndUsedFalseOrderByCreatedAtDesc(email, otp)
                .orElse(null);

        if (reset == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid OTP. Please check and try again."));
        }

        if (reset.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("This OTP has expired. Please request a new one."));
        }

        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully!", true));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        String otp = req.getOtp().trim();

        PasswordReset reset = passwordResetRepository
                .findTopByEmailAndOtpAndUsedFalseOrderByCreatedAtDesc(email, otp)
                .orElse(null);

        if (reset == null || reset.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        reset.setUsed(true);
        passwordResetRepository.save(reset);

        return ResponseEntity.ok(ApiResponse.success("Password reset successfully! Please log in with your new password."));
    }
}
