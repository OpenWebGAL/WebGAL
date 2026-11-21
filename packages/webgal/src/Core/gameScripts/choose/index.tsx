import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '@/Core/controller/scene/changeScene';
import { jmp } from '@/Core/gameScripts/label/jmp';
import ReactDOM from 'react-dom';
import { webgalStore } from '@/store/store';
import { WebGAL } from '@/Core/WebGAL';
import { whenChecker } from '@/Core/controller/gamePlay/scriptExecutor';
import useEscape from '@/hooks/useEscape';
import { Provider } from 'react-redux';
import { useFontFamily } from '@/hooks/useFontFamily';
import { getNumberArgByKey } from '@/Core/util/getSentenceArg';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { useActiveUiScreen } from '@/sdk/mockData';

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
 */
export const choose = (sentence: ISentence): IPerform => {
  const chooseOptionScripts = sentence.content.split(/(?<!\\)\|/);
  const chooseOptions = chooseOptionScripts.map((e) => ChooseOption.parse(e.trim()));
  const defaultChoose = getNumberArgByKey(sentence, 'defaultChoose');
  const defaultPreviewChoice = getDefaultPreviewChoice(chooseOptions, defaultChoose);

  if (defaultPreviewChoice) {
    selectChooseOption(defaultPreviewChoice, false);
    if (!defaultPreviewChoice.jumpToScene) {
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
      const container = document.getElementById('chooseContainer');
      if (container) {
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.unmountComponentAtNode(container);
      }
    },
    blockingNext: () => true,
    blockingAuto: () => true,
    blockingStateCalculation: () => true,
  };
};

function getDefaultPreviewChoice(chooseOptions: ChooseOption[], defaultChoose: number | null): ChooseOption | null {
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
  const activeUiScreen = useActiveUiScreen();
  const uiCommon = useUiCommonProps();

  if (activeUiScreen !== null && activeUiScreen !== 'choose') {
    return null;
  }

  const visibleOptions = props.chooseOptions.filter((e) => whenChecker(e.showCondition));
  const options = visibleOptions.map((e, index) => ({
    id: `${e.jump}:${index}`,
    text: e.text,
    disabled: !whenChecker(e.enableCondition),
  }));
  const optionMap = new Map<string, ChooseOption>(visibleOptions.map((e, index) => [`${e.jump}:${index}`, e] as const));

  return (
    <ScreenSlotRenderer
      screen="choose"
      screenProps={{
        visible: true,
        options,
        fontFamily: font,
        onSelect: (id) => {
          const target = optionMap.get(id);
          if (!target || !whenChecker(target.enableCondition)) return;
          WebGAL.gameplay.performController.unmountPerform('choose');
          selectChooseOption(target);
        },
        ...uiCommon,
      }}
    />
  );
}
