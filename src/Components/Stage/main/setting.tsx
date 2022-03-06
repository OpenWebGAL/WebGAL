import { ChangeEvent, FunctionComponent, useCallback, useRef } from 'react'
import closeB from "@assets/img/closeBlack.svg";
import TextPreview from '../ui/textPreview';
import FontSizeSetting from '../ui/fontSize';
import PlaySpeedSetting from '../ui/playSpeed';
import { Close } from '../ui';
import { useStore } from 'reto';
import { sceneStore } from '@/store';
import { stopPropagation } from '@/utils';
import logger from '@/utils/logger';

export const Setting: FunctionComponent<{}> = () => {
    const { StartGame, control, setControl, gameInfo } = useStore(sceneStore, ({ control }) => [control.settingVisible])
    const saveFileRef = useRef<HTMLAnchorElement | null>(null)
    const loadFileRef = useRef<HTMLInputElement | null>(null)

    const exportSaves = () => {
        const saves = localStorage.getItem(gameInfo.Game_key);
        if (saves === null) {
            // no saves
            return false;
        }
        const blob = new Blob([saves], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        URL.revokeObjectURL(saveFileRef.current!.href);
        saveFileRef.current!.href = blobUrl;
        saveFileRef.current!.download = 'saves.json';
        saveFileRef.current!.click();
    }
    const importSaves = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ?? [];
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (evR) => {
            const saves = evR.target?.result;
            if (typeof saves === 'string') {
                localStorage.setItem(gameInfo['Game_key'], saves);
                // loadStorage();
                logger.info('导入存档成功')
                window.location.reload();  // dirty: 强制刷新 UI
            } else {
                logger.error('导入存档失败')
            }
        };
        reader.readAsText(file, 'UTF-8');
    }
    return (
        <div onClick={stopPropagation} id="settings" style={{ display: control.settingVisible ? 'flex' : 'none' }}>
            <div id="settingsMainBox">
                <Close id="close" src={closeB} onClick={useCallback(
                    () => {
                        setControl(control => ({ ...control, settingVisible: false }))
                    },
                    [],
                )} />
                <div id="settingsTitle">
                    设置
                </div>
                <div id="settingItems">
                    <div className={"settingsItemsList"}>
                        <FontSizeSetting />
                        <PlaySpeedSetting />
                        <div className="deleteCookie">清除所有设置选项以及存档
                        </div>
                        <div className="importer-exporter">
                            <span className="label-saves-exporter" onClick={exportSaves}>导出存档</span>
                            <a ref={saveFileRef} target="_blank" id="dummy-saves-exporter" style={{ display: "none" }} />
                            <span className="label-saves-importer" onClick={() => { loadFileRef.current?.click() }}>导入存档</span>
                            <input ref={loadFileRef} type="file" id="dummy-saves-importer" style={{ display: "none" }} onChange={importSaves} />
                        </div>
                        <div>本作品由 WebGAL 强力驱动，<a href={"https://github.com/MakinoharaShoko/WebGAL"}>了解 WebGAL</a>。</div>
                        <br />
                        <div className='settingItemTitle'>效果预览</div>
                    </div>
                </div>
                <div id="textPreview" >
                    <TextPreview text="现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。" />
                </div>
            </div>
        </div>
    )
}