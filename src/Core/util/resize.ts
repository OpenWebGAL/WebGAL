export const resize = () => {
    const h = window.innerHeight;
    const w = window.innerWidth;
    const zoomH = h / 900;
    const zoomW = w / 1600;
    const zoomH2 = w / 900;
    const zoomW2 = h / 1600;
    let mh = (900 - h) / 2;
    let mw = (1600 - w) / 2;
    let mh2os = (1600 / 2) - (w / 2);
    let mw2os = (900 / 2) - (h / 2);
    const root = document.getElementById('root');
    if (root) {
        if (w > h) {
            mw = -mw;
            mh = -mh;
            if (w * (9 / 16) >= h) {
                root.style.transform = `translate(${mw}px, ${mh}px) scale(${zoomH},${zoomH})`;
            }
            if (w * (9 / 16) < h) {
                root.style.transform = `translate(${mw}px, ${mh}px) scale(${zoomW},${zoomW})`;
            }
        } else {
            mw2os = -mw2os;
            if (h * (9 / 16) >= w) {
                root.style.transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomH2},${zoomH2})`;
            }
            if (h * (9 / 16) < w) {
                root.style.transform = `rotate(90deg) translate(${mw2os}px, ${mh2os}px) scale(${zoomW2},${zoomW2})`;
            }
        }
    }
}