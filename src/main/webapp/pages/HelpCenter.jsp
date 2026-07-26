<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ include file="accountHeader.jsp" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BOOKNOOK · Help Center</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-t6agcN+FgvxwtzOkw0KI+HcBNsQw+uOeQf7uD8yyqVcC3VwY2hZ3lY5yjui3Kog/9D1ZVoE5PZm6N+GpD1u4kg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.4/dist/aos.css" />
    <link rel="stylesheet" href="../css/account.css">
    <style>
        .help-hero {
            background: linear-gradient(180deg, #ffffff 0%, #f4f7ff 100%);
            border: 1px solid rgba(37, 99, 235, 0.12);
            padding: 2rem;
            border-radius: 24px;
        }
        .help-hero .hero-title {
            font-size: clamp(2rem, 3.2vw, 3.2rem);
            letter-spacing: -0.03em;
            line-height: 1.05;
        }
        .help-hero .hero-subtitle {
            color: #475569;
            max-width: 680px;
        }
        .help-search-group .form-control {
            min-height: 56px;
            box-shadow: 0 14px 40px rgba(37, 99, 235, 0.08);
        }
        .help-search-group .btn {
            min-width: 140px;
        }
        .ai-summary-card {
            border: 1px solid rgba(37, 99, 235, 0.16);
            background: #ffffff;
        }
        .ai-summary-card .icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 18px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: rgba(37, 99, 235, 0.12);
            color: #2563eb;
            font-size: 1.3rem;
        }
        .help-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
        }
        .help-card {
            min-height: 140px;
            border-radius: 20px;
            border: 1px solid rgba(15, 23, 42, 0.08);
            background: #ffffff;
            transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
            padding: 1.35rem;
        }
        .help-card:hover {
            transform: translateY(-4px);
            border-color: rgba(37, 99, 235, 0.18);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }
        .help-card .help-icon {
            width: 44px;
            height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: rgba(37, 99, 235, 0.1);
            color: #2563eb;
            margin-bottom: 1rem;
        }
        .help-topic-card {
            border-radius: 18px;
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: #ffffff;
            transition: transform 0.25s ease, border-color 0.25s ease;
            padding: 1rem 1rem;
            cursor: pointer;
        }
        .help-topic-card:hover {
            transform: translateY(-3px);
            border-color: rgba(37, 99, 235, 0.2);
            background: #f8fbff;
        }
        .help-topic-card small {
            color: #64748b;
        }
        .ai-widget {
            position: fixed;
            right: 1.5rem;
            bottom: 1.5rem;
            width: min(400px, calc(100% - 2rem));
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
            z-index: 1100;
            display: none;
            background: #ffffff;
        }
        .ai-widget.open {
            display: flex;
            flex-direction: column;
        }
        .ai-window-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.2rem;
            background: #0f172a;
            color: #ffffff;
        }
        .ai-window-header .ai-title {
            font-size: 1rem;
            font-weight: 700;
        }
        .ai-chat-body {
            display: flex;
            flex-direction: column;
            min-height: 420px;
            background: #f8fafc;
        }
        .ai-chat-history {
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            flex: 1;
        }
        .chat-bubble {
            max-width: 88%;
            border-radius: 22px;
            padding: 0.95rem 1rem;
            position: relative;
            display: inline-flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .chat-bubble--user {
            align-self: flex-end;
            background: #2563eb;
            color: #ffffff;
            border-bottom-right-radius: 6px;
        }
        .chat-bubble--ai {
            align-self: flex-start;
            background: #ffffff;
            color: #0f172a;
            border: 1px solid rgba(148, 163, 184, 0.22);
            border-bottom-left-radius: 6px;
        }
        .chat-meta {
            font-size: 0.78rem;
            color: #64748b;
        }
        .typing-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.85rem 1rem;
            background: #eef2ff;
            border-radius: 18px;
            border: 1px solid rgba(37, 99, 235, 0.12);
            color: #0f172a;
        }
        .typing-indicator span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563eb;
            animation: typingDots 1.2s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingDots {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
            40% { transform: translateY(-4px); opacity: 1; }
        }
        .ai-chat-footer {
            padding: 1rem 1rem 1.2rem;
            background: #ffffff;
            border-top: 1px solid rgba(226, 232, 240, 0.9);
        }
        .ai-chat-footer .form-control {
            border-radius: 999px;
        }
        .ai-floating-btn {
            position: fixed;
            right: 1.5rem;
            bottom: 1.5rem;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #2563eb;
            color: #ffffff;
            border: none;
            box-shadow: 0 20px 40px rgba(37, 99, 235, 0.25);
            z-index: 1090;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .help-section-title {
            letter-spacing: -0.02em;
            margin-bottom: 1rem;
        }
        .help-card-footer {
            margin-top: 1rem;
            font-size: 0.95rem;
            color: #64748b;
        }
        .support-shortcut {
            border-radius: 18px;
            border: 1px solid rgba(148, 163, 184, 0.15);
            background: #ffffff;
            padding: 1rem;
            transition: transform 0.25s ease;
        }
        .support-shortcut:hover { transform: translateY(-2px); }
        .support-shortcut .title { font-weight: 700; }
        .support-shortcut .description { color: #64748b; }
        .feedback-stars button {
            border: none;
            background: transparent;
            color: #cbd5e1;
            font-size: 1.3rem;
            transition: color 0.2s ease;
        }
        .feedback-stars button.active,
        .feedback-stars button:hover { color: #f59e0b; }
        .footer-links a { color: #475569; text-decoration: none; }
        .footer-links a:hover { color: #0f172a; text-decoration: underline; }
        @media (max-width: 991px) {
            .ai-widget { right: 1rem; bottom: 1rem; }
            .ai-floating-btn { right: 1rem; bottom: 1rem; }
        }
    </style>
</head>
<body id="helpCenterPage" data-page-title="Help Center">
    <div class="container-fluid px-4 pb-5 page-shell">
        <div class="row gx-4 gy-4">
            <div class="col-xl-8">
                <div class="account-card help-hero" data-aos="fade-up">
                    <div class="page-kicker">Customer Help Center</div>
                    <h1 class="hero-title mb-3">We're here to help you 24/7.</h1>
                    <p class="hero-subtitle mb-4">Search for answers, chat with AI, or contact our support team for fast and friendly help.</p>
                    <div class="row g-3 align-items-center help-search-group mb-4">
                        <div class="col-md-8">
                            <div class="input-group shadow-sm">
                                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-primary"></i></span>
                                <input id="helpSearchInput" type="text" class="form-control border-start-0" placeholder="Search help topics, orders, payments or account issues" aria-label="Search help topics">
                            </div>
                        </div>
                        <div class="col-md-4 d-flex gap-2">
                            <button id="helpSearchBtn" type="button" class="btn account-btn-primary w-100">Search Help</button>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-3 align-items-center">
                        <button id="openAiAssistantBtn" type="button" class="btn account-btn-primary"><i class="fas fa-robot me-2"></i> AI Assistant</button>
                        <button type="button" class="btn btn-outline-secondary" data-help-target="contactSection"><i class="fas fa-headset me-2"></i> Contact Support</button>
                    </div>
                </div>
            </div>
            <div class="col-xl-4">
                <div class="account-card ai-summary-card p-4 h-100" data-aos="fade-up" data-aos-delay="80">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="icon-circle"><i class="fas fa-robot"></i></div>
                        <div>
                            <div class="text-uppercase text-primary small mb-1">BookHub AI Assistant</div>
                            <h4 class="mb-0">Hello 👋 I can help you with:</h4>
                        </div>
                    </div>
                    <ul class="list-unstyled mb-0 text-muted" style="column-count: 2; column-gap: 1.5rem;">
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Orders</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Payments</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Delivery</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Refunds</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Returns</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Login Issues</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Account Problems</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Wishlist</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Cart</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Address</li>
                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i>Password Reset</li>
                    </ul>
                    <div class="mt-4">
                        <div class="d-grid gap-2">
                            <button id="openAiAssistantBtnSecondary" type="button" class="btn account-btn-primary">Open AI Chat</button>
                            <button type="button" class="btn btn-outline-secondary" data-help-target="supportCardsSection">Explore Support</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row gx-4 gy-4 mt-1">
            <div class="col-12">
                <div class="account-card p-4" data-aos="fade-up" data-aos-delay="120">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <div class="page-kicker">Quick Help</div>
                            <h3 class="help-section-title mb-0">Fast access to common support topics</h3>
                        </div>
                        <div><small class="text-muted">Tap a card to jump to the right section</small></div>
                    </div>
                    <div class="help-card-grid">
                        <button type="button" class="help-card text-start" data-help-target="ordersSection"><div class="help-icon"><i class="fas fa-box"></i></div><h5>Track Order</h5><p class="mb-0 text-muted">View order status and shipment updates.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="paymentSection"><div class="help-icon"><i class="fas fa-credit-card"></i></div><h5>Payment Issues</h5><p class="mb-0 text-muted">Resolve failed transactions quickly.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="deliverySection"><div class="help-icon"><i class="fas fa-truck"></i></div><h5>Delivery Status</h5><p class="mb-0 text-muted">Get delivery estimates and updates.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="returnsSection"><div class="help-icon"><i class="fas fa-undo"></i></div><h5>Return Order</h5><p class="mb-0 text-muted">Start a return request for eligible books.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="refundSection"><div class="help-icon"><i class="fas fa-money-bill-wave"></i></div><h5>Refund Status</h5><p class="mb-0 text-muted">Track refund processing progress.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="wishlistSection"><div class="help-icon"><i class="fas fa-heart"></i></div><h5>Wishlist Help</h5><p class="mb-0 text-muted">Manage saved books and reminders.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="cartSection"><div class="help-icon"><i class="fas fa-shopping-cart"></i></div><h5>Shopping Cart</h5><p class="mb-0 text-muted">Review items before checkout.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="accountSection"><div class="help-icon"><i class="fas fa-user-cog"></i></div><h5>Account Settings</h5><p class="mb-0 text-muted">Update profile and preferences.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="addressSection"><div class="help-icon"><i class="fas fa-map-marker-alt"></i></div><h5>Address Book</h5><p class="mb-0 text-muted">Edit or add delivery addresses.</p></button>
                        <button type="button" class="help-card text-start" data-help-target="loginSection"><div class="help-icon"><i class="fas fa-lock"></i></div><h5>Login & Password</h5><p class="mb-0 text-muted">Access and reset credentials.</p></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row gx-4 gy-4 mt-1">
            <div class="col-12 d-none">
                <div id="ordersSection"></div>
                <div id="paymentSection"></div>
                <div id="deliverySection"></div>
                <div id="returnsSection"></div>
                <div id="refundSection"></div>
                <div id="wishlistSection"></div>
                <div id="cartSection"></div>
                <div id="accountSection"></div>
                <div id="addressSection"></div>
                <div id="loginSection"></div>
                <div id="shippingSection"></div>
            </div>
            <div class="col-xl-7">
                <div class="account-card p-4" id="popularTopicsSection" data-aos="fade-up">
                    <div class="page-kicker">Popular Help Topics</div>
                    <h3 class="help-section-title">Most searched support requests</h3>
                    <div class="row g-3">
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="ordersSection"><strong>My Orders</strong><br><small>Track orders, invoices and delivery updates.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="paymentSection"><strong>Payment Failed</strong><br><small>Retry or verify your checkout information.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="ordersSection"><strong>Cancel Order</strong><br><small>Cancel eligible orders before shipment.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="returnsSection"><strong>Return Book</strong><br><small>Request returns for damaged or unwanted books.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="refundSection"><strong>Refund Policy</strong><br><small>Learn how and when refunds are processed.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="shippingSection"><strong>Shipping Policy</strong><br><small>Review shipping terms and delivery zones.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="deliverySection"><strong>Delivery Time</strong><br><small>Estimate delivery windows for your order.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="paymentSection"><strong>Coupons</strong><br><small>Apply promo codes at checkout.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="accountSection"><strong>Account Recovery</strong><br><small>Restore access to your account safely.</small></button></div>
                        <div class="col-sm-6"><button type="button" class="help-topic-card w-100 text-start" data-help-target="supportCardsSection"><strong>Gift Cards</strong><br><small>Redeem or check gift card balances.</small></button></div>
                    </div>
                </div>
                <div class="account-card p-4 mt-4" id="faqSection" data-aos="fade-up" data-aos-delay="80">
                    <div class="page-kicker">FAQ</div>
                    <h3 class="help-section-title">Frequently asked questions</h3>
                    <div class="accordion" id="faqAccordion">
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqOne">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">How do I place an order?</button>
                            </h2>
                            <div id="collapseOne" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Browse books, add items to your cart, and proceed to checkout with your preferred payment method.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqTwo">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">How do I cancel an order?</button>
                            </h2>
                            <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Visit My Orders and choose the cancel option before your order ships.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqThree">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">How do I return a product?</button>
                            </h2>
                            <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Open the return request from your order details and follow the instructions for eligible items.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqFour">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">How do I change my password?</button>
                            </h2>
                            <div id="collapseFour" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Use the Forgot Password page or update credentials from Account Settings.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqFive">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFive">How do I update my address?</button>
                            </h2>
                            <div id="collapseFive" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Edit your saved delivery addresses in Address Book before placing a new order.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqSix">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSix">How do I contact support?</button>
                            </h2>
                            <div id="collapseSix" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Use the contact cards below, chat with AI, or submit a request using our support forms.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqSeven">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSeven">How long does shipping take?</button>
                            </h2>
                            <div id="collapseSeven" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Shipping typically takes 2–7 business days depending on location and service selected.</div>
                            </div>
                        </div>
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="faqEight">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEight">How do I apply coupons?</button>
                            </h2>
                            <div id="collapseEight" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                <div class="accordion-body text-muted">Enter your coupon code at checkout to apply discounts before payment.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-xl-5">
                <div class="account-card p-4" id="contactSection" data-aos="fade-up" data-aos-delay="100">
                    <div class="page-kicker">Contact Support</div>
                    <h3 class="help-section-title">Reach our support team</h3>
                    <div class="row g-3">
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>Email Support</strong><p class="mb-0 text-muted">support@bookhub.com</p></div><i class="fas fa-envelope fa-lg text-primary"></i></div></div></div>
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>Phone Support</strong><p class="mb-0 text-muted">+91-9876543210</p></div><i class="fas fa-phone fa-lg text-success"></i></div></div></div>
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>Live Chat</strong><p class="mb-0 text-muted">Instant help with the AI assistant.</p></div><i class="fas fa-comments fa-lg text-info"></i></div></div></div>
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>WhatsApp Support</strong><p class="mb-0 text-muted">Demo support available for quick replies.</p></div><i class="fab fa-whatsapp fa-lg text-success"></i></div></div></div>
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>Business Hours</strong><p class="mb-0 text-muted">Mon - Sun, 9:00 AM - 8:00 PM</p></div><i class="fas fa-business-time fa-lg text-warning"></i></div></div></div>
                        <div class="col-12"><div class="support-shortcut"><div class="d-flex align-items-center justify-content-between mb-2"><div><strong>Emergency Contact</strong><p class="mb-0 text-muted">Available for urgent account issues.</p></div><i class="fas fa-exclamation-triangle fa-lg text-danger"></i></div></div></div>
                    </div>
                </div>
                <div class="account-card p-4 mt-4" data-aos="fade-up" data-aos-delay="110">
                    <div class="page-kicker">Quick Request</div>
                    <h3 class="help-section-title">Need immediate support?</h3>
                    <form id="contactSupportForm">
                        <div class="mb-3"><label class="form-label">Subject</label><input class="form-control" name="subject" placeholder="Support request subject" required></div>
                        <div class="mb-3"><label class="form-label">Message</label><textarea class="form-control" name="message" rows="4" placeholder="How can we help you?" required></textarea></div>
                        <button class="btn account-btn-primary w-100" type="submit">Contact Support</button>
                    </form>
                </div>
                <div class="account-card p-4 mt-4" data-aos="fade-up" data-aos-delay="120">
                    <div class="page-kicker">Escalation</div>
                    <h3 class="help-section-title">Report a problem</h3>
                    <form id="reportIssueForm">
                        <div class="mb-3"><label class="form-label">Issue Type</label><select class="form-select" name="issueType" required><option value="order">Order problem</option><option value="payment">Payment issue</option><option value="account">Account issue</option><option value="other">Other</option></select></div>
                        <div class="mb-3"><label class="form-label">Details</label><textarea class="form-control" name="details" rows="4" placeholder="Describe the issue" required></textarea></div>
                        <button class="btn account-btn-primary w-100" type="submit">Report Issue</button>
                    </form>
                </div>
                <div class="account-card p-4 mt-4" id="raiseTicketSection" data-aos="fade-up" data-aos-delay="130">
                    <div class="page-kicker">Raise Ticket</div>
                    <h3 class="help-section-title">Submit a support ticket</h3>
                    <form id="raiseTicketForm">
                        <div class="row g-3">
                            <div class="col-sm-6"><label class="form-label">Name</label><input class="form-control" name="ticketName" placeholder="Your full name" required></div>
                            <div class="col-sm-6"><label class="form-label">Email</label><input type="email" class="form-control" name="ticketEmail" placeholder="name@example.com" required></div>
                            <div class="col-sm-6"><label class="form-label">Phone</label><input class="form-control" name="ticketPhone" placeholder="+91 98765 43210" required></div>
                            <div class="col-sm-6"><label class="form-label">Category</label><select class="form-select" name="ticketCategory" required><option value="orders">Orders</option><option value="payment">Payments</option><option value="delivery">Delivery</option><option value="returns">Returns</option><option value="account">Account</option></select></div>
                            <div class="col-sm-6"><label class="form-label">Priority</label><select class="form-select" name="ticketPriority" required><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
                            <div class="col-sm-6"><label class="form-label">Subject</label><input class="form-control" name="ticketSubject" placeholder="Issue subject" required></div>
                            <div class="col-12"><label class="form-label">Description</label><textarea class="form-control" name="ticketDescription" rows="4" placeholder="Describe your issue in detail" required></textarea></div>
                            <div class="col-12"><label class="form-label">Attachment</label><input class="form-control" type="file" name="ticketAttachment"></div>
                            <div class="col-12"><button type="submit" class="btn account-btn-primary w-100">Submit Ticket</button></div>
                        </div>
                    </form>
                </div>
                <div class="account-card p-4 mt-4" id="trackComplaintSection" data-aos="fade-up" data-aos-delay="140">
                    <div class="page-kicker">Track Complaint</div>
                    <h3 class="help-section-title mb-3">Check complaint status</h3>
                    <form id="trackComplaintForm" class="row g-3">
                        <div class="col-12"><input class="form-control" id="complaintIdInput" type="text" placeholder="Complaint ID" required></div>
                        <div class="col-12 d-grid"><button type="submit" class="btn btn-outline-secondary">Track</button></div>
                        <div class="col-12"><div id="complaintStatusResult" class="alert alert-secondary mb-0">Enter your complaint ID to view the latest status.</div></div>
                    </form>
                </div>
            </div>
        </div>
        <div class="row gx-4 gy-4 mt-1">
            <div class="col-xl-7">
                <div class="account-card p-4" id="feedbackSection" data-aos="fade-up">
                    <div class="page-kicker">Customer Feedback</div>
                    <h3 class="help-section-title">Share your experience</h3>
                    <form id="feedbackForm">
                        <div class="mb-4">
                            <div class="d-flex align-items-center justify-content-between mb-2"><strong>Rate your experience</strong><span class="text-muted">Required</span></div>
                            <div class="feedback-stars d-flex gap-2" id="starRating">
                                <button type="button" data-rating="1"><i class="fas fa-star"></i></button>
                                <button type="button" data-rating="2"><i class="fas fa-star"></i></button>
                                <button type="button" data-rating="3"><i class="fas fa-star"></i></button>
                                <button type="button" data-rating="4"><i class="fas fa-star"></i></button>
                                <button type="button" data-rating="5"><i class="fas fa-star"></i></button>
                            </div>
                            <input type="hidden" name="feedbackRating" id="feedbackRating" value="0">
                        </div>
                        <div class="mb-3"><label class="form-label">Feedback</label><textarea class="form-control" name="feedbackMessage" rows="4" placeholder="Tell us what we can improve" required></textarea></div>
                        <div class="mb-3"><label class="form-label">Would you recommend us?</label><select class="form-select" name="feedbackRecommend" required><option value="yes">Yes</option><option value="no">No</option><option value="maybe">Maybe</option></select></div>
                        <button type="submit" class="btn account-btn-primary">Submit Feedback</button>
                    </form>
                </div>
            </div>
            <div class="col-xl-5">
                <div class="account-card p-4" data-aos="fade-up" data-aos-delay="80">
                    <div class="page-kicker">Social</div>
                    <h3 class="help-section-title">Stay connected</h3>
                    <div class="d-grid gap-3 footer-links">
                        <a href="#" class="d-flex align-items-center gap-3"><i class="fab fa-facebook fa-lg text-primary"></i>Facebook</a>
                        <a href="#" class="d-flex align-items-center gap-3"><i class="fab fa-instagram fa-lg text-danger"></i>Instagram</a>
                        <a href="#" class="d-flex align-items-center gap-3"><i class="fab fa-linkedin fa-lg text-primary"></i>LinkedIn</a>
                        <a href="#" class="d-flex align-items-center gap-3"><i class="fab fa-twitter fa-lg text-info"></i>Twitter</a>
                        <a href="#" class="d-flex align-items-center gap-3"><i class="fab fa-youtube fa-lg text-danger"></i>YouTube</a>
                    </div>
                </div>
                <div class="account-card p-4 mt-4" data-aos="fade-up" data-aos-delay="100">
                    <div class="page-kicker">Footer</div>
                    <div class="row gy-2 footer-links">
                        <div class="col-6"><a href="#">Privacy Policy</a></div>
                        <div class="col-6"><a href="#">Terms & Conditions</a></div>
                        <div class="col-6"><a href="#">Refund Policy</a></div>
                        <div class="col-6"><a href="#">Shipping Policy</a></div>
                        <div class="col-6"><a href="#">About Us</a></div>
                        <div class="col-6"><a href="#">Contact Us</a></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="aiAssistantWidget" class="ai-widget" aria-hidden="true">
        <div class="ai-window-header">
            <div>
                <div class="small text-uppercase text-muted">AI Help Assistant</div>
                <div class="ai-title">BookHub AI Assistant</div>
            </div>
            <button type="button" class="btn btn-sm btn-light" id="assistantMinimizeBtn" aria-label="Minimize chat"><i class="fas fa-minus"></i></button>
        </div>
        <div class="ai-chat-body">
            <div class="ai-chat-history" id="aiChatHistory">
                <div class="chat-bubble chat-bubble--ai">
                    <div>Hi there! I’m BookHub AI Assistant. How can I help you today?</div>
                    <div class="chat-meta">Just now</div>
                </div>
            </div>
            <div class="ai-chat-footer">
                <div class="input-group">
                    <input id="aiChatInput" type="text" class="form-control" placeholder="Ask about orders, returns, payments…" aria-label="Chat with AI">
                    <button id="sendAiMessageBtn" class="btn account-btn-primary" type="button"><i class="fas fa-paper-plane"></i></button>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <button type="button" class="btn btn-outline-secondary btn-sm" id="clearAiChatBtn">Clear Chat</button>
                    <span class="text-muted small">Typing animation and timestamps included</span>
                </div>
            </div>
        </div>
    </div>
    <button id="aiFloatingButton" class="ai-floating-btn" aria-label="Open AI assistant"><i class="fas fa-robot"></i></button>
    <div id="accountToastContainer" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1200;"></div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>
    <script>AOS.init({ duration: 700, once: true });</script>
    <script src="../js/account.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const helpSearchBtn = document.getElementById('helpSearchBtn');
            const helpSearchInput = document.getElementById('helpSearchInput');
            const openAiAssistantBtn = document.getElementById('openAiAssistantBtn');
            const openAiAssistantBtnSecondary = document.getElementById('openAiAssistantBtnSecondary');
            const aiFloatingButton = document.getElementById('aiFloatingButton');
            const aiAssistantWidget = document.getElementById('aiAssistantWidget');
            const assistantMinimizeBtn = document.getElementById('assistantMinimizeBtn');
            const sendAiMessageBtn = document.getElementById('sendAiMessageBtn');
            const aiChatInput = document.getElementById('aiChatInput');
            const aiChatHistory = document.getElementById('aiChatHistory');
            const clearAiChatBtn = document.getElementById('clearAiChatBtn');
            const trackComplaintForm = document.getElementById('trackComplaintForm');
            const complaintStatusResult = document.getElementById('complaintStatusResult');
            const starRatingButtons = document.querySelectorAll('#starRating button');
            const feedbackRatingInput = document.getElementById('feedbackRating');
            const feedbackForm = document.getElementById('feedbackForm');
            const helpTargets = document.querySelectorAll('[data-help-target]');

            const replyMap = [
                { pattern: /\border\b/i, reply: 'You can track your order from My Orders.' },
                { pattern: /\borders\b/i, reply: 'Open My Orders to check your order status.' },
                { pattern: /\bcart\b/i, reply: 'Your shopping cart contains all selected books.' },
                { pattern: /\bwishlist\b/i, reply: 'You can save books for later in Wishlist.' },
                { pattern: /\bpayment\b/i, reply: 'We support UPI, Debit Card, Credit Card, Net Banking and Cash on Delivery.' },
                { pattern: /\brefund\b/i, reply: 'Refunds are processed within 5–7 business days.' },
                { pattern: /\breturn\b/i, reply: 'Eligible books can be returned within the return period.' },
                { pattern: /\bdelivery\b/i, reply: 'Estimated delivery date is shown in My Orders.' },
                { pattern: /\baddress\b/i, reply: 'Manage your delivery addresses from Address Book.' },
                { pattern: /\blogin\b/i, reply: 'Please login using your registered email.' },
                { pattern: /\bregister\b/i, reply: 'Create a new account using the Register page.' },
                { pattern: /\bpassword\b/i, reply: 'Use Forgot Password to reset your password.' },
                { pattern: /\bprofile\b/i, reply: 'You can edit your personal information in Account Settings.' },
                { pattern: /\bcontact\b/i, reply: 'Email: support@bookhub.com\nPhone: +91-9876543210\nWorking Hours: 9:00 AM - 8:00 PM' },
                { pattern: /\bshipping\b/i, reply: 'Shipping usually takes 2–7 business days.' },
                { pattern: /\bcancel\b/i, reply: 'You can cancel eligible orders before shipment.' },
                { pattern: /\binvoice\b/i, reply: 'You can download invoices from Order Details.' },
                { pattern: /\botp\b/i, reply: 'Check your email for the verification OTP.' },
                { pattern: /\bbook\b/i, reply: 'Search books using the search bar or browse categories.' }
            ];

            function openAssistant() {
                aiAssistantWidget.classList.add('open');
                aiAssistantWidget.setAttribute('aria-hidden', 'false');
                aiFloatingButton.classList.add('d-none');
                aiChatInput.focus();
                setTimeout(() => scrollAiToBottom(), 50);
            }

            function minimizeAssistant() {
                aiAssistantWidget.classList.remove('open');
                aiAssistantWidget.setAttribute('aria-hidden', 'true');
                aiFloatingButton.classList.remove('d-none');
            }

            function scrollAiToBottom() {
                aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
            }

            function getTimestamp() {
                return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            function createMessageBubble(message, type) {
                const bubble = document.createElement('div');
                bubble.className = `chat-bubble chat-bubble--${type}`;
                bubble.innerHTML = `<div>${message.replace(/\n/g, '<br>')}</div><div class="chat-meta">${getTimestamp()}</div>`;
                return bubble;
            }

            function createTypingBubble() {
                const bubble = document.createElement('div');
                bubble.className = 'typing-indicator';
                bubble.innerHTML = '<span></span><span></span><span></span>';
                return bubble;
            }

            function respondToMessage(text) {
                const searchText = text.toLowerCase();
                for (const item of replyMap) {
                    if (item.pattern.test(searchText)) {
                        return item.reply;
                    }
                }
                return "I'm sorry, I couldn't understand your question. Please contact our support team.";
            }

            function sendAiMessage() {
                const message = aiChatInput.value.trim();
                if (!message) return;
                aiChatHistory.appendChild(createMessageBubble(message, 'user'));
                aiChatInput.value = '';
                scrollAiToBottom();

                const typingNode = createTypingBubble();
                aiChatHistory.appendChild(typingNode);
                scrollAiToBottom();

                setTimeout(() => {
                    typingNode.remove();
                    const reply = respondToMessage(message);
                    aiChatHistory.appendChild(createMessageBubble(reply, 'ai'));
                    scrollAiToBottom();
                }, 900);
            }

            function clearAiChat() {
                aiChatHistory.innerHTML = '';
                aiChatHistory.appendChild(createMessageBubble('Hi there! I’m BookHub AI Assistant. How can I help you today?', 'ai'));
                scrollAiToBottom();
            }

            helpSearchBtn?.addEventListener('click', () => {
                const value = helpSearchInput.value.trim().toLowerCase();
                if (!value) {
                    showAccountToast('Please type a question or keyword to search.', 'warning');
                    return;
                }
                const targets = ['orders', 'payment', 'delivery', 'refund', 'return', 'address', 'login', 'register', 'profile', 'contact', 'shipping', 'invoice', 'otp', 'book'];
                const found = replyMap.find(item => item.pattern.test(value));
                if (found) {
                    showAccountToast(found.reply, 'success');
                    return;
                }
                showAccountToast('Try our AI assistant or browse the help sections below.', 'info');
            });

            [openAiAssistantBtn, openAiAssistantBtnSecondary, aiFloatingButton].forEach(button => {
                button?.addEventListener('click', openAssistant);
            });
            assistantMinimizeBtn?.addEventListener('click', minimizeAssistant);
            sendAiMessageBtn?.addEventListener('click', sendAiMessage);
            aiChatInput?.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendAiMessage();
                }
            });
            clearAiChatBtn?.addEventListener('click', clearAiChat);

            helpTargets.forEach(button => {
                button.addEventListener('click', function () {
                    const targetId = this.dataset.helpTarget;
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });

            trackComplaintForm?.addEventListener('submit', function (event) {
                event.preventDefault();
                const complaintId = document.getElementById('complaintIdInput').value.trim();
                if (!complaintId) {
                    complaintStatusResult.textContent = 'Please enter a valid Complaint ID.';
                    complaintStatusResult.className = 'alert alert-warning mb-0';
                    return;
                }
                complaintStatusResult.textContent = `Complaint ${complaintId} is being reviewed. Status: In progress.`;
                complaintStatusResult.className = 'alert alert-info mb-0';
            });

            starRatingButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const rating = this.dataset.rating;
                    feedbackRatingInput.value = rating;
                    starRatingButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.rating <= rating));
                });
            });

            feedbackForm?.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!feedbackRatingInput.value || feedbackRatingInput.value === '0') {
                    showAccountToast('Please select a star rating before submitting.', 'warning');
                    return;
                }
                showAccountToast('Thank you! Your feedback has been submitted.', 'success');
                feedbackForm.reset();
                feedbackRatingInput.value = '0';
                starRatingButtons.forEach(btn => btn.classList.remove('active'));
            });
        });
    </script>
</body>
</html>
