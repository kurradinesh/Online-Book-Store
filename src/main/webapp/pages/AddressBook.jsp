<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Address Book</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
    <style>
        .address-card {
            border-radius: 16px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: #ffffff;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .address-card:hover { transform: translateY(-2px); box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); }
        .address-badge { font-size: 0.75rem; padding: 0.45rem 0.7rem; border-radius: 999px; }
    </style>
</head>
<body id="addressBookPage" data-page-title="Address Book">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4">
            <div class="col-lg-7">
                <div class="account-card" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <div class="page-kicker">Delivery</div>
                            <h3 class="mb-1">Address Book</h3>
                            <p class="page-subtitle mb-0">Save addresses for faster checkout and a smoother delivery experience.</p>
                        </div>
                        <button class="btn account-btn-primary" type="button" onclick="showAddressForm()"><i class="fas fa-plus-circle me-2"></i>Add Address</button>
                    </div>
                    <div class="account-card-body">
                        <div class="mb-3">
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-primary"></i></span>
                                <input id="addressSearchInput" type="text" class="form-control border-start-0" placeholder="Search address by city, label or PIN code">
                            </div>
                        </div>
                        <div id="addressList"></div>
                        <div id="addressEmptyState" class="text-center py-5 d-none">
                            <div class="mb-3"><i class="fas fa-map-marker-alt fa-3x text-muted"></i></div>
                            <h5 class="mb-2">No addresses saved yet</h5>
                            <p class="text-muted">Add an address to speed up checkout and delivery.</p>
                            <button class="btn account-btn-primary" type="button" onclick="showAddressForm()">Add Your First Address</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="account-card" data-aos="fade-up" data-aos-delay="80">
                    <div class="account-card-header">
                        <div>
                            <h5 id="addressFormTitle" class="mb-0">Add New Address</h5>
                            <small class="text-muted">Save your delivery preferences and instructions.</small>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <form id="addressForm" onsubmit="addAddress(event)" class="row g-3 needs-validation" novalidate>
                            <input type="hidden" name="addressId">
                            <div class="col-md-6">
                                <label class="form-label">Label</label>
                                <input class="form-control" name="label" required placeholder="e.g. Home, Office">
                                <div class="invalid-feedback">Enter a label such as Home or Office.</div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Recipient Name</label>
                                <input class="form-control" name="recipient" required placeholder="Full Name">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Street Address (Line 1)</label>
                                <input class="form-control" name="line1" required placeholder="Flat, House no., Building, Company, Apartment">
                            </div>
                            <div class="col-12">
                                <label class="form-label">Street Address (Line 2)</label>
                                <input class="form-control" name="line2" placeholder="Area, Colony, Road, Landmark (Optional)">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">City</label>
                                <input class="form-control" name="city" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">State</label>
                                <input class="form-control" name="state" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">PIN Code</label>
                                <input class="form-control" name="zip" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Country</label>
                                <input class="form-control" name="country" required>
                            </div>
                            <div class="col-12 d-flex gap-2 flex-wrap">
                                <button id="addressSubmitButton" class="btn account-btn-primary" type="submit">Save Address</button>
                                <button class="btn btn-outline-secondary" type="button" onclick="document.getElementById('addressForm').reset(); document.getElementById('addressFormTitle').textContent = 'Add New Address'; document.getElementById('addressSubmitButton').textContent = 'Save Address';">Cancel</button>
                            </div>
                        </form>
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
