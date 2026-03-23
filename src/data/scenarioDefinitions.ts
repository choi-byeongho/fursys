import type { ScenarioType } from '@/types'

export interface ScenarioMeta {
  id: ScenarioType
  name: string
  description: string
  defaultParams: Record<string, number | string>
}

export const SCENARIO_DEFINITIONS: ScenarioMeta[] = [
  {
    id: 'front_force',
    name: '전면 힘 안정성',
    description: '가구 전면에 수평력을 가할 때의 전도 위험',
    defaultParams: { force_magnitude: 100, force_height: 1.4, force_x_offset: 0 },
  },
  {
    id: 'side_force',
    name: '측면 힘 안정성',
    description: '가구 측면에 수평력을 가할 때의 전도 위험',
    defaultParams: { force_magnitude: 100, force_height: 1.4, force_z_offset: 0 },
  },
  {
    id: 'single_movable',
    name: '단일 가동 파트 작동',
    description: '서랍/문 하나를 열었을 때의 전도 위험',
    defaultParams: { part_id: '', displacement: 0 },
  },
  {
    id: 'multi_movable',
    name: '복수 가동 파트 작동',
    description: '여러 가동 파트를 동시에 열었을 때의 전도 위험',
    defaultParams: {},
  },
  {
    id: 'top_load',
    name: '상부 하중 추가',
    description: '가구 상단에 추가 하중을 올렸을 때의 전도 위험',
    defaultParams: { added_mass: 20, pos_x: 0.3, pos_z: 0.25 },
  },
  {
    id: 'external_force_only',
    name: '외력 안정성 점검',
    description: '임의 방향의 외력만 작용할 때의 안정성',
    defaultParams: {
      force_magnitude: 150,
      force_height: 1.0,
      direction_x: 0,
      direction_z: 1,
    },
  },
  {
    id: 'edge_load',
    name: '외각 하중 테스트',
    description: '가구 최외각에서 10cm 안쪽 지점에 수직 하중 적용 (어린이 하중 기준)',
    defaultParams: {
      applied_mass: 40,
      offset_from_edge: 0.1,
      edge_side: 'front',
    },
  },
]
