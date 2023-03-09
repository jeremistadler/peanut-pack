import { runLengthDecode } from './runLengthDecode'

export type Header = ReturnType<typeof readHeader>
export function readHeader(rawData: Uint8Array) {
  if (
    rawData[0] !== 78 || // N
    rawData[1] !== 117 || // u
    rawData[2] !== 116 || // t
    rawData[3] !== 49 // 1
  ) {
    throw new Error('Not a peanut file')
  }

  const headerSize = rawData[4]

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
  ] = runLengthDecode(rawData, 1 + 4, headerSize + 1 + 4)

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
