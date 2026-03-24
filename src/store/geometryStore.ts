import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { FurnitureGeometry, Part, KinematicConstraint } from '@/types'
import { defaultGeometry } from '@/data/defaultGeometry'
import { validateFurnitureGeometry } from '@/utils/validate'
import { rotateFurnitureGeometry } from '@/utils/rotateGeometry'
import { extractFootprint } from '@/utils/convexHull'
import { computeMeshProperties } from '@/utils/meshAnalysis'

const MAX_HISTORY = 20

interface GeometryState {
  furniture: FurnitureGeometry
  jsonString: string
  jsonError: string | null
  stepFileName: string | null
  meshLoaded: boolean
  _past: FurnitureGeometry[]
  _future: FurnitureGeometry[]
  canUndo: boolean
  canRedo: boolean
  setFurniture: (f: FurnitureGeometry) => void
  setJsonString: (s: string) => void
  applyJsonString: () => void
  updatePart: (id: string, patch: Partial<Part>) => void
  updateKinematics: (part_id: string, position: number) => void
  updateHingeOffset: (part_id: string, offset: number) => void
  loadFromStep: (bbox: { width: number; height: number; depth: number }, fileName: string) => void
  loadFromSTL: (mesh: { vertices: number[][]; faces: number[][] }, fileName: string) => void
  rotateGeometry: (axis: 'x' | 'y' | 'z', dir: 1 | -1) => void
  undo: () => void
  redo: () => void
}

export const useGeometryStore = create<GeometryState>()(
  immer((set, get) => {
    /** 현재 furniture를 과거 스택에 저장하고 미래 스택을 비운다 */
    function pushHistory() {
      const { furniture, _past } = get()
      const newPast = [..._past, furniture].slice(-MAX_HISTORY)
      set((state) => {
        state._past = newPast as FurnitureGeometry[]
        state._future = []
        state.canUndo = true
        state.canRedo = false
      })
    }

    return {
      furniture: defaultGeometry,
      jsonString: JSON.stringify(defaultGeometry, null, 2),
      jsonError: null,
      stepFileName: null,
      meshLoaded: false,
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,

      setFurniture: (f) => {
        pushHistory()
        set((state) => {
          state.furniture = f
          state.jsonString = JSON.stringify(f, null, 2)
          state.jsonError = null
        })
      },

      setJsonString: (s) =>
        set((state) => {
          state.jsonString = s
        }),

      applyJsonString: () => {
        const { jsonString } = get()
        try {
          const parsed = JSON.parse(jsonString)
          const validation = validateFurnitureGeometry(parsed)
          if (!validation.valid) {
            set((state) => {
              state.jsonError = validation.errors.join('\n')
            })
            return
          }
          pushHistory()
          set((state) => {
            state.furniture = parsed as FurnitureGeometry
            state.jsonError = null
          })
        } catch (e) {
          set((state) => {
            state.jsonError = e instanceof Error ? e.message : 'JSON 파싱 오류'
          })
        }
      },

      updatePart: (id, patch) => {
        pushHistory()
        set((state) => {
          const idx = state.furniture.parts.findIndex((p: Part) => p.id === id)
          if (idx >= 0) {
            Object.assign(state.furniture.parts[idx], patch)
            state.jsonString = JSON.stringify(state.furniture, null, 2)
          }
        })
      },

      updateKinematics: (part_id, position) =>
        set((state) => {
          const k = state.furniture.kinematics.find(
            (k: KinematicConstraint) => k.part_id === part_id
          )
          if (k) {
            k.current_position = position
          }
        }),

      updateHingeOffset: (part_id, offset) => {
        pushHistory()
        set((state) => {
          const k = state.furniture.kinematics.find(
            (k: KinematicConstraint) => k.part_id === part_id
          )
          if (k) {
            k.hinge_offset = offset
            state.jsonString = JSON.stringify(state.furniture, null, 2)
          }
        })
      },

      undo: () => {
        const { _past, furniture, _future } = get()
        if (_past.length === 0) return
        const prev = _past[_past.length - 1]
        const newPast = _past.slice(0, -1)
        const newFuture = [furniture, ..._future].slice(0, MAX_HISTORY)
        set((state) => {
          state.furniture = prev
          state.jsonString = JSON.stringify(prev, null, 2)
          state.jsonError = null
          state._past = newPast as FurnitureGeometry[]
          state._future = newFuture as FurnitureGeometry[]
          state.canUndo = newPast.length > 0
          state.canRedo = true
        })
      },

      rotateGeometry: (axis, dir) => {
        pushHistory()
        set((state) => {
          const newF = rotateFurnitureGeometry(state.furniture, axis, dir)
          state.furniture = newF
          state.jsonString = JSON.stringify({ ...newF, mesh: undefined }, null, 2)
          state.jsonError = null
        })
      },

      redo: () => {
        const { _past, furniture, _future } = get()
        if (_future.length === 0) return
        const next = _future[0]
        const newFuture = _future.slice(1)
        const newPast = [..._past, furniture].slice(-MAX_HISTORY)
        set((state) => {
          state.furniture = next
          state.jsonString = JSON.stringify(next, null, 2)
          state.jsonError = null
          state._past = newPast as FurnitureGeometry[]
          state._future = newFuture as FurnitureGeometry[]
          state.canUndo = true
          state.canRedo = newFuture.length > 0
        })
      },

      loadFromStep: (bbox, fileName) => {
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
        pushHistory()
        set((state) => {
          state.furniture = newGeometry
          state.jsonString = JSON.stringify(newGeometry, null, 2)
          state.jsonError = null
          state.stepFileName = fileName
          state.meshLoaded = false
        })
      },

      loadFromSTL: (mesh, fileName) => {
        // 메시 바운드박스 계산 + 단위 자동 변환 (mm → m)
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

        // 단위 감지: 최대 치수가 10 이상이면 mm로 판단 → 0.001 스케일
        const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ)
        const scale = maxDim > 10 ? 0.001 : 1

        // 스케일 적용
        const scaledVertices = mesh.vertices.map(([x, y, z]) => [x * scale, y * scale, z * scale])
        minX *= scale
        maxX *= scale
        minY *= scale
        maxY *= scale
        minZ *= scale
        maxZ *= scale

        // Y축 오프셋: 바닥이 y=0이 되도록 정렬
        const yOffset = -minY
        const adjustedVertices = scaledVertices.map(([x, y, z]) => [x, y + yOffset, z])
        const newMaxY = maxY + yOffset
        minY = 0
        maxY = newMaxY

        // X-Z 오프셋: 최소값이 0이 되도록 정렬 (선택)
        const xOffset = -minX
        const zOffset = -minZ
        const finalVertices = adjustedVertices.map(([x, y, z]) => [x + xOffset, y, z + zOffset])
        minX = 0
        maxX = maxX + xOffset
        minZ = 0
        maxZ = maxZ + zOffset

        const width = maxX - minX || 1
        const height = maxY - minY || 1
        const depth = maxZ - minZ || 1

        const points = extractFootprint(finalVertices as [number, number, number][], width, depth)

        // Calculate exact mesh volume and centroid using Divergence Theorem
        const meshProps = computeMeshProperties(finalVertices as [number, number, number][], mesh.faces)

        const newGeometry: FurnitureGeometry = {
          geometry: { bbox: { width, depth, height } },
          support_polygon: {
            points,
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
              ...(meshProps 
                ? { volume: meshProps.volume, centroid: meshProps.centroid } 
                : {})
            },
          ],
          kinematics: [],
          loads: [],
          scenarios: [],
          solver_settings: { gravity: 9.81, safety_margin: 0.05 },
          mesh: { vertices: finalVertices, faces: mesh.faces },
        }
        pushHistory()
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
    }
  })
)
