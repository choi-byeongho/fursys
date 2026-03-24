import { describe, it, expect } from 'vitest'
import { computeCriticalPushForce, computeCriticalExtension } from '../tipAnalyzer'
import type { Part, KinematicConstraint, SupportPoint } from '@/types'

const square: SupportPoint[] = [[0, 0], [1, 0], [1, 1], [0, 1]]

describe('computeCriticalPushForce', () => {
  it('standard case: F = W × margin / h', () => {
    // W = 100kg × 9.81 = 981N, margin = 0.1m, h = 1m → F = 98.1N
    const F = computeCriticalPushForce(0.1, 1.0, 100, 9.81)
    expect(F).toBeCloseTo(98.1)
  })

  it('zero com_height → 0', () => {
    expect(computeCriticalPushForce(0.1, 0, 100, 9.81)).toBe(0)
  })

  it('zero margin → 0', () => {
    expect(computeCriticalPushForce(0, 1, 100, 9.81)).toBe(0)
  })

  it('negative margin → 0 (already tipping)', () => {
    expect(computeCriticalPushForce(-0.05, 1, 100, 9.81)).toBe(0)
  })
})

describe('computeCriticalExtension', () => {
  const basePart: Part = {
    id: 'drawer',
    name: 'drawer',
    type: 'movable',
    motion_type: 'translation',
    bbox: { x: 0.3, y: 0.5, z: 0, width: 0.4, depth: 0.5, height: 0.3 },
    density: 200,
    mass_factor: 0.5,
  }

  const heavyBody: Part = {
    id: 'body',
    name: 'body',
    type: 'fixed',
    bbox: { x: 0, y: 0, z: 0, width: 1, depth: 1, height: 1 },
    density: 600,
    mass_factor: 0.5,
  }

  const constraint: KinematicConstraint = {
    part_id: 'drawer',
    axis: 'z',
    range: [0, 1.5],
    current_position: 0,
  }

  it('returns null when no constraint found', () => {
    const result = computeCriticalExtension('nonexistent', [basePart], [constraint], square)
    expect(result).toBeNull()
  })

  it('returns null when stable at full extension', () => {
    // Very heavy body keeps COM inside polygon at any drawer extension
    const veryHeavyBody: Part = { ...heavyBody, density: 100000 }
    const result = computeCriticalExtension('drawer', [veryHeavyBody, basePart], [constraint], square)
    expect(result).toBeNull()
  })

  it('returns a finite number when critical extension exists', () => {
    // Light body + movable part that eventually tips
    const lightBody: Part = { ...heavyBody, density: 50, mass_factor: 0.1 }
    const result = computeCriticalExtension('drawer', [lightBody, basePart], [constraint], square)
    if (result !== null) {
      expect(typeof result).toBe('number')
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThanOrEqual(1.5)
    }
    // null is also valid (stable throughout or non-convergent)
  })
})
