<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.sql.*" %>
<%@ page import="com.booknook.util.DBConnection" %>
<%
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    String membership = (String) session.getAttribute("membership");
    String lastLogin = (String) session.getAttribute("lastLogin");
    String userPhoto = (String) session.getAttribute("userPhoto");
    
    if (userEmail == null || userEmail.trim().isEmpty()) {
        response.sendRedirect("../login.html");
        return;
    }

    int totalOrders = 0;
    int wishlistCount = 0;
    int cartCount = 0;
    int addressCount = 0;

    // Retrieve live details and counts from Database
    try (Connection conn = DBConnection.getConnection()) {
        // 1. Retrieve name, avatar, and updates
        String sqlUser = "SELECT name, avatar_url FROM users WHERE email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sqlUser)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    userName = rs.getString("name");
                    userPhoto = rs.getString("avatar_url");
                    session.setAttribute("userName", userName);
                    session.setAttribute("userPhoto", userPhoto);
                }
            }
        }

        // 2. Wishlist count
        String sqlWishlist = "SELECT COUNT(*) FROM wishlist WHERE user_email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sqlWishlist)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) wishlistCount = rs.getInt(1);
            }
        }

        // 3. Cart count (sum of quantities)
        String sqlCart = "SELECT COALESCE(SUM(quantity), 0) FROM cart WHERE user_email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sqlCart)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) cartCount = rs.getInt(1);
            }
        }

        // 4. Total orders count
        String sqlOrders = "SELECT COUNT(*) FROM orders WHERE user_email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sqlOrders)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) totalOrders = rs.getInt(1);
            }
        }

        // 5. Address count
        String sqlAddresses = "SELECT COUNT(*) FROM addresses WHERE user_email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sqlAddresses)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) addressCount = rs.getInt(1);
            }
        }
        
        // Sync back to session
        session.setAttribute("wishlistCount", wishlistCount);
        session.setAttribute("cartCount", cartCount);
        session.setAttribute("totalOrders", totalOrders);
        session.setAttribute("addressCount", addressCount);

    } catch (Exception e) {
        e.printStackTrace();
    }

    if (membership == null || membership.trim().isEmpty()) {
        membership = "Regular";
    }
    if (lastLogin == null || lastLogin.trim().isEmpty()) {
        lastLogin = "Today";
    }
    
    String initials = "UN";
    if (userName != null && !userName.trim().isEmpty()) {
        String[] parts = userName.trim().split("\\s+");
        if (parts.length >= 2) {
            initials = (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
        } else {
            initials = parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
    }
%>
<nav class="navbar navbar-expand-lg navbar-dark account-navbar shadow-sm py-3">
    <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-3" href="../index.html">
            <span class="account-logo-avatar">BK</span>
            <div>
                <div class="account-brand-title">BOOKNOOK Account</div>
                <div class="account-brand-subtitle">Premium account dashboard</div>
            </div>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#accountMenuNav" aria-controls="accountMenuNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="accountMenuNav">
            <ul class="navbar-nav ms-auto align-items-center gap-2">
                <li class="nav-item">
                    <button class="btn btn-link nav-link px-2" id="accountThemeToggle" aria-label="Toggle Dark Mode" aria-pressed="false" style="border: none; background: none; box-shadow: none;">
                        <i class="fas fa-moon"></i>
                    </button>
                </li>
                <li class="nav-item d-none d-lg-inline">
                    <button class="btn btn-soft-light btn-sm" onclick="history.back()"><i class="fas fa-arrow-left me-2"></i>Back</button>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="../index.html"><i class="fas fa-home"></i> Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="MyOrders.jsp"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 px-3" href="#" id="accountMenuDropdown" role="button" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                        <span class="avatar-badge"> <%= initials %> </span>
                        <div class="d-none d-lg-block text-start">
                            <div class="text-white fw-bold small mb-0"><%= userName != null ? userName : "BookNook Reader" %></div>
                            <div class="text-muted small"><%= userEmail %></div>
                        </div>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end rounded-4 shadow-lg border-0 account-nav-dropdown" aria-labelledby="accountMenuDropdown">
                        <li><a class="dropdown-item" href="MyOrders.jsp"><i class="fas fa-box-open me-2"></i>My Orders</a></li>
                        <li><a class="dropdown-item" href="Wishlist.jsp"><i class="fas fa-heart me-2"></i>Wishlist</a></li>
                        <li><a class="dropdown-item" href="Cart.jsp"><i class="fas fa-shopping-cart me-2"></i>Shopping Cart</a></li>
                        <li><a class="dropdown-item" href="AccountSettings.jsp"><i class="fas fa-user-cog me-2"></i>Account Settings</a></li>
                        <li><a class="dropdown-item" href="AddressBook.jsp"><i class="fas fa-map-marker-alt me-2"></i>Address Book</a></li>
                        <li><a class="dropdown-item" href="HelpCenter.jsp"><i class="fas fa-life-ring me-2"></i>Help Center</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="../LogoutServlet"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>
<div class="container-fluid px-4 mb-4">
    <div class="row g-3 align-items-center">
        <div class="col-lg-7">
            <div class="border rounded-4 bg-white shadow-sm p-4 h-100">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="position-relative">
                        <% if (userPhoto != null && !userPhoto.trim().isEmpty()) { %>
                            <img src="<%= userPhoto %>" class="rounded-circle" alt="Profile photo" style="width:72px;height:72px;object-fit:cover;" />
                        <% } else { %>
                            <div class="avatar-badge" style="width:72px;height:72px;font-size:1.4rem;"> <%= initials %> </div>
                        <% } %>
                        <span class="badge bg-success position-absolute top-0 start-100 translate-middle rounded-pill" style="font-size:0.75rem;"> <%= membership %> </span>
                    </div>
                    <div>
                        <div class="text-uppercase text-muted small mb-1">Welcome back,</div>
                        <h5 class="mb-1"><%= userName != null ? userName : "Valued Reader" %></h5>
                        <p class="mb-0 text-muted"><%= userEmail %> · Last login: <%= lastLogin %></p>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-sm-6 col-xl-3">
                        <div class="border rounded-3 p-3 text-center bg-body-tertiary">
                            <div class="text-muted small">Total Orders</div>
                            <div class="fw-semibold fs-5"><%= totalOrders %></div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="border rounded-3 p-3 text-center bg-body-tertiary">
                            <div class="text-muted small">Wishlist</div>
                            <div class="fw-semibold fs-5"><%= wishlistCount %></div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="border rounded-3 p-3 text-center bg-body-tertiary">
                            <div class="text-muted small">Cart Items</div>
                            <div class="fw-semibold fs-5"><%= cartCount %></div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="border rounded-3 p-3 text-center bg-body-tertiary">
                            <div class="text-muted small">Saved Addresses</div>
                            <div class="fw-semibold fs-5"><%= addressCount %></div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 d-flex flex-wrap gap-2">
                    <a href="MyOrders.jsp" class="btn btn-outline-primary btn-sm">View Orders</a>
                    <a href="Wishlist.jsp" class="btn btn-outline-secondary btn-sm">View Wishlist</a>
                    <a href="Cart.jsp" class="btn btn-outline-success btn-sm">Open Cart</a>
                    <a href="AddressBook.jsp" class="btn btn-outline-info btn-sm">Manage Addresses</a>
                </div>
            </div>
        </div>
        <div class="col-lg-5">
            <div class="border rounded-4 bg-white shadow-sm p-4 h-100">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <div class="text-uppercase text-muted small">Account Health</div>
                        <h5 class="mb-0">Profile completion</h5>
                    </div>
                    <span class="badge bg-warning text-dark">84%</span>
                </div>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: 84%;" aria-valuenow="84" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="mt-4">
                    <div class="d-flex align-items-center justify-content-between mb-2"><span class="text-muted">Verified email</span><span class="text-success"><i class="fas fa-check-circle me-1"></i>Completed</span></div>
                    <div class="d-flex align-items-center justify-content-between mb-2"><span class="text-muted">Saved address</span><span class="text-secondary">Add more</span></div>
                    <div class="d-flex align-items-center justify-content-between mb-2"><span class="text-muted">Payment setup</span><span class="text-success"><i class="fas fa-check-circle me-1"></i>Ready</span></div>
                </div>
                <div class="mt-4">
                    <div class="text-uppercase text-muted small mb-2">Quick actions</div>
                    <div class="d-grid gap-2">
                        <a href="AccountSettings.jsp" class="btn btn-outline-primary btn-sm">Edit Profile</a>
                        <a href="AddressBook.jsp" class="btn btn-outline-secondary btn-sm">Update Address Book</a>
                        <a href="HelpCenter.jsp" class="btn btn-outline-success btn-sm">Contact Support</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="account-breadcrumb px-4 py-3 mb-4 rounded-4 shadow-sm bg-body-tertiary">
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
        <div>
            <div class="text-uppercase text-muted small">Account Navigation</div>
            <h2 class="mb-0" id="pageTitle">Dashboard</h2>
        </div>
        <div class="d-flex flex-wrap gap-2 align-items-center">
            <button class="btn btn-outline-secondary btn-sm" onclick="history.back()"><i class="fas fa-arrow-left me-2"></i>Previous</button>
            <a href="../index.html" class="btn btn-outline-primary btn-sm"><i class="fas fa-home me-2"></i>Home</a>
            <a href="MyOrders.jsp" class="btn btn-outline-success btn-sm"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a>
        </div>
    </div>
</div>

<!-- Shared Book Preview Modal -->
<div class="modal fade animate__animated" id="bookModal" tabindex="-1" aria-labelledby="bookModalLabel" aria-hidden="true" style="backdrop-filter: blur(8px);">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow-lg text-white" style="background: linear-gradient(135deg, rgba(29, 39, 44, 0.98), rgba(21, 28, 31, 0.98)); border-top: 6px solid var(--accent, #2563EB) !important;">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title" id="bookModalLabel">Book Preview</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modalBody">
                <div class="text-center py-4">
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

