import axios from 'axios';
import { __INFO } from '@/config/info';
import { logger } from '@/Core/util/logger';
import { notifyTemplateIncompatible } from '@/Core/util/syncWithEditor/runtime/uiEditorBridge';
import { WebGAL } from '@/Core/WebGAL';
import { TemplateFontDescriptor, WebgalTemplate } from '@/types/template';
import { buildFontOptionsFromTemplate } from '@/Core/util/fonts/fontOptions';
import { webgalStore } from '@/store/store';
import { setFontOptions } from '@/store/GUIReducer';
import { setOptionData } from '@/store/userDataReducer';
import { checkTemplateCompatibility } from '@/screens/screenRegistry';
import { reloadTemplateScreens } from '@/screens/screenLoader';

const TEMPLATE_PATH = './game/template/template.json';
const TEMPLATE_FONT_STYLE_SELECTOR = 'style[data-webgal-template-fonts]';
let styleUpdateListenerAttached = false;

function ensureStyleUpdateListener(): void {
  if (styleUpdateListenerAttached) return;
  styleUpdateListenerAttached = true;
  WebGAL.events.styleUpdate.on(() => {
    void loadTemplate();
  });
}

export async function loadTemplate(): Promise<WebgalTemplate | null> {
  ensureStyleUpdateListener();
  try {
    const { data } = await axios.get<WebgalTemplate>(`${TEMPLATE_PATH}?t=${Date.now()}`);
    const compat = checkTemplateCompatibility(data, __INFO.version);
    if (!compat.compatible) {
      // eslint-disable-next-line no-console
      console.warn(
        `[WebGAL] 模板 "${data?.name ?? 'unknown'}" (webgal-version: ${
          data?.['webgal-version'] ?? 'unknown'
        }) 与当前引擎 (${__INFO.version}) 不兼容，已回退至内置默认界面。`,
      );
      notifyTemplateIncompatible({
        templateName: data?.name,
        templateVersion: data?.['webgal-version'],
        engineVersion: __INFO.version,
        reason: compat.reason,
      });
      WebGAL.template = null;
      updateFontOptions([]);
      await reloadTemplateScreens(null);
      WebGAL.events.afterStyleUpdate.emit();
      return null;
    }

    notifyTemplateIncompatible(null);
    WebGAL.template = data;
    const fonts = data.fonts ?? [];
    injectTemplateFonts(fonts);
    updateFontOptions(fonts);
    await reloadTemplateScreens(data);
    WebGAL.events.afterStyleUpdate.emit();
    WebGAL.events.templateLoaded.emit(data);
    return data;
  } catch (error) {
    logger.warn('加载模板文件失败', error);
    notifyTemplateIncompatible(null);
    WebGAL.template = null;
    updateFontOptions([]);
    await reloadTemplateScreens(null);
    WebGAL.events.afterStyleUpdate.emit();
    return null;
  }
}

function updateFontOptions(fonts: TemplateFontDescriptor[]): void {
  const options = buildFontOptionsFromTemplate(fonts);
  webgalStore.dispatch(setFontOptions(options));
  const currentIndex = webgalStore.getState().userData.optionData.textboxFont ?? 0;
  if (options.length === 0) return;
  if (currentIndex >= options.length) {
    webgalStore.dispatch(setOptionData({ key: 'textboxFont', value: 0 }));
  }
}

function injectTemplateFonts(fonts: TemplateFontDescriptor[]): void {
  const head = document.head;
  if (!head) return;

  const existing = head.querySelector<HTMLStyleElement>(TEMPLATE_FONT_STYLE_SELECTOR);
  existing?.remove();

  if (!fonts.length) return;
  const rules = fonts.map((font) => generateFontFaceRule(font)).filter((rule): rule is string => Boolean(rule));
  if (!rules.length) return;

  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-webgal-template-fonts', 'true');
  styleElement.appendChild(document.createTextNode(rules.join('\n')));
  head.appendChild(styleElement);
}

function generateFontFaceRule(font: TemplateFontDescriptor): string | null {
  const fontFamily = font['font-family'];
  if (!fontFamily || !font.url || !font.type) {
    logger.warn('忽略无效的模板字体配置', font);
    return null;
  }

  const src = resolveTemplateAssetPath(font.url);
  const weight = font.weight !== undefined ? `font-weight: ${font.weight};` : '';
  const style = font.style ? `font-style: ${font.style};` : '';
  const display = `font-display: ${font.display ?? 'swap'};`;

  return `@font-face { font-family: '${fontFamily}'; src: url('${src}') format('${font.type}'); ${weight} ${style} ${display} }`;
}

function resolveTemplateAssetPath(path: string): string {
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path;
  }
  const normalized = path.replace(/^[./]+/, '');
  return `./game/template/${normalized}`;
}
