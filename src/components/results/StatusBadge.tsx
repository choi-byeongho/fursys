import type { SafetyStatus } from '@/types'

const CONFIG = {
  '안전': {
    bg: '#f0faf2',
    color: '#16a34a',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'SAFE',
  },
  '주의': {
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'CAUTION',
  },
  '위험': {
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'DANGER',
  },
}

export function StatusBadge({ status }: { status: SafetyStatus }) {
  const c = CONFIG[status]
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-4 border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      {/* 점 */}
      <div className="relative flex items-center justify-center w-8 h-8">
        <div className="absolute w-8 h-8 rounded-full opacity-30 animate-ping" style={{ background: c.dot }} />
        <div className="w-4 h-4 rounded-full" style={{ background: c.dot }} />
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.color, opacity: 0.7 }}>
          Status
        </span>
        <span className="text-xl font-bold leading-tight" style={{ color: c.color }}>
          {status}
        </span>
        <span className="text-[9px] font-bold tracking-widest" style={{ color: c.color, opacity: 0.5 }}>
          {c.label}
        </span>
      </div>
    </div>
  )
}
