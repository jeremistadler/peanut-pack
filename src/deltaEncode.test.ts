import { deltaDecode } from './deltaDecode'
import { deltaEncode } from './deltaEncode'

test('delta encode', () => {
  const values = [1, 2, 3, 4]
  const deltaEncoded = deltaEncode(values)
  expect(deltaEncoded).toEqual([1, 1, 1, 1])
})

test('delta encode and decode', () => {
  const values = [1, 2, 3, 4]
  const deltaEncoded = deltaEncode(values)
  const deltaDecoded = deltaDecode(deltaEncoded)

  expect(deltaDecoded).toEqual(values)
})

test('delta encode and decode empty', () => {
  const values: number[] = []
  const deltaEncoded = deltaEncode(values)
  const deltaDecoded = deltaDecode(deltaEncoded)

  expect(deltaEncoded).toEqual(values)
  expect(deltaDecoded).toEqual(values)
})
