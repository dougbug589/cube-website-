import VerticalDetail from '@/components/verticals/VerticalDetail';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Urban Planning & Transportation | CUBE IIT Madras',
  description: 'Cities are Networks; urban planning and transportation at CUBE.',
};

export default function UrbanPlanningTransportationPage() {
  return <VerticalDetail id="urban-planning-transportation" />;
}
