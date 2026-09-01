import { AnimationFrame } from '@/Core/Modules/animations';

export function parseTransformFrame(raw: string): AnimationFrame | null {
  const source = raw.trim();
  if (source === '') return null;

  try {
    // null 视为未设置该属性，否则会被写入 pixi 容器或动画插值，导致渲染中断
    const parsed: unknown = JSON.parse(source, (_key, value) => (value === null ? undefined : value));
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
