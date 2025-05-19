/* eslint-disable max-params */
import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';
import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

type ContainerType = 'foreground' | 'background';

interface SnowflakeSprite extends PIXI.Sprite {
  vy: number;
  vx: number;
  rotationSpeed: number;
}

const pixiSnow = (
  tickerKey: string,
  containerType: ContainerType,
  speed: number, // 下落速度
  maxNumber: number, // 最大数量
  scale: number, // 大小
  angle: number, // 角度
) => {
  const pixiStage = WebGAL.gameplay.pixiStage!;
  const app = pixiStage.currentApp!;

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
    alpha: true,
    uvs: false,
  });

  container.addChild(particleContainer);

  const snowflakeTextures: PIXI.Texture[] = [];
  const snowflakes: SnowflakeSprite[] = [];

  const baseTexturePath = './game/tex/snow.png';
  const SPRITE_WIDTH = 128;
  const SPRITE_HEIGHT = 128;
  const NUM_SPRITES = 10;

  const styleWeights = [10, 2, 2, 2, 1, 1, 1, 2, 2, 2]; // 雪花样式权重

  const getWeightedRandomIndex = (weights: number[]): number => {
    if (!weights || weights.length === 0) {
      return 0;
    }
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
      return Math.floor(Math.random() * weights.length);
    }
    let random = Math.random() * totalWeight;
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return weights.length - 1;
  };

  const resetSnowflake = (snowflake: SnowflakeSprite, isInitialSpawn = false) => {
    const randomScaleFactor = Math.random() * 0.5 + 0.5; // 随机缩放因子
    snowflake.scale.set(scale * randomScaleFactor);
    snowflake.anchor.set(0.5);

    if (isInitialSpawn) {
      snowflake.x = Math.random() * stageWidth;
      snowflake.y = Math.random() * stageHeight;
    } else {
      snowflake.x = Math.random() * stageWidth;
      snowflake.y = -Math.random() * 50 - snowflake.height;
    }

    snowflake.alpha = Math.random() * 0.2 + 0.8; // 随机透明度
    snowflake.vy = (Math.random() * 0.4 + 0.8) * speed; // 随机垂直速度
    snowflake.vx = (Math.random() - 0.5) * 0.25 * speed; // 随机水平速度
    snowflake.rotationSpeed = (Math.random() - 0.5) * 0.005; // 随机旋转速度
  };

  const createSnowflakeInstance = (): SnowflakeSprite => {
    let textureIndex: number;
    if (snowflakeTextures.length === NUM_SPRITES) {
      textureIndex = getWeightedRandomIndex(styleWeights);
    } else {
      textureIndex = Math.floor(Math.random() * snowflakeTextures.length);
    }
    textureIndex = Math.max(0, Math.min(textureIndex, snowflakeTextures.length - 1));

    const snowflake = new PIXI.Sprite(snowflakeTextures[textureIndex]) as SnowflakeSprite;
    resetSnowflake(snowflake, true);
    return snowflake;
  };

  const tickerFn = (delta: number) => {
    for (const snowflake of snowflakes) {
      snowflake.y += snowflake.vy * delta;
      snowflake.x += snowflake.vx * delta;
      snowflake.rotation += snowflake.rotationSpeed * delta;
      if (
        snowflake.y - snowflake.height / 2 > stageHeight ||
        snowflake.x < -snowflake.width ||
        snowflake.x > stageWidth + snowflake.width
      ) {
        resetSnowflake(snowflake, false);
      }
    }
  };

  const setupSnowflakesAndAnimation = () => {
    snowflakeTextures.length = 0;
    while (snowflakes.length > 0) snowflakes.pop();
    particleContainer.removeChildren();

    const baseTexture = PIXI.BaseTexture.from(baseTexturePath);

    const finalizeSetup = () => {
      if (baseTexture.valid) {
        for (let i = 0; i < NUM_SPRITES; i++) {
          const frame = new PIXI.Rectangle(i * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
          snowflakeTextures.push(new PIXI.Texture(baseTexture, frame));
        }
      }

      if (snowflakeTextures.length === 0) {
        console.error(`Failed to create any snowflake textures. Cannot create sprites.`);
        return;
      }
      if (!snowflakeTextures[0]?.valid) {
        console.warn(`First snowflake texture is invalid after creation. Sprites might not render correctly.`);
      }

      for (let i = 0; i < maxNumber; i++) {
        const snowflake = createSnowflakeInstance();
        particleContainer.addChild(snowflake);
        snowflakes.push(snowflake);
      }

      pixiStage.registerAnimation(
        {
          setStartState: () => {},
          setEndState: () => {},
          tickerFunc: tickerFn,
        },
        tickerKey,
      );
    };

    if (baseTexture.valid) {
      finalizeSetup();
    } else {
      baseTexture.once('loaded', () => {
        finalizeSetup();
      });
      baseTexture.once('error', (errorEvent) => {
        console.error(`Error loading base texture ${baseTexturePath}:`, errorEvent);
        finalizeSetup();
      });
    }
  };

  setupSnowflakesAndAnimation();

  return { container, tickerKey };
};

registerPerform('snow', {
  fg: () => pixiSnow('snow-foreground-ticker', 'foreground', 3, 250, 0.4, 0),
  bg: () => pixiSnow('snow-background-ticker', 'background', 1, 750, 0.2, 0),
});

registerPerform('heavySnow', {
  fg: () => pixiSnow('heavy-snow-foreground-ticker', 'foreground', 20, 1000, 0.6, -75),
  bg: () => pixiSnow('heavy-snow-background-ticker', 'background', 10, 2000, 0.3, -80),
});
