import { deltaEncode } from './deltaEncode'
import { dictionaryEncodeNumbers } from './dictionaryEncodeNumbers'
import { IndexableArray } from './IndexableArray'
import { runLengthEncode } from './runLengthEncode'
import { TransformType } from './types'
import { transformTypes } from './compresser'

function findSmallest(
  data: IndexableArray,
  paths: TransformType[],
  lastData: IndexableArray
): { best: IndexableArray; paths: TransformType[] } {
  console.log(data.length, paths)

  if (paths.length >= 4) {
    return {
      best: data.length < lastData.length ? data : lastData,
      paths,
    }
  }

  const results = transformTypes.map(type => {
    if (type === 'delta') {
      const encoded = deltaEncode(data)
      return findSmallest(encoded, [...paths, type], data)
    }

    if (type === 'rle') {
      const encoded = runLengthEncode(data)
      return findSmallest(encoded, [...paths, type], data)
    }

    if (type === 'dictionary') {
      const encoded = dictionaryEncodeNumbers(data)
      return findSmallest(encoded, [...paths, type], data)
    }

    throw new Error('No path found.')
  })

  let bestMatch = results[0]
  for (const result of results) {
    if (
      result.best.length < bestMatch.best.length ||
      (result.best.length === bestMatch.best.length &&
        result.paths.length < bestMatch.paths.length)
    ) {
      bestMatch = result
    }
  }

  return bestMatch
}
