package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.dto.AuthDto.ChangePasswordRequest;
import com.booknook.dto.AuthDto.ProfileUpdateRequest;
import com.booknook.model.User;
import com.booknook.repository.CartRepository;
import com.booknook.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository, CartRepository cartRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<User>> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @RequestBody ProfileUpdateRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName().trim());
        }
        if (req.getMobileNumber() != null) {
            user.setMobileNumber(req.getMobileNumber().trim());
        }
        if (req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(req.getAvatarUrl().trim());
        }
        if (req.getLanguage() != null) {
            user.setLanguage(req.getLanguage());
        }
        if (req.getTimezone() != null) {
            user.setTimezone(req.getTimezone());
        }
        if (req.getPromoEmails() != null) {
            user.setPromoEmails(req.getPromoEmails());
        }
        if (req.getOrderUpdates() != null) {
            user.setOrderUpdates(req.getOrderUpdates());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", saved));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Current password does not match."));
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @DeleteMapping("/delete-account")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteAccount(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        cartRepository.deleteByUserEmail(email);
        userRepository.delete(user);

        return ResponseEntity.ok(ApiResponse.success("Account deleted permanently.", null));
    }
}
