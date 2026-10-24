package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.model.Book;
import com.booknook.model.Review;
import com.booknook.model.User;
import com.booknook.repository.BookRepository;
import com.booknook.repository.ReviewRepository;
import com.booknook.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public BookController(BookRepository bookRepository, ReviewRepository reviewRepository, UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Book>>> getAllBooks(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "false") boolean inStockOnly,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Sort sortObj;
        switch (sort.toLowerCase()) {
            case "price_asc":
                sortObj = Sort.by(Sort.Direction.ASC, "price");
                break;
            case "price_desc":
                sortObj = Sort.by(Sort.Direction.DESC, "price");
                break;
            case "rating_desc":
                sortObj = Sort.by(Sort.Direction.DESC, "rating");
                break;
            case "title_asc":
                sortObj = Sort.by(Sort.Direction.ASC, "title");
                break;
            case "newest":
            default:
                sortObj = Sort.by(Sort.Direction.DESC, "id");
                break;
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Book> books = bookRepository.searchBooks(genre, search, minPrice, maxPrice, inStockOnly, pageable);

        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable Integer id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }
        return ResponseEntity.ok(ApiResponse.success(book));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> genres = bookRepository.findDistinctGenres();
        return ResponseEntity.ok(ApiResponse.success(genres));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<Book>>> getFeaturedBooks() {
        List<Book> featured = bookRepository.findTop8ByOrderByRatingDesc();
        return ResponseEntity.ok(ApiResponse.success(featured));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<Book>>> getNewArrivals() {
        List<Book> newArrivals = bookRepository.findTop8ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(newArrivals));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<Book>>> getRelatedBooks(@PathVariable Integer id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null || book.getGenre() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        List<Book> related = bookRepository.findTop8ByGenreIgnoreCase(book.getGenre());
        related.removeIf(b -> b.getId().equals(id));
        return ResponseEntity.ok(ApiResponse.success(related));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getReviews(@PathVariable Integer id) {
        List<Review> reviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }

        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }

        User user = userRepository.findByEmail(authentication.getName()).orElse(null);
        String userName = user != null ? user.getName() : "Customer";

        int rating = 5;
        if (body.get("rating") != null) {
            try {
                rating = Integer.parseInt(body.get("rating").toString());
                if (rating < 1) rating = 1;
                if (rating > 5) rating = 5;
            } catch (Exception ignore) {}
        }
        String comment = body.get("comment") != null ? body.get("comment").toString() : "";

        Review review = new Review(book, authentication.getName(), userName, rating, comment);
        Review saved = reviewRepository.save(review);

        // Recalculate book rating
        List<Review> allReviews = reviewRepository.findByBookIdOrderByCreatedAtDesc(id);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        book.setRating(BigDecimal.valueOf(Math.round(avg * 10.0) / 10.0));
        book.setReviewsCount(allReviews.size());
        bookRepository.save(book);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully!", saved));
    }
}
