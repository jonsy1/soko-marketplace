import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { business: true } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  const isSeller = order.business.ownerId === userId;
  const isCustomer = order.customerId === userId;
  if (!isSeller && !isCustomer && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  const { status } = await req.json();
  const allowed = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  // Customers may only cancel; sellers/admins can set any status
  if (isCustomer && !isSeller && role !== 'ADMIN' && status !== 'CANCELLED') {
    return NextResponse.json({ error: 'Customers can only cancel an order.' }, { status: 403 });
  }

  const updated = await prisma.order.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json(updated);
}
