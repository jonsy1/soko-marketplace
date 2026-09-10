import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');
  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required.' }, { status: 400 });
  }

  const [reviews, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { customer: { select: { name: true } } },
    }),
    prisma.review.aggregate({
      where: { businessId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return NextResponse.json({
    reviews,
    average: aggregate._avg.rating || 0,
    count: aggregate._count.rating,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'You must be logged in to leave a review.' }, { status: 401 });
  }

  const { businessId, rating, comment } = await req.json();

  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required.' }, { status: 400 });
  }
  const ratingNum = parseInt(rating);
  if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: {
      businessId_customerId: {
        businessId,
        customerId: userId,
      },
    },
    update: {
      rating: ratingNum,
      comment: comment || null,
    },
    create: {
      businessId,
      customerId: userId,
      rating: ratingNum,
      comment: comment || null,
    },
  });

  return NextResponse.json(review);
}