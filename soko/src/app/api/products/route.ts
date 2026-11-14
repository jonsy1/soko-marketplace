import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const MAX_BOOSTED = 8;
const BOOST_POOL = 40;
const PAGE_SIZE = 60;
const HERO_SLIDES = 5;
const HERO_POOL = 30;

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

  // Hero banner: only products with an active Featured promotion and a photo.
  if (searchParams.get('hero')) {
    const now = new Date();
    const heroPool: any[] = await prisma.product.findMany({
      where: {
        active: true,
        imageUrl: { not: null },
        featuredUntil: { gt: now },
        business: { status: 'VERIFIED', isOpen: true },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        business: { select: { name: true } },
        category: { select: { name: true } },
      },
      take: HERO_POOL,
    });
    return NextResponse.json(shuffle(heroPool).slice(0, HERO_SLIDES));
  }

  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category');
  const businessId = searchParams.get('businessId');
  const location = searchParams.get('location')?.trim();
  const mine = searchParams.get('mine');

  // "View more": the next batch starts after this createdAt value.
  const beforeRaw = searchParams.get('before');
  const beforeDate = beforeRaw ? new Date(beforeRaw) : null;
  const validBefore: Date | null = beforeDate && !isNaN(beforeDate.getTime()) ? beforeDate : null;

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
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
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
    if (location) where.business.location = { contains: location, mode: 'insensitive' };
  } else if (location) {
    where.business = { location: { contains: location, mode: 'insensitive' } };
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
  let nextCursor: string | null = null;
  let totalCount: number | null = null;

  if (mine) {
    products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include,
      take: PAGE_SIZE,
    });
  } else {
    // Public marketplace. The first batch starts with a rotating selection of actively
    // boosted products, then everything else by newest. Later batches ("View more")
    // continue the newest-first list from where the previous batch ended.
    const now = new Date();
    let boosted: any[] = [];
    if (!validBefore) {
      const boostedPool: any[] = await prisma.product.findMany({
        where: { AND: [where, { boostedUntil: { gt: now } }] },
        orderBy: { createdAt: 'desc' },
        include,
        take: BOOST_POOL,
      });
      boosted = shuffle(boostedPool).slice(0, MAX_BOOSTED);
    }
    const boostedIds: string[] = boosted.map((p: any) => p.id as string);

    const restWhere: any = validBefore
      ? { AND: [where, { createdAt: { lt: validBefore } }] }
      : { AND: [where, { id: { notIn: boostedIds } }] };
    const restTake = PAGE_SIZE - boosted.length;

    // Ask for one extra product to know whether there is another batch.
    const restPlusOne: any[] = await prisma.product.findMany({
      where: restWhere,
      orderBy: { createdAt: 'desc' },
      include,
      take: restTake + 1,
    });
    const hasMore = restPlusOne.length > restTake;
    const rest: any[] = restPlusOne.slice(0, restTake);
    if (hasMore && rest.length > 0) {
      nextCursor = new Date(rest[rest.length - 1].createdAt).toISOString();
    }
    products = [...boosted, ...rest];

    if (!validBefore) {
      totalCount = await prisma.product.count({ where });
    }
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

  // The response stays a plain list. The cursor and total travel in headers.
  const headers: Record<string, string> = {};
  if (nextCursor) headers['X-Next-Cursor'] = nextCursor;
  if (totalCount !== null) headers['X-Total-Count'] = String(totalCount);

  return NextResponse.json(productsWithStats, { headers });
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