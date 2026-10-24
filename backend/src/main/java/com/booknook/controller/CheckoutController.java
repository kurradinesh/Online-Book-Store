package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.dto.CheckoutDto.CheckoutRequest;
import com.booknook.model.*;
import com.booknook.repository.*;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AddressRepository addressRepository;

    public CheckoutController(
            CartRepository cartRepository,
            BookRepository bookRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            AddressRepository addressRepository
    ) {
        this.cartRepository = cartRepository;
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.addressRepository = addressRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ApiResponse<Order>> processCheckout(
            @Valid @RequestBody CheckoutRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<CartItem> cartItems = cartRepository.findByUserEmailOrderByIdDesc(email);

        if (cartItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Your cart is empty. Please add books before checking out."));
        }

        // 1. Verify stock for each cart item
        for (CartItem item : cartItems) {
            Book book = bookRepository.findById(item.getProductId()).orElse(null);
            if (book == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Book '" + item.getProductName() + "' is no longer available."));
            }
            if (book.getStock() < item.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Insufficient stock for '" + book.getTitle() + "'. Available: " + book.getStock() + " copies."));
            }
        }

        // 2. Resolve Shipping Address details
        String recipient = req.getRecipient();
        String phone = req.getPhone();
        String fullAddress = req.getLine1();
        String city = req.getCity();
        String state = req.getState();
        String zip = req.getZip();

        if (req.getAddressId() != null) {
            Address address = addressRepository.findByIdAndUserEmail(req.getAddressId(), email).orElse(null);
            if (address != null) {
                recipient = address.getRecipient();
                phone = address.getPhone();
                fullAddress = address.getLine1() + (address.getLine2() != null && !address.getLine2().isBlank() ? ", " + address.getLine2() : "");
                city = address.getCity();
                state = address.getState();
                zip = address.getZip();
            }
        }

        if (fullAddress == null || fullAddress.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Please provide a valid delivery address."));
        }

        // 3. Compute total amount
        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Standard Delivery Shipping cost calculation (Free above ₹499)
        if (totalAmount.compareTo(BigDecimal.valueOf(499)) < 0) {
            totalAmount = totalAmount.add(BigDecimal.valueOf(50));
        }

        // 4. Create Order
        Order order = new Order();
        order.setUserEmail(email);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("Pending");
        order.setTotalAmount(totalAmount);

        // Generate Tracking Code
        String trackingCode = "BN-" + (100000 + new SecureRandom().nextInt(900000));
        order.setTrackingCode(trackingCode);

        // Payment status handling
        String paymentMethod = (req.getPaymentMethod() != null) ? req.getPaymentMethod().toUpperCase() : "COD";
        order.setPaymentMethod(paymentMethod);

        if ("CARD".equalsIgnoreCase(paymentMethod) || "UPI".equalsIgnoreCase(paymentMethod)) {
            order.setPaymentStatus("Paid");
            order.setPaymentReference(req.getPaymentReference() != null ? req.getPaymentReference() : "SIM-" + System.currentTimeMillis());
        } else {
            order.setPaymentStatus("Pending");
            order.setPaymentReference("COD-" + System.currentTimeMillis());
        }

        order.setShippingRecipient(recipient);
        order.setShippingPhone(phone);
        order.setShippingAddress(fullAddress);
        order.setShippingCity(city);
        order.setShippingState(state);
        order.setShippingZip(zip);

        Order savedOrder = orderRepository.save(order);

        // 5. Create Order Items & Deduct Stock
        for (CartItem item : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setProductPrice(item.getProductPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setProductImage(item.getProductImage());
            orderItem.setProductCategory(item.getProductCategory());
            orderItem.setProductAuthor(item.getProductAuthor());
            orderItemRepository.save(orderItem);

            // Deduct book inventory
            Book book = bookRepository.findById(item.getProductId()).get();
            book.setStock(book.getStock() - item.getQuantity());
            bookRepository.save(book);
        }

        // 6. Clear shopping cart
        cartRepository.deleteByUserEmail(email);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully! Tracking Code: " + trackingCode, savedOrder));
    }
}
