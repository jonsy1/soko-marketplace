import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { businessId: business.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const followerCount = await prisma.follow.count({ where: { businessId: business.id } });
  const productCount = await prisma.product.count({ where: { businessId: business.id, active: true } });

  const nonCancelled = orders.filter((o) => o.status !== 'CANCELLED');
  const delivered = orders.filter((o) => o.status === 'DELIVERED');

  const totalRevenue = delivered.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingRevenue = nonCancelled
    .filter((o) => o.status !== 'DELIVERED')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const statusCounts: Record<string, number> = {
    NEW: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    READY: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };
  for (const o of orders) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;

  // Revenue for the last 14 days (non-cancelled orders, by order date).
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, revenue: 0, orders: 0 });
  }
  const dayIndex: Record<string, number> = {};
  days.forEach((d, i) => (dayIndex[d.date] = i));
  for (const o of nonCancelled) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dayIndex[key] !== undefined) {
      days[dayIndex[key]].revenue += o.totalPrice;
      days[dayIndex[key]].orders += 1;
    }
  }

  // Top products by quantity sold (non-cancelled orders).
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const key = item.productId;
      if (!productSales[key]) {
        productSales[key] = { name: item.product.name, quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return NextResponse.json({
    followerCount,
    productCount,
    totalOrders: orders.length,
    totalRevenue,
    pendingRevenue,
    statusCounts,
    dailyRevenue: days,
    topProducts,
  });
}