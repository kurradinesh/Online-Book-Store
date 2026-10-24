package com.booknook.repository;

import com.booknook.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserEmailOrderByOrderDateDesc(String userEmail);
    List<Order> findAllByOrderByOrderDateDesc();
    List<Order> findTop10ByOrderByOrderDateDesc();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status != 'Cancelled'")
    BigDecimal calculateTotalRevenue();

    long countByStatus(String status);
}
