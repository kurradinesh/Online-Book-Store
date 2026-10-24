# BOOKNOOK — Modern E-Commerce Book Store Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A professional, full-featured online book store e-commerce platform built with **Spring Boot 3 REST APIs**, **React 18 + Vite SPA**, and **MySQL 8.0**.

---

## 🌟 Key Highlights & Modern Features

### 🛍️ Customer Experience
- **Editorial Design System:** Built with warm, literary editorial aesthetics (Playfair Display & Inter typography, dark mode tokens, micro-animations, glassmorphic drawers).
- **Rich Catalog & Live Search:** Dynamic real-time instant search bar, category filter pills, price range slider, and sort by price, rating, or newest.
- **Product Details & Customer Reviews:** High-definition curated book covers, author bio, genre tags, stock availability, and interactive star rating & review submission system.
- **Slide-Over Cart Drawer & Full Cart:** Instant drawer opening on item addition, quantity stepper, promo code discounts, and subtotal calculation.
- **Wishlist:** Quick heart toggle on any book with 1-click "Move to Cart" functionality.
- **Customer Address Book:** Multi-address management with default shipping address selection.
- **3-Step Checkout:**
  - Step 1: Shipping address selection or entry.
  - Step 2: Shipping method (Standard Free / Express Delivery).
  - Step 3: Payment option — Cash on Delivery (COD) or Online Sandbox (Credit/Debit Card, UPI, NetBanking).
- **Order Tracking & Shipment Timeline:** Interactive 5-stage shipment progress tracker (`Placed` -> `Processing` -> `Shipped` -> `Out for Delivery` -> `Delivered`) with assigned courier tracking numbers.
- **User Account Management:** Profile editing, password changing, order history, and self-service account deletion (privacy-compliant).
- **Authentication & Security:** Stateless JWT authentication, BCrypt password hashing, and a 3-step 6-digit OTP password reset workflow.
- **Help Center & Legal:** Support inquiry ticket submission, FAQs, Terms of Service, and Privacy Policy.

### 🛡️ Admin Dashboard (`/admin`)
- **Role-Based Access Control (RBAC):** Protected routes and REST endpoints guarded by `@PreAuthorize("hasRole('ADMIN')")`.
- **Real-Time Analytics:** Total revenue metric, order volume, catalog count, customer base, and low-stock alerts.
- **Catalog Management (CRUD):** Add new books, edit pricing and inventory, upload cover images, and delete titles.
- **Order Fulfillment:** Live status updater (`Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) with courier tracking code assignment.
- **Customer Directory:** View customer accounts and toggle roles.
- **Support Inbox:** Review customer questions and inquiries submitted from the Help Center.

---

## 🗂️ Project Structure

```
Online_Book_Store/
├── backend/                       # Modern Spring Boot 3 Backend
│   ├── pom.xml                    # Maven dependencies (JPA, Security, JJWT, MySQL)
│   └── src/main/
│       ├── java/com/booknook/
│       │   ├── BookstoreApplication.java
│       │   ├── config/            # Global Exception Handler, Data Seeder
│       │   ├── controller/        # Auth, Book, Cart, Wishlist, Checkout, Order, Admin, etc.
│       │   ├── dto/               # Request/Response Data Transfer Objects
│       │   ├── model/             # JPA Entities (User, Book, Order, Review, Address, etc.)
│       │   ├── repository/        # Spring Data JPA Repositories
│       │   └── security/          # JWT Util, Filter, and SecurityFilterChain
│       └── resources/
│           └── application.properties # Environment variables & DB connection
│
├── frontend/                      # Modern React 18 + Vite SPA
│   ├── package.json
│   ├── vite.config.js             # Proxies /api to http://localhost:8080
│   ├── index.html
│   └── src/
│       ├── index.css              # Editorial Design System tokens & responsive styling
│       ├── App.jsx                # Client-side router & route protection
│       ├── components/            # Navbar, Footer, BookCard, CartDrawer
│       ├── context/               # AuthContext, CartContext, WishlistContext
│       ├── pages/                 # 18 Storefront & Admin pages
│       └── services/api.js        # Axios-like Fetch client with JWT header injection
│
├── database/
│   └── booknook_complete_schema.sql # Complete MySQL DDL & all 173 seeded books
│
├── run_backend.bat                # 1-Click Windows launcher for Spring Boot
├── run_frontend.bat               # 1-Click Windows launcher for React Vite
├── LOCAL_RUN_GUIDE.md             # Complete step-by-step Windows setup guide
├── DEPLOYMENT_GUIDE.md            # Hostinger VPS / Linux Ubuntu deployment guide
│
└── src/main/                      # Preserved legacy Servlet/JSP codebase (for reference)
```

---

## 🚀 Quick Start (Local Windows)

### 1. Database Setup
Ensure MySQL is running, then run:
```cmd
mysql -u root -p < database\booknook_complete_schema.sql
```

### 2. Start Backend (Port 8080)
Double-click `run_backend.bat` or run:
```cmd
cd backend
mvn spring-boot:run
```

### 3. Start Frontend (Port 5173)
Double-click `run_frontend.bat` or run:
```cmd
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** in your web browser!

---

## 🔑 Default Test Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@booknook.com` | `Admin@123` | Full Admin Dashboard (`/admin`), Catalog CRUD, Order fulfillment |
| **Customer** | `customer@booknook.com` | `Customer@123` | Storefront, Cart, Wishlist, Address Book, Checkout, Order tracking |

---

## 📖 Detailed Documentation

- 📘 [Windows Local Run & Testing Guide](file:///c:/eclipsecodes/Online_Book_Store/LOCAL_RUN_GUIDE.md): Step-by-step setup, comprehensive testing plan, and troubleshooting common issues.
- 🚀 [Production Deployment Guide](file:///c:/eclipsecodes/Online_Book_Store/DEPLOYMENT_GUIDE.md): Complete guide for deploying to a Hostinger VPS with Nginx, Let's Encrypt SSL, Systemd, and MySQL hardening.