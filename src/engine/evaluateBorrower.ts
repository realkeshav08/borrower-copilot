import type { AssessmentResult, BorrowerInput, LoanType, MoneyRange, RateRange } from '../types'
import { BASE_RATE_BANDS, RULES } from '../rules/config'
import { aprFromFee, clamp, emi, principalFromEmi, roundMoney } from './math'
import { additionalQuestions } from '../questions/questionTree'

function recommendProduct(input: BorrowerInput): LoanType {
  // Purpose-fit routing can override the product the borrower initially considered.
  // That is deliberate: the output is the best-fit route, not an echo of the input.
  if (input.purpose === 'business') {
    if ((input.collateralValue ?? 0) >= RULES.productRouting.securedBusinessMinCollateral || input.loanType === 'business_secured') {
      return 'business_secured'
    }
    return 'business_unsecured'
  }
  if (input.purpose === 'vehicle' && (input.requestedAmount ?? 0) <= RULES.productRouting.twoWheelerMaxAmount) return 'two_wheeler'
  if (input.purpose === 'home') return 'home'
  if (input.loanType && input.loanType !== 'auto_recommend') return input.loanType
  return 'personal'
}


function hasKnownCreditScore(input: BorrowerInput): boolean {
  return input.creditScoreKnown === true && typeof input.creditScore === 'number'
}

function householdSupportRelevant(input: BorrowerInput, product: LoanType): boolean {
  return input.purpose === 'business'
    || input.purpose === 'home'
    || input.incomeType !== 'salaried'
    || product === 'business_secured'
    || product === 'business_unsecured'
    || product === 'lap'
    || product === 'home'
}

function highCostDebtRelevant(input: BorrowerInput): boolean {
  return Boolean(input.recentBounce) || input.purpose === 'debt_consolidation' || input.incomeType === 'informal'
}

function assessedLenderIncome(input: BorrowerInput, product: LoanType): { low: number; high: number; reasons: string[] } {
  const low = input.incomeLow ?? 0
  const high = input.incomeType === 'salaried' ? low : (input.incomeHigh ?? low)
  const reasons: string[] = []
  let resultLow = low
  let resultHigh = high

  if (input.incomeType === 'self_employed') {
    if ((input.itrAnnualIncome ?? 0) > 0) {
      const itrMonthly = (input.itrAnnualIncome ?? 0) / 12
      resultLow = Math.min(low || itrMonthly, itrMonthly)
      resultHigh = Math.max(resultLow, Math.min(high || itrMonthly, itrMonthly * RULES.incomeAssessment.selfEmployedItrHighMultiplier))
      reasons.push('Lender income is anchored to documented ITR, not the best cash-income month.')
    } else {
      resultLow = low * RULES.incomeAssessment.selfEmployedNoItrLowShare
      resultHigh = high * RULES.incomeAssessment.selfEmployedNoItrHighShare
      reasons.push('Undocumented self-employed income is haircut because bankability is uncertain.')
    }
  }

  if (input.incomeType === 'informal') {
    resultLow = low * RULES.incomeAssessment.informalLowShare
    resultHigh = high * RULES.incomeAssessment.informalHighShare
    reasons.push('Informal income is discounted for likely lender assessment because documentation is limited.')
  }

  if (input.incomeType === 'mixed') {
    resultLow = low * RULES.incomeAssessment.mixedLowShare
    resultHigh = high * RULES.incomeAssessment.mixedHighShare
    reasons.push('Mixed income receives a documentation haircut unless all streams are verifiable.')
  }

  const coApplicant = householdSupportRelevant(input, product) ? (input.coApplicantMonthlyIncome ?? 0) : 0
  if (coApplicant > 0) {
    resultLow += coApplicant
    resultHigh += coApplicant
    reasons.push('Eligible co-applicant income is included in lender-assessed income because that person is stated to join the facility.')
  }

  return { low: resultLow, high: resultHigh, reasons }
}

function currentDebtLoad(input: BorrowerInput): { amount: number; isEstimated: boolean } {
  if (typeof input.existingEmis === 'number') return { amount: input.existingEmis, isEstimated: false }

  const conservativeIncome = input.incomeLow ?? 0
  const incomeProxy = conservativeIncome * RULES.unknownDebtProxy.monthlyShareOfConservativeIncome
  const highCostOutstanding = highCostDebtRelevant(input) ? (input.highCostDebtOutstanding ?? 0) : 0
  const highCostProxy = highCostOutstanding * RULES.unknownDebtProxy.monthlyShareOfHighCostOutstanding

  // Unknown debt service is never silently converted to zero. Use the larger
  // of an income-based reserve and a known-high-cost-debt proxy.
  return { amount: Math.max(incomeProxy, highCostProxy), isEstimated: true }
}

function adjustedFoir(input: BorrowerInput) {
  const incomeType = input.incomeType ?? 'informal'
  let lender = RULES.lenderFoir[incomeType]
  let safe = RULES.safeFoir[incomeType]

  if (hasKnownCreditScore(input) && (input.creditScore as number) < RULES.lowScorePenalty.threshold) {
    lender += RULES.lowScorePenalty.lenderFoirDelta
    safe += RULES.lowScorePenalty.safeFoirDelta
  }
  if (input.recentBounce) lender += RULES.recentBounce.lenderFoirDelta
  if ((input.emergencySavingsMonths ?? -1) >= RULES.emergencySavings.strongMonths) {
    safe += RULES.emergencySavings.safeFoirBonus
  } else if ((input.emergencySavingsMonths ?? -1) >= 0 && (input.emergencySavingsMonths ?? 0) < RULES.emergencySavings.weakMonths) {
    safe += RULES.emergencySavings.safeFoirPenalty
  }
  if ((input.dependents ?? 0) >= RULES.dependantPenalty.threshold) safe += RULES.dependantPenalty.safeFoirDelta
  if (highCostDebtRelevant(input) && (input.highCostDebtOutstanding ?? 0) > 0 && (input.highCostDebtApr ?? 0) >= RULES.highCostDebt.aprThresholdPct) safe += RULES.highCostDebt.safeFoirDelta

  return {
    lender: clamp(lender, RULES.foirBounds.lenderMin, RULES.foirBounds.lenderMax),
    safe: clamp(safe, RULES.foirBounds.safeMin, RULES.foirBounds.safeMax),
  }
}

function fairRateBand(input: BorrowerInput, product: LoanType): RateRange {
  const base = BASE_RATE_BANDS[product]
  let low = base.low
  let high = base.high

  if (hasKnownCreditScore(input)) {
    const score = input.creditScore as number
    if (score >= RULES.veryGoodScore) {
      low += RULES.pricing.veryGoodScore.lowDelta
      high += RULES.pricing.veryGoodScore.highDelta
    } else if (score >= RULES.pricing.goodScoreThreshold) {
      low += RULES.pricing.goodScore.lowDelta
      high += RULES.pricing.goodScore.highDelta
    } else if (score < RULES.lowScorePenalty.threshold) {
      low += RULES.pricing.lowScore.lowDelta
      high += RULES.pricing.lowScore.highDelta
    }
  } else {
    low += RULES.pricing.unknownScore.lowDelta
    high += RULES.pricing.unknownScore.highDelta
  }

  if ((input.employmentYears ?? 99) < RULES.pricing.shortEmploymentYears && input.incomeType === 'salaried') {
    low += RULES.pricing.shortEmployment.lowDelta
    high += RULES.pricing.shortEmployment.highDelta
  } else if ((input.employmentYears ?? 0) >= RULES.pricing.stableEmploymentYears && input.incomeType === 'salaried') {
    low += RULES.pricing.stableEmployment.lowDelta
    high += RULES.pricing.stableEmployment.highDelta
  }

  if ((input.businessYears ?? 99) < RULES.pricing.shortBusinessYears && (input.incomeType === 'self_employed' || product.startsWith('business'))) {
    low += RULES.pricing.shortBusiness.lowDelta
    high += RULES.pricing.shortBusiness.highDelta
  } else if ((input.businessYears ?? 0) >= RULES.pricing.stableBusinessYears && input.incomeType === 'self_employed') {
    low += RULES.pricing.stableBusiness.lowDelta
    high += RULES.pricing.stableBusiness.highDelta
  }

  if (hasKnownCreditScore(input) && (input.cardUtilisation ?? 0) >= RULES.pricing.cardUtilisationHighThreshold) {
    low += RULES.pricing.highCardUtilisation.lowDelta
    high += RULES.pricing.highCardUtilisation.highDelta
  } else if (hasKnownCreditScore(input) && (input.cardUtilisation ?? 0) >= RULES.pricing.cardUtilisationMediumThreshold) {
    low += RULES.pricing.mediumCardUtilisation.lowDelta
    high += RULES.pricing.mediumCardUtilisation.highDelta
  }

  if (input.incomeType === 'informal') {
    low += RULES.pricing.informalIncome.lowDelta
    high += RULES.pricing.informalIncome.highDelta
  } else if (input.incomeType === 'self_employed' && !(input.itrAnnualIncome ?? 0)) {
    low += RULES.pricing.selfEmployedNoItr.lowDelta
    high += RULES.pricing.selfEmployedNoItr.highDelta
  }

  if (input.recentBounce) {
    low += RULES.pricing.recentBounce.lowDelta
    high += RULES.pricing.recentBounce.highDelta
  }

  if (product === 'business_secured' && (input.collateralValue ?? 0) > 0) {
    low += RULES.pricing.securedBusinessCollateral.lowDelta
    high += RULES.pricing.securedBusinessCollateral.highDelta
  }

  const flooredLow = Math.max(RULES.pricing.rateFloorPct, low)
  return { low: flooredLow, high: Math.max(flooredLow + RULES.pricing.minimumBandWidthPct, high) }
}

function isKnown(value: BorrowerInput[keyof BorrowerInput]) {
  return value !== undefined && value !== null && value !== ''
}

function uncertaintyFor(input: BorrowerInput): {
  confidence: AssessmentResult['confidence']
  missing: string[]
  widthPct: number
} {
  const missing: string[] = []

  // Core unknowns are especially important because they affect affordability or pricing directly.
  if (!hasKnownCreditScore(input)) missing.push('credit score')
  if (input.householdExpenses == null) missing.push('full household expenses')
  if (input.existingEmis == null) missing.push('exact existing monthly EMIs')

  // Every adaptive optional question tightens the amount range when answered.
  // This keeps "Tighten your ranges" literally true rather than decorative.
  const relevantOptional = additionalQuestions.filter((q) => !q.showWhen || q.showWhen(input))
  for (const question of relevantOptional) {
    if (!isKnown(input[question.key])) missing.push(question.label.toLowerCase())
  }

  const widthPct = Math.min(
    RULES.uncertainty.maxWidthPct,
    RULES.uncertainty.baseWidthPct + missing.length * RULES.uncertainty.widthPerMissingSignalPct,
  )
  const confidence: AssessmentResult['confidence'] = widthPct <= RULES.uncertainty.highConfidenceMaxWidthPct
    ? 'HIGH'
    : widthPct <= RULES.uncertainty.mediumConfidenceMaxWidthPct ? 'MEDIUM' : 'LOW'
  return { confidence, missing: [...new Set(missing)], widthPct }
}

function widen(value: number, widthPct: number): MoneyRange {
  return {
    low: roundMoney(value * (1 - widthPct), RULES.rounding.amountRangeStep),
    high: roundMoney(value * (1 + widthPct), RULES.rounding.amountRangeStep),
  }
}

export function evaluateBorrower(input: BorrowerInput): AssessmentResult {
  const product = recommendProduct(input)
  const requestedTenure = RULES.tenureMonths[product]
  const ageEligible = input.age == null || input.age < RULES.maxRepaymentAge[product]
  const ageLimitedMonths = input.age == null ? requestedTenure : Math.max(RULES.minimumTenureMonths, (RULES.maxRepaymentAge[product] - input.age) * 12)
  const tenure = Math.min(requestedTenure, ageLimitedMonths)
  const assessed = assessedLenderIncome(input, product)
  const otherHouseholdIncome = householdSupportRelevant(input, product) ? (input.otherHouseholdIncome ?? input.coApplicantMonthlyIncome ?? 0) : 0
  const householdLowIncome = (input.incomeLow ?? 0) + otherHouseholdIncome
  const debt = currentDebtLoad(input)
  const foir = adjustedFoir(input)
  const rate = fairRateBand(input, product)
  const midRate = (rate.low + rate.high) / 2
  const uncertainty = uncertaintyFor(input)

  const lenderMonthlyCap = Math.max(0, assessed.high * foir.lender - debt.amount)
  const lenderIncomeBasedPrincipal = principalFromEmi(lenderMonthlyCap, midRate, tenure)
  let principalConstraint = RULES.productAmountCaps[product]
  if ((product === 'business_secured' || product === 'lap') && (input.collateralValue ?? 0) > 0) {
    const ltv = RULES.collateralLtv[product]
    principalConstraint = Math.min(principalConstraint, (input.collateralValue ?? 0) * ltv)
  }
  let lenderPrincipal = Math.min(lenderIncomeBasedPrincipal, principalConstraint)
  if (!ageEligible) lenderPrincipal = 0

  const safeFoirCap = Math.max(0, householdLowIncome * foir.safe - debt.amount)
  const residualBuffer = Math.max(
    householdLowIncome * RULES.minimumResidualBuffer.shareOfIncome,
    RULES.minimumResidualBuffer.rupeeFloor,
  )
  const monthlyLargeExpenseReserve = (input.largeExpenseNext12m ?? 0) / 12
  const householdExpenses = input.householdExpenses == null
    ? Math.max(
        householdLowIncome * RULES.unknownHouseholdExpenseProxy.shareOfConservativeIncome,
        RULES.unknownHouseholdExpenseProxy.rupeeFloor,
      )
    : input.householdExpenses
  const residualCap = Math.max(
    0,
    householdLowIncome - householdExpenses - debt.amount - residualBuffer - monthlyLargeExpenseReserve,
  )
  let safeMonthlyCap = Math.min(safeFoirCap, residualCap)

  const hardDistressStop = Boolean(
    RULES.recentBounce.hardStopWithHighCostDebt && input.recentBounce && (input.highCostDebtOutstanding ?? 0) > 0,
  )
  if (hardDistressStop) safeMonthlyCap = 0
  const roundedMonthlyCeiling = Math.max(0, Math.floor(safeMonthlyCap / RULES.rounding.emiCeilingStep) * RULES.rounding.emiCeilingStep)

  const safePrincipalRaw = principalFromEmi(roundedMonthlyCeiling, midRate, tenure)
  let safePrincipal = Math.min(safePrincipalRaw, principalConstraint)
  if (!ageEligible) safePrincipal = 0

  let lenderSanction = widen(lenderPrincipal, uncertainty.widthPct)
  let safeCarry = widen(safePrincipal, uncertainty.widthPct)
  const roundedConstraint = Math.floor(principalConstraint / RULES.rounding.amountRangeStep) * RULES.rounding.amountRangeStep
  lenderSanction.high = Math.min(lenderSanction.high, roundedConstraint)
  safeCarry.high = Math.min(safeCarry.high, roundedConstraint)

  if (!ageEligible) {
    lenderSanction = { low: 0, high: 0 }
    safeCarry = { low: 0, high: 0 }
  } else if (hardDistressStop) {
    safeCarry = { low: 0, high: 0 }
    lenderSanction = { low: 0, high: roundMoney(Math.min(input.requestedAmount ?? RULES.distressPossibleLenderOfferCap, RULES.distressPossibleLenderOfferCap), RULES.rounding.amountRangeStep) }
  }

  const requested = input.requestedAmount ?? 0
  const recommendedAmount = hardDistressStop ? 0 : Math.max(0, Math.floor(Math.min(requested, safePrincipal) / RULES.rounding.recommendedAmountStep) * RULES.rounding.recommendedAmountStep)
  const emiAtRecommendedAmount = emi(recommendedAmount, midRate, tenure)

  let verdict: AssessmentResult['verdict'] = 'BORROW'
  let verdictReason = 'The requested amount fits within the borrower-safe capacity and no hard distress rule fired.'
  if (!ageEligible) {
    verdict = 'DONT_BORROW'
    verdictReason = `The selected product would run beyond this model's repayment-age ceiling of ${RULES.maxRepaymentAge[product]}; use a different structure/product rather than forcing an unaffordable tenure.`
  } else if (hardDistressStop) {
    verdict = 'DONT_BORROW'
    verdictReason = 'A recent repayment bounce plus outstanding high-cost debt indicates current repayment stress; adding debt is not borrower-safe today.'
  } else if (safeCarry.high <= 0) {
    verdict = 'DONT_BORROW'
    verdictReason = 'After existing obligations, essential-expense allowance and the residual-income buffer, there is no safe capacity for a new EMI today.'
  } else if (requested > safePrincipal) {
    verdict = 'BORROW_LESS'
    verdictReason = 'A lender may approve more than the amount this household can safely carry; cap borrowing at the borrower-safe range.'
  }

  const fees = RULES.defaultFeesPct[product]
  const feeLow = fees.low
  const feeHigh = fees.high
  const aprLow = aprFromFee(Math.max(recommendedAmount, requested, 1), rate.low, tenure, feeLow, RULES.gstOnProcessingFee)
  const aprHigh = aprFromFee(Math.max(recommendedAmount, requested, 1), rate.high, tenure, feeHigh, RULES.gstOnProcessingFee)

  const stressIncome = householdLowIncome * (1 - RULES.stress.incomeDropPct)
  const stressFoirCap = Math.max(0, stressIncome * foir.safe - debt.amount)
  const stressResidualBuffer = Math.max(
    stressIncome * RULES.minimumResidualBuffer.shareOfIncome,
    RULES.minimumResidualBuffer.rupeeFloor,
  )
  const stressHouseholdExpenses = input.householdExpenses == null
    ? Math.max(
        stressIncome * RULES.unknownHouseholdExpenseProxy.shareOfConservativeIncome,
        RULES.unknownHouseholdExpenseProxy.rupeeFloor,
      )
    : householdExpenses
  const stressResidualCap = Math.max(
    0,
    stressIncome - stressHouseholdExpenses - debt.amount - stressResidualBuffer - monthlyLargeExpenseReserve,
  )
  const stressSafeCap = Math.min(stressFoirCap, stressResidualCap)
  const stressEmi = requested > 0 ? emi(requested, midRate, tenure) : 0
  let stressCase = `If household income falls ${Math.round(RULES.stress.incomeDropPct * 100)}%, the safe new-EMI capacity falls to about ₹${Math.round(stressSafeCap).toLocaleString('en-IN')}/month.`
  if (stressEmi > stressSafeCap && verdict !== 'DONT_BORROW') {
    stressCase += ' The requested loan would breach that stressed ceiling, so a longer tenure or smaller amount is safer.'
  }

  const reasons: string[] = [...assessed.reasons]
  if ((input.otherHouseholdIncome ?? 0) > 0 && !(input.coApplicantMonthlyIncome ?? 0)) reasons.push('Other stable household income supports borrower-safe capacity, but it is not counted in lender eligibility unless that person actually joins and qualifies as a co-applicant.')
  reasons.push(`Lender ceiling uses about ${Math.round(foir.lender * 100)}% FOIR; borrower-safe ceiling uses about ${Math.round(foir.safe * 100)}% of conservative household income.`)
  reasons.push(`Borrower-safe EMI is the lower of about ₹${Math.round(safeFoirCap).toLocaleString('en-IN')} FOIR headroom and ₹${Math.round(residualCap).toLocaleString('en-IN')} residual-income headroom, then rounded down to ₹${Math.round(roundedMonthlyCeiling).toLocaleString('en-IN')}/month.`)
  reasons.push(`Likely lender amount starts from about ₹${Math.round(lenderMonthlyCap).toLocaleString('en-IN')}/month of assessed EMI headroom, converted over ${tenure} months at the midpoint rate and then limited by product/LTV caps.`)
  if (debt.isEstimated) reasons.push('Unknown monthly debt is not treated as zero; the model reserves a conservative proxy based on income and any known high-cost outstanding debt.')
  if (input.householdExpenses == null) reasons.push('Unknown household expenses are not treated as zero; the model uses a conservative expense proxy and widens the result range.')
  if ((input.collateralValue ?? 0) > 0 && product === 'business_secured') reasons.push('The unencumbered property supports a secured route, but income still limits repayment capacity.')
  if (!hasKnownCreditScore(input)) reasons.push('Unknown credit score widens the pricing and sanction ranges instead of being treated as a bad score.')
  if (hasKnownCreditScore(input) && (input.creditScore as number) >= RULES.veryGoodScore) reasons.push('A strong reported credit score improves the fair-rate band.')
  if (!ageEligible) reasons.push(`Age exceeds this model's repayment-age ceiling for the selected product, so calculated borrowing capacity is set to zero.`)
  if (input.recentBounce) reasons.push('A recent bounce worsens likely lender appetite and borrower safety.')
  if ((input.purpose === 'business' || input.purpose === 'vehicle') && (input.productiveIncomeGain ?? 0) > 0) reasons.push(`Expected incremental cash flow of ₹${Math.round(input.productiveIncomeGain ?? 0).toLocaleString('en-IN')}/month is treated as upside, not counted as guaranteed base income.`)

  let negotiationPoints: string[]
  if (verdict === 'DONT_BORROW') {
    const firstAction = !ageEligible
      ? 'Ask whether a different eligible product, shorter structure or co-borrower setup is available; do not force this product beyond the model age limit.'
      : hardDistressStop
        ? 'Do not use a new loan to patch current repayment stress; first regularise the high-cost debt and rebuild repayment history.'
        : 'Do not add a new EMI until income, expenses or existing obligations leave positive borrower-safe headroom.'
    negotiationPoints = [
      firstAction,
      `If a lender still makes an offer, use ${rate.low.toFixed(1)}%–${rate.high.toFixed(1)}% only as a comparison band and inspect the KFS APR; availability is not affordability.`,
      'Ask the lender to show processing fees and all mandatory charges before signing anything.',
    ]
  } else {
    negotiationPoints = [
      `Keep total new EMI at or below ₹${Math.round(roundedMonthlyCeiling).toLocaleString('en-IN')}/month.`,
      `Ask for a nominal rate inside ${rate.low.toFixed(1)}%–${rate.high.toFixed(1)}% and compare the KFS APR, not just the headline rate.`,
      'Ask the lender to show processing fees and all mandatory charges before signing.',
    ]
    if (product === 'business_secured') negotiationPoints.unshift('Ask for a secured business facility against eligible property rather than an expensive unsecured personal loan.')
  }

  return {
    verdict,
    verdictReason,
    recommendedProduct: product,
    lenderSanction,
    safeCarry,
    recommendedAmount,
    fairRate: rate,
    apr: { low: aprLow, high: aprHigh },
    monthlyCeiling: roundedMonthlyCeiling,
    suggestedTenureMonths: tenure,
    emiAtRecommendedAmount: roundMoney(emiAtRecommendedAmount, RULES.rounding.displayedEmiStep),
    stressCase,
    confidence: uncertainty.confidence,
    missingSignals: uncertainty.missing,
    reasons,
    negotiationPoints,
  }
}
