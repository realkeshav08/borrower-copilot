import type { LoanType, Verdict } from '../types'

export const money = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`
export const moneyRange = (low: number, high: number) => low === high ? money(low) : `${money(low)} – ${money(high)}`
export const rateRange = (low: number, high: number) => `${low.toFixed(1)}% – ${high.toFixed(1)}%`

export const productLabel: Record<LoanType, string> = {
  personal: 'Personal loan',
  business_secured: 'Secured business facility',
  business_unsecured: 'Unsecured business loan',
  two_wheeler: 'Two-wheeler loan',
  home: 'Home loan',
  lap: 'Loan against property',
  gold: 'Gold loan',
  auto_recommend: 'Recommended product',
}

export const verdictLabel: Record<Verdict, string> = {
  BORROW: 'Borrow',
  BORROW_LESS: 'Borrow less',
  DONT_BORROW: "Don't borrow",
}
