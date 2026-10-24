package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.model.Book;
import com.booknook.model.Order;
import com.booknook.model.OrderItem;
import com.booknook.repository.BookRepository;
import com.booknook.repository.OrderItemRepository;
import com.booknook.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final BookRepository bookRepository;

    public OrderController(OrderRepository orderRepository, OrderItemRepository orderItemRepository, BookRepository bookRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<Order> orders = orderRepository.findByUserEmailOrderByOrderDateDesc(email);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderDetails(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null || (!order.getUserEmail().equals(email) && !hasAdminRole(authentication))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order not found"));
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("items", items);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<ApiResponse<Order>> cancelOrder(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Order order = orderRepository.findById(id).orElse(null);

        if (order == null || (!order.getUserEmail().equals(email) && !hasAdminRole(authentication))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order not found"));
        }

        if (!"Pending".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Orders that are " + order.getStatus() + " cannot be cancelled automatically."));
        }

        order.setStatus("Cancelled");
        Order saved = orderRepository.save(order);

        // Restore stock
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            bookRepository.findById(item.getProductId()).ifPresent(book -> {
                book.setStock(book.getStock() + item.getQuantity());
                bookRepository.save(book);
            });
        }

        return ResponseEntity.ok(ApiResponse.success("Order cancelled and stock restored.", saved));
    }

    private boolean hasAdminRole(Authentication auth) {
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
    }
}
