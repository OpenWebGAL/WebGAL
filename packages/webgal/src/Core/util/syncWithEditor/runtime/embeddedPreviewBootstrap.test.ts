import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  requestEmbeddedLaunchId,
  WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE,
  WEBGAL_PREVIEW_BOOTSTRAP_REQUEST,
} from './embeddedPreviewBootstrap';

interface MockMessageEvent {
  data: unknown;
  source?: unknown;
}

function createMockWindow(isEmbedded: boolean) {
  const listeners = new Set<(event: MockMessageEvent) => void>();
  const postedMessages: Array<{ message: unknown; targetOrigin: string }> = [];
  const timers = new Map<number, () => void>();
  let nextTimerId = 1;

  const parentWindow = {
    postMessage: vi.fn((message: unknown, targetOrigin: string) => {
      postedMessages.push({ message, targetOrigin });
    }),
  };

  const selfWindow = {
    parent: isEmbedded ? parentWindow : null,
    addEventListener: vi.fn((type: string, listener: (event: MockMessageEvent) => void) => {
      if (type === 'message') {
        listeners.add(listener);
      }
    }),
    removeEventListener: vi.fn((type: string, listener: (event: MockMessageEvent) => void) => {
      if (type === 'message') {
        listeners.delete(listener);
      }
    }),
    setTimeout: vi.fn((callback: () => void) => {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    }),
    clearTimeout: vi.fn((id: number) => {
      timers.delete(id);
    }),
  };

  return {
    selfWindow,
    parentWindow,
    postedMessages,
    emitMessage(data: unknown, source = parentWindow) {
      listeners.forEach((listener) => listener({ data, source }));
    },
    runNextTimer() {
      const [id, callback] = timers.entries().next().value ?? [];
      if (id !== undefined && callback) {
        timers.delete(id);
        callback();
      }
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requestEmbeddedLaunchId', () => {
  it('returns undefined immediately when not embedded', async () => {
    const { selfWindow, postedMessages } = createMockWindow(false);

    await expect(
      requestEmbeddedLaunchId({
        selfWindow,
      }),
    ).resolves.toBeUndefined();
    expect(postedMessages).toEqual([]);
  });

  it('requests bootstrap from parent and resolves embeddedLaunchId', async () => {
    const mockWindow = createMockWindow(true);
    const pendingLaunchId = requestEmbeddedLaunchId({
      selfWindow: mockWindow.selfWindow,
    });

    expect(mockWindow.postedMessages).toEqual([
      {
        message: { type: WEBGAL_PREVIEW_BOOTSTRAP_REQUEST },
        targetOrigin: '*',
      },
    ]);

    mockWindow.emitMessage({
      type: WEBGAL_PREVIEW_BOOTSTRAP_PROVIDE,
      embeddedLaunchId: 'embedded-launch-1',
    });

    await expect(pendingLaunchId).resolves.toBe('embedded-launch-1');
  });

  it('falls back to undefined when bootstrap times out', async () => {
    const mockWindow = createMockWindow(true);
    const pendingLaunchId = requestEmbeddedLaunchId({
      selfWindow: mockWindow.selfWindow,
      timeoutMs: 50,
    });

    mockWindow.runNextTimer();

    await expect(pendingLaunchId).resolves.toBeUndefined();
  });
});
