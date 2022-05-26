import { runLengthDecode } from './runLengthDecode'

export type Header = ReturnType<typeof readHeader>
export function readHeader(rawData: Uint8Array) {
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
