import styles from './normalOption.module.scss';

export const NormalOption = (props: any) => {
  return (
    <div className={styles.NormalOption} style={{ width: props.full ? '100%' : 'auto' }}>
      {/* <div className={styles.NormalOption_title_sd}>{props.title}</div> */}
      {/* <div className={styles.NormalOption_title_bef}>{props.title}</div> */}
      <div className={styles.NormalOption_title}>{props.title}</div>
      <div
        className={styles.NormalOption_buttonList}
        style={{ width: props.full ? '100%' : 'auto', overflow: props.full ? 'hidden' : undefined }}
      >
        {props.children}
      </div>
    </div>
  );
};
