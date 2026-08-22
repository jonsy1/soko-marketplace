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
