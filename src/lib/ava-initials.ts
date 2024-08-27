export function avaInitials(name: string): string {
  const words = name.trim().split(/\s+/)

  if (words.length >= 2) {
    return words[0][0].toUpperCase() + words[1][0].toUpperCase()
  }

  return words[0].substring(0, 2).toUpperCase()
}
