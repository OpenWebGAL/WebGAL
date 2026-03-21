import VConsole from 'vconsole';

export interface IVConsole {
  instance: VConsole;
  show: () => void;
  hide: () => void;
}
