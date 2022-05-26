export type InputNumberSerie = {
  type: 'number'
  values: number[]
}
export type InputStringSerie = {
  type: 'string'
  values: string[]
}

export type AnyInputSerie = InputNumberSerie | InputStringSerie

export type AnyDecompressedSerie =
  | DecompressedNumberSerie
  | DecompressedStringSerie

export type DecompressedNumberSerie = {
  type: 'number'
  values: number[]
  stats: {
    count: number
    unique: number
    maxDecimals: number
    min: number
    max: number
    p02: number
    p05: number
    p50: number
    p95: number
    p98: number
  }
}
export type DecompressedStringSerie = {
  type: 'string'
  values: string[]
  stats: {
    count: number
    unique: number
    maxDecimals: number
    min: number
    max: number
  }
}

export type TransformType = 'delta' | 'dictionary' | 'rle'
