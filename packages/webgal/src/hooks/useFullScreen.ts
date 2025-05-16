import { useEffect, useState } from 'react';

const _isFullScreen = () => !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
export default function useFullScreen(target: Element = document.documentElement): {
  isSupported: boolean;
  isFullScreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
} {
  const isSupported = document.fullscreenEnabled || (document as any).webkitFullscreenEnabled;
  const [isFullScreen, setFullScreen] = useState<boolean>(_isFullScreen());

  useEffect(() => {
    if (!isSupported) return;
    const onFullscreenChange = () => setFullScreen(_isFullScreen());

    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const enter = isSupported ? () => target.requestFullscreen() : async () => {};
  const exit = isSupported ? () => document.exitFullscreen() : async () => {};

  return {
    isSupported,
    isFullScreen: isFullScreen,
    enter,
    exit,
    toggle: () => (isFullScreen ? exit() : enter()),
  };
}
