import { useState } from 'react'
import { PartsEditorTab } from '@/components/editor/PartsEditorTab'
import { JsonEditorTab } from '@/components/editor/JsonEditorTab'

type Tab = 'parts' | 'json'

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('parts')

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 탭 헤더 */}
      <div className="flex items-center gap-1 px-4 pt-4 pb-2">
        {(['parts', 'json'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            style={
              activeTab === tab
                ? { background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600 }
                : { color: 'var(--text-secondary)', background: 'transparent' }
            }
          >
            {tab === 'parts' ? '부품 편집' : 'JSON'}
          </button>
        ))}
      </div>

      <div className="w-full h-px bg-gray-100" />

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'parts' && <PartsEditorTab />}
        {activeTab === 'json' && <JsonEditorTab />}
      </div>
    </div>
  )
}
