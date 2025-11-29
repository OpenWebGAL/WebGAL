import { FontOption } from '@/store/guiInterface';
import { TemplateFontDescriptor } from '@/types/template';

export const DEFAULT_FONT_OPTIONS: FontOption[] = [
  {
    family: `'思源宋体', serif`,
    source: 'default',
    labelKey: 'textFont.options.siYuanSimSun',
  },
  {
    family: `'WebgalUI', serif`,
    source: 'default',
    labelKey: 'textFont.options.SimHei',
  },
  {
    family: `'LXGW', serif`,
    source: 'default',
    labelKey: 'textFont.options.lxgw',
  },
];

export const FALLBACK_FONT_FAMILY = DEFAULT_FONT_OPTIONS[1].family;

export function buildFontOptionsFromTemplate(fonts: TemplateFontDescriptor[]): FontOption[] {
  const templateOptions: FontOption[] = fonts.map((font) => ({
    family: formatFontFamily(font['font-family']),
    source: 'template',
    label: font['font-family'],
  }));

  const combined = [...templateOptions, ...DEFAULT_FONT_OPTIONS];

  const seen = new Set<string>();
  return combined.filter((option) => {
    if (seen.has(option.family)) return false;
    seen.add(option.family);
    return true;
  });
}

export function formatFontFamily(fontFamily: string): string {
  const trimmed = fontFamily.trim();
  const needsQuote = /\s/.test(trimmed);
  const normalized = needsQuote ? `'${trimmed}'` : trimmed;
  return `${normalized}, serif`;
}
