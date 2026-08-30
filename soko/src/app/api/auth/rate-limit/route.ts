import { NextResponse } from 'next/server';
import { checkRateLimit, recordAttempt } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(req: Request) {
  const { email, action } = await req.json();
  if (!email || !action) {
    return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
  }

  const identifier = `login:${String(email).toLowerCase().trim()}`;

  if (action === 'check') {
    const result = await checkRateLimit(identifier, MAX_ATTEMPTS, WINDOW_MINUTES);
    return NextResponse.json(result);
  }

  if (action === 'record') {
    await recordAttempt(identifier);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}