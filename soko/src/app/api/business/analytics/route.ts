import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { calculateOrdersProfit } from '@/lib/pricing';

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

  // Top products by quantity sold (non-cancelled orders), now including profit.
  const productSales: Record
    string,
    { name: string; quantity: number; revenue: number; items: { price: number; costPrice: number | null; quantity: number }[] }
  > = {};
  for (const o of nonCancelled) {
    for (const item of o.items) {
      const key = item.productId;
      if (!productSales[key]) {
        productSales[key] = { name: item.product.name, quantity: 0, revenue: 0, items: [] };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.price * item.quantity;
      productSales[key].items.push({ price: item.price, costPrice: item.costPrice, quantity: item.quantity });
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p) => {
      const profitInfo = calculateOrdersProfit(p.items);
      return {
        name: p.name,
        quantity: p.quantity,
        revenue: p.revenue,
        profit: profitInfo.profit,
        hasFullCostData: profitInfo.hasFullCostData,
      };
    });

  // --- Low-stock intelligence: for each active product with quantity <= 5,
  // estimate days-remaining from the last 30 days of sales for that product.
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lowStockRaw = await prisma.product.findMany({
    where: { businessId: business.id, active: true, quantity: { lte: 5 } },
    select: { id: true, name: true, quantity: true },
  });

  // Units sold per product in the last 30 days, from non-cancelled orders.
  const recentSalesByProduct: Record<string, number> = {};
  for (const o of nonCancelled) {
    if (new Date(o.createdAt) < thirtyDaysAgo) continue;
    for (const item of o.items) {
      recentSalesByProduct[item.productId] = (recentSalesByProduct[item.productId] || 0) + item.quantity;
    }
  }

  const lowStock = lowStockRaw.map((p) => {
    const unitsSold30d = recentSalesByProduct[p.id] || 0;
    const avgDailySales = unitsSold30d / 30;
    const hasEnoughHistory = unitsSold30d >= 3; // need a minimal signal before estimating
    return {
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      avgDailySales: hasEnoughHistory ? Math.round(avgDailySales * 10) / 10 : null,
      estimatedDaysRemaining: hasEnoughHistory && avgDailySales > 0 ? Math.round(p.quantity / avgDailySales) : null,
    };
  });

  // --- Store health: percentage of key profile fields that are filled in.
  const healthChecks = [
    { key: 'name', label: 'Business name', done: !!business.name },
    { key: 'description', label: 'Business description', done: !!business.description },
    { key: 'logoUrl', label: 'Profile image', done: !!business.logoUrl },
    { key: 'location', label: 'Location', done: !!business.location },
    { key: 'gpsPin', label: 'Shop pin (GPS location)', done: !!business.latitude && !!business.longitude },
    { key: 'phone', label: 'Phone number', done: !!business.phone },
    { key: 'products', label: 'At least one product listed', done: productCount > 0 },
    { key: 'deliveryOption', label: 'Delivery option set', done: business.offersDelivery !== null },
  ];
  const completedCount = healthChecks.filter((c) => c.done).length;
  const storeHealthPercent = Math.round((completedCount / healthChecks.length) * 100);

  return NextResponse.json({
    followerCount,
    productCount,
    totalOrders: orders.length,
    totalRevenue,
    pendingRevenue,
    statusCounts,
    dailyRevenue: days,
    topProducts,
    lowStock,
    storeHealth: {
      percent: storeHealthPercent,
      checks: healthChecks,
    },
  });
}