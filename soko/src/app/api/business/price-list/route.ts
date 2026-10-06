import { NextResponse } from 'next/server';
import sharp from 'sharp';
import * as opentype from 'opentype.js';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getEffectivePrice, hasRealDiscount } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

let fontCache: { bold: opentype.Font; regular: opentype.Font } | null = null;

async function loadFonts(origin: string) {
  if (fontCache) return fontCache;
  const [boldRes, regularRes] = await Promise.all([
    fetch(origin + '/fonts/inter-700.woff'),
    fetch(origin + '/fonts/inter-400.woff'),
  ]);
  if (!boldRes.ok || !regularRes.ok) {
    throw new Error('Could not load fonts');
  }
  fontCache = {
    bold: opentype.parse(await boldRes.arrayBuffer()),
    regular: opentype.parse(await regularRes.arrayBuffer()),
  };
  return fontCache;
}

// Measures text glyph-by-glyph (avoids the GSUB table opentype.js cannot parse for Inter).
function measureText(font: opentype.Font, text: string, size: number) {
  const scale = size / font.unitsPerEm;
  let width = 0;
  const items: { glyph: opentype.Glyph; offset: number }[] = [];
  Array.from(text).forEach((ch) => {
    const glyph = font.charToGlyph(ch);
    items.push({ glyph: glyph, offset: width });
    width += (glyph.advanceWidth || 0) * scale;
  });
  return { items: items, width: width };
}

// Draws text as vector shapes so the server does not need installed fonts.
function textPath(
  font: opentype.Font,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  anchor: 'start' | 'middle' | 'end' = 'start'
) {
  const m = measureText(font, text, size);
  const startX = anchor === 'middle' ? x - m.width / 2 : anchor === 'end' ? x - m.width : x;
  let d = '';
  m.items.forEach((it) => {
    d += it.glyph.getPath(startX + it.offset, y, size).toPathData(2);
  });
  return '<path d="' + d + '" fill="' + fill + '"/>';
}

export async function GET(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) return NextResponse.json({ error: 'No business found.' }, { status: 404 });

  let fonts: { bold: opentype.Font; regular: opentype.Font };
  try {
    fonts = await loadFonts(new URL(req.url).origin);
  } catch {
    return NextResponse.json({ error: 'Fonts unavailable.' }, { status: 500 });
  }
  const bold = fonts.bold;
  const regular = fonts.regular;

  const products = await prisma.product.findMany({
    where: { businessId: business.id, active: true },
    orderBy: { createdAt: 'desc' },
    take: 18,
    select: { name: true, price: true, discountPercent: true },
  });

  const width = 1080;
  const rowHeight = 92;
  const headerHeight = 260;
  const footerHeight = 170;
  const height = headerHeight + Math.max(products.length, 1) * rowHeight + footerHeight;

  let rows = '';
  products.forEach((p, i) => {
    const y = headerHeight + i * rowHeight;
    const midY = y + rowHeight / 2;
    const discounted = hasRealDiscount(p.discountPercent);
    const finalPrice = getEffectivePrice(p.price, p.discountPercent);
    const priceText = formatTZS(finalPrice);
    const priceRight = width - 96;

    if (i % 2 === 0) {
      rows += '<rect x="60" y="' + y + '" width="' + (width - 120) + '" height="' + rowHeight + '" fill="#FFFFFF" fill-opacity="0.07" rx="14"/>';
    }
    rows += textPath(bold, truncate(p.name, 26), 96, midY + 10, 30, '#FFFFFF');

    if (discounted) {
      const oldText = formatTZS(p.price);
      const oldWidth = measureText(regular, oldText, 20).width;
      const priceWidth = measureText(bold, priceText, 30).width;
      rows += textPath(regular, oldText, priceRight, midY - 18, 20, '#B8C4D9', 'end');
      rows += '<rect x="' + (priceRight - oldWidth) + '" y="' + (midY - 25) + '" width="' + oldWidth + '" height="2" fill="#B8C4D9"/>';
      rows += textPath(bold, priceText, priceRight, midY + 14, 30, '#FFB59C', 'end');
      rows += textPath(bold, '-' + p.discountPercent + '%', priceRight - priceWidth - 28, midY + 12, 26, '#F0602E', 'end');
    } else {
      rows += textPath(bold, priceText, priceRight, midY + 10, 30, '#FFB59C', 'end');
    }
  });

  const emptyState = products.length
    ? ''
    : textPath(regular, 'No products listed yet.', 60, headerHeight + 50, 28, '#FFFFFF');

  const shopUrl = 'sokotz.com/business/' + business.slug;
  const cy = height - footerHeight / 2;
  const sokoWidth = measureText(bold, 'SOKO', 44).width;

  const svg =
    '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" stop-color="#16233D"/>' +
    '<stop offset="100%" stop-color="#2F6FED"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="' + width + '" height="' + height + '" fill="url(#bg)"/>' +
    textPath(bold, 'SOKO', 60, 90, 44, '#FFFFFF') +
    textPath(bold, '.', 60 + sokoWidth, 90, 44, '#F0602E') +
    textPath(bold, truncate(business.name, 28), 60, 160, 50, '#FFFFFF') +
    '<rect x="60" y="188" width="260" height="48" rx="24" fill="#F0602E"/>' +
    textPath(bold, 'ORODHA YA BEI', 190, 221, 22, '#FFFFFF', 'middle') +
    rows +
    emptyState +
    '<rect x="0" y="' + (height - footerHeight) + '" width="' + width + '" height="' + footerHeight + '" fill="#000000" fill-opacity="0.2"/>' +
    '<circle cx="90" cy="' + cy + '" r="26" fill="#F0602E"/>' +
    '<path d="M80 ' + (cy - 10) + ' h20 a4 4 0 0 1 4 4 v12 a4 4 0 0 1 -4 4 h-14 l-8 7 v-7 h-2 a4 4 0 0 1 -4 -4 v-12 a4 4 0 0 1 4 -4 z" fill="#FFFFFF"/>' +
    textPath(bold, 'Agiza moja kwa moja:', 128, cy - 14, 26, '#FFFFFF') +
    textPath(bold, shopUrl, 128, cy + 26, 32, '#FFB59C') +
    '</svg>';

  const png = await sharp(Buffer.from(svg)).resize(width).png().toBuffer();

  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="' + business.slug + '-bei-list.png"',
      'Cache-Control': 'no-store',
    },
  });
}