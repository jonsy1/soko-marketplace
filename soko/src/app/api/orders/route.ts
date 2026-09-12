import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';
import { getEffectivePrice } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  let where: any = {};

  if (role === 'ADMIN') {
    where = {};
  } else if (role === 'BUSINESS') {
    const business = await prisma.business.findUnique({ where: { ownerId: userId } });
    if (!business) return NextResponse.json([]);
    where = { businessId: business.id };
  } else {
    where = { customerId: userId };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true } },
      business: { select: { name: true, slug: true } },
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
    take: 100,
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { productId, quantity, deliveryOption, note } = await req.json();
  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'Product and quantity are required.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { business: true },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: 'This product is no longer available.' }, { status: 400 });
  }
  if (product.business.status !== 'VERIFIED' || !product.business.isOpen) {
    return NextResponse.json({ error: `${product.name} is no longer available from its seller.` }, { status: 400 });
  }
  if (product.quantity < quantity) {
    return NextResponse.json({ error: `Only ${product.quantity} of "${product.name}" in stock.` }, { status: 400 });
  }

  const effectivePrice = getEffectivePrice(product.price, product.discountPercent);
  const totalPrice = effectivePrice * quantity;

  const order = await prisma.order.create({
    data: {
      customerId: userId,
      businessId: product.businessId,
      totalPrice,
      deliveryOption: deliveryOption || 'CUSTOMER_PICKUP',
      note,
      items: {
        create: [
          {
            productId: product.id,
            quantity,
            price: effectivePrice,
            costPrice: product.costPrice,
          },
        ],
      },
    },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { quantity: { decrement: quantity } },
  });

  sendPushToUser(product.business.ownerId, {
    title: '🛍️ New order received!',
    body: `${quantity} item${quantity > 1 ? 's' : ''} — ${formatTZS(totalPrice)}`,
    url: '/dashboard/business/orders',
  }).catch(() => {});

  return NextResponse.json({ order });
}