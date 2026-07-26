<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Order Details</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="orderDetailsPage" data-page-title="Order Details">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4">
            <div class="col-lg-8">
                <div class="account-card mb-4" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Order Summary</div>
                            <h3 class="mb-1">Order Details</h3>
                            <p class="page-subtitle mb-0">Review the full purchase, delivery status, and every item included in this shipment.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <div id="orderDetailContent" class="mb-4"></div>
                        <div id="orderItemsList"></div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="info-card p-4 mb-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="page-kicker">Order snapshot</div>
                    <h5 class="mb-2">Delivery & payment</h5>
                    <div id="orderMetaDetails" class="mb-3 text-muted small"></div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>Payment</span>
                        <strong id="paymentMethodLabel">Loading...</strong>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>Billing</span>
                        <strong id="billingAmount">₹0.00</strong>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>Expected delivery</span>
                        <strong id="deliveryEstimate">N/A</strong>
                    </div>
                    <a href="HelpCenter.jsp" class="btn account-btn-primary w-100 mt-3"><i class="fas fa-life-ring me-2"></i>Contact Support</a>
                </div>
                <div class="info-card p-4 mb-4" data-aos="fade-up" data-aos-delay="100">
                    <div class="page-kicker">Shipping address</div>
                    <div id="shippingAddressBlock" class="text-muted small"></div>
                </div>
                <div class="info-card p-4" data-aos="fade-up" data-aos-delay="120">
                    <div class="page-kicker">Need help?</div>
                    <h5 class="mb-2">Support for this order</h5>
                    <p class="page-subtitle mb-3">Reach out if anything looks incorrect or your shipment is delayed.</p>
                    <a href="HelpCenter.jsp" class="btn account-btn-primary w-100"><i class="fas fa-life-ring me-2"></i>Contact Support</a>
                </div>
            </div>
        </div>
    </div>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const params = new URLSearchParams(window.location.search);
            const orderId = params.get('orderId');
            if (!orderId) {
                document.getElementById('orderDetailContent').innerHTML = '<div class="text-danger">Order ID missing.</div>';
                return;
            }
            fetch('../OrdersServlet?action=detail&orderId=' + orderId)
                .then(res => res.ok ? res.json() : Promise.reject('Failed to load order details'))
                .then(data => {
                    if (!data.order) {
                        document.getElementById('orderDetailContent').innerHTML = '<div class="text-warning">Order not found.</div>';
                        return;
                    }
                    const order = data.order;
                    const detailHtml =
                        '<div class="mb-3">' +
                            '<span class="badge bg-info text-dark">Order #' + order.orderId + '</span>' +
                            '<span class="badge bg-secondary ms-2">' + order.status + '</span>' +
                        '</div>' +
                        '<div class="row g-3 mb-4">' +
                            '<div class="col-md-4"><strong>Placed</strong><div>' + order.orderedAt + '</div></div>' +
                            '<div class="col-md-4"><strong>Total</strong><div>₹' + Number(order.totalAmount).toFixed(2) + '</div></div>' +
                            '<div class="col-md-4"><strong>Tracking</strong><div>' + (order.trackingCode || 'N/A') + '</div></div>' +
                        '</div>';
                    document.getElementById('orderDetailContent').innerHTML = detailHtml;
                    const items = data.items || [];
                    if (items.length === 0) {
                        document.getElementById('orderItemsList').innerHTML = '<p class="text-muted">No items included in this order.</p>';
                        return;
                    }
                    document.getElementById('orderItemsList').innerHTML = items.map(function(item) {
                        return '<div class="card account-card mb-3 p-3 border-0">' +
                            '<div class="row g-3 align-items-center">' +
                                '<div class="col-3 col-md-2">' +
                                    '<img src="' + item.coverUrl + '" class="img-fluid rounded-3" alt="' + item.title + '">' +
                                '</div>' +
                                '<div class="col-9 col-md-8">' +
                                    '<h5 class="mb-1 text-white">' + item.title + '</h5>' +
                                    '<p class="mb-1 text-muted small">' + item.author + '</p>' +
                                    '<span class="badge bg-secondary">' + item.category + '</span>' +
                                '</div>' +
                                '<div class="col-12 col-md-2 text-end">' +
                                    '<div class="fw-semibold">₹' + item.unitPrice.toFixed(2) + '</div>' +
                                    '<div class="text-muted">Qty ' + item.quantity + '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                })
                .catch(err => {
                    document.getElementById('orderDetailContent').innerHTML = '<div class="text-danger">Unable to load order details.</div>';
                    console.error(err);
                });
        });
    </script>
</body>
</html>
