import VerticalDetail from '@/components/verticals/VerticalDetail';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Smart Cities | CUBE IIT Madras',
  description: 'Holistic, data and analytics driven approaches to urban development; the Smart Cities vertical at CUBE.',
};

export default function SmartCitiesPage() {
  return <VerticalDetail id="smart-cities" />;
}
