package com.booknook.config;

import com.booknook.model.Book;
import com.booknook.model.User;
import com.booknook.repository.BookRepository;
import com.booknook.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BookRepository bookRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin User
        if (!userRepository.existsByEmail("admin@booknook.com")) {
            User admin = new User();
            admin.setName("BookNook Administrator");
            admin.setEmail("admin@booknook.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole("admin");
            admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80");
            admin.setMobileNumber("+91 9876543210");
            userRepository.save(admin);
            System.out.println(">> Seeded default Admin user: admin@booknook.com / Admin@123");
        }

        // 2. Seed Demo Customer User
        if (!userRepository.existsByEmail("customer@booknook.com")) {
            User customer = new User();
            customer.setName("Dinesh Kurra");
            customer.setEmail("customer@booknook.com");
            customer.setPassword(passwordEncoder.encode("Customer@123"));
            customer.setRole("customer");
            customer.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80");
            customer.setMobileNumber("+91 9123456780");
            userRepository.save(customer);
            System.out.println(">> Seeded default Customer user: customer@booknook.com / Customer@123");
        }

        // 3. Seed Books if table is completely empty
        if (bookRepository.count() == 0) {
            List<Book> initialBooks = Arrays.asList(
                new Book("Atomic Habits", "James Clear", BigDecimal.valueOf(499), "Self-help", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", 45, "An extraordinarily practical guide showing how tiny habit adjustments lead to massive life results."),
                new Book("Rich Dad Poor Dad", "Robert T. Kiyosaki", BigDecimal.valueOf(399), "Self-help", "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80", 50, "Explodes the myth that you need to earn a high income to become rich and teaches financial literacy."),
                new Book("The Psychology of Money", "Morgan Housel", BigDecimal.valueOf(399), "Finance", "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80", 38, "Timeless lessons on wealth, greed, and happiness in personal finance."),
                new Book("Clean Code", "Robert C. Martin", BigDecimal.valueOf(850), "Programming", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", 35, "Master craftsmanship handbook for agile software development and clean architecture."),
                new Book("Harry Potter and the Chamber of Secrets", "J.K. Rowling", BigDecimal.valueOf(1344), "Fiction", "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80", 25, "The legendary magical fantasy sequel at Hogwarts School of Witchcraft and Wizardry."),
                new Book("Ikigai", "Hector Garcia & Francesc Miralles", BigDecimal.valueOf(350), "Self-help", "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80", 60, "The Japanese secret to a long, purposeful, and fulfilling life."),
                new Book("Wings of Fire", "A.P.J. Abdul Kalam", BigDecimal.valueOf(350), "Biography", "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80", 55, "Inspiring autobiography of the visionary Indian scientist and President."),
                new Book("The Alchemist", "Paulo Coelho", BigDecimal.valueOf(299), "Fiction", "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80", 40, "A captivating fable about following your dreams and listening to your heart."),
                new Book("Head First Java", "Kathy Sierra & Bert Bates", BigDecimal.valueOf(650), "Programming", "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80", 30, "A brain-friendly visual guide to object-oriented Java programming."),
                new Book("Effective Java", "Joshua Bloch", BigDecimal.valueOf(750), "Programming", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80", 28, "Essential best practices and idioms for writing robust Java code."),
                new Book("System Design Interview", "Alex Xu", BigDecimal.valueOf(900), "Programming", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", 45, "Step-by-step master guide to designing modern distributed cloud systems."),
                new Book("Bhagavad Gita", "Vyasa", BigDecimal.valueOf(299), "Scripture", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80", 60, "The timeless philosophical and spiritual dialogue spoken on the battlefield of Kurukshetra.")
            );
            bookRepository.saveAll(initialBooks);
            System.out.println(">> Seeded initial flagship book catalog.");
        }
    }
}
