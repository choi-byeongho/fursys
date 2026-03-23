/**
 * 간이 STEP 파일 파서
 *
 * 실제 CAD 솔버가 아닌 설계 검토용 도구이므로,
 * STEP 파일에서 꼭짓점(CARTESIAN_POINT) 좌표를 추출해
 * 전체 bounding box만 계산한다.
 *
 * 지원 형식: ISO 10303-21 (ASCII STEP)
 */

export interface StepBBox {
  minX: number; maxX: number
  minY: number; maxY: number
  minZ: number; maxZ: number
  width: number   // X 방향
  height: number  // Y 방향 (수직)
  depth: number   // Z 방향
  centerX: number
  centerY: number
  centerZ: number
  pointCount: number
}

/**
 * STEP 파일 텍스트에서 모든 CARTESIAN_POINT를 추출하고 bbox를 반환한다.
 */
export function parseStepBBox(text: string): StepBBox | null {
  // 패턴: CARTESIAN_POINT ( '...' , ( x , y , z ) )
  // 또는:  CARTESIAN_POINT('...', (x, y, z))
  const pattern = /CARTESIAN_POINT\s*\([^,]*,\s*\(\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*,\s*([-\d.eE+]+)\s*\)/gi

  let match: RegExpExecArray | null
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity
  let count = 0

  while ((match = pattern.exec(text)) !== null) {
    const x = parseFloat(match[1])
    const y = parseFloat(match[2])
    const z = parseFloat(match[3])

    if (isNaN(x) || isNaN(y) || isNaN(z)) continue

    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
    count++
  }

  if (count < 4) return null

  // STEP 단위는 보통 mm → m 변환 (1000 이상이면 mm로 판단)
  const rawWidth  = maxX - minX
  const rawHeight = maxY - minY
  const rawDepth  = maxZ - minZ
  const maxDim = Math.max(rawWidth, rawHeight, rawDepth)

  const scale = maxDim > 10 ? 0.001 : 1 // mm → m

  const width  = rawWidth  * scale
  const height = rawHeight * scale
  const depth  = rawDepth  * scale

  // 높이 방향 자동 감지 (가장 긴 축이 height일 가능성이 높음)
  // STEP 좌표계는 다양하지만 여기서는 Y를 수직으로 가정
  return {
    minX: minX * scale, maxX: maxX * scale,
    minY: minY * scale, maxY: maxY * scale,
    minZ: minZ * scale, maxZ: maxZ * scale,
    width,
    height,
    depth,
    centerX: ((minX + maxX) / 2) * scale,
    centerY: ((minY + maxY) / 2) * scale,
    centerZ: ((minZ + maxZ) / 2) * scale,
    pointCount: count,
  }
}
