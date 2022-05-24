import { IndexableArray } from './IndexableArray'

export function dictionaryEncodeNumbers(values: IndexableArray): Uint8Array {
  const map = new Map<number, number>()
  const dictionary: number[] = []
  const result: number[] = []

  for (let i = 0; i < values.length; i++) {
    const element = values[i]
    const dictionaryIndex = map.get(element)

    if (typeof dictionaryIndex === 'number') {
      result.push(dictionaryIndex)
    } else {
      result.push(map.size)
      map.set(element, map.size)
      dictionary.push(element)
    }
  }

  const dictionaryBitSize =
    dictionary.length > 65535 ? 4 : dictionary.length > 255 ? 2 : 1
  let valueBitSize = 1

  for (let i = 0; i <= dictionary.length; i++) {
    if (dictionary[i] >= 127 || dictionary[i] <= -127) {
      valueBitSize = 2

      if (dictionary[i] >= 32768 || dictionary[i] <= -32768) {
        valueBitSize = 4
        break
      }
    }
  }

  const buff = Buffer.alloc(
    dictionaryBitSize * dictionary.length + valueBitSize * result.length + 4 + 4
  )

  buff.writeUint32LE(dictionary.length, 0)
  buff.writeUint32LE(result.length, 4)

  if (valueBitSize === 1) {
    for (let i = 0; i < dictionary.length; i++) {
      buff.writeInt8(dictionary[i], i + 8)
    }
  } else if (valueBitSize === 2) {
    for (let i = 0; i < dictionary.length; i++) {
      buff.writeInt16LE(dictionary[i], i * 2 + 8)
    }
  } else if (valueBitSize === 4) {
    for (let i = 0; i < dictionary.length; i++) {
      buff.writeInt32LE(dictionary[i], i * 4 + 8)
    }
  }

  const valueOffset = dictionaryBitSize * dictionary.length + 8

  if (dictionaryBitSize === 1) {
    for (let i = 0; i < result.length; i++) {
      buff.writeUint8(result[i], i + valueOffset)
    }
  } else if (dictionaryBitSize === 2) {
    for (let i = 0; i < result.length; i++) {
      buff.writeUint16LE(result[i], i * 2 + valueOffset)
    }
  } else if (dictionaryBitSize === 4) {
    for (let i = 0; i < result.length; i++) {
      buff.writeUint32LE(result[i], i * 4 + valueOffset)
    }
  }

  return new Uint8Array(buff.buffer, buff.byteOffset, buff.length)
}
