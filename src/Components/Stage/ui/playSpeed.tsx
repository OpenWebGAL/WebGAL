import { settingStore } from '@/store'
import { PlaySpeed } from '@/types'
import { FunctionComponent } from 'react'
import { useStore } from 'reto'
const PlaySpeedSetting: FunctionComponent<{}> = () => {
    const { setting, setSetting } = useStore(settingStore, ({ setting }) => [setting.playSpeed])

    return (
        <div className="singleSettingItem">
            <span className="settingItemTitle">播放速度</span>
            <span className={setting.playSpeed === PlaySpeed.low ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.low }))}>慢</span>
            <span className={setting.playSpeed === PlaySpeed.medium ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.medium }))}> 中</span >
            <span className={setting.playSpeed === PlaySpeed.fast ? 'settingItemButtonOn' : 'settingItemButton'} onClick={() => setSetting(setting => ({ ...setting, playSpeed: PlaySpeed.fast }))}>快</span>
        </div >
    )
}
export default PlaySpeedSetting