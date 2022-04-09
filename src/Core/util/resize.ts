/**
 * 在窗口大小改变时进行强制缩放
 */
export const resize = () => {
    const targetHeight = 900
    const targetWidth = 1600

    const h = window.innerHeight // 窗口高度
    const w = window.innerWidth // 窗口宽度
    const zoomH = h / targetHeight // 以窗口高度为基准的变换比
    const zoomW = w / targetWidth // 以窗口宽度为基准的变换比
    const zoomH2 = w / targetHeight // 竖屏时以窗口高度为基础的变换比
    const zoomW2 = h / targetWidth // 竖屏时以窗口宽度为基础的变换比
    let mh = (targetHeight - h) / 2 // y轴移动距离
    let mw = (targetWidth - w) / 2 // x轴移动距离
    let mh2os = targetWidth / 2 - w / 2 // 竖屏时 y轴移动距离
    let mw2os = targetHeight / 2 - h / 2 // 竖屏时 x轴移动距离
    const root = document.getElementById('root') // 获取根元素
    if (root) {
        if (w > h) {
            mw = -mw
            mh = -mh
            if (w * (9 / 16) >= h) {
                root.style.transform = `translate(${mw}px, ${mh}px) scale(${zoomH},${zoomH})`
            }
            if (w * (9 / 16) < h) {
                root.style.transform = `translate(${mw}px, ${mh}px) scale(${zoomW},${zoomW})`
            }
        } else {
            mw2os = -mw2os
            if (h * (9 / 16) >= w) {
                root.style.transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2},${zoomH2})`
            }
            if (h * (9 / 16) < w) {
                root.style.transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2},${zoomW2})`
            }
        }
    }
}
