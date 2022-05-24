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

  let values = serie.values
  if (stats.min > 0) {
    values = serie.values.map(f => f - stats.min)
  }

  const compressedValues = runLengthEncode(values)

  const headerData = runLengthEncode([
    TRANSFORM_RLE,
    stats.count,
    stats.unique,
    stats.maxDecimals,
    stats.min,
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
