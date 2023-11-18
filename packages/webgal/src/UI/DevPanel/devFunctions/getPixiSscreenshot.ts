export function getPixiSscreenshot() {
  const canvas: HTMLCanvasElement = document.getElementById('pixiCanvas')! as HTMLCanvasElement;
  canvas.toBlob((b) => {
    if (b) {
      const a = document.createElement('a');
      document.body.append(a);
      a.download = 'screenshot';
      a.href = URL.createObjectURL(b);
      a.click();
      a.remove();
    }
  }, 'image/png');
}
