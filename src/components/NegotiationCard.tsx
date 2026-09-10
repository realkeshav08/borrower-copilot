import type { AssessmentResult, BorrowerInput } from '../types'
import { money, moneyRange, productLabel, rateRange, verdictLabel } from '../engine/format'

interface Props {
  input: BorrowerInput
  result: AssessmentResult
}

export function NegotiationCard({ input, result }: Props) {
  const dontBorrow = result.verdict === 'DONT_BORROW'
  const quoteMessage = dontBorrow
    ? `Do not treat an offer as affordability. If you collect one for comparison, inspect its KFS APR against the ${result.fairRate.low.toFixed(1)}%–${result.fairRate.high.toFixed(1)}% profile band.`
    : `If a lender quotes above ${result.fairRate.high.toFixed(1)}%, ask them to justify the premium against your profile and the KFS APR.`
  const missingSummary = result.missingSignals.length > 4
    ? `${result.missingSignals.slice(0, 4).join(', ')} +${result.missingSignals.length - 4} more`
    : result.missingSignals.join(', ')

  return (
    <section className="negotiation-card" id="negotiation-card">
      <div className="card-topline">
        <div>
          <span className="eyebrow">Borrower Copilot</span>
          <h2>Your negotiation card</h2>
        </div>
        <span className={`verdict-chip ${result.verdict.toLowerCase()}`}>{verdictLabel[result.verdict]}</span>
      </div>

      <div className="card-request">
        <div>
          <span>Request</span>
          <strong>{money(input.requestedAmount ?? 0)}</strong>
        </div>
        <div>
          <span>Best-fit product</span>
          <strong>{productLabel[result.recommendedProduct]}</strong>
        </div>
      </div>

      <div className="card-grid">
        <div className="card-metric">
          <span>Use this maximum</span>
          <strong>{money(result.recommendedAmount)}</strong>
          <small>Borrower-safe recommendation</small>
        </div>
        <div className="card-metric">
          <span>EMI ceiling</span>
          <strong>{money(result.monthlyCeiling)}</strong>
          <small>Do not cross this monthly outflow</small>
        </div>
        <div className="card-metric">
          <span>{dontBorrow ? 'Rate comparison' : 'Fair rate'}</span>
          <strong>{rateRange(result.fairRate.low, result.fairRate.high)}</strong>
          <small>Profile-adjusted nominal band</small>
        </div>
        <div className="card-metric">
          <span>Estimated APR</span>
          <strong>{rateRange(result.apr.low, result.apr.high)}</strong>
          <small>Processing fee + GST modelled; compare the lender KFS for other charges</small>
        </div>
      </div>

      <div className="card-compare">
        <div><span>Lender may sanction</span><strong>{moneyRange(result.lenderSanction.low, result.lenderSanction.high)}</strong></div>
        <div><span>You can safely carry</span><strong>{moneyRange(result.safeCarry.low, result.safeCarry.high)}</strong></div>
      </div>

      <div className="card-callout">
        <strong>{dontBorrow ? 'Decision check' : 'Lender quote check'}</strong>
        <p>{quoteMessage}</p>
      </div>

      <div className="card-why">
        <strong>Why this position</strong>
        <ul>
          {result.reasons.slice(0, 4).map((reason) => <li key={reason}>{reason}</li>)}
        </ul>
      </div>

      <div className="card-script">
        <strong>Say this in the branch</strong>
        <p>{dontBorrow
          ? '“I am not taking a new EMI today. If you give me an offer for comparison, please show me the Key Facts Statement and all-in APR, including mandatory charges.”'
          : `“Please show me the Key Facts Statement and the all-in APR, including processing and mandatory charges. I will keep my EMI at or below ${money(result.monthlyCeiling)}.”`}</p>
      </div>

      <div className="card-footer">
        <span>Confidence: <strong>{result.confidence}</strong></span>
        <span>{result.missingSignals.length ? `Missing: ${missingSummary}` : 'Core affordability signals supplied'}</span>
      </div>
    </section>
  )
}
