import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  let where: any = { customerId: userId };

  if (role === 'BUSINESS') {
    const business = await prisma.business.findUnique({ where: { ownerId: userId } });
    if (!business) return NextResponse.json([]);
    where = { businessId: business.id };
  } else if (role === 'ADMIN') {
    where = {};
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } },
      business: { select: { name: true, slug: true, phone: true } },
      customer: { select: { name: true, phone: true, email: true } },
    },
  });

  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { productId, quantity, deliveryOption, note } = await req.json();
  if (!productId || !quantity) {
    return NextResponse.json({ error: 'Product and quantity are required.' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.active) {
    return NextResponse.json({ error: 'Product is not available.' }, { status: 404 });
  }
  if (product.quantity < quantity) {
    return NextResponse.json({ error: `Only ${product.quantity} in stock.` }, { status: 400 });
  }

  const totalPrice = product.price * quantity;

  const order = await prisma.order.create({
    data: {
      customerId: userId,
      businessId: product.businessId,
      totalPrice,
      deliveryOption: deliveryOption || 'CUSTOMER_PICKUP',
      note,
      items: {
        create: [{ productId: product.id, quantity, price: product.price, costPrice: product.costPrice }],
      },
    },
    include: { items: true },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { quantity: { decrement: quantity } },
  });

  const business = await prisma.business.findUnique({ where: { id: product.businessId } });
  if (business) {
    sendPushToUser(business.ownerId, {
      title: '🛍️ New order received!',
      body: `${quantity}× ${product.name} — ${formatTZS(totalPrice)}`,
      url: '/dashboard/business/orders',
    }).catch(() => {});
  }

  return NextResponse.json(order);
}

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}