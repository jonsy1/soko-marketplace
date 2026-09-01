export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Last updated: September 1, 2026</p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <p>We collect information you provide directly, such as when you create an account or use our services. This may include:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your name and email address (via Google OAuth)</li>
          <li>Information you choose to share on your profile</li>
          <li>Content you post on our platform</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
        <p>We use your information to provide, maintain, and improve our services. This includes:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Authenticating your account (via Google OAuth)</li>
          <li>Personalizing your experience</li>
          <li>Communicating with you about updates or promotions</li>
          <li>Complying with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share your data with:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Service providers who assist us with operations (e.g., hosting, analytics)</li>
          <li>Law enforcement when required by law</li>
        </ul>
      </section>

      <section className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">4. Contact Us</h2>
        <p>If you have any questions about this policy, please contact us at <a href="mailto:your-email@example.com" className="text-blue-600 underline">your-email@example.com</a>.</p>
      </section>
    </div>
  );
}