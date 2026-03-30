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
  useSolver()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadFromStep = useGeometryStore((s) => s.loadFromStep)
  const loadFromSTL = useGeometryStore((s) => s.loadFromSTL)
  const undo = useGeometryStore((s) => s.undo)
  const redo = useGeometryStore((s) => s.redo)
  const canUndo = useGeometryStore((s) => s.canUndo)
  const canRedo = useGeometryStore((s) => s.canRedo)
  const hasModel = useGeometryStore((s) => s.hasModel)

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
      if (file.name.toLowerCase().endsWith('.stl')) {
        const mesh = await parseSTL(file)
        if (mesh) {
          loadFromSTL(mesh, file.name)
          const w = (mesh.bounds.maxX - mesh.bounds.minX).toFixed(2)
          const h = (mesh.bounds.maxY - mesh.bounds.minY).toFixed(2)
          const d = (mesh.bounds.maxZ - mesh.bounds.minZ).toFixed(2)
          alert(`✓ STL 로드 성공\n${mesh.vertices.length}개 점, ${mesh.faces.length}개 면\n${w}m × ${h}m × ${d}m`)
        } else {
          alert('✗ STL 파일을 파싱할 수 없습니다.')
        }
      } else {
        const text = await file.text()
        const bbox = parseStepBBox(text)
        if (bbox) {
          loadFromStep(bbox, file.name)
          alert(`✓ STEP 로드 성공: ${bbox.pointCount}개 꼭짓점\n${bbox.width.toFixed(2)}m × ${bbox.height.toFixed(2)}m × ${bbox.depth.toFixed(2)}m`)
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
    <div className="flex h-screen w-screen overflow-hidden text-slate-800" style={{ background: 'var(--bg-app)' }}>
      {/* 백그라운드 효과 (레퍼런스의 은은한 그래디언트) */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

      {/* 왼쪽 사이드바 - 고급스러운 카드 형태 */}
      <div className="w-80 h-full p-4 flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3" style={{ background: 'var(--accent)' }}>
            <span className="text-white text-xs font-black tracking-tighter">SIM</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black uppercase tracking-widest text-[#2d3436]">Lab-04</span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">Stability Test Unit</span>
          </div>
        </div>
        
        <div className="flex-1 glass-panel rounded-[32px] overflow-hidden border border-white/40 shadow-xl">
          <Sidebar />
        </div>

        {/* 하단 유틸리티 버튼 */}
        <div className="flex gap-2 h-12">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className="flex-1 glass-panel rounded-2xl flex items-center justify-center hover:bg-white/40 transition-all disabled:opacity-20"
          >
            <span className="text-lg">↺</span>
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className="flex-1 glass-panel rounded-2xl flex items-center justify-center hover:bg-white/40 transition-all disabled:opacity-20"
          >
            <span className="text-lg">↻</span>
          </button>
        </div>
      </div>

      {/* 메인 뷰포트 - 플로팅 컨테이너 */}
      <div className="flex-1 h-full py-4 pr-4 flex flex-col gap-4 relative z-10">
        <div className="flex-1 relative flex flex-col">
          {/* 상단 툴바 (헤더 대체) */}
          <div className="absolute top-4 left-4 right-4 h-14 glass-panel rounded-2xl z-40 px-6 flex items-center justify-between border border-white/30">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Environment: 01-Default</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-center gap-3">
              <input ref={fileInputRef} type="file" accept=".stp,.step,.stl,.STL" onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-5 text-[11px] font-black uppercase tracking-wider rounded-xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent)' }}
              >
                + Load Project
              </button>
            </div>
          </div>

          {/* 3D 뷰어 컨테이너 */}
          <div className="flex-1 glass-panel rounded-[40px] overflow-hidden border border-white/50 shadow-2xl relative">
            {hasModel ? (
              <ViewerErrorBoundary>
                <Suspense fallback={
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                    <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-gray-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Initialising Renderer...</span>
                  </div>
                }>
                  <Viewer3D />
                </Suspense>
              </ViewerErrorBoundary>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-8 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-[32px] bg-white/50 shadow-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                    ↑
                  </div>
                  <div className="absolute -inset-4 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-[#2d3436] mb-1">Upload Laboratory Data</p>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">Supported formats: STEP / STL / STP</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 결과 패널 - 가로형 레이아웃 시도 */}
        <div className="h-72 w-full flex gap-4">
           <div className="flex-1 glass-panel rounded-[32px] overflow-hidden border border-white/40 shadow-xl">
             <RightPanel />
           </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
