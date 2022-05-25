import {playBgm} from "@/Core/controller/stage/playBgm";
import {webgalStore} from "@/Core/store/store";
import {setVisibility} from "@/Core/store/GUIReducer";
import {stopAllPerform} from "@/Core/controller/gamePlay/stopAllPerform";
import {stopAuto} from "@/Core/controller/gamePlay/autoPlay";
import {stopFast} from "@/Core/controller/gamePlay/fastSkip";

export const backToTitle = () => {
  const GUIState = webgalStore.getState().GUI;
  const dispatch = webgalStore.dispatch;
  playBgm(GUIState.titleBgm);
  stopAllPerform();
  stopAuto();
  stopFast();
  // 重新打开标题界面
  dispatch(setVisibility({component: "showTitle", visibility: true}));
};
