import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '@/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { PerformController } from '@/Core/Modules/perform/performController';
import { logger } from '@/Core/util/logger';
import { WebGAL } from '@/Core/WebGAL';
import { replace } from 'lodash';
import useEscape from '@/hooks/useEscape';
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
  const animationClass: any = (type: string, length = 0) => {
    switch (type) {
      case 'fadeIn':
        return styles.fadeIn;
      case 'slideIn':
        return styles.slideIn;
      case 'typingEffect':
        return `${styles.typingEffect} ${length}`;
      case 'pixelateEffect':
        return styles.pixelateEffect;
      case 'revealAnimation':
        return styles.revealAnimation;
      default:
        return styles.fadeIn;
    }
  };
  let chosenAnimationClass = styles.fadeIn;
  let delayTime = 1500;
  let isHold = false;

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
    if (e.key === 'animation') {
      chosenAnimationClass = animationClass(e.value);
    }
    if (e.key === 'delayTime') {
      const parsedValue = parseInt(e.value.toString(), 10);
      delayTime = isNaN(parsedValue) ? delayTime : parsedValue;
    }
    if (e.key === 'hold') {
      if (e.value === true) {
        isHold = true;
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
  const introArray: Array<string> = sentence.content.split(/(?<!\\)\|/).map((val: string) => useEscape(val));

  let endWait = 1000;
  let baseDuration = endWait + delayTime * introArray.length;
  const duration = isHold ? 1000 * 60 * 60 * 24 : 1000 + delayTime * introArray.length;
  let isBlocking = true;
  let setBlockingStateTimeout = setTimeout(() => {
    isBlocking = false;
  }, baseDuration);

  let timeout = setTimeout(() => {});
  const toNextIntroElement = () => {
    const introContainer = document.getElementById('introContainer');
    // 由于用户操作，相当于时间向前推进，这时候更新这个演出的预计完成时间
    baseDuration -= delayTime;
    clearTimeout(setBlockingStateTimeout);
    setBlockingStateTimeout = setTimeout(() => {
      isBlocking = false;
    }, baseDuration);
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes[0].childNodes as any;
      const len = children.length;
      children.forEach((node: HTMLDivElement, index: number) => {
        // 当前语句的延迟显示时间
        const currentDelay = Number(node.style.animationDelay.split('ms')[0]);
        // 当前语句还没有显示，降低显示延迟，因为现在时间因为用户操作，相当于向前推进了
        if (currentDelay > 0) {
          node.style.animationDelay = `${currentDelay - delayTime}ms`;
        }
        // 最后一个元素了
        if (index === len - 1) {
          // 并且已经完全显示了，这时候进行下一步
          if (currentDelay === 0) {
            clearTimeout(timeout);
            WebGAL.gameplay.performController.unmountPerform(performName);
            // 卸载函数发生在 nextSentence 生效前，所以不需要做下一行的操作。
            // setTimeout(nextSentence, 0);
          } else {
            // 还没有完全显示，但是因为时间的推进，要提前完成演出，更新用于结束演出的计时器
            clearTimeout(timeout);
            // 如果 Hold 了，自然不要自动结束
            if (!isHold) {
              timeout = setTimeout(() => {
                WebGAL.gameplay.performController.unmountPerform(performName);
                setTimeout(nextSentence, 0);
              }, baseDuration);
            }
          }
        }
      });
    }
  };

  /**
   * 接受 next 事件
   */
  WebGAL.events.userInteractNext.on(toNextIntroElement);

  const showIntro = introArray.map((e, i) => (
    <div
      key={'introtext' + i + Math.random().toString()}
      style={{ animationDelay: `${delayTime * i}ms` }}
      className={chosenAnimationClass}
    >
      {e}
      {e === '' ? '\u00a0' : ''}
    </div>
  ));
  const intro = (
    <div style={introContainerStyle}>
      <div style={{ padding: '3em 4em 3em 4em' }}>{showIntro}</div>
    </div>
  );
  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(intro, document.getElementById('introContainer'));
  const introContainer = document.getElementById('introContainer');

  if (introContainer) {
    introContainer.style.display = 'block';
  }

  return {
    performName,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      const introContainer = document.getElementById('introContainer');
      if (introContainer) {
        introContainer.style.display = 'none';
      }
      WebGAL.events.userInteractNext.off(toNextIntroElement);
    },
    blockingNext: () => isBlocking,
    blockingAuto: () => isBlocking,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: true,
  };
};
