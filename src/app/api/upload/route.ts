import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function sanitizeFilename(filename: string) {
  const basename = filename.split(/[\\/]/).pop() || 'image';
  const extensionStart = basename.lastIndexOf('.');
  const rawName = extensionStart > 0 ? basename.slice(0, extensionStart) : basename;
  const rawExtension = extensionStart > 0 ? basename.slice(extensionStart) : '';
  const safeName = rawName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  const safeExtension = rawExtension.toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 12);

  return `${safeName || 'image'}${safeExtension}`;
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  if (!request.body && !request.bodyUsed) {
    // Vercel blob will read the request directly, just ensure it's not empty if possible
  }

  const contentType = request.headers.get('content-type') || undefined;
  if (!contentType?.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 415 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File is too large' }, { status: 413 });
  }

  try {
    const pathname = `uploads/${session.user.id}/${Date.now()}-${sanitizeFilename(filename)}`;
    const blob = await put(pathname, request, {
      access: 'public',
      addRandomSuffix: true,
      allowOverwrite: false,
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
