/**
 * 在窗口大小改变时进行强制缩放
 */
export function resize() {
  const targetHeight = 1440;
  const targetWidth = 2560;

  const h = window.innerHeight; // 窗口高度
  const w = window.innerWidth; // 窗口宽度
  const zoomH = h / targetHeight; // 以窗口高度为基准的变换比
  const zoomW = w / targetWidth; // 以窗口宽度为基准的变换比
  const root = document.getElementById('root'); // 获取根元素

  root!.style.transform = `scale(${Math.min(zoomW, zoomH)})`;
}

window.onload = resize;
window.onresize = resize;
// 监听键盘 F11 事件，全屏时触发页面调整
document.onkeydown = function (event) {
  const e = event;
  if (e && e.key === 'F11') {
    setTimeout(() => {
      resize();
    }, 100);
  }
};
