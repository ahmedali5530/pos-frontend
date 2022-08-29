export const withCurrency = (amount: string|number) =>
  (process.env.REACT_APP_CURRENCY || 'SR') + amount;
