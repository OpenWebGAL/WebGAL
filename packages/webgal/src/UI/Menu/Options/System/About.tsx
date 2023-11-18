import useTrans from '@/hooks/useTrans';
import { Left } from '@icon-park/react';
import s from './about.module.scss';
import { __INFO } from '@/config/info';

export default function About(props: { onClose: () => void }) {
  const t = useTrans('menu.options.pages.system.options.about.');
  return (
    <div className={s.about}>
      <div className={s.backButton} onClick={props.onClose}>
        <Left className={s.icon} theme="outline" size="35" strokeWidth={3} fill="#333" />
      </div>
      <div className={s.title}>{t('subTitle')}</div>
      <div className={s.title}>{t('version')}</div>
      <div className={s.text}>{__INFO.version}</div>
      <div className={s.title}>{t('source')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://github.com/MakinoharaShoko/WebGAL">
          https://github.com/MakinoharaShoko/WebGAL
        </a>
      </div>
      <div className={s.title}>{t('contributors')}</div>
      <div className={s.text}>
        {__INFO.contributors.map((user, index, array) => {
          return (
            <span key={user.link} className={s.contributor}>
              <a target="_blank" href={user.link}>
                {user.username}
              </a>
              {index !== array.length - 1 && <>,</>}
            </span>
          );
        })}
      </div>
      <div className={s.title}>{t('website')}</div>
      <div className={s.text}>
        <a target="_blank" href="https://openwebgal.com/">
          https://openwebgal.com/
        </a>
      </div>
    </div>
  );
}
