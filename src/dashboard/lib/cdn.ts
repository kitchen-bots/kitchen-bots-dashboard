/**
 * Cloudflare R2 / CDN Asset URL Resolver
 * Automatically prefixes relative media paths with VITE_CDN_URL or the public Cloudflare R2 bucket.
 */
const CDN_URL = (import.meta.env.VITE_CDN_URL || 'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev').replace(/\/$/, '');

export function getMediaUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${CDN_URL}${cleanPath}`;
}

export default getMediaUrl;
