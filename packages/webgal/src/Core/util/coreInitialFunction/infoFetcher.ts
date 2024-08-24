import axios from 'axios';
import { logger } from '../logger';
import { getStorage, getStorageAsync, setStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setGlobalVar } from '@/store/userDataReducer';

declare global {
  interface Window {
    renderPromise?: Function;
  }
}
/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string) => {
  const dispatch = webgalStore.dispatch;
  axios.get(url).then(async (r) => {
    let gameConfigRaw: string = r.data;
    let gameConfig = WebgalParser.parseConfig(gameConfigRaw);
    logger.info('获取到游戏信息', gameConfig);
    // 先把 key 找到并设置了
    const keyItem = gameConfig.find((e) => e.command === 'Game_key');
    WebGAL.gameKey = (keyItem?.args?.[0] as string) ?? '';
    initKey();
    await getStorageAsync();
    getFastSaveFromStorage();
    getSavesFromStorage(0, 0);
    // 按照游戏的配置开始设置对应的状态
    gameConfig.forEach((e) => {
      const { command, args } = e;
      if (args.length > 0) {
        if (args.length > 1) {
          dispatch(
            setGlobalVar({
              key: command,
              value: args.join('|'),
            }),
          );
        } else {
          let res: any = args[0].trim();
          if (/^(true|false)$/g.test(args[0])) {
            res = !!res;
          } else if (/^[0-9]+\.?[0-9]+$/g.test(args[0])) {
            res = Number(res);
          }

          dispatch(
            setGlobalVar({
              key: command,
              value: res,
            }),
          );
        }
      }
    });

    window?.renderPromise?.();
    delete window.renderPromise;
    setStorage();
  });
};
