<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    if (userEmail == null || userEmail.trim().isEmpty()) {
        response.sendRedirect("../login.html");
        return;
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
                    <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" id="accountMenuDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <span class="avatar-badge"> <%= initials %> </span>
                        <div class="d-none d-lg-block text-start">
                            <div class="text-white fw-bold small mb-0"><%= userName != null ? userName : "BookNook Reader" %></div>
                            <div class="text-muted small"><%= userEmail %></div>
                        </div>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end rounded-4 shadow-lg border-0" aria-labelledby="accountMenuDropdown">
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
