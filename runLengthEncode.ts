import { IndexableArray } from './IndexableArray'
import {
  IS_UNIQUE_RANGE,
  IS_ONE_ITEM_RANGE,
  IS_TWO_ITEM_RANGE,
  IS_32_BIT_VALUES,
  IS_16_BIT_VALUES,
  IS_32_BIT_LENGTH,
  IS_16_BIT_LENGTH,
} from './runLengthEncodeBitMap'

export function runLengthEncode(values: IndexableArray): Uint8Array {
  const buff = Buffer.alloc(values.length * 5)
  let offset = 0

  if (values.length === 0) return new Uint8Array(0)
  // if (values.length === 1) return [1, values[0]]

  const appendSingleItems = (
    startIndex: number,
    endIndexInclusive: number,
    bitSize: 1 | 2 | 4
  ) => {
    const itemCount = endIndexInclusive - startIndex + 1
    let sizeBit = itemCount >= 65536 ? 4 : itemCount >= 255 ? 2 : 1
    let flags = IS_UNIQUE_RANGE

    if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE
    if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE
    if (bitSize === 4) flags |= IS_32_BIT_VALUES
    if (bitSize === 2) flags |= IS_16_BIT_VALUES
    if (sizeBit === 4) flags |= IS_32_BIT_LENGTH
    if (sizeBit === 2) flags |= IS_16_BIT_LENGTH

    buff.writeUint8(flags, offset)
    offset++

    if (itemCount > 2) {
      if (sizeBit === 1) {
        buff.writeUInt8(itemCount, offset)
        offset += 1
      }
      if (sizeBit === 2) {
        buff.writeUInt16LE(itemCount, offset)
        offset += 2
      }
      if (sizeBit === 4) {
        buff.writeUInt32LE(itemCount, offset)
        offset += 4
      }
    }

    if (bitSize === 1) {
      for (let i = startIndex; i <= endIndexInclusive; i++) {
        buff.writeInt8(values[i], offset)
        offset += 1
      }
    }
    if (bitSize === 2) {
      for (let i = startIndex; i <= endIndexInclusive; i++) {
        buff.writeInt16LE(values[i], offset)
        offset += 2
      }
    }
    if (bitSize === 4) {
      for (let i = startIndex; i <= endIndexInclusive; i++) {
        buff.writeInt32LE(values[i], offset)
        offset += 4
      }
    }
  }

  const appendRepeatedItems = (value: number, itemCount: number) => {
    const bitSize = calculateSignedBitSize(value)
    const sizeBit = calculateUnsignedBitSize(itemCount)
    let flags = 0

    if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE
    if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE
    if (bitSize === 4) flags |= IS_32_BIT_VALUES
    if (bitSize === 2) flags |= IS_16_BIT_VALUES
    if (sizeBit === 4) flags |= IS_32_BIT_LENGTH
    if (sizeBit === 2) flags |= IS_16_BIT_LENGTH

    buff.writeUint8(flags, offset)
    offset++

    if (itemCount > 2) {
      if (sizeBit === 1) {
        buff.writeUInt8(itemCount, offset)
        offset += 1
      }
      if (sizeBit === 2) {
        buff.writeUInt16LE(itemCount, offset)
        offset += 2
      }
      if (sizeBit === 4) {
        buff.writeUInt32LE(itemCount, offset)
        offset += 4
      }
    }

    if (bitSize === 1) {
      buff.writeInt8(value, offset)
      offset += 1
    }
    if (bitSize === 2) {
      buff.writeInt16LE(value, offset)
      offset += 2
    }
    if (bitSize === 4) {
      buff.writeInt32LE(value, offset)
      offset += 4
    }
  }

  for (let i = 0; i < values.length; i++) {
    const value = values[i]
    const bitSize = calculateSignedBitSize(value)

    if (i === values.length - 1) {
      appendSingleItems(i, i, bitSize)
      break
    }

    const isNextSame = values[i + 1] === value

    if (isNextSame) {
      const rangeStartIndex = i
      while (i < values.length && values[i + 1] === value) i++
      appendRepeatedItems(value, i - rangeStartIndex + 1)
    } else {
      const rangeStartIndex = i
      while (
        i < values.length &&
        values[i + 1] !== value &&
        calculateSignedBitSize(values[i + 1]) === bitSize
      )
        i++
      appendSingleItems(rangeStartIndex, i, bitSize)
    }
  }

  return new Uint8Array(buff.buffer, buff.byteOffset, offset)
}

function calculateSignedBitSize(value: number): 1 | 2 | 4 {
  if (value >= -127 && value <= 127) return 1
  if (value >= -32767 && value <= 32767) return 2
  return 4
}

function calculateUnsignedBitSize(value: number): 1 | 2 | 4 {
  if (value <= 255) return 1
  if (value <= 65536) return 2
  return 4
}
