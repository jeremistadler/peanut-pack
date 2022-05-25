import { runLengthDecode } from './runLengthDecode'
import {
  AnyDecompressedSerie,
  DecompressedNumberSerie,
  DecompressedStringSerie,
} from './types'
import { TRANSFORM_STRING } from './runLengthEncodeBitMap'
import { readHeader, Header } from './Header'

export function decompressSerie(serie: Uint8Array): AnyDecompressedSerie {
  const header = readHeader(serie)

  if (header.flags & TRANSFORM_STRING) return decompressStringSerie(serie)
  else return decompressNumberSerie(serie, header)
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