import { TRANSFORM_RLE } from './runLengthEncodeBitMap'
import { calculateStats } from './calculateStats'
import { runLengthEncode } from './runLengthEncode'
import {
  AnyInputSerie,
  InputNumberSerie,
  InputStringSerie,
  TransformType,
} from './types'

export function compressSerie(serie: AnyInputSerie): Uint8Array {
  switch (serie.type) {
    case 'number':
      return compressNumberSerie(serie)
    case 'string':
      return compressStringSerie(serie)
  }
}

function compressNumberSerie(serie: InputNumberSerie): Uint8Array {
  const stats = calculateStats(serie.values)

  const valueOffset = stats.p50 > 1 ? Math.floor(stats.p50) : 0
  let values = serie.values
  if (valueOffset > 0) {
    values = serie.values.map(f => f - valueOffset)
  }

  const compressedValues = runLengthEncode(values)

  const headerData = runLengthEncode([
    TRANSFORM_RLE,
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

  const final = new Uint8Array(headerData.length + 1 + compressedValues.length)
  final[0] = headerData.length
  final.set(headerData, 1)
  final.set(compressedValues, 1 + headerData.length)

  return final
}

export const transformTypes: ReadonlyArray<TransformType> = [
  'delta',
  'rle',
  'dictionary',
]

function compressStringSerie(serie: InputStringSerie): Uint8Array {
  throw new Error('Function not implemented.')
}
