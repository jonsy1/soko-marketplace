import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/auth';

export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        const userId = (session?.user as any)?.id;
        if (!userId) {
          throw new Error('You must be logged in to upload images.');
        }
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No DB write needed here — the client saves the returned URL onto the product itself.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed.' }, { status: 400 });
  }
}