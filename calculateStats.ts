import { calcNumberPrecision } from './calcNumberPrecision'

export function calculateStats(values: number[]) {
  const unique = new Set(values).size
  let min = values[0]
  let max = values[0]
  let maxDecimals = 0

  for (let i = 0; i < values.length; i++) {
    const element = values[i]
    min = Math.min(min, element)
    max = Math.max(max, element)
    maxDecimals = Math.max(maxDecimals, calcNumberPrecision(element))
  }

  return {
    unique,
    min,
    max,
    count: values.length,
    maxDecimals,
  }
}
