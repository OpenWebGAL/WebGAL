import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);

  return <div>
    <audio id="currentBgm" src={stageStore.bgm} loop={true} autoPlay={true}/>
    <audio id="currentVocal" src={stageStore.vocal}/>
  </div>;
};
