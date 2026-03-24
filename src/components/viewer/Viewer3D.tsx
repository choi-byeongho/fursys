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
  const rotateGeometry = useGeometryStore((s) => s.rotateGeometry)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f5f7',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* 뷰 컨트롤 UI */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 bg-white/70 backdrop-blur-md p-4 rounded-xl border border-gray-200 max-w-xs shadow-lg">
        <div className="text-xs font-semibold text-gray-800">카메라 뷰</div>
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
              className="px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg border border-gray-200 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => viewRef.current('iso')}
          className="px-3 py-1.5 text-xs bg-black hover:bg-gray-800 text-white rounded-lg transition-colors w-full shadow-sm mt-1"
        >
          뷰 리셋
        </button>

        {/* 모델 회전 컨트롤 (물리적) */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs font-semibold text-gray-800 mb-2">물리적 회전 (시뮬레이션 적용)</div>
          
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-600 w-12 font-medium">{axis.toUpperCase()}축</span>
              <div className="flex gap-1.5 flex-1">
                <button
                  onClick={() => rotateGeometry(axis, -1)}
                  className="flex-1 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200"
                >
                  -90°
                </button>
                <button
                  onClick={() => rotateGeometry(axis, 1)}
                  className="flex-1 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded border border-gray-200"
                >
                  +90°
                </button>
              </div>
            </div>
          ))}

          <div className="text-[10px] text-gray-500 mt-2 leading-tight">
            가구가 눕혀져서 임포트된 경우 이 버튼으로 바로세우면 시뮬레이션에 즉시 반영됩니다.
          </div>
        </div>

        <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-200 pt-2 text-center">
          마우스 드래그로 카메라 회전
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

        <color attach="background" args={['#ffffff']} />
        
        {/* Soft, studio-like lighting */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#f0f0ff" />
        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={1} />

        {/* Light theme floor grid */}
        <Grid
          position={[0.3, 0, 0.25]}
          args={[10, 10]}
          cellSize={0.2}
          cellThickness={0.5}
          cellColor="#e5e7eb"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#d1d5db"
          fadeDistance={15}
          fadeStrength={1.5}
          infiniteGrid
        />

        {/* 지지영역 (고정) */}
        <SupportPolygonMesh />

        {/* 무게중심, 힘 */}
        <COMMarker />
        <ForceVector />

        {/* 가구 메시 */}
        <FurnitureMesh />

        {/* 모델과 함께 회전하는 오버레이 */}
        <TippingEdgeLine />
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
