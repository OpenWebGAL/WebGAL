import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

const pixiSnow = (snowSpeed: number) => {
  // 动画参数
  // 设置缩放的系数
  const scalePreset = 0.144;

  const effectsContainer = WebGAL.gameplay.pixiStage!.effectsContainer!;
  const app = WebGAL.gameplay.pixiStage!.currentApp!;
  const container = new PIXI.Container();
  effectsContainer.addChild(container);
  // 创建纹理
  const texture = PIXI.Texture.from('./game/tex/snowFlake_min.png');
  // 将容器移到中心
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  // 调整缩放
  container.scale.x = 1;
  container.scale.y = 1;
  // container.rotation = -0.2;
  const bunnyList: any = [];
  let addBunnyCounter = 0;
  // 获取长宽，用于控制雪花出现位置
  const stageWidth = SCREEN_CONSTANTS.width;
  const stageHeight = SCREEN_CONSTANTS.height;
  // 监听动画更新
  function tickerFn(delta: number) {
    addBunnyCounter++;
    // 创建对象
    if (addBunnyCounter % 7 === 1) {
      const bunny = new PIXI.Sprite(texture);
      let filterRad = Math.random() * 8 + 1;
      bunny.filters = [new PIXI.filters.BlurFilter(filterRad)];
      // 随机雪花大小
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
      container.addChild(bunny);
      // 控制每片雪花
      bunnyList.push(bunny);
    }
    let count = 0; // 用于判断雪花往左还是往右飘，是2的倍数则往左
    for (const e of bunnyList) {
      count++;
      const randomNumber = Math.random();
      e['dropSpeed'] = e['acc'] * 0.01 + e['dropSpeed'];
      e.y += delta * snowSpeed * e['dropSpeed'] * 0.3 + 0.7;
      const addX = count % 2 === 0;
      if (addX) {
        e.x += delta * randomNumber * 0.5;
        e.rotation += delta * randomNumber * 0.03;
      } else {
        e.x -= delta * randomNumber * 0.5;
        e.rotation -= delta * randomNumber * 0.03;
      }
    }
    // 控制同屏雪花数
    if (bunnyList.length >= 100) {
      bunnyList.shift()?.destroy();
      container.removeChild(container.children[0]);
    }
  }
  WebGAL.gameplay.pixiStage?.registerAnimation(
    { setStartState: () => {}, setEndState: () => {}, tickerFunc: tickerFn },
    'snow-Ticker',
  );
  return { container, tickerKey: 'snow-Ticker' };
};

registerPerform('snow', () => pixiSnow(3));
