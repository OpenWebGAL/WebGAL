/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import { logger } from './util/etc/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { sceneParser } from './parser/sceneParser';
import { setVolume } from '@/Core/controller/stage/setVolume';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { webSocketFunc } from '@/Core/util/syncWithEditor/webSocketFunc';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import axios from 'axios';
import { WebGAL } from '@/main';
import { __INFO } from '@/config/info';

const u = navigator.userAgent;
export const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否是 iOS终端

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
  // 打印初始log信息
  logger.info(__INFO.version);
  logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
  logger.info('Made with ❤ by MakinoharaShoko');
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (isIOS) {
    /**
     * iOS
     */
    alert(
      `由于苹果设备的兼容性问题，引擎可能表现不正常或运行缓慢。
| Due to compatibility issues with Apple devices, the engine may behave abnormally or run slowly.
| Appleのデバイスとの互換性の問題により、エンジンの動作が正常でない場合や遅くなる可能性があります。`,
    );
  }

  // 获得 userAnimation
  loadStyle('./game/userStyleSheet.css');
  // 获得 user Animation
  getUserAnimation();
  // 获取游戏信息
  infoFetcher('./game/config.txt');
  // 获取start场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);
  });
  /**
   * 设置音量
   */
  setVolume();
  /**
   * 启动Pixi
   */
  WebGAL.gameplay.pixiStage = new PixiStage();

  /**
   * iOS 设备 卸载所有 Service Worker
   */
  // if ('serviceWorker' in navigator && isIOS) {
  //   navigator.serviceWorker.getRegistrations().then((registrations) => {
  //     for (const registration of registrations) {
  //       registration.unregister().then(() => {
  //         logger.info('已卸载 Service Worker');
  //       });
  //     }
  //   });
  // }

  /**
   * 绑定工具函数
   */
  bindExtraFunc();
  webSocketFunc();
};

function loadStyle(url: string) {
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  const head = document.getElementsByTagName('head')[0];
  head.appendChild(link);
}

function getUserAnimation() {
  axios.get('./game/animation/animationTable.json').then((res) => {
    const animations: Array<string> = res.data;
    for (const animationName of animations) {
      axios.get(encodeURI(`./game/animation/${animationName}.json`)).then((res) => {
        if (res.data) {
          const userAnimation = {
            name: animationName,
            effects: res.data,
          };
          WebGAL.animationManager.addAnimation(userAnimation);
        }
      });
    }
  });
}
