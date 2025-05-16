/* eslint-disable max-params */
import * as PIXI from 'pixi.js';
import { registerPerform } from '@/Core/util/pixiPerformManager/pixiPerformManager';

import { WebGAL } from '@/Core/WebGAL';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';

type containerType = 'foreground' | 'background';

interface RaindropSprite extends PIXI.Sprite {
  vy: number;
  vx: number;
}

const pixiRain = (
  name: string,
  containerType: containerType,
  speed: number, // 下落速度
  maxNumber: number, // 最大数量
  size: number, // 大小
  angle: number, // 角度
) => {
  const scalePreset = size;

  const pixiStage = WebGAL.gameplay.pixiStage;

  if (!pixiStage) {
    console.error(`[${name}] PixiStage is not available for rain effect.`);
    return { container: new PIXI.Container(), tickerKey: `${name}-Ticker-ErrorPixiStage` };
  }

  const app = pixiStage.currentApp;

  if (!app) {
    console.error(`[${name}] PixiJS app is not available for rain effect.`);
    return { container: new PIXI.Container(), tickerKey: `${name}-Ticker-ErrorPixiApp` };
  }

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

  const raindropTextures: PIXI.Texture[] = [];
  const raindrops: RaindropSprite[] = [];

  const baseTexturePath = './game/tex/rain.png';
  const SPRITE_WIDTH = 128;
  const SPRITE_HEIGHT = 640;
  const NUM_SPRITES = 5;

  const styleWeights = [10, 5, 2, 2, 1]; // 样式权重

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

  const resetRaindrop = (raindrop: RaindropSprite, isInitialSpawn = false) => {
    const randomScaleFactor = Math.random() * 0.5 + 0.5; // 随机缩放因子
    raindrop.scale.set(scalePreset * randomScaleFactor);
    raindrop.anchor.set(0.5);

    if (isInitialSpawn) {
      raindrop.x = Math.random() * stageWidth;
      raindrop.y = Math.random() * stageHeight;
    } else {
      raindrop.x = Math.random() * stageWidth;
      raindrop.y = -Math.random() * 50 - raindrop.height;
    }

    raindrop.alpha = Math.random() * 0.5 + 0.5; // 随机透明度
    raindrop.vy = (Math.random() * 0.4 + 0.8) * speed; // 随机垂直速度
  };

  const createRaindropInstance = (): RaindropSprite => {
    if (raindropTextures.length === 0) {
      console.warn(`[${name}] createRaindropInstance called but raindropTextures is empty. Using emergency fallback.`);
      const graphic = new PIXI.Graphics().beginFill(0xff0000, 0.5).drawCircle(0, 0, 5).endFill();
      const emergencyTexture = app?.renderer.generateTexture(graphic);
      const raindrop = new PIXI.Sprite(emergencyTexture) as RaindropSprite;
      raindrop.destroy();
      return raindrop;
    }

    let textureIndex: number;
    if (raindropTextures.length === NUM_SPRITES) {
      textureIndex = getWeightedRandomIndex(styleWeights);
    } else {
      textureIndex = Math.floor(Math.random() * raindropTextures.length);
    }
    textureIndex = Math.max(0, Math.min(textureIndex, raindropTextures.length - 1));

    const raindrop = new PIXI.Sprite(raindropTextures[textureIndex]) as RaindropSprite;
    resetRaindrop(raindrop, true);
    return raindrop;
  };

  const tickerFn = (delta: number) => {
    for (const raindrop of raindrops) {
      raindrop.y += raindrop.vy * delta;
      if (
        raindrop.y - raindrop.height / 2 > stageHeight ||
        raindrop.x < -raindrop.width ||
        raindrop.x > stageWidth + raindrop.width
      ) {
        resetRaindrop(raindrop, false);
      }
    }
  };

  const setupRaindropsAndAnimation = () => {
    console.log(`[${name}] Setting up raindrops and animation. Base texture path: ${baseTexturePath}`);
    raindropTextures.length = 0;
    while (raindrops.length > 0) raindrops.pop();
    particleContainer.removeChildren();

    const baseTexture = PIXI.BaseTexture.from(baseTexturePath);

    const finalizeSetup = () => {
      if (!baseTexture.valid) {
        console.error(`[${name}] Base texture ${baseTexturePath} is not valid even after load attempt.`);
        const gr = new PIXI.Graphics().beginFill(0xcccccc).drawRect(0, 0, 10, 10).endFill();
        const placeholderTexture = app.renderer.generateTexture(gr);
        raindropTextures.push(placeholderTexture);
        gr.destroy();
        console.warn(`[${name}] Using placeholder texture for raindrops due to baseTexture loading issues.`);
      } else {
        console.log(`[${name}] Base texture ${baseTexturePath} is valid. Slicing textures.`);
        for (let i = 0; i < NUM_SPRITES; i++) {
          const frame = new PIXI.Rectangle(i * SPRITE_WIDTH, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
          raindropTextures.push(new PIXI.Texture(baseTexture, frame));
        }
      }

      if (raindropTextures.length === 0) {
        console.error(`[${name}] Failed to create any raindrop textures. Cannot create sprites.`);
        return;
      }
      if (!raindropTextures[0]?.valid) {
        console.warn(`[${name}] First raindrop texture is invalid after creation. Sprites might not render correctly.`);
      }

      console.log(`[${name}] Creating ${maxNumber} raindrop sprites.`);
      for (let i = 0; i < maxNumber; i++) {
        const raindrop = createRaindropInstance();
        particleContainer.addChild(raindrop);
        raindrops.push(raindrop);
      }
      console.log(`[${name}] ${raindrops.length} raindrops created and added to container.`);

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

  setupRaindropsAndAnimation();

  return { container: particleContainer, tickerKey: `${name}-Ticker` };
};

registerPerform('rain', {
  fg: () => pixiRain('rain-foreground', 'foreground', 30, 50, 0.4, 1),
  bg: () => pixiRain('rain-background', 'background', 20, 150, 0.3, 1),
});
