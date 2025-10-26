export type TemplateFontFormat =
  | 'truetype'
  | 'opentype'
  | 'woff'
  | 'woff2'
  | 'embedded-opentype'
  | 'svg'
  | 'collection';

export interface TemplateFontDescriptor {
  'font-family': string;
  url: string;
  type: TemplateFontFormat;
  weight?: string | number;
  style?: string;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface WebgalTemplate {
  name: string;
  id?: string;
  'webgal-version': string;
  fonts?: TemplateFontDescriptor[];
  [key: string]: unknown;
}
