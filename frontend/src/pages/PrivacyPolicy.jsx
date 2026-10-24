import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="policy-page container animate-fade-in">
      <div className="policy-card glass-card">
        <h1 className="page-heading">Privacy Policy</h1>
        <p className="text-muted">Last updated: October 2026</p>

        <section className="policy-section">
          <h2>1. Information We Collect</h2>
          <p>
            BookNook collects information you provide directly to us when creating an account, browsing books, adding items to your bag, updating your delivery address, or making a purchase. This information includes your name, email address, contact phone number, and physical shipping address.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your data solely to fulfill orders, generate courier tracking codes, process authorized transactions, communicate order updates, and provide personalized reading recommendations if you opted in.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. Data Protection & Security</h2>
          <p>
            All passwords are encrypted using high-strength salted BCrypt hashing. Network traffic between your browser and our servers is secured via 256-bit TLS/SSL encryption. We never sell or rent your personal data to third-party advertisers.
          </p>
        </section>

        <section className="policy-section">
          <h2>4. Account Deletion & Right to be Forgotten</h2>
          <p>
            You have the unconditional right to delete your BookNook account at any time through your Profile Settings. Account deletion permanently removes your personal profile, addresses, and saved wishlist items from our live database.
          </p>
        </section>
      </div>
    </div>
  );
}
