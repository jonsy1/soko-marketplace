import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Soko Marketplace',
  description: 'Read the terms and conditions for using Soko Marketplace platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-night mb-6">Terms of Service</h1>
      <p className="text-night/60 text-sm mb-8">Last updated: October 2026</p>

      <div className="prose prose-night max-w-none">
        <p className="text-night/80">
          Welcome to <strong>Soko Marketplace</strong> ("Soko", "we", "us"). By creating an account or using our
          platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use Soko.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">1. Eligibility</h2>
        <p className="text-night/80">
          You must be at least 18 years old to create an account or use Soko. By using Soko, you confirm that you
          meet this requirement.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">2. What Soko Is</h2>
        <p className="text-night/80">
          Soko is a marketplace platform that allows independent businesses ("Sellers") to list products and
          allows customers ("Buyers") to discover and order from them. <strong>Soko does not own, manufacture, sell,
          ship, or take possession of any product listed on the platform.</strong> Every listing, price, discount, and
          transaction is created and controlled by the Seller, not by Soko.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">3. User Accounts</h2>
        <p className="text-night/80">
          You are responsible for maintaining the confidentiality of your account credentials and for all activity
          under your account. Notify us immediately of any unauthorized use.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">4. Buying and Selling</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>Sellers are solely responsible for the accuracy of their product listings, pricing, and any discounts they choose to apply. Soko does not add or create discounts on a Seller's behalf.</li>
          <li>Buyers agree to pay the price shown at the time of ordering.</li>
          <li>Sellers agree to fulfill orders accurately and in a timely manner.</li>
          <li>
            <strong>Payment happens directly between the Buyer and Seller</strong> (for example, cash, mobile money,
            or another method agreed between the two parties). Soko does not process, hold, or guarantee any
            payment, and is not a party to the transaction.
          </li>
          <li>Delivery and pickup arrangements are agreed directly between the Buyer and Seller.</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">5. Paid Promotions (Boost and Featured)</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>Sellers may pay Soko to promote a product for a set period. <strong>Boost</strong> shows a product near the top of the marketplace. <strong>Featured</strong> allows a product to appear on the homepage banner.</li>
          <li>Promotion spots are limited, and promoted products take turns. Soko does not guarantee that a promoted product will always be shown first, or to a specific number of people, or that it will result in sales.</li>
          <li>Payment for promotions is arranged directly with Soko. A promotion is activated by Soko after payment is confirmed, and runs for the agreed period.</li>
          <li>Payments for promotions are not refundable once the promotion has been activated, except where Soko decides otherwise at its discretion, for example if a promotion could not be delivered because of a fault on our side.</li>
          <li>Soko may remove a promotion, without refund, if the product or Seller violates these Terms.</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">6. Reviews and User Content</h2>
        <p className="text-night/80">
          Ratings and reviews reflect the personal opinion of the customer who wrote them, not the views of Soko.
          We do not verify the accuracy of reviews. We may remove any content that violates these Terms, is
          abusive, or is reported as false, but we are not obligated to monitor all content and are not liable
          for user-submitted content.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">7. Prohibited Activities</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li>Listing illegal, counterfeit, or prohibited items</li>
          <li>Fraudulent, misleading, or deceptive activity, including fake reviews</li>
          <li>Harassing or abusing other users</li>
          <li>Misusing contact information (phone number, WhatsApp) obtained through the platform for purposes unrelated to a genuine order</li>
          <li>Attempting to bypass or interfere with our security measures</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">8. Location Services</h2>
        <p className="text-night/80">
          Some features (such as showing nearby shops or distance to a seller) ask for your device's location.
          Sharing your location is optional; if you decline, those specific features may not work, but you can
          still use the rest of Soko normally.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">9. Emails and Notifications</h2>
        <p className="text-night/80">
          Soko sends emails about your orders, and about price drops on products in your wishlist. We may also
          email Sellers about their shop, products, or promotions. Push notifications are sent only if you
          have enabled them in your browser or device.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">10. Third-Party Services</h2>
        <p className="text-night/80">
          Soko uses third-party services to operate, including Google Sign-In (for login), OpenStreetMap (for
          maps), Vercel (hosting and image storage), Neon (database), Resend (sending emails), and WhatsApp (for
          optional seller contact). These services are governed by their own terms and privacy policies, which we
          encourage you to review.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">11. Intellectual Property</h2>
        <p className="text-night/80">
          Soko's branding, design, and platform code are protected by copyright and other intellectual property
          laws. Sellers retain ownership of the product photos and descriptions they upload but grant Soko a
          license to display them on the platform, including in promotional images generated for their products.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">12. Disclaimer of Warranties</h2>
        <p className="text-night/80">
          Soko is provided "as is" and "as available," without warranties of any kind. We do not guarantee that
          the platform will be uninterrupted, error-free, or that any product listed will meet your expectations.
          Soko does not inspect, endorse, or guarantee the quality, safety, or legality of any product listed by
          Sellers.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">13. Limitation of Liability</h2>
        <p className="text-night/80">
          To the maximum extent permitted by law, Soko and its owner(s) shall not be liable for any indirect,
          incidental, or consequential damages, or for any dispute, loss, or damage arising from: (a) transactions
          between Buyers and Sellers, (b) the quality, safety, or delivery of any product, (c) content posted by
          users (including reviews), or (d) unavailability or interruption of the platform. Soko facilitates
          discovery and communication between Buyers and Sellers but is not a party to, and assumes no
          responsibility for, the underlying transaction.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">14. Indemnification</h2>
        <p className="text-night/80">
          You agree to indemnify and hold Soko harmless from any claim or demand arising out of your use of the
          platform, your violation of these Terms, or your violation of any law or the rights of a third party.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">15. Termination</h2>
        <p className="text-night/80">
          We reserve the right to suspend or terminate your account for violations of these Terms or for any
          other reason at our discretion.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">16. Governing Law</h2>
        <p className="text-night/80">
          These Terms are governed by the laws of the United Republic of Tanzania. Any dispute arising from these
          Terms or your use of Soko shall be subject to the jurisdiction of the courts of Tanzania.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">17. Changes to These Terms</h2>
        <p className="text-night/80">
          We may update these Terms from time to time. We will post the updated version here with a new "Last
          updated" date. Continued use of Soko after changes means you accept the updated Terms.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">18. Contact Us</h2>
        <p className="text-night/80">
          If you have questions about these Terms of Service, please contact us:
        </p>
        <div className="bg-night/5 rounded-card p-4 mt-3 space-y-1 text-night/80">
          <p><strong>Name:</strong> Soko Marketplace</p>
          <p><strong>Email:</strong> <a href="mailto:support@sokotz.com" className="text-market-500 hover:underline">support@sokotz.com</a></p>
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