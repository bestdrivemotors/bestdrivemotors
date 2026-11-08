const MAX_EDGE = 2400;
const TARGET_BYTES = 4 * 1024 * 1024;

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('The browser could not compress this image.'));
    }, 'image/jpeg', quality);
  });
}

export async function compressImageFile(file) {
  if (!file?.type?.startsWith('image/')) {
    throw new TypeError('Choose an image file to upload.');
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (cause) {
    throw new Error('This image format cannot be opened in your browser.', { cause });
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));
    let quality = 0.86;
    let blob;
    let resizeAttempts = 0;

    while (true) {
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('The browser could not prepare this image.');
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await canvasToJpeg(canvas, quality);
      if (blob.size <= TARGET_BYTES) break;
      if (quality > 0.5) {
        quality = Math.max(0.5, quality - 0.12);
      } else if (resizeAttempts < 3) {
        resizeAttempts += 1;
        width = Math.max(1, Math.round(width * 0.82));
        height = Math.max(1, Math.round(height * 0.82));
      } else {
        throw new Error('This image is still too large after compression. Choose a smaller image.');
      }
    }

    const filename = file.name.replace(/\.[^.]+$/, '') || 'vehicle-image';
    return new File([blob], `${filename}.jpg`, {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close?.();
  }
}