import type { ExternalLoad, Vector3D } from '@/types'

/**
 * 외력이 가해질 때 유효 무게중심(effective COM)을 계산한다.
 *
 * 원리: 수평력 F를 높이 h에 적용하면 바닥에 대한 모멘트 = F × h
 * 이를 무게중심 이동으로 등가 변환:
 *   Δx = (Fx × h) / (m × g)
 *   Δz = (Fz × h) / (m × g)
 */
export function computeEffectiveCOM(
  com: Vector3D,
  total_mass: number,
  loads: ExternalLoad[],
  gravity: number
): Vector3D {
  const W = total_mass * gravity
  if (W === 0) return com

  let momentX = 0
  let momentZ = 0

  for (const load of loads) {
    const [, fy, ] = load.direction
    const Fx = load.force * load.direction[0]
    const Fz = load.force * load.direction[2]
    const h = load.position[1]

    // 수직 하중은 COM 이동 없음
    if (Math.abs(fy) > 0.99) continue

    momentX += Fx * h
    momentZ += Fz * h
  }

  return {
    x: com.x + momentX / W,
    y: com.y,
    z: com.z + momentZ / W,
  }
}
