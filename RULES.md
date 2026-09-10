# RULES.md

## Philosophy

Borrower Copilot intentionally keeps **lender eligibility** and **borrower-safe affordability** separate. Lender rules estimate what may be sanctioned; borrower rules answer what should be carried without making the household fragile. None of the judgement thresholds below are presented as RBI-mandated FOIR limits.

All amounts are INR. Rate bands are nominal annual reducing-balance rates unless explicitly labelled APR.

## Rule table

| What | Value | Why | Source |
|---|---:|---|---|
| Salaried lender FOIR | 55% | Stable documented salary generally supports higher lender obligation tolerance. | My judgement; sanity-checked against public lender EMI/NMI examples. |
| Self-employed lender FOIR | 45% | Income is less predictable and documentation quality varies. | My judgement. |
| Mixed-income lender FOIR | 40% | Part of income may be less consistently documentable. | My judgement. |
| Informal/gig lender FOIR | 35% | Conservative proxy for likely formal-lender assessment. | My judgement. |
| Salaried borrower-safe FOIR | 35% | Leaves materially more household headroom than a lender maximum. | My judgement. |
| Self-employed borrower-safe FOIR | 28% | Adds buffer for business/income volatility. | My judgement. |
| Mixed-income borrower-safe FOIR | 25% | Keeps fixed debt lower when income quality varies. | My judgement. |
| Informal/gig borrower-safe FOIR | 22% | Higher income volatility and fewer formal protections warrant lower fixed debt. | My judgement. |
| FOIR hard bounds | Lender 20–60%; borrower-safe 15–40% | Prevent stacked adjustments from producing extreme obligation ratios. | My judgement. |
| Low-score threshold | <700 | Treats sub-700 reported score as a risk signal, not an automatic rejection. | My judgement. |
| Low-score lender FOIR adjustment | -5 percentage points | Less lender appetite / headroom. | My judgement. |
| Low-score safe FOIR adjustment | -3 percentage points | Adds borrower-side cushion. | My judgement. |
| Very-good score threshold | >=775 | Used to improve pricing band, not affordability. | My judgement. |
| Unknown credit score | Never mapped to 300 or zero | Unknown widens pricing/sanction range instead of manufacturing a negative score. | Challenge principle; implementation judgement. |
| Recent EMI/payment bounce | -10 percentage points lender FOIR | Recent repayment friction should materially reduce likely appetite. | My judgement. |
| Recent bounce + outstanding high-cost debt | Hard `DON'T BORROW` safety stop | Current distress should be regularised before adding debt, even if a lender might still offer it. | My judgement. |
| Emergency savings >=6 months | +3 percentage points safe FOIR | Strong liquidity can absorb income interruption. | My judgement. |
| Emergency savings <1 month (when known) | -3 percentage points safe FOIR | Thin liquidity increases repayment fragility. | My judgement. |
| >=2 dependents | -2 percentage points safe FOIR | More household obligations reduce discretionary debt capacity. | My judgement. |
| High-cost debt APR >=24% | -2 percentage points safe FOIR | Expensive existing debt is a household risk signal. | My judgement. |
| Unknown existing EMI | max(10% of conservative monthly income, 8% of known high-cost outstanding/month) | Unknown debt service must not silently become zero. | My judgement; deliberately conservative proxy, flagged as estimated. |
| Unknown household expenses | max(50% of conservative household income, ₹15,000/month) | Missing expenses must not become ₹0; the proxy also leaves room for essential spending before new EMI. | My judgement; deliberately conservative and visibly disclosed. |
| Amount-range uncertainty | ±8% base + 1.8pp per relevant unanswered signal; max ±30% | Every additional relevant answer tightens the displayed range; silence visibly increases uncertainty. | My judgement; implements challenge requirement. |
| Minimum residual-income buffer | max(20% of conservative household income, ₹15,000/month) | Prevents FOIR from consuming cash needed for normal life. | My judgement. |
| Known large expense next 12 months | Reserve 1/12 per month | Converts a known near-term obligation into monthly affordability pressure. | My judgement. |
| Stress case | Household income -20% | Simple, explainable bad-month test applicable across fixed/variable incomes. | My judgement. |
| Business secured / ABL LTV ceiling | 65% | Public SBI ABL Saral uses 65% of realizable immovable-property value. | SBI ABL Saral. |
| LAP LTV model ceiling | 60% | Conservative product-level cap. | My judgement; public SBI LAP examples show 60–65% depending on loan size. |
| Gold LTV model ceiling | 75% | Conservative generic cap; production version should track current regulatory/product rules directly. | My judgement. |
| Processing-fee GST assumption | 18% on processing fee | Used only for estimated APR when fee is supplied/assumed as a percentage. | Indian GST treatment commonly applicable to banking service fees; implementation assumption. |
| Distress-case possible lender-offer cap | ₹75,000 | Acknowledges that a distressed borrower may still receive a small expensive offer without presenting it as borrower-safe. | My judgement; deliberately labelled very uncertain. |
| EMI ceiling rounding | Round down to nearest ₹500 | Never display a ceiling above the raw calculated safe outflow. | Implementation judgement. |
| Recommended amount rounding | Round down to nearest ₹5,000 | Prevent rounding from creating an EMI above the safe ceiling. | Implementation judgement. |
| Displayed amount-range rounding | Nearest ₹5,000 | Avoid fake rupee-level precision in eligibility ranges. | Implementation judgement. |
| Displayed EMI rounding | Nearest ₹100 | Readable borrower-facing amount without materially changing the decision. | Implementation judgement. |

## Lender-income assessment

| Income type / signal | Rule | Why | Source |
|---|---|---|---|
| Salaried | Use the reported conservative monthly take-home; no separate strong-month value | Avoids a hidden/stale variable-income field inflating a salaried case. | My judgement. |
| Self-employed + ITR known | Anchor lender income to monthly ITR; allow high side up to 110% of ITR monthly income if cash range supports it | Prevents best cash month from dominating a formal eligibility estimate while allowing modest documented/cash-flow variation. | My judgement. |
| Self-employed without ITR | Count 65–80% of reported low/high income for lender estimate | Documentation uncertainty haircut. | My judgement. |
| Informal/gig | Count 60–75% of reported low/high income for lender estimate | Conservative documentability haircut. | My judgement. |
| Mixed | Count 80–90% of reported range | Some streams may not be fully verifiable. | My judgement. |
| Other stable household income | Add to borrower-safe household cash flow only | A spouse/family member can support household affordability without automatically being lender-countable. | My judgement. |
| Eligible co-applicant who will join | Add stated documented income to lender-assessed income; do not double-count it in household cash flow | Joint repayment capacity can matter only when that person actually joins and lender accepts the income. | My judgement; public SBI LAP materials state qualifying family income may be considered when joining as co-borrower/guarantor. |

## Adaptive question-to-output map

Every optional question below is shown only when relevant. Supplying an answer removes one uncertainty signal (tightening the amount range) and, where the rule has a threshold, can also move the central estimate or rate band.

| Additional question | Shown when | What it changes |
|---|---|---|
| Employment years | Salaried | Pricing tail at <1 or >=3 years; otherwise still tightens amount uncertainty. |
| Business years | Self-employed / business purpose | Pricing tail at <2 or >=5 years; otherwise tightens amount uncertainty. |
| ITR annual income | Self-employed | Anchors lender-assessed income and sanction amount. |
| Collateral value | Business / secured business / LAP | Can route business borrowing to secured credit and sets LTV amount cap. |
| Other stable household income | Business/home, non-salaried, or an explicit secured/LAP route | Raises borrower-safe household cash flow without assuming lender eligibility. |
| Eligible co-applicant income | Business/home, non-salaried, or an explicit secured/LAP route | Raises lender-assessed income only when the person will actually join. |
| Emergency savings | All | Moves borrower-safe FOIR at <1 or >=6 months; otherwise tightens uncertainty. |
| Financial dependents | All | Lowers borrower-safe FOIR at >=2; otherwise tightens uncertainty. |
| High-cost debt outstanding | Bounce, debt consolidation, or informal income | Feeds unknown-debt proxy and can trigger the hard distress stop with a recent bounce. |
| High-cost debt APR | High-cost balance >0 | Lowers safe FOIR at >=24%; otherwise tightens uncertainty. |
| Expected productive income gain | Business / vehicle | Adds an explanation/sensitivity signal but is deliberately not counted as guaranteed base income; answering still tightens uncertainty. |
| Card utilisation | Known credit score | Widens/shifts fair-rate band at >=50% and >=75%. |
| Known large expense next 12 months | All | Reserves one-twelfth monthly from residual-income affordability. |

## Product routing

| Situation | Route | Why | Source |
|---|---|---|---|
| Business purpose + >=₹10 lakh collateral entered | Secured business facility | Separates productive borrowing from expensive unsecured personal credit; collateral may improve structure/pricing. | My judgement; SBI ABL Saral explicitly supports current/fixed assets for business and wholesale/retail trade. |
| Business purpose without usable collateral | Unsecured business loan | No security basis supplied. | My judgement. |
| Vehicle purpose <=₹5 lakh | Two-wheeler loan | Better match than generic personal borrowing for a small vehicle. | My judgement. |
| Home purpose | Home loan | Purpose-matched secured product. | My judgement. |
| Otherwise | Personal loan | General unsecured fallback. | My judgement. |


## Model product amount caps

These caps prevent an income-derived EMI calculation from implying implausibly large exposure for the product. They are model guardrails, not claims about universal lender maxima.

| Product | Model amount cap | Source |
|---|---:|---|
| Personal | ₹25 lakh | My judgement. |
| Secured business | ₹5 crore | My judgement; also aligns with the upper end published for SBI ABL Saral. |
| Unsecured business | ₹50 lakh | My judgement. |
| Two-wheeler | ₹5 lakh | My judgement for the v1 borrower-assessment scope. |
| Home | ₹5 crore | My judgement. |
| LAP | ₹5 crore | My judgement. |
| Gold | ₹50 lakh | My judgement. |

For secured business/LAP, the final principal constraint is the lower of the product cap and the applicable LTV cap. The displayed uncertainty range is also clipped to that same hard constraint.

## Tenure and age assumptions

| Product | Default tenure | Model repayment-age ceiling | Source |
|---|---:|---:|---|
| Personal | 60 months | 60 | My judgement. |
| Secured business | 120 months | 70 | My judgement; long-tenure asset-backed products exist, but actual policy varies. |
| Unsecured business | 60 months | 65 | My judgement. |
| Two-wheeler | 48 months | 65 | My judgement. |
| Home | 240 months | 70 | My judgement. |
| LAP | 120 months | 70 | My judgement; SBI public LAP material refers to repayment by age 70. |
| Gold | 24 months | 70 | My judgement. |

If age shortens the available repayment window, the engine shortens tenure, with a minimum modelled tenure of 12 months. If the borrower is already at or beyond the model repayment-age ceiling for the selected product, lender and safe capacity are set to zero and the verdict is `DON'T BORROW` for that structure.

## Base fair-rate bands

These are **borrower negotiation anchors, not live lender quotes**. They intentionally span multiple lender/product outcomes and are widened/shifted by profile signals. Before production, this table should be refreshed automatically from lender rate cards/KFS observations.

| Product | Base nominal band | Basis |
|---|---:|---|
| Personal | 11.0–15.0% | Public large-bank personal-loan pricing provides an anchor around low-teens for stronger profiles, with wider tails. |
| Secured business | 9.5–13.0% | Security and business asset backing should price below comparable unsecured business debt for a bankable borrower. |
| Unsecured business | 13.0–20.0% | Higher-loss / documentation risk than secured credit. |
| Two-wheeler | 11.0–18.0% | ICICI publicly states a broad two-wheeler range of 10.25–26.10%; model base focuses on a negotiable mainstream band before risk add-ons. |
| Home | 8.0–10.5% | Generic secured retail anchor. |
| LAP | 9.0–12.5% | Generic secured property-backed anchor. |
| Gold | 8.5–13.0% | Generic secured gold-loan anchor. |

### Pricing adjustments

| Signal | Adjustment | Why |
|---|---:|---|
| Score >=775 | low -0.5pp, high -2.5pp | Strong score should mainly tighten away the expensive tail. |
| Score 750–774 | high -1.0pp | Moderate tightening. |
| Score <700 | low +2.0pp, high +4.0pp | Wider/higher risk pricing. |
| Score unknown | low -0.5pp, high +2.5pp | Widen rather than punish with a fabricated score. |
| Salaried tenure <1 year | low +0.5pp, high +1.5pp | Employment stability uncertainty. |
| Salaried tenure >=3 years | high -0.5pp | Removes some pricing uncertainty. |
| Business history <2 years | low +0.5pp, high +1.5pp | Thin operating history. |
| Self-employed history >=5 years | high -0.5pp | Long operating history tightens the tail. |
| Card utilisation 50–74% | high +1.0pp | Higher revolving utilisation is a risk signal. |
| Card utilisation >=75% | low +1.0pp, high +2.0pp | Stronger risk signal. |
| Informal income | low +2.5pp, high +5.0pp | Documentation and volatility premium. |
| Self-employed, no ITR | low +1.5pp, high +3.0pp | Documentation premium. |
| Recent bounce | low +3.0pp, high +5.0pp | Recent repayment distress. |
| Secured business collateral supplied | low -0.5pp, high -0.5pp | Security improves structure, while income still limits amount. |
| Rate floor | 7.0% | Prevent stacked favourable adjustments from implying an implausibly low generic negotiation anchor. |
| Minimum fair-rate band width | 1.0 percentage point | The app always returns a band, never false point precision. |

## Default processing-fee bands used for APR

Used by the v1 APR estimator when no lender KFS is available. The actual lender KFS should replace this estimate during negotiation.

| Product | Fee band |
|---|---:|
| Personal | 0.5–2.0% |
| Secured business | 0.5–1.0% |
| Unsecured business | 1.0–2.5% |
| Two-wheeler | 1.0–3.0% |
| Home | 0.25–1.0% |
| LAP | 0.5–1.5% |
| Gold | 0.25–1.0% |

SBI publicly lists up to 0.65% processing/upfront fee for ABL Saral and 1.5% (subject to rupee min/max) for Xpress Credit in its published fee schedule. The model bands are intentionally generic rather than claiming one lender's fee is universal.

## APR calculation

APR is not `nominal rate + fee %`.

1. Calculate the EMI from principal, nominal reducing-balance annual rate, and tenure.
2. Reduce day-one borrower proceeds by the processing fee plus the modelled GST on that fee.
3. Solve the monthly internal rate of return for `net disbursal → monthly EMI cash flows` using bisection.
4. Annualise as `(1 + monthly IRR)^12 - 1`.

RBI's KFS framework defines APR as the annual cost of credit including interest and other charges associated with the credit facility, and requires the all-in cost to be disclosed in the KFS for covered retail/MSME loans. This app can only estimate charges the borrower supplies or the model explicitly assumes; the lender's KFS APR is the source of truth for any additional mandatory/third-party charges.

## Confidence / range width

Amount ranges use a continuous uncertainty width rather than three fixed buckets:

- Start at **±8%** around the central estimate.
- Add **1.8 percentage points** of width for every relevant unanswered signal.
- Cap widening at **±30%**.
- Label the result **High** at ≤±11%, **Medium** at ≤±18%, otherwise **Low**.

The adaptive optional questions are also the uncertainty signals. Therefore every optional answer literally tightens at least one displayed amount range, even when the answer does not move the central estimate. Core unknowns such as credit score, full household expenses and exact existing EMI also count toward uncertainty. Missing score additionally widens the pricing band directly.

## Verdict rules

| Verdict | Rule |
|---|---|
| `DON'T BORROW` | Recent bounce **and** outstanding high-cost debt; or borrower-safe capacity falls to zero. |
| `BORROW LESS` | Requested amount exceeds the central borrower-safe maximum calculated from the conservative EMI ceiling. |
| `BORROW` | Requested amount fits inside borrower-safe capacity and no hard distress rule fires. |

A lender sanction never overrides the borrower-safe verdict.

## Sources checked (re-verified 11 Sep 2026)

- RBI Annual Report discussion of the 15 Apr 2024 KFS circular for retail/MSME loans: https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436
- RBI Master Directions text defining KFS/APR as annual cost including interest and other credit-facility charges: https://systemhealth.rbi.org.in/Scripts/BS_ViewMasDirections.aspx_id=12256(2).html
- SBI ABL Saral: business-purpose eligibility, ₹10 lakh–₹5 crore quantum, 65% LTV, up to 0.65% processing/upfront fee: https://sbi.bank.in/hi/web/business/sme/sme-loans/abl-saral
- SBI Personal Loan rates (10.00–15.00% effective range shown w.e.f. 30 Jun 2026; page updated 31 Aug 2026): https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/personal-loans-schemes/
- SBI processing-fee schedule, including Xpress Credit up to 1.50% + GST (page updated 19 Aug 2026): https://sbi.bank.in/en/web/interest-rates/interest-rates/processing-fees
- SBI public LAP page showing historical EMI/NMI ratios and 60–65% LTV examples: https://sbi.co.in/web/personal-banking/loans/loans-against-property/loans-against-property
- ICICI Two-Wheeler Loan page stating rates vary with amount/tenure/creditworthiness and publishing a 10.25–26.10% range: https://www.icicibank.com/personal-banking/loans/two-wheeler-loan/review

## What this model explicitly does not know

- A lender's proprietary bureau cut-offs, scorecards or pre-approved exposure.
- Verified bank-statement cash flows, GST filings, bureau tradelines or DPD history.
- Property legal/technical eligibility and forced-sale/realizable valuation.
- Whether a spouse/co-applicant will actually be accepted and joined to the facility.
- Live branch-specific discounts, employer programs, dealer subvention, insurance bundling or negotiated fees.
- Exact regulatory/product rules for every lender and every loan category.

Those gaps are why this is a **self-assessment and negotiation tool**, not an approval predictor.
