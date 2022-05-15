import React from "react";
import styles from "./textPreview.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import {playSpeed} from "@/Core/interface/stateInterface/userDataInterface";

export const TextPreview = (props: any) => {
  const userDataState = useSelector((state: RootState) => state.userData);
  const textDelay = 55 - 20 * userDataState.optionData.textSpeed;
  const previewText = '现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。';
  const size = userDataState.optionData.textSize * 50 + 200 + '%';
  let classNameText = styles.singleText;
  switch (userDataState.optionData.textSpeed) {
  case playSpeed.normal:
    classNameText = styles.singleText;
    break;
  case playSpeed.slow:
    classNameText = styles.singleText1;
    break;
  case playSpeed.fast:
    classNameText = styles.singleText2;
    break;
  }
  const previewTextArray = previewText.split('')
    .map((e, i) => <span id={textDelay + 'text' + i}
      style={{fontSize: size, animationDelay: String(i * textDelay) + 'ms'}}
      className={classNameText}
      key={e + i}>{e}</span>);
  return <div className={styles.textPreviewMain}>
    {previewTextArray}
  </div>;
};
