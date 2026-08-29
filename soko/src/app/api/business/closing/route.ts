import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function getPeriodStart(period: string): Date {
  const now = new Date();
  const start = new Date(now);
  if (period === 'day') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    const day = start.getDay();
    const diff = (day === 0 ? 6 : day - 1); // Monday as start of week
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }
  return start;
}

export async function GET(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'day';
  if (!['day', 'week', 'month', 'year'].includes(period)) {
    return NextResponse.json({ error: 'Invalid period.' }, { status: 400 });
  }

  const start = getPeriodStart(period);

  const orders = await prisma.order.findMany({
    where: {
      businessId: business.id,
      createdAt: { gte: start },
      status: { not: 'CANCELLED' },
    },
    include: { items: true },
  });

  let revenue = 0;
  let cost = 0;
  let unitsSold = 0;
  let ordersWithoutCost = 0;

  for (const order of orders) {
    for (const item of order.items) {
      revenue += item.price * item.quantity;
      unitsSold += item.quantity;
      if (item.costPrice != null) {
        cost += item.costPrice * item.quantity;
      } else {
        ordersWithoutCost += 1;
      }
    }
  }

  const profit = revenue - cost;

  return NextResponse.json({
    period,
    since: start.toISOString(),
    orderCount: orders.length,
    unitsSold,
    revenue,
    cost,
    profit,
    hasIncompleteCostData: ordersWithoutCost > 0,
  });
}