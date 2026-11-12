import VerticalDetail from '@/components/verticals/VerticalDetail';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Building & Construction | CUBE IIT Madras',
  description: 'Buildings & Construction are two major challenges of rapidly urbanizing India; the B&C vertical at CUBE.',
};

export default function BuildingConstructionPage() {
  return <VerticalDetail id="building-construction" />;
}
