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
import { IGameVar } from '@/Core/Modules/stage/stageInterface';
import { setANICursor } from 'ani-cursor.js';

/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string): Promise<IGameVar> => {
  const dispatch = webgalStore.dispatch;
  return axios.get(url).then(async (r) => {
    let gameConfigRaw: string = r.data;
    let gameConfig = WebgalParser.parseConfig(gameConfigRaw);
    logger.info('获取到游戏信息', gameConfig);
    // 先把 key 找到并设置了
    const keyItem = gameConfig.find((e: any) => e.command === 'Game_key');
    WebGAL.gameKey = (keyItem?.args?.[0] as string) ?? '';
    initKey();
    await getStorageAsync();
    getFastSaveFromStorage();
    getSavesFromStorage(0, 0);
    // 存储 config.txt 中的配置，用于清除所有数据时还原配置
    const gameConfigInit: IGameVar = {};
    // 按照游戏的配置开始设置对应的状态
    gameConfig.forEach((e: any) => {
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
          // 自定义光标
          const customCorsurSize = { width: 32, height: 32 };
          if (command === 'Custom_Corsur_Ani_Size') {
            const corsurSize = String(res)
              .split(/\s+/)
              .filter((e) => e);
            if (corsurSize.length === 2) {
              const width = parseInt(corsurSize[0]);
              const height = parseInt(corsurSize[1]);
              // see to https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor#icon_size_limits
              if (width > 32 || height > 32) {
                logger.warn('size to large, we suggest set to 32x32 size');
              }
              if (width > 0 && height > 0) {
                customCorsurSize.width = width;
                customCorsurSize.height = height;
              }
            }
          }
          if (command === 'Custom_Corsur') {
            const group = String(res)
              .split(/\s+/)
              .filter((e) => e);
            for (const token of group) {
              const arr = token.split(',').map((e) => e.trim());
              const safeUrl = `/game/${arr[0]}`.replace(/\\/g, '\\\\');
              const type = arr?.[1] ?? 'auto';
              if (String(safeUrl).endsWith('.ani')) {
                const hotspotX = parseInt(arr?.[2]);
                const hotspotY = parseInt(arr?.[3]);
                setANICursor(
                  'html *',
                  safeUrl,
                  type,
                  customCorsurSize.width,
                  customCorsurSize.height,
                  hotspotX > 0 ? hotspotX : undefined,
                  hotspotY > 0 ? hotspotY : undefined,
                );
              } else {
                const hotspot = `${arr?.[2] ?? ''} ${arr?.[3] ?? ''}`;
                const cursorCss = document.createElement('style');
                cursorCss.textContent = `html * { cursor: url(${safeUrl}) ${hotspot}, ${type} !important; }`;
                document.head.appendChild(cursorCss);
              }
            }
          }
        }
      }
    });

    dispatch(setUserData({ key: 'gameConfigInit', value: gameConfigInit }));
    await WebGAL.flowchartManager.init(WebGAL.gameKey, gameConfigInit.Enable_flowchart === true);
    // @ts-expect-error renderPromiseResolve is a global variable
    window.renderPromiseResolve();
    setStorage();

    return gameConfigInit;
  });
};
