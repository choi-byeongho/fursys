import type { FurnitureGeometry } from '@/types'
import { extractFootprint } from './convexHull'

export function rotateFurnitureGeometry(
  furniture: FurnitureGeometry,
  axis: 'x' | 'y' | 'z',
  direction: 1 | -1
): FurnitureGeometry {
  const rotatedParts = furniture.parts.map((part) => {
    // calculate the 8 corners of the part's bbox
    const corners = [
      [part.bbox.x, part.bbox.y, part.bbox.z],
      [part.bbox.x + part.bbox.width, part.bbox.y, part.bbox.z],
      [part.bbox.x, part.bbox.y + part.bbox.height, part.bbox.z],
      [part.bbox.x + part.bbox.width, part.bbox.y + part.bbox.height, part.bbox.z],
      [part.bbox.x, part.bbox.y, part.bbox.z + part.bbox.depth],
      [part.bbox.x + part.bbox.width, part.bbox.y, part.bbox.z + part.bbox.depth],
      [part.bbox.x, part.bbox.y + part.bbox.height, part.bbox.z + part.bbox.depth],
      [part.bbox.x + part.bbox.width, part.bbox.y + part.bbox.height, part.bbox.z + part.bbox.depth],
    ]

    const rotCorners = corners.map(([cx, cy, cz]) => {
      let nx = cx, ny = cy, nz = cz
      if (axis === 'x') {
        ny = direction > 0 ? -cz : cz
        nz = direction > 0 ? cy : -cy
      } else if (axis === 'y') {
        nx = direction > 0 ? cz : -cz
        nz = direction > 0 ? -cx : cx
      } else if (axis === 'z') {
        nx = direction > 0 ? -cy : cy
        ny = direction > 0 ? cx : -cx
      }
      return [nx, ny, nz]
    })

    const minX = Math.min(...rotCorners.map((c) => c[0]))
    const maxX = Math.max(...rotCorners.map((c) => c[0]))
    const minY = Math.min(...rotCorners.map((c) => c[1]))
    const maxY = Math.max(...rotCorners.map((c) => c[1]))
    const minZ = Math.min(...rotCorners.map((c) => c[2]))
    const maxZ = Math.max(...rotCorners.map((c) => c[2]))

    const width = maxX - minX
    const height = maxY - minY
    const depth = maxZ - minZ

    return {
      ...part,
      bbox: { x: minX, y: minY, z: minZ, width, height, depth },
    }
  })

  // Re-align all parts to positive space [0,0,0]
  const globalMinX = Math.min(...rotatedParts.map((p) => p.bbox.x))
  const globalMinY = Math.min(...rotatedParts.map((p) => p.bbox.y))
  const globalMinZ = Math.min(...rotatedParts.map((p) => p.bbox.z))

  const finalParts = rotatedParts.map((p) => ({
    ...p,
    bbox: {
      ...p.bbox,
      x: p.bbox.x - globalMinX,
      y: p.bbox.y - globalMinY,
      z: p.bbox.z - globalMinZ,
    },
  }))

  const globalW = Math.max(...finalParts.map((p) => p.bbox.x + p.bbox.width))
  const globalH = Math.max(...finalParts.map((p) => p.bbox.y + p.bbox.height))
  const globalD = Math.max(...finalParts.map((p) => p.bbox.z + p.bbox.depth))

  // Handle Mesh if present
  let newMesh = furniture.mesh
  let points: [number, number][] = [
    [0.02, 0.02],
    [globalW - 0.02, 0.02],
    [globalW - 0.02, globalD - 0.02],
    [0.02, globalD - 0.02],
  ]

  if (newMesh) {
    const rotVertices = newMesh.vertices.map(([cx, cy, cz]) => {
      let nx = cx, ny = cy, nz = cz
      if (axis === 'x') {
        ny = direction > 0 ? -cz : cz
        nz = direction > 0 ? cy : -cy
      } else if (axis === 'y') {
        nx = direction > 0 ? cz : -cz
        nz = direction > 0 ? -cx : cx
      } else if (axis === 'z') {
        nx = direction > 0 ? -cy : cy
        ny = direction > 0 ? cx : -cx
      }
      return [nx - globalMinX, ny - globalMinY, nz - globalMinZ] as [number, number, number]
    })
    newMesh = { ...newMesh, vertices: rotVertices }
    points = extractFootprint(rotVertices, globalW, globalD)
  }

  return {
    ...furniture,
    geometry: { bbox: { width: globalW, height: globalH, depth: globalD } },
    support_polygon: { points },
    parts: finalParts,
    mesh: newMesh,
  }
}
