/**
 * STL 파일 파서
 * Binary STL과 ASCII STL 모두 지원
 */

export interface STLGeometry {
  vertices: number[][] // [x, y, z][]
  faces: number[][]    // [v0, v1, v2][]
  bounds: {
    minX: number; maxX: number
    minY: number; maxY: number
    minZ: number; maxZ: number
  }
}

/**
 * Binary STL 파서
 */
function parseBinarySTL(arrayBuffer: ArrayBuffer): STLGeometry | null {
  const view = new DataView(arrayBuffer)
  if (view.byteLength < 84) return null

  // 헤더 80바이트 스킵
  const triangles = view.getUint32(80, true)
  let offset = 84

  const vertices: number[][] = []
  const vertexMap = new Map<string, number>()
  const faces: number[][] = []

  for (let i = 0; i < triangles; i++) {
    // 법선 벡터 (12바이트) 스킵
    offset += 12

    const v0: number[] = []
    const v1: number[] = []
    const v2: number[] = []

    for (let j = 0; j < 3; j++) {
      v0.push(view.getFloat32(offset, true))
      offset += 4
    }
    for (let j = 0; j < 3; j++) {
      v1.push(view.getFloat32(offset, true))
      offset += 4
    }
    for (let j = 0; j < 3; j++) {
      v2.push(view.getFloat32(offset, true))
      offset += 4
    }

    // 속성 바이트 (2바이트) 스킵
    offset += 2

    // 중복 제거
    const getVertexIndex = (v: number[]): number => {
      const key = v.map((x) => x.toFixed(6)).join(',')
      if (vertexMap.has(key)) {
        return vertexMap.get(key)!
      }
      const idx = vertices.length
      vertices.push(v)
      vertexMap.set(key, idx)
      return idx
    }

    faces.push([getVertexIndex(v0), getVertexIndex(v1), getVertexIndex(v2)])
  }

  return computeBounds(vertices, faces)
}

/**
 * ASCII STL 파서
 */
function parseASCIISTL(text: string): STLGeometry | null {
  const vertices: number[][] = []
  const vertexMap = new Map<string, number>()
  const faces: number[][] = []

  // "vertex x y z" 패턴 추출
  const vertexPattern = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/gi
  let match: RegExpExecArray | null
  let vertexBuffer: number[] = []

  while ((match = vertexPattern.exec(text)) !== null) {
    const v = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]
    vertexBuffer.push(vertices.length)
    vertices.push(v)
  }

  // 세 개씩 묶어서 facet 생성
  for (let i = 0; i < vertexBuffer.length; i += 3) {
    if (i + 2 < vertexBuffer.length) {
      faces.push([vertexBuffer[i], vertexBuffer[i + 1], vertexBuffer[i + 2]])
    }
  }

  return vertices.length > 0 ? computeBounds(vertices, faces) : null
}

/**
 * 바운드박스 계산
 */
function computeBounds(
  vertices: number[][],
  faces: number[][]
): STLGeometry {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (const v of vertices) {
    minX = Math.min(minX, v[0])
    maxX = Math.max(maxX, v[0])
    minY = Math.min(minY, v[1])
    maxY = Math.max(maxY, v[1])
    minZ = Math.min(minZ, v[2])
    maxZ = Math.max(maxZ, v[2])
  }

  return { vertices, faces, bounds: { minX, maxX, minY, maxY, minZ, maxZ } }
}

/**
 * STL 파일(Blob 또는 ArrayBuffer) 파싱
 */
export async function parseSTL(file: File): Promise<STLGeometry | null> {
  const arrayBuffer = await file.arrayBuffer()
  const text = await file.text()

  // Binary STL 시도
  try {
    const result = parseBinarySTL(arrayBuffer)
    if (result && result.vertices.length > 0) {
      return result
    }
  } catch {
    // 계속
  }

  // ASCII STL 시도
  try {
    const result = parseASCIISTL(text)
    if (result && result.vertices.length > 0) {
      return result
    }
  } catch {
    // 계속
  }

  return null
}
