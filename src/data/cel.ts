import { CELService } from '@/types';

// Only what cubeiitm.org states about CEL (home page, About, E&S vertical,
// contact page). Its menu links CEL to the laboratory's own site, cube-el.org.
export const celOverview: {
  title: string;
  subtitle: string;
  description: string;
  location: string;
  website: string;
  facilities: string[];
  testingServices: CELService[];
} = {
  title: 'CUBE Environmental Laboratory (CEL)',
  subtitle:
    'CEL is an environmental testing laboratory equipped with state-of-the-art equipment, offering a wide range of analytical, testing and consultancy services across water, wastewater and solid waste domains.',
  description: 'Analytical, testing and consultancy services across water, wastewater and solid waste.',
  location:
    'CUBE has established its state of art Environment Laboratory (CEL) co-located with the office, providing testing and analytical services for Water, Waste Water and Solid Waste.',
  website: 'http://cube-el.org/',
  facilities: [],
  testingServices: [
    { id: 'water', title: 'Water', category: 'Water', parameters: [], equipment: [], description: 'Analytical, testing and consultancy services.' },
    { id: 'wastewater', title: 'Wastewater', category: 'Wastewater', parameters: [], equipment: [], description: 'Analytical, testing and consultancy services.' },
    { id: 'solid-waste', title: 'Solid Waste', category: 'Solid Waste', parameters: [], equipment: [], description: 'Analytical, testing and consultancy services.' },
  ],
};
