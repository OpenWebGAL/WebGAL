import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

const pixiRain = (rainSpeed: number, number: number) => {
  // 动画参数
  // 设置缩放的系数
  const scalePreset = 0.48;

  const effectsContainer = WebGAL.gameplay.pixiStage!.effectsContainer!;
  const app = WebGAL.gameplay.pixiStage!.currentApp!;
  const container = new PIXI.Container();
  effectsContainer.addChild(container);
  // 创建纹理
  const texture = PIXI.Texture.from('./game/tex/raindrop.png');
  // 将容器移到中心
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  // 调整缩放
  container.scale.x = 1;
  container.scale.y = 1;
  // container.rotation = -0.2;
  const bunnyList: PIXI.Sprite[] = [];
  // 监听动画更新
  function ticker(delta: number) {
    // 获取长宽，用于控制雪花出现位置
    const stageWidth = SCREEN_CONSTANTS.width;
    const stageHeight = SCREEN_CONSTANTS.height;
    for (let i = 0; i < number; i++) {
      // 创建对象
      const bunny = new PIXI.Sprite(texture);
      // 随机雨点大小
      let scaleRand = Math.random();
      if (scaleRand <= 0.5) {
        scaleRand = 0.5;
      }
      bunny.scale.x = scalePreset * scaleRand;
      bunny.scale.y = scalePreset * scaleRand;
      // 设置锚点
      bunny.anchor.set(0.5);
      // 随机雪花位置
      bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
      bunny.y = 0 - 0.5 * stageHeight;
      // @ts-ignore
      bunny['dropSpeed'] = Math.random() * 2;
      // @ts-ignore
      bunny['acc'] = Math.random();
      bunny['alpha'] = Math.random();
      if (bunny['alpha'] >= 0.5) {
        bunny['alpha'] = 0.5;
      }
      if (bunny['alpha'] <= 0.2) {
        bunny['alpha'] = 0.2;
      }
      container.addChild(bunny);
      // 控制每片雨点
      bunnyList.push(bunny);

      // 控制同屏雨点数
      if (bunnyList.length >= 2500) {
        bunnyList.shift()?.destroy();
        container.removeChild(container.children[0]);
      }
    }
    // 雨点落下
    for (const e of bunnyList) {
      // @ts-ignore
      e['dropSpeed'] = e['acc'] * 0.01 + e['dropSpeed'];
      // @ts-ignore
      e.y += delta * rainSpeed * e['dropSpeed'] * 1.1 + 3;
    }
  }
  WebGAL.gameplay.pixiStage?.registerAnimation(
    { setStartState: () => {}, setEndState: () => {}, tickerFunc: ticker },
    'rain-Ticker',
  );
  return { container, tickerKey: 'rain-Ticker' };
};

registerPerform('rain', () => pixiRain(6, 10));
