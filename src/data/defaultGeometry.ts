import type { FurnitureGeometry } from '@/types'

// 기본 예시: 옷장 (1.8m 높이)
// 문을 90° 열고 상단 하중 추가 시 "주의/위험" 상태 체험 가능
export const defaultGeometry: FurnitureGeometry = {
  geometry: {
    bbox: { width: 0.6, depth: 0.5, height: 1.8 },
  },
  support_polygon: {
    // 바닥 접지면: 옷장 하단 모서리 (안쪽 약간 여유)
    points: [
      [0.05, 0.05],
      [0.55, 0.05],
      [0.55, 0.45],
      [0.05, 0.45],
    ],
  },
  parts: [
    {
      id: 'body',
      name: '본체',
      type: 'fixed',
      bbox: { x: 0, y: 0, z: 0, width: 0.6, depth: 0.5, height: 1.8 },
      mass_factor: 0.4, // 속이 비어 있으므로 낮은 비율
      density: 600,
      color: '#a0856c',
    },
    {
      id: 'top_shelf',
      name: '상단 선반',
      type: 'fixed',
      bbox: { x: 0.02, y: 1.7, z: 0.02, width: 0.56, depth: 0.46, height: 0.05 },
      mass_factor: 1.0,
      density: 400,
      color: '#c4a882',
    },
    {
      id: 'door_left',
      name: '좌측 문',
      type: 'movable',
      motion_type: 'rotation',
      bbox: { x: 0.01, y: 0.05, z: 0.48, width: 0.28, depth: 0.02, height: 1.6 },
      mass_factor: 1.0,
      density: 700,
      color: '#8b6f50',
    },
    {
      id: 'door_right',
      name: '우측 문',
      type: 'movable',
      motion_type: 'rotation',
      bbox: { x: 0.31, y: 0.05, z: 0.48, width: 0.28, depth: 0.02, height: 1.6 },
      mass_factor: 1.0,
      density: 700,
      color: '#8b6f50',
    },
  ],
  kinematics: [
    {
      part_id: 'door_left',
      axis: 'y',
      range: [0, 90],
      current_position: 0,
    },
    {
      part_id: 'door_right',
      axis: 'y',
      range: [0, 90],
      current_position: 0,
    },
  ],
  loads: [],
  scenarios: [
    {
      id: 'front_force_default',
      name: '전면 힘 안정성',
      type: 'front_force',
      parameters: { force_magnitude: 100, force_height: 1.4, force_x_offset: 0 },
    },
  ],
  solver_settings: {
    gravity: 9.81,
    safety_margin: 0.05,
  },
}
