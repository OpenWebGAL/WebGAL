import useTrans from '@/hooks/useTrans';
import { Left } from '@icon-park/react';
import s from './about.module.scss';
import { __INFO } from '@/config/info';
import useApplyStyle from '@/hooks/useApplyStyle';

export default function About(props: { onClose: () => void }) {
  const t = useTrans('menu.options.pages.system.options.about.');
  const applyStyle = useApplyStyle('menuAbout');
  return (
    <div className={applyStyle('about', s.about)}>
      <div className={applyStyle('backButton', s.backButton)} onClick={props.onClose}>
        <Left className={applyStyle('icon', s.icon)} theme="outline" size="35" strokeWidth={3} fill="#333" />
      </div>
      <div className={applyStyle('title', s.title)}>{t('subTitle')}</div>
      <div className={applyStyle('title', s.title)}>{t('version')}</div>
      <div className={applyStyle('text', s.text)}>{__INFO.version}</div>
      <div className={applyStyle('title', s.title)}>{t('source')}</div>
      <div className={applyStyle('text', s.text)}>
        <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL">
          https://github.com/OpenWebGAL/WebGAL
        </a>
      </div>
      <div className={applyStyle('title', s.title)}>{t('contributors')}</div>
      <div className={applyStyle('text', s.text)}>
        <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL/graphs/contributors">
          https://github.com/OpenWebGAL/WebGAL/graphs/contributors
        </a>
      </div>
      <div className={applyStyle('title', s.title)}>{t('website')}</div>
      <div className={applyStyle('text', s.text)}>
        <a target="_blank" href="https://openwebgal.com/">
          https://openwebgal.com/
        </a>
      </div>
    </div>
  );
}
