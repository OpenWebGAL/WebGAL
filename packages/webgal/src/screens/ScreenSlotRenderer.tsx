import { useEffect, useState } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import type { ScreenPropsMap, UiScreenId } from '@/screens/contracts';
import {
  clearPreviousReadyScreenState,
  ensureCustomScreenLoaded,
  getCustomScreenState,
  getPreviousReadyScreenState,
  loadCustomScreenStyle,
  subscribeScreenLoader,
} from '@/screens/screenLoader';
import {
  getBuiltInScreenVariant,
  getConfiguredScreenVariantId,
  getDefaultBuiltInVariant,
  isCustomUiTemplate,
  useScreenRegistryVersion,
} from '@/screens/screenRegistry';
import { ScreenErrorBoundary } from '@/screens/ScreenErrorBoundary';

export interface ScreenSlotRendererProps<TScreen extends UiScreenId> {
  screen: TScreen;
  screenProps: ScreenPropsMap[TScreen];
}

export function ScreenSlotRenderer<TScreen extends UiScreenId>({
  screen,
  screenProps,
}: ScreenSlotRendererProps<TScreen>) {
  useScreenRegistryVersion();
  const [templateEpoch, setTemplateEpoch] = useState(0);

  useEffect(() => {
    const bump = () => setTemplateEpoch((v) => v + 1);
    const unsubscribeLoader = subscribeScreenLoader(bump);
    WebGAL.events.templateLoaded.on(bump);
    WebGAL.events.afterStyleUpdate.on(bump);
    return () => {
      unsubscribeLoader();
      WebGAL.events.templateLoaded.off(bump);
      WebGAL.events.afterStyleUpdate.off(bump);
    };
  }, []);

  const isCustomTemplate = isCustomUiTemplate(WebGAL.template);
  const variantId = getConfiguredScreenVariantId(screen, WebGAL.template);
  const defaultBuiltIn = getDefaultBuiltInVariant(screen);

  useEffect(() => {
    if (isCustomTemplate) {
      void ensureCustomScreenLoaded(screen, variantId);
    }
  }, [isCustomTemplate, screen, variantId, templateEpoch]);

  if (!defaultBuiltIn) {
    return null;
  }

  const DefaultBuiltInComponent = defaultBuiltIn.component;
  const defaultFallbackNode = <DefaultBuiltInComponent {...screenProps} />;

  const restoreDefaultStyle = () => {
    clearPreviousReadyScreenState(screen);
    void loadCustomScreenStyle(screen, defaultBuiltIn.variantId);
  };

  if (!isCustomTemplate) {
    const builtIn = getBuiltInScreenVariant(screen, variantId) ?? defaultBuiltIn;
    const BuiltInComponent = builtIn.component;
    return (
      <ScreenErrorBoundary
        screen={screen}
        resetKey={`${screen}:legacy:${builtIn.variantId}:${templateEpoch}`}
        fallback={defaultFallbackNode}
        onError={builtIn.variantId !== defaultBuiltIn.variantId ? restoreDefaultStyle : undefined}
      >
        <BuiltInComponent {...screenProps} />
      </ScreenErrorBoundary>
    );
  }

  const customState = getCustomScreenState(screen, variantId);
  if (customState?.status === 'ready' && customState.component) {
    const CustomComponent = customState.component;
    return (
      <ScreenErrorBoundary
        screen={screen}
        resetKey={`${screen}:custom:${variantId}:${customState.epoch}`}
        fallback={defaultFallbackNode}
        onError={restoreDefaultStyle}
      >
        <CustomComponent key={`${screen}:${variantId}`} {...screenProps} />
      </ScreenErrorBoundary>
    );
  }

  if (customState?.status === 'error') {
    const builtInFallback = getBuiltInScreenVariant(screen, variantId) ?? defaultBuiltIn;
    const BuiltInFallbackComponent = builtInFallback.component;
    return (
      <ScreenErrorBoundary
        screen={screen}
        resetKey={`${screen}:fallback:${builtInFallback.variantId}`}
        fallback={defaultFallbackNode}
        onError={builtInFallback.variantId !== defaultBuiltIn.variantId ? restoreDefaultStyle : undefined}
      >
        <BuiltInFallbackComponent key={`${screen}:${builtInFallback.variantId}`} {...screenProps} />
      </ScreenErrorBoundary>
    );
  }

  // Keep the last ready screen mounted during async reload/switch transitions to avoid fallback flicker.
  const prevReady = getPreviousReadyScreenState(screen);
  if (prevReady?.component) {
    const PrevComponent = prevReady.component;
    return (
      <ScreenErrorBoundary
        screen={screen}
        resetKey={`${screen}:prev:${prevReady.variantId}:${prevReady.epoch}`}
        fallback={defaultFallbackNode}
        onError={restoreDefaultStyle}
      >
        <PrevComponent key={`${screen}:${prevReady.variantId}`} {...screenProps} />
      </ScreenErrorBoundary>
    );
  }

  return null;
}
