import { useEffect, useRef } from 'react'
import { useGeometryStore } from '@/store/geometryStore'
import { useScenarioStore } from '@/store/scenarioStore'
import { useResultsStore } from '@/store/resultsStore'
import { runSolver } from '@/solver'

const DEBOUNCE_MS = 150

export function useSolver() {
  const furniture = useGeometryStore((s) => s.furniture)
  const activeType = useScenarioStore((s) => s.activeType)
  const params = useScenarioStore((s) => s.params)
  const setResult = useResultsStore((s) => s.setResult)
  const setCalculating = useResultsStore((s) => s.setCalculating)
  const setError = useResultsStore((s) => s.setError)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    setCalculating(true)

    timerRef.current = setTimeout(() => {
      try {
        const result = runSolver(furniture, activeType, params)
        setResult(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : '계산 오류')
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [furniture, activeType, params, setResult, setCalculating, setError])
}
