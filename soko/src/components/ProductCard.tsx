import Link from 'next/link';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export default function ProductCard({ product }: { product: any }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="card overflow-hidden hover:shadow-md transition group"
    >
      <div className="aspect-square bg-market-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <span className="text-market-600 font-display text-3xl font-bold opacity-40">
            {product.name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{product.name}</p>
        <p className="text-teal-600 font-bold text-sm mt-0.5">{formatTZS(product.price)}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-night/50">
          <span className="truncate">{product.business?.name}</span>
          <span className="truncate">{product.business?.location}</span>
        </div>
        {product.business?.status === 'VERIFIED' && (
          <span className="badge bg-teal-50 text-teal-600 mt-2">✓ Verified seller</span>
        )}
      </div>
    </Link>
  );
}
