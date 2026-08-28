import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { items, deliveryOption, note } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const productIds = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { business: true },
  });

  const byBusiness: Record<string, { productId: string; quantity: number; price: number }[]> = {};

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || !product.active) {
      return NextResponse.json({ error: `A product in your cart is no longer available.` }, { status: 400 });
    }
    if (product.business.status !== 'VERIFIED' || !product.business.isOpen) {
      return NextResponse.json({ error: `${product.name} is no longer available from its seller.` }, { status: 400 });
    }
    if (product.quantity < item.quantity) {
      return NextResponse.json({ error: `Only ${product.quantity} of "${product.name}" in stock.` }, { status: 400 });
    }
    if (!byBusiness[product.businessId]) byBusiness[product.businessId] = [];
    byBusiness[product.businessId].push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const createdOrders = [];

  for (const businessId of Object.keys(byBusiness)) {
    const lineItems = byBusiness[businessId];
    const totalPrice = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        businessId,
        totalPrice,
        deliveryOption: deliveryOption || 'CUSTOMER_PICKUP',
        note,
        items: { create: lineItems },
      },
    });

    for (const li of lineItems) {
      await prisma.product.update({
        where: { id: li.productId },
        data: { quantity: { decrement: li.quantity } },
      });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (business) {
      const itemCount = lineItems.reduce((sum, i) => sum + i.quantity, 0);
      sendPushToUser(business.ownerId, {
        title: '🛍️ New order received!',
        body: `${itemCount} item${itemCount > 1 ? 's' : ''} — ${formatTZS(totalPrice)}`,
        url: '/dashboard/business/orders',
      }).catch(() => {});
    }

    createdOrders.push(order);
  }

  return NextResponse.json({ orders: createdOrders });
}