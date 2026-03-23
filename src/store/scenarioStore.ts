import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ScenarioType } from '@/types'
import { SCENARIO_DEFINITIONS } from '@/data/scenarioDefinitions'

export type ScenarioParams = Record<string, number | string | boolean>

interface ScenarioState {
  activeType: ScenarioType
  params: ScenarioParams
  setScenario: (type: ScenarioType) => void
  setParam: (key: string, value: number | string | boolean) => void
}

export const useScenarioStore = create<ScenarioState>()(
  immer((set) => ({
    activeType: 'front_force',
    params: SCENARIO_DEFINITIONS[0].defaultParams,

    setScenario: (type) =>
      set((state) => {
        state.activeType = type
        const def = SCENARIO_DEFINITIONS.find((d) => d.id === type)
        state.params = def ? { ...def.defaultParams } : {}
      }),

    setParam: (key, value) =>
      set((state) => {
        state.params[key] = value
      }),
  }))
)
