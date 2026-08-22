import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const [businesses, pendingBusinesses, products, orders, customers, revenueAgg] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: 'PENDING' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({ _sum: { totalPrice: true }, where: { status: { not: 'CANCELLED' } } }),
  ]);

  return NextResponse.json({
    businesses,
    pendingBusinesses,
    products,
    orders,
    customers,
    revenue: revenueAgg._sum.totalPrice || 0,
  });
}
