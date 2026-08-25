import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function resolveBusinessId(idOrSlug: string) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true },
  });
  return business?.id || null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const businessId = await resolveBusinessId(params.id);
  if (!businessId) return NextResponse.json({ error: 'Business not found.' }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: { userId_businessId: { userId, businessId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { userId, businessId } });
  return NextResponse.json({ following: true });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const businessId = await resolveBusinessId(params.id);
  if (!businessId) return NextResponse.json({ error: 'Business not found.' }, { status: 404 });

  const followerCount = await prisma.follow.count({ where: { businessId } });

  let following = false;
  if (userId) {
    const existing = await prisma.follow.findUnique({
      where: { userId_businessId: { userId, businessId } },
    });
    following = !!existing;
  }

  return NextResponse.json({ following, followerCount });
}