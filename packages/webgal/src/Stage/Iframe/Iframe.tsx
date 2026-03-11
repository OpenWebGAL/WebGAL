import { IIFrame } from '@/store/stageInterface';

export default function Iframe({ id, sandbox, src, width, height }: IIFrame) {
  if (!src) {
    return null;
  }

  return <iframe width={width} height={height} id={`iframe-${id}`} src={src} sandbox={sandbox} />;
}
