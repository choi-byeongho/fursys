import { useScenarioStore } from '@/store/scenarioStore'
import { useGeometryStore } from '@/store/geometryStore'
import { SCENARIO_DEFINITIONS } from '@/data/scenarioDefinitions'
import type { ScenarioType } from '@/types'

function ParamRow({
  label, value, min, max, step, unit, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 text-xs font-mono text-right bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400"
          />
          {unit && <span className="text-xs text-gray-400 w-5">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 accent-gray-600 cursor-pointer"
      />
    </div>
  )
}

function ParamGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</span>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

function FrontForceForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  return (
    <ParamGroup title="가압력 제어">
      <ParamRow label="Magnitude" value={Number(params.force_magnitude ?? 100)} min={0} max={500} step={5} unit="N" onChange={(v) => setParam('force_magnitude', v)} />
      <ParamRow label="Height" value={Number(params.force_height ?? 1.4)} min={0.1} max={2.2} step={0.05} unit="m" onChange={(v) => setParam('force_height', v)} />
      <ParamRow label="X-Offset" value={Number(params.force_x_offset ?? 0)} min={-0.5} max={0.5} step={0.01} unit="m" onChange={(v) => setParam('force_x_offset', v)} />
    </ParamGroup>
  )
}

function SideForceForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  return (
    <ParamGroup title="측면 가압력">
      <ParamRow label="Magnitude" value={Number(params.force_magnitude ?? 100)} min={0} max={500} step={5} unit="N" onChange={(v) => setParam('force_magnitude', v)} />
      <ParamRow label="Height" value={Number(params.force_height ?? 1.4)} min={0.1} max={2.2} step={0.05} unit="m" onChange={(v) => setParam('force_height', v)} />
      <ParamRow label="Z-Offset" value={Number(params.force_z_offset ?? 0)} min={-0.5} max={0.5} step={0.01} unit="m" onChange={(v) => setParam('force_z_offset', v)} />
    </ParamGroup>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/40 border border-white/60">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Target Part</span>
        <select
          value={selectedId}
          onChange={(e) => setParam('part_id', e.target.value)}
          className="text-xs font-bold text-gray-800 bg-white/60 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ring-gray-200"
        >
          {movableParts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      {constraint && (
        <ParamGroup title="Kinematics">
          <ParamRow
            label={part?.motion_type === 'rotation' ? 'Angle' : 'Stroke'}
            value={Number(params.displacement ?? 0)}
            min={constraint.range[0]} max={constraint.range[1]}
            step={part?.motion_type === 'rotation' ? 1 : 0.01}
            unit={part?.motion_type === 'rotation' ? '°' : 'm'}
            onChange={(v) => setParam('displacement', v)}
          />
        </ParamGroup>
      )}
    </div>
  )
}

function TopLoadForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  return (
    <ParamGroup title="하중 프로파일">
      <ParamRow label="Added Mass" value={Number(params.added_mass ?? 20)} min={0} max={150} step={1} unit="kg" onChange={(v) => setParam('added_mass', v)} />
      <ParamRow label="Pos-X" value={Number(params.pos_x ?? 0.3)} min={-0.5} max={1.5} step={0.01} unit="m" onChange={(v) => setParam('pos_x', v)} />
      <ParamRow label="Pos-Z" value={Number(params.pos_z ?? 0.25)} min={-0.5} max={1.5} step={0.01} unit="m" onChange={(v) => setParam('pos_z', v)} />
    </ParamGroup>
  )
}

function ExternalForceForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  return (
    <ParamGroup title="벡터 외력">
      <ParamRow label="Magnitude" value={Number(params.force_magnitude ?? 150)} min={0} max={1000} step={10} unit="N" onChange={(v) => setParam('force_magnitude', v)} />
      <ParamRow label="Elevation" value={Number(params.force_height ?? 1.0)} min={0} max={2.5} step={0.05} unit="m" onChange={(v) => setParam('force_height', v)} />
      <ParamRow label="Dir X" value={Number(params.direction_x ?? 0)} min={-1} max={1} step={0.05} unit="" onChange={(v) => setParam('direction_x', v)} />
      <ParamRow label="Dir Z" value={Number(params.direction_z ?? 1) || 0.001} min={-1} max={1} step={0.05} unit="" onChange={(v) => setParam('direction_z', v)} />
    </ParamGroup>
  )
}

function MultiMovableForm() {
  const parts = useGeometryStore((s) => s.furniture.parts)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)
  const setParam = useScenarioStore((s) => s.setParam)
  const params = useScenarioStore((s) => s.params)
  type MovableItem = { part_id: string; displacement: number }
  let items: MovableItem[] = []
  try { items = typeof params.parts === 'string' ? JSON.parse(params.parts) as MovableItem[] : [] } catch { items = [] }
  const movableParts = parts.filter((p) => p.type === 'movable')
  const updateItem = (partId: string, displacement: number) => {
    const existing = items.find((i) => i.part_id === partId)
    const newItems = existing
      ? items.map((i) => (i.part_id === partId ? { ...i, displacement } : i))
      : [...items, { part_id: partId, displacement }]
    setParam('parts', JSON.stringify(newItems))
  }
  return (
    <ParamGroup title="동시 작동 제어">
      {movableParts.map((part) => {
        const constraint = kinematics.find((k) => k.part_id === part.id)
        if (!constraint) return null
        return (
          <ParamRow
            key={part.id}
            label={part.name}
            value={items.find((i) => i.part_id === part.id)?.displacement ?? 0}
            min={constraint.range[0]} max={constraint.range[1]}
            step={part.motion_type === 'rotation' ? 1 : 0.01}
            unit={part.motion_type === 'rotation' ? '°' : 'm'}
            onChange={(v) => updateItem(part.id, v)}
          />
        )
      })}
    </ParamGroup>
  )
}

function EdgeLoadForm() {
  const params = useScenarioStore((s) => s.params)
  const setParam = useScenarioStore((s) => s.setParam)
  const side = String(params.edge_side ?? 'front')
  return (
    <div className="flex flex-col gap-4">
      <ParamGroup title="최전단 하중">
        <ParamRow label="Applied Mass" value={Number(params.applied_mass ?? 40)} min={10} max={120} step={1} unit="kg" onChange={(v) => setParam('applied_mass', v)} />
        <ParamRow label="Edge Offset" value={Number(params.offset_from_edge ?? 0.1)} min={0} max={0.4} step={0.01} unit="m" onChange={(v) => setParam('offset_from_edge', v)} />
      </ParamGroup>
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">하중 방향</span>
        <div className="grid grid-cols-2 gap-1.5">
          {(['front', 'back', 'left', 'right'] as const).map((s) => {
            const label = { front: '전면', back: '후면', left: '좌측', right: '우측' }[s]
            const active = side === s
            return (
              <button
                key={s}
                onClick={() => setParam('edge_side', s)}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  active
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ScenarioSelector() {
  const activeType = useScenarioStore((s) => s.activeType)
  const setScenario = useScenarioStore((s) => s.setScenario)
  const activeDef = SCENARIO_DEFINITIONS.find((d) => d.id === activeType)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">시나리오</span>
        <select
          value={activeType}
          onChange={(e) => setScenario(e.target.value as ScenarioType)}
          className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-gray-400 cursor-pointer"
        >
          {SCENARIO_DEFINITIONS.map((def) => (
            <option key={def.id} value={def.id}>{def.name}</option>
          ))}
        </select>
        {activeDef?.description && (
          <p className="text-[11px] leading-relaxed text-gray-400">
            {activeDef.description}
          </p>
        )}
      </div>

      <div className="w-full h-px bg-gray-100" />

      <div className="flex flex-col gap-5">
        {activeType === 'front_force' && <FrontForceForm />}
        {activeType === 'side_force' && <SideForceForm />}
        {activeType === 'single_movable' && <SingleMovableForm />}
        {activeType === 'multi_movable' && <MultiMovableForm />}
        {activeType === 'top_load' && <TopLoadForm />}
        {activeType === 'external_force_only' && <ExternalForceForm />}
        {activeType === 'edge_load' && <EdgeLoadForm />}
      </div>
    </div>
  )
}
