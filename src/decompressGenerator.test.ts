import { compressSerie } from './compresser'
import { InputNumberSerie } from './types'
import { decompressSerieGenerator } from './decompressGenerator'

test('decompress unique', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    values: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  }
  const result = compressSerie(serie)
  const outputEnumerable = decompressSerieGenerator(result).values

  expect(Array.from(outputEnumerable as any)).toEqual(serie.values)
})
