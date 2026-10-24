package com.booknook.controller;

import com.booknook.dto.ApiResponse;
import com.booknook.dto.BookDto.BookCreateUpdateRequest;
import com.booknook.dto.CheckoutDto.OrderStatusUpdateRequest;
import com.booknook.model.Book;
import com.booknook.model.Order;
import com.booknook.model.OrderItem;
import com.booknook.model.User;
import com.booknook.repository.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    public AdminController(
            BookRepository bookRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            UserRepository userRepository
    ) {
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        long totalOrders = orderRepository.count();
        long activeUsers = userRepository.count();
        long totalBooks = bookRepository.count();
        long lowStockCount = bookRepository.countByStockLessThan(10);
        long pendingOrders = orderRepository.countByStatus("Pending");
        List<Order> recentOrders = orderRepository.findTop10ByOrderByOrderDateDesc();

        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        stats.put("totalOrders", totalOrders);
        stats.put("activeUsers", activeUsers);
        stats.put("totalBooks", totalBooks);
        stats.put("lowStockCount", lowStockCount);
        stats.put("pendingOrders", pendingOrders);
        stats.put("recentOrders", recentOrders);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/books")
    public ResponseEntity<ApiResponse<Page<Book>>> getAdminBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<Book> books = bookRepository.searchBooks(
                genre, search, null, null, false,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"))
        );
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @PostMapping("/books")
    public ResponseEntity<ApiResponse<Book>> addBook(@Valid @RequestBody BookCreateUpdateRequest req) {
        Book book = new Book();
        book.setTitle(req.getTitle().trim());
        book.setAuthor(req.getAuthor().trim());
        book.setPrice(req.getPrice());
        book.setGenre(req.getGenre().trim());
        book.setImageUrl(req.getImageUrl() != null && !req.getImageUrl().isBlank()
                ? req.getImageUrl().trim()
                : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80");
        book.setStock(req.getStock() != null ? req.getStock() : 25);
        book.setDescription(req.getDescription());
        book.setRating(req.getRating() != null ? req.getRating() : BigDecimal.valueOf(4.5));
        book.setReviewsCount(1);

        Book saved = bookRepository.save(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Book added successfully", saved));
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<ApiResponse<Book>> updateBook(
            @PathVariable Integer id,
            @Valid @RequestBody BookCreateUpdateRequest req
    ) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }

        book.setTitle(req.getTitle().trim());
        book.setAuthor(req.getAuthor().trim());
        book.setPrice(req.getPrice());
        book.setGenre(req.getGenre().trim());
        if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
            book.setImageUrl(req.getImageUrl().trim());
        }
        if (req.getStock() != null) {
            book.setStock(req.getStock());
        }
        if (req.getDescription() != null) {
            book.setDescription(req.getDescription());
        }

        Book saved = bookRepository.save(book);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", saved));
    }

    @PostMapping(value = "/upload-image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please provide an image file"));
        }
        try {
            String originalFilename = file.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }
            if (ext.isEmpty() || (!ext.equals(".jpg") && !ext.equals(".jpeg") && !ext.equals(".png") && !ext.equals(".webp") && !ext.equals(".gif"))) {
                ext = ".jpg";
            }
            String newFilename = "book_" + System.currentTimeMillis() + "_" + java.util.UUID.randomUUID().toString().substring(0, 8) + ext;

            // 1. Permanent project root uploads directory
            java.nio.file.Path rootUploads = java.nio.file.Paths.get("uploads").toAbsolutePath().normalize();
            if (rootUploads.endsWith(java.nio.file.Paths.get("backend", "uploads"))) {
                rootUploads = rootUploads.getParent().getParent().resolve("uploads");
            }
            if (!java.nio.file.Files.exists(rootUploads)) {
                java.nio.file.Files.createDirectories(rootUploads);
            }
            java.nio.file.Path targetRootPath = rootUploads.resolve(newFilename);

            // 2. Also ensure backend/uploads exists
            java.nio.file.Path backendUploads = rootUploads.resolveSibling("backend").resolve("uploads");
            if (!java.nio.file.Files.exists(backendUploads)) {
                java.nio.file.Files.createDirectories(backendUploads);
            }
            java.nio.file.Path targetBackendPath = backendUploads.resolve(newFilename);

            // Save file byte stream permanently to both directories
            byte[] fileBytes = file.getBytes();
            java.nio.file.Files.write(targetRootPath, fileBytes, java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);
            java.nio.file.Files.write(targetBackendPath, fileBytes, java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);

            String fileUrl = "/uploads/" + newFilename;
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", fileUrl);
            response.put("fileName", newFilename);
            return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Integer id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Book not found"));
        }

        bookRepository.delete(book);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAdminOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminOrderDetails(@PathVariable Integer id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order not found"));
        }
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("items", items);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Integer id,
            @Valid @RequestBody OrderStatusUpdateRequest req
    ) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order not found"));
        }

        order.setStatus(req.getStatus());
        if (req.getTrackingCode() != null && !req.getTrackingCode().isBlank()) {
            order.setTrackingCode(req.getTrackingCode().trim());
        }
        if ("Delivered".equalsIgnoreCase(req.getStatus()) && "COD".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus("Paid");
        }

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + req.getStatus(), saved));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAdminUsers() {
        List<User> users = userRepository.findAll();
        // Hide hashed passwords in response
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body
    ) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found"));
        }

        String newRole = body.getOrDefault("role", "customer");
        user.setRole(newRole.toLowerCase());
        User saved = userRepository.save(user);
        saved.setPassword(null);

        return ResponseEntity.ok(ApiResponse.success("User role updated to " + newRole, saved));
    }
}
