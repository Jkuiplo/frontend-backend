export const currencySymbols = {
  KZT: '₸',
  USD: '$',
  EUR: '€',
};

export const currencyNames = {
  KZT: '₸ KZT',
  USD: '$ USD',
  EUR: '€ EUR',
};

export type CurrencyType = keyof typeof currencySymbols;

export function formatCurrency(amount: number, currency: CurrencyType): string {
  const symbol = currencySymbols[currency];
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Добавить функцию для отображения баланса с валютой
export function formatBalanceWithCurrency(amount: number, currency: CurrencyType): string {
  const symbol = currencySymbols[currency];
  const name = currencyNames[currency].split(' ')[1];
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${name}`;
}