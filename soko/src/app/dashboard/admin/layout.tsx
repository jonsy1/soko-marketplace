import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-white border-b border-night/10">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm font-medium overflow-x-auto">
          <Link href="/dashboard/admin" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Overview
          </Link>
          <Link href="/dashboard/admin/businesses" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Businesses
          </Link>
          <Link href="/dashboard/admin/categories" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Categories
          </Link>
          <Link href="/dashboard/admin/orders" className="py-4 hover:text-teal-600 whitespace-nowrap">
            Orders
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
