const escapeMap = [
  {
    reg: /\\\\/g,
    val: '\\',
  },
  {
    reg: /\\\|/g,
    val: '|',
  },
  {
    reg: /\\:/g,
    val: ':',
  },
  {
    reg: /\\,/g,
    val: ',',
  },
  {
    reg: /\\;/g,
    val: ';',
  },
  {
    reg: /\\./g,
    val: '.',
  },
];
const useEscape = (val: string): string => {
  let _res = val;
  for (let i of escapeMap) {
    _res = _res.replaceAll(i.reg, i.val);
  }
  return _res;
};
export default useEscape;
