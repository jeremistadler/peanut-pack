const values = [33.6, 11.9, 33.8, 3.8, 21.4, 8.4, 15.6, 19.8]

values.map((value, i, list) => (i < list.length - 1 ? value - list[i + 1] : 0))

console.log(
  values.map((value, i, list) =>
    i < list.length - 1 ? value ^ list[i + 1] : value
  )
)

export {}
