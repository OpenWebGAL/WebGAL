import useApplyStyle from '@/hooks/useApplyStyle';
import styles from './normalOption.module.scss';

export const NormalOption = (props: any) => {
  const applyStyle = useApplyStyle('UI/Menu/Options/normalOption.scss');
  return (
    <div
      className={applyStyle('options_normal_option', styles.options_normal_option)}
      style={{ width: props.full ? '100%' : 'auto' }}
    >
      <div className={applyStyle('options_normal_option_title', styles.options_normal_option_title)}>{props.title}</div>
      <div
        className={applyStyle('options_normal_option_content', styles.options_normal_option_content)}
        style={{ width: props.full ? '100%' : 'auto', overflow: props.full ? 'hidden' : undefined }}
      >
        {props.children}
      </div>
    </div>
  );
};
