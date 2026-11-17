export type Service = {
  id: string;
  name: string;
  price: number | null; // null = free or priced by rule
  priceMax?: number; // for a price range
  note?: string;
  kind: 'free' | 'service' | 'addon' | 'cohort';
};

export type Bundle = {
  id: string;
  name: string;
  price: number;
  includes: string[];
};

// Starting prices in PKR, still to be tested.
export const URGENT_SURCHARGE = 0.4; // +40%
export const EXTRA_UNIVERSITY_PRICE = 10000;

export const SERVICES: Service[] = [
  { id: 'quick-check', name: 'Quick Check', price: null, kind: 'free' },
  { id: 'report', name: 'Pathray Report', price: 4000, kind: 'service' },
  { id: 'test-guidance', name: 'Test Guidance', price: 2000, kind: 'service' },
  {
    id: 'document-review',
    name: 'Document Review (SOP, CV or LOR)',
    price: 2500,
    note: 'Price is for each document.',
    kind: 'service',
  },
  {
    id: 'roadmap',
    name: 'Application Roadmap',
    price: 5000,
    note: 'One university, 30 days of email support, replies within 24 hours. You submit the application.',
    kind: 'service',
  },
  { id: 'final-check', name: 'Final Check', price: 7000, kind: 'service' },
  { id: 'proof-of-funds', name: 'Proof of Funds Guide', price: 3000, kind: 'service' },
  {
    id: 'visa-prep',
    name: 'Visa Preparation',
    price: 6000,
    note: 'Checklist and mock interview. You file the visa yourself.',
    kind: 'service',
  },
  { id: 'pre-departure', name: 'Pre-Departure Guide', price: 3500, kind: 'service' },
  {
    id: 'strategy-call',
    name: 'Expert Strategy Call',
    price: 8000,
    note: '45 minutes plus a written summary.',
    kind: 'service',
  },
  {
    id: 'guided-application',
    name: 'Guided Application',
    price: 25000,
    note: 'One university, about 6 expert hours. An extra university costs 10,000.',
    kind: 'service',
  },
  { id: 'mock-test', name: 'Mock Test with Feedback', price: 2000, kind: 'service' },
  {
    id: 'ielts-cohort',
    name: 'IELTS Prep Cohort',
    price: 8000,
    priceMax: 12000,
    note: 'Per student. Runs only if enough students join the waitlist.',
    kind: 'cohort',
  },
  {
    id: 'urgent',
    name: 'Urgent add-on',
    price: null,
    note: 'Adds 40% to the price of the service.',
    kind: 'addon',
  },
  {
    id: 'extra-university',
    name: 'Extra university (Guided Application)',
    price: EXTRA_UNIVERSITY_PRICE,
    kind: 'addon',
  },
];

export const BUNDLES: Bundle[] = [
  { id: 'explore', name: 'Explore', price: 4000, includes: ['Pathray Report'] },
  {
    id: 'apply',
    name: 'Apply',
    price: 12000,
    includes: ['Pathray Report', 'Application Roadmap', 'Two document reviews'],
  },
  {
    id: 'complete',
    name: 'Complete',
    price: 22000,
    includes: [
      'Everything in Apply',
      'Proof of Funds Guide',
      'Visa Preparation',
      'Pre-Departure Guide',
    ],
  },
  {
    id: 'guided',
    name: 'Guided',
    price: 27000,
    includes: ['Pathray Report', 'Guided Application'],
  },
];