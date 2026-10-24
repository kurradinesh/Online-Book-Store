package com.booknook.repository;

import com.booknook.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUserEmailOrderByIdDesc(String userEmail);
    Optional<CartItem> findByUserEmailAndProductId(String userEmail, Integer productId);
    void deleteByUserEmail(String userEmail);
}
