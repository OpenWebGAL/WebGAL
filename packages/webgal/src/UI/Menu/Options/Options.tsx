import { FC, useEffect } from 'react';
import styles from './options.module.scss';
import { getStorage } from '@/Core/controller/storage/storageController';
import { useValue } from '@/hooks/useValue';
import { System } from '@/UI/Menu/Options/System/System';
import { Display } from '@/UI/Menu/Options/Display/Display';
import { Sound } from '@/UI/Menu/Options/Sound/Sound';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import { DoubleLeft, Monitor, SettingOne, SoundWave } from '@icon-park/react';
import { useDispatch } from 'react-redux';
import { setVisibility } from '@/store/GUIReducer';

enum optionPage {
  'System',
  'Display',
  'Sound',
}

/**
 * 选项标签按钮组件
 */
interface OptionTabButtonProps {
  text: string;
  isActive: boolean;
  subText?: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const OptionTabButton: FC<OptionTabButtonProps> = ({ text, isActive, onClick, subText, icon }) => {
  const { playSeEnter, playSeSwitch } = useSoundEffect();

  const className = isActive
    ? `${styles.Options_page_button} ${styles.Options_page_button_active}`
    : styles.Options_page_button;

  const handleClick = () => {
    onClick();
    playSeSwitch();
  };

  return (
    <div onClick={handleClick} className={className} onMouseEnter={playSeEnter}>
      {icon && icon}
      <div className={styles.Options_page_button_text}>
        {text}
        {subText && <span className={styles.Options_page_button_text_sub}>{subText}</span>}
      </div>
      <div className={styles.Options_page_button_text_sub_line}></div>
    </div>
  );
};

export const Options: FC = () => {
  const currentOptionPage = useValue(optionPage.System);
  useEffect(getStorage, []);

  const dispatch = useDispatch();

  const t = useTrans('menu.options.');

  return (
    <div className={styles.Options_main}>
      <div className={styles.Options_top}>
        <div
          className={styles.Options_top_back_button}
          onClick={() => dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }))}
        >
          <DoubleLeft size="76" fill="#000" strokeWidth={3} />
        </div>
        <div className={styles.Options_top_back_button_text}>
          全局设置
          <span className={styles.Options_top_back_button_text_sub}>Global Settings</span>
        </div>
      </div>
      <div className={styles.Options_page_container}>
        <div className={styles.Options_button_list}>
          <OptionTabButton
            text={'系统全局设置'}
            subText={'System Global Settings'}
            icon={<SettingOne size="36" />}
            isActive={currentOptionPage.value === optionPage.System}
            onClick={() => currentOptionPage.set(optionPage.System)}
          />
          <OptionTabButton
            text={'显示设置'}
            subText="Display Settings"
            icon={<Monitor size="36" />}
            isActive={currentOptionPage.value === optionPage.Display}
            onClick={() => currentOptionPage.set(optionPage.Display)}
          />
          <OptionTabButton
            text={'音效设置'}
            subText={'Sound Settings'}
            icon={<SoundWave size="36" />}
            isActive={currentOptionPage.value === optionPage.Sound}
            onClick={() => currentOptionPage.set(optionPage.Sound)}
          />
          <div className={styles.Options_button_list_background}></div>
        </div>
        <div className={styles.Options_main_content}>
          {currentOptionPage.value === optionPage.Display && <Display />}
          {currentOptionPage.value === optionPage.System && <System />}
          {currentOptionPage.value === optionPage.Sound && <Sound />}
        </div>
      </div>
    </div>
  );
};
