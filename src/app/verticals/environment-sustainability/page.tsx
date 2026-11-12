import VerticalDetail from '@/components/verticals/VerticalDetail';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Environment & Sustainability | CUBE IIT Madras',
  description: 'Solutions to treating effluents, managing solid waste, purifying air and recycling water; the E&S vertical at CUBE.',
};

export default function EnvironmentSustainabilityPage() {
  return <VerticalDetail id="environment-sustainability" />;
}
