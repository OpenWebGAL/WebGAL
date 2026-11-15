import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import type { ScreenCommonProps } from '@/screens/contracts';
import { isCustomUiTemplate } from '@/screens/screenRegistry';

/** Reactive check for whether the active template opts into custom UI screens. */
export function useIsCustomUiTemplate(): boolean {
  const [customUi, setCustomUi] = useState(() => isCustomUiTemplate(WebGAL.template));

  useEffect(() => {
    const update = () => setCustomUi(isCustomUiTemplate(WebGAL.template));
    update();
    WebGAL.events.templateLoaded.on(update);
    WebGAL.events.afterStyleUpdate.on(update);
    return () => {
      WebGAL.events.templateLoaded.off(update);
      WebGAL.events.afterStyleUpdate.off(update);
    };
  }, []);

  return customUi;
}

/** Shared translator and SE callbacks expected by every Screen contract. */
export function useUiCommonProps(): ScreenCommonProps {
  const { t } = useTranslation();
  const { playSeEnter, playSeClick, playSeSwitch, playSePageChange, playSeDialogOpen } = useSoundEffect();

  return useMemo(
    () => ({
      t: (key: string) => t(key),
      playSe: {
        enter: playSeEnter,
        click: playSeClick,
        switch: playSeSwitch,
        pageChange: playSePageChange,
        dialogOpen: playSeDialogOpen,
      },
    }),
    [t, playSeEnter, playSeClick, playSeSwitch, playSePageChange, playSeDialogOpen],
  );
}
