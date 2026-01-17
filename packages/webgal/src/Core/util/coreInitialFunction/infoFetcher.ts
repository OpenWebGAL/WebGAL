import { webgalStore } from '@/store/store';
import { setGlobalVar } from '@/store/userDataReducer';
import { setEnableAppreciationMode } from '@/store/GUIReducer';
import { Live2D, WebGAL } from '@/Core/WebGAL';
import { getStorageAsync, setStorage } from '@/Core/controller/storage/storageController';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';
import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { logger } from '@/Core/util/logger';
import axios from 'axios';

interface IWebgalConfig {
  gameName?: string; // 游戏名称
  gameKey?: string; // 游戏Key
  gameLogo?: string; // 游戏Logo
  titleImage?: string; // 标题图片
  titleBgm?: string; // 标题背景音乐
  description?: string; // 游戏描述
  defaultLanguage?: string; // 默认语言
  packageName?: string; // 包名
  steamAppId?: string; // Steam 应用 ID
  enableExtra?: boolean; // 启用鉴赏功能
  enablePanic?: boolean; // 启用紧急回避
  enableLegacyExpressionBlendMode?: boolean; // 启用旧版 Live2D 表情混合模式
  textboxMaxLine?: number; // 文字框最大行数
  textboxLineHeight?: number; // 文字框行高
}

/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = async (url: string) => {
  const dispatch = webgalStore.dispatch;
  const resp = await axios.get(url);
  const gameConfig: IWebgalConfig = resp.data;
  logger.info('获取到游戏信息', gameConfig);
  // 先把 key 找到并设置了
  WebGAL.gameKey = gameConfig.gameKey ?? '';
  initKey();
  await getStorageAsync();
  getFastSaveFromStorage();
  getSavesFromStorage(0, 0);
  // 将游戏配置写入为全局变量
  for (const [key, value] of Object.entries(gameConfig)) {
    if (value === undefined) continue;
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      dispatch(
        setGlobalVar({
          key: key,
          value: value,
        }),
      );
    } else {
      dispatch(
        setGlobalVar({
          key: key,
          value: String(value),
        }),
      );
    }
  }
  // 配置游戏
  if (gameConfig.enableExtra !== undefined) {
    dispatch(setEnableAppreciationMode(gameConfig.enableExtra));
  }
  if (gameConfig.enableLegacyExpressionBlendMode !== undefined) {
    Live2D.legacyExpressionBlendMode = gameConfig.enableLegacyExpressionBlendMode;
  }
  if (gameConfig.steamAppId !== undefined) {
    WebGAL.steam.initialize(gameConfig.steamAppId);
  }
  // @ts-expect-error renderPromiseResolve is a global variable
  window.renderPromiseResolve();
  setStorage();
};
