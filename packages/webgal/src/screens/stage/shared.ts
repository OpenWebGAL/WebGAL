import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSoundEffect from '@/hooks/useSoundEffect';
import type { ScreenCommonProps } from '@/screens/contracts';

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
