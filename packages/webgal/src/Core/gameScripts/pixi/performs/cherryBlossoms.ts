/* eslint-disable max-params */
import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';
import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

type ContainerType = 'foreground' | 'background';

interface SakuraSprite extends PIXI.Sprite {
  speed: number;
  positionPhase: number;
  scalePhase: number;
  rotationSpeed: number;
}

const pixiCherryBlossoms = (
  tickerKey: string,
  containerType: ContainerType,
  speed: number, // 下落速度
  horizontal: number, // 横向摆动幅度
  maxNumber: number, // 最大数量
  scale: number, // 缩放
  angle: number, // 角度
) => {
  const pixiStage = WebGAL.gameplay.pixiStage!;

  const effectsContainer =
    containerType === 'foreground' ? pixiStage.foregroundEffectsContainer : pixiStage.backgroundEffectsContainer;

  const screenWidth = SCREEN_CONSTANTS.width;
  const screenHeight = SCREEN_CONSTANTS.height;

  const container = new PIXI.Container();

  container.angle = angle;

  const angleInRadians = container.rotation;
  const absCos = Math.abs(Math.cos(angleInRadians));
  const absSin = Math.abs(Math.sin(angleInRadians));

  const stageWidth = screenWidth * absCos + screenHeight * absSin;
  const stageHeight = screenWidth * absSin + screenHeight * absCos;

  container.width = stageWidth;
  container.height = stageHeight;
  container.pivot.set(stageWidth / 2, stageHeight / 2);
  container.position.set(screenWidth / 2, screenHeight / 2);

  effectsContainer.addChild(container);

  const particleContainer = new PIXI.ParticleContainer(maxNumber, {
    scale: true,
    position: true,
    rotation: true,
    uvs: false,
    alpha: true,
  });

  container.addChild(particleContainer);

  const sakuras: SakuraSprite[] = [];
  const texture = PIXI.Texture.from('./game/tex/cherryBlossoms.png');

  const randRange = (min: number, max: number): number => min + Math.random() * (max - min);

  for (let i = 0; i < maxNumber; i++) {
    const scalePhase = Math.random() * Math.PI * 2;

    const sakura = PIXI.Sprite.from(texture) as SakuraSprite;

    sakura.anchor.set(0.5);
    sakura.x = Math.random() * stageWidth;
    sakura.y = Math.random() * stageHeight;
    sakura.rotation = Math.random() * Math.PI * 2;
    sakura.scale.set(Math.cos(scalePhase) * scale, Math.sin(scalePhase) * scale);
    sakura.speed = (randRange(0.5, 2.0) + randRange(0.1, 1)) * speed;
    sakura.rotationSpeed = Math.random() * 0.015 * (Math.random() < 0.5 ? 1 : -1);
    sakura.positionPhase = Math.random() * Math.PI * 2;
    sakura.scalePhase = scalePhase;

    sakuras.push(sakura);
    particleContainer.addChild(sakura);
  }

  function tickerFn(delta: number): void {
    const currentTime = Date.now() / 1000;

    for (const sakura of sakuras) {
      const horizontalMovement = Math.sin(currentTime + sakura.positionPhase) * horizontal;
      sakura.x += horizontalMovement * delta;
      sakura.y += sakura.speed * delta;
      sakura.rotation += sakura.rotationSpeed * delta;

      const newScaleX = Math.cos(currentTime + sakura.scalePhase) * scale;
      const newScaleY = Math.sin(currentTime + sakura.scalePhase) * scale;
      sakura.scale.set(newScaleX, newScaleY);

      const actualSpriteWidth = Math.abs(sakura.width * scale);
      const actualSpriteHeight = Math.abs(sakura.height * scale);

      if (sakura.x + actualSpriteWidth / 2 < -stageWidth) {
        sakura.x = stageWidth + actualSpriteWidth / 2;
      } else if (sakura.x - actualSpriteWidth / 2 > stageWidth) {
        sakura.x = -stageWidth - actualSpriteWidth / 2;
      }

      if (sakura.y - actualSpriteHeight / 2 > stageHeight) {
        sakura.x = Math.random() * stageWidth;
        sakura.y = -Math.random() * 50 - actualSpriteHeight;

        sakura.positionPhase = Math.random() * Math.PI * 2;
        sakura.scalePhase = Math.random() * Math.PI * 2;
        sakura.speed = (randRange(0.5, 2.0) + randRange(0.1, 1)) * speed;
        sakura.rotationSpeed = Math.random() * 0.015 * (Math.random() < 0.5 ? 1 : -1);
      }
    }
  }

  pixiStage.registerAnimation(
    {
      setStartState: () => {},
      setEndState: () => {},
      tickerFunc: tickerFn,
    },
    tickerKey,
  );

  return { container, tickerKey };
};

registerPerform('cherryBlossoms', {
  fg: () => pixiCherryBlossoms('cherry-blossoms-foreground-ticker', 'foreground', 2, 3, 100, 0.05, 0),
  bg: () => pixiCherryBlossoms('cherry-blossoms-background-ticker', 'background', 1, 2, 300, 0.025, 0),
});
