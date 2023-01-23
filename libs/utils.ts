import { BigNumber } from 'bignumber.js'
BigNumber.set({ DECIMAL_PLACES: 30 }) 

export function shortenHex(hex: string | undefined | null, length = 4) {
  return `${hex?.substring(0, length + 2)}…${hex?.substring(
    hex?.length - length,
  )}`
}

export function decimalMax (amount: string | number, decimal: number = 18) : string {
  return new BigNumber(new BigNumber(amount || 0).toFixed(decimal)).toString()
}
