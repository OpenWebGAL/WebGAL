import { arg, commandType, IAsset } from '../../interface/coreInterface/sceneInterface'
import { fileType } from '../../util/assetSetter'

/**
 * 根据语句类型、语句内容、参数列表，扫描该语句可能携带的资源
 * @param command 语句类型
 * @param content 语句内容
 * @param args 参数列表
 * @return {Array<IAsset>} 语句携带的参数列表
 */
export const assetsScanner = (command: commandType, content: string, args: Array<arg>): Array<IAsset> => {
    const returnAssetsList: Array<IAsset> = []
    // 处理语句携带的资源
    if (command === commandType.changeBg) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.background,
        })
    }
    if (command === commandType.changeFigure) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.figure,
        })
    }
    return returnAssetsList
}
