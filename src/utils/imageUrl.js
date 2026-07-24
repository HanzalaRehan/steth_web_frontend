// Part B.5 - ImageKit serves every product/color/hero image already (see
// backend's uploadToImageKit), but nothing on this side ever appended a
// transformation param - every <img> used the raw, full-size stored URL.
// ImageKit applies transforms to any of its own URLs on the fly via a
// `tr=` query param, no backend change needed for this.
const IMAGEKIT_HOST = 'ik.imagekit.io';

/**
 * Appends an ImageKit transformation (responsive width + quality + auto
 * format) to a stored ImageKit URL. Returns non-ImageKit URLs (local
 * assets, placeholders, blob: preview URLs) unchanged - transforming those
 * would do nothing but isn't safe to assume for every caller.
 */
export const getImageUrl = (url, { width, quality = 80 } = {}) => {
  if (!url || typeof url !== 'string' || !url.includes(IMAGEKIT_HOST)) return url;

  const params = [`q-${quality}`, 'f-auto'];
  if (width) params.push(`w-${width}`);
  const tr = `tr=${params.join(',')}`;

  return url.includes('?') ? `${url}&${tr}` : `${url}?${tr}`;
};
