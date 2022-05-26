import { runLengthDecodeGenerator } from './runLengthDecodeGenerator'
import { Header, readHeader } from './Header'
import {
  TRANSFORM_DELTA,
  TRANSFORM_DELTA_DELTA,
  TRANSFORM_STRING,
} from './runLengthEncodeBitMap'
import { deltaDecodeGenerator } from './deltaDecode'

export function decompressSerieGenerator(serie: Uint8Array) {
  const header = readHeader(serie)

  return {
    stats: header,
    values:
      header.flags & TRANSFORM_STRING
        ? decompressStringSerie(serie)
        : decompressNumberSerieGenerator(serie, header),
  }
}

function* decompressNumberSerieGenerator(
  serie: Uint8Array,
  header: Header,
): Generator<number, void, void> {
  let values = runLengthDecodeGenerator(
    serie,
    header.headerSize + 1,
    serie.length,
  )

  const delta1 =
    (header.flags & TRANSFORM_DELTA) === TRANSFORM_DELTA
      ? deltaDecodeGenerator()
      : null
  const delta2 =
    (header.flags & TRANSFORM_DELTA_DELTA) === TRANSFORM_DELTA_DELTA
      ? deltaDecodeGenerator()
      : null

  for (const value of values) {
    let val = value

    if (delta1 !== null) val = delta1(val)
    if (delta2 !== null) val = delta2(val)

    yield val + header.valueOffset
  }
}

function* decompressStringSerie(
  _serie: Uint8Array,
): Generator<string, void, void> {
  throw new Error('Function not implemented.')
}
