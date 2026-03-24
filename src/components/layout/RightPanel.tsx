import { ScenarioSelector } from '@/components/scenario/ScenarioSelector'
import { ResultsPanel } from '@/components/results/ResultsPanel'

export function RightPanel() {
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-400 overflow-hidden">
      <ScenarioSelector />
      <div className="flex-1 overflow-y-auto">
        <ResultsPanel />
      </div>
    </div>
  )
}
