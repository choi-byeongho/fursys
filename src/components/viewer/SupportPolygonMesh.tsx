import { useMemo } from 'react'
import { Shape, ShapeGeometry } from 'three'
import { useGeometryStore } from '@/store/geometryStore'
import { useResultsStore } from '@/store/resultsStore'

const STATUS_COLORS: Record<string, string> = {
  '안전': '#22c55e',
  '주의': '#f59e0b',
  '위험': '#ef4444',
  'none': '#6b7280',
}

export function SupportPolygonMesh() {
  const points = useGeometryStore((s) => s.furniture.support_polygon.points)
  const result = useResultsStore((s) => s.result)

  const color = STATUS_COLORS[result?.status ?? 'none'] ?? STATUS_COLORS['none']

  const shapeGeometry = useMemo(() => {
    if (points.length < 3) return null
    const shape = new Shape()
    shape.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
      shape.lineTo(points[i][0], points[i][1])
    }
    shape.closePath()
    return new ShapeGeometry(shape)
  }, [points])

  const linePoints = useMemo(
    () =>
      points.length > 0
        ? [...points, points[0]].flatMap(([x, z]) => [x, 0.001, z])
        : [],
    [points]
  )

  if (points.length < 3) return null

  return (
    <group>
      {/* 채워진 면 */}
      {shapeGeometry && (
        <mesh
          geometry={shapeGeometry}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.001, 0]}
        >
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}
      {/* 외곽선 */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(linePoints), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>
    </group>
  )
}
