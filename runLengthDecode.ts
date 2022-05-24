import {
  IS_UNIQUE_RANGE,
  IS_ONE_ITEM_RANGE,
  IS_TWO_ITEM_RANGE,
  IS_32_BIT_VALUES,
  IS_16_BIT_VALUES,
  IS_32_BIT_LENGTH,
  IS_16_BIT_LENGTH,
} from './runLengthEncodeBitMap'

export function runLengthDecode(
  values: Uint8Array,
  startOffset: number,
  endIndex: number
): number[] {
  const result: number[] = []
  let offset = startOffset

  const appendSingleItems = (flag: number, itemCount: number) => {
    if (flag & IS_16_BIT_VALUES) {
      for (let i = 0; i < itemCount; i++) {
        const val = values[offset] + values[offset + 1] * 2 ** 8
        result.push(val | ((val & (2 ** 15)) * 0x1fffe))
        offset += 2
      }
    } else if (flag & IS_32_BIT_VALUES) {
      for (let i = 0; i < itemCount; i++) {
        result.push(
          values[offset] +
            values[offset + 1] * 2 ** 8 +
            values[offset + 2] * 2 ** 16 +
            (values[offset + 3] << 24)
        )
        offset += 4
      }
    } else {
      for (let i = 0; i < itemCount; i++) {
        const val = values[offset]
        result.push(val | ((val & (2 ** 7)) * 0x1fffffe))
        offset++
      }
    }
  }

  const appendRepeatedItems = (flag: number, itemCount: number) => {
    if (flag & IS_16_BIT_VALUES) {
      const val = values[offset] + values[offset + 1] * 2 ** 8
      const value = val | ((val & (2 ** 15)) * 0x1fffe)
      offset += 2

      for (let i = 0; i < itemCount; i++) {
        result.push(value)
      }
    } else if (flag & IS_32_BIT_VALUES) {
      const value =
        values[offset] +
        values[offset + 1] * 2 ** 8 +
        values[offset + 2] * 2 ** 16 +
        (values[offset + 3] << 24)
      offset += 4

      for (let i = 0; i < itemCount; i++) {
        result.push(value)
      }
    } else {
      const val = values[offset]
      const v2 = val | ((val & (2 ** 7)) * 0x1fffffe)
      offset++

      for (let i = 0; i < itemCount; i++) {
        result.push(v2)
      }
    }
  }

  while (offset < endIndex) {
    const flag = values[offset]
    offset++

    let itemCount = 0
    if (flag & IS_ONE_ITEM_RANGE) itemCount = 1
    else if (flag & IS_TWO_ITEM_RANGE) itemCount = 2
    else if (flag & IS_16_BIT_LENGTH) {
      itemCount = values[offset] | (values[offset + 1] << 8)
      offset += 2
    } else if (flag & IS_32_BIT_LENGTH) {
      itemCount =
        (values[offset] |
          (values[offset + 1] << 8) |
          (values[offset + 2] << 16) |
          (values[offset + 3] << 24)) >>>
        0
      offset += 4
    } else {
      itemCount = values[offset]
      offset++
    }

    if (flag & IS_UNIQUE_RANGE) {
      appendSingleItems(flag, itemCount)
    } else {
      appendRepeatedItems(flag, itemCount)
    }
  }

  return result
}
