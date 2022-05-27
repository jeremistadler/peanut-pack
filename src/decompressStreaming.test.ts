import { compressSerie } from './compresser'
import { InputNumberSerie } from './types'
import { decompressStreaming } from './decompressStreaming'
import { decompressSerie } from './decompresser'

test('decompress unique', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    values: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  }
  const result = compressSerie(serie)
  const outputEnumerable = decompressStreaming(result).values

  expect(Array.from(outputEnumerable as any)).toEqual(serie.values)
})

test('decompress repeated', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    values: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
  }
  const result = compressSerie(serie)
  const outputEnumerable = decompressStreaming(result).values

  expect(Array.from(outputEnumerable as any)).toEqual(serie.values)
})

test('decompress repeated', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    values: [1, 3, 4, 6, 8, 9, 11, 13, 15, 50, 60, 91, 100],
  }
  const result = compressSerie(serie)
  const outputEnumerable = decompressStreaming(result).values

  expect(Array.from(outputEnumerable as any)).toEqual(serie.values)
})

test('decompress large', () => {
  const serie: InputNumberSerie = {
    type: 'number',
    values: [
      8492,
      7956,
      6302,
      1308,
      7294,
      9840,
      7853,
      4076,
      6791,
      841,
      8028,
      3397,
      8968,
      2995,
      1224,
      8738,
      5763,
      4464,
      6871,
      4540,
      2497,
      9841,
      5184,
      7573,
      7789,
      4899,
      6441,
      6316,
      7385,
      3648,
      8123,
      2007,
      8234,
      6630,
      2382,
      6681,
      2276,
      4429,
      8567,
      6532,
      4484,
      9451,
      3795,
      2320,
      3361,
      7547,
      91,
      4425,
      1444,
      9185,
      7441,
      1665,
      9239,
      7469,
      7886,
      6627,
      6404,
      4383,
      1199,
      9178,
      3998,
      7059,
      7457,
      9856,
      7033,
      3748,
      9803,
      5288,
      9053,
      6277,
      7348,
      7052,
      8433,
      7008,
      3831,
      1470,
      8197,
      5259,
      3069,
      1907,
      8329,
      736,
      3880,
      8464,
      1581,
      8023,
      3539,
      8006,
      9197,
      2280,
      7005,
      1416,
      7027,
      6216,
      3589,
      6926,
      9424,
      900,
      1110,
      4413,
      4076,
      5534,
      1353,
      7820,
      4654,
      8403,
      6339,
      1203,
      2208,
      8957,
      6517,
      6046,
      8332,
      1033,
      2781,
      3444,
      4041,
      2937,
      651,
      536,
      2954,
      4204,
      6928,
      8512,
      7534,
      5804,
      4859,
      4612,
      9208,
      9608,
      1414,
      1870,
      6348,
      6016,
      8501,
      7031,
      214,
      4476,
      4754,
      3013,
      929,
      2810,
      9749,
      5665,
      1173,
      4029,
      1724,
      7427,
      696,
      2128,
      2356,
      7706,
      2562,
      3107,
      3047,
      2169,
      4046,
      274,
      8677,
      2649,
      7481,
      4076,
      9358,
      9699,
      4021,
      2832,
      975,
      3957,
      288,
      2475,
      8219,
      8026,
      2999,
      5380,
      521,
      3414,
      1686,
      1594,
      2000,
      2638,
      4771,
      6488,
      1633,
      1556,
      508,
      5197,
      2431,
      1110,
      4667,
      9851,
      8480,
      8503,
      7136,
      6926,
      8156,
      4901,
      6274,
      1801,
      3633,
      7728,
      394,
      5683,
      4214,
      1504,
      3154,
      5185,
      222,
      9355,
      6259,
      6704,
      2447,
      755,
      6225,
      2830,
      1935,
      9942,
      4820,
      9607,
      8491,
      7693,
      3104,
      4287,
      6382,
      4007,
      9915,
      6567,
      2369,
      6299,
      5413,
      7183,
      4301,
      2710,
      1078,
      4474,
      8978,
      1905,
      9868,
      4916,
      4958,
      8210,
      7728,
      4479,
      9452,
      3218,
      1722,
      4528,
      3019,
      4312,
      8529,
      6673,
      7902,
      5057,
      5499,
      2819,
      5539,
      6083,
      468,
      2501,
      8121,
      1096,
      6773,
      1623,
      4448,
      7863,
      5793,
      8060,
      9548,
      4437,
      9108,
      6702,
      2865,
      3281,
      450,
      5965,
      4526,
      4952,
      2321,
      4437,
      5892,
      1386,
      5113,
      361,
      3921,
      5892,
      9275,
      8288,
      1291,
      5042,
      9126,
      7986,
      2128,
      7596,
      9122,
      6456,
      853,
      5127,
      1316,
      2165,
      6617,
      1906,
    ],
  }
  const result = compressSerie(serie)
  const outputEnumerable = decompressSerie(result).values

  expect(Array.from(outputEnumerable as any)).toEqual(serie.values)
})
