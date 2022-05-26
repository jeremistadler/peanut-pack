export function deltaDecode(data: number[]): number[] {
  const result: number[] = []
  let lastValue = 0
  for (let i = 0; i < data.length; i++) {
    const element = data[i]
    const delta = element + lastValue
    lastValue = delta
    result.push(delta)
  }

  return result
}

export function deltaDecodeStreaming() {
  let lastValue = 0

  return (val: number) => {
    lastValue = val + lastValue
    return lastValue
  }
}
