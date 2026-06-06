import { logger } from '../../logger';

export const WEBGAL_PREVIEW_BOOTSTRAP_REQUEST = 'webgal.preview.bootstrap.request';
export const WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE = 'webgal.preview.bootstrap.provide';

interface BootstrapProvideMessage {
  type: typeof WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE;
  embeddedLaunchId: string;
}

interface EmbeddedPreviewBootstrapWindow {
  parent: { postMessage: (message: unknown, targetOrigin: string) => void } | null;
  addEventListener: (type: 'message', listener: (event: { data: unknown; source?: unknown }) => void) => void;
  removeEventListener: (type: 'message', listener: (event: { data: unknown; source?: unknown }) => void) => void;
  setTimeout: (...args: any[]) => any;
  clearTimeout: (...args: any[]) => void;
}

export interface RequestEmbeddedLaunchIdOptions {
  selfWindow?: EmbeddedPreviewBootstrapWindow;
  timeoutMs?: number;
}

function isBootstrapProvideMessage(value: unknown): value is BootstrapProvideMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const maybeMessage = value as Partial<BootstrapProvideMessage>;
  return (
    maybeMessage.type === WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE &&
    typeof maybeMessage.embeddedLaunchId === 'string' &&
    maybeMessage.embeddedLaunchId.length > 0
  );
}

function getDefaultSelfWindow(): EmbeddedPreviewBootstrapWindow {
  return {
    parent: window.parent === window ? null : window.parent,
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
  };
}

export async function requestEmbeddedLaunchId({
  selfWindow = getDefaultSelfWindow(),
  timeoutMs = 1000,
}: RequestEmbeddedLaunchIdOptions = {}): Promise<string | undefined> {
  const parentWindow = selfWindow.parent;
  if (parentWindow === null) {
    return undefined;
  }

  return new Promise<string | undefined>((resolve) => {
    let settled = false;
    let timerId: any = null;

    const cleanup = () => {
      selfWindow.removeEventListener('message', handleMessage);
      if (timerId !== null) {
        selfWindow.clearTimeout(timerId);
        timerId = null;
      }
    };

    const finish = (embeddedLaunchId: string | undefined) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(embeddedLaunchId);
    };

    const handleMessage = (event: { data: unknown; source?: unknown }) => {
      if (event.source !== undefined && event.source !== parentWindow) {
        return;
      }

      if (!isBootstrapProvideMessage(event.data)) {
        return;
      }

      logger.info('收到 embeddedLaunchId bootstrap', {
        embeddedLaunchId: event.data.embeddedLaunchId,
      });
      finish(event.data.embeddedLaunchId);
    };

    selfWindow.addEventListener('message', handleMessage);
    timerId = selfWindow.setTimeout(() => {
      logger.warn('等待 embeddedLaunchId bootstrap 超时，将继续以未绑定模式注册');
      finish(undefined);
    }, timeoutMs);
    logger.info('开始请求 embeddedLaunchId bootstrap');
    parentWindow.postMessage({ type: WEBGAL_PREVIEW_BOOTSTRAP_REQUEST }, '*');
  });
}
