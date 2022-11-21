import { compile } from 'angular-expressions';

export function strIf(s: string) {
  const res = compile(s);
  return res();
}
