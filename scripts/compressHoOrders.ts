import { compressSerie } from '../src/compresser'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { AnyInputSerie } from '../src/types'
import { deltaEncode } from '../src/deltaEncode'

type Order = {
  date: string
  secs: number
  total: number
  locId: number
  payment: string
}

async function run() {
  // console.log('Loading from disk...')
  const data = await readFile(
    '/Users/jeremi/ho/mono/scripts/tempData.json',
    'utf8'
  )

  // console.log('Parsing json...')
  const rows = JSON.parse(data) as { orders: Order[] }

  // console.log('Sorting...')
  rows.orders.sort((a, b) => a.locId - b.locId || a.secs - b.secs)

  // console.log('Mapping...')
  const serieUncompressed: (AnyInputSerie & { name: string })[] = [
    {
      type: 'number',
      name: 'unixtime',
      values: rows.orders.map(row => row.secs),
    },
    {
      type: 'number',
      name: 'locationId',
      values: rows.orders.map(row => row.locId),
    },
    {
      type: 'number',
      name: 'total',
      values: rows.orders.map(row => row.total),
    },
  ]

  await mkdir('./compressed', { recursive: true })

  // console.log('compressing ...')

  const metadataList: { name: string }[] = []
  for (const serie of serieUncompressed) {
    const compressed = compressSerie(serie)
    metadataList.push({ name: serie.name })

    console.log(
      numberWithSpaces((compressed.length / 1024).toFixed(2)),
      'kb',
      '  ',
      serie.name
    )

    // await writeFile(
    //   './compressed/' + serie.name + '.csv',
    //   serie.values.join('\n')
    // )
    // await writeFile(
    //   './compressed/' + serie.name + '-delta.csv',
    //   deltaEncode(serie.values as number[]).join('\n')
    // )
    // await writeFile(
    //   './compressed/' + serie.name + '-delta2.csv',
    //   deltaEncode(deltaEncode(serie.values as number[])).join('\n')
    // )
    await writeFile('./compressed/' + serie.name + '.webts', compressed)
  }

  await writeFile(
    './compressed/metadata.json',
    JSON.stringify(
      {
        series: metadataList,
        itemCount: rows.orders.length,
      },
      null,
      2
    )
  )

  console.log('Done!')
}

run().catch(err => {
  console.error(err)
})

function numberWithSpaces(x: string) {
  var parts = x.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join('.')
}
