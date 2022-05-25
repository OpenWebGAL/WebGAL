import {webgalStore} from "@/Core/store/store";
import {setStage} from "@/Core/store/stageReducer";

// /**
//  * 停止bgm
//  */
// export const eraseBgm = () => {
//   logger.debug(`停止bgm`);
//   // 停止之前的bgm
//   let VocalControl: any = document.getElementById('currentBgm');
//   if (VocalControl !== null) {
//     VocalControl.currentTime = 0;
//     if (!VocalControl.paused) VocalControl.pause();
//   }
//   // 获得舞台状态并设置
//   webgalStore.dispatch(setStage({key: 'bgm', value: ''}));
// };

/**
 * 播放bgm
 * @param url bgm路径
 */
export function playBgm(url: string): void {
  webgalStore.dispatch(setStage({key: 'bgm', value: url}));
}
