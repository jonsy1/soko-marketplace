import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      business: true,
      category: true,
    },
  });
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const hidden = product.business.status === 'SUSPENDED' || !product.business.isOpen;
  if (hidden) {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;
    const isOwnerOrAdmin = userId === product.business.ownerId || role === 'ADMIN';
    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }
  }

  return NextResponse.json(product);
}

async function requireProductOwner(productId: string) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!userId) return { ok: false as const, status: 401, error: 'You must be logged in.' };

  const product = await prisma.product.findUnique({ where: { id: productId }, include: { business: true } });
  if (!product) return { ok: false as const, status: 404, error: 'Product not found.' };
  if (product.business.ownerId !== userId && role !== 'ADMIN') {
    return { ok: false as const, status: 403, error: 'Not authorized.' };
  }
  return { ok: true as const, product };
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const check = await requireProductOwner(params.id);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await req.json();
  const data: any = {};
  for (const field of ['name', 'description', 'imageUrl', 'categoryId', 'active']) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.price !== undefined) data.price = parseFloat(body.price);
  if (body.quantity !== undefined) data.quantity = parseInt(body.quantity);

  const updated = await prisma.product.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const check = await requireProductOwner(params.id);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}