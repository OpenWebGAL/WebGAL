import { useEffect } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import axios from 'axios';
import { IWebGALStyleObj, scss2cssinjsParser } from '@/Core/controller/customUI/scss2cssinjsParser';
import { useValue } from '@/hooks/useValue';
import { css } from '@emotion/css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function useApplyStyle(url: string) {
  const styleObject = useValue<IWebGALStyleObj>({ classNameStyles: {}, others: '' });
  const replaced = useSelector((state: RootState) => state.stage.replacedUIlable);

  const applyStyle = (classNameLable: string, fallbackClassName: string) => {
    // 先看看是否被用户用 applyStyle 指令替换了类名
    const className = replaced?.[classNameLable] ?? classNameLable;
    if (Object.keys(styleObject.value.classNameStyles).includes(className)) {
      const cijClassName = css(styleObject.value.classNameStyles?.[className] ?? '');
      return `${fallbackClassName} ${cijClassName}`;
    }
    return fallbackClassName;
  };

  const updateStyleFile = async () => {
    const resp = await axios.get(`game/template/${url}`);
    const scssStr = resp.data;
    styleObject.set(scss2cssinjsParser(scssStr));
  };

  useEffect(() => {
    updateStyleFile();
  }, []);

  useRigisterStyleUpdate(url, updateStyleFile);

  return applyStyle;
}

function useRigisterStyleUpdate(url: string, callback: Function) {
  const handler = () => {
    callback();
  };
  useEffect(() => {
    WebGAL.events.styleUpdate.on(handler, url);
    return () => WebGAL.events.styleUpdate.off(handler, url);
  }, []);
}
