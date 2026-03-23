import type { BBox, Vector3D } from '@/types'

export function bboxVolume(bbox: BBox): number {
  return bbox.width * bbox.depth * bbox.height
}

export function bboxCentroid(bbox: BBox): Vector3D {
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    z: bbox.z + bbox.depth / 2,
  }
}

export function vec3Add(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function vec3Scale(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
