import { NextResponse } from 'next/server';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { prisma } from '@/lib/prisma';
import { getEffectivePrice, hasRealDiscount } from '@/lib/pricing';

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

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { business: { select: { name: true, slug: true, phone: true, location: true } } },
  });

  if (!product || !product.active) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

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
    '<text x="68" y="83" font-family="sans-serif" font-size="32" font-weight="800" fill="#16233D">SOKO<tspan fill="#2F6FED">.</tspan></text>' +
    (discounted
      ? '<rect x="' + (width - 180) + '" y="40" width="140" height="64" rx="32" fill="#F0602E"/>' +
        '<text x="' + (width - 110) + '" y="83" font-family="sans-serif" font-size="30" font-weight="800" text-anchor="middle" fill="#FFFFFF">-' + product.discountPercent + '%</text>'
      : '') +
    '<rect x="0" y="' + (photoHeight - 180) + '" width="' + width + '" height="180" fill="url(#fade)"/>' +
    '<rect x="0" y="' + y0 + '" width="' + width + '" height="' + infoHeight + '" fill="#16233D"/>' +
    // Product name + price
    '<text x="56" y="' + (y0 + 70) + '" font-family="sans-serif" font-size="44" font-weight="800" fill="#FFFFFF">' + escapeXml(productNameSafe) + '</text>' +
    '<text x="56" y="' + (y0 + 135) + '" font-family="sans-serif" font-size="56" font-weight="800" fill="#F0602E">' + formatTZS(price) + '</text>' +
    // Divider
    '<rect x="56" y="' + (y0 + 165) + '" width="968" height="2" fill="#2B3B5C"/>' +
    // Shop details
    '<text x="56" y="' + (y0 + 225) + '" font-family="sans-serif" font-size="38" font-weight="800" fill="#FFFFFF">' + escapeXml(shopNameSafe) + '</text>' +
    (locationSafe
      ? '<text x="56" y="' + (y0 + 272) + '" font-family="sans-serif" font-size="28" fill="#9CA9BC">Eneo: ' + escapeXml(locationSafe) + '</text>'
      : '') +
    (phoneSafe
      ? '<text x="56" y="' + (y0 + 326) + '" font-family="sans-serif" font-size="34" font-weight="800" fill="#FFFFFF">Simu: ' + escapeXml(phoneSafe) + '</text>'
      : '') +
    // QR caption
    (qrBuffer
      ? '<text x="' + (qrLeft + qrSize / 2) + '" y="' + (y0 + 370) + '" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#9CA9BC">Skani kuona duka</text>'
      : '') +
    // Bottom call-to-action bar
    '<rect x="56" y="' + (y0 + 380) + '" width="968" height="110" rx="24" fill="#2F6FED"/>' +
    '<text x="' + (width / 2) + '" y="' + (y0 + 428) + '" font-family="sans-serif" font-size="32" font-weight="800" text-anchor="middle" fill="#FFFFFF">Nunua kwenye sokotz.com</text>' +
    '<text x="' + (width / 2) + '" y="' + (y0 + 467) + '" font-family="sans-serif" font-size="26" text-anchor="middle" fill="#DCE7FF">' + escapeXml(shopLink) + '</text>' +
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