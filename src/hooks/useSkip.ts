import {useCallback, useEffect, useRef} from "react";
import {isFast, startFast, stopFast} from "@/Core/controller/gamePlay/fastSkip";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";

export function useSkip() {
  // 因为document事件只绑定一次 为了防止之后更新GUIStore时取不到最新值
  // 使用Ref共享GUIStore
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const GUIStoreRef = useRef(GUIStore);
  // 判断是否位于标题 & 存读档，选项 & 回想等页面
  const isGameActive = useCallback(() => {
    return (!GUIStoreRef.current.showTitle)
      && (!GUIStoreRef.current.showMenuPanel)
      && (!GUIStoreRef.current.showBacklog);
  }, []);
  // 判断按键是否为ctrl
  const isCtrlKey = useCallback((e) => {
    return e.keyCode === 17;
  }, []);
  // 同步GUIStore和GUIStoreRef
  useEffect(() => {
    GUIStoreRef.current = GUIStore;
  }, [GUIStore]);
  const handleCtrlKeydown = useCallback((e) => {
    // 判断是否处于快进模式
    if (isFast()) {
      return;
    }
    if (isCtrlKey(e) && isGameActive()) {
      startFast();
    }
  }, []);
  const handleCtrlKeyup = useCallback((e) => {
    if (isCtrlKey(e) && isGameActive()) {
      stopFast();
    }
  }, []);
  const handleWindowBlur = useCallback((e) => {
    console.log('失去焦点');
    if (isFast()) {
      stopFast();
    }
  }, []);
  // mounted时绑定事件
  useEffect(() => {
    // 监听ctrl & window失去焦点
    document.addEventListener('keydown', handleCtrlKeydown);
    document.addEventListener('keyup', handleCtrlKeyup);
    window.addEventListener('blur', handleWindowBlur);
    // unmounted时解绑事件
    return function () {
      document.removeEventListener('keydown', handleCtrlKeydown);
      document.removeEventListener('keyup', handleCtrlKeyup);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);
  // updated时验证状态
  useEffect(() => {
    if (!isGameActive()) {
      stopFast();
    }
  });
}
