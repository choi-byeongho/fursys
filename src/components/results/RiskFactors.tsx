import { useState } from 'react'

export function RiskFactors({
  risks,
  suggestions,
}: {
  risks: string[]
  suggestions: string[]
}) {
  const [openRisk, setOpenRisk] = useState(true)
  const [openSugg, setOpenSugg] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {/* 위험 요인 */}
      <div className="bg-white rounded-lg overflow-hidden">
        <button
          className="w-full flex justify-between items-center px-3 py-2 text-left"
          onClick={() => setOpenRisk(!openRisk)}
        >
          <span className="text-xs font-semibold text-red-400">⚠ 주요 위험 요인</span>
          <span className="text-gray-600 text-xs">{openRisk ? '▲' : '▼'}</span>
        </button>
        {openRisk && (
          <ul className="px-3 pb-2 flex flex-col gap-1">
            {risks.map((r, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 개선 제안 */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg overflow-hidden">
          <button
            className="w-full flex justify-between items-center px-3 py-2 text-left"
            onClick={() => setOpenSugg(!openSugg)}
          >
            <span className="text-xs font-semibold text-blue-400">💡 개선 제안</span>
            <span className="text-gray-600 text-xs">{openSugg ? '▲' : '▼'}</span>
          </button>
          {openSugg && (
            <ul className="px-3 pb-2 flex flex-col gap-1">
              {suggestions.map((s, i) => (
                <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                  <span className="text-blue-400 mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
