export function buildUrl(url: string): string {
  if (!url || url.trim() === '' || (url.startsWith('https:/') && !url.startsWith('https://'))) {
    return ''
  }

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  try {
    const normalizedUrl = new URL(url)
    return (
      normalizedUrl.protocol +
      '//' +
      normalizedUrl.hostname +
      normalizedUrl.pathname.replace(/\/$/, '')
    )
  } catch (e) {
    return url
  }
}
