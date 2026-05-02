import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React from 'react';
import styles from './choose.module.scss';
import { webgalStore } from '@/store/store';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import useEscape from '@/hooks/useEscape';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Provider } from 'react-redux';
import { useFontFamily } from '@/hooks/useFontFamily';
import { getNumberArgByKey } from '@/Core/util/getSentenceArg';

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

/**
 * 显示选择枝
 * @param sentence
 */
export const choose = (sentence: ISentence): IPerform => {
  const chooseOptionScripts = sentence.content.split(/(?<!\\)\|/);
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e.trim()));
  const defaultChoose = getNumberArgByKey(sentence, 'defaultChoose');
  const defaultPreviewChoice = getDefaultPreviewChoice(chooseOptions, defaultChoose);

  if (defaultPreviewChoice) {
    selectChooseOption(defaultPreviewChoice, false);
    if (!defaultPreviewChoice.jumpToScene) {
      // The default preview choice is resolved during script calculation.
      // Let scriptExecutor continue from the target label in this same forward.
      sentence.args.push({ key: 'next', value: true });
    }
    return createNonePerform({ blockingAuto: false });
  }

  return {
    performName: 'choose',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    startFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(
        <Provider store={webgalStore}>
          <Choose chooseOptions={chooseOptions} />
        </Provider>,
        document.getElementById('chooseContainer'),
      );
    },
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    blockingStateCalculation: () => true,
  };
};

function getDefaultPreviewChoice(chooseOptions: ChooseOption[], defaultChoose: number | null): ChooseOption | null {
  // Only realtime preview may consume defaultChoose automatically; ordinary fast-forward must still wait.
  if (!WebGAL.gameplay.isFastPreview || defaultChoose === null) {
    return null;
  }
  const chooseIndex = Math.floor(defaultChoose) - 1;
  if (chooseIndex < 0) {
    return null;
  }
  const defaultOption = chooseOptions[chooseIndex];
  if (!defaultOption || !whenChecker(defaultOption.showCondition) || !whenChecker(defaultOption.enableCondition)) {
    return null;
  }
  return defaultOption;
}

function selectChooseOption(option: ChooseOption, autoNext = true) {
  if (option.jumpToScene) {
    changeScene(option.jump, option.text);
  } else {
    jmp(option.jump, autoNext);
  }
}

function Choose(props: { chooseOptions: ChooseOption[] }) {
  const font = useFontFamily();
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const applyStyle = useApplyStyle('choose');
  // 运行时计算JSX.Element[]
  const runtimeBuildList = (chooseListFull: ChooseOption[]) => {
    return chooseListFull
      .filter((e, i) => whenChecker(e.showCondition))
      .map((e, i) => {
        const enable = whenChecker(e.enableCondition);
        const className = enable
          ? applyStyle('Choose_item', styles.Choose_item)
          : applyStyle('Choose_item_disabled', styles.Choose_item_disabled);
        const onClick = enable
          ? () => {
              playSeClick();
              selectChooseOption(e);
              WebGAL.gameplay.performController.unmountPerform('choose');
            }
          : () => {};
        return (
          <div className={applyStyle('Choose_item_outer', styles.Choose_item_outer)} key={e.jump + i}>
            <div className={className} style={{ fontFamily: font }} onClick={onClick} onMouseEnter={playSeEnter}>
              {e.text}
            </div>
          </div>
        );
      });
  };

  return <div className={applyStyle('Choose_Main', styles.Choose_Main)}>{runtimeBuildList(props.chooseOptions)}</div>;
}
