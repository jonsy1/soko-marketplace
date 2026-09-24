import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';

// Valid forward-only transitions a seller/admin can make.
// Customers can only ever move to CANCELLED (checked separately below).
const VALID_NEXT_STATUS: Record<string, string[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      business: { select: { id: true, name: true, slug: true, phone: true, location: true, ownerId: true } },
      customer: { select: { id: true, name: true, phone: true } },
      items: { include: { product: { select: { id: true, name: true, imageUrl: true } } } },
    },
  });

  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const isSeller = order.business.ownerId === userId;
  const isCustomer = order.customerId === userId;
  if (!isSeller && !isCustomer && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  // For the customer-history section on the order detail page: how many
  // other orders has this customer placed with this same business.
  let customerHistory: { previousOrders: number; totalSpent: number } | null = null;
  if (isSeller || role === 'ADMIN') {
    const previous = await prisma.order.findMany({
      where: {
        customerId: order.customerId,
        businessId: order.businessId,
        id: { not: order.id },
      },
      select: { totalPrice: true },
    });
    customerHistory = {
      previousOrders: previous.length,
      totalSpent: previous.reduce((sum, o) => sum + o.totalPrice, 0),
    };
  }

  return NextResponse.json({ ...order, customerHistory });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { business: true } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const isSeller = order.business.ownerId === userId;
  const isCustomer = order.customerId === userId;
  if (!isSeller && !isCustomer && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  const { status, paymentStatus, cancellationReason } = await req.json();

  const data: any = {};

  if (status) {
    const allowed = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    if (isCustomer && !isSeller && role !== 'ADMIN') {
      // Customers may only cancel, and only while the order is still NEW.
      if (status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Customers can only cancel an order.' }, { status: 403 });
      }
      if (order.status !== 'NEW') {
        return NextResponse.json({ error: 'This order can no longer be cancelled.' }, { status: 400 });
      }
    } else {
      // Seller/admin: enforce the forward-only status flow server-side.
      const allowedNext = VALID_NEXT_STATUS[order.status] || [];
      if (!allowedNext.includes(status)) {
        return NextResponse.json(
          { error: `Cannot move an order from ${order.status} to ${status}.` },
          { status: 400 }
        );
      }
    }

    if (status === 'CANCELLED' && !cancellationReason) {
      return NextResponse.json({ error: 'A cancellation reason is required.' }, { status: 400 });
    }

    data.status = status;
    if (status === 'CANCELLED') data.cancellationReason = cancellationReason;
  }

  if (paymentStatus) {
    // Only the seller (or admin) can change payment status.
    if (!isSeller && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized to change payment status.' }, { status: 403 });
    }
    const allowedPayment = ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CASH_ON_DELIVERY'];
    if (!allowedPayment.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
    }
    data.paymentStatus = paymentStatus;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id: params.id }, data });

  if (status === 'CONFIRMED') {
    sendPushToUser(order.customerId, {
      title: '✅ Order confirmed!',
      body: `${order.business.name} confirmed your order.`,
      url: '/orders',
    }).catch(() => {});
  }

  return NextResponse.json(updated);
}