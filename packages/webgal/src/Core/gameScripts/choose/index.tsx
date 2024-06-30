import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import React from 'react';
import styles from './choose.module.scss';
import { webgalStore } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { PerformController } from '@/Core/Modules/perform/performController';
import { useSEByWebgalStore } from '@/hooks/useSoundEffect';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Provider } from 'react-redux';

class ChooseOption {
  /**
   * 格式：
   * (showConditionVar>1)[enableConditionVar>2]->text:jump
   */
  public static parse(script: string): ChooseOption {
    const parts = script.split('->');
    const conditonPart = parts.length > 1 ? parts[0] : null;
    const mainPart = parts.length > 1 ? parts[1] : parts[0];
    const mainPartNodes = mainPart.split(':');

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
    this.text = text;
    this.jump = jump;
    this.jumpToScene = jump.match(/\./) !== null;
  }
}

/**
 * 显示选择枝
 * @param sentence
 */
export const choose = (sentence: ISentence): IPerform => {
  const chooseOptionScripts = sentence.content.split('|');
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e));

  // eslint-disable-next-line react/no-deprecated
  ReactDOM.render(
    <Provider store={webgalStore}>
      <Choose chooseOptions={chooseOptions} />
    </Provider>,
    document.getElementById('chooseContainer'),
  );
  return {
    performName: 'choose',
    duration: 1000 * 60 * 60 * 24,
    isHoldOn: false,
    stopFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<div />, document.getElementById('chooseContainer'));
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};

function Choose(props: { chooseOptions: ChooseOption[] }) {
  const fontFamily = webgalStore.getState().userData.optionData.textboxFont;
  const font = fontFamily === textFont.song ? '"思源宋体", serif' : '"WebgalUI", serif';
  const { playSeEnter, playSeClick } = useSEByWebgalStore();
  const applyStyle = useApplyStyle('Stage/Choose/choose.scss');
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
              if (e.jumpToScene) {
                changeScene(e.jump, e.text);
              } else {
                jmp(e.jump);
              }
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
