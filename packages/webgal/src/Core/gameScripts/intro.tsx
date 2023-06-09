import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../../Components/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { PerformController } from '@/Core/Modules/perform/performController';
import { WebGAL } from '@/main';

/**
 * 显示一小段黑屏演示
 * @param sentence
 */
export const intro = (sentence: ISentence): IPerform => {
  /**
   * intro 内部控制
   */

  const performName = `introPerform${Math.random().toString()}`;

  let timeout = setTimeout(() => {});
  const toNextIntroElement = () => {
    const introContainer = document.getElementById('introContainer');
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes as any;
      const len = children.length;
      children.forEach((node: HTMLDivElement, index: number) => {
        const currentDelay = Number(node.style.animationDelay.split('ms')[0]);
        if (currentDelay > 0) {
          node.style.animationDelay = `${currentDelay - 1500}ms`;
        }
        if (index === len - 1) {
          if (currentDelay === 0) {
            clearTimeout(timeout);
            WebGAL.gameplay.performController.unmountPerform(performName);
            // 卸载函数发生在 nextSentence 生效前，所以不需要做下一行的操作。
            // setTimeout(nextSentence, 0);
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
              WebGAL.gameplay.performController.unmountPerform(performName);
              setTimeout(nextSentence, 0);
            }, currentDelay - 500);
          }
        }
      });
    }
  };

  /**
   * 接受 next 事件
   */
  WebGAL.eventBus.on('__NEXT', toNextIntroElement);

  const introArray: Array<string> = sentence.content.split(/\|/);
  const showIntro = introArray.map((e, i) => (
    <div
      key={'introtext' + i + Math.random().toString()}
      style={{ animationDelay: `${1500 * i}ms` }}
      className={styles.introElement}
    >
      {e}
    </div>
  ));
  const intro = <div>{showIntro}</div>;
  ReactDOM.render(intro, document.getElementById('introContainer'));
  const introContainer = document.getElementById('introContainer');

  if (introContainer) {
    introContainer.style.display = 'block';
  }
  return {
    performName,
    duration: 1000 + 1500 * introArray.length,
    isHoldOn: false,
    stopFunction: () => {
      const introContainer = document.getElementById('introContainer');
      if (introContainer) {
        introContainer.style.display = 'none';
      }
      WebGAL.eventBus.off('__NEXT', toNextIntroElement);
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: true,
  };
};
