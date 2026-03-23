export function fmtMeters(v: number, digits = 3): string {
  return `${v.toFixed(digits)} m`
}

export function fmtNewtons(v: number, digits = 1): string {
  return `${v.toFixed(digits)} N`
}

export function fmtDegrees(v: number, digits = 1): string {
  return `${v.toFixed(digits)}°`
}

export function fmtKg(v: number, digits = 2): string {
  return `${v.toFixed(digits)} kg`
}
