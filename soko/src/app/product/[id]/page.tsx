import { redirect } from 'next/navigation';

// Old product links (/product/ID) now land on the full product page (/products/ID).
export default function ProductRedirect({ params }: { params: { id: string } }) {
  redirect('/products/' + params.id);
}