import axios from 'axios';
import { logger } from '../etc/logger';
import { assetSetter, fileType } from '../gameAssetsAccess/assetSetter';
import { getStorage } from '../../controller/storage/storageController';
import { webgalStore } from '@/store/store';
import { setGuiAsset } from '@/store/GUIReducer';
import { setEbg } from '@/Core/util/setEbg';
import { setLogo } from '@/Core/util/setLogo';
import { WebGAL } from '@/main';
import { initKey } from '@/Core/controller/storage/fastSaveLoad';

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
  const GUIState = webgalStore.getState().GUI;
  const dispatch = webgalStore.dispatch;
  axios.get(encodeURI(url)).then((r) => {
    let gameConfigRaw: Array<string> = r.data.split('\n'); // 游戏配置原始数据
    gameConfigRaw = gameConfigRaw.map((e) => e.split(';')[0]);
    const gameConfig: Array<Array<string>> = gameConfigRaw.map((e) => e.split(':')); // 游戏配置数据
    logger.info('获取到游戏信息', gameConfig);
    // 按照游戏的配置开始设置对应的状态
    if (GUIState) {
      gameConfig.forEach((e) => {
        // 设置标题背景
        if (e[0] === 'Title_img') {
          const url: string = assetSetter(e[1], fileType.background);
          dispatch(setGuiAsset({ asset: 'titleBg', value: url }));
          setEbg(url);
        }
        if (e[0] === 'LogoImage') {
          const logoList: any = e[1].split(' ');
          let urlList = '';
          for (let i = 0; i < logoList.length; i++) {
            let url: string = assetSetter(logoList[i], fileType.background);
            if (i + 1 === logoList.length) {
              urlList += url;
            } else {
              urlList += url + ' ';
            }
          }
          dispatch(setGuiAsset({ asset: 'logoImage', value: urlList }));
        }
        // 设置标题背景音乐
        if (e[0] === 'Title_bgm') {
          const url: string = assetSetter(e[1], fileType.bgm);
          dispatch(setGuiAsset({ asset: 'titleBgm', value: url }));
        }
        if (e[0] === 'Game_name') {
          WebGAL.gameName = e[1];
          document.title = e[1];
        }
        if (e[0] === 'Game_key') {
          WebGAL.gameKey = e[1];
          getStorage();
        }
      });
    }
    window?.renderPromise?.();
    delete window.renderPromise;
    initKey();
  });
};
