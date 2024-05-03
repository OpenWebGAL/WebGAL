import { IWebGALStyleObj } from 'webgal-parser/build/types/styleParser';
import { WebgalParser } from '@/Core/parser/sceneParser';

export function scss2cssinjsParser(scssString: string): IWebGALStyleObj {
  return WebgalParser.parseScssToWebgalStyleObj(scssString);
}
