import path from 'path';

/** Private storage for applicant resumes — deliberately outside /public. */
export const RESUME_DIR = path.join(process.cwd(), 'data-store', 'resumes');

export const RESUME_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Identify PDF / DOC / DOCX by magic bytes. */
export function detectResumeType(buffer: Buffer): { ext: '.pdf' | '.doc' | '.docx' } | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { ext: '.pdf' };
  }
  // Legacy Word (OLE compound document)
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
  ) {
    return { ext: '.doc' };
  }
  // DOCX is a ZIP containing word/ entries
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04 &&
    buffer.includes(Buffer.from('word/'))
  ) {
    return { ext: '.docx' };
  }
  return null;
}

/** Only accept names we generated ourselves: <timestamp>_<hex>.<ext> */
export const SAFE_RESUME_NAME = /^\d+_[a-f0-9]{24}\.(pdf|docx?)$/;
