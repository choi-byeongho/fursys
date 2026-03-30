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
      {/* 카메라 컨트롤 패널 — 우하단 */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2.5 bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/80 shadow-lg p-3" style={{ minWidth: 168 }}>
        {/* 뷰 프리셋 */}
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5">Camera View</div>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'front', label: 'Front' },
              { id: 'back',  label: 'Back' },
              { id: 'left',  label: 'Left' },
              { id: 'right', label: 'Right' },
              { id: 'top',   label: 'Top' },
              { id: 'iso',   label: 'ISO' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => viewRef.current(id)}
                className="h-7 text-[10px] font-semibold bg-white/70 hover:bg-white text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 shadow-sm transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* 물리 회전 */}
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5">Rotate Model</div>
          <div className="flex flex-col gap-1">
            {(['x','y','z'] as const).map((axis) => (
              <div key={axis} className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-gray-400 w-3">{axis}</span>
                <button onClick={() => rotateGeometry(axis, -1)}
                  className="flex-1 h-6 text-[10px] font-semibold bg-white/70 hover:bg-white text-gray-500 rounded-md border border-gray-200 shadow-sm transition-all">
                  −90°
                </button>
                <button onClick={() => rotateGeometry(axis, 1)}
                  className="flex-1 h-6 text-[10px] font-semibold bg-white/70 hover:bg-white text-gray-500 rounded-md border border-gray-200 shadow-sm transition-all">
                  +90°
                </button>
              </div>
            ))}
          </div>
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
