import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const BATCH = 3;

// One-off admin tool: moves old base64 product images into Vercel Blob.
//   /api/admin/migrate-images          -> shows how many are left (changes nothing)
//   /api/admin/migrate-images?run=1    -> migrates the next batch
export async function GET(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const run = new URL(req.url).searchParams.get('run');
  const where: any = { imageUrl: { startsWith: 'data:' } };
  const remainingBefore = await prisma.product.count({ where });

  if (!run) {
    return NextResponse.json({ base64ProductsRemaining: remainingBefore });
  }

  const rows: any[] = await prisma.product.findMany({
    where,
    select: { id: true, imageUrl: true },
    take: BATCH,
  });

  const migrated: any[] = [];
  const failed: any[] = [];

  for (const row of rows) {
    try {
      const dataUrl: string = row.imageUrl || '';
      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        failed.push({ id: row.id, reason: 'Not a base64 image' });
        continue;
      }
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length === 0) {
        failed.push({ id: row.id, reason: 'Empty image' });
        continue;
      }
      const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

      const blob = await put('products/' + row.id + '.' + ext, buffer, {
        access: 'public',
        contentType: mime,
        addRandomSuffix: true,
      });

      if (!blob.url || !blob.url.startsWith('https://')) {
        failed.push({ id: row.id, reason: 'Upload returned no URL' });
        continue;
      }

      await prisma.product.update({ where: { id: row.id }, data: { imageUrl: blob.url } });
      migrated.push({ id: row.id, beforeKB: Math.round(dataUrl.length / 1024), url: blob.url });
    } catch (err: any) {
      failed.push({ id: row.id, reason: String(err && err.message ? err.message : err) });
    }
  }

  const remainingAfter = await prisma.product.count({ where });
  return NextResponse.json({ migrated, failed, base64ProductsRemaining: remainingAfter });
}