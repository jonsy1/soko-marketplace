import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const BOOST_DAYS = 3;
const FEATURED_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const BOOST_LIMIT = 20;
const FEATURED_LIMIT = 5;

const productSelect = {
  id: true,
  name: true,
  price: true,
  boostedUntil: true,
  featuredUntil: true,
  business: { select: { name: true } },
};

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  return role === 'ADMIN';
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const now = new Date();

  // Summary mode: how many promotions are active right now.
  if (searchParams.get('summary')) {
    const boostActive: number = await prisma.product.count({ where: { boostedUntil: { gt: now } } });
    const featuredActive: number = await prisma.product.count({ where: { featuredUntil: { gt: now } } });
    return NextResponse.json({
      boostActive: boostActive,
      boostLimit: BOOST_LIMIT,
      featuredActive: featuredActive,
      featuredLimit: FEATURED_LIMIT,
    });
  }

  const q = searchParams.get('q')?.trim();

  const where: any = q
    ? { name: { contains: q, mode: 'insensitive' } }
    : { OR: [{ boostedUntil: { gt: now } }, { featuredUntil: { gt: now } }] };

  const products: any[] = await prisma.product.findMany({
    where,
    select: productSelect,
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { productId, action } = await req.json();
  if (!productId || !action) {
    return NextResponse.json({ error: 'productId and action are required.' }, { status: 400 });
  }

  const product: any = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, boostedUntil: true, featuredUntil: true },
  });
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  const now = Date.now();
  const data: any = {};

  if (action === 'boost') {
    const current = product.boostedUntil ? new Date(product.boostedUntil).getTime() : 0;
    const base = Math.max(now, current);
    data.boostedUntil = new Date(base + BOOST_DAYS * DAY_MS);
  } else if (action === 'featured') {
    const current = product.featuredUntil ? new Date(product.featuredUntil).getTime() : 0;
    const base = Math.max(now, current);
    data.featuredUntil = new Date(base + FEATURED_DAYS * DAY_MS);
  } else if (action === 'remove-boost') {
    data.boostedUntil = null;
  } else if (action === 'remove-featured') {
    data.featuredUntil = null;
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  const updated: any = await prisma.product.update({
    where: { id: productId },
    data,
    select: productSelect,
  });

  return NextResponse.json(updated);
}