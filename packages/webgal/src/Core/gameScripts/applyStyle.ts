import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { logger } from '@/Core/util/logger';
import { isCustomUiTemplate } from '@/screens/screenRegistry';
import { WebGAL } from '@/Core/WebGAL';
import { notifyApplyStyleIgnored } from '@/Core/util/syncWithEditor/runtime/uiEditorBridge';

/**
 * 更改 UI 样式（旧模板兼容；新版自定义 UI 模板下静默失效并告警）
 * @param sentence
 */
export const applyStyle = (sentence: ISentence): IPerform => {
  const { content } = sentence;
  if (isCustomUiTemplate(WebGAL.template)) {
    logger.warn(`applyStyle 在新版自定义 UI 模板模式下已失效，已忽略: ${content}`);
    notifyApplyStyleIgnored(content);
    return createNonePerform();
  }
  const applyStyleSegments = content.split(',');
  for (const applyStyleSegment of applyStyleSegments) {
    const splitSegment = applyStyleSegment.split('->');
    if (splitSegment.length >= 2) {
      const classNameToBeChange = splitSegment[0];
      const classNameChangeTo = splitSegment[1];
      stageStateManager.replaceUIlable([classNameToBeChange, classNameChangeTo]);
    }
  }
  return createNonePerform();
};
