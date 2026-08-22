import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) return NextResponse.json({ error: 'No business profile.' }, { status: 404 });

  return NextResponse.json(business);
}
