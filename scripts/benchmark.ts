import { runLengthDecode } from '../runLengthDecode'
import { runLengthEncode } from '../runLengthEncode'
import benchmark from '@stdlib/bench'

const input_32LEN_32_VAL: number[] = new Array(10)
for (let i = 0; i < input_32LEN_32_VAL.length; i++) {
  input_32LEN_32_VAL[i] = Math.floor(Math.random() * Math.pow(2, 31) - 1)
}

function runEncode(input: number[]) {
  return runLengthEncode(input)
}

runLengthEncode([1000, 30000, 30000])

// benchmark('encode', a => {
//   a.tic()
//   let lastOutput = new Uint8Array(0)
//   for (let i = 0; i < a.iterations; i++) {
//     lastOutput = runEncode(input_32LEN_32_VAL)
//   }
//   a.toc()

//   if (lastOutput.length === input_32LEN_32_VAL.length) {
//     a.pass('Length is same')
//   }
// })
