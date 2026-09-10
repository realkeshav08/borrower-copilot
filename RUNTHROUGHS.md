# Three borrower run-throughs

The outputs below are produced by the same deterministic rules used in the app. Challenge facts that do not provide a value are left unknown. Unknown debt and household expenses receive conservative proxies; unanswered adaptive signals widen the displayed ranges.

## 1. Priya, 29 — Bengaluru — salaried

### Questions and answers

| Question | Answer |
|---|---|
| Purpose | Wedding / personal event |
| Amount wanted | ₹8,00,000 |
| Product considered | Personal loan |
| Income type | Salaried |
| Conservative monthly take-home | ₹1,10,000 |
| Existing monthly EMI | ₹14,000 car loan |
| Full essential household expenses | Unknown. ₹28,000 rent is known, but the brief does not give total essential household expenses. |
| Age | 29 |
| Credit score known? | Yes — 780 |
| Recent bounce? | No |
| Years in current/similar employment | 5 years |
| Emergency savings | Unknown |
| Financial dependents | Unknown |
| Credit-card utilisation | Unknown |
| Known large expense in next 12 months | Unknown |

The variable-income question is skipped because Priya is salaried. Self-employed/collateral/co-applicant questions are also skipped.

### O1 — Borrow / Don't borrow / Borrow less

**BORROW.** The ₹8 lakh request is below the central borrower-safe maximum and no distress rule fires. The app does not recommend taking a larger amount merely because lender eligibility is higher.

### O2 — Maximum amount

- **Lender likely sanction range:** ₹17.65–24.90 lakh
- **Borrower-safe carry range:** ₹7.20–10.15 lakh
- **Amount to use:** **₹8.00 lakh requested**, not the largest sanction
- **Confidence:** Medium

The borrower-safe EMI is the lower of FOIR headroom and residual-income headroom after existing debt, essential-expense allowance and a minimum residual buffer. Because total household expenses are unknown, the model uses a conservative expense proxy rather than ₹0 and keeps the range wider.

### O3 — Fair interest rate

- **Fair nominal band:** 10.5–12.0%
- **Estimated APR:** 11.3–13.9%

The APR estimate includes the modelled personal-loan processing-fee range plus GST on that fee. The lender's KFS APR remains the source of truth for any additional mandatory charges.

### O4 — EMI / outflow

- **Do-not-cross new EMI ceiling:** ₹19,000/month
- **₹8 lakh at 5 years:** about **₹17,500/month**; total interest about **₹2.50 lakh** at the midpoint rate
- **3-year trade-off:** about **₹26,300/month** and ~₹1.46 lakh interest — cheaper overall, but above her ₹19,000 EMI ceiling
- **Stress:** after a 20% household-income drop, safe new-EMI capacity falls to about **₹12,400/month**. The requested loan breaches that stressed ceiling, so a smaller amount is safer if Priya wants to remain comfortable through that shock.

### Negotiation Card

```text
BORROWER COPILOT — PRIYA
Verdict: BORROW

Request                 ₹8,00,000 personal loan
Use this maximum        ₹8,00,000
Lender may sanction     ₹17.65L – ₹24.90L
Borrower-safe capacity  ₹7.20L – ₹10.15L

Fair nominal rate       10.5% – 12.0%
Estimated APR           11.3% – 13.9%
EMI ceiling             ₹19,000/month
Target 5-year EMI       ~₹17,500/month

WHY
• ₹1.10L stable monthly take-home
• 780 reported credit score tightens the pricing band
• Existing ₹14k car EMI is included in affordability
• Unknown full household expenses use a conservative proxy and widen the range

ASK
“Please show me the KFS and all-in APR, including processing and mandatory
charges. I do not need a larger loan just because it is sanctioned.”

Confidence: MEDIUM
```

---

## 2. Ravi, 42 — Mysuru — self-employed

### Questions and answers

| Question | Answer |
|---|---|
| Purpose | Second stock line + delivery vehicle |
| Amount wanted | ₹15,00,000 |
| Product | Recommend the right product |
| Income type | Self-employed |
| Conservative / strong-month cash income | ₹40,000 / ₹80,000 |
| Existing EMI | ₹0 formal EMI |
| Full household expenses | Unknown |
| Age | 42 |
| Credit score known? | No — no formal score |
| Recent bounce? | No |
| Business history | 14 years |
| ITR annual income | ₹4,20,000 |
| Unencumbered shop value | ₹45,00,000 |
| Other stable household income | ₹18,000/month from wife |
| Eligible co-applicant income | Unknown — the brief says his wife earns ₹18,000, but does not say she will join the facility |
| Emergency savings | Unknown |
| Financial dependents | Unknown |
| Expected extra monthly cash flow from expansion | Unknown |
| Known large expense in next 12 months | Unknown |

Salaried-employment and credit-card-utilisation questions are skipped because they do not apply to the supplied profile.

### O1

**BORROW LESS / CHANGE PRODUCT.** The app routes Ravi to a **secured business facility**, not an unsecured personal loan. The shop provides strong security coverage, but collateral is not treated as repayment capacity.

### O2

- **Lender likely sanction range:** ₹9.80–14.85 lakh
- **Borrower-safe carry range:** ₹7.90–12.00 lakh
- **Recommended amount:** about **₹9.95 lakh** on current information
- **Product:** secured business facility
- **Confidence:** Low

Lender income is anchored to the ₹4.20 lakh ITR rather than the ₹80,000 strong cash month. His wife's ₹18,000 supports household affordability, but it is **not** counted in lender eligibility unless she actually joins and qualifies as a co-applicant.

**Useful sensitivity:** if his wife joins the facility and the lender accepts her documented ₹18,000/month income, the model's lender-likely range rises to about **₹14.70–21.50 lakh**. The central borrower-safe recommendation remains about **₹9.95 lakh**, because her income was already part of household cash flow. This is exactly why lender eligibility and borrower safety are modelled separately.

### O3

- **Fair nominal band:** 8.5–14.5%
- **Estimated APR:** 9.0–15.9%

The band is intentionally wide because Ravi has no known credit score. Long business history and property security improve the case, while missing score/expense/project-cash-flow evidence prevents a tight benchmark.

### O4

- **Do-not-cross new EMI ceiling:** **₹14,000/month**
- **Recommended ₹9.95 lakh at 10 years:** about **₹14,000/month**; total interest about **₹6.84 lakh** at the midpoint rate
- **8-year trade-off:** about **₹15,900/month** and ~₹5.31 lakh interest — less interest, but above the ₹14,000 EMI ceiling
- **Stress:** after a 20% household-income drop, safe new-EMI capacity falls to about **₹8,200/month**. That is why the app does not stretch to the ₹15 lakh request merely because collateral exists.

### Negotiation Card

```text
BORROWER COPILOT — RAVI
Verdict: BORROW LESS

Request                 ₹15,00,000 for business expansion
Best-fit product        Secured business facility
Use this maximum        ~₹9,95,000 on current information
Lender may sanction     ₹9.80L – ₹14.85L
Borrower-safe capacity  ₹7.90L – ₹12.00L

Fair nominal rate       8.5% – 14.5%
Estimated APR           9.0% – 15.9%
EMI ceiling             ₹14,000/month

WHY
• 14-year operating history is positive
• ITR, not the ₹80k strong cash month, anchors lender assessment
• Wife's ₹18k income supports household safety but is not assumed lender-countable
• ₹45L unencumbered shop supports a secured route
• Unknown score/expenses/project cash flow keep the range wide

ASK
“Price this as a secured business facility, not an unsecured personal loan.
Please show me the KFS, all-in APR, valuation basis, LTV and every charge.”

Confidence: LOW
```

---

## 3. Anita, 35 — Hubballi — informal/gig

### Questions and answers

| Question | Answer |
|---|---|
| Purpose | Electric scooter / productive vehicle |
| Amount wanted | ₹1,50,000 |
| Product | Two-wheeler loan |
| Income type | Informal/gig |
| Conservative / strong-month income | ₹26,000 / ₹30,000 |
| Existing exact EMI | Unknown |
| Full household expenses | Unknown |
| Age | 35 |
| Credit score known? | No |
| Recent bounce? | Yes — last month |
| Other stable household income | ₹0; husband currently unemployed |
| Eligible co-applicant income | ₹0 |
| Emergency savings | Unknown |
| Financial dependents | 2 children |
| Outstanding high-cost/app-loan debt | ₹35,000 |
| Approximate rate/APR on that debt | 30%+ |
| Expected scooter income gain | Unknown |
| Known large expense in next 12 months | Unknown |

Self-employed ITR/business-history/collateral questions and card-utilisation questions are skipped.

### O1

**DON'T BORROW TODAY.** A recent repayment bounce plus outstanding high-cost app debt fires the explicit borrower-safety stop. The scooter may be productive, but hoped-for future income does not override visible current repayment stress.

### O2

- **Possible lender offer:** ₹0–75,000, very uncertain
- **Borrower-safe new borrowing:** **₹0 today**
- **Amount to use:** **₹0** until current high-cost debt is regularised and repayment history improves
- **Confidence:** Low

Her exact existing monthly debt payment is unknown. The engine reserves the larger of 10% of conservative income or 8% of known high-cost outstanding debt instead of silently using ₹0. Unknown household expenses also receive a conservative proxy. The distress rule then overrides new safe borrowing to zero.

### O3

- **Profile-adjusted comparison band if she shops today:** 16.0–30.5%
- **Estimated APR:** 18.0–38.2%

This is a **warning/comparison range, not a recommendation to accept new credit**. The actionable recommendation is to improve the repayment profile before taking scooter finance.

### O4

- **New EMI ceiling today:** **₹0**
- **Stress:** after a 20% income drop, safe new-EMI capacity remains ₹0/month; the current distress stop is already binding.

### Negotiation Card

```text
BORROWER COPILOT — ANITA
Verdict: DON'T BORROW TODAY

Request                 ₹1,50,000 electric-scooter loan
Possible lender offer   ₹0 – ₹75,000 (very uncertain)
Borrower-safe amount    ₹0 today
New EMI ceiling         ₹0 today

Comparison band         16.0% – 30.5%
Estimated APR           18.0% – 38.2%

WHY
• Income is variable and informal
• ₹35k of 30%+ high-cost app debt remains outstanding
• Exact EMI and household expenses are conservatively proxied, not zeroed
• One EMI bounced last month
• Two dependents; no other current household/co-applicant income

NEXT MOVE
Regularise/clear the high-cost debt → rebuild clean repayment history →
verify the scooter's conservative income gain → reassess vehicle finance.

Confidence: LOW
```
