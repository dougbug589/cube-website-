import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCMSStore, verifyAdminToken, UserRole } from '@/lib/db/store';

// Max file size: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10,485,760 bytes

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
    const token = req.cookies.get('cube_admin_session')?.value;
    const session = token ? verifyAdminToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = getCMSStore();
    const user = store.users.find((u) => u.id === session.userId);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Unauthorized: inactive account' }, { status: 401 });
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

    // Create unique, safe filename. Extension is derived from detected content.
    const cleanBase = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80) || 'upload';
    const filename = `${Date.now()}_${cleanBase}${detected.ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

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
