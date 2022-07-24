import React from "react";
import styles from "./textPreview.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "@/store/store";
import {webgal_env} from "@/env/webgal-env";

export const TextPreview = (props: any) => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const textDelay = webgal_env.textInitialDelay - 20 * userDataState.optionData.textSpeed;
  const previewText = '现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。';
  const size = userDataState.optionData.textSize * 50 + 200 + '%';
  let classNameText = styles.singleText;
  const previewTextArray = previewText.split('')
    .map((e, i) => <span id={textDelay + 'text' + i}
      style={{fontSize: size, animationDelay: String(i * textDelay) + 'ms'}}
      className={classNameText}
      key={e + i + userDataState.optionData.textSpeed}>{e}</span>);
  return <div className={styles.textPreviewMain}>
    {previewTextArray}
  </div>;
};
