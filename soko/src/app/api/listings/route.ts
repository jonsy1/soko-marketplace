import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

const CATEGORIES: string[] = [
  'Usafiri na usafirishaji',
  'Picha na video',
  'Ujenzi',
  'Sheria na uhasibu',
  'Uchapishaji na ubunifu',
  'Teknolojia',
  'Mengineyo',
];

const MAX_PENDING_PER_USER = 3;

// Accepts 07XXXXXXXX or 2557XXXXXXXX (spaces, + and dashes are ignored).
function cleanPhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length === 10 && digits.startsWith('0')) return '255' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('255')) return digits;
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get('categories')) {
    return NextResponse.json(CATEGORIES);
  }

  const category = searchParams.get('category');
  const q = searchParams.get('q')?.trim();

  // Public list: only approved listings that have not expired.
  const where: any = { status: 'APPROVED', activeUntil: { gt: new Date() } };
  if (category && CATEGORIES.includes(category)) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const listings: any[] = await prisma.companyListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      phone: true,
      location: true,
      website: true,
      bannerUrl: true,
    },
  });

  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Tafadhali ingia kwanza.' }, { status: 401 });
  }

  const body = await req.json();

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const phoneRaw = typeof body.phone === 'string' ? body.phone : '';
  const locationRaw = typeof body.location === 'string' ? body.location.trim() : '';
  let website = typeof body.website === 'string' ? body.website.trim() : '';
  const bannerUrl = typeof body.bannerUrl === 'string' ? body.bannerUrl.trim() : '';

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ error: 'Andika jina la kampuni (herufi 2 hadi 80).' }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Chagua kategoria.' }, { status: 400 });
  }
  if (description.length < 10) {
    return NextResponse.json({ error: 'Andika maelezo mafupi ya huduma zako (angalau herufi 10).' }, { status: 400 });
  }
  if (description.length > 300) {
    return NextResponse.json({ error: 'Maelezo ni marefu mno (kikomo ni herufi 300).' }, { status: 400 });
  }

  const phone = cleanPhone(phoneRaw);
  if (!phone) {
    return NextResponse.json(
      { error: 'Weka namba sahihi ya WhatsApp, mfano 0712345678.' },
      { status: 400 }
    );
  }

  if (website) {
    if (!/^https?:\/\//i.test(website)) website = 'https://' + website;
    if (website.length > 200) {
      return NextResponse.json({ error: 'Kiungo cha tovuti ni kirefu mno.' }, { status: 400 });
    }
  }

  if (bannerUrl && (!bannerUrl.startsWith('https://') || bannerUrl.length > 500)) {
    return NextResponse.json({ error: 'Picha ya banner si sahihi. Ipakie tena.' }, { status: 400 });
  }

  const pendingCount: number = await prisma.companyListing.count({
    where: { ownerId: userId, status: 'PENDING' },
  });
  if (pendingCount >= MAX_PENDING_PER_USER) {
    return NextResponse.json(
      { error: 'Una matangazo ' + MAX_PENDING_PER_USER + ' yanayosubiri ukaguzi. Subiri yakaguliwe kwanza.' },
      { status: 400 }
    );
  }

  const created: any = await prisma.companyListing.create({
    data: {
      name: name,
      category: category,
      description: description,
      phone: phone,
      location: locationRaw ? locationRaw.slice(0, 80) : null,
      website: website || null,
      bannerUrl: bannerUrl || null,
      ownerId: userId,
    },
  });

  // Tell the admin(s) there is a new listing to review. Never blocks the submission.
  try {
    const admins: any[] = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true },
      take: 3,
    });
    for (const a of admins) {
      if (!a.email) continue;
      await sendEmail(
        a.email,
        'Tangazo jipya la kampuni linasubiri ukaguzi',
        '<div style="font-family: sans-serif; max-width: 480px;">' +
          '<p>Kuna tangazo jipya la kampuni: <strong>' + name + '</strong> (' + category + ').</p>' +
          '<p>Liangalie kwenye Admin, sehemu ya Company listings.</p>' +
          '</div>'
      );
    }
  } catch (err) {
    console.error('Admin listing notice failed:', err);
  }

  return NextResponse.json({ id: created.id, status: created.status });
}