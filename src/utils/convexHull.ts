export function computeConvexHull(points: [number, number][]): [number, number][] {
  if (points.length <= 3) return points

  // Remove duplicates to speed up sorting and hull construction
  const uniqueKeys = new Set<string>()
  const uniquePoints: [number, number][] = []
  
  // We can round coordinates slightly to merge very close vertices
  for (const p of points) {
    const key = `${p[0].toFixed(3)},${p[1].toFixed(3)}`
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key)
      uniquePoints.push(p)
    }
  }

  if (uniquePoints.length <= 3) return uniquePoints

  const sorted = uniquePoints.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]))

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

  const lower: [number, number][] = []
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop()
    }
    lower.push(p)
  }

  const upper: [number, number][] = []
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop()
    }
    upper.push(p)
  }

  lower.pop()
  upper.pop()
  
  const hull = lower.concat(upper)
  
  // Fallback if hull generation fails
  if (hull.length < 3) return uniquePoints.slice(0, 4)
  return hull
}

export function extractFootprint(vertices: [number, number, number][], globalW: number, globalD: number): [number, number][] {
  if (!vertices || vertices.length === 0) {
    return [
      [0, 0],
      [globalW, 0],
      [globalW, globalD],
      [0, globalD],
    ]
  }

  // Find minimum Y (ground level)
  let minY = Infinity
  for (const v of vertices) {
    if (v[1] < minY) minY = v[1]
  }

  // Collect points within 5cm of the ground
  const groundPoints: [number, number][] = []
  for (const v of vertices) {
    if (v[1] <= minY + 0.05) {
      groundPoints.push([v[0], v[2]]) // Map X and Z to a 2D plane
    }
  }

  if (groundPoints.length === 0) {
    return [
      [0, 0],
      [globalW, 0],
      [globalW, globalD],
      [0, globalD],
    ]
  }

  return computeConvexHull(groundPoints)
}
