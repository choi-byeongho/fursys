import { Suspense } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { RightPanel } from '@/components/layout/RightPanel'
import { Viewer3D } from '@/components/viewer/Viewer3D'
import { useSolver } from '@/hooks/useSolver'

function AppShell() {
  useSolver() // 스토어 변경 시 자동 계산

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900/90 border-b border-gray-700 flex items-center px-4 gap-3 z-10">
        <span className="text-sm font-bold text-blue-400">가구 전도 프리체크</span>
        <span className="text-xs text-gray-500">Furniture Tipping Simulator</span>
        <div className="flex-1" />
        <button
          disabled
          title="추후 지원 예정"
          className="py-1 px-3 bg-gray-700 text-gray-500 text-xs rounded border border-gray-600 cursor-not-allowed"
        >
          STP 업로드 (준비 중)
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
