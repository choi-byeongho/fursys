import { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useGeometryStore } from '@/store/geometryStore'
import { FurnitureMesh } from './FurnitureMesh'
import { SupportPolygonMesh } from './SupportPolygonMesh'
import { COMMarker } from './COMMarker'
import { TippingEdgeLine } from './TippingEdgeLine'
import { ForceVector } from './ForceVector'
import { TippingAnimation } from './TippingAnimation'

function CameraAdjuster() {
  const furniture = useGeometryStore((s) => s.furniture)
  const { camera } = useThree()

  useEffect(() => {
    const bbox = furniture.geometry.bbox
    const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
    const distance = maxDim * 1.5

    camera.position.set(distance * 0.6, distance * 0.8, distance * 0.6)
    camera.lookAt(bbox.width / 2, bbox.height / 2, bbox.depth / 2)
  }, [furniture, camera])

  return null
}

function CameraController({
  viewRef,
}: {
  viewRef: React.MutableRefObject<(view: string) => void>
}) {
  const { camera } = useThree()
  const bbox = useGeometryStore((s) => s.furniture.geometry.bbox)

  useEffect(() => {
    const centerX = bbox.width / 2
    const centerY = bbox.height / 2
    const centerZ = bbox.depth / 2
    const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
    const distance = maxDim * 1.8

    const positions: Record<string, [number, number, number]> = {
      front: [centerX, centerY, centerZ + distance],
      back: [centerX, centerY, centerZ - distance],
      left: [centerX - distance, centerY, centerZ],
      right: [centerX + distance, centerY, centerZ],
      top: [centerX, centerY + distance, centerZ],
      iso: [centerX + distance * 0.6, centerY + distance * 0.7, centerZ + distance * 0.6],
    }

    viewRef.current = (viewName: string) => {
      const pos = positions[viewName] || positions.iso
      camera.position.set(...pos)
      camera.lookAt(centerX, centerY, centerZ)
    }
  }, [bbox, camera, viewRef])

  return null
}

export function Viewer3D() {
  const viewRef = useRef<(view: string) => void>(() => {})

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#111827',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* 뷰 컨트롤 UI */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
        <div className="text-xs font-semibold text-gray-300 mb-2">뷰 선택</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'front', label: '정면' },
            { id: 'back', label: '후면' },
            { id: 'left', label: '좌측' },
            { id: 'right', label: '우측' },
            { id: 'top', label: '상단' },
            { id: 'iso', label: '입체' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => viewRef.current(id)}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => viewRef.current('iso')}
          className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-500 transition-colors mt-2 w-full"
        >
          리셋
        </button>
        <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
          마우스 드래그: 회전 / 스크롤: 줌
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [1.5, 2.0, 2.5], fov: 45 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraAdjuster />
        <CameraController viewRef={viewRef} />

        <color attach="background" args={['#111827']} />

        {/* 조명 */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 3]} intensity={1.5} />
        <directionalLight position={[-2, 3, -2]} intensity={0.5} />
        <pointLight position={[0, 3, 1]} intensity={0.3} />

        {/* 바닥 격자 */}
        <Grid
          position={[0.3, 0, 0.25]}
          args={[6, 6]}
          cellSize={0.1}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={0.5}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={8}
          fadeStrength={1}
          infiniteGrid
        />

        {/* 가구 메시 */}
        <FurnitureMesh />

        {/* 오버레이 */}
        <SupportPolygonMesh />
        <COMMarker />
        <TippingEdgeLine />
        <ForceVector />
        <TippingAnimation />

        {/* 카메라 컨트롤 */}
        <OrbitControls
          target={[0.3, 0.9, 0.25]}
          minDistance={0.5}
          maxDistance={8}
          enablePan
        />
      </Canvas>
    </div>
  )
}
