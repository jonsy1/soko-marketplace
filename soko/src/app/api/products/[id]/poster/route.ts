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

// Measures text glyph-by-glyph. This deliberately avoids font.getAdvanceWidth()/getPath(text),
// because those read the GSUB table, which opentype.js cannot parse for the Inter font.
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
  const m = measureText(font, text, size);
  const startX = anchor === 'middle' ? x - m.width / 2 : x;
  let d = '';
  m.items.forEach((it) => {
    d += it.glyph.getPath(startX + it.offset, y, size).toPathData(2);
  });
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
  const shopNameSafe = truncate(product.business.name, 26);
  const locationSafe = product.business.location ? truncate(product.business.location, 36) : '';
  const phoneSafe = product.business.phone ? truncate(product.business.phone, 20) : '';
  const shopLink = 'sokotz.com/business/' + product.business.slug;

  // QR code card (white, rounded) on the right side of the info panel.
  const qrSize = 160;
  const cardW = 200;
  const cardH = 212;
  const cardLeft = width - 56 - cardW;
  const y0 = photoHeight;
  const cardTop = y0 + 182;
  let qrBuffer: Buffer | null = null;
  try {
    qrBuffer = await QRCode.toBuffer('https://www.sokotz.com/business/' + product.business.slug, {
      type: 'png',
      width: qrSize,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
  } catch {
    qrBuffer = null;
  }

  // Logo pill sized to the word, so it never leaves empty space.
  const logoSize = 36;
  const sokoWidth = measureText(bold, 'SOKO', logoSize).width;
  const dotWidth = measureText(bold, '.', logoSize).width;
  const pillPad = 28;
  const pillW = Math.round(sokoWidth + dotWidth + pillPad * 2);
  const pillH = 68;

  const priceText = formatTZS(price);
  const priceWidth = measureText(bold, priceText, 56).width;

  let overlaySvg = '';
  try {
    overlaySvg = '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#2F6FED"/>' +
      '<stop offset="100%" stop-color="#16233D"/>' +
      '</linearGradient>' +
      '<linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#000000" stop-opacity="0"/>' +
      '<stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>' +
      '</linearGradient>' +
      '<linearGradient id="panel" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#1B2D4F"/>' +
      '<stop offset="100%" stop-color="#101B33"/>' +
      '</linearGradient>' +
      '<linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="#F0602E"/>' +
      '<stop offset="100%" stop-color="#FF9A5C"/>' +
      '</linearGradient>' +
      '<linearGradient id="cta" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="#F0602E"/>' +
      '<stop offset="100%" stop-color="#FF7A45"/>' +
      '</linearGradient>' +
      '</defs>' +
      (!photoBuffer ? '<rect width="' + width + '" height="' + photoHeight + '" fill="url(#bg)"/>' : '') +
      // Soft fade at the bottom of the photo
      '<rect x="0" y="' + (photoHeight - 200) + '" width="' + width + '" height="200" fill="url(#fade)"/>' +
      // Logo pill
      '<rect x="40" y="40" width="' + pillW + '" height="' + pillH + '" rx="' + (pillH / 2) + '" fill="#FFFFFF"/>' +
      textPath(bold, 'SOKO', 40 + pillPad, 40 + 47, logoSize, '#16233D') +
      textPath(bold, '.', 40 + pillPad + sokoWidth, 40 + 47, logoSize, '#F0602E') +
      // Discount badge
      (discounted
        ? '<rect x="' + (width - 190) + '" y="40" width="150" height="' + pillH + '" rx="' + (pillH / 2) + '" fill="#F0602E"/>' +
          textPath(bold, '-' + product.discountPercent + '%', width - 115, 40 + 46, 32, '#FFFFFF', 'middle')
        : '') +
      // Info panel with orange signature strip
      '<rect x="0" y="' + y0 + '" width="' + width + '" height="' + infoHeight + '" fill="url(#panel)"/>' +
      '<rect x="0" y="' + y0 + '" width="' + width + '" height="8" fill="url(#accent)"/>' +
      // Product name + price
      textPath(bold, productNameSafe, 56, y0 + 74, 44, '#FFFFFF') +
      textPath(bold, priceText, 56, y0 + 138, 56, '#FF7A45') +
      (discounted
        ? textPath(regular, formatTZS(product.price), 56 + priceWidth + 24, y0 + 136, 30, '#8FA0BA') +
          '<rect x="' + (56 + priceWidth + 24) + '" y="' + (y0 + 126) + '" width="' + measureText(regular, formatTZS(product.price), 30).width + '" height="2" fill="#8FA0BA"/>'
        : '') +
      // Divider
      '<rect x="56" y="' + (y0 + 164) + '" width="968" height="2" fill="#2B3B5C"/>' +
      // Shop details
      textPath(bold, shopNameSafe, 56, y0 + 232, 38, '#FFFFFF') +
      (locationSafe ? textPath(regular, 'Eneo: ' + locationSafe, 56, y0 + 280, 28, '#9CA9BC') : '') +
      (phoneSafe ? textPath(bold, 'Simu: ' + phoneSafe, 56, y0 + 334, 34, '#FFFFFF') : '') +
      // QR card (caption lives inside the card)
      (qrBuffer
        ? '<rect x="' + cardLeft + '" y="' + cardTop + '" width="' + cardW + '" height="' + cardH + '" rx="22" fill="#FFFFFF"/>' +
          textPath(bold, 'Skani kuagiza', cardLeft + cardW / 2, cardTop + 196, 22, '#16233D', 'middle')
        : '') +
      // Orange call-to-action bar
      '<rect x="56" y="' + (y0 + 414) + '" width="968" height="96" rx="26" fill="url(#cta)"/>' +
      textPath(bold, 'Nunua kwenye sokotz.com', width / 2, y0 + 457, 34, '#FFFFFF', 'middle') +
      textPath(regular, shopLink, width / 2, y0 + 492, 24, '#FFE3D6', 'middle') +
      '</svg>';
  } catch (err) {
    console.error('Poster text rendering failed:', err);
    return NextResponse.json({ error: 'Poster text rendering failed.' }, { status: 500 });
  }

  const composed = sharp({
    create: { width: width, height: height, channels: 4, background: { r: 16, g: 27, b: 51, alpha: 1 } },
  });

  const layers: any[] = [];
  if (photoBuffer) layers.push({ input: photoBuffer, top: 0, left: 0 });
  layers.push({ input: Buffer.from(overlaySvg), top: 0, left: 0 });
  if (qrBuffer) layers.push({ input: qrBuffer, top: cardTop + 16, left: cardLeft + (cardW - qrSize) / 2 });

  const png = await composed.composite(layers).png().toBuffer();

  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename="soko-' + product.business.slug + '-' + params.id + '.png"',
      'Cache-Control': 'public, max-age=600',
    },
  });
}