import {
  TRANSFORM_DELTA,
  TRANSFORM_DELTA_DELTA,
  TRANSFORM_RLE,
} from './runLengthEncodeBitMap'
import { calculateStats } from './calculateStats'
import { runLengthEncode } from './runLengthEncode'
import {
  AnyInputSerie,
  InputNumberSerie,
  InputStringSerie,
  TransformType,
} from './types'
import { deltaEncode } from './deltaEncode'

export function compressSerie(serie: AnyInputSerie): Uint8Array {
  switch (serie.type) {
    case 'number':
      return compressNumberSerie(serie)
    case 'string':
      return compressStringSerie(serie)
  }
}

function findSmallest(values: number[]) {
  const deltaValues = deltaEncode(values)
  const deltaRle = runLengthEncode(deltaValues)

  const delta2Values = deltaEncode(deltaValues)
  const delta2Rle = runLengthEncode(delta2Values)

  const rle = runLengthEncode(values)

  if (delta2Rle.length < deltaRle.length && delta2Rle.length < rle.length) {
    return {
      data: delta2Rle,
      transforms: TRANSFORM_DELTA | TRANSFORM_DELTA_DELTA | TRANSFORM_RLE,
    }
  }

  if (deltaRle.length < rle.length) {
    return {
      data: deltaRle,
      transforms: TRANSFORM_DELTA | TRANSFORM_RLE,
    }
  }

  return {
    data: rle,
    transforms: TRANSFORM_RLE,
  }
}

function compressNumberSerie(serie: InputNumberSerie): Uint8Array {
  const stats = calculateStats(serie.values)

  const valueOffset = stats.p50 > 1 ? Math.floor(stats.p50) : 0
  let offseted = serie.values
  if (valueOffset > 0) {
    offseted = serie.values.map(f => f - valueOffset)
  }

  const smallest = findSmallest(offseted)

  const headerData = runLengthEncode([
    smallest.transforms,
    valueOffset,
    stats.count,
    stats.unique,
    stats.maxDecimals,
    stats.min,
    stats.p02,
    stats.p05,
    stats.p50,
    stats.p95,
    stats.p98,
    stats.max,
  ])

  const final = new Uint8Array(4 + 1 + headerData.length + smallest.data.length)
  final[0] = 78 // N
  final[1] = 117 // u
  final[2] = 116 // t
  final[3] = 49 // 1
  final[4] = headerData.length
  final.set(headerData, 1 + 4)
  final.set(smallest.data, 1 + 4 + headerData.length)

  return final
}

export const transformTypes: ReadonlyArray<TransformType> = [
  'delta',
  'rle',
  'dictionary',
]

function compressStringSerie(_serie: InputStringSerie): Uint8Array {
  throw new Error('Function not implemented.')
}
