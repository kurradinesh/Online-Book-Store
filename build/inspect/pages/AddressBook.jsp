<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Address Book</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="addressBookPage" data-page-title="Address Book">
    <div class="container-fluid px-4 pb-5">
        <div class="account-card mb-4" data-aos="fade-up">
            <div class="account-card-header">
                <div>
                    <h3 class="mb-1">Address Book</h3>
                    <p class="text-muted mb-0">Keep your shipping addresses updated for fast checkout.</p>
                </div>
                <button class="btn account-btn-glow" type="button" onclick="showAddressForm()"><i class="fas fa-plus-circle me-2"></i>Add Address</button>
            </div>
            <div class="account-card-body">
                <div id="addressList"></div>
            </div>
        </div>
        <div class="account-card" data-aos="fade-up" data-aos-delay="80">
            <div class="account-card-header">
                <div>
                    <h5 id="addressFormTitle" class="mb-0">Add New Address</h5>
                </div>
            </div>
            <div class="account-card-body">
                <form id="addressForm" onsubmit="addAddress(event)">
                    <input type="hidden" name="addressId">
                    <div class="row g-3">
                        <div class="col-md-6"><label class="form-label">Label</label><input class="form-control" name="label" required></div>
                        <div class="col-md-6"><label class="form-label">Recipient</label><input class="form-control" name="recipient" required></div>
                        <div class="col-12"><label class="form-label">Address Line 1</label><input class="form-control" name="line1" required></div>
                        <div class="col-12"><label class="form-label">Address Line 2</label><input class="form-control" name="line2"></div>
                        <div class="col-md-4"><label class="form-label">City</label><input class="form-control" name="city" required></div>
                        <div class="col-md-4"><label class="form-label">State</label><input class="form-control" name="state" required></div>
                        <div class="col-md-4"><label class="form-label">Zip Code</label><input class="form-control" name="zip" required></div>
                        <div class="col-12"><label class="form-label">Country</label><input class="form-control" name="country" required></div>
                    </div>
                    <button id="addressSubmitButton" class="btn account-btn-glow mt-4" type="submit">Add Address</button>
                </form>
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
