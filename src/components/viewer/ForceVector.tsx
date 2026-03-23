import { useRef } from 'react'
import { useScenarioStore } from '@/store/scenarioStore'
import { useGeometryStore } from '@/store/geometryStore'
import type { Mesh } from 'three'

export function ForceVector() {
  const type = useScenarioStore((s) => s.activeType)
  const params = useScenarioStore((s) => s.params)
  const furniture = useGeometryStore((s) => s.furniture)
  const arrowRef = useRef<Mesh>(null)

  if (type !== 'front_force' && type !== 'side_force' && type !== 'external_force_only') {
    return null
  }

  const F = Number(params.force_magnitude ?? 100)
  const h = Number(params.force_height ?? 1.0)
  const scale = Math.log10(Math.max(F, 10)) * 0.15

  let px = furniture.geometry.bbox.width / 2
  let pz = furniture.geometry.bbox.depth / 2
  let dx = 0
  let dz = 0

  if (type === 'front_force') {
    pz = -0.1
    dz = 1
    px += Number(params.force_x_offset ?? 0)
  } else if (type === 'side_force') {
    px = -0.1
    dx = 1
    pz += Number(params.force_z_offset ?? 0)
  } else {
    dx = Number(params.direction_x ?? 0)
    dz = Number(params.direction_z ?? 1)
    const len = Math.sqrt(dx * dx + dz * dz) || 1
    dx /= len
    dz /= len
  }

  return (
    <group>
      {/* 힘 벡터 원통 */}
      <mesh
        ref={arrowRef}
        position={[px + dx * scale * 0.5, h, pz + dz * scale * 0.5]}
        rotation={[
          Math.atan2(dz, 0),
          Math.atan2(-dx, dz),
          0,
        ]}
      >
        <cylinderGeometry args={[0.015, 0.015, scale, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
      {/* 화살촉 */}
      <mesh
        position={[px + dx * scale, h, pz + dz * scale]}
        rotation={[Math.atan2(dz, 0), Math.atan2(-dx, dz), 0]}
      >
        <coneGeometry args={[0.035, 0.08, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
