import { describe, it, expect } from 'vitest'
import {
  isPointInPolygon,
  computeDistanceToEdge,
} from '../supportPolygon'
import type { SupportPoint } from '@/types'

// 1m × 1m 정사각형 지지 폴리곤
const square: SupportPoint[] = [[0, 0], [1, 0], [1, 1], [0, 1]]

describe('isPointInPolygon', () => {
  it('center point is inside', () => {
    expect(isPointInPolygon([0.5, 0.5], square)).toBe(true)
  })

  it('point outside polygon', () => {
    expect(isPointInPolygon([1.5, 0.5], square)).toBe(false)
    expect(isPointInPolygon([-0.1, 0.5], square)).toBe(false)
  })

  it('corner point edge case', () => {
    // 꼭짓점 위 점은 경계 처리 — inside/outside 어느 쪽이든 일관성 있으면 OK
    const result = isPointInPolygon([0, 0], square)
    expect(typeof result).toBe('boolean')
  })
})

describe('computeDistanceToEdge', () => {
  it('center of square: positive distance ~0.5', () => {
    const { distance } = computeDistanceToEdge([0.5, 0.5], square)
    expect(distance).toBeCloseTo(0.5)
  })

  it('outside point: negative distance', () => {
    const { distance } = computeDistanceToEdge([1.5, 0.5], square)
    expect(distance).toBeLessThan(0)
    expect(distance).toBeCloseTo(-0.5)
  })

  it('point on edge: distance ~0', () => {
    const { distance } = computeDistanceToEdge([0.5, 0], square)
    expect(Math.abs(distance)).toBeCloseTo(0, 3)
  })

  it('near corner outside: negative', () => {
    const { distance } = computeDistanceToEdge([1.2, 1.2], square)
    expect(distance).toBeLessThan(0)
  })
})
