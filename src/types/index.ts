// ─── Geometry Input ────────────────────────────────────────────────────────────

export interface BBox {
  x: number
  y: number
  z: number
  width: number
  depth: number
  height: number
}

export type PartType = 'fixed' | 'movable'
export type MotionType = 'translation' | 'rotation'

export interface Part {
  id: string
  name: string
  type: PartType
  motion_type?: MotionType
  bbox: BBox
  mass_factor: number
  density: number
  color?: string
}

export interface KinematicConstraint {
  part_id: string
  axis: 'x' | 'y' | 'z'
  range: [number, number]
  current_position: number
}

export interface ExternalLoad {
  part_id: string | null
  force: number
  position: [number, number, number]
  direction: [number, number, number]
}

export type SupportPoint = [number, number] // [x, z]

export interface STLMesh {
  vertices: number[][] // [x, y, z][]
  faces: number[][]    // [v0, v1, v2][]
}

export interface FurnitureGeometry {
  geometry: {
    bbox: { width: number; depth: number; height: number }
  }
  support_polygon: { points: SupportPoint[] }
  parts: Part[]
  kinematics: KinematicConstraint[]
  loads: ExternalLoad[]
  scenarios: ScenarioDefinition[]
  solver_settings: SolverSettings
  mesh?: STLMesh // 선택: STL 업로드 시 포함
}

export interface SolverSettings {
  gravity: number
  safety_margin: number
}

// ─── Scenarios ─────────────────────────────────────────────────────────────────

export type ScenarioType =
  | 'front_force'
  | 'side_force'
  | 'single_movable'
  | 'multi_movable'
  | 'top_load'
  | 'external_force_only'
  | 'edge_load'

export interface ScenarioDefinition {
  id: string
  name: string
  type: ScenarioType
  parameters: Record<string, number | string | boolean>
}

// ─── Solver Outputs ─────────────────────────────────────────────────────────────

export type SafetyStatus = '안전' | '주의' | '위험'

export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface TippingEdge {
  start: [number, number, number]
  end: [number, number, number]
  normal: [number, number]
}

export interface SolverResult {
  status: SafetyStatus
  stability_margin: number
  critical_push_force: number
  critical_extension_distance: number | null
  critical_extension_angle: number | null
  tipping_direction: string
  tipping_edge: TippingEdge | null
  com: Vector3D
  effective_com: Vector3D
  com_projection: [number, number]
  effective_com_projection: [number, number]
  key_risk_factors: string[]
  improvement_suggestions: string[]
  is_tipping: boolean
  total_mass: number
}
