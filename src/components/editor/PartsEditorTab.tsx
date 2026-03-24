import { useGeometryStore } from '@/store/geometryStore'
import type { Part } from '@/types'

function NumInput({
  value,
  onChange,
  step = 0.01,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <input
      type="number"
      value={value}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-16 bg-white text-gray-800 text-xs font-mono rounded px-1 py-0.5 border border-gray-400 focus:outline-none focus:border-blue-500"
    />
  )
}

function PartRow({ part }: { part: Part }) {
  const updatePart = useGeometryStore((s) => s.updatePart)
  const updateKinematics = useGeometryStore((s) => s.updateKinematics)
  const updateHingeOffset = useGeometryStore((s) => s.updateHingeOffset)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)
  const constraint = kinematics.find((k) => k.part_id === part.id)

  return (
    <div
      className={`rounded-lg p-2 mb-2 border ${
        part.type === 'movable' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-400 bg-white'
      }`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-gray-800">{part.name}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            part.type === 'movable' ? 'bg-blue-700 text-blue-100' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {part.type === 'movable' ? '가동' : '고정'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs text-gray-600">
        <span>W:</span>
        <NumInput value={part.bbox.width} onChange={(v) => updatePart(part.id, { bbox: { ...part.bbox, width: v } })} />
        <span className="text-gray-600 self-center">m</span>

        <span>D:</span>
        <NumInput value={part.bbox.depth} onChange={(v) => updatePart(part.id, { bbox: { ...part.bbox, depth: v } })} />
        <span className="text-gray-600 self-center">m</span>

        <span>H:</span>
        <NumInput value={part.bbox.height} onChange={(v) => updatePart(part.id, { bbox: { ...part.bbox, height: v } })} />
        <span className="text-gray-600 self-center">m</span>

        <span>밀도:</span>
        <NumInput value={part.density} onChange={(v) => updatePart(part.id, { density: v })} step={10} />
        <span className="text-gray-600 self-center">kg/m³</span>

        <span>질량계수:</span>
        <NumInput value={part.mass_factor} onChange={(v) => updatePart(part.id, { mass_factor: v })} step={0.05} />
        <span className="text-gray-600 self-center"></span>
      </div>

      {/* 가동부 슬라이더 */}
      {constraint && (
        <div className="mt-2 pt-2 border-t border-gray-400">
          <div className="flex justify-between text-xs text-gray-600 mb-0.5">
            <span>현재 위치</span>
            <span className="font-mono text-gray-800">
              {constraint.current_position.toFixed(part.motion_type === 'rotation' ? 0 : 2)}
              {part.motion_type === 'rotation' ? '°' : 'm'}
            </span>
          </div>
          <input
            type="range"
            min={constraint.range[0]}
            max={constraint.range[1]}
            step={part.motion_type === 'rotation' ? 1 : 0.01}
            value={constraint.current_position}
            onChange={(e) => updateKinematics(part.id, Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          {part.motion_type === 'rotation' && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-600 flex-1">힌지 오프셋</span>
              <NumInput
                value={constraint.hinge_offset ?? 0}
                onChange={(v) => updateHingeOffset(part.id, v)}
                step={0.01}
              />
              <span className="text-xs text-gray-600">m</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PartsEditorTab() {
  const parts = useGeometryStore((s) => s.furniture.parts)

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {parts
        .filter((p) => p.id !== '__top_load__')
        .map((part) => (
          <PartRow key={part.id} part={part} />
        ))}
    </div>
  )
}
