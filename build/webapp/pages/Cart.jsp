<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Shopping Cart</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="cartPage" data-page-title="Shopping Cart">
    <div class="container-fluid px-4 pb-5">
        <div class="row gx-4">
            <div class="col-lg-8">
                <div class="account-card mb-4" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">Shopping Cart</h3>
                            <p class="text-muted mb-0">Manage your selections and preview the total before checkout.</p>
                        </div>
                        <span class="account-chip"><i class="fas fa-shopping-cart"></i> Instant updates</span>
                    </div>
                    <div class="account-card-body" id="cartContent"></div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="account-card account-summary-card mb-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="account-card-header">
                        <h5 class="mb-0">Cart Summary</h5>
                    </div>
                    <div class="account-card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <span>Subtotal</span>
                            <strong id="cartSubtotal">₹0.00</strong>
                        </div>
                        <p class="text-muted small">Taxes and shipping calculated at checkout.</p>
                        <button class="btn account-btn-glow w-100" onclick="window.location.href='MyOrders.jsp'">Proceed to Checkout</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script src="../js/account.js"></script>
</body>
</html>
