import {
  IS_REPEATED_RANGE,
  IS_ONE_ITEM_RANGE,
  IS_TWO_ITEM_RANGE,
  IS_32_BIT_ITEM_RANGE,
  IS_16_BIT_ITEM_RANGE,
  IS_32_BIT_VALUES,
  IS_16_BIT_VALUES,
  IS_8_BIT_ITEM_RANGE,
  ITEM_RANGE_MASK,
  IS_32_BIT_FLOAT,
  IS_64_BIT_FLOAT,
} from './runLengthEncodeBitMap'

const float32Array = new Float32Array(1)
const uInt8Float32Array = new Uint8Array(float32Array.buffer)
const float64Array = new Float64Array(1)
const uInt8Float64Array = new Uint8Array(float64Array.buffer)

export function* runLengthDecodeGenerator(
  values: Uint8Array,
  startOffset: number,
  endIndex: number
): Generator<number, void, void> {
  let offset = startOffset

  while (offset < endIndex) {
    const flag = values[offset]
    offset++

    const countBits = flag & ITEM_RANGE_MASK
    let itemCount = 0

    if (countBits === IS_TWO_ITEM_RANGE) itemCount = 2
    else if (countBits === IS_ONE_ITEM_RANGE) itemCount = 1
    else if (countBits === IS_8_BIT_ITEM_RANGE) {
      itemCount = values[offset]
      offset++
    } else if (countBits === IS_16_BIT_ITEM_RANGE) {
      itemCount = values[offset] | (values[offset + 1] << 8)
      offset += 2
    } else if (countBits === IS_32_BIT_ITEM_RANGE) {
      itemCount =
        (values[offset] |
          (values[offset + 1] << 8) |
          (values[offset + 2] << 16) |
          (values[offset + 3] << 24)) >>>
        0
      offset += 4
    } else if (flag === 0) {
      // Handle zero fills at end of data
      break
    }

    if (flag & IS_REPEATED_RANGE) {
      if (flag >= IS_64_BIT_FLOAT) {
        uInt8Float64Array[0] = values[offset]
        uInt8Float64Array[1] = values[offset + 1]
        uInt8Float64Array[2] = values[offset + 2]
        uInt8Float64Array[3] = values[offset + 3]
        uInt8Float64Array[4] = values[offset + 4]
        uInt8Float64Array[5] = values[offset + 5]
        uInt8Float64Array[6] = values[offset + 6]
        uInt8Float64Array[7] = values[offset + 7]
        offset += 8
        const value = float64Array[0]
        for (let i = 0; i < itemCount; i++) yield value
      } else if (flag >= IS_32_BIT_FLOAT) {
        uInt8Float32Array[0] = values[offset]
        uInt8Float32Array[1] = values[offset + 1]
        uInt8Float32Array[2] = values[offset + 2]
        uInt8Float32Array[3] = values[offset + 3]
        offset += 4
        const value = float32Array[0]
        for (let i = 0; i < itemCount; i++) yield value
      } else if (flag >= IS_32_BIT_VALUES) {
        const value =
          values[offset] +
          values[offset + 1] * 2 ** 8 +
          values[offset + 2] * 2 ** 16 +
          (values[offset + 3] << 24)
        offset += 4

        for (let i = 0; i < itemCount; i++) yield value
      } else if (flag >= IS_16_BIT_VALUES) {
        const val = values[offset] + values[offset + 1] * 2 ** 8
        const value = val | ((val & (2 ** 15)) * 0x1fffe)
        offset += 2

        for (let i = 0; i < itemCount; i++) {
          yield value
        }
      } else {
        const val = values[offset]
        const v2 = val | ((val & (2 ** 7)) * 0x1fffffe)
        offset++

        for (let i = 0; i < itemCount; i++) {
          yield v2
        }
      }
    } else {
      if (flag >= IS_64_BIT_FLOAT) {
        for (let i = 0; i < itemCount; i++) {
          uInt8Float64Array[0] = values[offset]
          uInt8Float64Array[1] = values[offset + 1]
          uInt8Float64Array[2] = values[offset + 2]
          uInt8Float64Array[3] = values[offset + 3]
          uInt8Float64Array[4] = values[offset + 4]
          uInt8Float64Array[5] = values[offset + 5]
          uInt8Float64Array[6] = values[offset + 6]
          uInt8Float64Array[7] = values[offset + 7]
          yield float64Array[0]
          offset += 8
        }
      } else if (flag >= IS_32_BIT_FLOAT) {
        for (let i = 0; i < itemCount; i++) {
          uInt8Float32Array[0] = values[offset]
          uInt8Float32Array[1] = values[offset + 1]
          uInt8Float32Array[2] = values[offset + 2]
          uInt8Float32Array[3] = values[offset + 3]
          yield float32Array[0]
          offset += 4
        }
      } else if (flag >= IS_32_BIT_VALUES) {
        for (let i = 0; i < itemCount; i++) {
          yield values[offset] +
            values[offset + 1] * 2 ** 8 +
            values[offset + 2] * 2 ** 16 +
            (values[offset + 3] << 24)
          offset += 4
        }
      } else if (flag >= IS_16_BIT_VALUES) {
        for (let i = 0; i < itemCount; i++) {
          const val = values[offset] + values[offset + 1] * 2 ** 8
          yield val | ((val & (2 ** 15)) * 0x1fffe)
          offset += 2
        }
      } else {
        for (let i = 0; i < itemCount; i++) {
          const val = values[offset]
          yield val | ((val & (2 ** 7)) * 0x1fffffe)
          offset++
        }
      }
    }
  }
}
