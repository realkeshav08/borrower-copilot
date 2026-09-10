import type { BorrowerInput } from '../types'

export type QuestionKind = 'number' | 'select' | 'boolean'

export interface QuestionDef {
  key: keyof BorrowerInput
  label: string
  help?: string
  kind: QuestionKind
  required?: boolean
  allowUnknown?: boolean
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  options?: { value: string; label: string }[]
  showWhen?: (input: BorrowerInput) => boolean
  moves: string
}

export const mustQuestions: QuestionDef[] = [
  {
    key: 'purpose', label: 'What are you borrowing for?', kind: 'select', required: true,
    options: [
      { value: 'wedding', label: 'Wedding / personal event' },
      { value: 'business', label: 'Business / productive use' },
      { value: 'vehicle', label: 'Vehicle / two-wheeler' },
      { value: 'home', label: 'Home purchase' },
      { value: 'medical', label: 'Medical' },
      { value: 'education', label: 'Education' },
      { value: 'debt_consolidation', label: 'Consolidate existing debt' },
      { value: 'other', label: 'Other' },
    ], moves: 'Verdict, product route, rate band',
  },
  {
    key: 'requestedAmount', label: 'How much do you want?', kind: 'number', required: true, prefix: '₹', min: 10000, step: 10000,
    moves: 'Borrow / Borrow less verdict and EMI',
  },
  {
    key: 'loanType', label: 'Which product are you considering?', kind: 'select', required: true,
    options: [
      { value: 'auto_recommend', label: 'Recommend the right product' },
      { value: 'personal', label: 'Personal loan' },
      { value: 'business_secured', label: 'Secured business loan' },
      { value: 'business_unsecured', label: 'Unsecured business loan' },
      { value: 'two_wheeler', label: 'Two-wheeler loan' },
      { value: 'home', label: 'Home loan' },
      { value: 'lap', label: 'Loan against property' },
      { value: 'gold', label: 'Gold loan' },
    ], moves: 'Rate, tenure, lender/safe maximum',
  },
  {
    key: 'incomeType', label: 'How do you earn?', kind: 'select', required: true,
    options: [
      { value: 'salaried', label: 'Salaried' },
      { value: 'self_employed', label: 'Self-employed / business' },
      { value: 'informal', label: 'Informal / gig' },
      { value: 'mixed', label: 'Mixed income' },
    ], moves: 'Income haircut, FOIR and confidence',
  },
  {
    key: 'incomeLow', label: 'Conservative monthly take-home income', help: 'For variable income, enter a normal weak month — not your best month.', kind: 'number', required: true, prefix: '₹', min: 0, step: 1000,
    moves: 'Safe EMI and lender eligibility',
  },
  {
    key: 'incomeHigh', label: 'Typical strong-month take-home income', help: 'For variable income, enter a normal strong month — not an exceptional best month.', kind: 'number', required: true, prefix: '₹', min: 0, step: 1000,
    showWhen: (input) => input.incomeType !== 'salaried',
    moves: 'Lender eligibility range and confidence',
  },
  {
    key: 'existingEmis', label: 'Existing EMIs / mandatory debt payments per month', kind: 'number', required: true, allowUnknown: true, prefix: '₹', min: 0, step: 500,
    moves: 'FOIR and both borrowing ceilings',
  },
  {
    key: 'householdExpenses', label: 'Essential household expenses per month', help: 'Include rent, food, school, utilities and regular family obligations.', kind: 'number', required: true, allowUnknown: true, prefix: '₹', min: 0, step: 1000,
    moves: 'Borrower-safe EMI and confidence',
  },
  {
    key: 'age', label: 'Your age', kind: 'number', required: true, min: 18, max: 75, step: 1,
    moves: 'Tenure feasibility',
  },
  {
    key: 'creditScoreKnown', label: 'Do you know your credit score?', kind: 'boolean', required: true,
    moves: 'Pricing range and confidence',
  },
  {
    key: 'creditScore', label: 'Credit score', kind: 'number', min: 300, max: 900, step: 1,
    showWhen: (input) => Boolean(input.creditScoreKnown),
    moves: 'Fair-rate band and FOIR adjustment',
  },
  {
    key: 'recentBounce', label: 'Any EMI/payment bounce in the last 12 months?', kind: 'boolean', required: true,
    moves: 'Lender appetite, pricing and hard distress rule',
  },
]

export const additionalQuestions: QuestionDef[] = [
  {
    key: 'employmentYears', label: 'Years with current / similar salaried employment', kind: 'number', min: 0, max: 40, step: 0.5,
    showWhen: (input) => input.incomeType === 'salaried',
    moves: 'Confidence and explanation',
  },
  {
    key: 'businessYears', label: 'Years this business has operated', kind: 'number', min: 0, max: 50, step: 0.5,
    showWhen: (input) => input.incomeType === 'self_employed' || input.purpose === 'business' || input.loanType === 'business_secured' || input.loanType === 'business_unsecured',
    moves: 'Confidence and business stability',
  },
  {
    key: 'itrAnnualIncome', label: 'Latest annual income shown in ITR', kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 10000,
    showWhen: (input) => input.incomeType === 'self_employed',
    moves: 'Documented lender income and sanction range',
  },
  {
    key: 'collateralValue', label: 'Value of unencumbered property/collateral available', kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 50000,
    showWhen: (input) => input.purpose === 'business' || input.loanType === 'business_secured' || input.loanType === 'lap',
    moves: 'Secured-product routing and LTV ceiling',
  },
  {
    key: 'otherHouseholdIncome', label: 'Other stable household income per month', help: "For example, a spouse's regular income. This can support household affordability even if that person will not join the loan.", kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 1000,
    showWhen: (input) => input.purpose === 'business' || input.purpose === 'home' || input.incomeType !== 'salaried' || input.loanType === 'business_secured' || input.loanType === 'business_unsecured' || input.loanType === 'lap' || input.loanType === 'home',
    moves: 'Borrower-safe household income and range confidence',
  },
  {
    key: 'coApplicantMonthlyIncome', label: 'Income from an eligible co-applicant who will join the loan', help: "Enter only the documented income of a person who will actually join the facility; otherwise enter 0 or choose I don't know.", kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 1000,
    showWhen: (input) => input.purpose === 'business' || input.purpose === 'home' || input.incomeType !== 'salaried' || input.loanType === 'business_secured' || input.loanType === 'business_unsecured' || input.loanType === 'lap' || input.loanType === 'home',
    moves: 'Likely lender-assessed income and sanction range',
  },
  {
    key: 'emergencySavingsMonths', label: 'Emergency savings', help: 'How many months of essential expenses could you cover without income?', kind: 'number', allowUnknown: true, min: 0, max: 24, step: 0.5, suffix: ' months',
    moves: 'Borrower-safe FOIR and confidence',
  },
  {
    key: 'dependents', label: 'Financial dependents', kind: 'number', allowUnknown: true, min: 0, max: 12, step: 1,
    moves: 'Borrower-safe debt ratio',
  },
  {
    key: 'highCostDebtOutstanding', label: 'Outstanding high-cost/app-loan debt', kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 1000,
    showWhen: (input) => Boolean(input.recentBounce) || input.purpose === 'debt_consolidation' || input.incomeType === 'informal',
    moves: 'Unknown-debt proxy and distress rule',
  },
  {
    key: 'highCostDebtApr', label: 'Approximate APR/rate on that high-cost debt', kind: 'number', allowUnknown: true, min: 0, max: 100, step: 0.5, suffix: '%',
    showWhen: (input) => (Boolean(input.recentBounce) || input.purpose === 'debt_consolidation' || input.incomeType === 'informal') && (input.highCostDebtOutstanding ?? 0) > 0,
    moves: 'Distress explanation and negotiation context',
  },
  {
    key: 'productiveIncomeGain', label: 'Expected extra monthly cash flow created by this loan', help: 'Use a conservative number you can defend, not a best case.', kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 1000,
    showWhen: (input) => input.purpose === 'business' || input.purpose === 'vehicle',
    moves: 'Productive-loan explanation and confidence',
  },
  {
    key: 'cardUtilisation', label: 'Credit-card utilisation', help: 'Approximate percentage of your available card limits currently used.', kind: 'number', allowUnknown: true, min: 0, max: 100, step: 1, suffix: '%',
    showWhen: (input) => input.creditScoreKnown === true,
    moves: 'Fair-rate band',
  },
  {
    key: 'largeExpenseNext12m', label: 'Known large expense in the next 12 months', kind: 'number', allowUnknown: true, prefix: '₹', min: 0, step: 5000,
    moves: 'Safety context and confidence',
  },

]
