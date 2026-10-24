package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.model.Book;
import com.booknook.model.CartItem;
import com.booknook.model.WishlistItem;
import com.booknook.repository.BookRepository;
import com.booknook.repository.CartRepository;
import com.booknook.repository.WishlistRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final BookRepository bookRepository;
    private final CartRepository cartRepository;

    public WishlistController(WishlistRepository wishlistRepository, BookRepository bookRepository, CartRepository cartRepository) {
        this.wishlistRepository = wishlistRepository;
        this.bookRepository = bookRepository;
        this.cartRepository = cartRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItem>>> getWishlist(Authentication authentication) {
        String email = authentication.getName();
        List<WishlistItem> items = wishlistRepository.findByUserEmailOrderByIdDesc(email);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistItem>> addToWishlist(
            @RequestBody Map<String, Integer> req,
            Authentication authentication
    ) {
        String email = authentication.getName();
        Integer productId = req.get("productId");

        if (productId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Product ID is required"));
        }

        Book book = bookRepository.findById(productId).orElse(null);
        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }

        WishlistItem existing = wishlistRepository.findByUserEmailAndProductId(email, productId).orElse(null);
        if (existing != null) {
            return ResponseEntity.ok(ApiResponse.success("Item is already in your wishlist", existing));
        }

        WishlistItem item = new WishlistItem();
        item.setUserEmail(email);
        item.setProductId(book.getId());
        item.setProductName(book.getTitle());
        item.setProductAuthor(book.getAuthor());
        item.setProductPrice(book.getPrice());
        item.setProductImage(book.getImageUrl());
        item.setProductCategory(book.getGenre());

        WishlistItem saved = wishlistRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to wishlist", saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        WishlistItem item = wishlistRepository.findById(id).orElse(null);

        if (item == null || !item.getUserEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Item not found in wishlist"));
        }

        wishlistRepository.delete(item);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @PostMapping("/{id}/move-to-cart")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> moveToCart(@PathVariable Integer id, Authentication authentication) {
        String email = authentication.getName();
        WishlistItem item = wishlistRepository.findById(id).orElse(null);

        if (item == null || !item.getUserEmail().equals(email)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Item not found in wishlist"));
        }

        Book book = bookRepository.findById(item.getProductId()).orElse(null);
        if (book == null || book.getStock() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error("Book is out of stock."));
        }

        CartItem cartItem = cartRepository.findByUserEmailAndProductId(email, item.getProductId()).orElse(null);
        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + 1);
            cartRepository.save(cartItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUserEmail(email);
            newItem.setProductId(item.getProductId());
            newItem.setProductName(item.getProductName());
            newItem.setProductAuthor(item.getProductAuthor());
            newItem.setProductPrice(item.getProductPrice());
            newItem.setProductImage(item.getProductImage());
            newItem.setProductCategory(item.getProductCategory());
            newItem.setQuantity(1);
            cartRepository.save(newItem);
        }

        wishlistRepository.delete(item);
        return ResponseEntity.ok(ApiResponse.success("Moved to cart", null));
    }
}
