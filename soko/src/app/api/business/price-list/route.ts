import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getDisplayOriginalPrice, DISCOUNT_RATE } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { businessId: business.id, active: true },
    orderBy: { createdAt: 'desc' },
    take: 18,
    select: { name: true, price: true },
  });

  const width = 1080;
  const rowHeight = 92;
  const headerHeight = 300;
  const footerHeight = 170;
  const height = headerHeight + Math.max(products.length, 1) * rowHeight + footerHeight;

  const rows = products
    .map((p, i) => {
      const y = headerHeight + i * rowHeight;
      const zebra = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'transparent';
      const wasPrice = getDisplayOriginalPrice(p.price);
      return `
        <rect x="60" y="${y}" width="${width - 120}" height="${rowHeight}" fill="${zebra}" rx="14"/>
        <text x="96" y="${y + rowHeight / 2 + 10}" font-family="sans-serif" font-size="30" font-weight="700" fill="#FFFFFF">${escapeXml(
          p.name
        )}</text>
        <text x="${width - 96}" y="${y + rowHeight / 2 + 10}" font-family="sans-serif" font-size="30" font-weight="800" text-anchor="end" fill="#FDE68A">${formatTZS(
          p.price
        )}</text>
        <text x="${width - 96}" y="${y + rowHeight / 2 - 16}" font-family="sans-serif" font-size="18" text-anchor="end" fill="#C4B5FD" text-decoration="line-through">${formatTZS(
          wasPrice
        )}</text>
      `;
    })
    .join('');

  const emptyState = products.length
    ? ''
    : `<text x="60" y="${headerHeight + 50}" font-family="sans-serif" font-size="28" fill="#FFFFFF">No products listed yet.</text>`;

  const shopUrl = `sokotz.com/business/${business.slug}`;

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2A0E52"/>
      <stop offset="55%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <text x="60" y="90" font-family="sans-serif" font-size="44" font-weight="800" fill="#FFFFFF">SOKO<tspan fill="#FDE68A">.</tspan></text>
  <text x="60" y="158" font-family="sans-serif" font-size="50" font-weight="800" fill="#FFFFFF">${escapeXml(
    business.name
  )}</text>

  <rect x="60" y="186" width="300" height="52" rx="26" fill="url(#gold)"/>
  <text x="90" y="221" font-family="sans-serif" font-size="24" font-weight="800" fill="#2A0E52">PUNGUZO LA ${DISCOUNT_RATE * 100}%</text>

  ${rows}
  ${emptyState}

  <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="rgba(0,0,0,0.18)"/>
  <circle cx="90" cy="${height - footerHeight / 2}" r="26" fill="url(#gold)"/>
  <path d="M80 ${height - footerHeight / 2 - 10} h20 a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 h-14 l-8 7 v-7 h-2 a4 4 0 0 1 -4 -4 v-12 a4 4 0 0 1 4 -4 z" fill="#2A0E52"/>
  <text x="128" y="${height - footerHeight / 2 - 14}" font-family="sans-serif" font-size="26" font-weight="700" fill="#FFFFFF">Agiza moja kwa moja:</text>
  <text x="128" y="${height - footerHeight / 2 + 26}" font-family="sans-serif" font-size="32" font-weight="800" fill="#FDE68A">${shopUrl}</text>
</svg>
`;

  const png = await sharp(Buffer.from(svg)).resize(width).png().toBuffer();

  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="${business.slug}-bei-list.png"`,
      'Cache-Control': 'no-store',
    },
  });
}