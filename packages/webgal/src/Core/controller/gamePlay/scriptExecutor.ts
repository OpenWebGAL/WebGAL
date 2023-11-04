import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { runScript } from './runScript';
import { logger } from '../../util/etc/logger';
import { IStageState } from '@/store/stageInterface';
import { restoreScene } from '../scene/restoreScene';
import { webgalStore } from '@/store/store';
import { getValueFromState } from '@/Core/gameScripts/setVar';
import { strIf } from '@/Core/gameScripts/function/strIf';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import cloneDeep from 'lodash/cloneDeep';
import { ISceneEntry } from '@/Core/Modules/scene';
import { IBacklogItem } from '@/Core/Modules/backlog';
import { SYSTEM_CONFIG } from '@/Core/config/config';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 语句执行器
 * 执行语句，同步场景状态，并根据情况立即执行下一句或者加入backlog
 */
export const scriptExecutor = () => {
  // 超过总语句数量，则从场景栈拿出一个需要继续的场景，然后继续流程。若场景栈清空，则停止流程
  if (
    WebGAL.sceneManager.sceneData.currentSentenceId >
    WebGAL.sceneManager.sceneData.currentScene.sentenceList.length - 1
  ) {
    if (WebGAL.sceneManager.sceneData.sceneStack.length !== 0) {
      const sceneToRestore: ISceneEntry | undefined = WebGAL.sceneManager.sceneData.sceneStack.pop();
      if (sceneToRestore !== undefined) {
        restoreScene(sceneToRestore);
      }
    }
    return;
  }
  const currentScript: ISentence =
    WebGAL.sceneManager.sceneData.currentScene.sentenceList[WebGAL.sceneManager.sceneData.currentSentenceId];

  const interpolationOneItem = (content: string): string => {
    let retContent = content;
    const contentExp = retContent.match(/(?<!\\)\{(.*?)\}/g);

    if (contentExp !== null) {
      contentExp.forEach((e) => {
        const contentVarValue = getValueFromState(e.replace(/(?<!\\)\{(.*)\}/, '$1'));
        retContent = retContent.replace(e, contentVarValue ? contentVarValue.toString() : e);
      });
    }
    retContent = retContent.replace(/\\{/g, '{').replace(/\\}/g, '}');
    return retContent;
  };

  /**
   * Variable interpolation
   */
  const variableInterpolation = () => {
    currentScript.content = interpolationOneItem(currentScript.content);

    currentScript.args.forEach((arg) => {
      if (arg.value && typeof arg.value === 'string') {
        arg.value = interpolationOneItem(arg.value);
      }
    });
  };

  variableInterpolation();

  // 判断这个脚本要不要执行
  let runThis: number | boolean = true;
  let isHasWhenArg = false;
  let whenValue = '';
  currentScript.args.forEach((e) => {
    if (e.key === 'when') {
      isHasWhenArg = true;
      whenValue = e.value.toString();
    }
  });
  // 如果语句有 when
  if (isHasWhenArg) {
    // 先把变量解析出来
    const valExpArr = whenValue.split(/([+\-*\/()><!]|>=|<=|==)/g);
    const valExp = valExpArr
      .map((e) => {
        if (e.match(/[a-zA-Z]/)) {
          if (e.match(/true/) || e.match(/false/)) {
            return e;
          }
          return getValueFromState(e).toString();
        } else return e;
      })
      .reduce((pre, curr) => pre + curr, '');
    runThis = strIf(valExp);
  }

  // 执行语句
  if (!runThis) {
    logger.warn('不满足条件，跳过本句！');
    WebGAL.sceneManager.sceneData.currentSentenceId++;
    nextSentence();
    return;
  }
  runScript(currentScript);
  let isNext = false; // 是否要进行下一句
  currentScript.args.forEach((e) => {
    // 判断是否有下一句的参数
    if (e.key === 'next' && e.value) {
      isNext = true;
    }
  });

  let isSaveBacklog = currentScript.command === commandType.say; // 是否在本句保存backlog（一般遇到对话保存）
  // 检查当前对话是否有 notend 参数
  currentScript.args.forEach((e) => {
    if (e.key === 'notend' && e.value === true) {
      isSaveBacklog = false;
    }
  });
  let currentStageState: IStageState;

  // 执行至指定 sentenceID
  // if (runToSentence >= 0 && runtime_currentSceneData.currentSentenceId < runToSentence) {
  //   runtime_currentSceneData.currentSentenceId++;
  //   scriptExecutor(runToSentence);
  //   return;
  // }

  // 执行“下一句”
  if (isNext) {
    WebGAL.sceneManager.sceneData.currentSentenceId++;
    scriptExecutor();
    return;
  }

  /**
   * 为了让 backlog 拿到连续执行了多条语句后正确的数据，放到下一个宏任务中执行（我也不知道为什么这样能正常，有能力的可以研究一下
   */
  setTimeout(() => {
    // 同步当前舞台数据
    currentStageState = webgalStore.getState().stage;
    logger.debug('本条语句执行结果', currentStageState);
    // 保存 backlog
    if (isSaveBacklog) {
      // WebGAL.backlogManager.isSaveBacklogNext = true;
      WebGAL.backlogManager.saveCurrentStateToBacklog();
    }
  }, 0);
  WebGAL.sceneManager.sceneData.currentSentenceId++;
};
