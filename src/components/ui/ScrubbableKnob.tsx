import React, { useEffect, useRef, useState } from 'react'

interface ScrubbableKnobProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  color?: string
}

export function ScrubbableKnob({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  color: _color = '#0071e3'
}: ScrubbableKnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)
  const startValue = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY
    startValue.current = value
    setIsDragging(true)
    document.body.style.cursor = 'ns-resize'
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY.current - e.clientY
      const range = max - min
      const sensitivity = 200 
      const change = (deltaY / sensitivity) * range
      
      let newValue = startValue.current + change
      newValue = Math.round(newValue / step) * step
      newValue = Math.max(min, Math.min(max, newValue))
      
      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, min, max, step, onChange])

  const percentage = ((value - min) / (max - min)) * 100
  const rotation = (percentage / 100) * 270 - 135 

  return (
    <div className="flex flex-col items-center gap-2 select-none group">
      <div 
        className="relative w-20 h-20 cursor-ns-resize flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        {/* 점선 가이드 배경 */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-[135deg]">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
            strokeDasharray="160"
            strokeDashoffset="40"
            strokeLinecap="round"
            className="opacity-20"
          />
          {/* 활성화된 게이지 */}
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke={isDragging ? 'var(--accent-sage)' : 'var(--accent)'}
            strokeWidth="3"
            strokeDasharray="160"
            strokeDashoffset={160 - (percentage / 100) * 120}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* 메인 노브 바디 */}
        <div 
          className="relative w-14 h-14 bg-[#2d3436] rounded-full flex items-center justify-center transition-all duration-200"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            boxShadow: isDragging 
              ? 'inset 0 2px 4px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)' 
              : 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.2)'
          }}
        >
          {/* 노브 인디케이터 */}
          <div className="absolute top-1.5 w-1 h-3 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          
          {/* 중앙 텍스처 효과 */}
          <div className="w-10 h-10 rounded-full border border-white/5 opacity-20" />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[9px] uppercase font-bold text-gray-400 tracking-[0.1em] mb-0.5">
          {label}
        </span>
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm font-mono font-bold text-gray-800">
            {value.toFixed(step < 1 ? 2 : 0)}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  )
}
