import { permanentRedirect } from 'next/navigation';

// cubeiitm.org has no reports or publications page: these items are news
// posts there, so the old URL goes to News.
export default function PublicationsPage() {
  permanentRedirect('/media/news');
}
