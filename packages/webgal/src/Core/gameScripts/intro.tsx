import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '@/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { WebGAL } from '@/Core/WebGAL';
import useEscape from '@/hooks/useEscape';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '../util/getSentenceArg';
/**
 * 显示一小段黑屏演示
 * @param sentence
 */
export const intro = (sentence: ISentence): IPerform => {
  /**
   * intro 内部控制
   */

  const performName = `introPerform${Math.random().toString()}`;

  const fontSizeFromArgs = getStringArgByKey(sentence, 'fontSize') ?? 'medium';
  let fontSize = '350%';
  switch (fontSizeFromArgs) {
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
  const backgroundImageFromArgs = getStringArgByKey(sentence, 'backgroundImage') ?? '';
  const backgroundImage = `url("game/background/${backgroundImageFromArgs}") center/cover no-repeat`;
  const backgroundColor = getStringArgByKey(sentence, 'backgroundColor') ?? 'rgba(0, 0, 0, 1)';
  const color = getStringArgByKey(sentence, 'fontColor') ?? 'rgba(255, 255, 255, 1)';
  const animationFromArgs = getStringArgByKey(sentence, 'animation') ?? '';
  let animationClass: any = (type: string, length = 0) => {
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
  let chosenAnimationClass = animationClass(animationFromArgs);
  let delayTime = getNumberArgByKey(sentence, 'delayTime') ?? 1500;
  let isHold = getBooleanArgByKey(sentence, 'hold') ?? false;
  let isUserForward = getBooleanArgByKey(sentence, 'userForward') ?? false;
  // 设置一个很大的延迟，这样自然就看起来不自动继续了
  delayTime = isUserForward ? 99999999 : delayTime;
  // 用户手动控制向前步进，所以必须是 hold
  isHold = isUserForward ? true : isHold;

  const introContainerStyle = {
    background: backgroundImage,
    backgroundColor: backgroundColor,
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

  let setBlockingStateTimeout: ReturnType<typeof setTimeout> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const toNextIntroElement = () => {
    const introContainer = document.getElementById('introContainer');
    // 由于用户操作，相当于时间向前推进，这时候更新这个演出的预计完成时间
    baseDuration -= delayTime;
    if (setBlockingStateTimeout) clearTimeout(setBlockingStateTimeout);
    setBlockingStateTimeout = setTimeout(() => {
      isBlocking = false;
    }, baseDuration);
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes[0].childNodes as any;
      const len = children.length;
      if (isUserForward) {
        let isEnd = true;
        for (const node of children) {
          // 当前语句的延迟显示时间
          const currentDelay = Number(node.style.animationDelay.split('ms')[0]);
          // 当前语句还没有显示，降低显示延迟，因为现在时间因为用户操作，相当于向前推进了
          if (currentDelay > 0) {
            isEnd = false;
            // 用 Animation API 操作，浏览器版本太低就无办法了
            const nodeAnimations = node.getAnimations();
            node.style.animationDelay = '0ms ';
            for (const ani of nodeAnimations) {
              ani.currentTime = 0;
              ani.play();
            }
          }
        }
        if (isEnd) {
          if (timeout) clearTimeout(timeout);
          if (setBlockingStateTimeout) clearTimeout(setBlockingStateTimeout);
          WebGAL.gameplay.performController.unmountPerform(performName);
        }
        return;
      }
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
            if (timeout) clearTimeout(timeout);
            WebGAL.gameplay.performController.unmountPerform(performName);
            // 卸载函数发生在 nextSentence 生效前，所以不需要做下一行的操作。
            // setTimeout(nextSentence, 0);
          } else {
            // 还没有完全显示，但是因为时间的推进，要提前完成演出，更新用于结束演出的计时器
            if (timeout) clearTimeout(timeout);
            // 如果 Hold 了，自然不要自动结束
            if (!isHold) {
              timeout = setTimeout(() => {
                WebGAL.gameplay.performController.unmountPerform(performName);
              }, baseDuration);
            }
          }
        }
      });
    }
  };

  /**
   * 构造 intro 视图。真正挂载必须等 commit 后的 startFunction。
   */
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

  return {
    performName,
    duration,
    isHoldOn: false,
    startFunction: () => {
      isBlocking = true;
      setBlockingStateTimeout = setTimeout(() => {
        isBlocking = false;
      }, baseDuration);
      WebGAL.events.userInteractNext.on(toNextIntroElement);
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(intro, document.getElementById('introContainer'));
      const introContainer = document.getElementById('introContainer');

      if (introContainer) {
        introContainer.style.display = 'block';
      }
    },
    stopFunction: () => {
      const introContainer = document.getElementById('introContainer');
      if (introContainer) {
        introContainer.style.display = 'none';
      }
      if (timeout) clearTimeout(timeout);
      if (setBlockingStateTimeout) clearTimeout(setBlockingStateTimeout);
      WebGAL.events.userInteractNext.off(toNextIntroElement);
    },
    blockingNext: () => isBlocking,
    blockingAuto: () => isBlocking,
    blockingStateCalculation: () => false,
    goNextWhenOver: true,
  };
};
