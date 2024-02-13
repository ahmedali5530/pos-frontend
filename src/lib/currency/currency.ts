const DECIMAL_PLACES = import.meta.env.VITE_DECIMAL_PLACES;

export const withCurrency = (amount: string | number | undefined) => {
  if (amount === undefined) {
    //just return currency symbol
    return (0)
      .toLocaleString(import.meta.env.VITE_LOCALE, {
        style: "currency",
        currency: import.meta.env.VITE_CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
      .replace(/\d/g, "")
      .trim();
  }

  return new Intl.NumberFormat(import.meta.env.VITE_LOCALE, {
    style: "currency",
    currency: import.meta.env.VITE_CURRENCY,
    compactDisplay: "short",
    maximumFractionDigits: DECIMAL_PLACES,
  }).format(Number(amount));
};

export const formatNumber = (amount: string | number) => {
  return new Intl.NumberFormat(import.meta.env.VITE_LOCALE, {
    maximumFractionDigits: DECIMAL_PLACES,
    useGrouping: false
  }).format(Number(amount));
}
