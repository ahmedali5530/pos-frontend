export const withCurrency = (amount: string | number | undefined) => {
  if (amount === undefined) {
    //just return currency symbol
    return (0).toLocaleString(process.env.REACT_APP_LOCALE, {
      style: 'currency',
      currency: process.env.REACT_APP_CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace(/\d/g, '').trim();
  }

  return new Intl
    .NumberFormat(process.env.REACT_APP_LOCALE, {
      style: 'currency',
      currency: process.env.REACT_APP_CURRENCY,
      compactDisplay: 'short'
    })
    .format(Number(amount));
}
