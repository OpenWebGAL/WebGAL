import { ReactElement } from 'react';
import { INormalButton } from '../../../../Core/interface/componentsInterface/OptionInterface';
import styles from './normalButton.module.scss';

export const NormalButton = (props: INormalButton) => {
    const len: number = props.textList.length;
    const buttonList: Array<ReactElement> = [];
    for (let i = 0; i < len; i++) {
        if (i === props.currentChecked) {
            const t = (
                <div
                    key={props.textList[i] + i + props}
                    className={styles.NormalButton + ' ' + styles.NormalButtonChecked}
                    onClick={props.functionList[i]}
                >
                    {props.textList[i]}
                </div>
            );
            buttonList.push(t);
        } else {
            const t = (
                <div key={props.textList[i] + i} className={styles.NormalButton} onClick={props.functionList[i]}>
                    {props.textList[i]}
                </div>
            );
            buttonList.push(t);
        }
    }
    return <>{buttonList}</>;
};
