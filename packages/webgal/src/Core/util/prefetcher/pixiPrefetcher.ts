import { commandType, IScene } from '@/Core/controller/scene/sceneInterface';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { ResourceRequest, stageResource } from '@/Core/controller/stage/pixi/assets/resourceTypes';

const FIGURE_TEXTURE_ARGS = ['mouthOpen', 'mouthClose', 'mouthHalfOpen', 'eyesOpen', 'eyesClose'];

/** 只预测路径已确定的舞台资源，不提前执行变量赋值、条件或跳转。 */
export function getPixiPrefetchRequests(scene: IScene, start: number, lookahead: number): ResourceRequest[] {
  const requests: ResourceRequest[] = [];
  for (const sentence of scene.sentenceList.slice(start, start + lookahead + 1)) {
    // 换立绘和换差分都可以带口型眨眼图。
    const figure = sentence.command === commandType.changeFigure || sentence.command === commandType.changeFigureDiff;
    if (!figure && sentence.command !== commandType.changeBg) continue;
    const content = sentence.content;
    if (content && content !== 'none' && !content.includes('{')) {
      // content 已由 parser 做过路径转换，不能再次追加 game/figure 前缀。
      requests.push(stageResource(content));
    }
    if (!figure) continue;
    for (const arg of sentence.args) {
      if (
        FIGURE_TEXTURE_ARGS.includes(arg.key) &&
        typeof arg.value === 'string' &&
        arg.value &&
        !arg.value.includes('{')
      ) {
        requests.push({ url: assetSetter(arg.value, fileType.figure), kind: 'texture' });
      }
    }
  }
  return requests;
}
