import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";
import {runScript} from "@/Core/controller/gamePlay/runScript";
import {runtime_gamePlay} from "@/Core/runtime/gamePlay";
import {setVolume} from "@/Core/util/setVolume";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);

  return <div>
    <audio id="currentBgm" src={stageStore.bgm} loop={true} autoPlay={true}/>
    <audio id="currentVocal" src={stageStore.vocal}/>
  </div>;
};
