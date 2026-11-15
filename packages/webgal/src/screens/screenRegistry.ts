import { useEffect, useState } from 'react';
import type { BuiltInScreenVariant, UiScreenId } from '@/screens/contracts';
import type { WebgalTemplate } from '@/types/template';

export const DEFAULT_SCREEN_VARIANTS: Record<UiScreenId, string> = {
  title: 'default',
  textbox: 'default',
  choose: 'default',
  save: 'grid-2x5',
  load: 'grid-2x5',
  options: 'tabbed-classic',
  flowchart: 'default',
  menuPanel: 'default',
  backlog: 'default',
  extra: 'gallery-classic',
  bottomControlPanel: 'default',
  globalDialog: 'default',
};

const builtInVariants = new Map<UiScreenId, Map<string, BuiltInScreenVariant>>();
const registryListeners = new Set<() => void>();
let registryVersion = 0;

function emitRegistryChange(): void {
  registryVersion += 1;
  registryListeners.forEach((cb) => cb());
}

export function registerBuiltInScreen(variant: BuiltInScreenVariant): void {
  let screenMap = builtInVariants.get(variant.screen);
  if (!screenMap) {
    screenMap = new Map();
    builtInVariants.set(variant.screen, screenMap);
  }
  screenMap.set(variant.variantId, variant);
  emitRegistryChange();
}

export function registerBuiltInScreens(variants: readonly BuiltInScreenVariant[]): void {
  for (const variant of variants) {
    let screenMap = builtInVariants.get(variant.screen);
    if (!screenMap) {
      screenMap = new Map();
      builtInVariants.set(variant.screen, screenMap);
    }
    screenMap.set(variant.variantId, variant);
  }
  emitRegistryChange();
}

export function hasBuiltInScreenVariant(screen: UiScreenId, variantId: string): boolean {
  return builtInVariants.get(screen)?.has(variantId) ?? false;
}

export function getDefaultBuiltInVariant(screen: UiScreenId): BuiltInScreenVariant | undefined {
  const screenMap = builtInVariants.get(screen);
  if (!screenMap) return undefined;
  return screenMap.get(DEFAULT_SCREEN_VARIANTS[screen]) ?? screenMap.get('default') ?? screenMap.values().next().value;
}

export function getBuiltInScreenVariant(
  screen: UiScreenId,
  variantId?: string | null,
): BuiltInScreenVariant | undefined {
  const screenMap = builtInVariants.get(screen);
  if (!screenMap) return undefined;
  if (variantId && screenMap.has(variantId)) {
    return screenMap.get(variantId);
  }
  return getDefaultBuiltInVariant(screen);
}

export function isCustomUiTemplate(template?: WebgalTemplate | null): boolean {
  if (!template) return false;
  if (template.uiMode === 'custom') return true;
  return template.screens != null && Object.keys(template.screens).length > 0;
}

export function getConfiguredScreenVariantId(screen: UiScreenId, template?: WebgalTemplate | null): string {
  const configured = template?.screens?.[screen];
  if (typeof configured === 'string' && configured.trim() !== '') {
    return configured.trim();
  }
  return getDefaultBuiltInVariant(screen)?.variantId ?? DEFAULT_SCREEN_VARIANTS[screen];
}

export function subscribeScreenRegistry(listener: () => void): () => void {
  registryListeners.add(listener);
  return () => {
    registryListeners.delete(listener);
  };
}

export function useScreenRegistryVersion(): number {
  const [version, setVersion] = useState(registryVersion);
  useEffect(() => subscribeScreenRegistry(() => setVersion(registryVersion)), []);
  return version;
}
