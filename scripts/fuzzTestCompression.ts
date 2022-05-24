import perf from 'perf_hooks'
import { runLengthDecode } from '../runLengthDecode'
import { runLengthEncode } from '../runLengthEncode'
import { writeFileSync } from 'fs'
import { compressSerie } from '../compresser'
import { decompressSerie } from '../decompresser'

console.log('Starting fuzz test...')

let iter = 0
let lastNow = perf.performance.now()
const logInterval = 100

while (true) {
  iter++
  if (iter % logInterval === 0) {
    const diff = perf.performance.now() - lastNow
    console.log(
      iter,
      'iterations completed at avg',
      (diff / logInterval).toFixed(3),
      'ms per item'
    )

    lastNow = perf.performance.now()
  }

  const lengthgBit = Math.random()
  const length = Math.floor(
    lengthgBit > 0.5 ? Math.random() * 255 : Math.random() * 65535 * 2
  )
  const bellCenter =
    Math.random() > 0.5 ? (Math.random() - 0.5) * 30 : Math.random() * 1000
  const bellSize = Math.random() > 0.5 ? 20 : Math.random() * 1000

  const arr = Array.from({ length: length }, () =>
    Math.floor(randn_bm() * bellSize + bellCenter)
  )

  const encoded = compressSerie({ values: arr, type: 'number' })
  const decoded = decompressSerie(encoded).values as number[]

  if (!arrayEqual(arr, decoded)) {
    console.log('FAILED', { length, bellCenter, bellSize })

    writeFileSync('fuzzTestFail-original.txt', arr.join('\n'), 'ascii')
    writeFileSync('fuzzTestFail-encoded.txt', encoded.join('\n'), 'ascii')
    writeFileSync('fuzzTestFail-decoded.txt', decoded.join('\n'), 'ascii')

    process.exit(-1)
  }
}

function randn_bm() {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  return num
}

function arrayEqual(buf1: number[], buf2: number[]) {
  if (buf1 === buf2) {
    return true
  }

  if (buf1.length !== buf2.length) {
    return false
  }

  var i = buf1.length
  while (i--) {
    if (buf1[i] !== buf2[i]) {
      return false
    }
  }

  return true
}
