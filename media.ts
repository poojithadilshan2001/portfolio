/**
 * Image delivery helpers.
 *
 * Supabase Storage public images can be resized at the CDN edge using the
 * /render/image endpoint. For non-Supabase URLs we safely fall back to the
 * original URL.
 */

export function getOptimizedImageUrl(
  source: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: 'cover' | 'contain' | 'fill';
  } = {},
): string {
  if (!source) return source;

  try {
    const url = new URL(source);

    const publicMarker = '/storage/v1/object/public/';
    if (!url.pathname.includes(publicMarker)) {
      return source;
    }

    url.pathname = url.pathname.replace(
      publicMarker,
      '/storage/v1/render/image/public/',
    );

    const {
      width = 960,
      height,
      quality = 78,
      resize = 'cover',
    } = options;

    url.searchParams.set('width', String(width));
    if (height) url.searchParams.set('height', String(height));
    url.searchParams.set('quality', String(quality));
    url.searchParams.set('resize', resize);

    return url.toString();
  } catch {
    return source;
  }
}

export function getImageSrcSet(
  source: string,
  widths: number[] = [320, 640, 960, 1280],
): string | undefined {
  if (!source) return undefined;

  const optimized = widths.map(
    (width) => `${getOptimizedImageUrl(source, { width })} ${width}w`,
  );

  // If the URL could not be transformed, avoid advertising fake variants.
  if (optimized.every((entry, index) => entry.startsWith(`${source} `))) {
    return undefined;
  }

  return optimized.join(', ');
}
