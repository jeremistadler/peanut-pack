import { runLengthDecode } from './runLengthDecode'
import {
  AnyDecompressedSerie,
  DecompressedNumberSerie,
  DecompressedStringSerie,
} from './types'
import { TRANSFORM_STRING } from './runLengthEncodeBitMap'

export function decompressSerie(serie: Uint8Array): AnyDecompressedSerie {
  const header = readHeader(serie)

  if (header.flags & TRANSFORM_STRING) return decompressStringSerie(serie)
  else return decompressNumberSerie(serie, header)
}

type Header = ReturnType<typeof readHeader>
function readHeader(rawData: Uint8Array) {
  const headerSize = rawData[0]
  const [
    flags,
    valueOffset,
    count,
    unique,
    maxDecimals,
    min,
    p02,
    p05,
    p50,
    p95,
    p98,
    max,
  ] = runLengthDecode(rawData, 1, headerSize + 1)

  return {
    valueOffset,
    headerSize,
    flags,
    count,
    unique,
    maxDecimals,
    min,
    max,
    p02,
    p05,
    p50,
    p95,
    p98,
  }
}

function decompressNumberSerie(
  serie: Uint8Array,
  header: Header
): DecompressedNumberSerie {
  let values = runLengthDecode(serie, header.headerSize + 1, serie.length)

  if (header.valueOffset !== 0) {
    for (let i = 0; i < values.length; i++) {
      values[i] = values[i] + header.valueOffset
    }
  }

  return {
    type: 'number',
    values,
    stats: header,
  }
}

function decompressStringSerie(serie: Uint8Array): DecompressedStringSerie {
  throw new Error('Function not implemented.')
}
