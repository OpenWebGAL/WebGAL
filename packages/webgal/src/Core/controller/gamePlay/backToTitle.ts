import { webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import { stopAuto } from '@/Core/controller/gamePlay/autoPlay';
import { stopFast } from '@/Core/controller/gamePlay/fastSkip';

export const backToTitle = () => {
  const dispatch = webgalStore.dispatch;
  stopAllPerform();
  stopAuto();
  stopFast();
  // 重新打开标题界面
  dispatch(setVisibility({ component: 'showTitle', visibility: true }));
};
