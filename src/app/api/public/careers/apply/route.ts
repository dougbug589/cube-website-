import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCMSStore, saveCMSStore } from '@/lib/db/store';

// Max file size: 10MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const fullName = (formData.get('fullName') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const phone = (formData.get('phone') as string || '').trim();
    const experience = (formData.get('experience') as string || '').trim();
    const domain = (formData.get('domain') as string || '').trim();
    const jobTitle = (formData.get('jobTitle') as string || 'General Talent Network').trim();
    const coverLetter = (formData.get('coverLetter') as string || '').trim();
    const resumeFile = formData.get('resume') as File | null;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: 'Full name and email are required fields.' },
        { status: 400 }
      );
    }

    let resumeUrl = '';

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'File size exceeds 10MB limit.' },
          { status: 400 }
        );
      }

      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const cleanFileName = resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      const destPath = path.join(uploadsDir, uniqueFileName);

      fs.writeFileSync(destPath, buffer);
      resumeUrl = `/uploads/resumes/${uniqueFileName}`;
    }

    const store = getCMSStore();
    if (!store.jobApplications) {
      store.jobApplications = [];
    }

    const newApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fullName,
      email,
      phone,
      experience,
      domain,
      jobTitle,
      coverLetter,
      resumeUrl,
      appliedAt: new Date().toISOString(),
      status: 'new',
    };

    store.jobApplications.unshift(newApplication);
    saveCMSStore(store);

    return NextResponse.json({
      success: true,
      message: 'Your application and profile have been successfully submitted to CUBE Talent Network.',
      application: newApplication,
    });
  } catch (error: any) {
    console.error('Career application submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your application.' },
      { status: 500 }
    );
  }
}

