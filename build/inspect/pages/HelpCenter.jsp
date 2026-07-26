<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Help Center</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
</head>
<body id="helpCenterPage" data-page-title="Help Center">
    <div class="container-fluid px-4 pb-5">
        <div class="row gx-4">
            <div class="col-lg-7">
                <div class="account-card mb-4" data-aos="fade-up">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">FAQ</h3>
                            <p class="text-muted mb-0">Answers to common questions for a smooth shopping experience.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <div class="accordion" id="faqAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="faqOne">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">How do I track my order?</button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body text-muted">Visit My Orders and click the "Track Order" button associated with your purchase to see the latest status.</div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="faqTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">Can I change my delivery address?</button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body text-muted">Yes, update your default shipping address in Address Book before placing a new order.</div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="faqThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">How do I get help with an issue?</button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                    <div class="accordion-body text-muted">Submit a request using the contact support form below and our team will follow up within 24 hours.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-5">
                <div class="account-card mb-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">Contact Support</h3>
                            <p class="text-muted mb-0">Send a support request directly from your account.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <form id="contactSupportForm">
                            <div class="mb-3"><label class="form-label">Subject</label><input class="form-control" name="subject" required></div>
                            <div class="mb-3"><label class="form-label">Message</label><textarea class="form-control" name="message" rows="4" required></textarea></div>
                            <button class="btn account-btn-glow w-100" type="submit">Contact Support</button>
                        </form>
                    </div>
                </div>
                <div class="account-card" data-aos="fade-up" data-aos-delay="120">
                    <div class="account-card-header">
                        <div>
                            <h3 class="mb-1">Report Issue</h3>
                            <p class="text-muted mb-0">Submit a bug or order issue for review.</p>
                        </div>
                    </div>
                    <div class="account-card-body">
                        <form id="reportIssueForm">
                            <div class="mb-3"><label class="form-label">Issue Type</label><select class="form-select" name="issueType" required><option value="order">Order problem</option><option value="payment">Payment issue</option><option value="account">Account issue</option><option value="other">Other</option></select></div>
                            <div class="mb-3"><label class="form-label">Details</label><textarea class="form-control" name="details" rows="4" required></textarea></div>
                            <button class="btn account-btn-glow w-100" type="submit">Report Issue</button>
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
