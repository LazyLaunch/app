export function groupByField<T extends Record<string, any>>(
  array: T[],
  field: keyof T
): Record<string, T[]> {
  return array.reduce(
    (acc, obj) => {
      const key = String(obj[field])
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(obj)
      return acc
    },
    {} as Record<string, T[]>
  )
}
