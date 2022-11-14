import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { textFont } from '@/store/userDataInterface';

export function useFontFamily() {
  const fontFamily = useSelector((state: RootState) => state.userData.optionData.textboxFont);

  function getFont() {
    return fontFamily === textFont.song ? '"思源宋体", serif' : '"WebgalUI", serif';
  }

  return getFont();
}
