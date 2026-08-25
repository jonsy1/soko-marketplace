import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const productId = params.id;

  const existing = await prisma.like.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { userId, productId } });
  return NextResponse.json({ liked: true });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const productId = params.id;

  const likeCount = await prisma.like.count({ where: { productId } });

  let liked = false;
  if (userId) {
    const existing = await prisma.like.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    liked = !!existing;
  }

  return NextResponse.json({ liked, likeCount });
}