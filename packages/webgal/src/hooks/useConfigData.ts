import { getFastSaveFromStorage, getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { getStorage } from '@/Core/controller/storage/storageController';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { WebGAL } from '@/Core/WebGAL';
import { setGuiAsset, setLogoImage } from '@/store/GUIReducer';
import { RootState, webgalStore } from '@/store/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const useConfigData = () => {
  const _map = ['Title_img', 'Game_Logo', 'Title_bgm', 'Game_name', 'Game_key'];
  const configData = useSelector((state: RootState) => state.userData.globalGameVar);
  return useEffect(() => {
    // configData发生变化
    for (let i in configData) {
      if (!_map.includes(i)) {
        continue;
      }
      const val = configData[i] as string;
      switch (i) {
        case 'Title_img': {
          const titleUrl = assetSetter(val, fileType.background);
          webgalStore.dispatch(setGuiAsset({ asset: 'titleBg', value: titleUrl }));
          setEbg(titleUrl);
          break;
        }

        case 'Game_Logo': {
          const logos = val.split('|');
          const logoUrlList = logos.map((val) => assetSetter(val, fileType.background));
          webgalStore.dispatch(setLogoImage(logoUrlList));
          break;
        }

        case 'Title_bgm': {
          const bgmUrl = assetSetter(val, fileType.bgm);
          webgalStore.dispatch(setGuiAsset({ asset: 'titleBgm', value: bgmUrl }));
          break;
        }

        case 'Game_name': {
          WebGAL.gameName = val;
          document.title = val;
          break;
        }

        case 'Game_key': {
          WebGAL.gameKey = val;
          getStorage();
          getFastSaveFromStorage();
          getSavesFromStorage(0, 0);
          break;
        }
      }
    }
    return () => {};
  }, [configData.Game_Logo, configData.Game_key, configData.Game_name, configData.Title_bgm, configData.Title_img]);
};
export default useConfigData;
