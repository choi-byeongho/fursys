import type { SupportPoint, TippingEdge } from '@/types'
import { clamp } from '@/utils/geometry'

/** Ray casting 알고리즘으로 점이 다각형 내부인지 판정 */
export function isPointInPolygon(
  point: [number, number],
  polygon: SupportPoint[]
): boolean {
  const [px, pz] = point
  const n = polygon.length
  let inside = false
  let j = n - 1

  for (let i = 0; i < n; i++) {
    const [xi, zi] = polygon[i]
    const [xj, zj] = polygon[j]
    if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) {
      inside = !inside
    }
    j = i
  }

  return inside
}

export interface EdgeDistResult {
  distance: number          // 양수 = 내부, 음수 = 외부
  nearest_edge_index: number
  nearest_point: [number, number]
}

/** 점에서 다각형 각 변까지의 최단 거리와 가장 가까운 변 인덱스 반환 */
export function computeDistanceToEdge(
  point: [number, number],
  polygon: SupportPoint[]
): EdgeDistResult {
  const [px, pz] = point
  let minDist = Infinity
  let nearestIdx = 0
  let nearestPt: [number, number] = polygon[0]

  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length
    const [ax, az] = polygon[i]
    const [bx, bz] = polygon[j]

    const dx = bx - ax
    const dz = bz - az
    const lenSq = dx * dx + dz * dz

    let t = 0
    if (lenSq > 0) {
      t = clamp(((px - ax) * dx + (pz - az) * dz) / lenSq, 0, 1)
    }

    const cx = ax + t * dx
    const cz = az + t * dz
    const dist = Math.sqrt((px - cx) ** 2 + (pz - cz) ** 2)

    if (dist < minDist) {
      minDist = dist
      nearestIdx = i
      nearestPt = [cx, cz]
    }
  }

  const sign = isPointInPolygon(point, polygon) ? 1 : -1
  return {
    distance: sign * minDist,
    nearest_edge_index: nearestIdx,
    nearest_point: nearestPt,
  }
}

/** 전도가 일어날 축(전도 가장자리)을 계산 */
export function findTippingEdge(
  eff_proj: [number, number],
  polygon: SupportPoint[]
): TippingEdge {
  const { nearest_edge_index: i } = computeDistanceToEdge(eff_proj, polygon)
  const j = (i + 1) % polygon.length
  const [ax, az] = polygon[i]
  const [bx, bz] = polygon[j]

  // 변의 법선 벡터(바깥쪽)
  const dx = bx - ax
  const dz = bz - az
  const len = Math.sqrt(dx * dx + dz * dz) || 1
  const nx = dz / len
  const nz = -dx / len

  return {
    start: [ax, 0, az],
    end: [bx, 0, bz],
    normal: [nx, nz],
  }
}

/** 전도 방향을 한국어 문자열로 반환 */
export function edgeToKoreanDirection(edge: TippingEdge): string {
  const [nx, nz] = edge.normal
  const absX = Math.abs(nx)
  const absZ = Math.abs(nz)

  if (absZ > absX) {
    return nz > 0 ? '전면 (앞쪽)' : '후면 (뒤쪽)'
  } else {
    return nx > 0 ? '우측면' : '좌측면'
  }
}
