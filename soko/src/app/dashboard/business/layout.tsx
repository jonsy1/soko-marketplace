import Link from 'next/link';

export default function BusinessDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-white border-b border-night/10">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm font-medium overflow-x-auto">
          <Link href="/dashboard/business" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Overview
          </Link>
          <Link href="/dashboard/business/products" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Products
          </Link>
          <Link href="/dashboard/business/orders" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Orders
          </Link>
          <Link href="/dashboard/business/settings" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Store settings
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
