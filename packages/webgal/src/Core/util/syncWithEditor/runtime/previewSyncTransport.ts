const SOCKET_CONNECTING = 0;
const SOCKET_OPEN = 1;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 3_000;

export interface PreviewSyncTransportSocket {
  readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: ((error: unknown) => void) | null;
  send: (data: string) => void;
  close: () => void;
}

export interface PreviewSyncTransportOptions {
  url: string;
  subprotocol: string;
  createSocket?: (url: string, subprotocol: string) => PreviewSyncTransportSocket;
  onConnecting?: () => void;
  onOpen: (socket: PreviewSyncTransportSocket) => void | Promise<void>;
  onMessage: (data: unknown, socket: PreviewSyncTransportSocket) => void;
  onClose?: (socket: PreviewSyncTransportSocket) => void;
  logInfo: (message: string) => void;
  logError: (message: string, error?: unknown) => void;
  logWarn: (message: string, error?: unknown) => void;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  maxReconnectDelayMs?: number;
}

export interface PreviewSyncTransport {
  connect: () => void;
  ensureConnected: () => void;
  dispose: () => void;
  send: (envelope: unknown) => boolean;
  isSocketOpen: (socket: PreviewSyncTransportSocket | null | undefined) => boolean;
  isActiveSocket: (socket: PreviewSyncTransportSocket | null | undefined) => boolean;
}

function createBrowserSocket(url: string, subprotocol: string): PreviewSyncTransportSocket {
  return new WebSocket(url, subprotocol) as unknown as PreviewSyncTransportSocket;
}

export function createPreviewSyncTransport({
  url,
  subprotocol,
  createSocket = createBrowserSocket,
  onConnecting,
  onOpen,
  onMessage,
  onClose,
  logInfo,
  logError,
  logWarn,
  setTimeoutFn = setTimeout,
  clearTimeoutFn = clearTimeout,
  maxReconnectDelayMs = DEFAULT_MAX_RECONNECT_DELAY_MS,
}: PreviewSyncTransportOptions): PreviewSyncTransport {
  let disposed = false;
  let activeSocket: PreviewSyncTransportSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempt = 0;
  let connectionId = 0;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeoutFn(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const isSocketOpen = (socket: PreviewSyncTransportSocket | null | undefined) => {
    return socket !== null && socket !== undefined && socket.readyState === SOCKET_OPEN;
  };

  const isActiveSocket = (socket: PreviewSyncTransportSocket | null | undefined) => {
    return socket !== null && socket !== undefined && activeSocket === socket;
  };

  const send = (envelope: unknown): boolean => {
    const socket = activeSocket;
    if (socket === null || !isSocketOpen(socket)) {
      return false;
    }

    try {
      socket.send(JSON.stringify(envelope));
      return true;
    } catch (error) {
      logError('发送编辑器同步 V1 消息失败', error);
      return false;
    }
  };

  const connect = () => {
    if (disposed) {
      return;
    }

    if (activeSocket && (activeSocket.readyState === SOCKET_CONNECTING || activeSocket.readyState === SOCKET_OPEN)) {
      return;
    }

    connectionId += 1;
    const currentConnectionId = connectionId;
    onConnecting?.();
    logInfo(`正在启动编辑器同步 V1 WebSocket：${url}`);
    const socket = createSocket(url, subprotocol);
    activeSocket = socket;

    socket.onopen = () => {
      if (disposed || currentConnectionId !== connectionId || !isActiveSocket(socket)) {
        return;
      }

      clearReconnectTimer();
      reconnectAttempt = 0;
      logInfo('编辑器同步 V1 WebSocket 已连接');
      Promise.resolve(onOpen(socket)).catch((error) => {
        logError('处理编辑器同步 V1 WebSocket 连接回调失败', error);
        if (!disposed && currentConnectionId === connectionId && isActiveSocket(socket)) {
          socket.close();
        }
      });
    };

    socket.onmessage = (event) => {
      if (disposed || currentConnectionId !== connectionId || !isActiveSocket(socket)) {
        return;
      }

      onMessage(event.data, socket);
    };

    socket.onclose = () => {
      if (currentConnectionId !== connectionId || !isActiveSocket(socket)) {
        return;
      }

      activeSocket = null;
      onClose?.(socket);
      if (disposed) {
        return;
      }

      logInfo('编辑器同步 V1 WebSocket 已关闭');
      clearReconnectTimer();
      const delay = Math.min(1000 * 2 ** reconnectAttempt, maxReconnectDelayMs);
      reconnectAttempt += 1;
      logInfo(`编辑器同步 V1 WebSocket 将在 ${delay}ms 后重连`);
      reconnectTimer = setTimeoutFn(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    };

    socket.onerror = (error) => {
      if (currentConnectionId !== connectionId || !isActiveSocket(socket)) {
        return;
      }

      logWarn('编辑器同步 V1 WebSocket 发生错误', error);
    };
  };

  const ensureConnected = () => {
    if (disposed) {
      return;
    }

    if (activeSocket && (activeSocket.readyState === SOCKET_OPEN || activeSocket.readyState === SOCKET_CONNECTING)) {
      return;
    }

    connect();
  };

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    clearReconnectTimer();
    if (activeSocket) {
      const socket = activeSocket;
      activeSocket = null;
      socket.close();
    }
  };

  return {
    connect,
    ensureConnected,
    dispose,
    send,
    isSocketOpen,
    isActiveSocket,
  };
}
