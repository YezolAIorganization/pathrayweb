// All money on screen goes through this. Currency comes from the market later.
export function formatMoney(
  amount: number,
  currency: string = 'PKR',
  locale: string = 'en-PK',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}