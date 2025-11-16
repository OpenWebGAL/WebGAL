/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import { logger } from './util/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { sceneParser } from './parser/sceneParser';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { webSocketFunc } from '@/Core/util/syncWithEditor/webSocketFunc';
import uniqWith from 'lodash/uniqWith';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import axios from 'axios';
import { __INFO } from '@/config/info';
import { WebGAL } from '@/Core/WebGAL';

const u = navigator.userAgent;
export const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否是 iOS终端

enum LoadStatus {
  USER_ANIMATION,
  CONFIG,
  START_SCENE,
  SUB_SCENE,
  PIXI_STAGE,
}

/**
 * 引擎初始化函数
 */
export const initializeScript = async () => {
  // 打印初始log信息
  logger.info(`WebGAL v${__INFO.version}`);
  logger.info('Github: https://github.com/OpenWebGAL/WebGAL ');
  logger.info('Made with ❤ by OpenWebGAL');
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (isIOS) {
    /**
     * iOS
     */
    alert(
      `iOS 用户请横屏使用以获得最佳体验
| Please use landscape mode on iOS for the best experience
| iOS ユーザーは横画面での使用をお勧めします`,
    );
  }

  // 加载条
  const loadingBar = document.getElementById('launchScreenLoadingBar');
  const loadStatusKeys = Object.keys(LoadStatus).filter((key) => isNaN(Number(key)));

  function updateLoadingStatus(status: LoadStatus): void {
    if (!loadingBar) return;
    const progress = (Number(status) + 1) / loadStatusKeys.length;
    loadingBar.style.width = `${progress * 100}%`;
  }

  function finishLoadingBar(): void {
    if (!loadingBar) return;
    // 此处的等待 500 毫秒仅出于观感考虑
    setTimeout(() => {
      loadingBar.style.removeProperty('width');
      loadingBar.classList.add('launch_screen_loading_bar_loaded');
    }, 500);
  }

  // 获得 user Animation
  updateLoadingStatus(LoadStatus.USER_ANIMATION);
  await getUserAnimation();

  // 获取游戏信息
  updateLoadingStatus(LoadStatus.CONFIG);
  await infoFetcher('./game/config.txt');

  // 获取start场景
  updateLoadingStatus(LoadStatus.START_SCENE);
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);

  // 场景写入到运行时
  const rawScene = await sceneFetcher(sceneUrl);
  WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);

  // 开始场景的预加载
  updateLoadingStatus(LoadStatus.SUB_SCENE);
  const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
  WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
  const subSceneListUniq = uniqWith(subSceneList); // 去重
  await scenePrefetcher(subSceneListUniq);

  /**
   * 启动Pixi
   */
  updateLoadingStatus(LoadStatus.PIXI_STAGE);
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

  // hideLaunchScreen();
  finishLoadingBar();
};

async function getUserAnimation() {
  const res = await axios.get('./game/animation/animationTable.json');
  const animations: Array<string> = res.data;
  for (const animationName of animations) {
    const res = await axios.get(`./game/animation/${animationName}.json`);
    if (res.data) {
      const userAnimation = {
        name: animationName,
        effects: res.data,
      };
      WebGAL.animationManager.addAnimation(userAnimation);
    }
  }
}
