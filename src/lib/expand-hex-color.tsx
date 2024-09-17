export function expandHexColor(shortHex: string) {
  if (/^#[0-9A-Fa-f]{3}$/.test(shortHex)) {
    return (
      '#' +
      shortHex
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
    )
  }
  return shortHex
}
