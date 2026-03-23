import { useResultsStore } from '@/store/resultsStore'
import { StatusBadge } from './StatusBadge'
import { MetricsGrid } from './MetricsGrid'
import { RiskFactors } from './RiskFactors'

export function ResultsPanel() {
  const result = useResultsStore((s) => s.result)
  const isCalculating = useResultsStore((s) => s.isCalculating)
  const error = useResultsStore((s) => s.error)
  const toggleTippingPreview = useResultsStore((s) => s.toggleTippingPreview)
  const tippingPreview = useResultsStore((s) => s.tippingPreview)

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      <h2 className="text-sm font-bold text-gray-300 border-b border-gray-700 pb-2">
        전도 해석 결과
      </h2>

      {isCalculating && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          계산 중...
        </div>
      )}

      {error && (
        <div className="text-xs text-red-400 bg-red-950/30 rounded px-3 py-2">
          오류: {error}
        </div>
      )}

      {result && !isCalculating && (
        <>
          <StatusBadge status={result.status} />
          <MetricsGrid result={result} />
          <RiskFactors
            risks={result.key_risk_factors}
            suggestions={result.improvement_suggestions}
          />

          {/* 전도 미리보기 버튼 */}
          <button
            onClick={toggleTippingPreview}
            disabled={result.status === '안전' || tippingPreview}
            className={`mt-2 py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
              result.status === '안전' || tippingPreview
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
          >
            {tippingPreview ? '미리보기 재생 중...' : '전도 미리보기'}
          </button>
        </>
      )}

      {!result && !isCalculating && (
        <div className="text-xs text-gray-500 text-center py-4">
          시나리오를 선택하고 계산을 실행하세요
        </div>
      )}
    </div>
  )
}
