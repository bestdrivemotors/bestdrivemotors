import { d1Query } from '@/lib/db/d1';
import { deleteR2Object } from '@/lib/r2';
import { revalidateInventory } from '@/lib/revalidate-inventory';
import {
  deleteVehicle,
  getVehicleById,
  listImages,
  replaceFeatures,
  updateVehicle,
} from '@/lib/vehicles/repository';
import { buildVehicleSlug, ensureUniqueSlug } from '@/lib/vehicles/slug';
import { normalizeVehicleInput } from '@/lib/vehicles/validation';
import { adminErrorResponse, requireAdminSession } from '../../session';

async function getId(context) {
  const params = await context.params;
  return params.id;
}

export async function GET(request, context) {
  try {
    await requireAdminSession(request);
    const id = await getId(context);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });
    return Response.json({ vehicle, images: await listImages(id) });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request, context) {
  try {
    await requireAdminSession(request);
    const id = await getId(context);
    const current = await getVehicleById(id);
    if (!current) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });
    const body = await request.json().catch(() => {
      const error = new Error('Request body must be valid JSON.');
      error.status = 400;
      throw error;
    });
    const changes = normalizeVehicleInput(body, { partial: true });
    const featureIds = changes.featureIds;
    delete changes.featureIds;

    const slugFieldsChanged = ['year', 'stockNumber', 'makeId', 'modelId']
      .some((field) => changes[field] !== undefined);
    if (slugFieldsChanged) {
      const makeId = changes.makeId ?? current.makeId;
      const modelId = changes.modelId ?? current.modelId;
      const lookup = await d1Query(
        `SELECT m.name AS make_name, md.name AS model_name
          FROM make m JOIN model md ON md.make_id = m.id
          WHERE m.id = ? AND md.id = ?`,
        [makeId, modelId],
      );
      if (!lookup.length) {
        const error = new Error('The selected model does not belong to the selected make.');
        error.status = 400;
        throw error;
      }
      const slug = buildVehicleSlug({
        year: changes.year ?? current.year,
        makeName: lookup[0].make_name,
        modelName: lookup[0].model_name,
        stockNumber: changes.stockNumber ?? current.stockNumber,
      });
      const collisions = await d1Query(
        'SELECT slug FROM vehicle WHERE id != ? AND (slug = ? OR slug LIKE ?)',
        [id, slug, `${slug}-%`],
      );
      changes.slug = ensureUniqueSlug(slug, collisions.map((row) => row.slug), id);
    }

    if (featureIds) {
      const placeholders = featureIds.map(() => '?').join(', ');
      if (featureIds.length) {
        const features = await d1Query(`SELECT id FROM feature WHERE id IN (${placeholders})`, featureIds);
        if (features.length !== featureIds.length) {
          const error = new Error('One or more selected features do not exist.');
          error.status = 400;
          throw error;
        }
      }
      await replaceFeatures(id, featureIds);
    }

    const vehicle = await updateVehicle(id, changes);
    revalidateInventory(current.slug);
    if (vehicle.slug !== current.slug) revalidateInventory(vehicle.slug);
    return Response.json({ vehicle });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request, context) {
  try {
    await requireAdminSession(request);
    const id = await getId(context);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });

    const images = await listImages(id);
    for (const image of images) {
      await deleteR2Object(image.r2Key);
      await deleteR2Object(image.r2Key.replace(/\.webp$/i, '-thumb.webp'));
    }
    const deleted = await deleteVehicle(id);
    if (!deleted) return Response.json({ message: 'Vehicle not found.' }, { status: 404 });
    revalidateInventory(vehicle.slug);
    return Response.json({ success: true });
  } catch (error) {
    return adminErrorResponse(error);
  }
}