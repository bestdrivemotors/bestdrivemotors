import { randomUUID } from 'node:crypto';
import { adminErrorResponse, requireAdminSession } from '@/app/api/admin/session';
import { assertUploadAllowed } from '@/lib/images/guards';
import { optimizeToWebp } from '@/lib/images/optimize';
import { deleteR2Object, putR2Object } from '@/lib/r2';
import { revalidateInventory } from '@/lib/revalidate-inventory';
import { deleteImage, getVehicleById, insertImage, setImageCover } from '@/lib/vehicles/repository';

export const runtime = 'nodejs';

export async function POST(request, context) {
  try {
    await requireAdminSession(request);
    const { id: vehicleId } = await context.params;
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return Response.json({ message: 'An image file is required.' }, { status: 400 });
    }
    assertUploadAllowed({ mime: file.type, byteLength: file.size });

    const source = Buffer.from(await file.arrayBuffer());
    const { gallery, thumb } = await optimizeToWebp(source);
    const imageId = randomUUID();
    const galleryKey = `vehicles/${vehicleId}/${imageId}.webp`;
    const thumbKey = `vehicles/${vehicleId}/${imageId}-thumb.webp`;
    let galleryStored = false;
    let thumbStored = false;
    let imageInserted = false;

    try {
      const galleryObject = await putR2Object({ key: galleryKey, body: gallery, contentType: 'image/webp' });
      galleryStored = true;
      const thumbObject = await putR2Object({ key: thumbKey, body: thumb, contentType: 'image/webp' });
      thumbStored = true;
      const sortOrder = Number(formData.get('sortOrder'));
      let image = await insertImage({
        id: imageId,
        vehicleId,
        r2Key: galleryKey,
        publicUrl: galleryObject.publicUrl,
        thumbUrl: thumbObject.publicUrl,
        sortOrder: Number.isInteger(sortOrder) && sortOrder >= 0 ? sortOrder : 0,
        isCover: false,
        createdAt: new Date().toISOString(),
      });
      imageInserted = true;
      if (formData.get('isCover') === 'true') {
        image = await setImageCover(vehicleId, imageId);
        if (!image) throw new Error('Unable to set the uploaded photo as cover.');
      }
      revalidateInventory(vehicle.slug);
      return Response.json({ image }, { status: 201 });
    } catch (error) {
      if (imageInserted) await deleteImage(imageId).catch(() => {});
      await Promise.allSettled([
        ...(galleryStored ? [deleteR2Object(galleryKey)] : []),
        ...(thumbStored ? [deleteR2Object(thumbKey)] : []),
      ]);
      throw error;
    }
  } catch (error) {
    if (error instanceof RangeError) error.status = 413;
    else if (error instanceof TypeError || error?.status === 400 || error?.name === 'ImageProcessingError') error.status = 400;
    return adminErrorResponse(error);
  }
}