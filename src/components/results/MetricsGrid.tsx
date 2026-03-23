import type { SolverResult } from '@/types'
import { fmtMeters, fmtNewtons, fmtDegrees, fmtKg } from '@/utils/formatters'

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 px-2 rounded ${highlight ? 'bg-red-950/40' : 'bg-gray-800/60'}`}>
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-sm font-mono font-semibold ${highlight ? 'text-red-400' : 'text-gray-100'}`}>{value}</span>
    </div>
  )
}

export function MetricsGrid({ result }: { result: SolverResult }) {
  const marginHighlight = result.stability_margin < 0.05

  return (
    <div className="flex flex-col gap-1">
      <MetricRow
        label="안정 여유"
        value={fmtMeters(result.stability_margin)}
        highlight={marginHighlight}
      />
      <MetricRow
        label="임계 가압력"
        value={fmtNewtons(result.critical_push_force)}
        highlight={result.critical_push_force < 50}
      />
      {result.critical_extension_distance !== null && (
        <MetricRow
          label="임계 작동 거리"
          value={fmtMeters(result.critical_extension_distance)}
          highlight={result.critical_extension_distance < 0.1}
        />
      )}
      {result.critical_extension_angle !== null && (
        <MetricRow
          label="임계 작동 각도"
          value={fmtDegrees(result.critical_extension_angle)}
          highlight={result.critical_extension_angle < 15}
        />
      )}
      <MetricRow label="전도 방향" value={result.tipping_direction} />
      <MetricRow
        label="무게중심 높이"
        value={fmtMeters(result.com.y)}
      />
      <MetricRow label="총 질량" value={fmtKg(result.total_mass)} />
    </div>
  )
}
