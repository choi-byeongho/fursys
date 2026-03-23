import { useState } from 'react'
import { PartsEditorTab } from '@/components/editor/PartsEditorTab'
import { JsonEditorTab } from '@/components/editor/JsonEditorTab'

type Tab = 'parts' | 'json'

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('parts')

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700">
      {/* 탭 헤더 */}
      <div className="flex border-b border-gray-700">
        {(['parts', 'json'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'parts' ? '부품 편집기' : 'JSON 편집기'}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'parts' && <PartsEditorTab />}
        {activeTab === 'json' && <JsonEditorTab />}
      </div>
    </div>
  )
}
