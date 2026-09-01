export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: September 1, 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>By using Soko Marketplace, you agree to these Terms. If you do not agree, please do not use our services.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">2. User Accounts</h2>
        <p>You are responsible for maintaining the security of your account and any activities that occur under your account.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">3. Acceptable Use</h2>
        <p>You agree not to use our platform for any unlawful or prohibited purpose, including:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Infringing on the rights of others</li>
          <li>Posting misleading or false information</li>
          <li>Interfering with the security of the platform</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>
        <p>Our services are provided "as is," and we are not liable for any damages arising from your use of them.</p>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">5. Contact Us</h2>
        <p>For questions about these Terms, please contact us at <a href="mailto:your-email@example.com" className="text-blue-600 underline">your-email@example.com</a>.</p>
      </section>
    </div>
  );
}