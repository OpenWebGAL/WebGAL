import { logger } from '@/Core/util/logger';

export interface CharacterCanvas {
  width: number;
  height: number;
}

export interface CharacterComponent {
  name: string;
  src: string;
  x?: number;
  y?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface CharacterTemplate {
  version: 1;
  canvas?: CharacterCanvas;
  components: CharacterComponent[];
  presets?: Record<string, string[]>;
}

export interface CharacterSelection {
  preset?: string;
  components?: readonly string[];
}

export interface CharacterLayerSpec {
  src: string;
  x: number;
  y: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface CharacterContentTarget {
  characterName: string;
  preset?: string;
}

export const MAX_CHARACTER_CANVAS_EDGE = 8192;

const CHARACTER_IMAGE_EXTENSIONS = new Set(['png', 'webp', 'jpg', 'jpeg', 'avif', 'bmp', 'svg']);

const isRecord = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPositive = (v: unknown): v is number => isFiniteNumber(v) && v > 0;
const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);

const toNonEmptyStrings = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const items = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  return items.length > 0 ? items : null;
};

export function parseCharacterContent(rawContent: string): CharacterContentTarget | null {
  const content = rawContent.trim().replace(/\\/g, '/');
  if (!content || content.startsWith('/') || content.endsWith('/') || /[:%?#]/.test(content)) return null;

  const lastSlash = content.lastIndexOf('/');
  const dot = content.lastIndexOf('.');
  // 仅将最后一级路径段中的最后一个 "." 视为预设分隔符，避免误切上级目录名中的 "."
  const hasPreset = dot > lastSlash;
  const characterName = (hasPreset ? content.slice(0, dot) : content).trim();
  if (!characterName || characterName.split('/').some((seg) => !seg || seg === '.' || seg === '..')) return null;

  const preset = hasPreset ? content.slice(dot + 1).trim() : '';
  return preset ? { characterName, preset } : { characterName };
}

export function parseCharacterComponentsArg(
  rawArg: string | number | boolean | null | undefined,
): string[] | undefined {
  if (rawArg === null || rawArg === undefined || typeof rawArg === 'boolean') return undefined;
  return toNonEmptyStrings(String(rawArg).split(',')) ?? undefined;
}

export function parseCharacterTarget(
  rawContent: string,
  rawComponents?: string | number | boolean | null,
): { name: string; preset?: string; components?: string[] } | null {
  const parsed = parseCharacterContent(rawContent);
  if (!parsed) return null;
  const components = parseCharacterComponentsArg(rawComponents);
  const preset = components ? undefined : parsed.preset;
  return {
    name: parsed.characterName,
    ...(preset !== undefined ? { preset } : {}),
    ...(components !== undefined ? { components } : {}),
  };
}

function parseCanvas(template: unknown): CharacterCanvas | null {
  if (!isRecord(template) || !isRecord(template.canvas)) return null;
  const { width, height } = template.canvas;
  if (!isPositive(width) || !isPositive(height)) return null;
  return {
    width: Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.round(width))),
    height: Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.round(height))),
  };
}

function selectComponentNames(
  template: Record<string, unknown>,
  selection: CharacterSelection,
  allComponentNames: readonly string[],
): readonly string[] {
  const custom = toNonEmptyStrings(selection.components);
  if (custom) return custom;

  const presets = isRecord(template.presets) ? template.presets : undefined;
  if (selection.preset) {
    const chosen = presets && hasOwn(presets, selection.preset) ? toNonEmptyStrings(presets[selection.preset]) : null;
    if (chosen) return chosen;
    logger.warn(`未找到角色预设或预设为空：${selection.preset}，将回退到默认显示`);
  }

  const fallback = presets ? Object.values(presets).map(toNonEmptyStrings).find(Boolean) ?? null : null;
  return fallback ?? allComponentNames;
}

function toLayerSpec(raw: unknown): CharacterLayerSpec | null {
  if (!isRecord(raw) || typeof raw.src !== 'string' || !raw.src.trim()) return null;
  const x = isFiniteNumber(raw.x) ? raw.x : 0;
  const y = isFiniteNumber(raw.y) ? raw.y : 0;
  const rotation = isFiniteNumber(raw.rotation) && raw.rotation !== 0 ? raw.rotation : undefined;
  const spec: CharacterLayerSpec = {
    src: raw.src.trim(),
    x,
    y,
    ...(rotation !== undefined ? { rotation } : {}),
  };
  if (isPositive(raw.width) && isPositive(raw.height)) {
    return { ...spec, width: raw.width, height: raw.height };
  }
  const baseScale = isPositive(raw.scale) ? raw.scale : undefined;
  const sx = isPositive(raw.scaleX) ? raw.scaleX : baseScale;
  const sy = isPositive(raw.scaleY) ? raw.scaleY : baseScale;
  const scaleX = sx ?? 1;
  const scaleY = sy ?? 1;
  if (scaleX === 1 && scaleY === 1) return spec;
  return scaleX === scaleY ? { ...spec, scale: scaleX, scaleX, scaleY } : { ...spec, scaleX, scaleY };
}

export function resolveCharacterLayers(
  template: unknown,
  selection: CharacterSelection = {},
): { canvas: CharacterCanvas | null; layers: CharacterLayerSpec[] } {
  const canvas = parseCanvas(template);
  if (isRecord(template) && template.version !== undefined && template.version !== 1) {
    logger.warn(`不支持的角色模板版本：${String(template.version)}，将按版本 1 解析`);
  }
  if (!isRecord(template) || !Array.isArray(template.components)) {
    logger.warn('角色模板缺少有效的 components 定义');
    return { canvas, layers: [] };
  }

  const componentMap = new Map<string, unknown>();
  for (const item of template.components) {
    const name = isRecord(item) && typeof item.name === 'string' ? item.name.trim() : '';
    if (!name) {
      logger.warn('角色部件缺少有效名称，已跳过');
      continue;
    }
    if (componentMap.has(name)) {
      logger.warn(`角色部件名称重复，已覆盖同名定义：${name}`);
      componentMap.delete(name);
    }
    componentMap.set(name, item);
  }

  const layers: CharacterLayerSpec[] = [];
  for (const name of selectComponentNames(template, selection, Array.from(componentMap.keys()))) {
    const spec = toLayerSpec(componentMap.get(name));
    if (!spec) {
      logger.warn(`角色部件缺失或定义无效，已跳过：${name}`);
      continue;
    }
    layers.push(spec);
  }
  return { canvas, layers };
}

export function resolveCharacterComponentUrl(
  componentPath: string,
  templateUrl: string,
  baseHref = (typeof document !== 'undefined' && document.baseURI) || 'http://localhost/',
): string | null {
  const trimmed = typeof componentPath === 'string' ? componentPath.trim() : '';
  if (!trimmed) {
    logger.warn('角色部件路径为空，已跳过');
    return null;
  }
  try {
    const decoded = decodeURIComponent(trimmed);
    const unsafe = /^(?:[a-z][a-z\d+.-]*:|[\\/])/i;
    // 解码后再校验，防止百分号编码绕过相对路径与目录越界检查
    if (unsafe.test(trimmed) || unsafe.test(decoded) || decoded.replace(/\\/g, '/').split('/').includes('..')) {
      logger.warn(`角色部件路径必须相对角色目录，已跳过：${componentPath}`);
      return null;
    }
    const baseDir = new URL('./', new URL(templateUrl, baseHref));
    const componentUrl = new URL(trimmed, baseDir);
    if (componentUrl.origin !== baseDir.origin || !componentUrl.pathname.startsWith(baseDir.pathname)) {
      logger.warn(`角色部件路径越出角色目录，已跳过：${componentPath}`);
      return null;
    }
    const fileName = componentUrl.pathname.split('/').pop() ?? '';
    const dotIdx = fileName.lastIndexOf('.');
    const ext = dotIdx > 0 ? fileName.slice(dotIdx + 1).toLowerCase() : '';
    if (!CHARACTER_IMAGE_EXTENSIONS.has(ext)) {
      logger.warn(`角色部件图片格式不受支持，已跳过：${componentPath}`);
      return null;
    }
    return componentUrl.toString();
  } catch {
    logger.warn(`角色部件路径无效，已跳过：${componentPath}`);
    return null;
  }
}
