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

test('decode float', () => {
  const input = [Math.fround(1.3)]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})

test('decode double', () => {
  const input = [Math.fround(1.3) + 0.00000001]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output[0]).toBeCloseTo(input[0], 7)
})

test('decode doubles', () => {
  const input = [Math.fround(1.3), Math.fround(1.3), 1.3, 1.3, 1.5, 1.6]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output.length).toEqual(input.length)
  for (let i = 0; i < output.length; i++) {
    expect(output[i]).toBeCloseTo(input[i], 6)
  }
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

test.skip('decode floats', () => {
  const input = [1264.2779047286806]
  const result = runLengthEncode(input)
  const output = runLengthDecode(result, 0, result.length)

  expect(output).toEqual(input)
})
