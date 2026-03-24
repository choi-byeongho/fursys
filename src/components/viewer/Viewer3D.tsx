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
  const adjusted = useRef(false)

  useEffect(() => {
    const bbox = furniture.geometry.bbox
    const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
    const distance = maxDim * 1.5

    camera.position.set(distance * 0.6, distance * 0.8, distance * 0.6)
    camera.lookAt(bbox.width / 2, bbox.height / 2, bbox.depth / 2)

    adjusted.current = true
  }, [furniture, camera])

  return null
}

export function Viewer3D() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#111827', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [1.5, 2.0, 2.5], fov: 45 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraAdjuster />
        <color attach="background" args={['#111827']} />

        {/* 조명 — CDN 없이 수동 설정 */}
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

        {/* 가구 */}
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
