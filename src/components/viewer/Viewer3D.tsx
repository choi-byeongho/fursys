import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useGeometryStore } from '@/store/geometryStore'
import { FurnitureMesh } from './FurnitureMesh'
import { SupportPolygonMesh } from './SupportPolygonMesh'
import { COMMarker } from './COMMarker'
import { TippingEdgeLine } from './TippingEdgeLine'
import { ForceVector } from './ForceVector'
import { TippingAnimation } from './TippingAnimation'
import { Group } from 'three'

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

function RotatableGroup({
  rotation,
  children,
}: {
  rotation: { x: number; y: number; z: number }
  children: React.ReactNode
}) {
  return (
    <group rotation={[rotation.x, rotation.y, rotation.z]}>
      {children}
    </group>
  )
}

export function Viewer3D() {
  const viewRef = useRef<(view: string) => void>(() => {})
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

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
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700 max-w-xs">
        <div className="text-xs font-semibold text-gray-300">카메라 뷰</div>
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
          className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-500 transition-colors w-full"
        >
          뷰 리셋
        </button>

        {/* 모델 회전 컨트롤 */}
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="text-xs font-semibold text-gray-300 mb-2">모델 회전</div>

          {/* X축 회전 */}
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-gray-400 w-12">X축</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={rotation.x * (180 / Math.PI)}
              onChange={(e) =>
                setRotation((prev) => ({
                  ...prev,
                  x: parseFloat(e.target.value) * (Math.PI / 180),
                }))
              }
              className="flex-1 h-1 accent-red-500"
            />
            <span className="text-xs text-gray-500 w-10 text-right">
              {Math.round(rotation.x * (180 / Math.PI))}°
            </span>
          </div>

          {/* Y축 회전 */}
          <div className="flex items-center gap-2 mb-2">
            <label className="text-xs text-gray-400 w-12">Y축</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={rotation.y * (180 / Math.PI)}
              onChange={(e) =>
                setRotation((prev) => ({
                  ...prev,
                  y: parseFloat(e.target.value) * (Math.PI / 180),
                }))
              }
              className="flex-1 h-1 accent-green-500"
            />
            <span className="text-xs text-gray-500 w-10 text-right">
              {Math.round(rotation.y * (180 / Math.PI))}°
            </span>
          </div>

          {/* Z축 회전 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-12">Z축</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={rotation.z * (180 / Math.PI)}
              onChange={(e) =>
                setRotation((prev) => ({
                  ...prev,
                  z: parseFloat(e.target.value) * (Math.PI / 180),
                }))
              }
              className="flex-1 h-1 accent-blue-500"
            />
            <span className="text-xs text-gray-500 w-10 text-right">
              {Math.round(rotation.z * (180 / Math.PI))}°
            </span>
          </div>

          <button
            onClick={() => setRotation({ x: 0, y: 0, z: 0 })}
            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 hover:border-gray-500 transition-colors mt-2 w-full"
          >
            회전 리셋
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
          마우스 드래그: 카메라 회전
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

        {/* 회전 가능한 모델 그룹 */}
        <RotatableGroup rotation={rotation}>
          {/* 가구 메시 */}
          <FurnitureMesh />

          {/* 오버레이 */}
          <SupportPolygonMesh />
          <COMMarker />
          <TippingEdgeLine />
          <ForceVector />
          <TippingAnimation />
        </RotatableGroup>

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
