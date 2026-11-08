import * as lookups from '@/lib/lookups/repository';
import { revalidateInventory } from '@/lib/revalidate-inventory';
import { adminErrorResponse, requireAdminSession } from '../session';

const TYPES = {
  make: { key: 'makes', list: lookups.listMakes, create: lookups.createMake, update: lookups.updateMake, remove: lookups.deleteMake },
  model: { key: 'models', list: lookups.listModels, create: lookups.createModel, update: lookups.updateModel, remove: lookups.deleteModel },
  fuel: { key: 'fuelTypes', list: lookups.listFuelTypes, create: lookups.createFuelType, update: lookups.updateFuelType, remove: lookups.deleteFuelType },
  body: { key: 'bodyStyles', list: lookups.listBodyStyles, create: lookups.createBodyStyle, update: lookups.updateBodyStyle, remove: lookups.deleteBodyStyle },
  feature: { key: 'features', list: lookups.listFeatures, create: lookups.createFeature, update: lookups.updateFeature, remove: lookups.deleteFeature },
};

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function normalizedName(name) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 64) {
    throw badRequest('Name must contain 1 to 64 characters.');
  }
  return name.trim();
}

export async function GET(request) {
  try {
    await requireAdminSession(request);
    const makeId = new URL(request.url).searchParams.get('makeId') || undefined;
    const entries = await Promise.all(Object.entries(TYPES).map(async ([type, config]) => [
      config.key,
      await config.list(...(type === 'model' ? [makeId] : [])),
    ]));
    return Response.json(Object.fromEntries(entries));
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    await requireAdminSession(request);
    const body = await request.json();
    const config = TYPES[body.type];
    if (!config) throw badRequest('Unknown lookup type.');
    const name = normalizedName(body.name);
    if (body.type === 'model') {
      if (typeof body.makeId !== 'string' || !body.makeId) throw badRequest('makeId is required for a model.');
      const item = await config.create(body.makeId, name);
      revalidateInventory();
      return Response.json({ item }, { status: 201 });
    }
    const item = await config.create(name);
    revalidateInventory();
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(request) {
  try {
    await requireAdminSession(request);
    const body = await request.json();
    const config = TYPES[body.type];
    if (!config) throw badRequest('Unknown lookup type.');
    if (typeof body.id !== 'string' || !body.id) throw badRequest('id is required.');
    const name = normalizedName(body.name);
    const item = body.type === 'model'
      ? await config.update(body.id, name, body.makeId)
      : await config.update(body.id, name);
    if (!item) return Response.json({ message: 'Lookup not found.' }, { status: 404 });
    revalidateInventory();
    return Response.json({ item });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request) {
  try {
    await requireAdminSession(request);
    const body = await request.json();
    const config = TYPES[body.type];
    if (!config) throw badRequest('Unknown lookup type.');
    if (typeof body.id !== 'string' || !body.id) throw badRequest('id is required.');
    const deleted = await config.remove(body.id);
    if (!deleted) return Response.json({ message: 'Lookup not found.' }, { status: 404 });
    revalidateInventory();
    return Response.json({ success: true });
  } catch (error) {
    return adminErrorResponse(error);
  }
}