import { NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';
import * as opentype from 'opentype.js';
import { prisma } from '@/lib/prisma';
import { getEffectivePrice, hasRealDiscount } from '@/lib/pricing';

function formatTZS(n: number) {
  return 'TZS ' + Math.round(n).toLocaleString('en-US');
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

// Fonts are loaded once per server instance from /public/fonts and reused.
let fontCache: { bold: opentype.Font; regular: opentype.Font } | null = null;

async function loadFonts(origin: string) {
  if (fontCache) return fontCache;
  const [boldRes, regularRes] = await Promise.all([
    fetch(origin + '/fonts/inter-700.woff'),
    fetch(origin + '/fonts/inter-400.woff'),
  ]);
  if (!boldRes.ok || !regularRes.ok) {
    throw new Error('Could not load poster fonts');
  }
  fontCache = {
    bold: opentype.parse(await boldRes.arrayBuffer()),
    regular: opentype.parse(await regularRes.arrayBuffer()),
  };
  return fontCache;
}

// Draws text as vector shapes so the server does not need any installed fonts.
function textPath(
  font: opentype.Font,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
  anchor: 'start' | 'middle' = 'start'
) {
  const w = font.getAdvanceWidth(text, size);
  const startX = anchor === 'middle' ? x - w / 2 : x;
  const d = font.getPath(text, startX, y, size).toPathData(2);
  return '<path d="' + d + '" fill="' + fill + '"/>';
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { business: { select: { name: true, slug: true, phone: true, location: true } } },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  let fonts: { bold: opentype.Font; regular: opentype.Font };
  try {
    fonts = await loadFonts(new URL(req.url).origin);
  } catch {
    return NextResponse.json({ error: 'Poster fonts unavailable.' }, { status: 500 });
  }
  const bold = fonts.bold;
  const regular = fonts.regular;

  const width = 1080;
  const height = 1350;

  const photoHeight = 820;
  const infoHeight = height - photoHeight;

  const price = getEffectivePrice(product.price, product.discountPercent);
  const discounted = hasRealDiscount(product.discountPercent);

  let photoBuffer: Buffer | null = null;
  if (product.imageUrl) {
    try {
      const res = await fetch(product.imageUrl);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        photoBuffer = await sharp(Buffer.from(arrayBuffer))
          .resize(width, photoHeight, { fit: 'cover' })
          .toBuffer();
      }
    } catch {
      photoBuffer = null;
    }
  }

  const productNameSafe = truncate(product.name, 34);
  const shopNameSafe = truncate(product.business.name, 28);
  const locationSafe = product.business.location ? truncate(product.business.location, 40) : '';
  const phoneSafe = product.business.phone ? truncate(product.business.phone, 20) : '';
  const shopLink = 'sokotz.com/business/' + product.business.slug;

  // QR code pointing to the shop page. If generation fails, the poster still works without it.
  const qrSize = 170;
  const qrLeft = width - 56 - qrSize;
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer('https://www.sokotz.com/business/' + product.business.slug, {
      type: 'png',
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  } catch {
    qrBuffer = null;
  }

  const y0 = photoHeight;

  // Logo: "SOKO" in dark, "." in blue
  const sokoWidth = bold.getAdvanceWidth('SOKO', 32);

  const overlaySvg = '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#2F6FED"/>' +
    '<stop offset="100%" stop-color="#16233D"/>' +
    '</linearGradient>' +
    '<linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">' +
    '<stop offset="0%" stop-color="#000000" stop-opacity="0"/>' +
    '<stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>' +
    '</linearGradient>' +
    '</defs>' +
    (!photoBuffer ? '<rect width="' + width + '" height="' + photoHeight + '" fill="url(#bg)"/>' : '') +
    '<rect x="40" y="40" width="190" height="64" rx="32" fill="#FFFFFF"/>' +
    textPath(bold, 'SOKO', 68, 83, 32, '#16233D') +
    textPath(bold, '.', 68 + sokoWidth, 83, 32, '#2F6FED') +
    (discounted
      ? '<rect x="' + (width - 180) + '" y="40" width="140" height="64" rx="32" fill="#F0602E"/>' +
        textPath(bold, '-' + product.discountPercent + '%', width - 110, 83, 30, '#FFFFFF', 'middle')
      : '') +
    '<rect x="0" y="' + (photoHeight - 180) + '" width="' + width + '" height="180" fill="url(#fade)"/>' +
    '<rect x="0" y="' + y0 + '" width="' + width + '" height="' + infoHeight + '" fill="#16233D"/>' +
    // Product name + price
    textPath(bold, productNameSafe, 56, y0 + 70, 44, '#FFFFFF') +
    textPath(bold, formatTZS(price), 56, y0 + 135, 56, '#F0602E') +
    // Divider
    '<rect x="56" y="' + (y0 + 165) + '" width="968" height="2" fill="#2B3B5C"/>' +
    // Shop details
    textPath(bold, shopNameSafe, 56, y0 + 225, 38, '#FFFFFF') +
    (locationSafe ? textPath(regular, 'Eneo: ' + locationSafe, 56, y0 + 272, 28, '#9CA9BC') : '') +
    (phoneSafe ? textPath(bold, 'Simu: ' + phoneSafe, 56, y0 + 326, 34, '#FFFFFF') : '') +
    // QR caption
    (qrBuffer ? textPath(regular, 'Skani kuona duka', qrLeft + qrSize / 2, y0 + 370, 20, '#9CA9BC', 'middle') : '') +
    // Bottom call-to-action bar
    '<rect x="56" y="' + (y0 + 380) + '" width="968" height="110" rx="24" fill="#2F6FED"/>' +
    textPath(bold, 'Nunua kwenye sokotz.com', width / 2, y0 + 428, 32, '#FFFFFF', 'middle') +
    textPath(regular, shopLink, width / 2, y0 + 467, 26, '#DCE7FF', 'middle') +
    '</svg>';

  const composed = sharp({
    create: { width: width, height: height, channels: 4, background: { r: 22, g: 35, b: 61, alpha: 1 } },
  });

  const layers: any[] = [];
  if (photoBuffer) layers.push({ input: photoBuffer, top: 0, left: 0 });
  layers.push({ input: Buffer.from(overlaySvg), top: 0, left: 0 });
  if (qrBuffer) layers.push({ input: qrBuffer, top: y0 + 185, left: qrLeft });

  const png = await composed.composite(layers).png().toBuffer();

  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="soko-' + product.business.slug + '-' + params.id + '.png"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}