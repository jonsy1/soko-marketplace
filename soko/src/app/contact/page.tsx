'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hapa unaweza kuongeza logic ya kutuma email
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-night mb-6">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div>
          <p className="text-night/80 mb-6">
            Have questions, feedback, or partnership ideas? We would love to hear from you.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-night">Email</h3>
              <p className="text-night/70">support@sokotz.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-night">Location</h3>
              <p className="text-night/70">Tanzania</p>
            </div>
            <div>
              <h3 className="font-semibold text-night">Response Time</h3>
              <p className="text-night/70">We typically respond within 24 hours</p>
            </div>
          </div>

          <Link href="/" className="inline-block mt-6 text-market-500 hover:text-market-600 transition">
            ← Back to Home
          </Link>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-card border border-night/10 p-6 shadow-sm">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-night">Message Sent!</h3>
              <p className="text-night/60 mt-2">We will get back to you within 24 hours.</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-4 text-market-500 hover:text-market-600 transition"
              >
                Send another message →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Your Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Your Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  required
                  rows={4}
                  className="input resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}