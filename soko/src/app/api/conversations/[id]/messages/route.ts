import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendPushToUser } from '@/lib/push';

async function requireParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { business: { select: { ownerId: true, name: true } }, customer: { select: { id: true, name: true } } },
  });
  if (!conversation) return { ok: false, status: 404, error: 'Conversation not found.' };
  const isCustomer = conversation.customerId === userId;
  const isOwner = conversation.business.ownerId === userId;
  if (!isCustomer && !isOwner) {
    return { ok: false, status: 403, error: 'Not authorized.' };
  }
  return { ok: true, conversation, isCustomer, isOwner };
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

  // Notify whichever side did NOT send this message
  const conversation = check.conversation!;
  const senderName = message.sender.name || 'Someone';
  if (check.isCustomer) {
    // Customer sent it — notify the business owner
    sendPushToUser(conversation.business.ownerId, {
      title: `💬 New message from ${senderName}`,
      body: body.trim().slice(0, 100),
      url: `/messages/${params.id}`,
    }).catch(() => {});
  } else {
    // Seller sent it — notify the customer
    sendPushToUser(conversation.customerId, {
      title: `💬 ${conversation.business.name} replied`,
      body: body.trim().slice(0, 100),
      url: `/messages/${params.id}`,
    }).catch(() => {});
  }

  return NextResponse.json(message);
}