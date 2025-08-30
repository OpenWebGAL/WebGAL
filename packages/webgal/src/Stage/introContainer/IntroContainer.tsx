import useApplyStyle from '@/hooks/useApplyStyle';
import styles from '@/Core/gameScripts/intro/intro.module.scss';

export default function IntroContainer() {
  const applyStyle = useApplyStyle('Stage/Intro/intro.scss');
  return <div className={applyStyle('intro_container', styles.intro_container)} id="introContainer" />;
}
