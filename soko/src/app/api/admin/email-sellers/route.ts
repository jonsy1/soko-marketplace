import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const { mode, businessId, subject, message } = await req.json();

  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 });
  }

  let recipients: { email: string; name: string }[] = [];

  if (mode === 'individual') {
    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required for individual mode.' }, { status: 400 });
    }
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: { select: { email: true, name: true } } },
    });
    if (!business?.owner?.email) {
      return NextResponse.json({ error: 'Seller has no email on file.' }, { status: 404 });
    }
    recipients = [{ email: business.owner.email, name: business.owner.name }];
  } else {
    // Broadcast to all sellers with a business profile and an email address.
    const businesses = await prisma.business.findMany({
      include: { owner: { select: { email: true, name: true } } },
    });
    recipients = businesses
      .filter((b) => !!b.owner?.email)
      .map((b) => ({ email: b.owner!.email, name: b.owner!.name }));
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found.' }, { status: 404 });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <p>${message.replace(/\n/g, '<br/>')}</p>
      <hr style="margin-top: 24px; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Sent from the Soko team.</p>
    </div>
  `;

  // Send sequentially with a small delay to stay well within Resend's
  // rate limits when broadcasting to many sellers at once.
  let sent = 0;
  for (const r of recipients) {
    await sendEmail(r.email, subject, html);
    sent++;
  }

  return NextResponse.json({ sent, total: recipients.length });
}