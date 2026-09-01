import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Soko Marketplace',
  description: 'Read the terms and conditions for using Soko Marketplace platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-night mb-6">Terms of Service</h1>
      <p className="text-night/60 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-night max-w-none">
        <p className="text-night/80">
          Welcome to <strong>Soko Marketplace</strong>. By using our platform, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">1. Acceptance of Terms</h2>
        <p className="text-night/80">
          By creating an account or using Soko Marketplace, you agree to these Terms of Service. If you do not agree, please do not use our platform.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">2. User Accounts</h2>
        <p className="text-night/80">
          You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">3. Buying and Selling</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>Businesses are responsible for the accuracy of their product listings</li>
          <li>Buyers agree to pay the listed price for products they purchase</li>
          <li>Businesses agree to fulfill orders in a timely manner</li>
          <li>Transactions are between buyers and sellers — we facilitate but are not a party to the transaction</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">4. Prohibited Activities</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>Listing illegal or prohibited items</li>
          <li>Fraudulent or misleading activities</li>
          <li>Harassing or abusing other users</li>
          <li>Attempting to bypass our security measures</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">5. Intellectual Property</h2>
        <p className="text-night/80">
          Soko Marketplace and its content are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">6. Termination</h2>
        <p className="text-night/80">
          We reserve the right to suspend or terminate your account for violations of these terms or for any other reason at our discretion.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">7. Contact Us</h2>
        <p className="text-night/80">
          If you have questions about these Terms of Service, please contact us:
        </p>
        <div className="bg-night/5 rounded-card p-4 mt-3 space-y-1 text-night/80">
          <p><strong>Email:</strong> <a href="mailto:hello@sokotz.com" className="text-market-500 hover:underline">hello@sokotz.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:+255700000000" className="text-market-500 hover:underline">+255 700 000 000</a></p>
          <p><strong>Location:</strong> Tanzania</p>
          <p className="mt-2">
            <Link href="/contact" className="text-market-500 hover:underline font-semibold">
              📧 Send us a message →
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-night/10">
          <Link href="/" className="text-market-500 hover:text-market-600 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}