import { webgalStore } from '@/store/store';
import { setGlobalVar, setUserData } from '@/store/userDataReducer';
import { setEnableAppreciationMode } from '@/store/GUIReducer';
import { Live2D, WebGAL } from '@/Core/WebGAL';
import { WebgalParser } from '@/Core/parser/sceneParser';
import { getStorageAsync, setStorage } from '@/Core/controller/storage/storageController';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { logger } from '@/Core/util/logger';
import axios from 'axios';
import { IGameVar } from '@/store/stageInterface';

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
    // 存储 config.txt 中的配置，用于清除所有数据时还原配置
    const gameConfigInit: IGameVar = {};
    // 按照游戏的配置开始设置对应的状态
    gameConfig.forEach((e) => {
      const { command, args } = e;
      if (args.length > 0) {
        if (args.length > 1) {
          gameConfigInit[command] = args.join('|');
          dispatch(
            setGlobalVar({
              key: command,
              value: args.join('|'),
            }),
          );
        } else {
          let res: any = args[0].trim();
          if (/^(true|false)$/g.test(args[0])) {
            res = res === 'true';
          } else if (/^[0-9]+\.?[0-9]+$/g.test(args[0])) {
            res = Number(res);
          }

          gameConfigInit[command] = res;
          dispatch(
            setGlobalVar({
              key: command,
              value: res,
            }),
          );

          if (command === 'Enable_Appreciation') {
            dispatch(setEnableAppreciationMode(res));
          }
          if (command === 'Legacy_Expression_Blend_Mode') {
            Live2D.legacyExpressionBlendMode = res === true;
          }
          if (command === 'Steam_AppID') {
            const appId = String(res);
            WebGAL.steam.initialize(appId);
          }
        }
      }
    });

    dispatch(setUserData({ key: 'gameConfigInit', value: gameConfigInit }));
    // @ts-expect-error renderPromiseResolve is a global variable
    window.renderPromiseResolve();
    setStorage();
  });
};
