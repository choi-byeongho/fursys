import { Suspense, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { Viewer3D } from '@/components/viewer/Viewer3D'
import { ViewerErrorBoundary } from '@/components/viewer/ViewerErrorBoundary'
import { useSolver } from '@/hooks/useSolver'
import { useGeometryStore } from '@/store/geometryStore'
import { parseStepBBox } from '@/utils/stepParser'
import { parseSTL } from '@/utils/stlParser'

function AppShell() {
  useSolver() // 스토어 변경 시 자동 계산
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadFromStep = useGeometryStore((s) => s.loadFromStep)
  const loadFromSTL = useGeometryStore((s) => s.loadFromSTL)
  const undo = useGeometryStore((s) => s.undo)
  const redo = useGeometryStore((s) => s.redo)
  const canUndo = useGeometryStore((s) => s.canUndo)
  const canRedo = useGeometryStore((s) => s.canRedo)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

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
          loadFromStep(bbox, file.name)
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
    <div className="flex h-screen bg-[#f5f5f7] text-[#1d1d1f] overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white/70 backdrop-blur-md border-b border-gray-200 flex items-center px-6 gap-4 z-50">
        <span className="text-[15px] font-semibold text-black tracking-tight tracking-wider">가구 전도 프리체크</span>
        <span className="text-[13px] text-gray-400 font-medium">Furniture Tipping Simulator</span>
        <div className="flex-1" />
        <div className="flex gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="실행 취소 (Ctrl+Z)"
            className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 text-xs font-semibold rounded-full transition-colors"
          >
            ↩ 실행 취소
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="다시 실행 (Ctrl+Y)"
            className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 text-xs font-semibold rounded-full transition-colors"
          >
            ↪ 다시 실행
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".stp,.step,.stl,.STL"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="py-1.5 px-4 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-full shadow-md transition-colors"
        >
          STP/STL 업로드
        </button>
      </div>

      {/* 메인 레이아웃 */}
      <div className="flex w-full pt-14 h-full">
        {/* 왼쪽: 편집기 */}
        <div className="w-72 flex-shrink-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* 중앙: 3D 뷰어 */}
        <div className="flex-1 min-w-0 p-3">
          <ViewerErrorBoundary>
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-white rounded-xl shadow-sm">
                3D 뷰어 로딩 중...
              </div>
            }>
              <Viewer3D />
            </Suspense>
          </ViewerErrorBoundary>
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
