import { useThree } from '@react-three/fiber'
import { useGeometryStore } from '@/store/geometryStore'

export function ViewControls() {
  const { camera } = useThree()
  const bbox = useGeometryStore((s) => s.furniture.geometry.bbox)

  const centerX = bbox.width / 2
  const centerY = bbox.height / 2
  const centerZ = bbox.depth / 2
  const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
  const distance = maxDim * 1.8

  const setView = (name: string) => {
    const positions: Record<string, [number, number, number]> = {
      front: [centerX, centerY, centerZ + distance],
      back: [centerX, centerY, centerZ - distance],
      left: [centerX - distance, centerY, centerZ],
      right: [centerX + distance, centerY, centerZ],
      top: [centerX, centerY + distance, centerZ],
      iso: [centerX + distance * 0.6, centerY + distance * 0.7, centerZ + distance * 0.6],
    }

    const pos = positions[name] || positions.iso
    camera.position.set(...pos)
    camera.lookAt(centerX, centerY, centerZ)
  }

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-2 bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg border border-gray-700">
      <div className="text-xs font-semibold text-gray-300 mb-2">뷰 선택</div>
      <div className="grid grid-cols-2 gap-2">
        {['front', 'back', 'left', 'right', 'top', 'iso'].map((view) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded border border-gray-600 hover:border-gray-500 transition-colors"
          >
            {
              {
                front: '정면',
                back: '후면',
                left: '좌측',
                right: '우측',
                top: '상단',
                iso: '입체',
              }[view]
            }
          </button>
        ))}
      </div>
      <button
        onClick={() => setView('iso')}
        className="px-3 py-1.5 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded border border-blue-500 transition-colors mt-2"
      >
        리셋
      </button>
      <div className="text-xs text-gray-500 mt-2 border-t border-gray-700 pt-2">
        마우스 드래그: 회전
        <br />
        스크롤: 줌
      </div>
    </div>
  )
}
