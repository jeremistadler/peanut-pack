import { runLengthEncode } from './runLengthEncode'

test('encode 4 small repeated', () => {
  const result = runLengthEncode([1, 1, 1, 1])
  expect(result).toEqual(new Uint8Array([13, 4, 1]))
})

test('encode 4 small unique', () => {
  const result = runLengthEncode([1, 2, 3, 4])
  expect(result).toEqual(new Uint8Array([12, 4, 1, 2, 3, 4]))
})

test('encode repeated and unique small', () => {
  const input = [1, 1, 2, 2, 3, 4]
  const result = runLengthEncode(input)

  expect(result).toEqual(
    new Uint8Array([
      9, // two item range
      1, // two 1:s

      9, // two item range
      2, // two 1:s

      8, // two item range unique
      3, // value 3
      4, // value 4
    ])
  )
})

test('encode negative', () => {
  const input = [-1, -200, -2000]
  debugger
  const result = runLengthEncode(input)

  expect(result).toEqual(
    new Uint8Array([
      4, // IS_UNIQUE_RANGE(1) + IS_ONE_ITEM_RANGE(4)
      255, // value: -1
      40, // value: IS_UNIQUE_RANGE(1) + IS_TWO_ITEM_RANGE(8) + IS_16_BIT_VALUES(16)
      56, // value: -200
      255, // value: -200
      48, // value: -2000
      248, // value: -2000
    ])
  )
})

test('run length encoder 32 bit values', () => {
  const input = [1000, 300000, 300000, 5, 500000]
  const result = runLengthEncode(input)
  expect(result).toEqual(
    new Uint8Array([
      36, // IS_ONE_ITEM_RANGE(4) | IS_16_BIT_VALUES(128)
      232, // 1000 part 1
      3, // 1000 part 2

      105, // IS_32_BIT_VALUES(160) | IS_TWO_ITEM_RANGE(8) | IS_REPEATED_RANGE(1)
      224, // 300000 part 1
      147, // 300000 part 2
      4, // 300000 part 3
      0, // 300000 part 4

      4, // IS_ONE_ITEM_RANGE(4)
      5, // value 5

      100, // IS_32_BIT_VALUES(160) |  IS_ONE_ITEM_RANGE(4)
      32, // part 1
      161, // part 2
      7, // part 3
      0, // part 4
    ])
  )
})

test('run length encoder 16 bit length', () => {
  const input = Array.from({ length: 1000 }, () => 0)
  const result = runLengthEncode(input)
  expect(result).toEqual(
    new Uint8Array([
      25, // IS_16_BIT_LENGTH (64)
      232, // len 1
      3, // len 2
      0, //value
    ])
  )
})

test('run length encoder 16 bit length 16 bit values', () => {
  const input = Array.from({ length: 1000 }, () => -300)
  const result = runLengthEncode(input)
  expect(result).toEqual(
    new Uint8Array([
      57, // IS_16_BIT_LENGTH (64) + IS_16_BIT_VALUES (16)
      232, // len 1
      3, // len 2
      212, //value 1
      254, //value 2
    ])
  )
})

test('run length encoder repeating 16 bit values', () => {
  const input = [1300, 1300, 1400, 1400]
  const result = runLengthEncode(input)

  expect(result).toEqual(
    new Uint8Array([
      41, // IS_16_BIT_VALUES(16) + IS_TWO_ITEM_RANGE(8)
      20, // Value 1
      5, // Value 1
      41, // IS_16_BIT_VALUES(16) + IS_TWO_ITEM_RANGE(8)
      120, // Value 2
      5, // Value 2
    ])
  )
})

test.skip('encode compression', () => {
  //prettier-ignore
  const input = [
    1,2,3,4,5,6,7,8, 
    1,2,3,4,5,6,7,8, 
    0,1,2,3,4,5,6,7,
    1,2,3,4,5,6,7,8, 
    0,1,2,3,4,5,6,7,
  ]
  const result = runLengthEncode(input)
  expect(result).toEqual(new Uint8Array([]))
})

// test('read UInt16', () => {
//   const buff = Buffer.alloc(2)
//   const MAX = Math.pow(2, 16) - 1
//   const STEP_SIZE = Math.floor(MAX / 100)

//   for (let i = 0; i < MAX; i += STEP_SIZE) {
//     buff.writeUInt16LE(i, 0)
//     const arr = new Uint8Array(buff.buffer.slice(0, 2))

//     const decoded = arr[0] | (arr[1] << 8)
//     expect(decoded).toBe(i)
//   }
// })

// test('read Int16', () => {
//   const buff = Buffer.alloc(2)
//   const MAX = Math.pow(2, 15) - 1
//   const MIN = -MAX
//   const STEP_SIZE = Math.floor((MAX - MIN) / 100)

//   for (let i = MIN; i < MAX; i += STEP_SIZE) {
//     buff.writeInt16LE(i, 0)
//     const arr = new Uint8Array(buff.buffer.slice(0, 2))

//     const val = arr[0] + arr[1] * 2 ** 8
//     const decoded = val | ((val & (2 ** 15)) * 0x1fffe)

//     expect(decoded).toBe(i)
//   }
// })

// test('read UInt32 ', () => {
//   const buff = Buffer.alloc(4)
//   const MAX = Math.pow(2, 32) - 1
//   const STEP_SIZE = Math.floor(MAX / 100)

//   for (let i = 0; i < MAX; i += STEP_SIZE) {
//     buff.writeUInt32LE(i, 0)
//     const arr = new Uint8Array(buff.buffer.slice(0, 4))

//     const decoded =
//       (arr[0] | (arr[1] << 8) | (arr[2] << 16) | (arr[3] << 24)) >>> 0
//     expect(decoded).toBe(i)
//   }
// })

// test('read Int32 ', () => {
//   const buff = Buffer.alloc(4)
//   const MAX = Math.pow(2, 31) - 1
//   const MIN = -MAX
//   const STEP_SIZE = Math.floor((MAX - MIN) / 100)

//   for (let i = MIN; i < MAX; i += STEP_SIZE) {
//     buff.writeInt32LE(i, 0)
//     const arr = new Uint8Array(buff.buffer.slice(0, 4))
//     const decoded = arr[0] + arr[1] * 2 ** 8 + arr[2] * 2 ** 16 + (arr[3] << 24)

//     expect(decoded).toBe(i)
//   }
// })
