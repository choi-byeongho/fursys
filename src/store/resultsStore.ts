import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { SolverResult } from '@/types'

interface ResultsState {
  result: SolverResult | null
  isCalculating: boolean
  error: string | null
  tippingPreview: boolean
  setResult: (r: SolverResult) => void
  setCalculating: (b: boolean) => void
  setError: (e: string | null) => void
  toggleTippingPreview: () => void
}

export const useResultsStore = create<ResultsState>()(
  immer((set) => ({
    result: null,
    isCalculating: false,
    error: null,
    tippingPreview: false,

    setResult: (r) =>
      set((state) => {
        state.result = r
        state.isCalculating = false
        state.error = null
      }),

    setCalculating: (b) =>
      set((state) => {
        state.isCalculating = b
      }),

    setError: (e) =>
      set((state) => {
        state.error = e
        state.isCalculating = false
      }),

    toggleTippingPreview: () =>
      set((state) => {
        state.tippingPreview = !state.tippingPreview
      }),
  }))
)
