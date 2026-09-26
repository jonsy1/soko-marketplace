import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getEffectivePrice } from '@/lib/pricing';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const items = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        include: {
          business: { select: { name: true, slug: true, isOpen: true, status: true } },
        },
      },
    },
  });

  const withStatus = items.map((item) => {
    const currentPrice = getEffectivePrice(item.product.price, item.product.discountPercent);
    return {
      id: item.id,
      priceAtSave: item.priceAtSave,
      currentPrice,
      priceDropped: currentPrice < item.priceAtSave,
      inStock: item.product.quantity > 0,
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        quantity: item.product.quantity,
        active: item.product.active,
      },
      business: item.product.business,
    };
  });

  return NextResponse.json(withStatus);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: 'productId is required.' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const priceAtSave = getEffectivePrice(product.price, product.discountPercent);

  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId, priceAtSave },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId is required.' }, { status: 400 });

  await prisma.wishlist.deleteMany({ where: { userId, productId } });

  return NextResponse.json({ ok: true });
}