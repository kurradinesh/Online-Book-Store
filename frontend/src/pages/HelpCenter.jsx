import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HelpCenter() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    requestType: 'Order & Delivery Issue',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: "What are the delivery timelines for domestic book shipments?",
      a: "Standard express delivery usually takes 2 to 4 business days across metropolitan areas in India, and 4 to 6 days for remote regions. Every order includes a live courier tracking code."
    },
    {
      q: "How does Cash on Delivery (COD) work?",
      a: "When choosing COD during checkout, you pay the exact order amount in cash or via mobile UPI QR scan directly to the delivery courier upon arrival at your doorstep."
    },
    {
      q: "What is BookNook's book return or replacement policy?",
      a: "We offer a 7-day hassle-free replacement policy for books received with printing errors, missing pages, or transit damage. Simply submit a request here with your Order ID."
    },
    {
      q: "Are the textbooks and NCERT editions original?",
      a: "Yes, 100% of our educational textbooks, competitive exam guides, and novels are sourced directly from authorized government presses and registered publishers."
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.support.submit(formData);
      setFeedback({ type: 'success', text: "Thank you! Your ticket has been logged. Our support desk will reply within 24 hours." });
      setFormData({ email: user?.email || '', requestType: 'Order & Delivery Issue', subject: '', message: '' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || "Failed to submit request. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="help-page container animate-fade-in">
      <div className="help-header">
        <span className="badge badge-gold"><i className="fas fa-headset"></i> 24/7 CUSTOMER DESK</span>
        <h1 className="page-heading">How Can We Help You?</h1>
        <p className="text-muted">Find answers to common questions or reach out to our dedicated bookstore support team.</p>
      </div>

      <div className="help-layout-grid">
        {/* Support Ticket Submission Form */}
        <div className="help-form-column glass-card">
          <h2 className="form-section-title"><i className="fas fa-paper-plane text-gold"></i> Submit an Inquiry</h2>

          {feedback && (
            <div className={`alert-banner ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i> {feedback.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inquiry Category *</label>
              <select
                className="form-select"
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              >
                <option value="Order & Delivery Issue">Order & Delivery Tracking</option>
                <option value="Damaged / Incorrect Book">Damaged or Incorrect Book Return</option>
                <option value="Payment Inquiry">Payment or Refund Query</option>
                <option value="Book Request">Special Edition or Bulk Book Request</option>
                <option value="General Feedback">General Feedback</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Question regarding Order #1042 delivery"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Message *</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Describe your issue or question in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-gold btn-lg w-full" disabled={submitting}>
              {submitting ? 'Submitting Ticket...' : 'Send Message to Support'}
            </button>
          </form>
        </div>

        {/* FAQs Accordion */}
        <div className="help-faq-column">
          <div className="glass-card faq-card-box">
            <h2 className="form-section-title"><i className="fas fa-circle-question text-gold"></i> Frequently Asked Questions</h2>

            <div className="faq-accordion-list">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`faq-item ${activeFaq === idx ? 'open' : ''}`}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <div className="faq-question">
                    <span>{faq.q}</span>
                    <i className={`fas fa-chevron-${activeFaq === idx ? 'up' : 'down'}`}></i>
                  </div>
                  {activeFaq === idx && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
