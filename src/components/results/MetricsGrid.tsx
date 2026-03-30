import type { SolverResult } from '@/types'

function MetricPod({ label, value, unit, alert }: { label: string; value: string; unit?: string; alert?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black tracking-tighter ${alert ? 'text-rose-500' : 'text-[#2d3436]'}`}>
          {value}
        </span>
        {unit && <span className="text-[10px] font-black uppercase text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}

export function MetricsGrid({ result }: { result: SolverResult }) {
  const marginCm = result.stability_margin * 100
  const marginWarn = result.stability_margin < 0.05

  return (
    <div className="flex items-center gap-8">
      {/* 주요 지표: 안정 여유 */}
      <div className="flex flex-col gap-1 px-5 py-3 rounded-2xl border shrink-0" style={{
        background: marginWarn ? '#fff1f2' : '#f0fdf4',
        borderColor: marginWarn ? '#fecaca' : '#bbf7d0',
      }}>
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${marginWarn ? 'text-rose-500' : 'text-emerald-600'}`}>
          Stability Margin
        </span>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-black tracking-tighter ${marginWarn ? 'text-rose-500' : 'text-emerald-600'}`}>
            {Math.abs(marginCm).toFixed(1)}
          </span>
          <span className={`text-sm font-black uppercase ${marginWarn ? 'text-rose-500' : 'text-emerald-600'}`}>cm</span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="h-12 w-px bg-gray-200 shrink-0" />

      {/* 보조 지표 */}
      <div className="flex gap-8">
        <MetricPod
          label="Push Force"
          value={result.critical_push_force < 1000
            ? result.critical_push_force.toFixed(0)
            : (result.critical_push_force / 1000).toFixed(1) + 'k'}
          unit="N"
          alert={result.critical_push_force < 50}
        />
        <MetricPod
          label="Direction"
          value={result.tipping_direction.split(' ')[0].toUpperCase()}
        />
        <MetricPod
          label="CoM Height"
          value={result.com.y.toFixed(2)}
          unit="m"
        />
        <MetricPod
          label="Total Mass"
          value={result.total_mass.toFixed(1)}
          unit="kg"
        />
      </div>
    </div>
  )
}
