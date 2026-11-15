import { useEffect, useState } from 'react';
import { compile, DECLARATION, middleware, prefixer, RULESET, serialize, stringify, type StylisElement } from 'stylis';
import type { ScreenPartDefinition, UiPseudoState, UiScreenId } from '@/screens/contracts';
import { getBuiltInScreenVariant, hasBuiltInScreenVariant } from '@/screens/screenRegistry';

export interface ScreenStyleRecord {
  screen: UiScreenId;
  variantId: string | null;
  scssPath: string | null;
  screenBaseUrl: string | null;
  defaultCssText: string;
  diskScssText: string;
  previewScssText: string | null;
  parts: ScreenPartDefinition[];
}

export interface PseudoLockState {
  screen: UiScreenId | null;
  selector: string | null;
  pseudoState: UiPseudoState;
}

const STYLE_ATTR = 'data-webgal-screen-style';
const PSEUDO_ATTR = 'data-webgal-pseudo-lock';

const screenRecords = new Map<UiScreenId, ScreenStyleRecord>();
const screenListeners = new Map<UiScreenId, Set<() => void>>();
const globalListeners = new Set<() => void>();

let pseudoLock: PseudoLockState = {
  screen: null,
  selector: null,
  pseudoState: 'default',
};

function getOrCreateRecord(screen: UiScreenId): ScreenStyleRecord {
  let rec = screenRecords.get(screen);
  if (!rec) {
    rec = {
      screen,
      variantId: null,
      scssPath: null,
      screenBaseUrl: null,
      defaultCssText: '',
      diskScssText: '',
      previewScssText: null,
      parts: [],
    };
    screenRecords.set(screen, rec);
  }
  return rec;
}

function notifyScreen(screen: UiScreenId): void {
  applyScreenStyleTag(screen);
  syncPseudoLockDom(screen);
  screenListeners.get(screen)?.forEach((cb) => cb());
  globalListeners.forEach((cb) => cb());
}

export function resolveScreenAssetUrl(relativePath: string, screenBaseUrl?: string | null): string {
  const trimmed = relativePath.trim();
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    /^(https?:)?\/\//i.test(trimmed) ||
    /^(data|blob):/i.test(trimmed) ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./game/') ||
    trimmed.startsWith('game/')
  ) {
    return trimmed;
  }
  const normalized = trimmed.replace(/^(?:\.\/)+/, '');
  const base = screenBaseUrl ? (screenBaseUrl.endsWith('/') ? screenBaseUrl : `${screenBaseUrl}/`) : './game/template/';
  if (normalized.startsWith('../')) {
    try {
      const basePath = base.replace(/^(?:\.\/)+/, '');
      const resolved = new URL(normalized, `https://webgal.invalid/${basePath}`);
      return `.${resolved.pathname}`;
    } catch {
      return `${base}${normalized}`;
    }
  }
  return `${base}${normalized}`;
}

function rewriteCssAssetUrls(cssText: string, screenBaseUrl: string | null): string {
  if (!screenBaseUrl) return cssText;
  return cssText.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (full, quote: string, rawUrl: string) => {
    const resolved = resolveScreenAssetUrl(rawUrl, screenBaseUrl);
    if (resolved === rawUrl) return full;
    return `url(${quote || '"'}${resolved}${quote || '"'})`;
  });
}

function scopeSelector(selector: string, screen: UiScreenId): string[] {
  const trimmed = selector.trim();
  if (!trimmed) return [];
  const scopePrefix = `[data-webgal-screen="${screen}"]`;
  if (trimmed.startsWith(scopePrefix)) return [trimmed];
  if (trimmed === ':root' || trimmed === '&') return [scopePrefix];
  if (/^[.#\[]/.test(trimmed)) {
    return [`${scopePrefix}${trimmed}`, `${scopePrefix} ${trimmed}`];
  }
  return [`${scopePrefix} ${trimmed}`];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appendPseudoLockSelectors(selectors: string[], screen: UiScreenId): string[] {
  if (pseudoLock.screen !== screen || !pseudoLock.selector || pseudoLock.pseudoState === 'default') {
    return [];
  }
  const targetSelector = pseudoLock.selector.trim();
  const pseudoSuffix = `:${pseudoLock.pseudoState}`;
  const pattern = new RegExp(
    `(^|[\\s>+~,(])${escapeRegExp(targetSelector)}${escapeRegExp(pseudoSuffix)}(?=$|[\\s>+~,.#:[\\)])`,
    'g',
  );
  const extra: string[] = [];

  for (const raw of selectors) {
    const trimmed = raw.trim();
    if (!pattern.test(trimmed)) {
      pattern.lastIndex = 0;
      continue;
    }
    pattern.lastIndex = 0;
    const replaced = trimmed.replace(pattern, `$1${targetSelector}[${PSEUDO_ATTR}="${pseudoLock.pseudoState}"]`);
    extra.push(...scopeSelector(replaced, screen));
  }
  return extra;
}

function transformAst(
  elements: StylisElement[],
  screen: UiScreenId,
  screenBaseUrl: string | null,
  insideKeyframes = false,
): void {
  for (const el of elements) {
    if (el.type === '@keyframes' || el.type === '@-webkit-keyframes') {
      continue;
    }
    if (!insideKeyframes && el.type === RULESET && Array.isArray(el.props)) {
      const nextProps: string[] = [];
      for (const prop of el.props) {
        nextProps.push(...scopeSelector(prop, screen));
      }
      nextProps.push(...appendPseudoLockSelectors(el.props, screen));
      el.props = nextProps;
    }
    if (el.type === DECLARATION && typeof el.children === 'string' && el.children.includes('url(')) {
      el.children = rewriteCssAssetUrls(el.children, screenBaseUrl);
      el.value = `${typeof el.props === 'string' ? el.props : el.props.join('')}:${el.children};`;
    }
    if (Array.isArray(el.children)) {
      transformAst(el.children, screen, screenBaseUrl, insideKeyframes);
    }
  }
}

export function compileScopedScreenCss(screen: UiScreenId, cssText: string, screenBaseUrl: string | null): string {
  if (!cssText.trim()) return '';
  const ast = compile(cssText);
  transformAst(ast, screen, screenBaseUrl);
  return serialize(ast, middleware([prefixer, stringify]));
}

function applyScreenStyleTag(screen: UiScreenId): void {
  if (typeof document === 'undefined') return;
  const rec = screenRecords.get(screen);
  const selector = `style[${STYLE_ATTR}="${screen}"]`;
  const existing = document.head.querySelector<HTMLStyleElement>(selector);

  if (!rec) {
    existing?.remove();
    return;
  }

  const candidateCss = rec.previewScssText !== null ? rec.previewScssText : rec.diskScssText;
  const activeCss = candidateCss.trim() !== '' ? candidateCss : rec.defaultCssText;
  const compiled = compileScopedScreenCss(screen, activeCss, rec.screenBaseUrl);

  if (!compiled) {
    existing?.remove();
    return;
  }

  const styleEl = existing ?? document.createElement('style');
  if (!existing) {
    styleEl.setAttribute(STYLE_ATTR, screen);
    document.head.appendChild(styleEl);
  }
  if (styleEl.textContent !== compiled) {
    styleEl.textContent = compiled;
  }
}

export function syncPseudoLockDom(screen?: UiScreenId): void {
  if (typeof document === 'undefined') return;
  const targets = screen ? [screen] : Array.from(screenRecords.keys());
  for (const s of targets) {
    const root = document.querySelector(`[data-webgal-screen="${s}"]`);
    if (!root) continue;
    root.removeAttribute(PSEUDO_ATTR);
    root.querySelectorAll(`[${PSEUDO_ATTR}]`).forEach((node) => node.removeAttribute(PSEUDO_ATTR));
    if (pseudoLock.screen === s && pseudoLock.selector && pseudoLock.pseudoState !== 'default') {
      try {
        if (root.matches(pseudoLock.selector)) {
          root.setAttribute(PSEUDO_ATTR, pseudoLock.pseudoState);
        }
        root.querySelectorAll(pseudoLock.selector).forEach((node) => {
          node.setAttribute(PSEUDO_ATTR, pseudoLock.pseudoState);
        });
      } catch {
        // Ignore invalid selector from custom metadata
      }
    }
  }
}

export function registerScreenMetadata(
  screen: UiScreenId,
  parts: ScreenPartDefinition[],
  defaultCssText: string,
): void {
  const rec = getOrCreateRecord(screen);
  const changed =
    rec.defaultCssText !== defaultCssText ||
    rec.parts.length !== parts.length ||
    rec.parts.some(
      (p, idx) =>
        p.id !== parts[idx]?.id ||
        p.name !== parts[idx]?.name ||
        p.selector !== parts[idx]?.selector ||
        p.allowLayoutEdit !== parts[idx]?.allowLayoutEdit,
    );
  rec.parts = parts;
  rec.defaultCssText = defaultCssText;
  if (changed) {
    notifyScreen(screen);
  } else {
    applyScreenStyleTag(screen);
    syncPseudoLockDom(screen);
  }
}

function resetVariantMetadataOnSwitch(rec: ScreenStyleRecord, nextVariantId: string): void {
  if (rec.variantId === nextVariantId) return;
  const builtIn = hasBuiltInScreenVariant(rec.screen, nextVariantId)
    ? getBuiltInScreenVariant(rec.screen, nextVariantId)
    : undefined;
  rec.parts = builtIn?.parts ?? [];
  rec.defaultCssText = builtIn?.defaultCssText ?? '';
}

export function setScreenTemplateStyles(
  screen: UiScreenId,
  options: {
    variantId: string;
    scssPath: string | null;
    screenBaseUrl: string | null;
    diskScssText: string;
  },
): void {
  const rec = getOrCreateRecord(screen);
  resetVariantMetadataOnSwitch(rec, options.variantId);
  rec.variantId = options.variantId;
  rec.scssPath = options.scssPath;
  rec.screenBaseUrl = options.screenBaseUrl;
  rec.diskScssText = options.diskScssText;
  rec.previewScssText = null;
  notifyScreen(screen);
}

export function clearTemplateScreenStyles(): void {
  screenRecords.forEach((rec) => {
    rec.variantId = null;
    rec.scssPath = null;
    rec.screenBaseUrl = null;
    rec.diskScssText = '';
    rec.previewScssText = null;
    notifyScreen(rec.screen);
  });
}

export function applyUiPartStyleUpdate(
  screen: UiScreenId,
  scssText: string,
  phase: 'preview' | 'commit',
  variantId?: string,
): void {
  const rec = getOrCreateRecord(screen);
  if (variantId) {
    resetVariantMetadataOnSwitch(rec, variantId);
    rec.variantId = variantId;
  }
  if (phase === 'preview') {
    rec.previewScssText = scssText;
  } else {
    rec.diskScssText = scssText;
    rec.previewScssText = null;
  }
  notifyScreen(screen);
}

export function setUiPseudoLock(next: PseudoLockState): void {
  const prevScreen = pseudoLock.screen;
  pseudoLock = { ...next };
  if (prevScreen && prevScreen !== next.screen) {
    notifyScreen(prevScreen);
  }
  if (next.screen) {
    notifyScreen(next.screen);
  }
}

export function getScreenStyleRecord(screen: UiScreenId): ScreenStyleRecord | undefined {
  return screenRecords.get(screen);
}

export function subscribeScreenStyleUpdates(listener: () => void): () => void {
  globalListeners.add(listener);
  return () => {
    globalListeners.delete(listener);
  };
}

export function useScreenParts(
  screen: UiScreenId,
  parts: ScreenPartDefinition[],
  defaultCssText: string,
): { rootProps: { 'data-webgal-screen': UiScreenId; className: string } } {
  const [, setTick] = useState(0);

  useEffect(() => {
    let set = screenListeners.get(screen);
    if (!set) {
      set = new Set();
      screenListeners.set(screen, set);
    }
    const listener = () => setTick((v) => v + 1);
    set.add(listener);
    registerScreenMetadata(screen, parts, defaultCssText);
    return () => {
      set?.delete(listener);
    };
  }, [screen, parts, defaultCssText]);

  useEffect(() => {
    syncPseudoLockDom(screen);
  });

  return {
    rootProps: {
      'data-webgal-screen': screen,
      className: `webgal-screen webgal-screen--${screen}`,
    },
  };
}
