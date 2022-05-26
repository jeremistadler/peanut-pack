import { IndexableArray } from './IndexableArray'
import {
  IS_REPEATED_RANGE,
  IS_ONE_ITEM_RANGE,
  IS_TWO_ITEM_RANGE,
  IS_32_BIT_VALUES,
  IS_16_BIT_VALUES,
  IS_32_BIT_ITEM_RANGE,
  IS_16_BIT_ITEM_RANGE,
  IS_8_BIT_ITEM_RANGE,
  IS_32_BIT_FLOAT,
  IS_64_BIT_FLOAT,
  IS_8_BIT_VALUES,
} from './runLengthEncodeBitMap'

function appendSingleItems(
  values: IndexableArray,
  startIndex: number,
  endIndexInclusive: number,
  valueSize: 162 | 226 | 0 | 32 | 96,
): Buffer {
  const itemCount = endIndexInclusive - startIndex + 1
  let countBitSize = 0 // itemCount >= 65536 ? 4 : itemCount >= 255 ? 2 : 1

  let flags = valueSize
  if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE
  else if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE
  else if (itemCount < 256) {
    flags |= IS_8_BIT_ITEM_RANGE
    countBitSize = 1
  } else if (itemCount < 65536) {
    flags |= IS_16_BIT_ITEM_RANGE
    countBitSize = 2
  } else {
    flags |= IS_32_BIT_ITEM_RANGE
    countBitSize = 4
  }

  const buff = Buffer.allocUnsafe(
    countBitSize + valueSizeToBitSize(valueSize) * itemCount + 1,
  )
  buff.writeUint8(flags, 0)

  if (countBitSize === 1) buff.writeUInt8(itemCount, 1)
  else if (countBitSize === 2) buff.writeUInt16LE(itemCount, 1)
  else if (countBitSize === 4) buff.writeUInt32LE(itemCount, 1)

  let offset = 1 + countBitSize

  if (valueSize === IS_8_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt8(values[i], offset)
      offset += 1
    }
  } else if (valueSize === IS_16_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt16LE(values[i], offset)
      offset += 2
    }
  } else if (valueSize === IS_32_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt32LE(values[i], offset)
      offset += 4
    }
  } else if (valueSize === IS_32_BIT_FLOAT) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeFloatLE(values[i], offset)
      offset += 4
    }
  } else if (valueSize === IS_64_BIT_FLOAT) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeDoubleLE(values[i], offset)
      offset += 8
    }
  } else {
    throw new Error(
      'Unsupported flags in appendSingleItems ' + flags.toString(2),
    )
  }
  return buff
}

function appendRepeatedItems(value: number, itemCount: number) {
  const valueSize = calculateValueSizeFlag(value)
  const sizeBit = calculateUnsignedBitSize(itemCount)

  let flags = valueSize | IS_REPEATED_RANGE
  if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE
  else if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE
  else if (sizeBit === 1) flags |= IS_8_BIT_ITEM_RANGE
  else if (sizeBit === 2) flags |= IS_16_BIT_ITEM_RANGE
  else if (sizeBit === 4) flags |= IS_32_BIT_ITEM_RANGE

  const buff = Buffer.allocUnsafe(sizeBit + valueSizeToBitSize(valueSize) + 1)
  buff.writeUint8(flags)
  let offset = 1 + sizeBit

  if (sizeBit === 1) buff.writeUInt8(itemCount, 1)
  else if (sizeBit === 2) buff.writeUInt16LE(itemCount, 1)
  else if (sizeBit === 4) buff.writeUInt32LE(itemCount, 1)

  if (valueSize === IS_8_BIT_VALUES) {
    buff.writeInt8(value, offset)
    offset += 1
  } else if (valueSize === IS_16_BIT_VALUES) {
    buff.writeInt16LE(value, offset)
    offset += 2
  } else if (valueSize === IS_32_BIT_VALUES) {
    buff.writeInt32LE(value, offset)
    offset += 4
  } else if (valueSize === IS_32_BIT_FLOAT) {
    buff.writeFloatLE(value, offset)
    offset += 4
  } else if (valueSize === IS_64_BIT_FLOAT) {
    buff.writeFloatLE(value, offset)
    offset += 8
  } else {
    throw new Error(
      'Unsupported flags in appendRepeatedItems ' + flags.toString(2),
    )
  }
  return buff
}

export function runLengthEncode(values: IndexableArray): Uint8Array {
  const buffers: Buffer[] = []

  if (values.length === 0) return new Uint8Array(0)
  // if (values.length === 1) return [1, values[0]]

  for (let i = 0; i < values.length; i++) {
    const value = values[i]

    if (i === values.length - 1) {
      buffers.push(
        appendSingleItems(values, i, i, calculateValueSizeFlag(value)),
      )
      break
    }

    const isNextSame = values[i + 1] === value

    if (isNextSame) {
      const rangeStartIndex = i
      while (i < values.length && values[i + 1] === value) i++
      buffers.push(appendRepeatedItems(value, i - rangeStartIndex + 1))
    } else {
      const bitSizeFlag = calculateValueSizeFlag(value)
      const rangeStartIndex = i
      while (
        i < values.length - 1 &&
        values[i + 1] !== values[i] &&
        calculateValueSizeFlag(values[i + 1]) === bitSizeFlag
      )
        i++
      buffers.push(appendSingleItems(values, rangeStartIndex, i, bitSizeFlag))
    }
  }

  const concated = Buffer.concat(buffers)
  return new Uint8Array(
    concated.buffer,
    concated.byteOffset,
    concated.byteLength,
  )
}

// function findSubsetIndex(needleIndex: number, values: IndexableArray) {
//   if (needleIndex + 8 >= values.length - 1) return -1

//   const n0 = values[needleIndex + 0]
//   const n1 = values[needleIndex + 1]
//   const n2 = values[needleIndex + 2]
//   const n3 = values[needleIndex + 3]
//   const n4 = values[needleIndex + 4]
//   const n5 = values[needleIndex + 5]
//   const n6 = values[needleIndex + 6]
//   const n7 = values[needleIndex + 7]

//   for (let s = Math.max(0, needleIndex - 255); s < needleIndex - 8; s++) {
//     if (
//       n0 === values[s + 0] &&
//       n1 === values[s + 1] &&
//       n2 === values[s + 2] &&
//       n3 === values[s + 3] &&
//       n4 === values[s + 4] &&
//       n5 === values[s + 5] &&
//       n6 === values[s + 6] &&
//       n7 === values[s + 7]
//     )
//       return s
//   }

//   return -1
// }

function valueSizeToBitSize(valueSize: 162 | 226 | 0 | 32 | 96) {
  switch (valueSize) {
    case 162:
      return 4 // IS_32_BIT_FLOAT
    case 226:
      return 8 // IS_64_BIT_FLOAT
    case 0:
      return 1 // IS_8_BIT_VALUES
    case 32:
      return 2 // IS_16_BIT_VALUES
    case 96:
      return 4 // IS_32_BIT_VALUES
  }
}

function calculateValueSizeFlag(value: number): 162 | 226 | 0 | 32 | 96 {
  if (value < -0x80000000 || value > 0x7fffffff || (value | 0) !== value) {
    if (Math.abs(Math.fround(value) - value) < 0.00001) return IS_32_BIT_FLOAT
    return IS_64_BIT_FLOAT
  }

  if (value >= -127 && value <= 127) return IS_8_BIT_VALUES
  if (value >= -32767 && value <= 32767) return IS_16_BIT_VALUES
  return IS_32_BIT_VALUES
}

function calculateUnsignedBitSize(value: number): 0 | 1 | 2 | 4 {
  if (value <= 2) return 0
  if (value <= 255) return 1
  if (value <= 65536) return 2
  return 4
}
