import { useGeometryStore } from '@/store/geometryStore'
import { defaultGeometry } from '@/data/defaultGeometry'

export function JsonEditorTab() {
  const jsonString = useGeometryStore((s) => s.jsonString)
  const jsonError = useGeometryStore((s) => s.jsonError)
  const setJsonString = useGeometryStore((s) => s.setJsonString)
  const applyJsonString = useGeometryStore((s) => s.applyJsonString)
  const setFurniture = useGeometryStore((s) => s.setFurniture)

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex gap-2">
        <button
          onClick={applyJsonString}
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-semibold transition-colors"
        >
          적용
        </button>
        <button
          onClick={() => setFurniture(defaultGeometry)}
          className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded font-semibold transition-colors"
        >
          초기화
        </button>
      </div>

      {jsonError && (
        <div className="text-xs text-red-400 bg-red-950/40 rounded px-2 py-1">
          {jsonError}
        </div>
      )}

      <textarea
        value={jsonString}
        onChange={(e) => setJsonString(e.target.value)}
        className="flex-1 bg-gray-950 text-gray-300 text-xs font-mono p-2 rounded border border-gray-700 resize-none focus:outline-none focus:border-blue-500 min-h-[300px]"
        spellCheck={false}
      />
    </div>
  )
}
