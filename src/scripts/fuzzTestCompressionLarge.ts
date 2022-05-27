import perf from 'perf_hooks'
import { writeFileSync } from 'fs'
import { compressSerie, decompressSerie } from '..'
import { decompressStreaming } from '../decompressStreaming'

console.log('Starting fuzz test...')

let iter = 0
let lastNow = perf.performance.now()
const logInterval = 3

while (true) {
  iter++
  if (iter % logInterval === 0) {
    const diff = perf.performance.now() - lastNow
    console.log(
      iter,
      'iterations completed at avg',
      (diff / logInterval).toFixed(3),
      'ms per item',
    )

    lastNow = perf.performance.now()
  }

  const length = 300
  const arr = Array.from({ length: length }, () =>
    Math.floor(Math.random() * 10000),
  )

  const encoded = compressSerie({ values: arr, type: 'number' })
  const decoded = decompressSerie(encoded).values as number[]
  const decodedStreaming = Array.from(
    decompressStreaming(encoded).values as any,
  ) as number[]

  if (!arrayEqual(arr, decoded) || !arrayEqual(arr, decodedStreaming)) {
    console.log('FAILED')

    writeFileSync(
      'fuzzTestFail-original.txt',
      arr.map(f => f.toString()).join('\n'),
      'ascii',
    )
    writeFileSync(
      'fuzzTestFail-encoded.txt',
      Array.from(encoded)
        .map(f => f.toString())
        .join('\n'),
      'ascii',
    )
    writeFileSync(
      'fuzzTestFail-decodedStreaming.txt',
      Array.from(decodedStreaming)
        .map(f => f.toString())
        .join('\n'),
      'ascii',
    )
    writeFileSync(
      'fuzzTestFail-decoded.txt',
      decoded.map(f => f.toString()).join('\n'),
      'ascii',
    )

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
    console.log('expected length:', buf1.length)
    console.log('  actual length:', buf2.length)
    console.log('    diff length:', Math.abs(buf1.length - buf2.length))
    return false
  }

  var i = buf1.length
  while (i--) {
    if (Math.abs(buf1[i] - buf2[i]) > 0.001) {
      console.log('   index:', i)
      console.log('expected:', buf1[i])
      console.log('  actual:', buf2[i])
      console.log('    diff:', Math.abs(buf1[i] - buf2[i]))
      return false
    }
  }

  return true
}
