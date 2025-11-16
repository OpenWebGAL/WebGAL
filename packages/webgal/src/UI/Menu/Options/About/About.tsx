import useTrans from '@/hooks/useTrans';
import styles from '../options.module.scss';
import { __INFO } from '@/config/info';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function About() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const t = useTrans('menu.options.pages.about.options.');
  const applyStyle = useApplyStyle('UI/Menu/Options/options.scss');
  return (
    <div className={applyStyle('options_page_container', styles.options_page_container)}>
      <div className={applyStyle('options_description', styles.options_description)}>
        <div className={applyStyle('options_description_title', styles.options_description_title)}>游戏名称</div>
        <div className={applyStyle('options_description_content', styles.options_description_content)}>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>
            开发人员
          </div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>aaa, bbb, ccc</div>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>版本号</div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>1.0.1</div>
        </div>
      </div>
      <div className={applyStyle('options_description', styles.options_description)}>
        <div className={applyStyle('options_description_title', styles.options_description_title)}>
          {t('webgal.title')}
        </div>
        <div className={applyStyle('options_description_content', styles.options_description_content)}>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>
            {t('webgal.subTitle')}
          </div>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>
            {t('webgal.version')}
          </div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>
            {__INFO.version}
          </div>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>
            {t('webgal.source')}
          </div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>
            <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL">
              https://github.com/OpenWebGAL/WebGAL
            </a>
          </div>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>
            {t('webgal.contributors')}
          </div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>
            <a target="_blank" href="https://github.com/OpenWebGAL/WebGAL/graphs/contributors">
              https://github.com/OpenWebGAL/WebGAL/graphs/contributors
            </a>
          </div>
          <div className={applyStyle('options_description_subtitle', styles.options_description_subtitle)}>
            {t('webgal.website')}
          </div>
          <div className={applyStyle('options_description_text', styles.options_description_text)}>
            <a target="_blank" href="https://openwebgal.com/">
              https://openwebgal.com/
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
