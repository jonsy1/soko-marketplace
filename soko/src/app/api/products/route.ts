import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const MAX_BOOSTED = 8;
const BOOST_POOL = 40;
const PAGE_SIZE = 60;

function shuffle<T>(items: T[]): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  const businessId = searchParams.get('businessId');
  const location = searchParams.get('location')?.trim();
  const mine = searchParams.get('mine');

  const where: any = { active: true };

  if (mine) {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    const business = await prisma.business.findUnique({ where: { ownerId: userId } });
    if (!business) return NextResponse.json([]);
    delete where.active;
    where.businessId = business.id;
  }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (category) {
    const cat = await prisma.category.findUnique({
      where: { slug: category },
      include: { children: { select: { id: true } } },
    });
    if (cat) {
      const ids = [cat.id, ...cat.children.map((c) => c.id)];
      where.categoryId = { in: ids };
    } else {
      where.category = { slug: category };
    }
  }
  if (businessId) where.businessId = businessId;
  if (!mine) {
    where.business = { status: 'VERIFIED', isOpen: true };
    if (location) where.business.location = { contains: location };
  } else if (location) {
    where.business = { location: { contains: location } };
  }

  const include = {
    business: {
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        status: true,
        offersDelivery: true,
        latitude: true,
        longitude: true,
        phone: true,
        logoUrl: true,
        description: true,
        isOpen: true,
      },
    },
    category: { select: { name: true, slug: true } },
  };

  let products: any[] = [];
  if (mine) {
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
      take: PAGE_SIZE,
    });
  } else {
    // Public marketplace: a rotating selection of actively boosted products first,
    // then everything else by newest. Boosted products that are not selected in this
    // request still appear in the normal list, so none disappear.
    const now = new Date();
    const boostedPool: any[] = await prisma.product.findMany({
      where: { AND: [where, { boostedUntil: { gt: now } }] },
      orderBy: { createdAt: 'desc' },
      include,
      take: BOOST_POOL,
    });
    const boosted: any[] = shuffle(boostedPool).slice(0, MAX_BOOSTED);
    const boostedIds: string[] = boosted.map((p: any) => p.id as string);

    const rest: any[] = await prisma.product.findMany({
      where: { AND: [where, { id: { notIn: boostedIds } }] },
      orderBy: { createdAt: 'desc' },
      include,
      take: PAGE_SIZE - boosted.length,
    });
    products = [...boosted, ...rest];
  }

  // Compute review average/count per business in ONE query, instead of
  // sending every individual review rating for every product.
  const businessIds: string[] = Array.from(
    new Set<string>(products.map((p: any) => p.businessId as string))
  );
  const reviewStats = businessIds.length
    ? await prisma.review.groupBy({
        by: ['businessId'],
        where: { businessId: { in: businessIds } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const statsMap = new Map(
    reviewStats.map((r) => [r.businessId, { avgRating: r._avg.rating || 0, reviewCount: r._count.rating }])
  );

  const productsWithStats = products.map((p: any) => ({
    ...p,
    business: p.business
      ? {
          ...p.business,
          avgRating: statsMap.get(p.businessId)?.avgRating || 0,
          reviewCount: statsMap.get(p.businessId)?.reviewCount || 0,
        }
      : p.business,
  }));

  return NextResponse.json(productsWithStats);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) {
    return NextResponse.json({ error: 'You need a business profile before adding products.' }, { status: 403 });
  }

  const { name, description, price, costPrice, quantity, imageUrl, categoryId } = await req.json();
  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      costPrice: costPrice !== undefined && costPrice !== '' ? parseFloat(costPrice) : null,
      quantity: quantity ? parseInt(quantity) : 0,
      imageUrl,
      categoryId: categoryId || null,
      businessId: business.id,
    },
  });

  return NextResponse.json(product);
}