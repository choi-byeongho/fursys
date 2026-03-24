import { useMemo } from 'react'
import { BufferGeometry, BufferAttribute } from 'three'
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

function STLMesh({ mesh, color }: { mesh: { vertices: number[][]; faces: number[][] }; color: string }) {
  const geometry = useMemo(() => {
    const geom = new BufferGeometry()
    const vertices = new Float32Array(mesh.vertices.flat())
    const indices = new Uint32Array(mesh.faces.flat())

    geom.setAttribute('position', new BufferAttribute(vertices, 3))
    geom.setIndex(new BufferAttribute(indices, 1))
    geom.computeVertexNormals()

    return geom
  }, [mesh])

  return (
    <mesh geometry={geometry}>
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
  const mesh = useGeometryStore((s) => s.furniture.mesh)

  // STL 메시가 있으면 그것을 사용
  if (mesh) {
    const part = parts[0]
    const color = part?.color ?? DEFAULT_COLORS[part?.type ?? 'fixed']
    return (
      <group>
        <STLMesh mesh={mesh} color={color} />
      </group>
    )
  }

  // 없으면 기본 박스 렌더링
  return (
    <group>
      {parts.map((part) => (
        <PartBox key={part.id} part={part} kinematics={kinematics} />
      ))}
    </group>
  )
}
