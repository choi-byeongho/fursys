import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { FurnitureMesh } from './FurnitureMesh'
import { SupportPolygonMesh } from './SupportPolygonMesh'
import { COMMarker } from './COMMarker'
import { TippingEdgeLine } from './TippingEdgeLine'
import { ForceVector } from './ForceVector'
import { TippingAnimation } from './TippingAnimation'

export function Viewer3D() {
  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [1.5, 2.0, 2.5], fov: 45 }}
        shadows
      >
        <color attach="background" args={['#1a1a2e']} />

        {/* 조명 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-2, 3, -2]} intensity={0.4} />

        {/* 환경 */}
        <Environment preset="city" />
        <Grid
          position={[0, 0, 0]}
          args={[4, 4]}
          cellSize={0.1}
          cellThickness={0.5}
          cellColor="#444466"
          sectionSize={0.5}
          sectionThickness={1}
          sectionColor="#6666aa"
          fadeDistance={6}
          fadeStrength={1}
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
