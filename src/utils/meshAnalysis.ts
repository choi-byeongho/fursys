export function computeMeshProperties(vertices: number[][], faces: number[][]) {
  let volume = 0
  let cx = 0, cy = 0, cz = 0

  for (const face of faces) {
    const v1 = vertices[face[0]]
    const v2 = vertices[face[1]]
    const v3 = vertices[face[2]]

    // 6 * signed volume of the tetrahedron from origin to the triangle
    const v321 =
      v1[0] * v2[1] * v3[2] +
      v2[0] * v3[1] * v1[2] +
      v3[0] * v1[1] * v2[2] -
      v1[0] * v3[1] * v2[2] -
      v2[0] * v1[1] * v3[2] -
      v3[0] * v2[1] * v1[2]

    volume += v321 / 6.0

    const weight = v321 / 24.0
    cx += (v1[0] + v2[0] + v3[0]) * weight
    cy += (v1[1] + v2[1] + v3[1]) * weight
    cz += (v1[2] + v2[2] + v3[2]) * weight
  }

  if (Math.abs(volume) < 1e-9) {
    return null
  }

  return {
    volume: Math.abs(volume),
    centroid: [cx / volume, cy / volume, cz / volume] as [number, number, number],
  }
}
