import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React, { useEffect, useState } from 'react';
import styles from './choose.module.scss';
import { RootState, webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { PerformController } from '@/Core/Modules/perform/performController';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import useEscape from '@/hooks/useEscape';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Provider, useSelector } from 'react-redux';

class ChooseOption {
  /**
   * 格式：
   * (showConditionVar>1)[enableConditionVar>2]->text:jump
   */
  public static parse(script: string): ChooseOption {
    const parts = script.split('->');
    const conditonPart = parts.length > 1 ? parts[0] : null;
    const mainPart = parts.length > 1 ? parts[1] : parts[0];
    const mainPartNodes = mainPart.split(/(?<!\\):/g);
    const option = new ChooseOption(mainPartNodes[0], mainPartNodes[1]);
    if (conditonPart !== null) {
      const showConditionPart = conditonPart.match(/\((.*)\)/);
      if (showConditionPart) {
        option.showCondition = showConditionPart[1];
      }
      const enableConditionPart = conditonPart.match(/\[(.*)\]/);
      if (enableConditionPart) {
        option.enableCondition = enableConditionPart[1];
      }
    }
    return option;
  }
  public text: string;
  public jump: string;
  public jumpToScene: boolean;
  public showCondition?: string;
  public enableCondition?: string;

  public constructor(text: string, jump: string) {
    this.text = useEscape(text);
    this.jump = jump;
    this.jumpToScene = jump.match(/(?<!\\)\./) !== null;
  }
}

// eslint-disable-next-line no-undef
let hideChooseTimeout: NodeJS.Timeout | null = null;

/**
 * 显示选择枝
 * @param sentence
 */
export const choose = (sentence: ISentence): IPerform => {
  const chooseOptionScripts = sentence.content.split(/(?<!\\)\|/);
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e.trim()));

  // 清除上一句的隐藏 choose timeout
  if (hideChooseTimeout) {
    clearTimeout(hideChooseTimeout);
    hideChooseTimeout = null;
  }

  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <Provider store={webgalStore}>
      <Choose chooseOptions={chooseOptions} />
    </Provider>,
    document.getElementById('chooseContainer'),
  );

  window.dispatchEvent(new CustomEvent<boolean>('show-choose', { detail: true }));

  return {
    performName: 'choose',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      // 延迟退场
      window.dispatchEvent(new CustomEvent<boolean>('show-choose', { detail: false }));
      const uiTransitionDuration = webgalStore.getState().userData.optionData.uiTransitionDuration;
      hideChooseTimeout = setTimeout(() => {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(<div />, document.getElementById('chooseContainer'));
      }, uiTransitionDuration);
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

function Choose(props: { chooseOptions: ChooseOption[] }) {
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const applyStyle = useApplyStyle('Stage/Choose/choose.scss');
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setShow(customEvent.detail);
    };
    window.addEventListener('show-choose', handler);
    return () => window.removeEventListener('show-choose', handler);
  }, []);

  // 运行时计算JSX.Element[]
  const runtimeBuildList = (chooseListFull: ChooseOption[]) => {
    return chooseListFull
      .filter((e, i) => whenChecker(e.showCondition))
      .map((e, i) => {
        const enable = whenChecker(e.enableCondition);
        const className =
          applyStyle('choose_button', styles.choose_button) +
          ' ' +
          (enable ? '' : applyStyle('choose_button_disabled', styles.choose_button_disabled));
        const onClick = enable
          ? () => {
              playSeClick();
              if (e.jumpToScene) {
                changeScene(e.jump, e.text);
              } else {
                jmp(e.jump);
              }
              WebGAL.gameplay.performController.unmountPerform('choose');
            }
          : () => {};
        return (
          <div className={className} onClick={onClick} onMouseEnter={playSeEnter} key={e.jump + i}>
            {e.text}
          </div>
        );
      });
  };

  return (
    <div
      className={`${applyStyle('choose_main', styles.choose_main)} ${
        show ? '' : applyStyle('choose_main_hide', styles.choose_main_hide)
      }`}
      style={{ ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms` }}
      onWheel={(e) => {
        // 防止触发 useWheel
        e.stopPropagation();
      }}
    >
      <div className={`${applyStyle('choose_button_list', styles.choose_button_list)}`}>
        {runtimeBuildList(props.chooseOptions)}
      </div>
    </div>
  );
}
