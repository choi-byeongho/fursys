interface DataGaugeProps {
  label: string
  value: number
  min: number
  max: number
  unit?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

export function DataGauge({
  label,
  value,
  min,
  max,
  unit = '',
  color = '#0071e3',
  size = 'md'
}: DataGaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  
  const getStatusColor = () => {
    if (label.includes('Stability') || label.includes('안정')) {
      if (percentage < 30) return 'var(--accent-red)'
      if (percentage < 60) return 'var(--accent-highlight)'
      return 'var(--accent-sage)'
    }
    return color
  }

  const finalColor = getStatusColor()

  return (
    <div className={`flex flex-col gap-1.5 ${size === 'lg' ? 'p-5' : 'p-3'} glass-panel rounded-2xl relative overflow-hidden group`}>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full -mr-4 -mt-4 blur-xl transition-transform group-hover:scale-150" />
      
      <div className="flex justify-between items-end relative z-10">
        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.15em]">{label}</span>
        <div className="flex items-baseline gap-0.5">
          <span className={`font-mono font-bold ${size === 'lg' ? 'text-2xl' : 'text-lg'}`} style={{ color: finalColor }}>
            {value.toFixed(1)}
          </span>
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{unit}</span>
        </div>
      </div>
      
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden relative border border-white/10">
        <div 
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: finalColor,
            boxShadow: `0 0 12px ${finalColor}66`
          }}
        />
      </div>
    </div>
  )
}
