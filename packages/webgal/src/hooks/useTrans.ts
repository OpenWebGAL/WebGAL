import { useTranslation } from 'react-i18next';

/**
 * @param prefix 翻译时自动添加的前缀
 * @returns 翻译函数, 输入key时会自动添加前缀, "$" 开头则不填加. 输入多个 key 则会返回翻译数组.
 */
export default function useTrans(prefix?: string) {
  const { t } = useTranslation();
  const trans = (key: string) => t(key[0] === '$' ? key.slice(1) : prefix + key);

  function translation(key: string): string;
  function translation(key: string, ...keys: string[]): string[];
  function translation(key: string, ...keys: string[]) {
    if (keys.length) return [trans(key), ...keys.map((v) => trans(v))];
    return trans(key);
  }

  return translation;
}
