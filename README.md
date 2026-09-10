# Borrower Copilot

A borrower-side self-assessment for India. It helps a borrower answer four questions before walking into a lender:

1. Should I borrow at all?
2. How much will a lender likely sanction vs. how much can I safely carry?
3. What is a fair interest-rate band and all-in APR?
4. What monthly EMI/outflow should I refuse to cross?

It then creates a one-page Negotiation Card that can be printed or saved as PDF.

## Run locally

Requirements: Node.js 20.19+ (or Node.js 22.12+) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No environment variables, API keys, database, backend, login or bureau connection are required.

Production build:

```bash
npm run build
npm run preview
```

Tests:

```bash
npm test
```

## Fast evaluator path

The landing page has three one-click presets: **Priya**, **Ravi**, and **Anita**. Each runs through the same rules engine used by the questionnaire.

## Product principles

- **Lender capacity is not borrower capacity.** The app computes both independently.
- **Unknown is not zero.** Missing information widens ranges; unknown debt and unknown household expenses use conservative proxies rather than silently becoming zero.
- **Household support is not automatically lender income.** Other stable household income can support borrower safety; it only increases lender eligibility when that person is explicitly entered as an eligible co-applicant who will join the facility.
- **No fake precision.** Outputs are ranges and confidence is Low / Medium / High.
- **Every displayed conclusion has a reason.** The results screen shows the rules that moved it.
- **The “Don’t borrow” path is real.** A recent repayment bounce combined with outstanding high-cost debt triggers a borrower-safety stop.
- **APR is cash-flow based.** Processing fees reduce net disbursal; APR is solved from the resulting repayment cash flows rather than adding a fee percentage to the nominal rate.
- **Private by construction.** Inputs stay in React state for the browser session. There is no backend, analytics SDK or persistent storage.

## Architecture

```text
src/
  components/       Questionnaire and output/card UI
  engine/           EMI, APR, eligibility and assessment calculations
  questions/        Adaptive question definitions
  rules/            Central rule configuration and product bands
  types/            Shared domain types
```

`src/rules/config.ts` is intentionally the main tuning surface. The follow-up exercise can change a threshold (for example salaried safe FOIR from 35% to 40%) in one place and immediately rerun the same borrower.

## Deliverables

- `RULES.md` — all thresholds, assumptions, sources and judgement calls.
- `RUNTHROUGHS.md` — Priya, Ravi and Anita, including outputs and Negotiation Cards.
- `WALKTHROUGH.md` — five-minute walkthrough plus what comes next / what was intentionally cut.

## Scope and limits

This is not a lender underwriting model and does not predict approval. Lenders differ in bureau policies, obligation recognition, income verification, product caps and pricing. Public lender rates are used only to anchor borrower-facing reference bands. Estimated APR includes the modelled processing fee and GST on that fee; the lender's KFS remains the source of truth for any other mandatory charges. A production version would refresh rate cards, test assumptions on real sanction/KFS data, add more product-specific policies and obtain compliance review.
