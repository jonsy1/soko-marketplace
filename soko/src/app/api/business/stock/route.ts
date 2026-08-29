import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function getOwnBusiness(userId: string) {
  return prisma.business.findUnique({ where: { ownerId: userId } });
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await getOwnBusiness(userId);
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  const entries = await prisma.stockEntry.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true, quantity: true, costPrice: true, price: true } } },
    take: 100,
  });

  return NextResponse.json(entries);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await getOwnBusiness(userId);
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  const { productId, quantity, costPrice, note } = await req.json();
  if (!productId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: 'Product and a positive quantity are required.' }, { status: 400 });
  }
  if (costPrice === undefined || costPrice === null || costPrice < 0) {
    return NextResponse.json({ error: 'Purchase cost per unit is required.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.businessId !== business.id) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const entry = await prisma.stockEntry.create({
    data: {
      businessId: business.id,
      productId,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      note: note || null,
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      quantity: { increment: parseInt(quantity) },
      costPrice: parseFloat(costPrice),
    },
  });

  return NextResponse.json(entry);
}