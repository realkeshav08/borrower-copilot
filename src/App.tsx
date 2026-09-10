import { useMemo, useState } from 'react'
import './styles.css'
import type { BorrowerInput } from './types'
import { mustQuestions, additionalQuestions } from './questions/questionTree'
import { QuestionField } from './components/QuestionField'
import { evaluateBorrower } from './engine/evaluateBorrower'
import { demoCases } from './engine/demoCases'
import { Results } from './components/Results'

const initialInput: BorrowerInput = {
  loanType: 'auto_recommend',
}

function isAnswered(input: BorrowerInput, key: keyof BorrowerInput, allowUnknown?: boolean) {
  const value = input[key]
  if (allowUnknown && value === null) return true
  return value !== undefined && value !== null && value !== ''
}

export default function App() {
  const [input, setInput] = useState<BorrowerInput>(initialInput)
  const [showAdditional, setShowAdditional] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [error, setError] = useState('')

  const visibleMust = useMemo(() => mustQuestions.filter((q) => !q.showWhen || q.showWhen(input)), [input])
  const visibleAdditional = useMemo(() => additionalQuestions.filter((q) => !q.showWhen || q.showWhen(input)), [input])

  const update = (key: keyof BorrowerInput, value: BorrowerInput[keyof BorrowerInput]) => {
    setInput((prev) => ({ ...prev, [key]: value }))
    setError('')
  }

  const runAssessment = () => {
    const missing = visibleMust.filter((q) => q.required && !isAnswered(input, q.key, q.allowUnknown))
    if (input.creditScoreKnown && input.creditScore == null) missing.push(mustQuestions.find((q) => q.key === 'creditScore')!)
    if (missing.length) {
      setError(`Please answer: ${[...new Set(missing.map((q) => q.label))].join(', ')}.`)
      return
    }

    const visibleQuestions = [...visibleMust, ...visibleAdditional]
    const invalid = visibleQuestions.filter((q) => {
      const value = input[q.key]
      if (q.kind !== 'number' || typeof value !== 'number') return false
      if (q.min != null && value < q.min) return true
      if (q.max != null && value > q.max) return true
      return false
    })
    if (invalid.length) {
      setError(`Check the allowed range for: ${[...new Set(invalid.map((q) => q.label))].join(', ')}.`)
      return
    }
    if (input.incomeType !== 'salaried' && (input.incomeHigh ?? 0) < (input.incomeLow ?? 0)) {
      setError('Strong-month income must be at least as high as conservative monthly income.')
      return
    }

    setResultVisible(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadDemo = (key: keyof typeof demoCases) => {
    setInput({ ...demoCases[key] })
    setShowAdditional(true)
    setResultVisible(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const result = useMemo(() => evaluateBorrower(input), [input])

  if (resultVisible) {
    return <Results input={input} result={result} onEdit={() => setResultVisible(false)} />
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <nav>
          <div className="brand"><span className="brand-mark">B</span> Borrower Copilot</div>
          <span className="privacy-badge">No login · No bureau pull · Nothing stored</span>
        </nav>

        <div className="hero-grid">
          <div>
            <span className="eyebrow">Walk into the lender informed</span>
            <h1>Know what to borrow before someone tells you what they’ll lend.</h1>
            <p>Get a borrower-side verdict, a lender-vs-safe maximum, a fair rate band, an EMI ceiling, and a negotiation card — from information you already know.</p>
          </div>
          <div className="promise-card">
            <div><span>01</span><strong>Should I borrow?</strong></div>
            <div><span>02</span><strong>How much is safe?</strong></div>
            <div><span>03</span><strong>What rate is fair?</strong></div>
            <div><span>04</span><strong>What EMI do I accept?</strong></div>
          </div>
        </div>
      </header>

      <section className="demo-strip">
        <div>
          <span className="eyebrow">Evaluator shortcuts</span>
          <strong>Load a challenge borrower</strong>
        </div>
        <div className="demo-buttons">
          <button onClick={() => loadDemo('priya')}>Priya</button>
          <button onClick={() => loadDemo('ravi')}>Ravi</button>
          <button onClick={() => loadDemo('anita')}>Anita</button>
        </div>
      </section>

      <section className="form-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Must questions</span>
            <h2>Enough to make a useful first call</h2>
          </div>
          <span className="section-note">Unknown is allowed where marked. It widens the answer; it never becomes zero.</span>
        </div>

        <div className="question-list">
          {visibleMust.map((question) => (
            <QuestionField key={String(question.key)} question={question} value={input[question.key]} onChange={update} />
          ))}
        </div>
      </section>

      <section className="optional-shell">
        <button className="optional-toggle" onClick={() => setShowAdditional((v) => !v)}>
          <span>
            <span className="eyebrow">Optional, but useful</span>
            <strong>{showAdditional ? 'Hide' : 'Tighten'} your ranges</strong>
          </span>
          <span>{showAdditional ? '−' : '+'}</span>
        </button>

        {showAdditional && (
          <div className="form-card optional-card">
            <div className="section-heading">
              <div>
                <h2>Only questions that change an output</h2>
                <p>You are seeing {visibleAdditional.length} questions selected for this profile.</p>
              </div>
            </div>
            <div className="question-list">
              {visibleAdditional.map((question) => (
                <QuestionField key={String(question.key)} question={question} value={input[question.key]} onChange={update} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="submit-panel">
        <div>
          <strong>Ready for the borrower-side view?</strong>
          <span>Rules are deterministic and every output is explained.</span>
          {error && <p className="error-text">{error}</p>}
        </div>
        <button className="primary-btn large" onClick={runAssessment}>Show my borrowing position →</button>
      </section>

      <footer className="site-footer">
        <p>Borrower Copilot is a self-assessment, not a sanction prediction. Lenders use their own underwriting, bureau data and policies.</p>
        <p>All calculations run in this browser session. This app does not send or persist your answers.</p>
      </footer>
    </main>
  )
}
