import { useResultsStore } from '@/store/resultsStore'

export function COMMarker() {
  const result = useResultsStore((s) => s.result)
  if (!result) return null

  const { com, effective_com, com_projection, effective_com_projection } = result
  const hasDiff =
    Math.abs(com.x - effective_com.x) > 0.001 ||
    Math.abs(com.z - effective_com.z) > 0.001

  return (
    <group>
      {/* 실제 COM */}
      <mesh position={[com.x, com.y, com.z]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.5} />
      </mesh>
      {/* 실제 COM 바닥 투영 */}
      <mesh position={[com_projection[0], 0.003, com_projection[1]]}>
        <cylinderGeometry args={[0.02, 0.02, 0.002, 16]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.7} />
      </mesh>
      {/* 수직 점선 (실제 COM) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([com_projection[0], 0.003, com_projection[1], com.x, com.y, com.z]), 3]}
          />
        </bufferGeometry>
        <lineDashedMaterial color="#facc15" dashSize={0.05} gapSize={0.03} />
      </line>

      {/* 유효 COM (외력 있을 때만) */}
      {hasDiff && (
        <>
          <mesh position={[effective_com.x, effective_com.y, effective_com.z]}>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[effective_com_projection[0], 0.003, effective_com_projection[1]]}>
            <cylinderGeometry args={[0.025, 0.025, 0.002, 16]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}
