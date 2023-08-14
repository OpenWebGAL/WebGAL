import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '../controller/scene/changeScene';
import { WebGAL } from '@/main';
import ReactDOM from 'react-dom';
import useSoundEffect from '@/hooks/useSoundEffect';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import imgDefault from '@/assets/ui/subtraction-svgrepo-com.svg';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { updateCurrentEffects } from '../controller/stage/pixi/PixiController';

/**
 * 设置 UI
 * @param sentence 语句
 */
export const ui = (sentence: ISentence): IPerform => {
  const { playSeEnterChoose, playSeClickChoose, playSeCustomized } = useSoundEffect();
  const content = sentence.content;
  const normal = getSentenceArgByKey(sentence, 'normal'); // 获取普通状态下的图片
  const imgNormal = typeof normal === 'string' ? normal : imgDefault;
  const over = getSentenceArgByKey(sentence, 'over'); // 获取鼠标悬停时的图片
  const imgOver = typeof over === 'string' ? over : imgNormal;
  const id = getSentenceArgByKey(sentence, 'id'); // 获取 UI 的 ID
  const key = typeof id === 'string' ? id : ''; // ID 格式检查
  const nextFlag = getSentenceArgByKey(sentence, 'next'); // 获取是否继续解析
  const clickseArg = getSentenceArgByKey(sentence, 'clickse'); // 获取点击时的音效
  const enterseArg = getSentenceArgByKey(sentence, 'enterse'); // 获取鼠标进入时的音效
  const currentUIs = webgalStore.getState().stage.ui;
  const dispatch = webgalStore.dispatch;
  // 音效选择
  const clickse = () => {
    if (typeof clickseArg === 'string' && clickseArg !== '') {
      playSeCustomized(clickseArg);
    } else {
      playSeClickChoose();
    }
  };
  const enterse = () => {
    if (typeof enterseArg === 'string' && enterseArg !== '') {
      playSeCustomized(enterseArg);
    } else {
      playSeEnterChoose();
    }
  };

  const prevEffects = webgalStore.getState().stage.effects;
  const newEffects = cloneDeep(prevEffects);
  const uiIndex = newEffects.findIndex((e) => e.target === key);
  if (uiIndex >= 0) {
    newEffects.splice(uiIndex, 1);
  }
  updateCurrentEffects(newEffects);
  const index = currentUIs.findIndex((uiObject) => uiObject.key === key);
  const newUIs = cloneDeep(currentUIs);
  if (index >= 0) {
    newUIs[index].clickEvent = content;
    newUIs[index].normal = imgNormal;
    newUIs[index].over = imgOver;
  } else {
    // 新加
    if (content !== '') newUIs.push({ key: key, clickEvent: content, normal: imgNormal, over: imgOver });
  }
  if (getSentenceArgByKey(sentence, 'enter')) {
    WebGAL.animationManager.nextEnterAnimationName.set(key, getSentenceArgByKey(sentence, 'enter')!.toString());
  }
  dispatch(setStage({ key: 'ui', value: newUIs }));
  // 用于处理点击后的剧本跳转
  if (content !== '') {
    const uiElement = document.createElement('div');
    uiElement.id = key;
    uiElement.onclick = () => {
      clickse();
      webgalStore.dispatch(setStage({ key: 'isPause', value: false }));
      if (content) {
        changeScene(content, content);
      }
      WebGAL.gameplay.performController.unmountPerform('ui');
    };
    uiElement.onmouseenter = () => {
      enterse();
    };
    // 渲染uiElement到uiContainer
    const uiContainer = document.getElementById('uiContainer');
    uiContainer?.appendChild(uiElement);
  }
  // 处理是否继续解析
  const isPauseFlag = nextFlag || content === '' ? false : true;
  webgalStore.dispatch(setStage({ key: 'isPause', value: isPauseFlag }));
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
