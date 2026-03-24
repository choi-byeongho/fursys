import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { FurnitureGeometry, Part, KinematicConstraint } from '@/types'
import { defaultGeometry } from '@/data/defaultGeometry'
import { parseStepBBox } from '@/utils/stepParser'

interface GeometryState {
  furniture: FurnitureGeometry
  jsonString: string
  jsonError: string | null
  stepFileName: string | null
  meshLoaded: boolean
  setFurniture: (f: FurnitureGeometry) => void
  setJsonString: (s: string) => void
  applyJsonString: () => void
  updatePart: (id: string, patch: Partial<Part>) => void
  updateKinematics: (part_id: string, position: number) => void
  loadFromStep: (text: string, fileName: string) => string | null
  loadFromSTL: (mesh: { vertices: number[][]; faces: number[][] }, fileName: string) => void
}

export const useGeometryStore = create<GeometryState>()(
  immer((set, get) => ({
    furniture: defaultGeometry,
    jsonString: JSON.stringify(defaultGeometry, null, 2),
    jsonError: null,
    stepFileName: null,
    meshLoaded: false,

    setFurniture: (f) =>
      set((state) => {
        state.furniture = f
        state.jsonString = JSON.stringify(f, null, 2)
        state.jsonError = null
      }),

    setJsonString: (s) =>
      set((state) => {
        state.jsonString = s
      }),

    applyJsonString: () => {
      const { jsonString } = get()
      try {
        const parsed = JSON.parse(jsonString) as FurnitureGeometry
        set((state) => {
          state.furniture = parsed
          state.jsonError = null
        })
      } catch (e) {
        set((state) => {
          state.jsonError = e instanceof Error ? e.message : 'JSON 파싱 오류'
        })
      }
    },

    updatePart: (id, patch) =>
      set((state) => {
        const idx = state.furniture.parts.findIndex((p: Part) => p.id === id)
        if (idx >= 0) {
          Object.assign(state.furniture.parts[idx], patch)
          state.jsonString = JSON.stringify(state.furniture, null, 2)
        }
      }),

    updateKinematics: (part_id, position) =>
      set((state) => {
        const k = state.furniture.kinematics.find(
          (k: KinematicConstraint) => k.part_id === part_id
        )
        if (k) {
          k.current_position = position
        }
      }),

    loadFromStep: (text, fileName) => {
      const bbox = parseStepBBox(text)
      if (!bbox) {
        return 'STEP 파일에서 형상을 추출할 수 없습니다.'
      }
      const { width, height, depth } = bbox
      const newGeometry: FurnitureGeometry = {
        geometry: { bbox: { width, depth, height } },
        support_polygon: {
          points: [
            [0.02, 0.02],
            [width - 0.02, 0.02],
            [width - 0.02, depth - 0.02],
            [0.02, depth - 0.02],
          ],
        },
        parts: [
          {
            id: 'body',
            name: fileName.replace(/\.stp$|\.step$/i, ''),
            type: 'fixed',
            bbox: { x: 0, y: 0, z: 0, width, height, depth },
            mass_factor: 0.6,
            density: 600,
            color: '#a0856c',
          },
        ],
        kinematics: [],
        loads: [],
        scenarios: [],
        solver_settings: { gravity: 9.81, safety_margin: 0.05 },
      }
      set((state) => {
        state.furniture = newGeometry
        state.jsonString = JSON.stringify(newGeometry, null, 2)
        state.jsonError = null
        state.stepFileName = fileName
        state.meshLoaded = false
      })
      return null
    },

    loadFromSTL: (mesh, fileName) => {
      // 메시 바운드박스 계산
      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      let minZ = Infinity, maxZ = -Infinity
      for (const [x, y, z] of mesh.vertices) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
        minZ = Math.min(minZ, z)
        maxZ = Math.max(maxZ, z)
      }
      const width = maxX - minX || 1
      const height = maxY - minY || 1
      const depth = maxZ - minZ || 1

      const newGeometry: FurnitureGeometry = {
        geometry: { bbox: { width, depth, height } },
        support_polygon: {
          points: [
            [minX, minZ],
            [maxX, minZ],
            [maxX, maxZ],
            [minX, maxZ],
          ],
        },
        parts: [
          {
            id: 'body',
            name: fileName.replace(/\.stl$/i, ''),
            type: 'fixed',
            bbox: { x: minX, y: minY, z: minZ, width, height, depth },
            mass_factor: 0.6,
            density: 600,
            color: '#a0856c',
          },
        ],
        kinematics: [],
        loads: [],
        scenarios: [],
        solver_settings: { gravity: 9.81, safety_margin: 0.05 },
        mesh,
      }
      set((state) => {
        state.furniture = newGeometry
        state.jsonString = JSON.stringify(
          { ...newGeometry, mesh: undefined },
          null,
          2
        )
        state.jsonError = null
        state.stepFileName = fileName
        state.meshLoaded = true
      })
    },
  }))
)
