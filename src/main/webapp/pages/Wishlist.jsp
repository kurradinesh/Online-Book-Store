<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Wishlist</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="wishlistPage" data-page-title="Wishlist">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4 mb-4">
            <div class="col-lg-8">
                <div class="account-card" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Saved for Later</div>
                            <h3 class="mb-1">Wishlist</h3>
                            <p class="page-subtitle mb-0">Build a personal collection of books you want to revisit, compare, or buy later.</p>
                        </div>
                        <span class="account-chip"><i class="fas fa-heart"></i> One-click cart moves</span>
                    </div>
                    <div class="account-card-body">
                        <div class="row g-3 align-items-center mb-4">
                            <div class="col-md-8">
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-primary"></i></span>
                                    <input id="wishlistSearchInput" type="text" class="form-control border-start-0" placeholder="Search by title, author, or tag">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <select id="wishlistSortSelect" class="form-select">
                                    <option value="recent">Recently added</option>
                                    <option value="price_low">Price low to high</option>
                                    <option value="price_high">Price high to low</option>
                                </select>
                            </div>
                        </div>
                        <div id="wishlistContent"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="summary-card mb-3" data-aos="fade-up" data-aos-delay="80">
                    <div class="summary-icon"><i class="fas fa-heart"></i></div>
                    <div>
                        <div class="summary-value">Curated picks</div>
                        <div class="summary-label">Keep your favorite titles ready</div>
                    </div>
                </div>
                <div class="summary-card p-4" data-aos="fade-up" data-aos-delay="100">
                    <div class="page-kicker">Recommendations</div>
                    <p class="page-subtitle small mb-3">Authors and titles based on your wishlist activity.</p>
                    <ul class="list-unstyled mb-0">
                        <li class="mb-2"><strong>J. K. Rowling</strong><br><span class="text-muted small">Fantasy & adventure</span></li>
                        <li class="mb-2"><strong>Paulo Coelho</strong><br><span class="text-muted small">Inspirational stories</span></li>
                        <li><strong>Malcolm Gladwell</strong><br><span class="text-muted small">Business & psychology</span></li>
                    </ul>
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
