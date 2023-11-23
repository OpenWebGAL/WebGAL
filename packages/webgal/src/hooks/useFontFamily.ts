import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { match } from '@/Core/util/match';

export function useFontFamily() {
  const fontFamily = useSelector((state: RootState) => state.userData.optionData.textboxFont);

  function getFont() {
    return match(fontFamily)
      .with(textFont.song, () => '"思源宋体", serif')
      .with(textFont.lxgw, () => '"LXGW", serif')
      .with(textFont.hei, () => '"WebgalUI", serif')
      .default(() => '"WebgalUI", serif');
  }

  return getFont();
}
