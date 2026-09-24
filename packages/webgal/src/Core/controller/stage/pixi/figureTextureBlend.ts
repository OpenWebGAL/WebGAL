import { BLEND_MODES, Container, Renderer, RenderTexture, Sprite, Texture } from 'pixi.js';
import { DEFAULT_FIG_IN_DURATION } from '@/Core/constants';
import { logger } from '@/Core/util/logger';
import PixiStage from './PixiController';

/** 在透明离屏纹理里相加预乘 RGBA，再由原 Sprite 合成到舞台一次。 */
export function createFigureTextureBlend(stage: PixiStage, oldTexture: Texture, newTexture: Texture) {
  const renderer = stage.currentApp!.renderer;
  if (!(renderer instanceof Renderer) || renderer.context.isLost) return;
  const inputs = new Container();
  const oldImage = inputs.addChild(new Sprite(oldTexture));
  const newImage = inputs.addChild(new Sprite(newTexture));
  // ADD 只用于透明离屏目标，使 RGBA 按互补权重相加；不能直接叠加到舞台背景。
  oldImage.blendMode = newImage.blendMode = BLEND_MODES.ADD;
  let texture: RenderTexture;
  let disposed = false;
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    inputs.destroy({ children: true });
    texture?.destroy(true);
  };
  const draw = (progress: number) => {
    oldImage.alpha = 1 - progress;
    newImage.alpha = progress;
    renderer.render(inputs, { renderTexture: texture, clear: true });
  };
  try {
    // 在改动舞台前完成分配与首次绘制，失败时仍可使用原有入退场。
    texture = RenderTexture.create({
      width: newTexture.width,
      height: newTexture.height,
      resolution: newTexture.baseTexture.resolution,
      scaleMode: newTexture.baseTexture.scaleMode,
    });
    draw(0);
  } catch (error) {
    dispose();
    logger.warn('立绘离屏混合不可用，保留默认过渡', error);
    return;
  }
  return {
    attach(sprite: Sprite, release: () => void) {
      let elapsed = 0;
      const finish = () => {
        // 动画结束和对象销毁共用收尾，确保临时纹理与资源持有只释放一次。
        if (disposed) return;
        if (!sprite.destroyed) sprite.texture = newTexture;
        dispose();
        release();
        stage.requestRender();
      };
      sprite.texture = texture;
      return {
        setStartState: () => {},
        setEndState: finish,
        forceStopWithoutSetEndState: finish,
        tickerFunc: () => {
          if (disposed) return;
          elapsed += stage.currentApp!.ticker.deltaMS;
          const t = Math.min(elapsed / DEFAULT_FIG_IN_DURATION, 1);
          // 与默认入场相同的 quadratic easeInOut，两张图始终使用互补权重。
          const progress = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
          try {
            if (t === 1 || renderer.context.isLost) finish();
            else draw(progress);
          } catch (error) {
            logger.warn('立绘混合中断，显示目标图片', error);
            finish();
          }
        },
      };
    },
  };
}
