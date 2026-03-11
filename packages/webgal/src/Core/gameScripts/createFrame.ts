import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getNumberArgByKey, getStringArgByKey } from '../util/getSentenceArg';
import { IIFrame } from '@/store/stageInterface';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';

const allSandboxProperties = {
  'allow-forms': 'allowForms', // 允许iframe内提交表单
  'allow-scripts': 'allowScripts', // 允许iframe内执行JavaScript脚本（包括定时器、事件等）
  'allow-same-origin': 'allowSameOrigin', // 允许iframe内容拥有同源身份，可访问自身Cookie/LocalStorage等
  'allow-top-navigation': 'allowTopNavigation', // 允许iframe内的链接跳转到父页面（主页面）的上下文
  'allow-popups': 'allowPopups', // 允许iframe通过window.open()等方式弹出新窗口
  'allow-modals': 'allowModals', // 允许iframe弹出模态窗口（如alert()、confirm()、prompt()）
  'allow-pointer-lock': 'allowPointerLock', // 允许iframe使用Pointer Lock API（如游戏鼠标锁定）
  'allow-popups-to-escape-sandbox': 'allowPopupsToEscapeSandbox', // 允许iframe弹出的新窗口不受当前沙箱限制
  'allow-downloads': 'allowDownloads', // 允许iframe内触发文件下载操作
  'allow-presentation': 'allowPresentation', // 允许iframe使用Presentation API（投屏/演示功能）
  'allow-top-navigation-by-user-activation': 'allowTopNavigationByUserActivation', // 仅允许用户主动触发（如点击）的顶级导航操作
  'allow-storage-access-by-user-activation': 'allowStorageAccessByUserActivation', // 允许用户主动触发后访问父页面的存储权限
  'allow-orientation-lock': 'allowOrientationLock', // 允许iframe使用Screen Orientation API锁定屏幕方向
};

/**
 * 创建框架
 * @param sentence
 */
export const createFrame = (sentence: ISentence): IPerform => {
  const src = sentence.content;
  const id = getStringArgByKey(sentence, 'id') ?? '';
  const width = getNumberArgByKey(sentence, 'width') ?? undefined;
  const height = getNumberArgByKey(sentence, 'height') ?? undefined;
  if (!id || !src) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined,
    };
  }
  let rawSrc = src;
  // 处理src
  if (!rawSrc.startsWith('http') || !rawSrc.startsWith('https')) {
    rawSrc = './game/' + rawSrc;
  }
  const frameData: IIFrame = {
    id,
    src: rawSrc,
    sandbox: '',
    width,
    height,
    isActive: true,
    isDestroy: false,
  };

  for (const [key, value] of Object.entries(allSandboxProperties)) {
    const v = getStringArgByKey(sentence, value) ?? '';
    if (v) {
      frameData.sandbox += key + ' ';
    }
  }

  webgalStore.dispatch(stageActions.addFrame(frameData));

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };
};
