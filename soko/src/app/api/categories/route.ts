import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function baseSlug(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function uniqueSlug(name: string) {
  const base = baseSlug(name);
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.category.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
      children: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
  const { name, parentId } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) return NextResponse.json({ error: 'Parent category not found.' }, { status: 404 });
    if (parent.parentId) {
      return NextResponse.json(
        { error: 'Subcategories can only be one level deep.' },
        { status: 400 }
      );
    }
  }

  const slug = await uniqueSlug(name);
  const category = await prisma.category.create({
    data: { name, slug, parentId: parentId || null },
  });
  return NextResponse.json(category);
}
