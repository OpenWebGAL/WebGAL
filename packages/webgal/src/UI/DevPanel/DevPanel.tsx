import styles from './devPanel.module.scss';
import { useValue } from '@/hooks/useValue';
import { getPixiSscreenshot } from '@/UI/DevPanel/devFunctions/getPixiSscreenshot';
import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTranslation } from 'react-i18next';

import { WebGAL } from '@/Core/WebGAL';
import useLanguage from '@/hooks/useLanguage';
import { language } from '@/config/language';

type JSONValue = string | number | boolean | null | IJsonObject | JSONArray;
interface IJsonObject {
  [key: string]: JSONValue;
}
type JSONArray = JSONValue[];

interface IJsonViewerProps {
  jsonString: string;
}

export default function DevPanel() {
  // 控制显隐
  function isShowDevPanel() {
    const hash = window.location.hash;
    return !!hash.match(/dev/);
  }
  const isOpenDevPanel = useValue(false);
  const hash = useValue(window.location.hash);
  const stageState = useSelector((state: RootState) => state.stage);
  const guiState = useSelector((state: RootState) => state.GUI);
  const userDataState = useSelector((state: RootState) => state.userData);
  const savesState = useSelector((state: RootState) => state.saveData);
  useEffect(() => {
    window.onhashchange = () => {
      hash.set(window.location.hash);
    };
  }, []);
  const isShow = isShowDevPanel();

  const { t, i18n } = useTranslation();
  const setLanguage = useLanguage();

  const devMainArea = (
    <>
      <button onClick={() => getPixiSscreenshot()}>Save PIXI Screenshot</button>
      <button onClick={() => WebGAL.gameplay.pixiStage?.removeAnimation('snow-ticker')}>Remove Snow Ticker</button>
      <button onClick={() => WebGAL.events.styleUpdate.emit()}>Update Styles</button>
      <div>
        <div>Current Language:{i18n.language}</div>
        <button onClick={() => setLanguage(language.zhCn)}>中文</button>
        <button onClick={() => setLanguage(language.en)}>English</button>
        <button onClick={() => setLanguage(language.zhTw)}>繁體中文</button>
        <button onClick={() => setLanguage(language.jp)}>日本語</button>
        <button onClick={() => setLanguage(language.fr)}>Français</button>
        <button onClick={() => setLanguage(language.de)}>Deutsch</button>
      </div>
      <details>
        <summary>Stage State</summary>
        <JsonViewer jsonString={JSON.stringify(stageState)} />
      </details>
      <details>
        <summary>GUI State</summary>
        <JsonViewer jsonString={JSON.stringify(guiState)} />
      </details>
      <details>
        <summary>User Data State</summary>
        <JsonViewer jsonString={JSON.stringify(userDataState)} />
      </details>
      <details>
        <summary>Saves State</summary>
        <JsonViewer jsonString={JSON.stringify(savesState)} />
      </details>
    </>
  );
  return (
    <>
      {isShow && isOpenDevPanel.value && (
        <div className={styles.dev_panel_main} onWheel={(e) => e.stopPropagation()}>
          <div className={styles.dev_panel_header}>
            <div className={styles.dev_panel_title}>WebGAL DEV PANEL</div>
            <button onClick={() => isOpenDevPanel.set(false)} className={styles.dev_panel_close_button}>
              ×
            </button>
          </div>
          <div className={styles.dev_panel_content}>{devMainArea}</div>
        </div>
      )}
      {!isOpenDevPanel.value && isShow && (
        <div onClick={() => isOpenDevPanel.set(true)} className={styles.dev_panel_opener}>
          Open Dev Panel
        </div>
      )}
    </>
  );
}

function renderJSON(key: string, value: JSONValue) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return (
        <details key={key} style={{ marginLeft: '20px' }}>
          <summary>
            {key} <span style={{ color: 'rgba(165, 6, 86, 1)' }}>{`[${value.length}]`}</span>
          </summary>
          {value.map((item, index) => renderJSON(`${index}`, item))}
        </details>
      );
    } else {
      return (
        <details key={key} style={{ marginLeft: '20px' }}>
          <summary>
            {key} <span style={{ color: 'rgba(165, 6, 86, 1)' }}>{`[${Object.entries(value).length}]`}</span>
          </summary>
          {Object.entries(value).map(([subKey, subValue]) => renderJSON(subKey, subValue))}
        </details>
      );
    }
  } else {
    return (
      <div style={{ marginLeft: '20px' }}>
        {key}: <span style={{ color: 'rgba(62, 13, 177, 1)' }}>{String(value)}</span>
      </div>
    );
  }
}

const JsonViewer: FC<IJsonViewerProps> = ({ jsonString }) => {
  let parsed: IJsonObject | null = null;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    return <p style={{ color: 'red' }}>JSON 解析失败：{(error as Error).message}</p>;
  }

  return <div>{parsed && Object.entries(parsed).map(([key, value]) => renderJSON(key, value))}</div>;
};
