import { AnimationFrame } from '@/Core/Modules/animations';

export function parseTransformFrame(raw: string): AnimationFrame | null {
  const source = raw.trim();
  if (source === '') return null;

  try {
    const parsed: unknown = JSON.parse(source);
    return isTransformFrame(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseSetTransformFrame(raw: string): AnimationFrame | null {
  return parseTransformFrame(raw.trim() === '' ? '{}' : raw);
}

function isTransformFrame(value: unknown): value is AnimationFrame {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
