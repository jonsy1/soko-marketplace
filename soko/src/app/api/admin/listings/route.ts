import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  return role === 'ADMIN';
}

function emailHtml(lines: string[]) {
  const body = lines.map((l) => '<p>' + l + '</p>').join('');
  return (
    '<div style="font-family: sans-serif; max-width: 480px;">' +
    body +
    '<hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />' +
    '<p style="color: #999; font-size: 12px;">Timu ya Soko</p>' +
    '</div>'
  );
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = {};
  if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
    where.status = status;
  }

  const listings: any[] = await prisma.companyListing.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { owner: { select: { name: true, email: true } } },
  });

  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const body = await req.json();
  const id: string = body.id;
  const action: string = body.action;
  if (!id || !action) {
    return NextResponse.json({ error: 'id and action are required.' }, { status: 400 });
  }

  const listing: any = await prisma.companyListing.findUnique({
    where: { id: id },
    include: { owner: { select: { name: true, email: true } } },
  });
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
  }

  let days = parseInt(body.days);
  if (isNaN(days) || days < 1) days = DEFAULT_DAYS;
  if (days > MAX_DAYS) days = MAX_DAYS;

  const now = Date.now();
  const data: any = {};
  let mailSubject = '';
  let mailLines: string[] = [];

  if (action === 'approve') {
    data.status = 'APPROVED';
    data.rejectionReason = null;
    data.activeUntil = new Date(now + days * DAY_MS);
    mailSubject = 'Tangazo la kampuni yako limekubaliwa kwenye Soko';
    mailLines = [
      'Habari,',
      'Tangazo la <strong>' + listing.name + '</strong> limekubaliwa na sasa linaonekana kwenye Soko kwa siku ' + days + '.',
      'Asante kwa kuwa sehemu ya Soko.',
    ];
  } else if (action === 'extend') {
    if (listing.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only approved listings can be extended.' }, { status: 400 });
    }
    const current = listing.activeUntil ? new Date(listing.activeUntil).getTime() : 0;
    data.activeUntil = new Date(Math.max(now, current) + days * DAY_MS);
  } else if (action === 'reject') {
    const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
    if (!reason) {
      return NextResponse.json({ error: 'Please write a reason for rejecting.' }, { status: 400 });
    }
    data.status = 'REJECTED';
    data.rejectionReason = reason.slice(0, 300);
    data.activeUntil = null;
    mailSubject = 'Tangazo la kampuni yako halikukubaliwa';
    mailLines = [
      'Habari,',
      'Tangazo la <strong>' + listing.name + '</strong> halikukubaliwa kwa sasa.',
      'Sababu: ' + data.rejectionReason,
      'Unaweza kurekebisha na kuwasilisha tena. Ukihitaji msaada, tuandikie.',
    ];
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  const updated: any = await prisma.companyListing.update({
    where: { id: id },
    data: data,
    include: { owner: { select: { name: true, email: true } } },
  });

  // Email the owner about approval or rejection. Never blocks the admin action.
  if (mailSubject && listing.owner && listing.owner.email) {
    try {
      await sendEmail(listing.owner.email, mailSubject, emailHtml(mailLines));
    } catch (err) {
      console.error('Listing email failed:', err);
    }
  }

  return NextResponse.json(updated);
}