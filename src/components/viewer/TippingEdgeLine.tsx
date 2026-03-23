import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useResultsStore } from '@/store/resultsStore'
import type { Mesh, MeshStandardMaterial } from 'three'

export function TippingEdgeLine() {
  const result = useResultsStore((s) => s.result)
  const meshRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current && result?.status === '위험') {
      const mat = meshRef.current.material as MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 4)
    }
  })

  if (!result?.tipping_edge || result.status === '안전') return null

  const { start, end } = result.tipping_edge
  const color = result.status === '위험' ? '#ef4444' : '#f59e0b'

  const linePoints = new Float32Array([start[0], 0.005, start[2], end[0], 0.005, end[2]])

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={3} />
      </line>
      {/* 전도 방향 화살표 표시용 얇은 실린더 */}
      <mesh
        ref={meshRef}
        position={[
          (start[0] + end[0]) / 2,
          0.01,
          (start[2] + end[2]) / 2,
        ]}
      >
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
