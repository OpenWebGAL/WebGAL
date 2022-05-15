import {logger} from "./logger";
import {syncWithOrigine} from "@/Core/util/syncWithOrigine";

export const webSocketFunc = () => {
  try {
    const loc: string = window.location.hostname;
    const wsUrl = `ws://${loc}:9999`;
    logger.info('正在启动socket连接位于：' + wsUrl);
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      logger.info('socket已连接');
      socket.send(' WebGAL 已和 Terre 建立连接。');
    };
    socket.onmessage = e => {
      logger.info('收到信息', e.data);
      const str: string = e.data;
      if (str.match('jmp')) {
        syncWithOrigine(str);
      }
    };
  } catch (e) {
    logger.warn('ws连接失败');
  }
};
