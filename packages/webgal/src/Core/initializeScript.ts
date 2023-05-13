/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */

import { logger } from './util/etc/logger';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { resize } from './util/coreInitialFunction/resize';
import { assetSetter, fileType } from './util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { RUNTIME_SCENE_DATA } from './runtime/sceneData';
import { sceneParser } from './parser/sceneParser';
import { setVolume } from '@/Core/controller/stage/setVolume';
import { bindExtraFunc } from '@/Core/util/coreInitialFunction/bindExtraFunc';
import { webSocketFunc } from '@/Core/util/syncWithEditor/webSocketFunc';
import uniqWith from 'lodash/uniqWith';
import { RUNTIME_SETTLED_SCENES, RUNTIME_USER_ANIMATIONS } from './runtime/etc';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import axios from 'axios';

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
  const u = navigator.userAgent;
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否是 iOS终端

  // 打印初始log信息
  logger.info('WebGAL 4.3.15');
  logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
  logger.info('Made with ❤ by MakinoharaShoko');
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (!isIOS) {
    resize();
    setTimeout(resize, 100);
    window.onresize = resize;
    // 监听键盘 F11 事件，全屏时触发页面调整
    document.onkeydown = function (event) {
      const e = event;
      if (e && e.key === 'F11') {
        setTimeout(() => {
          resize();
        }, 50);
      }
    };
  } else {
    /**
     * iOS
     */
    alert(
      '由于苹果设备存在的兼容性问题，我们可能会花费更长的时间启动引擎 | Due to compatibility issues with Apple devices, we may take longer to start the engine. | Appleのデバイスとの互換性の問題により、エンジンの起動に時間がかかる可能性があります。',
    );
    setTimeout(resize, 5000);
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
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始场景的预加载
    const subSceneList = RUNTIME_SCENE_DATA.currentScene.subSceneList;
    RUNTIME_SETTLED_SCENES.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
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
  RUNTIME_GAMEPLAY.pixiStage = new PixiStage();

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
      axios.get(`./game/animation/${animationName}.json`).then((res) => {
        if (res.data) {
          const userAnimation = {
            name: animationName,
            effects: res.data,
          };
          RUNTIME_USER_ANIMATIONS.push(userAnimation);
        }
      });
    }
  });
}
