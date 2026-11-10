#!/usr/bin/env node
/**
 * One-time migration of the local CMS into Supabase.
 *
 *   node scripts/migrate-to-supabase.mjs            # copy (skips what already exists)
 *   node scripts/migrate-to-supabase.mjs --dry-run  # show what would happen
 *   node scripts/migrate-to-supabase.mjs --force    # overwrite existing collections
 *
 * Copies:
 *   data-store/cube_cms_store.json  -> table public.cms_store (one row per collection)
 *   public/uploads/*                -> storage bucket cms-uploads
 *   data-store/resumes/*            -> storage bucket resumes
 *
 * Needs SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY,
 * read from the environment or .env.local / .env. Run
 * supabase/migrations/002_cms_store.sql first.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const FORCE = args.has('--force');

function loadEnvFile(file) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const BUCKETS = {
  uploads: process.env.SUPABASE_UPLOADS_BUCKET || 'cms-uploads',
  resumes: process.env.SUPABASE_RESUMES_BUCKET || 'resumes',
};
const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

async function migrateStore() {
  const file = path.join(ROOT, 'data-store', 'cube_cms_store.json');
  if (!fs.existsSync(file)) {
    console.log('• No local data-store/cube_cms_store.json — the database will be seeded on first request.');
    return;
  }
  const store = JSON.parse(fs.readFileSync(file, 'utf8'));

  const { data: existing, error } = await supabase.from('cms_store').select('key,version');
  if (error) {
    throw new Error(`Cannot read cms_store (${error.message}). Did you run supabase/migrations/002_cms_store.sql?`);
  }
  const versions = new Map(existing.map((r) => [r.key, r.version]));

  console.log(`\nCollections (${Object.keys(store).length}):`);
  for (const [k, data] of Object.entries(store)) {
    const count = Array.isArray(data) ? `${data.length} records` : 'object';
    if (versions.has(k) && !FORCE) {
      console.log(`  skip   ${k.padEnd(16)} (already in database; use --force to overwrite)`);
      continue;
    }
    console.log(`  ${versions.has(k) ? 'update' : 'insert'} ${k.padEnd(16)} ${count}`);
    if (DRY) continue;
    const row = {
      key: k,
      data,
      version: (versions.get(k) || 0) + 1,
      updated_at: new Date().toISOString(),
    };
    const { error: e } = await supabase.from('cms_store').upsert(row, { onConflict: 'key' });
    if (e) throw new Error(`Writing ${k} failed: ${e.message}`);
  }
}

async function migrateFiles(dir, bucket, label) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) {
    console.log(`\n${label}: none (${dir} not found)`);
    return;
  }
  const files = fs.readdirSync(abs).filter((f) => fs.statSync(path.join(abs, f)).isFile());
  console.log(`\n${label} (${files.length} files) -> bucket "${bucket}":`);
  for (const f of files) {
    const type = MIME[path.extname(f).toLowerCase()];
    if (!type) {
      console.log(`  skip   ${f} (unsupported type)`);
      continue;
    }
    if (DRY) {
      console.log(`  upload ${f}`);
      continue;
    }
    const { error } = await supabase.storage
      .from(bucket)
      .upload(f, fs.readFileSync(path.join(abs, f)), { contentType: type, upsert: FORCE, cacheControl: '31536000' });
    if (error && /exists|duplicate/i.test(error.message)) console.log(`  skip   ${f} (already uploaded)`);
    else if (error) throw new Error(`Uploading ${f} failed: ${error.message}`);
    else console.log(`  upload ${f}`);
  }
}

try {
  console.log(`Migrating local CMS to ${url}${DRY ? ' (dry run)' : ''}`);
  await migrateStore();
  await migrateFiles('public/uploads', BUCKETS.uploads, 'Media uploads');
  await migrateFiles('data-store/resumes', BUCKETS.resumes, 'Applicant resumes');
  console.log('\nDone.');
} catch (e) {
  console.error(`\nMigration failed: ${e.message}`);
  process.exit(1);
}
