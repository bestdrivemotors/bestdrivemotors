import { afterEach, describe, expect, it, vi } from 'vitest';
import { compressImageFile } from '@/lib/images/browser-compress';

afterEach(() => vi.unstubAllGlobals());

describe('compressImageFile', () => {
  it('resizes large photos to 2400 px and returns a JPEG under 4 MB', async () => {
    let canvasWidth;
    let canvasHeight;
    const canvas = {
      getContext: () => ({ drawImage: vi.fn() }),
      toBlob: (callback, type, quality) => {
        expect(type).toBe('image/jpeg');
        expect(quality).toBeGreaterThan(0);
        callback(new Blob(['compressed'], { type }));
      },
    };
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 4000, height: 2000, close: vi.fn() }));
    vi.stubGlobal('document', {
      createElement: () => canvas,
    });
    Object.defineProperty(canvas, 'width', { set: (value) => { canvasWidth = value; } });
    Object.defineProperty(canvas, 'height', { set: (value) => { canvasHeight = value; } });
    const source = new File([Buffer.alloc(10)], 'phone-photo.png', { type: 'image/png' });

    const result = await compressImageFile(source);

    expect([canvasWidth, canvasHeight]).toEqual([2400, 1200]);
    expect(result.type).toBe('image/jpeg');
    expect(result.size).toBeLessThan(4 * 1024 * 1024);
    expect(result.name).toBe('phone-photo.jpg');
  });

  it('rejects non-image files', async () => {
    const source = new File(['pdf'], 'document.pdf', { type: 'application/pdf' });
    await expect(compressImageFile(source)).rejects.toThrow(/image/i);
  });
});