import Link from 'next/link';

export const metadata = {
  title: 'About Us - Soko Marketplace',
  description: 'Learn about Soko Marketplace - connecting Tanzanian businesses with customers across the country.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-night mb-6">About Soko Marketplace</h1>

      <div className="prose prose-night max-w-none">
        <p className="text-night/80 text-lg">
          <strong>One Search. Every Shop.</strong>
        </p>

        <p className="text-night/80">
          Soko Marketplace is Tanzania's premier digital marketplace connecting businesses with customers across the country. 
          We believe that every shop, whether in Dar es Salaam, Arusha, Mwanza, or any corner of Tanzania, deserves to be found.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">Our Mission</h2>
        <p className="text-night/80">
          To empower Tanzanian businesses by providing a simple, accessible platform where customers can find any product from any shop in one search.
        </p>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">What We Offer</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li><strong>For Businesses:</strong> A digital storefront to showcase products, manage orders, and reach new customers</li>
          <li><strong>For Customers:</strong> A single search to find products from multiple businesses, compare prices, and shop directly</li>
          <li><strong>For Tanzania:</strong> A platform that supports local businesses and strengthens the digital economy</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">Our Values</h2>
        <ul className="list-disc pl-6 text-night/80">
          <li><strong>Trust:</strong> We prioritize security and transparency in every transaction</li>
          <li><strong>Innovation:</strong> We continuously improve our platform to serve you better</li>
          <li><strong>Community:</strong> We believe in the power of local businesses to drive economic growth</li>
        </ul>

        <h2 className="text-xl font-semibold text-night mt-6 mb-3">Contact Us</h2>
        <p className="text-night/80">
          Have questions or want to partner with us? Reach out:
        </p>
        <p className="text-night/80 mt-2">
          <strong>Email:</strong> support@sokotz.com
        </p>

        <div className="mt-8 pt-6 border-t border-night/10">
          <Link href="/" className="text-market-500 hover:text-market-600 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}