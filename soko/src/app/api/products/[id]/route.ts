import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          offersDelivery: true,
          latitude: true,
          longitude: true,
          status: true,
          isOpen: true,
          ownerId: true,
        }
      },
      category: {
        select: { name: true, slug: true }
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  // Check if product is hidden
  const hidden = product.business?.status === 'SUSPENDED' || !product.business?.isOpen;
  if (hidden) {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    const isOwnerOrAdmin = userId === product.business?.ownerId || role === 'ADMIN';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
  }

  return NextResponse.json(product);
}