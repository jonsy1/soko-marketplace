import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

async function requireParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { business: { select: { ownerId: true } } },
  });
  if (!conversation) return { ok: false, status: 404, error: 'Conversation not found.' };
  const isCustomer = conversation.customerId === userId;
  const isOwner = conversation.business.ownerId === userId;
  if (!isCustomer && !isOwner) {
    return { ok: false, status: 403, error: 'Not authorized.' };
  }
  return { ok: true, conversation };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const check = await requireParticipant(params.id, userId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const messages = await prisma.conversationMessage.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const check = await requireParticipant(params.id, userId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { body } = await req.json();
  if (!body || !body.trim()) {
    return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
  }

  const message = await prisma.conversationMessage.create({
    data: {
      body: body.trim(),
      conversationId: params.id,
      senderId: userId,
    },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json(message);
}