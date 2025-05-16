/* eslint-disable max-params */
import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';
import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

type containerType = 'foreground' | 'background';

interface SnowflakeSprite extends PIXI.Sprite {
  vy: number;
  vx: number;
  rotationSpeed: number;
}

const snow = (
  name: string,
  containerType: containerType,
  snowSpeed: number, // 雪花下落速度
  maxSnowflakes: number, // 最大雪花数量
  snowSize: number, // 雪花大小
  angle: number, // 角度
) => {
  const scalePreset = snowSize;

  const pixiStage = WebGAL.gameplay.pixiStage;

  if (!pixiStage) {
    console.error(`[${name}] PixiStage is not available for snow effect.`);
    return { container: new PIXI.Container(), tickerKey: `${name}-Ticker-ErrorPixiStage` };
  }

  const app = pixiStage.currentApp;

  if (!app) {
    console.error(`[${name}] PixiJS app is not available for snow effect.`);
    return { container: new PIXI.Container(), tickerKey: `${name}-Ticker-ErrorPixiApp` };
  }

  const effectsContainer =
    containerType === 'foreground' ? pixiStage.foregroundEffectsContainer : pixiStage.backgroundEffectsContainer;

  const screenWidth = SCREEN_CONSTANTS.width;
  const screenHeight = SCREEN_CONSTANTS.height;

  const rotationContainer = new PIXI.Container();

  rotationContainer.angle = angle;

  const angleInRadians = rotationContainer.rotation;
  const absCos = Math.abs(Math.cos(angleInRadians));
  const absSin = Math.abs(Math.sin(angleInRadians));

  const stageWidth = screenWidth * absCos + screenHeight * absSin;
  const stageHeight = screenWidth * absSin + screenHeight * absCos;

  rotationContainer.width = stageWidth;
  rotationContainer.height = stageHeight;
  rotationContainer.pivot.set(stageWidth / 2, stageHeight / 2);
  rotationContainer.position.set(screenWidth / 2, screenHeight / 2);

  effectsContainer.addChild(rotationContainer);

  const particleContainer = new PIXI.ParticleContainer(maxSnowflakes, {
    scale: true,
    position: true,
    rotation: true,
    alpha: true,
    uvs: false,
  });

  rotationContainer.addChild(particleContainer);

  const snowflakeTextures: PIXI.Texture[] = [];
  const snowflakes: SnowflakeSprite[] = [];

  const baseTexturePath = './game/tex/snow.png';
  const SPRITE_WIDTH = 128;
  const SPRITE_HEIGHT = 128;
  const NUM_SPRITES = 10;

  const snowflakeStyleWeights = [10, 2, 2, 2, 1, 1, 1, 1, 2, 2]; // 雪花样式权重

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
    snowflake.scale.set(scalePreset * randomScaleFactor);
    snowflake.anchor.set(0.5);

    if (isInitialSpawn) {
      snowflake.x = Math.random() * stageWidth;
      snowflake.y = Math.random() * stageHeight;
    } else {
      snowflake.x = Math.random() * stageWidth;
      snowflake.y = -Math.random() * 50 - snowflake.height;
    }

    snowflake.alpha = Math.random() * 0.2 + 0.8; // 随机透明度
    snowflake.vy = (Math.random() * 0.4 + 0.8) * snowSpeed; // 随机垂直速度
    snowflake.vx = (Math.random() - 0.5) * 0.25 * snowSpeed; // 随机水平速度
    snowflake.rotationSpeed = (Math.random() - 0.5) * 0.005; // 随机旋转速度
  };

  const createSnowflakeInstance = (): SnowflakeSprite => {
    if (snowflakeTextures.length === 0) {
      console.warn(
        `[${name}] createSnowflakeInstance called but snowflakeTextures is empty. Using emergency fallback.`,
      );
      const gr = new PIXI.Graphics().beginFill(0xff0000, 0.5).drawCircle(0, 0, 5).endFill();
      const emergencyTexture = app?.renderer.generateTexture(gr);
      const sf = new PIXI.Sprite(emergencyTexture) as SnowflakeSprite;
      gr.destroy();
      return sf;
    }

    let textureIndex: number;
    if (snowflakeTextures.length === NUM_SPRITES) {
      textureIndex = getWeightedRandomIndex(snowflakeStyleWeights);
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
    console.log(`[${name}] Setting up snowflakes and animation. Base texture path: ${baseTexturePath}`);
    snowflakeTextures.length = 0;
    while (snowflakes.length > 0) snowflakes.pop();
    particleContainer.removeChildren();

    const baseTexture = PIXI.BaseTexture.from(baseTexturePath);

    const finalizeSetup = () => {
      if (!baseTexture.valid) {
        console.error(`[${name}] Base texture ${baseTexturePath} is not valid even after load attempt.`);
        const gr = new PIXI.Graphics().beginFill(0xcccccc).drawRect(0, 0, 10, 10).endFill();
        const placeholderTexture = app.renderer.generateTexture(gr);
        snowflakeTextures.push(placeholderTexture);
        gr.destroy();
        console.warn(`[${name}] Using placeholder texture for snowflakes due to baseTexture loading issues.`);
      } else {
        console.log(`[${name}] Base texture ${baseTexturePath} is valid. Slicing textures.`);
        for (let i = 0; i < NUM_SPRITES; i++) {
          const frame = new PIXI.Rectangle(i * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
          snowflakeTextures.push(new PIXI.Texture(baseTexture, frame));
        }
      }

      if (snowflakeTextures.length === 0) {
        console.error(`[${name}] Failed to create any snowflake textures. Cannot create sprites.`);
        return;
      }
      if (!snowflakeTextures[0]?.valid) {
        console.warn(
          `[${name}] First snowflake texture is invalid after creation. Sprites might not render correctly.`,
        );
      }

      console.log(`[${name}] Creating ${maxSnowflakes} snowflake sprites.`);
      for (let i = 0; i < maxSnowflakes; i++) {
        const snowflake = createSnowflakeInstance();
        particleContainer.addChild(snowflake);
        snowflakes.push(snowflake);
      }
      console.log(`[${name}] ${snowflakes.length} snowflakes created and added to container.`);

      if (WebGAL.gameplay.pixiStage) {
        console.log(`[${name}] Registering animation ticker.`);
        WebGAL.gameplay.pixiStage.registerAnimation(
          {
            setStartState: () => {
              particleContainer.visible = true;
            },
            setEndState: () => {},
            tickerFunc: tickerFn,
          },
          `${name}-Ticker`,
        );
        particleContainer.visible = true;
      } else {
        console.error(`[${name}] WebGAL.gameplay.pixiStage is not available to register animation.`);
      }
    };

    if (baseTexture.valid) {
      console.log(`[${name}] Base texture ${baseTexturePath} is already valid.`);
      finalizeSetup();
    } else {
      console.log(`[${name}] Base texture ${baseTexturePath} is not yet valid. Waiting for load event.`);
      baseTexture.once('loaded', () => {
        console.log(`[${name}] Base texture ${baseTexturePath} loaded successfully via event.`);
        finalizeSetup();
      });
      baseTexture.once('error', (errorEvent) => {
        console.error(`[${name}] Error loading base texture ${baseTexturePath}:`, errorEvent);
        finalizeSetup();
      });
    }
  };

  setupSnowflakesAndAnimation();

  return { container: particleContainer, tickerKey: `${name}-Ticker` };
};

registerPerform('snow', {
  fg: () => snow('snow-foreground', 'foreground', 3, 250, 0.4, 0),
  bg: () => snow('snow-background', 'background', 1, 750, 0.2, 0),
});

registerPerform('heavySnow', {
  fg: () => snow('heavy-snow-foreground', 'foreground', 20, 1000, 0.6, -75),
  bg: () => snow('heavy-snow-background', 'background', 10, 2000, 0.3, -80),
});
