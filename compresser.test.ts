import { compressSerie } from './compresser'
import { InputNumberSerie } from './types'
import { decompressSerie } from './decompresser'

test('compresses unique int serie', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    name: '',
    values: [1, 2, 3, 4, 6, 5, 7, 8, 9, 10, 12, 11, 14, 19, 20, 21, 22],
  }
  const compressed = compressSerie(serie)
  const decompressed = decompressSerie(compressed)

  expect(decompressed.stats).toEqual({
    headerSize: 9,
    flags: 1,
    count: 17,
    unique: 17,
    maxDecimals: 0,
    min: 1,
    max: 22,
  })

  expect(decompressed.values).toEqual(serie.values)
})

test('compresses low cardinality int serie', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    name: 'A',
    values: [
      1300, 1400, 1300, 1300, 1300, 1400, 1400, 1400, 1300, 1300, 1300, 1300,
      1400, 1400, 1400,
    ],
  }
  debugger
  const compressed = compressSerie(serie)
  const decompressed = decompressSerie(compressed)

  expect(decompressed.values).toEqual(serie.values)
})
