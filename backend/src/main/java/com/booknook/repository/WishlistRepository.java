package com.booknook.repository;

import com.booknook.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Integer> {
    List<WishlistItem> findByUserEmailOrderByIdDesc(String userEmail);
    Optional<WishlistItem> findByUserEmailAndProductId(String userEmail, Integer productId);
    void deleteByUserEmailAndProductId(String userEmail, Integer productId);
}
