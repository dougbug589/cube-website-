import { CELService } from '@/types';

export const celOverview: {
  title: string;
  subtitle: string;
  description: string;
  location: string;
  facilities: string[];
  testingServices: CELService[];
} = {
  title: 'CUBE Environmental Laboratory (CEL)',
  subtitle: 'Advanced Environmental Testing, Characterization & Analytical Diagnostics',
  description: 'The CUBE Environmental Laboratory (CEL) is a premier analytical facility established under CUBE at IIT Madras Research Park. CEL provides precision environmental testing services across water, wastewater, solid waste, and soil matrices, backing environmental engineering projects with verified empirical data.',
  location: 'IIT Madras Research Park, Taramani, Chennai',
  facilities: [
    'Inductively Coupled Plasma Mass Spectrometry (ICP-MS) Lab',
    'Gas Chromatography - Mass Spectrometry (GC-MS) Clean Room',
    'Atomic Absorption Spectrophotometry (AAS) Suite',
    'High Performance Liquid Chromatography (HPLC) Station',
    'Microbiological & Pathogen Analysis Incubator Facility',
    'Heavy Metals & Trace Elements Characterization Suite'
  ],
  testingServices: [
    {
      id: 'water-testing',
      title: 'Water Quality Testing',
      category: 'Water',
      description: 'Comprehensive physical, chemical, and biological testing for drinking water, surface water, and groundwater in accordance with IS 10500 standards.',
      parameters: ['pH, Turbidity, Electrical Conductivity, TDS', 'Total Hardness, Alkalinity, Chlorides, Fluorides', 'Sulphates, Nitrates, Dissolved Oxygen (DO)', 'Total Coliforms & E. Coli counts', 'Heavy Metals (Pb, Cd, As, Cr, Hg, Ni)'],
      equipment: ['UV-Vis Spectrophotometer', 'Multi-parameter Ion Meter', 'Turbidimeter', 'Flame Photometer']
    },
    {
      id: 'wastewater-testing',
      title: 'Wastewater & Effluent Characterization',
      category: 'Wastewater',
      description: 'Performance evaluation and regulatory compliance monitoring for municipal STPs, industrial ETPs, and common effluent treatment plants (CETP).',
      parameters: ['Biochemical Oxygen Demand (BOD 3-day / 5-day)', 'Chemical Oxygen Demand (COD)', 'Total Suspended Solids (TSS) & Settleable Solids', 'Ammoniacal Nitrogen & Total Kjeldahl Nitrogen (TKN)', 'Oil & Grease, Residual Chlorine, Phosphates'],
      equipment: ['COD Digester & Titration System', 'BOD Incubator & Respirometer', 'Centrifuge & Vacuum Filtration Units']
    },
    {
      id: 'solid-waste-testing',
      title: 'Solid Waste & Sludge Diagnostics',
      category: 'Solid Waste',
      description: 'Physical-chemical characterization of municipal solid waste, compost quality testing, and hazardous industrial sludge profiling.',
      parameters: ['Calorific Value / Bomb Calorimetry', 'Moisture Content, Volatile Organic Matter, Ash Content', 'Carbon-to-Nitrogen (C:N) Ratio', 'Toxicity Characteristic Leaching Procedure (TCLP)', 'Organic Carbon & Nutrient Profiling'],
      equipment: ['Bomb Calorimeter', 'Muffle Furnace', 'TCLP Rotary Agitator', 'Elemental CHNS Analyzer']
    },
    {
      id: 'specialized-studies',
      title: 'Specialized Environmental Diagnostics',
      category: 'Specialized',
      description: 'Advanced investigative studies for microplastics, organic micropollutants, industrial brine recovery, and soil contamination remediation.',
      parameters: ['Microplastic particle identification', 'Pesticide residue quantification', 'Total Petroleum Hydrocarbons (TPH)', 'Soil permeability and cation exchange capacity'],
      equipment: ['FTIR Spectrometer with ATR', 'Gas Chromatograph (GC)', 'Ultrasonic Probe Sonicator']
    }
  ]
};
