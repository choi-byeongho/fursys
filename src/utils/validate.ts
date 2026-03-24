import type { FurnitureGeometry, BBox, ExternalLoad } from '@/types'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

function validateBBox(bbox: unknown, path: string): string[] {
  const errors: string[] = []
  if (typeof bbox !== 'object' || bbox === null) {
    return [`${path}: bbox가 없거나 올바르지 않습니다`]
  }
  const b = bbox as Record<string, unknown>
  const required = ['x', 'y', 'z', 'width', 'depth', 'height']
  for (const key of required) {
    if (typeof b[key] !== 'number') {
      errors.push(`${path}.${key}: 숫자여야 합니다`)
    }
  }
  if (errors.length === 0) {
    const { width, depth, height } = b as unknown as BBox
    if (width <= 0) errors.push(`${path}.width: 0보다 커야 합니다 (현재: ${width})`)
    if (depth <= 0) errors.push(`${path}.depth: 0보다 커야 합니다 (현재: ${depth})`)
    if (height <= 0) errors.push(`${path}.height: 0보다 커야 합니다 (현재: ${height})`)
  }
  return errors
}

function validateDirection(dir: unknown, path: string): string[] {
  if (!Array.isArray(dir) || dir.length !== 3) {
    return [`${path}: [x, y, z] 배열이어야 합니다`]
  }
  if (!dir.every((v) => typeof v === 'number')) {
    return [`${path}: 모든 요소가 숫자여야 합니다`]
  }
  const mag = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
  if (mag < 1e-6) {
    return [`${path}: 방향 벡터의 크기가 0입니다`]
  }
  return []
}

export function validateFurnitureGeometry(data: unknown): ValidationResult {
  const errors: string[] = []

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['최상위 객체가 아닙니다'] }
  }

  const d = data as Record<string, unknown>

  // geometry.bbox
  if (typeof d.geometry !== 'object' || d.geometry === null) {
    errors.push('geometry 필드가 없습니다')
  } else {
    const geom = d.geometry as Record<string, unknown>
    if (typeof geom.bbox !== 'object' || geom.bbox === null) {
      errors.push('geometry.bbox 필드가 없습니다')
    } else {
      const gb = geom.bbox as Record<string, unknown>
      if (typeof gb.width !== 'number' || gb.width <= 0)
        errors.push(`geometry.bbox.width: 양수여야 합니다 (현재: ${gb.width})`)
      if (typeof gb.depth !== 'number' || gb.depth <= 0)
        errors.push(`geometry.bbox.depth: 양수여야 합니다 (현재: ${gb.depth})`)
      if (typeof gb.height !== 'number' || gb.height <= 0)
        errors.push(`geometry.bbox.height: 양수여야 합니다 (현재: ${gb.height})`)
    }
  }

  // support_polygon
  if (typeof d.support_polygon !== 'object' || d.support_polygon === null) {
    errors.push('support_polygon 필드가 없습니다')
  } else {
    const sp = d.support_polygon as Record<string, unknown>
    if (!Array.isArray(sp.points) || sp.points.length < 3) {
      errors.push('support_polygon.points: 최소 3개의 점이 필요합니다')
    }
  }

  // parts
  if (!Array.isArray(d.parts)) {
    errors.push('parts: 배열이어야 합니다')
  } else if (d.parts.length === 0) {
    errors.push('parts: 최소 1개의 파트가 필요합니다')
  } else {
    for (let i = 0; i < d.parts.length; i++) {
      const part = d.parts[i] as Record<string, unknown>
      const prefix = `parts[${i}]`
      if (typeof part.id !== 'string' || part.id.trim() === '')
        errors.push(`${prefix}.id: 문자열이어야 합니다`)
      if (typeof part.mass_factor !== 'number' || part.mass_factor < 0 || part.mass_factor > 1)
        errors.push(`${prefix}.mass_factor: 0~1 범위의 숫자여야 합니다`)
      if (typeof part.density !== 'number' || part.density <= 0)
        errors.push(`${prefix}.density: 양수여야 합니다`)
      errors.push(...validateBBox(part.bbox, `${prefix}.bbox`))
    }
  }

  // kinematics
  if (!Array.isArray(d.kinematics)) {
    errors.push('kinematics: 배열이어야 합니다')
  }

  // loads
  if (!Array.isArray(d.loads)) {
    errors.push('loads: 배열이어야 합니다')
  } else {
    for (let i = 0; i < d.loads.length; i++) {
      const load = d.loads[i] as Partial<ExternalLoad>
      const prefix = `loads[${i}]`
      if (typeof load.force !== 'number')
        errors.push(`${prefix}.force: 숫자여야 합니다`)
      errors.push(...validateDirection(load.direction, `${prefix}.direction`))
    }
  }

  // solver_settings
  if (typeof d.solver_settings !== 'object' || d.solver_settings === null) {
    errors.push('solver_settings 필드가 없습니다')
  } else {
    const ss = d.solver_settings as Record<string, unknown>
    if (typeof ss.gravity !== 'number' || ss.gravity <= 0)
      errors.push('solver_settings.gravity: 양수여야 합니다')
    if (typeof ss.safety_margin !== 'number' || ss.safety_margin < 0)
      errors.push('solver_settings.safety_margin: 0 이상이어야 합니다')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * direction 벡터를 단위벡터로 정규화한다.
 * 크기가 0이면 원본 반환.
 */
export function normalizeDirection(dir: [number, number, number]): [number, number, number] {
  const mag = Math.sqrt(dir[0] ** 2 + dir[1] ** 2 + dir[2] ** 2)
  if (mag < 1e-9) return dir
  return [dir[0] / mag, dir[1] / mag, dir[2] / mag]
}

/** geometry 객체가 FurnitureGeometry 타입인지 런타임 검사 */
export function assertValidGeometry(data: unknown): asserts data is FurnitureGeometry {
  const result = validateFurnitureGeometry(data)
  if (!result.valid) {
    throw new Error(result.errors.join('\n'))
  }
}
