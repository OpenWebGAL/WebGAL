import styles from './introContainer.module.scss';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

export default function IntroContainer() {
  // 处理 intro 点击的特殊逻辑，比较复杂，具体的注释以后补
  // TODO： 补充具体注释
  let timeout = setTimeout(() => {});
  function toNextIntroElement() {
    const introContainer = document.getElementById('introContainer');
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes as any;
      const len = children.length;
      children.forEach((node: HTMLDivElement, index: number) => {
        const currentDelay = Number(node.style.animationDelay.split('ms')[0]);
        if (currentDelay > 0) {
          node.style.animationDelay = `${currentDelay - 1500}ms`;
        }
        if (index === len - 1) {
          if (currentDelay === 0) {
            clearTimeout(timeout);
            nextSentence();
          } else {
            clearTimeout(timeout);
            timeout = setTimeout(nextSentence, currentDelay - 500);
          }
        }
      });
    }
  }

  return <div onClick={toNextIntroElement} className={styles.introContainer} id="introContainer" />;
}
