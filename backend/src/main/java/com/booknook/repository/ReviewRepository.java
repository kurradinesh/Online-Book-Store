package com.booknook.repository;

import com.booknook.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByBookIdOrderByCreatedAtDesc(Integer bookId);
}
