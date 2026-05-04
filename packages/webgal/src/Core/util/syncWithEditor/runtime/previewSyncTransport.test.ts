import { describe, expect, it, vi } from 'vitest';

import { createPreviewSyncTransport, type PreviewSyncTransportSocket } from './previewSyncTransport';

interface MockSocketEvent {
  data: unknown;
}

class MockPreviewSyncSocket implements PreviewSyncTransportSocket {
  public readyState = 0;
  public onopen: (() => void) | null = null;
  public onmessage: ((event: MockSocketEvent) => void) | null = null;
  public onclose: (() => void) | null = null;
  public onerror: ((error: unknown) => void) | null = null;
  public sentMessages: string[] = [];
  public closeCallCount = 0;

  public send(data: string) {
    this.sentMessages.push(data);
  }

  public close() {
    this.closeCallCount += 1;
    this.readyState = 3;
    this.onclose?.();
  }

  public emitOpen() {
    this.readyState = 1;
    this.onopen?.();
  }

  public emitMessage(data: unknown) {
    this.onmessage?.({
      data,
    });
  }

  public emitClose() {
    this.readyState = 3;
    this.onclose?.();
  }

  public emitError(error: unknown) {
    this.onerror?.(error);
  }
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
}

function createTransportHarness({
  onOpenImplementation,
}: {
  onOpenImplementation?: (socket: PreviewSyncTransportSocket) => void | Promise<void>;
} = {}) {
  const sockets: MockPreviewSyncSocket[] = [];
  const scheduledTimers = new Map<number, { callback: () => void; delay: number }>();
  let nextTimerId = 1;

  const createSocket = vi.fn(() => {
    const socket = new MockPreviewSyncSocket();
    sockets.push(socket);
    return socket;
  });
  const onOpen = vi.fn((socket: PreviewSyncTransportSocket) => onOpenImplementation?.(socket));
  const onMessage = vi.fn();
  const onClose = vi.fn();
  const onConnecting = vi.fn();
  const logInfo = vi.fn();
  const logError = vi.fn();
  const logWarn = vi.fn();

  const transport = createPreviewSyncTransport({
    url: 'ws://127.0.0.1/api/webgalsync',
    subprotocol: 'webgal-editor-preview-sync.v1',
    createSocket,
    onConnecting,
    onOpen,
    onMessage,
    onClose,
    logInfo,
    logError,
    logWarn,
    setTimeoutFn: ((callback: () => void, delay?: number) => {
      const timerId = nextTimerId++;
      scheduledTimers.set(timerId, {
        callback,
        delay: delay ?? 0,
      });
      return timerId as unknown as ReturnType<typeof setTimeout>;
    }) as typeof setTimeout,
    clearTimeoutFn: ((timerId: ReturnType<typeof setTimeout>) => {
      scheduledTimers.delete(timerId as unknown as number);
    }) as typeof clearTimeout,
  });

  return {
    transport,
    sockets,
    createSocket,
    onOpen,
    onMessage,
    onClose,
    onConnecting,
    logInfo,
    logError,
    logWarn,
    getScheduledDelays() {
      return Array.from(scheduledTimers.values()).map((timer) => timer.delay);
    },
    runNextTimer() {
      const [timerId, timer] = scheduledTimers.entries().next().value ?? [];
      if (timerId === undefined || timer === undefined) {
        return;
      }
      scheduledTimers.delete(timerId);
      timer.callback();
    },
  };
}

describe('createPreviewSyncTransport', () => {
  it('keeps a single active connection while connecting or open', () => {
    const harness = createTransportHarness();

    harness.transport.connect();
    harness.transport.ensureConnected();

    expect(harness.createSocket).toHaveBeenCalledTimes(1);

    harness.sockets[0].emitOpen();
    harness.transport.ensureConnected();

    expect(harness.createSocket).toHaveBeenCalledTimes(1);
    expect(harness.onOpen).toHaveBeenCalledTimes(1);
    expect(harness.onOpen).toHaveBeenCalledWith(harness.sockets[0]);
  });

  it('reconnects after close and re-runs onOpen for the new socket', () => {
    const harness = createTransportHarness();

    harness.transport.connect();
    harness.sockets[0].emitOpen();
    harness.sockets[0].emitClose();

    expect(harness.onClose).toHaveBeenCalledTimes(1);
    expect(harness.getScheduledDelays()).toEqual([1000]);

    harness.runNextTimer();

    expect(harness.createSocket).toHaveBeenCalledTimes(2);
    expect(harness.onConnecting).toHaveBeenCalledTimes(2);

    harness.sockets[1].emitOpen();

    expect(harness.onOpen).toHaveBeenCalledTimes(2);
    expect(harness.onOpen).toHaveBeenLastCalledWith(harness.sockets[1]);
  });

  it('ignores stale socket messages after a newer socket becomes active', () => {
    const harness = createTransportHarness();

    harness.transport.connect();
    harness.sockets[0].emitOpen();
    harness.sockets[0].emitClose();
    harness.runNextTimer();
    harness.sockets[1].emitOpen();

    harness.sockets[0].emitMessage('stale-message');
    harness.sockets[1].emitMessage('live-message');

    expect(harness.onMessage).toHaveBeenCalledTimes(1);
    expect(harness.onMessage).toHaveBeenCalledWith('live-message', harness.sockets[1]);
  });

  it('sends only through the active open socket and disposes cleanly', () => {
    const harness = createTransportHarness();

    expect(harness.transport.send({ kind: 'event', type: 'preview.ready.updated' })).toBe(false);

    harness.transport.connect();
    harness.sockets[0].emitOpen();

    expect(harness.transport.send({ kind: 'event', type: 'preview.ready.updated' })).toBe(true);
    expect(harness.sockets[0].sentMessages).toEqual([
      JSON.stringify({
        kind: 'event',
        type: 'preview.ready.updated',
      }),
    ]);

    harness.transport.dispose();
    harness.transport.ensureConnected();

    expect(harness.sockets[0].closeCallCount).toBe(1);
    expect(harness.createSocket).toHaveBeenCalledTimes(1);
  });

  it('logs and retries when async onOpen rejects', async () => {
    const openError = new Error('register failed');
    const harness = createTransportHarness({
      onOpenImplementation: async () => {
        throw openError;
      },
    });

    harness.transport.connect();
    harness.sockets[0].emitOpen();
    await flushMicrotasks();

    expect(harness.sockets[0].closeCallCount).toBe(1);
    expect(harness.getScheduledDelays()).toEqual([1000]);
  });
});
