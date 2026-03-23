import { useMemo } from 'react'
import { useGeometryStore } from '@/store/geometryStore'
import { computePartCentroid } from '@/solver/comCalculator'
import type { Part, KinematicConstraint } from '@/types'

const DEFAULT_COLORS: Record<string, string> = {
  fixed: '#c4a882',
  movable: '#7ea8c4',
}

function PartBox({ part, kinematics }: { part: Part; kinematics: KinematicConstraint[] }) {
  const centroid = useMemo(() => computePartCentroid(part, kinematics), [part, kinematics])
  const color = part.color ?? DEFAULT_COLORS[part.type]

  return (
    <mesh position={[centroid.x, centroid.y, centroid.z]}>
      <boxGeometry args={[part.bbox.width, part.bbox.height, part.bbox.depth]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.85}
        roughness={0.7}
        metalness={0.0}
      />
    </mesh>
  )
}

export function FurnitureMesh() {
  const parts = useGeometryStore((s) => s.furniture.parts)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)

  return (
    <group>
      {parts.map((part) => (
        <PartBox key={part.id} part={part} kinematics={kinematics} />
      ))}
    </group>
  )
}
