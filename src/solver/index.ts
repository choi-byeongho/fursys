import type {
  FurnitureGeometry,
  ScenarioType,
  SolverResult,
  SafetyStatus,
  ExternalLoad,
  Part,
} from '@/types'
import { computeWeightedCOM } from './comCalculator'
import { computeEffectiveCOM } from './forceAnalyzer'
import {
  computeDistanceToEdge,
  findTippingEdge,
  edgeToKoreanDirection,
} from './supportPolygon'
import { computeCriticalPushForce, computeCriticalExtension } from './tipAnalyzer'

export type ScenarioParams = Record<string, number | string | boolean>

/** 시나리오 파라미터를 가구 geometry에 적용하여 loads/kinematics를 수정한 복사본 반환 */
function applyScenario(
  furniture: FurnitureGeometry,
  type: ScenarioType,
  params: ScenarioParams
): FurnitureGeometry {
  const clone: FurnitureGeometry = {
    ...furniture,
    kinematics: furniture.kinematics.map((k) => ({ ...k })),
    loads: [],
    parts: furniture.parts.map((p) => ({ ...p })),
  }

  switch (type) {
    case 'front_force': {
      const F = Number(params.force_magnitude ?? 100)
      const h = Number(params.force_height ?? 1.4)
      const ox = Number(params.force_x_offset ?? 0)
      const cx = (furniture.geometry.bbox.width / 2) + ox
      clone.loads = [
        {
          part_id: null,
          force: F,
          position: [cx, h, 0],
          direction: [0, 0, 1],
        },
      ]
      break
    }
    case 'side_force': {
      const F = Number(params.force_magnitude ?? 100)
      const h = Number(params.force_height ?? 1.4)
      const oz = Number(params.force_z_offset ?? 0)
      const cz = (furniture.geometry.bbox.depth / 2) + oz
      clone.loads = [
        {
          part_id: null,
          force: F,
          position: [0, h, cz],
          direction: [1, 0, 0],
        },
      ]
      break
    }
    case 'single_movable': {
      const partId = String(params.part_id ?? '')
      const disp = Number(params.displacement ?? 0)
      clone.kinematics = clone.kinematics.map((k) =>
        k.part_id === partId ? { ...k, current_position: disp } : k
      )
      break
    }
    case 'multi_movable': {
      // params.parts는 JSON string 또는 배열
      type MovableItem = { part_id: string; displacement: number }
      let items: MovableItem[] = []
      if (typeof params.parts === 'string') {
        try { items = JSON.parse(params.parts) as MovableItem[] } catch { items = [] }
      }
      for (const item of items) {
        clone.kinematics = clone.kinematics.map((k) =>
          k.part_id === item.part_id
            ? { ...k, current_position: item.displacement }
            : k
        )
      }
      break
    }
    case 'top_load': {
      const addedMass = Number(params.added_mass ?? 20)
      const px = Number(params.pos_x ?? furniture.geometry.bbox.width / 2)
      const pz = Number(params.pos_z ?? furniture.geometry.bbox.depth / 2)
      const py = furniture.geometry.bbox.height
      // 추가 하중을 임시 파트로 삽입
      const loadPart: Part = {
        id: '__top_load__',
        name: '상부 추가 하중',
        type: 'fixed',
        bbox: { x: px - 0.05, y: py, z: pz - 0.05, width: 0.1, depth: 0.1, height: 0.01 },
        // mass = volume × density × factor => addedMass = 0.001 × density × 1 => density = addedMass / 0.001
        mass_factor: 1.0,
        density: addedMass / 0.0001,
      }
      clone.parts = [...clone.parts, loadPart]
      break
    }
    case 'external_force_only': {
      const F = Number(params.force_magnitude ?? 150)
      const h = Number(params.force_height ?? 1.0)
      const dx = Number(params.direction_x ?? 0)
      const dz = Number(params.direction_z ?? 1)
      const len = Math.sqrt(dx * dx + dz * dz) || 1
      clone.loads = [
        {
          part_id: null,
          force: F,
          position: [furniture.geometry.bbox.width / 2, h, furniture.geometry.bbox.depth / 2],
          direction: [dx / len, 0, dz / len],
        },
      ]
      break
    }
    case 'edge_load': {
      // 수직 하중 (아이 하중 기준): 가구 최외각에서 offset 안쪽 지점에 수직 하향 적용
      // 수직 하중은 COM을 합산 질량으로 가중하여 유효 COM을 직접 이동시킨다
      const appliedMass = Number(params.applied_mass ?? 40)
      const offset = Number(params.offset_from_edge ?? 0.1)
      const side = String(params.edge_side ?? 'front')

      const W = furniture.geometry.bbox.width
      const D = furniture.geometry.bbox.depth
      const H = furniture.geometry.bbox.height

      // 하중 적용 위치 결정
      let px = W / 2
      let pz = D / 2
      switch (side) {
        case 'front':  pz = D - offset; break   // 전면 (Z 최대 방향)
        case 'back':   pz = offset; break        // 후면
        case 'right':  px = W - offset; break    // 우측 (X 최대 방향)
        case 'left':   px = offset; break        // 좌측
      }

      // 40kg 수직 하중을 임시 파트(점 질량)로 추가
      // volume = (0.1)^2 × 0.01 = 0.0001 m³, density = mass/volume
      const loadPart: Part = {
        id: '__edge_load__',
        name: `외각 하중 ${appliedMass}kg`,
        type: 'fixed',
        bbox: {
          x: px - 0.05, y: H, z: pz - 0.05,
          width: 0.1, depth: 0.1, height: 0.01,
        },
        mass_factor: 1.0,
        density: appliedMass / 0.0001,
        color: '#f97316',
      }
      clone.parts = [...clone.parts, loadPart]
      break
    }
  }

  return clone
}

/** 진단 문구 생성 */
function generateDiagnostics(
  status: SafetyStatus,
  stability_margin: number,
  com_height: number,
  furniture_height: number,
  safety_margin: number,
  tipping_direction: string,
  type: ScenarioType,
  loads: ExternalLoad[]
): { risk_factors: string[]; improvement_suggestions: string[] } {
  const risks: string[] = []
  const suggestions: string[] = []

  if (stability_margin < safety_margin) {
    risks.push(`안정 여유(${(stability_margin * 100).toFixed(1)}cm)가 안전 기준(${(safety_margin * 100).toFixed(0)}cm) 미만입니다`)
  }
  if (stability_margin < 0) {
    risks.push('유효 무게중심이 지지영역을 벗어나 즉시 전도 위험이 있습니다')
  }
  if (com_height > furniture_height * 0.6) {
    risks.push(`무게중심 높이(${(com_height * 100).toFixed(0)}cm)가 가구 높이의 60% 이상입니다`)
    suggestions.push('하단부에 무거운 부품을 배치하여 무게중심을 낮추세요')
  }
  if (loads.length > 0) {
    risks.push('외력으로 인한 유효 무게중심 이동이 발생합니다')
  }
  if (type === 'single_movable' || type === 'multi_movable') {
    risks.push('가동 파트 작동 시 무게 편중이 발생합니다')
    suggestions.push('가동 파트의 최대 작동 범위를 제한하는 스토퍼를 고려하세요')
  }
  if (type === 'top_load') {
    risks.push('상단 하중이 무게중심을 높입니다')
    suggestions.push('상단 하중을 줄이거나 가구 하단에 안전 발판 추가를 권장합니다')
  }
  if (type === 'edge_load') {
    risks.push('외각 하중으로 유효 무게중심이 지지영역 경계 쪽으로 이동합니다')
    if (status !== '안전') {
      suggestions.push('베이스(바닥면) 폭을 넓혀 지지영역을 확장하세요')
      suggestions.push('하단부 무게를 늘려 무게중심을 낮추세요')
    }
  }

  if (status !== '안전') {
    if (tipping_direction.includes('전면') || tipping_direction.includes('앞')) {
      suggestions.push('앞발 간격을 넓히거나 뒷면 벽 고정을 고려하세요')
    }
    if (tipping_direction.includes('측면') || tipping_direction.includes('우') || tipping_direction.includes('좌')) {
      suggestions.push('측면 발판 간격을 넓혀 지지영역을 확장하세요')
    }
    suggestions.push('무게가 무거운 물건을 하단 서랍/선반에 보관하세요')
  }

  if (risks.length === 0) {
    risks.push('현재 조건에서 전도 위험이 낮습니다')
  }

  return { risk_factors: risks, improvement_suggestions: suggestions }
}

/** 메인 Solver 진입점 */
export function runSolver(
  furniture: FurnitureGeometry,
  type: ScenarioType,
  params: ScenarioParams
): SolverResult {
  const gravity = furniture.solver_settings.gravity
  const safety_margin = furniture.solver_settings.safety_margin
  const polygon = furniture.support_polygon.points

  // 1. 시나리오 적용
  const applied = applyScenario(furniture, type, params)

  // 2. 무게중심 계산
  const { com, total_mass } = computeWeightedCOM(applied.parts, applied.kinematics)

  // 3. 유효 무게중심 (외력 적용)
  const effective_com = computeEffectiveCOM(com, total_mass, applied.loads, gravity)

  // 4. 바닥 투영
  const com_projection: [number, number] = [com.x, com.z]
  const eff_projection: [number, number] = [effective_com.x, effective_com.z]

  // 5. 안정 여유 계산
  const { distance: stability_margin } = computeDistanceToEdge(eff_projection, polygon)
  const is_tipping = stability_margin < 0

  // 6. 전도축 + 방향
  const tipping_edge = findTippingEdge(eff_projection, polygon)
  const tipping_direction = edgeToKoreanDirection(tipping_edge)

  // 7. 임계 가압력 (실제 COM 기준) 및 동적 전도(에너지) 계산
  const { distance: actual_margin } = computeDistanceToEdge(com_projection, polygon)
  const critical_push_force = computeCriticalPushForce(
    actual_margin,
    com.y,
    total_mass,
    gravity
  )

  // 넘어가기 위해 무게중심이 들려야 하는 높이 및 각도 계산
  let tipping_angle: number | undefined
  let tipping_energy: number | undefined
  if (actual_margin > 0 && com.y > 0) {
    const r = Math.sqrt(actual_margin * actual_margin + com.y * com.y)
    tipping_angle = Math.atan2(actual_margin, com.y) * (180 / Math.PI)
    tipping_energy = total_mass * gravity * (r - com.y)
  }

  // 8. 임계 작동 거리 (가동부 시나리오)
  let critical_extension_distance: number | null = null
  let critical_extension_angle: number | null = null

  if (type === 'single_movable' && params.part_id) {
    const part = applied.parts.find((p) => p.id === params.part_id)
    if (part?.motion_type === 'translation') {
      critical_extension_distance = computeCriticalExtension(
        String(params.part_id),
        applied.parts,
        applied.kinematics,
        polygon
      )
    } else if (part?.motion_type === 'rotation') {
      critical_extension_angle = computeCriticalExtension(
        String(params.part_id),
        applied.parts,
        applied.kinematics,
        polygon
      )
    }
  }

  // 9. 상태 판정
  const status: SafetyStatus =
    is_tipping ? '위험'
    : stability_margin < safety_margin * 2 ? '주의'
    : '안전'

  // 10. 진단
  const { risk_factors, improvement_suggestions } = generateDiagnostics(
    status,
    stability_margin,
    com.y,
    furniture.geometry.bbox.height,
    safety_margin,
    tipping_direction,
    type,
    applied.loads
  )

  return {
    status,
    stability_margin,
    critical_push_force,
    critical_extension_distance,
    critical_extension_angle,
    tipping_direction,
    tipping_edge,
    com,
    effective_com,
    com_projection,
    effective_com_projection: eff_projection,
    key_risk_factors: risk_factors,
    improvement_suggestions,
    is_tipping,
    total_mass,
    tipping_angle,
    tipping_energy,
  }
}
