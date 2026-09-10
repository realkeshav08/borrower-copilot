# Five-minute walkthrough

## 0:00–0:40 — Problem framing

Borrower Copilot is not another lender eligibility calculator. The central design choice is to maintain two separate numbers: **what a lender may sanction** and **what the borrower should safely carry**. The borrower gets a verdict, amount, fair-rate/APR band, EMI ceiling and a one-page negotiation position.

There is no login, bureau pull or backend. Answers remain in browser memory for the current session.

## 0:40–1:30 — Question design

Start on the assessment screen. The must-set is enough to produce all four outputs and allows “I don't know” for information borrowers often do not know. Unknowns are not silently converted to zero.

Open **Tighten your ranges**. The optional section is adaptive: salaried borrowers see employment stability; self-employed borrowers see ITR/business-history inputs; business borrowers see collateral and incremental cash flow; distressed/informal borrowers see high-cost-debt detail. Every relevant optional answer reduces the displayed uncertainty width; many also move a ceiling, pricing adjustment, product route, or explanation.

The small “Moves:” label under each question is deliberate product transparency: it tells the evaluator exactly why that question earned its place.

## 1:30–2:25 — Priya: lender maximum != borrower maximum

Load **Priya** from Evaluator shortcuts.

Show O1: Borrow. Then O2: the lender range is much larger than the borrower-safe range, yet the app recommends only her ₹8 lakh request. This is the product's core point: more eligibility is not a reason to take more debt.

Show O3: nominal fair-rate band and separate APR. Explain that APR is calculated from cash flows after processing fees reduce net disbursal; it is not nominal rate plus fee percentage.

Show O4 and the 20% income-drop stress case. The base five-year EMI is manageable, but the stress test shows why she should not stretch simply because a lender offers a higher amount.

## 2:25–3:20 — Ravi: product routing

Load **Ravi**.

The app sees a productive business purpose plus a ₹45 lakh unencumbered shop and routes him to a **secured business facility**. It does not let collateral create fake repayment capacity: lender income is anchored primarily to ITR. His wife's ₹18k income supports household safety, but lender eligibility does not count it unless she actually joins and qualifies as a co-applicant.

Result: **Borrow less**. On the brief alone, the lender-likely range is about ₹9.80–14.85 lakh while the borrower-side recommendation is about ₹9.95 lakh with a ₹14k monthly ceiling. If his wife actually joins and her ₹18k documented income is lender-accepted, the lender range rises materially, but the borrower-side central recommendation barely moves because that household income was already counted for safety. The wide range is intentional because score, expenses, savings and project cash flow are unknown.

## 3:20–4:05 — Anita: Don't borrow is reachable

Load **Anita**.

This is the safety case. Recent bounce + outstanding 30%+ app debt fires the hard borrower-side stop. The app still acknowledges that some lender may offer money, but safe new borrowing is ₹0 today.

Point out the “unknown is not zero” behavior: because her exact app-loan EMI and household expenses are not supplied, the model reserves documented conservative proxies instead of deleting those obligations.

The actionable output is a sequence: regularise high-cost debt, rebuild clean repayments, validate conservative scooter income gain, then reassess.

## 4:05–4:35 — Negotiation Card

Scroll to the Negotiation Card and use **Print / save card**. It is designed to fit as a one-page branch reference: request, recommended maximum, lender-vs-safe range, fair rate, APR, EMI ceiling, reasons and a sentence asking for the KFS/all-in APR.

This converts the rules engine into something a borrower can use tomorrow, rather than leaving them with a dashboard of numbers.

## 4:35–5:00 — Engineering and next steps

Open `src/rules/config.ts`. Rules are intentionally separated from UI so the follow-up exercise can change a threshold live and rerun the exact same borrower.

### What I would build next

I would validate the judgement thresholds against anonymised real sanction letters/KFS data; ingest periodically refreshed public lender rate/fee cards; add richer cash-flow evidence for self-employed borrowers; model refinancing/debt-consolidation explicitly; add product-specific floating-rate stress; and run borrower comprehension testing on the negotiation card.

### What I deliberately cut

I did not add authentication, a backend, bureau integration, OCR/bank-statement uploads, ML scoring, dozens of loan products, lender ranking, or a chatbot. None is necessary to prove the key product judgement, and they would make the rules harder to audit during a four-day take-home.
