import type { BorrowerInput } from '../types'
import type { QuestionDef } from '../questions/questionTree'

interface Props {
  question: QuestionDef
  value: BorrowerInput[keyof BorrowerInput]
  onChange: (key: keyof BorrowerInput, value: BorrowerInput[keyof BorrowerInput]) => void
}

export function QuestionField({ question, value, onChange }: Props) {
  const isUnknown = value === null

  return (
    <div className="question-field">
      <div className="question-copy">
        <label htmlFor={String(question.key)}>{question.label}</label>
        {question.help && <p>{question.help}</p>}
        <span className="moves-pill">Moves: {question.moves}</span>
      </div>

      <div className="question-control">
        {question.kind === 'select' && (
          <select
            id={String(question.key)}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(question.key, e.target.value as never)}
          >
            <option value="" disabled>Select an option</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        )}

        {question.kind === 'boolean' && (
          <div className="segmented" role="group" aria-label={question.label}>
            <button
              type="button"
              className={value === true ? 'active' : ''}
              onClick={() => onChange(question.key, true as never)}
            >Yes</button>
            <button
              type="button"
              className={value === false ? 'active' : ''}
              onClick={() => onChange(question.key, false as never)}
            >No</button>
          </div>
        )}

        {question.kind === 'number' && (
          <div className="number-wrap">
            <div className={`number-input ${isUnknown ? 'disabled' : ''}`}>
              {question.prefix && <span>{question.prefix}</span>}
              <input
                id={String(question.key)}
                type="number"
                min={question.min}
                max={question.max}
                step={question.step}
                disabled={isUnknown}
                value={typeof value === 'number' ? value : ''}
                placeholder={question.allowUnknown ? 'Enter value' : 'Required'}
                onChange={(e) => onChange(question.key, e.target.value === '' ? undefined : Number(e.target.value))}
              />
              {question.suffix && <span>{question.suffix}</span>}
            </div>
            {question.allowUnknown && (
              <label className="unknown-toggle">
                <input
                  type="checkbox"
                  checked={isUnknown}
                  onChange={(e) => onChange(question.key, e.target.checked ? null : undefined)}
                />
                I don't know
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
