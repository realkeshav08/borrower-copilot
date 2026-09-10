export function emi(principal: number, annualRatePct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRatePct / 1200
  if (r === 0) return principal / months
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export function principalFromEmi(monthlyEmi: number, annualRatePct: number, months: number): number {
  if (monthlyEmi <= 0 || months <= 0) return 0
  const r = annualRatePct / 1200
  if (r === 0) return monthlyEmi * months
  return monthlyEmi * ((Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months)))
}

export function aprFromFee(
  principal: number,
  nominalAnnualRatePct: number,
  months: number,
  feePct: number,
  gstOnFee = 0.18,
): number {
  if (principal <= 0 || months <= 0) return nominalAnnualRatePct
  const monthlyPayment = emi(principal, nominalAnnualRatePct, months)
  const fee = principal * (feePct / 100) * (1 + gstOnFee)
  const netDisbursal = Math.max(1, principal - fee)

  const npv = (monthlyRate: number) => {
    let value = netDisbursal
    for (let m = 1; m <= months; m += 1) {
      value -= monthlyPayment / Math.pow(1 + monthlyRate, m)
    }
    return value
  }

  let lo = 0
  let hi = 0.15
  for (let i = 0; i < 100; i += 1) {
    const mid = (lo + hi) / 2
    if (npv(mid) > 0) hi = mid
    else lo = mid
  }
  const monthlyIrr = (lo + hi) / 2
  return (Math.pow(1 + monthlyIrr, 12) - 1) * 100
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function roundMoney(value: number, step = 1000): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value / step) * step)
}
