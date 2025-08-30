import { RootState } from '@/store/store';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// 延迟退场状态管理 Hook
export function useDelayedVisibility(visible: boolean): boolean {
  const uiTransitionDuration = useSelector((state: RootState) => state.userData.optionData.uiTransitionDuration);
  const [delayedVisible, setDelayedVisible] = useState(visible);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (visible) {
      setDelayedVisible(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setDelayedVisible(false);
      }, uiTransitionDuration);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, uiTransitionDuration]);

  return delayedVisible;
}
