import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  const businessId = searchParams.get('businessId');
  const location = searchParams.get('location')?.trim();
  const mine = searchParams.get('mine');

  const where: any = { active: true };

  if (mine) {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    const business = await prisma.business.findUnique({ where: { ownerId: userId } });
    if (!business) return NextResponse.json([]);
    delete where.active;
    where.businessId = business.id;
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
      include: { children: { select: { id: true } } },
    });
    if (cat) {
      const ids = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: ids };
    } else {
      where.category = { slug: category };
    }
  }
  if (businessId) where.businessId = businessId;
  if (!mine) {
    where.business = { status: 'VERIFIED', isOpen: true };
    if (location) where.business.location = { contains: location };
  } else if (location) {
    where.business = { location: { contains: location } };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      business: { select: { id: true, name: true, slug: true, location: true, status: true, offersDelivery: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 60,
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) {
    return NextResponse.json({ error: 'You need a business profile before adding products.' }, { status: 403 });
  }

  const { name, description, price, quantity, imageUrl, categoryId } = await req.json();
  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      quantity: quantity ? parseInt(quantity) : 0,
      imageUrl,
      categoryId: categoryId || null,
      businessId: business.id,
    },
  });

  return NextResponse.json(product);
}