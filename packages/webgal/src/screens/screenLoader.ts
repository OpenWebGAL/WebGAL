import type { ComponentType } from 'react';
import { logger } from '@/Core/util/logger';
import { UI_SCREEN_IDS, type CustomScreenModule, type UiScreenId } from '@/screens/contracts';
import {
  DEFAULT_SCREEN_VARIANTS,
  getBuiltInScreenVariant,
  getConfiguredScreenVariantId,
  getDefaultBuiltInVariant,
  isCustomUiTemplate,
} from '@/screens/screenRegistry';
import { clearTemplateScreenStyles, registerScreenMetadata, setScreenTemplateStyles } from '@/sdk/styleRuntime';
import type { WebgalTemplate } from '@/types/template';

export interface CustomScreenLoadState {
  status: 'loading' | 'ready' | 'error';
  screen: UiScreenId;
  variantId: string;
  component?: ComponentType<any>;
  module?: CustomScreenModule;
  error?: Error;
  epoch: number;
  promise?: Promise<void>;
}

const customScreenCache = new Map<string, CustomScreenLoadState>();
const loaderListeners = new Set<() => void>();
let reloadEpoch = 0;

function cacheKey(screen: UiScreenId, variantId: string): string {
  return `${screen}::${variantId}`;
}

function notifyLoaderListeners(): void {
  loaderListeners.forEach((cb) => cb());
}

export function subscribeScreenLoader(listener: () => void): () => void {
  loaderListeners.add(listener);
  return () => {
    loaderListeners.delete(listener);
  };
}

export function getCustomScreenState(screen: UiScreenId, variantId: string): CustomScreenLoadState | undefined {
  const state = customScreenCache.get(cacheKey(screen, variantId));
  return state?.epoch === reloadEpoch ? state : undefined;
}

function resolveScreenComponent(mod: CustomScreenModule): ComponentType<any> | null {
  const candidate = mod.default ?? mod.Screen;
  if (typeof candidate === 'function' || (typeof candidate === 'object' && candidate !== null)) {
    return candidate;
  }
  return null;
}

function buildScreenAssetUrls(screen: UiScreenId, variantId: string) {
  const relativeDir = `screens/${screen}/${variantId}`;
  const baseUrl = `./game/template/${relativeDir}/`;
  return {
    baseUrl,
    scssPath: `${relativeDir}/style.scss`,
    scssUrl: `${baseUrl}style.scss`,
    entryUrl: `${baseUrl}index.js`,
  };
}

async function fetchScreenStyleText(scssUrl: string): Promise<string> {
  try {
    const response = await fetch(`${scssUrl}?v=${reloadEpoch}`, { cache: 'no-store' });
    if (!response.ok) return '';
    return await response.text();
  } catch {
    return '';
  }
}

export async function loadCustomScreenStyle(screen: UiScreenId, variantId: string): Promise<void> {
  const { baseUrl, scssPath, scssUrl } = buildScreenAssetUrls(screen, variantId);
  const diskScssText = await fetchScreenStyleText(scssUrl);
  setScreenTemplateStyles(screen, {
    variantId,
    scssPath,
    screenBaseUrl: baseUrl,
    diskScssText,
  });
}

export function ensureCustomScreenLoaded(screen: UiScreenId, variantId: string): Promise<void> {
  const key = cacheKey(screen, variantId);
  const existing = customScreenCache.get(key);
  if (existing && existing.epoch === reloadEpoch) {
    return existing.promise ?? Promise.resolve();
  }

  const currentEpoch = reloadEpoch;
  const { entryUrl } = buildScreenAssetUrls(screen, variantId);
  const importUrl = `${entryUrl}?v=${currentEpoch}`;
  let loadPromise!: Promise<void>;

  loadPromise = (async () => {
    try {
      const rawMod = (await import(/* @vite-ignore */ importUrl)) as CustomScreenModule;
      if (currentEpoch !== reloadEpoch) return;
      const component = resolveScreenComponent(rawMod);
      if (!component) {
        throw new Error(`Custom screen module ${importUrl} does not export a valid React component.`);
      }
      await loadCustomScreenStyle(screen, variantId);
      if (currentEpoch !== reloadEpoch) return;
      registerScreenMetadata(screen, rawMod.parts ?? [], rawMod.defaultCssText ?? '');
      customScreenCache.set(key, {
        status: 'ready',
        screen,
        variantId,
        component,
        module: rawMod,
        epoch: currentEpoch,
        promise: loadPromise,
      });
      notifyLoaderListeners();
    } catch (err: unknown) {
      if (currentEpoch !== reloadEpoch) return;
      const error = err instanceof Error ? err : new Error(String(err));
      logger.warn(`Failed to load custom screen "${screen}/${variantId}", falling back to built-in default.`, error);
      customScreenCache.set(key, {
        status: 'error',
        screen,
        variantId,
        error,
        epoch: currentEpoch,
        promise: loadPromise,
      });
      const fallbackBuiltIn = getBuiltInScreenVariant(screen, variantId) ?? getDefaultBuiltInVariant(screen);
      const fallbackVariantId = fallbackBuiltIn?.variantId ?? DEFAULT_SCREEN_VARIANTS[screen];
      await loadCustomScreenStyle(screen, fallbackVariantId);
      if (currentEpoch !== reloadEpoch) return;
      if (fallbackBuiltIn) {
        registerScreenMetadata(screen, fallbackBuiltIn.parts, fallbackBuiltIn.defaultCssText);
      }
      notifyLoaderListeners();
    }
  })();

  customScreenCache.set(key, {
    status: 'loading',
    screen,
    variantId,
    epoch: currentEpoch,
    promise: loadPromise,
  });

  return loadPromise;
}

export async function reloadTemplateScreens(template?: WebgalTemplate | null): Promise<void> {
  reloadEpoch += 1;
  customScreenCache.clear();
  clearTemplateScreenStyles();

  if (!isCustomUiTemplate(template)) {
    notifyLoaderListeners();
    return;
  }

  await Promise.all(
    UI_SCREEN_IDS.map((screen) => {
      const variantId = getConfiguredScreenVariantId(screen, template);
      return ensureCustomScreenLoaded(screen, variantId);
    }),
  );

  notifyLoaderListeners();
}
