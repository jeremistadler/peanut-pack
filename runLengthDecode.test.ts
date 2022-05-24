import { runLengthDecode } from './runLengthDecode'
import { runLengthEncode } from './runLengthEncode'

test('run length encoder fixed case', () => {
  const input = [1, 1, 2, 2, 3, 4]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})

test('run length encoder 16 bit values', () => {
  const input = [1000, 30000, 30000]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})

test('encode corner case', () => {
  const input = [1, 15, 2, 0, 1300, 1400]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})

test('run length encoder repeating 16 bit values', () => {
  const input = [1300, 1300, 1400, 1400]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})

test('decode negative', () => {
  const input = [-1, -1000, -300000, -300000, -5, -500000]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)
  expect(output).toEqual(input)
})

test('run length encoder 32 bit values', () => {
  const input = [1000, 300000, 300000, 5, 500000]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)
  expect(output).toEqual(input)
})

test.skip('run length encoder fuzz', () => {
  const MAX_ITEMS = Math.pow(2, 32) - 1
  const STEP = Math.floor(MAX_ITEMS / 4)

  // for (let itemLength = 0; itemLength < MAX_ITEMS; itemLength += STEP) {
  //   const input: number[] = new Array(itemLength)

  //   for (let i = 0; i < itemLength; i++) {
  //     input[i] = Math.floor(Math.random() * Math.pow(2, 31) - 1)
  //   }
  //   console.log({ itemLength })
  //   const result = runLengthEncode(input)
  //   const output = runLengthDecode(result)

  //   expect(output).toEqual(input)
  //}
})
