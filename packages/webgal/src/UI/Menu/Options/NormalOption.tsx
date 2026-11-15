import { CSSProperties, PropsWithChildren } from 'react';
import styles from './normalOption.module.scss';

export interface NormalOptionProps {
  title: string;
  full?: boolean;
  style?: CSSProperties;
}

export const NormalOption = ({ title, full, style, children }: PropsWithChildren<NormalOptionProps>) => {
  return (
    <div className={styles.NormalOption} style={{ width: full ? '100%' : 'auto', ...style }}>
      <div className={styles.NormalOption_title}>{title}</div>
      <div className={styles.NormalOption_content}>{children}</div>
    </div>
  );
};
