import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useResultsStore } from '@/store/resultsStore'
import { useGeometryStore } from '@/store/geometryStore'
import { computePartCentroid } from '@/solver/comCalculator'
import type { Group } from 'three'

const ANIM_DURATION = 2.0

export function TippingAnimation() {
  const tippingPreview = useResultsStore((s) => s.tippingPreview)
  const toggleTippingPreview = useResultsStore((s) => s.toggleTippingPreview)
  const result = useResultsStore((s) => s.result)
  const parts = useGeometryStore((s) => s.furniture.parts)
  const kinematics = useGeometryStore((s) => s.furniture.kinematics)
  const groupRef = useRef<Group>(null)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (tippingPreview) {
      startTimeRef.current = null
    }
  }, [tippingPreview])

  useFrame(({ clock }) => {
    if (!tippingPreview || !groupRef.current || !result?.tipping_edge) return

    if (startTimeRef.current === null) {
      startTimeRef.current = clock.elapsedTime
    }

    const elapsed = clock.elapsedTime - startTimeRef.current
    const t = Math.min(elapsed / ANIM_DURATION, 1)
    const angle = t * Math.PI * 0.35

    const edge = result.tipping_edge
    const px = (edge.start[0] + edge.end[0]) / 2
    const pz = (edge.start[2] + edge.end[2]) / 2

    groupRef.current.rotation.set(
      edge.normal[1] * angle,
      0,
      -edge.normal[0] * angle
    )
    groupRef.current.position.set(
      px - px * Math.cos(-edge.normal[0] * angle),
      0,
      pz - pz * Math.cos(edge.normal[1] * angle)
    )

    if (t >= 1) {
      setTimeout(() => {
        if (groupRef.current) {
          groupRef.current.rotation.set(0, 0, 0)
          groupRef.current.position.set(0, 0, 0)
        }
        toggleTippingPreview()
      }, 500)
    }
  })

  if (!tippingPreview) return null

  return (
    <group ref={groupRef}>
      {parts.map((part) => {
        const centroid = computePartCentroid(part, kinematics)
        return (
          <mesh key={part.id} position={[centroid.x, centroid.y, centroid.z]}>
            <boxGeometry args={[part.bbox.width, part.bbox.height, part.bbox.depth]} />
            <meshStandardMaterial
              color={part.color ?? '#c4a882'}
              transparent
              opacity={0.5}
              wireframe
            />
          </mesh>
        )
      })}
    </group>
  )
}
