import type { Part, KinematicConstraint, Vector3D } from '@/types'
import { bboxVolume, bboxCentroid } from '@/utils/geometry'

export function computePartMass(part: Part): number {
  return bboxVolume(part.bbox) * part.density * part.mass_factor
}

/**
 * 가동부의 현재 위치를 반영해 파트의 무게중심을 계산한다.
 * - translation: bbox origin을 axis 방향으로 displacement만큼 이동
 * - rotation(Y축): 힌지 축을 기준으로 bbox 중심을 회전
 */
export function computePartCentroid(
  part: Part,
  kinematics: KinematicConstraint[]
): Vector3D {
  const base = bboxCentroid(part.bbox)
  const constraint = kinematics.find((k) => k.part_id === part.id)
  if (!constraint || part.type !== 'movable') return base

  const pos = constraint.current_position

  if (part.motion_type === 'translation') {
    const dx = constraint.axis === 'x' ? pos : 0
    const dy = constraint.axis === 'y' ? pos : 0
    const dz = constraint.axis === 'z' ? pos : 0
    return { x: base.x + dx, y: base.y + dy, z: base.z + dz }
  }

  if (part.motion_type === 'rotation') {
    // Y축 회전(문): 힌지 축은 bbox의 x 최솟값, 문은 Z축 방향으로 열림
    const angleRad = (pos * Math.PI) / 180
    const pivotX = part.bbox.x
    const pivotZ = part.bbox.z
    // base 상대 위치 (힌지 기준)
    const relX = base.x - pivotX
    const relZ = base.z - pivotZ
    // Y축 회전 적용
    const rotX = relX * Math.cos(angleRad) - relZ * Math.sin(angleRad)
    const rotZ = relX * Math.sin(angleRad) + relZ * Math.cos(angleRad)
    return { x: pivotX + rotX, y: base.y, z: pivotZ + rotZ }
  }

  return base
}

export interface COMResult {
  com: Vector3D
  total_mass: number
}

export function computeWeightedCOM(
  parts: Part[],
  kinematics: KinematicConstraint[]
): COMResult {
  let totalMass = 0
  let wx = 0
  let wy = 0
  let wz = 0

  for (const part of parts) {
    const m = computePartMass(part)
    const c = computePartCentroid(part, kinematics)
    totalMass += m
    wx += m * c.x
    wy += m * c.y
    wz += m * c.z
  }

  if (totalMass === 0) {
    return { com: { x: 0, y: 0, z: 0 }, total_mass: 0 }
  }

  return {
    com: { x: wx / totalMass, y: wy / totalMass, z: wz / totalMass },
    total_mass: totalMass,
  }
}
