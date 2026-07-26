<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · My Orders</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="ordersPage" data-page-title="My Orders">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4 mb-4">
            <div class="col-lg-8">
                <div class="account-card" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Account Center</div>
                            <h3 class="mb-1">Order History</h3>
                            <p class="page-subtitle mb-0">Track recent purchases, delivery updates, and support details in one streamlined dashboard.</p>
                        </div>
                        <span class="account-chip"><i class="fas fa-truck"></i> Live tracking</span>
                    </div>
                    <div class="account-card-body">
                        <div class="row g-3 align-items-center mb-4">
                            <div class="col-md-5">
                                <div class="input-group">
                                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-primary"></i></span>
                                    <input id="orderSearchInput" type="text" class="form-control border-start-0" placeholder="Search orders by ID, status, or item">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <select id="orderFilterSelect" class="form-select">
                                    <option value="all">All statuses</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select id="orderSortSelect" class="form-select">
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                </select>
                            </div>
                        </div>
                        <div id="ordersContent"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="summary-card mb-3" data-aos="fade-up" data-aos-delay="80">
                    <div class="summary-icon"><i class="fas fa-box-open"></i></div>
                    <div>
                        <div class="summary-value" id="ordersSummaryCount">0</div>
                        <div class="summary-label">Orders placed</div>
                    </div>
                </div>
                <div class="summary-card mb-3" data-aos="fade-up" data-aos-delay="100">
                    <div class="summary-icon"><i class="fas fa-clock"></i></div>
                    <div>
                        <div class="summary-value">Track progress</div>
                        <div class="summary-label">Order timelines and status</div>
                    </div>
                </div>
                <div class="summary-card" data-aos="fade-up" data-aos-delay="120">
                    <div class="summary-icon"><i class="fas fa-shipping-fast"></i></div>
                    <div>
                        <div class="summary-value">Fast dispatch</div>
                        <div class="summary-label">Reliable delivery updates</div>
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
