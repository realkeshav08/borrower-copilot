import type { BorrowerInput } from '../types'

export const demoCases: Record<string, BorrowerInput> = {
  priya: {
    name: 'Priya', city: 'Bengaluru', age: 29, purpose: 'wedding', requestedAmount: 800000,
    loanType: 'personal', incomeType: 'salaried', incomeLow: 110000, incomeHigh: 110000,
    existingEmis: 14000, householdExpenses: null, creditScoreKnown: true, creditScore: 780,
    recentBounce: false, employmentYears: 5, emergencySavingsMonths: null, dependents: null,
  },
  ravi: {
    name: 'Ravi', city: 'Mysuru', age: 42, purpose: 'business', requestedAmount: 1500000,
    loanType: 'auto_recommend', incomeType: 'self_employed', incomeLow: 40000, incomeHigh: 80000,
    existingEmis: 0, householdExpenses: null, creditScoreKnown: false, creditScore: null,
    recentBounce: false, businessYears: 14, itrAnnualIncome: 420000, otherHouseholdIncome: 18000, coApplicantMonthlyIncome: null,
    collateralValue: 4500000, productiveIncomeGain: null, emergencySavingsMonths: null,
  },
  anita: {
    name: 'Anita', city: 'Hubballi', age: 35, purpose: 'vehicle', requestedAmount: 150000,
    loanType: 'two_wheeler', incomeType: 'informal', incomeLow: 26000, incomeHigh: 30000,
    existingEmis: null, householdExpenses: null, creditScoreKnown: false, creditScore: null,
    recentBounce: true, dependents: 2, highCostDebtOutstanding: 35000, highCostDebtApr: 30,
    otherHouseholdIncome: 0, coApplicantMonthlyIncome: 0, productiveIncomeGain: null, emergencySavingsMonths: null,
  },
}
