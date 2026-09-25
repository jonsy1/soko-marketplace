import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { calculateOrdersProfit } from '@/lib/pricing';

type ProductSale = {
  name: string;
  quantity: number;
  revenue: number;
  items: { price: number; costPrice: number | null; quantity: number }[];
};

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

  const allProducts = await prisma.product.findMany({
    where: { businessId: business.id, active: true },
    select: { id: true, name: true, quantity: true, imageUrl: true, createdAt: true },
  });

  const followerCount = await prisma.follow.count({ where: { businessId: business.id } });
  const productCount = allProducts.length;

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

  const productSales: Record<string, ProductSale> = {};
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSalesByProduct: Record<string, number> = {};
  for (const o of nonCancelled) {
    if (new Date(o.createdAt) < thirtyDaysAgo) continue;
    for (const item of o.items) {
      recentSalesByProduct[item.productId] = (recentSalesByProduct[item.productId] || 0) + item.quantity;
    }
  }

  const lowStockRaw = allProducts.filter((p) => p.quantity <= 5);
  const lowStock = lowStockRaw.map((p) => {
    const unitsSold30d = recentSalesByProduct[p.id] || 0;
    const avgDailySales = unitsSold30d / 30;
    const hasEnoughHistory = unitsSold30d >= 3;
    return {
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      avgDailySales: hasEnoughHistory ? Math.round(avgDailySales * 10) / 10 : null,
      estimatedDaysRemaining: hasEnoughHistory && avgDailySales > 0 ? Math.round(p.quantity / avgDailySales) : null,
    };
  });

  // --- Product health: a simple, data-backed status per active product.
  const productHealth = allProducts.map((p) => {
    const unitsSold30d = recentSalesByProduct[p.id] || 0;
    const ageInDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);

    let status = 'Performing well';
    if (p.quantity === 0) {
      status = 'Out of stock';
    } else if (p.quantity <= 5) {
      status = 'Low stock';
    } else if (!p.imageUrl) {
      status = 'Missing product image';
    } else if (unitsSold30d === 0 && ageInDays > 14) {
      status = 'No recent sales';
    }

    return { id: p.id, status };
  });

  // --- Store health.
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

  // --- Reviews / reputation.
  const [reviewAgg, recentReviews] = await Promise.all([
    prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  // --- Customer insights (from non-cancelled orders).
  const ordersByCustomer: Record<string, { orders: any[]; firstOrderAt: Date }> = {};
  for (const o of nonCancelled) {
    if (!ordersByCustomer[o.customerId]) {
      ordersByCustomer[o.customerId] = { orders: [], firstOrderAt: new Date(o.createdAt) };
    }
    ordersByCustomer[o.customerId].orders.push(o);
    if (new Date(o.createdAt) < ordersByCustomer[o.customerId].firstOrderAt) {
      ordersByCustomer[o.customerId].firstOrderAt = new Date(o.createdAt);
    }
  }
  const customerIds = Object.keys(ordersByCustomer);
  const totalCustomers = customerIds.length;
  const newCustomersThisMonth = customerIds.filter(
    (id) => ordersByCustomer[id].firstOrderAt >= thirtyDaysAgo
  ).length;
  const returningCustomers = customerIds.filter((id) => ordersByCustomer[id].orders.length > 1).length;
  const repeatPurchaseRate = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;
  const totalCustomerRevenue = nonCancelled.reduce((sum, o) => sum + o.totalPrice, 0);
  const averageOrderValue = nonCancelled.length > 0 ? Math.round(totalCustomerRevenue / nonCancelled.length) : 0;

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
    productHealth,
    storeHealth: {
      percent: storeHealthPercent,
      checks: healthChecks,
    },
    reviewSummary: {
      average: reviewAgg._avg.rating || 0,
      count: reviewAgg._count.rating,
      recent: recentReviews,
    },
    customerInsights: {
      totalCustomers,
      newCustomersThisMonth,
      returningCustomers,
      repeatPurchaseRate,
      totalCustomerRevenue,
      averageOrderValue,
    },
  });
}