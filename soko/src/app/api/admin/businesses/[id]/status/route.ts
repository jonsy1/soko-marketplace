import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { status } = await req.json();
  const allowed = ['PENDING', 'VERIFIED', 'SUSPENDED'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const updated = await prisma.business.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}
