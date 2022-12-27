export const withCurrency = (amount: string|number|undefined) => {
  if(!amount){
    return process.env.REACT_APP_CURRENCY;
  }

  return new Intl
    .NumberFormat('en-US', {
      style: 'currency', currency: process.env.REACT_APP_CURRENCY
    })
    .format(Number(amount))
  ;
}
