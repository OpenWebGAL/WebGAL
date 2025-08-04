export function toSafeBoolean(value: null | string | boolean | number): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return null;
}

export function toSafeNumber(value: null | string | boolean | number): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const num = Number(value.trim());
    return isNaN(num) ? null : num;
  }
  return null;
}

export function toSafeString(value: null | string | boolean | number): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  return null;
}
