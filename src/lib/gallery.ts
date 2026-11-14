// Gallery list shared by the server page (first render) and the client
// (live refetch after admin edits), so both build exactly the same list.

export interface GalleryItem {
  id: number;
  src: string;
  title: string;
  category: 'Projects' | 'Laboratory' | 'Workplace' | 'Events';
}

export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, src: '/images/hero/slides_iit-tirupathi.jpg', title: 'IIT Tirupati Permanent Campus – Third Party Quality Assurance', category: 'Projects' },
  { id: 2, src: '/images/hero/slides_cpcl-arc.jpg', title: 'PMC for Construction of ARHC, Manali', category: 'Projects' },
  { id: 3, src: '/images/cel/about_cel.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  { id: 4, src: '/images/cel/about_cel1.jpg', title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  { id: 5, src: '/images/life-at-cube/about_life.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 6, src: '/images/life-at-cube/about_life1.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 7, src: '/images/life-at-cube/about_life2.jpg', title: 'Life at CUBE', category: 'Workplace' },
  { id: 8, src: '/images/hero/slides_building-training-team.jpg', title: 'Capacity Building Training Programme', category: 'Events' },
  { id: 9, src: '/images/hero/slides_ashiana.jpg', title: 'Surface Water Management and Flood Inundation Study, Ashiana Shubham', category: 'Projects' },
  { id: 10, src: '/images/hero/slides_mahindra.jpg', title: 'Mahindra World City', category: 'Projects' },
];

/*
 * Display rules for the CMS gallery list (the data itself is left as is):
 * - portraits of the board and advisory panel (they have their own pages)
 *   and stock pictures are not gallery photos, so they are not shown;
 * - captions that were generated from file names get the real caption
 *   (hero slide captions from cubeiitm.org's home page).
 */
const HIDE = [/\/images\/leadership\//, /images_about-bg\.jpg$/, /images_excellence\.jpg$/];
const FIX: Record<string, { title: string; category: GalleryItem['category'] }> = {
  '/images/hero/slides_slide2.jpg': { title: 'Surface Water Management Plan for IIT Jammu Campus', category: 'Projects' },
  '/images/hero/slides_slide3.jpg': {
    title: 'Engineering, Structural Assessment and Mitigation Strategies for Protection and Development of Naida Caves, Diu',
    category: 'Projects',
  },
  '/images/cel/about_cel1.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/cel/about_cel2.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/cel/vertical2_lab.jpg': { title: 'CUBE Environmental Laboratory (CEL)', category: 'Laboratory' },
  '/images/about/about_about.jpg': { title: 'Life at CUBE', category: 'Workplace' },
};

export function mapGalleryCategory(category: string): GalleryItem['category'] {
  const value = (category || '').toLowerCase();
  if (value.includes('lab')) return 'Laboratory';
  if (value.includes('project') || value.includes('hero') || value.includes('showcase')) return 'Projects';
  if (value.includes('team') || value.includes('leadership') || value.includes('workplace') || value.includes('institutional')) return 'Workplace';
  return 'Events';
}

/** CMS gallery rows (published) -> the photos the gallery shows. */
export function toGalleryItems(rows: any[]): GalleryItem[] {
  return rows
    .filter((item: any) => item && item.imageUrl && !HIDE.some((re) => re.test(item.imageUrl)))
    .map((item: any, index: number) => ({
      id: index + 1,
      src: item.imageUrl,
      title: FIX[item.imageUrl]?.title || item.title || 'CUBE',
      category: FIX[item.imageUrl]?.category || mapGalleryCategory(item.category),
    }));
}
