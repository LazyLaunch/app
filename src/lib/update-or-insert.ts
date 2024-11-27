interface Options<T> {
  key: keyof T
  id: T[keyof T]
}

export function updateOrInsert<T extends Record<string, any>>(
  array: T[],
  options: Options<T>,
  newValue?: T
): T[] {
  const { key, id } = options
  const index = array.findIndex((obj) => obj[key] === id)

  if (newValue === undefined) {
    if (index !== -1) {
      array.splice(index, 1)
    }
  } else if (index !== -1) {
    array[index] = { ...array[index], ...newValue }
  } else {
    array.push(newValue)
  }

  return array
}
