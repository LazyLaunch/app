export function tagWithPlaceholder(tag: string): string {
  return '{$' + tag + '}'
}

export function toTag(fieldName: string): string {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '_')
}

export function replaceTags(text: string, dbValues: Record<string, string>): string {
  // Regular expression to find tags in the format {$field_name}
  const tagRegex = /\{\$(\w+)\}/g

  // Replace all found tags in the text using the dbValues lookup object
  return text.replace(tagRegex, (match, tagName) => {
    // Lookup the tag in dbValues and return the value, or keep the tag if not found
    return dbValues[tagName] || match
  })
}

// Example usage
// const dbValues = {
//   first_name: 'John',
//   last_name: 'Doe',
//   email: 'john.doe@example.com',
// };
// const text = 'My name is {$first_name} and {$last_name}. You can email me at {$email}.'
// const result = replaceTags(text, dbValues)
