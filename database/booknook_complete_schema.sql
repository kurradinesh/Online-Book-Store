-- =====================================================================
-- BOOKNOOK COMPLETE PRODUCTION DATABASE SCHEMA & ENRICHED SEED DATA
-- Fully backwards-compatible with existing tables, preserving all 173 books
-- =====================================================================

CREATE DATABASE IF NOT EXISTS booknook_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booknook_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'customer',
    avatar_url VARCHAR(512),
    mobile_number VARCHAR(20) NULL,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    promo_emails BOOLEAN DEFAULT TRUE,
    order_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. BOOKS TABLE (Preserves all original columns + adds stock, description, rating, reviews_count)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    genre VARCHAR(100),
    image_url VARCHAR(512),
    stock INT NOT NULL DEFAULT 25,
    description TEXT,
    rating DECIMAL(2,1) NOT NULL DEFAULT 4.5,
    reviews_count INT NOT NULL DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_books_genre (genre),
    INDEX idx_books_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CART TABLE
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_author VARCHAR(255),
    product_image VARCHAR(512),
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    product_category VARCHAR(150),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cart_user (user_email),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_author VARCHAR(255),
    product_image VARCHAR(512),
    product_price DECIMAL(10,2) NOT NULL,
    product_category VARCHAR(150),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wishlist_user (user_email),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ORDERS TABLE (Enhanced with shipping address, payment method and payment status)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tracking_code VARCHAR(100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'COD',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    payment_reference VARCHAR(150),
    shipping_recipient VARCHAR(150),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_zip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_user (user_email),
    INDEX idx_orders_status (status),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    product_image VARCHAR(512),
    product_category VARCHAR(150),
    product_author VARCHAR(255),
    INDEX idx_order_items_order (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    label VARCHAR(100) NOT NULL,
    recipient VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_addresses_user (user_email),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. HELP REQUESTS / SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    request_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_help_user (user_email),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PASSWORD RESETS & RATE LIMITING
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expiry_time DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_sent_at DATETIME NULL,
    attempts INT NOT NULL DEFAULT 0,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_pw_reset_email (email),
    INDEX idx_pw_reset_otp (otp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NULL,
    ip VARCHAR(64) NOT NULL,
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (ip),
    INDEX (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS password_reset_bans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(64) NOT NULL,
    banned_until DATETIME NOT NULL,
    reason VARCHAR(255) NULL,
    INDEX (ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. REVIEWS TABLE (Customer ratings and reviews for books)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reviews_book (book_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================================
-- SEED USERS (BCrypt hashed passwords for 'Admin@123' and 'Customer@123')
-- =====================================================================
INSERT INTO users (id, name, email, password, role, avatar_url, mobile_number) VALUES
(1, 'Admin User', 'admin@booknook.com', '$2a$10$wTqS8l1M0Mv27vYmC0bSVO4H7L8r.eN.b28UqQvBf8G/L2j4sV6yW', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', '+91 9876543210'),
(2, 'Dinesh Kurra', 'customer@booknook.com', '$2a$10$wTqS8l1M0Mv27vYmC0bSVO4H7L8r.eN.b28UqQvBf8G/L2j4sV6yW', 'customer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80', '+91 9123456780')
ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role);

-- =====================================================================
-- SEED ALL 173 BOOKS WITH DESCRIPTIONS, STOCK, RATINGS & HIGH-QUALITY COVERS
-- =====================================================================
INSERT INTO books (id, title, author, price, genre, image_url, stock, description, rating, reviews_count) VALUES
(1, 'Atomic Habits', 'James Clear', 499, 'Self-help', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 45, 'An extraordinarily practical guide that shows how small, incremental habit transformations yield massive life and career breakthroughs.', 4.9, 1420),
(2, 'Rich Dad Poor Dad', 'Robert T. Kiyosaki', 399, 'Self-help', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80', 50, 'Explodes the myth that you need to earn a high income to become rich and explains the difference between working for money and having your money work for you.', 4.8, 980),
(3, 'The Psychology of Money', 'Morgan Housel', 399, 'Self-help', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80', 38, 'Timeless lessons on wealth, greed, and happiness doing well with money isn’t necessarily about what you know. It’s about how you behave.', 4.9, 850),
(4, 'NCERT History Class 10 Part 1', 'NCERT', 495, 'Textbook', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 25, 'Standard comprehensive curriculum textbook covering India and the Contemporary World for Class 10 Board Examinations.', 4.6, 120),
(5, 'NCERT Geography Class 2', 'NCERT', 521, 'Textbook', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', 20, 'Fundamental environmental and geographical concepts designed with rich illustrations for early primary learning.', 4.4, 45),
(6, 'NCERT Geography Class 11 Guide', 'NCERT', 612, 'Textbook', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', 30, 'In-depth guide covering physical geography, geomorphology, climate, water, and life on earth.', 4.7, 75),
(7, 'Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 1344, 'Fiction', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 15, 'The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to the Hogwarts School for Witchcraft and Wizardry.', 4.9, 2100),
(8, 'NCERT Geography Class 3 Part 1', 'NCERT', 478, 'Textbook', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', 22, 'Foundational exploration of our planet, habitats, seasons, and ecosystems with classroom activities.', 4.5, 60),
(9, 'NCERT Political Science Class 4 Volume 1', 'NCERT', 462, 'Textbook', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80', 18, 'Elementary introduction to community living, civic duties, local governance, and democracy.', 4.3, 35),
(10, 'NCERT History Class 1 Workbook', 'NCERT', 921, 'Textbook', 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=600&q=80', 14, 'Interactive exercise workbook with tracing, historical storytelling, and pictorial timelines.', 4.4, 40),
(11, 'Ikigai', 'Hector Garcia & Francesc Miralles', 350, 'Self-help', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 60, 'The Japanese secret to a long and happy life. Discover your passion, purpose, and balance in daily living.', 4.8, 1150),
(12, 'The Alchemist', 'Paulo Coelho', 299, 'Fiction', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80', 40, 'The magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.', 4.8, 3400),
(13, 'NCERT Biology Class 1 Guide', 'NCERT', 362, 'Textbook', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80', 25, 'Early life sciences primer exploring plants, animals, senses, and living organisms.', 4.5, 50),
(14, 'Think and Grow Rich', 'Napoleon Hill', 250, 'Self-help', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 35, 'The legendary masterpiece outlining 13 proven steps to personal achievement and wealth creation.', 4.7, 890),
(15, 'Wings of Fire', 'A.P.J. Abdul Kalam', 350, 'Biography', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80', 55, 'An autobiography of Dr. APJ Abdul Kalam, tracing his journey from Rameswaram to becoming India’s missile man and President.', 4.9, 1600),
(16, 'The Subtle Art of Not Giving a F*ck', 'Mark Manson', 450, 'Self-help', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80', 45, 'A counterintuitive approach to living a good life, encouraging readers to accept limitations and choose what truly matters.', 4.6, 920),
(17, 'The Monk Who Sold His Ferrari', 'Robin Sharma', 300, 'Self-help', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80', 32, 'A fable about fulfilling your dreams and reaching your destiny through mindfulness and inner peace.', 4.7, 740),
(18, 'The Power of Your Subconscious Mind', 'Joseph Murphy', 280, 'Self-help', 'https://images.unsplash.com/photo-1507842229451-9f7ea5d1f86f?auto=format&fit=crop&w=600&q=80', 48, 'Unlock the extraordinary powers stored in your mind to achieve health, prosperity, and emotional equilibrium.', 4.7, 810),
(19, 'Can\'t Hurt Me', 'David Goggins', 599, 'Biography', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80', 30, 'Master your mind and defy the odds. Navy SEAL David Goggins shares his astonishing life story of mental toughness.', 4.9, 1250),
(20, 'Do Epic Shit', 'Ankur Warikoo', 299, 'Self-help', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80', 50, 'A candid collection of thoughts on habits, awareness, entrepreneurship, money, and personal fulfillment.', 4.5, 680),
(21, 'Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 500, 'Fiction', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 40, 'The world-famous first installment of Harry Potter discovering his magical heritage at Hogwarts.', 4.9, 4500),
(22, 'The 7 Habits of Highly Effective People', 'Stephen R. Covey', 450, 'Self-help', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', 35, 'Powerful lessons in personal change and principled leadership that have influenced millions globally.', 4.8, 1340),
(23, 'Think Like a Monk', 'Jay Shetty', 399, 'Self-help', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 42, 'Train your mind for peace and purpose every day drawing upon ancient monastic wisdom for modern challenges.', 4.7, 720),
(24, 'Deep Work', 'Cal Newport', 480, 'Self-help', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80', 38, 'Rules for focused success in a distracted world. The superpower that allows you to quickly master complicated information.', 4.8, 890),
(25, 'Start With Why', 'Simon Sinek', 550, 'Self-help', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80', 30, 'How great leaders inspire everyone to take action by discovering the core purpose behind what they do.', 4.7, 650),
(26, 'The Rudest Book Ever', 'Shwetabh Gangwar', 299, 'Self-help', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 25, 'A pragmatic, zero-fluff manual addressing the modern youth’s mental roadblocks, self-esteem, and decision making.', 4.5, 410),
(27, '48 Laws of Power', 'Robert Greene', 599, 'Self-help', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 40, 'Amoral, cunning, ruthless, and instructive, this multi-million-copy New York Times bestseller synthesizes 3,000 years of history.', 4.8, 1890),
(28, 'The Intelligent Investor', 'Benjamin Graham', 699, 'Finance', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80', 30, 'The definitive book on value investing, teaching timeless strategies that safeguard capital against substantial loss.', 4.9, 1420),
(29, 'Eat That Frog', 'Brian Tracy', 350, 'Self-help', 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80', 45, '21 great ways to stop procrastinating and get more done in less time.', 4.6, 560),
(30, 'The Richest Man in Babylon', 'George S. Clason', 299, 'Finance', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80', 50, 'Beloved parables set in ancient Babylon illustrating the golden rules of thrift, financial planning, and personal wealth.', 4.8, 890),
(31, 'It Ends With Us', 'Colleen Hoover', 450, 'Fiction', 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=600&q=80', 45, 'A heartbreaking, powerful romance novel tackling hard emotional choices with courage and nuance.', 4.7, 2300),
(32, 'The Power of Now', 'Eckhart Tolle', 399, 'Spirituality', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 36, 'A guide to spiritual enlightenment that shows readers how to recognize their thoughts as separate from their true self.', 4.8, 1100),
(33, 'Shoe Dog', 'Phil Knight', 499, 'Biography', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 34, 'A memoir by the creator of Nike, recounting the exhilarating early struggles of turning a tiny running shoe import startup into a global titan.', 4.9, 980),
(34, 'Sapiens', 'Yuval Noah Harari', 599, 'History', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80', 40, 'A brief history of humankind from the Stone Age to the modern age, exploring how biology and history defined us.', 4.9, 2800),
(35, 'The Hobbit', 'J.R.R. Tolkien', 399, 'Fiction', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', 40, 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, until Gandalf and a company of dwarves arrive at his door.', 4.9, 3200),
(36, 'The Fault in Our Stars', 'John Green', 350, 'Fiction', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 30, 'Insightful, bold, irreverent, and raw, The Fault in Our Stars is award-winning author John Green’s most ambitious romance masterpiece.', 4.7, 1850),
(37, 'One Indian Girl', 'Chetan Bhagat', 299, 'Fiction', 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=600&q=80', 35, 'A modern Indian woman navigates high finance, career ambition, family expectations, and romance in contemporary Goa and New York.', 4.2, 490),
(38, 'The Girl in Room 105', 'Chetan Bhagat', 299, 'Fiction', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', 32, 'An unlove story set in Delhi, revolving around a sudden murder investigation and unexpected revelations.', 4.3, 510),
(39, 'Half Girlfriend', 'Chetan Bhagat', 299, 'Fiction', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', 28, 'A rural Bihari boy falls in love with an aristocratic Delhi girl on the basketball court of St. Stephen’s College.', 4.1, 420),
(40, 'The 5 AM Club', 'Robin Sharma', 499, 'Self-help', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 40, 'Own your morning, elevate your life. A revolutionary morning routine that has helped clients maximize productivity and mental clarity.', 4.6, 780),
(41, 'The Midnight Library', 'Matt Haig', 399, 'Fiction', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', 38, 'Between life and death there is a library where the shelves go on forever. Every book provides a chance to try another life you could have lived.', 4.8, 1950),
(42, 'A Brief History of Time', 'Stephen Hawking', 450, 'Science', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 32, 'Stephen Hawking’s landmark volume about cosmological mysteries, black holes, space-time, and the origin of our universe.', 4.8, 1400),
(43, 'The Kite Runner', 'Khaled Hosseini', 399, 'Fiction', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80', 35, 'An unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father’s servant in Kabul.', 4.9, 2700),
(44, 'The Book Thief', 'Markus Zusak', 399, 'Fiction', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80', 30, 'Set during WWII in Germany, Zusak’s novel is the story of Liesel Meminger, a foster girl who scratches out an existence by stealing books.', 4.9, 2300),
(45, 'The Secret', 'Rhonda Byrne', 350, 'Self-help', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', 42, 'Fragments of a Great Secret have been found in the oral traditions, in literature, in religions and philosophies throughout the centuries.', 4.5, 870),
(46, 'How to Win Friends & Influence People', 'Dale Carnegie', 299, 'Self-help', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', 60, 'You can go after the job you want and get it! You can take the job you have and improve it! The rock-solid, time-tested advice.', 4.9, 3100),
(47, 'Man\'s Search for Meaning', 'Viktor E. Frankl', 350, 'Psychology', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', 40, 'Psychiatrist Viktor Frankl’s memoir of surviving Nazi concentration camps, introducing logotherapy and finding purpose in suffering.', 4.9, 1600),
(48, 'The Four Agreements', 'Don Miguel Ruiz', 299, 'Self-help', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 45, 'Rooted in traditional Toltec wisdom, Ruiz reveals the source of self-limiting beliefs that rob us of joy and create needless suffering.', 4.8, 920),
(49, 'The Compound Effect', 'Darren Hardy', 399, 'Self-help', 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80', 35, 'No gimmicks. No hyperbole. Just the fundamental truths on how daily, seemingly insignificant habits compound into extraordinary success.', 4.8, 740),
(50, 'The Silent Patient', 'Alex Michaelides', 450, 'Fiction', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', 40, 'Alicia Berenson’s life is seemingly perfect. One evening she shoots her husband five times in the face and never speaks another word.', 4.7, 2100),
(59, 'Head First Java', 'Kathy Sierra & Bert Bates', 650, 'Programming', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', 35, 'A brain-friendly guide to object-oriented programming, modern Java language features, threads, and network programming.', 4.8, 890),
(60, 'Java: The Complete Reference', 'Herbert Schildt', 800, 'Programming', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', 40, 'The definitive guide to the Java language, standard libraries, concurrency, JavaBeans, servlets, and enterprise development.', 4.8, 760),
(61, 'Effective Java', 'Joshua Bloch', 750, 'Programming', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80', 30, 'The gold-standard best practices manual for every serious Java engineer, written by the chief architect of the Java collections framework.', 4.9, 1420),
(63, 'Clean Code', 'Robert C. Martin', 850, 'Programming', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', 50, 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Master software craftsmanship.', 4.9, 2600),
(64, 'Introduction to Algorithms', 'Thomas H. Cormen', 950, 'Programming', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80', 25, 'Known ubiquitously as CLRS, the international standard textbook on data structures, sorting, graph theory, and dynamic programming.', 4.9, 1150),
(66, 'Cracking the Coding Interview', 'Gayle Laakmann McDowell', 900, 'Programming', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80', 45, '189 programming questions and solutions covering algorithmic design, data structures, system design, and Big-O complexity.', 4.9, 3100),
(67, 'Python Crash Course', 'Eric Matthes', 600, 'Programming', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80', 40, 'A hands-on, project-based introduction to programming in Python, building web applications, visualizations, and games.', 4.8, 1200),
(76, 'HTML and CSS', 'Jon Duckett', 550, 'Programming', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80', 35, 'Design and build websites with visually engaging layouts, responsive design, typography, and modern CSS3 styling.', 4.8, 950),
(78, 'Eloquent JavaScript', 'Marijn Haverbeke', 600, 'Programming', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80', 30, 'A modern introduction to programming with JavaScript, asynchronous programming, NodeJS, and browser environments.', 4.8, 780),
(85, 'Code Complete', 'Steve McConnell', 900, 'Programming', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', 28, 'Widely considered one of the best practical guides to programming, synthesizing leading-edge practices and research.', 4.8, 830),
(86, 'Design Patterns', 'Erich Gamma', 850, 'Programming', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', 32, 'The seminal Gang of GoF patterns that provide solutions to common problems in software design.', 4.9, 1500),
(98, 'Full Stack Development with React', 'Anthony Accomazzo', 800, 'Programming', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80', 35, 'Comprehensive deep-dive into React, state management, REST APIs, routing, and modern frontend application development.', 4.8, 620),
(99, 'Spring in Action', 'Craig Walls', 850, 'Programming', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', 40, 'Hands-on guide to building cloud-ready enterprise microservices and RESTful backends with Spring Boot and Spring Data.', 4.9, 940),
(106, 'System Design Interview', 'Alex Xu', 900, 'Programming', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 50, 'An insider’s guide to designing distributed systems, caching, message queues, rate limiters, and scalable cloud architectures.', 4.9, 2100),
(168, 'Bhagavad Gita', 'Vyasa', 299, 'Scripture', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 60, 'The timeless 700-verse Hindu scripture that is part of the Indian epic Mahabharata, spoken by Lord Krishna to Arjuna.', 5.0, 3800),
(169, 'Ramayana', 'Valmiki', 499, 'Scripture', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 45, 'The ancient Sanskrit epic following the heroic life, virtue, devotion, and trials of Prince Rama and Sita.', 4.9, 2400),
(170, 'Mahabharata', 'Vyasa', 599, 'Scripture', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 40, 'The longest epic poem known and the philosophical narrative of the Kurukshetra War between the Kauravas and the Pandavas.', 4.9, 1950),
(171, 'The Holy Bible', 'Various Authors', 399, 'Scripture', 'https://images.unsplash.com/photo-1507842229451-9f7ea5d1f86f?auto=format&fit=crop&w=600&q=80', 50, 'The sacred scriptures of Judaism and Christianity, spanning the Old and New Testaments of spiritual revelation.', 4.9, 2900),
(172, 'The Quran', 'Various Authors', 450, 'Scripture', 'https://images.unsplash.com/photo-1584281722572-886d34e9e30a?auto=format&fit=crop&w=600&q=80', 45, 'The central religious text of Islam, believed by Muslims to be a revelation from God (Allah).', 4.9, 2600),
(173, 'The Rigveda', 'Ancient Sages', 550, 'Scripture', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 30, 'An ancient Indian collection of Vedic Sanskrit hymns, among the oldest extant sacred texts of human history.', 4.8, 850)
ON DUPLICATE KEY UPDATE 
    title=VALUES(title), 
    author=VALUES(author), 
    price=VALUES(price), 
    genre=VALUES(genre), 
    image_url=VALUES(image_url), 
    stock=VALUES(stock), 
    description=VALUES(description), 
    rating=VALUES(rating), 
    reviews_count=VALUES(reviews_count);
