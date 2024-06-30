import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

const pixicherryBlossoms = (cherryBlossomsSpeed: number) => {
  // アニメーション パラメータ
  // 倍率を設定
  // 动画参数
  // 设置缩放的系数
  const scalePreset = 0.15;

  const effectsContainer = WebGAL!.gameplay!.pixiStage!.effectsContainer;
  const app = WebGAL!.gameplay!.pixiStage!.currentApp!;
  const container = new PIXI.Container();
  effectsContainer.addChild(container);
  // テクスチャを作成
  // 创建纹理
  const texture = PIXI.Texture.from('./game/tex/cherryBlossoms.png');
  // コンテナを中央に移動
  // 将容器移到中心
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;
  // ズームを調整
  // 调整缩放
  container.scale.x = 1;
  container.scale.y = 1;
  // container.rotation = -0.2;
  const bunnyList: any = [];
  // アニメーションの更新を監視
  // 监听动画更新
  function tickerFn(delta: number) {
    // 桜の位置を制御するために使用される長さと幅を取得します
    // 获取长宽，用于控制花出现位置
    const stageWidth = SCREEN_CONSTANTS.width;
    const stageHeight = SCREEN_CONSTANTS.height;
    // オブジェクトを作成
    // 创建对象
    const bunny = new PIXI.Sprite(texture);
    let scaleRand = 0.25;

    bunny.scale.x = scalePreset * scaleRand;
    bunny.scale.y = scalePreset * scaleRand;
    // アンカーポイントを設定
    // 设置锚点
    bunny.anchor.set(0.5);
    // ランダムな桜の位置
    // 随机花位置
    bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
    bunny.y = 0 - 0.5 * stageHeight;
    // @ts-ignore
    bunny['dropSpeed'] = Math.random() * 5;
    // @ts-ignore
    bunny['acc'] = Math.random();
    container.addChild(bunny);
    bunnyList.push(bunny);

    let count = 0;
    for (const e of bunnyList) {
      count++;
      const randomNumber = Math.random();
      e['dropSpeed'] = e['acc'] * 0.01 + e['dropSpeed'];
      e.y += delta * cherryBlossomsSpeed * e['dropSpeed'] * 0.3 + 0.7;
      const addX = count % 2 === 0;
      if (addX) {
        e.x += delta * randomNumber * 0.5;
        e.rotation += delta * randomNumber * 0.03;
      } else {
        e.x -= delta * randomNumber * 0.5;
        e.rotation -= delta * randomNumber * 0.03;
      }
    }
    // 同じ画面上の桜の数を制御します
    // 控制同屏花数
    if (bunnyList.length >= 200) {
      bunnyList.shift()?.destroy();
      container.removeChild(container.children[0]);
    }
  }
  WebGAL!.gameplay!.pixiStage!.registerAnimation(
    { setStartState: () => {}, setEndState: () => {}, tickerFunc: tickerFn },
    'cherryBlossoms-Ticker',
  );
  return { container, tickerKey: 'cherryBlossoms-Ticker' };
};

registerPerform('cherryBlossoms', () => pixicherryBlossoms(3));
