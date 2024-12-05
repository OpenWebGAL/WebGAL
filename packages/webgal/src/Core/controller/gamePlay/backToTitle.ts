import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import { stopAuto } from '@/Core/controller/gamePlay/autoPlay';
import { stopFast } from '@/Core/controller/gamePlay/fastSkip';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

export const backToTitle = () => {
  if (webgalStore.getState().GUI.showTitle) return;
  const dispatch = webgalStore.dispatch;
  stopAllPerform();
  stopAuto();
  stopFast();
  // 清除语音
  dispatch(setStage({ key: 'playVocal', value: '' }));
  // 重新打开标题界面
  dispatch(setVisibility({ component: 'showTitle', visibility: true }));
  /**
   * 重设为标题背景
   */
  setEbg(webgalStore.getState().GUI.titleBg);
};
