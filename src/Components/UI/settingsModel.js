import {ImporterExporter, SettingButtons_font, SettingButtons_speed} from "./etc";
import {clearCookie} from "../../Core/StoreControl/StoreControl";
import {WG_ViewControl} from "../../Core/ViewController/ViewControl";

const SettingsModel = ()=>{
    return <div>
        <div className={"settingsItemsList"}>
            {/* eslint-disable-next-line react/jsx-pascal-case */}
            <SettingButtons_font/>
            {/* eslint-disable-next-line react/jsx-pascal-case */}
            <SettingButtons_speed/>
            <div className={"deleteCookie"} onClick={() => {
                WG_ViewControl.showMesModel('你确定要清除缓存吗', '要', '不要', clearCookie)
            }}>清除所有设置选项以及存档
            </div>
            <ImporterExporter/>
            <div>本作品由 WebGAL 强力驱动，<a href={"https://github.com/MakinoharaShoko/WebGAL"}>了解 WebGAL</a>。</div>
            <br/>
            <div className='settingItemTitle'>效果预览</div>
        </div>
    </div>
}

export default SettingsModel;