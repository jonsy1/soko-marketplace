import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    
    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

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
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    // Read body properly
    const body = await req.json();
    const { productId, quantity, deliveryOption, note } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Product and quantity are required.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ 
      where: { id: productId },
      include: { business: true }
    });
    
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product is not available.' }, { status: 404 });
    }
    if (product.quantity < quantity) {
      return NextResponse.json({ error: `Only ${product.quantity} in stock.` }, { status: 400 });
    }

    const sellPrice = product.price;
    const totalPrice = sellPrice * quantity;

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        businessId: product.businessId,
        totalPrice,
        deliveryOption: deliveryOption || 'CUSTOMER_PICKUP',
        note: note || null,
        status: 'NEW',
        items: {
          create: [{ 
            productId: product.id, 
            quantity, 
            price: sellPrice, 
            costPrice: product.costPrice || 0 
          }],
        },
      },
      include: { items: true },
    });

    // Update product quantity
    await prisma.product.update({
      where: { id: product.id },
      data: { quantity: { decrement: quantity } },
    });

    // Send notification to business owner
    if (product.business) {
      await sendPushToUser(product.business.ownerId, {
        title: '🛍️ New order received!',
        body: `${quantity}× ${product.name} — ${formatTZS(totalPrice)}`,
        url: '/dashboard/business/orders',
      }).catch(() => {});
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('POST order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}