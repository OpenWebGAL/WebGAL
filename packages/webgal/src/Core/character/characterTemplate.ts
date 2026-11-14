import { logger } from '@/Core/util/logger';

export interface ICharacterCanvas {
  width: number;
  height: number;
}

export interface ICharacterComponent {
  src: string;
  x?: number;
  y?: number;
  scale?: number;
  width?: number;
  height?: number;
}

export interface ICharacterTemplate {
  version: 1;
  canvas?: ICharacterCanvas;
  components: Record<string, ICharacterComponent>;
  presets?: Record<string, string[]>;
}

export interface ICharacterSelection {
  preset?: string;
  components?: readonly string[];
}

export interface ICharacterContentTarget {
  characterName: string;
  preset?: string;
}

export interface ICharacterCompositionLayer extends ICharacterComponent {
  name: string;
  x: number;
  y: number;
}

export interface ICharacterComposition {
  canvas: ICharacterCanvas | null;
  layers: ICharacterCompositionLayer[];
}

const MAX_CHARACTER_CANVAS_EDGE = 8192;

export function parseCharacterContent(rawContent: string): ICharacterContentTarget | null {
  const content = rawContent.trim().replace(/\\/g, '/');
  if (!content || content.startsWith('/') || content.endsWith('/') || /[:%?#]/.test(content)) {
    return null;
  }

  const lastSlashIndex = content.lastIndexOf('/');
  const dotIndex = content.lastIndexOf('.');
  // 仅将最后一级路径段中的最后一个 "." 视为预设分隔符，避免误切上级目录名中的 "."
  const hasPresetSeparator = dotIndex > lastSlashIndex;
  const characterName = (hasPresetSeparator ? content.slice(0, dotIndex) : content).trim();
  const segments = characterName.split('/');
  if (!characterName || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    return null;
  }

  const preset = hasPresetSeparator ? content.slice(dotIndex + 1).trim() : '';
  return preset ? { characterName, preset } : { characterName };
}

export function parseCharacterComponentsArg(
  rawArg: string | number | boolean | null | undefined,
): string[] | undefined {
  if (rawArg === null || rawArg === undefined || typeof rawArg === 'boolean') {
    return undefined;
  }
  const items = String(rawArg)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function resolveCharacterTemplateSelection(
  template: unknown,
  selection: ICharacterSelection = {},
): ICharacterComposition {
  const canvas = resolveTemplateCanvas(template);
  if (isPlainRecord(template)) {
    const rawVersion = template.version;
    if (rawVersion !== undefined && rawVersion !== 1) {
      logger.warn(`不支持的角色模板版本：${String(rawVersion)}，将按版本 1 解析`);
    }
  }
  if (!isPlainRecord(template) || !isPlainRecord(template.components)) {
    logger.warn('角色模板缺少有效的 components 定义');
    return { canvas, layers: [] };
  }

  const componentNames = resolveSelectedComponentNames(template, selection);
  const layers: ICharacterCompositionLayer[] = [];

  for (const name of componentNames) {
    if (!hasOwn(template.components, name)) {
      logger.warn(`未找到角色部件，已跳过：${name}`);
      continue;
    }
    const layer = normalizeCompositionLayer(name, template.components[name]);
    if (!layer) {
      logger.warn(`角色部件定义无效，已跳过：${name}`);
      continue;
    }
    layers.push(layer);
  }

  return { canvas, layers };
}

export function resolveCharacterComponentUrl(
  componentPath: string,
  templateUrl: string,
  baseHref = (typeof document !== 'undefined' && document.baseURI) ||
    (typeof window !== 'undefined' ? window.location.href : 'http://localhost/'),
): string | null {
  if (typeof componentPath !== 'string' || !componentPath.trim()) {
    logger.warn('角色部件路径为空，已跳过');
    return null;
  }
  const trimmedPath = componentPath.trim();
  if (isNonRelativeComponentPath(trimmedPath)) {
    logger.warn(`角色部件路径必须相对角色目录，已跳过：${componentPath}`);
    return null;
  }

  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(trimmedPath);
  } catch {
    logger.warn(`角色部件路径包含非法编码，已跳过：${componentPath}`);
    return null;
  }

  // 解码后再检查，避免百分号编码隐藏绝对路径或目录回退段。
  if (isNonRelativeComponentPath(decodedPath)) {
    logger.warn(`角色部件路径必须相对角色目录，已跳过：${componentPath}`);
    return null;
  }
  if (decodedPath.replace(/\\/g, '/').split('/').includes('..')) {
    logger.warn(`角色部件路径越出角色目录，已跳过：${componentPath}`);
    return null;
  }

  const resourcePath = decodedPath.split(/[?#]/, 1)[0];
  if (!/\.(?:png|webp|jpe?g|avif|bmp|svg)$/i.test(resourcePath)) {
    logger.warn(`角色部件图片格式不受支持，已跳过：${componentPath}`);
    return null;
  }

  try {
    const characterDirectoryUrl = new URL('./', new URL(templateUrl, baseHref));
    const componentUrl = new URL(trimmedPath, characterDirectoryUrl);
    if (
      componentUrl.origin !== characterDirectoryUrl.origin ||
      !componentUrl.pathname.startsWith(characterDirectoryUrl.pathname)
    ) {
      logger.warn(`角色部件路径越出角色目录，已跳过：${componentPath}`);
      return null;
    }
    return componentUrl.toString();
  } catch {
    logger.warn(`角色部件路径解析失败，已跳过：${componentPath}`);
    return null;
  }
}

function resolveTemplateCanvas(template: unknown): ICharacterCanvas | null {
  if (!isPlainRecord(template) || !isPlainRecord(template.canvas)) {
    return null;
  }
  const { width, height } = template.canvas;
  if (!isFinitePositiveNumber(width) || !isFinitePositiveNumber(height)) {
    return null;
  }
  return {
    width: Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.round(width))),
    height: Math.min(MAX_CHARACTER_CANVAS_EDGE, Math.max(1, Math.round(height))),
  };
}

function resolveSelectedComponentNames(template: Record<string, unknown>, selection: ICharacterSelection): string[] {
  const customItems = selection.components
    ?.map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  if (customItems && customItems.length > 0) {
    return customItems;
  }

  const presets = isPlainRecord(template.presets) ? template.presets : undefined;
  if (selection.preset) {
    const presetItems =
      presets && hasOwn(presets, selection.preset) ? extractStringItems(presets[selection.preset]) : null;
    if (presetItems) {
      return presetItems;
    }
    logger.warn(`未找到角色预设或预设为空：${selection.preset}，将回退到默认预设`);
  }

  const fallbackItems = resolveFirstValidPreset(presets);
  if (!fallbackItems) {
    logger.warn('角色模板未定义任何有效预设');
    return [];
  }
  return fallbackItems;
}

function resolveFirstValidPreset(presets: Record<string, unknown> | undefined): string[] | null {
  if (!presets) {
    return null;
  }
  for (const preset of Object.values(presets)) {
    const items = extractStringItems(preset);
    if (items) {
      return items;
    }
  }
  return null;
}

function extractStringItems(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const items = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
  return items.length > 0 ? items : null;
}

function normalizeCompositionLayer(name: string, rawComponent: unknown): ICharacterCompositionLayer | null {
  if (!isPlainRecord(rawComponent) || typeof rawComponent.src !== 'string' || !rawComponent.src.trim()) {
    return null;
  }
  const layer: ICharacterCompositionLayer = {
    name,
    src: rawComponent.src.trim(),
    x: Number.isFinite(rawComponent.x) ? rawComponent.x : 0,
    y: Number.isFinite(rawComponent.y) ? rawComponent.y : 0,
  };
  if (isFinitePositiveNumber(rawComponent.width) && isFinitePositiveNumber(rawComponent.height)) {
    return { ...layer, width: rawComponent.width, height: rawComponent.height };
  }
  if (isFinitePositiveNumber(rawComponent.scale)) {
    return { ...layer, scale: rawComponent.scale };
  }
  return layer;
}

function isPlainRecord(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isFinitePositiveNumber(value: unknown): value is number {
  return Number.isFinite(value) && (value as number) > 0;
}

function isNonRelativeComponentPath(componentPath: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(componentPath);
}

function hasOwn(record: object | undefined, key: string): boolean {
  return record !== undefined && Object.prototype.hasOwnProperty.call(record, key);
}
