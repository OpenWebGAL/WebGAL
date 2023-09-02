import { ReactElement } from 'react';
import { INormalButton } from '@/Components/UI/Menu/Options/OptionInterface';
import styles from './normalButton.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';

export const NormalButton = (props: INormalButton) => {
  const len: number = props.textList.length;
  const buttonList: Array<ReactElement> = [];
  const { playSeEnter, playSeClickMenuNormalButton } = useSoundEffect();
  for (let i = 0; i < len; i++) {
    if (i === props.currentChecked) {
      const t = (
        <div
          key={props.textList[i] + i + props}
          className={styles.NormalButton + ' ' + styles.NormalButtonChecked}
          onClick={() => {
            playSeClickMenuNormalButton();
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
          className={styles.NormalButton}
          onClick={() => {
            playSeClickMenuNormalButton();
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
