# BOOKNOOK — Local Development & Run Guide (Windows)

Welcome to the modernized **BookNook** e-commerce platform! This guide explains how to set up, run, test, and troubleshoot the application locally on Windows without paying for any external services or domains.

---

## 1. System Requirements & Prerequisites

Before starting, make sure the following free tools are installed on your Windows machine:

| Software | Minimum Version | Download Link / Notes |
| :--- | :--- | :--- |
| **Java JDK** | JDK 17 or JDK 21 | [Eclipse Temurin](https://adoptium.net/) or [Oracle OpenJDK](https://www.oracle.com/java/technologies/downloads/) |
| **Apache Maven** | 3.8+ | [Maven Download](https://maven.apache.org/download.cgi) *(Optional if using Eclipse or IntelliJ IDE)* |
| **Node.js & npm** | Node 18+ LTS, npm 9+ | [Node.js Official Website](https://nodejs.org/) |
| **MySQL Server** | MySQL 8.0+ | [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) or XAMPP / MySQL Workbench |

> **Verify Installations:** Open PowerShell or Command Prompt and test:
> ```powershell
> java -version
> mvn -v
> node -v
> npm -v
> mysql --version
> ```

---

## 2. Step 1: Database Setup (MySQL)

All original 173 seeded books and table relationships have been preserved and upgraded to modern schema standards (added stock, rich synopsis, review rating stats, and HD cover images).

### Option A: Using MySQL Command Line Client (Fastest)

1. Ensure your MySQL service is running:
   ```cmd
   net start MySQL80
   ```
2. Open Command Prompt or PowerShell, navigate to the project root, and import the schema:
   ```cmd
   cd c:\eclipsecodes\Online_Book_Store
   mysql -u root -p < database\booknook_complete_schema.sql
   ```
   *(Enter your MySQL root password when prompted).*

### Option B: Using MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL instance (`localhost:3306`).
2. Click **File -> Open SQL Script...** and select `c:\eclipsecodes\Online_Book_Store\database\booknook_complete_schema.sql`.
3. Click the **Execute (Lightning Bolt)** icon to run the complete script.
4. In the left *Schemas* panel, right-click and select **Refresh All**. You will see `booknook_db` with all tables and seeded books.

---

## 3. Step 2: Configure Database Credentials

The backend configuration is located at:
`backend/src/main/resources/application.properties`

By default, it is configured with:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/booknook_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=Bujjibabu@7732
```

> **Note:** If your MySQL password is not `Bujjibabu@7732`, simply change the `spring.datasource.password` value to your MySQL root password, or set an environment variable before launching:
> ```cmd
> set DB_PASSWORD=your_actual_password
> ```

---

## 4. Step 3: Run the Spring Boot Backend

The backend runs on **http://localhost:8080**.

### Method 1: Using the Automated Windows Script (Easiest)
Simply double-click:
```
c:\eclipsecodes\Online_Book_Store\run_backend.bat
```
*(Or run `.\run_backend.bat` in Command Prompt).*

### Method 2: Using the Command Line
```cmd
cd c:\eclipsecodes\Online_Book_Store\backend
mvn spring-boot:run
```

### Method 3: In Eclipse IDE
1. Open Eclipse -> **File** -> **Import...** -> **Existing Maven Projects**.
2. Select the directory: `c:\eclipsecodes\Online_Book_Store\backend`.
3. Locate `src/main/java/com/booknook/BookstoreApplication.java`.
4. Right-click `BookstoreApplication.java` -> **Run As** -> **Java Application**.

### Method 4: In Visual Studio Code
1. Open the `c:\eclipsecodes\Online_Book_Store\backend` folder in VS Code.
2. Install the **Extension Pack for Java** and **Spring Boot Tools** (if not installed).
3. Open `BookstoreApplication.java` and click the **Run** button above `main()`.

### Verify Backend is Working:
Open your browser and navigate to:
[http://localhost:8080/api/books](http://localhost:8080/api/books)
You should see a clean JSON response listing the seeded catalog books!

---

## 5. Step 4: Run the React Vite Frontend

The frontend runs on **http://localhost:5173**.

### Method 1: Using the Automated Windows Script (Easiest)
Simply double-click:
```
c:\eclipsecodes\Online_Book_Store\run_frontend.bat
```
*(This automatically runs `npm install` on first launch and starts Vite).*

### Method 2: Using the Command Line
```cmd
cd c:\eclipsecodes\Online_Book_Store\frontend
npm install
npm run dev
```

### Verify Frontend is Working:
Open your web browser and navigate to:
[http://localhost:5173](http://localhost:5173)

---

## 6. Pre-Configured Test Accounts

The database migration script automatically seeds two production-ready test accounts:

### 1. Administrator Account
- **Email:** `admin@booknook.com`
- **Password:** `Admin@123`
- **Role:** `ROLE_ADMIN`
- **Privileges:** Access to `/admin` dashboard, catalog management (Add/Edit/Delete books, change stock & price, upload images), Order management (change order status, update tracking number), Customer role assignment, and Help Center support ticket inbox.

### 2. Standard Customer Account
- **Email:** `customer@booknook.com`
- **Password:** `Customer@123`
- **Role:** `ROLE_CUSTOMER`
- **Privileges:** Browse, live search, filter, Cart, Wishlist, Profile, Address Book, 3-step Checkout, Order history, and Live shipment timeline tracker.

---

## 7. Step-by-Step Feature Test Walkthrough

Here is the recommended checklist to test every feature of BookNook:

### Test 1: Storefront & Browsing
1. Open [http://localhost:5173](http://localhost:5173).
2. Observe the modern editorial typography, hero banner, featured categories, and bestsellers carousel.
3. Click **Shop** in the top navigation.
4. Test the **Live Search Bar**: Type "Harry" or "Gatsby" or "Dune" — results filter dynamically.
5. Test **Category Filter Pills**: Click "Science Fiction", "Fiction", "Fantasy", or "History".
6. Test **Price Range Slider** and **Sort By**: Price (Low to High), Rating (High to Low), or Newest.

### Test 2: Product Detail & Reviews
1. Click on any book card to open its detail page (`/book/:id`).
2. Review the high-resolution cover, synopsis, author, genre badge, stock availability, and ISBN.
3. Scroll down to the **Customer Reviews** section.
4. Try adding a star rating and written review (requires customer login).

### Test 3: Cart & Wishlist (With Guest & Authenticated Support)
1. Click the **Add to Cart** button on any book.
2. The sleek slide-over **Cart Drawer** opens immediately showing your item, quantity buttons, and subtotal.
3. Click the heart icon on any book to add it to your **Wishlist**.
4. Open the full **Wishlist** page (`/wishlist`) and click **Move to Cart** to instantly transfer the book to your shopping cart.

### Test 4: Customer Authentication & Registration
1. Click **Sign In** in the top navigation.
2. Click **Create an account** to test registration with a new email.
3. Try logging in with `customer@booknook.com` / `Customer@123`.
4. Notice your name and avatar appear in the header with a live notification badge.

### Test 5: Profile & Saved Addresses
1. Click your avatar in the navigation bar and choose **My Profile**.
2. View your account information and click **Addresses** tab.
3. Click **Add New Address** and enter a delivery address (Street, City, State, PIN code, Phone).
4. Save it as your default delivery address.

### Test 6: 3-Step Checkout & Order Placement
1. With items in your cart, click **Checkout** (or navigate to `/checkout`).
2. **Step 1: Shipping Address** — Select your saved address or enter a new one.
3. **Step 2: Delivery & Shipping Method** — Choose Standard (Free) or Express.
4. **Step 3: Payment Method** — Select either:
   - **Cash on Delivery (COD)**: No card needed, instant confirmation.
   - **Online Sandbox (Card / UPI / NetBanking)**: Enter mock test card details (any 16 digits, 12/28, 123).
5. Click **Place Order**.
6. The system initiates an atomic database transaction:
   - Deducts book inventory from the database.
   - Creates the order and order items.
   - Clears purchased items from the active cart.
   - Redirects to the **Order Confirmation & Tracking** page.

### Test 7: Order Tracking & Shipment Timeline
1. From the confirmation page or the **My Orders** page (`/orders`), click on your order.
2. Observe the interactive multi-stage progress tracker:
   - `Order Placed` -> `Processing` -> `Shipped` -> `Out for Delivery` -> `Delivered`.
3. View the full itemized breakdown, tax computation, shipping destination, and courier tracking code.

### Test 8: Password Reset Flow (3-Step OTP)
1. Go to `/login` and click **Forgot your password?**.
2. Enter `customer@booknook.com`.
3. In local development mode, a secure 6-digit OTP code is generated (displayed in the backend console log for convenience).
4. Enter the OTP code at `/verify-otp`.
5. Enter your new password at `/reset-password` and save.
6. Log in with the newly updated password!

### Test 9: Admin Dashboard & Catalog Management
1. Log out, then log in with `admin@booknook.com` / `Admin@123`.
2. Notice the gold **Admin Dashboard** badge in the navigation bar. Click it or navigate to `/admin`.
3. **Dashboard Metrics:** View real-time revenue stats, total orders count, customer counts, and low-stock alerts.
4. **Manage Books (CRUD):**
   - Click **Add New Book**: Enter Title, Author, Category, Price, Stock, Synopsis, and Image URL.
   - Click **Edit**: Change the price or stock quantity of any book.
   - Click **Delete**: Remove a book with instant confirmation.
5. **Manage Customer Orders:**
   - Switch to the **Orders** tab.
   - Change order status from `Pending` to `Processing`, `Shipped`, or `Delivered`.
   - Assign a courier tracking code (e.g. `FEDEX-982342-IN`).
   - The customer will instantly see this updated tracking status on their account!
6. **Support Tickets:**
   - Switch to the **Support Requests** tab to review contact messages and inquiries submitted by customers through the `/help` page.

---

## 8. Common Troubleshooting & Solutions

### 1. Backend error: `Communications link failure` or `Access denied for user 'root'@'localhost'`
- **Cause:** MySQL is either stopped or the password in `application.properties` does not match your MySQL installation.
- **Fix:**
  1. Open Services (`services.msc`) and verify `MySQL80` (or `MySQL`) is Running.
  2. Test your password in MySQL Command Line Client.
  3. Update `spring.datasource.password` in `backend/src/main/resources/application.properties` with your exact root password.

### 2. Backend error: `Port 8080 was already in use`
- **Cause:** Another process (e.g., Tomcat, Jenkins, another Java app) is using port 8080.
- **Fix:**
  - Find the PID: `netstat -ano | findstr :8080`
  - Terminate the process: `taskkill /PID <PID> /F`
  - OR change the backend port to 8081 by passing `PORT=8081` in `application.properties` and updating `target` in `frontend/vite.config.js`.

### 3. Frontend error: `Port 5173 is in use, trying another one...`
- **Cause:** A previous Vite process is still running in background.
- **Fix:**
  - Vite will automatically use port 5174, or you can kill the old node process with: `taskkill /IM node.exe /F`

### 4. Frontend API Calls Fail with 403 or 401
- **Cause:** Stale JWT token in browser localStorage.
- **Fix:**
  - Open Developer Tools in browser (F12) -> Application -> Local Storage -> Clear `token` and `user`, then refresh and log in again.
