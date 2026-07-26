<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Wishlist</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="wishlistPage" data-page-title="Wishlist">
    <div class="container-fluid px-4 pb-5">
        <div class="account-card mb-4" data-aos="fade-up">
            <div class="account-card-header">
                <div>
                    <h3 class="mb-1">Saved Wishlist</h3>
                    <p class="text-muted mb-0">Your curated reading list is stored safely and synced with your account.</p>
                </div>
                <span class="account-chip"><i class="fas fa-heart"></i> Move to cart anytime</span>
            </div>
            <div class="account-card-body" id="wishlistContent"></div>
        </div>
    </div>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script src="../js/account.js"></script>
</body>
</html>
