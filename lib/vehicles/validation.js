const REQUIRED_FIELDS = [
  'stockNumber', 'year', 'makeId', 'modelId', 'fuelId', 'bodyId', 'priceNzd', 'odometerKm',
  'transmission', 'drivetrain', 'colour', 'seats', 'doors', 'origin',
];
const ALLOWED_FIELDS = new Set([
  ...REQUIRED_FIELDS, 'status', 'featured', 'variant', 'wofExpiry', 'regoExpiry', 'description', 'featureIds',
]);
const READ_ONLY_FIELDS = new Set([
  'id', 'slug', 'makeName', 'modelName', 'fuelName', 'bodyName', 'createdAt', 'updatedAt',
]);
const ENUMS = {
  status: ['draft', 'available', 'sold'],
  transmission: ['automatic', 'manual', 'cvt'],
  drivetrain: ['fwd', 'rwd', 'awd', '4wd'],
  origin: ['nz_new', 'import'],
};

export class VehicleValidationError extends Error {
  constructor(errors) {
    super('Vehicle input is invalid.');
    this.name = 'VehicleValidationError';
    this.errors = errors;
    this.status = 400;
  }
}

function normalizedString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function parseInteger(value) {
  if (typeof value === 'string' && value.trim() === '') return NaN;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : NaN;
}

function parseDate(value) {
  if (value === '' || value == null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

export function normalizeVehicleInput(input, { partial = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new VehicleValidationError(['Expected an object.']);
  }

  const errors = [];
  const output = {};
  for (const key of Object.keys(input)) {
    if (!ALLOWED_FIELDS.has(key) && !READ_ONLY_FIELDS.has(key)) errors.push(`Unexpected field: ${key}.`);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!partial && input[field] == null) errors.push(`${field} is required.`);
  }

  const stringFields = ['stockNumber', 'makeId', 'modelId', 'fuelId', 'bodyId', 'variant', 'colour', 'description'];
  for (const field of stringFields) {
    if (input[field] === undefined) continue;
    const value = normalizedString(input[field]);
    const maxLength = field === 'description' ? 4000 : field === 'variant' || field === 'colour' ? 80 : 64;
    if (field !== 'description' && field !== 'variant' && field !== 'colour' && (!value || typeof value !== 'string')) {
      errors.push(`${field} must be a non-empty string.`);
      continue;
    }
    if (value != null && typeof value !== 'string') {
      errors.push(`${field} must be a string.`);
      continue;
    }
    if (value && value.length > maxLength) errors.push(`${field} is too long.`);
    output[field] = value ?? '';
  }

  const integerFields = ['year', 'priceNzd', 'odometerKm', 'seats', 'doors'];
  for (const field of integerFields) {
    if (input[field] === undefined) continue;
    const value = parseInteger(input[field]);
    const min = field === 'year' ? 1900 : field === 'doors' ? 2 : field === 'seats' ? 1 : 0;
    const max = field === 'year' ? new Date().getFullYear() + 1 : field === 'doors' ? 6 : field === 'seats' ? 12 : Number.MAX_SAFE_INTEGER;
    if (!Number.isInteger(value) || value < min || value > max) {
      errors.push(`${field} is outside the allowed range.`);
    } else {
      output[field] = value;
    }
  }

  for (const [field, values] of Object.entries(ENUMS)) {
    if (input[field] === undefined) continue;
    if (!values.includes(input[field])) errors.push(`${field} must be one of: ${values.join(', ')}.`);
    else output[field] = input[field];
  }

  if (input.featured !== undefined) {
    if (![true, false, 0, 1].includes(input.featured)) errors.push('featured must be a boolean.');
    else output.featured = Boolean(input.featured);
  }
  for (const field of ['wofExpiry', 'regoExpiry']) {
    if (input[field] === undefined) continue;
    const value = parseDate(input[field]);
    if (value === undefined) errors.push(`${field} must be a valid YYYY-MM-DD date.`);
    else output[field] = value;
  }
  if (input.featureIds !== undefined) {
    if (!Array.isArray(input.featureIds) || input.featureIds.some((id) => typeof id !== 'string' || !id.trim())) {
      errors.push('featureIds must be an array of non-empty IDs.');
    } else {
      output.featureIds = [...new Set(input.featureIds.map((id) => id.trim()))];
    }
  }

  if (!partial) {
    output.status ??= 'draft';
    output.featured ??= false;
    output.variant ??= '';
    output.wofExpiry ??= null;
    output.regoExpiry ??= null;
    output.description ??= '';
    output.featureIds ??= [];
  }
  if (errors.length) throw new VehicleValidationError(errors);
  return output;
}