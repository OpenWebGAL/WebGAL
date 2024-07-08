import axios from 'axios';
import { logger } from '../logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage, setStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset, setLogoImage } from '@/store/GUIReducer';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { WebGAL } from '@/Core/WebGAL';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { resetUserData, setGlobalVar } from '@/store/userDataReducer';
import localforage from 'localforage';
import { IUserData } from '@/store/userDataInterface';

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
  getStorage();
  const GUIState = webgalStore.getState().GUI;
  const dispatch = webgalStore.dispatch;
  axios.get(url).then((r) => {
    let gameConfigRaw: string = r.data;
    let gameConfig = WebgalParser.parseConfig(gameConfigRaw);
    logger.info('获取到游戏信息', gameConfig);
    // 先把 key 找到并设置了
    const keyItem = gameConfig.find((e) => e.command === 'Game_key');
    const key = (keyItem?.options?.[0].value as string) ?? '';
    WebGAL.gameKey = key;
    initKey();
    getStorage();
    getFastSaveFromStorage();
    getSavesFromStorage(0, 0);
    // 按照游戏的配置开始设置对应的状态
    if (GUIState) {
      gameConfig.forEach((e) => {
        const { command, args } = e;
        let res: any = args[0].trim();
        if (/^(true|false)$/g.test(args[0])) {
          res = !!res;
        } else if (/^[0-9]+\.?[0-9]+$/g.test(args[0])) {
          res = Number(res);
        }
        if (webgalStore.getState().userData.globalGameVar?.[command] === undefined) {
          dispatch(
            setGlobalVar({
              key: command,
              value: res,
            }),
          );
        }
      });
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    setStorage();
  });
};
