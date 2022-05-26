'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var percentile = _interopDefault(require('percentile'));

const IS_REPEATED_RANGE =
/*   */
1;
const ITEM_RANGE_MASK =
/*     */
28;
const IS_ONE_ITEM_RANGE =
/*   */
4;
const IS_TWO_ITEM_RANGE =
/*   */
8;
const IS_8_BIT_ITEM_RANGE =
/* */
12;
const IS_16_BIT_ITEM_RANGE =
/**/
24;
const IS_32_BIT_ITEM_RANGE =
/**/
20;
const IS_8_BIT_VALUES =
/*     */
0;
const IS_16_BIT_VALUES =
/*    */
32;
const IS_32_BIT_VALUES =
/*    */
96;
const IS_32_BIT_FLOAT =
/*     */
162;
const IS_64_BIT_FLOAT =
/*     */
226; //
//

const TRANSFORM_DELTA =
/*      */
4;
const TRANSFORM_DELTA_DELTA =
/**/
8;
const TRANSFORM_RLE =
/*        */
1;
const TRANSFORM_STRING =
/*     */
128;

function calcNumberPrecision(a) {
  if (!isFinite(a)) return 0;
  var e = 1,
      p = 0;

  while (Math.round(a * e) / e !== a) {
    e *= 10;
    p++;
  }

  return p;
}

function calculateStats(values) {
  const unique = new Set(values).size;
  let min = values[0];
  let max = values[0];
  let maxDecimals = 0;
  const [p02, p05, p50, p95, p98] = percentile([2, 5, 50, 95, 98], values);

  for (let i = 0; i < values.length; i++) {
    const element = values[i];
    min = Math.min(min, element);
    max = Math.max(max, element);
    maxDecimals = Math.max(maxDecimals, calcNumberPrecision(element));
  }

  return {
    unique,
    min,
    max,
    count: values.length,
    maxDecimals,
    p02,
    p05,
    p50,
    p95,
    p98
  };
}

function appendSingleItems(values, startIndex, endIndexInclusive, valueSize) {
  const itemCount = endIndexInclusive - startIndex + 1;
  let countBitSize = 0; // itemCount >= 65536 ? 4 : itemCount >= 255 ? 2 : 1

  let flags = valueSize;
  if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE;else if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE;else if (itemCount < 256) {
    flags |= IS_8_BIT_ITEM_RANGE;
    countBitSize = 1;
  } else if (itemCount < 65536) {
    flags |= IS_16_BIT_ITEM_RANGE;
    countBitSize = 2;
  } else {
    flags |= IS_32_BIT_ITEM_RANGE;
    countBitSize = 4;
  }
  const buff = Buffer.allocUnsafe(countBitSize + valueSizeToBitSize(valueSize) * itemCount + 1);
  buff.writeUint8(flags, 0);
  if (countBitSize === 1) buff.writeUInt8(itemCount, 1);else if (countBitSize === 2) buff.writeUInt16LE(itemCount, 1);else if (countBitSize === 4) buff.writeUInt32LE(itemCount, 1);
  let offset = 1 + countBitSize;

  if (valueSize === IS_8_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt8(values[i], offset);
      offset += 1;
    }
  } else if (valueSize === IS_16_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt16LE(values[i], offset);
      offset += 2;
    }
  } else if (valueSize === IS_32_BIT_VALUES) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeInt32LE(values[i], offset);
      offset += 4;
    }
  } else if (valueSize === IS_32_BIT_FLOAT) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeFloatLE(values[i], offset);
      offset += 4;
    }
  } else if (valueSize === IS_64_BIT_FLOAT) {
    for (let i = startIndex; i <= endIndexInclusive; i++) {
      buff.writeDoubleLE(values[i], offset);
      offset += 8;
    }
  } else {
    throw new Error('Unsupported flags in appendSingleItems ' + flags.toString(2));
  }

  return buff;
}

function appendRepeatedItems(value, itemCount) {
  const valueSize = calculateValueSizeFlag(value);
  const sizeBit = calculateUnsignedBitSize(itemCount);
  let flags = valueSize | IS_REPEATED_RANGE;
  if (itemCount === 1) flags |= IS_ONE_ITEM_RANGE;else if (itemCount === 2) flags |= IS_TWO_ITEM_RANGE;else if (sizeBit === 1) flags |= IS_8_BIT_ITEM_RANGE;else if (sizeBit === 2) flags |= IS_16_BIT_ITEM_RANGE;else if (sizeBit === 4) flags |= IS_32_BIT_ITEM_RANGE;
  const buff = Buffer.allocUnsafe(sizeBit + valueSizeToBitSize(valueSize) + 1);
  buff.writeUint8(flags);
  let offset = 1 + sizeBit;
  if (sizeBit === 1) buff.writeUInt8(itemCount, 1);else if (sizeBit === 2) buff.writeUInt16LE(itemCount, 1);else if (sizeBit === 4) buff.writeUInt32LE(itemCount, 1);

  if (valueSize === IS_8_BIT_VALUES) {
    buff.writeInt8(value, offset);
    offset += 1;
  } else if (valueSize === IS_16_BIT_VALUES) {
    buff.writeInt16LE(value, offset);
    offset += 2;
  } else if (valueSize === IS_32_BIT_VALUES) {
    buff.writeInt32LE(value, offset);
    offset += 4;
  } else if (valueSize === IS_32_BIT_FLOAT) {
    buff.writeFloatLE(value, offset);
    offset += 4;
  } else if (valueSize === IS_64_BIT_FLOAT) {
    buff.writeFloatLE(value, offset);
    offset += 8;
  } else {
    throw new Error('Unsupported flags in appendRepeatedItems ' + flags.toString(2));
  }

  return buff;
}

function runLengthEncode(values) {
  const buffers = [];
  if (values.length === 0) return new Uint8Array(0); // if (values.length === 1) return [1, values[0]]

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    if (i === values.length - 1) {
      buffers.push(appendSingleItems(values, i, i, calculateValueSizeFlag(value)));
      break;
    }

    const isNextSame = values[i + 1] === value;

    if (isNextSame) {
      const rangeStartIndex = i;

      while (i < values.length && values[i + 1] === value) i++;

      buffers.push(appendRepeatedItems(value, i - rangeStartIndex + 1));
    } else {
      const bitSizeFlag = calculateValueSizeFlag(value);
      const rangeStartIndex = i;

      while (i < values.length - 1 && values[i + 1] !== values[i] && calculateValueSizeFlag(values[i + 1]) === bitSizeFlag) i++;

      buffers.push(appendSingleItems(values, rangeStartIndex, i, bitSizeFlag));
    }
  }

  const concated = Buffer.concat(buffers);
  return new Uint8Array(concated.buffer, concated.byteOffset, concated.byteLength);
} // function findSubsetIndex(needleIndex: number, values: IndexableArray) {
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

function valueSizeToBitSize(valueSize) {
  switch (valueSize) {
    case 162:
      return 4;
    // IS_32_BIT_FLOAT

    case 226:
      return 8;
    // IS_64_BIT_FLOAT

    case 0:
      return 1;
    // IS_8_BIT_VALUES

    case 32:
      return 2;
    // IS_16_BIT_VALUES

    case 96:
      return 4;
    // IS_32_BIT_VALUES
  }
}

function calculateValueSizeFlag(value) {
  if (value < -0x80000000 || value > 0x7fffffff || (value | 0) !== value) {
    if (Math.abs(Math.fround(value) - value) < 0.00001) return IS_32_BIT_FLOAT;
    return IS_64_BIT_FLOAT;
  }

  if (value >= -127 && value <= 127) return IS_8_BIT_VALUES;
  if (value >= -32767 && value <= 32767) return IS_16_BIT_VALUES;
  return IS_32_BIT_VALUES;
}

function calculateUnsignedBitSize(value) {
  if (value <= 2) return 0;
  if (value <= 255) return 1;
  if (value <= 65536) return 2;
  return 4;
}

function deltaEncode(values) {
  const result = [];
  let lastValue = 0;

  for (let i = 0; i < values.length; i++) {
    const element = values[i];
    const delta = element - lastValue;
    lastValue = element;
    result.push(delta);
  }

  return result;
}

function compressSerie(serie) {
  switch (serie.type) {
    case 'number':
      return compressNumberSerie(serie);

    case 'string':
      return compressStringSerie();
  }
}

function findSmallest(values) {
  const deltaValues = deltaEncode(values);
  const deltaRle = runLengthEncode(deltaValues);
  const delta2Values = deltaEncode(deltaValues);
  const delta2Rle = runLengthEncode(delta2Values);
  const rle = runLengthEncode(values);

  if (delta2Rle.length < deltaRle.length && delta2Rle.length < rle.length) {
    return {
      data: delta2Rle,
      transforms: TRANSFORM_DELTA_DELTA | TRANSFORM_RLE
    };
  }

  if (deltaRle.length < rle.length) {
    return {
      data: deltaRle,
      transforms: TRANSFORM_DELTA | TRANSFORM_RLE
    };
  }

  return {
    data: rle,
    transforms: TRANSFORM_RLE
  };
}

function compressNumberSerie(serie) {
  const stats = calculateStats(serie.values);
  const valueOffset = stats.p50 > 1 ? Math.floor(stats.p50) : 0;
  let offseted = serie.values;

  if (valueOffset > 0) {
    offseted = serie.values.map(f => f - valueOffset);
  }

  const smallest = findSmallest(offseted);
  const headerData = runLengthEncode([smallest.transforms, valueOffset, stats.count, stats.unique, stats.maxDecimals, stats.min, stats.p02, stats.p05, stats.p50, stats.p95, stats.p98, stats.max]);
  const final = new Uint8Array(headerData.length + 1 + smallest.data.length);
  final[0] = headerData.length;
  final.set(headerData, 1);
  final.set(smallest.data, 1 + headerData.length);
  return final;
}

function compressStringSerie(_serie) {
  throw new Error('Function not implemented.');
}

const float32Array = /*#__PURE__*/new Float32Array(1);
const uInt8Float32Array = /*#__PURE__*/new Uint8Array(float32Array.buffer);
const float64Array = /*#__PURE__*/new Float64Array(1);
const uInt8Float64Array = /*#__PURE__*/new Uint8Array(float64Array.buffer);
function* runLengthDecodeGenerator(values, startOffset, endIndex) {
  let offset = startOffset;

  while (offset < endIndex) {
    const flag = values[offset];
    offset++;
    const countBits = flag & ITEM_RANGE_MASK;
    let itemCount = 0;
    if (countBits === IS_TWO_ITEM_RANGE) itemCount = 2;else if (countBits === IS_ONE_ITEM_RANGE) itemCount = 1;else if (countBits === IS_8_BIT_ITEM_RANGE) {
      itemCount = values[offset];
      offset++;
    } else if (countBits === IS_16_BIT_ITEM_RANGE) {
      itemCount = values[offset] | values[offset + 1] << 8;
      offset += 2;
    } else if (countBits === IS_32_BIT_ITEM_RANGE) {
      itemCount = (values[offset] | values[offset + 1] << 8 | values[offset + 2] << 16 | values[offset + 3] << 24) >>> 0;
      offset += 4;
    } else if (flag === 0) {
      // Handle zero fills at end of data
      break;
    }

    if (flag & IS_REPEATED_RANGE) {
      if (flag >= IS_64_BIT_FLOAT) {
        uInt8Float64Array[0] = values[offset];
        uInt8Float64Array[1] = values[offset + 1];
        uInt8Float64Array[2] = values[offset + 2];
        uInt8Float64Array[3] = values[offset + 3];
        uInt8Float64Array[4] = values[offset + 4];
        uInt8Float64Array[5] = values[offset + 5];
        uInt8Float64Array[6] = values[offset + 6];
        uInt8Float64Array[7] = values[offset + 7];
        offset += 8;
        const value = float64Array[0];

        for (let i = 0; i < itemCount; i++) yield value;
      } else if (flag >= IS_32_BIT_FLOAT) {
        uInt8Float32Array[0] = values[offset];
        uInt8Float32Array[1] = values[offset + 1];
        uInt8Float32Array[2] = values[offset + 2];
        uInt8Float32Array[3] = values[offset + 3];
        offset += 4;
        const value = float32Array[0];

        for (let i = 0; i < itemCount; i++) yield value;
      } else if (flag >= IS_32_BIT_VALUES) {
        const value = values[offset] + values[offset + 1] * 2 ** 8 + values[offset + 2] * 2 ** 16 + (values[offset + 3] << 24);
        offset += 4;

        for (let i = 0; i < itemCount; i++) yield value;
      } else if (flag >= IS_16_BIT_VALUES) {
        const val = values[offset] + values[offset + 1] * 2 ** 8;
        const value = val | (val & 2 ** 15) * 0x1fffe;
        offset += 2;

        for (let i = 0; i < itemCount; i++) {
          yield value;
        }
      } else {
        const val = values[offset];
        const v2 = val | (val & 2 ** 7) * 0x1fffffe;
        offset++;

        for (let i = 0; i < itemCount; i++) {
          yield v2;
        }
      }
    } else {
      if (flag >= IS_64_BIT_FLOAT) {
        for (let i = 0; i < itemCount; i++) {
          uInt8Float64Array[0] = values[offset];
          uInt8Float64Array[1] = values[offset + 1];
          uInt8Float64Array[2] = values[offset + 2];
          uInt8Float64Array[3] = values[offset + 3];
          uInt8Float64Array[4] = values[offset + 4];
          uInt8Float64Array[5] = values[offset + 5];
          uInt8Float64Array[6] = values[offset + 6];
          uInt8Float64Array[7] = values[offset + 7];
          yield float64Array[0];
          offset += 8;
        }
      } else if (flag >= IS_32_BIT_FLOAT) {
        for (let i = 0; i < itemCount; i++) {
          uInt8Float32Array[0] = values[offset];
          uInt8Float32Array[1] = values[offset + 1];
          uInt8Float32Array[2] = values[offset + 2];
          uInt8Float32Array[3] = values[offset + 3];
          yield float32Array[0];
          offset += 4;
        }
      } else if (flag >= IS_32_BIT_VALUES) {
        for (let i = 0; i < itemCount; i++) {
          yield values[offset] + values[offset + 1] * 2 ** 8 + values[offset + 2] * 2 ** 16 + (values[offset + 3] << 24);
          offset += 4;
        }
      } else if (flag >= IS_16_BIT_VALUES) {
        for (let i = 0; i < itemCount; i++) {
          const val = values[offset] + values[offset + 1] * 2 ** 8;
          yield val | (val & 2 ** 15) * 0x1fffe;
          offset += 2;
        }
      } else {
        for (let i = 0; i < itemCount; i++) {
          const val = values[offset];
          yield val | (val & 2 ** 7) * 0x1fffffe;
          offset++;
        }
      }
    }
  }
}

const float32Array$1 = /*#__PURE__*/new Float32Array(1);
const uInt8Float32Array$1 = /*#__PURE__*/new Uint8Array(float32Array$1.buffer);
const float64Array$1 = /*#__PURE__*/new Float64Array(1);
const uInt8Float64Array$1 = /*#__PURE__*/new Uint8Array(float64Array$1.buffer);
function runLengthDecode(values, startOffset, endIndex) {
  const result = [];
  let offset = startOffset;

  const appendSingleItems = (flag, itemCount) => {
    if (flag >= IS_64_BIT_FLOAT) {
      for (let i = 0; i < itemCount; i++) {
        uInt8Float64Array$1[0] = values[offset];
        uInt8Float64Array$1[1] = values[offset + 1];
        uInt8Float64Array$1[2] = values[offset + 2];
        uInt8Float64Array$1[3] = values[offset + 3];
        uInt8Float64Array$1[4] = values[offset + 4];
        uInt8Float64Array$1[5] = values[offset + 5];
        uInt8Float64Array$1[6] = values[offset + 6];
        uInt8Float64Array$1[7] = values[offset + 7];
        result.push(float64Array$1[0]);
        offset += 8;
      }
    } else if (flag >= IS_32_BIT_FLOAT) {
      for (let i = 0; i < itemCount; i++) {
        uInt8Float32Array$1[0] = values[offset];
        uInt8Float32Array$1[1] = values[offset + 1];
        uInt8Float32Array$1[2] = values[offset + 2];
        uInt8Float32Array$1[3] = values[offset + 3];
        result.push(float32Array$1[0]);
        offset += 4;
      }
    } else if (flag >= IS_32_BIT_VALUES) {
      for (let i = 0; i < itemCount; i++) {
        result.push(values[offset] + values[offset + 1] * 2 ** 8 + values[offset + 2] * 2 ** 16 + (values[offset + 3] << 24));
        offset += 4;
      }
    } else if (flag >= IS_16_BIT_VALUES) {
      for (let i = 0; i < itemCount; i++) {
        const val = values[offset] + values[offset + 1] * 2 ** 8;
        result.push(val | (val & 2 ** 15) * 0x1fffe);
        offset += 2;
      }
    } else {
      for (let i = 0; i < itemCount; i++) {
        const val = values[offset];
        result.push(val | (val & 2 ** 7) * 0x1fffffe);
        offset++;
      }
    }
  };

  const appendRepeatedItems = (flag, itemCount) => {
    if (flag >= IS_64_BIT_FLOAT) {
      uInt8Float64Array$1[0] = values[offset];
      uInt8Float64Array$1[1] = values[offset + 1];
      uInt8Float64Array$1[2] = values[offset + 2];
      uInt8Float64Array$1[3] = values[offset + 3];
      uInt8Float64Array$1[4] = values[offset + 4];
      uInt8Float64Array$1[5] = values[offset + 5];
      uInt8Float64Array$1[6] = values[offset + 6];
      uInt8Float64Array$1[7] = values[offset + 7];
      offset += 8;
      const value = float64Array$1[0];

      for (let i = 0; i < itemCount; i++) result.push(value);
    } else if (flag >= IS_32_BIT_FLOAT) {
      uInt8Float32Array$1[0] = values[offset];
      uInt8Float32Array$1[1] = values[offset + 1];
      uInt8Float32Array$1[2] = values[offset + 2];
      uInt8Float32Array$1[3] = values[offset + 3];
      offset += 4;
      const value = float32Array$1[0];

      for (let i = 0; i < itemCount; i++) result.push(value);
    } else if (flag >= IS_32_BIT_VALUES) {
      const value = values[offset] + values[offset + 1] * 2 ** 8 + values[offset + 2] * 2 ** 16 + (values[offset + 3] << 24);
      offset += 4;

      for (let i = 0; i < itemCount; i++) result.push(value);
    } else if (flag >= IS_16_BIT_VALUES) {
      const val = values[offset] + values[offset + 1] * 2 ** 8;
      const value = val | (val & 2 ** 15) * 0x1fffe;
      offset += 2;

      for (let i = 0; i < itemCount; i++) {
        result.push(value);
      }
    } else {
      const val = values[offset];
      const v2 = val | (val & 2 ** 7) * 0x1fffffe;
      offset++;

      for (let i = 0; i < itemCount; i++) {
        result.push(v2);
      }
    }
  };

  while (offset < endIndex) {
    const flag = values[offset];
    offset++;
    const countBits = flag & ITEM_RANGE_MASK;
    let itemCount = 0;
    if (countBits === IS_TWO_ITEM_RANGE) itemCount = 2;else if (countBits === IS_ONE_ITEM_RANGE) itemCount = 1;else if (countBits === IS_8_BIT_ITEM_RANGE) {
      itemCount = values[offset];
      offset++;
    } else if (countBits === IS_16_BIT_ITEM_RANGE) {
      itemCount = values[offset] | values[offset + 1] << 8;
      offset += 2;
    } else if (countBits === IS_32_BIT_ITEM_RANGE) {
      itemCount = (values[offset] | values[offset + 1] << 8 | values[offset + 2] << 16 | values[offset + 3] << 24) >>> 0;
      offset += 4;
    } else if (flag === 0) {
      // Handle zero fills at end of data
      break;
    }

    if (flag & IS_REPEATED_RANGE) {
      appendRepeatedItems(flag, itemCount);
    } else {
      appendSingleItems(flag, itemCount);
    }
  }

  return result;
}

function readHeader(rawData) {
  const headerSize = rawData[0];
  const [flags, valueOffset, count, unique, maxDecimals, min, p02, p05, p50, p95, p98, max] = runLengthDecode(rawData, 1, headerSize + 1);
  return {
    valueOffset,
    headerSize,
    flags,
    count,
    unique,
    maxDecimals,
    min,
    max,
    p02,
    p05,
    p50,
    p95,
    p98
  };
}

function deltaDecodeGenerator() {
  let lastValue = 0;
  return val => {
    lastValue = val + lastValue;
    return lastValue;
  };
}

function decompressSerieGenerator(serie) {
  const header = readHeader(serie);
  return {
    stats: header,
    values: header.flags & TRANSFORM_STRING ? decompressStringSerie() : decompressNumberSerieGenerator(serie, header)
  };
}

function* decompressNumberSerieGenerator(serie, header) {
  let values = runLengthDecodeGenerator(serie, header.headerSize + 1, serie.length);
  const delta1 = (header.flags & TRANSFORM_DELTA) === TRANSFORM_DELTA ? deltaDecodeGenerator() : null;
  const delta2 = (header.flags & TRANSFORM_DELTA_DELTA) === TRANSFORM_DELTA_DELTA ? deltaDecodeGenerator() : null;

  for (const value of values) {
    let val = value;
    if (delta1 !== null) val = delta1(val);
    if (delta2 !== null) val = delta2(val);
    yield val + header.valueOffset;
  }
}

function* decompressStringSerie(_serie) {
  throw new Error('Function not implemented.');
}

exports.compressSerie = compressSerie;
exports.decompressSerieGenerator = decompressSerieGenerator;
//# sourceMappingURL=peanut-pack.cjs.development.js.map
