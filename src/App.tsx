import { Suspense, useRef } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { Viewer3D } from '@/components/viewer/Viewer3D'
import { useSolver } from '@/hooks/useSolver'
import { useGeometryStore } from '@/store/geometryStore'
import { parseStepBBox } from '@/utils/stepParser'
import { parseSTL } from '@/utils/stlParser'

function AppShell() {
  useSolver() // 스토어 변경 시 자동 계산
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadFromStep = useGeometryStore((s) => s.loadFromStep)
  const loadFromSTL = useGeometryStore((s) => s.loadFromSTL)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (!file) return

    try {
      if (file.name.endsWith('.stl') || file.name.endsWith('.STL')) {
        // STL 파일
        const mesh = await parseSTL(file)
        if (mesh) {
          loadFromSTL(mesh, file.name)
          const w = (mesh.bounds.maxX - mesh.bounds.minX).toFixed(2)
          const h = (mesh.bounds.maxY - mesh.bounds.minY).toFixed(2)
          const d = (mesh.bounds.maxZ - mesh.bounds.minZ).toFixed(2)
          alert(`✓ STL 로드 성공\n${mesh.vertices.length}개 점, ${mesh.faces.length}개 면\n치수: ${w}m × ${h}m × ${d}m`)
        } else {
          alert('✗ STL 파일을 파싱할 수 없습니다.')
        }
      } else {
        // STEP 파일
        const text = await file.text()
        const bbox = parseStepBBox(text)
        if (bbox) {
          loadFromStep(text, file.name)
          alert(`✓ STEP 로드 성공: ${bbox.pointCount}개 꼭짓점\n치수: ${bbox.width.toFixed(2)}m × ${bbox.height.toFixed(2)}m × ${bbox.depth.toFixed(2)}m`)
        } else {
          alert('✗ STEP 파일에서 꼭짓점을 찾을 수 없습니다.')
        }
      }
    } catch (err) {
      alert(`✗ 파일 읽기 실패: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
    }
    e.currentTarget.value = ''
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900/90 border-b border-gray-700 flex items-center px-4 gap-3 z-10">
        <span className="text-sm font-bold text-blue-400">가구 전도 프리체크</span>
        <span className="text-xs text-gray-500">Furniture Tipping Simulator</span>
        <div className="flex-1" />
        <input
          ref={fileInputRef}
          type="file"
          accept=".stp,.step,.stl,.STL"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded border border-blue-500 transition-colors"
        >
          STP 업로드
        </button>
      </div>

      {/* 메인 레이아웃 */}
      <div className="flex w-full pt-10 h-full">
        {/* 왼쪽: 편집기 */}
        <div className="w-72 flex-shrink-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* 중앙: 3D 뷰어 */}
        <div className="flex-1 min-w-0 p-2">
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-900 rounded-lg">
              3D 뷰어 로딩 중...
            </div>
          }>
            <Viewer3D />
          </Suspense>
        </div>

        {/* 오른쪽: 시나리오 + 결과 */}
        <div className="w-72 flex-shrink-0 overflow-hidden">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
