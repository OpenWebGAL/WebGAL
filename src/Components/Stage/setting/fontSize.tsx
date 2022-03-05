import { settingStore } from '@/store'
import { FontSize } from '@/types'
import { FunctionComponent } from 'react'
import { useStore } from 'reto'
const FontSizeSetting: FunctionComponent<{}> = () => {
    const { setting, setSetting } = useStore(settingStore)

    return (
        <div className="singleSettingItem">
            <span className="settingItemTitle">字体大小</span>
            <span className={setting.fontSize === FontSize.small ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, fontSize: FontSize.small }))}>小</span>
            <span className={setting.fontSize === FontSize.medium ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, fontSize: FontSize.medium }))}>中</span>
            <span className={setting.fontSize === FontSize.large ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, fontSize: FontSize.large }))}>大</span>
        </div>
    )
}
export default FontSizeSetting