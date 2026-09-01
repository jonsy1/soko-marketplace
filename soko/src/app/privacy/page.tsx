import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy - Soko Marketplace',
  description: 'Learn how Soko Marketplace collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-night mb-6">Privacy Policy</h1>
      <p className="text-night/60 text-sm mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-night max-w-none">
        <p className="text-night/80">
          At <strong>Soko Marketplace</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">1. Information We Collect</h2>
        <p className="text-night/80">
          We collect information you provide directly, such as when you create an account, make a purchase, or contact us. This includes:
        </p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Name and contact information (email address, phone number)</li>
          <li>Account credentials (password, profile information)</li>
          <li>Transaction and order history</li>
          <li>Communications with us</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">2. How We Use Your Information</h2>
        <p className="text-night/80">
          We use your information to:
        </p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send order confirmations</li>
          <li>Send you updates, promotions, and marketing communications (with your consent)</li>
          <li>Protect against fraud and unauthorized transactions</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">3. Information Sharing</h2>
        <p className="text-night/80">
          We do not sell your personal information. We may share your information with:
        </p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Service providers who help us operate our platform (payment processors, hosting)</li>
          <li>Law enforcement when required by law</li>
          <li>Other users only with your explicit consent</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">4. Data Security</h2>
        <p className="text-night/80">
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">5. Your Rights</h2>
        <p className="text-night/80">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Access, correct, or delete your personal information</li>
          <li>Withdraw consent at any time</li>
          <li>Request a copy of your data</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">6. Contact Us</h2>
        <p className="text-night/80">
          If you have any questions about this Privacy Policy, please contact us:
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