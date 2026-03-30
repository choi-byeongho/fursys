import { useResultsStore } from '@/store/resultsStore'
import { StatusBadge } from './StatusBadge'
import { MetricsGrid } from './MetricsGrid'
import { RiskFactors } from './RiskFactors'

export function ResultsPanel() {
  const result = useResultsStore((s) => s.result)
  const isCalculating = useResultsStore((s) => s.isCalculating)
  const toggleTippingPreview = useResultsStore((s) => s.toggleTippingPreview)
  const tippingPreview = useResultsStore((s) => s.tippingPreview)

  if (isCalculating) {
    return (
      <div className="flex items-center gap-3 px-6 py-6 h-full text-gray-400">
        <div className="w-4 h-4 border-2 border-t-transparent border-gray-300 rounded-full animate-spin" />
        <span className="text-xs">계산 중...</span>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-400">
        파일을 업로드하면 결과가 표시됩니다
      </div>
    )
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* 컬럼 1: 상태 + 미리보기 버튼 */}
      <div className="flex flex-col justify-center gap-3 px-4 py-4 border-r border-white/30 shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">해석 결과</span>
        <StatusBadge status={result.status} />
        <button
          onClick={toggleTippingPreview}
          disabled={result.status === '안전' || tippingPreview}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
          style={{
            background: result.status !== '안전' ? 'var(--accent)' : '#f3f4f6',
            color: result.status !== '안전' ? 'white' : '#9ca3af',
          }}
        >
          전도 미리보기
        </button>
      </div>

      {/* 컬럼 2: 수치 지표 */}
      <div className="flex items-center px-6 py-4 flex-1 min-w-0 overflow-x-auto">
        <MetricsGrid result={result} />
      </div>

      {/* 컬럼 3: 리스크 / 개선 제안 */}
      <div className="w-64 shrink-0 border-l border-white/30 overflow-y-auto px-4 py-4">
        <RiskFactors risks={result.key_risk_factors} suggestions={result.improvement_suggestions} />
      </div>
    </div>
  )
}
