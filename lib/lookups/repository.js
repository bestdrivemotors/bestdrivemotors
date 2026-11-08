import { randomUUID } from 'node:crypto';
import { d1Query } from '@/lib/db/d1';

const TABLES = {
  make: 'make',
  model: 'model',
  fuelType: 'fuel_type',
  bodyStyle: 'body_style',
  feature: 'feature',
};

function mapLookup(row) {
  if (!row) return null;
  const result = { id: row.id, name: row.name, createdAt: row.created_at };
  if (row.make_id != null) result.makeId = row.make_id;
  return result;
}

async function list(table, makeId) {
  const rows = makeId && table === TABLES.model
    ? await d1Query('SELECT * FROM model WHERE make_id = ? ORDER BY name COLLATE NOCASE', [makeId])
    : await d1Query(`SELECT * FROM ${table} ORDER BY name COLLATE NOCASE`);
  return rows.map(mapLookup);
}

async function create(table, name, makeId) {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const model = table === TABLES.model;
  const columns = model ? 'id, make_id, name, created_at' : 'id, name, created_at';
  const values = model ? [id, makeId, name, createdAt] : [id, name, createdAt];
  const placeholders = values.map(() => '?').join(', ');
  const rows = await d1Query(
    `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
    values,
  );
  return mapLookup(rows[0] ?? (model
    ? { id, make_id: makeId, name, created_at: createdAt }
    : { id, name, created_at: createdAt }));
}

async function update(table, id, name, makeId) {
  const model = table === TABLES.model;
  const rows = model && makeId
    ? await d1Query('UPDATE model SET make_id = ?, name = ? WHERE id = ? RETURNING *', [makeId, name, id])
    : await d1Query(`UPDATE ${table} SET name = ? WHERE id = ? RETURNING *`, [name, id]);
  return mapLookup(rows[0]);
}

async function remove(table, id) {
  const rows = await d1Query(`DELETE FROM ${table} WHERE id = ? RETURNING id`, [id]);
  return rows.length > 0;
}

export const listMakes = () => list(TABLES.make);
export const createMake = (name) => create(TABLES.make, name);
export const updateMake = (id, name) => update(TABLES.make, id, name);
export const deleteMake = (id) => remove(TABLES.make, id);

export const listModels = (makeId) => list(TABLES.model, makeId);
export const createModel = (makeId, name) => create(TABLES.model, name, makeId);
export const updateModel = (id, name, makeId) => update(TABLES.model, id, name, makeId);
export const deleteModel = (id) => remove(TABLES.model, id);

export const listFuelTypes = () => list(TABLES.fuelType);
export const createFuelType = (name) => create(TABLES.fuelType, name);
export const updateFuelType = (id, name) => update(TABLES.fuelType, id, name);
export const deleteFuelType = (id) => remove(TABLES.fuelType, id);

export const listBodyStyles = () => list(TABLES.bodyStyle);
export const createBodyStyle = (name) => create(TABLES.bodyStyle, name);
export const updateBodyStyle = (id, name) => update(TABLES.bodyStyle, id, name);
export const deleteBodyStyle = (id) => remove(TABLES.bodyStyle, id);

export const listFeatures = () => list(TABLES.feature);
export const createFeature = (name) => create(TABLES.feature, name);
export const updateFeature = (id, name) => update(TABLES.feature, id, name);
export const deleteFeature = (id) => remove(TABLES.feature, id);