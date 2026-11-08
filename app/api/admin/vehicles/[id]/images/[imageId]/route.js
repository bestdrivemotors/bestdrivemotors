import { adminErrorResponse, requireAdminSession } from '@/app/api/admin/session';
import { deleteR2Object } from '@/lib/r2';
import { revalidateInventory } from '@/lib/revalidate-inventory';
import { deleteImage, getVehicleById, listImages, setImageCover, updateImage } from '@/lib/vehicles/repository';

export async function PATCH(request, context) {
  try {
    await requireAdminSession(request);
    const { id: vehicleId, imageId } = await context.params;
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });
    const image = (await listImages(vehicleId)).find((candidate) => candidate.id === imageId);
    if (!image) return Response.json({ message: 'Image not found.' }, { status: 404 });

    const body = await request.json();
    if (Object.hasOwn(body, 'isCover') && typeof body.isCover !== 'boolean') {
      return Response.json({ message: 'isCover must be a boolean.' }, { status: 400 });
    }
    if (Object.hasOwn(body, 'sortOrder') && (!Number.isInteger(body.sortOrder) || body.sortOrder < 0)) {
      return Response.json({ message: 'sortOrder must be a non-negative integer.' }, { status: 400 });
    }
    if (Object.keys(body).some((key) => !['isCover', 'sortOrder'].includes(key)) || !Object.keys(body).length) {
      return Response.json({ message: 'Provide isCover or sortOrder.' }, { status: 400 });
    }

    const updated = body.isCover === true
      ? await setImageCover(vehicleId, imageId)
      : await updateImage(imageId, body);
    if (!updated) return Response.json({ message: 'Image not found.' }, { status: 404 });
    revalidateInventory(vehicle.slug);
    return Response.json({ image: updated });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request, context) {
  try {
    await requireAdminSession(request);
    const { id: vehicleId, imageId } = await context.params;
    const vehicle = await getVehicleById(vehicleId);
    if (!vehicle) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });
    const image = (await listImages(vehicleId)).find((candidate) => candidate.id === imageId);
    if (!image) return Response.json({ message: 'Image not found.' }, { status: 404 });

    await deleteR2Object(image.r2Key);
    await deleteR2Object(image.r2Key.replace(/\.webp$/i, '-thumb.webp'));
    const deleted = await deleteImage(imageId);
    if (!deleted) return Response.json({ message: 'Image not found.' }, { status: 404 });
    revalidateInventory(vehicle.slug);
    return Response.json({ success: true });
  } catch (error) {
    return adminErrorResponse(error);
  }
}