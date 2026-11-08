import sharp from 'sharp';

export class ImageProcessingError extends Error {
  constructor(cause) {
    super('Unable to process this image. Try JPEG, PNG, or WebP.', { cause });
    this.name = 'ImageProcessingError';
    this.status = 400;
  }
}

export async function optimizeToWebp(buffer) {
  try {
    const gallery = await sharp(buffer)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const thumb = await sharp(buffer)
      .rotate()
      .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    return { gallery, thumb };
  } catch (error) {
    throw new ImageProcessingError(error);
  }
}