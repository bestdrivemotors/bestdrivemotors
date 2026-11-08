const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export function assertUploadAllowed({ mime, byteLength, maxBytes = DEFAULT_MAX_BYTES }) {
  const normalizedMime = String(mime ?? '').split(';', 1)[0].trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
    throw new TypeError('Upload must be an image in a supported format.');
  }

  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    throw new TypeError('Image upload must not be empty.');
  }

  if (byteLength > maxBytes) {
    const limit = maxBytes === DEFAULT_MAX_BYTES ? '8 MB' : `${maxBytes} bytes`;
    throw new RangeError(`Image upload must be no larger than ${limit}.`);
  }
}