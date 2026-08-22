import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
