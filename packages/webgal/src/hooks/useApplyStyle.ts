import { useEffect } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import axios from 'axios';
import { scss2cssinjsParser } from '@/Core/controller/customUI/scss2cssinjsParser';
import { useValue } from '@/hooks/useValue';
import { css, injectGlobal } from '@emotion/css';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { IWebGALStyleObj } from 'webgal-parser/build/types/styleParser';
import { logger } from '@/Core/util/logger';

export default function useApplyStyle(ui: string) {
  const styleObject = useValue<IWebGALStyleObj>(WebGAL.styleObjects.get(ui) ?? { classNameStyles: {}, others: '' });
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

  const updateStyleObject = () => {
    styleObject.value = WebGAL.styleObjects.get(ui) ?? { classNameStyles: {}, others: '' };
  };

  useRegisterAfterStyleUpdate(updateStyleObject);

  return applyStyle;
}

function useRegisterAfterStyleUpdate(callback: Function) {
  // TODO : 这里可能需要加个依赖项数组？但是当前由于使用了 useValue，状态过期问题可能被规避了，并且之前一直表现正常
  const handler = () => {
    callback();
  };
  useEffect(() => {
    WebGAL.events.afterStyleUpdate.on(handler);
    return () => WebGAL.events.afterStyleUpdate.off(handler);
  }, []);
}
