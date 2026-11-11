import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { resolveAdminSession, UserRole } from '@/lib/db/store';
import { putFile } from '@/lib/file-storage';

// Max file size: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10,485,760 bytes
const MAX_IMAGE_PIXELS = 40_000_000;

const ALLOWED_ROLES: UserRole[] = ['super_admin', 'admin', 'editor'];

interface DetectedImage {
  mime: string;
  ext: string;
}

function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', ext: '.jpg' };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: '.png' };
  }
  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString('ascii');
    if (header === 'GIF87a' || header === 'GIF89a') {
      return { mime: 'image/gif', ext: '.gif' };
    }
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: '.webp' };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
    ['avif', 'avis'].includes(buffer.subarray(8, 12).toString('ascii'))
  ) {
    return { mime: 'image/avif', ext: '.avif' };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden: insufficient privileges' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Enforce 10MB criteria
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        {
          error: `File size (${sizeInMB} MB) exceeds maximum allowed limit of 10 MB. Please upload an image under 10 MB.`,
        },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate the actual file content, not the client-supplied name/MIME type.
    const detected = detectImageType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: JPG, PNG, GIF, WEBP, AVIF.' },
        { status: 415 }
      );
    }

    // Decode the image and reject decompression bombs or malformed files that
    // pass a shallow magic-byte check.
    try {
      const metadata = await sharp(buffer, { limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
      if (!metadata.width || !metadata.height) throw new Error('Missing image dimensions');
    } catch {
      return NextResponse.json(
        { error: 'The uploaded image is malformed or exceeds the supported dimensions.' },
        { status: 422 }
      );
    }

    // Create unique, safe filename. Extension is derived from detected content.
    const cleanBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80) || 'upload';
    const filename = `${Date.now()}_${cleanBase}${detected.ext}`;

    // Supabase Storage when hosted, public/uploads locally. Either way the
    // public URL stays /uploads/<name> (served by /api/uploads when needed).
    await putFile('uploads', filename, buffer, detected.mime);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      mimeType: detected.mime,
      sizeBytes: file.size,
      maxLimit: '10 MB',
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
