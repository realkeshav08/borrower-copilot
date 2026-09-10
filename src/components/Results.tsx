import type { AssessmentResult, BorrowerInput } from '../types'
import { money, moneyRange, productLabel, rateRange, verdictLabel } from '../engine/format'
import { emi } from '../engine/math'
import { NegotiationCard } from './NegotiationCard'

interface Props {
  input: BorrowerInput
  result: AssessmentResult
  onEdit: () => void
}

export function Results({ input, result, onEdit }: Props) {
  const tenureYears = result.suggestedTenureMonths / 12
  const midpointRate = (result.fairRate.low + result.fairRate.high) / 2
  const shorterTenure = Math.max(12, result.suggestedTenureMonths - 24)
  const shorterEmi = emi(result.recommendedAmount, midpointRate, shorterTenure)
  const shorterInterest = shorterEmi * shorterTenure - result.recommendedAmount
  const plannedEmiExact = emi(result.recommendedAmount, midpointRate, result.suggestedTenureMonths)
  const plannedInterest = plannedEmiExact * result.suggestedTenureMonths - result.recommendedAmount
  return (
    <main className="results-shell">
      <div className="results-header">
        <div>
          <span className="eyebrow">Your self-assessment</span>
          <h1>{input.name ? `${input.name}, ` : ''}{verdictLabel[result.verdict]}</h1>
          <p>{result.verdictReason}</p>
        </div>
        <div className="header-actions no-print">
          <button className="ghost-btn" onClick={onEdit}>Edit answers</button>
          <button className="primary-btn" onClick={() => window.print()}>Print / save card</button>
        </div>
      </div>

      <section className="output-grid">
        <article className={`output-card verdict-card ${result.verdict.toLowerCase()}`}>
          <span className="output-index">O1</span>
          <h3>{verdictLabel[result.verdict]}</h3>
          <p>{result.verdictReason}</p>
        </article>

        <article className="output-card">
          <span className="output-index">O2</span>
          <h3>Two different maximums</h3>
          <div className="dual-number">
            <div><small>Lender likely</small><strong>{moneyRange(result.lenderSanction.low, result.lenderSanction.high)}</strong></div>
            <div className="safe"><small>Borrower-safe</small><strong>{moneyRange(result.safeCarry.low, result.safeCarry.high)}</strong></div>
          </div>
          <p>Use <strong>{money(result.recommendedAmount)}</strong>, not the biggest sanction available. Best-fit route: {productLabel[result.recommendedProduct]}.</p>
        </article>

        <article className="output-card">
          <span className="output-index">O3</span>
          <h3>Fair interest rate</h3>
          <div className="rate-display">{rateRange(result.fairRate.low, result.fairRate.high)}</div>
          <p>{result.verdict === 'DONT_BORROW' ? 'Use this as a comparison/warning band, not a recommendation to accept new credit. ' : ''}Estimated APR: <strong>{rateRange(result.apr.low, result.apr.high)}</strong>. It includes the modelled processing-fee range plus GST; compare the lender's KFS APR for any other mandatory charges.</p>
        </article>

        <article className="output-card">
          <span className="output-index">O4</span>
          <h3>EMI to agree to</h3>
          <div className="rate-display">≤ {money(result.monthlyCeiling)}</div>
          <p>At {tenureYears % 1 === 0 ? tenureYears : tenureYears.toFixed(1)} years, the recommended amount is about <strong>{money(result.emiAtRecommendedAmount)}/month</strong>.</p>
          {result.recommendedAmount > 0 && shorterTenure < result.suggestedTenureMonths && (
            <>
              <div className="tenure-tradeoff">
                <div><small>{shorterTenure / 12} years</small><strong>{money(shorterEmi)}/mo</strong><span>~{money(shorterInterest)} interest</span></div>
                <div className="selected"><small>{result.suggestedTenureMonths / 12} years</small><strong>{money(result.emiAtRecommendedAmount)}/mo</strong><span>~{money(plannedInterest)} interest</span></div>
              </div>
              <p className="tradeoff-note">{shorterEmi > result.monthlyCeiling
                ? `The shorter option saves interest but exceeds your ${money(result.monthlyCeiling)} EMI ceiling.`
                : 'The shorter option costs more each month but reduces total interest.'}</p>
            </>
          )}
        </article>
      </section>

      <section className="stress-panel">
        <span className="eyebrow">Stress test</span>
        <h2>Would this still feel safe after a bad month?</h2>
        <p>{result.stressCase}</p>
      </section>

      <section className="explain-grid">
        <article>
          <span className="eyebrow">Traceable reasoning</span>
          <h2>Every number has a why</h2>
          <ul className="reason-list">
            {result.reasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
        </article>
        <article>
          <span className="eyebrow">Before you sign</span>
          <h2>Negotiation checklist</h2>
          <ul className="reason-list">
            {result.negotiationPoints.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <div className={`confidence-box ${result.confidence.toLowerCase()}`}>
            <strong>{result.confidence} confidence</strong>
            <span>{result.missingSignals.length ? `Range is wider because these are unknown: ${result.missingSignals.join(', ')}.` : 'The main inputs needed by this ruleset were supplied.'}</span>
          </div>
        </article>
      </section>

      <NegotiationCard input={input} result={result} />

      <p className="disclaimer no-print">This is a borrower-side planning tool, not a lender sanction, credit score, legal advice, or financial advice. Actual underwriting and rates vary by lender and documentation.</p>
    </main>
  )
}
