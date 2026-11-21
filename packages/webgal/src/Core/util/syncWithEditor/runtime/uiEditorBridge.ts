import { WebGAL } from '@/Core/WebGAL';
import type { ScreenPartDefinition, UiScreenId } from '@/screens/contracts';
import {
  getBuiltInScreenVariant,
  getConfiguredScreenVariantId,
  hasBuiltInScreenVariant,
  isCustomUiTemplate,
} from '@/screens/screenRegistry';
import { setActiveUiScreenState, setUiMockDataEnabled } from '@/sdk/mockData';
export { getActiveUiScreen, setActiveUiScreenState, useActiveUiScreen } from '@/sdk/mockData';
import {
  applyUiPartStyleUpdate,
  getScreenStyleRecord,
  setUiPseudoLock,
  subscribeScreenStyleUpdates,
} from '@/sdk/styleRuntime';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import { webgalStore } from '@/store/store';
import {
  createEventEnvelope,
  type SelectUiPartPayload,
  type SetActiveUiScreenPayload,
  type SetUiEditModePayload,
  type SetUiMockDataPayload,
  type SetUiPartStylePayload,
  type SetUiPseudoStatePayload,
  type TemplateIncompatiblePayload,
  type UiLogicalBox,
  type UiPartDescriptor,
  type UiPreviewMode,
  type UiScreenUpdatedPayload,
} from '@/types/editorPreviewProtocol';

const LOGICAL_WIDTH = 2560;
const LOGICAL_HEIGHT = 1440;
const SELECTED_ATTR = 'data-webgal-selected-part';

type ApplyStyleReporter = (content: string) => void;
let activeApplyStyleReporter: ApplyStyleReporter | null = null;

type TemplateIncompatibleReporter = (payload: TemplateIncompatiblePayload) => void;
let activeTemplateIncompatibleReporter: TemplateIncompatibleReporter | null = null;
let cachedIncompatibleTemplate: TemplateIncompatiblePayload | null = null;

export function notifyApplyStyleIgnored(content: string): void {
  activeApplyStyleReporter?.(content);
}

export function notifyTemplateIncompatible(payload: TemplateIncompatiblePayload | null): void {
  cachedIncompatibleTemplate = payload;
  if (payload) {
    activeTemplateIncompatibleReporter?.(payload);
  }
}

interface UiEditorBridgeOptions {
  isRegistered: () => boolean;
  send: (envelope: unknown) => boolean;
}

export interface UiEditorBridge {
  setUiEditMode: (payload: SetUiEditModePayload) => void;
  setActiveUiScreen: (payload: SetActiveUiScreenPayload) => void;
  selectUiPart: (payload: SelectUiPartPayload) => void;
  setUiPartStyle: (payload: SetUiPartStylePayload) => void;
  setUiPseudoState: (payload: SetUiPseudoStatePayload) => void;
  setUiMockData: (payload: SetUiMockDataPayload) => void;
  queryUiScreen: () => UiScreenUpdatedPayload;
  publishCurrentScreen: () => void;
  publishPendingTemplateIncompatible: () => void;
  dispose: () => void;
}

function resolveScreenMetadata(screen: UiScreenId, variantId: string) {
  const rec = getScreenStyleRecord(screen);
  const builtIn = hasBuiltInScreenVariant(screen, variantId) ? getBuiltInScreenVariant(screen, variantId) : undefined;
  const parts = rec && rec.parts.length > 0 ? rec.parts : builtIn?.parts ?? [];
  const defaultCssText = rec && rec.defaultCssText !== '' ? rec.defaultCssText : builtIn?.defaultCssText ?? '';
  return { rec, parts, defaultCssText };
}

function resolveMatchedElement(screenRoot: Element, selector: string): Element | null {
  try {
    if (screenRoot.matches(selector)) return screenRoot;
    return screenRoot.querySelector(selector);
  } catch {
    return null;
  }
}

function measureLogicalBox(el: Element, stageRoot: Element): UiLogicalBox | null {
  const rootRect = stageRoot.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    x: Math.round(((rect.left - rootRect.left) * LOGICAL_WIDTH) / rootRect.width),
    y: Math.round(((rect.top - rootRect.top) * LOGICAL_HEIGHT) / rootRect.height),
    width: Math.round((rect.width * LOGICAL_WIDTH) / rootRect.width),
    height: Math.round((rect.height * LOGICAL_HEIGHT) / rootRect.height),
  };
}

function measureScreenParts(screen: UiScreenId, parts: ScreenPartDefinition[]): UiPartDescriptor[] {
  if (typeof document === 'undefined') {
    return parts.map((p) => ({ ...p, box: null }));
  }
  const screenRoot = document.querySelector(`[data-webgal-screen="${screen}"]`);
  if (!screenRoot) {
    return parts.map((p) => ({ ...p, box: null }));
  }
  const stageRoot = document.getElementById('root') ?? document.body;
  return parts.map((part) => {
    const matched = resolveMatchedElement(screenRoot, part.selector);
    return {
      ...part,
      box: matched ? measureLogicalBox(matched, stageRoot) : null,
    };
  });
}

function applyScreenPreviewVisibility(screen: UiScreenId): void {
  if (typeof document !== 'undefined') {
    const titleEnter = document.querySelector<HTMLElement>('.html-body__title-enter');
    if (titleEnter) {
      titleEnter.style.display = 'none';
    }
  }

  const isMenuSubScreen =
    screen === 'save' || screen === 'load' || screen === 'options' || screen === 'flowchart' || screen === 'menuPanel';

  const menuTagByScreen: Partial<Record<UiScreenId, MenuPanelTag>> = {
    save: MenuPanelTag.Save,
    menuPanel: MenuPanelTag.Save,
    load: MenuPanelTag.Load,
    options: MenuPanelTag.Option,
    flowchart: MenuPanelTag.Flowchart,
  };

  const targetMenuTag = menuTagByScreen[screen];
  if (targetMenuTag !== undefined) {
    webgalStore.dispatch(setMenuPanelTag(targetMenuTag));
  }

  const updates: Array<[Parameters<typeof setVisibility>[0]['component'], boolean]> = [
    ['showStarter', false],
    ['isEnterGame', true],
    ['showTitle', screen === 'title'],
    ['showTextBox', screen === 'textbox'],
    ['showControls', true],
    ['controlsVisibility', screen === 'textbox' || screen === 'bottomControlPanel'],
    ['showMenuPanel', isMenuSubScreen],
    ['showFlowchart', screen === 'flowchart'],
    ['showBacklog', screen === 'backlog'],
    ['showExtra', screen === 'extra'],
    ['showGlobalDialog', screen === 'globalDialog'],
  ];

  for (const [component, visibility] of updates) {
    webgalStore.dispatch(setVisibility({ component, visibility }));
  }
}

export function createUiEditorBridge({ isRegistered, send }: UiEditorBridgeOptions): UiEditorBridge {
  let mode: UiPreviewMode = 'interactive';
  let activeScreen: UiScreenId | null = null;
  let selectedPartId: string | null = null;
  let rafHandle: number | null = null;

  const clearSelectedAttr = () => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll(`[${SELECTED_ATTR}]`).forEach((el) => el.removeAttribute(SELECTED_ATTR));
  };

  const applySelectedAttr = (screen: UiScreenId, partId: string | null) => {
    clearSelectedAttr();
    if (!partId || typeof document === 'undefined') return;
    const screenRoot = document.querySelector(`[data-webgal-screen="${screen}"]`);
    const variantId = getScreenStyleRecord(screen)?.variantId ?? getConfiguredScreenVariantId(screen, WebGAL.template);
    const { parts } = resolveScreenMetadata(screen, variantId);
    const part = parts.find((item) => item.id === partId);
    if (!screenRoot || !part) return;
    const matched = resolveMatchedElement(screenRoot, part.selector);
    matched?.setAttribute(SELECTED_ATTR, 'true');
  };

  const buildPayload = (): UiScreenUpdatedPayload => {
    const isCustomTemplate = isCustomUiTemplate(WebGAL.template);
    if (!activeScreen) {
      return {
        screen: null,
        variantId: null,
        scssPath: null,
        isCustomTemplate,
        defaultCssText: '',
        currentScssText: '',
        parts: [],
      };
    }
    const existingRec = getScreenStyleRecord(activeScreen);
    const variantId = existingRec?.variantId ?? getConfiguredScreenVariantId(activeScreen, WebGAL.template);
    const { rec, parts, defaultCssText } = resolveScreenMetadata(activeScreen, variantId);
    const candidateCss = rec?.previewScssText != null ? rec.previewScssText : rec?.diskScssText ?? '';
    const currentScssText = candidateCss.trim() !== '' ? candidateCss : defaultCssText;
    return {
      screen: activeScreen,
      variantId,
      scssPath: rec?.scssPath ?? `screens/${activeScreen}/${variantId}/style.scss`,
      isCustomTemplate,
      defaultCssText,
      currentScssText,
      parts: measureScreenParts(activeScreen, parts),
    };
  };

  const publishCurrentScreen = () => {
    if (!isRegistered()) return;
    send(createEventEnvelope('ui.screen.updated', buildPayload()));
  };

  const schedulePublish = () => {
    if (typeof window === 'undefined') return;
    if (rafHandle !== null) {
      window.cancelAnimationFrame(rafHandle);
    }
    rafHandle = window.requestAnimationFrame(() => {
      rafHandle = null;
      if (activeScreen) {
        applySelectedAttr(activeScreen, selectedPartId);
      }
      publishCurrentScreen();
    });
  };

  const findClickedPartId = (screen: UiScreenId, target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null;
    const screenRoot = document.querySelector(`[data-webgal-screen="${screen}"]`);
    if (!screenRoot || !screenRoot.contains(target)) return null;
    const variantId = getScreenStyleRecord(screen)?.variantId ?? getConfiguredScreenVariantId(screen, WebGAL.template);
    const { parts } = resolveScreenMetadata(screen, variantId);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      try {
        if (screenRoot.matches(part.selector) && screenRoot.contains(target)) {
          return part.id;
        }
        const matchedNodes = screenRoot.querySelectorAll(part.selector);
        for (let idx = 0; idx < matchedNodes.length; idx++) {
          if (matchedNodes[idx].contains(target)) {
            return part.id;
          }
        }
      } catch {
        // Ignore invalid selector
      }
    }
    return null;
  };

  const handleCaptureClick = (event: MouseEvent) => {
    if (mode !== 'edit') return;
    const hitAnyScreen = event.target instanceof Element ? event.target.closest('[data-webgal-screen]') : null;
    if (!hitAnyScreen) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!activeScreen) return;
    const screenRoot = document.querySelector(`[data-webgal-screen="${activeScreen}"]`);
    if (!screenRoot || !(event.target instanceof Node) || !screenRoot.contains(event.target)) {
      return;
    }
    const partId = findClickedPartId(activeScreen, event.target);
    selectedPartId = partId;
    applySelectedAttr(activeScreen, partId);
    if (isRegistered()) {
      send(createEventEnvelope('ui.part.selected', { screen: activeScreen, partId }));
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleCaptureClick, true);
  }

  const unsubscribeStyles = subscribeScreenStyleUpdates(schedulePublish);
  const handleTemplateLoaded = () => schedulePublish();
  WebGAL.events.templateLoaded.on(handleTemplateLoaded);

  activeApplyStyleReporter = (content: string) => {
    if (!isRegistered()) return;
    const sceneData = WebGAL.sceneManager?.sceneData;
    send(
      createEventEnvelope('preview.event.apply-style-ignored', {
        sceneName: sceneData?.currentScene?.sceneName,
        sentenceId: sceneData?.currentSentenceId,
        content,
        reason: 'new-template-enabled',
      }),
    );
  };

  const publishTemplateIncompatible = (payload: TemplateIncompatiblePayload) => {
    if (!isRegistered()) return;
    send(createEventEnvelope('preview.event.template-incompatible', payload));
  };

  activeTemplateIncompatibleReporter = publishTemplateIncompatible;

  return {
    setUiEditMode: ({ mode: nextMode }) => {
      mode = nextMode;
      if (mode === 'interactive') {
        selectedPartId = null;
        clearSelectedAttr();
        setUiPseudoLock({ screen: null, selector: null, pseudoState: 'default' });
      }
    },
    setActiveUiScreen: ({ screen }) => {
      activeScreen = screen;
      setActiveUiScreenState(screen);
      selectedPartId = null;
      clearSelectedAttr();
      setUiPseudoLock({ screen: null, selector: null, pseudoState: 'default' });
      if (screen) {
        applyScreenPreviewVisibility(screen);
      }
      schedulePublish();
    },
    selectUiPart: ({ screen, partId }) => {
      activeScreen = screen;
      selectedPartId = partId;
      applySelectedAttr(screen, partId);
      schedulePublish();
    },
    setUiPartStyle: ({ screen, variantId, scssText, phase }) => {
      applyUiPartStyleUpdate(screen, scssText, phase, variantId);
      schedulePublish();
    },
    setUiPseudoState: ({ screen, selector, pseudoState }) => {
      setUiPseudoLock({ screen, selector, pseudoState });
    },
    setUiMockData: ({ enabled }) => {
      setUiMockDataEnabled(enabled);
      schedulePublish();
    },
    queryUiScreen: buildPayload,
    publishCurrentScreen,
    publishPendingTemplateIncompatible: () => {
      if (cachedIncompatibleTemplate) {
        publishTemplateIncompatible(cachedIncompatibleTemplate);
      }
    },
    dispose: () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', handleCaptureClick, true);
      }
      if (typeof window !== 'undefined' && rafHandle !== null) {
        window.cancelAnimationFrame(rafHandle);
      }
      clearSelectedAttr();
      setActiveUiScreenState(null);
      setUiPseudoLock({ screen: null, selector: null, pseudoState: 'default' });
      setUiMockDataEnabled(false);
      unsubscribeStyles();
      WebGAL.events.templateLoaded.off(handleTemplateLoaded);
      activeApplyStyleReporter = null;
      activeTemplateIncompatibleReporter = null;
    },
  };
}
