import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function requireOwnerOrAdmin(businessId: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return { ok: false, status: 401, error: 'You must be logged in.' };
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { ok: false, status: 404, error: 'Business not found.' };
  if (business.ownerId !== userId && role !== 'ADMIN') {
    return { ok: false, status: 403, error: 'Not authorized.' };
  }
  return { ok: true, business };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const business = await prisma.business.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    include: {
      products: { where: { active: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!business) return NextResponse.json({ error: 'Business not found.' }, { status: 404 });
  return NextResponse.json(business);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const check = await requireOwnerOrAdmin(params.id);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });
  const body = await req.json();
  const session = await auth();
  const role = (session?.user as any)?.role;
  const data: any = {};
  for (const field of [
    'name',
    'description',
    'location',
    'phone',
    'offersDelivery',
    'logoUrl',
    'latitude',
    'longitude',
  ]) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (role === 'ADMIN' && body.status) data.status = body.status;
  const updated = await prisma.business.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}