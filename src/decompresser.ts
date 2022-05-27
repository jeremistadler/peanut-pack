import { runLengthDecode } from './runLengthDecode'
import {
  AnyDecompressedSerie,
  DecompressedNumberSerie,
  DecompressedStringSerie,
} from './types'
import {
  TRANSFORM_DELTA,
  TRANSFORM_DELTA_DELTA,
  TRANSFORM_STRING,
} from './runLengthEncodeBitMap'
import { readHeader, Header } from './Header'
import { deltaDecode } from './deltaDecode'

export function decompressSerie(serie: Uint8Array): AnyDecompressedSerie {
  const header = readHeader(serie)

  if (header.flags & TRANSFORM_STRING) return decompressStringSerie(serie)
  else return decompressNumberSerie(serie, header)
}

export function decompressHeader(data: Uint8Array): Header {
  return readHeader(data)
}

function decompressNumberSerie(
  serie: Uint8Array,
  header: Header,
): DecompressedNumberSerie {
  let values = runLengthDecode(serie, header.headerSize + 1, serie.length)

  if ((header.flags & TRANSFORM_DELTA) === TRANSFORM_DELTA) {
    values = deltaDecode(values)
  }
  if ((header.flags & TRANSFORM_DELTA_DELTA) === TRANSFORM_DELTA_DELTA) {
    values = deltaDecode(values)
  }

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

function decompressStringSerie(_serie: Uint8Array): DecompressedStringSerie {
  throw new Error('Function not implemented.')
}
