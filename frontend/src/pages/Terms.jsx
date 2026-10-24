import React from 'react';

export default function Terms() {
  return (
    <div className="policy-page container animate-fade-in">
      <div className="policy-card glass-card">
        <h1 className="page-heading">Terms & Conditions of Sale</h1>
        <p className="text-muted">Last updated: October 2026</p>

        <section className="policy-section">
          <h2>1. Purchase Agreement</h2>
          <p>
            By placing an order on BookNook, you agree to purchase the selected books at the specified prices and delivery terms. All orders are subject to stock availability and verification.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Pricing & Payments</h2>
          <p>
            Prices are listed in Indian Rupees (₹) inclusive of applicable taxes. We accept Cash on Delivery (COD) as well as secure online payments (Credit/Debit Card, UPI). Orders placed under Cash on Delivery require payment confirmation upon package handover.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Shipping & Delivery</h2>
          <p>
            Orders are dispatched within 24 to 48 hours. Orders above ₹499 qualify for Free Standard Delivery. Delivery timelines are subject to courier service partner operations.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. 7-Day Replacement Guarantee</h2>
          <p>
            If your received book has manufacturing defects (e.g., misprinted text, missing pages, or severe transit damage), you may request a free replacement within 7 calendar days of receipt through our Help Center.
          </p>
        </section>
      </div>
    </div>
  );
}
