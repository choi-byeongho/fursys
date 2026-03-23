import type { Part, KinematicConstraint, SupportPoint } from '@/types'
import { computeWeightedCOM } from './comCalculator'
import { computeDistanceToEdge } from './supportPolygon'
import { clamp } from '@/utils/geometry'

/**
 * 임계 가압력 계산
 * 전도 조건: F × com_height = W × stability_margin
 * => F_crit = (W × margin) / com_height
 */
export function computeCriticalPushForce(
  stability_margin: number,
  com_height: number,
  total_mass: number,
  gravity: number
): number {
  if (com_height <= 0 || stability_margin <= 0) return 0
  const W = total_mass * gravity
  return (W * stability_margin) / com_height
}

/**
 * 이진탐색으로 가동부의 임계 작동 거리/각도를 찾는다.
 * stability_margin = 0이 되는 displacement 값을 반환.
 */
export function computeCriticalExtension(
  targetPartId: string,
  parts: Part[],
  kinematics: KinematicConstraint[],
  polygon: SupportPoint[]
): number | null {
  const constraint = kinematics.find((k) => k.part_id === targetPartId)
  if (!constraint) return null

  const [lo_bound, hi_bound] = constraint.range
  let lo = constraint.current_position
  let hi = hi_bound

  // 현재 위치에서 이미 불안정하면 null
  const testKin = (pos: number): number => {
    const modifiedKinematics = kinematics.map((k) =>
      k.part_id === targetPartId ? { ...k, current_position: pos } : k
    )
    const { com } = computeWeightedCOM(parts, modifiedKinematics)
    const proj: [number, number] = [com.x, com.z]
    return computeDistanceToEdge(proj, polygon).distance
  }

  // 상한에서도 안전하면 임계 없음
  if (testKin(hi_bound) > 0) return null

  lo = lo_bound

  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2
    if (testKin(mid) > 0) {
      lo = mid
    } else {
      hi = mid
    }
    if (hi - lo < 0.001) break
  }

  return clamp(lo, lo_bound, hi_bound)
}
