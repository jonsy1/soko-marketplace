import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6)
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const nearby = searchParams.get('nearby');
  const category = searchParams.get('category');

  // Public "shops near you" mode - safe public fields only
  if (nearby) {
    const where: any = {
      status: 'VERIFIED',
      isOpen: true,
      latitude: { not: null },
      longitude: { not: null },
    };

    if (category) {
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        const ids = [cat.id, ...cat.children.map((c) => c.id)];
        where.products = { some: { categoryId: { in: ids }, active: true } };
      }
    }

    const publicBusinesses = await prisma.business.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        location: true,
        latitude: true,
        longitude: true,
        phone: true,
        isOpen: true,
        reviews: { select: { rating: true } },
      },
      take: 100,
    });

    return NextResponse.json(publicBusinesses);
  }

  // Existing admin behavior - unchanged
  const businesses = await prisma.business.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } }, owner: { select: { name: true, email: true } } },
  });
  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
  }

  const existing = await prisma.business.findUnique({ where: { ownerId: (session.user as any).id } });
  if (existing) {
    return NextResponse.json({ error: 'You already have a business profile.' }, { status: 409 });
  }

  const { name, description, location, phone, offersDelivery, logoUrl } = await req.json();
  if (!name || !location || !phone) {
    return NextResponse.json({ error: 'Business name, location and phone are required.' }, { status: 400 });
  }

  const business = await prisma.business.create({
    data: {
      name,
      slug: slugify(name),
      description,
      location,
      phone,
      offersDelivery: !!offersDelivery,
      logoUrl,
      ownerId: (session.user as any).id,
    },
  });

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { role: 'BUSINESS' },
  });

  return NextResponse.json(business);
}