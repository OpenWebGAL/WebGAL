import { logger } from '../logger';
import { syncWithOrigine } from '@/Core/util/syncWithEditor/syncWithOrigine';
import { DebugCommand, IDebugMessage } from '@/types/debugProtocol';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { runScript } from '@/Core/controller/gamePlay/runScript';

export const webSocketFunc = () => {
  const loc: string = window.location.hostname;
  const protocol: string = window.location.protocol;
  if (protocol !== 'http:' && protocol !== 'https:') {
    return;
  }
  let wsUrl = `ws://${loc}:9999`;
  if (protocol === 'https:') {
    wsUrl = `wss://${loc}/webgalsync`;
  }
  logger.info('正在启动socket连接位于：' + wsUrl);
  const socket = new WebSocket(wsUrl);
  socket.onopen = () => {
    logger.info('socket已连接');
    function sendStageSyncMessage() {
      const message: IDebugMessage = {
        command: DebugCommand.SYNCFC,
        sceneMsg: {
          scene: WebGAL.sceneManager.sceneData.currentScene.sceneName,
          sentence: WebGAL.sceneManager.sceneData.currentSentenceId,
        },
        stageSyncMsg: webgalStore.getState().stage,
        message: 'sync',
      };
      socket.send(JSON.stringify(message));
      // logger.debug('传送信息', message);
      setTimeout(sendStageSyncMessage, 1000);
    }
    sendStageSyncMessage();
  };
  socket.onmessage = (e) => {
    // logger.info('收到信息', e.data);
    const str: string = e.data;
    const message: IDebugMessage = JSON.parse(str);
    if (message.command === DebugCommand.JUMP) {
      syncWithOrigine(message.sceneMsg.scene, message.sceneMsg.sentence);
    }
    if (message.command === DebugCommand.EXE_COMMAND) {
      const command = message.message;
      const scene = WebgalParser.parse(command, 'temp.txt', 'temp.txt');
      const sentence = scene.sentenceList[0];
      runScript(sentence);
    }
    if (message.command === DebugCommand.REFETCH_TEMPLATE_FILES) {
      WebGAL.events.styleUpdate.emit();
    }
  };
  socket.onerror = (e) => {
    logger.info('当前没有连接到 Terre 编辑器');
  };
};
