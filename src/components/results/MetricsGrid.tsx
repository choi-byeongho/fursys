import type { SolverResult } from '@/types'
import { fmtMeters, fmtNewtons, fmtDegrees, fmtKg } from '@/utils/formatters'

function MetricRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-1.5 px-2 rounded ${highlight ? 'bg-red-950/40' : 'bg-white'}`}>
      <span className="text-gray-600 text-xs">{label}</span>
      <span className={`text-sm font-mono font-semibold ${highlight ? 'text-red-400' : 'text-gray-900'}`}>{value}</span>
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
      {result.critical_extension_distance !== undefined && (
        <MetricRow
          label="임계 작동 거리"
          value={result.critical_extension_distance === null ? '계산 불가' : fmtMeters(result.critical_extension_distance)}
          highlight={result.critical_extension_distance !== null && result.critical_extension_distance < 0.1}
        />
      )}
      {result.critical_extension_angle !== undefined && (
        <MetricRow
          label="임계 작동 각도"
          value={result.critical_extension_angle === null ? '계산 불가' : fmtDegrees(result.critical_extension_angle)}
          highlight={result.critical_extension_angle !== null && result.critical_extension_angle < 15}
        />
      )}
      <MetricRow label="전도 방향" value={result.tipping_direction} />
      <MetricRow
        label="무게중심 높이"
        value={fmtMeters(result.com.y)}
      />
      
      {result.tipping_angle !== undefined && (
        <MetricRow
          label="임계 전도 각도"
          value={result.tipping_angle.toFixed(1) + '°'}
          highlight={result.tipping_angle < 15}
        />
      )}
      {result.tipping_energy !== undefined && (
        <MetricRow
          label="전도 저항 에너지"
          value={result.tipping_energy.toFixed(1) + ' J'}
          highlight={result.tipping_energy < 50} // Highlight if it takes very little energy to tip
        />
      )}

      <MetricRow label="총 질량" value={fmtKg(result.total_mass)} />
    </div>
  )
}
