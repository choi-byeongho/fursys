import type { SafetyStatus } from '@/types'

const CONFIG = {
  '안전': { bg: 'bg-green-500', text: 'text-white', icon: '✓', ring: 'ring-green-400' },
  '주의': { bg: 'bg-amber-500', text: 'text-white', icon: '⚠', ring: 'ring-amber-400' },
  '위험': { bg: 'bg-red-600', text: 'text-white', icon: '✕', ring: 'ring-red-400 animate-pulse' },
}

export function StatusBadge({ status }: { status: SafetyStatus }) {
  const c = CONFIG[status]
  return (
    <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl ${c.bg} ring-2 ${c.ring}`}>
      <span className={`text-2xl font-bold ${c.text}`}>{c.icon}</span>
      <span className={`text-2xl font-bold tracking-wider ${c.text}`}>{status}</span>
    </div>
  )
}
