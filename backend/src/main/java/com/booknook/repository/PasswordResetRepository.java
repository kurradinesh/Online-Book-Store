package com.booknook.repository;

import com.booknook.model.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Integer> {
    Optional<PasswordReset> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<PasswordReset> findTopByEmailAndOtpAndUsedFalseOrderByCreatedAtDesc(String email, String otp);
}
