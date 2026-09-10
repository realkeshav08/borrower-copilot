export type IncomeType = 'salaried' | 'self_employed' | 'informal' | 'mixed'
export type LoanType = 'personal' | 'business_secured' | 'business_unsecured' | 'two_wheeler' | 'home' | 'lap' | 'gold' | 'auto_recommend'
export type Purpose = 'wedding' | 'business' | 'vehicle' | 'home' | 'medical' | 'education' | 'debt_consolidation' | 'other'
export type Verdict = 'BORROW' | 'BORROW_LESS' | 'DONT_BORROW'
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH'

export interface BorrowerInput {
  name?: string
  city?: string
  age?: number
  purpose?: Purpose
  requestedAmount?: number
  loanType?: LoanType
  incomeType?: IncomeType
  incomeLow?: number
  incomeHigh?: number
  existingEmis?: number | null
  householdExpenses?: number | null
  creditScoreKnown?: boolean
  creditScore?: number | null
  recentBounce?: boolean
  employmentYears?: number | null
  businessYears?: number | null
  itrAnnualIncome?: number | null
  otherHouseholdIncome?: number | null
  coApplicantMonthlyIncome?: number | null
  collateralValue?: number | null
  emergencySavingsMonths?: number | null
  cardUtilisation?: number | null
  dependents?: number | null
  largeExpenseNext12m?: number | null
  productiveIncomeGain?: number | null
  highCostDebtOutstanding?: number | null
  highCostDebtApr?: number | null
}

export interface MoneyRange {
  low: number
  high: number
}

export interface RateRange {
  low: number
  high: number
}

export interface AssessmentResult {
  verdict: Verdict
  verdictReason: string
  recommendedProduct: LoanType
  lenderSanction: MoneyRange
  safeCarry: MoneyRange
  recommendedAmount: number
  fairRate: RateRange
  apr: RateRange
  monthlyCeiling: number
  suggestedTenureMonths: number
  emiAtRecommendedAmount: number
  stressCase: string
  confidence: Confidence
  missingSignals: string[]
  reasons: string[]
  negotiationPoints: string[]
}
