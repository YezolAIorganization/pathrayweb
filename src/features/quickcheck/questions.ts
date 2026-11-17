import { DESTINATIONS, MARKETS, getMarket, type BandRange, type Market, type MarketId } from '../../config/markets';
import { formatMoney } from '../../lib/money';

export type Option = { id: string; label: string };
export type Field = {
  name: string;
  label: string;
  options: Option[];
  multi?: boolean; // pick more than one
  max?: number; // most picks allowed
  exclusiveOption?: string; // picking this clears the others
};
export type Step = { id: string; title: string; fields: Field[] };

function bandLabel(range: BandRange, market: Market) {
  const money = (n: number) => formatMoney(n, market.currency, market.locale);
  if (range.max === null) return `Above ${money(range.min)}`;
  if (range.min === 0) return `Under ${money(range.max)}`;
  return `${money(range.min)} to ${money(range.max)}`;
}

// Q0 is asked first and is not counted. It sets the market for Q4.
export const COUNTRY_STEP: Step = {
  id: 'q0',
  title: 'Where do you live?',
  fields: [
    {
      name: 'market',
      label: 'Your country',
      options: MARKETS.map((m) => ({ id: m.id, label: m.name })),
    },
  ],
};

// Q1 to Q7 for the chosen market. Q8 (contact and consent) is a form, built in a later step.
export function buildSteps(marketId: MarketId): Step[] {
  const market = getMarket(marketId);

  return [
    {
      id: 'q1',
      title: 'What level do you want to study?',
      fields: [
        {
          name: 'level',
          label: 'Study level',
          options: [
            { id: 'bachelors', label: 'Bachelor’s' },
            { id: 'masters', label: 'Master’s' },
            { id: 'phd', label: 'PhD' },
            { id: 'unsure', label: 'Not sure yet' },
          ],
        },
      ],
    },
    {
      id: 'q2',
      title: 'Which field interests you most?',
      fields: [
        {
          name: 'field',
          label: 'Field of study',
          options: [
            { id: 'engineering-tech', label: 'Engineering and technology' },
            { id: 'business', label: 'Business and management' },
            { id: 'health', label: 'Health and medicine' },
            { id: 'sciences', label: 'Natural sciences' },
            { id: 'social-humanities', label: 'Social sciences and humanities' },
            { id: 'arts-design', label: 'Arts and design' },
            { id: 'unsure', label: 'Not sure yet' },
          ],
        },
      ],
    },
    {
      id: 'q3',
      title: 'Tell us about your studies so far',
      fields: [
        {
          name: 'qualification',
          label: 'Your highest qualification',
          options: [
            { id: 'school-secondary', label: 'Secondary school (Matric, O-level or similar)' },
            { id: 'school-higher', label: 'Higher secondary (FSc, A-level or similar)' },
            { id: 'bachelors', label: 'Bachelor’s degree' },
            { id: 'masters', label: 'Master’s degree' },
            { id: 'other', label: 'Something else' },
          ],
        },
        {
          name: 'result',
          label: 'Your result',
          options: [
            { id: 'high', label: '80% or higher (or equal)' },
            { id: 'good', label: '60% to 79%' },
            { id: 'pass', label: 'Below 60%' },
            { id: 'waiting', label: 'Still studying, no final result yet' },
          ],
        },
      ],
    },
    {
      id: 'q4',
      title: 'How much can you spend each year, on study and living?',
      fields: [
        {
          name: 'budgetBand',
          label: 'Yearly budget',
          options: market.budgetBands.map((range, i) => ({
            id: String(i),
            label: bandLabel(range, market),
          })),
        },
      ],
    },
    {
      id: 'q5',
      title: 'Do you need a full scholarship?',
      fields: [
        {
          name: 'scholarshipNeed',
          label: 'Scholarship need',
          options: [
            { id: 'yes', label: 'Yes, I need a full scholarship' },
            { id: 'partly', label: 'Partly, I can pay some costs' },
            { id: 'no', label: 'No, I can pay my own costs' },
          ],
        },
      ],
    },
    {
      id: 'q6',
      title: 'What is your English test situation?',
      fields: [
        {
          name: 'englishTest',
          label: 'English test',
          options: [
            { id: 'have', label: 'I have a score' },
            { id: 'planning', label: 'I plan to take one' },
            { id: 'none', label: 'I have not started' },
            { id: 'unsure', label: 'I am not sure which one I need' },
          ],
        },
      ],
    },
    {
      id: 'q7',
      title: 'Which countries do you want to study in?',
      fields: [
        {
          name: 'destinations',
          label: 'Countries (pick up to 3, or any)',
          multi: true,
          max: 3,
          exclusiveOption: 'any',
          options: [
            { id: 'any', label: 'Any country that fits my budget' },
            ...DESTINATIONS.map((d) => ({ id: d.id, label: d.name })),
          ],
        },
      ],
    },
  ];
}