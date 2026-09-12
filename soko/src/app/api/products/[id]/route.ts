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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const existing = await prisma.product.findUnique({
    where: { id: params.id },
    include: { business: { select: { ownerId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }
  const isOwnerOrAdmin = existing.business?.ownerId === userId || role === 'ADMIN';
  if (!isOwnerOrAdmin) {
    return NextResponse.json({ error: 'You do not have permission to edit this product.' }, { status: 403 });
  }

  const { name, description, price, costPrice, quantity, imageUrl, categoryId, discountPercent } = await req.json();

  if (!name || price === undefined || price === null || price === '') {
    return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
  }

  let discountValue: number | null = null;
  if (discountPercent !== undefined && discountPercent !== null && discountPercent !== '') {
    const d = parseInt(discountPercent);
    if (isNaN(d) || d < 0 || d > 90) {
      return NextResponse.json({ error: 'Discount must be between 0 and 90%.' }, { status: 400 });
    }
    discountValue = d === 0 ? null : d;
  }

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name,
      description,
      price: parseFloat(price),
      costPrice: costPrice !== undefined && costPrice !== '' ? parseFloat(costPrice) : null,
      quantity: quantity !== undefined && quantity !== '' ? parseInt(quantity) : existing.quantity,
      imageUrl: imageUrl || null,
      categoryId: categoryId || null,
      discountPercent: discountValue,
    },
  });

  return NextResponse.json(product);
}