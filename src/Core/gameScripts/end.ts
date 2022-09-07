import { ISentence } from '@/interface/coreInterface/sceneInterface';
import { IPerform } from '@/interface/coreInterface/performInterface';
import { RUNTIME_SCENE_DATA } from '@/Core/runtime/sceneData';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { sceneFetcher } from '@/Core/controller/scene/sceneFetcher';
import { sceneParser } from '@/Core/parser/sceneParser';
import { resetStage } from '@/Core/controller/stage/resetStage';
import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';

/**
 * 结束游戏
 * @param sentence
 */
export const end = (sentence: ISentence): IPerform => {
  resetStage(true);
  const dispatch = webgalStore.dispatch;
  // 重新获取初始场景
  const sceneUrl: string = assetSetter('start.scene', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    RUNTIME_SCENE_DATA.currentScene = sceneParser(rawScene, 'start.scene', sceneUrl);
  });
  dispatch(setVisibility({ component: 'showTitle', visibility: true }));
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
