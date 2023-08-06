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
  let fontSize: string | undefined;
  let backgroundColor: any = 'rgba(0, 0, 0, 1)';
  let color: any = 'rgba(255, 255, 255, 1)';

  for (const e of sentence.args) {
    if (e.key === 'backgroundColor') {
      backgroundColor = e.value || 'rgba(0, 0, 0, 1)';
    }
    if (e.key === 'fontColor') {
      color = e.value || 'rgba(255, 255, 255, 1)';
    }
    if (e.key === 'fontSize') {
      switch (e.value) {
        case 'small':
          fontSize = '280%';
          break;
        case 'medium':
          fontSize = '350%';
          break;
        case 'large':
          fontSize = '420%';
          break;
      }
    }
  }

  const introContainerStyle = {
    background: backgroundColor,
    color: color,
    fontSize: fontSize || '350%',
    width: '100%',
    height: '100%',
  };

  let timeout = setTimeout(() => {});
  const toNextIntroElement = () => {
    const introContainer = document.getElementById('introContainer');
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes[0].childNodes as any;
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
  const intro = (
    <div style={introContainerStyle}>
      <div style={{ padding: '3em 4em 3em 4em' }}>{showIntro}</div>
    </div>
  );
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
