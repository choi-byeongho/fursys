import { useState } from 'react'

export function RiskFactors({ risks, suggestions }: { risks: string[]; suggestions: string[] }) {
  const [openRisk, setOpenRisk] = useState(true)
  const [openSugg, setOpenSugg] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {/* 위험 요인 */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#fee2e2', background: '#fff8f8' }}>
        <button
          className="w-full flex justify-between items-center px-3 py-2.5 text-left"
          onClick={() => setOpenRisk(!openRisk)}
        >
          <span className="text-xs font-semibold" style={{ color: '#dc2626' }}>위험 요인</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{openRisk ? '▲' : '▼'}</span>
        </button>
        {openRisk && (
          <ul className="px-3 pb-3 flex flex-col gap-2">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: '#6b1a1a' }}>
                <span className="shrink-0 mt-0.5" style={{ color: '#ef4444' }}>•</span>
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 개선 제안 */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#d1e8d4', background: '#f4faf5' }}>
          <button
            className="w-full flex justify-between items-center px-3 py-2.5 text-left"
            onClick={() => setOpenSugg(!openSugg)}
          >
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>개선 제안</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{openSugg ? '▲' : '▼'}</span>
          </button>
          {openSugg && (
            <ul className="px-3 pb-3 flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: '#1a4d26' }}>
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>→</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
