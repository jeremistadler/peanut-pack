import { runLengthDecodeGenerator } from './runLengthDecodeGenerator'
import { Header, readHeader } from './Header'
import { TRANSFORM_STRING } from './runLengthEncodeBitMap'

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
  header: Header
): Generator<number, void, void> {
  let values = runLengthDecodeGenerator(
    serie,
    header.headerSize + 1,
    serie.length
  )

  for (const value of values) {
    yield value + header.valueOffset
  }
}

function* decompressStringSerie(
  serie: Uint8Array
): Generator<string, void, void> {
  throw new Error('Function not implemented.')
}
