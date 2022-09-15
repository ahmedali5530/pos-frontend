export const withCurrency = (amount: string|number|undefined) =>
  (process.env.REACT_APP_CURRENCY || '$') + amount;
