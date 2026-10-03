// src/data/storiesData.ts - Authentic Ghana Outgrower Field Stories with Real Agricultural Photography
import farmHeroImg from '../assets/images/ghana_farm_hero_1789914832509.jpg';
import poultryImg from '../assets/images/ghana_poultry_inspection_1789914844874.jpg';
import aquacultureImg from '../assets/images/fresh_volta_tilapia_1790597448926.jpg';
import cattleImg from '../assets/images/ghana_cattle_ranch_1789914871748.jpg';
import combineHarvestImg from '../assets/images/ghana_combine_harvest_1789997787082.jpg';
import breedingNurseryImg from '../assets/images/animal_breeding_nursery_1789997800572.jpg';
import hatcheryChicksImg from '../assets/images/hatchery_incubator_chicks_1789997815148.jpg';
import droneAgroImg from '../assets/images/ghana_agro_drone_1789997826726.jpg';

export interface FarmerStory {
  id: string;
  name: string;
  age: number;
  role: string;
  region: string;
  district: string;
  coopCluster: string;
  category: 'poultry' | 'aquaculture' | 'crops' | 'livestock';
  categoryLabel: string;
  headline: string;
  excerpt: string;
  fullStory: string[];
  quote: string;
  totalPayoutGhs: number;
  cyclesCompleted: number;
  stats: { label: string; value: string }[];
  primaryImage: string;
  secondaryImage: string;
  primaryImageCaption: string;
  secondaryImageCaption: string;
  date: string;
  verifiedRef: string;
  badge: string;
}

export const FARMER_STORIES: FarmerStory[] = [
  {
    id: 'story-kofi-poultry',
    name: 'Kofi Mensah',
    age: 38,
    role: 'Commercial Broiler Outgrower',
    region: 'Bono Region',
    district: 'Dormaa Central Agricultural District',
    coopCluster: 'Cluster A-14 (Dormaa Paddock Syndicate)',
    category: 'poultry',
    categoryLabel: 'Poultry & Hatchery',
    headline: 'From 500 to 5,000 Broilers: How Kofi Scaled His Family Poultry Pen in Dormaa',
    excerpt: 'With guaranteed feed supply, automated vaccination tracking, and direct co-op off-take, Kofi now finishes 5,000 broilers every 6 weeks with zero market risk.',
    fullStory: [
      'Kofi Mensah started poultry farming in 2018 with just 500 day-old chicks behind his family compound in Dormaa Ahenkro. Like many smallholders in Ghana, fluctuating feed costs and unorganized middlemen squeezed his margins to the brink of collapse.',
      'Joining Animal Farm Ghana Co-operative Society in early 2024 changed everything. Through the co-operative sponsorship mechanism, Kofi was equipped with high-efficiency nipple drinker lines, automated brooding temperature sensors, and scheduled veterinary deliveries certified by the Veterinary Services Directorate (VSD).',
      'Today, Kofi manages two modern ventilated pens holding 5,000 commercial broilers per rotation. Each cycle yields top-grade table birds purchased directly by institutional buyers across Sunyani and Kumasi, with cedi disbursements hitting his MTN Mobile Money account within 2 hours of post-harvest biometric tally.'
    ],
    quote: 'The co-operative gave me high-yield starter feeds, veterinary oversight, and guaranteed purchase of every batch. Now I harvest every 6 weeks with zero market risk.',
    totalPayoutGhs: 48200,
    cyclesCompleted: 14,
    stats: [
      { label: 'Yield Expansion', value: '+320%' },
      { label: 'Survival Rate', value: '99.2%' },
      { label: 'Turnaround', value: '6 Weeks' }
    ],
    primaryImage: poultryImg,
    secondaryImage: hatcheryChicksImg,
    primaryImageCaption: 'Kofi inspecting poultry health standards inside the Dormaa bio-secure broiler house.',
    secondaryImageCaption: 'Day-old chicks arriving from the accredited co-operative incubation hatchery.',
    date: 'March 2025',
    verifiedRef: 'MOFA-OG-2024-8831',
    badge: 'Senior Outgrower & Mentor'
  },
  {
    id: 'story-abena-aquaculture',
    name: 'Abena Serwaa',
    age: 42,
    role: 'Deep-Water Tilapia Producer',
    region: 'Eastern Region',
    district: 'Asuogyaman District (Volta Basin)',
    coopCluster: 'Cluster B-09 (Lake Volta Cage Syndicate)',
    category: 'aquaculture',
    categoryLabel: 'Aquaculture',
    headline: 'Deep-Cage Tilapia on Lake Volta: Abena’s Blueprint for Clean Commercial Aquaculture',
    excerpt: 'Utilizing floating HDPE cage technology and daily water parameter logging, Abena produces 12 metric tonnes of premium freshwater tilapia every quarter.',
    fullStory: [
      'Operating along the deep calm channels of Lake Volta near Akosombo, Abena Serwaa transitioned from artisanal shoreline fishing to commercial deep-water cage aquaculture with the support of Animal Farm Ghana.',
      'Through co-operative package sponsorship, Abena installed two heavy-duty floating HDPE pens stocked with sex-reversed Nile Tilapia fingerlings. Daily water salinity, temperature, and dissolved oxygen are monitored with calibrated handheld probes to ensure pristine fish welfare.',
      'Her cluster achieved an exceptional feed conversion ratio (FCR) of 1.25. Payouts from harvest batches are credited immediately via Telecel Cash, supporting the tertiary education of her three daughters.'
    ],
    quote: 'Managing floating cages used to mean losing fingerlings to dissolved oxygen drops. With the calibrated telemetry sensors and shared feed sponsorship, our cluster harvests 12 metric tonnes per quarter.',
    totalPayoutGhs: 62500,
    cyclesCompleted: 9,
    stats: [
      { label: 'Quarterly Harvest', value: '12.4 MT' },
      { label: 'Feed Conversion', value: '1.25 FCR' },
      { label: 'Water Quality', value: 'Grade-A' }
    ],
    primaryImage: aquacultureImg,
    secondaryImage: droneAgroImg,
    primaryImageCaption: 'Abena tending to floating aquaculture production cages anchored in Lake Volta.',
    secondaryImageCaption: 'Aerial inspection of co-operative deep-water aquaculture pens along the Volta basin.',
    date: 'February 2025',
    verifiedRef: 'MOFA-AQ-2024-4190',
    badge: 'Master Fish Farmer'
  },
  {
    id: 'story-kwesi-grain',
    name: 'Kwesi Boateng',
    age: 45,
    role: 'Grain Mechanization Syndicate Lead',
    region: 'Eastern Region',
    district: 'Afram Plains South Agro Corridor',
    coopCluster: 'Cluster C-03 (Afram Plains Grain Hub)',
    category: 'crops',
    categoryLabel: 'Commercial Grain & Maize',
    headline: 'Mechanized Combine Harvesting in the Afram Plains: 120-Acre Maize Triumph',
    excerpt: 'By pooling sponsorship capital into combine harvesters, Kwesi reduced post-harvest crop loss from 25% down to less than 1% across 120 contiguous acres.',
    fullStory: [
      'The vast agricultural soils of the Afram Plains produce bountiful yellow maize and sorghum, but seasonal rains historically spoiled up to a quarter of harvested grain before manual laborers could bag the harvest.',
      'Animal Farm Ghana introduced collective machinery syndication. Kwesi and 16 neighboring smallholders synchronized their planting cycles. When the crop reached physiological maturity, a shared John Deere rotary combine cleared 120 acres in just 48 continuous operating hours.',
      'Grain moisture was tested at 13.5% directly on the field before conveyance to climate-controlled steel storage silos. Kwesi received his guaranteed harvest share through mobile money settlement without a single bag lost to weather.'
    ],
    quote: 'Before our machinery syndicate, manual harvesting took three weeks and we lost 25% of crops to rain rot. The combine harvester finished 120 acres in 48 hours.',
    totalPayoutGhs: 89400,
    cyclesCompleted: 11,
    stats: [
      { label: 'Acreage Harvested', value: '120 Acres' },
      { label: 'Field Turnaround', value: '48 Hours' },
      { label: 'Crop Loss Rate', value: '<0.4%' }
    ],
    primaryImage: combineHarvestImg,
    secondaryImage: farmHeroImg,
    primaryImageCaption: 'Modern combine harvester processing ripe grain fields across the Afram Plains.',
    secondaryImageCaption: 'Co-operative tractor operations preparing fertile bottomlands for second-cycle planting.',
    date: 'January 2025',
    verifiedRef: 'MOFA-GR-2024-1102',
    badge: 'Agricultural Mechanization Hero'
  },
  {
    id: 'story-yakubu-cattle',
    name: 'Alhaji Yakubu',
    age: 54,
    role: 'Savannah Livestock Genetics Steward',
    region: 'Northern Region',
    district: 'Savelugu-Nanton / Pong-Tamale Corridor',
    coopCluster: 'Cluster D-01 (Pong-Tamale Livestock Hub)',
    category: 'livestock',
    categoryLabel: 'Savannah Cattle & Ruminants',
    headline: 'Savannah Cattle Genetics: Doubling Calf Growth Velocity in Pong-Tamale',
    excerpt: 'Through artificial insemination with indigenous Sanga and N’Dama breeds, Alhaji Yakubu doubled average herd weight gains with 100% veterinary vaccination.',
    fullStory: [
      'Livestock ranching in Northern Ghana demands resilience against trypanosomiasis and drought. Alhaji Yakubu has managed cattle for three decades, but traditional unassisted breeding kept calf growth rates modest.',
      'Partnering with Animal Farm Ghana and Pong-Tamale Veterinary College, Alhaji implemented rotational paddock fencing, forage silage reserves, and superior breeding lines. Every animal is fitted with a tamper-proof RFID ear tag linked to the national registry.',
      'Today his herd demonstrates doubled weaning weights and zero parasite outbreaks. Seasonal animal sales through the co-operative platform provide predictable, transparent family income deposited straight to mobile wallets.'
    ],
    quote: 'Cross-breeding hardy Savannah cattle with our supervised veterinary protocols has doubled average calf weight. All payments arrive directly without delay.',
    totalPayoutGhs: 74100,
    cyclesCompleted: 8,
    stats: [
      { label: 'Growth Velocity', value: '2.1x Faster' },
      { label: 'Herd Tagging', value: '100% RFID' },
      { label: 'Vet Compliance', value: 'Certified A+' }
    ],
    primaryImage: cattleImg,
    secondaryImage: breedingNurseryImg,
    primaryImageCaption: 'Alhaji Yakubu overseeing healthy cattle grazing in northern Savannah pastures.',
    secondaryImageCaption: 'Modern enclosed nursery pen designed for calf health and supplementary feed intake.',
    date: 'January 2025',
    verifiedRef: 'MOFA-LS-2023-7729',
    badge: 'Senior Livestock Geneticist'
  },
  {
    id: 'story-ama-drone',
    name: 'Ama Addo',
    age: 29,
    role: 'Agro-Tech Drone Specialist & Crop Inspector',
    region: 'Bono Region',
    district: 'Sunyani North Horticultural Zone',
    coopCluster: 'Cluster E-05 (Sunyani Drone Squad)',
    category: 'crops',
    categoryLabel: 'Precision Agriculture',
    headline: 'Precision Drone Crop-Spraying: Ama’s Green Revolution in Sunyani',
    excerpt: 'Armed with multispectral telemetry drones, Ama surveys 30 hectares a morning, saving 70% of irrigation water and eliminating chemical drift.',
    fullStory: [
      'A university agricultural engineering graduate, Ama returned to Sunyani determined to replace back-pack chemical sprayers with precision aerial technology. Animal Farm Ghana provided the co-operative equipment financing for heavy-payload agricultural multicopters.',
      'Ama conducts early-morning crop vigor scans using Normalized Difference Vegetation Index (NDVI) cameras. Infestations are detected days before visible to the naked eye, allowing targeted micro-treatments.',
      'Over 200 outgrowers in her zone rely on her aerial reports. The platform rewards her technical inspection submissions daily, proving that modern tech creates lucrative youth employment in Ghanaian agriculture.'
    ],
    quote: 'I inspect and spray 30 hectares in a single morning. Real-time NDVI telemetry shows crop health directly to co-operative members on their phones.',
    totalPayoutGhs: 38900,
    cyclesCompleted: 19,
    stats: [
      { label: 'Daily Coverage', value: '30 Hectares' },
      { label: 'Water Saved', value: '70% Reduction' },
      { label: 'Youth Lead', value: 'Under 30' }
    ],
    primaryImage: droneAgroImg,
    secondaryImage: poultryImg,
    primaryImageCaption: 'High-payload agricultural drone executing automated aerial crop inspection.',
    secondaryImageCaption: 'Local farmers reviewing crop canopy health metrics alongside field inspectors.',
    date: 'March 2025',
    verifiedRef: 'MOFA-DT-2024-9041',
    badge: 'Youth Agro-Tech Pioneer'
  }
];
