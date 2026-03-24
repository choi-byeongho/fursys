import { describe, it, expect } from 'vitest'
import { computePartMass, computePartCentroid, computeWeightedCOM } from '../comCalculator'
import type { Part, KinematicConstraint } from '@/types'

const fixedPart = (overrides: Partial<Part> = {}): Part => ({
  id: 'body',
  name: 'body',
  type: 'fixed',
  bbox: { x: 0, y: 0, z: 0, width: 1, depth: 0.5, height: 2 },
  density: 600,
  mass_factor: 0.5,
  ...overrides,
})

describe('computePartMass', () => {
  it('volume × density × factor', () => {
    const part = fixedPart()
    // volume = 1 × 0.5 × 2 = 1
    // mass = 1 × 600 × 0.5 = 300
    expect(computePartMass(part)).toBeCloseTo(300)
  })

  it('zero mass_factor → 0', () => {
    expect(computePartMass(fixedPart({ mass_factor: 0 }))).toBe(0)
  })
})

describe('computePartCentroid', () => {
  it('fixed part returns bbox center', () => {
    const part = fixedPart()
    const c = computePartCentroid(part, [])
    expect(c.x).toBeCloseTo(0.5)
    expect(c.y).toBeCloseTo(1)
    expect(c.z).toBeCloseTo(0.25)
  })

  it('translation movable shifts centroid along axis', () => {
    const part: Part = {
      ...fixedPart(),
      type: 'movable',
      motion_type: 'translation',
    }
    const k: KinematicConstraint = {
      part_id: 'body',
      axis: 'z',
      range: [0, 0.4],
      current_position: 0.3,
    }
    const c = computePartCentroid(part, [k])
    expect(c.z).toBeCloseTo(0.25 + 0.3)
  })

  it('rotation movable rotates centroid around pivot', () => {
    const part: Part = {
      ...fixedPart({ bbox: { x: 0, y: 0, z: 0, width: 0.4, depth: 0.02, height: 2 } }),
      type: 'movable',
      motion_type: 'rotation',
    }
    const k: KinematicConstraint = {
      part_id: 'body',
      axis: 'y',
      range: [0, 90],
      current_position: 90,
    }
    const c = computePartCentroid(part, [k])
    // 90° rotation: relX=0.2, relZ=0.01 → rotX=0.01*(-1)≈-0.01, rotZ=0.2
    // pivotX=0, pivotZ=0 → x≈-0.01, z≈0.2
    expect(c.z).toBeCloseTo(0.2, 1)
  })
})

describe('computeWeightedCOM', () => {
  it('single symmetric part: COM at center', () => {
    const part = fixedPart()
    const { com, total_mass } = computeWeightedCOM([part], [])
    expect(com.x).toBeCloseTo(0.5)
    expect(com.y).toBeCloseTo(1)
    expect(com.z).toBeCloseTo(0.25)
    expect(total_mass).toBeCloseTo(300)
  })

  it('two equal parts at x=0 and x=1: COM x midpoint', () => {
    const p1 = fixedPart({ id: 'p1', bbox: { x: 0, y: 0, z: 0, width: 0.5, depth: 0.5, height: 0.5 } })
    const p2 = fixedPart({ id: 'p2', bbox: { x: 1, y: 0, z: 0, width: 0.5, depth: 0.5, height: 0.5 } })
    const { com } = computeWeightedCOM([p1, p2], [])
    // p1 centroid x=0.25, p2 centroid x=1.25, equal mass → average = 0.75
    expect(com.x).toBeCloseTo(0.75)
  })

  it('zero mass parts: returns origin', () => {
    const part = fixedPart({ mass_factor: 0 })
    const { com, total_mass } = computeWeightedCOM([part], [])
    expect(total_mass).toBe(0)
    expect(com.x).toBe(0)
  })
})
