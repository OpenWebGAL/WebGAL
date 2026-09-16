export interface ICharacterSelector {
  characterName: string;
  items: string[];
}

export interface ICharacterCanvas {
  width: number;
  height: number;
}

export interface ICharacterComponent {
  src: string;
  x: number;
  y: number;
  scale?: number;
  width?: number;
  height?: number;
}

export interface ICharacterPreset {
  /** 预设自己的合成画布；立绘组可使用默认底图的裁剪后尺寸。 */
  canvas?: ICharacterCanvas;
  items: string[];
}

export type ICharacterPresetDefinition = string[] | ICharacterPreset;

export interface ICharacterTemplate {
  Version: 1;
  canvas: ICharacterCanvas;
  components: Record<string, ICharacterComponent>;
  presets?: Record<string, ICharacterPresetDefinition>;
}

export interface ICharacterCompositionLayer extends ICharacterComponent {
  name: string;
}

export interface ICharacterComposition {
  canvas: ICharacterCanvas;
  layers: ICharacterCompositionLayer[];
}

const MAX_CHARACTER_CANVAS_EDGE = 8192;
const MAX_CHARACTER_CANVAS_PIXELS = 16_777_216;

export class CharacterTemplateError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'CharacterTemplateError';
  }
}

export function parseCharacterSelector(rawSelector: string): ICharacterSelector {
  const selector = rawSelector.trim();
  const separatorIndex = selector.indexOf('/');
  const characterName = (separatorIndex >= 0 ? selector.slice(0, separatorIndex) : selector).trim();
  if (!characterName || characterName === '.' || characterName === '..' || /[\\/%?#]/.test(characterName)) {
    throw new CharacterTemplateError(`非法角色名：${characterName || '(空)'}`);
  }

  if (separatorIndex < 0) {
    return { characterName, items: [] };
  }

  const rawItems = selector.slice(separatorIndex + 1);
  const items = rawItems.split(',').map((item) => item.trim());
  if (items.length === 0 || items.some((item) => item === '')) {
    throw new CharacterTemplateError(`角色 ${characterName} 的组合列表不能为空`);
  }
  return { characterName, items };
}

export function resolveCharacterTemplateSelection(
  template: ICharacterTemplate,
  items: string[],
): ICharacterComposition {
  if (items.length === 0) {
    throw new CharacterTemplateError('组合列表不能为空');
  }

  const layers: ICharacterCompositionLayer[] = [];
  let selectedCanvas: ICharacterCanvas | undefined;
  const expandItem = (name: string): void => {
    if (hasOwn(template.components, name)) {
      const component = template.components[name];
      layers.push(normalizeCompositionLayer(name, component));
      return;
    }
    if (hasOwn(template.presets, name)) {
      const preset = template.presets![name];
      const presetCanvas = getPresetCanvas(preset);
      if (presetCanvas) {
        if (selectedCanvas && !sameCanvas(selectedCanvas, presetCanvas)) {
          throw new CharacterTemplateError('一次角色组合选择不能混用不同预设画布');
        }
        selectedCanvas = presetCanvas;
      }
      getPresetItems(preset).forEach(expandItem);
      return;
    }
    throw new CharacterTemplateError(`未找到角色部件或预设：${name}`);
  };
  items.forEach((item) => expandItem(item));

  return {
    canvas: { ...(selectedCanvas ?? template.canvas) },
    layers,
  };
}

export function validateCharacterTemplate(template: ICharacterTemplate): void {
  if (!template || typeof template !== 'object' || Array.isArray(template)) {
    throw new CharacterTemplateError('角色模板必须是对象');
  }
  if (template.Version !== 1) {
    throw new CharacterTemplateError(`不支持的角色模板版本：${String(template.Version)}`);
  }
  validateCanvas(template.canvas, '角色模板画布');
  if (!template.components || typeof template.components !== 'object' || Array.isArray(template.components)) {
    throw new CharacterTemplateError('角色模板 components 必须是对象');
  }
  if (
    template.presets !== undefined &&
    (!template.presets || typeof template.presets !== 'object' || Array.isArray(template.presets))
  ) {
    throw new CharacterTemplateError('角色模板 presets 必须是对象');
  }
  const duplicateName = Object.keys(template.presets ?? {}).find((name) => hasOwn(template.components, name));
  if (duplicateName) {
    throw new CharacterTemplateError(`角色模板部件与预设名称重复：${duplicateName}`);
  }
  Object.entries(template.components).forEach(([name, component]) => validateComponent(name, component));
  Object.entries(template.presets ?? {}).forEach(([presetName, preset]) => {
    if (!Array.isArray(preset) && (!preset || typeof preset !== 'object' || !Array.isArray(preset.items))) {
      throw new CharacterTemplateError(`角色组合预设 ${presetName} 必须是列表或带 items 的对象`);
    }
    const presetItems = getPresetItems(preset);
    if (presetItems.length === 0) {
      throw new CharacterTemplateError(`角色组合预设 ${presetName} 的列表不能为空`);
    }
    const presetCanvas = getPresetCanvas(preset);
    if (presetCanvas) {
      validateCanvas(presetCanvas, `角色组合预设 ${presetName} 的画布`);
    }
    presetItems.forEach((item) => {
      if (typeof item !== 'string' || !item) {
        throw new CharacterTemplateError(`角色组合预设 ${presetName} 包含非法引用`);
      }
      if (!hasOwn(template.components, item) && !hasOwn(template.presets, item)) {
        throw new CharacterTemplateError(`角色组合预设 ${presetName} 引用了不存在的部件或预设：${item}`);
      }
    });
  });
  validatePresetCycles(template);
}

function validatePresetCycles(template: ICharacterTemplate): void {
  const visited = new Set<string>();
  const visit = (name: string, stack: string[]): void => {
    // visited 允许不同分支复用预设，只有当前递归链上的重复才构成循环。
    if (hasOwn(template.components, name) || visited.has(name)) {
      return;
    }
    const cycleStart = stack.indexOf(name);
    if (cycleStart >= 0) {
      const cycle = [...stack.slice(cycleStart), name].join(' -> ');
      throw new CharacterTemplateError(`角色组合预设存在循环引用：${cycle}`);
    }
    getPresetItems(template.presets![name]).forEach((item) => visit(item, [...stack, name]));
    visited.add(name);
  };
  Object.keys(template.presets ?? {}).forEach((name) => visit(name, []));
}

function validateComponent(name: string, component: ICharacterComponent) {
  if (!component || typeof component !== 'object' || typeof component.src !== 'string' || !component.src.trim()) {
    throw new CharacterTemplateError(`角色部件 ${name} 缺少有效的 src`);
  }
  validateCharacterComponentPath(component.src);
  if (![component.x, component.y].every(Number.isFinite)) {
    throw new CharacterTemplateError(`角色部件 ${name} 的 x、y 必须是有限数值`);
  }

  const hasScale = component.scale !== undefined;
  const hasWidth = component.width !== undefined;
  const hasHeight = component.height !== undefined;
  if (hasScale && (hasWidth || hasHeight)) {
    throw new CharacterTemplateError(`角色部件 ${name} 的 scale 不能与 width、height 同时提供`);
  }
  if (hasWidth !== hasHeight) {
    throw new CharacterTemplateError(`角色部件 ${name} 的 width、height 必须成对提供`);
  }
  if (hasScale && !isFinitePositiveNumber(component.scale)) {
    throw new CharacterTemplateError(`角色部件 ${name} 的 scale 必须是有限正数`);
  }
  if (hasWidth && (!isFinitePositiveNumber(component.width) || !isFinitePositiveNumber(component.height))) {
    throw new CharacterTemplateError(`角色部件 ${name} 的 width、height 必须是有限正数`);
  }
}

function normalizeCompositionLayer(name: string, component: ICharacterComponent): ICharacterCompositionLayer {
  const layer = { name, src: component.src, x: component.x, y: component.y };
  if (component.scale !== undefined) {
    return { ...layer, scale: component.scale };
  }
  if (component.width !== undefined && component.height !== undefined) {
    return { ...layer, width: component.width, height: component.height };
  }
  return layer;
}

function getPresetItems(preset: ICharacterPresetDefinition): string[] {
  return Array.isArray(preset) ? preset : preset.items;
}

function getPresetCanvas(preset: ICharacterPresetDefinition): ICharacterCanvas | undefined {
  return Array.isArray(preset) ? undefined : preset.canvas;
}

function validateCanvas(canvas: ICharacterCanvas, label: string): void {
  if (!isPositiveInteger(canvas?.width) || !isPositiveInteger(canvas?.height)) {
    throw new CharacterTemplateError(`${label}宽高必须是正整数`);
  }
  if (canvas.width > MAX_CHARACTER_CANVAS_EDGE || canvas.height > MAX_CHARACTER_CANVAS_EDGE) {
    throw new CharacterTemplateError(`${label}单边不能超过 ${MAX_CHARACTER_CANVAS_EDGE}`);
  }
  if (canvas.width * canvas.height > MAX_CHARACTER_CANVAS_PIXELS) {
    throw new CharacterTemplateError(`${label}总像素不能超过 ${MAX_CHARACTER_CANVAS_PIXELS}`);
  }
}

function sameCanvas(left: ICharacterCanvas, right: ICharacterCanvas): boolean {
  return left.width === right.width && left.height === right.height;
}

export function validateCharacterComponentPath(componentPath: string): void {
  if (isNonRelativeComponentPath(componentPath)) {
    throw new CharacterTemplateError(`角色部件路径必须相对角色目录：${componentPath}`);
  }
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(componentPath);
  } catch {
    throw new CharacterTemplateError(`角色部件路径包含非法编码：${componentPath}`);
  }
  // 解码后再检查，避免百分号编码隐藏绝对路径或目录回退段。
  if (isNonRelativeComponentPath(decodedPath)) {
    throw new CharacterTemplateError(`角色部件路径必须相对角色目录：${componentPath}`);
  }
  const pathSegments = decodedPath.replace(/\\/g, '/').split('/');
  if (pathSegments.includes('..')) {
    throw new CharacterTemplateError(`角色部件路径越出角色目录：${componentPath}`);
  }
  const resourcePath = decodedPath.split(/[?#]/, 1)[0];
  if (!/\.(?:png|webp|jpe?g)$/i.test(resourcePath)) {
    throw new CharacterTemplateError(`角色部件只支持静态 PNG、WebP 或 JPEG：${componentPath}`);
  }
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
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
