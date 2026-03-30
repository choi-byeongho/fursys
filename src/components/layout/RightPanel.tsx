import { ScenarioSelector } from '@/components/scenario/ScenarioSelector'
import { ResultsPanel } from '@/components/results/ResultsPanel'

export function RightPanel() {
  return (
    <div className="flex h-full">
      {/* 왼쪽: 시나리오 선택 */}
      <div className="w-72 flex-shrink-0 border-r border-white/30 overflow-y-auto">
        <ScenarioSelector />
      </div>

      {/* 오른쪽: 해석 결과 */}
      <div className="flex-1 overflow-y-auto">
        <ResultsPanel />
      </div>
    </div>
  )
}
