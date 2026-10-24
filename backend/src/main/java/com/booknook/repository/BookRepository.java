package com.booknook.repository;

import com.booknook.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {

    @Query("SELECT DISTINCT b.genre FROM Book b WHERE b.genre IS NOT NULL AND b.genre != '' ORDER BY b.genre ASC")
    List<String> findDistinctGenres();

    @Query("SELECT b FROM Book b WHERE " +
           "(:genre IS NULL OR :genre = '' OR LOWER(b.genre) = LOWER(:genre)) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
           "(:inStockOnly = false OR b.stock > 0)")
    Page<Book> searchBooks(
            @Param("genre") String genre,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStockOnly") boolean inStockOnly,
            Pageable pageable
    );

    List<Book> findTop8ByOrderByRatingDesc();

    List<Book> findTop8ByOrderByCreatedAtDesc();

    List<Book> findTop8ByGenreIgnoreCase(String genre);

    long countByStockLessThan(int threshold);
}
