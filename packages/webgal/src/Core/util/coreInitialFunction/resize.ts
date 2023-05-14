/**
 * 在窗口大小改变时进行强制缩放
 */
export const resize = () => {
  const targetHeight = 1440;
  const targetWidth = 2560;

  const h = window.innerHeight; // 窗口高度
  const w = window.innerWidth; // 窗口宽度
  const zoomH = h / targetHeight; // 以窗口高度为基准的变换比
  const zoomW = w / targetWidth; // 以窗口宽度为基准的变换比
  const zoomH2 = w / targetHeight; // 竖屏时以窗口高度为基础的变换比
  const zoomW2 = h / targetWidth; // 竖屏时以窗口宽度为基础的变换比
  let mh = (targetHeight - h) / 2; // y轴移动距离
  let mw = (targetWidth - w) / 2; // x轴移动距离
  let mh2os = targetWidth / 2 - w / 2; // 竖屏时 y轴移动距离
  let mw2os = targetHeight / 2 - h / 2; // 竖屏时 x轴移动距离
  const root = document.getElementById('root'); // 获取根元素
  const title = document.getElementById('Title_enter_page');
  const elements = [root, title];
  if (w > h) {
    const ebg = document.getElementById('ebg');
    if (ebg) {
      ebg.style.translate = ``;
      ebg.style.scale = ``;
      ebg.style.rotate = ``;
      ebg.style.height = `100vh`;
      ebg.style.width = `100vw`;
    }

    mw = -mw;
    mh = -mh;
    if (w * (9 / 16) >= h) {
      for (const element of elements) {
        if (element) {
          // element.style.transform = `translate(${mw}px, ${mh}px) scale(,${zoomH})`;
          element.style.translate = `${mw}px ${mh}px`;
          element.style.scale = `${zoomH}`;
          element.style.rotate = ``;
        }
      }
    }
    if (w * (9 / 16) < h) {
      for (const element of elements) {
        if (element) {
          element.style.translate = `${mw}px ${mh}px`;
          element.style.scale = `${zoomW}`;
          element.style.rotate = ``;
        }
      }
    }
  } else {
    /**
     * 旋转
     */
    const ebg = document.getElementById('ebg');
    if (ebg) {
      ebg.style.height = `${targetHeight}px`;
      ebg.style.width = `${targetWidth}px`;
    }
    // mw2os = -mw2os;
    if (h * (9 / 16) >= w) {
      mh2os = -mh2os;
      mw2os = -mw2os;
      if (ebg) {
        ebg.style.rotate = `90deg`;
        ebg.style.translate = `${mh2os}px ${mw2os}px`;
        ebg.style.scale = `${zoomH2 * 1.25}`;
      }
      for (const element of elements) {
        if (element) {
          element.style.translate = `${mh2os}px ${mw2os}px`;
          element.style.scale = `${zoomH2}`;
          element.style.rotate = `90deg`;
        }
      }
    }
    if (h * (9 / 16) < w) {
      mh2os = -mh2os;
      mw2os = -mw2os;
      if (ebg) {
        ebg.style.rotate = `90deg`;
        ebg.style.translate = `${mh2os}px ${mw2os}px`;
        ebg.style.scale = `${zoomH2}`;
      }
      for (const element of elements) {
        if (element) {
          element.style.translate = `${mh2os}px ${mw2os}px`;
          element.style.scale = `${zoomW2}`;
          element.style.rotate = `90deg`;
        }
      }
    }
  }
};
