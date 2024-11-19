type ArrayObject = {
  id: string
  value: any[]
}

export function updateOrInsert(array: ArrayObject[], id: string, newValue?: any[]): ArrayObject[] {
  const index = array.findIndex((obj) => obj.id === id)

  if (newValue === undefined) {
    if (index !== -1) {
      array.splice(index, 1)
    }
  } else if (index !== -1) {
    array[index].value = newValue
  } else {
    array.push({ id, value: newValue })
  }

  return array
}
