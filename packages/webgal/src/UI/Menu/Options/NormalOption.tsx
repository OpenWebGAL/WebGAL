import styles from './normalOption.module.scss';
import useApplyStyle from '@/hooks/useApplyStyle';

export const NormalOption = (props: any) => {
  const applyStyle = useApplyStyle('menuNormalOption');
  return (
    <div className={applyStyle('NormalOption', styles.NormalOption)} style={{ width: props.full ? '100%' : 'auto' }}>
      {/* <div className={styles.NormalOption_title_sd}>{props.title}</div> */}
      {/* <div className={styles.NormalOption_title_bef}>{props.title}</div> */}
      <div className={applyStyle('NormalOption_title', styles.NormalOption_title)}>{props.title}</div>
      <div
        className={applyStyle('NormalOption_buttonList', styles.NormalOption_buttonList)}
        style={{ width: props.full ? '100%' : 'auto', overflow: props.full ? 'hidden' : undefined }}
      >
        {props.children}
      </div>
    </div>
  );
};
