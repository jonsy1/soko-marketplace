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
          At <strong>Soko Marketplace</strong> ("Soko", "we", "us"), we are committed to protecting your privacy.
          This Privacy Policy explains what information we collect, how we use it, and your rights, in line with
          Tanzania's Personal Data Protection Act, 2022 (PDPA).
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li><strong>Account information:</strong> name, email address, phone number, and password (encrypted).</li>
          <li><strong>Business information (Sellers):</strong> business name, description, phone number, shop location/address, and logo/photos.</li>
          <li><strong>Location data:</strong> if you grant permission, your device's GPS coordinates, used to show nearby shops and estimated distance. You can decline this without losing access to the rest of Soko.</li>
          <li><strong>Content you provide:</strong> product listings and photos, reviews and ratings, and messages sent through the platform.</li>
          <li><strong>Google account information:</strong> if you sign in with Google, we receive your name, email address, and profile photo from Google.</li>
          <li><strong>Order and transaction history:</strong> items ordered, quantities, and order status.</li>
          <li><strong>Technical data:</strong> login session cookies (to keep you signed in) and, if enabled, push notification subscription details.</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>To provide, operate, and improve the Soko platform</li>
          <li>To process and display orders between Buyers and Sellers</li>
          <li>To show nearby shops and calculate distance (only if you've shared your location)</li>
          <li>To send order updates and notifications (including push notifications, if enabled)</li>
          <li>To display reviews and ratings publicly, as described below</li>
          <li>To protect against fraud, abuse, and unauthorized access</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">3. What's Public on Soko</h2>
        <p className="text-night/80">
          To function as a marketplace, some information is visible to anyone browsing Soko, including: a
          Seller's business name, shop location, phone number/WhatsApp (shown to buyers who choose to contact the
          seller), and any reviews or ratings left by customers. Please keep this in mind before entering business
          contact details or writing a review.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">4. Information Sharing</h2>
        <p className="text-night/80">We do not sell your personal information. We share information only with:</p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Infrastructure providers who help us run Soko (hosting, database, and file storage providers)</li>
          <li>Google, only for the purpose of Google Sign-In authentication</li>
          <li>OpenStreetMap, which receives map coordinates to display maps (no personal account information is sent)</li>
          <li>Law enforcement, when required by Tanzanian law</li>
          <li>Other users, only where necessary for the marketplace to function (e.g., a Seller sees the name of a customer who ordered from them)</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">5. International Data Storage</h2>
        <p className="text-night/80">
          Some of our hosting and database providers store data on servers located outside Tanzania. Where this
          happens, we take reasonable steps to protect your information in accordance with the PDPA's requirements
          for cross-border data transfer.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">6. Data Security</h2>
        <p className="text-night/80">
          We use industry-standard measures (such as password encryption) to protect your information against
          unauthorized access, alteration, disclosure, or destruction. No online service can guarantee absolute
          security.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">7. Data Retention</h2>
        <p className="text-night/80">
          We retain your information for as long as your account is active, or as needed to provide our services,
          comply with our legal obligations, and resolve disputes.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">8. Your Rights</h2>
        <p className="text-night/80">Under the PDPA, you have the right to:</p>
        <ul className="list-disc pl-6 text-night/80">
          <li>Access, correct, or request deletion of your personal information</li>
          <li>Withdraw consent (for example, by revoking location access in your device settings, or by deleting your account)</li>
          <li>Request a copy of your data</li>
          <li>Lodge a complaint with the Personal Data Protection Commission (PDPC) of Tanzania if you believe your data has been mishandled</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">9. Children's Privacy</h2>
        <p className="text-night/80">
          Soko is intended for users aged 18 and above. We do not knowingly collect personal information from
          anyone under 18. If you believe a minor has provided us with personal information, please contact us so
          we can remove it.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">10. Changes to This Policy</h2>
        <p className="text-night/80">
          We may update this Privacy Policy from time to time. We will post the updated version here with a new
          "Last updated" date.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">11. Contact Us</h2>
        <p className="text-night/80">
          If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
        </p>
        <div className="bg-night/5 rounded-card p-4 mt-3 space-y-1 text-night/80">
          <p><strong>Name:</strong> [WEKA JINA LAKO / LA BIASHARA HAPA]</p>
          <p><strong>Email:</strong> <a href="mailto:WEKA-BARUA-PEPE-YAKO@example.com" className="text-market-500 hover:underline">[WEKA BARUA PEPE YAKO]</a></p>
          <p><strong>Phone:</strong> <a href="tel:+255000000000" className="text-market-500 hover:underline">[WEKA NAMBA YAKO - HIARI]</a></p>
          <p><strong>Location:</strong> [MJI], Tanzania</p>
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