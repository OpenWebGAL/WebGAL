import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useValue } from '@/hooks/useValue';
import { System } from '@/UI/Menu/Options/System/System';
import { Display } from '@/UI/Menu/Options/Display/Display';
import { Sound } from '@/UI/Menu/Options/Sound/Sound';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { Icon } from '@icon-park/react/lib/runtime';
import { Flashlight, Info, System as SystemIcon, VolumeNotice } from '@icon-park/react';
import About from './About/About';

enum optionPage {
  'System',
  'Display',
  'Sound',
  'About',
}

interface IOptionsBarButtonProps {
  text?: string;
  icon?: Icon;
  active?: boolean;
  onClick?: () => void;
}

export const Options: FC = () => {
  const { playSeEnter, playSeSwitch } = useSoundEffect();
  const currentOptionPage = useValue(optionPage.System);
  const applyStyle = useApplyStyle('UI/Menu/Options/options.scss');
  useEffect(getStorage, []);

  const t = useTrans('menu.options.');

  const barButton = (props: IOptionsBarButtonProps) => {
    return (
      <div
        className={`${applyStyle('options_bar_button', styles.options_bar_button)} ${
          props.active ? applyStyle('options_bar_button_active', styles.options_bar_button_active) : ''
        }`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
      >
        {props.icon && (
          <props.icon
            className={applyStyle('options_bar_button_icon', styles.options_bar_button_icon)}
            strokeWidth={4}
          />
        )}
        {props.text && (
          <div className={applyStyle('options_bar_button_text', styles.options_bar_button_text)}>{props.text}</div>
        )}
      </div>
    );
  };

  return (
    <div className={applyStyle('options_main', styles.options_main)}>
      <div className={applyStyle('options_bar', styles.options_bar)}>
        {barButton({
          text: t('pages.system.title'),
          icon: SystemIcon,
          active: currentOptionPage.value === optionPage.System,
          onClick: () => {
            currentOptionPage.set(optionPage.System);
            playSeSwitch();
          },
        })}
        {barButton({
          text: t('pages.display.title'),
          icon: Flashlight,
          active: currentOptionPage.value === optionPage.Display,
          onClick: () => {
            currentOptionPage.set(optionPage.Display);
            playSeSwitch();
          },
        })}
        {barButton({
          text: t('pages.sound.title'),
          icon: VolumeNotice,
          active: currentOptionPage.value === optionPage.Sound,
          onClick: () => {
            currentOptionPage.set(optionPage.Sound);
            playSeSwitch();
          },
        })}
        {barButton({
          text: t('pages.about.title'),
          icon: Info,
          active: currentOptionPage.value === optionPage.About,
          onClick: () => {
            currentOptionPage.set(optionPage.About);
            playSeSwitch();
          },
        })}
      </div>
      {currentOptionPage.value === optionPage.Display && <Display />}
      {currentOptionPage.value === optionPage.System && <System />}
      {currentOptionPage.value === optionPage.Sound && <Sound />}
      {currentOptionPage.value === optionPage.About && <About />}
    </div>
  );
};
