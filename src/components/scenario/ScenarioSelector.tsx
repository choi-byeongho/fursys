import { useScenarioStore } from '@/store/scenarioStore'
import { useGeometryStore } from '@/store/geometryStore'
import { SCENARIO_DEFINITIONS } from '@/data/scenarioDefinitions'
import type { ScenarioType } from '@/types'

function FormSlider({
  label,
  paramKey,
  min,
  max,
  step,
  unit,
}: {
  label: string
  paramKey: string
  min: number
  max: number
  step: number
  unit: string
}) {
  const value = Number(useScenarioStore((s) => s.params[paramKey] ?? min))
  const setParam = useScenarioStore((s) => s.setParam)

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className="font-mono text-gray-800">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setParam(paramKey, Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  )
}

function FrontForceForm() {
  return (
    <div className="flex flex-col gap-3">
      <FormSlider label="가압력" paramKey="force_magnitude" min={0} max={500} step={5} unit="N" />
      <FormSlider label="적용 높이" paramKey="force_height" min={0.1} max={2.0} step={0.05} unit="m" />
      <FormSlider label="좌우 오프셋" paramKey="force_x_offset" min={-0.3} max={0.3} step={0.01} unit="m" />
    </div>
  )
}

function SideForceForm() {
  return (
    <div className="flex flex-col gap-3">
      <FormSlider label="가압력" paramKey="force_magnitude" min={0} max={500} step={5} unit="N" />
      <FormSlider label="적용 높이" paramKey="force_height" min={0.1} max={2.0} step={0.05} unit="m" />
      <FormSlider label="전후 오프셋" paramKey="force_z_offset" min={-0.3} max={0.3} step={0.01} unit="m" />
    </div>
  )
}

function SingleMovableForm() {
  const parts = useGeometryStore((s) => s.furniture.parts)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)

  const movableParts = parts.filter((p) => p.type === 'movable')
  const selectedId = String(params.part_id ?? movableParts[0]?.id ?? '')
  const constraint = kinematics.find((k) => k.part_id === selectedId)
  const part = parts.find((p) => p.id === selectedId)

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-600">가동 파트 선택</label>
        <select
          value={selectedId}
          onChange={(e) => setParam('part_id', e.target.value)}
          className="w-full mt-1 bg-white text-gray-800 text-xs rounded px-2 py-1.5 border border-gray-400"
        >
          {movableParts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {constraint && (
        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              {part?.motion_type === 'rotation' ? '회전 각도' : '이동 거리'}
            </span>
            <span className="font-mono text-gray-800">
              {Number(params.displacement ?? 0).toFixed(part?.motion_type === 'rotation' ? 0 : 2)}{' '}
              {part?.motion_type === 'rotation' ? '°' : 'm'}
            </span>
          </div>
          <input
            type="range"
            min={constraint.range[0]}
            max={constraint.range[1]}
            step={part?.motion_type === 'rotation' ? 1 : 0.01}
            value={Number(params.displacement ?? 0)}
            onChange={(e) => setParam('displacement', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      )}
    </div>
  )
}

function TopLoadForm() {
  return (
    <div className="flex flex-col gap-3">
      <FormSlider label="추가 질량" paramKey="added_mass" min={0} max={100} step={1} unit="kg" />
      <FormSlider label="X 위치" paramKey="pos_x" min={0} max={1} step={0.01} unit="m" />
      <FormSlider label="Z 위치" paramKey="pos_z" min={0} max={1} step={0.01} unit="m" />
    </div>
  )
}

function ExternalForceForm() {
  return (
    <div className="flex flex-col gap-3">
      <FormSlider label="힘 크기" paramKey="force_magnitude" min={0} max={500} step={5} unit="N" />
      <FormSlider label="적용 높이" paramKey="force_height" min={0.1} max={2.0} step={0.05} unit="m" />
      <FormSlider label="방향 X" paramKey="direction_x" min={-1} max={1} step={0.05} unit="" />
      <FormSlider label="방향 Z" paramKey="direction_z" min={-1} max={1} step={0.05} unit="" />
    </div>
  )
}

function MultiMovableForm() {
  const parts = useGeometryStore((s) => s.furniture.parts)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)
  const setParam = useScenarioStore((s) => s.setParam)
  const params = useScenarioStore((s) => s.params)

  type MovableItem = { part_id: string; displacement: number }
  let items: MovableItem[] = []
  try {
    items = typeof params.parts === 'string' ? (JSON.parse(params.parts) as MovableItem[]) : []
  } catch { items = [] }

  const movableParts = parts.filter((p) => p.type === 'movable')

  const updateItem = (partId: string, displacement: number) => {
    const existing = items.find((i) => i.part_id === partId)
    const newItems = existing
      ? items.map((i) => (i.part_id === partId ? { ...i, displacement } : i))
      : [...items, { part_id: partId, displacement }]
    setParam('parts', JSON.stringify(newItems))
  }

  return (
    <div className="flex flex-col gap-3">
      {movableParts.map((part) => {
        const constraint = kinematics.find((k) => k.part_id === part.id)
        if (!constraint) return null
        const currentDisp = items.find((i) => i.part_id === part.id)?.displacement ?? 0
        return (
          <div key={part.id} className="flex flex-col gap-0.5">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{part.name}</span>
              <span className="font-mono text-gray-800">
                {currentDisp.toFixed(part.motion_type === 'rotation' ? 0 : 2)}
                {part.motion_type === 'rotation' ? '°' : 'm'}
              </span>
            </div>
            <input
              type="range"
              min={constraint.range[0]}
              max={constraint.range[1]}
              step={part.motion_type === 'rotation' ? 1 : 0.01}
              value={currentDisp}
              onChange={(e) => updateItem(part.id, Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        )
      })}
    </div>
  )
}

function EdgeLoadForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  const side = String(params.edge_side ?? 'front')

  return (
    <div className="flex flex-col gap-3">
      {/* 적용 하중 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between text-xs text-gray-600">
          <span>적용 질량</span>
          <span className="font-mono text-gray-800">{Number(params.applied_mass ?? 40).toFixed(0)} kg</span>
        </div>
        <input
          type="range" min={10} max={100} step={1}
          value={Number(params.applied_mass ?? 40)}
          onChange={(e) => setParam('applied_mass', Number(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>

      {/* 외각에서 거리 */}
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between text-xs text-gray-600">
          <span>외각에서 거리</span>
          <span className="font-mono text-gray-800">{(Number(params.offset_from_edge ?? 0.1) * 100).toFixed(0)} cm</span>
        </div>
        <input
          type="range" min={0} max={0.3} step={0.01}
          value={Number(params.offset_from_edge ?? 0.1)}
          onChange={(e) => setParam('offset_from_edge', Number(e.target.value))}
          className="w-full accent-orange-500"
        />
      </div>

      {/* 방향 선택 */}
      <div>
        <label className="text-xs text-gray-600">하중 적용 방향</label>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {(['front', 'back', 'left', 'right'] as const).map((s) => {
            const label = { front: '전면', back: '후면', left: '좌측', right: '우측' }[s]
            return (
              <button
                key={s}
                onClick={() => setParam('edge_side', s)}
                className={`py-1 text-xs rounded border transition-colors ${
                  side === s
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-white border-gray-400 text-gray-600 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-white rounded p-2">
        선택한 면의 외각에서 지정 거리 안쪽 지점에 수직 하향 하중 적용.
        유효 무게중심이 바닥 투영 기준으로 지지영역을 벗어나면 전도 위험.
      </div>
    </div>
  )
}

export function ScenarioSelector() {
  const activeType = useScenarioStore((s) => s.activeType)
  const setScenario = useScenarioStore((s) => s.setScenario)

  return (
    <div className="flex flex-col gap-3 p-3 border-b border-gray-400">
      <h2 className="text-sm font-bold text-gray-700">시나리오 선택</h2>

      <select
        value={activeType}
        onChange={(e) => setScenario(e.target.value as ScenarioType)}
        className="w-full bg-white text-gray-800 text-xs rounded px-2 py-2 border border-gray-400 focus:outline-none focus:border-blue-500"
      >
        {SCENARIO_DEFINITIONS.map((def) => (
          <option key={def.id} value={def.id}>
            {def.name}
          </option>
        ))}
      </select>

      <div className="text-xs text-gray-600">
        {SCENARIO_DEFINITIONS.find((d) => d.id === activeType)?.description}
      </div>

      {/* 파라미터 폼 */}
      {activeType === 'front_force' && <FrontForceForm />}
      {activeType === 'side_force' && <SideForceForm />}
      {activeType === 'single_movable' && <SingleMovableForm />}
      {activeType === 'multi_movable' && <MultiMovableForm />}
      {activeType === 'top_load' && <TopLoadForm />}
      {activeType === 'external_force_only' && <ExternalForceForm />}
      {activeType === 'edge_load' && <EdgeLoadForm />}
    </div>
  )
}
