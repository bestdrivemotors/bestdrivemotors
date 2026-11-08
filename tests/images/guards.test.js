import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { assertUploadAllowed } from '@/lib/images/guards';
import { optimizeToWebp } from '@/lib/images/optimize';

describe('assertUploadAllowed', () => {
  it('accepts jpeg under the byte limit', () => {
    expect(() =>
      assertUploadAllowed({ mime: 'image/jpeg', byteLength: 1024 }),
    ).not.toThrow();
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])(
    'accepts supported image type %s',
    (mime) => {
      expect(() => assertUploadAllowed({ mime, byteLength: 1024 })).not.toThrow();
    },
  );

  it('rejects non-image types', () => {
    expect(() =>
      assertUploadAllowed({ mime: 'application/pdf', byteLength: 1024 }),
    ).toThrow(/image/i);
  });

  it('rejects uploads larger than 8 MB', () => {
    expect(() =>
      assertUploadAllowed({ mime: 'image/jpeg', byteLength: 9 * 1024 * 1024 }),
    ).toThrow(/8 MB/i);
  });
});

describe('optimizeToWebp', () => {
  it('creates a gallery and thumbnail WebP without enlarging', async () => {
    const source = await sharp({
      create: {
        width: 2000,
        height: 1000,
        channels: 3,
        background: { r: 30, g: 90, b: 140 },
      },
    })
      .png()
      .toBuffer();

    const { gallery, thumb } = await optimizeToWebp(source);
    const galleryMetadata = await sharp(gallery).metadata();
    const thumbMetadata = await sharp(thumb).metadata();

    expect(galleryMetadata.format).toBe('webp');
    expect(galleryMetadata.width).toBe(1920);
    expect(galleryMetadata.height).toBe(960);
    expect(thumbMetadata.format).toBe('webp');
    expect(thumbMetadata.width).toBe(480);
    expect(thumbMetadata.height).toBe(240);
  });

  it('returns a clear error for undecodable image data', async () => {
    await expect(optimizeToWebp(Buffer.from('not an image'))).rejects.toThrow(/process this image/i);
  });
});
