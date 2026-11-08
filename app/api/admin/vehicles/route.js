import { randomUUID } from 'node:crypto';
import { d1Query } from '@/lib/db/d1';
import { insertVehicle, listAllVehicles, replaceFeatures } from '@/lib/vehicles/repository';
import { buildVehicleSlug } from '@/lib/vehicles/slug';
import { normalizeVehicleInput } from '@/lib/vehicles/validation';
import { revalidateInventory } from '@/lib/revalidate-inventory';
import { adminErrorResponse, requireAdminSession } from '../session';

export async function GET(request) {
  try {
    await requireAdminSession(request);
    return Response.json({ vehicles: await listAllVehicles() });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await requireAdminSession(request);
    const body = await request.json().catch(() => {
      const error = new Error('Request body must be valid JSON.');
      error.status = 400;
      throw error;
    });
    const vehicleData = normalizeVehicleInput(body);
    const lookupRows = await d1Query(
      `SELECT m.name AS make_name, md.name AS model_name
        FROM make m JOIN model md ON md.make_id = m.id
        WHERE m.id = ? AND md.id = ?`,
      [vehicleData.makeId, vehicleData.modelId],
    );
    if (!lookupRows.length) {
      const error = new Error('The selected model does not belong to the selected make.');
      error.status = 400;
      throw error;
    }

    if (vehicleData.featureIds.length) {
      const placeholders = vehicleData.featureIds.map(() => '?').join(', ');
      const features = await d1Query(
        `SELECT id FROM feature WHERE id IN (${placeholders})`,
        vehicleData.featureIds,
      );
      if (features.length !== vehicleData.featureIds.length) {
        const error = new Error('One or more selected features do not exist.');
        error.status = 400;
        throw error;
      }
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    const slug = buildVehicleSlug({
      year: vehicleData.year,
      makeName: lookupRows[0].make_name,
      modelName: lookupRows[0].model_name,
      stockNumber: vehicleData.stockNumber,
    });
    const vehicle = await insertVehicle({ ...vehicleData, id, slug, createdAt: now, updatedAt: now });
    try {
      if (vehicleData.featureIds.length) await replaceFeatures(id, vehicleData.featureIds);
    } catch (error) {
      await d1Query('DELETE FROM vehicle WHERE id = ?', [id]).catch(() => {});
      throw error;
    }

    revalidateInventory(vehicle.slug);
    return Response.json({ vehicle }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}