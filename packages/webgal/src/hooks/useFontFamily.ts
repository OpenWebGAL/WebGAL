import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { textFont } from '@/store/userDataInterface';
import { match } from '@/Core/util/match';

export function useFontFamily() {
  const fontFamily = useSelector((state: RootState) => state.userData.optionData.textboxFont);

  function getFont() {
    return match(fontFamily)
      ._(textFont.song, () => '"思源宋体", serif')
      ._(textFont.lxgw, () => '"LXGW", serif')
      ._(textFont.hei, () => '"WebgalUI", serif')
      .default(() => '"WebgalUI", serif');
  }

  return getFont();
}
