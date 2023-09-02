import { setStage } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';
import mouseEnterSE from '@/assets/se/mouseEnter.mp3';
import maou_se_system35 from '@/assets/se/maou_se_system35.mp3';
import maou_se_system39 from '@/assets/se/maou_se_system39.mp3';
import maou_se_system40 from '@/assets/se/maou_se_system40.mp3';
import maou_se_system41 from '@/assets/se/maou_se_system41.mp3';
import maou_se_system48 from '@/assets/se/maou_se_system48.mp3';
import Motion_Pop03_4 from '@/assets/se/Motion-Pop03-4.mp3';
import button_16 from '@/assets/se/button-16.wav';
import button_20 from '@/assets/se/button-20.wav';
import button_50 from '@/assets/se/button-50.wav';
import click_soft_02 from '@/assets/se/click_soft_02.wav';
import Book_Page_Flip from '@/assets/se/Book_Page_Flip.wav';
import page_flip_1 from '@/assets/se/page-flip-1.wav';
import pause from '@/assets/se/pause.mp3';
import pausestart from '@/assets/se/pausestart.wav';
import s_cheremisinov_Click_03 from '@/assets/se/s-cheremisinov-Click-03.wav';
import switch_1 from '@/assets/se/switch-1.wav';
import water_drop_sound from '@/assets/se/water-drop-sound.wav';
import aigei_se_01 from '@/assets/se/aigei-se-01.mp3';
import aigei_se_02 from '@/assets/se/aigei-se-02.mp3';
import aigei_se_03 from '@/assets/se/aigei-se-03.mp3';
import zhanZhang_y1970 from '@/assets/se/zhanZhang-y1970.mp3';
import taoshen_01 from '@/assets/se/taoshen-01.wav';

// 调用音效
const useSoundEffect = () => {
  const playSeEnter = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: mouseEnterSE }));
  };
  const playSeEnterChoose = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: aigei_se_02 }));
  };
  const playSeEnterTitleButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: aigei_se_01 }));
  };
  const playSeEnterOptionSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: zhanZhang_y1970 }));
  };
  const playSeEnterMenuPanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: zhanZhang_y1970 }));
  };
  const playSeEnterSavePanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: zhanZhang_y1970 }));
  };
  const playSeEnterLoadPanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: zhanZhang_y1970 }));
  };
  const playSeEnterCGPanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: zhanZhang_y1970 }));
  };
  const playSeEnterExtraElement = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: mouseEnterSE }));
  };
  const playSeEnterExtraBGMButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: taoshen_01 }));
  };
  const playSeEnterCloseButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: aigei_se_03 }));
  };
  const playSeEnterDialogButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: Motion_Pop03_4 }));
  };
  const playSeEnterOptionSlider = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: water_drop_sound }));
  };
  const playSeClick = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system39 }));
  };
  const playSeClickChoose = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system41 }));
  };
  const playSeClickTitleButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system40 }));
  };
  const playSeClickCloseButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: button_16 }));
  };
  const playSeClickBottomControlPanelButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: button_20 }));
  };
  const playSeClickMenuNormalButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: button_50 }));
  };
  const playSeClickOptionSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };
  const playSeClickLoadPanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: page_flip_1 }));
  };
  const playSeClickSavePanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: page_flip_1 }));
  };
  const playSeClickSaveElement = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system48 }));
  };
  const playSeClickLoadElement = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system48 }));
  };
  const playSeClickDialogButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: maou_se_system35 }));
  };
  const playSeClickToNextBgmButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };
  const playSeClickToLastBgmButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };
  const playSeClickBeginBgmButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: pausestart }));
  };
  const playSeClickStopBgmButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: pause }));
  };
  const playSeClickCGPanelSelect = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: Book_Page_Flip }));
  };
  const playSeClickCGElement = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: s_cheremisinov_Click_03 }));
  };
  const playSeClickBacklogJumpButton = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: click_soft_02 }));
  };

  return {
    playSeEnter, // 鼠标进入
    playSeEnterChoose, // 鼠标进入分支选择
    playSeEnterTitleButton, // 鼠标进入标题按钮
    playSeEnterOptionSelect, // 鼠标进入游戏选项切换按钮
    playSeEnterMenuPanelSelect, // 鼠标进入菜单页切换按钮
    playSeEnterSavePanelSelect, // 鼠标进入存档页切换按钮
    playSeEnterLoadPanelSelect, // 鼠标进入读档页切换按钮
    playSeEnterCGPanelSelect, // 鼠标进入CG页切换按钮
    playSeEnterExtraElement, // 鼠标进入鉴赏元素
    playSeEnterExtraBGMButton, // 鼠标进入鉴赏页BGM按钮
    playSeEnterCloseButton, // 鼠标进入关闭按钮
    playSeEnterDialogButton, // 鼠标进入提示框按钮
    playSeEnterOptionSlider, // 鼠标进入滑块选项
    playSeClick, // 鼠标点击
    playSeClickChoose, // 鼠标点击分支选择
    playSeClickTitleButton, // 鼠标点击标题按钮
    playSeClickCloseButton, // 鼠标点击关闭按钮
    playSeClickBottomControlPanelButton, // 鼠标点击底部控制按钮
    playSeClickMenuNormalButton, // 鼠标点击菜单页普通按钮
    playSeClickOptionSelect, // 鼠标点击游戏选项切换按钮
    playSeClickLoadPanelSelect, // 鼠标点击读档页切换按钮
    playSeClickSavePanelSelect, // 鼠标点击存档页切换按钮
    playSeClickSaveElement, // 鼠标点击存档元素
    playSeClickLoadElement, // 鼠标点击读档元素
    playSeClickDialogButton, // 鼠标点击提示框按钮
    playSeClickToNextBgmButton, // 鼠标点击下一首BGM按钮
    playSeClickToLastBgmButton, // 鼠标点击上一首BGM按钮
    playSeClickBeginBgmButton, // 鼠标点击开始播放BGM按钮
    playSeClickStopBgmButton, // 鼠标点击停止播放BGM按钮
    playSeClickCGPanelSelect, // 鼠标点击CG页切换按钮
    playSeClickCGElement, // 鼠标点击CG元素
    playSeClickBacklogJumpButton, // 鼠标点击日志页回溯按钮
  };
};

export default useSoundEffect;
