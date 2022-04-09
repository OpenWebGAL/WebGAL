/**
 * 获取随机演出名称
 */
export const getRandomPerformName = (): string => {
    return Math.random().toString().substring(0, 10)
}
