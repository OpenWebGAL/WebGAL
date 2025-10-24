import { ReactElement } from 'react';
import { INormalButton } from '@/UI/Menu/Options/OptionInterface';
import styles from './normalButton.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';

export const NormalButton = (props: INormalButton) => {
  const len: number = props.textList.length;
  const buttonList: Array<ReactElement> = [];
  const { playSeEnter, playSeSwitch } = useSoundEffect();
  const applyStyle = useApplyStyle('UI/Menu/Options/normalButton.scss');
  for (let i = 0; i < len; i++) {
    if (i === props.currentChecked) {
      const t = (
        <div
          key={props.textList[i] + i + props}
          className={
            applyStyle('options_normal_button', styles.options_normal_button) +
            ' ' +
            applyStyle('options_normal_button_active', styles.options_normal_button_active)
          }
          onClick={() => {
            playSeSwitch();
            props.functionList[i]();
          }}
          onMouseEnter={playSeEnter}
        >
          {props.textList[i]}
        </div>
      );
      buttonList.push(t);
    } else {
      const t = (
        <div
          key={props.textList[i] + i}
          className={applyStyle('options_normal_button', styles.options_normal_button)}
          onClick={() => {
            playSeSwitch();
            props.functionList[i]();
          }}
          onMouseEnter={playSeEnter}
        >
          {props.textList[i]}
        </div>
      );
      buttonList.push(t);
    }
  }
  return <>{buttonList}</>;
};
