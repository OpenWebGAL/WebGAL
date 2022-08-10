import { logger } from '../etc/logger';
import { syncWithOrigine } from '@/Core/util/syncWithEditor/syncWithOrigine';

export const webSocketFunc = () => {
  const loc: string = window.location.hostname;
  const protocol: string = window.location.protocol;
  if (protocol !== 'http:') {
    return;
  }
  const wsUrl = `ws://${loc}:9999`;
  logger.info('正在启动socket连接位于：' + wsUrl);
  const socket = new WebSocket(wsUrl);
  socket.onopen = () => {
    logger.info('socket已连接');
    socket.send(' WebGAL 已和 Terre 建立连接。');
  };
  socket.onmessage = (e) => {
    logger.info('收到信息', e.data);
    const str: string = e.data;
    if (str.match('jmp')) {
      syncWithOrigine(str);
    }
  };
  socket.onerror = (e) => {
    logger.info('当前没有连接到 Terre 编辑器');
  };
};
