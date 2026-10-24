package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.dto.BookDto.CartAddRequest;
import com.booknook.dto.BookDto.CartUpdateRequest;
import com.booknook.model.Book;
import com.booknook.model.CartItem;
import com.booknook.repository.BookRepository;
import com.booknook.repository.CartRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final BookRepository bookRepository;

    public CartController(CartRepository cartRepository, BookRepository bookRepository) {
        this.cartRepository = cartRepository;
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCart(Authentication authentication) {
        String email = authentication.getName();
        List<CartItem> items = cartRepository.findByUserEmailOrderByIdDesc(email);

        BigDecimal subtotal = items.stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalCount = items.stream().mapToInt(CartItem::getQuantity).sum();

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("subtotal", subtotal);
        response.put("totalCount", totalCount);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItem>> addToCart(
            @Valid @RequestBody CartAddRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Book book = bookRepository.findById(req.getProductId()).orElse(null);

        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }

        if (book.getStock() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Book is currently out of stock."));
        }

        CartItem existing = cartRepository.findByUserEmailAndProductId(email, req.getProductId()).orElse(null);

        int quantityToAdd = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;

        if (existing != null) {
            int newQuantity = existing.getQuantity() + quantityToAdd;
            if (newQuantity > book.getStock()) {
                newQuantity = book.getStock();
            }
            existing.setQuantity(newQuantity);
            CartItem saved = cartRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("Cart updated", saved));
        } else {
            CartItem newItem = new CartItem();
            newItem.setUserEmail(email);
            newItem.setProductId(book.getId());
            newItem.setProductName(book.getTitle());
            newItem.setProductAuthor(book.getAuthor());
            newItem.setProductPrice(book.getPrice());
            newItem.setProductImage(book.getImageUrl());
            newItem.setProductCategory(book.getGenre());
            newItem.setQuantity(Math.min(quantityToAdd, book.getStock()));

            CartItem saved = cartRepository.save(newItem);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to cart", saved));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CartItem>> updateQuantity(
            @PathVariable Integer id,
            @Valid @RequestBody CartUpdateRequest req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        CartItem item = cartRepository.findById(id).orElse(null);

        if (item == null || !item.getUserEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Item not found in cart"));
        }

        if (req.getQuantity() <= 0) {
            cartRepository.delete(item);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
        }

        Book book = bookRepository.findById(item.getProductId()).orElse(null);
        if (book != null && req.getQuantity() > book.getStock()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Only " + book.getStock() + " copies available in stock."));
        }

        item.setQuantity(req.getQuantity());
        CartItem saved = cartRepository.save(item);

        return ResponseEntity.ok(ApiResponse.success("Quantity updated", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        CartItem item = cartRepository.findById(id).orElse(null);

        if (item == null || !item.getUserEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Item not found in cart"));
        }

        cartRepository.delete(item);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<ApiResponse<Void>> clearCart(Authentication authentication) {
        String email = authentication.getName();
        cartRepository.deleteByUserEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
