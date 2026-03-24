import { useRef, useLayoutEffect } from 'react'
import { useScenarioStore } from '@/store/scenarioStore'
import { useGeometryStore } from '@/store/geometryStore'
import * as THREE from 'three'

export function ForceVector() {
  const type = useScenarioStore((s) => s.activeType)
  const params = useScenarioStore((s) => s.params)
  const furniture = useGeometryStore((s) => s.furniture)
  const groupRef = useRef<THREE.Group>(null)

  if (!['front_force', 'side_force', 'external_force_only', 'top_load', 'edge_load'].includes(type)) {
    return null
  }

  let px = furniture.geometry.bbox.width / 2
  let pz = furniture.geometry.bbox.depth / 2
  let py = Number(params.force_height ?? 1.0)
  
  let dx = 0
  let dy = 0
  let dz = 0

  let F = Number(params.force_magnitude ?? 100)

  if (type === 'top_load') {
    F = Number(params.added_mass ?? 20) * 9.81
    px = Number(params.pos_x ?? furniture.geometry.bbox.width / 2)
    pz = Number(params.pos_z ?? furniture.geometry.bbox.depth / 2)
    py = furniture.geometry.bbox.height
    dy = -1 // Pushing straight down
  } else if (type === 'edge_load') {
    F = Number(params.applied_mass ?? 40) * 9.81
    const W = furniture.geometry.bbox.width
    const D = furniture.geometry.bbox.depth
    const offset = Number(params.offset_from_edge ?? 0.1)
    const side = String(params.edge_side ?? 'front')
    if (side === 'front') pz = D - offset
    else if (side === 'back') pz = offset
    else if (side === 'right') px = W - offset
    else if (side === 'left') px = offset
    py = furniture.geometry.bbox.height
    dy = -1
  } else if (type === 'front_force') {
    pz = -0.1
    py = Number(params.force_height ?? 1.0)
    px += Number(params.force_x_offset ?? 0)
    dz = 1
  } else if (type === 'side_force') {
    px = -0.1
    py = Number(params.force_height ?? 1.0)
    pz += Number(params.force_z_offset ?? 0)
    dx = 1
  } else {
    dx = Number(params.direction_x ?? 0)
    dz = Number(params.direction_z ?? 1)
  }

  // Calculate size and color mapping dynamically
  const scale = Math.max(0.15, Math.log10(Math.max(F, 10)) * 0.15)
  const isGravityBased = type === 'top_load' || type === 'edge_load'
  const color = isGravityBased ? '#f97316' : '#ef4444' // Orange for weight/mass, Red for direct force

  useLayoutEffect(() => {
    if (groupRef.current) {
      // Set the arrow base at the impact point and point it in the direction of the force
      const target = new THREE.Vector3(px + dx, py + dy, pz + dz)
      groupRef.current.position.set(px, py, pz)
      groupRef.current.lookAt(target)
    }
  }, [px, py, pz, dx, dy, dz, type])

  return (
    <group ref={groupRef}>
      {/* 
        The lookAt method makes the group's +Z axis point along the force direction.
        Normally, forces "push" into the impact point (the origin). 
        Therefore, our arrow tip should land at the origin, and its tail 
        should extend backward along the -Z axis.
      */}
      <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.1, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0, -scale * 0.5 - 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, scale, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}
