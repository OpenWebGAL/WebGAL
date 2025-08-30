import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './intro.module.scss';
import { WebGAL } from '@/Core/WebGAL';
import useEscape from '@/hooks/useEscape';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Provider } from 'react-redux';
import { webgalStore } from '@/store/store';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { useFontFamily } from '@/hooks/useFontFamily';
import { textFont } from '@/store/userDataInterface';

// eslint-disable-next-line no-undef
let hideIntroTimeout: NodeJS.Timeout | null = null;

/**
 * 显示一小段黑屏演示
 * @param sentence
 */
export const intro = (sentence: ISentence): IPerform => {
  /**
   * intro 内部控制
   */

  // 清除上一句的隐藏 intro timeout
  if (hideIntroTimeout) {
    clearTimeout(hideIntroTimeout);
    hideIntroTimeout = null;
  }

  const performName = `introPerform${Math.random().toString()}`;

  const font = webgalStore.getState().userData.optionData.textboxFont;
  let fontToUse = '';
  switch (font) {
    case textFont.song:
      fontToUse = '"思源宋体", serif';
      break;
    case textFont.lxgw:
      fontToUse = '"LXGW", serif';
      break;
    case textFont.hei:
    default:
      fontToUse = '"WebgalUI", serif';
      break;
  }

  const fontSizeFromArgs = getStringArgByKey(sentence, 'fontSize') ?? 'medium';
  const backgroundImageFromArgs = getStringArgByKey(sentence, 'backgroundImage') ?? '';
  const backgroundImage = `url("game/background/${backgroundImageFromArgs}") center/cover no-repeat`;
  const backgroundColor = getStringArgByKey(sentence, 'backgroundColor') ?? 'rgba(0, 0, 0, 1)';
  const color = getStringArgByKey(sentence, 'fontColor') ?? 'rgba(255, 255, 255, 1)';
  const animationFromArgs = getStringArgByKey(sentence, 'animation') ?? '';
  let delayTime = getNumberArgByKey(sentence, 'delayTime') ?? 1500;
  let isHold = getBooleanArgByKey(sentence, 'hold') ?? false;
  let isUserForward = getBooleanArgByKey(sentence, 'userForward') ?? false;
  // 设置一个很大的延迟，这样自然就看起来不自动继续了
  delayTime = isUserForward ? 99999999 : delayTime;
  // 用户手动控制向前步进，所以必须是 hold
  isHold = isUserForward ? true : isHold;

  const introContainerStyle: React.CSSProperties = {
    fontFamily: fontToUse,
    color: color,
    background: backgroundImage,
    backgroundColor: backgroundColor,
    ['--ui-transition-duration' as any]: `${webgalStore.getState().userData.optionData.uiTransitionDuration}ms`,
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
          clearTimeout(timeout);
          clearTimeout(setBlockingStateTimeout);
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

  function Intro() {
    const [show, setShow] = useState(true);
    useEffect(() => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent<boolean>;
        setShow(customEvent.detail);
      };
      window.addEventListener('show-intro', handler);
      return () => window.removeEventListener('show-intro', handler);
    }, []);
    const applyStyle = useApplyStyle('Stage/Intro/intro.scss');

    const fontSizeClass = (size: string) => {
      switch (size) {
        case 'small':
          return applyStyle('intro_text_small', styles.intro_text_small);
        case 'medium':
          return applyStyle('intro_text_medium', styles.intro_text_medium);
        case 'large':
          return applyStyle('intro_text_large', styles.intro_text_large);
        default:
          return applyStyle('intro_text_medium', styles.intro_text_medium);
      }
    };

    const animationClass = (type: string, length = 0) => {
      switch (type) {
        case 'fadeIn':
          return applyStyle('intro_fade_in', styles.intro_fade_in);
        case 'slideIn':
          return applyStyle('intro_slide_in', styles.intro_slide_in);
        case 'typingEffect':
          return applyStyle('intro_typing_effect', styles.intro_typing_effect);
        case 'pixelateEffect':
          return applyStyle('intro_pixelate_effect', styles.intro_pixelate_effect);
        case 'revealAnimation':
          return applyStyle('intro_reveal_animation', styles.intro_reveal_animation);
        default:
          return applyStyle('intro_fade_in', styles.intro_fade_in);
      }
    };

    const showIntro = introArray.map((e, i) => (
      <div
        key={'introtext' + i + Math.random().toString()}
        style={{ animationDelay: `${delayTime * i}ms` }}
        className={
          applyStyle('intro_text', styles.intro_text) +
          ' ' +
          fontSizeClass(fontSizeFromArgs) +
          ' ' +
          animationClass(animationFromArgs)
        }
      >
        {e}
        {e === '' ? '\u00a0' : ''}
      </div>
    ));

    return (
      <div
        style={introContainerStyle}
        className={`${applyStyle('intro_main', styles.intro_main)} ${
          show ? '' : applyStyle('intro_main_hide', styles.intro_main_hide)
        }`}
      >
        <div className={applyStyle('intro_text_container', styles.intro_text_container)}>{showIntro}</div>
      </div>
    );
  }

  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <Provider store={webgalStore}>
      <Intro />
    </Provider>,
    document.getElementById('introContainer'),
  );

  window.dispatchEvent(new CustomEvent<boolean>('show-intro', { detail: true }));

  return {
    performName,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      window.dispatchEvent(new CustomEvent<boolean>('show-intro', { detail: false }));
      const uiTransitionDuration = webgalStore.getState().userData.optionData.uiTransitionDuration;
      hideIntroTimeout = setTimeout(() => {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(<div />, document.getElementById('introContainer'));
      }, uiTransitionDuration);
      WebGAL.events.userInteractNext.off(toNextIntroElement);
    },
    blockingNext: () => isBlocking,
    blockingAuto: () => isBlocking,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: true,
  };
};
