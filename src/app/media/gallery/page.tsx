import React from 'react';
import GalleryClient from './GalleryClient';
import { getCMSStore } from '@/lib/db/store';
import { GALLERY_ITEMS, toGalleryItems } from '@/lib/gallery';

export const metadata = {
  title: 'Gallery | CUBE IIT Madras',
  description: "Photographs of CUBE's projects, laboratory and workplace.",
};

export const dynamic = 'force-dynamic';

// The published photos are rendered on the server, so the first paint is the
// real gallery (no fallback list that is swapped out a moment later).
export default async function GalleryPage() {
  let items = GALLERY_ITEMS;
  try {
    const store = await getCMSStore();
    items = toGalleryItems((store.gallery || []).filter((g: any) => g.status === 'published'));
  } catch {
    // CMS unreachable: show the curated list
  }
  return <GalleryClient initialItems={items} />;
}
