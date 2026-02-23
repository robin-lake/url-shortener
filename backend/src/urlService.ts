const urlStore = new Map<string, string>();

function generateShortCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function shortenUrl(originalUrl: string): string {
  const normalizedUrl = originalUrl.startsWith('http://') || originalUrl.startsWith('https://')
    ? originalUrl
    : `https://${originalUrl}`;
  const shortCode = generateShortCode();
  urlStore.set(shortCode, normalizedUrl);
  return shortCode;
}

export function getOriginalUrl(shortCode: string): string | undefined {
  return urlStore.get(shortCode);
}
