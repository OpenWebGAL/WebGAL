import { ALPHA_MODES, Sprite, Texture, VideoResource } from 'pixi.js';
import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { IStageObject } from './PixiController';
import { GifResource } from './GifResource';
import { createFigureTextureBlend } from './figureTextureBlend';
import { applyTransformToPixiContainer } from './stageEffectTransform';

function isStaticTexture(texture?: Texture): texture is Texture {
  return (
    !!texture?.valid &&
    !texture.trim &&
    !texture.rotate &&
    texture.baseTexture.alphaMode !== ALPHA_MODES.NPM &&
    !(texture.baseTexture.resource instanceof GifResource || texture.baseTexture.resource instanceof VideoResource)
  );
}

/** 不加载、不等待；仅使用 GPU 已就绪的等尺寸图片，否则由调用方正常换图。 */
export function prepareFigureDiff(object: IStageObject, url: string) {
  const stage = WebGAL.gameplay.pixiStage;
  const container = object.pixiContainer;
  if (!stage?.currentApp || !container || object.sourceType !== 'img' || object.isExiting || object.releaseInstance)
    return;
  if (WebGAL.gameplay.skipAnimation || stage.getAllLockedObject().includes(object.key) || object.textureRequest) return;
  const sprite = container.children[0];
  if (container.children.length !== 1 || !(sprite instanceof Sprite)) return;
  const oldRequest = { url: object.sourceUrl, kind: 'texture' as const };
  const newRequest = { url, kind: 'texture' as const };
  const oldTexture = stage.assets.getReady<Texture>(oldRequest);
  const newTexture = stage.assets.getReady<Texture>(newRequest);
  // Sprite 可能已被口型等差分改写，只有仍显示源图时才能确认这次混合的起点。
  if (!isStaticTexture(oldTexture) || !isStaticTexture(newTexture) || sprite.texture !== oldTexture) return;
  // 复用容器与 Sprite 的几何，要求逻辑尺寸和像素密度同时一致。
  if (
    oldTexture.width !== newTexture.width ||
    oldTexture.height !== newTexture.height ||
    oldTexture.baseTexture.resolution !== newTexture.baseTexture.resolution
  )
    return;
  const blend = createFigureTextureBlend(stage, oldTexture, newTexture);
  if (!blend) return;
  // 先用临时 owner 保住两张纹理，再将对象的长期持有从旧图移交给新图。
  // 混合结束后释放临时 owner，旧图便可按 AssetManager 的统一规则回收。
  const owner = `${object.uuid}-diff`;
  stage.assets.retain(owner, oldRequest);
  stage.assets.retain(owner, newRequest);
  stage.assets.release(object.uuid);
  stage.assets.retain(object.uuid, newRequest);
  object.sourceUrl = url;
  object.sourceExt = stage.getExtName(url);
  // 状态仍遵循 changeFigure 的重置规则；只省去旧对象退场和新对象入场。
  const state = stageStateManager.getCalculationStageState();
  applyTransformToPixiContainer(container, state.effects.find((effect) => effect.target === object.key)?.transform);
  // 与普通新建对象一样排到同层末尾，保持原来的遮挡顺序规则。
  stage.figureContainer.addChild(container);
  const animation = blend.attach(sprite, () => {
    stage.assets.release(owner);
    object.releaseInstance = undefined;
  });
  object.releaseInstance = () => {
    stage.removeAnimation(`${object.key}-softin`);
    animation.setEndState();
  };
  // 普通路径由 getExitAnimation 消费退出设置；混合不播放退出，也必须完成这项收尾。
  stageStateManager.removeAnimationSettingsByTargetOff(`${object.key}-off`);
  stage.requestRender();
  return animation;
}
