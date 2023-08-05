import mouseEnterSE from '@/assets/se/mouseEnter.mp3';
import maou_se_system35 from '@/assets/se/maou_se_system35.mp3';
import maou_se_system39 from '@/assets/se/maou_se_system39.mp3';
import maou_se_system40 from '@/assets/se/maou_se_system40.mp3';
import maou_se_system41 from '@/assets/se/maou_se_system41.mp3';
import maou_se_system48 from '@/assets/se/maou_se_system48.mp3';
import Motion_Pop03_1 from '@/assets/se/Motion-Pop03-1.mp3';
import Motion_Pop03_2 from '@/assets/se/Motion-Pop03-2.mp3';
import Motion_Pop03_3 from '@/assets/se/Motion-Pop03-3.mp3';
import Motion_Pop03_4 from '@/assets/se/Motion-Pop03-4.mp3';
import Motion_Pop08_1 from '@/assets/se/Motion-Pop08-1.mp3';
import Motion_Pop08_2 from '@/assets/se/Motion-Pop08-2.mp3';
import Motion_Pop08_3 from '@/assets/se/Motion-Pop08-3.mp3';
import Motion_Pop08_4 from '@/assets/se/Motion-Pop08-4.mp3';
import button_16 from '@/assets/se/button-16.wav';
import button_20 from '@/assets/se/button-20.wav';
import button_50 from '@/assets/se/button-50.wav';
import Book_Page_Flip from '@/assets/se/Book_Page_Flip.wav';
import page_flip_1 from '@/assets/se/page-flip-1.wav';
import { setStage } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';

// 调用音效
const useSoundEffect = () => {
  const setMouseEnterSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: mouseEnterSE }));
  };
  const setMouseEnterChooseSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop08_1 }));
  };
  const setMouseEnterMenuPanelButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop08_2 }));
  };
  const setMouseEnterTitleButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop08_3 }));
  };
  const setMouseEnterOptionsSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop08_4 }));
  };
  const setMouseEnterSavePageButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop03_1 }));
  };
  const setMouseEnterLoadPageButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop03_1 }));
  };
  const setMouseEnterExtraElementSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop03_2 }));
  };
  const setMouseEnterExtraControlSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop03_3 }));
  };
  const setMouseEnterSavingDialogSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Motion_Pop03_4 }));
  };
  const setClickSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system39 }));
  };
  const setClickTitleButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system40 }));
  };
  const setClickChooseButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system41 }));
  };
  const setClickCloseButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: button_16 }));
  };
  const setClickControlButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: button_20 }));
  };
  const setClickNormalButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: button_50 }));
  };
  const setClickOptionsButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: Book_Page_Flip }));
  };
  const setClickLoadPageButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: page_flip_1 }));
  };
  const setClickSavePageButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: page_flip_1 }));
  };
  const setClickSaveElementButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system48 }));
  };
  const setClickLoadElementButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system48 }));
  };
  const setClickSavingDialogButtonSE = () => {
    webgalStore.dispatch(setStage({ key: 'se', value: maou_se_system35 }));
  };

  return {
    setMouseEnterSE,
    setMouseEnterChooseSE,
    setMouseEnterMenuPanelButtonSE,
    setMouseEnterTitleButtonSE,
    setMouseEnterOptionsSE,
    setMouseEnterSavePageButtonSE,
    setMouseEnterLoadPageButtonSE,
    setMouseEnterExtraElementSE,
    setMouseEnterExtraControlSE,
    setMouseEnterSavingDialogSE,
    setClickSE,
    setClickTitleButtonSE,
    setClickChooseButtonSE,
    setClickCloseButtonSE,
    setClickControlButtonSE,
    setClickNormalButtonSE,
    setClickOptionsButtonSE,
    setClickLoadPageButtonSE,
    setClickSavePageButtonSE,
    setClickSaveElementButtonSE,
    setClickLoadElementButtonSE,
    setClickSavingDialogButtonSE,
  };
};

export default useSoundEffect;
