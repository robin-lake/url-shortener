const urlStore = new Map<string, string>();

function generateShortCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function shortenUrl(originalUrl: string): string {
  const shortCode = generateShortCode();
  urlStore.set(shortCode, originalUrl);
  return shortCode;
}

export function getOriginalUrl(shortCode: string): string | undefined {
  return urlStore.get(shortCode);
}
