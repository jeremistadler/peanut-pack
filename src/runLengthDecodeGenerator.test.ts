import { runLengthEncode } from './runLengthEncode'
import { runLengthDecodeGenerator } from './runLengthDecodeGenerator'

test('encode corner case', () => {
  const input = [1, 15, 2, 0, 1300, 1400]
  const result = runLengthEncode(input)
  const output = Array.from(runLengthDecodeGenerator(result, 0, result.length))

  expect(output).toEqual(input)
})
