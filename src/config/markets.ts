export type MarketId = 'pk' | 'in' | 'other';

export type BandRange = { min: number; max: number | null };

export type Market = {
  id: MarketId;
  name: string;
  currency: string;
  locale: string;
  // Four yearly budget bands (0 to 3), in the market's own currency.
  budgetBands: [BandRange, BandRange, BandRange, BandRange];
};

export const MARKETS: Market[] = [
  {
    id: 'pk',
    name: 'Pakistan',
    currency: 'PKR',
    locale: 'en-PK',
    budgetBands: [
      { min: 0, max: 1_000_000 },
      { min: 1_000_000, max: 3_000_000 },
      { min: 3_000_000, max: 6_000_000 },
      { min: 6_000_000, max: null },
    ],
  },
  {
    // Starting values, roughly converted from the Pakistan bands. Adjust to real student budgets.
    id: 'in',
    name: 'India',
    currency: 'INR',
    locale: 'en-IN',
    budgetBands: [
      { min: 0, max: 300_000 },
      { min: 300_000, max: 900_000 },
      { min: 900_000, max: 1_800_000 },
      { min: 1_800_000, max: null },
    ],
  },
  {
    // International students. Starting values in US dollars, adjust to real budgets.
    id: 'other',
    name: 'Another country',
    currency: 'USD',
    locale: 'en-US',
    budgetBands: [
      { min: 0, max: 3_500 },
      { min: 3_500, max: 10_000 },
      { min: 10_000, max: 20_000 },
      { min: 20_000, max: null },
    ],
  },
];

export const DEFAULT_MARKET_ID: MarketId = 'pk';

export function getMarket(id: MarketId): Market {
  return MARKETS.find((m) => m.id === id) ?? MARKETS[0];
}

// Study destinations for Q7. Add or remove countries here only.
export const DESTINATIONS = [
  { id: 'germany', name: 'Germany' },
  { id: 'south-korea', name: 'South Korea' },
  { id: 'united-kingdom', name: 'United Kingdom' },
  { id: 'italy', name: 'Italy' },
];