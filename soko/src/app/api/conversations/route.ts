import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// List conversations for the logged-in user (as customer or as business owner)
export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });

  const conversations = await prisma.conversation.findMany({
    where: business
      ? { OR: [{ customerId: userId }, { businessId: business.id }] }
      : { customerId: userId },
    include: {
      business: { select: { id: true, name: true, slug: true, logoUrl: true } },
      customer: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(conversations);
}

// Start a conversation with a business (or return the existing one)
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const { businessId: idOrSlug } = await req.json();
  if (!idOrSlug) return NextResponse.json({ error: 'businessId is required.' }, { status: 400 });

  const business = await prisma.business.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    select: { id: true, ownerId: true },
  });
  if (!business) return NextResponse.json({ error: 'Business not found.' }, { status: 404 });

  if (business.ownerId === userId) {
    return NextResponse.json({ error: "You can't message your own store." }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { businessId_customerId: { businessId: business.id, customerId: userId } },
    update: {},
    create: { businessId: business.id, customerId: userId },
  });

  return NextResponse.json(conversation);
}