import { describe, expect, it } from 'vitest'
import { demoCases } from './demoCases'
import { evaluateBorrower } from './evaluateBorrower'

const priya = evaluateBorrower(demoCases.priya)
const ravi = evaluateBorrower(demoCases.ravi)
const anita = evaluateBorrower(demoCases.anita)

describe('challenge borrowers', () => {
  it('lets Priya borrow without confusing lender capacity with safe capacity', () => {
    expect(priya.verdict).toBe('BORROW')
    expect(priya.lenderSanction.low).toBeGreaterThan(priya.safeCarry.low)
    expect(priya.recommendedAmount).toBe(800000)
    expect(priya.emiAtRecommendedAmount).toBeLessThanOrEqual(priya.monthlyCeiling)
  })

  it('routes Ravi to secured business credit and recommends less than requested', () => {
    expect(ravi.verdict).toBe('BORROW_LESS')
    expect(ravi.recommendedProduct).toBe('business_secured')
    expect(ravi.recommendedAmount).toBeLessThan(demoCases.ravi.requestedAmount!)
    expect(ravi.emiAtRecommendedAmount).toBeLessThanOrEqual(ravi.monthlyCeiling)
  })

  it('reaches a genuine do-not-borrow outcome for Anita', () => {
    expect(anita.verdict).toBe('DONT_BORROW')
    expect(anita.safeCarry.high).toBe(0)
    expect(anita.recommendedAmount).toBe(0)
  })
})

describe('rule safety', () => {
  it('never lets a hidden strong-month value inflate salaried lender capacity', () => {
    const clean = evaluateBorrower({ ...demoCases.priya, incomeLow: 50000, incomeHigh: 50000 })
    const staleHiddenValue = evaluateBorrower({ ...demoCases.priya, incomeLow: 50000, incomeHigh: 200000 })
    expect(staleHiddenValue.lenderSanction).toEqual(clean.lenderSanction)
  })

  it('treats unknown existing EMI more conservatively than a known zero EMI', () => {
    const knownZero = evaluateBorrower({ ...demoCases.priya, existingEmis: 0 })
    const unknown = evaluateBorrower({ ...demoCases.priya, existingEmis: null })
    expect(unknown.lenderSanction.high).toBeLessThan(knownZero.lenderSanction.high)
  })

  it('separates household support from lender-counted co-applicant income', () => {
    const householdOnly = evaluateBorrower({ ...demoCases.ravi, coApplicantMonthlyIncome: null })
    const joinedCoApplicant = evaluateBorrower({ ...demoCases.ravi, coApplicantMonthlyIncome: 18000 })
    expect(joinedCoApplicant.lenderSanction.high).toBeGreaterThan(householdOnly.lenderSanction.high)
    expect(joinedCoApplicant.monthlyCeiling).toBe(householdOnly.monthlyCeiling)
  })

  it('does not recommend an amount whose EMI exceeds the borrower ceiling', () => {
    const result = evaluateBorrower({ ...demoCases.ravi, requestedAmount: 987654 })
    expect(result.emiAtRecommendedAmount).toBeLessThanOrEqual(result.monthlyCeiling)
  })

  it('stops a product when the model repayment-age ceiling is already exceeded', () => {
    const result = evaluateBorrower({ ...demoCases.priya, age: 62 })
    expect(result.verdict).toBe('DONT_BORROW')
    expect(result.recommendedAmount).toBe(0)
  })
})
