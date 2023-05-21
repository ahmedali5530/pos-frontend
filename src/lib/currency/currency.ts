export const withCurrency = (amount: string|number|undefined) => {
  if(amount === undefined){
    return process.env.REACT_APP_CURRENCY;
  }

  return new Intl
    .NumberFormat(process.env.REACT_APP_LOCALE, {
      style: 'currency',
      currency: process.env.REACT_APP_CURRENCY,
      compactDisplay: 'short'
    })
    .format(Number(amount))
  ;
}
