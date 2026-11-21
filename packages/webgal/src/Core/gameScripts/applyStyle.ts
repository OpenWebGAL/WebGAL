import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { logger } from '@/Core/util/logger';
import { notifyApplyStyleIgnored } from '@/Core/util/syncWithEditor/runtime/uiEditorBridge';

/**
 * 更改 UI 样式（4.7+ 模块化界面架构中已废弃，仅保留忽略告警）
 */
export const applyStyle = (sentence: ISentence): IPerform => {
  const { content } = sentence;
  logger.warn(`applyStyle 在 4.7+ 界面模板架构下已废弃，已忽略: ${content}`);
  notifyApplyStyleIgnored(content);
  return createNonePerform();
};
