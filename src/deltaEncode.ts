import { IndexableArray } from './IndexableArray'

export function deltaEncode(values: IndexableArray) {
  const result: number[] = []
  let lastValue = 0
  for (let i = 0; i < values.length; i++) {
    const element = values[i]
    const delta = element - lastValue
    lastValue = element
    result.push(delta)
  }

  return result
}
